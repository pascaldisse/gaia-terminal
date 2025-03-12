import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/terminal_service.dart';
import '../widgets/terminal_tabs.dart';
import '../widgets/terminal_toolbar.dart';
import '../widgets/settings_panel.dart';
import '../widgets/split_view/split_terminal_view.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<TerminalService>(
        builder: (context, terminalService, child) {
          return Column(
            children: [
              const TerminalToolbar(),
              const TerminalTabs(),
              Expanded(
                child: Stack(
                  children: [
                    if (terminalService.tabs.isNotEmpty &&
                        terminalService.activeTabIndex < terminalService.tabs.length)
                      Positioned.fill(
                        child: SplitTerminalView(
                          pane: terminalService.tabs[terminalService.activeTabIndex].rootPane,
                        ),
                      ),
                    if (terminalService.isSettingsOpen)
                      Positioned(
                        top: 0,
                        right: 0,
                        width: 300,
                        height: MediaQuery.of(context).size.height - 80,
                        child: const SettingsPanel(),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}