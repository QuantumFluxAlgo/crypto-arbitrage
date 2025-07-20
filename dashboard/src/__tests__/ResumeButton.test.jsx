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
