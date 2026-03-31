const axios = require('axios');

const MODRINTH_BASE = 'https://api.modrinth.com/v2';

const modrinth = axios.create({
  baseURL: MODRINTH_BASE,
  headers: { 'User-Agent': 'VibeCraft/1.0 (vibecraft-smp-tool)' },
  timeout: 15000,
});

class ModrinthClient {
  // Search for a project (plugin/mod)
  static async searchPlugin(name, loaders = ['paper', 'spigot', 'bukkit'], limit = 5) {
    try {
      const res = await modrinth.get('/search', {
        params: {
          query: name,
          facets: JSON.stringify([['project_type:plugin'], loaders.map((l) => `categories:${l}`)]),
          limit,
        },
      });
      return res.data.hits;
    } catch (err) {
      console.error('[Modrinth] Search error:', err.message);
      return [];
    }
  }

  // Get a project by slug or ID
  static async getProject(idOrSlug) {
    try {
      const res = await modrinth.get(`/project/${idOrSlug}`);
      return res.data;
    } catch (err) {
      console.error('[Modrinth] Get project error:', err.message);
      return null;
    }
  }

  // Get latest version for a project matching game version
  static async getLatestVersion(projectId, gameVersion, loaders = ['paper']) {
    try {
      const res = await modrinth.get(`/project/${projectId}/version`, {
        params: {
          game_versions: JSON.stringify([gameVersion]),
          loaders: JSON.stringify(loaders),
        },
      });
      return res.data[0] || null;
    } catch (err) {
      // Try without version filter
      try {
        const res2 = await modrinth.get(`/project/${projectId}/version`);
        return res2.data[0] || null;
      } catch {
        return null;
      }
    }
  }

  // Download the primary file from a version
  static async downloadVersion(version) {
    const primaryFile = version.files.find((f) => f.primary) || version.files[0];
    if (!primaryFile) throw new Error('No files found in version');

    const res = await axios.get(primaryFile.url, {
      responseType: 'arraybuffer',
      timeout: 120000,
      maxContentLength: 100 * 1024 * 1024,
    });
    return {
      buffer: Buffer.from(res.data),
      filename: primaryFile.filename,
    };
  }
}

module.exports = ModrinthClient;
