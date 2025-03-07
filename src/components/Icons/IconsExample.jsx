import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from './Icon';

const IconsExample = () => {
  // List of all available icons
  const allIcons = ['terminal', 'settings', 'ssh', 'plus'];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Icon Examples</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Icon Sizes</Text>
        <View style={styles.row}>
          <View style={styles.iconWrapper}>
            <Icon name="terminal" size="small" color="#000" />
            <Text style={styles.label}>Small</Text>
          </View>
          
          <View style={styles.iconWrapper}>
            <Icon name="terminal" size="medium" color="#000" />
            <Text style={styles.label}>Medium</Text>
          </View>
          
          <View style={styles.iconWrapper}>
            <Icon name="terminal" size="large" color="#000" />
            <Text style={styles.label}>Large</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Icon Colors</Text>
        <View style={styles.row}>
          <View style={styles.iconWrapper}>
            <Icon name="terminal" color="#000000" />
            <Text style={styles.label}>Black</Text>
          </View>
          
          <View style={styles.iconWrapper}>
            <Icon name="terminal" color="#FF0000" />
            <Text style={styles.label}>Red</Text>
          </View>
          
          <View style={styles.iconWrapper}>
            <Icon name="terminal" color="#0000FF" />
            <Text style={styles.label}>Blue</Text>
          </View>
          
          <View style={styles.iconWrapper}>
            <Icon name="terminal" color="#00AA00" />
            <Text style={styles.label}>Green</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Icons</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {allIcons.map(iconName => (
              <View key={iconName} style={styles.iconWrapper}>
                <Icon name={iconName} color="#000" />
                <Text style={styles.label}>{iconName}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#444',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconWrapper: {
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 16,
    width: 60,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default IconsExample;