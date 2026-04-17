#!/bin/bash
set -e

echo "🚀 JustiXia — Démarrage"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "❌ ANTHROPIC_API_KEY manquante. Exporte-la : export ANTHROPIC_API_KEY=sk-..."
  exit 1
fi

cd backend

if [ ! -d ".venv" ]; then
  echo "📦 Installation des dépendances..."
  python3 -m venv .venv
  .venv/bin/pip install -q -r requirements.txt
fi

echo "✅ Backend démarré sur http://localhost:8000"
echo "   → Landing : http://localhost:8000/"
echo "   → App     : http://localhost:8000/app"
echo ""

if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  echo "🤖 Bot Telegram démarré"
  .venv/bin/python telegram_bot.py &
fi

.venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000
