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

You can customize various aspects of the terminal:

- **Prompt Sections**: Enable/disable sections in the terminal settings
- **Color Themes**: Choose from pre-defined themes or create your own
- **Terminal Settings**: Adjust font size, opacity, and other display options

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Spaceship Prompt](https://github.com/spaceship-prompt/spaceship-prompt) for design inspiration
- [xterm.js](https://github.com/xtermjs/xterm.js) for terminal emulation
- [ssh2](https://github.com/mscdex/ssh2) for SSH functionality