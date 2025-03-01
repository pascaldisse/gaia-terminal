import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import styled from 'styled-components';
import '@xterm/xterm/css/xterm.css';

const TerminalContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1e1e2e;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  
  /* Improve xterm scrollbar appearance */
  .xterm-viewport {
    scrollbar-width: thin;
    scrollbar-color: #6272a4 #282a36;
    transition: opacity 0.3s ease;
    opacity: 0.3;
    
    &:hover {
      opacity: 1;
    }
    
    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #6272a4;
      border-radius: 4px;
      
      &:hover {
        background-color: #bd93f9;
      }
    }
    
    &::-webkit-scrollbar-track {
      background-color: #282a36;
    }
  }
  
  /* Make sure the cursor is always visible */
  .xterm-cursor-layer {
    z-index: 5;
  }
`;

// Password modal components
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

// Terminal colors
const COLORS = {
  background: '#1e1e2e',
  foreground: '#f8f8f2',
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
};

// ANSI style constants for the prompt
const STYLES = {
  user: `\x1b[1;36m`, // Cyan, bright
  separator: `\x1b[2;37m`, // White, dim
  host: `\x1b[1;36m`, // Cyan, bright
  directory: `\x1b[1;35m`, // Purple, bright
  git: `\x1b[1;38;5;213m`, // Bright pink
  nodejs: `\x1b[1;38;5;41m`, // Node.js green
  time: `\x1b[1;33m`, // Yellow, bright
  symbol: `\x1b[1;38;5;105m`, // Light purple
  reset: `\x1b[0m`, // Reset all styles
};

const Terminal = ({ id }) => {
  // Refs for DOM elements and xterm
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const wsRef = useRef(null);
  
  // Use a ref for terminal ID to avoid rerenders
  const terminalId = useRef(id);
  
  // Basic state - use refs for values that don't need to cause rerenders
  const currentPathRef = useRef('~');
  const [currentPath, setCurrentPath] = useState('~');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSSHActive, setIsSSHActive] = useState(false);
  const [collectingPassword, setCollectingPassword] = useState(false);
  const [sshConnectionParams, setSshConnectionParams] = useState(null);
  
  // Track websocket connection status
  const [wsConnected, setWsConnected] = useState(false);
  
  // Load command history from localStorage
  // Load history only once at component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('terminalCommandHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setCommandHistory(parsedHistory);
        }
      }
    } catch (error) {
      console.error('Error loading command history:', error);
    }
  }, []);
  
  // Placeholder for useEffect dependencies - all terminal logic is now in the main useEffect
  
  // Initialize terminal - this should only run once per id
  useEffect(() => {
    console.log(`Terminal ${id} initializing`);
    
    const term = new XTerm({
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.3,
      cursorBlink: true,
      convertEol: true,
      scrollback: 5000,
      theme: {
        background: COLORS.background,
        foreground: COLORS.foreground,
        cursor: COLORS.foreground,
        selection: 'rgba(248, 248, 242, 0.3)',
        black: COLORS.black,
        red: COLORS.red,
        green: COLORS.green,
        yellow: COLORS.yellow,
        blue: COLORS.blue,
        magenta: COLORS.magenta,
        cyan: COLORS.cyan,
        white: COLORS.white,
        brightBlack: COLORS.brightBlack,
        brightRed: COLORS.brightRed,
        brightGreen: COLORS.brightGreen,
        brightYellow: COLORS.brightYellow,
        brightBlue: COLORS.brightBlue,
        brightMagenta: COLORS.brightMagenta,
        brightCyan: COLORS.brightCyan,
        brightWhite: COLORS.brightWhite
      }
    });
    
    // Add addons
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(webLinksAddon);
    
    const searchAddon = new SearchAddon();
    term.loadAddon(searchAddon);
    
    // Store references
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    
    if (!terminalRef.current) {
      console.error("Terminal container ref is null");
      return;
    }
    
    // Open terminal in the container
    term.open(terminalRef.current);
    
    // Fit terminal to container
    setTimeout(() => {
      fitAddon.fit();
    }, 100);
    
    // Welcome message
    term.writeln('🚀 Welcome to Spaceflight Terminal');
    term.writeln('Type "help" to see available commands');
    
    // Show initial prompt using a one-time function
    const showInitialPrompt = () => {
      if (!xtermRef.current) return;
      
      const username = 'astronaut';
      const hostname = 'spacecraft';
      const path = currentPath.replace(/^~\//, '');
      
      // Create the prompt
      let topLine = `┌─[${STYLES.user}${username}${STYLES.reset}${STYLES.separator}@${STYLES.reset}${STYLES.host}${hostname}${STYLES.reset}] `;
      topLine += `${STYLES.separator}in${STYLES.reset} ${STYLES.directory}${path}${STYLES.reset}`;
      
      // Add git information if in a special directory
      if (path.includes('projects')) {
        topLine += ` ${STYLES.separator}on${STYLES.reset} ${STYLES.git}⎇ main${STYLES.reset}`;
      }
      
      // Create the bottom line with prompt symbol
      const bottomLine = `└─${STYLES.symbol}➜${STYLES.reset} `;
      
      xtermRef.current.write('\r\n' + topLine + '\r\n');
      xtermRef.current.write(bottomLine);
    };
    
    showInitialPrompt();
    
    // Handle data input - using a standalone function to reduce dependencies
    let currentLine = '';
    let cursorPosition = 0;
    
    const handleCommand = (cmd) => {
      if (!xtermRef.current) return;
      
      const trimmedCmd = cmd.trim();
      if (!trimmedCmd) {
        showInitialPrompt();
        return;
      }
      
      // Add command to history using functional update to avoid stale closures
      if (trimmedCmd) {
        setCommandHistory(prevHistory => {
          // Check if the command is already the last in history
          if (prevHistory.length > 0 && prevHistory[prevHistory.length - 1] === trimmedCmd) {
            return prevHistory; // No change needed
          }
          
          // Add to history
          const newHistory = [...prevHistory, trimmedCmd];
          
          // Save to localStorage
          try {
            localStorage.setItem('terminalCommandHistory', JSON.stringify(newHistory));
          } catch (error) {
            console.error('Error saving command history:', error);
          }
          
          return newHistory;
        });
      }
      
      // Reset history index
      setHistoryIndex(-1);
      
      // Parse command
      const parts = trimmedCmd.split(/\s+/);
      const command = parts[0];
      const args = parts.slice(1);
      
      // Handle commands
      switch(command) {
        case 'clear':
          xtermRef.current.clear();
          break;
          
        case 'help':
          xtermRef.current.writeln(`\x1b[1;38;5;105m┌─ Available Commands ────────────────────────┐\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mclear\x1b[0m         - Clear the terminal screen    \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mcd [path]\x1b[0m     - Change directory             \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mls\x1b[0m            - List files                   \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mpwd\x1b[0m           - Print working directory      \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mecho [text]\x1b[0m   - Display text                 \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mdate\x1b[0m          - Display current date/time    \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mwhoami\x1b[0m        - Display current user         \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mgit ...\x1b[0m       - Git commands                 \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mnode ...\x1b[0m      - Node.js commands             \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mhistory\x1b[0m       - Display command history      \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mssh [args]\x1b[0m    - Connect via SSH              \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m \x1b[1;32mhelp\x1b[0m          - Display this help message    \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m└────────────────────────────────────────────┘\x1b[0m`);
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
          
          setCurrentPath(() => updatedPath);
          currentPathRef.current = updatedPath;
          
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
            '\x1b[1;34mprojects\x1b[0m',
            '\x1b[1;32mfile1.txt\x1b[0m',
            '\x1b[1;32mREADME.md\x1b[0m'
          ];
          
          xtermRef.current.writeln(files.join('  '));
          break;
          
        case 'pwd':
          // Print working directory
          const displayPath = currentPath.replace('~', '/home/astronaut');
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
          xtermRef.current.writeln('astronaut');
          break;
          
        case 'history':
          if (args.length > 0 && args[0] === '-c') {
            // Clear history
            setCommandHistory(() => []);
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
          
        case 'ssh':
          // Display simulated SSH connection message
          xtermRef.current.writeln(`\x1b[1;38;5;105m┌─[SSH Connection]──────────────────────────┐\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m│\x1b[0m SSH functionality available in full version \x1b[1;38;5;105m│\x1b[0m`);
          xtermRef.current.writeln(`\x1b[1;38;5;105m└──────────────────────────────────────────┘\x1b[0m`);
          
          // Don't attempt WebSocket connection in the demo version
          console.log('[SSH STATUS] SSH connection feature not available in demo');
          break;
          
        default:
          // Command not found
          xtermRef.current.writeln(`\x1b[31mCommand not found: ${command}\x1b[0m`);
          xtermRef.current.writeln('Type \x1b[1;32mhelp\x1b[0m to see available commands');
      }
      
      // Show prompt again
      showInitialPrompt();
    };
    
    term.onData((data) => {
      // Skip processing if collecting password
      if (collectingPassword) {
        return;
      }
      
      const inputData = data;
      const code = inputData.charCodeAt(0);
      
      if (inputData === '\r') { // Enter
        term.write('\r\n');
        
        // Process command
        handleCommand(currentLine);
        
        // Reset current line and cursor position
        currentLine = '';
        cursorPosition = 0;
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
      else if (inputData === '\u001b[A') { // Up arrow - history
        if (commandHistory.length > 0) {
          const index = historyIndex === -1 ? 
            commandHistory.length - 1 : 
            Math.max(0, historyIndex - 1);
          
          // Clear current line
          term.write('\r');
          term.write('\x1b[K');
          term.write(`└─${STYLES.symbol}➜${STYLES.reset} `);
          
          // Display previous command
          const prevCommand = commandHistory[index];
          term.write(prevCommand);
          
          // Update state
          currentLine = prevCommand;
          cursorPosition = prevCommand.length;
          setHistoryIndex(() => index);
        }
      }
      else if (inputData === '\u001b[B') { // Down arrow - history
        if (commandHistory.length > 0 && historyIndex !== -1) {
          const index = historyIndex < commandHistory.length - 1 ? 
            historyIndex + 1 : -1;
          
          // Clear current line
          term.write('\r');
          term.write('\x1b[K');
          term.write(`└─${STYLES.symbol}➜${STYLES.reset} `);
          
          if (index === -1) {
            // Clear line when reaching end of history
            currentLine = '';
            cursorPosition = 0;
          } else {
            // Display next command from history
            const nextCommand = commandHistory[index];
            term.write(nextCommand);
            
            // Update state
            currentLine = nextCommand;
            cursorPosition = nextCommand.length;
          }
          
          setHistoryIndex(() => index);
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
    });
    
    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up on unmount
    return () => {
      console.log(`Terminal ${id} cleaning up`);
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      term.dispose();
    };
  }, [id]); // Only depend on id to ensure this runs once per terminal instance
  
  return (
    <TerminalContainer ref={terminalRef}>
      {/* Hidden password input modal (simplified) */}
      {collectingPassword && (
        <HiddenPasswordModal>
          <HiddenInput 
            ref={hiddenInputRef}
            type="password"
            autoFocus
          />
        </HiddenPasswordModal>
      )}
    </TerminalContainer>
  );
};

export default Terminal;