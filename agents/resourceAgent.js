const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 7: Resource Agent
 * Assigns/links themed resource packs.
 */
async function resourceAgent(vibeStrategy, apiKey) {
  const prompt = `You are the Resource Pack Manager for VibeCraft. Your goal is to find a theme-appropriate resource pack for ${vibeStrategy.title}.

VIBE STRATEGY:
${JSON.stringify(vibeStrategy, null, 2)}

YOUR GOAL:
1. Suggest a direct download URL for a 1.21-compatible resource pack that matches ${vibeStrategy.theme}.
2. Recommend a hash for the pack.
3. Fallback to default if nothing fits.

Return ONLY valid JSON:
{
  "resource_pack_url": "Direct download link (e.g. from PlanetMinecraft or similar)",
  "resource_pack_hash": "Recommended hash if any",
  "reasoning": "Why we chose this pack"
}`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = resourceAgent;
