/**
 * Post-install script to help with React Native setup
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '🚀 Running Spaceflight Terminal post-install setup...');

// Check if iOS directory exists
const iosDir = path.join(__dirname, '..', 'ios');
if (!fs.existsSync(iosDir)) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  iOS directory not found. Make sure to run react-native init first.');
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ iOS directory found');
}

// Check if Android directory exists
const androidDir = path.join(__dirname, '..', 'android');
if (!fs.existsSync(androidDir)) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Android directory not found. Make sure to run react-native init first.');
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ Android directory found');
}

// Check if react-native CLI is installed
try {
  execSync('npx react-native --version', { stdio: 'ignore' });
  console.log('\x1b[32m%s\x1b[0m', '✅ React Native CLI is installed');
} catch (error) {
  console.log('\x1b[31m%s\x1b[0m', '❌ React Native CLI is not installed properly');
  console.log('\x1b[36m%s\x1b[0m', '   Install it globally with: npm install -g @react-native-community/cli');
}

// Check node modules directory
const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  console.log('\x1b[31m%s\x1b[0m', '❌ node_modules directory not found. Run npm install');
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ node_modules directory found');
  
  // Check for key dependencies
  const dependencies = [
    'react-native',
    'react-native-gesture-handler',
    'react-native-reanimated',
    'react-native-safe-area-context',
    'react-native-screens',
    'zustand'
  ];
  
  const missingDeps = dependencies.filter(
    dep => !fs.existsSync(path.join(nodeModulesDir, dep))
  );
  
  if (missingDeps.length > 0) {
    console.log('\x1b[31m%s\x1b[0m', `❌ Missing dependencies: ${missingDeps.join(', ')}`);
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✅ All key dependencies found');
  }
}

console.log('\x1b[36m%s\x1b[0m', '\n📘 Setup instructions:');
console.log('\x1b[36m%s\x1b[0m', '1. Create a new React Native project with: npx react-native init SpaceflightTerminal');
console.log('\x1b[36m%s\x1b[0m', '2. Copy the src directory and config files to the new project');
console.log('\x1b[36m%s\x1b[0m', '3. Follow the SETUP_GUIDE.md for detailed instructions');
console.log('\x1b[36m%s\x1b[0m', '\n🚀 Happy coding!');