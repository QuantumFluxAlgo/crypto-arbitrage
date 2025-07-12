import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard.jsx';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

test('shows trading mode buttons and status', () => {
  render(<Dashboard />);
  expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
  expect(screen.getByTestId('system-status')).toBeInTheDocument();
  ['auto', 'realistic', 'aggressive'].forEach((label) => {
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
});
