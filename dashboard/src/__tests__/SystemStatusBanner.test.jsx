import React from 'react';
import { render, screen, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemStatusBanner from '../components/SystemStatusBanner.jsx';

async function setup(response) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    })
  );
  await act(async () => {
    render(<SystemStatusBanner />);
  });
}

afterEach(() => {
  jest.resetAllMocks();
});

test('shows live active state', async () => {
  await setup({ mode: 'live', panic: false });
  const banner = await screen.findByTestId('system-status-banner');
  expect(banner).toHaveTextContent('Live - Trading Active');
  expect(banner).toHaveClass('bg-green-600');
  expect(within(banner).queryByRole('button')).not.toBeInTheDocument();
});

test('shows live panic state', async () => {
  await setup({ mode: 'live', panic: true });
  const banner = await screen.findByTestId('system-status-banner');
  expect(banner).toHaveTextContent('Panic Mode - Trading Halted');
  expect(banner).toHaveClass('bg-red-600');
});

test('shows sandbox active state', async () => {
  await setup({ mode: 'sandbox', panic: false });
  const banner = await screen.findByTestId('system-status-banner');
  expect(banner).toHaveTextContent('Sandbox Mode - Simulation Running');
  expect(banner).toHaveClass('bg-orange-500');
});

test('shows sandbox panic state', async () => {
  await setup({ mode: 'sandbox', panic: true });
  const banner = await screen.findByTestId('system-status-banner');
  expect(banner).toHaveTextContent('Sandbox Panic - Simulating Failure State');
  expect(banner).toHaveClass('bg-red-900');
});
