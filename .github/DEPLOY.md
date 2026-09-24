# Deploy su GitHub Pages (https://zaddol.github.io/MDFAD/)

> Regola: `index.html` (IT, locale) è la **sorgente di verità**. Il live (GitHub Pages) **non deve mai essere toccato direttamente** — si aggiorna solo spingendolo da qui.
> `public/` (EN) è **disattivato** dal 23/09 (nessuna rigenerazione, nessun push lì).

## Frase per chiedere l'update al sito

> **"Aggiorna il sito"**

## Cosa fa l'agente (in 1 commit)
1. `git add index.html` (l'unico dato live; `dati-nutrizionista.html` è stato eliminato 23/09 — copia in `_archive/`)
2. `git commit -m "..."` — messaggio descrittivo (es. "Aggiunto giorno Mer 23/09")
3. `git push origin main`
4. Attendere ~1 min → https://zaddol.github.io/MDFAD/ serve il nuovo `index.html`

## Verifica post-push
```
curl -s -o /dev/null -w "%{http_code}\n" https://zaddol.github.io/MDFAD/
```
oppure: `curl -s https://zaddol.github.io/MDFAD/ | grep -o "Totale sett[^<]*" | head -1` (dovrà riflettere il totale corrente).

## Regole (non violare)
- Mai pushare foto/immagini (né `foto/`, né `photos/`).
- Mai `git add .` — solo i file espliciti.
- Push **solo su richiesta esplicita** dell'utente.
