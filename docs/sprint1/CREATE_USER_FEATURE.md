# Creazione Utente - Documentazione

## 📝 Overview

La funzionalità di creazione utente permette agli admin e superadmin di creare nuovi volontari direttamente dall'interfaccia web.

## 🎯 Funzionalità

### Dialog Modale Completo

Il dialog di creazione include:
- ✅ Form completo con tutti i campi necessari
- ✅ Validazione real-time
- ✅ Opzione per generare password automatica
- ✅ Opzione per inviare credenziali via email
- ✅ Selezione multipla aree di lavoro
- ✅ Feedback immediato su errori

### Campi del Form

#### Campi Obbligatori
- **Username**: Identificativo univoco dell'utente
- **Email**: Email univoca (validazione formato)
- **Nome**: Nome dell'utente
- **Cognome**: Cognome dell'utente
- **Password**: Solo se non si usa l'opzione "Genera automatica"

#### Campi Opzionali
- **Ruolo**: SuperAdmin, Admin, o Volontario Base (default: Base)
- **Telefono**: Numero di telefono
- **Aree di Lavoro**: Selezione multipla
- **Data Iscrizione**: Data di ingresso nell'organizzazione
- **Volontario Attivo**: Checkbox (default: attivo)

## 🔐 Modalità di Creazione

### Modalità 1: Password Manuale

1. Compila tutti i campi
2. Inserisci una password (min 8 caratteri)
3. Conferma la password
4. Click "Crea Utente"

**Usa questa modalità quando**:
- Vuoi comunicare la password di persona
- L'utente è presente durante la creazione
- Hai bisogno di una password specifica

### Modalità 2: Password Automatica + Email

1. Compila i campi anagrafici
2. Seleziona "Genera password automatica e invia credenziali via email"
3. I campi password spariscono
4. Click "Crea Utente"

**Il sistema**:
- ✅ Genera una password sicura (12 caratteri)
- ✅ Crea l'utente
- ✅ Invia email con username e password
- ✅ Mostra conferma di invio

**Usa questa modalità quando**:
- Stai creando utenti in batch
- L'utente non è presente
- Vuoi automatizzare la distribuzione credenziali

## 💡 Features Speciali

### Generatore Password

Nella modalità password manuale, puoi usare il bottone "Genera Password Casuale":
- Genera password di 12 caratteri
- Mix di lettere maiuscole, minuscole, numeri e simboli
- Compila automaticamente entrambi i campi password

### Selezione Aree di Lavoro

- **Multipla**: Seleziona più aree contemporaneamente
- **Visual feedback**: Chip colorati mostrano le aree selezionate
- **Filtro**: Cerca nell'elenco aree

### Validazione Real-Time

Il form valida automaticamente:
- ✅ Campi obbligatori non vuoti
- ✅ Formato email corretto
- ✅ Password min 8 caratteri
- ✅ Password corrispondenti
- ✅ Username ed email univoci (backend)

## 🎨 UI/UX

### Layout
```
┌─────────────────────────────────────────┐
│ Crea Nuovo Utente                   [X] │
├─────────────────────────────────────────┤
│                                         │
│ ⓘ □ Genera password automatica e...    │
│                                         │
│ [Username]        [Email]               │
│                                         │
│ [Nome]            [Cognome]             │
│                                         │
│ [Password]        [Conferma Password]   │  (se manuale)
│ [Genera Password Casuale]               │
│                                         │
│ [Ruolo ▼]         [Telefono]            │
│                                         │
│ [Aree di Lavoro ▼▼▼]                    │
│  ■ Logistica  ■ Sanità                  │
│                                         │
│ [Data Iscrizione]                       │
│                                         │
│ □ Volontario Attivo                     │
│                                         │
├─────────────────────────────────────────┤
│              [Annulla]  [Crea Utente]   │
└─────────────────────────────────────────┘
```

### Stati UI

**Loading**:
- Bottone disabilitato
- Spinner sul bottone "Creazione..."
- Tutti i campi disabilitati

**Errore**:
- Alert rosso in alto
- Campi con errori sottolineati in rosso
- Helper text con descrizione errore

**Successo**:
- Alert di conferma
- Dialog si chiude automaticamente
- Lista utenti si ricarica

## 📡 Flusso Backend

```
Frontend                  Backend                   Email
   │                        │                         │
   │ POST /auth/users/      │                         │
   │ + user data            │                         │
   ├───────────────────────▶│                         │
   │                        │                         │
   │                        │ Create User             │
   │                        │ in Database             │
   │                        ├────────┐                │
   │                        │        │                │
   │                        ◀────────┘                │
   │                        │                         │
   │   201 Created          │                         │
   │   + user object        │                         │
   ◀───────────────────────┤                         │
   │                        │                         │
   │ IF sendCredentials:    │                         │
   │ POST /bulk-actions/    │                         │
   │ action=send_credentials│                         │
   ├───────────────────────▶│                         │
   │                        │                         │
   │                        │ Generate new password   │
   │                        │ Save hash               │
   │                        │ Send email              │
   │                        ├────────────────────────▶│
   │                        │                         │
   │   200 OK               │                         │
   ◀───────────────────────┤                         │
   │                        │                         │
   │ Show success message   │                         │
   │ Close dialog           │                         │
   │ Reload users list      │                         │
```

