import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from '../pages/Settings.jsx';

jest.mock('axios');

test('renders mode buttons and handles click', () => {
  render(<Settings />);
  const auto = screen.getByRole('button', { name: /auto/i });
  const aggressive = screen.getByRole('button', { name: /aggressive/i });
  const realistic = screen.getByRole('button', { name: /realistic/i });
  expect(auto).toBeInTheDocument();
  expect(aggressive).toBeInTheDocument();
  expect(realistic).toBeInTheDocument();
  fireEvent.click(realistic);
  expect(realistic).toHaveClass('bg-blue-600');
});
