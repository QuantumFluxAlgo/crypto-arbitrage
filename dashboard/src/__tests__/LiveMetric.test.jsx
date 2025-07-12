import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LiveMetrics from '../../components/LiveMetrics.jsx';

let captured;
jest.mock('recharts', () => ({
  LineChart: ({ data, children }) => {
    captured = data;
    return <div data-testid="line-chart">{children}</div>;
  },
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

test('renders without crashing and provides mocked data', () => {
  render(<LiveMetrics />);
  expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  expect(captured).toHaveLength(10);
});
