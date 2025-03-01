import { Client } from 'ssh2';

// Test SSH connection to verify server-side functionality
const conn = new Client();

// Configure connection
conn.on('ready', () => {
  console.log('SSH Connection established successfully!');
  
  // Open shell session
  conn.shell((err, stream) => {
    if (err) {
      console.error('Shell error:', err);
      conn.end();
      return;
    }
    
    console.log('Shell session created, sending commands...');
    
    // Handle incoming data
    stream.on('data', (data) => {
      console.log(`OUTPUT: ${data.toString()}`);
    });
    
    // Handle stream close
    stream.on('close', () => {
      console.log('Stream closed');
      conn.end();
    });
    
    // Send test command after receiving the prompt
    setTimeout(() => {
      console.log('Sending "ls" command...');
      stream.write('ls\n');
      
      // Exit after a delay
      setTimeout(() => {
        console.log('Sending "exit" command...');
        stream.write('exit\n');
      }, 2000);
    }, 1000);
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
}).connect({
  host: '203.161.48.172',
  port: 22,
  username: 'root',
  password: 'Ze4hy3F1C4fzUM7q3R'
});

console.log('Attempting SSH connection...');