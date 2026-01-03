# Guida per Contributori

## Configurazione Ambiente di Sviluppo

### Pre-requisiti
- Python 3.11+
- Node.js 18+
- Docker e Docker Compose

## Code Quality e Linting

### Frontend (React)

#### ESLint
Il progetto usa ESLint per mantenere la qualità del codice JavaScript/React.

```bash
cd frontend

# Esegui linting
npm run lint

# Fix automatico problemi
npm run lint -- --fix
```

**Regole principali:**
- ❌ `console.log()` non permesso (solo `console.error` e `console.warn`)
- ⚠️ Variabili inutilizzate vengono segnalate
- ✅ Usa `const` invece di `let` quando possibile
- ✅ Usa `===` invece di `==`

#### Prettier
Per formattazione consistente del codice:

```bash
# Installa Prettier (opzionale, ma consigliato)
npm install -D prettier

# Formatta tutti i file
npx prettier --write "src/**/*.{js,jsx,json,css}"
```

### Backend (Django/Python)

#### Ruff (Linter veloce)
```bash
cd backend

# Installa ruff
pip install ruff

# Esegui linting
ruff check .

# Fix automatico
ruff check --fix .
```

#### Black (Formatter)
```bash
# Installa black
pip install black

# Formatta codice
black .

# Check senza modificare
black --check .
```

#### isort (Import sorting)
```bash
# Installa isort
pip install isort

# Ordina import
isort .

# Check senza modificare
isort --check-only .
```

## Pre-commit Hooks

**Automatizza i controlli di qualità prima di ogni commit!**

### Installazione
```bash
# Installa pre-commit
pip install pre-commit

# Attiva gli hooks
pre-commit install
```

### Uso
I controlli vengono eseguiti automaticamente ad ogni `git commit`. Se ci sono problemi:
- Alcuni vengono fixati automaticamente (trailing whitespace, formatting)
- Altri richiedono fix manuale

```bash
# Esegui manualmente su tutti i file
pre-commit run --all-files

# Esegui solo su file staged
pre-commit run
```

## Best Practices

### Python/Django

1. **Evita codice duplicato** - Usa funzioni helper e mixins
2. **Usa select_related/prefetch_related** - Evita N+1 query
3. **Type hints** - Aggiungi type hints dove possibile
4. **Docstrings** - Documenta funzioni complesse
5. **Tests** - Scrivi test per nuove feature

```python
# ✅ Buono
def get_queryset(self):
    return Activity.objects.filter(
        deleted_at__isnull=True
    ).select_related('work_area', 'created_by')

# ❌ Cattivo (N+1 queries)
def get_queryset(self):
    return Activity.objects.filter(deleted_at__isnull=True)
```

### React/JavaScript

1. **No console.log in produzione** - Usa solo console.error/warn
2. **Componenti funzionali** - Usa hooks invece di class components
3. **Custom hooks** - Estrai logica riutilizzabile
4. **PropTypes o TypeScript** - Valida props
5. **Error boundaries** - Gestisci errori React

```javascript
// ✅ Buono
useEffect(() => {
  fetchData();
}, []);

// ❌ Cattivo (console.log)
useEffect(() => {
  console.log('Component mounted'); // ESLint error!
  fetchData();
}, []);
```

## Testing

### Backend
```bash
cd backend

# Installa pytest
pip install pytest pytest-django

# Esegui test
pytest

# Con coverage
pytest --cov=apps --cov-report=html
```

### Frontend
```bash
cd frontend

# Installa testing libraries (TODO)
npm install -D vitest @testing-library/react

# Esegui test
npm test
```

## Workflow Git

1. **Crea un branch** per ogni feature
   ```bash
   git checkout -b feature/nome-feature
   ```

2. **Commit frequenti** con messaggi chiari
   ```bash
   git commit -m "feat: aggiungi validazione form utente"
   ```

3. **Pre-commit hooks** verificano automaticamente il codice

4. **Push e crea PR**
   ```bash
   git push origin feature/nome-feature
   ```

## Convenzioni Commit

Usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nuova feature
- `fix:` - Bug fix
- `docs:` - Documentazione
- `style:` - Formattazione, punto e virgola mancanti, ecc.
- `refactor:` - Refactoring codice
- `test:` - Aggiunta test
- `chore:` - Manutenzione, build, ecc.

**Esempi:**
```
feat: aggiungi endpoint per export utenti CSV
fix: risolvi N+1 query in ActivityViewSet
docs: aggiorna README con istruzioni Docker
refactor: rimuovi codice duplicato in views.py
```

## Problemi Comuni

### ESLint errori
```bash
# Se ESLint dà errori, prova a reinstallare
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Python import errors
```bash
# Assicurati di essere nel virtualenv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Reinstalla dipendenze
pip install -r requirements/development.txt
```

## Domande?

Apri una issue su GitHub o contatta il team di sviluppo.
