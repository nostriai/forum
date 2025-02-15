import React from 'react';
import { render, screen } from '@testing-library/react';
import { Layout } from '../../src/components/Layout';
import { AuthContext } from '../../src/context/AuthManager';
import { Outlet } from 'react-router-dom';

// Mock the router's Outlet component
jest.mock('react-router-dom', () => ({
  Outlet: jest.fn(() => <div data-testid="outlet">Outlet Content</div>),
}));

// Mock the Header and Footer components
jest.mock('../../src/components/Header', () => ({
  Header: () => <div data-testid="header">Header Component</div>,
}));

jest.mock('../../src/components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>,
}));

describe('Layout Component', () => {
  const renderWithAuth = (authDone = false, user = null) => {
    const authValue = {
      authDone,
      user,
      launchLogin: jest.fn(),
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <Layout />
      </AuthContext.Provider>
    );
  };

  test('renders nothing when authDone is false', () => {
    renderWithAuth(false);
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  test('renders full layout when authDone is true', () => {
    renderWithAuth(true);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('main content has correct bootstrap container class', () => {
    renderWithAuth(true);
    const container = screen.getByTestId('outlet').parentElement;
    expect(container).toHaveClass('container', 'mt-5');
  });

  test('renders components in correct order', () => {
    renderWithAuth(true);
    const layout = document.body;
    const header = screen.getByTestId('header');
    const outlet = screen.getByTestId('outlet');
    const footer = screen.getByTestId('footer');

    expect(layout.contains(header)).toBeTruthy();
    expect(layout.contains(outlet)).toBeTruthy();
    expect(layout.contains(footer)).toBeTruthy();

    // Check order
    expect(header.compareDocumentPosition(outlet)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(outlet.compareDocumentPosition(footer)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});
