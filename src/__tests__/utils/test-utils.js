/**
 * Test utilities and helper functions
 * This file contains common utilities used across tests
 */

// filepath: /Users/yunho/capstone/ansatpro-web/src/__tests__/utils/test-utils.js
import { render } from '@testing-library/react';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { NavigationProvider } from '@/context/NavigationContext';

/**
 * Custom render function that wraps components with all necessary providers
 * @param {React.ReactElement} ui - The React component to render
 * @param {Object} options - Optional render options
 * @returns The result of render from react-testing-library
 */
export function renderWithProviders(ui, options = {}) {
  return render(
    <NavigationProvider>
      <NotificationsProvider>
        {ui}
      </NotificationsProvider>
    </NavigationProvider>,
    options
  );
}

/**
 * Creates a mock for appwrite account
 * @returns {Object} Mock appwrite account object
 */
export function mockAppwriteAccount() {
  return {
    get: vi.fn().mockResolvedValue({
      $id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      emailVerification: true,
      labels: ['Facilitator']
    }),
    createJWT: vi.fn().mockResolvedValue({ jwt: 'mock-jwt-token' }),
    createEmailPasswordSession: vi.fn(),
    deleteSession: vi.fn(),
    createVerification: vi.fn(),
    updateVerification: vi.fn()
  };
}

/**
 * Creates a mock for appwrite functions
 * @returns {Object} Mock appwrite functions object
 */
export function mockAppwriteFunctions() {
  return {
    createExecution: vi.fn().mockResolvedValue({
      responseBody: JSON.stringify({
        status: 'success',
        data: { role: 'facilitator' }
      })
    })
  };
}

/**
 * Creates a mock for appwrite storage
 * @returns {Object} Mock appwrite storage object
 */
export function mockAppwriteStorage() {
  return {
    getFile: vi.fn(),
    getFileView: vi.fn().mockReturnValue('https://example.com/avatar.jpg')
  };
}

/**
 * Creates a mock for the localStorage API
 * @returns {Object} Mock localStorage object
 */
export function mockLocalStorage() {
  const store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    })
  };
}

/**
 * Creates a mock for window.matchMedia
 * This is needed for components that use media queries
 */
export function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Creates a mock for IntersectionObserver
 * This is needed for components that use IntersectionObserver
 */
export function mockIntersectionObserver() {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
}

/**
 * Wait for a specific amount of time
 * Useful for waiting for animations or other async operations
 * @param {number} ms - Time to wait in milliseconds
 * @returns {Promise} Promise that resolves after the specified time
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random string of a specified length
 * Useful for creating unique identifiers for tests
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
export function randomString(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate a test user with random email
 * @returns {Object} Test user object
 */
export function generateTestUser() {
  const uuid = randomString(8);
  return {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser_${uuid}@example.com`,
    password: 'TestPassword123!',
    role: 'facilitator'
  };
}
