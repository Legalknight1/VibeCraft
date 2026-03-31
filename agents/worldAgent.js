const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 3: World Agent
 * Designs worldgen datapacks (density functions, noise settings).
 */
async function worldAgent(vibeStrategy, apiKey) {
  const prompt = `You are the World Architect for VibeCraft. Your goal is to generate Minecraft 1.21.3+ Worldgen JSONs.

VIBE STRATEGY:
${JSON.stringify(vibeStrategy, null, 2)}

YOUR GOAL:
1. Create a "custom-world" datapack.
2. Generate noise_settings/overworld.json (terrain height, ocean depth).
3. Generate density_functions.
4. Finalize worldgen rules.

Return ONLY valid JSON:
{
  "datapacks": {
    "custom-world": {
      "pack.mcmeta": "{\"pack\": {\"description\": \"Custom World Gen for ${vibeStrategy.title}\", \"pack_format\": 48}}",
      "data": {
        "minecraft": {
          "worldgen": {
            "noise_settings": {
              "overworld.json": "The full JSON string for noise settings ( terrain_height, sea_level, etc.)"
            },
            "multi_noise_biome_source_parameter_list": {
              "overworld.json": "The full JSON string for biome parameters"
            }
          }
        }
      }
    }
  },
  "summary": "What we did with terrain/biomes"
}`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = worldAgent;
