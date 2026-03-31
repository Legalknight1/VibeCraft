require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Core Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. API Routes (PRIORITY: Register before static files)
const { router: authRouter } = require('./routes/auth');
const pterodactylRouter = require('./routes/pterodactyl');
const vibeRouter = require('./routes/vibe');

app.use('/api/auth', authRouter);
app.use('/api/pterodactyl', pterodactylRouter);
app.use('/api/vibe', vibeRouter);

// 3. Healthy Heart
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', architecture: 'v8.1.1 (Singular Root Master)' });
});

// 4. Serve the Website (Frontend build folder)
const DIST_PATH = path.join(__dirname, 'dist');
app.use(express.static(DIST_PATH));

// 5. Fallback: Everything else goes to React
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// For Serverless Hosts (Vercel)
module.exports = app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🏗️ VibeCraft Singular Reactor is live on Port ${PORT}`);
    console.log(`📡 Deployment Link: http://localhost:${PORT}\n`);
  });
}
