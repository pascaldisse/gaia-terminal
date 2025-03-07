import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Platform 
} from 'react-native';

const KeyboardShortcutsHelp = ({ visible, onClose }) => {
  const isMac = Platform.OS === 'macos' || Platform.OS === 'ios';
  const modifier = isMac ? '⌘' : 'Ctrl';
  
  // Shortcut categories and their commands
  const shortcuts = [
    {
      category: 'Terminal Navigation',
      commands: [
        { key: 'Up/Down', description: 'Navigate command history' },
        { key: `${modifier}+L`, description: 'Clear screen' },
        { key: `${modifier}+C`, description: 'Cancel current command' },
        { key: 'Tab', description: 'Auto-complete command/path' }
      ]
    },
    {
      category: 'Tab Management',
      commands: [
        { key: `${modifier}+T`, description: 'New terminal tab' },
        { key: `${modifier}+W`, description: 'Close current tab' },
        { key: `${modifier}+1-9`, description: 'Switch to tab by number' },
        { key: `${modifier}+Shift+→`, description: 'Next tab' },
        { key: `${modifier}+Shift+←`, description: 'Previous tab' }
      ]
    },
    {
      category: 'Split Terminal',
      commands: [
        { key: `${modifier}+Shift+D`, description: 'Split terminal horizontally' },
        { key: `${modifier}+D`, description: 'Split terminal vertically' },
        { key: `${modifier}+Shift+←↑→↓`, description: 'Focus pane in direction' },
        { key: `${modifier}+Shift+W`, description: 'Close current pane' }
      ]
    },
    {
      category: 'SSH',
      commands: [
        { key: `${modifier}+K`, description: 'New SSH connection' },
        { key: 'exit', description: 'Close SSH connection' }
      ]
    },
    {
      category: 'Editing',
      commands: [
        { key: `${modifier}+A`, description: 'Select all' },
        { key: `${modifier}+X`, description: 'Cut selected text' },
        { key: `${modifier}+C`, description: 'Copy selected text' },
        { key: `${modifier}+V`, description: 'Paste from clipboard' }
      ]
    },
    {
      category: 'Search',
      commands: [
        { key: `${modifier}+F`, description: 'Search in terminal' },
        { key: `${modifier}+R`, description: 'Search command history' },
        { key: `${modifier}+G`, description: 'Find next' },
        { key: `${modifier}+Shift+G`, description: 'Find previous' }
      ]
    }
  ];
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Keyboard Shortcuts</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            {shortcuts.map((section, sectionIndex) => (
              <View key={`section-${sectionIndex}`} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.category}</Text>
                <View style={styles.shortcutList}>
                  {section.commands.map((command, commandIndex) => (
                    <View 
                      key={`command-${sectionIndex}-${commandIndex}`} 
                      style={styles.shortcutItem}
                    >
                      <View style={styles.keyContainer}>
                        <Text style={styles.keyText}>{command.key}</Text>
                      </View>
                      <Text style={styles.descriptionText}>{command.description}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            
            <View style={styles.footer}>
              <Text style={styles.note}>
                Note: Some keyboard shortcuts may not work on mobile devices or in certain browsers.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
  },
  scrollView: {
    maxHeight: 500,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ddd',
    marginBottom: 12,
  },
  shortcutList: {
    
  },
  shortcutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  keyContainer: {
    backgroundColor: '#333',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 100,
  },
  keyText: {
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    textAlign: 'center',
  },
  descriptionText: {
    color: '#bbb',
    fontSize: 14,
    flex: 1,
  },
  footer: {
    padding: 16,
  },
  note: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default KeyboardShortcutsHelp;