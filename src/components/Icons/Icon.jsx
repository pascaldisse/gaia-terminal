import React from 'react';
import { View, StyleSheet } from 'react-native';

// Import SVG icons
import TerminalIcon from '../../assets/icons/terminal.svg';
import SettingsIcon from '../../assets/icons/settings.svg';
import SSHIcon from '../../assets/icons/ssh.svg';
import PlusIcon from '../../assets/icons/plus.svg';

const IconStyles = {
  small: { width: 16, height: 16 },
  medium: { width: 24, height: 24 },
  large: { width: 32, height: 32 },
};

const Icon = ({ name, size = 'medium', color = '#000', style }) => {
  const iconSize = IconStyles[size] || IconStyles.medium;
  
  // Map icon names to their components
  const IconComponents = {
    terminal: TerminalIcon,
    settings: SettingsIcon,
    ssh: SSHIcon,
    plus: PlusIcon,
    // Add more icons here as they're created
  };
  
  const IconComponent = IconComponents[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <View style={[styles.iconContainer, style]}>
      <IconComponent 
        width={iconSize.width} 
        height={iconSize.height} 
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Icon;