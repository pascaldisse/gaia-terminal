#!/bin/bash

# Migration script from Expo to pure React Native
echo "🚀 Starting migration from Expo to pure React Native..."

# Create destination directory
read -p "Enter destination directory for your new project: " DEST_DIR
echo "Creating new React Native project at $DEST_DIR..."

# Create new React Native project
npx react-native init SpaceflightTerminal --directory "$DEST_DIR"
if [ $? -ne 0 ]; then
  echo "❌ Failed to create React Native project. Aborting."
  exit 1
fi

echo "✅ React Native project created successfully!"

# Copy source files
echo "Copying source files..."
cp -r "./src" "$DEST_DIR/"
cp "./babel.config.js" "$DEST_DIR/"
cp "./metro.config.js" "$DEST_DIR/"
cp "./react-native.config.js" "$DEST_DIR/"
cp "./index.js" "$DEST_DIR/"
cp "./package.json" "$DEST_DIR/package.json.reference"
cp "./SETUP_GUIDE.md" "$DEST_DIR/"
cp "./CLAUDE.md" "$DEST_DIR/"

echo "✅ Source files copied successfully!"

# Install dependencies
echo "Installing dependencies..."
cd "$DEST_DIR"
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens react-native-svg react-native-tab-view react-native-vector-icons styled-components zustand @react-native-async-storage/async-storage nanoid

echo "✅ Dependencies installed successfully!"

# Copy iOS templates
echo "Copying iOS template files..."
cp "../ios-appdelegate-template.txt" "./ios-appdelegate-template.txt"
echo "Please manually update the AppDelegate.mm file in iOS project using this template"

# Copy Android templates
echo "Copying Android template files..."
cp "../android-mainapplication-template.txt" "./android-mainapplication-template.txt"
cp "../android-mainactivity-template.txt" "./android-mainactivity-template.txt"
cp "../android-app-build-gradle-template.txt" "./android-app-build-gradle-template.txt"
cp "../android-build-gradle-template.txt" "./android-build-gradle-template.txt"
echo "Please manually update the Android files using these templates"

# Configure iOS
echo "Installing iOS dependencies..."
cd ios
pod install
cd ..

echo "🎉 Migration preparation complete!"
echo "-------------------------------------"
echo "Next steps:"
echo "1. Check and update iOS AppDelegate.mm files with the template"
echo "2. Check and update Android MainActivity.java and MainApplication.java files with the templates"
echo "3. Configure Vector Icons for both platforms (see SETUP_GUIDE.md)"
echo "4. Run the app with 'npm start' and 'npm run ios' or 'npm run android'"
echo "-------------------------------------"