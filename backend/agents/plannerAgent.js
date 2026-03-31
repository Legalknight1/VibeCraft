const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 1: Planner Agent
 * Breaks down the vibe into a technical strategy and asks clarifying questions.
 */
async function plannerAgent(vibeInput, history = [], serverContext = {}, apiKey) {
  const prompt = `You are the Lead Project Planner for VibeCraft. Your goal is to break down a Minecraft SMP vibe into a technical execution plan.

CURRENT SERVER CONTEXT (Files found on server):
${JSON.stringify(serverContext, null, 2)}

USER CHAT HISTORY:
${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

NEW USER INPUT: "${vibeInput}"

YOUR TASKS:
1. Break the vibe into logical "Epic Tasks" (e.g. "World Atmosphere", "RPG Mechanics", "Economy").
2. Identify specifically how the world generation should work. Should it use a custom noise-settings JSON?
3. Ask 2-3 high-impact questions if the vibe is too broad.
4. Suggest a "Plugin List" (Modern 1.21+ plugins).
5. If the vision is clear, transition to action.

Return ONLY valid JSON:
{
  "status": "PLANNING" | "READY",
  "ai_response": "The text you show to the user",
  "vibe_strategy": {
     "title": "...",
     "theme": "...",
     "tasks": ["list of what we will do"],
     "world_gen_approach": "How we will build the noise JSON",
     "missing_plugins": ["List of plugins needed to fulfil this vibe"],
     "skript_requirements": ["list of custom features needing Skript"]
  }
}`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = plannerAgent;
