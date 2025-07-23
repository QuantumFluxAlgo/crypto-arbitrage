// SPA routing and auth gate for dashboard
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemStatusProvider } from './context/SystemStatusContext.jsx';
import Header from './Layout/Header.jsx';
import SystemStatusBanner from './components/SystemStatusBanner.jsx';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Infrastructure from './pages/Infrastructure';
import AdminPanel from './pages/AdminPanel';
import Config from './pages/Config';
// Guard routes so only logged-in users see them

function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SystemStatusProvider>
          <SystemStatusBanner />
          <Header />
          <Routes>
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
            <Route path="/infrastructure" element={<Infrastructure />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/config" element={<RequireAuth><Config /></RequireAuth>} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </SystemStatusProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
