const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'vibecraft.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    discord_id TEXT,
    gemini_api_key TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    panel_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    server_identifier TEXT NOT NULL,
    server_name TEXT NOT NULL,
    game_version TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS blueprints (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    vibe_input TEXT NOT NULL,
    vibe_spec TEXT NOT NULL,
    blueprint TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at INTEGER DEFAULT (unixepoch()),
    deployed_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS deployment_logs (
    id TEXT PRIMARY KEY,
    blueprint_id TEXT NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  );
`);

module.exports = db;
