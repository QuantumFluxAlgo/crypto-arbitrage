import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const value = { isLoggedIn, login };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
