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
- **Utilities**: `npm run clean` - Clear caches

## Code Style
- **Imports**: React/RN → external libs → local components → styles/utils
- **Components**: Functional with hooks, useCallback for handlers, single responsibility
- **TypeScript**: Define interfaces for props, explicit return types for functions
- **Formatting**: 2-space indent, single quotes, semicolons, max 80-char line width
- **Naming**: PascalCase for components/files, camelCase for variables/functions
- **Testing**: Jest tests with clear descriptions, mock dependencies/services
- **Error Handling**: try/catch for async ops, provide user feedback, avoid silent errors
- **State Management**: Zustand (terminalStore.js) with AsyncStorage persistence
- **Styling**: styled-components/native for cross-platform styling
- **Platform Adaptation**: Use platform-specific components when needed

## Architecture
- **Core**: React Native with web support via Vite
- **Communication**: WebSockets for SSH connections
- **UI**: Responsive design with styled-components

## Git Workflow
- **Commits**: Descriptive commit messages explaining why changes were made
- **Branches**: Feature branches for new features, bugfix branches for fixes
- **PRs**: Create pull requests with detailed descriptions of changes
- **Reviews**: All PRs should be reviewed by at least one team member