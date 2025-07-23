import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResumeButton from '../components/ResumeButton.jsx';
import { SystemStatusContext } from '../context/SystemStatusContext.jsx';

test('button disabled with tooltip when resume blocked', async () => {
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

  expect(btn).toBeDisabled();
  expect(btn).toHaveAttribute('title', 'System not ready to resume \u2014 check logs');
});

test('shows confirmation modal and confirms resume', async () => {
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
    });

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

  const confirm = screen.getByRole('button', { name: /confirm/i });
  await act(async () => {
    fireEvent.click(confirm);
  });

  expect(global.fetch).toHaveBeenLastCalledWith('/api/resume?confirm=true', expect.any(Object));
  expect(refresh).toHaveBeenCalled();
  expect(screen.queryByTestId('resume-confirm-modal')).not.toBeInTheDocument();
});
