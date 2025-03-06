# Gaia Terminal Flutter

A terminal emulator with SSH capabilities built with Flutter. This application provides a clean, modern terminal interface with multiple tabs, SSH connectivity, and customizable settings.

## Features

- Terminal emulation with command simulation
- Multiple terminal tabs
- SSH connectivity via WebSockets
- Customizable font size and theme
- Cross-platform support (iOS, Android, Web)

## Requirements

- Flutter SDK 2.19.0 or higher
- Dart SDK 2.19.0 or higher

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   flutter pub get
   ```
3. Run the app:
   ```
   flutter run
   ```

## Project Structure

- `lib/` - Main source code
  - `main.dart` - Entry point
  - `screens/` - App screens
  - `widgets/` - Reusable UI components
  - `services/` - Business logic and services
  - `models/` - Data models

## Dependencies

- provider - For state management
- shared_preferences - For persistent settings
- web_socket_channel - For SSH connections
- xterm - Terminal emulation
- tab_container - Tab management
- font_awesome_flutter - Icons

## Development Commands

- Run on mobile: `flutter run`
- Run on web: `flutter run -d chrome`
- Build APK: `flutter build apk`
- Build iOS: `flutter build ios`
- Clean build: `flutter clean`

## License

MIT