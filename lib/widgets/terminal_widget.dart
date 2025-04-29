import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:xterm/xterm.dart';
import '../services/terminal_service.dart';

class TerminalWidget extends StatefulWidget {
  final TerminalInstance instance;

  const TerminalWidget({
    super.key,
    required this.instance,
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
    
    // Additional debugging for terminal output
    try {
      // Check if terminal has any debug/output listeners we can use
      debugPrint('Setting up terminal debug logging');
    } catch (e) {
      debugPrint('Error setting up terminal debug: $e');
    }
    
    // Improved focus node listeners with more verbose logging
    _focusNode.addListener(() {
      debugPrint('TextField focus changed: ${_focusNode.hasFocus}');
      if (_focusNode.hasFocus && !_useDirectTerminal) {
        debugPrint('TextField gained focus in text field mode');
      }
    });
    
    _terminalFocusNode.addListener(() {
      debugPrint('Terminal focus changed: ${_terminalFocusNode.hasFocus}');
      if (_terminalFocusNode.hasFocus && _useDirectTerminal) {
        debugPrint('Terminal gained focus in direct terminal mode');
      }
    });
    
    // Add listener to track changes to input
    _inputController.addListener(() {
      debugPrint('Input controller changed to: ${_inputController.text}');
    });
    
    // Request focus when widget is initialized and add a delay to ensure it happens after layout
    WidgetsBinding.instance.addPostFrameCallback((_) {
      debugPrint('Post frame callback - requesting focus');
      if (_useDirectTerminal) {
        FocusScope.of(context).requestFocus(_terminalFocusNode);
        debugPrint('Requested focus for terminal focus node');
      } else {
        FocusScope.of(context).requestFocus(_focusNode);
        debugPrint('Requested focus for text field focus node');
      }
    });
    
    // Add an extra delayed focus request for reliability
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_useDirectTerminal && mounted) {
        debugPrint('Delayed focus request for terminal');
        FocusScope.of(context).requestFocus(_terminalFocusNode);
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
    
    // Enhanced logging for all key events to debug the issue
    debugPrint('Key event received: ${event.runtimeType}, key: ${event.logicalKey.keyLabel}, '
        'keyCode: 0x${event.logicalKey.keyId.toRadixString(16)}, '
        'character: ${event.character}');
    
    // Handle backspace specially - check for both KeyDownEvent and KeyRepeatEvent
    if ((event is KeyDownEvent || event is KeyRepeatEvent) && 
        (event.logicalKey == LogicalKeyboardKey.backspace)) {
      debugPrint('Backspace detected: ${event.runtimeType}, keyId: ${event.logicalKey.keyId}');
      if (_currentInput.isNotEmpty) {
        setState(() {
          // Remove the last character from current input
          _currentInput = _currentInput.substring(0, _currentInput.length - 1);
        });
        
        // Get the proper prompt based on connection status
        String prompt = widget.instance.isConnected ? '\$ ' : '> ';
        
        // Use ANSI escape sequence to clear the line completely
        widget.instance.terminal.write('\r\x1b[K');   // Carriage return + clear line from cursor to end
        widget.instance.terminal.write(prompt + _currentInput);
        
        debugPrint('Backspace processed, current input: $_currentInput');
      } else {
        debugPrint('Backspace ignored: input is empty');
      }
      return;
    }
    
    // Alternative check for backspace/delete key if the normal check fails
    if ((event is KeyDownEvent || event is KeyRepeatEvent) && 
        (event.character == '\b' || event.character == '\x7f')) {
      debugPrint('Backspace character detected via character property');
      if (_currentInput.isNotEmpty) {
        setState(() {
          _currentInput = _currentInput.substring(0, _currentInput.length - 1);
        });
        
        String prompt = widget.instance.isConnected ? '\$ ' : '> ';
        widget.instance.terminal.write('\r\x1b[K');
        widget.instance.terminal.write(prompt + _currentInput);
        
        debugPrint('Backspace processed via character, current input: $_currentInput');
      }
      return;
    }
    
    // Check for Delete key as well
    if ((event is KeyDownEvent || event is KeyRepeatEvent) && 
        (event.logicalKey == LogicalKeyboardKey.delete)) {
      debugPrint('Delete key detected: ${event.runtimeType}');
      if (_currentInput.isNotEmpty) {
        setState(() {
          _currentInput = _currentInput.substring(0, _currentInput.length - 1);
        });
        
        String prompt = widget.instance.isConnected ? '\$ ' : '> ';
        widget.instance.terminal.write('\r\x1b[K');
        widget.instance.terminal.write(prompt + _currentInput);
        
        debugPrint('Delete processed, current input: $_currentInput');
      }
      return;
    }
    
    // Raw key code approach for backspace (keyId 8 is backspace in most systems)
    if ((event is KeyDownEvent || event is KeyRepeatEvent) && 
        event.logicalKey.keyId == 0x00000008) {
      debugPrint('Backspace detected via raw keyId: 0x00000008');
      if (_currentInput.isNotEmpty) {
        setState(() {
          _currentInput = _currentInput.substring(0, _currentInput.length - 1);
        });
        
        String prompt = widget.instance.isConnected ? '\$ ' : '> ';
        widget.instance.terminal.write('\r\x1b[K');
        widget.instance.terminal.write(prompt + _currentInput);
        
        debugPrint('Backspace processed via raw keyId, current input: $_currentInput');
      }
      return;
    }
    
    if (event is KeyDownEvent) {
      final keyLabel = event.logicalKey.keyLabel;
      debugPrint('Key event: ${event.logicalKey.debugName}, keyLabel: $keyLabel');
      
      // Handle up arrow for command history
      if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
        final previousCommand = widget.instance.getPreviousCommand();
        if (previousCommand != null) {
          // Clear current input and display previous command
          final prompt = widget.instance.isConnected ? '\$ ' : '> ';
          widget.instance.terminal.write('\r\x1b[K'); // Clear line
          widget.instance.terminal.write(prompt + previousCommand);
          setState(() {
            _currentInput = previousCommand;
          });
        }
        return;
      }
      
      // Handle down arrow for command history
      if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
        final nextCommand = widget.instance.getNextCommand();
        final prompt = widget.instance.isConnected ? '\$ ' : '> ';
        widget.instance.terminal.write('\r\x1b[K'); // Clear line
        
        if (nextCommand != null) {
          widget.instance.terminal.write(prompt + nextCommand);
          setState(() {
            _currentInput = nextCommand;
          });
        } else {
          widget.instance.terminal.write(prompt);
          setState(() {
            _currentInput = '';
          });
        }
        return;
      }
      
      if (event.logicalKey == LogicalKeyboardKey.enter) {
        debugPrint('Enter pressed, sending command: $_currentInput');
        if (_currentInput.isNotEmpty) {
          // Add command to history
          widget.instance.addToHistory(_currentInput);
          
          // Send command to terminal
          terminalService.sendCommand(_currentInput);
          setState(() {
            _currentInput = '';
          });
          widget.instance.terminal.write('\r\n');
        }
      } else if (event.character != null && event.character!.isNotEmpty) {
        setState(() {
          _currentInput += event.character!;
        });
        widget.instance.terminal.write(event.character!);
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
            child: Focus(
              focusNode: _terminalFocusNode,
              onKeyEvent: (node, event) {
                debugPrint('Focus onKeyEvent called: ${event.runtimeType}, key: ${event.logicalKey.keyLabel}');
                _handleKeyEvent(event);
                // Return true to indicate the event was handled
                return KeyEventResult.handled;
              },
              autofocus: true,
              child: GestureDetector(
                onTap: () {
                  debugPrint('Terminal tapped, requesting focus');
                  FocusScope.of(context).requestFocus(_terminalFocusNode);
                },
                child: Container(
                  color: terminalService.currentTheme.background,
                  child: TerminalView(
                    widget.instance.terminal,
                    textStyle: TerminalStyle(
                      fontSize: terminalService.fontSize,
                      fontFamily: 'monospace',
                    ),
                    // Always set to none to ensure our focus node handles all key events
                    keyboardType: TextInputType.none,
                    // Additional settings to ensure key events go through our handler
                    readOnly: true,
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
                    widget.instance.isConnected ? '\$ ' : '> ',
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