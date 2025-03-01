import { Client } from 'ssh2';

// This is a direct test with the ssh2 library to establish baseline functionality
// and help diagnose the specific line termination/command sequence issue

// Create a function to connect and test specific command sequences
const testSsh = async () => {
  return new Promise((resolve, reject) => {
    console.log('Connecting to SSH server...');
    
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log('SSH connection established successfully!');
      
      // Create a shell session
      conn.shell({ term: 'xterm-256color' }, (err, stream) => {
        if (err) {
          console.error('Shell error:', err);
          conn.end();
          reject(err);
          return;
        }
        
        console.log('SSH shell session created');
        
        // Buffer to collect output
        let buffer = '';
        
        // Handle data events to show output
        stream.on('data', (data) => {
          const str = data.toString();
          buffer += str;
          
          // Print with special characters visible
          console.log('Received:', JSON.stringify(str));
          
          // Clean the prompt (remove escape sequences)
          const cleanedPrompt = str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
          
          // Check if we have a prompt ready for input
          if (cleanedPrompt.match(/[#\$] +$/)) {
            console.log('Detected prompt, ready for command');
          }
          
          // Check for bracketed paste mode
          if (str.includes('\x1b[?2004h')) {
            console.log('Detected bracketed paste mode (bash is ready)');
          }
        });
        
        // Handle stream close
        stream.on('close', () => {
          console.log('SSH stream closed');
          conn.end();
          resolve(buffer);
        });
        
        // Create a sequence of test commands with precise control of the line termination
        const runTests = async () => {
          try {
            // Wait for initial connection and prompt
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // First test with 'ls' command
            console.log('\\n====== TEST 1: Standard ls with \\r\\n terminator ======');
            stream.write('ls\r\n');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test with deliberate incorrect line termination (only \r)
            console.log('\\n====== TEST 2: ls with \\r terminator only ======');
            stream.write('ls\r');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Final test with complete sequence mimicking what xterm.js emits
            console.log('\\n====== TEST 3: Emulating xterm.js sequence ======');
            stream.write('ls');
            stream.write('\r');  // This is what xterm.js emits for Enter key
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Close the session
            console.log('\\n====== Tests complete, closing session ======');
            stream.write('exit\r\n');
            
            // Wait for clean disconnect
            await new Promise(resolve => setTimeout(resolve, 500));
            
          } catch (err) {
            console.error('Test error:', err);
          }
        };
        
        // Run the tests
        runTests();
      });
    }).on('error', (err) => {
      console.error('Connection error:', err);
      reject(err);
    }).connect({
      host: '203.161.48.172',
      port: 22,
      username: 'root',
      password: 'Ze4hy3F1C4fzUM7q3R'
    });
  });
};

// Run the test
testSsh()
  .then(() => console.log('Tests completed'))
  .catch(err => console.error('Test failed:', err));