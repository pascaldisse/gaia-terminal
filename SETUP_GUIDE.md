# Spaceflight Terminal Native Setup Guide

This document walks you through the process of setting up the Spaceflight Terminal as a pure React Native project without Expo.

## Prerequisites

- Node.js (latest LTS)
- Watchman: `brew install watchman`
- Ruby (for iOS/CocoaPods)
- Xcode (for iOS)
- Android Studio (for Android)
- JDK 11 or newer

## Installation Steps

### 1. Install the React Native CLI

```bash
npm install -g @react-native-community/cli
```

### 2. Create a new React Native project

```bash
npx react-native init SpaceflightTerminal
```

This will create a new React Native project with a proper directory structure including iOS and Android native projects.

### 3. Copy over source code

Copy the entire `src` directory from your current project to the new project. This contains your React components and services.

### 4. Setup dependencies 

From your current project's package.json, install all dependencies in the new project:

```bash
cd SpaceflightTerminal
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens react-native-svg react-native-tab-view react-native-vector-icons styled-components zustand @react-native-async-storage/async-storage nanoid
```

### 5. Copy configuration files

Copy the following files from your current project:
- index.js (main entry point)
- babel.config.js
- metro.config.js
- react-native.config.js

### 6. Configure iOS

1. Update the `AppDelegate.mm` file in the iOS project to match the template.
2. Install CocoaPods dependencies:
```bash
cd ios
pod install
cd ..
```

### 7. Configure Android

1. Update the following files in the Android project:
   - MainActivity.java
   - MainApplication.java
   - build.gradle files
2. Setup any required permissions in AndroidManifest.xml

### 8. Link native dependencies

For any native dependencies that don't auto-link:

```bash
npx react-native link
```

### 9. Run the app

```bash
# Start Metro bundler
npm start

# In another terminal, run iOS
npm run ios

# Or run Android
npm run android
```

## Troubleshooting

### iOS Issues

- If CocoaPods installation fails, try updating Ruby or using a Ruby version manager
- Check Xcode configuration and iOS simulator devices

### Android Issues

- Ensure ANDROID_HOME environment variable is set
- Check Java and Gradle versions
- Run `cd android && ./gradlew clean` if you encounter build issues

## Native Module Specifics

### Vector Icons

For react-native-vector-icons, make sure to follow the additional setup instructions:

**iOS:**
Add this to your Info.plist:
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
  <string>Foundation.ttf</string>
  <string>Ionicons.ttf</string>
  <string>MaterialIcons.ttf</string>
  <string>MaterialCommunityIcons.ttf</string>
  <string>SimpleLineIcons.ttf</string>
  <string>Octicons.ttf</string>
  <string>Zocial.ttf</string>
</array>
```

**Android:**
Edit android/app/build.gradle:
```groovy
project.ext.vectoricons = [
    iconFontNames: [ 'MaterialIcons.ttf', 'FontAwesome.ttf' ] // Add the font families you're using
]

apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```