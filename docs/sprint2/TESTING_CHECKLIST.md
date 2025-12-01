# Testing Checklist - Sprint 2

## 🔐 Autenticazione
- [ ] Login con credenziali corrette
- [ ] Login con credenziali errate
- [ ] Logout funziona correttamente
- [ ] Redirect a login se non autenticato
- [ ] Token refresh automatico

---

## 👥 Users (già testato Sprint 1)
- [ ] Lista utenti caricata
- [ ] Dettaglio utente
- [ ] Creazione nuovo utente
- [ ] Modifica utente
- [ ] Soft delete utente

---

## 📅 Activities Module

### Lista Attività
- [ ] Visualizzazione card attività
- [ ] Tabs per area funzionanti
- [ ] Ricerca attività per nome
- [ ] Pulsante "Nuova Attività" visibile solo per admin
- [ ] Click su card naviga al dettaglio

### Dettaglio Attività
- [ ] Mostra informazioni attività
- [ ] Visualizza prossimi turni
- [ ] Link iscrizione generale (se presente)
- [ ] Pulsanti edit/delete visibili solo per admin area
- [ ] Navigazione ai turni funzionante

### Form Attività
- [ ] Creazione nuova attività (solo admin)
- [ ] Modifica attività esistente (solo admin area)
- [ ] Validazione campi obbligatori
- [ ] Selezione colore funzionante
- [ ] Salvataggio corretto

### Calendario Turni
- [ ] Visualizzazione calendario mensile
- [ ] Navigazione mesi (prev/next)
- [ ] Filtro per area
- [ ] Click su turno naviga al dettaglio
- [ ] Toggle vista calendario/lista

### Dettaglio Turno
- [ ] Mostra informazioni turno
- [ ] Mostra informazioni attività collegata
- [ ] Pulsante iscrizione visibile e funzionante
- [ ] Pulsanti edit/delete visibili solo per admin area
- [ ] Link esterno si apre correttamente

### Form Turno
- [ ] Creazione nuovo turno (solo admin)
- [ ] Modifica turno esistente (solo admin area)
- [ ] Validazione data (non nel passato)
- [ ] Validazione orari (fine > inizio)
- [ ] Pre-compilazione attività da query param
- [ ] Salvataggio corretto

---

## 📋 Segreteria Module

### Bacheca To-Do
- [ ] Accesso solo per superadmin/admin segreteria
- [ ] Visualizzazione statistiche
- [ ] 3 colonne Kanban (todo/in_progress/done)
- [ ] Drag & drop funzionante
- [ ] Cambio status via drag
- [ ] Pulsante "Nuovo To-Do"

### Todo Card
- [ ] Visualizzazione priorità con colore
- [ ] Menu azioni funzionante
- [ ] "Marca come completato" funziona
- [ ] Edit apre dialog
- [ ] Delete chiede conferma

### Form To-Do
- [ ] Dialog si apre correttamente
- [ ] Creazione nuovo to-do
- [ ] Modifica to-do esistente
- [ ] Validazione titolo obbligatorio
- [ ] Selezione status/priorità
- [ ] Salvataggio corretto

### Documenti
- [ ] Lista documenti caricata
- [ ] Tabs per categoria
- [ ] Ricerca documenti
- [ ] Pulsante "Carica Documento" (solo segreteria)
- [ ] Click su card mostra dettagli

### Document Card
- [ ] Icona file corretta per tipo
- [ ] Dimensione file visualizzata
- [ ] Chip categoria con colore
- [ ] Pulsante "Scarica" funzionante
- [ ] Menu edit/delete (solo segreteria)

### Upload Documento
- [ ] Dialog si apre correttamente
- [ ] Selezione file funzionante
- [ ] Validazione dimensione (max 10MB)
- [ ] Auto-compilazione titolo da filename
- [ ] Selezione categoria
- [ ] Selezione visibilità
- [ ] Upload e salvataggio corretto

---

## 🔒 Permissions

### Admin Area
- [ ] Admin PC vede solo sue attività
- [ ] Admin PC può creare turni solo per sua area
- [ ] Admin Sociale non vede turni PC

### Admin Segreteria
- [ ] Accesso completo a tutte le aree
- [ ] Accesso a bacheca to-do
- [ ] Accesso a documenti

### Base Volunteers
- [ ] Visualizzazione solo (no edit/delete)
- [ ] Nessun accesso a bacheca to-do segreteria
- [ ] Accesso a documenti pubblici

---

## 📱 Responsive Design
- [ ] Mobile: drawer funziona
- [ ] Mobile: card grid responsive
- [ ] Tablet: layout corretto
- [ ] Desktop: layout ottimale

---

## ⚡ Performance
- [ ] Loading states visualizzati
- [ ] Error handling funzionante
- [ ] Nessun errore console
- [ ] Navigazione fluida

---

## 🐛 Bug da Verificare
- [ ] Refresh pagina mantiene stato login
- [ ] Soft delete non mostra elementi eliminati
- [ ] Date formattate correttamente (it-IT)
- [ ] Link esterni aprono nuova tab