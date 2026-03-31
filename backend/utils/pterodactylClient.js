const axios = require('axios');

class PterodactylClient {
  constructor(panelUrl, apiKey) {
    this.panelUrl = panelUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: `${this.panelUrl}/api/client`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // Test connection & get account info
  async testConnection() {
    const res = await this.client.get('/account');
    return res.data;
  }

  // List all servers the API key has access to
  async listServers() {
    const res = await this.client.get('/');
    return res.data.data.map((s) => ({
      identifier: s.attributes.identifier,
      name: s.attributes.name,
      node: s.attributes.node,
      status: s.attributes.status,
      game: s.attributes.name,
    }));
  }

  // Get server details
  async getServer(identifier) {
    const res = await this.client.get(`/servers/${identifier}`);
    return res.data.attributes;
  }

  // Get server resources (status, CPU, RAM)
  async getServerResources(identifier) {
    const res = await this.client.get(`/servers/${identifier}/resources`);
    return res.data.attributes;
  }

  // List files in a directory
  async listFiles(identifier, directory = '/') {
    const res = await this.client.get(`/servers/${identifier}/files/list`, {
      params: { directory },
    });
    return res.data.data.map((f) => f.attributes);
  }

  // Read a file's contents
  async readFile(identifier, filePath) {
    const res = await this.client.get(`/servers/${identifier}/files/contents`, {
      params: { file: filePath },
    });
    return res.data;
  }

  // Get a signed upload URL
  async getUploadUrl(identifier) {
    const res = await this.client.get(`/servers/${identifier}/files/upload`);
    return res.data.attributes.url;
  }

  // Upload a file using multipart form data
  async uploadFile(identifier, targetPath, fileName, fileBuffer) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('files', fileBuffer, { filename: fileName });

    const uploadUrl = await this.getUploadUrl(identifier);
    const url = `${uploadUrl}&directory=${encodeURIComponent(targetPath)}`;

    await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 120000,
    });
  }

  // Write a file via the write endpoint
  async writeFile(identifier, filePath, content) {
    // Ensure parent directories exist (Pterodactyl usually handles this, but we'll be safe)
    await this.client.post(`/servers/${identifier}/files/write`, content, {
      params: { file: filePath },
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Get the latest console logs
  async getLatestLog(identifier) {
    // Pterodactyl doesn't have a direct "get tail" in API, 
    // we read logs/latest.log which is standard for Minecraft.
    try {
      const res = await this.client.get(`/servers/${identifier}/files/contents`, {
        params: { file: 'logs/latest.log' }
      });
      return res.data;
    } catch (err) {
      return ""; // No logs found yet
    }
  }

  // Create a directory
  async createDirectory(identifier, dirPath, name) {
    await this.client.post(`/servers/${identifier}/files/create-folder`, {
      root: dirPath,
      name,
    });
  }

  // Send a command to the server console
  async sendCommand(identifier, command) {
    await this.client.post(`/servers/${identifier}/command`, { command });
  }

  // Restart the server
  async restartServer(identifier) {
    await this.client.post(`/servers/${identifier}/power`, { signal: 'restart' });
  }

  // Start the server
  async startServer(identifier) {
    await this.client.post(`/servers/${identifier}/power`, { signal: 'start' });
  }

  // Get WebSocket credentials for console streaming
  async getWebSocketCredentials(identifier) {
    const res = await this.client.get(`/servers/${identifier}/websocket`);
    return res.data.data;
  }

  /**
   * Decompress a compressed file (like .zip or .tar.gz) on the server.
   */
  async decompressFile(serverIdentifier, filePath) {
    await this.client.post(`/servers/${serverIdentifier}/files/decompress`, {
      root: '/',
      file: filePath
    });
  }

  /**
   * Move or rename a file/folder.
   */
  async moveFile(serverIdentifier, from, to) {
    await this.client.post(`/servers/${serverIdentifier}/files/rename`, {
      root: '/',
      files: [{ from, to }]
    });
  }
}

module.exports = PterodactylClient;

