# Spaceflight Terminal User Guide

Welcome to Spaceflight Terminal, a modern web and mobile terminal with spaceship-prompt inspired design!

![Spaceflight Terminal](https://github.com/spaceship-prompt/spaceship-prompt/raw/master/preview.gif)

## Getting Started

### Opening a Terminal

When you first launch Spaceflight Terminal, you'll be greeted with a welcome screen. Click the "New Terminal" button to open your first terminal session.

You can also create a new terminal tab at any time by:
- Clicking the "New Terminal" button in the toolbar
- Clicking the "+" icon in the tabs bar

### Terminal Interface

The terminal interface consists of several components:

1. **Toolbar**: Contains actions for creating new terminals, opening SSH connections, and accessing settings
2. **Tabs Bar**: Shows all open terminal sessions and allows switching between them
3. **Terminal Window**: The main terminal interface where you can enter commands
4. **Spaceship Prompt**: The multi-line prompt showing context information

### The Spaceship Prompt

The terminal features a spaceship-style prompt with multiple sections:

```
┌─[username@hostname] in ~/path/to/directory on ⎇ main [⚑]
├─[⬢ v18.12.1] [⏱ took 2.5s] [✓]
└─➜ 
```

The prompt contains:
- **User & Host**: Shows current username and hostname
- **Directory**: Shows current working directory
- **Git Information**: Shows git branch and status when in a git repository
- **Node.js Version**: Shows Node.js version for applicable projects
- **Execution Time**: Shows execution time for commands that take longer than 2 seconds
- **Exit Status**: Shows ✓ for successful commands, ✗ for errors

## Available Commands

Spaceflight Terminal supports a variety of commands:

### Basic Commands

| Command | Description |
|---------|-------------|
| `help` | Display available commands |
| `clear` | Clear the terminal screen |
| `cd <path>` | Change directory |
| `ls` | List files in current directory |
| `pwd` | Print working directory |
| `echo <text>` | Display text |
| `date` | Display current date and time |
| `whoami` | Display current user |
| `history` | Display command history |
| `history -c` | Clear command history |

### Git Commands

| Command | Description |
|---------|-------------|
| `git status` | Show Git repository status |
| `git checkout <branch>` | Switch to another branch |

### Node.js Commands

| Command | Description |
|---------|-------------|
| `node` | Start Node.js REPL |
| `node -v` | Display Node.js version |
| `npm install <package>` | Install an npm package |
| `npm run <script>` | Run an npm script |

### SSH Commands

| Command | Description |
|---------|-------------|
| `ssh <user>@<host>` | Connect to remote server via SSH |
| `ssh <host>` | Connect to remote server with default user |
| `ssh <user>@<host> -p <port>` | Connect to remote server on specific port |

## SSH Connections

### Connecting to SSH

You can connect to SSH servers in two ways:

1. **Command Line**: Type `ssh username@hostname` in the terminal
2. **SSH Modal**: Click the "SSH" button in the toolbar and fill in connection details

### SSH Modal Features

The SSH connection modal provides:
- Connection details input (hostname, username, port)
- Password and private key authentication options
- Saved connection management
- Option to remember credentials

### SSH Session Management

While in an SSH session:
- The terminal tab will show the connection details
- Type `exit` or `logout` to disconnect from the SSH server
- Use all normal SSH commands as you would in a regular terminal

## Command History

Command history is saved between sessions. You can:
- Press the up/down arrow keys to navigate through previous commands
- Type `history` to see all saved commands
- Type `history -c` to clear command history

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Up/Down Arrow | Navigate command history |
| Left/Right Arrow | Move cursor within the current line |
| Ctrl+C | Interrupt the current command |
| Ctrl+L | Clear the screen (same as `clear` command) |
| Ctrl+D | Exit current shell (when in SSH session) |

## Tips & Tricks

1. **SSH Password Caching**: Passwords for SSH connections are securely cached, allowing for quick reconnection to frequently used servers.

2. **Command Auto-detection**: The terminal can detect various environments (Git repositories, Node.js projects) and display contextual information.

3. **Long-running Commands**: For commands that take longer than 2 seconds, the terminal will display the execution time in the prompt.

4. **Multiple Sessions**: Use tabs to manage multiple terminal sessions or SSH connections simultaneously.

5. **Tab Naming**: SSH tabs are automatically named based on the connection details for easy identification.

## Mobile-Specific Features

When using the mobile application:

1. **Touch Keyboard**:
   - Touch anywhere on the terminal to bring up the keyboard
   - Use the "Hide Keyboard" button to dismiss it
   
2. **Gesture Support**:
   - Swipe left/right to switch between tabs
   - Pinch to zoom text size
   - Long-press on text to copy

3. **Offline Mode**:
   - The app can function without network for local commands
   - SSH connections require network connectivity

## Troubleshooting

If you encounter issues:

1. **SSH Connection Problems**:
   - Verify hostname, username, and port
   - Check network connectivity
   - Ensure the SSH server is running and accessible

2. **Terminal Display Issues**:
   - Try adjusting the terminal window size
   - Clear the terminal with the `clear` command
   - Reload the page if issues persist

3. **Performance Issues**:
   - Limit the number of open terminal tabs
   - Close tabs when not in use
   - Clear very long output with the `clear` command
   
4. **Mobile-Specific Issues**:
   - If keyboard doesn't appear, try tapping in different areas of the terminal
   - Restart the app if WebSocket connections fail repeatedly
   - For iOS simulator issues, try using different device models