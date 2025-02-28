import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import styled from 'styled-components';
import '@xterm/xterm/css/xterm.css';

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
  
  // Local state
  const [currentPath, setCurrentPath] = useState('~');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');
  
  useEffect(() => {
    // Initialize terminal
    const term = new XTerm({
      fontFamily: 'JetBrains Mono, Menlo, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      convertEol: true,
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
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    // Add web links addon
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(webLinksAddon);
    
    // Store references
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    
    // Open terminal in the container
    term.open(terminalRef.current);
    
    // Fit terminal to container
    setTimeout(() => {
      fitAddon.fit();
    }, 100);
    
    // Welcome message
    term.writeln('Welcome to Gaia Terminal');
    term.writeln('Type "help" to see available commands');
    
    // Initial prompt
    displayPrompt();
    
    let currentLine = '';
    let cursorPosition = 0;
    
    // Handle input
    term.onData(data => {
      const code = data.charCodeAt(0);
      
      if (data === '\r') { // Enter
        term.write('\r\n');
        
        // Process command
        processCommand(currentLine);
        
        // Reset current line and cursor position
        currentLine = '';
        cursorPosition = 0;
      } 
      else if (data === '\u007F') { // Backspace
        if (currentLine.length > 0 && cursorPosition > 0) {
          currentLine = 
            currentLine.substring(0, cursorPosition - 1) + 
            currentLine.substring(cursorPosition);
          cursorPosition--;
          
          // Redraw line
          term.write('\b \b');
        }
      }
      else if (data === '\u001b[A') { // Up arrow
        if (commandHistory.length > 0) {
          const index = historyIndex === -1 ? 
            commandHistory.length - 1 : 
            Math.max(0, historyIndex - 1);
          
          // Clear current line
          term.write('\r\x1b[K');
          displayPromptString();
          
          // Display previous command
          const prevCommand = commandHistory[index];
          term.write(prevCommand);
          
          currentLine = prevCommand;
          cursorPosition = prevCommand.length;
          setHistoryIndex(index);
        }
      }
      else if (data === '\u001b[B') { // Down arrow
        if (commandHistory.length > 0 && historyIndex !== -1) {
          const index = historyIndex < commandHistory.length - 1 ? 
            historyIndex + 1 : -1;
          
          // Clear current line
          term.write('\r\x1b[K');
          displayPromptString();
          
          if (index === -1) {
            // Clear command
            currentLine = '';
            cursorPosition = 0;
          } else {
            // Display next command
            const nextCommand = commandHistory[index];
            term.write(nextCommand);
            
            currentLine = nextCommand;
            cursorPosition = nextCommand.length;
          }
          
          setHistoryIndex(index);
        }
      }
      else if (data === '\u001b[C') { // Right arrow
        if (cursorPosition < currentLine.length) {
          term.write(data);
          cursorPosition++;
        }
      }
      else if (data === '\u001b[D') { // Left arrow
        if (cursorPosition > 0) {
          term.write(data);
          cursorPosition--;
        }
      }
      else if (code < 32 || code === 127) {
        // Control characters - ignore most of them
      }
      else {
        // Regular input
        term.write(data);
        
        // Insert character at cursor position
        currentLine = 
          currentLine.substring(0, cursorPosition) + 
          data + 
          currentLine.substring(cursorPosition);
        
        cursorPosition++;
      }
    });
    
    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);
  
  // Helper function to display prompt
  const displayPrompt = () => {
    if (!xtermRef.current) return;
    displayPromptString();
  };
  
  const displayPromptString = () => {
    if (!xtermRef.current) return;
    
    const username = 'user';
    const hostname = 'gaia-terminal';
    
    // Spaceship-style prompt with emojis and colors
    const promptLine = `\r\n\x1b[1;36m${username}\x1b[0m\x1b[2;37m@\x1b[0m\x1b[1;36m${hostname}\x1b[0m \x1b[1;32m${currentPath}\x1b[0m \x1b[1;33m⚡\x1b[0m\r\n\x1b[1;35m❯\x1b[0m `;
    xtermRef.current.write(promptLine);
  };
  
  // Process commands
  const processCommand = (cmd) => {
    if (!xtermRef.current) return;
    if (!cmd.trim()) {
      displayPrompt();
      return;
    }
    
    // Add command to history
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd) {
      setCommandHistory(prev => [...prev, cmd]);
    }
    setHistoryIndex(-1);
    
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
    if (!xtermRef.current) return;
    
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
      if (xtermRef.current) {
        xtermRef.current.writeln('\x1b[32mConnected to remote server.\x1b[0m');
        xtermRef.current.writeln('Welcome to Gaia Terminal SSH');
        xtermRef.current.writeln('Type "exit" to disconnect');
      }
    }, 1000);
  };

  return (
    <TerminalContainer ref={terminalRef} />
  );
};

export default Terminal;