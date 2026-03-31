require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve Frontend Static Files
const DIST_PATH = path.join(__dirname, '../frontend/dist');
app.use(express.static(DIST_PATH));

// Routes
const { router: authRouter } = require('./routes/auth');
const pterodactylRouter = require('./routes/pterodactyl');
const vibeRouter = require('./routes/vibe');

app.use('/api/auth', authRouter);
app.use('/api/pterodactyl', pterodactylRouter);
app.use('/api/vibe', vibeRouter);

// SPA Fallback: Send everything else to React
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', name: 'VibeCraft API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🎮 VibeCraft API running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
