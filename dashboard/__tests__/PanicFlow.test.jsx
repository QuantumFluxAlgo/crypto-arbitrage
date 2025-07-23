import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemStatusBanner from '../src/components/SystemStatusBanner.jsx';
import ResumeButton from '../src/components/ResumeButton.jsx';
import { SystemStatusProvider } from '../src/context/SystemStatusContext.jsx';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;

describeLocal('panic resume ui flow', () => {
  test('banner appears and clears on resume', async () => {
    let statusCalls = 0;
    global.fetch = jest.fn((url) => {
      if (url === '/api/system/status') {
        statusCalls++;
        if (statusCalls === 1) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ paused: true, panic_reason: 'loss' }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ paused: false, panic_reason: null }) });
      }
      if (url === '/api/settings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sandbox_mode: false }) });
      }
      if (url.startsWith('/api/resume')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ resumed: true }) });
      }
      if (url === '/api/wallet/balance') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ balance: 0 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await act(async () => {
      render(
        <SystemStatusProvider>
          <SystemStatusBanner />
          <ResumeButton />
        </SystemStatusProvider>
      );
    });

    const banner = await screen.findByTestId('system-status-banner');
    expect(banner).toHaveClass('bg-red-600');
    const button = screen.getByRole('button', { name: /resume trading/i });
    expect(button).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/resume', expect.any(Object));

    await act(async () => {});

    const bannerAfter = await screen.findByTestId('system-status-banner');
    expect(bannerAfter).toHaveClass('bg-green-600');
  });
});
