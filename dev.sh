#!/bin/bash
# Zero Inbox Dashboard Dev Launcher

# Stop on error
set -e

echo "🚀 Starting Zero Inbox Dashboard (Modular Mode)..."

# 1. Ensure the engine's output exists
ENGINE_PATH="../zero-inbox-engine"
DASHBOARD_DATA="./public/data"

mkdir -p "$DASHBOARD_DATA"

# 2. Initial sync from the separated Engine (if data exists)
if ls "$ENGINE_PATH/output"/*.json 1> /dev/null 2>&1; then
    echo "📊 Syncing latest data from Engine..."
    cp "$ENGINE_PATH/output"/*.json "$DASHBOARD_DATA/"
    echo "✅ Data synced."
else
    echo "⚠️  Engine has no previous scan data. Ready for fresh analysis."
fi

# 3. Launch Vite Dev Server with the Bridge Plugin
echo "🌐 Launching Bridge at http://localhost:5173..."
npm run dev
