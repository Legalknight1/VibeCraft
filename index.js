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

// 2. Serve the Website (Frontend)
const WEB_PATH = path.join(__dirname, 'site/dist');
app.use(express.static(WEB_PATH));

// 3. API Routes
const { router: authRouter } = require('./routes/auth');
const pterodactylRouter = require('./routes/pterodactyl');
const vibeRouter = require('./routes/vibe');

app.use('/api/auth', authRouter);
app.use('/api/pterodactyl', pterodactylRouter);
app.use('/api/vibe', vibeRouter);

// 4. Healthy Heart
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', architecture: 'v5.0.0 (Clean Monolith)' });
});

// 5. Fallback: Everything else goes to React
app.get('*', (req, res) => {
  res.sendFile(path.join(WEB_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🏗️ VibeCraft Cloud Reactor is live on Port ${PORT}`);
  console.log(`📡 Deployment Link: http://localhost:${PORT}\n`);
});
