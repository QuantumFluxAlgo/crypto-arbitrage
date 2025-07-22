import React from 'react';
import { render, screen, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemStatusBanner from '../components/SystemStatusBanner.jsx';

async function setup({ paused, mode }) {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ paused, panic_reason: null }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sandbox_mode: mode === 'sandbox' }),
    });
  await act(async () => {
    render(<SystemStatusBanner />);
  });
}

afterEach(() => {
  jest.resetAllMocks();
});

test('shows live active state', async () => {
  await setup({ mode: 'live', paused: false });
  const banner = await screen.findByTestId('system-status-banner');
  expect(banner).toHaveTextContent('Live - Trading Active');
  expect(banner).toHaveClass('bg-green-600');
  expect(within(banner).queryByRole('button')).not.toBeInTheDocument();
});

test('shows live panic state', async () => {
  await setup({ mode: 'live', paused: true });
  const banner = await screen.findByTestId('system-status-banner');
  expect(banner).toHaveTextContent('Panic Mode - Trading Halted');
  expect(banner).toHaveClass('bg-red-600');
});

test('shows sandbox active state', async () => {
  await setup({ mode: 'sandbox', paused: false });
  const banner = await screen.findByTestId('system-status-banner');
  expect(banner).toHaveTextContent('Sandbox Mode - Simulation Running');
  expect(banner).toHaveClass('bg-orange-500');
});

test('shows sandbox panic state', async () => {
  await setup({ mode: 'sandbox', paused: true });
  const banner = await screen.findByTestId('system-status-banner');
  expect(banner).toHaveTextContent('Sandbox Panic - Simulating Failure State');
  expect(banner).toHaveClass('bg-red-900');
});
