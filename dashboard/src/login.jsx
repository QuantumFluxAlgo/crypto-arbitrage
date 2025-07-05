import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const res = await axios.post('/api/login', { email, password });
      if (res.status === 200) {
        console.log('Login successful');
        setError(null);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials';
      setError(new Error(msg));
      console.log('Login failed', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" name="email" required />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" name="password" required />

      <button type="submit">Submit</button>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}

