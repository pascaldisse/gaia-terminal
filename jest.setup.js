import '@testing-library/jest-native/extend-expect';

// Add TextEncoder for jsdom
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

// Mock react-native modules that aren't compatible with Jest
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  return {
    PanGestureHandler: 'PanGestureHandler',
    TapGestureHandler: 'TapGestureHandler',
    PinchGestureHandler: 'PinchGestureHandler',
    State: {},
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 667 }),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
}));

// Mock Keyboard
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
}));

// Mock Slider component
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Slider: 'Slider',
    Switch: 'Switch',
  };
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock nanoid for deterministic tests
jest.mock('nanoid/non-secure', () => ({
  nanoid: () => 'test-id-123'
}));

// Mock console.log and error for tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Setup window for web support
global.window = global;

// Add a helper to reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});