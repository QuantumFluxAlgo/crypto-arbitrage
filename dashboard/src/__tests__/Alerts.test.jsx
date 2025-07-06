import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alerts from '../pages/Alerts.jsx';
import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
  axios.get.mockResolvedValue({ data: {} });
  axios.post.mockResolvedValue({});
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders alert form after loading', async () => {
  render(<Alerts />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByLabelText(/smtp user/i)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
});
