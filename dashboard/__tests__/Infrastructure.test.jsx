import React from 'react';
import { render, screen } from '@testing-library/react';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
import { act } from 'react';
import '@testing-library/jest-dom';
import Infrastructure from '../src/pages/Infrastructure.jsx';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          pods: [{ name: 'app', status: 'Running' }],
          gpu: 0,
          db: true,
          redis: true,
        }),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

describeLocal('infrastructure page', () => {
  test('shows infrastructure status table', async () => {
    await act(async () => {
      render(<Infrastructure />);
    });

    expect(await screen.findByText('app')).toBeInTheDocument();
  });
});
