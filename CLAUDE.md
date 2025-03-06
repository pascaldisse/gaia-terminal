# SPACEFLIGHT TERMINAL DEVELOPMENT GUIDE

## Commands
- **Development**: `npm run start` - Start React Native Metro bundler
- **iOS**: `npm run ios` - Run on iOS simulator
- **Android**: `npm run android` - Run on Android emulator
- **Web**: `npm run web` - Start web development server
- **Build iOS**: `cd ios && pod install && cd .. && npm run build:ios` - Build iOS app
- **Build Android**: `cd android && ./gradlew assembleRelease` - Build Android APK
- **Lint**: `npm run lint` - Run ESLint (`npm run lint -- --fix` to auto-fix)
- **Testing**: `npx jest` - Run all tests (`npx jest -t "test name"` for specific test)
- **Clean**: `npm run clean` - Clear build caches (use before rebuilding)

## Code Style
- **Imports**: Order - React first, external libraries, local components, styles
- **Components**: Functional components with hooks, default exports
- **State Management**: Zustand for global state, React hooks for local state
- **Formatting**: 2-space indentation, single quotes, semicolons, 80-char line limit
- **Naming**: PascalCase for components/files, camelCase for variables/functions
- **Error Handling**: Try/catch for async operations, provide user feedback
- **Types**: Use PropTypes or TypeScript for component props

## Architecture
- **Platform**: React Native with Metro bundler for JavaScript
- **Mobile Dependencies**: Native iOS (CocoaPods) and Android (Gradle)
- **Communication**: WebSockets for SSH connections
- **Storage**: AsyncStorage for persistent settings
- **Styling**: Styled components for consistent UI across platforms