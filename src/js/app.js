document.body.classList.add('js');
var SUN='تثدذرزسشصضطظلن';
var DIAC=/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]/g;
function norm(s){return String(s).replace(DIAC,'').replace(/[﴿﴾«»()،:؟\.!+\-]/g,'').replace(/[ٱآأإ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();}
function toInt(s){ s=String(s).trim().replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}); var n=parseInt(s,10); return isNaN(n)?null:n; }
var WORDS={};
document.querySelectorAll('.ws-item').forEach(function(d){
  try{ WORDS[d.id.slice(2)]=JSON.parse(d.dataset.words); }catch(e){ WORDS[d.id.slice(2)]=[]; }
});
function dynTest(kind,extra,orig,nrm){
  if(kind==='len') return orig.replace(DIAC,'').replace(/[\u0640\s]/g,'').length===+extra;
  if(kind==='twice') return (nrm.split(extra).length-1)>=2;
  if(kind==='has') return nrm.indexOf(extra)>-1;
  if(kind==='starts') return nrm.indexOf(extra)===0 || (nrm.length>1 && 'وفبل'.indexOf(nrm[0])>-1 && nrm.slice(1).indexOf(extra)===0);
  if(kind==='ends') return nrm.slice(-1)===extra || (extra==='ه'&&nrm.slice(-1)==='ة');
  if(kind==='mark'){
    if(extra==='shadda') return /\u0651/.test(orig);
    if(extra==='tk') return /\u064D/.test(orig);
    if(extra==='tf') return /\u064B/.test(orig);
    if(extra==='td') return /\u064C/.test(orig);
    if(extra==='tany') return /[\u064B-\u064D]/.test(orig);
    if(extra==='sukun') return /\u0652/.test(orig);
    if(extra==='hamza') return /[ءأإآئؤ]/.test(orig);
    if(extra==='ta') return /\u0629/.test(orig);
    if(extra==='tt') return /\u062A/.test(orig.replace(/\u0629/g,''));
    if(extra==='maqsura') return /\u0649/.test(orig);
    if(extra==='dagger') return /\u0670/.test(orig);
    if(extra==='damma') return /\u064F/.test(orig);
    if(extra==='fatha') return /\u064E/.test(orig);
    if(extra==='kasra') return /\u0650/.test(orig);
  }
  if(kind==='al'){
    var y=nrm; ['و','ف','ب','ل','ك'].forEach(function(p){ if(y.indexOf(p+'ال')===0) y=y.slice(1); });
    return y.indexOf('ال')===0&&y.length>2;
  }
  if(kind==='lam'){
    var x=nrm; ['و','ف','ب','ل','ك'].forEach(function(p){ if(x.indexOf(p+'ال')===0) x=x.slice(1); });
    if(x.indexOf('ال')!==0||x.length<3) return false;
    var after=x[2];
    return extra==='sun' ? SUN.indexOf(after)>-1 : SUN.indexOf(after)===-1;
  }
  if(kind==='inverse') return true;
  return false;
}
function grade(el){
  var q=el.closest('.q'); if(!q) return;
  var v = el.type==='checkbox' ? (el.checked?'x':'') : el.value;
  q.classList.remove('ok','bad');
  var hint=q.querySelector('.hint'); if(hint){hint.hidden=true;}
  var btn=q.querySelector('.ansbtn'); if(btn){btn.remove();}
  if(!v || !v.trim()) return;
  var ok=null;
  if(el.dataset.ans!==undefined){
    if(el.dataset.ui==='num'){ var n=toInt(v); ok = (n!==null && n===toInt(el.dataset.ans)); }
    else if(el.dataset.ui==='seg'){ ok = norm(v).split(' ').join('')===norm(el.dataset.ans).split(' ').join(''); }
    else {
      var u=norm(v), a=norm(el.dataset.ans);
      ok = el.dataset.mode==='contains' ? (u.indexOf(a)>-1||a.indexOf(u)>-1&&u.length>1) : (u===a);
    }
  } else if(el.dataset.dyn){
    var parts=el.dataset.dyn.split(':'), kind=parts[0], extra=parts[1]||'';
    var u2=norm(v), wsId=el.dataset.k.split('-')[0], list=WORDS[wsId]||[];
    ok=false;
    for(var i=0;i<list.length;i++){
      if(list[i][1]===u2 || 'وفبلك'.indexOf(list[i][1][0])>-1 && list[i][1].slice(1)===u2){
        if(dynTest(kind,extra,list[i][0],list[i][1])){ ok=true; break; }
      }
    }
  }
  if(ok===null){ if(el.dataset.show) revealBtn(q,el,t('revealModel')); return; }
  q.classList.add(ok?'ok':'bad');
  if(!ok && el.dataset.show && showAnswerOnMistake()) revealBtn(q,el,t('revealCorrect'));
}
/* ---------- إعداد: هل يظهر زر «الإجابة الصحيحة» تلقائيًا بعد إجابة خاطئة؟ (يُضبط من صفحة المدير) ---------- */
var SETTINGS_KEY='tahleel-settings';
function showAnswerOnMistake(){
  try{ var s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'); return s.showAnswerOnMistake!==false; }catch(e){ return true; }
}
window.showAnswerOnMistake=showAnswerOnMistake;
/* زر إظهار الإجابة — يعمل مع الأسئلة المصححة آليًا ومع الإجابات النموذجية */
function revealBtn(q,el,label){
  if(q.querySelector('.ansbtn')) return;
  var b=document.createElement('button');
  b.className='ansbtn'; b.type='button'; b.textContent=label;
  b.addEventListener('click',function(){
    var h=q.querySelector('.hint');
    var shown=Locale.isDigits(el.dataset.show)?Locale.num(el.dataset.show):el.dataset.show;
    h.textContent=t('answerPrefix')+shown; h.hidden=false; b.remove();
  });
  el.insertAdjacentElement('afterend', b);
}
/* seg auto-format: insert " + " between letters as the child types */
function formatSeg(el){
  var lens=el.dataset.parts.split(',').map(Number);
  var total=lens.reduce(function(a,b){return a+b;},0);
  var raw=el.value.replace(DIAC,'').replace(/[^\u0621-\u064A]/g,'').slice(0,total);
  var out='', pos=0;
  for(var i=0;i<lens.length && pos<raw.length;i++){
    var chunk=raw.slice(pos,pos+lens[i]);
    out += (out?' + ':'') + chunk;
    pos += lens[i];
  }
  el.value=out;
}
var BOUND=(typeof WeakSet!=='undefined')?new WeakSet():{has:function(){return false;},add:function(){}};
function isBound(el){ if(BOUND.has(el)) return true; BOUND.add(el); return false; }
function bindAnswers(root){
  root.querySelectorAll('[data-k]').forEach(function(el){
    if(isBound(el)) return;
    var wsId=el.dataset.k.split('-')[0];
    var h=function(){
      if(el.dataset.ui==='seg') formatSeg(el);
      grade(el);
      updateProg(wsId);
    };
    el.addEventListener('input',h);
    el.addEventListener('change',h);
    el.addEventListener('blur',function(){ grade(el); });
  });
}
bindAnswers(document);
window.bindAnswers=bindAnswers;
function updateProg(wsId){
  var page=document.getElementById('w-'+wsId); if(!page) return;
  var els=page.querySelectorAll('[data-k]'), done=0, okc=0, badc=0;
  els.forEach(function(el){
    var v=el.type==='checkbox'?(el.checked?'x':''):el.value;
    if(v&&v.trim()) done++;
    var q=el.closest('.q');
    if(q.classList.contains('ok')) okc++;
    if(q.classList.contains('bad')) badc++;
  });
  var f=page.querySelector('[data-pfill]'), ptxt=page.querySelector('[data-ptxt]'), sc=page.querySelector('[data-score]');
  if(f) f.style.width=(els.length?100*done/els.length:0)+'%';
  if(ptxt) ptxt.textContent=Locale.num(done)+' / '+Locale.num(els.length);
  if(sc) sc.textContent = (okc||badc)
    ? (Locale.t('scoreCorrect').replace('{}',Locale.num(okc)) + (badc?Locale.t('scoreWrong').replace('{}',Locale.num(badc)):''))
    : '';
}
var noAutoScroll=false;
function bindControls(root){
  root.querySelectorAll('[data-reset]').forEach(function(b){
    if(isBound(b)) return;
    b.addEventListener('click',function(){
      var page=document.getElementById('w-'+b.dataset.reset);
      page.querySelectorAll('[data-k]').forEach(function(el){
        if(el.type==='checkbox') el.checked=false; else el.value='';
        var q=el.closest('.q'); q.classList.remove('ok','bad');
        var btn=q.querySelector('.ansbtn'); if(btn) btn.remove();
        var h=q.querySelector('.hint'); if(h) h.hidden=true;
      });
      page.querySelectorAll('.mcqopts input[type=radio]').forEach(function(r){ r.checked=false; });
      updateProg(b.dataset.reset);
    });
  });
  root.querySelectorAll('[data-close]').forEach(function(b){
    if(isBound(b)) return;
    b.addEventListener('click',function(){
      var d=document.getElementById('w-'+b.dataset.close);
      d.removeAttribute('open');
      try{d.scrollIntoView();}catch(e){}
    });
  });
  root.querySelectorAll('[data-print]').forEach(function(b){
    if(isBound(b)) return;
    b.addEventListener('click',function(){
      var others=[];
      noAutoScroll=true;
      document.querySelectorAll('.ws-item[open]').forEach(function(d){
        if(d.id!=='w-'+b.dataset.print){ others.push(d); d.removeAttribute('open'); }
      });
      window.print();
      others.forEach(function(d){ d.setAttribute('open',''); });
      setTimeout(function(){ noAutoScroll=false; },0);
    });
  });
}
bindControls(document);
window.bindControls=bindControls;
/* ---------- تلاوة القرآن (حفظ) — عبر واجهة quranapi.pages.dev، تُربط تلقائيًا بكل ورقة سورة أو آية بناءً على أرقامها ---------- */
var AUDIO_KEY='tahleel-audio';
function audioSettings(){
  try{ var s=JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}'); return {enabled:true, reciter:s.reciter||1}; }
  catch(e){ return {enabled:true, reciter:1}; }
}
window.audioSettings=audioSettings;
var audioCache={};
function fetchJson(url){
  if(audioCache[url]) return audioCache[url];
  audioCache[url]=fetch(url).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; });
  return audioCache[url];
}
var curAudio=null, curBtn=null, curDet=null;
function clearReading(){
  if(curDet) curDet.querySelectorAll('.sheet .verse .aya-seg.reading').forEach(function(el){ el.classList.remove('reading'); });
}
function stopAudio(onlyIfDet){
  if(onlyIfDet && curDet!==onlyIfDet) return; /* أغلقت ورقة أخرى غير التي تُقرأ حاليًا */
  if(curAudio){ curAudio.pause(); curAudio=null; }
  if(curBtn){ curBtn.textContent='🔊 استماع للتلاوة'; curBtn.classList.remove('playing'); curBtn=null; }
  clearReading(); curDet=null;
}
window.stopAudio=stopAudio;
function markReading(ayaNo){
  if(!curDet) return;
  clearReading();
  if(!ayaNo) return; /* الاستعاذة/البسملة: لا آية محددة لتمييزها */
  var seg=curDet.querySelector('.sheet .verse .aya-seg[data-aya="'+ayaNo+'"]');
  if(seg){ seg.classList.add('reading'); try{ seg.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){} }
}
/* البسملة: «بسم الله الرحمن الرحيم» — تُقرأ في مطلع كل سورة (ما عدا التوبة رقم ٩)،
   وكذلك عند بدء آية مختارة من أول السورة. ملفات الآية الأولى لكل سورة لا تتضمّن
   البسملة داخلها (تحقّقنا من ذلك بمقارنة مدد الملفات)، فتُلحَق كمقطع منفصل من
   آية ١ من الفاتحة نفسها — وهي البسملة ذاتها — بنفس صوت القارئ المختار، عبر نفس
   الواجهة (quranapi.pages.dev) دون أي مصدر إضافي. */
