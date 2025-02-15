import React from 'react';
import { render, screen } from '@testing-library/react';
import { Home } from '../../src/Pages/Home';

describe('Home Component', () => {
  test('renders home page with correct heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Nothing to see here');
  });

  test('renders without crashing', () => {
    const { container } = render(<Home />);
    expect(container).toBeInTheDocument();
  });

  test('heading has correct text content', () => {
    render(<Home />);
    expect(screen.getByText('Nothing to see here')).toBeInTheDocument();
  });

  test('renders as a fragment without wrapper div', () => {
    const { container } = render(<Home />);
    expect(container.firstChild).toBeInstanceOf(HTMLHeadingElement);
  });
});
