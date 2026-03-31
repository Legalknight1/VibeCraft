import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap, Send, ArrowLeft, Package, Code2, Rocket, CheckCircle2,
  AlertTriangle, XCircle, ChevronDown, ChevronUp, Cpu, MemoryStick,
  Terminal, Box, Layers, RefreshCw, MessageSquare, Paperclip, FileText,
  HelpCircle, Trash2, CloudUpload, Brain, Loader, Check, Info
} from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../utils/api';

const API_BASE = 'http://localhost:3001/api';

// --- Sidebar: Live Status Widget ---
function LiveStatusWidget({ serverId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getServerStatus(serverId);
      setStatus(data.resources);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 10000);
    return () => clearInterval(intervalRef.current);
  }, [fetchStatus]);

  const isOnline = status?.current_state === 'running';
  const cpuPct = Math.min(status?.resources?.cpu_absolute ?? 0, 100).toFixed(1);
  const ramMB = ((status?.resources?.memory_bytes ?? 0) / 1024 / 1024).toFixed(0);
  const ramLimitMB = ((status?.resources?.memory_limit_bytes ?? 0) / 1024 / 1024).toFixed(0);
  const ramPct = ramLimitMB > 0 ? ((ramMB / ramLimitMB) * 100).toFixed(0) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>Server Status</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="spinner" style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connecting...</span>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={14} color="var(--red)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--red)' }}>Unreachable</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isOnline ? 'var(--green)' : 'var(--red)' }}>
              {isOnline ? 'Online' : (status?.current_state ?? 'Offline')}
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Cpu size={11} /> CPU
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)' }}>{cpuPct}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${cpuPct}%`, background: `linear-gradient(90deg, var(--cyan), var(--purple))`, borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <MemoryStick size={11} /> RAM
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)' }}>{ramMB} MB</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${ramPct}%`, background: `linear-gradient(90deg, var(--purple), #ec4899)`, borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>
      </div>
    </div>
  );
}

// --- Main VibeConsole ---
export default function VibeConsole() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([{
    id: 'welcome',
    role: 'agent',
    type: 'text',
    content: "Greetings Architect! 🎮 Describe your SMP vision and I'll break it into tasks and self-heal your server until it boots clean.",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thoughtStream, setThoughtStream] = useState([]);
  const [serverName, setServerName] = useState('Server');
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.getLinkedServers().then((data) => {
      const sv = data.servers.find((s) => s.id === serverId);
      if (sv) setServerName(sv.server_name);
    }).catch(() => {});
  }, [serverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thoughtStream]);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  };

  const autonomousDeploy = async (vibe) => {
    setLoading(true);
    setThoughtStream([]);
    
    addMessage({ role: 'user', type: 'text', content: vibe });

    const es = new EventSource(`${API_BASE}/vibe/autonomous-deploy/${serverId}?vibeInput=${encodeURIComponent(vibe)}`);
    
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.level === 'info' || data.level === 'warn') {
          setThoughtStream(prev => [...prev, { level: data.level, msg: data.message, detail: data.detail }]);
        } else if (data.level === 'done') {
          setThoughtStream(prev => [...prev, { level: 'success', msg: data.message, detail: data.detail }]);
          es.close();
          setLoading(false);
        } else if (data.level === 'error') {
          setThoughtStream(prev => [...prev, { level: 'error', msg: data.message, detail: data.detail }]);
          es.close();
          setLoading(false);
        }
      } catch (err) { console.error('SSE JSON error', err); }
    };

    es.onerror = () => {
      es.close();
      setLoading(false);
    };
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-void)' }}>
      {/* Top Bar */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}><ArrowLeft size={15} /> Dashboard</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={15} color="var(--cyan)" /></div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{serverName} - Autonomous Architect</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map((msg) => (
               <MessageBubble key={msg.id} msg={msg} />
            ))}
            
            {thoughtStream.length > 0 && (
              <div style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid var(--border-purple)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--purple)' }}>
                   <Brain size={14} className={loading ? "spin" : ""} /> Autonomous Thought Stream
                 </div>
                 {thoughtStream.map((t, i) => (
                   <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div style={{ color: t.level === 'error' ? 'var(--red)' : (t.level === 'success' ? 'var(--green)' : 'var(--cyan)') }}>
                        {t.level === 'success' ? <Check size={14}/> : (t.level === 'error' ? <XCircle size={14}/> : <Info size={14}/>)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.msg}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.detail}</div>
                      </div>
                   </div>
                 ))}
                 {loading && <div className="spinner-dots" style={{ marginLeft: '1.5rem' }}/>}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="chat-input-row" style={{ padding: '1rem' }}>
              <input type="file" ref={fileInputRef} hidden multiple onChange={() => {}} />
              <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()} style={{ padding: '0 0.5rem' }}><Paperclip size={20} /></button>
              
              <textarea
                className="chat-input"
                placeholder="Talk to VibeCraft Architect... Define your vision."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (autonomousDeploy(input), setInput(''))}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', resize: 'none', height: 40 }}
              />
              
              <button className="send-btn" onClick={() => (autonomousDeploy(input), setInput(''))} disabled={loading}><Send size={20} /></button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', paddingBottom: '0.5rem' }}>Self-Healing Mode Active • Modular Skript Generation • Live Log Validation</p>
          </div>
        </div>

        {/* Status Sidebar */}
        <div style={{ width: 280, borderLeft: '1px solid var(--border)', background: 'rgba(5,5,8,0.7)', padding: '1.25rem', overflowY: 'auto' }}>
           <LiveStatusWidget serverId={serverId} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
       <div className={`chat-bubble ${isUser ? 'user' : 'agent'}`} style={{ maxWidth: '80%', background: isUser ? 'var(--purple-dim)' : 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
          <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
       </div>
    </div>
  );
}
