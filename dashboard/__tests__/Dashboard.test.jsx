import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../src/pages/Dashboard.jsx';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

test('renders trading mode buttons and wallet info', () => {
  render(<Dashboard />);
  expect(screen.getByText(/wallet balance/i)).toBeInTheDocument();
  expect(screen.getByTestId('system-status')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /auto/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /realistic/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /aggressive/i })).toBeInTheDocument();
});
