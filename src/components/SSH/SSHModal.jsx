import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';

function SSHModal({ onClose }) {
  const { activeTab, addSSHConnection, setActiveConnection, getSavedNamedConnections } = useTerminalStore();
  
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '22',
    username: '',
    password: '',
    privateKey: '',
    saveConnection: false,
    usePassword: true,
  });
  
  const savedConnections = getSavedNamedConnections();
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleToggleSwitch = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const handleConnect = () => {
    // Validate form
    if (!formData.host || !formData.username || 
        (formData.usePassword && !formData.password) ||
        (!formData.usePassword && !formData.privateKey)) {
      // Show validation error
      return;
    }
    
    // Create connection data
    const connectionData = {
      name: formData.saveConnection ? formData.name || formData.host : '',
      host: formData.host,
      port: parseInt(formData.port, 10) || 22,
      username: formData.username,
    };
    
    // Add authentication method
    if (formData.usePassword) {
      connectionData.password = formData.password;
    } else {
      connectionData.privateKey = formData.privateKey;
    }
    
    // Add connection and connect
    const connectionId = addSSHConnection(connectionData);
    setActiveConnection(activeTab, connectionId);
    
    // Close modal
    onClose();
  };
  
  const loadSavedConnection = (connection) => {
    setFormData({
      name: connection.name,
      host: connection.host,
      port: connection.port?.toString() || '22',
      username: connection.username,
      password: connection.password || '',
      privateKey: connection.privateKey || '',
      saveConnection: true,
      usePassword: Boolean(connection.password),
    });
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>SSH Connection</Text>
          
          <ScrollView style={styles.formContainer}>
            {savedConnections.length > 0 && (
              <View style={styles.savedConnectionsContainer}>
                <Text style={styles.sectionTitle}>Saved Connections</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.savedConnectionsScroll}
                >
                  {savedConnections.map(conn => (
                    <TouchableOpacity
                      key={conn.id}
                      style={styles.savedConnectionItem}
                      onPress={() => loadSavedConnection(conn)}
                    >
                      <Text style={styles.savedConnectionText}>
                        {conn.name || conn.host}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Host</Text>
              <TextInput
                style={styles.input}
                value={formData.host}
                onChangeText={(text) => handleInputChange('host', text)}
                placeholder="hostname or IP"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Port</Text>
              <TextInput
                style={styles.input}
                value={formData.port}
                onChangeText={(text) => handleInputChange('port', text)}
                keyboardType="numeric"
                placeholder="22"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => handleInputChange('username', text)}
                placeholder="username"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Authentication Method</Text>
              <View style={styles.toggleOptions}>
                <Text style={[
                  styles.toggleOptionText,
                  formData.usePassword && styles.activeToggleText
                ]}>
                  Password
                </Text>
                <Switch
                  value={!formData.usePassword}
                  onValueChange={() => handleToggleSwitch('usePassword')}
                  trackColor={{ false: '#767577', true: '#767577' }}
                  thumbColor={formData.usePassword ? '#f4f3f4' : '#4CAF50'}
                />
                <Text style={[
                  styles.toggleOptionText,
                  !formData.usePassword && styles.activeToggleText
                ]}>
                  Private Key
                </Text>
              </View>
            </View>
            
            {formData.usePassword ? (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry
                  placeholder="password"
                  placeholderTextColor="#999"
                />
              </View>
            ) : (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Private Key</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.privateKey}
                  onChangeText={(text) => handleInputChange('privateKey', text)}
                  multiline
                  numberOfLines={4}
                  placeholder="Paste your private key here"
                  placeholderTextColor="#999"
                />
              </View>
            )}
            
            <View style={styles.formGroup}>
              <View style={styles.saveConnectionContainer}>
                <Text style={styles.label}>Save Connection</Text>
                <Switch
                  value={formData.saveConnection}
                  onValueChange={() => handleToggleSwitch('saveConnection')}
                  trackColor={{ false: '#767577', true: '#4CAF50' }}
                  thumbColor={formData.saveConnection ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>
              
              {formData.saveConnection && (
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Connection name (optional)"
                  placeholderTextColor="#999"
                />
              )}
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonConnect]}
              onPress={handleConnect}
            >
              <Text style={styles.buttonConnectText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

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
    maxHeight: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: 450,
  },
  savedConnectionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  savedConnectionsScroll: {
    flexDirection: 'row',
  },
  savedConnectionItem: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  savedConnectionText: {
    color: '#fff',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    marginBottom: 15,
  },
  toggleLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  toggleOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 4,
  },
  toggleOptionText: {
    color: '#999',
    fontSize: 14,
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveConnectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#444',
    marginRight: 10,
  },
  buttonConnect: {
    backgroundColor: '#4CAF50',
  },
  buttonCancelText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonConnectText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SSHModal;