const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const PterodactylClient = require('../utils/pterodactylClient');
const { authenticate } = require('./auth');

const router = express.Router();

// POST /api/pterodactyl/test — test API key connection
router.post('/test', authenticate, async (req, res) => {
  const { panelUrl, apiKey } = req.body;
  if (!panelUrl || !apiKey) return res.status(400).json({ error: 'panelUrl and apiKey required' });

  try {
    const client = new PterodactylClient(panelUrl, apiKey);
    const account = await client.testConnection();
    const servers = await client.listServers();
    res.json({ success: true, account: account.attributes, servers });
  } catch (err) {
    res.status(400).json({ error: 'Connection failed: ' + err.message });
  }
});

// POST /api/pterodactyl/servers — save a linked server
router.post('/servers', authenticate, async (req, res) => {
  const { panelUrl, apiKey, serverIdentifier, serverName } = req.body;
  if (!panelUrl || !apiKey || !serverIdentifier || !serverName) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO servers (id, user_id, panel_url, api_key, server_identifier, server_name) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, req.user.id, panelUrl, apiKey, serverIdentifier, serverName);

    res.status(201).json({ id, serverIdentifier, serverName, panelUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pterodactyl/servers — list user's linked servers
router.get('/servers', authenticate, (req, res) => {
  const servers = db.prepare('SELECT id, server_identifier, server_name, panel_url, created_at FROM servers WHERE user_id = ?').all(req.user.id);
  res.json({ servers });
});

// DELETE /api/pterodactyl/servers/:id
router.delete('/servers/:id', authenticate, (req, res) => {
  db.prepare('DELETE FROM servers WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// GET /api/pterodactyl/servers/:id/status
router.get('/servers/:id/status', authenticate, async (req, res) => {
  const server = db.prepare('SELECT * FROM servers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!server) return res.status(404).json({ error: 'Server not found' });

  try {
    const client = new PterodactylClient(server.panel_url, server.api_key);
    const resources = await client.getServerResources(server.server_identifier);
    res.json({ resources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pterodactyl/servers/:id/plugins — scan plugins folder
router.get('/servers/:id/plugins', authenticate, async (req, res) => {
  const server = db.prepare('SELECT * FROM servers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!server) return res.status(404).json({ error: 'Server not found' });

  try {
    const client = new PterodactylClient(server.panel_url, server.api_key);
    const files = await client.listFiles(server.server_identifier, '/plugins');
    const plugins = files.filter((f) => f.name.endsWith('.jar')).map((f) => ({ name: f.name, size: f.size }));
    res.json({ plugins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pterodactyl/servers/:id/websocket — get Pterodactyl WS credentials for console stream
router.get('/servers/:id/websocket', authenticate, async (req, res) => {
  const server = db.prepare('SELECT * FROM servers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!server) return res.status(404).json({ error: 'Server not found' });

  try {
    const client = new PterodactylClient(server.panel_url, server.api_key);
    const credentials = await client.getWebSocketCredentials(server.server_identifier);
    // credentials = { token, socket }
    res.json(credentials);
  } catch (err) {
    res.status(500).json({ error: 'Could not get WebSocket credentials: ' + err.message });
  }
});

module.exports = router;

