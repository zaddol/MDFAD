# Contesto di progetto — AI-Editable Nutrition & Fitness Tracker

> Caricato automaticamente dall'agente AI (es. **pi**) a ogni sessione. Qui sta il **come** (workflow, struttura, convenzioni).
> I **dati** (pesature, allenamento, body comp, dieta) vivono in `tracker.html` e `macro-analisi.md`: leggerli quando servono, non duplicarli qui.
> Questa cartella NON usa tool esterni: tutte le memorie vivono nei file scritti qui (AGENTS.md, macro-analisi.md). Non serve un backend: il "database" è HTML + Markdown, modificato dall'agente.

> ⚠️ **REGOLA VINCOLANTE**: provare le modifiche in un file `test-*.html` di lavoro (copia di `tracker.html`), poi portarle in `tracker.html` **solo dopo conferma dell'utente**. Mai toccare il file principale senza conferma esplicita.

## Requisiti dell'agente
- Lettura/scrittura di file e bash (pi, Codex CLI, Gemini CLI, ecc.).
- **Vision**: per lo scan delle etichette nutrizionali dalle foto serve un modello multimodale. Senza vision: stimare i macro con tabelle standard (vedi `macro-analisi.md`) e chiedere all'utente i valori.
- Playwright per la verifica visiva (sezione "Come si opera"); se non disponibile, chiedere all'utente uno screenshot.

## Obiettivi
1. **Sito web / documento** (`tracker.html`) — one-page da condividere col nutrizionista o tenere per sé: allenamento, body comp, dieta. HTML puro, **niente JavaScript**.
2. **Analisi macro giornaliera** — l'utente riporta tutto ciò che ha mangiato; l'agente calcola il riepilogo (kcal, P, G, C) in tabella in chat, lo archivia in `macro-analisi.md` e **aggiorna in parallelo** il diario HTML.
3. **Tracking pesature** — ogni settimana (o cadenza scelta) l'utente fa pesatura con bilancia smart e salva lo screenshot; l'agente aggiorna la sezione body comp con carosello + delta.

## Quick start (nuova istanza)
1. Copiare questa cartella in un nuovo progetto.
2. In `tracker.html`: sostituire "Nome" (brand/h1/footer), i chip hero (`GG/MM/AAAA`, `XX.XX kg`…), i placeholder della sezione 04 con i dati della prima pesatura, le date delle 5 settimane e la scheda allenamento.
3. Rinnovare `macro-analisi.md` (tabella alimenti + giornate).
4. Dire all'agente: "segui AGENTS.md" — il resto viene dai workflow.

### Workflow per una nuova giornata (diario)
1. Calcola i macro: **prima le etichette dalle foto** in `foto/<nome_alimento>.jpg`, solo se assente stima standard.
2. Tabella in chat: voce | porzione | kcal | P | G | C + totali giornata + % kcal per macro.
3. Aggiungi il riepilogo in `macro-analisi.md` (sezione `## Giornate analizzate`).
4. In `tracker.html` → sezione Diario: sostituisci il `<div class="day-card empty">` del giorno con un `<details class="day-card">` (summary: giorno + data + kcal totali + mini pasti; `dc-detail`: `table.foods` con `tr.m-mini` per pasto + `dc-macro` con totali P/G/C). **Ogni riga alimento usa il pattern corrente (con `tabindex` e `.fkcal`)** — vedi "Struttura delle tabelle alimenti" in fondo a questo file.
5. Aggiorna `.ws-days` (N/7) e `.ws-total` (totale kcal settimana) nella `.wk-summary` della settimana.
6. Se il giorno è in una settimana non presente: duplicare `radio` + `label` + pannello `.wkN` + regola CSS `#wkN:checked ~ .diet-zone .wkN` (i radio devono restare **sibling** di `.wk-tabs`/`.diet-zone`, MAI dentro `.wk-tabs`).

