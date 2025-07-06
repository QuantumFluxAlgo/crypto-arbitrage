import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard.jsx';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === '/api/metrics') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          equityCurve: [],
          openTrades: [],
          panicActive: false,
          alertsEnabled: false,
          latency: [],
          winRate: [],
        }),
      });
    }
    if (url === '/api/resume') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.reject(new Error('unknown url'));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders dashboard and resume button', async () => {
  render(<Dashboard />);
  expect(await screen.findByText(/prism arbitrage dashboard/i)).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: /resume trading/i })).toBeInTheDocument();
});
