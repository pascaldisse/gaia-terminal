import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import styled from 'styled-components';
import '@xterm/xterm/css/xterm.css';
import { useTerminalStore } from '../../stores/terminalStore';

const TerminalContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1e1e2e;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Terminal = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const { 
    input, 
    setInput, 
    commandHistory, 
    addToCommandHistory,
    currentPath,
    setCurrentPath 
  } = useTerminalStore();
  
  useEffect(() => {
    // Initialize terminal
    if (!xtermRef.current) {
      // Terminal configuration
      xtermRef.current = new XTerm({
        fontFamily: 'JetBrains Mono, Menlo, monospace',
        fontSize: 14,
        lineHeight: 1.2,
        cursorBlink: true,
        theme: {
          background: '#1e1e2e',
          foreground: '#f8f8f2',
          cursor: '#f8f8f2',
          selection: 'rgba(248, 248, 242, 0.3)',
          black: '#000000',
          red: '#ff5555',
          green: '#50fa7b',
          yellow: '#f1fa8c',
          blue: '#bd93f9',
          magenta: '#ff79c6',
          cyan: '#8be9fd',
          white: '#bbbbbb',
          brightBlack: '#555555',
          brightRed: '#ff5555',
          brightGreen: '#50fa7b',
          brightYellow: '#f1fa8c',
          brightBlue: '#bd93f9',
          brightMagenta: '#ff79c6',
          brightCyan: '#8be9fd',
          brightWhite: '#ffffff'
        }
      });

      // Add fit addon
      fitAddonRef.current = new FitAddon();
      xtermRef.current.loadAddon(fitAddonRef.current);
      
      // Add web links addon
      const webLinksAddon = new WebLinksAddon();
      xtermRef.current.loadAddon(webLinksAddon);
      
      // Open terminal in the container
      xtermRef.current.open(terminalRef.current);
      fitAddonRef.current.fit();
      
      // Display initial prompt
      displayPrompt();
      
      // Handle input
      xtermRef.current.onData(handleTerminalInput);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);
  
  const displayPrompt = () => {
    if (!xtermRef.current) return;
    
    const username = 'user';
    const hostname = 'gaia-terminal';
    
    // Spaceship-style prompt with emojis and colors
    const promptLine = `\r\n\x1b[1;36m${username}\x1b[0m\x1b[2;37m@\x1b[0m\x1b[1;36m${hostname}\x1b[0m \x1b[1;32m${currentPath}\x1b[0m \x1b[1;33m⚡\x1b[0m\r\n\x1b[1;35m❯\x1b[0m `;
    xtermRef.current.write(promptLine);
  };
  
  const handleTerminalInput = (data) => {
    // Handle special keys
    if (data === '\r') { // Enter key
      // Process command
      processCommand(input);
      // Reset input
      setInput('');
    } else if (data === '\u007F') { // Backspace
      if (input.length > 0) {
        // Remove last character from input
        xtermRef.current.write('\b \b');
        setInput(input.slice(0, -1));
      }
    } else if (data === '\t') { // Tab
      // Handle autocomplete here
      xtermRef.current.write(data);
    } else if (data === '\u001b[A') { // Up arrow
      // Navigate command history (previous command)
      const { commandHistory, historyIndex } = useTerminalStore.getState();
      if (commandHistory.length > 0) {
        const newIndex = Math.max(0, historyIndex > 0 ? historyIndex - 1 : commandHistory.length - 1);
        const prevCommand = commandHistory[newIndex];
        
        // Clear current input
        for (let i = 0; i < input.length; i++) {
          xtermRef.current.write('\b \b');
        }
        
        // Write previous command
        xtermRef.current.write(prevCommand);
        setInput(prevCommand);
        useTerminalStore.setState({ historyIndex: newIndex });
      }
    } else if (data === '\u001b[B') { // Down arrow
      // Navigate command history (next command)
      const { commandHistory, historyIndex } = useTerminalStore.getState();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : -1;
        const nextCommand = newIndex >= 0 ? commandHistory[newIndex] : '';
        
        // Clear current input
        for (let i = 0; i < input.length; i++) {
          xtermRef.current.write('\b \b');
        }
        
        // Write next command
        xtermRef.current.write(nextCommand);
        setInput(nextCommand);
        useTerminalStore.setState({ historyIndex: newIndex });
      }
    } else if (data === '\u001b[C' || data === '\u001b[D') {
      // Right/Left arrow keys - ignore for now
    } else if (data.charCodeAt(0) === 27) {
      // Other escape sequences - ignore
      console.log('Escape sequence:', data);
    } else if (data >= ' ' && data <= '~') { // Printable ASCII characters
      // Regular character input
      xtermRef.current.write(data);
      setInput(input + data);
    } else {
      // For debugging - log other keypress codes
      console.log('Key code:', data.charCodeAt(0), data);
    }
  };
  
  const processCommand = (cmd) => {
    if (!cmd.trim()) {
      displayPrompt();
      return;
    }
    
    // Add command to history
    addToCommandHistory(cmd);
    
    // Write the command and newline
    xtermRef.current.writeln('');
    
    // Split command and arguments
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    
    // Process command
    switch(command) {
      case 'clear':
        xtermRef.current.clear();
        break;
        
      case 'cd':
        // Change directory (simulated)
        const newPath = args.join(' ') || '~';
        if (newPath === '~') {
          setCurrentPath('~');
        } else if (newPath === '..') {
          if (currentPath !== '~') {
            const pathParts = currentPath.split('/');
            pathParts.pop();
            setCurrentPath(pathParts.join('/') || '~');
          }
        } else if (newPath.startsWith('/')) {
          setCurrentPath(newPath);
        } else {
          const updatedPath = currentPath === '~' 
            ? `~/${newPath}` 
            : `${currentPath}/${newPath}`;
          setCurrentPath(updatedPath);
        }
        break;
        
      case 'ls':
        // Simulate listing files
        const files = [
          '\x1b[1;34m.\x1b[0m',
          '\x1b[1;34m..\x1b[0m',
          '\x1b[1;34mdocuments\x1b[0m',
          '\x1b[1;34mdownloads\x1b[0m',
          '\x1b[1;32mfile1.txt\x1b[0m',
          '\x1b[1;32mfile2.js\x1b[0m',
          '\x1b[1;32mREADME.md\x1b[0m',
          '\x1b[1;31mscript.sh\x1b[0m'
        ];
        xtermRef.current.writeln(files.join('  '));
        break;
        
      case 'pwd':
        // Print working directory
        const displayPath = currentPath.replace('~', '/home/user');
        xtermRef.current.writeln(displayPath);
        break;
        
      case 'echo':
        // Echo arguments
        xtermRef.current.writeln(args.join(' '));
        break;
        
      case 'date':
        // Print current date and time
        xtermRef.current.writeln(new Date().toString());
        break;
        
      case 'whoami':
        // Print username
        xtermRef.current.writeln('user');
        break;
        
      case 'ssh':
        // Handle SSH connection
        connectSSH(args.join(' '));
        break;
        
      case 'help':
        // Display available commands
        xtermRef.current.writeln('\x1b[1;33mAvailable commands:\x1b[0m');
        xtermRef.current.writeln('  \x1b[1;32mclear\x1b[0m         - Clear the terminal screen');
        xtermRef.current.writeln('  \x1b[1;32mcd [path]\x1b[0m     - Change directory');
        xtermRef.current.writeln('  \x1b[1;32mls\x1b[0m            - List files in current directory');
        xtermRef.current.writeln('  \x1b[1;32mpwd\x1b[0m           - Print working directory');
        xtermRef.current.writeln('  \x1b[1;32mecho [text]\x1b[0m   - Display text');
        xtermRef.current.writeln('  \x1b[1;32mdate\x1b[0m          - Display current date and time');
        xtermRef.current.writeln('  \x1b[1;32mwhoami\x1b[0m        - Display current user');
        xtermRef.current.writeln('  \x1b[1;32mssh [args]\x1b[0m    - Connect to remote server via SSH');
        xtermRef.current.writeln('  \x1b[1;32mhelp\x1b[0m          - Display this help message');
        break;
        
      default:
        // Command not found
        xtermRef.current.writeln(`\x1b[31mCommand not found: ${command}\x1b[0m`);
        xtermRef.current.writeln('Type \x1b[1;32mhelp\x1b[0m to see available commands');
    }
    
    // Show prompt again
    displayPrompt();
  };
  
  const connectSSH = (sshCommand) => {
    // Parse SSH command
    // Example format: username@hostname -p port
    let username = 'user';
    let hostname = 'localhost';
    let port = 22;
    
    const hostParts = sshCommand.split('@');
    if (hostParts.length > 1) {
      username = hostParts[0];
      const remainingParts = hostParts[1].split(' ');
      hostname = remainingParts[0];
      
      // Check for port option
      const portIndex = remainingParts.indexOf('-p');
      if (portIndex !== -1 && portIndex < remainingParts.length - 1) {
        port = parseInt(remainingParts[portIndex + 1], 10);
      }
    } else {
      hostname = sshCommand.split(' ')[0];
    }
    
    // Output connection message
    xtermRef.current.writeln(`\x1b[34mConnecting to ${username}@${hostname}:${port}...\x1b[0m`);
    xtermRef.current.writeln('\x1b[33mNote: This is a simulated SSH connection for demo purposes.\x1b[0m');
    
    // In a real app, we would initiate an actual SSH connection here
    // For this demo, we'll just simulate a connection
    setTimeout(() => {
      xtermRef.current.writeln('\x1b[32mConnected to remote server.\x1b[0m');
      xtermRef.current.writeln('Welcome to Gaia Terminal SSH');
      xtermRef.current.writeln('Type "exit" to disconnect');
    }, 1000);
  };

  return (
    <TerminalContainer ref={terminalRef} />
  );
};

export default Terminal;