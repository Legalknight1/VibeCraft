const { callGemini, cleanAndParseJSON } = require('../utils/geminiClient');

/**
 * Agent 8: Validator Agent (The Self-Healer)
 * Watches console logs, diagnoses errors, and fixes them.
 */
async function validatorAgent(logs, currentPlan, apiKey) {
  const prompt = `You are the Self-Healing Architect for VibeCraft. Your goal is to diagnose and fix server-boot errors.

LATEST CONSOLE LOGS:
${logs}

CURRENT VIBE STRATEGY:
${JSON.stringify(currentPlan, null, 2)}

YOUR GOAL:
1. Identify the TYPE of error (PLUGIN CONFLICT, BAD CONFIG SYNTAX, MISSING DEPENDENCY, CORRUPT JAR, UNKNOWN CRASH).
2. Propose a FIX action.
3. If it's a "BAD CONFIG", provide the corrected config text.
4. If it's a "PLUGIN CONFLICT", identify which plugin to disable.

Return ONLY valid JSON:
{
  "status": "CLEAN" | "HAS_ERRORS",
  "error_type": "PLUGIN CONFLICT" | "BAD CONFIG SYNTAX" | "MISSING DEPENDENCY" | "CORRUPT JAR" | "UNKNOWN CRASH",
  "diagnosis": "What happened?",
  "recommended_action": "REMOVE_PLUGIN" | "FIX_CONFIG" | "INSTALL_DEP" | "REDOWNLOAD",
  "file_to_fix": "path/to/broken/file.yml",
  "fix_content": "The full corrected file content (if FIX_CONFIG)"
}`;

  const text = await callGemini(apiKey, prompt);
  return cleanAndParseJSON(text);
}

module.exports = validatorAgent;
