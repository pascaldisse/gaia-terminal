# Gaia Terminal Implementation Guide

This document outlines the implementation details of Gaia Terminal, a modern cross-platform terminal emulator built with Flutter.

## Architecture Overview

Gaia Terminal follows a clean architecture with a provider-based state management approach:

```
Gaia Terminal
├── Flutter UI
│   ├── Widgets
│   │   ├── Terminal Widget (xterm.dart)
│   │   ├── TerminalTabs
│   │   ├── TerminalToolbar
│   │   └── SSH Dialog
│   └── Screens
│       └── HomeScreen
├── Services
│   ├── TerminalService
│   ├── ShellService
│   └── SSHService
└── Models
    ├── Terminal Session
    ├── SSH Connection
    └── User Preferences
```

## Key Components

### 1. Terminal Widget

The core terminal functionality is implemented in `lib/widgets/terminal_widget.dart`. This widget:

- Uses xterm.dart for terminal emulation
- Handles user input and output display
- Manages the terminal buffer and styling
- Connects to both local shell and SSH sessions

The terminal implementation sets up the xterm terminal with appropriate styling and handlers:

```dart
class TerminalWidget extends StatefulWidget {
  final TerminalSession session;
  
  @override
  _TerminalWidgetState createState() => _TerminalWidgetState();
}

class _TerminalWidgetState extends State<TerminalWidget> {
  Terminal terminal;
  final TerminalController controller = TerminalController();
  
  @override
  void initState() {
    super.initState();
    terminal = Terminal(
      maxLines: 10000,
      theme: getTerminalTheme(),
    );
    
    // Connect to service based on session type
    if (widget.session.isSSH) {
      _connectToSSH();
    } else {
      _connectToLocalShell();
    }
    
    // Handle input
    terminal.onOutput = (output) {
      // Send output to service
      if (widget.session.isSSH) {
        context.read<SSHService>().sendData(output);
      } else {
        context.read<ShellService>().sendData(output);
      }
    };
  }
  
  // Terminal theme configuration
  TerminalTheme getTerminalTheme() {
    return TerminalTheme(
      cursor: Colors.white,
      selection: Color(0xFF44475A),
      foreground: Color(0xFFF8F8F2),
      background: Color(0xFF1E1E2E),
      black: Color(0xFF000000),
      red: Color(0xFFFF5555),
      // ...more colors
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return TerminalView(
      terminal: terminal,
      controller: controller,
      autofocus: true,
      style: TerminalStyle(
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
      ),
    );
  }
}
```

### 2. State Management

Provider is used for state management. The core services are defined in the services directory:

- `lib/services/terminal_service.dart`: Manages terminal sessions and state
- `lib/services/shell_service.dart`: Handles local shell processes
- `lib/services/ssh_service.dart`: Manages SSH connections

```dart
class TerminalService with ChangeNotifier {
  List<TerminalSession> _sessions = [];
  int _activeSessionIndex = 0;
  
  // Getters
  List<TerminalSession> get sessions => _sessions;
  TerminalSession get activeSession => 
      _sessions.isNotEmpty ? _sessions[_activeSessionIndex] : null;
  
  // Create a new terminal session
  void createSession({String name = 'Terminal'}) {
    final session = TerminalSession(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      isSSH: false,
    );
    
    _sessions.add(session);
    _activeSessionIndex = _sessions.length - 1;
    notifyListeners();
  }
  
  // Switch to a different session
  void setActiveSession(int index) {
    if (index >= 0 && index < _sessions.length) {
      _activeSessionIndex = index;
      notifyListeners();
    }
  }
  
  // Close a session
  void closeSession(int index) {
    if (index >= 0 && index < _sessions.length) {
      _sessions.removeAt(index);
      
      // Adjust active index if needed
      if (_activeSessionIndex >= _sessions.length) {
        _activeSessionIndex = _sessions.length - 1;
      }
      
      notifyListeners();
    }
  }
}
```

### 3. SSH Integration

SSH functionality is implemented through the `dartssh2` package:

```dart
class SSHService with ChangeNotifier {
  SSHClient _client;
  SSHSession _session;
  bool _isConnected = false;
  
  // Connection state
  bool get isConnected => _isConnected;
  
  // Connect to SSH server
  Future<bool> connect({
    required String host,
    required String username,
    String password,
    String privateKey,
    int port = 22,
  }) async {
    try {
      _client = SSHClient(
        await SSHSocket.connect(host, port),
        username: username,
        onPasswordRequest: () => password,
        identities: privateKey != null 
            ? [SSHKeyPair.fromPem(privateKey)] 
            : null,
      );
      
      _session = await _client.shell();
      _isConnected = true;
      
      // Set up data handling
      _session.stdout.listen((data) {
        // Process and display output
        _terminalOutput(data);
      });
      
      _session.stderr.listen((data) {
        // Process and display error output
        _terminalError(data);
      });
      
      notifyListeners();
      return true;
    } catch (e) {
      print('SSH connection error: $e');
      _isConnected = false;
      notifyListeners();
      return false;
    }
  }
  
  // Send data to SSH session
  void sendData(String data) {
    if (_isConnected && _session != null) {
      _session.stdin.add(utf8.encode(data));
    }
  }
  
  // Disconnect from SSH server
  Future<void> disconnect() async {
    try {
      if (_session != null) {
        await _session.close();
      }
      if (_client != null) {
        _client.close();
      }
    } finally {
      _isConnected = false;
      notifyListeners();
    }
  }
}
```

## Theme System

The app supports multiple color schemes implemented in the theme system:

