# GAIA TERMINAL DEVELOPMENT GUIDE

## Flutter Commands
- **Setup**: `flutter pub get` - Install dependencies
- **Run**: `flutter run` - Default device | `-d chrome/ios/android/macos/windows/linux` - Target platform
- **Testing**: `flutter test` - All tests | `flutter test test/widget_test.dart` - Smoke test | `flutter test test/{test_name}.dart` - Single test
- **Quality**: `flutter analyze` - Static analysis | `flutter format .` - Format code | `flutter pub run dart_code_metrics:metrics analyze lib`
- **Build**: `flutter build <platform>` - Build for production (web/ios/apk/appbundle/macos/windows/linux)

## Architecture
- **Services**: State management with Provider pattern | `terminal_service.dart` for terminal sessions | `ssh_service.dart` for SSH connections
- **Widgets**: Use composition and small focused widgets | Terminal, tabs, toolbars, dialogs

## Code Style
- **Imports**: Order: 1) Dart/Flutter 2) External packages 3) Project files - Group and sort alphabetically
- **Components**: Prefer stateless widgets | Single responsibility | Extract reusable widgets
- **Types**: Use strong typing | Define models with interfaces | No dynamic except when required
- **Formatting**: 2-space indent | Max 80-char line width | Use trailing commas for multi-line params
- **Naming**: PascalCase: widgets/classes | camelCase: methods/variables | snake_case: files
- **Error Handling**: try/catch for async | Show user feedback | Log errors with context
- **State Management**: Provider pattern | Consumer for UI rebuilds | Keep state at appropriate level
- **Testing**: Widget tests with WidgetTester | Mock dependencies | Follow Arrange-Act-Assert pattern
- **Documentation**: Document public APIs | Add comments for complex logic | Use dartdoc style