## Ruolo dei file (dati vs workflow)
- `AGENTS.md` — il **come** (workflow, struttura, convenzioni) + archivio pesature (dati bilancia).
- `macro-analisi.md` — contiene **SOLO i valori alimentari**: tabelle nutrizionali degli alimenti (dalle etichette foto) e i riepiloghi macro per giornata. Niente istruzioni di workflow, niente dati pesature.
- `tracker.html` — la pagina one-page (HTML, no JS). **Fonte unica dei dati visibili**.
- `_validate_mechanics.js` — script Node che valida le meccaniche dei caroselli senza rendering: `node _validate_mechanics.js tracker.html`. Usare dopo modifiche alla struttura dei radio/caroselli.
- `foto/` — etichette alimenti (`.jpg`), screenshot pesature (`pesatura_XX_YY.jpg`), foglio routine allenamento se manoscritto.

**Convenzione foto**: ogni alimento con etichetta scattato → `foto/<nome_alimento>.jpg` (nome in snake_case, ascii). Per i macro usare SEMPRE prima i valori dell'etichetta; solo gli alimenti senza foto (uova, mela, banana, riso a crudo, pollo, olio EVO…) si stimano.

## Come si opera (workflow agenzia)
> Regole operative obbligatorie per ogni sessione. Questo è il "come si fa", non il "cosa".

### 1. Regola vincolante (ripetuta)
- **PRIMA un file `test-*.html` di lavoro** (copia di `tracker.html`), sempre. Solo dopo conferma dell'utente: portare la modifica nel file principale.

### 2. Verifica visiva automatica con Playwright (NON chiedere screenshot a mano)
Prima di consegnare una modifica CSS, **verificarla sempre** con screenshot headless. Comandi (dalla cartella del progetto):
```
# screenshot base (viewport 1280x900):
npx -y playwright screenshot --viewport-size=1280,900 file:///<path>/tracker.html out.png

# pagina intera:
npx -y playwright screenshot --viewport-size=1280,5200 --full-page file:///<path>/tracker.html out.png

# altri breakpoint: 1280 (desktop), 900 (tablet 760px+), 420 (phone 480px-)
```
**Trucco per il diario collassato**: i giorni compilati sono `<details class="day-card">` (chiusi per default). Per vederli nello screenshot, fare una **copia temporanea** del file con `open` aggiunto:
```
python -c "src=open('tracker.html',encoding='utf-8').read().replace('<details class=\"day-card\">','<details class=\"day-card\" open>'); open('tmp-open-check.html','w',encoding='utf-8').write(src)"
```
e scattare la copia (NON il file originale). **Pulire i file `tmp-*` e screenshot a fine sessione.**

**Regola di debug in loop**: se una modifica CSS non dà l'effetto atteso, NON chiedere subito all'utente "come appare" — prima creare una **pagina HTML isolata minima** (solo la card in questione, stessa CSS, stesso colgroup 47/53%) e testare varianti (A, B, C…) con screenshot affiancati. Solo quando si ha una soluzione funzionante in isolamento, portarla nel file reale e ri-verificare.

### 3. Regole CSS non negoziabili (memoria d'uso)
- **`word-break:break-word` MAI** su elementi di nome alimento (`.f-lead-txt`, `.fname`, …). Spezza per carattere in colonne strette → testo in verticale. Usare `overflow-wrap:normal` (spezza solo sui spazi) o `overflow-wrap:break-word` (solo parole che non entrano).
- **`.f-lead` = `display:flex`, MAI `display:grid`** (vedi storia bug 50–53 sotto).
- **`.f-item` = `display:block`**, MAI `display:flex`: il child `.f-lead` width:100% dentro un flex container non risolve la larghezza e il nome collassa a 0.
- **`.fporz` sempre su riga 2, sotto l'icona, `margin-left:0`, mai inline**.
- **`.f-lead-txt` max 2 righe con ellipsis** (`-webkit-line-clamp:2`): il compromesso per tenere la kcal sempre visibile anche con nomi lunghissimi.

