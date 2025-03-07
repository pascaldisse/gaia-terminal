# GAIA TERMINAL DEVELOPMENT GUIDE

## Commands
- **Development**: 
  - `npm run start` - Start React Native Metro bundler
  - `npm run web` - Start Vite web development server
- **Mobile**: 
  - `npm run ios` - Run on iOS simulator
  - `npm run android` - Run on Android emulator
- **Testing**: 
  - `npm test` - Run all tests
  - `npm test -- -t "test name"` - Run specific test by name
  - `npm test -- src/components/Terminal/__tests__/Terminal.test.jsx` - Test specific file
  - `npm run test:watch` - Run tests in watch mode
  - `npm run test:debug` - Run tests with debugging
- **Quality**:
  - `npm run lint` - Run ESLint (`npm run lint -- --fix` to auto-fix)
- **Build/Deploy**:
  - iOS: `cd ios && pod install && cd .. && npm run build:ios`
  - Android: `cd android && ./gradlew assembleRelease`
- **Maintenance**: 
  - `npm run clean` - Clear build caches (run before rebuilding)
  - `npm install --legacy-peer-deps` - Fix dependency issues

## Code Style
- **Imports**: React/RN first → external libraries → local components → styles
- **JSX**: Use explicit React.createElement in main.jsx to avoid transpilation issues
- **Components**: Functional components with hooks, useCallback for event handlers
- **Formatting**: 2-space indent, single quotes, semicolons, max 80-char line width
- **SVG**: Use react-native-svg and react-native-svg-transformer for vector graphics
- **Naming**: PascalCase for components/files, camelCase for variables/functions
- **Testing**: Write Jest tests with descriptive names, mock dependencies
- **Error Handling**: Use try/catch for async ops with user feedback
- **State**: Zustand for global state (terminalStore.js)
- **Styling**: styled-components/native for cross-platform styling
- **Platform**: Use platform-specific components where needed (TextInput vs input)

## Architecture
- **Core**: React Native with Vite for web support
- **State**: Zustand with AsyncStorage persistence
- **Communication**: WebSockets for SSH connections
- **UI**: Styled components with responsive design