import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../pages/Login.jsx';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

afterEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

test('renders email, password inputs and submit button', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});

test('submit button is visible', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
  const submit = screen.getByRole('button', { name: /log in/i });
  expect(submit).toBeVisible();
});

test('sends credentials to /api/login and stores token', async () => {
  axios.post.mockResolvedValue({ data: { token: 'abc123' } });
  await act(async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  });

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'user@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret' },
  });

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
  });

  expect(axios.post).toHaveBeenCalledWith(
    '/api/login',
    {
      email: 'user@example.com',
      password: 'secret',
    },
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    },
  );

  await waitFor(() => {
    expect(localStorage.getItem('token')).toBe('abc123');
  });
});
