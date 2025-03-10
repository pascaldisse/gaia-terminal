import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text,
  PanResponder,
  Animated
} from 'react-native';
import Terminal from './Terminal';
import Icon from '../Icons/Icon';
import { useTerminalStore } from '../../stores/terminalStore';

const SplitTerminalView = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [splitMode, setSplitMode] = useState('none'); // 'none', 'horizontal', 'vertical'
  const [splitRatio, setSplitRatio] = useState(0.5); // Default to 50/50 split
  const { tabs, activeTab, addTab } = useTerminalStore();
  
  // For resizable splitting
  const panValue = useRef(new Animated.Value(0.5)).current;
  const dividerRef = useRef(null);
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  
  // Set up pan responder for divider between panes
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store the current position
        panValue.setOffset(splitRatio);
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate the new split ratio based on drag
        let newRatio;
        if (splitMode === 'horizontal') {
          newRatio = panValue.getOffset() + gestureState.dx / windowDimensions.width;
        } else {
          newRatio = panValue.getOffset() + gestureState.dy / windowDimensions.height;
        }
        
        // Clamp the ratio between 0.2 and 0.8 to prevent either pane from becoming too small
        newRatio = Math.max(0.2, Math.min(0.8, newRatio));
        setSplitRatio(newRatio);
      },
      onPanResponderRelease: () => {
        // Reset the offset
        panValue.flattenOffset();
      }
    })
  ).current;
  
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
  
  // Update orientation and dimensions on change
  useEffect(() => {
    checkOrientation();
    
    const dimensionListener = Dimensions.addEventListener('change', () => {
      const dimensions = Dimensions.get('window');
      setWindowDimensions(dimensions);
      const isLandscape = dimensions.width > dimensions.height;
      setIsLandscape(isLandscape);
      
      // Auto switch to horizontal split in landscape, but only if already in split mode
      if (splitMode !== 'none') {
        setSplitMode(isLandscape ? 'horizontal' : 'vertical');
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
  
  // Calculate styles for panes based on splitRatio
  const getFirstPaneStyle = () => {
    if (splitMode === 'horizontal') {
      return { flex: splitRatio };
    } else if (splitMode === 'vertical') {
      return { flex: splitRatio };
    }
    return { flex: 1 };
  };
  
  const getSecondPaneStyle = () => {
    if (splitMode === 'horizontal') {
      return { flex: 1 - splitRatio };
    } else if (splitMode === 'vertical') {
      return { flex: 1 - splitRatio };
    }
    return { flex: 1 };
  };
  
  // Render resizable divider between panes
  const renderDivider = () => {
    if (splitMode === 'none') return null;
    
    return (
      <Animated.View
        ref={dividerRef}
        {...panResponder.panHandlers}
        style={[
          styles.divider,
          splitMode === 'horizontal' ? styles.horizontalDivider : styles.verticalDivider
        ]}
      >
        <View style={styles.dividerHandle} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSplitControls()}
      
      <View style={[
        styles.terminalsContainer,
        splitMode === 'horizontal' && styles.horizontalSplit,
        splitMode === 'vertical' && styles.verticalSplit
      ]}>
        {terminalIds.map((id, index) => (
          <React.Fragment key={id}>
            <View 
              style={[
                styles.terminalWrapper,
                splitMode !== 'none' && styles.splitTerminal,
                index === 0 ? getFirstPaneStyle() : getSecondPaneStyle(),
                index === 0 && splitMode === 'horizontal' && styles.leftTerminal,
                index === 0 && splitMode === 'vertical' && styles.topTerminal,
                index === 1 && splitMode === 'horizontal' && styles.rightTerminal,
                index === 1 && splitMode === 'vertical' && styles.bottomTerminal,
              ]}
            >
              <Terminal id={id} visible={true} />
            </View>
            {index === 0 && splitMode !== 'none' && renderDivider()}
          </React.Fragment>
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
    // border is now on the divider
  },
  rightTerminal: {
    // border is now on the divider
  },
  topTerminal: {
    // border is now on the divider
  },
  bottomTerminal: {
    // border is now on the divider
  },
  // Divider styles
  divider: {
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  horizontalDivider: {
    width: 8,
    marginHorizontal: -4,
    cursor: 'col-resize',
  },
  verticalDivider: {
    height: 8,
    marginVertical: -4,
    cursor: 'row-resize',
  },
  dividerHandle: {
    backgroundColor: '#777',
    width: 24,
    height: 4,
    borderRadius: 2,
  },
});

export default SplitTerminalView;