import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xterm/xterm.dart';
import 'package:dartssh2/dartssh2.dart';

// Import local services
import 'ssh_proxy_service.dart';

class TerminalTab {
  final String id;
  final Terminal terminal;
  String title;
  bool isConnected;
  dynamic shellProcess; // Using dynamic to avoid Process specific type
  bool isSystemShell = false;
  
  // SSH specific properties
  SSHClient? sshClient;
  SSHSession? sshSession;
  String? currentServer;
  
  // WebSocket for web-based SSH
  WebSocketChannel? wsChannel;
  bool isWebSSH = false;

  TerminalTab({
    required this.id,
    required this.terminal,
    required this.title,
    this.isConnected = false,
    this.shellProcess,
    this.isSystemShell = false,
    this.sshClient,
    this.sshSession,
    this.currentServer,
    this.wsChannel,
    this.isWebSSH = false,
  });
}

class SSHConnection {
  final String host;
  final int port;
  final String username;
  final String password;
  final String name;
  WebSocketChannel? channel;

  SSHConnection({
    required this.host,
    required this.port,
    required this.username,
    required this.password,
    String? name,
  }) : name = name ?? '$username@$host';
  
  // Convert to JSON for storage
  Map<String, dynamic> toJson() {
    return {
      'host': host,
      'port': port,
      'username': username,
      'password': password,
      'name': name,
    };
  }
  
  // Create from JSON
  factory SSHConnection.fromJson(Map<String, dynamic> json) {
    return SSHConnection(
      host: json['host'],
      port: json['port'],
      username: json['username'],
      password: json['password'],
      name: json['name'],
    );
  }
}

/// Terminal themes with color schemes
enum TerminalTheme {
  dark,
  light,
  monokai,
  dracula,
  nord,
  solarized
}

/// Extension to provide color values for each theme
extension TerminalThemeExtension on TerminalTheme {
  String get displayName {
    switch (this) {
      case TerminalTheme.dark: return 'Dark';
      case TerminalTheme.light: return 'Light';  
      case TerminalTheme.monokai: return 'Monokai';
      case TerminalTheme.dracula: return 'Dracula';
      case TerminalTheme.nord: return 'Nord';
      case TerminalTheme.solarized: return 'Solarized';
    }
  }
  
  Color get background {
    switch (this) {
      case TerminalTheme.dark: return const Color(0xFF1E1E1E);
      case TerminalTheme.light: return const Color(0xFFF5F5F5);
      case TerminalTheme.monokai: return const Color(0xFF272822);
      case TerminalTheme.dracula: return const Color(0xFF282A36);
      case TerminalTheme.nord: return const Color(0xFF2E3440);
      case TerminalTheme.solarized: return const Color(0xFF002B36);
    }
  }
  
  Color get text {
    switch (this) {
      case TerminalTheme.dark: return const Color(0xFFFFFFFF);
      case TerminalTheme.light: return const Color(0xFF000000);
      case TerminalTheme.monokai: return const Color(0xFFF8F8F2);
      case TerminalTheme.dracula: return const Color(0xFFF8F8F2);
      case TerminalTheme.nord: return const Color(0xFFD8DEE9);
      case TerminalTheme.solarized: return const Color(0xFF839496);
    }
  }
  
  Color get cursor {
    switch (this) {
      case TerminalTheme.dark: return const Color(0xFFFFFFFF);
      case TerminalTheme.light: return const Color(0xFF000000);
      case TerminalTheme.monokai: return const Color(0xFFF92672);
      case TerminalTheme.dracula: return const Color(0xFFFF79C6);
      case TerminalTheme.nord: return const Color(0xFF81A1C1);
      case TerminalTheme.solarized: return const Color(0xFF2AA198);
    }
  }
  
  Color get selection {
    switch (this) {
      case TerminalTheme.dark: return const Color(0xFF264F78);
      case TerminalTheme.light: return const Color(0xFFADD6FF);
      case TerminalTheme.monokai: return const Color(0xFF49483E);
      case TerminalTheme.dracula: return const Color(0xFF44475A);
      case TerminalTheme.nord: return const Color(0xFF3B4252);
      case TerminalTheme.solarized: return const Color(0xFF073642);
    }
  }
}

class TerminalService extends ChangeNotifier {
  List<TerminalTab> tabs = [];
  List<SSHConnection> savedConnections = [];
  int activeTabIndex = 0;
  bool isSettingsOpen = false;
  double fontSize = 14.0;
  TerminalTheme _currentTheme = TerminalTheme.dark;
  
  TerminalTheme get currentTheme => _currentTheme;
  String get theme => _currentTheme.name;
  
