import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xterm/xterm.dart';
import 'package:dartssh2/dartssh2.dart';

// Import local services
import 'ssh_proxy_service.dart';

/// Split direction for terminal panes
enum SplitDirection {
  horizontal,  // Split left and right
  vertical     // Split top and bottom
}

/// A terminal instance containing all state related to a single terminal
class TerminalInstance {
  final String id;
  final Terminal terminal;
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
  
  // Command history
  final List<String> commandHistory = [];
  int historyIndex = 0;
  
  TerminalInstance({
    required this.id,
    required this.terminal,
    this.isConnected = false,
    this.shellProcess,
    this.isSystemShell = false,
    this.sshClient,
    this.sshSession,
    this.currentServer,
    this.wsChannel,
    this.isWebSSH = false,
  });
  
  // Add a command to history
  void addToHistory(String command) {
    if (command.trim().isNotEmpty) {
      // Don't add if it's the same as the last command
      if (commandHistory.isEmpty || commandHistory.last != command) {
        commandHistory.add(command);
      }
      // Reset history index to the end
      historyIndex = commandHistory.length;
    }
  }
  
  // Get previous command from history
  String? getPreviousCommand() {
    if (commandHistory.isEmpty || historyIndex <= 0) {
      return null;
    }
    historyIndex--;
    return commandHistory[historyIndex];
  }
  
  // Get next command from history
  String? getNextCommand() {
    if (commandHistory.isEmpty || historyIndex >= commandHistory.length - 1) {
      return null;
    }
    historyIndex++;
    return commandHistory[historyIndex];
  }
}

/// A terminal pane that can contain a terminal or be split into two sub-panes
class TerminalPane {
  final String id;
  TerminalInstance? instance;
  
  // Split properties
  bool isSplit = false;
  SplitDirection? splitDirection;
  TerminalPane? firstPane;
  TerminalPane? secondPane;
  double splitRatio = 0.5; // Between 0.0 and 1.0
  
  TerminalPane({
    required this.id,
    this.instance,
  });
  
  // Create a split pane
  void split(SplitDirection direction) {
    if (isSplit || instance == null) return;
    
    // Create two new panes
    firstPane = TerminalPane(
      id: '${id}_1',
      instance: instance,
    );
    
    // Create a new terminal instance for the second pane
    final newTerminal = Terminal();
    final newInstance = TerminalInstance(
      id: '${id}_2_instance',
      terminal: newTerminal,
    );
    
    secondPane = TerminalPane(
      id: '${id}_2',
      instance: newInstance,
    );
    
    // Update split properties
    splitDirection = direction;
    isSplit = true;
    instance = null; // Remove the instance from this pane since it's now in firstPane
  }
  
  // Close a split pane and move content up
  void unsplit(bool keepFirst) {
    if (!isSplit || firstPane == null || secondPane == null) return;
    
    // Keep either the first or second pane's content
    instance = keepFirst ? firstPane!.instance : secondPane!.instance;
    
    // Clear split properties
    firstPane = null;
    secondPane = null;
    splitDirection = null;
    isSplit = false;
  }
}

/// Tab containing terminal panes - a tab can have a single pane or multiple split panes
class TerminalTab {
  final String id;
  String title;
  TerminalPane rootPane;
  
  TerminalTab({
    required this.id,
    required this.title,
    required TerminalInstance initialInstance,
  }) : rootPane = TerminalPane(
        id: '${id}_root',
        instance: initialInstance,
      );
  
  // Get the active terminal instance(s) in this tab
  List<TerminalInstance> getAllInstances() {
    return _collectInstances(rootPane);
  }
  
  // Helper to recursively collect all instances
  List<TerminalInstance> _collectInstances(TerminalPane pane) {
    if (!pane.isSplit) {
      return pane.instance != null ? [pane.instance!] : [];
    }
    
    final List<TerminalInstance> instances = [];
    if (pane.firstPane != null) {
      instances.addAll(_collectInstances(pane.firstPane!));
    }
    if (pane.secondPane != null) {
      instances.addAll(_collectInstances(pane.secondPane!));
    }
    return instances;
  }
  
  // Check if this tab has a terminal connected to SSH or system shell
  bool get hasConnectedTerminal {
    return getAllInstances().any((instance) => instance.isConnected);
  }
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

// Helper class for finding parent pane
class _ParentPaneResult {
  final TerminalPane parentPane;
  final bool isFirstChild;
  
