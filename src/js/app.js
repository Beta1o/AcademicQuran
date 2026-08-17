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
  /* Clears via the tracked element itself (curSeg), not by querying curDet —
     continuous multi-part playback (playGroupAudio) switches curDet as it
     crosses into each part, so a query scoped to the *new* curDet would miss
     clearing the highlight left in the *previous* part. */
  if(curSeg) curSeg.classList.remove('reading');
  curSeg=null;
}
/* The group "listen to the whole surah" button is icon-only (no text to
   swap in/out like the regular per-worksheet button has) — its "playing"
   state is shown purely via the .playing class (CSS highlight) instead. */
function setAudioBtnState(btn,state){
  if(btn.classList.contains('group-audio-play')){
    btn.classList.toggle('playing', state==='playing');
    return;
  }
  if(state==='playing') btn.textContent='⏸️ إيقاف التلاوة';
  else if(state==='loading') btn.textContent='⏳ جاري التحميل...';
  else if(state==='noaudio') btn.textContent='🔊 لا يوجد صوت';
  else btn.textContent='🔊 استماع للتلاوة';
  btn.classList.toggle('playing', state==='playing');
}
function stopAudio(onlyIfDet){
  if(onlyIfDet && curDet!==onlyIfDet) return; /* a different worksheet closed, not the one currently playing */
  if(curAudio){ curAudio.pause(); curAudio=null; }
  if(curBtn){ setAudioBtnState(curBtn,'idle'); curBtn=null; }
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
function markReading(ayaNo,det){
  det=det||curDet;
  if(!det) return;
  clearReading();
  if(!ayaNo) return;
  var seg=det.querySelector('.sheet .verse .aya-seg[data-aya="'+ayaNo+'"]');
  if(seg){
    seg.classList.add('reading'); curSeg=seg;
    try{ seg.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){}
  }
}
/* تُشغَّل الآيات كملفات منفصلة بالتتابع (لا كصوت سورة كاملة واحد) كي يمكن تمييز الآية الحالية أثناء الاستماع لمساعدة الحفظ */
function playAyaList(items,btn,det){
  if(!items.length){ setAudioBtnState(btn,'noaudio'); setTimeout(function(){ setAudioBtnState(btn,'idle'); },1500); return; }
  var i=0, preloaded=null, failCount=0; /* {idx, audio} — ملف الآية التالية يُحمَّل مسبقًا أثناء تشغيل الحالية */
  curAudio=new Audio(); curBtn=btn; curDet=det; setAudioBtnState(btn,'playing');
  /* When advancing to a preloaded element, the old Audio object is replaced
     but never cleaned up — its ended/error listeners stay attached forever.
     Reciters with larger, slower-loading files (e.g. Menshawi Mujawwad,
     whose recitation style repeats phrases within the same file) make it
     more likely that an abandoned element fires a late error event after
     already being swapped out (a network request that was still pending).
     That triggers an extra, out-of-sequence next() call, so i advances
     faster than actual playback (skipping an ayah that hasn't played yet)
     or finishes before the surah is actually done, with the wrong ayah
     highlighted in the meantime. The a===curAudio guard ignores any event
     from an element that is no longer the one actually playing. */
  function bindEvents(a){
    a.addEventListener('ended', function(){ if(a===curAudio) next(); });
    a.addEventListener('error', function(){ if(a===curAudio){ failCount++; next(); } });
  }
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
      /* Every single ayah failed (zero successes) — most likely a genuine
         internet outage rather than one bad file; continuing silently left
         the button appearing to work (still showing "Stop recitation") with
         no actual sound, and no explanation to the user. */
      if(failCount>=items.length){
        stopAudio();
        alert(t('audioAllFailedAlert'));
        return;
      }
      if(repeatMode){ i=0; failCount=0; preloaded=null; } else { stopAudio(); return; }
    }
    var it=items[i];
    var use = (preloaded && preloaded.idx===i) ? preloaded.audio : curAudio;
    i++;
    /* Continuous multi-part playback (playGroupAudio): each item can carry
       its own det (which member worksheet it belongs to). Opening it here
       reuses the existing .ws-item toggle listener as-is — same auto-scroll,
       same "close whichever part was open before" behavior a manual click
       already gets, so this doesn't need its own separate handling of any
       of that. Checked unconditionally (not just on a det *change*): the
       very first item's det is already equal to curDet (playAyaList's own
       det argument set it before next() ever ran), so a change-only check
       skipped opening it entirely — the first part silently never expanded. */
    if(it.det){ curDet=it.det; if(!curDet.open) curDet.open=true; }
    markReading(it.aya, it.det);
    if(use!==curAudio){ curAudio.pause(); curAudio=use; }
    else { curAudio.src=it.url; }
    curAudio.play().catch(function(){ failCount++; next(); });
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
  scope.querySelectorAll('[data-audio-group]').forEach(function(b){
    b.hidden = !s.enabled;
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
/* Full-worksheet audio prefetch: playAyaList only preloads one ayah ahead
   (enough to avoid a gap between tracks), so a visitor who loses their
   connection partway through a surah still hits a wall on whichever ayah
   hadn't been reached yet. Prefetching every ayah's audio into a dedicated
   cache as soon as the visitor presses play covers the whole worksheet
   instead, so a mid-listen disconnection doesn't stop them from finishing
   it. Scoped to one worksheet at a time (cleared on switch, not kept
   forever) to avoid silently filling the visitor's device storage with
   every recitation they've ever played. */
var AUDIO_CACHE_NAME='tahleel-audio';
var audioCachedForWs=null;
function prefetchWorksheetAudio(det, urls){
  if(!('caches' in window)) return; /* Cache Storage API unsupported/unavailable (e.g. some WebView contexts) — no offline benefit, but nothing breaks either */
  var wsId=det.id;
  if(audioCachedForWs===wsId) return; /* already prefetched for this worksheet */
  var switching=audioCachedForWs!==null;
  audioCachedForWs=wsId;
  (switching ? caches.delete(AUDIO_CACHE_NAME) : Promise.resolve()).then(function(){
    return caches.open(AUDIO_CACHE_NAME);
  }).then(function(cache){
    urls.forEach(function(u){
      cache.match(u).then(function(hit){
        if(hit) return;
        fetch(u).then(function(res){ if(res.ok || res.type==='opaque') cache.put(u,res); }).catch(function(){});
      });
    });
  }).catch(function(){});
}
function bindAudio(root){
  root.querySelectorAll('[data-audio]').forEach(function(b){
    if(isBound(b)) return;
    b.addEventListener('click',function(){
      if(curBtn===b){ stopAudio(); return; }
      stopAudio();
      /* A navigator.onLine===false pre-check used to block playback here
         with an alert before even trying — removed: on Android WebView
         specifically, onLine can transiently report false (network handoff,
         waking from Doze, etc.) even with a perfectly working connection,
         so the very next worksheet would play fine right after being wrongly
         told there's no internet. The failCount check inside playAyaList
         (every single ayah's fetch actually failing) is the reliable signal
         — it only fires on a real, sustained failure, not a flaky flag. */
      var det=document.getElementById('w-'+b.dataset.audio);
      if(!det) return;
      var s=audioSettings(), sura=det.dataset.surano;
      setAudioBtnState(b,'loading');
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
          prefetchWorksheetAudio(det, full.map(function(it){ return it.url; }));
          playAyaList(full, b, det);
        });
      });
    });
  });
}
/* Continuous recitation across a whole split surah's parts — the existing
   per-worksheet play button only ever covered one part's ayat. Isti'adhah
   plays once at the very start of the whole sequence (not once per part,
   which would repeat it every few ayat and get tedious fast), same for
   Basmala (needsBasmala only ever applies to a surah's very first ayah).
   Each item carries its own det (the specific part it belongs to) — see
   the it.det handling in playAyaList's next(), which opens/scrolls to
   whichever part is currently playing the same way a manual click would. */
