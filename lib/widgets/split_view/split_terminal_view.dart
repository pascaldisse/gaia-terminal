import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/terminal_service.dart';
import '../terminal_widget.dart';
import 'split_view_divider.dart';

/// A widget that renders a terminal pane, which could be a single terminal
/// or a split view with two sub-panes.
class SplitTerminalView extends StatefulWidget {
  final TerminalPane pane;
  
  const SplitTerminalView({
    super.key,
    required this.pane,
  });

  @override
  State<SplitTerminalView> createState() => _SplitTerminalViewState();
}

class _SplitTerminalViewState extends State<SplitTerminalView> {
  late TerminalPane _pane;
  
  @override
  void initState() {
    super.initState();
    _pane = widget.pane;
  }
  
  @override
  void didUpdateWidget(SplitTerminalView oldWidget) {
    super.didUpdateWidget(oldWidget);
    _pane = widget.pane;
  }

  @override
  Widget build(BuildContext context) {
    final terminalService = Provider.of<TerminalService>(context);
    
    // If not split, render a single terminal
    if (!_pane.isSplit) {
      if (_pane.instance == null) {
        return const Center(child: Text('No terminal instance available'));
      }
      
      final isActive = terminalService.activeInstanceId == _pane.instance!.id;
      
      return GestureDetector(
        onTap: () {
          if (!isActive) {
            terminalService.setActiveInstance(_pane.instance!.id);
          }
        },
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: isActive ? Colors.blue : Colors.transparent,
              width: 2,
            ),
          ),
          child: TerminalWidget(
            instance: _pane.instance!,
          ),
        ),
      );
    }
    
    // Split view with two terminals
    if (_pane.splitDirection == SplitDirection.horizontal) {
      return Row(
        children: [
          Expanded(
            flex: (_pane.splitRatio * 100).round(),
            child: _pane.firstPane != null
                ? SplitTerminalView(pane: _pane.firstPane!)
                : const Center(child: Text('Missing first pane')),
          ),
          SplitViewDivider(
            direction: _pane.splitDirection!,
            onDragUpdate: (delta) {
              _handleDragUpdate(context, delta);
            },
          ),
          Expanded(
            flex: (100 - _pane.splitRatio * 100).round(),
            child: _pane.secondPane != null
                ? SplitTerminalView(pane: _pane.secondPane!)
                : const Center(child: Text('Missing second pane')),
          ),
        ],
      );
    } else {
      return Column(
        children: [
          Expanded(
            flex: (_pane.splitRatio * 100).round(),
            child: _pane.firstPane != null
                ? SplitTerminalView(pane: _pane.firstPane!)
                : const Center(child: Text('Missing first pane')),
          ),
          SplitViewDivider(
            direction: _pane.splitDirection!,
            onDragUpdate: (delta) {
              _handleDragUpdate(context, delta);
            },
          ),
          Expanded(
            flex: (100 - _pane.splitRatio * 100).round(),
            child: _pane.secondPane != null
                ? SplitTerminalView(pane: _pane.secondPane!)
                : const Center(child: Text('Missing second pane')),
          ),
        ],
      );
    }
  }
  
  void _handleDragUpdate(BuildContext context, Offset delta) {
    final terminalService = Provider.of<TerminalService>(context, listen: false);
    final RenderBox box = context.findRenderObject() as RenderBox;
    final size = box.size;
    
    double newRatio;
    if (_pane.splitDirection == SplitDirection.horizontal) {
      // Calculate horizontal delta ratio
      newRatio = _pane.splitRatio + (delta.dx / size.width);
    } else {
      // Calculate vertical delta ratio
      newRatio = _pane.splitRatio + (delta.dy / size.height);
    }
    
    // Update the split ratio
    terminalService.updateSplitRatio(newRatio);
  }
}