### 4. Convenzione file di lavoro
- **Niente file temporanei lasciati**: `tmp-*.html`, `tmp-*.png`, `*.png` di screenshot → cancellare a fine sessione.
- **AGENTS.md va aggiornato a OGNI modifica significativa** (CSS, struttura, workflow). Questo file è la memoria di progetto: se una regola non è qui, è come se non esistesse nella sessione successiva.

## Stile / design (regole vincolanti)
- Single page, look "sito palestra" dark (accento `#ff4d2e`, bold uppercase). Un solo file, CSS inline, **niente JavaScript** (caroselli = radio + `:checked ~`, espansioni = `<details>`).
- Breakpoint: `960px`, `760px` (tablet), `480px` (phone).
- **Trappole CSS già risolte — NON riaprire**:
  - Overflow orizzontale su phone: `table-layout:fixed` + `max-width:100%` + `<colgroup>` (47/53%, 2 colonne) su `table.foods`; `.f-macros{white-space:nowrap}`; nav compatta su phone con `overflow-x:auto` fallback; safety net `html,body{overflow-x:clip}` — **`clip`, mai `hidden`** su html/body (crea un contesto di scroll e fa saltare lo smooth scroll sulle ancore).
  - Doppio titolo pasto: su tablet/phone `tr.meal-row{display:none}` + `tr.m-mini{display:table-row}`; su desktop il contrario. **Mai** nascondere le celle macro in alcun blocco responsive: i macro sparirebbero.
  - `scroll-margin-top:56px` sulle sezioni (nav sticky, jump ancore).
  - Composizione corporea su phone: `table.comp` → card impilate (td `display:block`, thead nascosto).
  - **kcal+"Kc" atomici**: `.fkcal{display:inline-flex;white-space:nowrap;flex:0 0 auto;}` (mai spezzare "Kc" sotto il numero).
  - **Nome espandibile SENZA JS**: `tabindex="0"` su ogni `.f-lead-txt` + `:focus{display:block;-webkit-line-clamp:unset;...}` → click/tap espande il nome completo, click fuori richiude.
  - **P·G·C a destra della cella**: `.f-mcol{text-align:right;}`.
  - **Simmetria card giorno**: `.day-card{display:flex;flex-direction:column}` + `.dc-detail` e `.dc-macro` `flex:1 1 auto` → il riepilogo si aggancia sempre al fondo, le card della settimana sono uguali in altezza.
  - **Porzione sempre visibile**: `.f-lead > .fporz{flex:0 0 auto;max-width:100%;overflow:hidden;}` — il badge non supera il bordo destro della cella.

## Struttura delle tabelle alimenti (diario)

### Layout: 2 colonne — colgroup 47/53

| Colonna | `td` | Larghezza | Contenuto |
|---------|-----|-----------|-----------|
| 1 | `<td>` (no class) | 47% | `<div class="f-item"><span class="f-lead">…</span></div>` |
| 2 | `<td class="f-mcol">` | 53% | `<span class="f-macros">P·G·C</span>` |

### `.f-lead` — struttura riga (da usare per OGNI alimento)

```
<span class="f-lead">
  <span class="ficon">🥛</span>              ← icona (PRIMA)
  <span class="f-lead-txt" tabindex="0">
    <span class="fname">Kefir</span>         ← nome (SECONDARIO, espandibile col click)
  </span>
  <span class="fkcal"><span class="f-kcal">46</span><span class="kcal-u">Kc</span></span>  ← kcal+"Kc" atomici (TERZO)
  <span class="fporz">100 ml</span>           ← porzione (QUARTO, 2° riga)
</span>
```

