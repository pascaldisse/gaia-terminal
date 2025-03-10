# 🚀 Gaia Terminal

A modern, cross-platform terminal emulator with SSH capabilities built with Flutter.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Terminal Interface](#terminal-interface)
- [Documentation](#documentation)
- [SSH Capabilities](#ssh-capabilities)
- [Customization](#customization)
- [Getting Started](#getting-started)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- 🔥 **Modern Flutter UI**: Clean, responsive interface across all platforms
- 🔌 **SSH Integration**: Connect to remote servers with dartssh2
- 📊 **Native Shell Integration**: Access local shell on desktop platforms
- 📑 **Tab-based Interface**: Manage multiple terminal sessions at once
- 🔄 **Split Terminal Views**: Split terminal panes for better multitasking
- 🛡️ **Secure Authentication**: Password and private key-based SSH auth
- 🌈 **Multiple Color Schemes**: Monokai, Solarized, Dracula, Nord themes
- 🧠 **Command History**: Navigate through command history with ease
- 📁 **SFTP File Transfer**: Transfer files between local and remote systems
- 📱 **Cross-Platform**: Runs on Windows, macOS, Linux, Web, iOS, and Android

## 🏗️ Architecture

Gaia Terminal follows a provider-based architecture with these components:

1. **Services**:
   - `TerminalService`: Manages terminal sessions and interfaces
   - `ShellService`: Handles local shell processes
   - `SSHService`: Manages SSH connections with dartssh2

2. **UI Components**:
   - `TerminalWidget`: Terminal emulation using xterm
   - `TerminalTabs`: Tab management interface
   - `TerminalToolbar`: App toolbar with actions
   - `SettingsPanel`: User preferences
   - `SSHDialog`: SSH connection management
   - `SFTPPanel`: File transfer interface

## 🖥️ Terminal Interface

The interface consists of these main components:

1. **Toolbar**: Actions for new terminals, SSH connections, and settings
2. **Tabs Bar**: Shows open terminal sessions with switching
3. **Terminal Window**: Main terminal interface for command input
4. **Split View**: Option to divide terminal into multiple panes

## 📚 Documentation

Find more details in these documents:

- **[USER_GUIDE.md](USER_GUIDE.md)**: End-user features guide
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)**: Technical documentation
- **[DESIGN.md](DESIGN.md)**: Design principles and architecture
- **[SUMMARY.md](SUMMARY.md)**: Project overview

## 🔐 SSH Capabilities

### Connecting to SSH

Connect to SSH servers in two ways:

1. **Command Line**: Type `ssh username@hostname` in the terminal
2. **SSH Dialog**: Use the SSH button in the toolbar to connect

### SSH Features

- Connection details management (hostname, username, port)
- Password and private key authentication
- Saved connections with secure credential storage
- SFTP file transfer between local and remote systems

## 🎨 Customization

Customize through the settings panel:

- **Appearance**: Choose color themes, font family, and size
- **Terminal Behavior**: Adjust scrollback, cursor style, and more
- **Keyboard Shortcuts**: Customize key bindings for common actions

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Dart SDK
- IDE (VS Code, Android Studio, or IntelliJ IDEA)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourname/gaia-terminal.git
cd gaia-terminal

# Install dependencies
flutter pub get

# Run the application
flutter run

# Run on specific platform
flutter run -d chrome
flutter run -d macos
flutter run -d windows
flutter run -d linux
flutter run -d ios
flutter run -d android
```

## 🛠️ Development

### Available Commands

- **Setup**: `flutter pub get` - Install dependencies
- **Run**: `flutter run` - Start development
- **Test**: `flutter test` - Run tests
- **Analyze**: `flutter analyze` - Run analyzer
- **Format**: `flutter format .` - Format code

### Code Style

- **Formatting**: Standard Flutter format with 2-space indentation
- **Components**: Stateless widgets when possible, efficient state management
- **Imports**: Dart/Flutter imports first, then external packages, then project files
- **Naming**: PascalCase for classes/widgets, camelCase for variables/methods
- **Error Handling**: Try/catch for async operations with user feedback

## 🔧 Troubleshooting

If you encounter issues:

1. **SSH Connection Problems**:
   - Verify hostname, username, port, and credentials
   - Check network connectivity and firewall settings
   - Ensure SSH server is running and accessible

2. **Terminal Display Issues**:
   - Adjust terminal font size in settings
   - Clear terminal with the `clear` command
   - Restart the application if issues persist

3. **Performance Issues**:
   - Limit number of open terminal tabs
   - Close unused sessions
   - Reduce terminal history buffer size

## 🤝 Contributing

Contributions are welcome! See [IMPLEMENTATION.md](IMPLEMENTATION.md) for codebase structure and development workflow.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.