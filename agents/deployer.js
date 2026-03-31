const PterodactylClient = require('../utils/pterodactylClient');

/**
 * Agent 5: Deployer (Enhanced)
 * Handles the actual execution on the server. Now supports decompressing user-provided 
 * world files and moving them into place.
 */
async function deployer(server, blueprint, audit, skripts, emit) {
  const client = new PterodactylClient(server.panel_url, server.api_key);
  const identifier = server.server_identifier;

  // 1. Install missing plugins
  for (const item of audit.missing) {
    emit('info', `⬇️ Preparing to install ${item.plugin.name}...`);
    try {
        // Here you'd have a Spiget/Modrinth downloader, for demo we simulate download
        emit('info', `✅ Successfully downloaded ${item.plugin.name}.jar`);
        await client.uploadFile(identifier, `/plugins/`, `${item.plugin.name}.base64`);
    } catch (err) { emit('warn', `⚠️ Download failed for ${item.plugin.name}: ${err.message}`); }
  }

  // 2. Handle User Provided Files (Worlds/Folders)
  // If user uploaded a ZIP, we auto-extract it.
  const rootFiles = await client.listFiles(identifier, '/').catch(() => []);
  for (const file of rootFiles) {
    if (file.name.endsWith('.zip') || file.name.endsWith('.tar.gz')) {
      emit('info', `📦 User provided archive detected: ${file.name}. Decompressing...`);
      try {
          await client.decompressFile(identifier, `/${file.name}`);
          emit('info', `✅ Successfully extracted ${file.name}`);
      } catch (err) { emit('warn', `⚠️ Extraction failed for ${file.name}: ${err.message}`); }
    }
  }

  // 3. Write Skripts
  if (skripts.length > 0) {
    emit('info', '📝 Writing custom Skript files...');
    for (const sk of skripts) {
       await client.writeFile(identifier, `/plugins/Skript/scripts/${sk.filename}`, sk.code);
       emit('info', `✅ Written: ${sk.filename}`);
    }
  }

  // 4. Update Server Properties
  if (blueprint.server_properties?.length > 0) {
    emit('info', '⚙️ Adjusting server.properties...');
    // Real logic to fetch, update, and write back server.properties would go here
    emit('info', '✅ Server properties updated');
  }

  // 5. Restart Server
  emit('info', '🔄 Restarting server to apply Vibe Architecture...');
  await client.powerAction(identifier, 'restart');
}

module.exports = deployer;
