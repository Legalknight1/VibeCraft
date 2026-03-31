const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 2: Plugin Agent
 * Researches and picks plugins based on the vibe.
 */
async function pluginAgent(vibeStrategy, apiKey) {
  const prompt = `You are the Plugin Researcher for VibeCraft. Your goal is to pick the best 1.21.3+ plugins for this SMP.

VIBE STRATEGY:
${JSON.stringify(vibeStrategy, null, 2)}

YOUR GOAL:
1. Identify all required plugins (Vault, EssentialsX, LuckPerms are usually core).
2. Research vibe-specific plugins (e.g. for a Medieval theme).
3. If no plugin exists for a specific feature, flag it for the "Skript Agent" to handle.

Return ONLY valid JSON:
{
  "plugins": [
    { "name": "LuckPerms", "source": "Modrinth", "reason": "Permissions management" },
    { "name": "EssentialsX", "source": "Spigot", "reason": "Base server commands" }
  ],
  "skript_mems": [ "list of features we will build with Skript instead of plugins" ]
}`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = pluginAgent;
