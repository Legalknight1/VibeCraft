const API_BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('vc_token');

const request = async (method, path, data = null, opts = {}) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...opts,
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

export const api = {
  // Auth
  register: (data) => request('POST', '/auth/register', data),
  login: (data) => request('POST', '/auth/login', data),
  getMe: () => request('GET', '/auth/me'),
  setGeminiKey: (apiKey) => request('PUT', '/auth/gemini-key', { apiKey }),

  // Pterodactyl
  testConnection: (panelUrl, apiKey) => request('POST', '/pterodactyl/test', { panelUrl, apiKey }),
  linkServer: (data) => request('POST', '/pterodactyl/servers', data),
  getLinkedServers: () => request('GET', '/pterodactyl/servers'),
  deleteServer: (id) => request('DELETE', `/pterodactyl/servers/${id}`),
  getServerStatus: (id) => request('GET', `/pterodactyl/servers/${id}/status`),
  getServerPlugins: (id) => request('GET', `/pterodactyl/servers/${id}/plugins`),

  // Vibe
  interpretVibe: (vibeInput, serverId) => request('POST', '/vibe/interpret', { vibeInput, serverId }),
  createBlueprint: (vibeInput, serverId) => request('POST', '/vibe/blueprint', { vibeInput, serverId }),
  getBlueprints: () => request('GET', '/vibe/blueprints'),
  getBlueprint: (id) => request('GET', `/vibe/blueprints/${id}`),

  // Live Architect Flow
  consultant: (vibeInput, serverId, history) => 
    request('POST', '/vibe/consultant', { vibeInput, serverId, history }),

  uploadToServer: async (serverId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    };
    const res = await fetch(`${API_BASE}/pterodactyl/servers/${serverId}/upload`, options);
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  streamDeploy: (blueprintId, onLog) => {
    const es = new EventSource(`${API_BASE}/vibe/deploy/${blueprintId}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onLog(data);
        if (data.level === 'done' || data.level === 'error') es.close();
      } catch (err) { console.error('SSE Error:', err); }
    };
    es.onerror = () => es.close();
    return es;
  }
};

export default api;
