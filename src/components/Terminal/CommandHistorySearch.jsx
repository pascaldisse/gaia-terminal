import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Animated
} from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';
import Icon from '../Icons/Icon';

const CommandHistorySearch = ({ terminalId, visible, onClose, onSelectCommand }) => {
  const { getCommandHistory } = useTerminalStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Get command history for the terminal
  const commandHistory = getCommandHistory ? getCommandHistory(terminalId) : [];
  
  // Focus input when component becomes visible
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
        
        // Animate in
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start();
      }, 100);
    } else {
      // Animate out
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);
  
  // Filter command history based on query
  useEffect(() => {
    if (!commandHistory) return;
    
    // Create a unique array of commands by removing duplicates
    const uniqueCommands = [...new Set(commandHistory)];
    
    // Filter based on query
    const filteredCommands = uniqueCommands.filter(
      command => command.toLowerCase().includes(query.toLowerCase())
    );
    
    // Sort by relevance (exact match first, then starts with, then includes)
    const sortedCommands = [...filteredCommands].sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Exact match
      if (aLower === queryLower && bLower !== queryLower) return -1;
      if (bLower === queryLower && aLower !== queryLower) return 1;
      
      // Starts with
      if (aLower.startsWith(queryLower) && !bLower.startsWith(queryLower)) return -1;
      if (bLower.startsWith(queryLower) && !aLower.startsWith(queryLower)) return 1;
      
      // Most recent (reverse order)
      return commandHistory.lastIndexOf(b) - commandHistory.lastIndexOf(a);
    });
    
    setResults(sortedCommands);
    setSelectedIndex(0);
  }, [query, commandHistory]);
  
  // Handle keyboard events
  const handleKeyPress = (e) => {
    const { key } = e.nativeEvent;
    
    if (key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (key === 'Enter' && results[selectedIndex]) {
      selectCommand(results[selectedIndex]);
    } else if (key === 'Escape') {
      onClose();
    }
  };
  
  // Select a command
  const selectCommand = (command) => {
    onSelectCommand(command);
    onClose();
  };
  
  // If not visible, don't render
  if (!visible) return null;
  
  // Render command item
  const renderCommandItem = ({ item, index }) => {
    const isSelected = index === selectedIndex;
    
    return (
      <TouchableOpacity
        style={[
          styles.commandItem,
          isSelected && styles.selectedItem
        ]}
        onPress={() => selectCommand(item)}
      >
        <Text
          style={[
            styles.commandText,
            isSelected && styles.selectedText
          ]}
          numberOfLines={1}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })
            }
          ],
          opacity: slideAnim
        }
      ]}
    >
      <View style={styles.searchBar}>
        <Icon name="terminal" size="small" color="#999" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search command history (Ctrl+R)"
          placeholderTextColor="#999"
          onKeyPress={handleKeyPress}
          autoFocus={true}
          returnKeyType="search"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderCommandItem}
          keyExtractor={(item, index) => `cmd-${index}`}
          style={styles.resultsList}
          keyboardShouldPersistTaps="always"
          initialScrollIndex={selectedIndex}
          getItemLayout={(data, index) => ({
            length: 40,
            offset: 40 * index,
            index
          })}
        />
      ) : (
        query.length > 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matching commands found</Text>
          </View>
        )
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#999',
    fontSize: 20,
  },
  resultsList: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  commandItem: {
    padding: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    height: 40,
    justifyContent: 'center',
  },
  selectedItem: {
    backgroundColor: '#2c2c2c',
  },
  commandText: {
    color: '#ddd',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  selectedText: {
    color: '#fff',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
});

export default CommandHistorySearch;