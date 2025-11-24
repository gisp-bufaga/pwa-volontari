# PWA Volontari - Sistema di Gestione Interna

Progressive Web App per la gestione centralizzata dei processi interni di un'organizzazione di volontariato.

## 🏗️ Architettura

- **Backend**: Django 4.2 + Django REST Framework
- **Frontend**: React 18 + Material UI + Zustand
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Deployment**: Docker + Docker Compose

## 📋 Prerequisiti

- Docker Desktop (o Docker + Docker Compose)
- Git

## 🚀 Setup Locale (Sviluppo)

### 1. Clone del repository

```bash
git clone <repository-url>
cd pwa-volontari
```

### 2. Configurazione variabili d'ambiente

```bash
cp .env.example .env
# Modifica .env con i tuoi valori se necessario
```

### 3. Avvio dei container

```bash
docker-compose up --build
```

Questo comando:
- Crea i container per PostgreSQL, Redis, Django e React
- Installa tutte le dipendenze
- Avvia i servizi di sviluppo

### 4. Inizializzazione database (primo avvio)

In un nuovo terminale:

```bash
# Esegui le migrazioni
docker-compose exec backend python manage.py migrate

# Crea un superuser
docker-compose exec backend python manage.py createsuperuser

# (Opzionale) Carica dati di esempio
docker-compose exec backend python manage.py loaddata initial_data
```

### 5. Accesso all'applicazione

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs

## 🛠️ Comandi Utili

### Backend (Django)

```bash
# Shell Django
docker-compose exec backend python manage.py shell

# Creare una nuova migrazione
docker-compose exec backend python manage.py makemigrations

# Applicare le migrazioni
docker-compose exec backend python manage.py migrate

# Creare un superuser
docker-compose exec backend python manage.py createsuperuser

# Eseguire i test
docker-compose exec backend pytest

# Raccogliere file statici
docker-compose exec backend python manage.py collectstatic --noinput
```

### Frontend (React)

```bash
# Installare nuove dipendenze
docker-compose exec frontend npm install <package-name>

# Build di produzione
docker-compose exec frontend npm run build

# Lint del codice
docker-compose exec frontend npm run lint
```

### Database

```bash
# Accesso alla console PostgreSQL
docker-compose exec db psql -U pwa_user -d pwa_volontari

# Backup del database
docker-compose exec db pg_dump -U pwa_user pwa_volontari > backup.sql

# Restore del database
docker-compose exec -T db psql -U pwa_user pwa_volontari < backup.sql
```

### Logs

```bash
# Visualizzare i log di tutti i servizi
docker-compose logs -f

# Log di un servizio specifico
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📁 Struttura del Progetto

```
pwa-volontari/
├── backend/                    # Django Backend
│   ├── apps/                   # Django apps
│   │   ├── core/              # Modelli base
│   │   ├── users/             # Gestione utenti
│   │   ├── segreteria/        # Comunicazioni e documenti
│   │   ├── activities/        # Calendario attività
│   │   ├── forniture/         # Stock e inventario
│   │   ├── vehicles/          # Gestione mezzi
│   │   ├── checklist/         # Check equipaggiamenti
│   │   ├── reports/           # Report dinamici
│   │   ├── notifications/     # Sistema notifiche
│   │   └── vestiario/         # Gestione uniformi
│   ├── config/                # Configurazione Django
│   │   ├── settings/          # Settings per ambiente
│   │   └── urls.py           # URL routing
│   ├── requirements/          # Dipendenze Python
│   └── manage.py
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Componenti riusabili
│   │   ├── pages/           # Pagine dell'applicazione
│   │   ├── stores/          # Zustand stores
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utility functions
│   │   ├── theme.js         # Material UI theme
│   │   ├── App.jsx          # App principale
│   │   └── main.jsx         # Entry point
│   ├── public/              # File statici
│   └── package.json
│
└── docker-compose.yml       # Orchestrazione container
```

## 🎯 Roadmap di Sviluppo

### ✅ Sprint 0 - Setup & Infrastruttura (COMPLETATO)
- Setup Docker Compose
- Configurazione Django e React
- Struttura base del progetto
- Modelli Core e User

### 🔄 Sprint 1 - Autenticazione & Utenti (In Corso)
- Sistema di autenticazione JWT completo
- Gestione utenti e ruoli
- Dashboard base

### 📅 Prossimi Sprint
- Sprint 2: Activities & Segreteria
- Sprint 3: Forniture & Stock
- Sprint 4: Veicoli & Manutenzione
- Sprint 5: Checklist
- Sprint 6: Report Dinamici ⭐
- Sprint 7: Notifiche
- Sprint 8: Vestiario
- Sprint 9: Dashboard & Analytics
- Sprint 10: UX/UI Polish
- Sprint 11: Testing & Bug Fixing
- Sprint 12: Deployment

## 🔐 Sicurezza

- Autenticazione JWT con token refresh automatico
- CORS configurato per domini autorizzati
- Password hashate con algoritmi sicuri
- Protezione CSRF per le form
- Validazione input lato client e server
- Rate limiting sulle API (da implementare)

## 🧪 Testing

```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests (da implementare)
docker-compose exec frontend npm test
```

## 📝 Convenzioni di Codice

### Python/Django
- Segui PEP 8
- Usa Black per la formattazione
- Docstrings per tutte le funzioni/classi pubbliche
- Type hints quando possibile

### JavaScript/React
- Segui ESLint configuration
- Usa componenti funzionali con hooks
- Nomi di componenti in PascalCase
- Nomi di file componenti con estensione .jsx

## 🤝 Contribuire

1. Crea un branch per la feature: `git checkout -b feature/nome-feature`
2. Committa le modifiche: `git commit -m 'Aggiungi nuova feature'`
3. Push al branch: `git push origin feature/nome-feature`
4. Apri una Pull Request

## 📄 Licenza

[Specificare licenza]

## 👥 Team

[Informazioni sul team di sviluppo]

## 📞 Supporto

Per problemi o domande, aprire una issue su GitHub o contattare [email di supporto]
