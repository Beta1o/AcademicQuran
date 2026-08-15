/* الوسم document.documentElement.classList.add('js') انتقل إلى سكربت مبكر
   في <head> (انظر build.js) — إضافته هنا (نهاية الصفحة كما كانت) كانت تعني
   ظهور عناصر .js-only (أشرطة التصفية، أزرار الصوت...) متأخرًا بعد رسم الصفحة
   كاملة أول مرة، فتظهر ومضة صفحة "عارية" قبل اكتمالها — بالضبط ما اشتكى منه
   المستخدم عند كل إعادة تحميل. */
var SUN='تثدذرزسشصضطظلن';
var DIAC=/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]/g;
function norm(s){return String(s).replace(DIAC,'').replace(/[﴿﴾«»()،:؟\.!+\-]/g,'').replace(/[ٱآأإ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();}
function toInt(s){ s=String(s).trim().replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}); var n=parseInt(s,10); return isNaN(n)?null:n; }
var WORDS={};
function registerWords(root){
  root.querySelectorAll('.ws-item').forEach(function(d){
    try{ WORDS[d.id.slice(2)]=JSON.parse(d.dataset.words); }catch(e){ WORDS[d.id.slice(2)]=[]; }
  });
}
registerWords(document);
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
/* ---------- Quran recitation (memorization aid) — via everyayah.com, wired automatically to any surah/ayah worksheet based on its surah/ayah numbers ---------- */
var AUDIO_KEY='tahleel-audio';
function audioSettings(){
  try{ var s=JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}'); return {enabled:true, reciter:s.reciter||21}; }
  catch(e){ return {enabled:true, reciter:21}; }
}
window.audioSettings=audioSettings;
var audioCache={};
function fetchJson(url){
  if(audioCache[url]) return audioCache[url];
  audioCache[url]=fetch(url).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; });
  return audioCache[url];
}
/* everyayah.com hosts one mp3 per ayah under each reciter's folder, named
   with the surah number then the ayah number, each zero-padded to 3 digits
   (e.g. 001001.mp3 for Fatiha ayah 1) — no lookup request needed, the URL
   is built directly. */
/* Each reciter has two verified bitrate folders on everyayah.com (a lighter
   ~64kbps one and a fuller 128/192kbps one) — instead of listing both as
   separate confusing entries, one clean name is shown per reciter and the
   right tier is picked automatically from the visitor's measured connection
   quality (navigator.connection), same idea as adaptive video streaming. */
