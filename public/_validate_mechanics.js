// CSS-only carousel mechanics validation (no rendering).
// Usage: node _validate_mechanics.js tracker.html
// Exit code != 0 if: wrong sibling order, more than one checked radio per group,
// label without radio, or zone without panels.
const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('usage: node _validate_mechanics.js <file.html>'); process.exit(2); }
const src = fs.readFileSync(path, 'utf8');
let errors = 0;
const fail = (msg) => { errors++; console.error('  \u2717 ' + msg); };

// 1) Extract every :checked ~ rule (pz/wk)
const checked = [...src.matchAll(/([^{}]*#(?:pz|wk)\d+):checked ~ ([^{]+)\{([^}]*)\}/g)];
console.log('=== :checked rules ===');
checked.forEach(m => console.log(`  ${m[1].trim()} ~ ${m[2].trim()} { ${m[3].trim()} }`));

// 2) Sibling order in #bodycomp: radio pz < pz-tabs < pz-zone
const wrapStart = src.indexOf('<section id="bodycomp"');
const wrapEnd = src.indexOf('<!-- ============ DIARY');
const sec = src.slice(wrapStart, wrapEnd > wrapStart ? wrapEnd : undefined);
const pos = (needle) => sec.indexOf(needle);
const pzRadios = [...sec.matchAll(/id="(pz\d+)"/g)].map(m => m[1]).sort((a, b) => +a.slice(2) - +b.slice(2));
const pTabs = pos('class="pz-tabs"');
const pZone = pos('class="pz-zone"');
console.log('=== Sibling order #bodycomp (must increase) ===');
if (!pzRadios.length) fail('no pz radio found');
let last = -Infinity;
for (const r of pzRadios) {
  const p = pos(`id="${r}"`);
  console.log(`  ${p} radio ${r}`);
  if (p < last) fail(`radio ${r} not in ascending order`);
  last = p;
}
console.log(`  ${pTabs} pz-tabs`);
console.log(`  ${pZone} pz-zone`);
if (pTabs < last) fail('pz-tabs must come AFTER all pz radios');
if (pZone < pTabs) fail('pz-zone must come AFTER pz-tabs');

// 3) Diary: same check (wk)
const dStart = src.indexOf('<section id="diary"');
const dEnd = src.indexOf('</section>', dStart);
const dsec = src.slice(dStart, dEnd > dStart ? dEnd : undefined);
const dpos = (needle) => dsec.indexOf(needle);
const wkRadios = [...dsec.matchAll(/id="(wk\d+)"/g)].map(m => m[1]).sort((a, b) => +a.slice(2) - +b.slice(2));
const dTabs = dpos('class="wk-tabs"');
const dZone = dpos('class="diet-zone"');
console.log('=== Sibling order #diary (must increase) ===');
if (!wkRadios.length) fail('no wk radio found');
let dlast = -Infinity;
for (const r of wkRadios) {
  const p = dpos(`id="${r}"`);
  console.log(`  ${p} radio ${r}`);
  if (p < dlast) fail(`radio ${r} not in ascending order`);
  dlast = p;
}
console.log(`  ${dTabs} wk-tabs`);
console.log(`  ${dZone} diet-zone`);
if (dTabs < dlast) fail('wk-tabs must come AFTER all wk radios');
if (dZone < dTabs) fail('diet-zone must come AFTER wk-tabs');

// 4) Panels inside the zones
const zoneOf = (openTag, closeTag) => {
  const z = src.indexOf(openTag);
  const e = src.indexOf(closeTag, z);
  return src.slice(z, e > z ? e : undefined);
};
const pzZone = zoneOf('class="pz-zone"', '</div><!-- /.pz-zone -->');
const wkZone = zoneOf('class="diet-zone"', '</div><!-- /.diet-zone -->');
const pzPanels = [...pzZone.matchAll(/class="pz-panel(?:\s|"|\b)/g)].length + [...pzZone.matchAll(/class="pz\d+"/g)].length;
const wkPanels = [...wkZone.matchAll(/class="wk-panel(?:\s|"|\b)/g)].length;
console.log(`=== pz-zone: panels found === ${pzPanels} (radios: ${pzRadios.length})`);
console.log(`=== wk-zone: panels found === ${wkPanels} (radios: ${wkRadios.length})`);
if (pzPanels < pzRadios.length) fail('pz-zone has fewer panels than radios');
if (wkPanels < wkRadios.length) fail('wk-zone has fewer panels than radios');

// 5) labels \u2194 radios
const labels = [...src.matchAll(/<label for="(p\w+|wk\d+)">/g)].map(m => m[1]);
const radios = [...src.matchAll(/<input type="radio" name="(pz|wk)" id="(p\w+|wk\d+)"[^>]*>/g)].map(m => m[2]);
console.log('=== radios ===', radios.join(','));
console.log('=== labels ===', labels.join(','));
const missing = labels.filter(l => !radios.includes(l));
if (missing.length) fail('labels without radio: ' + missing.join(','));
console.log(missing.length ? '  \u2717 label without radio' : '  \u2713 all labels have radios');

// 6) exactly ONE checked per group
for (const group of ['pz', 'wk']) {
  const all = [...src.matchAll(new RegExp(`<input type="radio" name="${group}" id="[^]+?checked`, 'g'))];
  const nChecked = (src.match(new RegExp(`name="${group}" id="[^"]+" checked`, 'g')) || []).length;
  console.log(`=== checked ${group} === ${nChecked}`);
  if (nChecked !== 1) fail(`group ${group} has ${nChecked} checked radios (must be 1)`);
}

console.log(errors ? `\nFAIL: ${errors} error(s)` : '\nOK: mechanics valid');
process.exit(errors ? 1 : 0);
