import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';

function TerminalToolbar({ onSettingsClick, onSSHClick }) {
  const { activeTab, tabs } = useTerminalStore();
  const activeTabInfo = tabs.find(tab => tab.id === activeTab);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gaia Terminal</Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.button}
          onPress={onSSHClick}
        >
          <Text style={styles.buttonText}>SSH</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={onSettingsClick}
        >
          <Text style={styles.buttonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 50,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  }
});

export default TerminalToolbar;