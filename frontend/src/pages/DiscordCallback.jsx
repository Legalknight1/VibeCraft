import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

export default function DiscordCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const id = params.get('id');
    const username = params.get('username');
    const email = params.get('email');
    const geminiApiKey = params.get('geminiApiKey');

    if (token && id) {
      // Store user data and token
      const userData = {
        id,
        username,
        email,
        geminiApiKey: geminiApiKey || null
      };
      
      login(userData, token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // Something went wrong
      console.error('Discord callback error: Missing token or user ID');
      navigate('/?error=discord_failed');
    }
  }, [location, login, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="spinner spinner-lg" />
      <div style={{ textAlign: 'center' }}>
        <h2 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Finalizing <span className="text-gradient-cyan">Discord Login</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Connecting your VibeCraft account...</p>
      </div>
    </div>
  );
}
