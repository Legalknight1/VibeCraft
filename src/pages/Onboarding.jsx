import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Server, Key, Check, ChevronRight, AlertTriangle, Loader2, Link2 } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../utils/api';

const STEPS = ['Connect Hosting', 'Select Server', 'Gemini API', 'Done'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 0
  const [panelUrl, setPanelUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testResult, setTestResult] = useState(null);
  
  // Step 1
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  
  // Step 2
  const [geminiKey, setGeminiKey] = useState('');

  const testConnection = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api.testConnection(panelUrl, apiKey);
      setTestResult(result);
      setServers(result.servers);
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const linkServer = async () => {
    if (!selectedServer) return;
    setError('');
    setLoading(true);
    try {
      await api.linkServer({
        panelUrl,
        apiKey,
        serverIdentifier: selectedServer.identifier,
        serverName: selectedServer.name,
      });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveGeminiKey = async () => {
    if (!geminiKey.trim()) { setStep(3); return; } // Allow skipping
    setError('');
    setLoading(true);
    try {
      await api.setGeminiKey(geminiKey);
      updateUser({ geminiApiKey: geminiKey });
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flex: 1, position: 'relative' }}>
      <div className="orb orb-cyan" style={{ width: 400, height: 400, top: -100, right: -100, opacity: 0.3 }} />
      <div className="orb orb-purple" style={{ width: 300, height: 300, bottom: -50, left: -50, opacity: 0.2 }} />

      <div style={{ maxWidth: 640, width: '100%', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '3rem' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--cyan), var(--purple))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#050508" strokeWidth={2.5} />
          </div>
          <span className="text-display" style={{ fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--cyan), var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VibeCraft
          </span>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '3rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem',
                  background: i < step ? 'linear-gradient(135deg, var(--cyan), #0099aa)' : i === step ? 'var(--bg-card)' : 'transparent',
                  border: i < step ? 'none' : i === step ? '2px solid var(--cyan)' : '2px solid var(--border)',
                  color: i < step ? 'var(--bg-void)' : i === step ? 'var(--cyan)' : 'var(--text-muted)',
                  transition: 'var(--transition)',
                }}>
                  {i < step ? <Check size={18} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.7rem', color: i === step ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < step ? 'var(--cyan)' : 'var(--border)', margin: '0 0.5rem', marginBottom: '1.5rem', transition: 'var(--transition)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Connect Hosting */}
        {step === 0 && (
          <div className="card page-enter">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={22} color="var(--cyan)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Connect Your Hosting Panel</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Supports Pterodactyl-based panels</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Panel URL</label>
                <input className="form-input" type="url" placeholder="https://panel.yourhost.com" value={panelUrl} onChange={(e) => setPanelUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Client API Key</label>
                <input className="form-input" type="password" placeholder="ptlc_xxxxxxxxxxxxxxxx" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Find this in your panel: Account → API Credentials → Create API Key
                </p>
              </div>

              {error && <div className="alert alert-error"><AlertTriangle size={16} />{error}</div>}

              <button className="btn btn-primary" onClick={testConnection} disabled={loading || !panelUrl || !apiKey} style={{ justifyContent: 'center' }}>
                {loading ? <><div className="spinner" /> Testing connection...</> : <><Link2 size={16} /> Test & Connect</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Select Server */}
        {step === 1 && (
          <div className="card page-enter">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={22} color="var(--cyan)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Select Your Server</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Found {servers.length} server(s) on {testResult?.account?.email}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {servers.map((server) => (
                <div
                  key={server.identifier}
                  onClick={() => setSelectedServer(server)}
                  className="plugin-row"
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedServer?.identifier === server.identifier ? 'var(--cyan)' : 'var(--border)',
                    background: selectedServer?.identifier === server.identifier ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.02)',
                    borderLeftWidth: 1,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{server.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{server.identifier}</div>
                  </div>
                  {selectedServer?.identifier === server.identifier && <Check size={18} color="var(--cyan)" />}
                </div>
              ))}
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertTriangle size={16} />{error}</div>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
              <button className="btn btn-primary" onClick={linkServer} disabled={loading || !selectedServer} style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? <><div className="spinner" /> Linking...</> : <>Link Server <ChevronRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Gemini API Key */}
        {step === 2 && (
          <div className="card page-enter">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={22} color="var(--purple)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Gemini API Key</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Powers the AI agents (free tier available)</p>
              </div>
            </div>

            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <Zap size={16} />
              Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', fontWeight: 600 }}>aistudio.google.com</a>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">API Key</label>
              <input className="form-input" type="password" placeholder="AIzaSy..." value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} />
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertTriangle size={16} />{error}</div>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(3)}>Skip for now</button>
              <button className="btn btn-primary" onClick={saveGeminiKey} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? <><div className="spinner" /> Saving...</> : <>Save & Continue <ChevronRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="card page-enter" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
            <h2 className="text-display" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              <span className="text-gradient-cyan">You're all set!</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Your server is linked and ready to vibe. Head to your dashboard to start building your dream SMP.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')} style={{ margin: '0 auto' }}>
              Open Dashboard <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
