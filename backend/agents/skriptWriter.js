const { callGemini } = require('../utils/geminiClient');

/**
 * Agent 4: Skript Writer
 * Generates custom Skript (.sk) files for mechanics that no plugin covers.
 * Uses the Gemini fallback chain to handle free-tier quota limits.
 */
async function skriptWriter(vibeSpec, blueprint, apiKey, emit) {
  const skriptFiles = [];

  for (const skriptPlan of (blueprint.skript_files || [])) {
    emit('info', `✍️ Writing Skript: ${skriptPlan.filename}...`);

    const prompt = `You are a Minecraft Skript expert writing a .sk file for a custom SMP mechanic.

Context:
- SMP Theme: ${vibeSpec.theme}
- SMP Title: ${vibeSpec.title}
- Script File: ${skriptPlan.filename}
- Script Purpose: ${skriptPlan.description}
- Features to implement: ${skriptPlan.features.join(', ')}

Custom Items from this SMP:
${JSON.stringify(vibeSpec.custom_items || [], null, 2)}

Core Mechanics from this SMP:
${JSON.stringify(vibeSpec.core_mechanics || [], null, 2)}

Plugin dependencies available on the server:
${blueprint.required_plugins.map((p) => p.name).join(', ')}

Write a complete, functional Skript file. Follow these rules:
1. Use proper Skript syntax (Skript 2.6+)
2. Add comments explaining each section
3. Use proper event handlers (on death, on kill, on join, etc.)
4. Handle edge cases (null checks, permission checks)
5. Use metadata or persistent variables for player data
6. If using custom items, use proper item with lore and name
7. Include all necessary imports/using statements at top if needed
8. Make the code actually work — this will be deployed to a real server

Return ONLY the raw Skript code, no markdown fences, no explanation.`;

    try {
      let code = await callGemini(apiKey, prompt);

      // Remove markdown code fences if model included them anyway
      code = code.replace(/^```(?:skript|sk)?\n?/i, '').replace(/\n?```$/i, '').trim();

      skriptFiles.push({
        filename: skriptPlan.filename,
        description: skriptPlan.description,
        code,
        priority: skriptPlan.priority,
      });

      emit('info', `✅ Generated ${skriptPlan.filename} (${code.split('\n').length} lines)`);
    } catch (err) {
      emit('warn', `⚠️ Failed to generate ${skriptPlan.filename}: ${err.message}`);
    }
  }

  return skriptFiles;
}

module.exports = skriptWriter;
