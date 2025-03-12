import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:xterm/xterm.dart';
import '../services/terminal_service.dart';

class TerminalWidget extends StatefulWidget {
  final TerminalTab terminalTab;

  const TerminalWidget({
    super.key,
    required this.terminalTab,
  });

  @override
  State<TerminalWidget> createState() => _TerminalWidgetState();
}

class _TerminalWidgetState extends State<TerminalWidget> {
  final TextEditingController _inputController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final FocusNode _terminalFocusNode = FocusNode(); // Separate focus node for terminal

  String _currentInput = '';
  bool _useDirectTerminal = true; // Toggle between direct terminal and TextField

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      debugPrint('TextField focus changed: ${_focusNode.hasFocus}');
    });
    
    _terminalFocusNode.addListener(() {
      debugPrint('Terminal focus changed: ${_terminalFocusNode.hasFocus}');
    });
    
    // Add listener to track changes to input
    _inputController.addListener(() {
      debugPrint('Input controller changed to: ${_inputController.text}');
    });
    
    // Request focus when widget is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_useDirectTerminal) {
        FocusScope.of(context).requestFocus(_terminalFocusNode);
      } else {
        FocusScope.of(context).requestFocus(_focusNode);
      }
    });
  }

  @override
  void dispose() {
    _inputController.dispose();
    _focusNode.dispose();
    _terminalFocusNode.dispose();
    super.dispose();
  }
  
  void _handleKeyEvent(KeyEvent event) {
    if (!_useDirectTerminal) return; // Skip if not using direct terminal mode
    
    final terminalService = Provider.of<TerminalService>(context, listen: false);
    
    if (event is KeyDownEvent) {
      final keyLabel = event.logicalKey.keyLabel;
      debugPrint('Key event: ${event.logicalKey.debugName}, keyLabel: $keyLabel');
      
      if (event.logicalKey == LogicalKeyboardKey.enter) {
        debugPrint('Enter pressed, sending command: $_currentInput');
        if (_currentInput.isNotEmpty) {
          terminalService.sendCommand(_currentInput);
          _currentInput = '';
          widget.terminalTab.terminal.write('\r\n');
        }
      } else if (event.logicalKey == LogicalKeyboardKey.backspace) {
        debugPrint('Backspace detected in KeyDownEvent');
        if (_currentInput.isNotEmpty) {
          setState(() {
            // Remove the last character from current input
            _currentInput = _currentInput.substring(0, _currentInput.length - 1);
          });
          
          // Get the proper prompt based on connection status
          String prompt = widget.terminalTab.isConnected ? '\$ ' : '> ';
          
          // Use ANSI escape sequence to clear the line completely
          widget.terminalTab.terminal.write('\r\x1b[K');   // Carriage return + clear line from cursor to end
          widget.terminalTab.terminal.write(prompt + _currentInput);
          
          debugPrint('Backspace processed, current input: $_currentInput');
        }
      } else if (event.character != null && event.character!.isNotEmpty) {
        setState(() {
          _currentInput += event.character!;
        });
        widget.terminalTab.terminal.write(event.character!);
        debugPrint('Character added: ${event.character}, current input: $_currentInput');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final terminalService = Provider.of<TerminalService>(context);
    
    return Container(
      color: terminalService.currentTheme.background,
      child: Column(
        children: [
          Expanded(
            child: KeyboardListener(
              focusNode: _terminalFocusNode,
              onKeyEvent: _handleKeyEvent,
              autofocus: true,
              child: GestureDetector(
                onTap: () {
                  debugPrint('Terminal tapped, requesting focus');
                  FocusScope.of(context).requestFocus(_terminalFocusNode);
                },
                child: Container(
                  color: terminalService.currentTheme.background,
                  child: TerminalView(
                    widget.terminalTab.terminal,
                    textStyle: TerminalStyle(
                      fontSize: terminalService.fontSize,
                      fontFamily: 'monospace',
                    ),
                    // When using direct input, don't let TerminalView handle keyboard
                    keyboardType: _useDirectTerminal 
                        ? TextInputType.none 
                        : TextInputType.emailAddress,
                  ),
                ),
              ),
            ),
          ),
          
          // Only show input field if not using direct terminal mode
          if (!_useDirectTerminal)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              color: Colors.grey[900],
              child: Row(
                children: [
                  Text(
                    widget.terminalTab.isConnected ? '\$ ' : '> ',
                    style: const TextStyle(color: Colors.white),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _inputController,
                      focusNode: _focusNode,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        isDense: true,
                        hintText: 'Type here...',
                        hintStyle: TextStyle(color: Colors.grey),
                      ),
                      cursorColor: Colors.white,
                      autofocus: true,
                      onChanged: (text) {
                        debugPrint('Text field changed: $text');
                      },
                      onSubmitted: (command) {
                        debugPrint('Command submitted: $command');
                        terminalService.sendCommand(command);
                        _inputController.clear();
                        FocusScope.of(context).requestFocus(_focusNode);
                      },
                    ),
                  ),
                ],
              ),
            ),
          
          // Add a small helper text at the bottom
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            color: Colors.grey[850],
            width: double.infinity,
            child: Text(
              'Input Mode: ${_useDirectTerminal ? 'Direct Terminal' : 'Text Field'} (Tap to focus)',
              style: TextStyle(
                color: Colors.grey[400],
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          
          // Add a toggle button to switch between input modes
          Container(
            padding: const EdgeInsets.symmetric(vertical: 4),
            color: Colors.grey[900],
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton(
                  onPressed: () {
                    setState(() {
                      _useDirectTerminal = !_useDirectTerminal;
                    });
                    if (_useDirectTerminal) {
                      FocusScope.of(context).requestFocus(_terminalFocusNode);
                    } else {
                      FocusScope.of(context).requestFocus(_focusNode);
                    }
                  },
                  child: Text(
                    'Switch to ${_useDirectTerminal ? 'TextField' : 'Direct Terminal'} Input',
                    style: const TextStyle(color: Colors.blue),
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