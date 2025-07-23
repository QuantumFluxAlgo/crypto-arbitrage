import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemStatusProvider } from '../src/context/SystemStatusContext.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;

describeLocal('panic resume UI', () => {
  test('status label toggles', async () => {
    jest.useFakeTimers();
    const state = { paused: false };
    global.fetch = jest.fn((url, opts) => {
      if (url === '/api/system/status') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ paused: state.paused }) });
      }
      if (url === '/api/wallet/balance') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ balance: 0 }) });
      }
      if (url === '/api/metrics') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      if (url === '/api/trades/status') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ trades: [] }) });
      }
      if (url === '/api/settings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sandbox_mode: false }) });
      }
      if (url === '/api/panic') {
        state.paused = true; return Promise.resolve({ ok: true });
      }
      if (url.startsWith('/test/resume')) {
        state.paused = false; return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await act(async () => {
      render(
        <SystemStatusProvider>
          <Dashboard />
        </SystemStatusProvider>
      );
    });

    expect(screen.getByTestId('system-status')).toHaveTextContent('active');

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /pause trading/i })); });
    expect(await screen.findByTestId('system-status')).toHaveTextContent('paused');

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /resume trading/i })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /confirm/i })); jest.advanceTimersByTime(1500); await Promise.resolve(); jest.runOnlyPendingTimers(); });
    expect(await screen.findByTestId('system-status')).toHaveTextContent('active');
  });
});
