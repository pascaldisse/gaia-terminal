import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';
import Icon from '../Icons/Icon';

const CommandAliases = ({ visible, onClose }) => {
  const { commandAliases, addCommandAlias, removeCommandAlias, theme } = useTerminalStore();
  
  const [newAlias, setNewAlias] = useState({ name: '', command: '' });
  const [aliasesList, setAliasesList] = useState([]);
  const [editingAlias, setEditingAlias] = useState(null);
  
  // Load aliases when component mounts
  useEffect(() => {
    if (visible && commandAliases) {
      // Convert aliases object to array for FlatList
      const aliases = Object.entries(commandAliases()).map(([name, command]) => ({
        name,
        command
      }));
      setAliasesList(aliases);
    }
  }, [visible, commandAliases]);
  
  // Submit new or edited alias
  const handleSubmit = () => {
    // Validate inputs
    if (!newAlias.name || !newAlias.command) {
      Alert.alert('Error', 'Both alias name and command are required');
      return;
    }
    
    // Add the alias to the store
    if (addCommandAlias) {
      addCommandAlias(newAlias.name, newAlias.command);
      
      // Update the local list
      if (editingAlias) {
        // Edit existing alias
        setAliasesList(prev => 
          prev.map(alias => 
            alias.name === editingAlias 
              ? { name: newAlias.name, command: newAlias.command } 
              : alias
          )
        );
        setEditingAlias(null);
      } else {
        // Add new alias
        setAliasesList(prev => [...prev, { ...newAlias }]);
      }
      
      // Reset form
      setNewAlias({ name: '', command: '' });
    }
  };
  
  // Delete an alias
  const handleDelete = (aliasName) => {
    Alert.alert(
      'Delete Alias',
      `Are you sure you want to delete the alias "${aliasName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (removeCommandAlias) {
              removeCommandAlias(aliasName);
              setAliasesList(prev => prev.filter(alias => alias.name !== aliasName));
              
              // If we're currently editing this alias, reset the form
              if (editingAlias === aliasName) {
                setNewAlias({ name: '', command: '' });
                setEditingAlias(null);
              }
            }
          }
        }
      ]
    );
  };
  
  // Start editing an alias
  const handleEdit = (alias) => {
    setNewAlias({ name: alias.name, command: alias.command });
    setEditingAlias(alias.name);
  };
  
  // Render an alias item
  const renderAliasItem = ({ item }) => (
    <View style={styles.aliasItem}>
      <View style={styles.aliasInfo}>
        <Text style={[styles.aliasName, { color: theme?.brightCyan || '#33dddd' }]}>
          {item.name}
        </Text>
        <Text style={[styles.aliasCommand, { color: theme?.foreground || '#e0e0e0' }]}>
          {item.command}
        </Text>
      </View>
      
      <View style={styles.aliasActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.name)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme?.background || '#1a1a1a' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme?.foreground || '#fff' }]}>
              Command Aliases
            </Text>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.formContainer}>
              <Text style={[styles.sectionTitle, { color: theme?.foreground || '#fff' }]}>
                {editingAlias ? 'Edit Alias' : 'Add New Alias'}
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme?.black || '#111',
                    color: theme?.foreground || '#fff'
                  }
                ]}
                value={newAlias.name}
                onChangeText={(text) => setNewAlias(prev => ({ ...prev, name: text }))}
                placeholder="Alias name (e.g. ll)"
                placeholderTextColor="#666"
              />
              
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme?.black || '#111',
                    color: theme?.foreground || '#fff'
                  }
                ]}
                value={newAlias.command}
                onChangeText={(text) => setNewAlias(prev => ({ ...prev, command: text }))}
                placeholder="Command (e.g. ls -la)"
                placeholderTextColor="#666"
              />
              
              <View style={styles.buttonRow}>
                {editingAlias && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setNewAlias({ name: '', command: '' });
                      setEditingAlias(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.submitButton,
                    (!newAlias.name || !newAlias.command) && styles.disabledButton
                  ]}
                  onPress={handleSubmit}
                  disabled={!newAlias.name || !newAlias.command}
                >
                  <Text style={styles.buttonText}>
                    {editingAlias ? 'Update Alias' : 'Add Alias'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.aliasListContainer}>
              <Text style={[styles.sectionTitle, { color: theme?.foreground || '#fff' }]}>
                Your Aliases
              </Text>
              
              {aliasesList.length > 0 ? (
                <FlatList
                  data={aliasesList}
                  renderItem={renderAliasItem}
                  keyExtractor={(item) => item.name}
                  style={styles.aliasList}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme?.brightBlack || '#888' }]}>
                    No aliases defined yet. Add your first alias above.
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.helpContainer}>
              <Text style={[styles.helpTitle, { color: theme?.cyan || '#33aadd' }]}>
                How to use aliases
              </Text>
              <Text style={[styles.helpText, { color: theme?.foreground || '#ccc' }]}>
                Aliases let you create shortcuts for frequently used commands.
                Type the alias name in the terminal to run the associated command.
              </Text>
            </View>
          </View>
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
    maxHeight: '90%',
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
    flex: 1,
  },
  formContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  aliasListContainer: {
    padding: 15,
    flex: 1,
  },
  aliasList: {
    flex: 1,
  },
  aliasItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aliasInfo: {
    flex: 1,
  },
  aliasName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  aliasCommand: {
    fontSize: 14,
  },
  aliasActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  helpContainer: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  helpTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CommandAliases;