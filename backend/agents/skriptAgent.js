const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 4: Skript Agent
 * Generates modular Skript code (.sk files). 
 * No placeholders. Production ready.
 */
async function skriptAgent(vibeStrategy, apiKey) {
  const prompt = `You are the Skript Master for VibeCraft. You are writing MODULAR Skript code for Minecraft 1.21.3+.

AVAILABLE ADDONS: SkBee, skript-reflect, SkQuery, Vault.

VIBE STRATEGY:
${JSON.stringify(vibeStrategy, null, 2)}

YOUR RULES:
- No placeholder code. Everything must be runnable.
- Use modular structure.
- Hook into LuckPerms/Essentials if needed.
- Focus on: '_core.sk', 'join-events.sk', 'classes.sk', 'economy.sk', 'arena.sk', 'vibes.sk'.

Return ONLY valid JSON:
{
  "files": {
    "_core.sk": "Code for functions and variables",
    "join-events.sk": "Code for join messages/intro",
    "classes.sk": "Code for RPG classes (if any)",
    "economy.sk": "Code for custom economy mechanics",
    "vibes.sk": "Code for custom 'vibey' mechanics"
  },
  "summary": "What logic we implemented"
}`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = skriptAgent;
