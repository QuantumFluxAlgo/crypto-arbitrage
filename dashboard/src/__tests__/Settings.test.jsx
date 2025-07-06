import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from '../pages/Settings.jsx';
import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
  axios.get.mockResolvedValue({ data: {
    personality_mode: 'Balanced',
    coin_cap_pct: 10,
    loss_limit_pct: 1,
    latency_limit_ms: 100,
    sweep_cadence_s: 30,
  }});
  axios.patch.mockResolvedValue({});
});

afterEach(() => {
  jest.resetAllMocks();
});

test('loads settings and shows save button', async () => {
  render(<Settings />);
  await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
  expect(screen.getByText(/balanced/i)).toBeInTheDocument();
});
