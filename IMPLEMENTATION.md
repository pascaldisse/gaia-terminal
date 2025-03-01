# Spaceflight Terminal Implementation Guide

This document outlines the implementation details of the Spaceflight Terminal, a modern web-based terminal with a spaceship-prompt inspired interface.

## Architecture Overview

The Spaceflight Terminal is built with a modular architecture:

```
Spaceflight Terminal
├── Frontend (React + Vite)
│   ├── Components
│   │   ├── Terminal (xterm.js)
│   │   ├── TerminalTabs
│   │   ├── TerminalToolbar
│   │   └── SSH Modal
│   ├── State Management (Zustand)
│   └── Styling (styled-components)
└── Backend (Node.js + Express)
    ├── WebSocket Server
    └── SSH Client (ssh2)
```

## Key Components

### 1. Terminal Component

The core terminal functionality is implemented in `src/components/Terminal/Terminal.jsx`. This component:

- Uses xterm.js for terminal emulation
- Implements the spaceship-style prompt with modular sections
- Handles command execution and history
- Manages SSH connections via WebSockets

The terminal prompt is built using ANSI escape sequences for colors and formatting:

```jsx
const generateSpaceshipPrompt = () => {
  // Get username, hostname
  const username = 'astronaut';
  const hostname = 'spacecraft';
  
  // Format current path
  const formattedPath = currentPath.replace(/^~\//, '');
  
  // Get git information
  const gitInfo = getGitInfo(currentPath);
  
  // Build the spaceship-style prompt
  let topLine = `┌─[${STYLES.user}${username}${STYLES.reset}${STYLES.separator}@${STYLES.reset}${STYLES.host}${hostname}${STYLES.reset}] `;
  topLine += `${STYLES.separator}in${STYLES.reset} ${STYLES.directory}${formattedPath}${STYLES.reset}`;
  
  // Build middle and bottom lines...
  
  return {
    topLine,
    middleLine,
    bottomLine
  };
};
```

### 2. State Management

Zustand is used for global state management (replacing the previous Redux implementation). The store is defined in `src/stores/terminalStore.js` and includes:

- Terminal settings and configuration
- Command history management
- Tab management
- SSH connection state
- Environment information (git, node, etc.)

```jsx
export const useTerminalStore = create((set, get) => ({
  // Terminal settings
  settings: {
    theme: 'spaceship',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: 14,
    // ...more settings
  },
  
  // Terminal state
  tabs: [],
  activeTabId: null,
  commandHistory: [],
  // ...more state
  
  // Actions
  addTab: (tab) => {
    const { tabs } = get();
    set({ 
      tabs: [...tabs, tab],
      activeTabId: tab.id
    });
  },
  // ...more actions
}));
```

### 3. SSH Integration

SSH functionality is implemented through:

- A WebSocket server in `server.js` that handles SSH connections
- An SSH modal component for connection UI
- Terminal integration for sending/receiving SSH data

The SSH connection flow:
1. User enters connection details in the SSH modal
2. Connection request is sent over WebSocket
3. Server establishes SSH connection using ssh2
4. Terminal input/output is proxied between client and SSH server

## Styling System

The styling system uses styled-components with a consistent color palette:

```jsx
// Define terminal colors to match spaceship-prompt theme
const COLORS = {
  background: '#1e1e2e',
  foreground: '#f8f8f2',
  black: '#000000',
  red: '#ff5555',
  // ...more colors
};

// Define style constants for prompt elements
const STYLES = {
  user: `\x1b[1;36m`, // Cyan, bright
  separator: `\x1b[2;37m`, // White, dim
  directory: `\x1b[1;35m`, // Purple, bright
  // ...more styles
};
```

## How to Extend

### Adding a New Prompt Section

To add a new prompt section (e.g., for Docker):

1. Add a new entry in the settings.promptSections object:
```jsx
promptSections: {
  // ...existing sections
  docker: false,
}
```

2. Modify the generateSpaceshipPrompt function to include the new section:
```jsx
// Get Docker information if available
const dockerInfo = currentPath.includes('docker') ? 'v24.0.6' : null;

// Add Docker information if available
if (dockerInfo && settings.promptSections.docker) {
  middleItems.push(`${STYLES.docker}🐳 ${dockerInfo}${STYLES.reset}`);
}
```

### Adding a New Command

To add a new command (e.g., for Docker):

1. Modify the processCommand function in Terminal.jsx:
```jsx
switch(command) {
  // ...existing commands
  
  case 'docker':
    if (args[0] === 'ps') {
      xtermRef.current.writeln('\x1b[1;34mCONTAINER ID   IMAGE          COMMAND   STATUS\x1b[0m');
      xtermRef.current.writeln('3a09b2588dfc   nginx:latest   "nginx"    Up 2 hours');
      xtermRef.current.writeln('f7dfc52a4d12   redis:latest   "redis"    Up 3 days');
    } else {
      xtermRef.current.writeln('Usage: docker COMMAND');
      xtermRef.current.writeln('Run docker --help for more information.');
    }
    break;
}
```

### Adding a New Tab Type

To add a new tab type (e.g., for Python):

1. Update the getTabIcon function in TerminalTabs.jsx
2. Add appropriate handler in the Terminal component
3. Add type-specific styling and behavior

## Performance Considerations

For optimal performance:

1. Use virtualization for large terminal outputs
2. Implement throttling for rapid updates
3. Use memoization for expensive operations
4. Limit the terminal scrollback buffer
5. Batch WebSocket messages when possible

## Security Considerations

The terminal implementation includes several security measures:

1. Secure password handling for SSH connections
2. XSS protection for terminal output
3. Input sanitization for commands
4. Client-side storage encryption for saved credentials
5. WebSocket message validation

## Future Improvements

Potential enhancements for future versions:

1. Terminal split views (horizontal/vertical)
2. Persistent sessions across page reloads
3. File browser integration
4. More extensive command simulation
5. Custom theme support
6. Plugin system for terminal extensions