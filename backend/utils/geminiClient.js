const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Model fallback chain for Gemini.
 * Tries each model exactly ONCE. On any quota/rate-limit error, immediately moves to the next.
 * No waiting, no retrying the same model.
 */
const MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
];

/**
 * Returns true if the error is a Gemini quota / rate-limit error.
 */
function isQuotaError(err) {
  const msg = err?.message || '';
  return (
    msg.includes('429') ||
    msg.includes('Too Many Requests') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('Quota')
  );
}

/**
 * Wraps a promise with a timeout.
 */
function withTimeout(promise, ms, modelName) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`[Gemini] ${modelName} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Call a Gemini model with automatic instant fallback across MODEL_CHAIN.
 * Each model gets ONE attempt with a 30-second timeout.
 *
 * @param {string} apiKey  - User's Gemini API key
 * @param {string} prompt  - The prompt to send
 * @param {object} [opts]
 * @param {number} [opts.timeoutMs=30000] - Per-model timeout in ms
 * @returns {Promise<string>} - The text response
 */
async function callGemini(apiKey, prompt, opts = {}) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const timeoutMs = opts.timeoutMs ?? 30000;

  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    try {
      console.log(`[Gemini] Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const resultPromise = model.generateContent(prompt);
      const result = await withTimeout(resultPromise, timeoutMs, modelName);
      const text = result.response.text().trim();
      console.log(`[Gemini] ✅ Success with ${modelName}`);
      return text;
    } catch (err) {
      lastError = err;
      if (isQuotaError(err) || err.message?.includes('timed out')) {
        console.warn(`[Gemini] ${modelName} failed (${err.message?.slice(0, 80)}...) — trying next model`);
        // Immediately fall through to next model, no waiting
        continue;
      } else {
        // Non-quota, non-timeout error (e.g. invalid API key, bad request) — surface immediately
        throw err;
      }
    }
  }

  // All models failed
  throw lastError || new Error('All Gemini models failed');
}

/**
 * Cleans the AI response string and parses it as JSON.
 * Fixes: unescaped newlines, illegal control characters, markdown fences.
 */
function cleanAndParseJSON(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response contained no valid JSON');
  
  let jsonStr = jsonMatch[0];
  
  // 1. Remove obvious junk
  jsonStr = jsonStr.trim();

  // 2. Fix ILLEGAL newlines inside "..." strings
  // This replaces raw newlines inside quotes with \n
  jsonStr = jsonStr.replace(/"([^"]*)"/g, (match, p1) => {
    return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
  });

  // 3. Remove non-printable control characters (except maybe tabs)
  jsonStr = jsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => {
    if (char === '\n' || char === '\r' || char === '\t') return char;
    return '';
  });

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('JSON Shrine Error. Original text was:', text);
    throw new Error(`JSON Format Error: ${err.message}`);
  }
}

module.exports = { callGemini, cleanAndParseJSON, MODEL_CHAIN };
