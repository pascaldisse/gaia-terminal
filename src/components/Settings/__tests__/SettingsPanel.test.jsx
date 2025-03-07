import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsPanel from '../SettingsPanel';
import { useTerminalStore } from '../../../stores/terminalStore';

// Mock the zustand store
jest.mock('../../../stores/terminalStore', () => ({
  useTerminalStore: jest.fn()
}));

describe('SettingsPanel Component', () => {
  // Mock store data
  const mockStore = {
    fontSize: 14,
    fontFamily: 'monospace',
    theme: {
      background: '#1a1a1a',
      foreground: '#e0e0e0',
      cursor: '#6c71c4',
      black: '#073642',
      red: '#dc322f',
      green: '#859900',
      yellow: '#b58900',
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#2aa198',
      white: '#eee8d5',
    },
    updateSettings: jest.fn()
  };
  
  const mockOnClose = jest.fn();

  beforeEach(() => {
    useTerminalStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders settings panel with current settings', () => {
    const { getByText } = render(
      <SettingsPanel onClose={mockOnClose} />
    );
    
    expect(getByText('Terminal Settings')).toBeTruthy();
    expect(getByText('Font Size: 14px')).toBeTruthy();
  });

  test('allows changing font size', () => {
    const { getByText } = render(
      <SettingsPanel onClose={mockOnClose} />
    );
    
    // Find the slider for font size
    const fontSizeText = getByText('Font Size: 14px');
    const slider = fontSizeText.parent.findByProps({ minimumValue: 8 });
    
    // Simulate changing the slider
    fireEvent(slider, 'onValueChange', 18);
    
    // Check that the displayed value updated
    expect(getByText('Font Size: 18px')).toBeTruthy();
  });

  test('allows changing font family', () => {
    const { getByDisplayValue } = render(
      <SettingsPanel onClose={mockOnClose} />
    );
    
    // Find the font family input
    const fontFamilyInput = getByDisplayValue('monospace');
    
    // Change the value
    fireEvent.changeText(fontFamilyInput, 'Courier New');
    
    // Check that the value updated
    expect(getByDisplayValue('Courier New')).toBeTruthy();
  });

  test('saves settings when save button is clicked', () => {
    const { getByText, getByDisplayValue } = render(
      <SettingsPanel onClose={mockOnClose} />
    );
    
    // Change some settings
    fireEvent.changeText(getByDisplayValue('monospace'), 'Courier New');
    
    // Find the Save Settings button and click it
    fireEvent.press(getByText('Save Settings'));
    
    // Check that settings were updated and modal closed
    expect(mockStore.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        fontFamily: 'Courier New',
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes without saving when cancel button is clicked', () => {
    const { getByText, getByDisplayValue } = render(
      <SettingsPanel onClose={mockOnClose} />
    );
    
    // Change some settings
    fireEvent.changeText(getByDisplayValue('monospace'), 'Courier New');
    
    // Find the Cancel button and click it
    fireEvent.press(getByText('Cancel'));
    
    // Check that settings were not updated but modal closed
    expect(mockStore.updateSettings).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('preset themes can be selected', () => {
    const { getByText } = render(
      <SettingsPanel onClose={mockOnClose} />
    );
    
    // Find a preset theme and click it
    fireEvent.press(getByText('Dark Solarized'));
    
    // Save the settings
    fireEvent.press(getByText('Save Settings'));
    
    // Check that the theme was updated with the preset
    expect(mockStore.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: expect.objectContaining({
          background: '#002b36',
          foreground: '#839496',
        })
      })
    );
  });
});