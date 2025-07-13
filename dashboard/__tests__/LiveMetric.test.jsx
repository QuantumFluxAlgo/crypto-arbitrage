import React from 'react';
import { render, screen } from '@testing-library/react';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
import '@testing-library/jest-dom';
import LiveMetrics from '../components/LiveMetrics.jsx';

let received;
jest.mock('recharts', () => ({
  LineChart: ({ data, children }) => {
    received = data;
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

describeLocal('live metrics', () => {
  test('renders chart container and uses mocked data', () => {
    render(<LiveMetrics />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(received).toHaveLength(10);
  });
});
