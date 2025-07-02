import React, { useState } from 'react';

export default function Login() {
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: replace with real login request
      const success = true;
      if (success) {
        console.log('Login successful');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err);
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

