import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard.jsx';
import { SystemStatusProvider } from '../context/SystemStatusContext.jsx';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

test('shows trading mode buttons and status', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ panic: false, reason: 'loss' }),
    })
  );
  await act(async () => {
    render(
      <SystemStatusProvider>
        <Dashboard />
      </SystemStatusProvider>
    );
  });
  expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
  expect(screen.getByTestId('system-status')).toBeInTheDocument();
  ['auto', 'realistic', 'aggressive'].forEach((label) => {
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
  const resumeBtn = await screen.findByRole('button', { name: /resume trading/i });
  expect(resumeBtn).toBeDisabled();
});
