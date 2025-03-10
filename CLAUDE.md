# GAIA TERMINAL DEVELOPMENT GUIDE

## Flutter Commands
- **Setup**: `flutter pub get` - Install dependencies
- **Run**: `flutter run` - Default device | `-d chrome/ios/android/macos/windows/linux` - Target platform
- **Testing**: `flutter test` - All tests | `flutter test test/path/to/test_file.dart` - Single test
- **Quality**: `flutter analyze` - Static analysis | `flutter format .` - Format code
- **Build**: `flutter build <platform>` - Build for production (web/ios/apk/appbundle/macos/windows/linux)

## Architecture
- **Services**: `terminal_service.dart` manages terminal sessions | `ssh_service.dart` handles SSH | `shell_service.dart` for local shells
- **Widgets**: Use composition and small focused widgets | Terminal, tabs, toolbars, dialogs

## Code Style
- **Imports**: Order: 1) Dart/Flutter imports 2) External packages 3) Project files
- **Components**: Prefer stateless widgets when possible | Keep widgets focused on single responsibility
- **Types**: Use strong typing | Define models with clear interfaces | Avoid dynamic
- **Formatting**: Standard Flutter format | 2-space indent | Max 80-char line width
- **Naming**: PascalCase for widgets/classes | camelCase for methods/variables | snake_case for files
- **Error Handling**: Use try/catch for async operations | Show user feedback | Log context
- **State Management**: Provider pattern | Keep state at appropriate level | Minimize rebuilds
- **Testing**: Write widget and unit tests | Mock dependencies | Descriptive test names
- **Documentation**: Add comments for complex logic | JSDoc style for public APIs