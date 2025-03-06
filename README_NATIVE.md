# Spaceflight Terminal - Pure React Native

A modern terminal application built with pure React Native (no Expo) for iOS and Android platforms.

## Project Structure

```
spaceflight-terminal/
├── src/
│   ├── components/
│   │   ├── Terminal/      - Core terminal components
│   │   ├── SSH/           - SSH connection components
│   │   └── Settings/      - App settings components  
│   ├── services/
│   │   ├── ssh-service.js - WebSocket SSH service
│   │   └── native-web-bridge.js - Native/Web compatibility
│   └── stores/
│       └── terminalStore.js - Global state with Zustand
├── ios/                   - Native iOS project files
├── android/               - Native Android project files
├── index.js               - Entry point for React Native
├── metro.config.js        - Metro bundler configuration
├── babel.config.js        - Babel configuration
└── app.json               - Application configuration
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run start
   ```

3. Run on iOS:
   ```
   npm run ios
   ```

4. Run on Android:
   ```
   npm run android
   ```

## Native Dependencies

This project uses the following native dependencies:

- react-native-gesture-handler
- react-native-reanimated
- react-native-screens
- react-native-svg
- react-native-vector-icons

## iOS Setup

To run on iOS, CocoaPods is required:

```
cd ios
pod install
cd ..
npm run ios
```

## Android Setup

To run on Android, make sure you have Android SDK set up properly, then:

```
npm run android
```

## WebSocket Server

This app connects to a WebSocket server for SSH connections. The server runs on:

```
ws://your-server-ip:5000/ws/ssh
```

You can configure the server URL in `src/services/ssh-service.js`.