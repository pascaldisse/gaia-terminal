import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/terminal_service.dart';

class TerminalTabs extends StatelessWidget {
  const TerminalTabs({super.key});

  @override
  Widget build(BuildContext context) {
    final terminalService = Provider.of<TerminalService>(context);
    
    return Container(
      height: 40,
      color: Colors.grey[850],
      child: Row(
        children: [
          Expanded(
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: terminalService.tabs.length,
              itemBuilder: (context, index) {
                final tab = terminalService.tabs[index];
                final isActive = index == terminalService.activeTabIndex;
                
                return InkWell(
                  onTap: () => terminalService.setActiveTab(index),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isActive ? Colors.grey[800] : Colors.transparent,
                      border: Border(
                        bottom: BorderSide(
                          color: isActive ? Colors.blue : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        Text(
                          tab.title,
                          style: TextStyle(
                            color: isActive ? Colors.white : Colors.grey[400],
                            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        const SizedBox(width: 8),
                        InkWell(
                          onTap: () => terminalService.closeTab(index),
                          child: Icon(
                            Icons.close,
                            size: 16,
                            color: isActive ? Colors.white : Colors.grey[400],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () => terminalService.createTab(),
            tooltip: 'New Tab',
          ),
        ],
      ),
    );
  }
}