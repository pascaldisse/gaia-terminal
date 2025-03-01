import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files from the dist directory after building
app.use(express.static(path.join(__dirname, 'dist')));

// Store active SSH connections
const sshConnections = new Map();

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  
  let sshClient = null;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'connect':
          // Create a new SSH connection
          console.log(`Connecting to SSH server: ${data.host}:${data.port}`);
          
          // Clean up any existing connection
          if (sshClient) {
            sshClient.end();
            sshClient = null;
          }
          
          // Create new SSH client
          sshClient = new Client();
          
          // Configure connection parameters
          const connectionConfig = {
            host: data.host,
            port: data.port || 22,
            username: data.username,
            // For security reasons, we expect password to be provided with each connection
            password: data.password,
            // Add key-based authentication if needed
            ...(data.privateKey && { privateKey: data.privateKey })
          };
          
          // Handle connection events
          sshClient.on('ready', () => {
            console.log('SSH Connection ready');
            ws.send(JSON.stringify({ 
              type: 'connected',
              message: `Connected to ${data.host} as ${data.username}`
            }));
            
            // Create a new shell session with reasonable defaults for terminal size
            sshClient.shell({ term: 'xterm-256color', cols: 80, rows: 24 }, (err, stream) => {
              if (err) {
                ws.send(JSON.stringify({ 
                  type: 'error',
                  message: `Shell error: ${err.message}`
                }));
                return;
              }
              
              // Store the stream reference
              sshConnections.set(ws, { client: sshClient, stream });
              
              // Forward SSH data to WebSocket
              stream.on('data', (data) => {
                const dataStr = data.toString('utf8');
                console.log(`[SSH SERVER] Received data from SSH server: "${dataStr.substring(0, 100)}${dataStr.length > 100 ? '...' : ''}"`);
                ws.send(JSON.stringify({
                  type: 'data',
                  data: dataStr
                }));
              });
              
              // Handle SSH stream close
              stream.on('close', () => {
                ws.send(JSON.stringify({
                  type: 'disconnected',
                  message: 'SSH session closed'
                }));
                
                if (sshConnections.has(ws)) {
                  sshConnections.delete(ws);
                }
                
                if (sshClient) {
                  sshClient.end();
                  sshClient = null;
                }
              });
              
              // Handle SSH stream errors
              stream.on('error', (err) => {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: `Stream error: ${err.message}`
                }));
              });
            });
          });
          
          // Handle SSH connection errors
          sshClient.on('error', (err) => {
            console.error('SSH connection error:', err);
            ws.send(JSON.stringify({
              type: 'error',
              message: `Connection error: ${err.message}`
            }));
            
            if (sshConnections.has(ws)) {
              sshConnections.delete(ws);
            }
            
            sshClient = null;
          });
          
          // Connect to SSH server
          sshClient.connect(connectionConfig);
          break;
          
        case 'data':
          // Send data to SSH server
          const connection = sshConnections.get(ws);
          const inputData = data.data;
          console.log(`[SSH DATA] Received data from client: "${inputData}" (${Buffer.from(inputData).toString('hex')})`);
          
          if (connection && connection.stream) {
            // CRITICAL: Track if this contains an Enter key and log it clearly
            if (inputData.includes('\r') || inputData.includes('\n')) {
              console.log(`[SSH DATA] ⚠️ ENTER KEY DETECTED in input: "${inputData.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}"`);
            }
            
            console.log('[SSH DATA] Forwarding to SSH stream');
            
            // For testing - let's try to manually handle \r and ensure we send \r\n
            // This is needed because different terminals/SSH servers expect different newline formats
            let modifiedData = inputData;
            
            // Option 1: If we received bare \r, convert to \r\n
            if (inputData === '\r') {
              modifiedData = '\r\n';
              console.log('[SSH DATA] Converting bare \\r to \\r\\n');
            }
            // Option 2: If we received just \n, convert to \r\n  
            else if (inputData === '\n') {
              modifiedData = '\r\n';
              console.log('[SSH DATA] Converting bare \\n to \\r\\n');
            }
            
            // Log what we're actually sending
            console.log(`[SSH DATA] Actually sending: "${modifiedData.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}" (${Buffer.from(modifiedData).toString('hex')})`);
            
            // Send the data to the SSH stream
            connection.stream.write(modifiedData);
          } else {
            console.error('[SSH DATA] No active SSH connection or stream');
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active SSH connection'
            }));
          }
          break;
          
        case 'resize':
          // Resize SSH terminal
          const resizeConnection = sshConnections.get(ws);
          if (resizeConnection && resizeConnection.stream) {
            resizeConnection.stream.setWindow(data.rows, data.cols);
          }
          break;
          
        case 'disconnect':
          // Close SSH connection
          if (sshConnections.has(ws)) {
            const { client } = sshConnections.get(ws);
            if (client) {
              client.end();
            }
            sshConnections.delete(ws);
          }
          
          sshClient = null;
          ws.send(JSON.stringify({
            type: 'disconnected',
            message: 'SSH session closed'
          }));
          break;
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
      ws.send(JSON.stringify({
        type: 'error',
        message: `Error: ${err.message}`
      }));
    }
  });
  
  // Handle WebSocket close
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    
    // Clean up SSH connection
    if (sshConnections.has(ws)) {
      const { client } = sshConnections.get(ws);
      if (client) {
        client.end();
      }
      sshConnections.delete(ws);
    }
    
    sshClient = null;
  });
});

// All other routes should redirect to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});