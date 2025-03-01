# 🚀 Spaceflight Terminal

A modern, spaceship-prompt inspired web terminal with SSH capabilities.

![Spaceflight Terminal](https://github.com/spaceship-prompt/spaceship-prompt/raw/master/preview.gif)

## Features

- 🚀 **Beautiful Spaceship-inspired Design**: Elegant and modern UI with Dracula color theme
- 🔌 **SSH Integration**: Connect to remote servers directly from your browser
- 📊 **Rich Contextual Prompt**: Shows Git status, execution time, user/host info and more
- 📑 **Tab-based Interface**: Manage multiple terminal sessions at once
- 🛡️ **Secure Password Handling**: Proper security for authentication credentials
- 🔧 **Customizable Sections**: Toggle prompt sections on/off based on your needs
- 🌟 **Command Highlighting**: Syntax highlighting for commands and outputs
- 🧠 **Smart Command History**: Navigate through command history with ease
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Architecture

Spaceflight Terminal consists of two main components:

1. **Frontend**: React + Vite application providing the terminal UI
   - Uses xterm.js for terminal emulation
   - Styled with styled-components
   - State management with Zustand

2. **Backend**: Node.js server handling SSH connections
   - Express server with WebSocket support
   - SSH2 library for secure connections
   - Proxies data between client and SSH servers

## Documentation

This project includes comprehensive documentation:

- **[USER_GUIDE.md](USER_GUIDE.md)**: Complete guide for end users with instructions on how to use all features
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)**: Technical documentation for developers who want to understand or extend the codebase 
- **[PROMPT_GUIDE.md](PROMPT_GUIDE.md)**: Detailed guide explaining the spaceship-prompt implementation and customization
- **[DESIGN.md](DESIGN.md)**: Overview of design principles and architectural decisions

The documentation covers everything from basic usage to advanced customization and development workflows.

## Terminal Prompt Design

The terminal features a multi-line spaceship-style prompt:

```
┌─[username@hostname] in ~/directory on ⎇ branch [status]
├─[⬢ node-version] [⏱ execution-time] [✓]
└─➜ 
```

The prompt includes these context-aware sections:
- User and hostname
- Current directory
- Git branch and status
- Node.js version (when applicable)
- Command execution time (for long-running commands)
- Exit status of the last command

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/spaceflight-terminal.git
cd spaceflight-terminal

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

## Customization

You can customize various aspects of the terminal through the settings panel:

- **Prompt Sections**: Enable/disable sections in the terminal settings
- **Appearance**: Adjust font family, size, and cursor styles
- **Terminal Behavior**: Configure scrollback limits, tab behavior, and more

## Available Commands

The terminal supports these command categories:

- **Basic Commands**: `help`, `clear`, `cd`, `ls`, `pwd`, etc.
- **Git Commands**: `git status`, `git checkout`, etc.
- **Node.js Commands**: `node`, `npm install`, `npm run`, etc.
- **SSH Commands**: Connect to remote servers via SSH

For a complete list of commands, see the [User Guide](USER_GUIDE.md).

## SSH Functionality

The SSH integration allows you to:
- Connect to remote servers using password or key-based authentication
- Save connection details for quick reconnection
- Transfer data securely between the browser and SSH servers
- Use all standard SSH commands as you would in a native terminal

## Contributing

Contributions are welcome! See [IMPLEMENTATION.md](IMPLEMENTATION.md) for details on the codebase structure and development workflow.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Spaceship Prompt](https://github.com/spaceship-prompt/spaceship-prompt) for design inspiration
- [xterm.js](https://github.com/xtermjs/xterm.js) for terminal emulation
- [ssh2](https://github.com/mscdex/ssh2) for SSH functionality