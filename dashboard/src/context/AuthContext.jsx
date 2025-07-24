// Simple auth context storing JWT in localStorage
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // On mount, check if token persists from prior login
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        '/api/login',
        { email, password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        },
      );
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      return res.data;
    } catch (error) {
      let message = 'Network error';
      if (error.response) {
        if (error.response.status === 401) {
          message = 'Invalid email or password';
        } else if (error.response.status >= 500) {
          message = 'Server error. Try again later.';
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        } else {
          message = 'Login failed';
        }
      }
      throw new Error(message);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const value = { isLoggedIn, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
