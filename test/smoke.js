const {JSDOM}=require('jsdom');
const fs=require('fs');
const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window, doc=w.document;
const errs=[]; w.addEventListener('error',e=>errs.push(e.message));

const WS=58, QS=3480, PASS=process.env.ADMIN_PASS||'change-me-set-ADMIN_PASS-env-var';

setTimeout(()=>{
  let fails=0;
  const ok=(name,cond)=>{ console.log((cond?'✔':'✘'), name); if(!cond){ fails++; process.exitCode=1; } };

  /* ---------- المحتوى ---------- */
  ok('no runtime errors', errs.length===0);
  ok(`${WS} worksheets rendered`, doc.querySelectorAll('details.ws-item').length===WS);
  ok(`${QS} questions rendered`, doc.querySelectorAll('.q').length===QS);
  ok('new surah (الإخلاص) present', !!doc.getElementById('w-ikhlas'));
  ok('new ayah (النحل ٩٠) present', !!doc.getElementById('w-nahl90'));
  ok('each worksheet has 3 sections', [...doc.querySelectorAll('details.ws-item')].every(d=>d.querySelectorAll('.sec').length===3));

  /* ---------- التصحيح الآلي ---------- */
  const det=doc.getElementById('w-falaq'); det.setAttribute('open','');
  const num=[...det.querySelectorAll('[data-ui="num"]')].find(i=>i.dataset.ans);
  num.value=num.dataset.ans; num.dispatchEvent(new w.Event('input',{bubbles:true}));
  ok('auto-grading works', num.closest('.q').classList.contains('ok'));
  const ikh=doc.getElementById('w-ikhlas');
  const q1=ikh.querySelector('[data-ui="num"]');
  ok('new worksheet auto-graded (عدد كلمات = ١٥)', q1.dataset.ans==='15');
  ok('surah number graded (الإخلاص = ١١٢)',
     [...ikh.querySelectorAll('[data-k]')].some(i=>i.dataset.ans==='112'));
  ok('ayah number graded (النحل = ٩٠)',
     [...doc.querySelectorAll('#w-nahl90 [data-k]')].some(i=>i.dataset.ans==='90'));

  /* ---------- كل سؤال له إجابة أو أنه نشاط ---------- */
  let missing=0;
  doc.querySelectorAll('.q').forEach(q=>{
    const el=q.querySelector('[data-k]'); if(!el) return;
    if(el.type==='checkbox') return;                              // نشاط ✓
    if(el.dataset.ans!==undefined||el.dataset.dyn||el.dataset.show) return;
    if(/^ارسم|^اكتب|^لوّن/.test(q.querySelector('.txt').textContent)) return;  // رسم
    missing++;
  });
  ok('every question has an answer, key, or is an activity', missing===0);
  /* لا وجود لأي نشاط «قراءة عكسية» — القراءة العكسية للقرآن غير مستحبة، ولا يجوز إضافتها مجددًا */
  ok('no reverse-reading (قراءة عكسية) activity anywhere',
     ![...doc.querySelectorAll('.q .txt')].some(t=>t.textContent.includes('عكسية')));

  /* ---------- مستويات الصعوبة ---------- */
  const lvls=new Set([...doc.querySelectorAll('.q')].map(q=>q.dataset.lvl));
  ok('every question is rated', [...doc.querySelectorAll('.q')].every(q=>q.dataset.lvl));
  ok('all five Arabic levels used', lvls.size===5);
  ok('level legend on each sheet', doc.querySelectorAll('.lvl-legend').length===WS);

  /* ---------- أرقام الآيات وموقع السورة ---------- */
  ok('ayah markers numbered', /۝١/.test(html) && !/>۝<\//.test(html));
  ok('non-sequential excerpts numbered correctly (takwir 19,20)',
     [...doc.querySelectorAll('#w-takwir .verse .aya')].map(a=>a.textContent).join(' ').endsWith('۝١٩ ۝٢٠'));
  ok('partial ayah has no end marker (kursi)', doc.querySelectorAll('#w-kursi .verse .aya').length===0);
  ok('surah location shown', /السورة رقم ١١٣ في المصحف/.test(doc.querySelector('#w-falaq .loc').textContent));
  ok('ayah location shown', /الآية ٩٠ من سورة النحل/.test(doc.querySelector('#w-nahl90 .loc').textContent));

  /* ---------- بيانات الباحث العامة ---------- */
  const mf=doc.querySelector('[data-mf="name"]');
  mf.value='أحمد'; mf.dispatchEvent(new w.Event('input',{bubbles:true}));
  const others=[...doc.querySelectorAll('[data-mf="name"]')];
  ok('meta fields are global across sheets', others.length===WS && others.every(i=>i.value==='أحمد'));
  ok('meta fields persist', JSON.parse(w.localStorage.getItem('tahleel-meta')).name==='أحمد');

  /* ---------- التجاوب ---------- */
  const vp=doc.querySelector('meta[name=viewport]').content;
  ok('viewport is device-width + safe areas', /width=device-width/.test(vp) && /viewport-fit=cover/.test(vp));
  ok('no maximum-scale (pinch-zoom allowed)', !/maximum-scale|user-scalable=no/.test(vp));
  ok('topbar has a width-capped wrapper', !!doc.querySelector('.topbar .topbar-in'));
  ok('open worksheet spans the full grid', /\.ws-item\[open\]\{grid-column:1\/-1\}/.test(html));
  ok('mobile breakpoints present', /@media \(max-width:640px\)/.test(html) && /@media \(hover:none\)/.test(html));
  ok('16px inputs on small screens (no iOS zoom)', /@media \(max-width:820px\)\{[\s\S]{0,400}font-size:16px/.test(html));
  ok('print keeps the sheet visible', /@media print\{[\s\S]*?\.grid\{display:block!important/.test(html));
  ok('sticky toolbar offset var is set', doc.documentElement.style.getPropertyValue('--topbar-h')!=='');
  ok('worksheet toolbar has a close button', doc.querySelectorAll('.ws-top [data-close]').length===WS);

  /* ---------- المدير: بوابة مخفية بكلمة مرور ---------- */
  const gate=doc.getElementById('admGate');
  ok('no visible admin button', !doc.getElementById('admOpen'));
  ok('password gate exists and is hidden', !!gate && gate.hidden);
  ok('admin panel starts hidden', doc.getElementById('adminPanel').hidden);
  const brand=doc.getElementById('brandKey');
  for(let i=0;i<5;i++) brand.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  ok('5 taps on the logo open the gate', !gate.hidden && doc.getElementById('adminPanel').hidden);
  doc.getElementById('admPass').value='wrong';
  doc.getElementById('admGateForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  ok('wrong password is rejected', doc.getElementById('adminPanel').hidden && !gate.hidden);
  doc.getElementById('admPass').value=PASS;
  doc.getElementById('admGateForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  ok('correct password opens admin', !doc.getElementById('adminPanel').hidden && gate.hidden);
  ok('body scroll locked while admin open', doc.body.classList.contains('no-scroll'));

  /* ---------- المدير: خطوتان ---------- */
  ok('step 1 (add worksheet) shown first', !doc.getElementById('admStepWs').hidden && doc.getElementById('admStepQ').hidden);
  /* نوع السؤال يتغيّر حسب القسم المختار، وكل الأنواع الـ32 موزّعة على الأقسام الثلاثة دون تكرار أو نقص */
  ok('question type filters by section (fewer options than the full type list)',
     doc.querySelectorAll('#admType option').length>=8 && doc.querySelectorAll('#admType option').length<30);
  var allTypeIds=[], seenPerSec=[];
  [0,1,2].forEach(function(sec){
    doc.getElementById('admSec').value=String(sec);
    doc.getElementById('admSec').dispatchEvent(new w.Event('change',{bubbles:true}));
    var ids=[...doc.querySelectorAll('#admType option')].map(function(o){return o.value;});
    seenPerSec.push(ids);
    allTypeIds=allTypeIds.concat(ids);
  });
  ok('all sections together offer every question type with none repeated',
     allTypeIds.length===new Set(allTypeIds).size && allTypeIds.length>=30);
  ok('each section has its own distinct question types', seenPerSec.every(function(ids){return ids.length>0;}));
  doc.getElementById('admSec').value='0';
  doc.getElementById('admSec').dispatchEvent(new w.Event('change',{bubbles:true}));

  // إضافة سورة جديدة عبر الخطوة الأولى
  doc.getElementById('nwName').value='سورة تجربة الإدارة';
  doc.getElementById('nwVerse').value='وَالضُّحَىٰ ۝ وَاللَّيْلِ إِذَا سَجَىٰ ۝ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ';
  doc.getElementById('nwNum').value='93';
  doc.getElementById('nwAyat').value='11';
  doc.getElementById('nwSave').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const added=doc.querySelector('.ws-item.ws-custom');
  ok('new worksheet is created and rendered', !!added && added.dataset.name==='سورة تجربة الإدارة');
  ok('new worksheet has 3 sections', added.querySelectorAll('.sec').length===3);
  ok('new worksheet numbered its ayat', [...added.querySelectorAll('.verse .aya')].map(a=>a.textContent).join(' ')==='۝١ ۝٢ ۝٣');
  ok('new worksheet shows its location', /السورة رقم ٩٣/.test(added.querySelector('.loc').textContent));
  ok('new worksheet saved', JSON.parse(w.localStorage.getItem('tahleel-ws')).length===1);
  ok('home stats updated', doc.querySelector('[data-stat="ws"]').textContent===String(WS+1));
  ok('new worksheet selectable for questions',
     [...doc.querySelectorAll('#admWs option')].some(o=>o.value===added.id.slice(2)));
  ok('section list uses real section titles', /أولًا/.test(doc.querySelector('#admSec option').textContent));

  // إضافة سؤال إلى الورقة الجديدة (في القسم الثاني)
  const wsId=added.id.slice(2);
  doc.getElementById('admWs').value=wsId;
  doc.getElementById('admWs').dispatchEvent(new w.Event('change',{bubbles:true}));
  doc.getElementById('admType').value='wordCount';
  doc.getElementById('admType').dispatchEvent(new w.Event('change',{bubbles:true}));
  doc.getElementById('admSec').value='1';
  doc.getElementById('admAdd').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const cq=added.querySelectorAll('.q.custom');
  ok('question added to the new worksheet', cq.length===1);
  ok('question landed in the chosen section',
     added.querySelectorAll('.sec')[1].querySelectorAll('.q.custom').length===1);
  ok('added question is auto-graded', cq[0].querySelector('[data-k]').dataset.ans==='9');
  ok('added question is rated', !!cq[0].dataset.lvl && !!cq[0].querySelector('.lvl'));

  // grading works on the runtime worksheet
  const inp=cq[0].querySelector('[data-k]');
  inp.value='9'; inp.dispatchEvent(new w.Event('input',{bubbles:true}));
  ok('runtime worksheet grades answers', inp.closest('.q').classList.contains('ok'));

  // التصدير يضم الأوراق والأسئلة
  const out=w.__exportHtml();
  ok('export embeds new worksheets', /id="customws">\[\{/.test(out));
  ok('export embeds added questions', /id="customq">\{"/.test(out));

  // Escape يغلق
  doc.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('Escape closes admin', doc.getElementById('adminPanel').hidden && !doc.body.classList.contains('no-scroll'));

  console.log(fails? `\n✘ ${fails} فحصًا فاشلًا` : '\n✔ كل الفحوص ناجحة');
},600);
