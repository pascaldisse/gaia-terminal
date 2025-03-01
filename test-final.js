/**
 * Final SSH command verification test
 */

import WebSocket from 'ws';

// Configuration
const config = {
  server: 'ws://203.161.48.172:5000',
  ssh: {
    host: '203.161.48.172',
    port: 22,
    username: 'root',
    password: 'Ze4hy3F1C4fzUM7q3R'
  }
};

// Create WebSocket connection
console.log('Connecting to WebSocket server...');
const ws = new WebSocket(config.server);

// Track state
let isConnected = false;
let commandsRun = 0;

// Set up event handlers
ws.on('open', () => {
  console.log('WebSocket connected, sending SSH connection request');
  
  // Connect to SSH
  ws.send(JSON.stringify({
    type: 'connect',
    ...config.ssh
  }));
  
  console.log('SSH connection request sent');
});

// Handle messages
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    console.log(`RECEIVED [${message.type}]${message.type === 'data' ? ' data length: ' + message.data.length : ''}`);
    
    if (message.type === 'connected') {
      console.log('SSH connection established');
      isConnected = true;
      
      // Wait for prompt
      setTimeout(() => {
        console.log('Running ls command...');
        sendCommand('ls');
      }, 2000);
    }
    
    if (message.type === 'data') {
      // Log data snippets for debugging
      const dataPreview = message.data
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .substring(0, 30);
      
      console.log(`DATA PREVIEW: "${dataPreview}..."`);
      
      // Look for command output
      if (message.data.includes('snap') && commandsRun === 0) {
        console.log('✅ ls command output verified (found "snap")');
        commandsRun++;
        
        // Run next command
        setTimeout(() => {
          console.log('Running pwd command...');
          sendCommand('pwd');
        }, 500);
      }
      
      // Check pwd command output
      if (message.data.includes('/root') && commandsRun === 1) {
        console.log('✅ pwd command output verified (found "/root")');
        commandsRun++;
        
        // Run final command
        setTimeout(() => {
          console.log('Running echo command...');
          sendCommand('echo "test message"');
        }, 500);
      }
      
      // Check echo command output
      if (message.data.includes('test message') && commandsRun === 2) {
        console.log('✅ echo command output verified (found "test message")');
        commandsRun++;
        
        // Exit SSH
        setTimeout(() => {
          console.log('Test successful! Exiting...');
          sendCommand('exit');
        }, 500);
      }
      
      // Check if we've disconnected
      if (message.data.includes('logout')) {
        console.log('SSH session ended, closing WebSocket');
        setTimeout(() => ws.close(), 500);
      }
    }
  } catch (err) {
    console.error('Error processing message:', err);
  }
});

// Helper to send SSH commands with proper line termination
function sendCommand(cmd) {
  console.log(`Sending command: ${cmd}`);
  
  // Send command text
  ws.send(JSON.stringify({
    type: 'data',
    data: cmd
  }));
  
  // Send Enter key
  setTimeout(() => {
    console.log('Sending Enter key');
    ws.send(JSON.stringify({
      type: 'data',
      data: '\r'
    }));
  }, 100);
}

// Error handling
ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});

// Connection closed
ws.on('close', () => {
  console.log('WebSocket connection closed');
  console.log(`Test summary: ${commandsRun} commands executed successfully`);
  
  // Test is successful if we ran all commands
  process.exit(commandsRun >= 3 ? 0 : 1);
});