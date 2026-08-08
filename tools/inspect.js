#!/usr/bin/env node
/* فحص الأسئلة والأجوبة المحسوبة آليًا لورقة معيّنة من الناتج النهائي.
   الاستخدام:  node tools/inspect.js ikhlas
               node tools/inspect.js            (ملخّص كل الأوراق) */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const want = process.argv[2];

const sheets = [...doc.querySelectorAll('details.ws-item')];
if (!want) {
  let tot = 0, gr = 0;
  sheets.forEach(d => {
    const qs = d.querySelectorAll('.q');
    const g = [...d.querySelectorAll('[data-k]')].filter(i => i.dataset.ans !== undefined || i.dataset.dyn).length;
    tot += qs.length; gr += g;
    console.log(`${d.id.slice(2).padEnd(12)} ${String(qs.length).padStart(3)} سؤال · مُصحَّح آليًا ${String(g).padStart(3)}  ${d.dataset.name}`);
  });
  console.log(`\nالإجمالي: ${sheets.length} ورقة · ${tot} سؤالًا · مُصحَّح آليًا ${gr} (${Math.round(100 * gr / tot)}%)`);
  process.exit(0);
}

const det = doc.getElementById('w-' + want);
if (!det) { console.error('لا توجد ورقة بالمعرّف:', want); process.exit(1); }
console.log('الورقة :', det.dataset.name);
console.log('الموقع :', (det.querySelector('.loc') || {}).textContent || '—');
const words = JSON.parse(det.dataset.words);
console.log('الكلمات:', words.length, '→', words.map(w => w[0]).join(' | '));
console.log('الحروف :', words.reduce((s, w) => s + w[1].replace(/\s/g, '').length, 0));
console.log('');

let n = 0, graded = 0;
det.querySelectorAll('.sec').forEach(sec => {
  console.log('■ ' + sec.querySelector('.sec-head h3').textContent);
  sec.querySelectorAll('.q').forEach(q => {
    n++;
    const txt = q.querySelector('.txt').textContent;
    const el = q.querySelector('[data-k]');
    let kind = '—', ans = '';
    if (el) {
      kind = el.dataset.ui || el.type;
      if (el.dataset.ans !== undefined) { ans = 'الإجابة: ' + el.dataset.ans; graded++; }
      else if (el.dataset.dyn) { ans = 'تحقّق: ' + el.dataset.dyn + (el.dataset.show ? ' / ' + el.dataset.show : ''); graded++; }
      else if (el.type === 'checkbox') { kind = 'مهمة ✓'; }
      else ans = '(بدون تصحيح آلي)';
    }
    console.log(`  ${String(n).padStart(2)}. ${txt}
      [${kind}] ${ans}`);
  });
});
console.log(`\nالمجموع: ${n} سؤالًا · مُصحَّح آليًا: ${graded}`);
