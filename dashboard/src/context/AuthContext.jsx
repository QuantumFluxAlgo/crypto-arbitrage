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
    async function verify() {
      try {
        const res = await axios.get('/api/metrics');
        if (res.status === 200) {
          setIsLoggedIn(true);
          localStorage.setItem('token', 'active');
        }
      } catch {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      }
    }

    if (localStorage.getItem('token')) {
      verify();
    }
  }, []);

  const login = async (email, password) => {
    try {
      await axios.post('/api/login', { email, password });
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  const value = { isLoggedIn, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