```dart
// Define terminal themes based on popular color schemes
class TerminalThemes {
  static TerminalTheme dracula() {
    return TerminalTheme(
      cursor: Color(0xFFF8F8F2),
      selection: Color(0xFF44475A),
      foreground: Color(0xFFF8F8F2),
      background: Color(0xFF1E1E2E),
      black: Color(0xFF000000),
      red: Color(0xFFFF5555),
      green: Color(0xFF50FA7B),
      yellow: Color(0xFFF1FA8C),
      blue: Color(0xFFBD93F9),
      magenta: Color(0xFFFF79C6),
      cyan: Color(0xFF8BE9FD),
      white: Color(0xFFF8F8F2),
      brightBlack: Color(0xFF6272A4),
      brightRed: Color(0xFFFF6E6E),
      brightGreen: Color(0xFF69FF94),
      brightYellow: Color(0xFFFFFFA5),
      brightBlue: Color(0xFFD6ACFF),
      brightMagenta: Color(0xFFFF92DF),
      brightCyan: Color(0xFFA4FFFF),
      brightWhite: Color(0xFFFFFFFF),
    );
  }
  
  static TerminalTheme solarized() {
    // Solarized theme implementation
  }
  
  static TerminalTheme monokai() {
    // Monokai theme implementation
  }
  
  static TerminalTheme nord() {
    // Nord theme implementation
  }
}
```

## How to Extend

### Adding a New Feature to the Terminal Widget

To add a new feature to the terminal (e.g., search functionality):

1. Update the TerminalWidget class:
```dart
class TerminalWidget extends StatefulWidget {
  // Add search control
  final TextEditingController searchController = TextEditingController();
  bool isSearchVisible = false;
  
  // Add search method
  void search(String term) {
    if (term.isEmpty) return;
    
    // Implement search logic using terminal API
    final matches = terminal.search(term);
    
    // Highlight matches or navigate to first match
    if (matches.isNotEmpty) {
      terminal.scrollToPosition(matches.first);
    }
  }
  
  // Update build method to include search UI
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (isSearchVisible)
          TextField(
            controller: searchController,
            decoration: InputDecoration(
              hintText: 'Search...',
              suffixIcon: IconButton(
                icon: Icon(Icons.search),
                onPressed: () => search(searchController.text),
              ),
            ),
            onSubmitted: search,
          ),
        Expanded(
          child: TerminalView(
            terminal: terminal,
            controller: controller,
            autofocus: true,
          ),
        ),
      ],
    );
  }
}
```

### Adding a New Terminal Command for Local Shell

To add built-in command support (for commands that aren't passed to the system shell):

1. Modify the ShellService to handle custom commands:
```dart
class ShellService {
  // Process a command before sending to system shell
  Future<bool> processCommand(String command, Function(String) output) async {
    final parts = command.trim().split(' ');
    final cmd = parts.first.toLowerCase();
    final args = parts.skip(1).toList();
    
    // Check for built-in commands
    switch (cmd) {
      case 'clear':
        // Clear the terminal - handled by terminal widget
        return true;
        
      case 'help':
        output('Available commands:\n');
        output('  clear - Clear the terminal\n');
        output('  help - Show this help message\n');
        output('  theme - Change terminal theme\n');
        return true;
        
      case 'theme':
        if (args.isNotEmpty) {
          switch (args.first) {
            case 'dracula':
            case 'solarized':
            case 'monokai':
            case 'nord':
              // Update theme - handled by settings service
              output('Theme changed to ${args.first}\n');
              return true;
          }
        }
        output('Usage: theme [dracula|solarized|monokai|nord]\n');
        return true;
        
      default:
        // Not a built-in command, pass to system shell
        return false;
    }
  }
}
```

### Adding Split View Support

To implement terminal split views:

1. Create a SplitView widget:
```dart
class SplitTerminalView extends StatefulWidget {
  @override
  _SplitTerminalViewState createState() => _SplitTerminalViewState();
}

class _SplitTerminalViewState extends State<SplitTerminalView> {
  List<TerminalSession> sessions = [];
  bool isHorizontalSplit = true;
  
  @override
  void initState() {
    super.initState();
    // Create initial sessions
    sessions.add(TerminalSession(id: '1', name: 'Terminal 1'));
    sessions.add(TerminalSession(id: '2', name: 'Terminal 2'));
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Split controls
        Row(
          children: [
            IconButton(
              icon: Icon(Icons.splitscreen),
              onPressed: () => setState(() {
                isHorizontalSplit = !isHorizontalSplit;
              }),
            ),
          ],
        ),
        // Split terminal view
        Expanded(
          child: isHorizontalSplit
              ? Row(
                  children: sessions.map((session) => Expanded(
                    child: TerminalWidget(session: session),
                  )).toList(),
                )
              : Column(
                  children: sessions.map((session) => Expanded(
                    child: TerminalWidget(session: session),
                  )).toList(),
                ),
        ),
      ],
    );
  }
}
```

## Performance Considerations

For optimal performance across platforms:

1. Implement buffered rendering for terminal output
2. Limit terminal history to prevent memory issues
3. Use efficient text rendering techniques
4. Implement background processing for terminal operations
5. Cache SSH connections when appropriate
6. Use lazy loading for terminal sessions

## Security Considerations

The terminal implementation includes several security measures:

1. Secure credential management for SSH connections
2. Private key encryption for stored credentials
3. Input validation for command handling
4. Secure storage using platform-specific encryption
5. Proper error handling for failed connections

## Future Improvements

Planned enhancements for future versions:

1. SFTP file browser and transfer capabilities
2. Terminal recording and playback
3. More extensive command completion
4. Custom keyboard shortcuts configuration
5. Cloud synchronization of settings
6. Plugin system for terminal extensions
7. Remote development environment integration