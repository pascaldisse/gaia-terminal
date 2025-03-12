import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/terminal_service.dart';
import 'ssh_dialog.dart';

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
}