**CSS base (desktop + tablet + phone) — FLEX, NON GRID (bug 50–53 chiuso)**:
```
.f-lead{display:flex;flex-wrap:wrap;align-items:flex-start;column-gap:6px;row-gap:2px;min-width:0;max-width:100%;width:100%;}
.f-lead .ficon{flex:0 0 auto;}
.f-lead .f-lead-txt{flex:1 1 auto;min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.f-lead .f-kcal{flex:0 0 auto;white-space:nowrap;}
.f-lead .kcal-u{flex:0 0 auto;white-space:nowrap;}
.f-lead > .fporz{flex:0 0 auto;max-width:100%;overflow:hidden;}
.f-item{display:block;width:100%;min-width:0;overflow:hidden;max-width:100%;}
.f-item .fname{overflow-wrap:normal;}
.f-item .fporz{font-weight:800;font-variant-numeric:tabular-nums;color:var(--accent2);font-size:10.5px;background:rgba(255,210,63,.08);border:1px solid rgba(255,210,63,.22);border-radius:5px;padding:1px 6px;line-height:1.3;}
.f-macros{font-variant-numeric:tabular-nums;font-size:11px;…}   .f-macros .u{font-size:9px;…}
```

**Storia del bug (NON riaprire)**:
- `.f-lead` era `display:inline-flex` → non occupava la cella → il valore kcal si posizionava DOPO il nome → posizione variabile.
- **Tentativo grid** (`display:grid; grid-template-columns:auto minmax(min-content,1fr) max-content max-content`): **NON FUNZIONA** — con `table-layout:fixed` + colgroup 47% la cella del primo `<td>` è ~50–120px; il *contention resolution* del CSS Grid, con nome spezzabile (min-content ≈ 1 char), fa ricevere ~0px alla colonna `1fr` e il nome va **in verticale**. `minmax(0,1fr)` peggiora. **La grid con `table-layout:fixed` + colgroup % è un vicolo cieco per questo pattern.**
- **SOLUZIONE (flex)**: `display:flex; flex-wrap:wrap`. `.f-lead-txt{flex:1 1 auto;min-width:0}` prende SEMPRE lo spazio tra icona e kcal (riga 1, mai a 0); `.f-kcal`/`.kcal-u{flex:0 0 auto}` non comprimono il nome e restano in riga 1; `.fporz{flex:0 0 100%}` va SEMPRE in riga 2 sotto l'icona. `flex-wrap:wrap` risolve anche il ribaltamento dell'ordine su phone (icona dopo i Kcal).
- `.f-item` resta `display:block` (NON flex).
- `word-break:break-word` **MAI** su `.f-lead-txt` né su `.fname`.

### Struttura riga HTML (2 `<td>`) — da usare per OGNI alimento
```
<tr>
  <td><div class="f-item"><span class="f-lead"><span class="ficon">ICONA</span><span class="f-lead-txt" tabindex="0"><span class="fname">NOME</span></span><span class="fkcal"><span class="f-kcal">NNN</span><span class="kcal-u">Kc</span></span><span class="fporz">PORZIONE</span></span></div></td>
  <td class="f-mcol"><span class="f-macros">P<span class="sep"> · </span>G<span class="sep"> · </span>C</span></td>
</tr>
```

## Struttura del carosello (meccanica CSS-only)
- Caroselli = `<input type="radio">` + `:checked ~` + CSS, **zero JS**.
- **Ordine sibling vincolante**: i radio devono essere **sibling PRINCIPALI** di tabs e zone (entrambi dentro lo stesso `<div class="wrap">`), **NON dentro** i contenitori `.pz-tabs`/`.wk-tabs` — altrimenti `:checked ~` non funziona mai.
- Regole per ogni pannello:
  ```
  section#bodycomp input#pzN:checked ~ .pz-tabs label[for="pzN"]{ …stato attivo… }
  section#bodycomp input#pzN:checked ~ .pz-zone .pzN{display:block;}
  ```
- **Mai mescolare i radio `pz` e i radio `wk`**: sono due gruppi separati.
- **Validare sempre** dopo modifiche: `node _validate_mechanics.js tracker.html`.

