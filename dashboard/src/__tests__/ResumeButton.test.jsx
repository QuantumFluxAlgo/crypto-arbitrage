import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResumeButton from '../components/ResumeButton.jsx';
import { SystemStatusContext } from '../context/SystemStatusContext.jsx';

test('button disabled with tooltip when resume blocked', async () => {
  jest.useFakeTimers();
  const refresh = jest.fn();
  global.fetch = jest.fn(() => Promise.resolve({ status: 503, ok: false }));

  await act(async () => {
    render(
      <SystemStatusContext.Provider value={{ panic: true, reason: 'loss', refreshStatus: refresh }}>
        <ResumeButton />
      </SystemStatusContext.Provider>
    );
  });

  const btn = screen.getByRole('button', { name: /resume trading/i });
  expect(btn).not.toBeDisabled();

  await act(async () => {
    fireEvent.click(btn);
  });

  const modal = await screen.findByTestId('resume-confirm-modal');
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    jest.advanceTimersByTime(1500);
    await act(async () => {});
  });

  expect(global.fetch).toHaveBeenCalledWith('/test/resume', expect.any(Object));

  expect(btn).toBeDisabled();
  expect(btn).toHaveAttribute('title', 'System not ready to resume \u2014 check logs');
});

test('shows resume failed message', async () => {
  const refresh = jest.fn();
  global.fetch = jest.fn(() => Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve({ resumed: true }) }));

  await act(async () => {
    render(
      <SystemStatusContext.Provider value={{ panic: true, reason: 'loss', resumeFailed: true, refreshStatus: refresh }}>
        <ResumeButton />
      </SystemStatusContext.Provider>
    );
  });

  expect(screen.getByTestId('resume-failed')).toHaveTextContent(
    'Resume failed: Executor not responding'
  );
});

test('shows confirmation modal and confirms resume', async () => {
  jest.useFakeTimers();
  const refresh = jest.fn();
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      status: 403,
      ok: false,
      json: () => Promise.resolve({ override_required: true }),
    })
    .mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ resumed: true }),
    })
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ paused: false }) });

  await act(async () => {
    render(
      <SystemStatusContext.Provider value={{ panic: true, reason: 'loss', refreshStatus: refresh }}>
        <ResumeButton />
      </SystemStatusContext.Provider>
    );
  });

  const btn = screen.getByRole('button', { name: /resume trading/i });
  await act(async () => {
    fireEvent.click(btn);
  });

  const modal = await screen.findByTestId('resume-confirm-modal');
  expect(modal).toBeInTheDocument();

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    jest.advanceTimersByTime(1500);
    await act(async () => {});
  });

  expect(global.fetch).toHaveBeenCalledWith('/test/resume', expect.any(Object));

  const overrideModal = await screen.findByTestId('resume-confirm-modal');
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    jest.advanceTimersByTime(1500);
    await Promise.resolve();
    await act(async () => {});
  });

  expect(global.fetch).toHaveBeenNthCalledWith(2, '/test/resume?confirm=true', expect.any(Object));
  // modal should close after confirmation
});
