const axios = require('axios');

const SPIGET_BASE = 'https://api.spiget.org/v2';

class SpigetClient {
  // Search for a resource (plugin) by name
  static async searchPlugin(name, size = 5) {
    try {
      const res = await axios.get(`${SPIGET_BASE}/search/resources/${encodeURIComponent(name)}`, {
        params: { size, sort: '-downloads', fields: 'id,name,tag,downloads,version,file,external' },
        timeout: 15000,
      });
      return res.data;
    } catch (err) {
      console.error('[Spiget] Search error:', err.message);
      return [];
    }
  }

  // Get a resource by ID
  static async getPlugin(resourceId) {
    try {
      const res = await axios.get(`${SPIGET_BASE}/resources/${resourceId}`, {
        timeout: 15000,
      });
      return res.data;
    } catch (err) {
      console.error('[Spiget] Get plugin error:', err.message);
      return null;
    }
  }

  // Get the download URL for a resource
  static getDownloadUrl(resourceId) {
    return `${SPIGET_BASE}/resources/${resourceId}/download`;
  }

  // Download a plugin JAR as a buffer
  static async downloadPlugin(resourceId) {
    try {
      const res = await axios.get(`${SPIGET_BASE}/resources/${resourceId}/download`, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: 100 * 1024 * 1024, // 100MB
      });
      return Buffer.from(res.data);
    } catch (err) {
      console.error('[Spiget] Download error:', err.message);
      throw new Error(`Failed to download plugin ${resourceId}: ${err.message}`);
    }
  }

  // Check if plugin is premium (cannot auto-download)
  static async isPremium(resourceId) {
    const plugin = await this.getPlugin(resourceId);
    return plugin?.premium === true;
  }
}

module.exports = SpigetClient;