var RECITER_FOLDER={
  7:{hi:'Alafasy_128kbps',lo:'Alafasy_64kbps'},
  1:{hi:'Abdul_Basit_Mujawwad_128kbps',lo:'Abdul_Basit_Mujawwad_128kbps'},
  2:{hi:'Abdul_Basit_Murattal_192kbps',lo:'Abdul_Basit_Murattal_64kbps'},
  3:{hi:'Abdurrahmaan_As-Sudais_192kbps',lo:'Abdurrahmaan_As-Sudais_64kbps'},
  4:{hi:'Abu_Bakr_Ash-Shaatree_128kbps',lo:'Abu_Bakr_Ash-Shaatree_64kbps'},
  5:{hi:'Hani_Rifai_192kbps',lo:'Hani_Rifai_64kbps'},
  6:{hi:'Husary_128kbps',lo:'Husary_64kbps'},
  12:{hi:'Husary_Muallim_128kbps',lo:'Husary_Muallim_128kbps'},
  8:{hi:'Minshawy_Mujawwad_192kbps',lo:'Minshawy_Mujawwad_64kbps'},
  9:{hi:'Minshawy_Murattal_128kbps',lo:'Minshawy_Murattal_128kbps'},
  10:{hi:'Saood_ash-Shuraym_128kbps',lo:'Saood_ash-Shuraym_64kbps'},
  11:{hi:'Mohammad_al_Tablaway_128kbps',lo:'Mohammad_al_Tablaway_64kbps'},
  13:{hi:'Ghamadi_40kbps',lo:'Ghamadi_40kbps'},
  14:{hi:'Hudhaify_128kbps',lo:'Hudhaify_32kbps'},
  15:{hi:'Ibrahim_Akhdar_32kbps',lo:'Ibrahim_Akhdar_32kbps'},
  16:{hi:'MaherAlMuaiqly128kbps',lo:'Maher_AlMuaiqly_64kbps'},
  17:{hi:'Muhammad_Ayyoub_128kbps',lo:'Muhammad_Ayyoub_32kbps'},
  18:{hi:'Muhammad_Jibreel_128kbps',lo:'Muhammad_Jibreel_64kbps'},
  19:{hi:'Mustafa_Ismail_48kbps',lo:'Mustafa_Ismail_48kbps'},
  20:{hi:'Muhsin_Al_Qasim_192kbps',lo:'Muhsin_Al_Qasim_192kbps'},
  21:{hi:'Salah_Al_Budair_128kbps',lo:'Salah_Al_Budair_128kbps'},
  22:{hi:'Khaalid_Abdullaah_al-Qahtaanee_192kbps',lo:'Khaalid_Abdullaah_al-Qahtaanee_192kbps'},
  23:{hi:'Yasser_Ad-Dussary_128kbps',lo:'Yasser_Ad-Dussary_128kbps'},
  24:{hi:'Nasser_Alqatami_128kbps',lo:'Nasser_Alqatami_128kbps'},
  25:{hi:'Ayman_Sowaid_64kbps',lo:'Ayman_Sowaid_64kbps'},
  26:{hi:'Abdullah_Basfar_192kbps',lo:'Abdullah_Basfar_32kbps'},
  27:{hi:'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',lo:'Ahmed_ibn_Ali_al-Ajamy_64kbps_QuranExplorer.Com'},
  28:{hi:'Husary_128kbps_Mujawwad',lo:'Husary_Mujawwad_64kbps'},
  29:{hi:'Menshawi_32kbps',lo:'Menshawi_16kbps'},
  30:{hi:'Salaah_AbdulRahman_Bukhatir_128kbps',lo:'Salaah_AbdulRahman_Bukhatir_128kbps'},
  31:{hi:'Abdullaah_3awwaad_Al-Juhaynee_128kbps',lo:'Abdullaah_3awwaad_Al-Juhaynee_128kbps'},
  32:{hi:'Abdullah_Matroud_128kbps',lo:'Abdullah_Matroud_128kbps'},
  33:{hi:'mahmoud_ali_al_banna_32kbps',lo:'mahmoud_ali_al_banna_32kbps'},
  34:{hi:'Ali_Jaber_64kbps',lo:'Ali_Jaber_64kbps'},
  35:{hi:'Fares_Abbad_64kbps',lo:'Fares_Abbad_64kbps'},
  36:{hi:'Ahmed_Neana_128kbps',lo:'Ahmed_Neana_128kbps'},
  37:{hi:'Muhammad_AbdulKareem_128kbps',lo:'Muhammad_AbdulKareem_128kbps'},
  38:{hi:'khalefa_al_tunaiji_64kbps',lo:'khalefa_al_tunaiji_64kbps'},
  39:{hi:'Karim_Mansoori_40kbps',lo:'Karim_Mansoori_40kbps'},
  40:{hi:'Ali_Hajjaj_AlSuesy_128kbps',lo:'Ali_Hajjaj_AlSuesy_128kbps'},
  41:{hi:'Sahl_Yassin_128kbps',lo:'Sahl_Yassin_128kbps'},
  42:{hi:'aziz_alili_128kbps',lo:'aziz_alili_128kbps'},
  43:{hi:'Yaser_Salamah_128kbps',lo:'Yaser_Salamah_128kbps'},
  44:{hi:'Akram_AlAlaqimy_128kbps',lo:'Akram_AlAlaqimy_128kbps'}
};
function useLowQuality(){
  try{
    var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    if(!c) return false;
    if(c.saveData) return true;
    if(c.effectiveType && /2g/.test(c.effectiveType)) return true;
    if(typeof c.downlink==='number' && c.downlink>0 && c.downlink<1.2) return true;
  }catch(e){}
  return false;
}
function ayaAudioUrl(reciter, sura, aya){
  var tiers=RECITER_FOLDER[reciter]||RECITER_FOLDER[21];
  var folder=useLowQuality()?tiers.lo:tiers.hi;
  var s=('000'+sura).slice(-3), a=('000'+aya).slice(-3);
  return Promise.resolve('https://everyayah.com/data/'+folder+'/'+s+a+'.mp3');
}
var curAudio=null, curBtn=null, curDet=null, curSeg=null;
/* تكرار: يُعيد تشغيل نفس قائمة الآيات الحالية من جديد بدل التوقف عند
   نهايتها — يفيد ترديد آية واحدة (أو الورقة كلها) مرارًا أثناء الحفظ،
   بدل الضغط يدويًا في كل مرة. حالة عامة واحدة كافية، لأن ورقة واحدة فقط
   تُشغَّل صوتيًا في أي وقت. */
var repeatMode=false, repeatBtn=null;
function bindRepeatToggle(root){
  root.querySelectorAll('[data-repeat]').forEach(function(b){
    if(isBound(b)) return;
    b.addEventListener('click', function(){
      repeatMode=!repeatMode;
      document.querySelectorAll('[data-repeat]').forEach(function(x){ x.classList.toggle('on', repeatMode && x===b); });
      repeatBtn = repeatMode ? b : null;
    });
  });
}
bindRepeatToggle(document);
window.bindRepeatToggle=bindRepeatToggle;
function clearReading(){
  if(curDet) curDet.querySelectorAll('.sheet .verse .aya-seg.reading').forEach(function(el){ el.classList.remove('reading'); });
  curSeg=null;
}
function stopAudio(onlyIfDet){
  if(onlyIfDet && curDet!==onlyIfDet) return; /* a different worksheet closed, not the one currently playing */
  if(curAudio){ curAudio.pause(); curAudio=null; }
  if(curBtn){ curBtn.textContent='🔊 استماع للتلاوة'; curBtn.classList.remove('playing'); curBtn=null; }
  clearReading(); curDet=null;
}
function fullStopAudio(){
  stopAudio();
  repeatMode=false;
  if(repeatBtn) repeatBtn.classList.remove('on');
  repeatBtn=null;
}
window.fullStopAudio=fullStopAudio;
window.stopAudio=stopAudio;
/* Word-level highlighting was removed: the audio source only provides
   per-ayah files with no real per-word timestamps, so any word-level
   position was always an estimate from text length — and it was wrong
   often enough (especially when a reciter repeats a word) that it did more
   harm than good. Ayah-level highlighting below is fully accurate, since it
   is driven by real audio file boundaries, not an estimate. */
