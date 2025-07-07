+4
-1

import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
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

test('displays loading then shows resume trading button', async () => {
  await act(async () => {
    render(<Dashboard />);
  });

  expect(
    await screen.findByRole('button', { name: /resume trading/i })
  ).toBeInTheDocument();
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