  _ParentPaneResult(this.parentPane, this.isFirstChild);
}

class TerminalService extends ChangeNotifier {
  List<TerminalTab> tabs = [];
  List<SSHConnection> savedConnections = [];
  int activeTabIndex = 0;
  bool isSettingsOpen = false;
  double fontSize = 14.0;
  TerminalTheme _currentTheme = TerminalTheme.dark;
  
  // Focus tracking for split panes
  String? _activeInstanceId;
  bool _isSplitDragInProgress = false;
  
  TerminalTheme get currentTheme => _currentTheme;
  String get theme => _currentTheme.name;
  String? get activeInstanceId => _activeInstanceId;
  bool get isSplitDragInProgress => _isSplitDragInProgress;
  
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
    final instanceId = '${id}_instance';
    
    // Create terminal instance
    final instance = TerminalInstance(
      id: instanceId,
      terminal: terminal,
    );
    
    // Create terminal tab with the instance
    final tab = TerminalTab(
      id: id,
      title: 'Terminal ${tabs.length + 1}',
      initialInstance: instance,
    );
    
    tabs.add(tab);
    
    // Set as active instance
    _activeInstanceId = instanceId;
    
    // Simulate welcome message
    terminal.write('Welcome to Gaia Terminal\r\n');
    terminal.write('Type "help" for available commands\r\n> ');
    
    activeTabIndex = tabs.length - 1;
    notifyListeners();
  }
  
  // Split the active terminal pane
  void splitTerminal(SplitDirection direction) {
    if (tabs.isEmpty || activeTabIndex >= tabs.length) return;
    
    final currentTab = tabs[activeTabIndex];
    
    // Find the pane containing the active instance
    TerminalPane? paneToSplit = _findPaneWithInstanceId(
      currentTab.rootPane, 
      _activeInstanceId
    );
    
    if (paneToSplit != null && !paneToSplit.isSplit) {
      paneToSplit.split(direction);
      
      // Initialize the new terminal
      final newInstance = paneToSplit.secondPane!.instance!;
      newInstance.terminal.write('Welcome to Gaia Terminal\r\n');
      newInstance.terminal.write('Type "help" for available commands\r\n> ');
      
      // Set the new pane's instance as active
      _activeInstanceId = newInstance.id;
      
      notifyListeners();
    }
  }
  
  // Close a split and keep either the first or second pane
  void closeSplit(bool keepFirst) {
    if (tabs.isEmpty || activeTabIndex >= tabs.length) return;
    
    final currentTab = tabs[activeTabIndex];
    
    // Find the parent pane of the active instance
    final parentResult = _findParentOfInstanceId(
      null, 
      currentTab.rootPane, 
      _activeInstanceId
    );
    
    if (parentResult != null) {
      parentResult.parentPane.unsplit(keepFirst);
      
      // Update active instance
      if (parentResult.parentPane.instance != null) {
        _activeInstanceId = parentResult.parentPane.instance!.id;
      }
      
      notifyListeners();
    }
  }
  
  // Update split ratio
  void updateSplitRatio(double newRatio) {
    if (tabs.isEmpty || activeTabIndex >= tabs.length) return;
    
    final currentTab = tabs[activeTabIndex];
    
    // Find the parent pane of the active instance
    final parentResult = _findParentOfInstanceId(
      null, 
      currentTab.rootPane, 
      _activeInstanceId
    );
    
    if (parentResult != null && parentResult.parentPane.isSplit) {
      _isSplitDragInProgress = true;
      parentResult.parentPane.splitRatio = newRatio.clamp(0.1, 0.9);
      notifyListeners();
    }
  }
  
  // Finish split drag operation
  void endSplitDrag() {
    _isSplitDragInProgress = false;
    notifyListeners();
  }
  
  // Set the active terminal instance
  void setActiveInstance(String instanceId) {
    _activeInstanceId = instanceId;
    notifyListeners();
  }
  
  // Helper to find a pane by instance ID
  TerminalPane? _findPaneWithInstanceId(TerminalPane pane, String? instanceId) {
    if (instanceId == null) return null;
    
    // Check if this pane has the instance
    if (!pane.isSplit && pane.instance?.id == instanceId) {
      return pane;
    }
    
    // Search in child panes if split
    if (pane.isSplit) {
      final firstResult = pane.firstPane != null
          ? _findPaneWithInstanceId(pane.firstPane!, instanceId)
          : null;
      
      if (firstResult != null) return firstResult;
      
      return pane.secondPane != null
          ? _findPaneWithInstanceId(pane.secondPane!, instanceId)
          : null;
    }
    
    return null;
  }
  
