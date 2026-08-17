const fs=require('fs');
const path=require('path');
const http=require('http');
const puppeteer=require('puppeteer');

/* Chrome needs a few shared libs (libnspr4, libnss3, ...) that aren't part
   of a bare system install here — vendored under ~/.local/chromelibs (see
   session setup) and exposed via LD_LIBRARY_PATH so the spawned browser
   process (which inherits this process's env) can find them. Harmless to
   set even where the system libs already exist. */
const localLibs=path.join(process.env.HOME||'', '.local/chromelibs/usr/lib/x86_64-linux-gnu');
if(fs.existsSync(localLibs)){
  process.env.LD_LIBRARY_PATH=localLibs+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'');
}

const t0=Date.now();
const stamp=()=>((Date.now()-t0)/1000).toFixed(1)+'s';
const log=(...a)=>console.log(`[${stamp()}]`,...a);

const WS=668, QS=39330, PASS=process.env.ADMIN_PASS||'change-me-set-ADMIN_PASS-env-var', USER=process.env.ADMIN_USER||'admin';
const distPath=path.join(__dirname,'../dist/index.html');
const distRoot=path.join(__dirname,'../dist');

/* Serving over real http (not file://) matters here, not just convenience:
   file:// requests are treated as opaque cross-origin by Chrome, so fetch()
   of the i18n API JSON and the manifest link both get silently blocked by
   CORS — which is not a real bug (production is always served over http),
   but would show up as false "runtime error" failures below. */
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
function startServer(){
  return new Promise((resolve)=>{
    const server=http.createServer((req,res)=>{
      let rel=decodeURIComponent((req.url||'/').split('?')[0]);
      if(rel.endsWith('/')) rel+='index.html';
      const file=path.join(distRoot, path.normalize(rel).replace(/^(\.\.[/\\])+/,''));
      if(!file.startsWith(distRoot)){ res.writeHead(403).end('403'); return; }
      fs.readFile(file,(err,buf)=>{
        if(err){ res.writeHead(404).end('404'); return; }
        res.writeHead(200,{'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream'});
        res.end(buf);
      });
    });
    server.listen(0,'127.0.0.1',()=>resolve(server));
  });
}

