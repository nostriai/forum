import React from 'react';
import { render, screen } from '@testing-library/react';
import { Marketplace } from '../../src/Pages/Marketplace';

describe('Marketplace Component', () => {
  beforeEach(() => {
    render(<Marketplace />);
  });

  test('renders marketplace page with correct heading', () => {
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Your uploaded files');
  });

  test('renders file list container with correct classes', () => {
    const row = screen.getByRole('list').closest('.row');
    expect(row).toBeInTheDocument();
    const column = screen.getByRole('list').closest('.col-4');
    expect(column).toBeInTheDocument();
  });

  test('renders list of files', () => {
    const list = screen.getByRole('list');
    expect(list).toHaveClass('list-unstyled');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('File 1');
    expect(items[1]).toHaveTextContent('File 2');
    expect(items[2]).toHaveTextContent('File 3');
  });

  test('renders files in correct order', () => {
    const items = screen.getAllByRole('listitem');
    const fileNames = items.map((item) => item.textContent);
    expect(fileNames).toEqual(['File 1', 'File 2', 'File 3']);
  });

  test('uses correct bootstrap grid classes', () => {
    const row = screen.getByRole('list').closest('.row');
    const column = screen.getByRole('list').closest('.col-4');
    expect(row).toHaveClass('row');
    expect(column).toHaveClass('col-4');
  });
});
