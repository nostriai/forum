import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Add TextEncoder/TextDecoder
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock nostr-login
jest.mock('nostr-login', () => ({
  init: jest.fn(),
  launch: jest.fn(),
}));

// Mock crypto APIs
global.crypto = {
  getRandomValues: jest.fn(),
  subtle: {
    digest: jest.fn(),
    importKey: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  },
};

// Suppress console.error for expected test errors
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0].includes('NDK connection error') ||
    args[0].includes('Error signing event') ||
    args[0].includes('Error publishing event')
  ) {
    return;
  }
  originalError.call(console, ...args);
};
