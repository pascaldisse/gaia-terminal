import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xterm/xterm.dart';

class TerminalTab {
  final String id;
  final Terminal terminal;
  String title;
  bool isConnected;

  TerminalTab({
    required this.id,
    required this.terminal,
    required this.title,
    this.isConnected = false,
  });
}

class SSHConnection {
  final String host;
  final int port;
  final String username;
  final String password;
  WebSocketChannel? channel;

  SSHConnection({
    required this.host,
    required this.port,
    required this.username,
    required this.password,
  });
}

class TerminalService extends ChangeNotifier {
  List<TerminalTab> tabs = [];
  int activeTabIndex = 0;
  bool isSettingsOpen = false;
  double fontSize = 14.0;
  String theme = 'dark';
  
  TerminalService() {
    _init();
  }

  Future<void> _init() async {
    _loadSettings();
    _createTab();
  }

  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      fontSize = prefs.getDouble('fontSize') ?? 14.0;
      theme = prefs.getString('theme') ?? 'dark';
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading settings: $e');
    }
  }

  Future<void> _saveSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setDouble('fontSize', fontSize);
      await prefs.setString('theme', theme);
    } catch (e) {
      debugPrint('Error saving settings: $e');
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

  void setTheme(String newTheme) {
    theme = newTheme;
    _saveSettings();
    notifyListeners();
  }

  Future<bool> connectSSH(SSHConnection connection) async {
    try {
      // In a real implementation, this would establish an SSH connection
      // via a WebSocket that connects to a backend service
      final uri = Uri.parse('ws://${connection.host}:${connection.port}/ssh');
      connection.channel = WebSocketChannel.connect(uri);
      
      // Send authentication data
      final authData = {
        'type': 'auth',
        'username': connection.username,
        'password': connection.password,
      };
      
      connection.channel!.sink.add(jsonEncode(authData));
      
      // Set up message handling
      connection.channel!.stream.listen(
        (dynamic message) {
          if (tabs.isNotEmpty && activeTabIndex < tabs.length) {
            final currentTab = tabs[activeTabIndex];
            currentTab.terminal.write(message.toString());
            currentTab.isConnected = true;
            notifyListeners();
          }
        },
        onDone: () {
          if (tabs.isNotEmpty && activeTabIndex < tabs.length) {
            final currentTab = tabs[activeTabIndex];
            currentTab.isConnected = false;
            currentTab.terminal.write('\r\nConnection closed\r\n> ');
            notifyListeners();
          }
        },
        onError: (error) {
          if (tabs.isNotEmpty && activeTabIndex < tabs.length) {
            final currentTab = tabs[activeTabIndex];
            currentTab.isConnected = false;
            currentTab.terminal.write('\r\nConnection error: $error\r\n> ');
            notifyListeners();
          }
        },
      );
      
      return true;
    } catch (e) {
      debugPrint('SSH connection error: $e');
      
      if (tabs.isNotEmpty && activeTabIndex < tabs.length) {
        tabs[activeTabIndex].terminal.write('\r\nFailed to connect: $e\r\n> ');
      }
      
      return false;
    }
  }

  void sendCommand(String command) {
    if (tabs.isEmpty || activeTabIndex >= tabs.length) return;
    
    final currentTab = tabs[activeTabIndex];
    
    if (currentTab.isConnected && currentTab.terminal != null) {
      // Send command to SSH connection
      // In a real implementation, this would be sent over the WebSocket
      
      // Echo command locally
      currentTab.terminal.write('$command\r\n');
      
      // Simulate response (in a real app, response would come from the server)
      _simulateCommandResponse(currentTab.terminal, command);
    } else {
      // Local command processing
      currentTab.terminal.write('$command\r\n');
      _simulateCommandResponse(currentTab.terminal, command);
    }
    
    notifyListeners();
  }

  void _simulateCommandResponse(Terminal terminal, String command) {
    // Simple command simulation for demo purposes
    if (command.trim() == 'clear') {
      terminal.clear();
    } else if (command.trim() == 'help') {
      terminal.write('Available commands: help, clear, echo, date\r\n> ');
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