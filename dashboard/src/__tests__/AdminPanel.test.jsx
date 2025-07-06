
import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import AdminPanel from '../pages/AdminPanel.jsx';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === '/api/audit') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { action: 'update', user: 'admin', timestamp: '2024-01-01T00:00:00Z' }
        ])
      });
    }
    if (url === '/api/models/version') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ current: 'abc', previous: 'xyz' })
      });
    }
    if (url === '/api/models/rollback') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.reject(new Error('unknown url'));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders audit logs and model hashes', async () => {
   await act(async () => {
    render(<AdminPanel />);
  });
  expect(await screen.findByText('update')).toBeInTheDocument();
  expect(screen.getByText(/current model/i)).toBeInTheDocument();
});
