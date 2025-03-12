import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:xterm/xterm.dart';

/// A service that allows connecting to SSH servers from web browsers
/// using a WebSocket proxy server
class SSHProxyService {
  // Web-based SSH client alternatives
  static final List<Map<String, String>> webSshServices = [
    {'name': 'shell.hop.sh', 'url': 'https://shell.hop.sh/'},
    {'name': 'shellngn.com', 'url': 'https://www.shellngn.com/'},
    {'name': 'WebSSH.dev', 'url': 'https://webssh.dev/'},
    {'name': 'sshweb.de', 'url': 'https://www.sshweb.de/'}
  ];
  
  // Public test SSH servers for trying connections
  static final List<Map<String, String>> testSshServers = [
    {'name': 'Rebex SSH Demo', 'host': 'test.rebex.net', 'user': 'demo', 'password': 'demo', 'info': 'Demo SSH server from Rebex'},
    {'name': 'SDF Public Access', 'host': 'sdf.org', 'user': 'new', 'password': '(create account)', 'info': 'Public Unix server'},
  ];
  
  /// Explains why SSH connections are not directly supported in web browsers
  /// and suggests alternatives
  static Future<WebSocketChannel?> connectViaProxy({
    required Terminal terminal,
    required String host,
    required int port,
    required String username,
    required String password,
    String? proxyUrl,
  }) async {
    // Log attempt
    debugPrint('SSH_PROXY: Web SSH connection attempt to $username@$host:$port');
    
    // Inform the user about browser limitations
    terminal.write('\r\n');
    terminal.write('SSH_INFO: Unable to establish SSH connection from web browser.\r\n');
    terminal.write('SSH_INFO: Browser security restricts direct TCP socket connections.\r\n\r\n');
    
    // Suggestions for alternatives
    terminal.write('ALTERNATIVES:\r\n\r\n');
    
    // Option 1: Use dedicated web SSH clients
    terminal.write('1. Use a web-based SSH client:\r\n');
    for (var service in webSshServices) {
      terminal.write('   - ${service['name']}: ${service['url']}\r\n');
    }
    terminal.write('\r\n');
    
    // Option 2: Run the app natively
    terminal.write('2. Run this terminal app natively (recommended):\r\n');
    terminal.write('   - Install on macOS, Windows, Linux, iOS, or Android\r\n');
    terminal.write('   - Full SSH support with direct connections\r\n\r\n');
    
    // Option 3: Try hosted SSH servers (for testing)
    terminal.write('3. Test with public SSH servers:\r\n');
    for (var server in testSshServers) {
      terminal.write('   - ${server['name']}: ssh ${server['user']}@${server['host']} (Password: ${server['password']})\r\n');
    }
    
    // Closing instructions
    terminal.write('\r\nTo try again, use the "ssh" command with a different server.\r\n');
    terminal.write('For native installation instructions, type "install".\r\n> ');
    
    // No WebSocket connection is returned
    return null;
  }
  
  /// Send command to the SSH server via WebSocket
  static void sendCommand(WebSocketChannel? channel, String command) {
    if (channel != null) {
      try {
        debugPrint('SSH_PROXY: Sending command: "$command"');
        channel.sink.add('$command\n');
      } catch (e) {
        debugPrint('SSH_PROXY: Error sending command: $e');
      }
    } else {
      debugPrint('SSH_PROXY: Cannot send command - WebSocket channel is null');
    }
  }
  
  /// Close the WebSocket connection
  static void disconnect(WebSocketChannel? channel) {
    if (channel != null) {
      try {
        debugPrint('SSH_PROXY: Closing WebSocket connection');
        channel.sink.close();
        debugPrint('SSH_PROXY: WebSocket connection closed successfully');
      } catch (e) {
        debugPrint('SSH_PROXY: Error closing WebSocket: $e');
      }
    } else {
      debugPrint('SSH_PROXY: Cannot disconnect - WebSocket channel is null');
    }
  }
}