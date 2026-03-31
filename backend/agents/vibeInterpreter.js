const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 1: Vibe Architect (Consultant Mode)
 * Now supports multi-turn interaction. It can decide to ask clarifying questions
 * before committing to a blueprint.
 */
async function vibeInterpreter(vibeInput, history = [], serverContext = {}, apiKey) {
  const prompt = `You are the Lead Architect for VibeCraft. Your job is to help the user design a Minecraft SMP.

CURRENT SERVER CONTEXT (Files found on server):
${JSON.stringify(serverContext, null, 2)}

USER CHAT HISTORY:
${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

NEW USER INPUT: "${vibeInput}"

YOUR GOAL:
1. If the user's idea is broad (e.g., "I want an RPG"), ask 2-3 targeted, high-impact questions to refine the vision.
2. If the user has provided enough detail, transition to "GENERATE_BLUEPRINT".
3. If the user mentions specific files they want to use (like a 'spawn world'), acknowledge them and plan to use them.
4. IMPROVISE: Don't just follow instructions. Suggest "Vibe Upgrades" (e.g., "Since you want a Pirate SMP, we should add a custom cannon Skript").

Return ONLY valid JSON:
{
  "action": "REQUEST_INFO" | "GENERATE_BLUEPRINT",
  "ai_response": "What you say to the user (the questions or the intro to the blueprint)",
  "vibe_spec": {
     // Only fill this if action is GENERATE_BLUEPRINT
     "title": "...",
     "theme": "...",
     "complexity": "...",
     "needs_custom_skript": true,
     "skript_features": [],
     "user_provided_files": ["list of filenames mentioned"],
     "improvised_additions": ["Cool ideas you added"]
  }
}`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = vibeInterpreter;
