import React from 'react';
import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import useNostr from '../src/hooks/useNostr.js';
import { getNostrData } from '../src/Services/nostrService';
import '@testing-library/jest-dom';

// Mock getNostrData for tests
jest.mock('../src/Services/nostrService', () => ({
  getNostrData: jest.fn(() => Promise.resolve({ message: 'NDK integrated event data', timestamp: '2025-02-14T17:00:00.000Z' }))
}));

// A test component that uses the useNostr hook
function TestComponent() {
  const { data, loading, error } = useNostr();
  
  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }
  
  if (error) {
    return <div data-testid="error">{error.message}</div>;
  }
  
  return (
    <div data-testid="data">
      {data.message} - {data.timestamp}
    </div>
  );
}

describe('useNostr hook via TestComponent', () => {
  test('should render loading initially and then display data', async () => {
    render(<TestComponent />);
    
    // Initially, loading should be visible
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Wait for the data to appear
    await waitFor(() => expect(screen.getByTestId('data')).toBeInTheDocument());
    
    const dataEl = screen.getByTestId('data');
    expect(dataEl).toHaveTextContent('NDK integrated event data');
    expect(dataEl).toHaveTextContent('2025-02-14T17:00:00.000Z');
    
    // Ensure loading is no longer present
    expect(screen.queryByTestId('loading')).toBeNull();
  });
  
  test('should display error when getNostrData rejects', async () => {
    // Force getNostrData to reject for this test
    getNostrData.mockImplementationOnce(() => Promise.reject(new Error('Test error')));
    
    render(<TestComponent />);
    
    // Wait for the error to appear
    await waitFor(() => expect(screen.getByTestId('error')).toBeInTheDocument());
    
    const errorEl = screen.getByTestId('error');
    expect(errorEl).toHaveTextContent('Test error');
  });
});