### Diario
- 5 tab Settimana 1–5 (estendibili: duplicare radio + label + pannello `.wkN` + regole CSS).
- Ogni settimana: `.wk-summary` (`.ws-days` + `.ws-total`) + `.wk-grid` (7 colonne → 4 su tablet → 1 su phone).
- Giorno compilato: `<details class="day-card">`; da compilare: `<div class="day-card empty">`.
- Le tabelle `table.foods` NON hanno `<thead>`.

### Pesature
- pz1 = ultima pesatura (checked, in cima, con Δ vs precedente); pz2… = archivio cronologico inverso (senza delta).
- Tab con contatore `(N)`. Chip hero + tag sezione + footer riflettono SEMPRE l'ultima pesatura.

## Archivio pesature (bilancia)

> Fonte: screenshot app bilancia salvati in `foto/pesatura_XX_YY.jpg`. I valori mostrati su `tracker.html` (sezione 04, caroselle pz1/pz2/…) riflettono SEMPRE l'ultima pesatura.

| # | Data | Peso (kg) | BMI | %Grasso | Massa grassa (kg) | %Muscolo | Massa musc. (kg) | BMR (kcal) | Età metab. |
|---|------|-----------|-----|---------|-------------------|----------|------------------|------------|------------|
| 1 | … | … | … | … | … | … | … | … | … |

Δ 1→2: (da compilare)

## Workflow pesature — aggiungere una nuova pesatura (cadenza settimanale)
> Fonte: screenshot app bilancia salvato in `foto/pesatura_XX_YY.jpg`. Questo è il "come": i VALORI vivono nella tabella "Archivio pesature" (sopra) e nel file HTML, NON in `macro-analisi.md`.

1. **Salvare lo screenshot** della pesatura in `foto/pesatura_XX_YY.jpg`.
2. **Aggiornare l'"Archivio pesature"** in questo file: nuova riga nella tabella + riga Δ vs precedente.
3. **In `tracker.html`, sezione 04 (carosello pz)**:
   - Spostare l'attributo `checked` dal radio corrente (pz1) al nuovo radio.
   - Aggiungere `<input type="radio" name="pz" id="pzN" checked>` — **sibling** dei radio `pz` esistenti, NON dentro `.pz-tabs`.
   - Aggiungere `<label for="pzN">Pesatura (N)</label>` in `.pz-tabs` (N = numero totale pesature).
   - Aggiungere il pannello `<div class="pzN">`: copiare il pannello `pz1` esistente, sostituire i valori con quelli nuovi, **aggiungere i `div.delta`** (Δ vs precedente: peso, BMI, % grasso, massa grassa, % muscolo, massa musc., BMR, età metab.) — i pannelli archivio NON hanno delta.
   - Il pannello `pz1` vecchio RESTA com'è (i suoi `div.delta` restano, sono relativi alla pesatura precedente) e diventa archivio (niente più `checked`).
   - Aggiungere le regole CSS (stesso schema delle esistenti): copiare i selettori `#pz1:checked ~ …` e cambiare il numero.
4. **Aggiornare i 3 punti che riflettono l'ultima pesatura** (SEMPRE l'ultima):
   - **Chip hero**: Peso (kg) + data misurazione.
   - **Tag sezione 04**: data della pesatura.
   - **Footer**: elenco date delle pesature.
5. **Validare**: `node _validate_mechanics.js tracker.html` → i radio `pz` e `wk` tutti presenti, ordine sibling corretto, UN solo `checked` per gruppo.
6. **Verifica visiva Playwright**: screenshot della zona sezione 04 per controllare che la nuova card sia quella visibile e i delta corretti.

## TODO (da personalizzare nell'istanza)
- [ ] **Obiettivo** reale (dimagrimento / massa / ricomposizione) — chip hero.
- [ ] **Altezza, età, sesso** — da inserire in un box informativo.
- [ ] **Orari dei pasti** (se richiesti).
- [ ] Rinominare i placeholder `GG/MM/AAAA`, `XX.XX kg` in tutta la pagina alla prima pesatura.
