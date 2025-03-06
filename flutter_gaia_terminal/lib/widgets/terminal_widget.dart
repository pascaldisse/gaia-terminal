import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:xterm/xterm.dart';
import '../services/terminal_service.dart';

class TerminalWidget extends StatefulWidget {
  final TerminalTab terminalTab;

  const TerminalWidget({
    Key? key,
    required this.terminalTab,
  }) : super(key: key);

  @override
  State<TerminalWidget> createState() => _TerminalWidgetState();
}

class _TerminalWidgetState extends State<TerminalWidget> {
  final TextEditingController _inputController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void dispose() {
    _inputController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final terminalService = Provider.of<TerminalService>(context);
    
    return Container(
      color: Colors.black,
      child: Column(
        children: [
          Expanded(
            child: TerminalView(
              terminal: widget.terminalTab.terminal,
              style: TerminalStyle(
                fontSize: terminalService.fontSize,
                fontFamily: 'monospace',
                backgroundColor: terminalService.theme == 'dark' 
                    ? Colors.black 
                    : Colors.white,
                foregroundColor: terminalService.theme == 'dark' 
                    ? Colors.white 
                    : Colors.black,
              ),
              autofocus: true,
              onOutput: (output) {
                // Handle terminal output if needed
              },
              onTap: () {
                FocusScope.of(context).requestFocus(_focusNode);
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            color: Colors.grey[900],
            child: Row(
              children: [
                const Text('> ', style: TextStyle(color: Colors.white)),
                Expanded(
                  child: TextField(
                    controller: _inputController,
                    focusNode: _focusNode,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      isDense: true,
                    ),
                    cursorColor: Colors.white,
                    onSubmitted: (command) {
                      terminalService.sendCommand(command);
                      _inputController.clear();
                      FocusScope.of(context).requestFocus(_focusNode);
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}