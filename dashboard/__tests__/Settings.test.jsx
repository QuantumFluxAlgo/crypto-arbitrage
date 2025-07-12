import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from '../src/pages/Settings.jsx';

jest.mock('axios');

test('toggle buttons update mode state', () => {
  render(<Settings />);
  const autoBtn = screen.getByRole('button', { name: /auto/i });
  const aggBtn = screen.getByRole('button', { name: /aggressive/i });
  const realBtn = screen.getByRole('button', { name: /realistic/i });

  expect(autoBtn).toBeInTheDocument();
  expect(aggBtn).toBeInTheDocument();
  expect(realBtn).toBeInTheDocument();

  fireEvent.click(aggBtn);
  expect(aggBtn).toHaveClass('bg-blue-600');
});
