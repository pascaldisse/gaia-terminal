import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity, 
  Keyboard, 
  Dimensions 
} from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';
import SSHService from '../../services/ssh-service';

const Terminal = ({ id, visible }) => {
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    { text: 'Welcome to Spaceflight Terminal!', type: 'system' },
    { text: 'Type "help" for available commands.', type: 'system' },
    { text: '', type: 'system' }
  ]);
  const [wsRef, setWsRef] = useState(null);
  const [sshActive, setSshActive] = useState(false);
  
  const {
    fontSize,
    fontFamily,
    theme,
    debugMode,
    addCommand,
    getPreviousCommand,
    getNextCommand,
    resetHistoryIndex,
    environment,
    updateEnvironment,
    activeConnections,
    sshConnections,
    toggleDebugMode
  } = useTerminalStore();

  // Generate prompt text
  const generatePrompt = useCallback(() => {
    const { username, hostname, path } = environment;
    return `${username}@${hostname}:${path}$ `;
  }, [environment]);

  // Process commands
  const processCommand = useCallback((command) => {
    if (!command.trim()) return;
    
    // Add command to history
    addCommand(id, command);
    
    // Add command to output display
    setOutput(prev => [
      ...prev,
      { text: `${generatePrompt()}${command}`, type: 'input' }
    ]);
    
    // Check if we're in SSH mode
    if (sshActive && wsRef) {
      // Send command to SSH server using the service
      SSHService.sendData(wsRef, `${command}\r`);
      return;
    }
    
    // Process local commands
    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();
    
    switch (cmd) {
      case 'help':
        setOutput(prev => [
          ...prev,
          { text: 'Available commands:', type: 'output' },
          { text: '  help        - Show this help', type: 'output' },
          { text: '  clear       - Clear the terminal', type: 'output' },
          { text: '  echo [text] - Echo text to the terminal', type: 'output' },
          { text: '  cd [path]   - Change directory (simulated)', type: 'output' },
          { text: '  ls          - List files (simulated)', type: 'output' },
          { text: '  pwd         - Print working directory', type: 'output' },
          { text: '  debug       - Toggle debug mode for keyboard input', type: 'output' },
          { text: '  exit        - Close current SSH connection or tab', type: 'output' },
          { text: '', type: 'output' }
        ]);
        break;
        
      case 'clear':
        setOutput([]);
        break;
        
      case 'echo':
        setOutput(prev => [
          ...prev,
          { text: args.slice(1).join(' '), type: 'output' }
        ]);
        break;
        
      case 'cd':
        // Simulate directory change
        const newPath = args[1] || '~';
        if (newPath === '~' || newPath === '/home/user') {
          updateEnvironment({ path: '~' });
        } else if (newPath === '..') {
          const currentPath = environment.path;
          if (currentPath !== '~' && currentPath !== '/') {
            const parts = currentPath.split('/');
            parts.pop();
            updateEnvironment({ path: parts.join('/') || '/' });
          }
        } else if (newPath.startsWith('/')) {
          updateEnvironment({ path: newPath });
        } else {
          const currentPath = environment.path === '~' ? '/home/user' : environment.path;
          const resolvedPath = `${currentPath}/${newPath}`;
          updateEnvironment({ path: resolvedPath });
        }
        break;
        
      case 'ls':
        // Simulate file listing based on current path
        if (environment.path === '~' || environment.path === '/home/user') {
          setOutput(prev => [
            ...prev,
            { text: 'Documents  Downloads  Pictures  Projects', type: 'output' }
          ]);
        } else if (environment.path === '/') {
          setOutput(prev => [
            ...prev,
            { text: 'bin  etc  home  usr  var', type: 'output' }
          ]);
        } else if (environment.path.includes('Projects')) {
          setOutput(prev => [
            ...prev,
            { text: 'gaia-terminal-mobile  personal-site  react-app', type: 'output' }
          ]);
        } else {
          setOutput(prev => [
            ...prev,
            { text: 'file1.txt  file2.js  folder1  folder2', type: 'output' }
          ]);
        }
        break;
        
      case 'pwd':
        const displayPath = environment.path === '~' ? '/home/user' : environment.path;
        setOutput(prev => [
          ...prev,
          { text: displayPath, type: 'output' }
        ]);
        break;
        
      case 'debug':
        toggleDebugMode();
        setOutput(prev => [
          ...prev,
          { text: `Debug mode ${!debugMode ? 'enabled' : 'disabled'}`, type: 'system' }
        ]);
        break;
        
      case 'exit':
        if (sshActive && wsRef) {
          wsRef.close();
          setSshActive(false);
          updateEnvironment({
            hostname: 'localhost',
            username: 'user',
            path: '~'
          });
          setOutput(prev => [
            ...prev,
            { text: 'SSH connection closed', type: 'system' }
          ]);
        }
        break;
        
      default:
        setOutput(prev => [
          ...prev,
          { text: `Command not found: ${cmd}`, type: 'error' }
        ]);
    }
  }, [id, environment, addCommand, updateEnvironment, generatePrompt, sshActive, wsRef, debugMode, toggleDebugMode]);

  // Handle SSH connection changes
  useEffect(() => {
    const connectionId = activeConnections[id];
    
    // Close existing connection if open
    if (wsRef && sshActive) {
      SSHService.disconnect(wsRef);
      setWsRef(null);
      setSshActive(false);
    }
    
    // If we have a new connection, set it up
    if (connectionId) {
      const connection = sshConnections[connectionId];
      if (connection) {
        connectSSH(connection);
      }
    }
  }, [activeConnections, id, sshConnections]);

  // Connect to SSH
  const connectSSH = (connection) => {
    setOutput(prev => [
      ...prev,
      { text: `Connecting to ${connection.host}...`, type: 'system' }
    ]);
    
    // Get current terminal dimensions - estimate based on container size
    const { width, height } = Dimensions.get('window');
    const cols = Math.floor(width / (fontSize * 0.6));
    const rows = Math.floor(height / fontSize);
    
    // Set up connection details
    const connectionDetails = {
      ...connection,
      rows,
      cols
    };
    
    // Connect using SSH service
    const connectionId = SSHService.connect(
      connectionDetails,
      // onData
      (data) => {
        setOutput(prev => [
          ...prev,
          { text: data, type: 'output' }
        ]);
      },
      // onConnect
      () => {
        setSshActive(true);
        setOutput(prev => [
          ...prev,
          { text: `Connected to ${connection.host}`, type: 'system' }
        ]);
        
        // Update environment for prompt
        updateEnvironment({
          hostname: connection.host,
          username: connection.username,
          path: '~'
        });
      },
      // onClose
      () => {
        setOutput(prev => [
          ...prev,
          { text: 'Connection closed', type: 'system' }
        ]);
        setSshActive(false);
        
        // Reset environment for prompt
        updateEnvironment({
          hostname: 'localhost',
          username: 'user',
          path: '~'
        });
      },
      // onError
      (message) => {
        setOutput(prev => [
          ...prev,
          { text: `Error: ${message}`, type: 'error' }
        ]);
        setSshActive(false);
      }
    );
    
    // Store the connection ID for later use
    setWsRef(connectionId);
  };

  // Autoscroll to bottom when output changes
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [output]);

  // Handle command submission
  const handleSubmit = () => {
    processCommand(input);
    setInput('');
    resetHistoryIndex(id);
  };
  
  // Handle special key presses
  const handleKeyPress = (e) => {
    // Log detailed key press info for debugging
    const { key, keyCode, code, ctrlKey, metaKey, shiftKey, altKey } = e.nativeEvent;
    console.log('Key pressed:', { 
      key, 
      keyCode, 
      code,
      modifiers: {
        ctrl: ctrlKey,
        meta: metaKey,
        shift: shiftKey,
        alt: altKey
      } 
    });
    
    // Add debug output to terminal if debug mode is enabled
    if (useTerminalStore.getState().debugMode) {
      setOutput(prev => [
        ...prev,
        { text: `Key: ${key || 'unknown'}, Code: ${code || keyCode || 'unknown'}`, type: 'system' }
      ]);
    }
    
    // Handle command history navigation with arrow keys
    if (key === 'ArrowUp' || code === 'ArrowUp' || keyCode === 38) {
      const prevCmd = getPreviousCommand(id);
      if (prevCmd !== undefined) setInput(prevCmd);
      return;
    }
    
    if (key === 'ArrowDown' || code === 'ArrowDown' || keyCode === 40) {
      const nextCmd = getNextCommand(id);
      if (nextCmd !== undefined) setInput(nextCmd);
      return;
    }
    
    // Handle Ctrl+C to cancel current input
    if ((ctrlKey && (key === 'c' || code === 'KeyC' || keyCode === 67))) {
      setOutput(prev => [
        ...prev,
        { text: `${generatePrompt()}${input}^C`, type: 'input' },
      ]);
      setInput('');
      return;
    }
    
    // Handle Ctrl+L to clear screen
    if ((ctrlKey && (key === 'l' || code === 'KeyL' || keyCode === 76))) {
      setOutput([]);
      return;
    }
    
    // Handle Tab completion
    if (key === 'Tab' || code === 'Tab' || keyCode === 9) {
      // Prevent default tab behavior (focus change)
      e.preventDefault?.();
      
      if (input.trim()) {
        // Get current word being typed
        const words = input.split(' ');
        const currentWord = words[words.length - 1];
        
        // Get command suggestions based on context
        let suggestions = [];
        
        // If this is the first word (command), suggest from available commands
        if (words.length === 1) {
          const commands = ['help', 'clear', 'echo', 'cd', 'ls', 'pwd', 'debug', 'exit'];
          suggestions = commands.filter(cmd => cmd.startsWith(currentWord.toLowerCase()));
        } 
        // If command is 'cd', suggest directories
        else if (words[0] === 'cd') {
          // Simulate directory suggestions based on current path
          let dirs = [];
          
          if (environment.path === '~' || environment.path === '/home/user') {
            dirs = ['Documents/', 'Downloads/', 'Pictures/', 'Projects/'];
          } else if (environment.path === '/') {
            dirs = ['bin/', 'etc/', 'home/', 'usr/', 'var/'];
          } else if (environment.path.includes('Projects')) {
            dirs = ['gaia-terminal-mobile/', 'personal-site/', 'react-app/'];
          } else {
            dirs = ['folder1/', 'folder2/'];
          }
          
          suggestions = dirs.filter(dir => dir.toLowerCase().startsWith(currentWord.toLowerCase()));
        }
        
        // Apply completion if we have exactly one match
        if (suggestions.length === 1) {
          words[words.length - 1] = suggestions[0];
          setInput(words.join(' '));
        } 
        // Show options if we have multiple matches
        else if (suggestions.length > 1) {
          // Add command to output display
          setOutput(prev => [
            ...prev,
            { text: `${generatePrompt()}${input}`, type: 'input' },
            { text: suggestions.join('  '), type: 'system' }
          ]);
        }
      }
      return;
    }
  };

  // Focus input when component becomes visible
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Set up key event handling and orientation changes
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => scrollViewRef.current?.scrollToEnd({ animated: true })
    );
    
    // Special handler for catching Android hardware keyboard events
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (debugMode) {
          setOutput(prev => [
            ...prev,
            { text: 'Keyboard hidden', type: 'system' }
          ]);
        }
      }
    );
    
    // Handle terminal resize on orientation change or window resize
    const handleResize = () => {
      const { width, height } = Dimensions.get('window');
      const cols = Math.floor(width / (fontSize * 0.6));
      const rows = Math.floor(height / fontSize);
      
      if (debugMode) {
        console.log('Terminal resize:', { cols, rows, width, height });
      }
      
      // If we have an active SSH connection, send resize info
      if (sshActive && wsRef) {
        SSHService.resizeTerminal(wsRef, cols, rows);
      }
    };
    
    // Create listener for dimension changes
    const dimensionsListener = Dimensions.addEventListener('change', handleResize);
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      dimensionsListener.remove();
      
      // Close SSH connection if open when component unmounts
      if (wsRef && sshActive) {
        SSHService.disconnect(wsRef);
      }
    };
  }, [debugMode, wsRef, sshActive, fontSize]);

  // Text color map
  const textColorMap = {
    system: '#8a8a8a',
    input: theme.brightGreen || '#33ff33',
    output: theme.foreground || '#ffffff',
    error: theme.red || '#ff3333'
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={[styles.outputContainer, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.outputContent}
      >
        {output.map((line, index) => (
          <Text
            key={index}
            style={[
              styles.outputText,
              { 
                color: textColorMap[line.type],
                fontFamily: fontFamily || 'monospace',
                fontSize
              }
            ]}
          >
            {line.text}
          </Text>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <Text style={[
          styles.promptText,
          { 
            color: theme.brightGreen || '#33ff33',
            fontFamily: fontFamily || 'monospace',
            fontSize
          }
        ]}>
          {generatePrompt()}
        </Text>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { 
              color: theme.foreground || '#ffffff',
              fontFamily: fontFamily || 'monospace',
              fontSize
            }
          ]}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSubmit}
          onKeyPress={handleKeyPress}
          // Handle selection changes to better track caret position
          onSelectionChange={(e) => {
            if (debugMode) {
              console.log('Selection changed:', e.nativeEvent.selection);
            }
          }}
          // Handle content size changes to adjust scrolling if needed
          onContentSizeChange={() => {
            if (debugMode) {
              console.log('Content size changed');
            }
          }}
          // Handle text input to log each character
          onTextInput={(e) => {
            if (debugMode) {
              console.log('Text input:', e.nativeEvent.text);
            }
          }}
          blurOnSubmit={false}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="go"
          // Enable keyboard tracking in debug mode
          keyboardType={debugMode ? "visible-password" : "default"}
          caretHidden={false}
          contextMenuHidden={false}
          // High text content priority for keyboard shortcuts
          textContentType="none"
          importantForAutofill="no"
        />
      </View>
      
      <TouchableOpacity 
        style={[
          styles.keyboardControl,
          debugMode ? { backgroundColor: 'rgba(0, 150, 0, 0.7)' } : {}
        ]}
        onPress={() => Keyboard.dismiss()}
      >
        <Text style={styles.keyboardControlText}>
          {debugMode ? 'Debug: ON - Hide Keyboard' : 'Hide Keyboard'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  outputContainer: {
    flex: 1,
    padding: 8,
  },
  outputContent: {
    paddingBottom: 16,
  },
  outputText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#111',
  },
  promptText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    padding: 4,
    color: '#fff',
  },
  keyboardControl: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(100, 100, 100, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  keyboardControlText: {
    color: 'white',
    fontSize: 12,
  }
});

export default Terminal;