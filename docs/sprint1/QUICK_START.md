# 🚀 Quick Start - Sprint 1 User Management

## ✨ Nuove Funzionalità Implementate

Questo sprint aggiunge funzionalità avanzate di gestione utenti:
- ✅ **Azioni Bulk** (attiva/disattiva/elimina/invia credenziali)
- ✅ **Export CSV** con filtri
- ✅ **Import CSV** con preview e validazione
- ✅ **Sistema email** per invio credenziali

---

## 🏃‍♂️ Come Testare le Nuove Funzionalità

### Prerequisiti
- Docker e Docker Compose installati
- Porta 8000 (backend) e 5173 (frontend) libere

### 1. Avvia il Progetto

```bash
# Clona/copia il progetto
cd pwa-volontari

# Avvia i container
docker-compose up --build

# In un altro terminale, esegui le migrazioni
docker-compose exec backend python manage.py migrate

# Crea un superuser
docker-compose exec backend python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123
```

### 2. Accedi al Sistema

1. Apri il browser: http://localhost:5173
2. Login con le credenziali create
3. Vai a **User Management** dal menu laterale

### 3. Test Bulk Actions

**Scenario**: Attivare/Disattivare multipli utenti

1. Seleziona 2-3 utenti dalla tabella (checkbox)
2. Clicca il bottone **Attiva** nella barra blu che appare
3. Conferma l'azione
4. Verifica che lo stato sia cambiato

**Scenario**: Inviare credenziali

1. Seleziona utenti
2. Clicca **Invia Credenziali**
3. Conferma
4. Controlla i log del backend per vedere le email (modalità console):
   ```bash
   docker-compose logs backend | grep -A 20 "Subject:"
   ```

### 4. Test Export CSV

**Scenario**: Esportare tutti gli admin attivi

1. Imposta filtri:
   - Ruolo: **Admin**
   - (Opzionale) Cerca per nome
2. Clicca il bottone **Esporta**
3. Verrà scaricato un file CSV con gli utenti filtrati
4. Apri il file per verificare i dati

### 5. Test Import CSV

**Scenario**: Importare nuovi utenti in batch

1. Usa il file di esempio: `backend/example_import.csv`
2. Clicca **Importa CSV**
3. Nel dialog:
   - Seleziona il file CSV
   - Attiva/Disattiva "Invia credenziali via email"
   - Attendi la preview
4. Se ci sono errori, vengono mostrati in rosso
5. Se tutto ok, clicca **Conferma Import**
6. Gli utenti vengono creati e (se abilitato) ricevono le email

**Personalizza il CSV**:
```csv
username,email,first_name,last_name,role,phone,work_area_codes
test.user,test@example.com,Test,User,base,3331234567,
```

---

## 📡 Test API con curl

### 1. Login e ottieni il token

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.access')

echo "Token: $TOKEN"
```

### 2. Lista utenti

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/auth/users/ | jq
```

### 3. Bulk Action - Attiva utenti

```bash
curl -X POST http://localhost:8000/api/auth/bulk-actions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": [1, 2],
    "action": "activate"
  }' | jq
```

### 4. Export CSV

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/auth/export/?role=admin" \
  --output export_test.csv

cat export_test.csv
```

### 5. Import CSV - Preview

```bash
curl -X POST http://localhost:8000/api/auth/import/preview/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/example_import.csv" \
  -F "send_credentials=false" | jq
```

### 6. Import CSV - Confirm

```bash
curl -X POST http://localhost:8000/api/auth/import/confirm/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/example_import.csv" \
  -F "send_credentials=true" | jq
```

---

## 📊 Scenari di Test Completi

### Scenario 1: Onboarding Nuovi Volontari

**Obiettivo**: Importare 5 nuovi volontari e inviare loro le credenziali

1. Prepara il CSV con i dati dei volontari
2. Usa Import con `send_credentials=true`
3. Verifica ricezione email (check logs)
4. I volontari possono fare login con le credenziali ricevute

### Scenario 2: Gestione Stagionale

**Obiettivo**: Disattivare volontari non più attivi

1. Filtra per `is_active_volunteer=true`
2. Seleziona i volontari da disattivare
3. Usa bulk action "Disattiva"
4. Esporta la lista aggiornata per archivio

### Scenario 3: Reset Password Multipli

**Obiettivo**: Reset password per un gruppo di utenti

1. Seleziona gli utenti che hanno dimenticato la password
2. Usa bulk action "Invia Credenziali"
3. Vengono generate nuove password e inviate via email
4. Gli utenti ricevono le nuove credenziali

### Scenario 4: Report Mensile

**Obiettivo**: Esportare report utenti per area

1. Filtra per area di lavoro specifica
2. Aggiungi filtro per volontari attivi
3. Esporta in CSV
4. Usa il CSV per analisi/report

---

## 🔍 Verifica Funzionalità

### Checklist Backend

- [ ] Endpoint `/api/auth/bulk-actions/` risponde correttamente
- [ ] Endpoint `/api/auth/export/` genera CSV valido
- [ ] Endpoint `/api/auth/import/preview/` valida CSV
- [ ] Endpoint `/api/auth/import/confirm/` crea utenti
- [ ] Email vengono stampate nei log (console backend)
- [ ] Validazioni CSV funzionano correttamente
- [ ] Permessi admin/superadmin rispettati

### Checklist Frontend

- [ ] Pagina User Management si carica correttamente
- [ ] Tabella mostra utenti con paginazione
- [ ] Filtri (ricerca, ruolo) funzionano
- [ ] Selezione multipla funziona
- [ ] Bulk actions bar appare quando utenti selezionati
- [ ] Bottoni bulk action eseguono azioni
- [ ] Export scarica file CSV
- [ ] Import dialog si apre e gestisce file
- [ ] Preview import mostra dati ed errori
- [ ] Conferma import crea utenti

---

## 🐛 Troubleshooting

### Email non vengono inviate

**Problema**: Le email non arrivano

**Soluzione**:
1. In sviluppo, le email sono stampate nei log, non inviate realmente
2. Controlla i log: `docker-compose logs backend | grep Subject`
3. Per invio reale, configura SMTP in `.env`

### Import CSV fallisce

**Problema**: Errori durante import

**Soluzione**:
1. Usa `/preview/` per vedere errori dettagliati
2. Verifica formato CSV (vedi `example_import.csv`)
3. Assicurati che username/email siano univoci
4. Verifica che work_area_codes esistano nel DB

### Bulk action non autorizzata

**Problema**: 403 Forbidden

**Soluzione**:
1. Verifica di essere loggato come admin/superadmin
2. Gli admin possono gestire solo utenti nelle loro aree
3. Solo superadmin può assegnare ruolo superadmin

---

## 📚 Documentazione Completa

Per dettagli completi vedi:
- **[USER_MANAGEMENT_BULK_OPERATIONS.md](./docs/USER_MANAGEMENT_BULK_OPERATIONS.md)** - Documentazione API completa
- **[SPRINT_1_COMPLETED.md](./SPRINT_1_COMPLETED.md)** - Riepilogo Sprint 1

---

## 🎯 Prossimi Passi

Dopo aver testato Sprint 1, puoi procedere con:
- Sprint 2: Activities & Calendario
- Sprint 3: Forniture & Stock
- Sprint 4: Veicoli & Manutenzione

---

## 💬 Supporto

- **API Docs**: http://localhost:8000/api/docs
- **Admin Django**: http://localhost:8000/admin
- **GitHub Issues**: [Link alla repo]

Buon testing! 🚀
