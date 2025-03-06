import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';

function TerminalTabs() {
  const { tabs, activeTab, addTab, closeTab, setActiveTab } = useTerminalStore();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              tab.id === activeTab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text 
              style={[
                styles.tabText,
                tab.id === activeTab && styles.activeTabText
              ]}
              numberOfLines={1}
            >
              {tab.name}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => closeTab(tab.id)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addTab('New Tab')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    height: 40,
  },
  scrollContent: {
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 120,
    maxWidth: 160,
    backgroundColor: '#1a1a1a',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  activeTab: {
    backgroundColor: '#2a2a2a',
  },
  tabText: {
    color: '#ccc',
    flex: 1,
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  closeButtonText: {
    color: '#999',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  addButtonText: {
    color: '#ccc',
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default TerminalTabs;