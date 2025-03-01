import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// API routes
app.get('/api/check', (req, res) => {
  res.json({ status: 'ok' });
});

// Fallback for SPA - all unmatched routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  
  let sshClient = null;
  let stream = null;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'connect') {
        // SSH connection
        sshClient = new Client();
        
        sshClient.on('ready', () => {
          ws.send(JSON.stringify({ type: 'connected' }));
          
          sshClient.shell((err, _stream) => {
            if (err) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: `Shell error: ${err.message}`
              }));
              return;
            }
            
            stream = _stream;
            
            stream.on('data', (data) => {
              ws.send(JSON.stringify({
                type: 'data',
                data: data.toString('utf-8')
              }));
            });
            
            stream.on('close', () => {
              ws.send(JSON.stringify({ type: 'close' }));
              sshClient.end();
            });
            
            stream.stderr.on('data', (data) => {
              ws.send(JSON.stringify({
                type: 'data',
                data: data.toString('utf-8')
              }));
            });
          });
        });
        
        sshClient.on('error', (err) => {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: `SSH connection error: ${err.message}`
          }));
        });
        
        sshClient.on('close', () => {
          ws.send(JSON.stringify({ type: 'close' }));
        });
        
        // Connect to SSH server
        const connectionOptions = {
          host: data.host,
          port: data.port || 22,
          username: data.username,
          // Choose authentication method
          ...(data.password 
            ? { password: data.password }
            : { privateKey: data.privateKey }
          )
        };
        
        sshClient.connect(connectionOptions);
      } else if (data.type === 'data' && stream) {
        // Send data to SSH stream
        stream.write(data.data);
      } else if (data.type === 'resize' && stream) {
        // Resize terminal
        stream.setWindow(data.rows, data.cols);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: `Internal error: ${error.message}`
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (sshClient) {
      sshClient.end();
    }
  });
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  
  if (pathname === '/ws/ssh') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});