function needsBasmala(det){
  var sura=parseInt(det.dataset.surano,10);
  if(!sura||sura===9) return false;
  if(det.dataset.cat==='surah') return true;
  var start=det.dataset.ayalist?parseInt(det.dataset.ayalist.split(',')[0],10):parseInt(det.dataset.ayano,10);
  return start===1;
}
/* تُشغَّل الآيات كملفات منفصلة بالتتابع (لا كصوت سورة كاملة واحد) كي يمكن تمييز الآية الحالية أثناء الاستماع لمساعدة الحفظ */
function playAyaList(items,btn,det){
  if(!items.length){ btn.textContent='🔊 لا يوجد صوت'; setTimeout(function(){ btn.textContent='🔊 استماع للتلاوة'; },1500); return; }
  var i=0, preloaded=null; /* {idx, audio} — ملف الآية التالية يُحمَّل مسبقًا أثناء تشغيل الحالية */
  curAudio=new Audio(); curBtn=btn; curDet=det; btn.textContent='⏸️ إيقاف التلاوة'; btn.classList.add('playing');
  function bindEvents(a){ a.addEventListener('ended', next); a.addEventListener('error', next); }
  /* كل آية تُقرأ كاملة من بدايتها لنهايتها ثم تنتقل تلقائيًا للتالية (حدث ended) —
     هذا سلوك مقصود، لا عطل. العطل الحقيقي هو توقّف التلاوة كلها بسبب تعثّر آية
     واحدة فقط (شبكة بطيئة، انقطاع لحظي...)، فتخطّي تلك الآية والمتابعة للتي
     تليها أفضل من إيقاف الاستماع بالكامل. تلاوة حقيقية بلا فجوات محسوسة تتطلب
     تحميل ملف الآية التالية مسبقًا في الخلفية أثناء تشغيل الحالية (preload)،
     بدل بدء الجلب فقط بعد انتهاء الآية الحالية — فيبدأ الانتقال فورًا لا بعد
     تأخر شبكي جديد في كل مرة. */
  function preloadNext(idx){
    if(idx>=items.length) return;
    var a=new Audio(); bindEvents(a); a.preload='auto'; a.src=items[idx].url;
    try{ a.load(); }catch(e){}
    preloaded={idx:idx, audio:a};
  }
  function next(){
    if(!curAudio||i>=items.length){ stopAudio(); return; }
    var it=items[i];
    var use = (preloaded && preloaded.idx===i) ? preloaded.audio : curAudio;
    i++;
    markReading(it.aya);
    if(use!==curAudio){ curAudio.pause(); curAudio=use; }
    else { curAudio.src=it.url; }
    curAudio.play().catch(next);
    preloaded=null;
    preloadNext(i); /* حمِّل الآية التي تلي هذه فورًا، بينما هذه قيد التشغيل */
  }
  bindEvents(curAudio);
  next();
}
function refreshAudioButtons(){
  var s=audioSettings();
  document.querySelectorAll('[data-audio]').forEach(function(b){
    var det=document.getElementById('w-'+b.dataset.audio);
    var has = det && det.dataset.surano && det.dataset.ayaend==='1' && det.dataset.ayalist;
    b.hidden = !s.enabled || !has;
  });
}
window.refreshAudioButtons=refreshAudioButtons;
function bindAudio(root){
  root.querySelectorAll('[data-audio]').forEach(function(b){
    if(isBound(b)) return;
    b.addEventListener('click',function(){
      if(curBtn===b){ stopAudio(); return; }
      stopAudio();
      var det=document.getElementById('w-'+b.dataset.audio);
      if(!det) return;
      var s=audioSettings(), sura=det.dataset.surano;
      b.textContent='⏳ جاري التحميل...';
      var list=(det.dataset.ayalist?det.dataset.ayalist.split(','):[]).filter(Boolean);
      var basmalaP = needsBasmala(det)
        ? fetchJson('https://quranapi.pages.dev/api/audio/1/1.json').then(function(d){
            var u=d&&d[s.reciter]&&d[s.reciter].url; return u?[{aya:null, url:u}]:[];
          })
        : Promise.resolve([]);
      Promise.all([
        basmalaP,
        Promise.all(list.map(function(a){
          return fetchJson('https://quranapi.pages.dev/api/audio/'+sura+'/'+a+'.json').then(function(d){
            return {aya:a, url:d&&d[s.reciter]&&d[s.reciter].url};
          });
        }))
      ]).then(function(res){
        var basmala=res[0], items=res[1];
        playAyaList(basmala.concat(items.filter(function(it){ return it.url; })), b, det);
      });
    });
  });
}
bindAudio(document);
window.bindAudio=bindAudio;
refreshAudioButtons();
/* ---------- قوائم منبثقة (القارئ/اللغة): حاجز خلفي مشترك واحد لكل التطبيق —
   يُظهره أي زر يفتح قائمة، ويُغلقها النقر عليه، فتبدو كل قائمة منبثقة نافذة
   تطبيق حقيقية بدل قائمة منسدلة عادية، ولا حاجة لتكرار هذا لكل قائمة جديدة. */