/* The group audio button lives as a direct child of <details class="ws-group">
   (not inside <summary>, where a nested interactive element is invalid/
   inaccessible) — this syncs its absolute position to sit exactly over the
   invisible .group-audio-slot placeholder reserving its spot in the
   summary's normal flex layout, in both the closed and open card layouts. */
function positionGroupAudioBtn(group){
  var btn=group.querySelector(':scope > .group-audio-play');
  var slot=group.querySelector('.group-audio-slot');
  if(!btn || !slot) return;
  var gr=group.getBoundingClientRect(), sr=slot.getBoundingClientRect();
  btn.style.top=(sr.top-gr.top)+'px';
  btn.style.left=(sr.left-gr.left)+'px';
  btn.style.width=sr.width+'px';
  btn.style.height=sr.height+'px';
}
/* Positions many groups' buttons in one pass — all the getBoundingClientRect
   reads happen first, then all the style writes, instead of interleaving
   read/write per element (each write invalidates layout, forcing the next
   element's read to trigger a fresh synchronous reflow — measured costing
   250ms+ of forced-reflow time across ~30 initial groups when done
   naively one at a time). */
function positionGroupAudioBtns(groups){
  var measurements=groups.map(function(group){
    var btn=group.querySelector(':scope > .group-audio-play');
    var slot=group.querySelector('.group-audio-slot');
    if(!btn || !slot) return null;
    var gr=group.getBoundingClientRect(), sr=slot.getBoundingClientRect();
    return {btn:btn, top:sr.top-gr.top, left:sr.left-gr.left, w:sr.width, h:sr.height};
  });
  measurements.forEach(function(m){
    if(!m) return;
    m.btn.style.top=m.top+'px'; m.btn.style.left=m.left+'px';
    m.btn.style.width=m.w+'px'; m.btn.style.height=m.h+'px';
  });
}
function positionGroupAudioBtn(group){ positionGroupAudioBtns([group]); }
function positionAllGroupAudioBtns(){
  positionGroupAudioBtns([].slice.call(document.querySelectorAll('.ws-group')));
}
window.positionAllGroupAudioBtns=positionAllGroupAudioBtns;
window.addEventListener('resize',positionAllGroupAudioBtns);
/* Closed cards below the fold render with a content-visibility:auto
   placeholder size, not their real one — a position computed right at bind
   time (before the card is ever actually visible) can be stale by however
   much the placeholder guess was off. Re-synced the moment each card
   actually becomes relevant to the viewport, when its real layout is
   guaranteed settled — batched across everything that became relevant in
   the same tick (see positionGroupAudioBtns above). */
