// Validazione meccanica caroselli CSS-only (senza rendering).
// Uso: node _validate_mechanics.js tracker.html
// Exit code != 0 se: ordine sibling sbagliato, più di un radio checked per gruppo,
// label senza radio, o zona senza pannelli.
const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('uso: node _validate_mechanics.js <file.html>'); process.exit(2); }
const src = fs.readFileSync(path, 'utf8');
let errors = 0;
const fail = (msg) => { errors++; console.error('  ✗ ' + msg); };

// 1) Estrae ogni regola :checked ~ (pz/wk)
const checked = [...src.matchAll(/([^{}]*#(?:pz|wk)\d+):checked ~ ([^{]+)\{([^}]*)\}/g)];
console.log('=== Regole :checked ===');
checked.forEach(m => console.log(`  ${m[1].trim()} ~ ${m[2].trim()} { ${m[3].trim()} }`));

// 2) Ordine sibling in #bodycomp: radio pz < pz-tabs < pz-zone
const wrapStart = src.indexOf('<section id="bodycomp"');
const wrapEnd = src.indexOf('<!-- ============ DIARIO');
const sec = src.slice(wrapStart, wrapEnd > wrapStart ? wrapEnd : undefined);
const pos = (needle) => sec.indexOf(needle);
const pzRadios = [...sec.matchAll(/id="(pz\d+)"/g)].map(m => m[1]).sort((a, b) => +a.slice(2) - +b.slice(2));
const pTabs = pos('class="pz-tabs"');
const pZone = pos('class="pz-zone"');
console.log('=== Ordine sibling #bodycomp (deve crescere) ===');
if (!pzRadios.length) fail('nessun radio pz trovato');
let last = -Infinity;
for (const r of pzRadios) {
  const p = pos(`id="${r}"`);
  console.log(`  ${p} radio ${r}`);
  if (p < last) fail(`radio ${r} non in ordine crescente`);
  last = p;
}
console.log(`  ${pTabs} pz-tabs`);
console.log(`  ${pZone} pz-zone`);
if (pTabs < last) fail('pz-tabs deve venire DOPO tutti i radio pz');
if (pZone < pTabs) fail('pz-zone deve venire DOPO pz-tabs');

// 3) Diario: stessa verifica (wk)
const dStart = src.indexOf('<section id="diario"');
const dEnd = src.indexOf('</section>', dStart);
const dsec = src.slice(dStart, dEnd > dStart ? dEnd : undefined);
const dpos = (needle) => dsec.indexOf(needle);
const wkRadios = [...dsec.matchAll(/id="(wk\d+)"/g)].map(m => m[1]).sort((a, b) => +a.slice(2) - +b.slice(2));
const dTabs = dpos('class="wk-tabs"');
const dZone = dpos('class="diet-zone"');
console.log('=== Ordine sibling #diario (deve crescere) ===');
if (!wkRadios.length) fail('nessun radio wk trovato');
let dlast = -Infinity;
for (const r of wkRadios) {
  const p = dpos(`id="${r}"`);
  console.log(`  ${p} radio ${r}`);
  if (p < dlast) fail(`radio ${r} non in ordine crescente`);
  dlast = p;
}
console.log(`  ${dTabs} wk-tabs`);
console.log(`  ${dZone} diet-zone`);
if (dTabs < dlast) fail('wk-tabs deve venire DOPO tutti i radio wk');
if (dZone < dTabs) fail('diet-zone deve venire DOPO wk-tabs');

// 4) Pannelli dentro le zone
const zoneOf = (openTag, closeTag) => {
  const z = src.indexOf(openTag);
  const e = src.indexOf(closeTag, z);
  return src.slice(z, e > z ? e : undefined);
};
const pzZone = zoneOf('class="pz-zone"', '</div><!-- /.pz-zone -->');
const wkZone = zoneOf('class="diet-zone"', '</div><!-- /.diet-zone -->');
const pzPanels = [...pzZone.matchAll(/class="pz-panel(?:\s|"|\b)/g)].length + [...pzZone.matchAll(/class="pz\d+"/g)].length;
const wkPanels = [...wkZone.matchAll(/class="wk-panel(?:\s|"|\b)/g)].length;
console.log(`=== pz-zone: pannelli trovati === ${pzPanels} (radio: ${pzRadios.length})`);
console.log(`=== wk-zone: pannelli trovati === ${wkPanels} (radio: ${wkRadios.length})`);
if (pzPanels < pzRadios.length) fail('pz-zone ha meno pannelli dei radio');
if (wkPanels < wkRadios.length) fail('wk-zone ha meno pannelli dei radio');

// 5) labels ↔ radio
const labels = [...src.matchAll(/<label for="(p\w+|wk\d+)">/g)].map(m => m[1]);
const radios = [...src.matchAll(/<input type="radio" name="(pz|wk)" id="(p\w+|wk\d+)"[^>]*>/g)].map(m => m[2]);
console.log('=== radios ===', radios.join(','));
console.log('=== labels ===', labels.join(','));
const missing = labels.filter(l => !radios.includes(l));
if (missing.length) fail('labels senza radio: ' + missing.join(','));
console.log(missing.length ? '  ✗ label senza radio' : '  ✓ tutti i label hanno radio');

// 6) UN solo checked per gruppo
for (const group of ['pz', 'wk']) {
  const all = [...src.matchAll(new RegExp(`<input type="radio" name="${group}" id="[^]+?checked`, 'g'))];
  const nChecked = (src.match(new RegExp(`name="${group}" id="[^"]+" checked`, 'g')) || []).length;
  console.log(`=== checked ${group} === ${nChecked}`);
  if (nChecked !== 1) fail(`il gruppo ${group} ha ${nChecked} radio checked (deve essere 1)`);
}

console.log(errors ? `\nFAIL: ${errors} errore/i` : '\nOK: meccaniche valide');
process.exit(errors ? 1 : 0);