## 🔍 Validazioni

### Frontend

```javascript
// Username
if (!username.trim()) → "Username è obbligatorio"

// Email
if (!email.trim()) → "Email è obbligatoria"
if (!valid_format) → "Email non valida"

// Nome/Cognome
if (!first_name.trim()) → "Nome è obbligatorio"
if (!last_name.trim()) → "Cognome è obbligatorio"

// Password (solo se manuale)
if (!password) → "Password è obbligatoria"
if (password.length < 8) → "Password deve essere almeno 8 caratteri"
if (password !== password_confirm) → "Le password non corrispondono"
```

### Backend

```python
# Django serializer validation
- username: unique, required
- email: unique, required, valid format
- first_name: required
- last_name: required
- password: min 8 chars, validators
- role: valid choice
- work_area_ids: existing IDs
```

## 📋 Esempi d'Uso

### Esempio 1: Creazione Rapida con Email

```
1. Click "Nuovo Utente"
2. Compila:
   - Username: mario.rossi
   - Email: mario.rossi@example.com
   - Nome: Mario
   - Cognome: Rossi
   - Ruolo: Volontario Base
3. Check "Genera password automatica e invia credenziali"
4. Click "Crea Utente"
5. ✅ Utente creato e email inviata
```

### Esempio 2: Admin con Aree Specifiche

```
1. Click "Nuovo Utente"
2. Compila campi base
3. Ruolo: Admin
4. Aree di Lavoro: Seleziona "Logistica" e "Sanità"
5. Check "Genera password automatica..."
6. Click "Crea Utente"
7. ✅ Admin creato con accesso a 2 aree
```

### Esempio 3: Creazione con Password Manuale

```
1. Click "Nuovo Utente"
2. Compila campi base
3. NON check "Genera password automatica"
4. Password: inserisci password
5. Conferma Password: ripeti password
   OPPURE
   Click "Genera Password Casuale"
6. Click "Crea Utente"
7. ✅ Utente creato (comunica password manualmente)
```

## 🐛 Gestione Errori

### Errori Comuni e Soluzioni

**"Username già esistente"**
- Soluzione: Usa un username diverso
- Pattern suggerito: nome.cognome o nome.cognome2

**"Email già esistente"**
- Soluzione: Verifica che l'utente non sia già stato creato
- Controlla nella lista utenti

**"Le password non corrispondono"**
- Soluzione: Ridigita con attenzione
- Oppure usa "Genera Password Casuale"

**"Email non valida"**
- Soluzione: Controlla formato (deve contenere @ e dominio)

**"Email non inviata" (dopo creazione)**
- L'utente è stato comunque creato
- Soluzione: Usa "Invia Credenziali" dalla bulk actions

## 🔒 Permessi

| Ruolo | Può Creare | Può Assegnare Ruolo | Note |
|-------|-----------|---------------------|------|
| Base | ❌ | - | Non ha accesso |
| Admin | ✅ | Admin, Base | Solo nella propria area |
| SuperAdmin | ✅ | Tutti | Accesso completo |

## 💾 Componenti Coinvolti

### Frontend

```
CreateUserDialog.jsx
├─ useState per form data
├─ useEffect per caricare work areas
├─ handleChange (gestione input)
├─ validateForm (validazione)
├─ generatePassword (genera password random)
├─ handleSubmit (submit form)
└─ handleClose (reset e chiusura)

UserManagementPage.jsx
├─ createDialogOpen (state)
├─ setCreateDialogOpen(true) (apre dialog)
└─ <CreateUserDialog /> (component)
```

### Backend

```
views.py → UserViewSet.create()
serializers.py → UserCreateSerializer
models.py → User model
utils.py → send_credentials_email() (se sendCredentials=true)
```

## 🎓 Best Practices

### Per Admin
1. ✅ Usa sempre "Genera password automatica" per velocità
2. ✅ Verifica email prima di creare (evita duplicati)
3. ✅ Assegna le aree di lavoro corrette subito
4. ✅ Imposta "Volontario Attivo" solo se pronto

### Per Developer
1. ✅ Validazione sia frontend che backend
2. ✅ Feedback immediato all'utente
3. ✅ Gestione errori graceful
4. ✅ Loading states chiari
5. ✅ Reset form dopo successo

## 📊 Metriche

**Tempo medio creazione**: ~30 secondi per utente
**Campi obbligatori**: 5 (username, email, nome, cognome, password*)
**Campi totali**: 10
**Validazioni**: 8 controlli

*Password obbligatoria solo se modalità manuale

## 🔜 Future Improvements

- [ ] Upload foto profilo
- [ ] Validazione codice fiscale
- [ ] Import foto da webcam
- [ ] Template email personalizzabile
- [ ] Anteprima email prima invio
- [ ] Bulk create con CSV inline
- [ ] Campi custom configurabili

## 📞 Supporto

Per problemi con la creazione utenti:
1. Verifica permessi del tuo account
2. Controlla configurazione email (se usi invio automatico)
3. Consulta i log backend per errori
4. Apri issue su GitHub con dettagli

---

**Versione**: 1.0.0  
**Ultima modifica**: Novembre 2024  
**Status**: ✅ Implementato e Testato
