import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Terminal from '../Terminal';
import { useTerminalStore } from '../../../stores/terminalStore';
import SSHService from '../../../services/ssh-service';

// Mock the zustand store
jest.mock('../../../stores/terminalStore', () => ({
  useTerminalStore: jest.fn()
}));

// Mock the SSHService
jest.mock('../../../services/ssh-service', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendData: jest.fn(),
    resizeTerminal: jest.fn()
  }
}));

describe('Terminal Component', () => {
  // Mock store data
  const mockStore = {
    fontSize: 14,
    fontFamily: 'monospace',
    theme: {
      background: '#1a1a1a',
      foreground: '#e0e0e0',
      brightGreen: '#33ff33',
      red: '#ff3333'
    },
    addCommand: jest.fn(),
    getPreviousCommand: jest.fn(),
    getNextCommand: jest.fn(),
    resetHistoryIndex: jest.fn(),
    environment: {
      username: 'user',
      hostname: 'localhost',
      path: '~'
    },
    activeConnections: {},
    sshConnections: {}
  };

  beforeEach(() => {
    useTerminalStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders terminal with welcome message', () => {
    const { getByText } = render(<Terminal id="terminal1" visible={true} />);
    
    expect(getByText('Welcome to Spaceflight Terminal!')).toBeTruthy();
    expect(getByText('Type "help" for available commands.')).toBeTruthy();
  });

  test('handles text input correctly', () => {
    const { getByDisplayValue } = render(<Terminal id="terminal1" visible={true} />);
    
    // Find the TextInput component
    const input = getByDisplayValue('');
    
    // Simulate typing
    fireEvent.changeText(input, 'test command');
    
    // Check that the input value changed
    expect(getByDisplayValue('test command')).toBeTruthy();
  });

  test('executes command on submit', () => {
    const { getByDisplayValue, getByText } = render(<Terminal id="terminal1" visible={true} />);
    
    // Find the TextInput component
    const input = getByDisplayValue('');
    
    // Simulate typing and submitting
    fireEvent.changeText(input, 'help');
    fireEvent.submitEditing(input);
    
    // Check that the command was processed
    expect(mockStore.addCommand).toHaveBeenCalledWith('terminal1', 'help');
    expect(getByText('Available commands:')).toBeTruthy();
  });

  test('navigates command history with up/down keys', () => {
    // Mock history navigation functions
    mockStore.getPreviousCommand.mockReturnValueOnce('previous command');
    mockStore.getNextCommand.mockReturnValueOnce('next command');
    
    const { getByDisplayValue } = render(<Terminal id="terminal1" visible={true} />);
    
    // Find the TextInput component
    const input = getByDisplayValue('');
    
    // Simulate pressing up arrow key (should get previous command)
    fireEvent(input, 'onKeyPress', { 
      nativeEvent: { key: 'ArrowUp' } 
    });
    
    // Check previous command was fetched
    expect(mockStore.getPreviousCommand).toHaveBeenCalledWith('terminal1');
    
    // Simulate pressing down arrow key (should get next command)
    fireEvent(input, 'onKeyPress', { 
      nativeEvent: { key: 'ArrowDown' } 
    });
    
    // Check next command was fetched
    expect(mockStore.getNextCommand).toHaveBeenCalledWith('terminal1');
  });

  test('keyboard shortcuts work correctly', () => {
    const { getByDisplayValue } = render(<Terminal id="terminal1" visible={true} />);
    
    // Find the TextInput component
    const input = getByDisplayValue('');
    
    // Simulate pressing Ctrl+C
    fireEvent(input, 'onKeyPress', { 
      nativeEvent: { key: 'c', ctrlKey: true } 
    });
    
    // Should reset input and add new prompt
    expect(input.props.value).toBe('');
  });
  
  test('tab completion for commands works correctly', () => {
    const { getByDisplayValue, getByText } = render(<Terminal id="terminal1" visible={true} />);
    
    // Find the TextInput component
    const input = getByDisplayValue('');
    
    // Type partial command
    fireEvent.changeText(input, 'he');
    
    // Press tab key
    fireEvent(input, 'onKeyPress', { 
      nativeEvent: { key: 'Tab' },
      preventDefault: jest.fn()
    });
    
    // Should complete the command to 'help'
    expect(input.props.value).toBe('help');
  });
  
  test('terminal responds to orientation changes', () => {
    // Mock Dimensions
    const originalDimensions = require('react-native').Dimensions;
    const mockDimensions = {
      get: jest.fn().mockReturnValue({ width: 375, height: 667 }),
      addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() })
    };
    
    // Replace Dimensions with our mock
    require('react-native').Dimensions = mockDimensions;
    
    render(<Terminal id="terminal1" visible={true} />);
    
    // Check that the dimensions event listener was set up
    expect(mockDimensions.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    // Restore original Dimensions
    require('react-native').Dimensions = originalDimensions;
  });
  
  test('processes clear command correctly', () => {
    const { getByDisplayValue, queryByText } = render(<Terminal id="terminal1" visible={true} />);
    
    // Find the TextInput component
    const input = getByDisplayValue('');
    
    // Simulate typing and submitting clear command
    fireEvent.changeText(input, 'clear');
    fireEvent.submitEditing(input);
    
    // Check that the terminal output was cleared
    expect(queryByText('Welcome to Spaceflight Terminal!')).toBeNull();
  });
});