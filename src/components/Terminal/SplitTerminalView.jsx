import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text 
} from 'react-native';
import Terminal from './Terminal';
import Icon from '../Icons/Icon';
import { useTerminalStore } from '../../stores/terminalStore';

const SplitTerminalView = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [splitMode, setSplitMode] = useState('none'); // 'none', 'horizontal', 'vertical'
  const { tabs, activeTab, addTab } = useTerminalStore();
  
  // Check if we're in landscape orientation
  const checkOrientation = () => {
    const { width, height } = Dimensions.get('window');
    setIsLandscape(width > height);
  };
  
  // Get the correct terminal IDs based on split mode
  const getTerminalIds = () => {
    if (splitMode === 'none') {
      return [activeTab];
    } else {
      if (tabs.length < 2) {
        // Auto-create a second tab if needed
        addTab('Terminal 2');
      }
      return [tabs[0]?.id, tabs[1]?.id].filter(Boolean);
    }
  };
  
  // Update orientation on dimension change
  useEffect(() => {
    checkOrientation();
    
    const dimensionListener = Dimensions.addEventListener('change', () => {
      checkOrientation();
      
      // Auto switch to horizontal split in landscape, but only if already in split mode
      if (splitMode !== 'none') {
        const { width, height } = Dimensions.get('window');
        setSplitMode(width > height ? 'horizontal' : 'vertical');
      }
    });
    
    return () => {
      dimensionListener.remove();
    };
  }, [splitMode]);
  
  // Render split controls
  const renderSplitControls = () => (
    <View style={styles.splitControls}>
      <TouchableOpacity 
        style={[
          styles.splitButton, 
          splitMode === 'none' && styles.activeButton
        ]}
        onPress={() => setSplitMode('none')}
      >
        <Icon name="terminal" size="small" color={splitMode === 'none' ? '#fff' : '#000'} />
        <Text style={splitMode === 'none' ? styles.activeText : styles.buttonText}>Single</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.splitButton, 
          splitMode === 'vertical' && styles.activeButton
        ]}
        onPress={() => setSplitMode('vertical')}
      >
        <Text style={[
          styles.splitIcon, 
          splitMode === 'vertical' && styles.activeText
        ]}>◫</Text>
        <Text style={splitMode === 'vertical' ? styles.activeText : styles.buttonText}>Vertical</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.splitButton, 
          splitMode === 'horizontal' && styles.activeButton
        ]}
        onPress={() => setSplitMode('horizontal')}
      >
        <Text style={[
          styles.splitIcon, 
          splitMode === 'horizontal' && styles.activeText
        ]}>⬓</Text>
        <Text style={splitMode === 'horizontal' ? styles.activeText : styles.buttonText}>Horizontal</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Get terminal IDs to display
  const terminalIds = getTerminalIds();
  
  return (
    <View style={styles.container}>
      {renderSplitControls()}
      
      <View style={[
        styles.terminalsContainer,
        splitMode === 'horizontal' && styles.horizontalSplit,
        splitMode === 'vertical' && styles.verticalSplit
      ]}>
        {terminalIds.map((id, index) => (
          <View 
            key={id} 
            style={[
              styles.terminalWrapper,
              splitMode !== 'none' && styles.splitTerminal,
              index === 0 && splitMode === 'horizontal' && styles.leftTerminal,
              index === 0 && splitMode === 'vertical' && styles.topTerminal,
              index === 1 && splitMode === 'horizontal' && styles.rightTerminal,
              index === 1 && splitMode === 'vertical' && styles.bottomTerminal,
            ]}
          >
            <Terminal id={id} visible={true} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  splitControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 4,
    backgroundColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  splitButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#DDD',
    fontSize: 12,
    marginLeft: 4,
  },
  activeText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 4,
  },
  splitIcon: {
    fontSize: 16,
    color: '#DDD',
  },
  terminalsContainer: {
    flex: 1,
  },
  horizontalSplit: {
    flexDirection: 'row',
  },
  verticalSplit: {
    flexDirection: 'column',
  },
  terminalWrapper: {
    flex: 1,
  },
  splitTerminal: {
    flex: 1,
  },
  leftTerminal: {
    borderRightWidth: 1,
    borderRightColor: '#444',
  },
  rightTerminal: {
    borderLeftWidth: 1,
    borderLeftColor: '#444',
  },
  topTerminal: {
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  bottomTerminal: {
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
});

export default SplitTerminalView;