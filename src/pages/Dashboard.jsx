import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Server, Plus, Trash2, Settings, Play, Key, AlertTriangle } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    setLoading(true);
    try {
      const data = await api.getLinkedServers();
      setServers(data.servers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteServer = async (id) => {
    if (!confirm('Remove this server?')) return;
    try {
      await api.deleteServer(id);
      setServers((s) => s.filter((sv) => sv.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const saveGeminiKey = async () => {
    if (!geminiKey.trim()) return;
    setSavingKey(true);
    try {
      await api.setGeminiKey(geminiKey);
      updateUser({ geminiApiKey: geminiKey });
      setShowSettings(false);
      setGeminiKey('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-cyan" style={{ width: 400, height: 400, top: -150, right: -150, opacity: 0.2 }} />

      {/* Navbar */}
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--cyan), var(--purple))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#050508" strokeWidth={2.5} />
            </div>
            <span className="text-display" style={{ fontSize: '1.125rem', background: 'linear-gradient(135deg, var(--cyan), var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VibeCraft
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Vibe <strong style={{ color: 'var(--text-primary)' }}>Architect</strong>
            </span>
            {!user?.geminiApiKey && (
              <div className="badge badge-yellow" style={{ cursor: 'pointer' }} onClick={() => setShowSettings(true)}>
                <AlertTriangle size={10} /> Set Gemini Key
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(!showSettings)} title="Settings">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '3rem 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--border-purple)', animation: 'slide-up 0.3s ease' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={18} color="var(--purple)" /> Settings
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                className="form-input"
                type="password"
                placeholder={user?.geminiApiKey ? 'Update Gemini API Key...' : 'Enter Gemini API Key (AIzaSy...)'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary" onClick={saveGeminiKey} disabled={savingKey || !geminiKey.trim()}>
                {savingKey ? <div className="spinner" /> : 'Save Key'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowSettings(false)}>Cancel</button>
            </div>
            {user?.geminiApiKey && (
              <p style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: '0.5rem' }}>✅ Gemini key is configured</p>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)' }}>aistudio.google.com</a>
            </p>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Your <span className="text-gradient-cyan">Servers</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Select a server to open the Vibe Console and architect your SMP</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}><AlertTriangle size={16} />{error}</div>}

        {/* Servers Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : (
          <div className="grid-3">
            {servers.map((server) => (
              <div key={server.id} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Server size={24} color="var(--cyan)" />
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); deleteServer(server.id); }} style={{ color: 'var(--red)', borderColor: 'transparent' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem' }}>{server.server_name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>{server.server_identifier}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{server.panel_url}</p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate(`/console/${server.id}`)}
                >
                  <Play size={15} /> Open Vibe Console
                </button>
              </div>
            ))}

            {/* Add Server card */}
            <div
              className="card"
              onClick={() => navigate('/onboarding')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', background: 'transparent', minHeight: 220, gap: '0.75rem' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={22} color="var(--text-muted)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Add Server</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Link another hosting panel</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
