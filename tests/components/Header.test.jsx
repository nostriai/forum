import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../src/components/Header';
import { AuthContext } from '../../src/context/AuthManager';

describe('Header Component', () => {
  const mockLaunchLogin = jest.fn();

  const renderWithAuth = (user = null) => {
    const authValue = {
      user,
      launchLogin: mockLaunchLogin,
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <Header />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    mockLaunchLogin.mockClear();
  });

  test('renders brand name', () => {
    renderWithAuth();
    expect(screen.getByText('Nostri.ai')).toBeInTheDocument();
  });

  test('renders marketplace link', () => {
    renderWithAuth();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Marketplace').getAttribute('href')).toBe(
      '/marketplace'
    );
  });

  test('shows login button when user is not logged in', () => {
    renderWithAuth();
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();

    fireEvent.click(loginButton);
    expect(mockLaunchLogin).toHaveBeenCalledTimes(1);
  });

  test('shows user info when logged in', () => {
    const testUser = 'test@example.com';
    renderWithAuth(testUser);

    expect(screen.getByText(`Logged in as ${testUser}`)).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  test('brand link points to home', () => {
    renderWithAuth();
    const brandLink = screen.getByText('Nostri.ai');
    expect(brandLink.getAttribute('href')).toBe('/');
  });
});
