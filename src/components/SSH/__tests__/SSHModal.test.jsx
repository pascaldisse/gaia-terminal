import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SSHModal from '../SSHModal';
import { useTerminalStore } from '../../../stores/terminalStore';

// Mock the zustand store
jest.mock('../../../stores/terminalStore', () => ({
  useTerminalStore: jest.fn()
}));

describe('SSHModal Component', () => {
  // Mock store data
  const mockStore = {
    activeTab: 'tab1',
    addSSHConnection: jest.fn().mockReturnValue('conn123'),
    setActiveConnection: jest.fn(),
    getSavedNamedConnections: jest.fn().mockReturnValue([
      { id: 'saved1', name: 'Saved Connection 1', host: 'example.com', username: 'user1' }
    ])
  };
  
  const mockOnClose = jest.fn();

  beforeEach(() => {
    useTerminalStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders SSH connection form', () => {
    const { getByText, getByPlaceholderText } = render(
      <SSHModal onClose={mockOnClose} />
    );
    
    expect(getByText('SSH Connection')).toBeTruthy();
    expect(getByPlaceholderText('hostname or IP')).toBeTruthy();
    expect(getByPlaceholderText('username')).toBeTruthy();
    expect(getByText('Connect')).toBeTruthy();
  });

  test('shows saved connections', () => {
    const { getByText } = render(
      <SSHModal onClose={mockOnClose} />
    );
    
    expect(getByText('Saved Connections')).toBeTruthy();
    expect(getByText('Saved Connection 1')).toBeTruthy();
  });

  test('validates form before connecting', () => {
    const { getByText, getByPlaceholderText } = render(
      <SSHModal onClose={mockOnClose} />
    );
    
    // Try to connect without filling in required fields
    fireEvent.press(getByText('Connect'));
    
    // Check that the modal didn't close (validation failed)
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // Fill in required fields
    fireEvent.changeText(getByPlaceholderText('hostname or IP'), 'test.example.com');
    fireEvent.changeText(getByPlaceholderText('username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('password'), 'password123');
    
    // Now try to connect
    fireEvent.press(getByText('Connect'));
    
    // Check that a connection was added and activated
    expect(mockStore.addSSHConnection).toHaveBeenCalledWith(expect.objectContaining({
      host: 'test.example.com',
      username: 'testuser',
      password: 'password123'
    }));
    expect(mockStore.setActiveConnection).toHaveBeenCalledWith('tab1', 'conn123');
    
    // Check that the modal closed
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('loads saved connection when selected', () => {
    const { getByText, getByPlaceholderText } = render(
      <SSHModal onClose={mockOnClose} />
    );
    
    // Select a saved connection
    fireEvent.press(getByText('Saved Connection 1'));
    
    // Check that the form was filled with saved connection data
    expect(getByPlaceholderText('hostname or IP').props.value).toBe('example.com');
    expect(getByPlaceholderText('username').props.value).toBe('user1');
  });

  test('can toggle between password and private key authentication', () => {
    const { getByText, queryByPlaceholderText } = render(
      <SSHModal onClose={mockOnClose} />
    );
    
    // Initially should show password input
    expect(queryByPlaceholderText('password')).toBeTruthy();
    expect(queryByPlaceholderText('Paste your private key here')).toBeFalsy();
    
    // Find and toggle the authentication switch
    const privateKeyText = getByText('Private Key');
    // Find the switch near the "Private Key" text and toggle it
    const switchElement = privateKeyText.parent.findByProps({ thumbColor: '#f4f3f4' });
    fireEvent(switchElement, 'onValueChange');
    
    // Now should show private key input instead of password
    expect(queryByPlaceholderText('password')).toBeFalsy();
    expect(queryByPlaceholderText('Paste your private key here')).toBeTruthy();
  });
});