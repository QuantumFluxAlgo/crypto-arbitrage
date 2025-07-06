import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import Infrastructure from '../pages/Infrastructure.jsx';

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      pods: [{ name: 'app', status: 'Running' }],
      gpu: 50,
      db: true,
      redis: true,
    }),
  }));
});

afterEach(() => {
  jest.resetAllMocks();
});

test('shows infrastructure status table', async () => {
  await act(async () => {
  render(<Infrastructure />);
  });
  expect(await screen.findByText('app')).toBeInTheDocument();
});
