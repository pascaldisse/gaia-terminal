import 'package:flutter_test/flutter_test.dart';
import 'package:gaia_terminal/services/terminal_service.dart';

void main() {
  group('TerminalService tests', () {
    late TerminalService terminalService;
    
    setUp(() {
      terminalService = TerminalService();
    });
    
    test('should create initial terminal tab on initialization', () {
      // The service constructor calls _init() which creates initial tab
      expect(terminalService.tabs.length, 1);
      expect(terminalService.activeTabIndex, 0);
    });
    
    test('should create new terminal tab when createTab is called', () {
      // Initially we have 1 tab from setup
      expect(terminalService.tabs.length, 1);
      
      // Add a new tab
      terminalService.createTab();
      
      // Now we should have 2 tabs and the active index should be the new tab
      expect(terminalService.tabs.length, 2);
      expect(terminalService.activeTabIndex, 1);
    });
    
    test('should close tab when closeTab is called', () {
      // Create multiple tabs
      terminalService.createTab();
      terminalService.createTab();
      expect(terminalService.tabs.length, 3);
      
      // Close the middle tab
      terminalService.closeTab(1);
      
      // Should have 2 tabs remaining and active index should not change
      expect(terminalService.tabs.length, 2);
      expect(terminalService.activeTabIndex, 1);
      
      // Create another tab and close the last one
      terminalService.createTab();
      expect(terminalService.tabs.length, 3);
      terminalService.closeTab(2);
      
      // Active index should adjust to the highest available index
      expect(terminalService.tabs.length, 2);
      expect(terminalService.activeTabIndex, 1);
    });
    
    test('should not close the last tab', () {
      // Initially we have 1 tab
      expect(terminalService.tabs.length, 1);
      
      // Try to close it
      terminalService.closeTab(0);
      
      // It should not be closed
      expect(terminalService.tabs.length, 1);
    });
    
    test('should set active tab', () {
      // Create multiple tabs
      terminalService.createTab();
      terminalService.createTab();
      expect(terminalService.activeTabIndex, 2);
      
      // Set active tab to the first one
      terminalService.setActiveTab(0);
      expect(terminalService.activeTabIndex, 0);
    });
    
    test('should toggle settings panel', () {
      // Initially settings are closed
      expect(terminalService.isSettingsOpen, false);
      
      // Toggle settings
      terminalService.toggleSettings();
      expect(terminalService.isSettingsOpen, true);
      
      // Toggle settings again
      terminalService.toggleSettings();
      expect(terminalService.isSettingsOpen, false);
    });
    
    test('should change theme', () {
      // Initial theme is dark
      expect(terminalService.theme, 'dark');
      
      // Change to light
      terminalService.setTheme('light');
      expect(terminalService.theme, 'light');
      
      // Change to dracula
      terminalService.setThemeByEnum(TerminalTheme.dracula);
      expect(terminalService.theme, 'dracula');
    });
    
    test('should split and unsplit terminal', () {
      // Active instance ID will be set by constructor
      String? initialInstanceId = terminalService.activeInstanceId;
      expect(initialInstanceId, isNotNull);
      
      // Get the current tab and pane
      final tab = terminalService.tabs[0];
      expect(tab.rootPane.isSplit, false);
      
      // Split the terminal horizontally
      terminalService.splitTerminal(SplitDirection.horizontal);
      
      // Root pane should now be split
      expect(tab.rootPane.isSplit, true);
      expect(tab.rootPane.splitDirection, SplitDirection.horizontal);
      expect(tab.rootPane.firstPane, isNotNull);
      expect(tab.rootPane.secondPane, isNotNull);
      
      // The active instance should be the second pane
      expect(terminalService.activeInstanceId, isNot(equals(initialInstanceId)));
      
      // Close the split and keep the first pane
      terminalService.closeSplit(true);
      
      // Root pane should no longer be split
      expect(tab.rootPane.isSplit, false);
      expect(tab.rootPane.instance, isNotNull);
    });

    test('command history management', () {
      // Get active instance 
      final tab = terminalService.tabs[0];
      final instance = tab.rootPane.instance!;
      
      // Initially history should be empty
      expect(instance.commandHistory.length, 0);
      
      // Send a few commands
      terminalService.sendCommand('test command 1');
      terminalService.sendCommand('test command 2');
      terminalService.sendCommand('test command 3');
      
      // History should have 3 commands
      expect(instance.commandHistory.length, 3);
      expect(instance.commandHistory[0], 'test command 1');
      expect(instance.commandHistory[1], 'test command 2');
      expect(instance.commandHistory[2], 'test command 3');
      
      // Navigate up once
      String? previous = terminalService.navigateHistoryUp();
      expect(previous, 'test command 3');
      
      // Navigate up again
      previous = terminalService.navigateHistoryUp();
      expect(previous, 'test command 2');
      
      // Navigate up once more
      previous = terminalService.navigateHistoryUp();
      expect(previous, 'test command 1');
      
      // Navigate up beyond history limit
      previous = terminalService.navigateHistoryUp();
      expect(previous, null);
      
      // Navigate back down
      String? next = terminalService.navigateHistoryDown();
      expect(next, 'test command 2');
      
      // Navigate down again
      next = terminalService.navigateHistoryDown();
      expect(next, 'test command 3');
      
      // Navigate down beyond history limit
      next = terminalService.navigateHistoryDown();
      expect(next, null);
    });
  });
}