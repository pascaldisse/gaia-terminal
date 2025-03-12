import 'package:flutter/material.dart';

/// A dialog that shows file transfer progress and handles completion/errors
class SftpTransferDialog extends StatefulWidget {
  final String title;
  final Future<bool> Function() operation;
  
  const SftpTransferDialog({
    super.key,
    required this.title,
    required this.operation,
  });

  @override
  State<SftpTransferDialog> createState() => _SftpTransferDialogState();
}

class _SftpTransferDialogState extends State<SftpTransferDialog> {
  bool _inProgress = true;
  bool _success = false;
  String _message = 'Transfer in progress...';
  
  @override
  void initState() {
    super.initState();
    _startOperation();
  }
  
  Future<void> _startOperation() async {
    try {
      final result = await widget.operation();
      
      if (mounted) {
        setState(() {
          _inProgress = false;
          _success = result;
          _message = result 
              ? 'Transfer completed successfully' 
              : 'Transfer failed';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _inProgress = false;
          _success = false;
          _message = 'Error: $e';
        });
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_inProgress)
            Column(
              children: [
                const CircularProgressIndicator(),
                const SizedBox(height: 16),
                Text(_message),
              ],
            )
          else
            Column(
              children: [
                Icon(
                  _success ? Icons.check_circle : Icons.error,
                  color: _success ? Colors.green : Colors.red,
                  size: 48,
                ),
                const SizedBox(height: 16),
                Text(_message),
              ],
            ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }
}