(async()=>{
  log('reading dist/index.html…');
  const html=fs.readFileSync(distPath,'utf8');
  log(`read ${(html.length/1024/1024).toFixed(1)}MB — starting local http server + headless Chrome…`);

  const server=await startServer();
  const port=server.address().port;
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  /* Headless Chrome's default navigator.language is en-US, which the site's
     browser-language auto-detection (see detectBrowserLocale in app.js)
     picks up and switches the UI to English — a real feature, not a bug,
     but it means every fixed-Arabic-string assertion below needs the page
     to look like an Arabic visitor, same as most real users of this site. */
  await page.emulateTimezone('Asia/Riyadh');
  await page.setExtraHTTPHeaders({'Accept-Language':'ar'});
  await page.evaluateOnNewDocument(()=>{
    Object.defineProperty(navigator,'language',{get:()=>'ar'});
    Object.defineProperty(navigator,'languages',{get:()=>['ar']});
  });
  const errs=[];
  page.on('pageerror',e=>errs.push(String(e)));
  page.on('console',msg=>{ if(msg.type()==='error') errs.push(msg.text()); });

  await page.goto(`http://127.0.0.1:${port}/`, {waitUntil:'load'});
  log('page loaded — probing lazy-load behavior…');

  let fails=0;
  const ok=(name,cond)=>{ console.log((cond?'✔':'✘'), name); if(!cond){ fails++; process.exitCode=1; } };

  /* Everything below runs inside the page so real DOM APIs (outerHTML,
     dispatchEvent, localStorage) behave exactly as they do for a real
     visitor — no jsdom quirks to work around. */
  const result=await page.evaluate(async (WS,QS,PASS,USER)=>{
    const doc=document, w=window;
    /* home grid is now paginated (build.js only inlines the first ~30 cards,
       the rest load lazily on scroll/search — see app.js) so tests that poke
       specific builtin worksheet ids need every card materialized up front. */
    if(w.materializeAllGridCards) w.materializeAllGridCards();
    const checks=[];
    const ok=(name,cond)=>checks.push([name,!!cond]);
    /* renderCustomAll (admin.js) is async now — it awaits ensureBodyLoaded
       before inserting the new/edited question DOM, so a UI action that
       triggers it (adding a question, adding a section) no longer finishes
       synchronously within the same click dispatch. Poll briefly instead of
       assuming the DOM has already updated the instant dispatchEvent returns. */
    const waitFor=(pred,timeout)=>new Promise(resolve=>{
      const t0=Date.now();
      (function tick(){
        if(pred()||Date.now()-t0>(timeout||2000)) return resolve();
        setTimeout(tick,20);
      })();
    });

    /* ---------- lazy load ---------- */
    const lazyProbe=doc.getElementById('w-nahl_full_09');
    const lazyBefore=lazyProbe && lazyProbe.querySelectorAll('.q').length===0 && !!lazyProbe.querySelector(':scope > .ws[data-lazy]');
    if(lazyProbe){ lazyProbe.open=true; if(w.ensureBodyLoaded) await w.ensureBodyLoaded(lazyProbe); }
    const lazyAfter=lazyProbe && lazyProbe.querySelectorAll('.q').length>0 && !lazyProbe.querySelector(':scope > .ws[data-lazy]');
    ok('unopened worksheet has no question DOM (lazy)', lazyBefore);
    ok('opening a worksheet loads its questions (lazy load)', lazyAfter);

    /* ensureBodyLoaded now fetches each worksheet's body via its own
       <script src> (see app.js). Opening all of them here at once is also a
       regression check for the freeze bug: a prior version of this loader
       triggered a service-worker reload mid-load that destroyed the page's
       execution context under this exact load pattern. Batched (not all
       687 in one Promise.all) to mirror how admin.js does its own bulk
       loads and keep this reasonably fast. */
    const allItems=[...doc.querySelectorAll('details.ws-item')];
    const BATCH=60;
    for(let i=0;i<allItems.length;i+=BATCH){
      await Promise.all(allItems.slice(i,i+BATCH).map(d=>{
        d.open=true;
        return w.ensureBodyLoaded ? w.ensureBodyLoaded(d) : null;
      }));
    }

    /* ---------- content ---------- */
    ok(`${WS} worksheets rendered`, doc.querySelectorAll('details.ws-item').length===WS);
    ok(`${QS} questions rendered`, doc.querySelectorAll('.q').length===QS);
    ok('new surah (الإخلاص) present', !!doc.getElementById('w-ikhlas'));
    ok('ayah chunk (النحل ٨١-٩٠) present', !!doc.getElementById('w-nahl_full_09'));
    ok('each worksheet has 3 sections', [...doc.querySelectorAll('details.ws-item')].every(d=>d.querySelectorAll('.sec').length===3));

    /* ---------- auto-grading ---------- */
    const det=doc.getElementById('w-falaq'); det.setAttribute('open','');
    const num=[...det.querySelectorAll('[data-ui="num"]')].find(i=>i.dataset.ans);
    num.value=num.dataset.ans; num.dispatchEvent(new Event('input',{bubbles:true}));
    ok('auto-grading works', num.closest('.q').classList.contains('ok'));
    const ikh=doc.getElementById('w-ikhlas');
    const q1=ikh.querySelector('[data-ui="num"]');
    ok('new worksheet auto-graded (عدد كلمات = ١٥)', q1.dataset.ans==='15');
    ok('surah number graded (الإخلاص = ١١٢)',
       [...ikh.querySelectorAll('[data-k]')].some(i=>i.dataset.ans==='112'));

    /* ---------- every question has an answer or is an activity ---------- */
    let missing=0;
    doc.querySelectorAll('.q').forEach(q=>{
      const el=q.querySelector('[data-k]'); if(!el) return;
      if(el.type==='checkbox') return;
      if(el.dataset.ans!==undefined||el.dataset.dyn||el.dataset.show) return;
      if(/^ارسم|^اكتب|^لوّن/.test(q.querySelector('.txt').textContent)) return;
      missing++;
    });
    ok('every question has an answer, key, or is an activity', missing===0);
    ok('no reverse-reading (قراءة عكسية) activity anywhere',
       ![...doc.querySelectorAll('.q .txt')].some(t=>t.textContent.includes('عكسية')));
    ok('no decorative flower ornaments (❁) on the verse box',
       !document.documentElement.outerHTML.includes('content:"❁"'));

    /* ---------- difficulty levels ---------- */
    const lvls=new Set([...doc.querySelectorAll('.q')].map(q=>q.dataset.lvl));
    ok('every question is rated', [...doc.querySelectorAll('.q')].every(q=>q.dataset.lvl));
    ok('all five Arabic levels used', lvls.size===5);
    ok('level legend on each sheet', doc.querySelectorAll('.lvl-legend').length===WS);

    /* ---------- ayah numbers and surah location ---------- */
    const fullHtml=document.documentElement.outerHTML;
    ok('ayah markers numbered', /۝١/.test(fullHtml) && [...doc.querySelectorAll('.aya')].every(a=>a.textContent!=='۝'));
    ok('split surah chunk numbered completely and sequentially (takwir last chunk ends at 29)',
       [...doc.querySelectorAll('#w-takwir_full_03 .verse .aya')].map(a=>a.textContent).join(' ').endsWith('۝٢٩'));
    ok('ayah chunk has its end markers', doc.querySelectorAll('#w-nahl_full_09 .verse .aya').length===10);
    ok('surah location shown', /السورة رقم ١١٣ في المصحف/.test(doc.querySelector('#w-falaq .loc').textContent));
    ok('ayah chunk location shown', /الآية ٨١ من سورة النحل/.test(doc.querySelector('#w-nahl_full_09 .loc').textContent));

    ok('meta fields removed from worksheets', doc.querySelectorAll('[data-mf]').length===0);

    /* ---------- responsiveness ---------- */
    const vp=doc.querySelector('meta[name=viewport]').content;
    ok('viewport is device-width + safe areas', /width=device-width/.test(vp) && /viewport-fit=cover/.test(vp));
    ok('no maximum-scale (pinch-zoom allowed)', !/maximum-scale|user-scalable=no/.test(vp));
    ok('topbar has a width-capped wrapper', !!doc.querySelector('.topbar .topbar-in'));
    ok('open worksheet spans the full grid', /\.ws-item\[open\]\{grid-column:1\/-1\}/.test(fullHtml));
    ok('mobile breakpoints present', /@media \(max-width:640px\)/.test(fullHtml) && /@media \(hover:none\)/.test(fullHtml));
    ok('16px inputs on small screens (no iOS zoom)', /@media \(max-width:820px\)\{[\s\S]{0,400}font-size:16px/.test(fullHtml));
    ok('print keeps the sheet visible', /@media print\{[\s\S]*?\.grid\{display:block!important/.test(fullHtml));
    ok('sticky toolbar offset var is set', doc.documentElement.style.getPropertyValue('--topbar-h')!=='');
    ok('worksheet toolbar has a close button', doc.querySelectorAll('.ws-top [data-close]').length===WS);

    /* ---------- admin: hidden password gate ---------- */
    const gate=doc.getElementById('admGate');
    ok('no visible admin button', !doc.getElementById('admOpen'));
    ok('password gate exists and is hidden', !!gate && gate.hidden);
    ok('admin panel starts hidden', doc.getElementById('adminPanel').hidden);
    const brand=doc.getElementById('brandKey');
    for(let i=0;i<5;i++) brand.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    ok('5 taps on the logo open the gate', !gate.hidden && doc.getElementById('adminPanel').hidden);
    doc.getElementById('admUser').value=USER;
    doc.getElementById('admPass').value='wrong';
    doc.getElementById('admGateForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    ok('wrong password is rejected', doc.getElementById('adminPanel').hidden && !gate.hidden);
    doc.getElementById('admUser').value='wronguser';
    doc.getElementById('admPass').value=PASS;
    doc.getElementById('admGateForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    ok('wrong username is rejected', doc.getElementById('adminPanel').hidden && !gate.hidden);
    doc.getElementById('admUser').value=USER;
    doc.getElementById('admPass').value=PASS;
    doc.getElementById('admGateForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    ok('correct username+password opens admin', !doc.getElementById('adminPanel').hidden && gate.hidden);
    ok('body scroll locked while admin open', doc.body.classList.contains('no-scroll'));

    /* ---------- admin: worksheets and questions together (no wizard steps) ---------- */
    ok('worksheets and questions sections both shown (wizard steps removed)',
       !doc.getElementById('admStepWs').hidden && !doc.getElementById('admStepQ').hidden);
    /* fillAdminOptionsOnce (admin.js) populates #admWs/#admType lazily on
       first panel open now (previously eager at script load, which built a
       688-option <select> for every visitor regardless of whether they'd
       ever open the admin panel) — chains through async ensureBodyLoaded,
       so it needs a moment to settle after login before these options exist. */
    await waitFor(()=>doc.querySelectorAll('#admType option').length>0);
    ok('question type filters by section (fewer options than the full type list)',
       doc.querySelectorAll('#admType option').length>=8 && doc.querySelectorAll('#admType option').length<30);
    var allTypeIds=[], seenPerSec=[];
    [0,1,2].forEach(function(sec){
      doc.getElementById('admSec').value=String(sec);
      doc.getElementById('admSec').dispatchEvent(new Event('change',{bubbles:true}));
      var ids=[...doc.querySelectorAll('#admType option')].map(function(o){return o.value;});
      seenPerSec.push(ids);
      allTypeIds=allTypeIds.concat(ids);
    });
    ok('all sections together offer every question type with none repeated',
       allTypeIds.length===new Set(allTypeIds).size && allTypeIds.length>=30);
    ok('each section has its own distinct question types', seenPerSec.every(function(ids){return ids.length>0;}));
    doc.getElementById('admSec').value='0';
    doc.getElementById('admSec').dispatchEvent(new Event('change',{bubbles:true}));

    doc.getElementById('nwName').value='سورة تجربة الإدارة';
    doc.getElementById('nwVerse').value='وَالضُّحَىٰ ۝ وَاللَّيْلِ إِذَا سَجَىٰ ۝ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ';
    doc.getElementById('nwNum').value='93';
    doc.getElementById('nwAyat').value='11';
    doc.getElementById('nwSave').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    await waitFor(()=>!!doc.querySelector('#admSec option'));
    const added=doc.querySelector('.ws-item.ws-custom');
    ok('new worksheet is created and rendered', !!added && added.dataset.name==='سورة تجربة الإدارة');
    ok('new worksheet has 3 sections', added.querySelectorAll('.sec').length===3);
    ok('new worksheet numbered its ayat', [...added.querySelectorAll('.verse .aya')].map(a=>a.textContent).join(' ')==='۝١ ۝٢ ۝٣');
    ok('new worksheet shows its location', /السورة رقم ٩٣/.test(added.querySelector('.loc').textContent));
    ok('new worksheet saved', JSON.parse(localStorage.getItem('tahleel-ws')).length===1);
    ok('home stats updated', doc.querySelector('[data-stat="ws"]').textContent===String(WS+1));
    ok('new worksheet selectable for questions',
       [...doc.querySelectorAll('#admWs option')].some(o=>o.value===added.id.slice(2)));
    ok('section list uses real section titles', /أولًا/.test(doc.querySelector('#admSec option').textContent));

    const wsId=added.id.slice(2);
    doc.getElementById('admWs').value=wsId;
    doc.getElementById('admWs').dispatchEvent(new Event('change',{bubbles:true}));
    doc.getElementById('admType').value='wordCount';
    doc.getElementById('admType').dispatchEvent(new Event('change',{bubbles:true}));
    doc.getElementById('admSec').value='1';
    doc.getElementById('admAdd').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    await waitFor(()=>added.querySelectorAll('.q.custom').length>0);
    const cq=added.querySelectorAll('.q.custom');
    ok('question added to the new worksheet', cq.length===1);
    ok('question landed in the chosen section',
       added.querySelectorAll('.sec')[1].querySelectorAll('.q.custom').length===1);
    ok('added question is auto-graded', cq[0].querySelector('[data-k]').dataset.ans==='9');
    ok('added question is rated', !!cq[0].dataset.lvl && !!cq[0].querySelector('.lvl'));

    const inp=cq[0].querySelector('[data-k]');
    inp.value='9'; inp.dispatchEvent(new Event('input',{bubbles:true}));
    ok('runtime worksheet grades answers', inp.closest('.q').classList.contains('ok'));

    const out=await w.__exportHtml();
    ok('export embeds new worksheets', /id="customws">\[\{/.test(out));
    ok('export embeds added questions', /id="customq">\{"/.test(out));

    /* ---------- adding a new section to a builtin worksheet ---------- */
    doc.getElementById('admWs').value='falaq';
    doc.getElementById('admWs').dispatchEvent(new Event('change',{bubbles:true}));
    /* fillSecOptions (admin.js) is async now — waiting here matters beyond
       just this immediate check: without it, this pending chain resolves
       later and calls fillTypeOptions()/renderFields() on its own schedule,
       stomping over whatever #admType/#admFields state later test code
       (the multiField block below) sets up in the meantime. */
    await waitFor(()=>doc.querySelectorAll('#admSec option').length>0);
    const secCountBefore=doc.querySelectorAll('#w-falaq .sec').length;
    doc.getElementById('admNewSecTitle').value='قسم تجريبي إضافي';
    doc.getElementById('admAddSection').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    await waitFor(()=>!!doc.querySelector('#w-falaq .sec.sec-extra'));
    const extraSec=doc.querySelector('#w-falaq .sec.sec-extra');
    ok('new section added to builtin worksheet', !!extraSec && extraSec.querySelector('h3').textContent==='قسم تجريبي إضافي');
    ok('section count increased by one', doc.querySelectorAll('#w-falaq .sec').length===secCountBefore+1);
    doc.getElementById('admWs').dispatchEvent(new Event('change',{bubbles:true}));
    await waitFor(()=>[...doc.querySelectorAll('#admSec option')].some(o=>o.textContent.includes('قسم تجريبي إضافي')));
    ok('new section selectable for questions',
       [...doc.querySelectorAll('#admSec option')].some(o=>o.textContent.includes('قسم تجريبي إضافي')));

    /* ---------- multiField: comma-separated words produce linked sub-questions ---------- */
    /* lamType lives in section 1's type list (SECTION_TYPE_MAP in admin.js)
       — #admType's options are filtered to the currently selected section,
       so admSec must be switched to 1 (and its 'change' fired, which is
       what actually rebuilds #admType's options) before 'lamType' can be
       selected at all. */
    doc.getElementById('admSec').value='1';
    doc.getElementById('admSec').dispatchEvent(new Event('change',{bubbles:true}));
    doc.getElementById('admType').value='lamType';
    doc.getElementById('admType').dispatchEvent(new Event('change',{bubbles:true}));
    const wordInput=doc.querySelector('#admFields [data-f="word"]');
    wordInput.value='الشمس, القمر, الليل';
    const qCountBefore=doc.querySelectorAll('#w-falaq .q.custom').length;
    doc.getElementById('admAdd').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    await waitFor(()=>doc.querySelectorAll('#w-falaq .q.custom').length>qCountBefore);
    const lamQs=[...doc.querySelectorAll('#w-falaq .q.custom')].slice(-3);
    ok('multi-word input creates 3 linked sub-questions', lamQs.length===3);
    ok('sub-questions are ordinal-labeled', lamQs.every((q,i)=>q.querySelector('.txt').textContent.trim().startsWith(['أ)','ب)','ج)'][i])));
    ok('sub-question for شمس is شمسية', /شمسية/.test(lamQs[0].querySelector('[data-k]').dataset.ans));
    ok('sub-question for قمر is قمرية', /قمرية/.test(lamQs[1].querySelector('[data-k]').dataset.ans));

    return checks;
  }, WS, QS, PASS, USER);

  ok('no runtime errors', errs.length===0);
  if(errs.length) errs.forEach(e=>console.log('  ', e));
  for(const [name,cond] of result) ok(name,cond);

  /* ---------- hide/restore a builtin worksheet: requires a real prompt()
     dialog to confirm the password — untestable without a real browser
     (jsdom doesn't implement window.prompt), which is exactly why this
     suite moved to Puppeteer. ---------- */
  let nextPromptAnswer=null;
  page.on('dialog', async d=>{
    if(d.type()==='prompt' && nextPromptAnswer!=null) await d.accept(nextPromptAnswer);
    else if(d.type()==='prompt') await d.dismiss();
    else await d.accept();
  });
  await page.waitForFunction(()=>document.querySelectorAll('#bwList [data-hideid]').length>600, {timeout:60000});
  log('builtin worksheet list loaded — testing hide/restore…');

  nextPromptAnswer='wrong-password-xyz';
  await page.evaluate(()=>document.querySelector('#bwList [data-hideid="falaq"]').click());
  let hiddenNow=await page.evaluate(()=>JSON.parse(localStorage.getItem('tahleel-hidden')||'[]').includes('falaq'));
  ok('wrong password does not hide the worksheet', !hiddenNow);

  nextPromptAnswer=PASS;
  await page.evaluate(()=>document.querySelector('#bwList [data-hideid="falaq"]').click());
  hiddenNow=await page.evaluate(()=>JSON.parse(localStorage.getItem('tahleel-hidden')||'[]').includes('falaq'));
  const classApplied=await page.evaluate(()=>document.getElementById('w-falaq').classList.contains('ws-hidden'));
  ok('correct password hides the worksheet', hiddenNow);
  ok('hidden worksheet gets the ws-hidden class', classApplied);

  nextPromptAnswer=null;
  await page.evaluate(()=>document.querySelector('#bwList [data-hideid="falaq"]').click());
  hiddenNow=await page.evaluate(()=>JSON.parse(localStorage.getItem('tahleel-hidden')||'[]').includes('falaq'));
  const classRemoved=await page.evaluate(()=>!document.getElementById('w-falaq').classList.contains('ws-hidden'));
  ok('restoring (no password needed) unhides the worksheet', !hiddenNow);
  ok('restored worksheet loses the ws-hidden class', classRemoved);

  const escResult=await page.evaluate(()=>{
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    return document.getElementById('adminPanel').hidden && !document.body.classList.contains('no-scroll');
  });
  ok('Escape closes admin', escResult);

  log('running fixed API checks…');

  const apiWs=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/api/worksheets.json'),'utf8'));
  const apiMeta=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/api/meta.json'),'utf8'));
  ok('api/worksheets.json has all worksheets', apiWs.length===WS);
  ok('api/meta.json counts match the build', apiMeta.worksheets===WS && apiMeta.questions===QS);
  ok('api worksheets carry their questions', apiWs.every(w=>w.sections.every(s=>s.questions.length>0)));

  await browser.close();
  server.close();
  console.log(fails? `\n✘ ${fails} فحصًا فاشلًا` : '\n✔ كل الفحوص ناجحة');
})().catch(e=>{ console.error(e); process.exitCode=1; });
