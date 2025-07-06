import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationOverlay from '../components/SimulationOverlay.jsx';

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
  global.WebSocket = class {
    constructor() {}
    close() {}
    addEventListener() {}
    set onmessage(fn) {
      this._onmessage = fn;
      // send a fake message once bound
      fn({ data: JSON.stringify({ timestamp: Date.now(), confidence: 0.5, latency: 100, pnl: 1 }) });
    }
  };
});

afterEach(() => {
  delete global.WebSocket;
});

test('renders overlay heading and table', async () => {
  render(<SimulationOverlay />);
  expect(screen.getByText(/simulated opportunities/i)).toBeInTheDocument();
  expect(await screen.findByRole('table')).toBeInTheDocument();
});