function markReading(ayaNo){
  if(!curDet) return;
  clearReading();
  if(!ayaNo) return;
  var seg=curDet.querySelector('.sheet .verse .aya-seg[data-aya="'+ayaNo+'"]');
  if(seg){
    seg.classList.add('reading'); curSeg=seg;
    try{ seg.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){}
  }
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
    if(!curAudio) return;
    if(i>=items.length){
      if(repeatMode){ i=0; preloaded=null; } else { stopAudio(); return; }
    }
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
/* root اختياري: بلا تحديد تفحص كل زر صوت في الصفحة (بعد تغيّر إعداد عام،
   مثل تفعيل/تعطيل الصوت) — بتحديده (عنصر ورقة واحدة) تفحص زرَّيها فقط. فتح
   ورقة واحدة لا يحتاج مطلقًا مسح المستند كله بحثًا عن كل زر صوت موجود؛ ذلك
   المسح الكامل يتكرر مع فتح كل ورقة أثناء التحميل الجماعي (صفحة المدير،
   فحوصات الاختبار) فيصبح كلفة تربيعية فعليًا — تتسع كلما كبرت الشجرة
   المعروضة بالفعل — وهو ما كان يُجمِّد الصفحة عند فتح لوحة المدير. */
function refreshAudioButtons(root){
  var s=audioSettings();
  var scope = root || document;
  scope.querySelectorAll('[data-audio]').forEach(function(b){
    var det=document.getElementById('w-'+b.dataset.audio);
    var has = det && det.dataset.surano && det.dataset.ayaend==='1' && det.dataset.ayalist;
    b.hidden = !s.enabled || !has;
  });
  scope.querySelectorAll('[data-repeat]').forEach(function(b){
    var det=document.getElementById('w-'+b.dataset.repeat);
    var has = det && det.dataset.surano && det.dataset.ayaend==='1' && det.dataset.ayalist;
    b.hidden = !s.enabled || !has;
  });
}
window.refreshAudioButtons=refreshAudioButtons;
/* Isti'adhah ("أعوذ بالله من الشيطان الرجيم") is audio-only — no text card on
   the worksheet — played from the locally-hosted audios/istiadhah.mp3 file
   before the first ayah, only when the admin has it enabled (audio-settings
   panel checkbox, persisted alongside the other admin settings). */
function istiadhahEnabled(){
  try{ var s=JSON.parse(localStorage.getItem('tahleel-settings')||'{}'); return s.istiadhahEnabled!==false; }
  catch(e){ return true; }
}
/* Basmalah ("بسم الله الرحمن الرحيم") is recited before every surah except
   Tawbah (9), and before any worksheet starting at ayah 1 of its surah. No
   separate audio source is used for it — Al-Fatiha's ayah 1 *is* the
   Basmalah verbatim, so the same reciter's 001001.mp3 (already fetched via
   ayaAudioUrl for any Fatiha worksheet) is reused here directly, keeping it
   in the same reciter's voice as the rest of the recitation. Fatiha itself
   is excluded — its own ayah 1 already *is* this audio, so prepending it
   again would just repeat the same line twice. */
function needsBasmala(det){
  var sura=parseInt(det.dataset.surano,10);
  if(!sura||sura===9||sura===1) return false;
  if(det.dataset.cat==='surah') return true;
  var start=det.dataset.ayalist?parseInt(det.dataset.ayalist.split(',')[0],10):parseInt(det.dataset.ayano,10);
  return start===1;
}
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
      Promise.all(list.map(function(a){
        return ayaAudioUrl(s.reciter,sura,a).then(function(u){ return {aya:a, url:u}; });
      })).then(function(items){
        var playable=items.filter(function(it){ return it.url; });
        var withBasmala=needsBasmala(det)
          ? ayaAudioUrl(s.reciter,1,1).then(function(u){ return u?[{aya:null,url:u}].concat(playable):playable; })
          : Promise.resolve(playable);
        withBasmala.then(function(full){
          if(istiadhahEnabled()) full=[{aya:null, url:'audios/istiadhah.mp3'}].concat(full);
          playAyaList(full, b, det);
        });
      });
    });
  });
}
bindAudio(document);
window.bindAudio=bindAudio;
refreshAudioButtons();
/* إعادة قراءة آية بعينها — يفيد المتعلم الذي يريد تكرار آية واحدة لحفظها
   بدل الاستماع للورقة كلها من البداية؛ النقر على أي جزء من نص الآية (كلمة
   أو الآية كاملة) يشغّل ملف صوت تلك الآية وحدها فورًا، ويُبقي تمييز الآية
   والكلمة (تتبّع القراءة) يعمل كالمعتاد أثناء تشغيلها. */
