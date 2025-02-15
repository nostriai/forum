import React from 'react';
import { render, screen } from '@testing-library/react';
import RequireAuth from '../../src/components/RequireAuth';
import { AuthContext } from '../../src/context/AuthManager';
import { Outlet } from 'react-router-dom';

// Mock the router's Outlet component
jest.mock('react-router-dom', () => ({
  Outlet: jest.fn(() => <div data-testid="outlet">Protected Content</div>),
}));

// Mock the Unauthorized component
jest.mock('../../src/Pages/Unauthorized', () => ({
  __esModule: true,
  default: () => <div data-testid="unauthorized">Unauthorized Page</div>,
}));

describe('RequireAuth Component', () => {
  const renderWithAuth = (user = null) => {
    const authValue = {
      user,
      authDone: true,
      launchLogin: jest.fn(),
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <RequireAuth />
      </AuthContext.Provider>
    );
  };

  test('renders Outlet when user is authenticated', () => {
    renderWithAuth({ id: '123', name: 'Test User' });

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('unauthorized')).not.toBeInTheDocument();
  });

  test('renders Unauthorized component when user is not authenticated', () => {
    renderWithAuth(null);

    expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  test('updates view when auth context changes', () => {
    const { rerender } = renderWithAuth(null);

    // Initially shows unauthorized
    expect(screen.getByTestId('unauthorized')).toBeInTheDocument();

    // Update auth context to simulate login
    rerender(
      <AuthContext.Provider value={{ user: { id: '123' }, authDone: true }}>
        <RequireAuth />
      </AuthContext.Provider>
    );

    // Now shows protected content
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('unauthorized')).not.toBeInTheDocument();
  });

  test('handles different user object structures', () => {
    const { rerender } = renderWithAuth({ id: '123' });
    expect(screen.getByTestId('outlet')).toBeInTheDocument();

    // Rerender with full user object
    rerender(
      <AuthContext.Provider
        value={{
          user: { id: '123', name: 'Test User', email: 'test@example.com' },
          authDone: true,
          launchLogin: jest.fn(),
        }}
      >
        <RequireAuth />
      </AuthContext.Provider>
    );
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
