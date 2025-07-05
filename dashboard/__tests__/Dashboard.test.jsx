import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../src/pages/Dashboard.jsx';

it('shows Resume Trading button', () => {
  render(<Dashboard />);
  expect(screen.getByRole('button', { name: /resume trading/i })).toBeInTheDocument();
});
