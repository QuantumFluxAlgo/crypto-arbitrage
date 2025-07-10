import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LiveMetrics from '../components/LiveMetrics.jsx';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 800, height: 600 }}>{children}</div>
    )
  };
});

test('renders live metrics heading', () => {
  render(<LiveMetrics equity={[1, 2]} latency={[3, 4]} />);
  expect(screen.getByText(/live metrics/i)).toBeInTheDocument();
});
