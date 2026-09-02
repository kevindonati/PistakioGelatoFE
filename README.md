# Pistakio Gelato — Frontend

Il frontend di **Pistakio Gelato** è sviluppato separatamente dal backend ed è responsabile dell'interfaccia utente dell'e-commerce.

Il progetto utilizza **React**, **TypeScript** e **Vite** e comunica con il backend Spring Boot attraverso una REST API.

---

## Stack tecnologico

| Tecnologia | Utilizzo |
|---|---|
| React | Sviluppo dell'interfaccia utente |
| TypeScript | Tipizzazione del codice frontend |
| Vite | Tooling e server di sviluppo |
| React Router | Gestione della navigazione e delle route |
| Axios | Comunicazione con la REST API |
| i18next / react-i18next | Internazionalizzazione |
| Lucide React | Icone dell'interfaccia |

---

## Area cliente

L'area cliente permette di utilizzare tutte le funzionalità principali dell'e-commerce.

Le principali funzionalità comprendono:

- visualizzazione della home page;
- consultazione del catalogo;
- visualizzazione delle categorie;
- visualizzazione dei gusti;
- selezione delle vaschette;
- gestione del carrello;
- checkout;
- scelta del metodo di pagamento;
- pagamento tramite Stripe;
- pagamento tramite PayPal;
- visualizzazione degli ordini;
- visualizzazione del dettaglio degli ordini;
- gestione del profilo;
- gestione degli indirizzi;
- registrazione;
- login;
- recupero della password;
- cambio della lingua.

---

## Area amministrativa

Il frontend include un'area amministrativa dedicata agli utenti con ruolo `ADMIN`.

L'area amministrativa permette di gestire:

- dashboard;
- statistiche;
- utenti;
- categorie;
- gusti;
- vaschette;
- ordini;
- preparazione degli ordini;
- pagamenti;
- spedizioni;
- impostazioni;
- costi di spedizione.

Le pagine amministrative sono protette e accessibili esclusivamente agli utenti autorizzati.

---

## Navigazione e routing

La navigazione dell'applicazione viene gestita tramite **React Router**.

Le route sono organizzate in base alle diverse aree dell'applicazione:

```text
Area pubblica
    │
    ├── Home
    ├── Catalogo
    ├── Login
    └── Register

Area cliente
    │
    ├── Carrello
    ├── Checkout
    ├── Ordini
    ├── Profilo
    └── Indirizzi

Area amministrativa
    │
    ├── Dashboard
    ├── Utenti
    ├── Categorie
    ├── Gusti
    ├── Vaschette
    ├── Ordini
    ├── Spedizioni
    └── Impostazioni
```

Le route che richiedono autenticazione vengono protette dal frontend prima di permettere l'accesso alle relative pagine.

---

## Autenticazione

Il frontend utilizza il sistema di autenticazione JWT fornito dal backend.

Dopo il login, il token viene utilizzato nelle richieste verso gli endpoint protetti del backend tramite l'header:

```http
Authorization: Bearer <JWT>
```

Il frontend distingue inoltre gli utenti standard dagli amministratori tramite il ruolo associato all'account.

---

## Comunicazione con il backend

La comunicazione con la REST API viene centralizzata nella directory `services`.

Questa organizzazione permette di mantenere separata la logica delle richieste HTTP dai componenti dell'interfaccia.

Il frontend utilizza **Axios** per effettuare le richieste al backend.

La Base URL dell'API viene configurata tramite una variabile d'ambiente:

```text
VITE_API_URL
```

---

## Internazionalizzazione

Il frontend supporta quattro lingue:

| Codice | Lingua |
|---|---|
| `IT` | Italiano |
| `EN` | Inglese |
| `FR` | Francese |
| `DE` | Tedesco |

L'internazionalizzazione viene gestita tramite **i18next** e **react-i18next**.

La lingua può essere modificata direttamente dall'interfaccia e le traduzioni vengono utilizzate per adattare i contenuti dell'applicazione alla lingua selezionata.

---

## Carrello e checkout

Il frontend permette all'utente di aggiungere i prodotti al carrello, modificarne la quantità e procedere al checkout.

In questo modo il carrello non dipende dalla sessione del browser o dal local storage del frontend: i dati vengono salvati direttamente nel database e associati all'utente autenticato.

Di conseguenza:
- il carrello rimane disponibile anche dopo la chiusura della pagina;
- il carrello non viene perso effettuando il logout;
- l'utente può rientrare successivamente nel proprio account e ritrovare il carrello nello stesso stato;
- i prodotti e le relative quantità vengono mantenuti dal backend fino al completamento, alla modifica o alla cancellazione del carrello.

---

## Pagamenti

Il frontend supporta due sistemi di pagamento:

- **Stripe**
- **PayPal**

---

## Responsive design

L'interfaccia è progettata per adattarsi a diverse dimensioni dello schermo.

Il frontend supporta:

- desktop;
- tablet;
- smartphone.

Gli elementi dell'interfaccia, tra cui navbar, menu, card, form, checkout, carrello e dashboard amministrativa, utilizzano layout responsive per garantire una corretta visualizzazione sui diversi dispositivi.

---

## Feedback e gestione degli errori

Il frontend gestisce le risposte del backend mostrando all'utente messaggi relativi alle operazioni effettuate.

Le principali situazioni gestite comprendono:

- operazioni completate correttamente;
- errori di autenticazione;
- dati non validi;
- risorse non trovate;
- errori durante il pagamento;
- errori durante le richieste HTTP;
- problemi di comunicazione con il backend.

In questo modo l'utente riceve un feedback immediato sull'esito delle operazioni.

---

## Configurazione

La configurazione del frontend viene gestita tramite variabili d'ambiente compatibili con Vite.

La principale variabile utilizzata per la comunicazione con il backend è:

```text
VITE_API_URL=http://localhost:3001
```

Per un ambiente locale, il frontend utilizza normalmente:

```text
http://localhost:5173
```

mentre il backend utilizza:

```text
http://localhost:3001
```

---

## Installazione

Dalla directory principale del frontend installare le dipendenze con:

```bash
npm install
```

---

## Avvio in ambiente di sviluppo

Per avviare il frontend in modalità sviluppo:

```bash
npm run dev
```

Vite mostrerà nel terminale l'indirizzo locale al quale sarà disponibile l'applicazione.

Normalmente:

```text
http://localhost:5173
```

### Accesso dalla rete locale

Per rendere il frontend raggiungibile anche da altri dispositivi collegati alla stessa rete:

```bash
npm run dev -- --host
```

In questo caso Vite espone il server sulla rete locale e mostra nel terminale l'indirizzo IP utilizzabile dagli altri dispositivi.

---

## Integrazione Frontend ↔ Backend

L'architettura complessiva dell'applicazione è basata sulla comunicazione tra frontend React e backend Spring Boot tramite REST API.

Il frontend non accede direttamente al database: tutte le operazioni sui dati vengono effettuate attraverso gli endpoint REST esposti dal backend.

---

## Avvio completo dell'applicazione

Per eseguire l'intero progetto in ambiente locale:

1. Avviare PostgreSQL.
2. Avviare il backend Spring Boot sulla porta `3001`.
3. Verificare il funzionamento del backend tramite Swagger.
4. Avviare il frontend tramite Vite.
5. Aprire il frontend all'indirizzo `http://localhost:5173`.
6. Verificare la comunicazione tra frontend e backend.
