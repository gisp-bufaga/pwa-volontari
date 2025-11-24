#!/bin/bash

# Setup script per PWA Volontari
# Questo script inizializza il progetto per la prima volta

set -e

echo "🚀 Inizializzazione PWA Volontari..."
echo ""

# 1. Verifica Docker
echo "📦 Verifica Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker non è installato. Installa Docker Desktop e riprova."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose non è installato."
    exit 1
fi

echo "✅ Docker OK"
echo ""

# 2. Crea file .env se non esiste
if [ ! -f .env ]; then
    echo "📝 Creazione file .env..."
    cp .env.example .env
    echo "✅ File .env creato. Modificalo se necessario."
else
    echo "ℹ️  File .env già esistente"
fi
echo ""

# 3. Build e avvio container
echo "🐳 Build e avvio container..."
docker-compose up -d --build

echo ""
echo "⏳ Attesa avvio servizi (30 secondi)..."
sleep 30
echo ""

# 4. Migrazioni database
echo "🗄️  Esecuzione migrazioni database..."
docker-compose exec -T backend python manage.py migrate

echo ""
echo "✅ Setup completato!"
echo ""
echo "📍 Accessi:"
echo "   Frontend:    http://localhost:5173"
echo "   Backend API: http://localhost:8000/api"
echo "   Admin:       http://localhost:8000/admin"
echo "   API Docs:    http://localhost:8000/api/docs"
echo ""
echo "🔑 Crea un superuser con:"
echo "   docker-compose exec backend python manage.py createsuperuser"
echo ""
echo "📖 Consulta il README.md per ulteriori informazioni"
