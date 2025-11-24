# Reset script per PWA Volontari (Windows)
# Esegui questo script in PowerShell

Write-Host "🔄 Reset completo del progetto..." -ForegroundColor Cyan
Write-Host ""

# 1. Ferma tutti i container
Write-Host "1️⃣ Fermo i container..." -ForegroundColor Yellow
docker-compose down

# 2. Rimuovi il volume del database
Write-Host "2️⃣ Rimuovo database esistente..." -ForegroundColor Yellow
docker volume rm pwa-volontari_postgres_data 2>$null

# 3. Rimuovi vecchie migrazioni
Write-Host "3️⃣ Rimuovo vecchie migrazioni..." -ForegroundColor Yellow
Get-ChildItem -Path "backend\apps\*\migrations\*.py" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -ne "__init__.py" } | 
    Remove-Item -Force

# Ricrea __init__.py per ogni app
$apps = @("core", "users", "segreteria", "activities", "forniture", "vehicles", "checklist", "reports", "notifications", "vestiario")
foreach ($app in $apps) {
    $migPath = "backend\apps\$app\migrations"
    if (!(Test-Path $migPath)) {
        New-Item -ItemType Directory -Path $migPath -Force | Out-Null
    }
    $initFile = "$migPath\__init__.py"
    if (!(Test-Path $initFile)) {
        New-Item -ItemType File -Path $initFile -Force | Out-Null
    }
}

# 4. Rebuild e avvia container
Write-Host "4️⃣ Rebuild container..." -ForegroundColor Yellow
docker-compose up -d --build

Write-Host ""
Write-Host "⏳ Attesa avvio servizi (30 secondi)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 5. Crea nuove migrazioni
Write-Host ""
Write-Host "5️⃣ Creazione nuove migrazioni..." -ForegroundColor Yellow
docker-compose exec -T backend python manage.py makemigrations

# 6. Applica migrazioni
Write-Host ""
Write-Host "6️⃣ Applicazione migrazioni..." -ForegroundColor Yellow
docker-compose exec -T backend python manage.py migrate

Write-Host ""
Write-Host "✅ Reset completato!" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 Ora crea il superuser con:" -ForegroundColor Cyan
Write-Host "   docker-compose exec backend python manage.py createsuperuser"
Write-Host ""
