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
    addCommand,
    getPreviousCommand,
    getNextCommand,
    resetHistoryIndex,
    environment,
    updateEnvironment,
    activeConnections,
    sshConnections
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
  }, [id, environment, addCommand, updateEnvironment, generatePrompt, sshActive, wsRef]);

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

  // Focus input when component becomes visible
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => scrollViewRef.current?.scrollToEnd({ animated: true })
    );
    
    return () => {
      keyboardDidShowListener.remove();
      // Close SSH connection if open when component unmounts
      if (wsRef && sshActive) {
        SSHService.disconnect(wsRef);
      }
    };
  }, []);

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
          blurOnSubmit={false}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="go"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.keyboardControl}
        onPress={() => Keyboard.dismiss()}
      >
        <Text style={styles.keyboardControlText}>Hide Keyboard</Text>
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