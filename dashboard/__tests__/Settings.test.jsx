import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import Settings from '../src/pages/Settings.jsx';
import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
  axios.get.mockResolvedValue({ data: { personality_mode: 'Realistic' } });
  axios.patch.mockResolvedValue({});
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders personality mode buttons', async () => {
  await act(async () => {
    render(<Settings />);
  });

  expect(await screen.findByRole('button', { name: /Realistic/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Aggressive/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Auto/i })).toBeInTheDocument();

