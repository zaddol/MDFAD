# 🍽️ AI-Editable Nutrition & Fitness Tracker

Un **one-page HTML/Markdown** per tracciare pesature, body composition, allenamento e diario alimentare — progettato per essere **modificato da un agente AI locale** (pi, Codex, Gemini CLI, …) invece che da te.

```text
foto/pesatura_18_09.jpg  →  agente AI (vision)  →  tracker.html + macro-analisi.md (aggiornati)
```

## Come funziona

- **`tracker.html`** — pagina one-page dark, HTML puro + CSS, **zero JavaScript**. Caroselli e espansioni fatti con `radio + :checked ~` e `<details>`. È il "database" visuale: pesature (con delta settimana per settimana), scheda allenamento, diario alimentare a 5 settimane.
- **`AGENTS.md`** — il **come**: workflow, convenzioni, regole CSS, struttura delle tabelle. Caricato automaticamente dall'agente a ogni sessione. È la memoria del progetto: ciò che non c'è qui non esiste nella sessione successiva.
- **`macro-analisi.md`** — solo i **valori** alimentari: tabelle nutrizionali da etichette (foto) e riepiloghi macro per giornata.
- **`foto/`** — etichette nutrizionali scattate (`<nome_alimento>.jpg`), screenshot delle pesature (`pesatura_XX_YY.jpg`), foto della routine allenamento.
- **`_validate_mechanics.js`** — script Node che valida le meccaniche dei caroselli (ordine sibling dei radio, regole `:checked ~`) senza rendering. Usato anche come **CI** (`.github/workflows/validate.yml`).

## Requisiti per l'agente

1. **Lettura/scrittura file + bash** (pi, Codex CLI, Gemini CLI, Claude Code, …).
2. **👁️ Vision (multimodale)**: la lettura delle **etichette nutrizionali dalle foto** dipende dal modello, NON dal codice del progetto. Con un modello con vision (es. Qwen2.5-VL, GPT-4o, Gemini) l'agente legge kcal/P/G/C direttamente dalla foto e li archivia in `macro-analisi.md`. Senza vision: si stimano i valori da tabelle standard e vanno confermati dall'utente.
3. **Playwright** (opzionale ma raccomandato): per la verifica visiva automatica delle modifiche CSS in locale (screenshot headless). Se non disponibile, l'agente chiederà uno screenshot.

## Quick start

```bash
# 1. clone / copia questa cartella nel tuo progetto
# 2. personalizza tracker.html:
#    - "Nome" (brand, h1, footer)
#    - chip hero: data misurazione, peso, BMI, % grasso, obiettivo
#    - sezione 04: dati della prima pesatura (sostituisci i placeholder GG/MM/AAAA, XX.XX kg)
#    - date delle 5 settimane, scheda allenamento
# 3. apri l'agente AI nella cartella del progetto e digli:
#    "Segui AGENTS.md, questa è la mia istanza"
```

Da lì, ogni settimana:
- **Diario**: "Oggi ho mangiato X, Y, Z" (con foto delle etichette) → l'agente calcola i macro, aggiorna `macro-analisi.md` e la card del giorno in `tracker.html`.
- **Pesature**: "Ecco lo screenshot della nuova pesatura" → l'agente aggiorna il carosello con delta, l'archivio in `AGENTS.md`, chip hero e footer.

## Validazione

```bash
node _validate_mechanics.js tracker.html
```

In CI (GitHub Actions) lo stesso script gira su ogni push.

## Struttura

```
├── README.md               ← questo file
├── AGENTS.md               ← workflow + convenzioni + archivio pesature
├── tracker.html            ← one-page (HTML puro, no JS)
├── macro-analisi.md        ← tabelle nutrizionali + riepiloghi per giornata
├── _validate_mechanics.js  ← validazione meccaniche caroselli
├── foto/                   ← etichette alimenti, pesature, allenamento
└── .github/workflows/validate.yml
```

## Privacy

Questo repo è un **template** con dati di esempio/placeholders. Le tue istanze (pesi reali, diari, foto) restano nel tuo progetto locale: **non committare mai foto o dati personali**.

## Licenza

MIT — vedi [LICENSE](LICENSE).
