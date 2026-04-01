@echo off
title VibeCraft SMP Architect v10.0 (Local Master)
echo 🏗️ Starting VibeCraft Singular Reactor...
echo 📡 Website: http://localhost:3001
echo ------------------------------------------

:: 1. Build the website first (only needs to happen once)
if not exist "dist" (
    echo 📦 Building the website (first time only)...
    npm run build
)

:: 2. Start the Master Reactor
npm start
pause
