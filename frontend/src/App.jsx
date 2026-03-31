import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import VibeConsole from './pages/VibeConsole';
import DiscordCallback from './pages/DiscordCallback';

// ─── Auth Context ───
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState({ id: 'GUEST_USER', username: 'Administrator', email: 'admin@vibecraft.local', geminiApiKey: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Gemini API Key if saved
    const savedKey = localStorage.getItem('vc_gemini_key');
    if (savedKey) {
      setUser(prev => ({ ...prev, geminiApiKey: savedKey }));
    }
  }, []);

  const login = () => {}; // NO OP

  const logout = () => {}; // NO OP

  const updateUser = (updates) => {
    if (updates.geminiApiKey) {
      localStorage.setItem('vc_gemini_key', updates.geminiApiKey);
    }
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Protected Route - REMOVED for simplification ───
function PrivateRoute({ children }) {
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="bg-grid" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/console/:serverId" element={<VibeConsole />} />
          <Route path="/auth/callback" element={<DiscordCallback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
