import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
  Clipboard
} from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';

const ExportImportSettings = ({ visible, onClose }) => {
  const { 
    exportSettings, 
    importSettings, 
    theme, 
    fontSize, 
    fontFamily 
  } = useTerminalStore();
  
  const [exportedSettings, setExportedSettings] = useState('');
  const [importText, setImportText] = useState('');
  const [mode, setMode] = useState('export'); // 'export' or 'import'
  const [importError, setImportError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Reset state when modal is opened
  useEffect(() => {
    if (visible) {
      setMode('export');
      setImportText('');
      setImportError('');
      setIsCopied(false);
      
      // Generate exported settings
      if (exportSettings) {
        const settings = exportSettings();
        setExportedSettings(JSON.stringify(settings, null, 2));
      }
    }
  }, [visible, exportSettings]);
  
  // Copy settings to clipboard
  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(exportedSettings);
      setIsCopied(true);
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy settings to clipboard');
    }
  };
  
  // Handle importing settings
  const handleImport = () => {
    setImportError('');
    
    try {
      const settings = JSON.parse(importText);
      
      // Attempt to import settings
      if (importSettings) {
        const result = importSettings(settings);
        
        if (result.success) {
          Alert.alert(
            'Success', 
            'Settings imported successfully!',
            [{ text: 'OK', onPress: onClose }]
          );
        } else {
          setImportError(result.error || 'Invalid settings format');
        }
      }
    } catch (error) {
      setImportError('Invalid JSON format');
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.background || '#1a1a1a' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.foreground || '#fff' }]}>
              {mode === 'export' ? 'Export Settings' : 'Import Settings'}
            </Text>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  mode === 'export' && styles.activeTab
                ]}
                onPress={() => setMode('export')}
              >
                <Text style={[
                  styles.tabText,
                  mode === 'export' && styles.activeTabText
                ]}>
                  Export
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  mode === 'import' && styles.activeTab
                ]}
                onPress={() => setMode('import')}
              >
                <Text style={[
                  styles.tabText,
                  mode === 'import' && styles.activeTabText
                ]}>
                  Import
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {mode === 'export' ? (
              <>
                <Text style={[styles.description, { color: theme.foreground || '#ccc' }]}>
                  Copy the JSON below to save your current terminal settings.
                </Text>
                
                <ScrollView 
                  style={[
                    styles.codeBlock, 
                    { backgroundColor: theme.black || '#111' }
                  ]}
                >
                  <Text 
                    style={[
                      styles.codeText, 
                      { 
                        color: theme.foreground || '#fff',
                        fontFamily: fontFamily || 'monospace',
                        fontSize: Math.max(12, fontSize - 2) 
                      }
                    ]}
                  >
                    {exportedSettings}
                  </Text>
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyToClipboard}
                >
                  <Text style={styles.buttonText}>
                    {isCopied ? '✓ Copied' : 'Copy to Clipboard'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.description, { color: theme.foreground || '#ccc' }]}>
                  Paste previously exported settings JSON below to restore your terminal configuration.
                </Text>
                
                <TextInput
                  style={[
                    styles.importInput,
                    { 
                      backgroundColor: theme.black || '#111',
                      color: theme.foreground || '#fff',
                      fontFamily: fontFamily || 'monospace',
                      fontSize: Math.max(12, fontSize - 2)
                    }
                  ]}
                  value={importText}
                  onChangeText={setImportText}
                  placeholder="Paste settings JSON here..."
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={10}
                />
                
                {importError ? (
                  <Text style={styles.errorText}>{importError}</Text>
                ) : null}
                
                <TouchableOpacity
                  style={[
                    styles.importButton,
                    !importText && styles.disabledButton
                  ]}
                  onPress={handleImport}
                  disabled={!importText}
                >
                  <Text style={styles.buttonText}>
                    Import Settings
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#ccc',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  description: {
    marginBottom: 15,
    lineHeight: 20,
  },
  codeBlock: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
    maxHeight: 200,
  },
  codeText: {
    lineHeight: 20,
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 5,
  },
  importInput: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
    height: 200,
    textAlignVertical: 'top',
  },
  importButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 10,
  },
});

export default ExportImportSettings;