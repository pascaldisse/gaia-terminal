# 🚀 Gaia Terminal

A modern, spaceship-prompt inspired web terminal with SSH capabilities.

![Gaia Terminal Screenshot](https://github.com/spaceship-prompt/spaceship-prompt/raw/master/preview.gif)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Terminal Interface](#terminal-interface)
- [Documentation](#documentation)
- [Command Support](#command-support)
- [SSH Capabilities](#ssh-capabilities)
- [Customization](#customization)
- [Getting Started](#getting-started)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## ✨ Features

- 🚀 **Beautiful Spaceship-inspired Design**: Elegant and modern UI with Dracula color theme
- 🔌 **SSH Integration**: Connect to remote servers directly from your browser
- 📊 **Rich Contextual Prompt**: Shows Git status, execution time, user/host info and more
- 📑 **Tab-based Interface**: Manage multiple terminal sessions at once
- 🛡️ **Secure Password Handling**: Proper security for authentication credentials
- 🔧 **Customizable Sections**: Toggle prompt sections on/off based on your needs
- 🌟 **Command Highlighting**: Syntax highlighting for commands and outputs
- 🧠 **Smart Command History**: Navigate through command history with ease
- 📱 **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

Gaia Terminal consists of two main components:

1. **Frontend**: React + Vite application providing the terminal UI
   - Uses xterm.js for terminal emulation
   - Styled with styled-components
   - State management with Zustand

2. **Backend**: Node.js server handling SSH connections
   - Express server with WebSocket support
   - SSH2 library for secure connections
   - Proxies data between client and SSH servers

## 🖥️ Terminal Interface

The interface consists of several main components:

1. **Toolbar**: Contains actions for creating new terminals, opening SSH connections, and accessing settings
2. **Tabs Bar**: Shows all open terminal sessions and allows switching between them
3. **Terminal Window**: The main terminal interface where you can enter commands
4. **Spaceship Prompt**: The multi-line prompt showing context information

### The Spaceship Prompt

The terminal features a spaceship-style prompt with contextual information:

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

## 📚 Documentation

This project includes comprehensive documentation:

- **[USER_GUIDE.md](USER_GUIDE.md)**: Complete guide for end users with instructions on how to use all features
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)**: Technical documentation for developers who want to understand or extend the codebase 
- **[PROMPT_GUIDE.md](PROMPT_GUIDE.md)**: Detailed guide explaining the spaceship-prompt implementation and customization
- **[DESIGN.md](DESIGN.md)**: Overview of design principles and architectural decisions
- **[SUMMARY.md](SUMMARY.md)**: Brief overview of the project and its implementation

## 💻 Command Support

Gaia Terminal supports a variety of commands:

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

## 🔐 SSH Capabilities

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

## 🎨 Customization

You can customize various aspects of the terminal through the settings panel:

- **Prompt Sections**: Enable/disable sections in the terminal settings
- **Appearance**: Adjust font family, size, and cursor styles
- **Terminal Behavior**: Configure scrollback limits, tab behavior, and more

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gaia-terminal.git
cd gaia-terminal

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
node server.js
```

## 🛠️ Development

### Available Commands

- **Development**: `npm run dev` - Run Vite development server
- **Build**: `npm run build` - Build for production
- **Lint**: `npm run lint` - Run ESLint checks
- **Preview**: `npm run preview` - Preview production build

### Code Style

- **Formatting**: 2-space indentation, consistent spacing, 80-char line limit
- **Components**: Functional components with hooks, default exports
- **Imports**: React first, external libraries next, local modules, CSS last
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Error handling**: Use try/catch for async operations, provide user feedback

## 🔧 Troubleshooting

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

## 🤝 Contributing

Contributions are welcome! See [IMPLEMENTATION.md](IMPLEMENTATION.md) for details on the codebase structure and development workflow.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Spaceship Prompt](https://github.com/spaceship-prompt/spaceship-prompt) for design inspiration
- [xterm.js](https://github.com/xtermjs/xterm.js) for terminal emulation
- [ssh2](https://github.com/mscdex/ssh2) for SSH functionality