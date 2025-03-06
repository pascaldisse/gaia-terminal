import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTerminalStore } from './src/stores/terminalStore';
import AppContent from './src/App';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const { tabs, addTab } = useTerminalStore();

  // Initialize with a tab if none exists
  useEffect(() => {
    if (tabs.length === 0) {
      addTab('Terminal 1');
    }
  }, [tabs.length, addTab]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}