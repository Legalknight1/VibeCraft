const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data', 'vibecraft.db'));

try {
  db.prepare('ALTER TABLE users ADD COLUMN discord_id TEXT').run();
  console.log('✅ Added discord_id column to users table.');
} catch (err) {
  if (err.message.includes('duplicate column name')) {
    console.log('ℹ️ discord_id column already exists.');
  } else {
    console.error('❌ Error adding column:', err.message);
  }
}

try {
  // SQLite doesn't support ALTER TABLE DROP NOT NULL
  // But for new users it won't matter if we just handle it in the code
  console.log('ℹ️ SQLite does not support removing NOT NULL via ALTER TABLE.');
  console.log('ℹ️ Current schema remains, but discord_id is now available.');
} catch (err) {
  console.error(err);
}

db.close();
