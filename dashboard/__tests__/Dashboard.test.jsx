import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../src/pages/Dashboard.jsx';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 800, height: 600 }}>{children}</div>
    )
  };
});

it('shows Resume Trading button', async () => {
  render(<Dashboard />);
  expect(
    await screen.findByRole('button', { name: /resume trading/i })
  ).toBeInTheDocument();