  // Helper to find parent pane of an instance
  _ParentPaneResult? _findParentOfInstanceId(
    TerminalPane? parent,
    TerminalPane pane,
    String? instanceId
  ) {
    if (instanceId == null) return null;
    
    // Check if this is the pane we're looking for
    if (!pane.isSplit && pane.instance?.id == instanceId) {
      return parent != null ? _ParentPaneResult(parent, parent.firstPane == pane) : null;
    }
    
    // Check child panes if this is a split pane
    if (pane.isSplit) {
      if (pane.firstPane != null) {
        final firstResult = _findParentOfInstanceId(pane, pane.firstPane!, instanceId);
        if (firstResult != null) return firstResult;
      }
      
      if (pane.secondPane != null) {
        final secondResult = _findParentOfInstanceId(pane, pane.secondPane!, instanceId);
        if (secondResult != null) return secondResult;
      }
    }
    
    return null;
  }
  
  Future<bool> startSystemShell() async {
    if (tabs.isEmpty || activeTabIndex >= tabs.length || _activeInstanceId == null) {
      debugPrint('Cannot start system shell: No active terminal instance available');
      return false;
    }
    
    // Find the active terminal instance
    final currentTab = tabs[activeTabIndex];
    final pane = _findPaneWithInstanceId(currentTab.rootPane, _activeInstanceId);
    
    if (pane == null || pane.instance == null) {
      debugPrint('Cannot start system shell: Active instance not found');
      return false;
    }
    
    final instance = pane.instance!;
    
    // Check if running on web platform
    if (kIsWeb) {
      instance.terminal.write('\r\nSystem shell is not available in web mode.\r\n');
      instance.terminal.write('Please run the app natively for shell access.\r\n> ');
      return false;
    }
    
    instance.terminal.write('\r\nSystem shell feature is ready but not yet available in this version.\r\n');
    instance.terminal.write('This feature will be enabled in a future update.\r\n> ');
    
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
      if (tabs.isEmpty || activeTabIndex >= tabs.length || _activeInstanceId == null) {
        debugPrint('Cannot connect SSH: No active terminal instance available');
        return false;
      }
      
      // Find the active terminal instance
      final currentTab = tabs[activeTabIndex];
      final pane = _findPaneWithInstanceId(currentTab.rootPane, _activeInstanceId);
      
      if (pane == null || pane.instance == null) {
        debugPrint('Cannot connect SSH: Active instance not found');
        return false;
      }
      
      final instance = pane.instance!;
      instance.terminal.write('Connecting to ${connection.host}:${connection.port}...\r\n');
      
      // Use different approaches for web and native platforms
      if (kIsWeb) {
        try {
          // For web, use the WebSocket proxy service
          debugPrint('SSH: Using WebSocket proxy for web-based SSH connection');
          instance.terminal.write('SSH_LOG: Using WebSocket proxy for SSH connection on web...\r\n');
          
          // Show user that we're attempting to connect
          debugPrint('SSH: Explaining web SSH limitations for connection to ${connection.host}:${connection.port}');
          instance.terminal.write('SSH_LOG: Attempting connection to ${connection.host}:${connection.port}...\r\n');
          
          // Call the connectViaProxy method which will now explain limitations and provide alternatives
          final wsChannel = await SSHProxyService.connectViaProxy(
            terminal: instance.terminal,
            host: connection.host, 
            port: connection.port,
            username: connection.username,
            password: connection.password,
          );
          
          if (wsChannel != null) {
            debugPrint('SSH: WebSocket proxy connection successful');
            // Store the WebSocket channel and update instance status
            instance.wsChannel = wsChannel;
            instance.isConnected = true;
            instance.isWebSSH = true;
            instance.currentServer = '${connection.username}@${connection.host}';
            
            instance.terminal.write('SSH_LOG: Connection established successfully\r\n');
            notifyListeners();
            return true;
          } else {
            debugPrint('SSH: WebSocket proxy connection failed');
            instance.terminal.write('SSH_LOG: WebSocket proxy connection failed.\r\n> ');
            return false;
          }
        } catch (e) {
          instance.terminal.write('\r\nWebSocket proxy error: $e\r\n> ');
          return false;
        }
      } else {
        // Native platform - Use direct SSH
        try {
          debugPrint('SSH: Using native SSH client for direct connection');
          instance.terminal.write('SSH_LOG: Using native SSH client...\r\n');
          
          // Create SSH socket connection
          debugPrint('SSH: Opening socket connection to ${connection.host}:${connection.port}');
          instance.terminal.write('SSH_LOG: Opening socket connection...\r\n');
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
          
          instance.terminal.write('SSH_LOG: Authenticating...\r\n');
          
          // Start shell session
          debugPrint('SSH: Starting shell session with PTY');
          instance.terminal.write('SSH_LOG: Starting shell session...\r\n');
          final session = await client.shell(
            pty: SSHPtyConfig(
              width: 80,
              height: 25,
              type: 'xterm-256color',
            ),
          );
          debugPrint('SSH: Shell session started successfully');
          
          // Store SSH connection info in instance
          instance.sshClient = client;
          instance.sshSession = session;
          instance.currentServer = '${connection.username}@${connection.host}';
          instance.isConnected = true;
          instance.isWebSSH = false;
          
          // Set up bidirectional data streams
          debugPrint('SSH: Setting up stdout listener');
          session.stdout.listen((data) {
            debugPrint('SSH: Received stdout data (${data.length} bytes)');
            final String output = utf8.decode(data, allowMalformed: true);
            instance.terminal.write(output);
          });
          
          debugPrint('SSH: Setting up stderr listener');
          session.stderr.listen((data) {
            debugPrint('SSH: Received stderr data (${data.length} bytes)');
            final String output = utf8.decode(data, allowMalformed: true);
            instance.terminal.write('\x1b[31m$output\x1b[0m'); // Show stderr in red
          });
          
          // Handle session close
          debugPrint('SSH: Setting up session close handler');
          session.done.then((_) {
            debugPrint('SSH: Session closed normally');
            instance.terminal.write('\r\nSSH_LOG: Connection closed\r\n> ');
            instance.isConnected = false;
            instance.sshClient = null;
            instance.sshSession = null;
            instance.currentServer = null;
            notifyListeners();
          }).catchError((e) {
            debugPrint('SSH: Session closed with error: $e');
            instance.terminal.write('\r\nSSH_LOG: Connection error: $e\r\n> ');
            instance.isConnected = false;
            instance.sshClient = null;
            instance.sshSession = null;
            instance.currentServer = null;
            notifyListeners();
          });
          
          instance.terminal.write('SSH_LOG: Connection established successfully\r\n');
          notifyListeners();
          return true;
        } catch (e) {
          debugPrint('SSH: Connection failed: $e');
          instance.terminal.write('\r\nSSH_LOG: Connection failed: $e\r\n> ');
          return false;
        }
      }
    } catch (e) {
      debugPrint('SSH connection error: $e');
      
      if (tabs.isNotEmpty && activeTabIndex < tabs.length && _activeInstanceId != null) {
        final currentTab = tabs[activeTabIndex];
        final pane = _findPaneWithInstanceId(currentTab.rootPane, _activeInstanceId);
        
        if (pane != null && pane.instance != null) {
          pane.instance!.terminal.write('\r\nFailed to connect: $e\r\n> ');
        }
      }
      
      return false;
    }
  }

  void sendCommand(String command) {
    if (tabs.isEmpty || activeTabIndex >= tabs.length || _activeInstanceId == null) {
      debugPrint('Cannot send command: No active terminal instance available');
      return;
    }
    
    // Find the active terminal instance
    final currentTab = tabs[activeTabIndex];
    final pane = _findPaneWithInstanceId(currentTab.rootPane, _activeInstanceId);
    
    if (pane == null || pane.instance == null) {
      debugPrint('Cannot send command: Active instance not found');
      return;
    }
    
    final instance = pane.instance!;
    debugPrint('Sending command: "$command" to instance ${instance.id}');
    
    // Add to command history
    instance.addToHistory(command);
    
    // Handle system shell if active
    if (instance.isSystemShell && instance.shellProcess != null) {
      debugPrint('Sending command to system shell: $command');
      
      if (!kIsWeb) {
        try {
          // Send the command to the shell process
          // This will only be reached in native builds where the shell is actually working
          instance.terminal.write('$command\r\n');
          instance.terminal.write('Shell command sent (feature not fully implemented)\r\n> ');
          return;
        } catch (e) {
          debugPrint('Error sending command to system shell: $e');
          instance.terminal.write('\r\nError: $e\r\n');
          instance.isSystemShell = false;
          return;
        }
      }
    } else if (instance.isConnected) {
      debugPrint('Instance is connected, sending SSH command');
      
      // Handle SSH disconnect
      if (command.trim() == 'exit') {
        debugPrint('Exit command detected, closing SSH connection');
        
        // Handle Web SSH
        if (instance.isWebSSH && instance.wsChannel != null) {
          try {
            // Send exit command to WebSocket
            instance.wsChannel!.sink.add('exit\n');
            // Close the WebSocket connection
            instance.wsChannel!.sink.close();
            instance.wsChannel = null;
            instance.isWebSSH = false;
            instance.isConnected = false;
            instance.terminal.write('\r\nConnection closed\r\n> ');
            notifyListeners();
          } catch (e) {
            debugPrint('Error closing WebSocket SSH: $e');
            instance.isConnected = false;
            instance.terminal.write('\r\nError closing connection: $e\r\n> ');
          }
        }
        // Handle Native SSH
        else if (instance.sshSession != null) {
          try {
            // Send exit command to properly close the remote shell
            instance.sshSession!.write(utf8.encode('exit\n'));
            // Actual disconnection will be handled by the session.done handler
          } catch (e) {
            debugPrint('Error closing SSH session: $e');
            instance.isConnected = false;
            instance.terminal.write('\r\nError closing connection: $e\r\n> ');
          }
        } else {
          // Fallback for simulated sessions
          instance.isConnected = false;
          instance.terminal.write('Connection closed\r\n> ');
        }
      } else {
        // Web SSH via WebSocket
        if (instance.isWebSSH && instance.wsChannel != null) {
          try {
            instance.wsChannel!.sink.add('$command\n');
          } catch (e) {
            debugPrint('Error sending WebSocket command: $e');
            instance.terminal.write('\r\nError sending command: $e\r\n');
          }
        }
        // Native SSH via SSH client
        else if (instance.sshSession != null) {
          try {
            instance.sshSession!.write(utf8.encode('$command\n'));
          } catch (e) {
            debugPrint('Error sending SSH command: $e');
            instance.terminal.write('\r\nError sending command: $e\r\n');
          }
        } else {
          // Fallback to simulation if no real session is available
          debugPrint('No SSH session found, simulating response');
          instance.terminal.write('$command\r\n');
          _simulateSSHCommandResponse(instance.terminal, command);
        }
      }
    } else {
      // Check for special commands
      if (command.trim() == 'split-h') {
        // Split horizontally
        splitTerminal(SplitDirection.horizontal);
        return;
      } else if (command.trim() == 'split-v') {
        // Split vertically
        splitTerminal(SplitDirection.vertical);
        return;
      } else if (command.trim() == 'unsplit') {
        // Close split
        closeSplit(true);
        return;
      } else if (command.trim() == 'shell') {
        // Start system shell
        startSystemShell();
        return;
      }
      
      // Local command processing
      debugPrint('Instance is not connected, handling local command');
      instance.terminal.write('$command\r\n');
      _simulateCommandResponse(instance.terminal, command);
    }
    
    notifyListeners();
  }
  
  // Navigate terminal history up (previous command)
  String? navigateHistoryUp() {
    if (tabs.isEmpty || activeTabIndex >= tabs.length || _activeInstanceId == null) {
      return null;
    }
    
    // Find the active terminal instance
    final currentTab = tabs[activeTabIndex];
    final pane = _findPaneWithInstanceId(currentTab.rootPane, _activeInstanceId);
    
    if (pane == null || pane.instance == null) {
      return null;
    }
    
    return pane.instance!.getPreviousCommand();
  }
  
  // Navigate terminal history down (next command)
  String? navigateHistoryDown() {
    if (tabs.isEmpty || activeTabIndex >= tabs.length || _activeInstanceId == null) {
      return null;
    }
    
    // Find the active terminal instance
    final currentTab = tabs[activeTabIndex];
    final pane = _findPaneWithInstanceId(currentTab.rootPane, _activeInstanceId);
    
    if (pane == null || pane.instance == null) {
      return null;
    }
    
    return pane.instance!.getNextCommand();
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
      terminal.write('Available commands: help, clear, echo, date, shell, ssh, install, split-h, split-v, unsplit\r\n');
      terminal.write('Type "shell" to start a real system shell\r\n');
      terminal.write('Type "ssh user@host" to connect to SSH server\r\n');
      terminal.write('Type "split-h" or "split-v" to split the terminal horizontally or vertically\r\n');
      terminal.write('Type "unsplit" to close the current split\r\n');
      terminal.write('Type "install" for native installation instructions\r\n> ');
    } else if (command.trim() == 'install') {
      terminal.write('Native Installation Instructions:\r\n\r\n');
      terminal.write('To install Gaia Terminal natively and get full SSH support:\r\n\r\n');
      terminal.write('1. Clone the repo:\r\n');
      terminal.write('   git clone https://github.com/yourusername/gaia-terminal.git\r\n\r\n');
      terminal.write('2. Install Flutter:\r\n');
      terminal.write('   https://flutter.dev/docs/get-started/install\r\n\r\n');
      terminal.write('3. Run for your platform:\r\n');
      terminal.write('   cd gaia-terminal\r\n');
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