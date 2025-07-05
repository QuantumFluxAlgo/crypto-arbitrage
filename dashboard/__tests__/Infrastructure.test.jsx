import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Infrastructure from '../src/pages/Infrastructure.jsx';

test('shows loading state', () => {
  render(<Infrastructure />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});
