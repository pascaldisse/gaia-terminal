import 'package:flutter/material.dart';
import '../../services/terminal_service.dart';

/// A draggable divider between split panes
class SplitViewDivider extends StatefulWidget {
  final SplitDirection direction;
  final Function(Offset) onDragUpdate;
  
  const SplitViewDivider({
    super.key,
    required this.direction,
    required this.onDragUpdate,
  });

  @override
  State<SplitViewDivider> createState() => _SplitViewDividerState();
}

class _SplitViewDividerState extends State<SplitViewDivider> {
  bool _isDragging = false;
  
  @override
  Widget build(BuildContext context) {
    final isHorizontal = widget.direction == SplitDirection.horizontal;
    
    return MouseRegion(
      cursor: isHorizontal 
          ? SystemMouseCursors.resizeLeftRight
          : SystemMouseCursors.resizeUpDown,
      child: GestureDetector(
        onPanStart: (_) {
          setState(() => _isDragging = true);
        },
        onPanUpdate: (details) {
          widget.onDragUpdate(details.delta);
        },
        onPanEnd: (_) {
          setState(() => _isDragging = false);
        },
        child: Container(
          width: isHorizontal ? 6 : double.infinity,
          height: isHorizontal ? double.infinity : 6,
          color: _isDragging ? Colors.blue.withAlpha(120) : Colors.grey[800],
          alignment: Alignment.center,
          child: Container(
            width: isHorizontal ? 2 : 20,
            height: isHorizontal ? 20 : 2,
            color: _isDragging ? Colors.blue : Colors.grey[600],
          ),
        ),
      ),
    );
  }
}