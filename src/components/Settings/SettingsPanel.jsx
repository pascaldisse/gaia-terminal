import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  ScrollView,
  TextInput,
  Slider
} from 'react-native';
import { useTerminalStore } from '../../stores/terminalStore';

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
    theme: { ...theme }
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