var groupAudioPosIO = window.IntersectionObserver ? new IntersectionObserver(function(entries){
  var targets=entries.filter(function(e){ return e.isIntersecting; }).map(function(e){ return e.target; });
  if(targets.length) positionGroupAudioBtns(targets);
},{rootMargin:'200px'}) : null;
function observeGroupAudioPos(root){
  if(!groupAudioPosIO) return;
  (root||document).querySelectorAll('.ws-group').forEach(function(g){
    if(g.dataset.audioPosObserved) return;
    g.dataset.audioPosObserved='1';
    groupAudioPosIO.observe(g);
  });
}
function bindGroupAudio(root){
  var newlyBoundGroups=[];
  root.querySelectorAll('[data-audio-group]').forEach(function(b){
    if(isBound(b)) return;
    var group=b.closest('.ws-group');
    if(group){
      newlyBoundGroups.push(group);
      observeGroupAudioPos(document);
      group.addEventListener('toggle',function(){ positionGroupAudioBtn(group); });
    }
    b.addEventListener('click',function(e){
      /* This button sits inside <summary> (visible on the closed group card,
         not just once opened, so a visitor can start listening without
         opening it first) — without stopping the click here, it would also
         toggle the group's own open/close state as an unwanted side effect. */
      e.preventDefault(); e.stopPropagation();
      if(curBtn===b){ stopAudio(); return; }
      stopAudio();
      /* A native <details> hides all of its content whenever it's closed,
         regardless of any nested [open] state on children inside it — so
         opening a member .ws-item alone (in playAyaList's next()) does
         nothing visible while its parent .ws-group is still collapsed. The
         group itself has to be open too, from the very first part onward. */
      var group=b.closest('.ws-group');
      if(group && !group.open) group.open=true;
      var ids=(b.dataset.audioGroup||'').split(',').filter(Boolean);
      var dets=ids.map(function(id){ return document.getElementById('w-'+id); }).filter(Boolean);
      if(!dets.length) return;
      var s=audioSettings();
      setAudioBtnState(b,'loading');
      Promise.all(dets.map(function(det){ return ensureBodyLoaded(det); })).then(function(){
        return Promise.all(dets.map(function(det){
          var sura=det.dataset.surano;
          var list=(det.dataset.ayalist?det.dataset.ayalist.split(','):[]).filter(Boolean);
          return Promise.all(list.map(function(a){
            return ayaAudioUrl(s.reciter,sura,a).then(function(u){ return {aya:a, url:u, det:det}; });
          }));
        }));
      }).then(function(perPart){
        var full=[].concat.apply([],perPart).filter(function(it){ return it.url; });
        var firstDet=dets[0];
        var withBasmala=needsBasmala(firstDet)
          ? ayaAudioUrl(s.reciter,1,1).then(function(u){ return u?[{aya:null,url:u,det:firstDet}].concat(full):full; })
          : Promise.resolve(full);
        withBasmala.then(function(seq){
          if(istiadhahEnabled()) seq=[{aya:null, url:'audios/istiadhah.mp3', det:firstDet}].concat(seq);
          playAyaList(seq, b, firstDet);
        });
      });
    });
  });
  if(newlyBoundGroups.length) positionGroupAudioBtns(newlyBoundGroups);
}
window.bindGroupAudio=bindGroupAudio;
bindAudio(document);
bindGroupAudio(document);
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
/* اللغة/المظهر/القارئ كانت ثلاثة أزرار منفصلة في الشريط العلوي (تزدحم بها
   شاشات أندرويد الضيقة تحديدًا) — أُدمجت الآن في زر واحد (settingsBtn) يفتح
   لوحة واحدة (settingsPanel) تضم الثلاثة معًا، فيبقى منطق كل خيار كما هو
   (نفس المعرّفات: reciterOpts، themeToggle، أزرار lang-opt) دون تغيير سوى
   مكان الزر/اللوحة الفاتحين لها. */
/* Small preview of the current selection shown next to each category on the
   settings root menu (e.g. "العربية" next to "اللغة") — lets a visitor see
   their active choice without opening the submenu, standard settings-UI
   pattern. Reads live DOM/localStorage state rather than tracking its own
   copy, so it can't drift out of sync with whatever actually changed it. */
