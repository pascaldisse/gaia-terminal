# GAIA TERMINAL DEVELOPMENT GUIDE

## Commands
- **Development**: `npm start` - Metro bundler | `npm run web` - Vite web server
- **Mobile**: `npm run ios` - iOS simulator | `npm run android` - Android emulator
- **Testing**: 
  - Single test: `npm test -- -t "test name"` or `npm test -- path/to/file.test.jsx` 
  - All tests: `npm test` | Watch mode: `npm run test:watch` | Debug: `npm run test:debug`
- **Quality**: `npm run lint` | Auto-fix: `npm run lint -- --fix`
- **Build**: iOS: `cd ios && pod install && cd .. && npm run build:ios`
  Android: `cd android && ./gradlew assembleRelease`
- **Utilities**: `npm run clean` - Clear caches | `git commit` - Use descriptive messages

## Code Style
- **Imports**: Order: React/RN → external libs → local components → styles/utils
- **Components**: Functional with hooks, useCallback for handlers, single responsibility
- **TypeScript**: Define prop interfaces, explicit return types, avoid any
- **Formatting**: 2-space indent, single quotes, semicolons, max 80-char line width
- **Naming**: PascalCase for components/files, camelCase for variables/functions
- **Testing**: Jest tests with descriptive names, mock external dependencies
- **Error Handling**: try/catch for async ops, provide user feedback, log context
- **State Management**: Zustand (terminalStore.js) with AsyncStorage persistence
- **Styling**: styled-components/native for consistent cross-platform styling
- **Documentation**: Add JSDoc comments for public functions and complex logic