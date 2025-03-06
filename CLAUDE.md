# SPACEFLIGHT TERMINAL DEVELOPMENT GUIDE

## Commands
- **Development**: `npm run start` - Start React Native Metro bundler
- **iOS**: `npm run ios` - Run on iOS simulator
- **Android**: `npm run android` - Run on Android emulator
- **Web**: `npm run web` - Start web development server
- **Lint**: `npm run lint` - Run ESLint (`npm run lint -- --fix` to auto-fix)
- **Testing**: 
  - `npm test` - Run all tests
  - `npm test -- -t "test name"` - Run specific test by name
  - `npm test -- src/components/Terminal/__tests__/Terminal.test.jsx` - Test specific file
  - `npm run test:watch` - Run tests in watch mode
- **Build**:
  - iOS: `cd ios && pod install && cd .. && npm run build:ios`
  - Android: `cd android && ./gradlew assembleRelease`
- **Clean**: `npm run clean` - Clear build caches (use before rebuilding)
- **Dependency Issues**: `npm install --legacy-peer-deps` - Fix ERESOLVE errors

## Code Style
- **Imports**: Order - React/RN first, external libraries, local components, styles
- **State Management**: Zustand for global state (terminalStore.js)
- **Components**: Functional components with hooks, useCallback for event handlers
- **Formatting**: 2-space indent, single quotes, semicolons, max 80-char line width
- **Naming**: PascalCase for components/files, camelCase for variables/functions
- **Error Handling**: Try/catch for async operations, provide user feedback
- **Testing**: Jest with React Native Testing Library, mock dependencies
- **Mobile**: Use platform-specific components where needed (TextInput vs input)
- **Storage**: AsyncStorage with Zustand persist middleware for settings
- **Styled Components**: Import from 'styled-components/native' for React Native files

## Architecture
- **Platform**: React Native (core) with web support
- **State**: Centralized store with Zustand
- **Communication**: WebSockets for SSH connections
- **UI**: Styled components with theme support