function replayAya(det, ayaNo){
  var s=audioSettings(), sura=det.dataset.surano;
  if(!sura||!ayaNo) return;
  stopAudio();
  ayaAudioUrl(s.reciter,sura,ayaNo).then(function(url){
    if(!url) return;
    var btn=det.querySelector('[data-audio]');
    playAyaList([{aya:ayaNo, url:url}], btn||{textContent:'',classList:{add:function(){},remove:function(){}}}, det);
  });
}
/* Clicking anywhere in an ayah replays that ayah — useful for repeating one
   verse while memorizing without listening to the whole worksheet again. */
function bindReplay(root){
  root.querySelectorAll('.sheet .verse').forEach(function(v){
    if(isBound(v)) return;
    v.classList.add('replayable');
    v.addEventListener('click', function(e){
      var seg=e.target.closest('.aya-seg');
      if(!seg) return;
      var det=v.closest('.ws-item');
      if(!det || !det.dataset.surano || !det.dataset.ayaend) return;
      replayAya(det, seg.dataset.aya);
    });
  });
}
bindReplay(document);
window.bindReplay=bindReplay;
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
  var opts=document.getElementById('reciterOpts');
  if(!btn||!panel||!opts) return;
  var cur=audioSettings();
  opts.querySelectorAll('.reciter-opt').forEach(function(o){
    o.classList.toggle('on', +o.dataset.reciter===+cur.reciter);
  });
  opts.querySelectorAll('.reciter-opt').forEach(function(o){
    o.addEventListener('click',function(){
      try{ localStorage.setItem(AUDIO_KEY, JSON.stringify({reciter:+o.dataset.reciter||21})); }catch(e){}
      opts.querySelectorAll('.reciter-opt').forEach(function(x){ x.classList.toggle('on',x===o); });
      refreshAudioButtons();
      setTimeout(Popover.close, 300); /* يُغلَق تلقائيًا بعد اختيار القارئ */
    });
  });
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
  var NAMES  = {ar:'العربية',en:'English',ur:'اردو',tr:'Türkçe',ug:'ئۇيغۇرچە',id:'Bahasa Indonesia/Melayu',fr:'Français',bn:'বাংলা',ha:'Hausa',fa:'فارسی',ml:'മലയാളം',sw:'Kiswahili',hi:'हिन्दी',es:'Español',ru:'Русский',zh:'中文',so:'Soomaali',ps:'پښتو'};
  var DIRS   = {ar:'rtl',en:'ltr',ur:'rtl',tr:'ltr',ug:'rtl',id:'ltr',fr:'ltr',bn:'ltr',ha:'ltr',fa:'rtl',ml:'ltr',sw:'ltr',hi:'ltr',es:'ltr',ru:'ltr',zh:'ltr',so:'ltr',ps:'rtl'};
  /* رقم كل لغة الخاص بها — عشرة أرقام مرتّبة ٠..٩؛ العربية والفارسية وحدهما
     تستخدمان أرقامًا غير غربية، وباقي اللغات غربية، لكن التحويل أدناه لا
     يفضّل أيًّا منها: يُترجَم دومًا إلى مجموعة رقم current الحالية أيًّا كانت. */
  var DIGIT_SETS = {ar:'٠١٢٣٤٥٦٧٨٩',en:'0123456789',ur:'0123456789',tr:'0123456789',ug:'0123456789',id:'0123456789',fr:'0123456789',bn:'0123456789',ha:'0123456789',fa:'۰۱۲۳۴۵۶۷۸۹',ml:'0123456789',sw:'0123456789',hi:'0123456789',es:'0123456789',ru:'0123456789',zh:'0123456789',so:'0123456789',ps:'۰۱۲۳۴۵۶۷۸۹'};
  var SRC_DIGITS = DIGIT_SETS.ar; // كل الأرقام في نص القوالب واردة بهذه الصورة أصلًا
  /* خمس لغات، بلا استثناء ولا حالة خاصة للعربية: كل لغة — العربية أيضًا —
     قاموسها الكامل في src/data/i18n/<code>.json، يُقرأ من هنا فقط. لا نص
     احتياطي مُكوَّد يدويًا في الشيفرة، ولا نص يُلتقَط من الصفحة وقت التحميل؛
     مصدر الحقيقة الوحيد لأي نص مترجَم هو ملفات JSON هذه، فلا يفوتها شيء. */
  var catalogs = {}; // {ar:{...}, en:{...}, ur:{...}, tr:{...}, ug:{...}}
  try{ var el=document.getElementById('i18nData'); if(el) catalogs=JSON.parse(el.textContent||'{}')||{}; }catch(e){ catalogs={}; }

  /* No saved choice? Guess from the browser/system language (navigator.language)
     instead of always defaulting to Arabic — this doesn't increase how many
     languages actually load; it's still just Arabic (already embedded in the
     page) plus the visitor's detected language, exactly as if they'd picked
     it manually from the menu — the only difference is they don't have to
     click if their device's language is already supported. */
  function detectBrowserLocale(){
    try{
      var langs = navigator.languages || [navigator.language || navigator.userLanguage];
      for(var i=0;i<langs.length;i++){
        var code=String(langs[i]||'').toLowerCase().split('-')[0];
        if(code && NAMES[code]) return code;
      }
    }catch(e){}
    return null;
  }
  var current = DEFAULT_LOCALE;
  try{
    var saved = localStorage.getItem(STORAGE_KEY);
    current = saved || detectBrowserLocale() || DEFAULT_LOCALE;
  }catch(e){}

  /* القاموس الحالي — متغيّر واحد عام يُشتق من اللغة المختارة فقط (current)،
     لا تفضيل ثابت لأي لغة بعينها بما فيها العربية؛ كل قراءة نص في التطبيق
     (t، render، وأي كود مستقبلي) تمر عبر هذه الدالة فقط. */
  function catalog(){ return catalogs[current] || {}; }

  /* ترجمة نص واجهة يُنشأ ديناميكيًا وقت التشغيل (مثل زر إظهار الإجابة) — لا علاقة له بكلمات القرآن.
     تتدهور بلطف إلى قاموس العربية إن كانت اللغة الحالية غير عربية ولم يصل
     قاموسها بعد (جلب غير متزامن) — بدل عرض معرّف المفتاح الخام حرفيًا على
     الشاشة (كـ"openWsToggle") ريثما يكتمل الجلب. */
  function t(key){
    var cat=catalog();
    if(cat[key]) return cat[key];
    var fb=catalogs[DEFAULT_LOCALE]||{};
    return fb[key] || key;
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

  function render(root){
    /* root اختياري: يقصر الفحص على عنصر بعينه (مثل ورقة كسولة حُمِّلت للتو)
       بدل الصفحة كلها — تُستدعى render() من ensureBodyLoaded لكل ورقة تُفتح؛
       بلا هذا التقييد كانت كل ورقة جديدة تُشغِّل فحصًا لعشرات آلاف العناصر
       في الصفحة كلها (بما فيها كل الأوراق المفتوحة سابقًا)، فيتفاقم الزمن
       تراكميًا مع كل ورقة تُفتح (سلوك تربيعي عمليًا كلما زاد عدد الأوراق
       المفتوحة). لا حاجة له عند العرض الأول للصفحة كلها (root تبقى document
       افتراضيًا هناك). */
    root = root || document;
    /* كل لغة — بما فيها العربية — تُقرأ من نفس catalog() العامة، لا تفضيل
       لأي لغة بعينها في منطق القراءة نفسه */
    var cat = catalog();
    document.documentElement.setAttribute('lang', current);
    document.documentElement.setAttribute('dir', DIRS[current]||DIRS[DEFAULT_LOCALE]);
    root.querySelectorAll('[data-i18n]').forEach(function(node){
      var k=node.dataset.i18n;
      if(cat[k]) node.textContent = cat[k];
    });
    root.querySelectorAll('[data-i18n-ph]').forEach(function(node){
      var k=node.dataset.i18nPh;
      if(cat[k]) node.setAttribute('placeholder', cat[k]);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(function(node){
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
    root.querySelectorAll('[data-i18n-tpl]').forEach(function(node){
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
    root.querySelectorAll('[data-i18n-num]').forEach(function(node){
      node.textContent = num(node.dataset.i18nNum);
    });
    /* أسماء السور داخل عنوان الورقة — على عكس كلمات الأسئلة، اسم السورة نفسه
       يُترجَم (له اسم معروف بكل لغة)، فقط نص القرآن وكلماته يبقى عربيًا دائمًا. */
    root.querySelectorAll('[data-i18n-name]').forEach(function(node){
      var ar=node.dataset.i18nName, nid=tid(ar);
      node.textContent = (suraDict && suraDict[nid]) || (fbSura && fbSura[nid]) || ar;
    });
    var lbl=document.getElementById('langBtnLabel'); if(lbl) lbl.textContent=NAMES[current]||NAMES[DEFAULT_LOCALE];
  }

  /* fetch() غير موثوق لملفات file:// محلية في WebView (تطبيق أندرويد يحمّل
     الصفحة عبر file:///android_asset/www/index.html) حتى ضمن نفس الأصل —
     كان تبديل اللغة على أندرويد يفشل صامتًا (catalogs[code] يبقى فارغًا،
     فيظل العرض بالعربية دون أي خطأ ظاهر) لهذا السبب تحديدًا، ويستهلك وقتًا
     محسوسًا في كل محاولة فاشلة. XMLHttpRequest يعمل بثبات مع file:// في
     WebView؛ يُستخدم هنا حصرًا حين يكون أصل الصفحة file:، وfetch() كالمعتاد
     على الموقع العادي (http/https). */
  function fetchJSONCompat(url){
    return new Promise(function(resolve, reject){
      if(location.protocol==='file:'){
        var xhr=new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange=function(){
          if(xhr.readyState!==4) return;
          if(xhr.status===0||xhr.status===200){
            try{ resolve(JSON.parse(xhr.responseText)); }catch(e){ reject(e); }
          } else reject(new Error('HTTP '+xhr.status));
        };
        xhr.onerror=function(){ reject(new Error('XHR network error')); };
        xhr.send();
      } else {
        fetch(url).then(function(r){ return r.ok?r.json():Promise.reject(new Error('HTTP '+r.status)); }).then(resolve).catch(reject);
      }
    });
  }
  /* غير العربية: قوالبها لا تُضمَّن في الصفحة، تُجلَب من api/i18n/<code>.json
     عند أول استخدام فعلي فقط لا عند التحميل — فلا يُحمَّل زائر عربي وحده
     بيانات ٨ لغات أخرى لن يفتحها أبدًا. تُخزَّن في catalogs بعد الجلب فلا
     تتكرر الشبكة لنفس اللغة مرتين. عربية تبقى دومًا مضمَّنة (أول عرض فوري). */
  function loadCatalog(code, cb){
    if(catalogs[code] || code===DEFAULT_LOCALE){ cb(); return; }
    fetchJSONCompat('api/i18n/'+code+'.json').then(function(data){
      catalogs[code]=data; cb();
    }).catch(function(){ cb(); });
  }

  function set(code){
    current = NAMES[code] ? code : DEFAULT_LOCALE;
    try{ localStorage.setItem(STORAGE_KEY, current); }catch(e){}
    /* render() يفحص كل عنصر بخاصية data-i18n-tpl في الصفحة (عشرات الآلاف مع
       ٦٨٧ ورقة عمل) — كلفة حقيقية محسوسة على الأجهزة الضعيفة. كان يُستدعى
       مرتين لكل تبديل لغة (فورًا بعربية جزئيًا، ثم مجددًا بعد اكتمال الجلب)،
       فيضاعف هذه الكلفة دون داعٍ. الآن: رسمة واحدة فورية إن كان القاموس
       متوفرًا بالفعل (عربية أو لغة سبق تحميلها)، وإلا رسمة واحدة فقط بعد
       اكتمال الجلب — لا ازدواج أبدًا. */
    if(catalogs[current] || current===DEFAULT_LOCALE){
      render();
    } else {
      loadCatalog(current, render);
    }
  }

  /* رسمة واحدة فقط عند التحميل الأول — لا مرتين (فورًا بالعربية ثم مجددًا
     بعد اكتمال جلب لغة أخرى محفوظة): الصفحة أصلًا مخفية عبر بوابة data-ready
     حتى تجهز الترجمة والخطوط معًا (انظر أسفل الملف)، فلا حاجة لرسمة أولى
     "مؤقتة" لن يراها المستخدم إطلاقًا — فقط كلفة إضافية على الأجهزة الضعيفة. */
  var localeReady;
  if(current===DEFAULT_LOCALE){
    render();
    localeReady=Promise.resolve();
  } else {
    localeReady=new Promise(function(res){ loadCatalog(current, function(){ render(); res(); }); });
  }

  return { get current(){ return current; }, set: set, t: t, render: render, num: num, isDigits: isDigits, tid: tid, NAMES: NAMES, DIRS: DIRS, ready: localeReady };
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
if(window.requestAnimationFrame) requestAnimationFrame(syncTopbar); else syncTopbar();
window.addEventListener('resize',syncTopbar);
window.addEventListener('orientationchange',syncTopbar);
if(window.ResizeObserver&&topbar){ try{ new ResizeObserver(syncTopbar).observe(topbar); }catch(e){} }
/* ---------- فتح/إغلاق الورقة: تحديث الوسم والتمرير إليها ---------- */
/* محتوى كل ورقة (كل الأسئلة) مُخزَّن كنص HTML خام في وسم JSON، لا كعناصر DOM
   حية — لا يُبنى DOM فعلي لأي ورقة حتى تُفتح فعلًا (انظر ensureBodyLoaded).
   ٦٨٧ ورقة × عشرات الأسئلة كانت تُبنى كلها دفعة واحدة عند تحميل الصفحة بصرف
   النظر عمّا يراه المستخدم فعلًا (٤٣٥ ألف عنصر DOM قياسًا)، وهو السبب
   الأساسي في بطء البناء الأول وارتفاع استهلاك المعالج. */
/* Each worksheet body is fetched from its own api/ws/<id>.js file — a plain
   <script src>, not fetch/XHR, specifically so this still works when the
   page is opened directly by double-click (file://) with no server: browsers
   block fetch/XHR to separate local files under file:// same-origin policy,
   but not <script> tags, which is why this loader shape was chosen over the
   more obvious fetch()-based one. Each file assigns into window.__WSB[id]
   when it loads; results are cached there so re-opening a worksheet (or a
   second caller during the batch preload in admin.js) never re-fetches. */
window.__WSB=window.__WSB||{};
var wsbLoading={};
function loadWsBody(id, cb){
  if(window.__WSB[id]!=null){ cb(window.__WSB[id]); return; }
  if(wsbLoading[id]){ wsbLoading[id].push(cb); return; }
  wsbLoading[id]=[cb];
  var s=document.createElement('script');
  s.src='api/ws/'+id+'.js';
  function done(){
    var cbs=wsbLoading[id]||[]; delete wsbLoading[id];
    var html=window.__WSB[id]||null;
    cbs.forEach(function(f){ f(html); });
  }
  s.onload=done; s.onerror=done;
  document.head.appendChild(s);
}
function ensureBodyLoaded(det){
  var slot=det.querySelector(':scope > .ws[data-lazy]');
  if(!slot) return Promise.resolve(false); /* مُحمَّلة بالفعل، أو ورقة أُضيفت وقت التشغيل بمحتوى كامل أصلًا */
  var id=det.id.replace(/^w-/,'');
  return new Promise(function(resolve){
    loadWsBody(id, function(html){
      if(!html){ resolve(false); return; }
      slot.outerHTML=html;
      var body=det.querySelector(':scope > .ws');
      if(body && window.Locale) Locale.render(body);
      if(body) window.bindSheet(body, det);
      /* تعديلات المدير المحفوظة (اسم/أقسام/أسئلة مُعدَّلة) وأسئلة مُضافة سابقًا
         لهذه الورقة تحديدًا — تُعاد هنا فقط إن وُجد فعلًا تعديل/سؤال مخصَّص محفوظ
         لهذا المعرّف تحديدًا، لا لكل ورقة تُفتح دون شرط: كلتا الدالتين تفحصان
         وتُعيدان بناء كل التعديلات على كل الأوراق في كل مرة، فاستدعاؤهما بلا شرط
         لكل ورقة من ٦٨٧ يُشغِّلهما مئات المرات تباعًا ويُجمِّد الصفحة عمليًا. */
      if(body && ((window.WS_OVERRIDES||{})[id] || (window.CUSTOM||{})[id])){
        setTimeout(function(){
          try{ if(window.applyOverrides) window.applyOverrides(); }catch(e){}
          try{ if(window.renderCustomAll) window.renderCustomAll(); }catch(e){}
        },0);
      }
      resolve(true);
    });
  });
}
window.ensureBodyLoaded=ensureBodyLoaded;
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
      if(d.open) ensureBodyLoaded(d);
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
/* تهيئة ورقة أُضيفت في وقت التشغيل (من صفحة المدير)، أو محتوى ورقة حُمِّل
   لتوّه من WS_BODIES — root هنا قد يكون .ws (المحتوى) بينما det هو .ws-item
   الخارجي (يلزم لبعض الروابط كالصوت التي تبحث عن data-audio ضمن الورقة كلها) */
window.bindSheet=function(root, det){
  bindAnswers(root); bindControls(root); bindToggles(det||root);
  bindAudio(det||root); bindReplay(det||root); bindRepeatToggle(det||root); refreshAudioButtons(det||root);
};
/* ---------- تحميل تدريجي لبطاقات الصفحة الرئيسية ----------
   build.js يكتب أول ٣٠ بطاقة فقط كعناصر DOM حقيقية، والباقي كنص HTML خام
   داخل #gridRest (JSON) — لأن بناء ٦٨٧ بطاقة دفعة واحدة عند التحميل الأول
   كان السبب الرئيسي لثقل Style & Layout (Lighthouse). الدفعات التالية
   تُدرَج تدريجيًا أثناء التمرير، أو كلها دفعة واحدة عند استخدام البحث/التصفية
   (كي تبقى نتائجهما شاملة كل الأوراق كالسابق تمامًا). */
var gridRest=[];
try{ var grEl=document.getElementById('gridRest'); if(grEl) gridRest=JSON.parse(grEl.textContent||'[]'); }catch(e){}
var gridRestIdx=0;
function insertGridBatch(n){
  if(gridRestIdx>=gridRest.length) return false;
  var sentinel=document.getElementById('gridSentinel');
  var batch=gridRest.slice(gridRestIdx, gridRestIdx+n).join('\n');
  gridRestIdx+=n;
  if(sentinel) sentinel.insertAdjacentHTML('beforebegin', batch);
  else { var grid=document.querySelector('.grid'); if(grid) grid.insertAdjacentHTML('beforeend', batch); }
  registerWords(document);
  bindToggles(document);
  if(window.Locale) window.Locale.render();
  if(window.applyHidden) window.applyHidden();
  if(window.applyOverrides) window.applyOverrides();
  return gridRestIdx<gridRest.length;
}
function materializeAllGridCards(){
  if(gridRestIdx>=gridRest.length) return;
  while(insertGridBatch(200)){}
}
(function(){
  var sentinel=document.getElementById('gridSentinel');
  if(!sentinel || !gridRest.length) return;
  if(!window.IntersectionObserver){ materializeAllGridCards(); return; }
  var io=new IntersectionObserver(function(entries){
    if(entries.some(function(e){return e.isIntersecting;})){
      var more=insertGridBatch(30);
      if(!more) io.disconnect();
    }
  },{rootMargin:'600px'});
  io.observe(sentinel);
})();
window.materializeAllGridCards=materializeAllGridCards;

var filter='all', juz='0';
function applyFilter(){
  materializeAllGridCards();
  var q=(document.getElementById('q')||{}).value||'';
  document.querySelectorAll('.grid .ws-item').forEach(function(c){
    var catOk = filter==='all' || c.dataset.cat===filter;
    var juzOk = juz==='0' || c.dataset.juz===juz;
    var ok=catOk&&juzOk&&(!q||c.dataset.name.indexOf(q.trim())>-1);
    c.style.display=ok?'':'none';
  });
  /* تصفية «آيات مختارة»: تُعرَض أجزاء السور المجزَّأة منفكّة كبطاقات مستقلة
     متتابعة، لا مجمَّعة تحت غلاف قابل للطي — يتطلب فتح كل <details> فعليًا
     (لا مجرد إخفاء الرأس بصريًا) كي يُعرَض محتواها أصلًا. */
  var grid=document.querySelector('.grid');
  /* اختيار جزء معيّن يعني أن المستخدم يريد رؤية أجزاء السور التي تقع ضمنه
     تحديدًا — إبقاؤها مطويّة داخل غلاف السورة الكاملة يخفي أيها يطابق
     فعلًا، فيُفكّ التجميع أيضًا هنا كما في تبويب «آيات مختارة». */
  var flat = filter==='ayah' || juz!=='0';
  if(grid) grid.classList.toggle('force-flat', flat);
  document.querySelectorAll('.grid .ws-group').forEach(function(g){
    if(flat) g.setAttribute('open','');
    else g.removeAttribute('open');
  });
  /* تنبيه واضح كيف تُعاد الأجزاء المنفكّة إلى تجميعها — لا شيء كان يوضّح ذلك سابقًا */
  var hint=document.getElementById('flatHint'); if(hint) hint.hidden=!flat;
  /* سورة طويلة مجزّأة: أخفِ بطاقة المجموعة نفسها إن اختفت كل أجزائها بالتصفية،
     كي لا يبقى إطار فارغ لا يحوي أي جزء مطابق للبحث/الفئة المختارة */
  document.querySelectorAll('.grid .ws-group').forEach(function(g){
    var anyVisible=Array.prototype.some.call(g.querySelectorAll('.ws-item'),function(c){ return c.style.display!=='none'; });
    g.style.display=anyVisible?'':'none';
  });
}
document.querySelectorAll('.tabs:not(.lvl-tabs) button').forEach(function(b){
  b.addEventListener('click',function(){
    /* الضغط على التبويب النشط نفسه مجددًا (مثل «آيات مختارة») يُعيد كل شيء
       إلى «الكل» بدل البقاء عالقًا بلا وسيلة واضحة للرجوع */
    var already = b.classList.contains('on');
    var target = already ? document.querySelector('.tabs:not(.lvl-tabs) [data-f="all"]') : b;
    filter=target.dataset.f;
    document.querySelectorAll('.tabs:not(.lvl-tabs) button').forEach(function(x){x.classList.toggle('on',x===target);});
    applyFilter();
  });
});
/* applyFilter تفحص ٦٨٧ بطاقة/مجموعة في كل استدعاء — دون تأخير كان كل ضغطة
   حرف أثناء الكتابة تُشغِّل هذا الفحص كاملًا فورًا، فتتراكم الكلفة مع سرعة
   الكتابة الطبيعية. تأخير قصير (تُلغى المؤقتات السابقة عند كل ضغطة جديدة)
   يجعل الفحص يعمل مرة واحدة فقط بعد توقّف الكتابة، بلا أي تأخير محسوس على
   الاستخدام العادي. */
var qi=document.getElementById('q');
if(qi){
  var filterDebounce=null;
  qi.addEventListener('input',function(){
    clearTimeout(filterDebounce);
    filterDebounce=setTimeout(applyFilter,150);
  });
}
/* قائمة الأجزاء أصبحت نافذة منبثقة مطابقة لتصميم قائمة اللغة/إعدادات
   التلاوة (لا <select> متصفح افتراضي كان يخرج عن تصميم التطبيق تمامًا). */
(function(){
  var btn=document.getElementById('juzBtn'), panel=document.getElementById('juzPanel');
  if(!btn||!panel) return;
  panel.querySelectorAll('.juz-opt').forEach(function(o){
    o.addEventListener('click',function(){
      juz=o.dataset.juz;
      panel.querySelectorAll('.juz-opt').forEach(function(x){ x.classList.toggle('on',x===o); });
      var lbl=document.getElementById('juzBtnLabel');
      if(lbl) lbl.textContent=o.textContent;
      applyFilter();
      Popover.close();
    });
  });
  btn.addEventListener('click',function(){
    if(panel.hidden) Popover.open(panel,btn); else Popover.close();
  });
})();
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
var revealed=false;
var doReveal=function(){ if(revealed) return; revealed=true; reveal(); };
/* بوابة كشف واحدة فقط — تنتظر الخطوط والترجمة معًا (Locale.ready)، لا كل
   واحدة ببوابة body{visibility:hidden} مستقلة (كانتا تتعارضان: تبقى الصفحة
   مخفية حتى يتحقق الشرطان معًا بدل أوّل ما يتحقق أيّهما، فيتضاعف التأخير). */
var fontsP = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(function(){}) : Promise.resolve();
var localeP = (window.Locale && Locale.ready) ? Locale.ready.catch(function(){}) : Promise.resolve();
Promise.all([fontsP, localeP]).then(doReveal).catch(doReveal);
setTimeout(doReveal, 700); /* لا تنتظر أكثر من هذا حتى لا يبدو التطبيق بطيئًا */
