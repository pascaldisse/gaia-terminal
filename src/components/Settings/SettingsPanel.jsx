import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  ScrollView,
  TextInput,
  Slider,
  FlatList
} from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';

// Preset themes
const presetThemes = {
  'Dark Solarized': {
    background: '#002b36',
    foreground: '#839496',
    cursor: '#93a1a1',
    selection: 'rgba(147, 161, 161, 0.3)',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3'
  },
  'Light Solarized': {
    background: '#fdf6e3',
    foreground: '#657b83',
    cursor: '#586e75',
    selection: 'rgba(88, 110, 117, 0.3)',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3'
  },
  'Monokai': {
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    selection: 'rgba(73, 72, 62, 0.5)',
    black: '#272822',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
    brightBlack: '#75715e',
    brightRed: '#f92672',
    brightGreen: '#a6e22e',
    brightYellow: '#f4bf75',
    brightBlue: '#66d9ef',
    brightMagenta: '#ae81ff',
    brightCyan: '#a1efe4',
    brightWhite: '#f9f8f5'
  },
  'Nord': {
    background: '#2e3440',
    foreground: '#d8dee9',
    cursor: '#d8dee9',
    selection: 'rgba(67, 76, 94, 0.5)',
    black: '#3b4252',
    red: '#bf616a',
    green: '#a3be8c',
    yellow: '#ebcb8b',
    blue: '#81a1c1',
    magenta: '#b48ead',
    cyan: '#88c0d0',
    white: '#e5e9f0',
    brightBlack: '#4c566a',
    brightRed: '#bf616a',
    brightGreen: '#a3be8c',
    brightYellow: '#ebcb8b',
    brightBlue: '#81a1c1',
    brightMagenta: '#b48ead',
    brightCyan: '#8fbcbb',
    brightWhite: '#eceff4'
  },
  'Dracula': {
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    selection: 'rgba(68, 71, 90, 0.5)',
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#bbbbbb',
    brightBlack: '#555555',
    brightRed: '#ff5555',
    brightGreen: '#50fa7b',
    brightYellow: '#f1fa8c',
    brightBlue: '#bd93f9',
    brightMagenta: '#ff79c6',
    brightCyan: '#8be9fd',
    brightWhite: '#ffffff'
  },
  'Tokyo Night': {
    background: '#1a1b26',
    foreground: '#a9b1d6',
    cursor: '#c0caf5',
    selection: 'rgba(73, 84, 115, 0.5)',
    black: '#32344a',
    red: '#f7768e',
    green: '#9ece6a',
    yellow: '#e0af68',
    blue: '#7aa2f7',
    magenta: '#ad8ee6',
    cyan: '#449dab',
    white: '#787c99',
    brightBlack: '#444b6a',
    brightRed: '#ff7a93',
    brightGreen: '#b9f27c',
    brightYellow: '#ff9e64',
    brightBlue: '#7da6ff',
    brightMagenta: '#bb9af7',
    brightCyan: '#0db9d7',
    brightWhite: '#acb0d0'
  },
  'Oceanic Next': {
    background: '#1b2b34',
    foreground: '#cdd3de',
    cursor: '#c0c5ce',
    selection: 'rgba(64, 89, 109, 0.5)',
    black: '#343d46',
    red: '#ec5f67',
    green: '#99c794',
    yellow: '#fac863',
    blue: '#6699cc',
    magenta: '#c594c5',
    cyan: '#5fb3b3',
    white: '#a7adba',
    brightBlack: '#65737e',
    brightRed: '#ec5f67',
    brightGreen: '#99c794',
    brightYellow: '#fac863',
    brightBlue: '#6699cc',
    brightMagenta: '#c594c5',
    brightCyan: '#5fb3b3',
    brightWhite: '#d8dee9'
  },
  'Ayu Dark': {
    background: '#0a0e14',
    foreground: '#b3b1ad',
    cursor: '#e6b450',
    selection: 'rgba(35, 40, 48, 0.5)',
    black: '#01060e',
    red: '#ea6c73',
    green: '#91b362',
    yellow: '#f9af4f',
    blue: '#53bdfa',
    magenta: '#fae994',
    cyan: '#90e1c6',
    white: '#c7c7c7',
    brightBlack: '#686868',
    brightRed: '#f07178',
    brightGreen: '#c2d94c',
    brightYellow: '#ffb454',
    brightBlue: '#59c2ff',
    brightMagenta: '#ffee99',
    brightCyan: '#95e6cb',
    brightWhite: '#ffffff'
  }
};

