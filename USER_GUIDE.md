# Gaia Terminal User Guide

Welcome to Gaia Terminal, a modern cross-platform terminal emulator built with Flutter!

## Getting Started

### Opening a Terminal

When you first launch Gaia Terminal, you'll be greeted with a clean interface. A new terminal session is automatically created for you. You can create additional terminal sessions at any time by:

- Clicking the "+" icon in the toolbar or tabs bar
- Using the keyboard shortcut Ctrl+T (Cmd+T on macOS)

### Terminal Interface

The terminal interface consists of these main components:

1. **Toolbar**: Contains actions for creating new terminals, opening SSH connections, and accessing settings
2. **Tabs Bar**: Shows all open terminal sessions and allows switching between them
3. **Terminal Window**: The main terminal interface where you can enter commands
4. **Split View**: Optional feature to divide the terminal into multiple panes

### Terminal Features

Gaia Terminal provides a complete terminal experience with:

- Native shell access on desktop platforms (Windows, macOS, Linux)
- SSH connectivity for remote server access
- Multiple color themes (Dracula, Monokai, Solarized, Nord)
- Tab-based interface for multiple sessions
- Command history navigation
- Split terminal views for efficient multitasking
- SFTP capabilities for file transfers

## Terminal Sessions

### Local Shell Sessions

On desktop platforms (Windows, macOS, Linux), Gaia Terminal connects directly to your system's shell:

- Windows: PowerShell or Command Prompt (based on system default)
- macOS: Bash, Zsh, or other configured shell
- Linux: Bash, Zsh, or other configured shell

All normal shell commands and functionality work exactly as they would in your system's native terminal.

### SSH Sessions

You can connect to remote servers via SSH in two ways:

1. **Command Line**: Type `ssh username@hostname` in the terminal
2. **SSH Dialog**: Click the "SSH" button in the toolbar and fill in connection details

### SSH Dialog Features

The SSH connection dialog provides:
- Connection details input (hostname, username, port)
- Password and private key authentication options
- Saved connection management with secure credential storage
- SFTP file browser for remote file access and transfer

### SSH Session Management

During an SSH session:
- The terminal tab will display the connection details
- Type `exit` or press Ctrl+D to disconnect from the SSH server
- Use all standard SSH commands and functionality

## Command History

Command history is preserved between sessions. You can:
- Press Up/Down arrow keys to navigate through previous commands
- Use Ctrl+R to search command history
- Access history specific to each terminal tab

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+T / Cmd+T | New terminal tab |
| Ctrl+W / Cmd+W | Close current tab |
| Ctrl+Tab | Next tab |
| Ctrl+Shift+Tab | Previous tab |
| Ctrl+Shift+S | Split terminal view |
| Ctrl+Shift+D | Toggle split orientation |
| Ctrl+C | Interrupt current process |
| Ctrl+L | Clear the screen |
| Ctrl+D | Send EOF / Close SSH connection |
| Ctrl+R | Search command history |
| Ctrl+Shift+F | Find in terminal |
| Ctrl+= / Cmd+= | Increase font size |
| Ctrl+- / Cmd+- | Decrease font size |
| F11 | Toggle fullscreen |

## Terminal Customization

Gaia Terminal can be customized through the Settings panel:

### Appearance Settings
- **Theme**: Choose between Dracula, Monokai, Solarized, and Nord themes
- **Font**: Select font family and size
- **Cursor**: Configure cursor style (block, underline, or bar)

### Terminal Settings
- **Scrollback**: Adjust the number of lines preserved in history
- **Tab Behavior**: Configure how tabs are created and managed
- **Terminal Bell**: Enable or disable the terminal bell sound
- **Copy on Select**: Automatically copy selected text

### Keyboard Settings
- **Shortcuts**: View and customize keyboard shortcuts
- **Key Mapping**: Configure special key behavior

## Split Terminal View

Gaia Terminal supports splitting the terminal window for multitasking:

- Click the split icon in the toolbar or use Ctrl+Shift+S to create a split
- Toggle between horizontal and vertical splits with Ctrl+Shift+D
- Each split has its own independent terminal session
- Resize splits by dragging the divider

## SFTP File Transfer

For SSH connections, Gaia Terminal provides SFTP functionality:

- Click the "SFTP" button in an active SSH session
- Browse remote files with a dual-pane interface
- Upload and download files between local and remote systems
- Perform basic file operations (copy, move, delete, rename)

## Platform-Specific Features

### Desktop (Windows, macOS, Linux)
- Full system shell integration
- Native file dialogs for file selection
- Clipboard integration
- Drag and drop file support

### Mobile (iOS and Android)
- Touch-optimized interface
- Virtual keyboard with terminal-specific keys
- Gesture support for navigation
- Portrait and landscape orientation support

### Web
- Browser-based access
- Integration with browser's clipboard API
- Progressive Web App (PWA) support for offline use

## Troubleshooting

If you encounter issues:

1. **SSH Connection Problems**:
   - Verify hostname, username, port, and credentials
   - Check network connectivity and firewall settings
   - Ensure the SSH server is running and accessible

2. **Terminal Display Issues**:
   - Adjust terminal font size in settings
   - Clear the terminal with Ctrl+L or the `clear` command
   - Restart the application if issues persist

3. **Performance Issues**:
   - Limit number of open terminal tabs
   - Reduce terminal history buffer in settings
   - Close unused SSH connections

4. **Platform-Specific Issues**:
   - **Windows**: Ensure proper Windows Terminal integration
   - **macOS**: Check terminal access permissions in System Settings
   - **Linux**: Verify required packages are installed
   - **Mobile**: Check app permissions for storage access