  TerminalService() {
    _init();
  }

  Future<void> _init() async {
    await _loadSettings();
    await _loadSavedConnections();
    _createTab();
  }

  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      fontSize = prefs.getDouble('fontSize') ?? 14.0;
      final themeName = prefs.getString('theme') ?? 'dark';
      _currentTheme = TerminalTheme.values.firstWhere(
        (t) => t.name == themeName,
        orElse: () => TerminalTheme.dark
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading settings: $e');
    }
  }

  Future<void> _saveSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setDouble('fontSize', fontSize);
      await prefs.setString('theme', _currentTheme.name);
    } catch (e) {
      debugPrint('Error saving settings: $e');
    }
  }
  
  Future<void> _loadSavedConnections() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final connectionsJson = prefs.getStringList('savedConnections') ?? [];
      
      savedConnections = connectionsJson
          .map((json) => SSHConnection.fromJson(jsonDecode(json)))
          .toList();
    } catch (e) {
      debugPrint('Error loading saved connections: $e');
    }
  }
  
  Future<void> _saveConnections() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final connectionsJson = savedConnections
          .map((conn) => jsonEncode(conn.toJson()))
          .toList();
      
      await prefs.setStringList('savedConnections', connectionsJson);
    } catch (e) {
      debugPrint('Error saving connections: $e');
    }
  }
  
  Future<void> saveConnection(SSHConnection connection) async {
    // Check if connection with same host and username already exists
    final existingIndex = savedConnections.indexWhere(
      (conn) => conn.host == connection.host && conn.username == connection.username
    );
    
    if (existingIndex >= 0) {
      // Update existing connection
      savedConnections[existingIndex] = connection;
    } else {
      // Add new connection
      savedConnections.add(connection);
    }
    
    await _saveConnections();
    notifyListeners();
  }
  
  void deleteSavedConnection(int index) {
    if (index >= 0 && index < savedConnections.length) {
      savedConnections.removeAt(index);
      _saveConnections();
      notifyListeners();
    }
  }

  void _createTab() {
    final terminal = Terminal(
      maxLines: 10000,
    );
    
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    tabs.add(TerminalTab(
      id: id,
      terminal: terminal,
      title: 'Terminal ${tabs.length + 1}',
    ));
    
    // Simulate welcome message
    terminal.write('Welcome to Gaia Terminal\r\n> ');
    
    activeTabIndex = tabs.length - 1;
    notifyListeners();
  }
  
  Future<bool> startSystemShell() async {
    if (tabs.isEmpty || activeTabIndex >= tabs.length) {
      debugPrint('Cannot start system shell: No active tab available');
      return false;
    }
    
    final currentTab = tabs[activeTabIndex];
    
    // Check if running on web platform
    if (kIsWeb) {
      currentTab.terminal.write('\r\nSystem shell is not available in web mode.\r\n');
      currentTab.terminal.write('Please run the app natively for shell access.\r\n> ');
      return false;
    }
    
    currentTab.terminal.write('\r\nSystem shell feature is ready but not yet available in this version.\r\n');
    currentTab.terminal.write('This feature will be enabled in a future update.\r\n> ');
    
    // Return true to simulate successful connection
    return true;
  }

  void createTab() {
    _createTab();
  }

  void closeTab(int index) {
    if (tabs.length <= 1) return;
    
    tabs.removeAt(index);
    if (activeTabIndex >= tabs.length) {
      activeTabIndex = tabs.length - 1;
    }
    notifyListeners();
  }

  void setActiveTab(int index) {
    if (index >= 0 && index < tabs.length) {
      activeTabIndex = index;
      notifyListeners();
    }
  }

  void toggleSettings() {
    isSettingsOpen = !isSettingsOpen;
    notifyListeners();
  }

  void updateFontSize(double size) {
    fontSize = size;
    _saveSettings();
    notifyListeners();
  }

  void setTheme(String themeName) {
    try {
      _currentTheme = TerminalTheme.values.firstWhere(
        (t) => t.name == themeName,
        orElse: () => _currentTheme
      );
      _saveSettings();
      notifyListeners();
    } catch (e) {
      debugPrint('Error setting theme: $e');
    }
  }
  
  void setThemeByEnum(TerminalTheme newTheme) {
    _currentTheme = newTheme;
    _saveSettings();
    notifyListeners();
  }

  Future<bool> connectSSH(SSHConnection connection) async {
    try {
      if (tabs.isEmpty || activeTabIndex >= tabs.length) {
        debugPrint('Cannot connect SSH: No active tab available');
        return false;
      }
      
      final currentTab = tabs[activeTabIndex];
      currentTab.terminal.write('Connecting to ${connection.host}:${connection.port}...\r\n');
      
      // Use different approaches for web and native platforms
      if (kIsWeb) {
        try {
          // For web, use the WebSocket proxy service
          debugPrint('SSH: Using WebSocket proxy for web-based SSH connection');
          currentTab.terminal.write('SSH_LOG: Using WebSocket proxy for SSH connection on web...\r\n');
          
          // Show user that we're attempting to connect
          debugPrint('SSH: Explaining web SSH limitations for connection to ${connection.host}:${connection.port}');
          currentTab.terminal.write('SSH_LOG: Attempting connection to ${connection.host}:${connection.port}...\r\n');
          
          // Call the connectViaProxy method which will now explain limitations and provide alternatives
          final wsChannel = await SSHProxyService.connectViaProxy(
            terminal: currentTab.terminal,
            host: connection.host, 
            port: connection.port,
            username: connection.username,
            password: connection.password,
          );
          
          if (wsChannel != null) {
            debugPrint('SSH: WebSocket proxy connection successful');
            // Store the WebSocket channel and update tab status
            currentTab.wsChannel = wsChannel;
            currentTab.isConnected = true;
            currentTab.isWebSSH = true;
            currentTab.currentServer = '${connection.username}@${connection.host}';
            
            currentTab.terminal.write('SSH_LOG: Connection established successfully\r\n');
            notifyListeners();
            return true;
          } else {
            debugPrint('SSH: WebSocket proxy connection failed');
            currentTab.terminal.write('SSH_LOG: WebSocket proxy connection failed.\r\n> ');
            return false;
          }
        } catch (e) {
          currentTab.terminal.write('\r\nWebSocket proxy error: $e\r\n> ');
          return false;
        }
      } else {
        // Native platform - Use direct SSH
        try {
          debugPrint('SSH: Using native SSH client for direct connection');
          currentTab.terminal.write('SSH_LOG: Using native SSH client...\r\n');
          
          // Create SSH socket connection
          debugPrint('SSH: Opening socket connection to ${connection.host}:${connection.port}');
          currentTab.terminal.write('SSH_LOG: Opening socket connection...\r\n');
          final socket = await SSHSocket.connect(connection.host, connection.port);
          debugPrint('SSH: Socket connection established');
          
          // Create SSH client
          debugPrint('SSH: Creating SSH client for ${connection.username}');
          final client = SSHClient(
            socket,
            username: connection.username,
            onPasswordRequest: () {
              debugPrint('SSH: Password requested for authentication');
              return connection.password;
            },
          );
          
          currentTab.terminal.write('SSH_LOG: Authenticating...\r\n');
          
          // Start shell session
          debugPrint('SSH: Starting shell session with PTY');
          currentTab.terminal.write('SSH_LOG: Starting shell session...\r\n');
          final session = await client.shell(
            pty: SSHPtyConfig(
              width: 80,
              height: 25,
              type: 'xterm-256color',
            ),
          );
          debugPrint('SSH: Shell session started successfully');
          
          // Store SSH connection info in tab
          currentTab.sshClient = client;
          currentTab.sshSession = session;
          currentTab.currentServer = '${connection.username}@${connection.host}';
          currentTab.isConnected = true;
          currentTab.isWebSSH = false;
          
          // Set up bidirectional data streams
          debugPrint('SSH: Setting up stdout listener');
          session.stdout.listen((data) {
            debugPrint('SSH: Received stdout data (${data.length} bytes)');
            final String output = utf8.decode(data, allowMalformed: true);
            currentTab.terminal.write(output);
          });
          
          debugPrint('SSH: Setting up stderr listener');
          session.stderr.listen((data) {
            debugPrint('SSH: Received stderr data (${data.length} bytes)');
            final String output = utf8.decode(data, allowMalformed: true);
            currentTab.terminal.write('\x1b[31m$output\x1b[0m'); // Show stderr in red
          });
          
          // Handle session close
          debugPrint('SSH: Setting up session close handler');
          session.done.then((_) {
            debugPrint('SSH: Session closed normally');
            currentTab.terminal.write('\r\nSSH_LOG: Connection closed\r\n> ');
            currentTab.isConnected = false;
            currentTab.sshClient = null;
            currentTab.sshSession = null;
            currentTab.currentServer = null;
            notifyListeners();
          }).catchError((e) {
            debugPrint('SSH: Session closed with error: $e');
            currentTab.terminal.write('\r\nSSH_LOG: Connection error: $e\r\n> ');
            currentTab.isConnected = false;
            currentTab.sshClient = null;
            currentTab.sshSession = null;
            currentTab.currentServer = null;
            notifyListeners();
          });
          
          currentTab.terminal.write('SSH_LOG: Connection established successfully\r\n');
          notifyListeners();
          return true;
        } catch (e) {
          debugPrint('SSH: Connection failed: $e');
          currentTab.terminal.write('\r\nSSH_LOG: Connection failed: $e\r\n> ');
          return false;
        }
      }
    } catch (e) {
      debugPrint('SSH connection error: $e');
      
      if (tabs.isNotEmpty && activeTabIndex < tabs.length) {
        tabs[activeTabIndex].terminal.write('\r\nFailed to connect: $e\r\n> ');
      }
      
      return false;
    }
  }

  void sendCommand(String command) {
    if (tabs.isEmpty || activeTabIndex >= tabs.length) {
      debugPrint('Cannot send command: No active tab available');
      return;
    }
    
    final currentTab = tabs[activeTabIndex];
    debugPrint('Sending command: "$command" to tab ${currentTab.title}');
    
    // Handle system shell if active
    if (currentTab.isSystemShell && currentTab.shellProcess != null) {
      debugPrint('Sending command to system shell: $command');
      
      if (!kIsWeb) {
        try {
          // Send the command to the shell process
          // This will only be reached in native builds where the shell is actually working
          currentTab.terminal.write('$command\r\n');
          currentTab.terminal.write('Shell command sent (feature not fully implemented)\r\n> ');
          return;
        } catch (e) {
          debugPrint('Error sending command to system shell: $e');
          currentTab.terminal.write('\r\nError: $e\r\n');
          currentTab.isSystemShell = false;
          return;
        }
      }
    } else if (currentTab.isConnected) {
      debugPrint('Tab is connected, sending SSH command');
      
      // Handle SSH disconnect
      if (command.trim() == 'exit') {
        debugPrint('Exit command detected, closing SSH connection');
        
        // Handle Web SSH
        if (currentTab.isWebSSH && currentTab.wsChannel != null) {
          try {
            // Send exit command to WebSocket
            currentTab.wsChannel!.sink.add('exit\n');
            // Close the WebSocket connection
            currentTab.wsChannel!.sink.close();
            currentTab.wsChannel = null;
            currentTab.isWebSSH = false;
            currentTab.isConnected = false;
            currentTab.terminal.write('\r\nConnection closed\r\n> ');
            notifyListeners();
          } catch (e) {
            debugPrint('Error closing WebSocket SSH: $e');
            currentTab.isConnected = false;
            currentTab.terminal.write('\r\nError closing connection: $e\r\n> ');
          }
        }
        // Handle Native SSH
        else if (currentTab.sshSession != null) {
          try {
            // Send exit command to properly close the remote shell
            currentTab.sshSession!.write(utf8.encode('exit\n'));
            // Actual disconnection will be handled by the session.done handler
          } catch (e) {
            debugPrint('Error closing SSH session: $e');
            currentTab.isConnected = false;
            currentTab.terminal.write('\r\nError closing connection: $e\r\n> ');
          }
        } else {
          // Fallback for simulated sessions
          currentTab.isConnected = false;
          currentTab.terminal.write('Connection closed\r\n> ');
        }
      } else {
        // Web SSH via WebSocket
        if (currentTab.isWebSSH && currentTab.wsChannel != null) {
          try {
            currentTab.wsChannel!.sink.add('$command\n');
          } catch (e) {
            debugPrint('Error sending WebSocket command: $e');
            currentTab.terminal.write('\r\nError sending command: $e\r\n');
          }
        }
        // Native SSH via SSH client
        else if (currentTab.sshSession != null) {
          try {
            currentTab.sshSession!.write(utf8.encode('$command\n'));
          } catch (e) {
            debugPrint('Error sending SSH command: $e');
            currentTab.terminal.write('\r\nError sending command: $e\r\n');
          }
        } else {
          // Fallback to simulation if no real session is available
          debugPrint('No SSH session found, simulating response');
          currentTab.terminal.write('$command\r\n');
          _simulateSSHCommandResponse(currentTab.terminal, command);
        }
      }
    } else {
      // Check for special commands
      if (command.trim() == 'shell') {
        // Start system shell
        startSystemShell();
        return;
      }
      
      // Local command processing
      debugPrint('Tab is not connected, handling local command');
      currentTab.terminal.write('$command\r\n');
      _simulateCommandResponse(currentTab.terminal, command);
    }
    
    notifyListeners();
  }
  
  void _simulateSSHCommandResponse(Terminal terminal, String command) {
    // Simulate SSH command responses
    if (command.trim() == 'ls') {
      terminal.write('Documents  Downloads  Pictures  Videos  projects\r\n\$ ');
    } else if (command.trim() == 'pwd') {
      terminal.write('/home/user\r\n\$ ');
    } else if (command.trim() == 'whoami') {
      terminal.write('user\r\n\$ ');
    } else if (command.trim() == 'date') {
      final now = DateTime.now();
      terminal.write('${now.toString()}\r\n\$ ');
    } else if (command.trim().startsWith('echo ')) {
      final echoText = command.substring(5);
      terminal.write('$echoText\r\n\$ ');
    } else if (command.trim() == '') {
      terminal.write('\$ ');
    } else {
      terminal.write('$command: command not found\r\n\$ ');
    }
  }

  void _simulateCommandResponse(Terminal terminal, String command) {
    // Simple command simulation for demo purposes
    if (command.trim() == 'clear') {
      // Clear terminal by writing escape sequence instead of using terminal.clear()
      terminal.write('\x1b[2J\x1b[H');
    } else if (command.trim() == 'help') {
      terminal.write('Available commands: help, clear, echo, date, shell, ssh, install\r\n');
      terminal.write('Type "shell" to start a real system shell\r\n');
      terminal.write('Type "ssh user@host" to connect to SSH server\r\n');
      terminal.write('Type "install" for native installation instructions\r\n> ');
    } else if (command.trim() == 'install') {
      terminal.write('Native Installation Instructions:\r\n\r\n');
      terminal.write('To install Gaia Terminal natively and get full SSH support:\r\n\r\n');
      terminal.write('1. Clone the repo:\r\n');
      terminal.write('   git clone https://github.com/yourusername/gaia-terminal.git\r\n\r\n');
      terminal.write('2. Install Flutter:\r\n');
      terminal.write('   https://flutter.dev/docs/get-started/install\r\n\r\n');
      terminal.write('3. Run for your platform:\r\n');
      terminal.write('   cd gaia-terminal/gaia_terminal\r\n');
      terminal.write('   flutter run -d macos  # Also: windows, linux, android, ios\r\n\r\n');
      terminal.write('For more details, see the README.md file in the repository.\r\n> ');
    } else if (command.trim().startsWith('ssh ')) {
      // Parse SSH command
      final parts = command.trim().split(' ');
      if (parts.length < 2) {
        terminal.write('Usage: ssh user@host[:port] [password]\r\n');
        terminal.write('\r\nPublic Test Servers:\r\n');
        terminal.write('  ssh demo@test.rebex.net demo       (Rebex test SSH server)\r\n');
        terminal.write('  ssh test@sdf.org                   (SDF Public SSH server)\r\n');
        terminal.write('  ssh demo@shell.xshellz.com demo    (xShellz free trial)\r\n');
        terminal.write('\r\nExamples:\r\n');
        terminal.write('  ssh user@example.com:2222 password\r\n');
        terminal.write('  ssh git@github.com\r\n');
        
        // If we're in web mode, add a note about browser limitations
        if (kIsWeb) {
          terminal.write('\r\nNOTE: In web browsers, SSH connections use a proxy server.\r\n');
          terminal.write('For direct connections, run this app natively on desktop/mobile.\r\n');
        }
        
        terminal.write('> ');
        return;
      }
      
      final connectionPart = parts[1];
      final password = parts.length > 2 ? parts[2] : '';
      
      // Parse user@host:port format
      String username = '';
      String host = '';
      int port = 22;
      
      if (connectionPart.contains('@')) {
        final userHost = connectionPart.split('@');
        username = userHost[0];
        
        if (userHost[1].contains(':')) {
          final hostPort = userHost[1].split(':');
          host = hostPort[0];
          port = int.tryParse(hostPort[1]) ?? 22;
        } else {
          host = userHost[1];
        }
      } else {
        terminal.write('Usage: ssh user@host[:port] [password]\r\n> ');
        return;
      }
      
      // Create SSH connection object
      final connection = SSHConnection(
        host: host,
        port: port,
        username: username,
        password: password,
      );
      
      // Connect to SSH server
      terminal.write('Attempting to connect to $username@$host:$port...\r\n');
      connectSSH(connection);
    } else if (command.trim().startsWith('echo ')) {
      final echoText = command.substring(5);
      terminal.write('$echoText\r\n> ');
    } else if (command.trim() == 'date') {
      final now = DateTime.now();
      terminal.write('${now.toString()}\r\n> ');
    } else if (command.trim() == '') {
      terminal.write('> ');
    } else {
      terminal.write('Command not found: $command\r\n> ');
    }
  }
}