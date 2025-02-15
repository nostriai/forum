import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../../src/Pages/NotFound';

describe('NotFound Component', () => {
  test('renders not found page with correct heading', () => {
    render(<NotFound />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(
      "The page you tried to access doesn't exist."
    );
  });

  test('renders error message in a div container', () => {
    const { container } = render(<NotFound />);
    const div = container.firstChild;
    expect(div.tagName).toBe('DIV');
    expect(div.children[0].tagName).toBe('H1');
  });

  test('renders without crashing', () => {
    const { container } = render(<NotFound />);
    expect(container).toBeInTheDocument();
  });

  test('displays correct error message text', () => {
    render(<NotFound />);
    expect(
      screen.getByText("The page you tried to access doesn't exist.")
    ).toBeInTheDocument();
  });
});
