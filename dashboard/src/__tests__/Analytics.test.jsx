import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Analytics from '../pages/Analytics.jsx';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === '/api/trades/history') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ timestamp: '2024-01-01T00:00:00Z', pnl: 1 }]),
      });
    }
    if (url === '/api/predictions') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ timestamp: '2024-01-01T00:00:00Z', predicted: 1, actual: 1 }]),
      });
    }
    return Promise.reject(new Error('unknown url'));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders analytics headings', async () => {
  render(<Analytics />);
  expect(await screen.findByText(/rolling pnl/i)).toBeInTheDocument();
  expect(screen.getByText(/lstm predictions/i)).toBeInTheDocument();
});

