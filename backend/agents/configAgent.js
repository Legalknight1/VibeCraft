const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 6: Config Agent
 * Generates all plugin configurations based on the vibe.
 */
async function configAgent(vibeStrategy, plugins, apiKey) {
  const prompt = `You are the Configuration Expert for VibeCraft. Your goal is to write plugin configs (.yml).

VIBE STRATEGY:
${JSON.stringify(vibeStrategy, null, 2)}

PLUGINS WE ARE INSTALLING:
${JSON.stringify(plugins, null, 2)}

YOUR GOAL:
1. Generate the core configs for each plugin (LuckPerms, Essentials, Vault, etc.).
2. Make sure they match the vibe (e.g. Red names for VIPs in Medieval SMP).
3. Do NOT provide placeholders. Provide ready-to-run YAML.

Return ONLY valid JSON:
{
  "configs": {
    "plugins/LuckPerms/config.yml": "Full YAML string",
    "plugins/Essentials/config.yml": "Full YAML string",
    "plugins/Essentials/motd.txt": "Vibe-styled MOTD"
  },
  "summary": "What configs we updated"
}`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = configAgent;
