import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:xterm/xterm.dart';
import '../services/terminal_service.dart';
import '../services/sftp_service.dart';
import 'ssh_dialog.dart';
import 'sftp/sftp_browser.dart';

class TerminalToolbar extends StatelessWidget {
  const TerminalToolbar({super.key});

  @override
  Widget build(BuildContext context) {
    final terminalService = Provider.of<TerminalService>(context);
    
    return Container(
      height: 50,
      color: Colors.grey[900],
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          const Text(
            'Gaia Terminal',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.computer, color: Colors.white),
            onPressed: () => _showSSHDialog(context),
            tooltip: 'SSH Connection',
          ),
          IconButton(
            icon: const Icon(Icons.folder, color: Colors.white),
            onPressed: () => _showSftpBrowser(context, terminalService),
            tooltip: 'SFTP Browser',
          ),
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: () => terminalService.toggleSettings(),
            tooltip: 'Settings',
          ),
        ],
      ),
    );
  }

  void _showSSHDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const SSHDialog(),
    );
  }
  
  void _showSftpBrowser(BuildContext context, TerminalService terminalService) {
    if (terminalService.tabs.isEmpty || terminalService.activeTabIndex >= terminalService.tabs.length) {
      _showErrorSnackBar(context, 'No active terminal tab');
      return;
    }
    
    final currentTab = terminalService.tabs[terminalService.activeTabIndex];
    final instances = currentTab.getAllInstances();
    
    // Find connected SSH instance
    final sshInstance = instances.firstWhere(
      (instance) => instance.isConnected && instance.sshClient != null,
      orElse: () => TerminalInstance(
        id: 'dummy',
        terminal: Terminal(maxLines: 1000),
      ),
    );
    
    if (sshInstance.sshClient == null) {
      _showErrorSnackBar(context, 'No active SSH connection');
      return;
    }
    
    // Initialize SFTP service
    final sftpService = SftpService();
    
    // Show dialog with loading state
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Initializing SFTP'),
        content: const Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 16),
            Text('Connecting to SFTP server...'),
          ],
        ),
      ),
    );
    
    // Initialize SFTP
    sftpService.initialize(sshInstance.sshClient!).then((success) {
      // Close loading dialog
      Navigator.of(context).pop();
      
      if (success) {
        // Show SFTP browser
        showDialog(
          context: context,
          builder: (context) => ChangeNotifierProvider.value(
            value: sftpService,
            child: Dialog(
              child: SizedBox(
                width: 800,
                height: 600,
                child: const SftpBrowser(),
              ),
            ),
          ),
        ).then((_) {
          // Cleanup when dialog is closed
          sftpService.close();
        });
      } else {
        _showErrorSnackBar(context, 'Failed to initialize SFTP connection');
      }
    });
  }
  
  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}