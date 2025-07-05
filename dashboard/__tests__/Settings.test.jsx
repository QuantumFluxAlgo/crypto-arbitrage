import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from '../src/pages/Settings.jsx';

test('renders personality mode buttons', () => {
  render(<Settings />);
  expect(screen.getByRole('button', { name: /Conservative/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Balanced/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Aggressive/i })).toBeInTheDocument();
});
