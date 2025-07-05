import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

/**
 * Login page with email/password form.
 * On successful login, navigates to "/dashboard".
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      // Display a friendly error if login fails
      setError(err?.message || "Invalid email or password");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background text-text">
      <img src={logo} alt="Prism Arbitrage" className="absolute left-4 top-4 h-12" />
      <form
        onSubmit={handleSubmit}
        className="w-full rounded border px-3 py-2 text-black"
      >
        <h1 className="mb-4 text-center text-2xl font-semibold">Prism Arbitrage</h1>

        {error && (
          <div className="mb-3 text-sm text-error" data-testid="login-error">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="mb-1 block text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="mb-1 block text-sm">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded border px-3 py-2 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-primary py-2 text-white hover:bg-primary/80"
        >
          LOG IN
        </button>
      </form>
    </div>
  );
}

