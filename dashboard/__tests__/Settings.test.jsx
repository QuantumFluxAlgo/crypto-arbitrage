import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import Settings from '../src/pages/Settings.jsx';
import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
  axios.get.mockResolvedValue({ data: { personality_mode: 'Conservative' } });
  axios.patch.mockResolvedValue({});
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders personality mode buttons', async () => {
  render(<Settings />);
  await act(async () => {});
  expect(await screen.findByRole('button', { name: /Conservative/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Balanced/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Aggressive/i })).toBeInTheDocument();
});
