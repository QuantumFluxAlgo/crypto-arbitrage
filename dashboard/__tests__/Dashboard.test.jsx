import React from 'react';
import { render, screen, act } from '@testing-library/react';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
import '@testing-library/jest-dom';
import Dashboard from '../src/pages/Dashboard.jsx';
import { SystemStatusProvider } from '../src/context/SystemStatusContext.jsx';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

describeLocal('dashboard basics', () => {
  test('renders trading mode buttons and wallet info', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ panic: false, reason: 'loss limit' }),
      })
    );
    await act(async () => {
      render(
        <SystemStatusProvider>
          <Dashboard />
        </SystemStatusProvider>
      );
    });
    expect(screen.getByText(/wallet balance/i)).toBeInTheDocument();
    expect(screen.getByTestId('system-status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /realistic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aggressive/i })).toBeInTheDocument();
    const resume = await screen.findByRole('button', { name: /resume trading/i });
    expect(resume).toBeDisabled();
    expect(resume).toHaveAttribute('title', 'Panic triggered: loss limit — click to resume');
  });
});
