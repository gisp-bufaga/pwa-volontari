#!/bin/bash

# Script di reset completo per PWA Volontari
# Usa questo script se hai problemi con le migrazioni

set -e

echo "🔄 Reset completo del progetto..."
echo ""

# 1. Ferma tutti i container
echo "1️⃣ Fermo i container..."
docker-compose down

# 2. Rimuovi il volume del database
echo "2️⃣ Rimuovo database esistente..."
docker volume rm pwa-volontari_postgres_data 2>/dev/null || true

# 3. Rimuovi vecchie migrazioni
echo "3️⃣ Rimuovo vecchie migrazioni..."
find backend/apps/*/migrations -name "*.py" ! -name "__init__.py" -delete 2>/dev/null || true

# Ricrea __init__.py per ogni app
for app in core users segreteria activities forniture vehicles checklist reports notifications vestiario; do
    mkdir -p backend/apps/$app/migrations
    touch backend/apps/$app/migrations/__init__.py
done

# 4. Rebuild e avvia container
echo "4️⃣ Rebuild container..."
docker-compose up -d --build

echo ""
echo "⏳ Attesa avvio servizi (30 secondi)..."
sleep 30

# 5. Crea nuove migrazioni
echo ""
echo "5️⃣ Creazione nuove migrazioni..."
docker-compose exec -T backend python manage.py makemigrations

# 6. Applica migrazioni
echo ""
echo "6️⃣ Applicazione migrazioni..."
docker-compose exec -T backend python manage.py migrate

echo ""
echo "✅ Reset completato!"
echo ""
echo "🔑 Ora crea il superuser con:"
echo "   docker-compose exec backend python manage.py createsuperuser"
echo ""
