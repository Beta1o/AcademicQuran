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
  if(ok===null){ if(el.dataset.show) revealBtn(q,el,'إظهار الإجابة النموذجية'); return; }
  q.classList.add(ok?'ok':'bad');
  if(!ok && el.dataset.show && showAnswerOnMistake()) revealBtn(q,el,'إظهار الإجابة الصحيحة');
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
    h.textContent='الإجابة: '+el.dataset.show; h.hidden=false; b.remove();
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
  var f=page.querySelector('[data-pfill]'), t=page.querySelector('[data-ptxt]'), sc=page.querySelector('[data-score]');
  if(f) f.style.width=(els.length?100*done/els.length:0)+'%';
  if(t) t.textContent=done+' / '+els.length;
  if(sc) sc.textContent = (okc||badc)? ('صحيح: '+okc+(badc?' — خطأ: '+badc:'')) : '';
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
  try{ var s=JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}'); return {enabled:s.enabled!==false, reciter:s.reciter||1}; }
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
  if(curDet) curDet.querySelectorAll('.aya-seg.reading').forEach(function(el){ el.classList.remove('reading'); });
}
function stopAudio(){
  if(curAudio){ curAudio.pause(); curAudio=null; }
  if(curBtn){ curBtn.textContent='🔊 استماع للتلاوة'; curBtn.classList.remove('playing'); curBtn=null; }
  clearReading(); curDet=null;
}
function markReading(ayaNo){
  if(!curDet) return;
  clearReading();
  var seg=curDet.querySelector('.aya-seg[data-aya="'+ayaNo+'"]');
  if(seg){ seg.classList.add('reading'); try{ seg.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){} }
}
/* تُشغَّل الآيات كملفات منفصلة بالتتابع (لا كصوت سورة كاملة واحد) كي يمكن تمييز الآية الحالية أثناء الاستماع لمساعدة الحفظ */
function playAyaList(items,btn,det){
  if(!items.length){ btn.textContent='🔊 لا يوجد صوت'; setTimeout(function(){ btn.textContent='🔊 استماع للتلاوة'; },1500); return; }
  var i=0;
  curAudio=new Audio(); curBtn=btn; curDet=det; btn.textContent='⏸️ إيقاف التلاوة'; btn.classList.add('playing');
  function next(){
    if(!curAudio||i>=items.length){ stopAudio(); return; }
    var it=items[i]; i++;
    markReading(it.aya);
    curAudio.src=it.url;
    curAudio.play().catch(function(){ stopAudio(); });
  }
  curAudio.addEventListener('ended', next);
  next();
}
function refreshAudioButtons(){
  var s=audioSettings();
  document.querySelectorAll('[data-audio]').forEach(function(b){
    var det=document.getElementById('w-'+b.dataset.audio);
    var has = det && det.dataset.surano && (det.dataset.cat==='surah' ? det.dataset.ayat : (det.dataset.ayalist || det.dataset.ayano));
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
      var list;
      if(det.dataset.cat==='surah'){
        var n=parseInt(det.dataset.ayat,10)||0;
        list=Array.from({length:n},function(_,i){ return i+1; });
      } else {
        list=(det.dataset.ayalist?det.dataset.ayalist.split(','):[det.dataset.ayano]).filter(Boolean);
      }
      Promise.all(list.map(function(a){
        return fetchJson('https://quranapi.pages.dev/api/audio/'+sura+'/'+a+'.json').then(function(d){
          return {aya:a, url:d&&d[s.reciter]&&d[s.reciter].url};
        });
      })).then(function(items){
        playAyaList(items.filter(function(it){ return it.url; }), b, det);
      });
    });
  });
}
bindAudio(document);
window.bindAudio=bindAudio;
refreshAudioButtons();
/* ---------- بيانات الباحث: حقول عامة تُحفظ وتُطبَّق على كل الأوراق ---------- */
var META_KEY='tahleel-meta', META={};
try{ META=JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}; }catch(e){ META={}; }
function applyMeta(root){
  (root||document).querySelectorAll('[data-mf]').forEach(function(el){
    var v=META[el.dataset.mf];
    if(v!==undefined && el.value!==v) el.value=v;
  });
}
function bindMeta(root){
  root.querySelectorAll('[data-mf]').forEach(function(el){
    if(isBound(el)) return;
    el.addEventListener('input',function(){
      var k=el.dataset.mf; META[k]=el.value;
      document.querySelectorAll('[data-mf="'+k+'"]').forEach(function(o){ if(o!==el) o.value=el.value; });
      try{ localStorage.setItem(META_KEY, JSON.stringify(META)); }catch(e){}
    });
  });
  applyMeta(root);
}
bindMeta(document);
window.bindMeta=bindMeta;
window.applyMeta=applyMeta;
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
      if(go) go.textContent = d.open ? 'إغلاق الورقة ▴' : 'افتح الورقة ▾';
    };
    setGoLabel();
    d.addEventListener('toggle',function(){
      setGoLabel();
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
  bindAnswers(root); bindControls(root); bindMeta(root); bindToggles(root);
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
