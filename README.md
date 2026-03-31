# VibeCraft 🎮
### AI-Powered Minecraft SMP Architect

> Describe your SMP dream in plain English. VibeCraft's AI agents will design, install, and deploy your server automatically.

---

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env   # Edit JWT_SECRET
npm start              # Runs on port 3001
```

### 2. Frontend
```bash
cd frontend
npm run dev            # Runs on port 5173
```

Then open **http://localhost:5173**

---

## 🤖 How It Works

1. **Sign up / Log in** at the landing page
2. **Connect your Pterodactyl panel** (any panel.yourhost.com + Client API Key)
3. **Select your Minecraft server**
4. **Add your Gemini API Key** (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))
5. **Open the Vibe Console** and describe your SMP idea
6. Watch the 5 AI agents work:

| Agent | Job |
|-------|-----|
| 🎯 Vibe Interpreter | Parses your idea into a structured spec |
| 🏗️ Blueprint Architect | Creates the full plugin + config plan |
| 🔍 Plugin Auditor | Scans your server's `/plugins/` folder |
| ✍️ Skript Writer | Generates custom `.sk` files for unique mechanics |
| 🚀 Deployer | Downloads, uploads, and installs everything |

---

## 📁 Project Structure

```
VibeCraft/
├── backend/
│   ├── agents/           # The 5 AI agents
│   │   ├── vibeInterpreter.js
│   │   ├── blueprintArchitect.js
│   │   ├── pluginAuditor.js
│   │   ├── skriptWriter.js
│   │   └── deployer.js
│   ├── routes/           # Express API routes
│   │   ├── auth.js
│   │   ├── pterodactyl.js
│   │   └── vibe.js
│   ├── utils/
│   │   ├── db.js         # SQLite database
│   │   ├── pterodactylClient.js
│   │   ├── spigetClient.js
│   │   └── modrinthClient.js
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Onboarding.jsx
        │   ├── Dashboard.jsx
        │   └── VibeConsole.jsx
        └── utils/api.js
```

---

## ⚙️ Requirements

- **Node.js** 18+
- **Pterodactyl Panel** (any host using Pterodactyl, e.g. BisectHosting, Apex, etc.)
- **Gemini API Key** (free tier: [aistudio.google.com](https://aistudio.google.com/app/apikey))
- Your Minecraft server must be **Paper/Spigot/Bukkit** based

---

## 💡 Example Vibe

> *"I want a Lifesteal SMP where every time you kill someone, you get a custom 'Blood Crystal' that can be traded for speed potions"*

VibeCraft will:
1. Identify the need for kill tracking, custom items, and a trade system
2. Blueprint plugins: LuckPerms, EssentialsX, Vault, Skript, possibly LifeSteal plugin
3. Scan your server — find what's missing
4. Write a custom `blood-crystal.sk` Skript with kill detection, item drops, and trade logic
5. Upload everything and restart your server

---

## 🔒 Security Notes

- API keys are stored encrypted per-user in SQLite
- Pterodactyl API keys are stored server-side only
- All endpoints require JWT authentication
- Never commit your `.env` file
