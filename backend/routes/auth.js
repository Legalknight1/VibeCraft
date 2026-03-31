const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vibecraft-secret-change-this';

// Middleware to verify auth - In Dev mode, it resolves as GUEST_USER
const authenticate = (req, res, next) => {
  const guestId = 'GUEST_USER';
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(guestId);
  
  if (!user) {
    db.prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)').run(
      guestId, 'Administrator', 'admin@vibecraft.local', 'DEV_MODE'
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(guestId);
  }
  
  // Attach full user object (including gemini_api_key)
  req.user = { 
    ...user, 
    geminiApiKey: user.gemini_api_key // Normalize field name
  };
  next();
};

// POST /api/auth/register - OBSOLETE in No-Auth mode
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) return res.status(409).json({ error: 'Email or username already taken' });

    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    db.prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)').run(id, username, email, passwordHash);

    const token = jwt.sign({ id, username, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, username, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, geminiApiKey: user.gemini_api_key } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, username, email, gemini_api_key FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: { ...user, geminiApiKey: user.gemini_api_key } });
});

// PUT /api/auth/gemini-key
router.put('/gemini-key', authenticate, (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API key required' });
  db.prepare('UPDATE users SET gemini_api_key = ? WHERE id = ?').run(apiKey, req.user.id);
  res.json({ success: true });
});

// GET /api/auth/debug-models — list availabel models for the user's current key
router.get('/debug-models', authenticate, async (req, res) => {
  const user = db.prepare('SELECT gemini_api_key FROM users WHERE id = ?').get(req.user.id);
  if (!user?.gemini_api_key) return res.status(400).json({ error: 'Gemini API key not set' });

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(user.gemini_api_key);
    const result = await genAI.listModels();
    res.json({ models: result.models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Discord OAuth Routes ───

// GET /api/auth/discord
router.get('/discord', (req, res) => {
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
  if (!CLIENT_ID || !REDIRECT_URI) return res.status(500).json({ error: 'Discord Client ID or Redirect URI not configured on server' });

  const authUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify+email`;
  res.redirect(authUrl);
});

// GET /api/auth/discord/callback
router.get('/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

  try {
    // 1. Exchange code for token
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenRes.data;

    // 2. Fetch user profile
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const discordUser = userRes.data;
    const { id: discordId, email, username } = discordUser;

    if (!email) return res.status(400).json({ error: 'Discord account must have an email associated with it' });

    // 3. Find or Create user
    // First, try by discordId
    let user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);

    if (!user) {
      // Second, try by email (to link existing accounts)
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

      if (user) {
        // Link Discord to existng account
        db.prepare('UPDATE users SET discord_id = ? WHERE id = ?').run(discordId, user.id);
      } else {
        // Create new account
        const id = uuidv4();
        db.prepare('INSERT INTO users (id, username, email, discord_id) VALUES (?, ?, ?, ?)').run(
          id, username, email, discordId
        );
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      }
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Redirect back to frontend with token
    // We'll redirect to a dedicated callback page on the frontend
    const frontendBase = 'http://localhost:5173';
    res.redirect(`${frontendBase}/auth/callback?token=${token}&id=${user.id}&username=${user.username}&email=${user.email}${user.gemini_api_key ? `&geminiApiKey=${user.gemini_api_key}` : ''}`);

  } catch (err) {
    console.error('Discord Auth Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Discord authentication failed', details: err.response?.data });
  }
});

module.exports = { router, authenticate };
