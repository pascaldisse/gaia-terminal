import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Serve static files from the dist directory for built files
app.use(express.static(join(__dirname, 'dist')));

// Set MIME types for JavaScript modules
app.use('*.js', (req, res, next) => {
  res.set('Content-Type', 'application/javascript');
  next();
});

// Set MIME types for CSS files
app.use('*.css', (req, res, next) => {
  res.set('Content-Type', 'text/css');
  next();
});

// Add before your routes
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// API routes
app.get('/api/check', (req, res) => {
  res.json({ status: 'ok' });
});

// Fallback for SPA - all unmatched routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Add after your response is sent
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[RESPONSE] ${req.method} ${req.url} - ${res.statusCode} ${res.getHeader('Content-Type')}`);
  });
  next();
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
          
          // Get terminal dimensions from the connection request
          const termOptions = {
            rows: data.rows || 24,
            cols: data.cols || 80
          };
          console.log(`[SSH Server] Opening shell with dimensions: ${termOptions.rows}x${termOptions.cols}`);
          
          sshClient.shell(termOptions, (err, _stream) => {
            if (err) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: `Shell error: ${err.message}`
              }));
              return;
            }
            
            stream = _stream;
            
            stream.on('data', (data) => {
              const dataStr = data.toString('utf-8');
              console.log(`[SSH Response] Received from server: ${dataStr.length > 100 ? 
                dataStr.substring(0, 100) + '...' : JSON.stringify(dataStr)}`);
              
              ws.send(JSON.stringify({
                type: 'data',
                data: dataStr
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
        // Send data to SSH stream with logging
        console.log(`[SSH Data] Sending to stream: ${JSON.stringify(data.data)}`)
        
        // Ensure proper data handling
        try {
          stream.write(data.data);
        } catch (error) {
          console.error(`[SSH Error] Failed to write to stream: ${error.message}`);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: `Stream write error: ${error.message}`
          }));
        }
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at: http://localhost:${PORT}`);
  console.log(`WebSocket endpoint available at: ws://localhost:${PORT}/ws/ssh`);
});

// Global error handling
server.on('error', (error) => {
  console.error(`[SERVER ERROR] ${error.message}`);
  if (error.code === 'EADDRINUSE') {
    console.error(`[SERVER ERROR] Port ${PORT} is already in use. Try using a different port.`);
  }
});

process.on('uncaughtException', (error) => {
  console.error(`[UNCAUGHT EXCEPTION] ${error.message}`);
  console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION] Promise rejection was unhandled:', reason);
});