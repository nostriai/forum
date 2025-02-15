import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../../src/components/Footer';

describe('Footer Component', () => {
  test('renders footer with copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2024 Copyright:/)).toBeInTheDocument();
  });

  test('renders nostri.ai link with correct href', () => {
    render(<Footer />);
    const link = screen.getByText('nostri.ai');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://nostri.ai');
    expect(link).toHaveClass('text-white');
  });

  test('footer has fixed-bottom class', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('footer', 'fixed-bottom');
  });

  test('footer content is centered', () => {
    render(<Footer />);
    const container = screen.getByText(/© 2024 Copyright:/).parentElement;
    expect(container).toHaveClass('text-center');
  });

  test('footer has padding', () => {
    render(<Footer />);
    const container = screen.getByText(/© 2024 Copyright:/).parentElement;
    expect(container).toHaveClass('p-3');
  });
});
