import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Server, Code2, Rocket, ArrowRight, Cpu, Wand2, Package } from 'lucide-react';

const VIBES = [
  '"Lifesteal SMP with Blood Crystals that grant speed..."',
  '"Medieval RPG with custom classes and dungeon loot..."',
  '"Economy SMP with drug cartels and black markets..."',
  '"Hardcore SMP with prestige ranks and custom bosses..."',
];

const FEATURES = [
  {
    icon: <Wand2 size={22} />,
    color: 'var(--cyan)',
    dim: 'var(--cyan-dim)',
    title: 'Vibe Interpreter',
    desc: 'Describe your dream SMP in plain English. Agent 1 converts it into a structured blueprint JSON.',
  },
  {
    icon: <Package size={22} />,
    color: 'var(--purple)',
    dim: 'var(--purple-dim)',
    title: 'Blueprint Architect',
    desc: 'Agent 2 designs a full plugin list, world palette, and Skript plan tailored to your concept.',
  },
  {
    icon: <Code2 size={22} />,
    color: '#ec4899',
    dim: 'rgba(236,72,153,0.15)',
    title: 'Skript Writer',
    desc: 'No plugin for your idea? Agent 4 writes production-ready Skript files for custom mechanics.',
  },
  {
    icon: <Rocket size={22} />,
    color: '#22c55e',
    dim: 'rgba(34,197,94,0.15)',
    title: 'Auto Deployer',
    desc: 'Agent 5 downloads plugins, uploads to your Pterodactyl server, and triggers a restart.',
  },
];

const STEPS = [
  { num: '01', title: 'Connect Panel', desc: 'Enter your Pterodactyl panel URL + API key. We never store your key in plain text.' },
  { num: '02', title: 'Type Your Vibe', desc: 'Write anything — "Lifesteal SMP with Blood Crystals" — in free form language.' },
  { num: '03', title: 'Approve Blueprint', desc: 'Review the AI-generated plugin list, world palette and Skript plan before anything is deployed.' },
  { num: '04', title: 'Watch It Deploy', desc: 'Real-time SSE log stream shows every file upload, plugin install, and server restart.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [vibeIdx, setVibeIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    const target = VIBES[vibeIdx];
    let i = 0;
    let timeout;

    if (typing) {
      const type = () => {
        if (i <= target.length) {
          setDisplayed(target.slice(0, i));
          i++;
          timeout = setTimeout(type, 28);
        } else {
          timeout = setTimeout(() => setTyping(false), 2000);
        }
      };
      type();
    } else {
      // erase
      let j = target.length;
      const erase = () => {
        if (j >= 0) {
          setDisplayed(target.slice(0, j));
          j--;
          timeout = setTimeout(erase, 14);
        } else {
          setVibeIdx((prev) => (prev + 1) % VIBES.length);
          setTyping(true);
        }
      };
      erase();
    }

    return () => clearTimeout(timeout);
  }, [vibeIdx, typing]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient orbs */}
      <div className="orb orb-cyan" style={{ width: 700, height: 700, top: -250, left: -300, opacity: 0.12 }} />
      <div className="orb orb-purple" style={{ width: 600, height: 600, bottom: -200, right: -200, opacity: 0.12 }} />
      <div className="orb orb-pink" style={{ width: 300, height: 300, top: '40%', left: '50%', opacity: 0.06 }} />

      {/* Nav */}
      <nav style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, var(--cyan), var(--purple))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--cyan-glow)' }}>
            <Zap size={22} color="#050508" strokeWidth={2.5} />
          </div>
          <span className="text-display" style={{ fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--cyan), var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VibeCraft
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="badge badge-purple"><Zap size={10} /> AI Multi-Agent SMP Architect</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem 3rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="badge badge-cyan" style={{ marginBottom: '2rem', fontSize: '0.75rem', padding: '0.4rem 1rem' }}>
          <Zap size={12} /> Powered by Google Gemini 2.0 &nbsp;•&nbsp; 5-Agent Pipeline
        </div>

        <h1 className="text-display" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', lineHeight: 1.05, marginBottom: '1.5rem', maxWidth: 900 }}>
          Vibe your Minecraft SMP<br />
          <span className="text-gradient-cyan">into reality.</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '3rem', maxWidth: 600 }}>
          Connect your Pterodactyl panel, describe your dream server, and watch VibeCraft's AI agents architect, install, script, and deploy everything — automatically.
        </p>

        {/* Typewriter vibe showcase */}
        <div className="card" style={{ maxWidth: 640, width: '100%', marginBottom: '3rem', padding: '1.25rem 1.75rem', textAlign: 'left', borderColor: 'var(--border-purple)', background: 'rgba(15,15,30,0.9)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="status-dot online" /> User Vibe Input
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', color: 'var(--cyan)', minHeight: '1.5em' }}>
            {displayed}<span style={{ animation: 'type-cursor 0.8s infinite', borderRight: '2px solid var(--cyan)', marginLeft: '1px' }}>&nbsp;</span>
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/dashboard')}
            style={{ fontSize: '1rem', padding: '0.9rem 2.25rem', gap: '0.75rem' }}
          >
            <Zap size={20} /> Launch App <ArrowRight size={18} />
          </button>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() => navigate('/onboarding')}
            style={{ fontSize: '1rem', padding: '0.9rem 2.25rem' }}
          >
            <Server size={18} /> Connect Server
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No login required • Your API keys stay encrypted on your machine</p>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 4rem', position: 'relative', zIndex: 10, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge badge-purple" style={{ marginBottom: '1rem' }}><Cpu size={10} /> Multi-Agent Pipeline</div>
          <h2 className="text-display" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>5 AI Agents. One Command.</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Each agent is a specialist. Together they take your vibe from idea to live server.
          </p>
        </div>

        <div className="grid-2" style={{ maxWidth: 900, margin: '0 auto', gap: '1.25rem' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: f.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.375rem', color: f.color }}>{f.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 5rem', position: 'relative', zIndex: 10, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="text-display" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            From <span className="text-gradient-cyan">Vibe</span> to Live Server
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {STEPS.map((s, i) => (
            <div key={s.num} className="card" style={{ position: 'relative', borderTop: '3px solid', borderTopColor: ['var(--cyan)', 'var(--purple)', '#ec4899', '#22c55e'][i] }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: ['var(--cyan)', 'var(--purple)', '#ec4899', '#22c55e'][i], opacity: 0.4, marginBottom: '0.75rem' }}>{s.num}</div>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ textAlign: 'center', padding: '3rem 2rem 5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.06), rgba(168,85,247,0.06))', border: '1px solid var(--border-cyan)', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', maxWidth: 660, margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
          <h2 className="text-display" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
            Ready to <span className="text-gradient-cyan">vibe</span>?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Connect your Pterodactyl panel and start architecting your dream SMP in minutes.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding')} style={{ margin: '0 auto', fontSize: '1rem' }}>
            <Server size={18} /> Connect Your Server <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', position: 'relative', zIndex: 10, borderTop: '1px solid var(--border)' }}>
        VibeCraft &nbsp;•&nbsp; AI-Powered SMP Architect &nbsp;•&nbsp; Powered by Google Gemini 2.5 Flash
      </footer>
    </div>
  );
}
