import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard.jsx';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 800, height: 600 }}>{children}</div>
    )
  };
});

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
test('displays loading then shows resume trading button', async () => {
  render(<Dashboard />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  await act(async () => {});
  expect(
    await screen.findByRole('button', { name: /resume trading/i })
  ).toBeInTheDocument();
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
