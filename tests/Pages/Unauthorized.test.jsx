import React from 'react';
import { render, screen } from '@testing-library/react';
import Unauthorized from '../../src/Pages/Unauthorized';
import { BrowserRouter } from 'react-router-dom';

// Wrap component with router since it uses Link
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Unauthorized Component', () => {
  beforeEach(() => {
    renderWithRouter(<Unauthorized />);
  });

  test('renders unauthorized page with correct heading', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Nostr sign in required');
  });

  test('displays login instruction message', () => {
    const message = screen.getByText(
      'To use this page you need to login with your npub'
    );
    expect(message).toBeInTheDocument();
  });

  test('renders login button with correct text', () => {
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Login using browser extension');
  });

  test('button has bootstrap styling', () => {
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn');
  });

  test('content is wrapped in a div', () => {
    const { container } = render(<Unauthorized />);
    const div = container.firstChild;
    expect(div.tagName).toBe('DIV');
    expect(div.children).toHaveLength(3); // heading, paragraph, and button
  });

  test('renders elements in correct order', () => {
    const { container } = render(<Unauthorized />);
    const children = container.firstChild.children;
    expect(children[0].tagName).toBe('H1');
    expect(children[1].tagName).toBe('P');
    expect(children[2].tagName).toBe('BUTTON');
  });
});
