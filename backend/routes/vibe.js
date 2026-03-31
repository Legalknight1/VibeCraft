const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate } = require('./auth');
const PterodactylClient = require('../utils/pterodactylClient');

// Agents
const plannerAgent = require('../agents/plannerAgent');
const worldAgent = require('../agents/worldAgent');
const skriptAgent = require('../agents/skriptAgent');
const configAgent = require('../agents/configAgent');
const resourceAgent = require('../agents/resourceAgent');
const validatorAgent = require('../agents/validatorAgent');
const pluginAgent = require('../agents/pluginAgent');
const deployer = require('../agents/deployer');

/**
 * GET /api/vibe/autonomous-deploy/:vibeInput/:serverId
 * The big one - multi-agent autonomous deployment with self-healing logs.
 * Streams the "Thought Stream" via SSE.
 */
router.get('/autonomous-deploy/:serverId', authenticate, async (req, res) => {
  const { vibeInput } = req.query;
  const { serverId } = req.params;
  const user = req.user;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const emit = (level, message, detail = "") => {
    res.write(`data: ${JSON.stringify({ level, message, detail })}\n\n`);
  };

  if (!user.geminiApiKey) {
    emit('error', 'Gemini API Key missing');
    return res.end();
  }

  try {
    const server = db.prepare('SELECT * FROM servers WHERE id = ? AND user_id = ?').get(serverId, user.id);
    const client = new PterodactylClient(server.panel_url, server.api_key);
    const id = server.server_identifier;

    // --- PHASE 1: PLANNING ---
    emit('info', '🧠 Breaking vibe into tasks...', 'Planner Agent is architecting your SMP vision...');
    const plan = await plannerAgent(vibeInput, [], {}, user.geminiApiKey);
    
    if (plan.status === 'PLANNING') {
       emit('ask', plan.ai_response, 'Need more info to proceed.');
       return res.end();
    }
    const vibeStrategy = plan.vibe_strategy;

    // --- PHASE 2: PLUGIN RESEARCHER ---
    emit('info', '📦 Researching and picking the best plugins...', 'Plugin Agent is scanning Modrinth and Spigot for 1.21+ compatibility...');
    const pluginList = await pluginAgent(vibeStrategy, user.geminiApiKey);

    // --- PHASE 3: WORLDGEN AGENT ---
    emit('info', '🌍 Architecting custom noise settings...', 'World Agent is building overworld.json datapacks...');
    const worldPack = await worldAgent(vibeStrategy, user.geminiApiKey);

    // --- PHASE 4: SKRIPT AGENT (MODULAR) ---
    emit('info', '⚔️ Writing custom mechanics (Modular Skript)...', 'Skript Master is building _core, join-events, and vibes.sk...');
    const skripts = await skriptAgent(vibeStrategy, user.geminiApiKey);

    // --- PHASE 5: CONFIG & RESOURCE AGENTS ---
    emit('info', '⚙️ Generating plugin configurations...', 'Config Agent is adjusting LuckPerms and Essentials...');
    const configs = await configAgent(vibeStrategy, pluginList.plugins, user.geminiApiKey);
    
    emit('info', '🎨 Linking medieval resource pack...', 'Resource Agent is finding a themed pack...');
    const resources = await resourceAgent(vibeStrategy, user.geminiApiKey);

    // --- PHASE 6: EXECUTOR AGENT (DEPLOY) ---
    emit('info', '📦 Deploying architecture to Pterodactyl...', 'Executor Agent is uploading all files...');
    
    // Write World Datapacks
    for (const [packName, packData] of Object.entries(worldPack.datapacks)) {
       await client.writeFile(id, `/world/datapacks/${packName}/pack.mcmeta`, packData['pack.mcmeta']);
       await client.writeFile(id, `/world/datapacks/${packName}/data/minecraft/worldgen/noise_settings/overworld.json`, packData.data.minecraft.worldgen.noise_settings['overworld.json']);
    }

    // Write Skripts
    for (const [filename, code] of Object.entries(skripts.files)) {
       await client.writeFile(id, `/plugins/Skript/scripts/${filename}`, code);
    }

    // Write Configs
    for (const [path, yaml] of Object.entries(configs.configs)) {
       await client.writeFile(id, `/${path}`, yaml);
    }

    // Apply Resource Pack
    if (resources.resource_pack_url) {
       // Logic to update server.properties would go here
    }

    emit('info', '🔄 First boot initiating...', 'Validator Agent is watching the console logs for crashes...');
    await client.restartServer(id);

    // --- PHASE 6: THE SELF-HEALING LOOP (VALIDATOR) ---
    let stable = false;
    let retries = 0;
    while (!stable && retries < 4) {
       retries++;
       emit('info', `🩹 Healing Loop #${retries}: Watching logs...`, 'Checking for plugin conflicts or syntax errors...');
       await new Promise(r => setTimeout(r, 20000)); // Wait for server boot
       
       const logs = await client.getLatestLog(id);
       const validation = await validatorAgent(logs, vibeStrategy, user.geminiApiKey);

       if (validation.status === 'CLEAN') {
          stable = true;
          emit('done', 'Server booted clean — your SMP is ready!');
       } else {
          emit('warn', `🩹 Fixed ${validation.error_type}!`, validation.diagnosis);
          if (validation.recommended_action === 'FIX_CONFIG') {
             await client.writeFile(id, `/${validation.file_to_fix}`, validation.fix_content);
          } else if (validation.recommended_action === 'REMOVE_PLUGIN') {
             // Logic to remove bad JAR
          }
          await client.restartServer(id);
       }
    }

    if (!stable) emit('error', 'Server failed to boot clean after 4 retries. Please check manual logs.');

  } catch (err) {
    emit('error', `Autonomous Deploy failed: ${err.message}`);
  } finally {
    res.end();
  }
});

module.exports = router;
