/**
 * Terminal SSH Integration Tester
 * 
 * This script tests the terminal-SSH integration by simulating the terminal's
 * WebSocket connection to the server and tracking all data exchanges.
 */

import WebSocket from 'ws';
import readline from 'readline';
import { promises as fs } from 'fs';

// Test configuration
const config = {
  // SSH connection details
  ssh: {
    host: '203.161.48.172',
    port: 22,
    username: 'root',
    password: 'Ze4hy3F1C4fzUM7q3R'
  },
  // Server connection
  server: {
    url: 'ws://203.161.48.172:5000'
  },
  // Test commands to execute and verify
  testCommands: [
    { cmd: 'ls', expectedOutputContains: ['snap', 'ssl'] },
    { cmd: 'pwd', expectedOutputContains: ['/root'] },
    { cmd: 'echo "test message"', expectedOutputContains: ['test message'] },
    { cmd: 'uname -a', expectedOutputContains: ['Linux'] }
  ]
};

// Create log file for the test run
const logFile = `ssh-test-log-${new Date().toISOString().replace(/:/g, '-')}.log`;

// Helper function to log messages with timestamps
async function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${type}] ${message}`;
  
  console.log(formattedMessage);
  await fs.appendFile(logFile, formattedMessage + '\\n');
}

// Create readline interface for interactive testing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise(resolve => rl.question(query, resolve));

/**
 * Main test function that simulates the terminal client
 */
async function runTerminalSshTest() {
  await log('Starting terminal SSH integration test');
  await log(`Connecting to WebSocket server at ${config.server.url}`);
  
  // Create WebSocket connection to server
  const ws = new WebSocket(config.server.url);
  
  // Output buffer to collect and analyze response data
  let outputBuffer = '';
  let testResults = [];
  let pendingCommand = null;
  let isConnected = false;
  let currentPrompt = ''; // Track the current prompt to know when a command completes
  
  // Utility to send a message via WebSocket
  const sendMessage = (type, data) => {
    const message = JSON.stringify({ type, ...data });
    ws.send(message);
    return log(`SENT [${type}]: ${JSON.stringify(data)}`, 'OUT');
  };
  
  // Process incoming data
  const processOutput = async (data) => {
    // Add data to buffer
    outputBuffer += data;
    
    // Check for SSH prompt to know when command is complete
    const promptRegex = /\r\n.*[#\$]\s+$/;
    const promptMatch = data.match(promptRegex);
    
    if (promptMatch) {
      await log('Detected prompt indicating command is complete', 'INFO');
      currentPrompt = promptMatch[0];
      
      // Check if we have a pending command to verify
      if (pendingCommand) {
        // Check if the output contains expected text
        const { cmd, expectedOutputContains } = pendingCommand;
        
        // Check all expected outputs
        const failedChecks = expectedOutputContains.filter(expected => 
          !outputBuffer.includes(expected)
        );
        
        // If all expected outputs are found
        if (failedChecks.length === 0) {
          // Command succeeded
          testResults.push({
            command: cmd,
            success: true,
            output: outputBuffer
          });
          
          log(`Command "${cmd}" succeeded - found all expected output`, 'PASS');
          
          // Clear the buffer and pending command
          outputBuffer = '';
          pendingCommand = null;
          
          // Run next command or finish test
          runNextCommand();
        } else {
          // If we got a prompt but not all expected outputs were found, 
          // consider it a failure after a brief waiting period
          setTimeout(() => {
            if (pendingCommand) {
              log(`Command "${cmd}" failed - missing expected output: ${failedChecks.join(', ')}`, 'FAIL');
              
              testResults.push({
                command: cmd,
                success: false,
                output: outputBuffer,
                missing: failedChecks
              });
              
              // Clear buffer and continue testing
              outputBuffer = '';
              pendingCommand = null;
              runNextCommand();
            }
          }, 1000);
        }
      }
    }
  };
  
  // Set up WebSocket event handlers
  ws.on('open', async () => {
    await log('WebSocket connection established', 'SUCCESS');
    
    // Initialize SSH connection
    await log('Establishing SSH connection...', 'ACTION');
    await sendMessage('connect', {
      host: config.ssh.host,
      port: config.ssh.port,
      username: config.ssh.username,
      password: config.ssh.password
    });
  });
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      await log(`RECEIVED [${message.type}]: ${JSON.stringify(message).substring(0, 200)}...`, 'IN');
      
      switch (message.type) {
        case 'connected':
          await log('SSH connection established', 'SUCCESS');
          isConnected = true;
          // Wait for initial server banner and prompt
          setTimeout(() => runNextCommand(), 2000);
          break;
          
        case 'disconnected':
          await log('SSH connection closed', 'INFO');
          isConnected = false;
          break;
          
        case 'error':
          await log(`Error: ${message.message}`, 'ERROR');
          break;
          
        case 'data':
          // Log received data
          const cleanData = message.data
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '[ESC]');
            
          await log(`Terminal data: ${cleanData.substring(0, 100)}${cleanData.length > 100 ? '...' : ''}`, 'DATA');
          
          // Process the output
          await processOutput(message.data);
          break;
      }
    } catch (err) {
      await log(`Error processing message: ${err.message}`, 'ERROR');
    }
  });
  
  ws.on('error', async (error) => {
    await log(`WebSocket error: ${error.message}`, 'ERROR');
  });
  
  ws.on('close', async () => {
    await log('WebSocket connection closed', 'INFO');
    
    // Print test summary
    await log('\\n==== TEST SUMMARY ====', 'RESULT');
    for (const result of testResults) {
      await log(`Command "${result.command}": ${result.success ? 'PASSED' : 'FAILED'}`, result.success ? 'PASS' : 'FAIL');
    }
    
    const passedTests = testResults.filter(r => r.success).length;
    const totalTests = config.testCommands.length;
    
    await log(`${passedTests} of ${totalTests} tests passed`, 'SUMMARY');
    await log('Test completed. Log saved to ' + logFile, 'INFO');
    
    // Close readline
    rl.close();
  });
  
  /**
   * Execute next test command from queue
   */
  const runNextCommand = async () => {
    // Check if there are more commands to run
    if (config.testCommands.length > 0) {
      // Get next command
      const nextTest = config.testCommands.shift();
      await log(`Running command: ${nextTest.cmd}`, 'TEST');
      
      // Set as pending command
      pendingCommand = nextTest;
      
      // Clear buffer before new command
      outputBuffer = '';
      
      // Send the command with proper line termination
      await sendMessage('data', { data: nextTest.cmd });
      await sendMessage('data', { data: '\\r\\n' });
    } else {
      // No more commands to run, switch to manual mode
      await log('All test commands completed', 'DONE');
      await log('Switching to manual testing mode', 'INFO');
      
      // Start manual testing mode
      await startManualTest();
    }
  };
  
  // Allow manual testing
  const startManualTest = async () => {
    await log('\\n==== MANUAL TESTING MODE ====', 'INFO');
    await log('You can now manually send commands', 'INFO');
    
    let manualTesting = true;
    while (manualTesting && isConnected) {
      const command = await question('Enter command (or "exit" to end test): ');
      
      if (command.toLowerCase() === 'exit') {
        manualTesting = false;
        await sendMessage('disconnect', {});
      } else {
        await sendMessage('data', { data: command });
        await sendMessage('data', { data: '\\r\\n' });
        
        // Wait for output
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Close WebSocket after manual testing
    setTimeout(() => {
      ws.close();
    }, 1000);
  };
  
  // Add keyboard handler to abort test
  process.on('SIGINT', async () => {
    await log('Test aborted by user', 'ABORT');
    ws.close();
    process.exit(0);
  });
}

// Run the test
runTerminalSshTest().catch(async (error) => {
  await log(`Test failed: ${error.message}`, 'FATAL');
  process.exit(1);
});