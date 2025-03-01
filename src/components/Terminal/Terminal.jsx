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

// Create a modal component for password input
const HiddenPasswordModal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HiddenInput = styled.input`
  position: absolute;
  top: -9999px;
  left: -9999px;
  opacity: 0;
`;

const Terminal = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const hiddenInputRef = useRef(null);
  
  // Load command history from localStorage
  const loadCommandHistory = () => {
    try {
      const savedHistory = localStorage.getItem('terminalCommandHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading command history:', error);
      return [];
    }
  };
  
  // Local state
  const [currentPath, setCurrentPath] = useState(() => {
    try {
      return localStorage.getItem('terminalCurrentPath') || '~';
    } catch (error) {
      return '~';
    }
  });
  const [commandHistory, setCommandHistory] = useState(loadCommandHistory);
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
    
    // Local variables used for command history navigation
    // Store this outside the handler so it persists between key presses
    let localHistoryIndex = -1;
    
    // Create a variable to store the data handler function
    const handleTerminalData = (data) => {
      // Completely skip any processing if we're collecting a password
      // This prevents password data from being handled as commands
      if (collectingPassword) {
        // IMPORTANT: Block ALL input processing during password collection
        return;
      }
      
      // If SSH is active, send all input to the SSH server
      if (isSSHActive && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send the data directly to SSH server without any local processing
        wsRef.current.send(JSON.stringify({
          type: 'data',
          data: data.data || data
        }));
        return;
      }
      
      // Process local terminal input
      const inputData = data.data || data;
      const code = inputData.charCodeAt(0);
      
      // Safety measure for password-related lines
      if (collectingPassword || 
          currentLine.includes("Password:") || 
          currentLine.includes("password") || 
          currentLine.includes("passwd")) {
        
        // If it's a password-related line
        if (inputData === '\r') { // Enter key
          term.write('\r\n');
          
          // Skip processing this line for safety
          console.log("Skipping password-related input");
          
          // Reset current line, cursor position, and history index
          currentLine = '';
          cursorPosition = 0;
          localHistoryIndex = -1;
          
          // Show prompt again
          displayPrompt();
          return;
        }
        
        // Don't echo characters for password security
        return;
      }
      
      // Special handling for ssh command - prepare for password mode
      if (currentLine.startsWith("ssh ") && inputData === '\r') {
        // Let the normal processing happen for the ssh command itself
        // Our connectSSH function will handle setting up the password mode
      }
      
      if (inputData === '\r') { // Enter
        term.write('\r\n');
        
        // Process command
        processCommand(currentLine);
        
        // Reset current line, cursor position, and history index
        currentLine = '';
        cursorPosition = 0;
        localHistoryIndex = -1; // Reset the local history tracker too
      } 
      else if (inputData === '\u007F') { // Backspace
        if (currentLine.length > 0 && cursorPosition > 0) {
          currentLine = 
            currentLine.substring(0, cursorPosition - 1) + 
            currentLine.substring(cursorPosition);
          cursorPosition--;
          
          // Redraw line
          term.write('\b \b');
        }
      }
      else if (inputData === '\u001b[A') { // Up arrow
        if (commandHistory.length > 0) {
          // Use the persistent local variable for history navigation
          // Initialize it from React state if it's not set yet
          if (localHistoryIndex === -1 && historyIndex !== -1) {
            localHistoryIndex = historyIndex;
          }
          
          const index = localHistoryIndex === -1 ? 
            commandHistory.length - 1 : 
            Math.max(0, localHistoryIndex - 1);
          
          // Clear current line
          term.write('\r\x1b[K');
          displayPromptString();
          
          // Display previous command
          const prevCommand = commandHistory[index];
          term.write(prevCommand);
          
          currentLine = prevCommand;
          cursorPosition = prevCommand.length;
          
          // Update local variable for immediate effect
          localHistoryIndex = index;
          // Also update React state for persistence
          setHistoryIndex(index);
        }
      }
      else if (inputData === '\u001b[B') { // Down arrow
        if (commandHistory.length > 0 && localHistoryIndex !== -1) {
          const index = localHistoryIndex < commandHistory.length - 1 ? 
            localHistoryIndex + 1 : -1;
          
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
          
          // Update local variable for immediate effect
          localHistoryIndex = index;
          // Also update React state for persistence
          setHistoryIndex(index);
        }
      }
      else if (inputData === '\u001b[C') { // Right arrow
        if (cursorPosition < currentLine.length) {
          term.write(inputData);
          cursorPosition++;
        }
      }
      else if (inputData === '\u001b[D') { // Left arrow
        if (cursorPosition > 0) {
          term.write(inputData);
          cursorPosition--;
        }
      }
      else if (code < 32 || code === 127) {
        // Control characters - ignore most of them
      }
      else {
        // Regular input
        term.write(inputData);
        
        // Insert character at cursor position
        currentLine = 
          currentLine.substring(0, cursorPosition) + 
          inputData + 
          currentLine.substring(cursorPosition);
        
        cursorPosition++;
      }
    };
    
    // Register the data handler using the event approach
    term.onData(handleTerminalData);
    
    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
        
        // Update SSH terminal size if connected
        if (isSSHActive && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const dimensions = xtermRef.current.rows && xtermRef.current.cols ? 
            { rows: xtermRef.current.rows, cols: xtermRef.current.cols } : 
            { rows: 24, cols: 80 };
            
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            rows: dimensions.rows,
            cols: dimensions.cols
          }));
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Close any active SSH connection
      if (isSSHActive && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'disconnect'
        }));
      }
      
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
    
    // If we're still collecting a password but somehow a command got through,
    // ignore it and don't display it - this prevents accidental password exposure
    if (collectingPassword || cmd.includes('Password:')) {
      console.log('Blocked command processing during password entry');
      return;
    }
    
    // Special handling for SSH mode
    if (isSSHActive) {
      // Important: When SSH is active, the terminal's processCommand should NOT
      // process any commands (not even enter key presses)
      // All data should be sent directly via the onData handler, which sends it
      // to the SSH connection without any local processing
      
      // Only handle special commands locally
      if (cmd === 'exit' || cmd === 'logout') {
        // Disconnect from SSH
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'disconnect'
          }));
        }
        setIsSSHActive(false);
        setCollectingPassword(false);
        xtermRef.current.writeln('\x1b[33mDisconnected from SSH server\x1b[0m');
        displayPrompt();
      }
      
      // Don't process any other commands locally when in SSH mode
      return;
    }
    
    // Add command to history
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd) {
      const newHistory = [...commandHistory, cmd];
      // Limit history to 100 items to prevent localStorage from growing too large
      const limitedHistory = newHistory.slice(-100);
      setCommandHistory(limitedHistory);
      
      // Save to localStorage
      try {
        localStorage.setItem('terminalCommandHistory', JSON.stringify(limitedHistory));
      } catch (error) {
        console.error('Error saving command history:', error);
      }
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
        let updatedPath;
        
        if (newPath === '~') {
          updatedPath = '~';
        } else if (newPath === '..') {
          if (currentPath !== '~') {
            const pathParts = currentPath.split('/');
            pathParts.pop();
            updatedPath = pathParts.join('/') || '~';
          } else {
            updatedPath = '~';
          }
        } else if (newPath.startsWith('/')) {
          updatedPath = newPath;
        } else {
          updatedPath = currentPath === '~' 
            ? `~/${newPath}` 
            : `${currentPath}/${newPath}`;
        }
        
        // Update the current path
        setCurrentPath(updatedPath);
        
        // Save to localStorage
        try {
          localStorage.setItem('terminalCurrentPath', updatedPath);
        } catch (error) {
          console.error('Error saving current path:', error);
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
        return; // Don't display prompt here
        
      case 'history':
        if (args.length > 0 && args[0] === '-c') {
          // Clear history
          setCommandHistory([]);
          try {
            localStorage.removeItem('terminalCommandHistory');
            xtermRef.current.writeln('\x1b[32mCommand history cleared\x1b[0m');
          } catch (error) {
            console.error('Error clearing command history:', error);
            xtermRef.current.writeln('\x1b[31mError clearing command history\x1b[0m');
          }
        } else {
          // Display command history with numbers
          xtermRef.current.writeln('\x1b[1;33mCommand history:\x1b[0m');
          commandHistory.forEach((cmd, index) => {
            xtermRef.current.writeln(`  \x1b[2;37m${index + 1}\x1b[0m  ${cmd}`);
          });
          if (commandHistory.length === 0) {
            xtermRef.current.writeln('  No commands in history');
          }
        }
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
        xtermRef.current.writeln('  \x1b[1;32mhistory\x1b[0m       - Display command history');
        xtermRef.current.writeln('  \x1b[1;32mhistory -c\x1b[0m    - Clear command history');
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
  
  // WebSocket connection for SSH
  const wsRef = useRef(null);
  const [isSSHActive, setIsSSHActive] = useState(false);
  const [collectingPassword, setCollectingPassword] = useState(false);
  const [sshConnectionParams, setSshConnectionParams] = useState(null);
  const passwordRef = useRef('');
  const passwordTimeoutRef = useRef(null);
  
  // Set up effect for handling password collection
  useEffect(() => {
    if (!collectingPassword) return;
    
    // Set up a timeout to cancel password collection if it takes too long
    const timeoutId = setTimeout(() => {
      if (collectingPassword) {
        setCollectingPassword(false);
        if (xtermRef.current) {
          xtermRef.current.writeln('\r\n\x1b[31mPassword entry timed out\x1b[0m');
          displayPrompt();
        }
      }
    }, 60000); // 1 minute timeout
    
    // Handle escape key to cancel password entry
    const handleEscape = (e) => {
      if (e.key === 'Escape' && collectingPassword) {
        e.preventDefault();
        setCollectingPassword(false);
        if (xtermRef.current) {
          xtermRef.current.writeln('\r\n\x1b[31mPassword entry cancelled\x1b[0m');
          displayPrompt();
        }
      }
    };
    
    // Add global keyboard listener for escape
    document.addEventListener('keydown', handleEscape);
    
    // Focus the hidden input field
    if (hiddenInputRef.current) {
      setTimeout(() => {
        hiddenInputRef.current.focus();
      }, 100);
    }
    
    // Cleanup when component unmounts or password collection ends
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [collectingPassword, sshConnectionParams]);
  
  // Create WebSocket connection
  const createWSConnection = () => {
    // Get location protocol, hostname and port
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${wsProtocol}${window.location.host}`;
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'connected':
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[32m${message.message}\x1b[0m`);
              setIsSSHActive(true);
            }
            break;
            
          case 'disconnected':
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[33m${message.message}\x1b[0m`);
              setIsSSHActive(false);
              // Make sure we're not collecting password anymore
              setCollectingPassword(false);
              displayPrompt();
            }
            break;
            
          case 'error':
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[31mError: ${message.message}\x1b[0m`);
              setIsSSHActive(false);
              // Make sure we're not collecting password anymore
              setCollectingPassword(false);
              displayPrompt();
            }
            break;
            
          case 'data':
            if (xtermRef.current) {
              xtermRef.current.write(message.data);
            }
            break;
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        if (xtermRef.current) {
          xtermRef.current.writeln(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      if (xtermRef.current && isSSHActive) {
        xtermRef.current.writeln('\x1b[33mConnection to SSH server closed\x1b[0m');
        setIsSSHActive(false);
        setCollectingPassword(false);
        displayPrompt();
      }
    };
    
    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      if (xtermRef.current) {
        xtermRef.current.writeln('\x1b[31mWebSocket error occurred\x1b[0m');
      }
    };
  };
  
  // Initialize WebSocket on component mount
  useEffect(() => {
    createWSConnection();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // Function to submit SSH password after it's been collected
  const submitSSHPassword = (password) => {
    if (!wsRef.current || !sshConnectionParams) {
      xtermRef.current.writeln('\x1b[31mError: Connection parameters lost\x1b[0m');
      displayPrompt();
      return;
    }
    
    // Submit the SSH connection
    xtermRef.current.writeln(''); // Add a line break after password input
    
    // Send SSH connection request over WebSocket
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'connect',
        host: sshConnectionParams.hostname,
        port: sshConnectionParams.port,
        username: sshConnectionParams.username,
        password: password
      }));
    } else {
      xtermRef.current.writeln('\x1b[31mWebSocket connection is not available\x1b[0m');
      displayPrompt();
    }
  };
  
  // Handle SSH connection
  const connectSSH = (sshCommand) => {
    if (!xtermRef.current || !wsRef.current) return;
    
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
      
      // Clean up hostname if it's a URL
      if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
        hostname = hostname.replace(/^https?:\/\//, '');
      }
      if (hostname.includes('/')) {
        hostname = hostname.split('/')[0];
      }
      
      // Check for port option
      const portIndex = remainingParts.indexOf('-p');
      if (portIndex !== -1 && portIndex < remainingParts.length - 1) {
        port = parseInt(remainingParts[portIndex + 1], 10);
      }
    } else {
      hostname = sshCommand.split(' ')[0];
      
      // Clean up hostname if it's a URL
      if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
        hostname = hostname.replace(/^https?:\/\//, '');
      }
      if (hostname.includes('/')) {
        hostname = hostname.split('/')[0];
      }
    }
    
    // Output connection message
    xtermRef.current.writeln(`\x1b[34mConnecting to ${username}@${hostname}:${port}...\x1b[0m`);
    
    // Prompt for password
    xtermRef.current.write('\x1b[33mPassword: \x1b[0m');
    
    // Save SSH connection parameters for when password is submitted
    setSshConnectionParams({ username, hostname, port });
    
    // Enable password collection mode to show the hidden input field
    setCollectingPassword(true);
    
    // Focus the hidden input field
    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }, 50);
  };

  return (
    <TerminalContainer ref={terminalRef}>
      {collectingPassword && (
        <HiddenPasswordModal onClick={() => {
          if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
          }
        }}>
          <HiddenInput 
            ref={hiddenInputRef}
            type="password"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Stop the event from propagating
                e.stopPropagation();
                e.preventDefault();
                
                // Get the password
                const enteredPassword = e.target.value;
                
                // Clear the input
                e.target.value = '';
                
                // End password collection
                setCollectingPassword(false);
                
                // Submit the password
                submitSSHPassword(enteredPassword);
              } else if (e.key === 'Escape') {
                // Handle escape key to cancel
                e.stopPropagation();
                e.preventDefault();
                
                // Clear the input
                e.target.value = '';
                
                // End password collection
                setCollectingPassword(false);
                
                if (xtermRef.current) {
                  xtermRef.current.writeln('\r\n\x1b[31mPassword entry cancelled\x1b[0m');
                  displayPrompt();
                }
              }
            }}
            // Add blur event to refocus to prevent losing focus
            onBlur={(e) => {
              if (collectingPassword) {
                // Refocus after a short delay
                setTimeout(() => {
                  e.target.focus();
                }, 10);
              }
            }}
          />
        </HiddenPasswordModal>
      )}
    </TerminalContainer>
  );
};

export default Terminal;