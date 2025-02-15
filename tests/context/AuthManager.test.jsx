import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthManager, AuthContext } from '../../src/context/AuthManager';
import {
  init as nostrLoginInit,
  launch as nostrLoginLaunch,
} from 'nostr-login';

// Mock nostr-login module
jest.mock('nostr-login', () => ({
  init: jest.fn(),
  launch: jest.fn(),
}));

describe('AuthManager', () => {
  let onAuthCallback;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Capture the onAuth callback when init is called
    nostrLoginInit.mockImplementation(({ onAuth }) => {
      onAuthCallback = onAuth;
    });
  });

  test('initializes with null user and false authDone', () => {
    let contextValue;
    render(
      <AuthManager>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthManager>
    );

    expect(contextValue.user).toBeNull();
    expect(contextValue.authDone).toBeFalsy();
    expect(typeof contextValue.launchLogin).toBe('function');
  });

  test('initializes nostr-login with correct configuration', () => {
    render(<AuthManager />);

    expect(nostrLoginInit).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'default',
        onAuth: expect.any(Function),
      })
    );
  });

  test('launches login when launchLogin is called', () => {
    const { container } = render(
      <AuthManager>
        <AuthContext.Consumer>
          {(value) => <button onClick={value.launchLogin}>Login</button>}
        </AuthContext.Consumer>
      </AuthManager>
    );

    screen.getByText('Login').click();
    expect(nostrLoginLaunch).toHaveBeenCalled();
  });

  test('updates state when user authenticates', () => {
    const testUser = { id: '123', name: 'Test User' };
    let contextValue;

    render(
      <AuthManager>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthManager>
    );

    // Initial state check
    expect(contextValue.user).toBeNull();
    expect(contextValue.authDone).toBeFalsy();

    // Simulate successful authentication
    act(() => {
      onAuthCallback(testUser);
    });

    // Check updated state
    expect(contextValue.user).toEqual(testUser);
    expect(contextValue.authDone).toBeTruthy();
  });

  test('provides context to nested components', () => {
    const TestComponent = () => {
      return (
        <AuthContext.Consumer>
          {(value) => (
            <div>
              <div data-testid="user-value">
                {value.user ? 'logged-in' : 'not-logged-in'}
              </div>
              <div data-testid="auth-done">{value.authDone.toString()}</div>
              <button data-testid="login-btn" onClick={value.launchLogin}>
                Login
              </button>
            </div>
          )}
        </AuthContext.Consumer>
      );
    };

    render(
      <AuthManager>
        <TestComponent />
      </AuthManager>
    );

    expect(screen.getByTestId('user-value')).toHaveTextContent('not-logged-in');
    expect(screen.getByTestId('auth-done')).toHaveTextContent('false');

    // Test login button functionality
    screen.getByTestId('login-btn').click();
    expect(nostrLoginLaunch).toHaveBeenCalled();

    // Simulate successful login
    act(() => {
      onAuthCallback({ id: '123' });
    });

    expect(screen.getByTestId('user-value')).toHaveTextContent('logged-in');
    expect(screen.getByTestId('auth-done')).toHaveTextContent('true');
  });
});