var Popover=(function(){
  var backdrop=document.getElementById('popoverBackdrop');
  var current=null;
  function open(panel,btn){
    if(current && current!==panel) close();
    panel.hidden=false; btn.setAttribute('aria-expanded','true');
    if(backdrop) backdrop.hidden=false;
    current=panel;
  }
  function close(){
    if(!current) return;
    current.hidden=true;
    var btn=document.querySelector('[aria-expanded="true"]'); if(btn) btn.setAttribute('aria-expanded','false');
    if(backdrop) backdrop.hidden=true;
    current=null;
  }
  if(backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  return {open:open, close:close};
})();
/* ---------- إعدادات التلاوة العامة: متاحة لكل زائر من شريط الموقع، وليست حكرًا على المدير ---------- */
(function(){
  var btn=document.getElementById('pubAudioBtn'), panel=document.getElementById('pubAudioPanel');
  var sel=document.getElementById('pubAudioReciter');
  if(!btn||!panel||!sel) return;
  var cur=audioSettings();
  sel.value=cur.reciter;
  var save=function(){
    try{ localStorage.setItem(AUDIO_KEY, JSON.stringify({reciter:+sel.value||1})); }catch(e){}
    refreshAudioButtons();
    setTimeout(Popover.close, 450); /* يُغلَق تلقائيًا بعد ضبط الإعداد */
  };
  sel.addEventListener('change',save);
  btn.addEventListener('click',function(){
    if(panel.hidden) Popover.open(panel,btn); else Popover.close();
  });
})();
/* ---------- تبديل الوضع الداكن/الفاتح يدويًا (فوق الاعتماد التلقائي على إعداد الجهاز) ---------- */
(function(){
  var THEME_KEY='tahleel-theme';
  var btn=document.getElementById('themeToggle');
  if(!btn) return;
  var systemDark=function(){
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  };
  var apply=function(t){
    if(t){ document.documentElement.setAttribute('data-theme',t); }
    else { document.documentElement.removeAttribute('data-theme'); }
    var dark = t ? t==='dark' : systemDark();
    btn.textContent = dark ? '☀️' : '🌙';
  };
  var saved=null;
  try{ saved=localStorage.getItem(THEME_KEY); }catch(e){}
  apply(saved);
  btn.addEventListener('click',function(){
    var cur=document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur==='dark' : systemDark();
    var next = dark ? 'light' : 'dark';
    try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
    apply(next);
  });
})();
/* =====================================================================
   Locale — Global State
   واحدة، مصدر الحقيقة الوحيد لكل ما يخص اللغة الحالية في التطبيق. أي جزء
   من الواجهة يقرأ اللغة الحالية أو يترجم نصًّا يمر عبر هذا الكائن، ولا
   يقرأ localStorage أو القاموس مباشرة من مكان آخر. الاستثناء الوحيد
   والدائم: نص القرآن وكلماته (المحفوظة صراحةً بـ data-i18n-word) لا
   تمر عبر Locale إطلاقًا — تبقى عربية دائمًا مهما كانت اللغة المختارة،
   لأنها منسوخة حرفيًا من الآية نفسها لا "مترجمة". ---------------------- */
var Locale = (function(){
  var STORAGE_KEY = 'tahleel-locale';
  /* اللغة الافتراضية عند غياب اختيار محفوظ أو عند طلب كود لغة غير موجود —
     قيمة إعداد واحدة، لا حالة خاصة مكرّرة في كل دالة. */
  var DEFAULT_LOCALE = 'ar';
  var NAMES  = {ar:'العربية',en:'English',ur:'اردو',tr:'Türkçe',ug:'ئۇيغۇرچە',id:'Bahasa Indonesia',fr:'Français',bn:'বাংলা',ha:'Hausa'};
  var DIRS   = {ar:'rtl',en:'ltr',ur:'rtl',tr:'ltr',ug:'rtl',id:'ltr',fr:'ltr',bn:'ltr',ha:'ltr'};
  /* رقم كل لغة الخاص بها — عشرة أرقام مرتّبة ٠..٩؛ العربية وحدها تستخدم
     الأرقام الهندية، وباقي اللغات غربية، لكن التحويل أدناه لا يفضّل أيًّا
     منها: يُترجَم دومًا إلى مجموعة رقم current الحالية أيًّا كانت. */
  var DIGIT_SETS = {ar:'٠١٢٣٤٥٦٧٨٩',en:'0123456789',ur:'0123456789',tr:'0123456789',ug:'0123456789',id:'0123456789',fr:'0123456789',bn:'0123456789',ha:'0123456789'};
  var SRC_DIGITS = DIGIT_SETS.ar; // كل الأرقام في نص القوالب واردة بهذه الصورة أصلًا
  /* خمس لغات، بلا استثناء ولا حالة خاصة للعربية: كل لغة — العربية أيضًا —
     قاموسها الكامل في src/data/i18n/<code>.json، يُقرأ من هنا فقط. لا نص
     احتياطي مُكوَّد يدويًا في الشيفرة، ولا نص يُلتقَط من الصفحة وقت التحميل؛
     مصدر الحقيقة الوحيد لأي نص مترجَم هو ملفات JSON هذه، فلا يفوتها شيء. */
  var catalogs = {}; // {ar:{...}, en:{...}, ur:{...}, tr:{...}, ug:{...}}
  try{ var el=document.getElementById('i18nData'); if(el) catalogs=JSON.parse(el.textContent||'{}')||{}; }catch(e){ catalogs={}; }

  var current = DEFAULT_LOCALE;
  try{ current = localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCALE; }catch(e){}

  /* القاموس الحالي — متغيّر واحد عام يُشتق من اللغة المختارة فقط (current)،
     لا تفضيل ثابت لأي لغة بعينها بما فيها العربية؛ كل قراءة نص في التطبيق
     (t، render، وأي كود مستقبلي) تمر عبر هذه الدالة فقط. */
  function catalog(){ return catalogs[current] || {}; }

  /* ترجمة نص واجهة يُنشأ ديناميكيًا وقت التشغيل (مثل زر إظهار الإجابة) — لا علاقة له بكلمات القرآن */
  function t(key){
    return catalog()[key] || key;
  }
  /* الأرقام قياسية عبر التطبيق كله حسب اللغة المختارة — تُحوَّل دومًا إلى
     مجموعة رقم current من DIGIT_SETS، بلا أي فرع خاص بأي لغة بعينها؛
     الاستثناء الوحيد الثابت يبقى نص القرآن وكلماته، لا الأرقام المحيطة به. */
  function num(s){
    var target = DIGIT_SETS[current] || DIGIT_SETS[DEFAULT_LOCALE];
    return String(s).replace(/[٠-٩]/g,function(d){ return target[SRC_DIGITS.indexOf(d)]; });
  }
  /* أهي سلسلة أرقام هندية بحتة (لا حرف عربي فيها)؟ فقط حينئذٍ يجوز تحويلها —
     أي كلمة قرآنية فعلية بين القوسين (تُحفظ حرفيًا) لن تطابق هذا أبدًا */
  function isDigits(s){ return /^[٠-٩]+$/.test(s); }
  /* معرّف مستقر ومحايد اللغة، مُشتق من أي نص عربي (قالب سؤال، مصطلح، اسم سورة) —
     نفس خوارزمية tid في build.js حرفيًا؛ يُستخدَم كمفتاح بحث في tpl/term/sura
     بدل النص العربي نفسه، فلا يبقى نص عربي كمفتاح بحث وقت التشغيل. يعمل
     بالتساوي على الكلمات المُضافة وقت البناء أو المُضافة لاحقًا من صفحة المدير،
     لأن الحساب يتم هنا وقت العرض لا وقت البناء فقط. */
  function tid(s){
    var h=5381;
    for(var i=0;i<s.length;i++){ h=((h*33)^s.charCodeAt(i))>>>0; }
    return 't'+h.toString(36);
  }

  function render(){
    /* كل لغة — بما فيها العربية — تُقرأ من نفس catalog() العامة، لا تفضيل
       لأي لغة بعينها في منطق القراءة نفسه */
    var cat = catalog();
    document.documentElement.setAttribute('lang', current);
    document.documentElement.setAttribute('dir', DIRS[current]||DIRS[DEFAULT_LOCALE]);
    document.querySelectorAll('[data-i18n]').forEach(function(node){
      var k=node.dataset.i18n;
      if(cat[k]) node.textContent = cat[k];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(node){
      var k=node.dataset.i18nPh;
      if(cat[k]) node.setAttribute('placeholder', cat[k]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function(node){
      var k=node.dataset.i18nAria;
      if(cat[k]) node.setAttribute('aria-label', cat[k]);
    });
    /* أسئلة الأوراق (وعناوين الأقسام والمعلومات وعدد الأسئلة، المدمَجة في نفس
       القاموس): تُترجَم الصياغة المحيطة عبر قاموس القوالب، بينما تبقى الكلمة/
       الحرف القرآني المحفوظ في data-i18n-word عربيًا حرفيًا كما ورد في نص
       السؤال الأصلي — لا يُعاد كتابته أبدًا مهما كانت اللغة، فيُستبعد أي
       احتمال خطأ في نقله. ما لا يملك ترجمة قالب معروفة يبقى بعربيته الأصلية
       تلقائيًا (تدهور سلس، لا نص مفقود). */
    var tpl = cat && cat.tpl, terms = cat && cat.term, suraDict = cat && cat.sura;
    /* قاموس اللغة الافتراضية، يُستخدَم فقط حين لا تملك اللغة الحالية ترجمة
       لمعرّف بعينه (نادر عمليًا) — بديل معروض، لا نص عربي مكتوب مباشرة في
       الشيفرة، فيبقى المصدر الوحيد للنص هو ملفات JSON دومًا. */
    var fallbackCat = catalogs[DEFAULT_LOCALE] || {};
    var fbTpl = fallbackCat.tpl, fbTerms = fallbackCat.term, fbSura = fallbackCat.sura;
    document.querySelectorAll('[data-i18n-tpl]').forEach(function(node){
      var key=node.dataset.i18nTpl, word=node.dataset.i18nWord;
      var phrase = (tpl && tpl[key]) || (fbTpl && fbTpl[key]);
      /* لا ترجمة معروفة لهذا القالب في أي قاموس (لا الحالي ولا الافتراضي) —
         يبقى النص العربي المطبوع وقت البناء كما هو دون تغيير، بدل عرض معرّف
         مجرّد لا معنى له للمستخدم؛ تدهور سلس حقيقي، لا نص مفقود ولا نص مكسور. */
      if(!phrase) return;
      /* بعض الكلمات بين القوسين ليست منقولة من نص الآية بل مصطلحات لغوية عامة
         (كـ«شدّة» أو «تنوين ضم») أو اسم سورة (كموقع الآية "من سورة X") يمكن
         ترجمتها كسائر النص؛ تُترجَم هذه فقط إن وُجدت في قاموس معروف (بحثًا
         بمعرّف مشتق من الكلمة عبر tid، لا بالكلمة العربية نفسها) — أي كلمة
         أخرى غير مدرَجة فيهما تُعامَل بحذر بصفتها كلمة قرآنية فعلية وتبقى
         عربية حرفيًا كما وردت. */
      var wid = word!==undefined ? tid(word) : null;
      var sub = word!==undefined ? ((terms && terms[wid]) || (suraDict && suraDict[wid]) || (isDigits(word) ? num(word) : word)) : null;
      node.textContent = word!==undefined ? phrase.replace('{}', sub) : phrase;
    });
    /* أي رقم عرضته الصفحة وقت البناء (شارات الأقسام، عدّاد المستويات...) */
    document.querySelectorAll('[data-i18n-num]').forEach(function(node){
      node.textContent = num(node.dataset.i18nNum);
    });
    /* أسماء السور داخل عنوان الورقة — على عكس كلمات الأسئلة، اسم السورة نفسه
       يُترجَم (له اسم معروف بكل لغة)، فقط نص القرآن وكلماته يبقى عربيًا دائمًا. */
    document.querySelectorAll('[data-i18n-name]').forEach(function(node){
      var ar=node.dataset.i18nName, nid=tid(ar);
      node.textContent = (suraDict && suraDict[nid]) || (fbSura && fbSura[nid]) || ar;
    });
    var lbl=document.getElementById('langBtnLabel'); if(lbl) lbl.textContent=NAMES[current]||NAMES[DEFAULT_LOCALE];
  }

  function set(code){
    current = catalogs[code] ? code : DEFAULT_LOCALE;
    try{ localStorage.setItem(STORAGE_KEY, current); }catch(e){}
    render();
  }

  render(); // أول عرض عند تحميل الصفحة، بحسب ما كان محفوظًا سابقًا (أو العربية افتراضيًا)

  return { get current(){ return current; }, set: set, t: t, render: render, num: num, isDigits: isDigits, tid: tid, NAMES: NAMES, DIRS: DIRS };
})();
window.Locale=Locale;
/* توافق خلفي: بقية الشيفرة (وربما ملحقات مستقبلية) تنادي t() مباشرة */
function t(key){ return Locale.t(key); }
(function(){
  var btn=document.getElementById('langBtn'), panel=document.getElementById('langPanel');
  if(!btn||!panel) return;
  panel.querySelectorAll('.lang-opt').forEach(function(o){
    o.addEventListener('click',function(){
      Locale.set(o.dataset.lang);
      Popover.close();
    });
  });
  btn.addEventListener('click',function(){
    if(panel.hidden) Popover.open(panel,btn); else Popover.close();
  });
})();
/* ---------- شريط علوي لاصق: قياس ارتفاعه الفعلي لضبط الإزاحات ---------- */
var topbar=document.querySelector('.topbar');
function syncTopbar(){
  if(!topbar) return;
  var h=Math.round(topbar.getBoundingClientRect().height);
  var fixed=getComputedStyle(topbar).position!=='static';
  document.documentElement.style.setProperty('--topbar-h',(fixed?h:0)+'px');
}
syncTopbar();
window.addEventListener('resize',syncTopbar);
window.addEventListener('orientationchange',syncTopbar);
if(window.ResizeObserver&&topbar){ try{ new ResizeObserver(syncTopbar).observe(topbar); }catch(e){} }
/* ---------- فتح/إغلاق الورقة: تحديث الوسم والتمرير إليها ---------- */
function bindToggles(root){
  root.querySelectorAll('.ws-item').forEach(function(d){
    if(isBound(d)) return;
    var setGoLabel=function(){
      var go=d.querySelector('.cmeta .go');
      if(go) go.textContent = d.open ? t('closeWsToggle') : t('openWsToggle');
    };
    setGoLabel();
    d.addEventListener('toggle',function(){
      setGoLabel();
      if(!d.open && window.stopAudio) window.stopAudio(d);
      if(d.open && !noAutoScroll){
        document.querySelectorAll('.grid .ws-item[open]').forEach(function(o){
          if(o!==d) o.removeAttribute('open');
        });
        var raf=window.requestAnimationFrame||function(f){return setTimeout(f,16);};
        raf(function(){ try{ d.scrollIntoView({block:'start'}); }catch(e){} });
      }
    });
  });
}
bindToggles(document);
window.bindToggles=bindToggles;
/* تهيئة ورقة أُضيفت في وقت التشغيل (من صفحة المدير) */
window.bindSheet=function(root){
  bindAnswers(root); bindControls(root); bindToggles(root);
};
var filter='all';
function applyFilter(){
  var q=(document.getElementById('q')||{}).value||'';
  document.querySelectorAll('.grid .ws-item').forEach(function(c){
    var catOk = filter==='all' || (filter==='story' ? c.dataset.story==='1' : c.dataset.cat===filter);
    var ok=catOk&&(!q||c.dataset.name.indexOf(q.trim())>-1);
    c.style.display=ok?'':'none';
  });
}
document.querySelectorAll('.tabs:not(.lvl-tabs) button').forEach(function(b){
  b.addEventListener('click',function(){
    filter=b.dataset.f;
    document.querySelectorAll('.tabs:not(.lvl-tabs) button').forEach(function(x){x.classList.toggle('on',x===b);});
    applyFilter();
  });
});
var qi=document.getElementById('q'); if(qi) qi.addEventListener('input',applyFilter);
/* ---------- تصفية الأسئلة حسب المستوى: إخفاء أي مستوى غير المختار ---------- */
var lvlFilter='all';
function applyLvlFilter(){
  document.querySelectorAll('.q[data-lvl]').forEach(function(el){
    el.style.display=(lvlFilter==='all'||el.dataset.lvl===lvlFilter)?'':'none';
  });
  document.querySelectorAll('.lvl-legend .lvl').forEach(function(el){
    var m=el.className.match(/lvl-(\d)/);
    el.style.display=(lvlFilter==='all'||!m||m[1]===lvlFilter)?'':'none';
  });
}
document.querySelectorAll('.lvl-tabs button').forEach(function(b){
  b.addEventListener('click',function(){
    lvlFilter=b.dataset.lf;
    document.querySelectorAll('.lvl-tabs button').forEach(function(x){x.classList.toggle('on',x===b);});
    applyLvlFilter();
  });
});
window.applyLvlFilter=applyLvlFilter;
/* ---------- إخفاء نصوص التلميح داخل الحقول عند الطباعة/التصدير PDF ----------
   الاعتماد على CSS وحده (::placeholder{color:transparent}) غير موثوق في كل
   المتصفحات عند الطباعة أو التصدير PDF (كروم أحيانًا يتجاهله) — فنزيل خاصية
   placeholder فعليًا قبل الطباعة ونعيدها بعدها، ليبقى الحقل فارغًا تمامًا على الورق. */
window.addEventListener('beforeprint',function(){
  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(function(el){
    el.dataset.phSaved=el.getAttribute('placeholder');
    el.removeAttribute('placeholder');
  });
});
window.addEventListener('afterprint',function(){
  document.querySelectorAll('[data-ph-saved]').forEach(function(el){
    el.setAttribute('placeholder',el.dataset.phSaved);
    delete el.dataset.phSaved;
  });
});
/* تظهر الصفحة الآن فقط — بعد تطبيق اللغة والوضع الداكن/الفاتح المحفوظين
   بالكامل (Locale.render() والوضع أُعدّا بالفعل أعلاه في هذا السكربت نفسه).
   قبل هذا السطر بقيت الصفحة مخفية عبر القاعدة في <head> (منع "الوميض" —
   عرض المحتوى الافتراضي (عربي/فاتح) للحظة ثم استبداله باللغة/الوضع
   المحفوظين، وهو بالضبط ما كان يظهر كصفحتين متتاليتين عند إعادة التحميل).
   نفس المبدأ يمتد للخطوط: Google Fonts تُحمَّل بـ display=swap، أي أن
   المتصفح يعرض خط النظام الاحتياطي فورًا ثم "يستبدله" بالخط الحقيقي فور
   اكتمال تحميله — وهذا بالضبط ما كان يبدو وكأن "ملف CSS آخر" يُطبَّق بعد
   التحديث (خصوصًا حين لا تكون الخطوط في ذاكرة التخزين المؤقت بعد). ننتظر
   جهوزية الخطوط (document.fonts.ready) قبل الكشف عن الصفحة أيضًا، بحدّ
   أقصى قصير كي لا تتجمّد الصفحة إن تعذّر تحميل الخطوط لأي سبب. */
function reveal(){ document.documentElement.setAttribute('data-ready','1'); }
if(document.fonts && document.fonts.ready){
  var revealed=false;
  var doReveal=function(){ if(revealed) return; revealed=true; reveal(); };
  document.fonts.ready.then(doReveal).catch(doReveal);
  setTimeout(doReveal, 400); /* لا تنتظر أكثر من هذا حتى لا يبدو التطبيق بطيئًا */
} else {
  reveal();
}