// Color picker component
const ColorPicker = ({ color, onColorChange, label }) => {
  const colors = [
    '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff',
    '#073642', '#dc322f', '#859900', '#b58900', '#268bd2', '#d33682', '#2aa198', '#eee8d5',
    '#002b36', '#cb4b16', '#586e75', '#657b83', '#839496', '#6c71c4', '#93a1a1', '#fdf6e3'
  ];

  return (
    <View style={styles.colorPickerContainer}>
      <View style={styles.colorLabelContainer}>
        <Text style={styles.colorLabel}>{label}</Text>
        <View style={[styles.colorPreview, { backgroundColor: color }]} />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.colorScroll}
      >
        <View style={styles.colorGrid}>
          {colors.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                c === color && styles.selectedSwatch
              ]}
              onPress={() => onColorChange(c)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

function SettingsPanel({ onClose }) {
  const { fontSize, fontFamily, theme, updateSettings } = useTerminalStore();
  
  const [settings, setSettings] = useState({
    fontSize,
    fontFamily,
    theme: { ...theme },
    darkMode: theme.background.match(/^#[0-9a-f]{6}$/i) ? 
      parseInt(theme.background.substring(1), 16) < 0x808080 : true
  });
  
  const handleFontSizeChange = (value) => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.round(value)
    }));
  };
  
  const handleFontFamilyChange = (text) => {
    setSettings(prev => ({
      ...prev,
      fontFamily: text
    }));
  };
  
  const handleColorChange = (key, color) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: color
      }
    }));
  };
  
  const saveSettings = () => {
    updateSettings({
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      theme: settings.theme
    });
    onClose();
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Terminal Settings</Text>
          
          <ScrollView style={styles.settingsContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Display</Text>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Font Size: {settings.fontSize}px</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={8}
                  maximumValue={24}
                  step={1}
                  value={settings.fontSize}
                  onValueChange={handleFontSizeChange}
                  minimumTrackTintColor="#4CAF50"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="#4CAF50"
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Font Family</Text>
                <TextInput
                  style={styles.input}
                  value={settings.fontFamily}
                  onChangeText={handleFontFamilyChange}
                  placeholder="Font family name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terminal Colors</Text>
              
              {/* Dark Mode Toggle */}
              <View style={styles.settingItem}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.darkMode ? styles.toggleActive : styles.toggleInactive
                    ]}
                    onPress={() => {
                      // Toggle dark mode and apply a suitable theme
                      const newDarkMode = !settings.darkMode;
                      const newTheme = newDarkMode ? 
                        presetThemes['Tokyo Night'] : 
                        presetThemes['Light Solarized'];
                      
                      setSettings(prev => ({
                        ...prev,
                        darkMode: newDarkMode,
                        theme: { ...newTheme }
                      }));
                    }}
                  >
                    <View style={[
                      styles.toggleHandle,
                      settings.darkMode ? styles.toggleHandleRight : styles.toggleHandleLeft
                    ]} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.presetThemesContainer}>
                <Text style={styles.settingLabel}>Preset Themes</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.presetThemesScroll}
                >
                  {Object.entries(presetThemes)
                    // Filter themes based on dark mode
                    .filter(([_, theme]) => {
                      // Check if theme matches current dark mode setting
                      const isThemeDark = parseInt(theme.background.substring(1), 16) < 0x808080;
                      return settings.darkMode === isThemeDark;
                    })
                    .map(([name, theme]) => (
                    <TouchableOpacity
                      key={name}
                      style={[
                        styles.presetThemeItem,
                        { backgroundColor: theme.background }
                      ]}
                      onPress={() => setSettings(prev => ({
                        ...prev,
                        theme: { ...theme }
                      }))}
                    >
                      <View style={styles.presetThemeColors}>
                        <View style={[styles.themeColorSample, { backgroundColor: theme.red }]} />
                        <View style={[styles.themeColorSample, { backgroundColor: theme.green }]} />
                        <View style={[styles.themeColorSample, { backgroundColor: theme.yellow }]} />
                        <View style={[styles.themeColorSample, { backgroundColor: theme.blue }]} />
                      </View>
                      <Text style={[
                        styles.presetThemeName,
                        { color: theme.foreground }
                      ]}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <ColorPicker
                label="Background"
                color={settings.theme.background}
                onColorChange={(color) => handleColorChange('background', color)}
              />
              
              <ColorPicker
                label="Foreground"
                color={settings.theme.foreground}
                onColorChange={(color) => handleColorChange('foreground', color)}
              />
              
              <ColorPicker
                label="Cursor"
                color={settings.theme.cursor}
                onColorChange={(color) => handleColorChange('cursor', color)}
              />
              
              <Text style={styles.colorCategoryLabel}>ANSI Colors</Text>
              
              <View style={styles.colorGrid}>
                <ColorPicker
                  label="Black"
                  color={settings.theme.black}
                  onColorChange={(color) => handleColorChange('black', color)}
                />
                
                <ColorPicker
                  label="Red"
                  color={settings.theme.red}
                  onColorChange={(color) => handleColorChange('red', color)}
                />
                
                <ColorPicker
                  label="Green"
                  color={settings.theme.green}
                  onColorChange={(color) => handleColorChange('green', color)}
                />
                
                <ColorPicker
                  label="Yellow"
                  color={settings.theme.yellow}
                  onColorChange={(color) => handleColorChange('yellow', color)}
                />
                
                <ColorPicker
                  label="Blue"
                  color={settings.theme.blue}
                  onColorChange={(color) => handleColorChange('blue', color)}
                />
                
                <ColorPicker
                  label="Magenta"
                  color={settings.theme.magenta}
                  onColorChange={(color) => handleColorChange('magenta', color)}
                />
                
                <ColorPicker
                  label="Cyan"
                  color={settings.theme.cyan}
                  onColorChange={(color) => handleColorChange('cyan', color)}
                />
                
                <ColorPicker
                  label="White"
                  color={settings.theme.white}
                  onColorChange={(color) => handleColorChange('white', color)}
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={saveSettings}
            >
              <Text style={styles.buttonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleInactive: {
    backgroundColor: '#777',
  },
  toggleHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  toggleHandleLeft: {
    alignSelf: 'flex-start',
  },
  toggleHandleRight: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  settingsContainer: {
    maxHeight: 450,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingItem: {
    marginBottom: 15,
  },
  settingLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  // Preset themes styles
  presetThemesContainer: {
    marginBottom: 20,
  },
  presetThemesScroll: {
    flexDirection: 'row',
  },
  presetThemeItem: {
    width: 120,
    height: 80,
    marginRight: 10,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'space-between',
  },
  presetThemeColors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeColorSample: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  presetThemeName: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Color picker styles
  colorCategoryLabel: {
    color: '#fff',
    fontSize: 14,
    marginVertical: 10,
  },
  colorPickerContainer: {
    marginBottom: 15,
  },
  colorLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorLabel: {
    color: '#ccc',
    fontSize: 14,
    flex: 1,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  colorScroll: {
    maxHeight: 40,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    margin: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedSwatch: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#444',
    marginRight: 10,
  },
  buttonSave: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default SettingsPanel;