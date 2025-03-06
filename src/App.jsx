import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Terminal from './components/Terminal/Terminal';
import TerminalTabs from './components/Terminal/TerminalTabs';
import TerminalToolbar from './components/Terminal/TerminalToolbar';
import SettingsPanel from './components/Settings/SettingsPanel';
import SSHModal from './components/SSH/SSHModal';
import { useTerminalStore } from './stores/terminalStore';
import { SafeAreaView } from 'react-native-safe-area-context';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showSSHModal, setShowSSHModal] = useState(false);
  const { activeTab, tabs, addTab, initSavedConnections } = useTerminalStore();
  
  // Initialize application state
  useEffect(() => {
    // Initialize any saved SSH connections
    initSavedConnections();
    
    // If no tabs exist, create a default one
    if (tabs.length === 0) {
      addTab('Local Terminal');
    }
  }, [tabs, addTab, initSavedConnections]);

  return (
    <SafeAreaView style={styles.container}>
      <TerminalToolbar 
        onSettingsClick={() => setShowSettings(!showSettings)}
        onSSHClick={() => setShowSSHModal(true)}
      />
      <View style={styles.mainContent}>
        <TerminalTabs />
        {tabs.map(tab => (
          <Terminal 
            key={tab.id} 
            id={tab.id} 
            visible={tab.id === activeTab} 
          />
        ))}
        
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
        
        {showSSHModal && (
          <SSHModal onClose={() => setShowSSHModal(false)} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // var(--bg-primary)
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  }
});

export default App;