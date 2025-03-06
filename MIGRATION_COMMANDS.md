# Spaceflight Terminal Migration Commands

This document contains direct command-line instructions to migrate from Expo to pure React Native.

## Step 1: Create a new React Native project

```bash
# Navigate to your projects directory
cd ~/Projects

# Create a new React Native project
npx react-native init SpaceflightTerminal
```

## Step 2: Copy files from gaia-terminal to the new project

```bash
# Copy source files
cp -r ~/gaia-terminal/src ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/babel.config.js ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/metro.config.js ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/react-native.config.js ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/index.js ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/CLAUDE.md ~/Projects/SpaceflightTerminal/

# Copy template files for reference
cp ~/gaia-terminal/ios-appdelegate-template.txt ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/android-mainapplication-template.txt ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/android-mainactivity-template.txt ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/android-app-build-gradle-template.txt ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/android-build-gradle-template.txt ~/Projects/SpaceflightTerminal/
cp ~/gaia-terminal/SETUP_GUIDE.md ~/Projects/SpaceflightTerminal/
```

## Step 3: Update native code files

### iOS:
```bash
# Navigate to new project
cd ~/Projects/SpaceflightTerminal

# Open AppDelegate.mm in your editor
open ios/SpaceflightTerminal/AppDelegate.mm

# Update the file using the content from ios-appdelegate-template.txt
```

### Android:
```bash
# Navigate to new project (if not already there)
cd ~/Projects/SpaceflightTerminal

# Open MainActivity.java
open android/app/src/main/java/com/spaceflightterminal/MainActivity.java
# Update with content from android-mainactivity-template.txt

# Open MainApplication.java
open android/app/src/main/java/com/spaceflightterminal/MainApplication.java
# Update with content from android-mainapplication-template.txt

# Open build.gradle files if needed
open android/app/build.gradle
open android/build.gradle
```

## Step 4: Install dependencies and setup iOS pods

```bash
# Navigate to new project (if not already there)
cd ~/Projects/SpaceflightTerminal

# Install dependencies
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens react-native-svg react-native-tab-view react-native-vector-icons styled-components zustand @react-native-async-storage/async-storage nanoid

# For iOS, install CocoaPods dependencies
cd ios
pod install
cd ..
```

## Step 5: Vector Icons setup

### iOS:
Add this to ios/SpaceflightTerminal/Info.plist:
```xml
<key>UIAppFonts</key>
<array>
  <string>AntDesign.ttf</string>
  <string>Entypo.ttf</string>
  <string>EvilIcons.ttf</string>
  <string>Feather.ttf</string>
  <string>FontAwesome.ttf</string>
  <string>FontAwesome5_Brands.ttf</string>
  <string>FontAwesome5_Regular.ttf</string>
  <string>FontAwesome5_Solid.ttf</string>
  <string>Ionicons.ttf</string>
  <string>MaterialIcons.ttf</string>
  <string>MaterialCommunityIcons.ttf</string>
  <string>SimpleLineIcons.ttf</string>
</array>
```

### Android:
Add this to android/app/build.gradle:
```groovy
project.ext.vectoricons = [
    iconFontNames: [ 'MaterialIcons.ttf', 'FontAwesome.ttf' ]
]

apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

## Step 6: Run the app

```bash
# Start Metro bundler
npm start

# In another terminal, run iOS
npm run ios

# Or run Android
npm run android
```

If you encounter any issues, consult the detailed SETUP_GUIDE.md file.