function updateSettingsPreviews(){
  var langEl=document.getElementById('settingsLangValue');
  if(langEl){ var on=document.querySelector('#settingsPanel .settings-sub[data-cat="lang"] .lang-opt.on'); langEl.textContent = on ? on.textContent.trim() : ''; }
  /* Guarded: this can run before Locale is initialized (the theme toggle's
     own IIFE calls it immediately on load, ahead of Locale's declaration
     further down the file) — falls back to leaving text as-is rather than
     throwing. Re-run here (not just inside the toggle's own apply()) matters
     because apply() fires once at page load — before Locale exists yet — so
     without this, the theme row's label/value stayed stuck on the Arabic
     default text baked into the HTML until the visitor actually clicked the
     toggle once, even on a page already showing a different language. */
  if(window.Locale){
    var savedTheme=null; try{ savedTheme=localStorage.getItem('tahleel-theme'); }catch(e){}
    var systemDark=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = savedTheme ? savedTheme==='dark' : !!systemDark;
    var themeEl=document.getElementById('settingsThemeValue');
    if(themeEl) themeEl.textContent = window.Locale.t(dark?'themeDarkWord':'themeLightWord');
    var themeLabelEl=document.getElementById('themeToggleLabel');
    if(themeLabelEl) themeLabelEl.textContent = window.Locale.t(dark?'themeToggleLabel':'themeToggleLabelOff');
  }
  var reciterEl=document.getElementById('settingsReciterValue');
  if(reciterEl){ var ron=document.querySelector('#reciterOpts .reciter-opt.on'); reciterEl.textContent = ron ? ron.textContent.trim() : ''; }
  var qcountEl=document.getElementById('settingsQCountValue');
  if(qcountEl && typeof qCountSetting==='function'){ var qv=qCountSetting(); qcountEl.textContent = qv==='all' ? '' : qv; }
}
window.updateSettingsPreviews=updateSettingsPreviews;
(function(){
  var btn=document.getElementById('pubAudioBtn')||document.getElementById('settingsBtn');
  var panel=document.getElementById('pubAudioPanel')||document.getElementById('settingsPanel');
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
      updateSettingsPreviews();
      setTimeout(Popover.close, 300); /* closes automatically once a reciter is picked */
    });
  });
  /* Filters the 44-reciter list as the visitor types — a plain scroll was a
     lot to hunt through for one name. */
  var search=document.getElementById('reciterSearch');
  if(search) search.addEventListener('input',function(){
    var q=search.value.trim().toLowerCase();
    opts.querySelectorAll('.reciter-opt').forEach(function(o){
      o.hidden = q!=='' && o.textContent.toLowerCase().indexOf(q)===-1;
    });
  });
})();
/* ---------- Isti'adhah toggle, publicly visible (was admin-only before) ---------- */
(function(){
  var btn=document.getElementById('istiadhahToggle');
  if(!btn) return;
  var apply=function(){
    var on=istiadhahEnabled();
    btn.classList.toggle('on', on);
  };
  apply();
  btn.addEventListener('click',function(){
    var s; try{ s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'); }catch(e){ s={}; }
    s.istiadhahEnabled = !istiadhahEnabled();
    try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }catch(e){}
    apply();
  });
})();
/* ---------- manual dark/light toggle (on top of the OS-setting default) ---------- */
(function(){
  var THEME_KEY='tahleel-theme';
  var btn=document.getElementById('themeToggle');
  if(!btn) return;
  /* Icon, switch state, AND label all swap together — a label fixed to
     "Dark mode" regardless of which mode is actually active looked like the
     switch wasn't doing anything (both states read the same), and the light
     mode reading was easy to miss with no text spelling it out at all. */
  var icon=document.getElementById('themeIcon')||btn;
  var label=document.getElementById('themeToggleLabel');
  var ICON_SUN='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var ICON_MOON='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36A5.5 5.5 0 0 1 12 3Z"/></svg>';
  var systemDark=function(){
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  };
  /* param named tv (not t) — this IIFE sits inside app.js's top-level scope
     where t() is the global translation helper; naming this "t" like the
     stored theme value used to shadow that global entirely. */
  var apply=function(tv){
    if(tv){ document.documentElement.setAttribute('data-theme',tv); }
    else { document.documentElement.removeAttribute('data-theme'); }
    var dark = tv ? tv==='dark' : systemDark();
    icon.innerHTML = dark ? ICON_SUN : ICON_MOON;
    btn.classList.toggle('on', dark);
    if(label && window.Locale) label.textContent = window.Locale.t(dark?'themeToggleLabel':'themeToggleLabelOff');
    updateSettingsPreviews();
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
      if(cat[k]){
        node.setAttribute('aria-label', cat[k]);
        /* The group audio button also has a title attribute (for the mouse-
           hover tooltip) — aria-label alone left that tooltip stuck showing
           Arabic regardless of the page's actual selected language. */
        if(node.hasAttribute('title')) node.setAttribute('title', cat[k]);
      }
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
    /* Reciter names: Arabic-script readers see the Arabic name as-is, every
       other language gets the standard English transliteration — one name
       to maintain per reciter instead of one per (reciter × language). */
    root.querySelectorAll('[data-en-name]').forEach(function(node){
      var arabicScript = current==='ar'||current==='fa'||current==='ur'||current==='ps';
      node.textContent = arabicScript ? node.dataset.arName : node.dataset.enName;
    });
    var lbl=document.getElementById('langBtnLabel'); if(lbl) lbl.textContent=NAMES[current]||NAMES[DEFAULT_LOCALE];
    /* Switching language can reflow the group card header (different text
       lengths/line wraps), which would leave the absolutely-positioned
       group audio button (see positionGroupAudioBtn) misaligned with its
       .group-audio-slot placeholder otherwise. */
    if(root===document && window.positionAllGroupAudioBtns) window.positionAllGroupAudioBtns();
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
  var btn=document.getElementById('settingsBtn')||document.getElementById('langBtn');
  var panel=document.getElementById('settingsPanel')||document.getElementById('langPanel');
  if(!btn||!panel) return;
  /* [data-lang] restricts this to the actual language buttons — after
     merging the panels, .lang-opt is now a class shared with reciter
     buttons (reciter-opt) inside the same panel; selecting without this
     restriction would also attach a Locale.set(undefined) handler to the
     reciter buttons. */
  panel.querySelectorAll('.lang-opt[data-lang]').forEach(function(o){
    o.classList.toggle('on', o.dataset.lang===Locale.current);
    o.addEventListener('click',function(){
      panel.querySelectorAll('.lang-opt[data-lang]').forEach(function(x){ x.classList.toggle('on',x===o); });
      Locale.set(o.dataset.lang);
      if(window.updateSettingsPreviews) window.updateSettingsPreviews();
      Popover.close();
    });
  });
  /* Merged settings panel: a root level with three buttons (language/theme/
     reciter) — clicking one shows only its own sub-panel instead of one
     long list mixing all three together (made it hard to find the right
     option, especially on narrow Android screens). */
  var root=panel.querySelector('.settings-root');
  var subs=panel.querySelectorAll('.settings-sub');
  function showRoot(){
    if(root) root.hidden=false;
    subs.forEach(function(s){ s.hidden=true; });
  }
  if(root){
    root.querySelectorAll('.settings-cat').forEach(function(c){
      c.addEventListener('click',function(){
        var sub=panel.querySelector('.settings-sub[data-cat="'+c.dataset.cat+'"]');
        if(!sub) return;
        root.hidden=true;
        subs.forEach(function(s){ s.hidden=(s!==sub); });
      });
    });
    subs.forEach(function(s){
      var back=s.querySelector('.settings-back');
      if(back) back.addEventListener('click',showRoot);
    });
  }
  /* The settings panel specifically (not the juz panel or others) used to
     always center horizontally in the middle of the screen (.audio-settings-
     panel: left:50%) regardless of which button opened it — fine for small
     popovers, but it put the settings panel far from its own button (top of
     the bar), especially on narrow Android screens. Pinned directly under
     the button here via inline styles (beats any CSS rule without needing
     !important). */
  function positionUnderButton(){
    var r=btn.getBoundingClientRect();
    var margin=10, vw=window.innerWidth;
    var panelW=Math.min(280, vw*0.90);
    var left=r.right-panelW; /* aligns to the button's right edge — natural in RTL, where the button sits at the far left of the bar */
    if(left<margin) left=margin;
    if(left+panelW>vw-margin) left=vw-margin-panelW;
    panel.style.left=left+'px';
    panel.style.transform='none';
    panel.style.top=(r.bottom+8)+'px';
  }
  window.addEventListener('resize',function(){ if(!panel.hidden) positionUnderButton(); });
  btn.addEventListener('click',function(){
    if(panel.hidden){ showRoot(); updateSettingsPreviews(); positionUnderButton(); Popover.open(panel,btn); } else Popover.close();
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
  var id=(det.id||det.dataset.origid||'').replace(/^w-/,'');
  return new Promise(function(resolve){
    loadWsBody(id, function(html){
      if(!html){ resolve(false); return; }
      slot.outerHTML=html;
      var body=det.querySelector(':scope > .ws');
      if(body && window.Locale) Locale.render(body);
      if(body) window.bindSheet(body, det);
      if(body && window.applyLvlFilter) window.applyLvlFilter(body);
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
function closestTopLevelCard(d){
  var el=d;
  while(el && el.parentElement){
    if(el.parentElement.classList && el.parentElement.classList.contains('grid')) return el;
    el=el.parentElement;
  }
  return d;
}
/* Only one top-level grid card — a standalone worksheet or a whole grouped
   surah — stays open at a time. Opening a nested part inside a group
   doesn't close its own group (that's the ancestor staying open), only
   every OTHER top-level card. */
function closeOtherAccordionCards(d){
  var topCard=closestTopLevelCard(d);
  document.querySelectorAll('.grid > .ws-group[open], .grid > .ws-item[open]').forEach(function(o){
    if(o!==topCard) o.removeAttribute('open');
  });
}
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
      if(d.open){
        closeOtherAccordionCards(d);
        if(!noAutoScroll){
          var raf=window.requestAnimationFrame||function(f){return setTimeout(f,16);};
          raf(function(){ try{ d.scrollIntoView({block:'start'}); }catch(e){} });
        }
      }
    });
  });
  /* Split-surah group cards (.ws-group) never scrolled into view on open —
     the mechanism above only covers .ws-item — leaving the user at their
     previous scroll position, unable to see the first part without
     scrolling manually; this matches the same treatment as a regular
     worksheet (scroll to the top of the card on open). */
  root.querySelectorAll('.ws-group').forEach(function(g){
    if(isBound(g)) return;
    g.addEventListener('toggle',function(){
      /* Closing the group mid-playback used to leave the audio running with
         nothing visible playing it — curDet (whichever part is currently
         reading) lives inside this group, so closing the group hides it out
         from under the player. stopAudio(onlyIfDet) already no-ops when a
         different worksheet is playing; passing curDet itself only stops
         when it's actually this group's own playback still going. */
      if(!g.open && curDet && g.contains(curDet) && window.stopAudio) window.stopAudio(curDet);
      if(g.open) closeOtherAccordionCards(g);
      if(g.open && !noAutoScroll){
        var raf=window.requestAnimationFrame||function(f){return setTimeout(f,16);};
        raf(function(){
          /* content-visibility:auto items inside .ws-group-items (still
             closed, each with its own contain-intrinsic-size placeholder)
             can end up painted blank if scrollIntoView jumps the viewport
             before the browser finishes laying them out on this frame —
             most visible on the very first nested part, which lands right
             where the viewport settles. Reading offsetHeight forces a
             synchronous layout pass over content-visibility:auto content
             first, so it's already resolved by the time the scroll happens. */
          void g.offsetHeight;
          try{ g.scrollIntoView({block:'start'}); }catch(e){}
        });
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
  /* The group-level "listen to the whole surah" button lives in .ws-group's
     own <summary> (visible even closed, unlike a regular worksheet's audio
     button which only exists once its lazy body loads) — it ships with
     every group card's shell, including ones added here well after the
     initial page load, so it needs its own bind/visibility pass same as
     any other freshly-inserted content. */
  bindGroupAudio(document);
  refreshAudioButtons(document);
  if(window.Locale) window.Locale.render();
  if(window.applyHidden) window.applyHidden();
  if(window.applyOverrides) window.applyOverrides();
  /* A non-default merge size chosen earlier has to apply to cards that
     only just scrolled into existence too — applied lazily here, batch by
     batch, instead of forcing the whole 600+ worksheet catalog into the
     DOM and re-chunked up front (see the fix note on
     applyAyahMergeToAllGroups): that turned a settings toggle into a
     multi-second freeze. This keeps each toggle's own cost bounded to
     whatever is already on screen. */
  if(ayahMergeSize()!==10 && window.applyAyahMergeToAllGroups){
    var gl=document.getElementById('gridLoading');
    if(gl) gl.hidden=false;
    Promise.all([applyAyahMergeToAllGroups(document), applyAyahMergeToStandalone(document)]).then(function(){
      if(gl) gl.hidden=true;
    });
  }
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
  /* Searching/filtering has to scan the whole catalog, not just what's on
     screen — materializeAllGridCards() forces every remaining card into
     the DOM right here. That (plus re-chunking all of them if a non-10
     merge size is active) is real, visible work, so it gets the same
     loading indicator as scrolling. */
  var gl=document.getElementById('gridLoading');
  if(gl) gl.hidden=false;
  materializeAllGridCards();
  if(ayahMergeSize()!==10 && window.applyAyahMergeToAllGroups){
    Promise.all([applyAyahMergeToAllGroups(document), applyAyahMergeToStandalone(document)]).then(function(){
      if(gl) gl.hidden=true;
    });
  } else if(gl) gl.hidden=true;
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
/* ---------- level filter (hide any level not selected) + optional per-section question count ---------- */
var lvlFilter='all';
var QCOUNT_KEY='tahleel-qcount';
function qCountSetting(){
  try{ var v=localStorage.getItem(QCOUNT_KEY); return v&&v!=='all' ? +v : 'all'; }catch(e){ return 'all'; }
}
/* Fisher–Yates — an unbiased shuffle, not just Math.random-sort (which skews
   toward certain orderings) — matters here since "randomly" is the whole
   point of this feature. */
function shuffle(arr){
  arr=arr.slice();
  for(var i=arr.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
  }
  return arr;
}
/* root optional: scopes to one freshly-opened worksheet (called from
   ensureBodyLoaded) instead of re-scanning the whole document — same
   reasoning as render(root) elsewhere in this file, and matters doubly here
   since this runs a full reshuffle, not just a cheap show/hide toggle. */
function applyLvlFilter(root){
  root=root||document;
  var n=qCountSetting();
  root.querySelectorAll('.sec .qlist').forEach(function(qlist){
    var all=qlist.querySelectorAll('.q[data-lvl]');
    var matching=[].filter.call(all,function(el){ return lvlFilter==='all'||el.dataset.lvl===lvlFilter; });
    var keep = n==='all' ? matching : shuffle(matching).slice(0,n);
    var keepSet = new Set(keep);
    all.forEach(function(el){ el.style.display = keepSet.has(el) ? '' : 'none'; });
  });
  root.querySelectorAll('.lvl-legend .lvl').forEach(function(el){
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
/* ---------- question-count setting (Settings panel) ---------- */
(function(){
  var opts=document.querySelectorAll('.qcount-opt');
  if(!opts.length) return;
  var cur=qCountSetting();
  opts.forEach(function(o){ o.classList.toggle('on', o.dataset.qcount===String(cur)); });
  opts.forEach(function(o){
    o.addEventListener('click',function(){
      try{ localStorage.setItem(QCOUNT_KEY, o.dataset.qcount); }catch(e){}
      opts.forEach(function(x){ x.classList.toggle('on',x===o); });
      updateSettingsPreviews();
      applyLvlFilter(); /* re-shuffle every already-open worksheet right away */
      setTimeout(Popover.close, 300); /* same auto-close behavior as picking a reciter */
    });
  });
})();
/* ---------- merge/resize split-surah parts to a chosen ayah-per-worksheet size ----------
   Standalone worksheets (a whole short surah, or a single selected-ayah card)
   are unaffected — they're not chunked into parts in the first place, so
   there's nothing to merge. This only touches .ws-group (split long surahs
   into ~10-ayah parts): it re-chunks that group's ayat into new worksheets
   of the chosen size, built from the *same* verified source content —
   verse text is sliced from each original part's own per-ayah aya-seg
   spans (already tagged with the exact ayah they belong to, see verseHTML
   in build.js), never retyped or guessed. Each new chunk's questions are
   every original part's full question set for any part whose ayat overlap
   that chunk — sizes that aren't a clean multiple of the original ~10-ayah
   parts (5/15/25) mean a part straddling a chunk boundary contributes its
   full question set to both neighboring chunks rather than being split
   (there's no per-ayah question data to divide it by), which is an
   accepted tradeoff, not a bug: every question shown is still a real one
   from that surah, just not perfectly exclusive to one chunk at the seam. */
var AYAH_MERGE_KEY='tahleel-ayahmerge';
function ayahMergeSize(){
  try{ var v=localStorage.getItem(AYAH_MERGE_KEY); return v?+v:10; }catch(e){ return 10; }
}
var mergeSeq=0;
function rebuildGroupForSize(group, size){
  var itemsWrap=group.querySelector(':scope > .ws-group-items');
  if(!itemsWrap) return Promise.resolve();
  var holder=group.querySelector(':scope > .ws-group-originals');
  if(!holder){
    /* First time this group is ever re-chunked: stash the real, original
       part elements untouched in a hidden holder — every future size
       change (including back to the default 10) rebuilds from these, never
       from a previously-synthesized chunk, so nothing degrades over
       repeated switches. */
    holder=document.createElement('div');
    holder.className='ws-group-originals';
    holder.hidden=true;
    group.appendChild(holder);
    [].slice.call(itemsWrap.children).forEach(function(el){
      /* Hidden holder copies keep no id — the visible clone (or, for
         size 10, the visible copy) owns the real "w-..." id, so
         getElementById never resolves to an invisible duplicate. The
         original id is preserved in data-origid to restore on the
         size-10 clone. */
      el.dataset.origid=el.id;
      el.removeAttribute('id');
      holder.appendChild(el);
    });
  }
  var originals=[].slice.call(holder.children);
  if(size===10){
    /* Restore the default view from clones of the pristine originals —
       never move the real nodes out of the holder, or a later re-chunk
       would find it empty. */
    itemsWrap.innerHTML='';
    originals.forEach(function(el){
      var clone=el.cloneNode(true);
      if(el.dataset.origid) clone.id=el.dataset.origid;
      itemsWrap.appendChild(clone);
    });
    bindToggles(itemsWrap);
    originals.forEach(function(el,i){
      var clone=itemsWrap.children[i];
      window.bindSheet(clone.querySelector('.ws')||clone, clone);
    });
    if(window.Locale) window.Locale.render(itemsWrap);
    return Promise.resolve();
  }
  return Promise.all(originals.map(function(el){ return ensureBodyLoaded(el); })).then(function(){
    /* Flatten every original part's ayah list, in order, then re-cut it
       into runs of `size` — the source of truth for chunk boundaries, not
       the original ~10-ayah part boundaries themselves. */
    var ayaOwner=[]; // [{aya:Number, part:element}] in surah order
    originals.forEach(function(el){
      (el.dataset.ayalist||'').split(',').filter(Boolean).forEach(function(a){
        ayaOwner.push({aya:+a, part:el});
      });
    });
    var chunks=[];
    for(var i=0;i<ayaOwner.length;i+=size) chunks.push(ayaOwner.slice(i,i+size));
    var sura=originals[0]?originals[0].dataset.surano:'';
    var newEls=chunks.map(function(chunk){ return buildMergedWsItem(chunk, sura, originals); });
    itemsWrap.innerHTML='';
    newEls.forEach(function(el){ itemsWrap.appendChild(el); });
    bindToggles(itemsWrap);
    newEls.forEach(function(el){ window.bindSheet(el.querySelector('.ws'), el); });
    if(window.Locale) window.Locale.render(itemsWrap);
  });
}
function buildMergedWsItem(chunk, sura, originals){
  var ayaNums=chunk.map(function(c){ return c.aya; });
  var overlapping=[]; // original parts touching this chunk, each once, in order
  chunk.forEach(function(c){ if(overlapping.indexOf(c.part)===-1) overlapping.push(c.part); });
  var first=ayaNums[0], last=ayaNums[ayaNums.length-1];
  var id='merge'+(mergeSeq++)+'_'+sura+'_'+first+'_'+last;
  var det=document.createElement('details');
  det.className='ws-item';
  det.id='w-'+id;
  det.dataset.cat='ayah';
  det.dataset.surano=sura;
  det.dataset.ayano=String(first);
  det.dataset.ayaend='1';
  det.dataset.ayalist=ayaNums.join(',');
  var refCard=overlapping[0].querySelector('.card')||overlapping[0].querySelector('summary');
  var suraName=(refCard&&refCard.querySelector('[data-i18n-name]'))?refCard.querySelector('[data-i18n-name]').getAttribute('data-i18n-name'):'';
  var wordsAll=[];
  overlapping.forEach(function(o){ try{ wordsAll=wordsAll.concat(JSON.parse(o.dataset.words||'[]')); }catch(e){} });
  det.dataset.words=JSON.stringify(wordsAll);
  /* Verse: pull each ayah's own tagged span, in chunk order, from whichever
     original part actually contains it — a precise slice of real, already-
     verified text, not a re-derived or retyped copy. */
  var verseSpans=ayaNums.map(function(n){
    var owner=chunk.find(function(c){ return c.aya===n; }).part;
    var span=owner.querySelector('.aya-seg[data-aya="'+n+'"]');
    return span?span.outerHTML:'';
  }).filter(Boolean).join(' ');
  /* Sections: concatenate each overlapping part's own section (by index —
     every worksheet has the same fixed 3 sections in the same order), not
     a merge/interleave of questions across different section topics. */
  var secCount=Math.max.apply(null, overlapping.map(function(o){ return o.querySelectorAll(':scope .sec').length; }).concat([0]));
  var secsHTML='';
  for(var i=0;i<secCount;i++){
    var refSec=null, qHTML='', num=0;
    overlapping.forEach(function(o){
      var sec=o.querySelectorAll(':scope .sec')[i];
      if(!sec) return;
      if(!refSec) refSec=sec;
      sec.querySelectorAll(':scope .qlist > .q').forEach(function(q){
        num++;
        var clone=q.cloneNode(true);
        var numEl=clone.querySelector('.num'); if(numEl) numEl.textContent=numEl.textContent.replace(/[0-9٠-٩]+/, String(num));
        qHTML+=clone.outerHTML;
      });
    });
    if(refSec) secsHTML+='<section class="sec">'+refSec.querySelector('.sec-head').outerHTML+'<div class="qlist">'+qHTML+'</div></section>';
  }
  det.innerHTML=
    '<summary class="card">'+
      '<div class="tagrow"><span class="tag" data-i18n="tagPart">جزء من سورة</span></div>'+
      '<h2><span data-i18n="surahWord">سورة</span> <span data-i18n-name="'+(suraName||'')+'">'+(suraName||'')+'</span></h2>'+
      '<div class="vpeek">﴿ '+verseSpans+' ﴾</div>'+
      '<div class="cmeta"><span class="go" data-i18n="openWs">افتح الورقة ▾</span></div>'+
    '</summary>'+
    '<div class="ws">'+
      '<div class="ws-top">'+
        '<button class="act close" data-close="'+id+'" data-i18n="closeWs">▲ إغلاق</button><div class="spacer"></div>'+
        '<button class="act reset" data-reset="'+id+'" data-i18n="resetWs">تفريغ الإجابات</button>'+
        '<button class="act print" data-print="'+id+'" data-i18n="printWs">🖨️ طباعة الورقة</button>'+
      '</div>'+
      '<article class="sheet">'+
        '<header class="sheet-head">'+
          '<h2><span data-i18n-name="'+(suraName||'')+'">'+(suraName||'')+'</span></h2>'+
        '</header>'+
        '<div class="verse-wrap">'+
          '<button class="act audio-play js-only" data-audio="'+id+'" hidden data-i18n="listenWs">🔊 استماع للتلاوة</button>'+
          '<div class="verse"><p>﴿ '+verseSpans+' ﴾</p></div>'+
        '</div>'+
        secsHTML+
        '<footer class="sheet-foot"></footer>'+
      '</article>'+
      '<div class="ws-close"><button class="act" data-close="'+id+'" data-i18n="closeWsFull">▲ إغلاق الورقة</button></div>'+
    '</div>';
  return det;
}
function applyAyahMergeToAllGroups(root){
  var size=ayahMergeSize();
  /* Only re-chunk groups whose applied size actually differs from the
     current one — forcing every already-correct group through
     ensureBodyLoaded's network fetch again (with 92 groups on the page)
     is what turned a settings toggle into a multi-second, unresponsive
     freeze the first time this shipped. */
  var groups=[].slice.call((root||document).querySelectorAll('.grid .ws-group')).filter(function(g){
    return g.dataset.mergedSize!==String(size);
  });
  return Promise.all(groups.map(function(g){
    return rebuildGroupForSize(g, size).then(function(){ g.dataset.mergedSize=String(size); });
  }));
}
/* A standalone worksheet (a complete short surah, or a selected-ayah card)
   was never split into parts, so it has no .ws-group wrapper to re-chunk —
   but if its own ayah count exceeds the chosen merge size, it still needs
   to become a group of that many smaller worksheets. Converts in place:
   the real original item is stashed hidden inside the new wrapper (its own
   holder), and reverting to a size that fits restores the plain original. */
var _speakerIconHTML=null;
function speakerIconHTML(){
  if(_speakerIconHTML===null){
    var ref=document.querySelector('.group-audio-play');
    _speakerIconHTML=ref?ref.innerHTML:'🔊';
  }
  return _speakerIconHTML;
}
function rebuildStandaloneForSize(item, size){
  var ayaNums=(item.dataset.ayalist||'').split(',').filter(Boolean).map(Number);
  var wrapper=item.__mergeWrapper;
  if(size===10 || ayaNums.length<=size){
    if(wrapper && wrapper.parentNode){
      wrapper.parentNode.replaceChild(item, wrapper);
      item.hidden=false;
      item.__mergeWrapper=null;
    }
    return Promise.resolve();
  }
  return ensureBodyLoaded(item).then(function(){
    if(!wrapper){
      wrapper=document.createElement('details');
      wrapper.className='ws-group';
      wrapper.dataset.standaloneWrap='1';
      var tagrow=item.querySelector(':scope > summary .tagrow');
      var h2=item.querySelector(':scope > summary h2');
      var summary=document.createElement('summary');
      summary.className='ws-group-head card';
      summary.innerHTML=
        '<div class="tagrow">'+(tagrow?tagrow.innerHTML:'')+'</div>'+
        '<h2><span class="ws-group-icon">📖</span> '+(h2?h2.innerHTML:'')+'</h2>'+
        '<div class="vpeek"></div>'+
        '<div class="cmeta">'+
          '<span class="cmeta-start"><span class="prog-mini"></span><span class="ws-group-count"></span></span>'+
          '<span class="cmeta-end">'+
            '<span class="group-audio-slot" aria-hidden="true"></span>'+
            '<span class="go" data-i18n="openWs">افتح الورقة ▾</span>'+
          '</span>'+
        '</div>';
      /* Kept as a direct child of <details>, sibling of <summary> — same
         reasoning as the real built-in groups (see positionGroupAudioBtn). */
      var audioBtnEl=document.createElement('button');
      audioBtnEl.type='button';
      audioBtnEl.className='icon-btn group-audio-play js-only';
      audioBtnEl.dataset.audioGroup='';
      audioBtnEl.hidden=true;
      audioBtnEl.setAttribute('aria-label','استماع لكامل السورة');
      audioBtnEl.setAttribute('data-i18n-aria','listenSurahWs');
      audioBtnEl.innerHTML=speakerIconHTML();
      wrapper.appendChild(audioBtnEl);
      wrapper.appendChild(summary);
      var itemsWrap=document.createElement('div');
      itemsWrap.className='ws-group-items';
      wrapper.appendChild(itemsWrap);
      item.parentNode.insertBefore(wrapper, item);
      item.hidden=true;
      wrapper.appendChild(item);
      item.__mergeWrapper=wrapper;
    }
    var itemsWrap=wrapper.querySelector(':scope > .ws-group-items');
    var chunk=ayaNums.map(function(a){ return {aya:a, part:item}; });
    var chunks=[];
    for(var i=0;i<chunk.length;i+=size) chunks.push(chunk.slice(i,i+size));
    var sura=item.dataset.surano;
    var newEls=chunks.map(function(c){ return buildMergedWsItem(c, sura, [item]); });
    itemsWrap.innerHTML='';
    newEls.forEach(function(el){ itemsWrap.appendChild(el); });
    bindToggles(itemsWrap);
    bindToggles(wrapper);
    newEls.forEach(function(el){ window.bindSheet(el.querySelector('.ws'), el); });
    var vpeek=wrapper.querySelector(':scope > summary .vpeek');
    var verseSpans=ayaNums.map(function(n){
      var span=item.querySelector('.aya-seg[data-aya="'+n+'"]');
      return span?span.outerHTML:'';
    }).filter(Boolean).join(' ');
    if(vpeek) vpeek.innerHTML='﴿ '+verseSpans+' ﴾';
    var totalQ=newEls.reduce(function(a,el){ return a+el.querySelectorAll('.q').length; },0);
    var progMini=wrapper.querySelector(':scope > summary .prog-mini');
    if(progMini) progMini.textContent=totalQ+' سؤالًا';
    var countBadge=wrapper.querySelector(':scope > summary .ws-group-count');
    if(countBadge) countBadge.textContent=chunks.length+' جزءًا';
    var audioBtn=wrapper.querySelector(':scope > .group-audio-play');
    if(audioBtn) audioBtn.dataset.audioGroup=newEls.map(function(el){ return el.id.replace(/^w-/,''); }).join(',');
    if(window.bindGroupAudio) bindGroupAudio(wrapper);
    if(window.Locale) window.Locale.render(wrapper);
    positionGroupAudioBtn(wrapper);
  });
}
function applyAyahMergeToStandalone(root){
  var size=ayahMergeSize();
  /* Once wrapped, the real original item moves inside its own synthetic
     .ws-group wrapper (marked data-standalone-wrap) instead of being a
     direct child of .grid — so both the not-yet-wrapped and already-wrapped
     cases have to be found here, or a wrapped item would never be seen
     again on the next size change. Skips items already at the current
     size for the same reason as applyAyahMergeToAllGroups above. */
  var items=[].slice.call((root||document).querySelectorAll('.grid > .ws-item[data-ayalist], .grid > .ws-group[data-standalone-wrap] > .ws-item[data-ayalist]')).filter(function(it){
    return it.dataset.mergedSize!==String(size);
  });
  return Promise.all(items.map(function(item){
    return rebuildStandaloneForSize(item, size).then(function(){ item.dataset.mergedSize=String(size); });
  }));
}
/* ---------- ayah-per-worksheet setting (Settings panel) ---------- */
(function(){
  var opts=document.querySelectorAll('.ayahrange-opt');
  if(!opts.length) return;
  var cur=ayahMergeSize();
  opts.forEach(function(o){ o.classList.toggle('on', +o.dataset.ayahrange===cur); });
  /* Only the cards already on the page (roughly the first ~30, plus
     whatever the visitor has scrolled to) are re-chunked here — forcing
     the ENTIRE 600+ worksheet catalog into the DOM and network-fetching
     every part up front (what this used to do) turned a settings toggle
     into a multi-second, unresponsive freeze. Cards that scroll into view
     later pick up the current size lazily, in insertGridBatch. A brief
     loading state still covers this smaller, bounded amount of work,
     since even ~30 groups' worth of lazy body fetches is enough to be
     visibly non-instant.
     requestAnimationFrame is unreliable here (never fires in a
     backgrounded/non-visible webview — a real risk inside the Android
     wrapper, not just a headless-test quirk), so a plain setTimeout(0) is
     used instead to guarantee the just-shown spinner actually paints
     before the work starts. */
  function runMergeWithLoading(){
    var panel=document.querySelector('.settings-sub[data-cat="ayahrange"]');
    var loading=document.querySelector('.ayahrange-loading');
    if(panel) panel.classList.add('busy');
    if(loading) loading.hidden=false;
    return new Promise(function(resolve){
      setTimeout(function(){ setTimeout(function(){
        Promise.all([applyAyahMergeToAllGroups(), applyAyahMergeToStandalone()]).then(resolve);
      },0); },0);
    }).then(function(){
      if(panel) panel.classList.remove('busy');
      if(loading) loading.hidden=true;
    });
  }
  opts.forEach(function(o){
    o.addEventListener('click',function(){
      try{ localStorage.setItem(AYAH_MERGE_KEY, o.dataset.ayahrange); }catch(e){}
      opts.forEach(function(x){ x.classList.toggle('on',x===o); });
      var valEl=document.getElementById('settingsAyahRangeValue');
      if(valEl) valEl.textContent=o.textContent.trim();
      runMergeWithLoading().then(function(){ setTimeout(Popover.close, 300); });
    });
  });
  /* A returning visitor's saved non-default size has to be re-applied on
     load too, not just right after they click an option — otherwise the
     setting only takes effect for the rest of that same session. The
     settings panel isn't open yet at this point, so there's no spinner to
     show — just defer it off the critical first-paint path instead. Only
     the cards already materialized on load are covered here; the rest
     pick up the size lazily as they scroll in (insertGridBatch). */
  if(ayahMergeSize()!==10){
    setTimeout(function(){ setTimeout(function(){
      applyAyahMergeToAllGroups();
      applyAyahMergeToStandalone();
    },0); },0);
  }
})();
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
