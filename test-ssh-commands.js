/**
 * Comprehensive SSH command test
 * 
 * This test verifies that multiple SSH commands work correctly
 * by sending a sequence of commands and validating their outputs.
 */

import WebSocket from 'ws';
import { promises as fs } from 'fs';

// Test configuration
const config = {
  server: 'ws://203.161.48.172:5000',
  ssh: {
    host: '203.161.48.172',
    port: 22,
    username: 'root',
    password: 'Ze4hy3F1C4fzUM7q3R'
  },
  commands: [
    { 
      cmd: 'ls', 
      expect: ['snap', 'ssl'],
      description: 'List files in current directory'
    },
    { 
      cmd: 'pwd', 
      expect: ['/root'],
      description: 'Print working directory'
    },
    { 
      cmd: 'echo "test message"', 
      expect: ['test message'],
      description: 'Echo test message'
    },
    { 
      cmd: 'uname -a', 
      expect: ['Linux', 'Ubuntu'],
      description: 'Print system information'
    }
  ]
};

// Create log file
const logFile = `ssh-commands-${new Date().toISOString().replace(/:/g, '-')}.log`;

// Logging helper
async function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}`;
  
  console.log(entry);
  await fs.appendFile(logFile, entry + '\\n');
}

// Main test function
async function runTest() {
  await log('=== SSH COMMAND TEST SEQUENCE ===');
  await log(`Connecting to WebSocket server at ${config.server}`);
  
  const ws = new WebSocket(config.server);
  
  // Track test state
  let currentCommandIndex = 0;
  let testResults = [];
  let outputBuffer = '';
  
  // Set up event handlers
  ws.on('open', async () => {
    await log('WebSocket connection established');
    
    // Connect to SSH server
    ws.send(JSON.stringify({
      type: 'connect',
      ...config.ssh
    }));
    
    await log('SSH connection request sent');
  });
  
  // Process server responses
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'connected') {
        await log('SSH connection established');
        
        // Wait for login banner and prompt
        setTimeout(() => {
          runNextCommand();
        }, 2000);
      }
      
      if (message.type === 'data') {
        // Add data to buffer
        outputBuffer += message.data;
        
        // Check for prompt which indicates command completion
        if (message.data.match(/[#\$]\s+$/)) {
          await log('Detected prompt, command complete');
          
          // Verify current command output
          if (currentCommandIndex > 0) {  // Skip checking the initial prompt
            const command = config.commands[currentCommandIndex - 1];
            
            // Check for expected outputs
            const foundExpected = command.expect.filter(exp => outputBuffer.includes(exp));
            const missingExpected = command.expect.filter(exp => !outputBuffer.includes(exp));
            
            const success = foundExpected.length === command.expect.length;
            
            // Record result
            testResults.push({
              command: command.cmd,
              description: command.description,
              success,
              found: foundExpected,
              missing: missingExpected
            });
            
            if (success) {
              await log(`✅ Command "${command.cmd}" successful`);
            } else {
              await log(`❌ Command "${command.cmd}" failed - missing: ${missingExpected.join(', ')}`);
            }
          }
          
          // Clear buffer for next command
          outputBuffer = '';
          
          // Run next command
          runNextCommand();
        }
      }
    } catch (err) {
      await log(`Error processing message: ${err.message}`);
    }
  });
  
  // Error handling
  ws.on('error', async (err) => {
    await log(`WebSocket error: ${err.message}`);
  });
  
  // Connection closed
  ws.on('close', async () => {
    await log('WebSocket connection closed');
    await printSummary();
  });
  
  // Function to run the next command in sequence
  async function runNextCommand() {
    if (currentCommandIndex < config.commands.length) {
      const command = config.commands[currentCommandIndex];
      await log(`Running command: ${command.cmd}`);
      
      // Send the command text
      ws.send(JSON.stringify({
        type: 'data',
        data: command.cmd
      }));
      
      // Send the Enter key
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'data',
          data: '\r'
        }));
      }, 100);
      
      // Increment command index
      currentCommandIndex++;
    } else {
      // All commands completed, disconnect
      await log('All commands completed');
      
      // Exit the SSH session
      await log('Sending exit command');
      ws.send(JSON.stringify({
        type: 'data',
        data: 'exit'
      }));
      
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'data',
          data: '\r'
        }));
      }, 100);
    }
  }
  
  // Print test summary
  async function printSummary() {
    await log('\\n=== TEST SUMMARY ===');
    
    for (const result of testResults) {
      await log(`${result.success ? '✅' : '❌'} ${result.description}: "${result.command}"`);
      
      if (!result.success) {
        await log(`   Missing expected outputs: ${result.missing.join(', ')}`);
      }
    }
    
    const passedTests = testResults.filter(r => r.success).length;
    const totalTests = config.commands.length;
    
    await log(`\\nRESULT: ${passedTests}/${totalTests} tests passed`);
    await log(`Log saved to ${logFile}`);
    
    // Exit process
    process.exit(passedTests === totalTests ? 0 : 1);
  }
}

// Run the test
runTest().catch(async err => {
  await log(`Test failed with error: ${err.message}`);
  process.exit(1);
});