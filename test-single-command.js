/**
 * A minimal test that sends a single command to the SSH server
 * and verifies the response.
 */

import WebSocket from 'ws';

const serverUrl = 'ws://203.161.48.172:5000';
const ws = new WebSocket(serverUrl);

console.log('Connecting to WebSocket server...');

ws.on('open', () => {
  console.log('WebSocket connected, sending SSH connection request');
  
  // Step 1: Establish SSH connection
  ws.send(JSON.stringify({
    type: 'connect',
    host: '203.161.48.172',
    port: 22,
    username: 'root',
    password: 'Ze4hy3F1C4fzUM7q3R'
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    // Log each message received with type
    console.log(`RECEIVED [${message.type}]`);
    
    if (message.type === 'connected') {
      console.log('SSH connection established successfully');
      
      // Wait for the terminal to display the welcome message
      setTimeout(() => {
        sendCommand('ls');
      }, 2000);
    }
    
    if (message.type === 'data') {
      // Check for specific command output
      if (message.data.includes('snap')) {
        console.log('Command output received and verified!');
        console.log('Output includes expected file: "snap"');
        
        // Wait a bit then run exit command
        setTimeout(() => {
          sendCommand('exit');
        }, 1000);
      }
      
      // Check for disconnect confirmation
      if (message.data.includes('logout')) {
        console.log('Logout detected, test successful!');
        
        // Close WebSocket after a delay
        setTimeout(() => {
          ws.close();
        }, 500);
      }
    }
  } catch (err) {
    console.error('Error processing message:', err);
  }
});

// Helper function to send a command with correct line termination
function sendCommand(cmd) {
  console.log(`Sending command: ${cmd}`);
  
  // Step 1: Send the command text
  ws.send(JSON.stringify({
    type: 'data',
    data: cmd
  }));
  
  // Step 2: Send the Enter key (return) - the most important part!
  setTimeout(() => {
    console.log('Sending Enter key (\\r)');
    ws.send(JSON.stringify({
      type: 'data',
      data: '\r'
    }));
  }, 100);
}

// Set up error handling
ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});

ws.on('close', () => {
  console.log('WebSocket connection closed');
  console.log('Test complete!');
});