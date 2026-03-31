const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 2: Blueprint Architect
 * Converts a Vibe Spec into a complete server blueprint with plugins, world palette, and Skript plans.
 * Uses the Gemini fallback chain to handle free-tier quota limits.
 */
async function blueprintArchitect(vibeSpec, apiKey) {
  const prompt = `You are the Blueprint Architect for VibeCraft, an AI system that designs Minecraft SMP servers.

Given this Vibe Spec, create a detailed server blueprint. Return ONLY valid JSON, no extra text.

Vibe Spec:
${JSON.stringify(vibeSpec, null, 2)}

Return this exact JSON structure:
{
  "title": "Blueprint title",
  "summary": "What this blueprint achieves",
  "required_plugins": [
    {
      "name": "Plugin name",
      "purpose": "Why this plugin is needed",
      "spigot_resource_id": null,
      "modrinth_slug": "slug or null",
      "priority": "essential | recommended | optional",
      "config_changes": [
        {
          "file": "relative/path/to/config.yml",
          "changes": [
            { "key": "config.key", "value": "value", "comment": "Why" }
          ]
        }
      ]
    }
  ],
  "server_properties": [
    { "key": "property-name", "value": "value", "reason": "why" }
  ],
  "skript_files": [
    {
      "filename": "mechanic-name.sk",
      "description": "What this script does",
      "features": ["List of features this script implements"],
      "priority": "essential | recommended"
    }
  ],
  "installation_order": ["1. Step one", "2. Step two"],
  "estimated_setup_time": "X minutes",
  "world_palette": {
    "atmosphere": "Description of the world's visual feel and atmosphere",
    "primary_blocks": ["BlockName1", "BlockName2", "BlockName3", "BlockName4", "BlockName5"],
    "accent_blocks": ["AccentBlock1", "AccentBlock2"],
    "lighting": "Description of lighting mood (e.g. dim lanterns, soul fire, sunlit glades)",
    "biomes": ["Biome1", "Biome2"]
  },
  "warnings": ["Any compatibility warnings or notes"]
}

Include these essential plugins when relevant:
- Vault (economy API) if any economy features
- LuckPerms (permissions) always
- EssentialsX (basic commands) always
- WorldEdit (world editing) if needed
- Skript (scripting engine) if needs_custom_skript is true

For Lifesteal-type servers, consider: UltraHardcore plugins, HeartCrystal, Skript for custom mechanics.
For economy servers: ShopGUI+, Essentials economy, Vault.
For RPG servers: MythicMobs, ModelEngine, MMOCore.

Be specific with spigot_resource_id values (use real known IDs):
- Vault: 34315
- LuckPerms: use modrinth slug "luckperms"
- EssentialsX: use modrinth slug "essentialsx"
- Skript: 114544
- WorldEdit: use modrinth slug "worldedit"
- WorldGuard: 13932`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = blueprintArchitect;
