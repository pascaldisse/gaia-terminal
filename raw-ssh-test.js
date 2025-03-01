import { Client } from 'ssh2';
import readline from 'readline';

// Create a test utility to try different approaches for sending commands
const testSshCommandWithDifferentNewlines = async () => {
  console.log('Starting comprehensive SSH command test with various newline formats');
  
  // Define the commands we'll test with various newline formats
  const testCommands = [
    { name: 'ls', description: 'Basic directory listing' },
    { name: 'echo "test line 1\ntest line 2"', description: 'Multi-line output' },
    { name: 'cat /etc/hostname', description: 'File reading' }
  ];
  
  // Define different newline formats to test
  const newlineFormats = [
    { name: 'CR (\\r)', bytes: Buffer.from('\r'), description: 'Carriage Return only' },
    { name: 'LF (\\n)', bytes: Buffer.from('\n'), description: 'Line Feed only' },
    { name: 'CRLF (\\r\\n)', bytes: Buffer.from('\r\n'), description: 'Carriage Return + Line Feed (standard)' },
    { name: 'LFCR (\\n\\r)', bytes: Buffer.from('\n\r'), description: 'Reverse order (uncommon)' }
  ];
  
  // Configure SSH connection
  const conn = new Client();
  
  // Create readline interface for interactive testing
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Promisify readline question
  const question = (query) => new Promise(resolve => rl.question(query, resolve));
  
  // Connect to SSH server
  console.log('Connecting to SSH server...');
  const connectPromise = new Promise((resolve, reject) => {
    conn.on('ready', () => {
      console.log('SSH connection established successfully!');
      resolve();
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
  
  try {
    await connectPromise;
    
    // Create shell session
    const stream = await new Promise((resolve, reject) => {
      conn.shell((err, stream) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Setup data handler to show all received data as hex dump
        stream.on('data', (data) => {
          const dataStr = data.toString();
          console.log(`\\n\\n====== RECEIVED DATA ======`);
          console.log(`Data as string: ${dataStr.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}`);
          console.log(`Data as hex: ${data.toString('hex').match(/../g).join(' ')}`);
          console.log(`====== END DATA ======\\n\\n`);
        });
        
        resolve(stream);
      });
    });
    
    // Wait for the initial prompt
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Interactive manual testing
    console.log('\\n======= MANUAL TESTING MODE =======');
    console.log('You can now manually test different command formats\\n');
    
    let manualTesting = true;
    while (manualTesting) {
      console.log('\\nTest options:');
      console.log('1. Send raw command with custom newline format');
      console.log('2. Run automated test suite');
      console.log('3. Exit testing');
      
      const choice = await question('Select option (1-3): ');
      
      if (choice === '1') {
        const command = await question('Enter command to send: ');
        console.log('\\nSelect newline format:');
        newlineFormats.forEach((format, i) => {
          console.log(`${i+1}. ${format.name} - ${format.description}`);
        });
        
        const formatChoice = parseInt(await question('Select format (1-4): '));
        if (formatChoice >= 1 && formatChoice <= 4) {
          const selectedFormat = newlineFormats[formatChoice - 1];
          
          console.log(`\\nSending command "${command}" with ${selectedFormat.name}...`);
          stream.write(command);
          stream.write(selectedFormat.bytes);
          
          // Wait for response
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else if (choice === '2') {
        // Run through all combinations
        for (const command of testCommands) {
          console.log(`\\n===== TESTING COMMAND: ${command.name} =====`);
          
          for (const format of newlineFormats) {
            console.log(`\\n-> Using newline format: ${format.name}`);
            
            // Send command with this newline format
            console.log(`Sending: "${command.name}${format.name}"`);
            stream.write(command.name);
            stream.write(format.bytes);
            
            // Wait for response
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } else if (choice === '3') {
        manualTesting = false;
      }
    }
    
    // Clean up
    stream.end('exit\n');
    conn.end();
    rl.close();
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testSshCommandWithDifferentNewlines();