# GAIA TERMINAL DEVELOPMENT GUIDE

## Commands
- **Development**: `npm run dev` - Run Vite development server
- **Build**: `npm run build` - Build for production
- **Lint**: `npm run lint` - Run ESLint checks
- **Preview**: `npm run preview` - Preview production build

## Code Style
- **Formatting**: 2-space indentation, consistent spacing, 80-char line limit
- **Components**: Functional components with hooks, default exports
- **Imports**: React first, external libraries next, local modules, CSS last
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Error handling**: Use try/catch for async operations, provide user feedback

## Architecture
- React + Vite application structure
- ES modules with .jsx extension
- Component-based design with proper abstraction
- Style components with CSS modules when possible

## ESLint Configuration
- Follows ESLint recommended rules
- Enforces React Hooks rules
- Warns on potentially problematic patterns