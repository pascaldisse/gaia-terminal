# React Native to Flutter Migration Guide

This document outlines the migration of the Gaia Terminal app from React Native to Flutter.

## Migrated Components

1. **Terminal Service**: Core functionality migrated from Zustand store to Flutter Provider
   - Terminal tab management
   - SSH connection handling
   - Settings persistence

2. **UI Components**:
   - Terminal widget with xterm emulation
   - Tab management system
   - Settings panel
   - SSH connection dialog

3. **Features**:
   - Multiple terminal tabs
   - Command execution
   - SSH connectivity via WebSockets
   - Customizable font size and theme
   - Persistent settings

## Architectural Changes

- **State Management**: Replaced Zustand with Flutter's Provider package
- **Terminal Emulation**: Using Flutter xterm package instead of React Native components
- **Storage**: Using shared_preferences instead of AsyncStorage
- **WebSockets**: Using web_socket_channel package for SSH communication

## Setup Instructions

1. Install Flutter SDK (2.19.0 or higher)
2. Clone the repository
3. Run `flutter pub get` to install dependencies
4. Run `flutter run` to start the app

## Testing

The app should be tested on:
- Android devices and emulators
- iOS devices and simulators
- Web browsers (if web support is enabled)

## Known Limitations

- The terminal emulation may have different capabilities from the original
- Some advanced SSH features may require additional implementation
- Keyboard handling might differ between platforms