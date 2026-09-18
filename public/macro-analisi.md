# Analisi Macro Giornaliera

> **Questo file contiene SOLO i VALORI alimentari**: tabelle nutrizionali degli alimenti (dalle etichette delle foto) e i riepiloghi macro (kcal, P, G, C) per giornata.
> Niente workflow, niente istruzioni, niente dati pesature: il "come si fa" sta in `AGENTS.md`.

## Tabelle nutrizionali alimenti (da etichette foto)

> Fonte: foto etichette salvate in `foto/<nome_alimento>.jpg`. Convenzione: ogni alimento con etichetta scattato → foto + riga qui.

| Alimento | Porzione | kcal | P (g) | G (g) | C (g) | Fonte |
|----------|----------|------|-------|-------|-------|-------|
| (esempio) Kefir | 100 ml | 46 | 4 | 1,5 | 4 | foto `kefir.jpg` |

> **Alimenti SENZA etichetta (stime standard di riferimento, usate solo quando non c'è foto)**: uova (~70 kcal / 6,3 P / 4,9 G / 0,8 C l'una) · olio EVO (1 cucchiaino ≈ 4,5 g ≈ 40 kcal / 4,4 G) · mela verde ~150 g (~78 kcal / 0,5 P / 0,3 G / 21 C) · banana ~120 g (~107 kcal / 1,3 P / 0,4 G / 27 C) · riso a crudo (345 kcal / 7,9 P / 0,9 G / 78 C per 100 g) · petto di pollo (120 kcal / 22,5 P / 1,5 G / 0 C per 100 g) · mirtilli (92 kcal / 1,5 P / 0 C / 23,5 C per 100 g) · latte parz. scremato (45 kcal / 3,1 P / 1,8 G / 4,8 C per 100 ml) · whey (400 kcal / 83 P / 2,7 G / 2,4 C per 100 g) · tagliata manzo a crudo (~130 kcal / 26,7 P / 2,7 G / 0 C per 100 g) · verdure a foglia (~15 kcal / 0,7 P / 0,1 G / 3 C per 100 g).

---

## Giornate analizzate

> Un blocco per ogni giornata: intestazione `### GGG GG/MM/AAAA`, riga **Cibo**, tabella per pasto, totali, % kcal per macro, **Fonte**, **Note**.

### GGG GG/MM/AAAA
**Cibo**: (elenco alimenti e porzioni)

| Pasto | kcal | P (g) | G (g) | C (g) |
|---|---|---|---|---|
| Colazione | … | … | … | … |
| Pranzo | … | … | … | … |
| Cena | … | … | … | … |
| **Totale** | **…** | **…** | **…** | **…** |

% kcal: P …% · G …% · C …% — … kcal/kg · … g P/kg
Fonte: etichette (foto) + stime.
Note: …
