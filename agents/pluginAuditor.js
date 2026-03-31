const PterodactylClient = require('../utils/pterodactylClient');

/**
 * Agent 3: Plugin Auditor
 * Scans the server's /plugins/ folder and cross-references against the blueprint
 * Also checks for Skript and installs it if needed
 */
async function pluginAuditor(server, blueprint, emit) {
  const client = new PterodactylClient(server.panel_url, server.api_key);
  const identifier = server.server_identifier;

  emit('info', '🔍 Scanning server plugin directory...');

  // Get current plugins
  let serverPlugins = [];
  try {
    const files = await client.listFiles(identifier, '/plugins');
    serverPlugins = files
      .filter((f) => f.name.endsWith('.jar'))
      .map((f) => f.name.toLowerCase().replace('.jar', ''));
    emit('info', `📁 Found ${serverPlugins.length} existing plugin(s): ${serverPlugins.join(', ') || 'none'}`);
  } catch (err) {
    emit('warn', `⚠️ Could not scan /plugins folder: ${err.message}. Will assume clean install.`);
  }

  // Normalize plugin name for fuzzy matching
  const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

  const auditResults = [];

  for (const requiredPlugin of blueprint.required_plugins) {
    const normalizedRequired = normalize(requiredPlugin.name);
    
    // Check if any installed plugin name contains the required plugin name
    const found = serverPlugins.some((installed) => {
      const normalizedInstalled = normalize(installed);
      return (
        normalizedInstalled.includes(normalizedRequired) ||
        normalizedRequired.includes(normalizedInstalled)
      );
    });

    const matchedJar = serverPlugins.find((installed) => {
      const normalizedInstalled = normalize(installed);
      return (
        normalizedInstalled.includes(normalizedRequired) ||
        normalizedRequired.includes(normalizedInstalled)
      );
    });

    if (found) {
      emit('info', `✅ ${requiredPlugin.name} — Already installed (${matchedJar}.jar)`);
      auditResults.push({
        plugin: requiredPlugin,
        status: 'present',
        installedAs: matchedJar,
        needsConfig: requiredPlugin.config_changes?.length > 0,
      });
    } else {
      emit('info', `❌ ${requiredPlugin.name} — Missing (${requiredPlugin.priority})`);
      auditResults.push({
        plugin: requiredPlugin,
        status: 'missing',
        installedAs: null,
        needsConfig: requiredPlugin.config_changes?.length > 0,
      });
    }
  }

  // Separate by status
  const missing = auditResults.filter((r) => r.status === 'missing');
  const present = auditResults.filter((r) => r.status === 'present');
  const needsSkript = blueprint.skript_files?.length > 0;

  // Check if Skript is present when needed
  let skriptPresent = serverPlugins.some((p) => normalize(p).includes('skript'));
  if (needsSkript && !skriptPresent) {
    emit('warn', '⚠️ Skript is required for custom mechanics but not found — will install automatically.');
    missing.push({
      plugin: {
        name: 'Skript',
        purpose: 'Required for custom game mechanics',
        spigot_resource_id: 114544,
        modrinth_slug: null,
        priority: 'essential',
        config_changes: [],
      },
      status: 'missing',
      installedAs: null,
      needsConfig: false,
    });
  }

  emit('info', `\n📊 Audit Summary:`);
  emit('info', `   ✅ Present: ${present.length} plugins`);
  emit('info', `   ❌ Missing: ${missing.length} plugins to install`);

  return {
    auditResults,
    missing,
    present,
    serverPlugins,
    needsSkript,
    skriptPresent,
  };
}

module.exports = pluginAuditor;
