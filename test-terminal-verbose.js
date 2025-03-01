/**
 * A simple SSH WebSocket test that focuses on validating a single command
 * with verbose debugging
 */

import WebSocket from 'ws';

// Server connection details
const serverUrl = 'ws://203.161.48.172:5000';

// Create a WebSocket connection
const ws = new WebSocket(serverUrl);

// Set up event handlers
ws.on('open', () => {
  console.log('WebSocket connection established');
  
  // Connect to SSH
  ws.send(JSON.stringify({
    type: 'connect',
    host: '203.161.48.172',
    port: 22,
    username: 'root',
    password: 'Ze4hy3F1C4fzUM7q3R' 
  }));
  
  console.log('SSH connection request sent');
});

// Store responses
const responses = [];

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    
    console.log(`Received message type: ${message.type}`);
    
    responses.push({
      type: message.type,
      timestamp: new Date().toISOString(),
      data: message.data || message.message
    });
    
    if (message.type === 'connected') {
      console.log('SSH Connected, waiting for prompt...');
      // Wait for the terminal to be ready
      setTimeout(() => {
        console.log('Sending "ls" command...');
        ws.send(JSON.stringify({
          type: 'data',
          data: 'ls'
        }));
        
        // Send the newline sequence (\r\n)
        console.log('Sending newline...');
        ws.send(JSON.stringify({
          type: 'data',
          data: '\\r\\n'
        }));
      }, 3000);
    }
    
    if (message.type === 'data') {
      // Print the data with special characters visible
      console.log(`Terminal data: ${JSON.stringify(message.data)}`);
      
      // Check if we've received the command output
      if (message.data.includes('snap') && !commandCompleted) {
        console.log('Command completed successfully!');
        
        commandCompleted = true;
        
        // Wait a bit then disconnect
        setTimeout(() => {
          console.log('Test completed, disconnecting...');
          ws.send(JSON.stringify({
            type: 'disconnect'
          }));
          
          // Wait for disconnect confirmation then close WebSocket
          setTimeout(() => {
            ws.close();
            
            // Print summary
            console.log('\\n==== RESPONSE SUMMARY ====');
            responses.forEach((resp, i) => {
              console.log(`${i+1}. [${resp.timestamp}] ${resp.type}: ${resp.data ? resp.data.substring(0, 50) + '...' : ''}`);
            });
          }, 1000);
        }, 2000);
      }
    }
  } catch (err) {
    console.error('Error processing message:', err);
  }
});

let commandCompleted = false;

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('WebSocket connection closed');
});