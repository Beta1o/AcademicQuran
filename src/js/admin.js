/* ================= admin: add questions of every type ================= */
var ORIGINAL_HTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
var stripDc=function(s){return String(s).replace(DIAC,'');};
var lettersOf=function(w){return stripDc(w).replace(/[ـ\s\-–]/g,'').split('').filter(function(c){return /[\u0621-\u064A]/.test(c);});};
var AR='٠١٢٣٤٥٦٧٨٩';
var toArD=function(n){return String(n).split('').map(function(d){return /\d/.test(d)?AR[+d]:d;}).join('');};
var DOTS={'ب':1,'ت':2,'ث':3,'ج':1,'خ':1,'ذ':1,'ز':1,'ش':3,'ض':1,'ظ':1,'غ':1,'ف':1,'ق':2,'ن':1,'ي':2,'ة':2,'ئ':2,'ؤ':1};
var escA=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
var wsName=function(id){var d=document.getElementById('w-'+id);return d?d.dataset.name:id;};
var vNorm=function(ws){return (WORDS[ws]||[]).map(function(x){return x[1];});};
var vOrig=function(ws){return (WORDS[ws]||[]).map(function(x){return x[0];});};
var vJoined=function(ws){return vNorm(ws).join(' ');};
function wordInVerse(ws,word){var t=norm(word);return vNorm(ws).some(function(x){return x===t||('وفبلك'.indexOf(x[0])>-1&&x.slice(1)===t);});}
function freqWord(ws,word){var t=norm(word),c=0;vNorm(ws).forEach(function(x){if(x===t||['و','ف','ب','ك','ل'].some(function(p){return x===p+t;}))c++;});return c;}
function shuffled(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}
  return a.join('')===a.slice().sort().join('')?a:a;}

/* ---------- custom questions store ---------- */
var CUSTOM={};
try{ var emb=document.getElementById('customq'); if(emb) CUSTOM=JSON.parse(emb.textContent||'{}')||{}; }catch(e){CUSTOM={};}
try{ var ls=localStorage.getItem('tahleel-custom'); if(ls){var p=JSON.parse(ls); if(p&&typeof p==='object'&&Object.keys(p).length) CUSTOM=p;} }catch(e){}
function saveCustom(){ try{ localStorage.setItem('tahleel-custom', JSON.stringify(CUSTOM)); }catch(e){} }

/* ---------- custom worksheets store (سور/آيات يضيفها المدير) ---------- */
var CUSTOMWS=[];
try{ var embw=document.getElementById('customws'); if(embw) CUSTOMWS=JSON.parse(embw.textContent||'[]')||[]; }catch(e){CUSTOMWS=[];}
try{ var lsw=localStorage.getItem('tahleel-ws'); if(lsw){var pw=JSON.parse(lsw); if(pw&&pw.length) CUSTOMWS=pw;} }catch(e){}
function saveWs(){ try{ localStorage.setItem('tahleel-ws', JSON.stringify(CUSTOMWS)); }catch(e){} }

var AR_D='٠١٢٣٤٥٦٧٨٩';
function toArD2(n){ return String(n).split('').map(function(d){return /\d/.test(d)?AR_D[+d]:d;}).join(''); }
function verseWordsOf(verse){
  return String(verse).replace(/۝/g,' ').replace(/[ۚۖۗۘۙۛۜ۩﴿﴾]/g,'').split(/\s+/).filter(Boolean)
    .map(function(o){ return [o, norm(o)]; });
}
/* بناء ورقة عمل كاملة في وقت التشغيل — بنفس بنية الأوراق المبنيّة */
function wsHTML(ws){
  var words=escA(JSON.stringify(verseWordsOf(ws.verse)));
  var segs=String(ws.verse).split('۝').map(function(s){return s.trim();}).filter(Boolean);
  var start=ws.aya?parseInt(String(ws.aya).replace(/[٠-٩]/g,function(d){return AR_D.indexOf(d);}),10):1;
  var endMark=(ws.cat==='surah');
  var vHTML=segs.map(function(s,i){
    var last=i===segs.length-1;
    if(last&&!endMark) return '<span class="aya-seg" data-aya="'+(start+i)+'">'+escA(s)+'</span>';
    return '<span class="aya-seg" data-aya="'+(start+i)+'">'+escA(s)+' <span class="aya">۝'+toArD2(start+i)+'</span></span>';
  }).join(' ');
  var loc = ws.cat==='surah'
    ? [ws.num?'السورة رقم '+toArD2(ws.num)+' في المصحف':'', ws.ayat?'عدد آياتها '+toArD2(ws.ayat):''].filter(Boolean).join(' · ')
    : [ws.aya?'الآية '+toArD2(ws.aya):'', ws.num?'(السورة رقم '+toArD2(ws.num)+' في المصحف)':''].filter(Boolean).join(' ');
  var ltag = ws.cat==='surah' ? (ws.num?'السورة '+toArD2(ws.num):'') : (ws.aya?'الآية '+toArD2(ws.aya):'');
  var locHTML = ws.cat==='surah'
    ? [ws.num?'<span data-i18n-tpl="'+Locale.tid('السورة رقم {} في المصحف')+'" data-i18n-word="'+toArD2(ws.num)+'">السورة رقم '+toArD2(ws.num)+' في المصحف</span>':'',
       ws.ayat?'<span data-i18n-tpl="'+Locale.tid('عدد آياتها {}')+'" data-i18n-word="'+toArD2(ws.ayat)+'">عدد آياتها '+toArD2(ws.ayat)+'</span>':''].filter(Boolean).join(' · ')
    : [ws.aya?'<span data-i18n-tpl="'+Locale.tid('الآية {}')+'" data-i18n-word="'+toArD2(ws.aya)+'">الآية '+toArD2(ws.aya)+'</span>':'',
       ws.num?'(<span data-i18n-tpl="'+Locale.tid('السورة رقم {} في المصحف')+'" data-i18n-word="'+toArD2(ws.num)+'">السورة رقم '+toArD2(ws.num)+' في المصحف</span>)':''].filter(Boolean).join(' ');
  var ltagHTML = ws.cat==='surah'
    ? (ws.num?'<span data-i18n-tpl="'+Locale.tid('السورة {}')+'" data-i18n-word="'+toArD2(ws.num)+'">السورة '+toArD2(ws.num)+'</span>':'')
    : (ws.aya?'<span data-i18n-tpl="'+Locale.tid('الآية {}')+'" data-i18n-word="'+toArD2(ws.aya)+'">الآية '+toArD2(ws.aya)+'</span>':'');
  var secs=(ws.secs||[]).map(function(t,i){
    var secNum=(['١','٢','٣'][i]||toArD2(i+1));
    return '<section class="sec"><div class="sec-head"><span class="lens-badge" data-i18n-num="'+secNum+'">'+secNum+'</span>'+
      '<h3 data-i18n-tpl="'+Locale.tid(t)+'">'+escA(t)+'</h3><span class="rule"></span></div><div class="qlist"></div></section>';
  }).join('');
  var ayaListAttr = ' data-ayalist="'+segs.map(function(s,i){return start+i;}).join(',')+'"';
  var nameM=ws.name.match(/^سورة (.+?)(?: — (.+))?$/);
  var nameHtml = nameM
    ? '<span data-i18n="surahWord">سورة</span> <span data-i18n-name="'+escA(nameM[1])+'">'+escA(nameM[1])+'</span>'+(nameM[2]?' — '+escA(nameM[2]):'')
    : escA(ws.name);
  return '<details class="ws-item ws-custom" id="w-'+ws.id+'" style="--ac:var('+(ws.hue||'--teal')+')" data-cat="'+ws.cat+'" data-name="'+escA(ws.name)+'" data-words="'+words+'"'+
    (ws.num?' data-surano="'+ws.num+'"':'')+(ws.ayat?' data-ayat="'+ws.ayat+'"':'')+(ws.cat==='ayah'&&ws.aya?' data-ayano="'+start+'"':'')+(endMark?' data-ayaend="1"':'')+ayaListAttr+'>'+
    '<summary class="card">'+
      '<div class="tagrow"><span class="tag" data-i18n="'+(ws.cat==='surah'?'tagSurah':'tagAyah')+'">'+(ws.cat==='surah'?'سورة كاملة':'آية مختارة')+'</span>'+
      (ltag?'<span class="loc-tag">📍 '+ltagHTML+'</span>':'')+'<span class="loc-tag new">جديدة</span></div>'+
      '<h3>'+nameHtml+'</h3>'+
      '<div class="vpeek">﴿ '+vHTML+' ﴾</div>'+
      '<div class="cmeta"><span class="prog-mini" data-i18n-tpl="'+Locale.tid('{} سؤالًا')+'" data-i18n-word="٠">0 سؤالًا</span><span class="go" data-i18n="openWs">افتح الورقة ▾</span></div>'+
    '</summary>'+
    '<div class="ws">'+
      '<div class="ws-top">'+
        '<button class="act close" data-close="'+ws.id+'" data-i18n="closeWs">▲ إغلاق</button><div class="spacer"></div>'+
        '<button class="act reset" data-reset="'+ws.id+'" data-i18n="resetWs">تفريغ الإجابات</button>'+
        '<button class="act print" data-print="'+ws.id+'" data-i18n="printWs">🖨️ طباعة الورقة</button>'+
      '</div>'+
      '<article class="sheet">'+
        '<header class="sheet-head"><div class="lab-line">التحليل اللغوي المجهري</div>'+
          '<h2>'+nameHtml+'</h2>'+
          '<div class="info" data-i18n-tpl="'+Locale.tid(ws.info||'')+'">'+escA(ws.info||'')+'</div>'+
          (loc?'<div class="loc">📍 '+locHTML+'</div>':'')+
        '</header>'+
        '<div class="verse-wrap">'+
          '<button class="act audio-play js-only" data-audio="'+ws.id+'" hidden data-i18n="listenWs">🔊 استماع للتلاوة</button>'+
          '<div class="verse"><p>﴿ '+vHTML+' ﴾</p></div>'+
        '</div>'+
        '<div class="progress js-only"><div class="pbar"><i data-pfill="'+ws.id+'" style="width:0%"></i></div>'+
          '<b data-ptxt="'+ws.id+'">0 / 0</b><b class="score" data-score="'+ws.id+'"></b></div>'+
        secs+
        '<footer class="sheet-foot"><div class="fv">'+escA(ws.footV||'')+'</div>'+
          (ws.footM?'<div class="fm" data-i18n-tpl="'+Locale.tid(ws.footM)+'">'+escA(ws.footM)+'</div>':'')+'</footer>'+
      '</article>'+
      '<div class="ws-close"><button class="act" data-close="'+ws.id+'" data-i18n="closeWsFull">▲ إغلاق الورقة</button></div>'+
    '</div></details>';
}
/* إدراج الأوراق المضافة في الشبكة وتهيئتها */
function renderCustomWs(){
  var grid=document.querySelector('.grid'); if(!grid) return;
  CUSTOMWS.forEach(function(ws){
    if(document.getElementById('w-'+ws.id)) return;
    grid.insertAdjacentHTML('beforeend', wsHTML(ws));
    var det=document.getElementById('w-'+ws.id);
    try{ WORDS[ws.id]=JSON.parse(det.dataset.words); }catch(e){ WORDS[ws.id]=[]; }
    if(window.bindSheet) window.bindSheet(det);
    if(window.bindAudio) window.bindAudio(det);
    if(window.refreshAudioButtons) window.refreshAudioButtons();
  });
  if(window.Locale) window.Locale.render(); /* تطبيق اللغة الحالية على أي ورقة/سؤال أُدرج للتو */
  refreshStats();
}
/* تحديث أرقام الصفحة الرئيسية بعد الإضافة */
function refreshStats(){
  var all=document.querySelectorAll('.ws-item:not(.ws-hidden)');
  var qs=document.querySelectorAll('.ws-item:not(.ws-hidden) .q').length;
  var s=0,a=0;
  all.forEach(function(d){ if(d.dataset.cat==='surah') s++; else a++; });
  var set=function(k,v){ var el=document.querySelector('[data-stat="'+k+'"]'); if(el) el.textContent=v; };
  set('ws',all.length); set('surah',s); set('ayah',a); set('q',qs);
}
/* ---------- إخفاء/إظهار الأوراق الأصلية (المدمجة وقت البناء) — بديل الحذف الآمن لها ---------- */
var HIDDEN_WS=[];
try{ var hv=localStorage.getItem('tahleel-hidden'); if(hv){ var hp=JSON.parse(hv); if(Array.isArray(hp)) HIDDEN_WS=hp; } }catch(e){}
function saveHidden(){ try{ localStorage.setItem('tahleel-hidden', JSON.stringify(HIDDEN_WS)); }catch(e){} }
function applyHidden(){
  document.querySelectorAll('.ws-item').forEach(function(d){
    var id=d.id.slice(2);
    d.classList.toggle('ws-hidden', HIDDEN_WS.indexOf(id)>-1);
  });
  refreshStats();
}
window.applyHidden=applyHidden;
/* ---------- تعديلات على العناوين/الأوصاف/الألوان للأوراق الأصلية (لا تمسّ نص الآيات ولا الأسئلة) ---------- */
var WS_OVERRIDES={};
try{ var ov=localStorage.getItem('tahleel-overrides'); if(ov){ var op=JSON.parse(ov); if(op&&typeof op==='object') WS_OVERRIDES=op; } }catch(e){}
function saveOverrides(){ try{ localStorage.setItem('tahleel-overrides', JSON.stringify(WS_OVERRIDES)); }catch(e){} }
function applyOverrides(){
  Object.keys(WS_OVERRIDES).forEach(function(id){
    var d=document.getElementById('w-'+id); if(!d) return;
    var o=WS_OVERRIDES[id];
    if(o.name){
      d.dataset.name=o.name;
      var h3=d.querySelector('.card h3'); if(h3) h3.textContent=o.name;
      var h2=d.querySelector('.sheet-head h2'); if(h2) h2.textContent=o.name;
    }
    if(o.info!==undefined){ var inf=d.querySelector('.sheet-head .info'); if(inf) inf.textContent=o.info; }
    if(o.footV!==undefined){ var fv=d.querySelector('.sheet-foot .fv'); if(fv) fv.textContent=o.footV; }
    if(o.footM!==undefined){
      var fm=d.querySelector('.sheet-foot .fm');
      if(o.footM){ if(fm) fm.textContent=o.footM; else { var ft=d.querySelector('.sheet-foot'); if(ft) ft.insertAdjacentHTML('beforeend','<div class="fm">'+escA(o.footM)+'</div>'); } }
      else if(fm) fm.remove();
    }
    if(o.hue){ d.style.setProperty('--ac','var('+o.hue+')'); }
    if(o.secs){
      var heads=d.querySelectorAll('.sec .sec-head h3');
      o.secs.forEach(function(t,i){ if(t && heads[i]) heads[i].textContent=t; });
    }
    if(o.questions){
      Object.keys(o.questions).forEach(function(key){ applyQuestionEdit(d, key, o.questions[key]); });
    }
  });
}
window.applyOverrides=applyOverrides;
/* بعد أي تعديل لنص سؤال، يُعاد اشتقاق قالب الترجمة وكلمته من النص الجديد مباشرةً —
   لا تبقى وسوم الترجمة عالقة بنص قديم. وإن كانت الكلمة بين القوسين غير موجودة حرفيًا
   في نص الآية (WORDS[wsId])، تُعاد الدالة بتحذير كي لا تُكتب كلمة مغايرة للآية سهوًا. */
function syncQI18n(qtxtEl, wsId){
  if(!qtxtEl) return null;
  var text=qtxtEl.textContent.replace(/\s+$/,'');
  var m=text.match(/\(([^)]*)\)/);
  if(m){
    qtxtEl.dataset.i18nTpl=text.slice(0,m.index)+'({})'+text.slice(m.index+m[0].length);
    qtxtEl.dataset.i18nWord=m[1];
    var words=(WORDS[wsId]||[]).map(function(x){return x[0];});
    if(words.length && words.indexOf(m[1])===-1){
      return 'تنبيه: الكلمة «'+m[1]+'» بين القوسين غير منسوخة حرفيًا من نص الآية — تأكد من مطابقتها لتبقى الترجمة والتصحيح الآلي صحيحين.';
    }
  } else {
    qtxtEl.dataset.i18nTpl=text;
    delete qtxtEl.dataset.i18nWord;
  }
  return null;
}
window.syncQI18n=syncQI18n;
/* يطبّق تعديل سؤال واحد (نصّه وإجابته) على عنصره في DOM دون المساس بنوع الحقل */
function applyQuestionEdit(wsEl, key, edit){
  var el=wsEl.querySelector('[data-k="'+key+'"]'); if(!el) return null;
  var q=el.closest('.q'); if(!q) return null;
  var txtEl=q.querySelector('.txt');
  var before={ t: txtEl?txtEl.firstChild.textContent:'', ans: el.dataset.ans, show: el.dataset.show, mode: el.dataset.mode };
  var i18nWarning=null;
  if(edit.t!==undefined && txtEl && txtEl.firstChild){
    txtEl.firstChild.textContent=edit.t+' ';
    i18nWarning=syncQI18n(txtEl.firstChild, wsEl.id.slice(2));
  }
  if(edit.show!==undefined){
    if(edit.show){ el.dataset.show=edit.show; if(edit.ans!==undefined) el.dataset.ans=edit.ans; else delete el.dataset.ans; el.dataset.mode='contains'; }
    else { delete el.dataset.show; delete el.dataset.ans; delete el.dataset.mode; }
  }
  before.i18nWarning=i18nWarning;
  return before;
}

/* ---------- question types catalog ---------- */
var F_WORD=[{k:'word',label:'الكلمة'}];
var TYPES=[
 {id:'seg',label:'تقسيم كلمة إلى حروف (__ + __)',fields:F_WORD,gen:function(p){var ls=lettersOf(p.word);if(ls.length<2)return 'أدخل كلمة من حرفين فأكثر';
   return {t:p.word+' : '+ls.map(function(){return '__';}).join(' + '),ui:'seg',parts:ls.map(function(){return 1;}),ans:norm(ls.join('')),show:ls.join(' + ')};}},
 {id:'segAl',label:'تقسيم (ال + الكلمة)',fields:F_WORD,gen:function(p){var w=p.word,ls=lettersOf(w);
   if(norm(w).indexOf('ال')!==0||ls.length<4)return 'الكلمة يجب أن تبدأ بـ (ال) وطولها 4 حروف فأكثر';
   return {t:w+' : __ + ___',ui:'seg',parts:[2,ls.length-2],ans:norm(ls.join('')),show:'ال + '+stripDc(w).slice(2)};}},
 {id:'count',label:'عدد حروف كلمة',fields:F_WORD,gen:function(p){var n=lettersOf(p.word).length;if(!n)return 'أدخل كلمة';
   return {t:'حروف كلمة ('+p.word+') =',ui:'num',ans:n,show:toArD(n)};}},
 {id:'dots',label:'عدد النقاط في كلمة',fields:F_WORD,gen:function(p){if(!p.word)return 'أدخل كلمة';
   var n=lettersOf(p.word).reduce(function(s,c){return s+(DOTS[c]||0);},0);
   return {t:'عدد النقاط في كلمة ('+p.word+') =',ui:'num',ans:n,show:toArD(n)};}},
 {id:'freqL',label:'تكرار حرف في السورة',fields:[{k:'letter',label:'الحرف'}],gen:function(p,ws){var L=stripDc(p.letter||'').replace(/ـ/g,'');
   if(L.length!==1)return 'أدخل حرفًا واحدًا';
   if('اأإآءئؤى'.indexOf(L)>-1)return 'حروف الألف والهمزة غير مدعومة للعدّ الآلي';
   var n=vJoined(ws).split('').filter(function(c){return c===L;}).length;
   if(!n)return 'الحرف ('+L+') غير موجود في النص';
   return {t:'تكرار حرف ('+L+') في السورة =',ui:'num',ans:n,show:toArD(n)};}},
 {id:'freqW',label:'تكرار كلمة في السورة',fields:F_WORD,gen:function(p,ws){var n=freqWord(ws,p.word);
   if(!n)return 'الكلمة غير موجودة في النص';
   return {t:'تكرار كلمة ('+p.word+') =',ui:'num',ans:n,show:toArD(n)};}},
 {id:'merge',label:'ادمج حروفًا لتكوين كلمة',fields:F_WORD,gen:function(p){var ls=lettersOf(p.word);if(ls.length<2)return 'أدخل كلمة من حرفين فأكثر';
   return {t:'ادمج ('+ls.join(' - ')+') ←',ui:'text',ans:norm(ls.join('')),show:stripDc(p.word)};}},
 {id:'copy',label:'انسخ نصًا',fields:[{k:'text',label:'النص المطلوب نسخه'}],gen:function(p){if(!p.text)return 'أدخل النص';
   return {t:'انسخ: ('+p.text+')',ui:'text',ans:norm(p.text),show:p.text};}},
 {id:'dict',label:'إملاء',fields:[{k:'text',label:'نص الإملاء'}],gen:function(p){if(!p.text)return 'أدخل النص';
   return {t:'إملاء: ('+p.text+')',ui:'text',ans:norm(p.text),show:p.text};}},
 {id:'order',label:'رتب كلمات من الآية',fields:[{k:'phrase',label:'كلمات متتالية من الآية (كما وردت)'}],gen:function(p,ws){
   var words=(p.phrase||'').trim().split(/\s+/);if(words.length<2)return 'أدخل كلمتين متتاليتين فأكثر';
   if(vJoined(ws).indexOf(norm(p.phrase))===-1)return 'الكلمات ليست متتالية في نص السورة';
   var sc=shuffled(words.map(norm));
   return {t:'رتب: ('+sc.join(' - ')+')',ui:'text',ans:norm(p.phrase),show:p.phrase};}},
 {id:'firstWord',label:'أول كلمة في السورة/الآية',fields:[],gen:function(p,ws){var o=vOrig(ws);
   return {t:'أول كلمة في السورة؟',ui:'text',ans:vNorm(ws)[0],show:o[0]};}},
 {id:'lastWord',label:'آخر كلمة في السورة/الآية',fields:[],gen:function(p,ws){var o=vOrig(ws),n=vNorm(ws);
   return {t:'آخر كلمة في السورة؟',ui:'text',ans:n[n.length-1],show:o[o.length-1]};}},
 {id:'firstLetter',label:'أول حرف في كلمة',fields:F_WORD,gen:function(p){if(!p.word)return 'أدخل كلمة';var L=norm(p.word)[0];
   return {t:'أول حرف في ('+p.word+'):',ui:'text',ans:L,show:L};}},
 {id:'lastLetter',label:'آخر حرف في كلمة',fields:F_WORD,gen:function(p){if(!p.word)return 'أدخل كلمة';var nn=norm(p.word);
   return {t:'آخر حرف في ('+p.word+'):',ui:'text',ans:nn.slice(-1),show:nn.slice(-1)};}},
 {id:'hasLetter',label:'كلمة بها حرف (من السورة)',fields:[{k:'letter',label:'الحرف'}],gen:function(p,ws){return dynGen('has',p.letter,ws,'كلمة بها حرف');}},
 {id:'startsLetter',label:'كلمة تبدأ بحرف',fields:[{k:'letter',label:'الحرف'}],gen:function(p,ws){return dynGen('starts',p.letter,ws,'كلمة تبدأ بحرف');}},
 {id:'endsLetter',label:'كلمة تنتهي بحرف',fields:[{k:'letter',label:'الحرف'}],gen:function(p,ws){return dynGen('ends',p.letter,ws,'كلمة تنتهي بحرف');}},
 {id:'extract',label:'استخرج (ظاهرة تجويدية/لغوية)',fields:[{k:'mark',label:'الظاهرة',type:'select',opts:[
   ['mark:shadda','شدّة'],['mark:tk','تنوين كسر'],['mark:tf','تنوين فتح'],['mark:td','تنوين ضم'],['mark:tany','تنوين (أي نوع)'],
   ['mark:sukun','سكون'],['mark:hamza','همزة'],['lam:sun','لام شمسية'],['lam:moon','لام قمرية'],
   ['has:ا','مد بالألف'],['has:و','مد بالواو'],['has:ي','مد بالياء']]}],
  gen:function(p,ws){var kv=(p.mark||'').split(':'),lbl=this.fields[0].opts.filter(function(o){return o[0]===p.mark;})[0];
   if(!lbl)return 'اختر الظاهرة';
   var list=WORDS[ws]||[],ex=null;
   for(var i=0;i<list.length;i++){ if(dynTest(kv[0],kv[1],list[i][0],list[i][1])){ex=list[i][0];break;} }
   if(!ex)return 'لا توجد كلمة بهذه الظاهرة في النص';
   return {t:'استخرج ('+lbl[1]+')',ui:'text',dyn:p.mark,show:'مثال: '+ex};}},
 {id:'blank',label:'أكمل الفراغ من الآية',fields:[{k:'word',label:'الكلمة المحذوفة (من الآية)'}],gen:function(p,ws){
   if(!wordInVerse(ws,p.word))return 'الكلمة غير موجودة في النص';
   var t=norm(p.word),o=vOrig(ws),n=vNorm(ws),out=[],done=false,shown=null;
   for(var i=0;i<o.length;i++){ if(!done&&(n[i]===t)){out.push('________');shown=o[i];done=true;} else out.push(o[i]); }
   return {t:'أكمل: ﴿ '+out.join(' ')+' ﴾',ui:'text',ans:t,show:shown||p.word};}},
 {id:'scramble',label:'رتب حروفًا مبعثرة لتكوين كلمة',fields:F_WORD,gen:function(p,ws){
   if(!wordInVerse(ws,p.word))return 'اختر كلمة من نص السورة';
   var ls=lettersOf(p.word);if(ls.length<3)return 'كلمة من 3 حروف فأكثر';
   var sc=shuffled(ls);
   return {t:'رتب الحروف لتكوّن كلمة من السورة: ('+sc.join(' - ')+')',ui:'text',ans:norm(ls.join('')),show:stripDc(p.word)};}},
 {id:'mcq',label:'اختيار من متعدد',fields:[{k:'q',label:'نص السؤال'},{k:'o1',label:'الخيار 1'},{k:'o2',label:'الخيار 2'},{k:'o3',label:'الخيار 3 (اختياري)'},{k:'o4',label:'الخيار 4 (اختياري)'},{k:'correct',label:'رقم الإجابة الصحيحة (1-4)'}],
  gen:function(p){var opts=[p.o1,p.o2,p.o3,p.o4].filter(function(x){return x&&x.trim();});
   if(!p.q)return 'أدخل نص السؤال'; if(opts.length<2)return 'أدخل خيارين على الأقل';
   var c=toInt(p.correct); if(c===null||c<1||c>opts.length)return 'رقم الإجابة الصحيحة غير صحيح';
   return {t:p.q,ui:'mcq',opts:opts,ans:String(c-1),show:opts[c-1]};}},
 {id:'tf',label:'صح أم خطأ',fields:[{k:'q',label:'العبارة'},{k:'correct',label:'الإجابة',type:'select',opts:[['0','صح'],['1','خطأ']]}],
  gen:function(p){if(!p.q)return 'أدخل العبارة';
   return {t:p.q,ui:'mcq',opts:['صح','خطأ'],ans:String(p.correct||'0'),show:['صح','خطأ'][+(p.correct||0)]};}},
 {id:'open',label:'سؤال مفتوح (بإجابة نموذجية اختيارية)',fields:[{k:'q',label:'نص السؤال'},{k:'model',label:'الإجابة النموذجية (اختياري)'}],
  gen:function(p){if(!p.q)return 'أدخل نص السؤال';
   var r={t:p.q,ui:'text'};
   if(p.model&&p.model.trim()){r.ans=norm(p.model);r.mode='contains';r.show=p.model;}
   return r;}},
 {id:'task',label:'مهمة إنجاز ✓ (قراءة/ترديد/تلوين...)',fields:[{k:'q',label:'نص المهمة'}],
  gen:function(p){if(!p.q)return 'أدخل نص المهمة';return {t:p.q+' ✓',ui:'check'};}},
 /* ---------- أنواع إضافية ---------- */
 {id:'wordCount',label:'عدد كلمات السورة/الآية',fields:[],gen:function(p,ws){
   var n=vNorm(ws).length; return {t:'عدد كلمات السورة =',ui:'num',ans:n,show:toArD(n)};}},
 {id:'letterCount',label:'عدد حروف السورة/الآية',fields:[],gen:function(p,ws){
   var n=vNorm(ws).reduce(function(s,x){return s+x.replace(/\s/g,'').length;},0);
   return {t:'عدد حروف السورة =',ui:'num',ans:n,show:toArD(n)};}},
 {id:'suraNo',label:'رقم السورة في المصحف',fields:[{k:'n',label:'رقم السورة (١-١١٤)'}],gen:function(p,ws){
   var det=document.getElementById('w-'+ws), n=toInt(p.n)||toInt(det&&det.dataset.surano);
   if(!n||n<1||n>114) return 'أدخل رقمًا بين ١ و ١١٤';
   return {t:'رقم السورة في المصحف =',ui:'num',ans:n,show:toArD(n)};}},
 {id:'ayatNo',label:'عدد آيات السورة',fields:[{k:'n',label:'عدد الآيات'}],gen:function(p,ws){
   var det=document.getElementById('w-'+ws), n=toInt(p.n)||toInt(det&&det.dataset.ayat);
   if(!n||n<1) return 'أدخل عدد الآيات';
   return {t:'عدد آيات السورة؟',ui:'num',ans:n,show:toArD(n)};}},
 {id:'nthWord',label:'الكلمة رقم (ن) في السورة',fields:[{k:'n',label:'ترتيب الكلمة'}],gen:function(p,ws){
   var i=toInt(p.n), o=vOrig(ws), nn=vNorm(ws);
   if(!i||i<1||i>o.length) return 'الترتيب خارج عدد كلمات النص ('+toArD(o.length)+')';
   return {t:'الكلمة رقم ('+toArD(i)+') في السورة =',ui:'text',ans:nn[i-1],show:o[i-1]};}},
 {id:'longest',label:'أطول كلمة في السورة',fields:[],gen:function(p,ws){
   var o=vOrig(ws),best=[],len=-1;
   o.forEach(function(x){var L=lettersOf(x).length; if(L>len){len=L;best=[x];} else if(L===len) best.push(x);});
   if(best.length!==1) return 'توجد أكثر من كلمة بالطول نفسه — لا يمكن تصحيحها آليًا';
   return {t:'أطول كلمة في السورة =',ui:'text',ans:norm(best[0]),show:best[0]};}},
 {id:'lamType',label:'نوع الـ في كلمة (شمسية/قمرية)',fields:F_WORD,gen:function(p,ws){
   var x=norm(p.word||''); ['و','ف','ب','ل','ك'].forEach(function(pr){ if(x.indexOf(pr+'ال')===0) x=x.slice(1); });
   if(x.indexOf('ال')!==0||x.length<3) return 'اختر كلمة معرّفة بـ (ال)';
   var t=SUN.indexOf(x[2])>-1?'شمسية':'قمرية';
   return {t:'نوع الـ في ('+p.word+'):',ui:'text',ans:t,show:'لام '+t,mode:'contains'};}},
 {id:'meaning',label:'معنى كلمة (إجابة نموذجية)',fields:[{k:'word',label:'الكلمة'},{k:'model',label:'المعنى'}],
  gen:function(p){ if(!p.word||!p.model) return 'أدخل الكلمة ومعناها';
   return {t:'ما معنى ('+p.word+')؟',ui:'text',show:p.model};}}
];
/* ---------- أنواع الأسئلة المناسبة لكل قسم — يتغيّر نوع السؤال المتاح تلقائيًا حسب القسم المختار ---------- */
var SECTION_TYPE_MAP={
  0:['wordCount','letterCount','count','dots','freqL','freqW','seg','segAl','nthWord','longest','suraNo','ayatNo'],
  1:['hasLetter','startsLetter','endsLetter','firstLetter','lastLetter','extract','lamType','merge','scramble','blank','firstWord','lastWord'],
  2:['copy','dict','order','mcq','tf','open','task','meaning']
};
function dynGen(kind,letter,ws,label){
  var L=stripDc(letter||'').replace(/ـ/g,'');
  if(L.length!==1)return 'أدخل حرفًا واحدًا';
  var list=WORDS[ws]||[],ex=null;
  for(var i=0;i<list.length;i++){ if(dynTest(kind,L,list[i][0],list[i][1])){ex=list[i][0];break;} }
  if(!ex)return 'لا توجد كلمة مطابقة في النص';
  return {t:label+' ('+L+')',ui:'text',dyn:kind+':'+L,show:'مثال: '+ex};
}

var LVL_LABELS=['بسيط','سهل','متوسط','صعب','صعب جدًا'];
function rateItem(it){
  if(it.ui==='check') return 1;
  if(/^انسخ|^إملاء/.test(it.t||'')) return 1;
  if(it.ui==='seg') return (it.parts&&it.parts.length>4)?3:2;
  if(it.ui==='mcq') return 2;
  if(it.ui==='num') return 3;
  if(it.dyn) return /^mark|^lam/.test(it.dyn)?4:3;
  if(it.ans!==undefined) return 3;
  return 4;
}
/* ---------- render a custom question ---------- */
function qHTML(item,key,n){
  var ansAttr=item.ans!==undefined?' data-ans="'+escA(item.ans)+'"':'';
  var dynAttr=item.dyn?' data-dyn="'+escA(item.dyn)+'"':'';
  var showAttr=item.show?' data-show="'+escA(item.show)+'"':'';
  var modeAttr=item.mode?' data-mode="'+item.mode+'"':'';
  var field='';
  if(item.ui==='seg') field='<input type="text" class="seg" data-k="'+key+'" data-ui="seg" data-parts="'+item.parts.join(',')+'"'+ansAttr+showAttr+' placeholder="اكتب الحروف — تُفصَل بـ + تلقائيًا" data-i18n-ph="segPh" autocomplete="off">';
  else if(item.ui==='num') field='<input type="text" data-k="'+key+'" data-ui="num" inputmode="numeric"'+ansAttr+showAttr+' placeholder="اكتب العدد..." data-i18n-ph="numPh">';
  else if(item.ui==='check') field='<div class="checkrow"><label><input type="checkbox" data-k="'+key+'"> تم ✓</label></div>';
  else if(item.ui==='mcq'){
    field='<div class="mcqopts">'+item.opts.map(function(o,i){return '<label><input type="radio" name="'+key+'" value="'+i+'"> '+escA(o)+'</label>';}).join('')+'</div>'+
      '<input type="hidden" data-k="'+key+'" data-ui="text"'+ansAttr+showAttr+'>';
  } else field='<input type="text" data-k="'+key+'" data-ui="text"'+ansAttr+dynAttr+showAttr+modeAttr+' placeholder="اكتب إجابتك..." data-i18n-ph="textPh">';
  var lv=rateItem(item);
  var qm=item.t.match(/\(([^)]*)\)/);
  var qTplAttr = qm
    ? ' data-i18n-tpl="'+Locale.tid(item.t.slice(0,qm.index)+'({})'+item.t.slice(qm.index+qm[0].length))+'" data-i18n-word="'+escA(qm[1])+'"'
    : ' data-i18n-tpl="'+Locale.tid(item.t)+'"';
  return '<div class="q custom" data-lvl="'+lv+'"><span class="num">'+n+'</span><div class="body"><div class="txt"><span class="qtxt"'+qTplAttr+'>'+escA(item.t)+'</span>'+
    ' <span class="lvl lvl-'+lv+'" data-i18n="lvl'+lv+'">'+LVL_LABELS[lv-1]+'</span></div>'+field+'<div class="hint" hidden></div></div></div>';
}
function bindQ(root){
  root.querySelectorAll('[data-k]').forEach(function(el){
    var wsId=el.dataset.k.split('-')[0];
    var h=function(){ if(el.dataset.ui==='seg') formatSeg(el); grade(el); updateProg(wsId); };
    el.addEventListener('input',h); el.addEventListener('change',h);
    el.addEventListener('blur',function(){grade(el);});
  });
  root.querySelectorAll('.mcqopts input[type=radio]').forEach(function(r){
    r.addEventListener('change',function(){
      var hid=r.closest('.body').querySelector('input[type=hidden][data-k]');
      hid.value=r.value;
      hid.dispatchEvent(new Event('input',{bubbles:true}));
    });
  });
}
/* يعيد ترقيم كل أسئلة الورقة (١، ٢، ٣...) حسب ترتيبها الفعلي في الصفحة،
   بدل ترقيمها حسب وقت الإضافة — فلا تظهر أسئلة مضافة بأرقام قافزة كـ ٦١. */
function renumberQuestions(det){
  var n=0;
  det.querySelectorAll('.q').forEach(function(q){
    n++;
    var numEl=q.querySelector('.num');
    if(numEl) numEl.textContent=n;
  });
}
window.renumberQuestions=renumberQuestions;
function renderCustomAll(){
  document.querySelectorAll('.q.custom').forEach(function(el){el.remove();});
  Object.keys(CUSTOM).forEach(function(ws){
    var det=document.getElementById('w-'+ws); if(!det) return;
    var secs=det.querySelectorAll('.sec .qlist');
    (CUSTOM[ws]||[]).forEach(function(item,idx){
      var target=secs[Math.min(item.sec||0,secs.length-1)];
      var key=ws+'-c-'+idx;
      target.insertAdjacentHTML('beforeend', qHTML(item,key,0));
    });
    renumberQuestions(det);
    bindQ(det); updateProg(ws);
    var pm=det.querySelector('.prog-mini');
    if(pm){ var qn=det.querySelectorAll('.q').length; pm.dataset.i18nTpl='{} سؤالًا'; pm.dataset.i18nWord=toArD(qn); }
  });
  renderAdmList();
  if(window.applyLvlFilter) window.applyLvlFilter();
  if(window.Locale) window.Locale.render(); /* يطبّق الترجمة على أي نص أُعيد بناؤه للتو (عدّاد الأسئلة وغيره) */
}
/* ---------- duplicate check ---------- */
function isDup(ws,text){
  var t=norm(text);
  var det=document.getElementById('w-'+ws);
  var hit=false;
  det.querySelectorAll('.q .txt').forEach(function(x){ if(norm(x.textContent)===t) hit=true; });
  (CUSTOM[ws]||[]).forEach(function(it){ if(norm(it.t)===t) hit=true; });
  return hit;
}
/* ---------- admin UI wiring ---------- */
var $=function(id){return document.getElementById(id);};
var panel=$('adminPanel');

/* =======================================================================
   كلمة مرور صفحة المدير — تُستبدل هذه القيمة تلقائيًا وقت البناء بمتغيّر
   البيئة ADMIN_PASS (انظر build.js). لا تكتب كلمة مرور حقيقية هنا أبدًا —
   هذا الملف عام في المستودع، وأي نص هنا يصبح مقروءًا للجميع.
   تنبيه: التحقق يجري في المتصفح، فهو يمنع الأطفال من الدخول عرضًا،
   ولا يُعدّ حماية أمنية (يمكن قراءة كلمة المرور من مصدر الصفحة المبنية).
   ======================================================================= */
var ADMIN_PASS='change-me-set-ADMIN_PASS-env-var';
var ADMIN_SESSION_KEY='tahleel-adm-ok';

if(panel){
  var gate=$('admGate');
  function isUnlocked(){ try{ return sessionStorage.getItem(ADMIN_SESSION_KEY)==='1'; }catch(e){ return false; } }
  function lockScroll(on){ document.body.classList.toggle('no-scroll',on); }
  function setPanel(open){
    panel.hidden=!open;
    lockScroll(open || (gate && !gate.hidden));
    if(open && $('admWs')) try{ $('admWs').focus(); }catch(e){}
  }
  function gateMsg(s){ if($('admGateMsg')) $('admGateMsg').textContent=s||''; }
  function setGate(open){
    if(!gate) return;
    gate.hidden=!open;
    lockScroll(open || !panel.hidden);
    if(open){ gateMsg(''); if($('admPass')){ $('admPass').value=''; try{ $('admPass').focus(); }catch(e){} } }
  }
  /* الدخول: يطلب كلمة المرور مرة واحدة في كل جلسة متصفح */
  function requestAdmin(){ if(isUnlocked()) setPanel(true); else setGate(true); }
  window.requestAdmin=requestAdmin;

  if($('admGateForm')) $('admGateForm').addEventListener('submit',function(e){
    e.preventDefault();
    var v=($('admPass')||{}).value||'';
    if(v.trim()===ADMIN_PASS){
      try{ sessionStorage.setItem(ADMIN_SESSION_KEY,'1'); }catch(e2){}
      setGate(false); setPanel(true);
    } else {
      gateMsg('كلمة المرور غير صحيحة');
      var box=gate.querySelector('.adm-gate-box');
      if(box){ box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); }
      if($('admPass')){ $('admPass').value=''; $('admPass').focus(); }
    }
  });
  if($('admGateCancel')) $('admGateCancel').addEventListener('click',function(){ setGate(false); });
  if(gate) gate.addEventListener('click',function(e){ if(e.target===gate) setGate(false); });

  /* ---------- طرق الفتح المخفيّة ---------- */
  /* 1) خمس نقرات متتابعة على شعار الموقع (يعمل باللمس والفأرة) */
  var taps=0, tapT=0;
  var brand=$('brandKey');
  if(brand) brand.addEventListener('click',function(){
    var now=(new Date()).getTime();
    taps = (now-tapT<1200) ? taps+1 : 1;
    tapT=now;
    if(taps>=5){ taps=0; requestAdmin(); }
  });
  /* 2) اختصار لوحة المفاتيح: Ctrl+Alt+A (أو Cmd+Alt+A) */
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.altKey&&(e.code==='KeyA'||e.key==='a'||e.key==='A'||e.key==='ش')){
      e.preventDefault(); requestAdmin();
    }
    if(e.key==='Escape'){
      if(gate&&!gate.hidden) setGate(false);
      else if(!panel.hidden) setPanel(false);
    }
  });
  /* 3) الرابط المباشر: أضف #admin إلى عنوان الصفحة */
  function hashCheck(){ if((location.hash||'').toLowerCase()==='#admin'){ requestAdmin(); } }
  window.addEventListener('hashchange',hashCheck); hashCheck();

  if($('admOpen')) $('admOpen').addEventListener('click',requestAdmin);
  $('admClose').addEventListener('click',function(){ setPanel(false); });
  panel.addEventListener('click',function(e){ if(e.target===panel) setPanel(false); });
  /* ================= الخطوتان: ورقة جديدة ← ثم الأسئلة ================= */
  function showStep(k){
    $('admStepWs').hidden=(k!=='ws');
    $('admStepQ').hidden=(k!=='q');
    panel.querySelectorAll('.admin-steps .step').forEach(function(b){ b.classList.toggle('on',b.dataset.step===k); });
    try{ panel.scrollTop=0; }catch(e){}
  }
  panel.querySelectorAll('.admin-steps .step').forEach(function(b){
    b.addEventListener('click',function(){ showStep(b.dataset.step); });
  });

  /* ---------- قائمة الأوراق في الخطوة الثانية ---------- */
  function fillWsOptions(sel){
    var cur=sel||$('admWs').value;
    $('admWs').innerHTML='';
    document.querySelectorAll('.ws-item').forEach(function(d){
      var o=document.createElement('option'); o.value=d.id.slice(2); o.textContent=d.dataset.name;
      if(d.classList.contains('ws-custom')) o.textContent+='  ★';
      $('admWs').appendChild(o);
    });
    if(cur) $('admWs').value=cur;
    fillSecOptions();
  }
  /* أقسام الورقة المختارة بعناوينها الحقيقية (ثلاثة أقسام لكل ورقة) */
  function fillSecOptions(){
    var det=document.getElementById('w-'+$('admWs').value);
    var heads=det?det.querySelectorAll('.sec .sec-head h3'):[];
    $('admSec').innerHTML='';
    if(!heads.length){
      ['القسم الأول','القسم الثاني','القسم الثالث'].forEach(function(t,i){
        $('admSec').appendChild(new Option(t,i));
      });
      fillTypeOptions();
      return;
    }
    heads.forEach(function(h,i){ $('admSec').appendChild(new Option((i+1)+') '+h.textContent,i)); });
    fillTypeOptions();
  }
  $('admWs').addEventListener('change',fillSecOptions);
  $('admSec').addEventListener('change',fillTypeOptions);
  fillWsOptions();

  /* ---------- قائمة السور الـ ١١٤ (رقم، اسم، عدد الآيات) — لتعبئة تلقائية سريعة ---------- */
  var SURA_TABLE=[[1,"الفاتحة",7],[2,"البقرة",286],[3,"آل عمران",200],[4,"النساء",176],[5,"المائدة",120],[6,"الأنعام",165],[7,"الأعراف",206],[8,"الأنفال",75],[9,"التوبة",129],[10,"يونس",109],[11,"هود",123],[12,"يوسف",111],[13,"الرعد",43],[14,"إبراهيم",52],[15,"الحجر",99],[16,"النحل",128],[17,"الإسراء",111],[18,"الكهف",110],[19,"مريم",98],[20,"طه",135],[21,"الأنبياء",112],[22,"الحج",78],[23,"المؤمنون",118],[24,"النور",64],[25,"الفرقان",77],[26,"الشعراء",227],[27,"النمل",93],[28,"القصص",88],[29,"العنكبوت",69],[30,"الروم",60],[31,"لقمان",34],[32,"السجدة",30],[33,"الأحزاب",73],[34,"سبإ",54],[35,"فاطر",45],[36,"يس",83],[37,"الصافات",182],[38,"ص",88],[39,"الزمر",75],[40,"غافر",85],[41,"فصلت",54],[42,"الشورى",53],[43,"الزخرف",89],[44,"الدخان",59],[45,"الجاثية",37],[46,"الأحقاف",35],[47,"محمد",38],[48,"الفتح",29],[49,"الحجرات",18],[50,"ق",45],[51,"الذاريات",60],[52,"الطور",49],[53,"النجم",62],[54,"القمر",55],[55,"الرحمن",78],[56,"الواقعة",96],[57,"الحديد",29],[58,"المجادلة",22],[59,"الحشر",24],[60,"الممتحنة",13],[61,"الصف",14],[62,"الجمعة",11],[63,"المنافقون",11],[64,"التغابن",18],[65,"الطلاق",12],[66,"التحريم",12],[67,"الملك",30],[68,"القلم",52],[69,"الحاقة",52],[70,"المعارج",44],[71,"نوح",28],[72,"الجن",28],[73,"المزمل",20],[74,"المدثر",56],[75,"القيامة",40],[76,"الإنسان",31],[77,"المرسلات",50],[78,"النبإ",40],[79,"النازعات",46],[80,"عبس",42],[81,"التكوير",29],[82,"الانفطار",19],[83,"المطففين",36],[84,"الانشقاق",25],[85,"البروج",22],[86,"الطارق",17],[87,"الأعلى",19],[88,"الغاشية",26],[89,"الفجر",30],[90,"البلد",20],[91,"الشمس",15],[92,"الليل",21],[93,"الضحى",11],[94,"الشرح",8],[95,"التين",8],[96,"العلق",19],[97,"القدر",5],[98,"البينة",8],[99,"الزلزلة",8],[100,"العاديات",11],[101,"القارعة",11],[102,"التكاثر",8],[103,"العصر",3],[104,"الهمزة",9],[105,"الفيل",5],[106,"قريش",4],[107,"الماعون",7],[108,"الكوثر",3],[109,"الكافرون",6],[110,"النصر",3],[111,"المسد",5],[112,"الإخلاص",4],[113,"الفلق",5],[114,"الناس",6]];
  SURA_TABLE.forEach(function(row){
    var o=document.createElement('option');
    o.value=row[0]; o.textContent=toArD2(row[0])+') '+row[1]+' — '+toArD2(row[2])+' آية';
    o.dataset.name=row[1]; o.dataset.ayat=row[2];
    $('nwSuraPick').appendChild(o);
  });
  /* ---------- نص القرآن الكريم كاملًا (مضمَّن من صفحة المدير) — ١١٤ سورة × آياتها ---------- */
  var QURAN_FULL=[];
  try{ var qf=document.getElementById('quranfull'); if(qf) QURAN_FULL=JSON.parse(qf.textContent||'[]')||[]; }catch(e){ QURAN_FULL=[]; }
  function fillVerseFromQuran(){
    var opt=$('nwSuraPick').selectedOptions[0]; if(!opt||!opt.value) return;
    var ayahs=QURAN_FULL[(+opt.value)-1]; if(!ayahs||!ayahs.length) return;
    if($('nwCat').value==='surah'){
      $('nwVerse').value=ayahs.join(' ۝ ');
      return;
    }
    var from=toInt($('nwAya').value);
    if(!from||from<1||from>ayahs.length) return;
    var to=toInt($('nwAyaTo').value)||from;
    if(to<from) to=from;
    if(to>ayahs.length) to=ayahs.length;
    $('nwVerse').value=ayahs.slice(from-1,to).join(' ۝ ');
  }
  /* ---------- اسم الورقة يُبنى تلقائيًا من السورة ورقم الآية — يمنع تعارض الأسماء ---------- */
  function computeNwName(){
    var opt=$('nwSuraPick').selectedOptions[0];
    var suraName = (opt&&opt.value) ? opt.dataset.name : (function(){
      var n=toInt($('nwNum').value), row=n?SURA_TABLE.filter(function(r){return r[0]===n;})[0]:null;
      return row?row[1]:'';
    })();
    if(!suraName){ return; }
    var base='سورة '+suraName;
    if($('nwCat').value==='ayah'){
      var from=toInt($('nwAya').value), to=toInt($('nwAyaTo').value);
      if(from && to && to>from) base+=' — الآيات '+toArD2(from)+'-'+toArD2(to);
      else if(from) base+=' — الآية '+toArD2(from);
      else base+=' — الآية';
    }
    var extra=($('nwNameExtra').value||'').trim();
    if(extra) base+=' ('+extra+')';
    $('nwName').value=base;
  }
  window.computeNwName=computeNwName;
  /* ---------- لون الورقة: يُشتق من رقم السورة (بترتيب المصحف) بدل اختيار حر عشوائي ----------
     السور المكية والمدنية تتوزع دوريًا على الألوان الستة حسب رقم السورة، فيكون لكل سورة
     لونٌ ثابتٌ ومتوقَّع دائمًا (نفس السورة = نفس اللون)، بدل اختيار المدير لونًا عشوائيًا. */
  var HUE_CYCLE=['--teal','--gold','--indigo','--plum','--olive','--amber'];
  function computeHueForSura(n){ return HUE_CYCLE[(n-1)%HUE_CYCLE.length]; }
  $('nwSuraPick').addEventListener('change',function(){
    var opt=$('nwSuraPick').selectedOptions[0]; if(!opt||!opt.value) return;
    $('nwNum').value=opt.value;
    $('nwAyat').value=opt.dataset.ayat;
    $('nwHue').value=computeHueForSura(+opt.value);
    computeNwName();
    if($('nwCat').value==='surah'){ fillVerseFromQuran(); }
    else { try{ $('nwAya').focus(); }catch(e){} }
  });
  $('nwCat').addEventListener('change',computeNwName);
  $('nwAya').addEventListener('change',function(){ computeNwName(); fillVerseFromQuran(); });
  $('nwAyaTo').addEventListener('change',function(){ computeNwName(); fillVerseFromQuran(); });
  $('nwNameExtra').addEventListener('input',computeNwName);
  $('nwNum').addEventListener('change',computeNwName);

  /* ---------- نموذج إضافة/تعديل سورة أو آية ---------- */
  function nwMsg(s,ok){ $('nwMsg').textContent=s||''; $('nwMsg').className='admin-msg '+(s?(ok?'ok':'err'):''); }
  function slugId(){
    var i=1, id;
    do{ id='ws'+i; i++; }while(document.getElementById('w-'+id));
    return id;
  }
  function toggleAyaField(){
    var on=($('nwCat').value==='ayah');
    $('nwAyaWrap').style.display = on?'':'none';
    $('nwAyaToWrap').style.display = on?'':'none';
  }
  $('nwCat').addEventListener('change',toggleAyaField); toggleAyaField();
  $('nwAyaMark').addEventListener('click',function(){
    var t=$('nwVerse'); var p=t.selectionStart||t.value.length;
    t.value=t.value.slice(0,p)+' ۝ '+t.value.slice(p);
    t.focus(); try{ t.selectionStart=t.selectionEnd=p+3; }catch(e){}
  });
  /* لصق نص متعدد الأسطر (سطر لكل آية) → تحويله تلقائيًا إلى فواصل ۝ عند مغادرة الحقل */
  $('nwVerse').addEventListener('blur',function(){
    var v=$('nwVerse').value;
    if(/\n/.test(v) && !/۝/.test(v)){
      $('nwVerse').value=v.split(/\n+/).map(function(s){return s.trim();}).filter(Boolean).join(' ۝ ');
    }
  });
  var editingWsIdx=-1;
  function resetWsForm(){
    ['nwName','nwNum','nwAyat','nwAya','nwAyaTo','nwNameExtra','nwVerse','nwInfo','nwFootV','nwFootM'].forEach(function(id){ $(id).value=''; });
    $('nwSec0').value='أولًا: لغة الأرقام'; $('nwSec1').value='ثانيًا: مهارات الاستخراج'; $('nwSec2').value='ثالثًا: التدبر والنسخ';
    $('nwCat').value='surah'; toggleAyaField();
    $('nwSuraPick').value='';
    nwMsg('');
  }
  function startEditWs(i){
    var ws=CUSTOMWS[i]; if(!ws) return;
    stopEditingBuiltin();
    editingWsIdx=i;
    $('nwCat').value=ws.cat; toggleAyaField();
    $('nwName').value=ws.name; $('nwNum').value=ws.num||''; $('nwAyat').value=ws.ayat||''; $('nwAya').value=ws.aya||'';
    $('nwVerse').value=ws.verse; $('nwHue').value=ws.hue||'--teal';
    $('nwInfo').value=ws.info||''; $('nwFootV').value=ws.footV||''; $('nwFootM').value=ws.footM||'';
    $('nwSec0').value=(ws.secs&&ws.secs[0])||''; $('nwSec1').value=(ws.secs&&ws.secs[1])||''; $('nwSec2').value=(ws.secs&&ws.secs[2])||'';
    $('nwSave').textContent='💾 حفظ التعديلات';
    $('nwCancelEdit').hidden=false;
    nwMsg('تعديل ورقة «'+ws.name+'» — احفظ التعديلات أو ألغِ',true);
    try{ $('nwName').focus(); panel.scrollTop=0; }catch(e){}
  }
  function stopEditingBuiltin(){
    editingBuiltinId=null;
    $('nwVerse').disabled=false; $('nwAyaMark').disabled=false;
  }
  $('nwCancelEdit').addEventListener('click',function(){
    editingWsIdx=-1; stopEditingBuiltin();
    $('nwSave').textContent='💾 حفظ الورقة والانتقال للأسئلة'; $('nwCancelEdit').hidden=true;
    resetWsForm();
  });
  $('nwClear').addEventListener('click',function(){
    editingWsIdx=-1; stopEditingBuiltin();
    $('nwSave').textContent='💾 حفظ الورقة والانتقال للأسئلة'; $('nwCancelEdit').hidden=true;
    resetWsForm();
  });
  $('nwSave').addEventListener('click',function(){
    if(editingBuiltinId){
      var id=editingBuiltinId;
      var name=($('nwName').value||'').trim();
      if(!name) return nwMsg('اكتب اسم الورقة',false);
      var o={
        name:name,
        info:($('nwInfo').value||'').trim(),
        footV:($('nwFootV').value||'').trim(),
        footM:($('nwFootM').value||'').trim(),
        hue:$('nwHue').value,
        secs:[($('nwSec0').value||'').trim(),($('nwSec1').value||'').trim(),($('nwSec2').value||'').trim()]
      };
      WS_OVERRIDES[id]=o; saveOverrides(); applyOverrides();
      stopEditingBuiltin();
      $('nwSave').textContent='💾 حفظ الورقة والانتقال للأسئلة'; $('nwCancelEdit').hidden=true;
      renderBwList(); fillWsOptions();
      nwMsg('✅ حُفظت تعديلات «'+name+'»',true);
      resetWsForm();
      return;
    }
    var name=($('nwName').value||'').trim();
    var verse=($('nwVerse').value||'').trim();
    if(!name) return nwMsg('اكتب اسم الورقة (مثال: سورة الضحى)',false);
    if(!verse||!/[ء-ي]/.test(verse)) return nwMsg('اكتب نص السورة أو الآية بالعربية',false);
    var dup=false;
    document.querySelectorAll('.ws-item').forEach(function(d){
      if(editingWsIdx>-1 && d.id==='w-'+CUSTOMWS[editingWsIdx].id) return;
      if(norm(d.dataset.name)===norm(name)) dup=true;
    });
    if(dup) return nwMsg('⚠️ توجد ورقة بهذا الاسم مسبقًا',false);
    var num=toInt($('nwNum').value);
    if(num!==null&&(num<1||num>114)) return nwMsg('رقم السورة يجب أن يكون بين ١ و ١١٤',false);
    var cat=$('nwCat').value;
    var aya=toInt($('nwAya').value);
    if(cat==='ayah'&&aya===null) return nwMsg('اكتب رقم الآية',false);
    var isEdit=editingWsIdx>-1;
    var ws={
      id: isEdit?CUSTOMWS[editingWsIdx].id:slugId(), cat:cat, name:name, verse:verse,
      hue:$('nwHue').value, num:num||'', ayat:toInt($('nwAyat').value)||'', aya:aya||'',
      info:($('nwInfo').value||'').trim()||(cat==='surah'?'سورة كاملة':'آية مختارة'),
      footV:($('nwFootV').value||'').trim()||('﴿ '+verse.split('۝')[0].trim()+' ﴾'),
      footM:($('nwFootM').value||'').trim()||'أحسنت يا باحث صغير',
      secs:[($('nwSec0').value||'القسم الأول').trim(),($('nwSec1').value||'القسم الثاني').trim(),($('nwSec2').value||'القسم الثالث').trim()]
    };
    if(isEdit){
      CUSTOMWS[editingWsIdx]=ws;
      var old=document.getElementById('w-'+ws.id); if(old) old.remove();
      editingWsIdx=-1; $('nwSave').textContent='💾 حفظ الورقة والانتقال للأسئلة'; $('nwCancelEdit').hidden=true;
      saveWs(); renderCustomWs(); renderNwList(); fillWsOptions(ws.id);
      nwMsg('✅ حُفظت تعديلات «'+name+'»',true);
      resetWsForm();
    } else {
      CUSTOMWS.push(ws); saveWs(); renderCustomWs(); renderNwList(); fillWsOptions(ws.id);
      nwMsg('✅ أُضيفت «'+name+'» — انتقل الآن لإضافة أسئلتها',true);
      resetWsForm();
      setTimeout(function(){ showStep('q'); },400);
    }
  });
  function renderNwList(){
    var out=CUSTOMWS.map(function(ws,i){
      var nq=(CUSTOM[ws.id]||[]).length;
      return '<div class="row"><b>'+escA(ws.name)+'</b><span>'+(ws.cat==='surah'?'سورة':'آية')+
        (ws.num?' · رقم '+toArD2(ws.num):'')+' · '+toArD2(nq)+' سؤالًا</span>'+
        '<button class="edit" data-wsedit="'+i+'">تعديل</button>'+
        '<button class="del" data-wsdel="'+i+'">حذف</button></div>';
    }).join('');
    $('nwList').innerHTML=out||'<div class="row">لا توجد أوراق مضافة بعد.</div>';
    $('nwList').querySelectorAll('[data-wsedit]').forEach(function(b){
      b.addEventListener('click',function(){ startEditWs(+b.dataset.wsedit); });
    });
    $('nwList').querySelectorAll('[data-wsdel]').forEach(function(b){
      b.addEventListener('click',function(){
        var ws=CUSTOMWS[+b.dataset.wsdel]; if(!ws) return;
        if(!confirm('حذف ورقة «'+ws.name+'» وكل أسئلتها؟')) return;
        var el=document.getElementById('w-'+ws.id); if(el) el.remove();
        delete CUSTOM[ws.id]; delete WORDS[ws.id];
        CUSTOMWS.splice(+b.dataset.wsdel,1);
        if(editingWsIdx===+b.dataset.wsdel){ editingWsIdx=-1; $('nwSave').textContent='💾 حفظ الورقة والانتقال للأسئلة'; $('nwCancelEdit').hidden=true; resetWsForm(); }
        saveWs(); saveCustom(); renderNwList(); fillWsOptions(); refreshStats();
      });
    });
  }
  window.renderNwList=renderNwList;
  /* ---------- قائمة الأوراق الأصلية (المدمجة) — تعديل العنوان/الوصف، وحذف يطلب كلمة المرور ---------- */
  var editingBuiltinId=null;
  function renderBwList(){
    var out=[];
    document.querySelectorAll('.ws-item:not(.ws-custom)').forEach(function(d){
      var id=d.id.slice(2), hidden=HIDDEN_WS.indexOf(id)>-1;
      var qs=d.querySelectorAll('.q'), nq=qs.length;
      var lvlCount=[0,0,0,0,0];
      qs.forEach(function(q){ var l=+q.dataset.lvl; if(l>=1&&l<=5) lvlCount[l-1]++; });
      var lvlSummary=lvlCount.map(function(c,i){ return c?('<span class="lvl lvl-'+(i+1)+'">'+toArD2(c)+'</span>'):''; }).join('');
      out.push('<div class="row"><b>'+escA(d.dataset.name)+'</b><span class="builtin-tag">أصلية</span>'+
        '<span>'+(d.dataset.cat==='surah'?'سورة':'آية')+(hidden?' · مخفية':'')+' · '+toArD2(nq)+' سؤالًا</span>'+
        '<span class="bw-lvls">'+lvlSummary+'</span>'+
        '<button class="edit" data-bwq="'+id+'">أسئلة الورقة</button>'+
        '<button class="hide-toggle" data-hideid="'+id+'">'+(hidden?'استعادة':'حذف')+'</button></div>');
    });
    $('bwList').innerHTML=out.join('')||'<div class="row">لا توجد أوراق أصلية.</div>';
    $('bwList').querySelectorAll('[data-bwq]').forEach(function(b){
      b.addEventListener('click',function(){ openBwQuestionList(b.dataset.bwq); });
    });
    $('bwList').querySelectorAll('[data-hideid]').forEach(function(b){
      b.addEventListener('click',function(){
        var id=b.dataset.hideid, i=HIDDEN_WS.indexOf(id);
        if(i>-1){ HIDDEN_WS.splice(i,1); saveHidden(); applyHidden(); renderBwList(); return; }
        var p=prompt('لتأكيد حذف «'+(document.getElementById('w-'+id)||{}).dataset.name+'» أعد كتابة كلمة مرور المدير:');
        if(p===null) return;
        if(p!==ADMIN_PASS){ alert('كلمة المرور غير صحيحة — لم يُحذف شيء.'); return; }
        HIDDEN_WS.push(id); saveHidden(); applyHidden(); renderBwList();
      });
    });
  }
  window.renderBwList=renderBwList;
  /* ---------- قائمة أسئلة ورقة أصلية: تعديل نصّ/إجابة أي سؤال، مع إمكان التراجع عن الجلسة كاملة ---------- */
  var bwQSession=null; // {wsId, snapshot: [{key,t,ans,show,mode}]}
  function openBwQuestionList(wsId){
    var d=document.getElementById('w-'+wsId); if(!d) return;
    var snapshot=[];
    d.querySelectorAll('.q').forEach(function(q){
      var el=q.querySelector('[data-k]'); if(!el) return;
      var txtEl=q.querySelector('.txt');
      snapshot.push({key:el.dataset.k, t:txtEl?txtEl.firstChild.textContent.replace(/\s+$/,''):'', ans:el.dataset.ans, show:el.dataset.show, mode:el.dataset.mode});
    });
    bwQSession={wsId:wsId, snapshot:snapshot};
    renderBwQuestionList();
  }
  function renderBwQuestionList(){
    var s=bwQSession; if(!s) return;
    var d=document.getElementById('w-'+s.wsId);
    var out='<div class="row"><b>أسئلة «'+escA(d?d.dataset.name:s.wsId)+'»</b>'+
      '<button class="act print" id="bwqBack" type="button">✅ تم — رجوع لقائمة الأوراق</button>'+
      '<button class="act" id="bwqCancelAll" type="button">✕ التراجع عن كل تعديلات هذه الجلسة</button></div>';
    d.querySelectorAll('.q').forEach(function(q){
      var el=q.querySelector('[data-k]'); if(!el) return;
      var key=el.dataset.k;
      var txtEl=q.querySelector('.txt');
      var t=txtEl?txtEl.firstChild.textContent.replace(/\s+$/,''):'';
      var ans=el.dataset.show||el.dataset.ans||'—';
      out+='<div class="row" data-bwqrow="'+key+'"><span class="txt-cell">'+escA(t)+'</span>'+
        '<span class="ans-wrap"><span class="ans-hidden">••••</span><span class="ans-val" hidden>'+escA(ans)+'</span>'+
        '<button class="reveal" type="button">👁️ الإجابة</button></span>'+
        '<button class="edit" data-bwqedit="'+key+'">تعديل</button></div>';
    });
    $('bwList').innerHTML=out;
    $('bwqBack').addEventListener('click',function(){ bwQSession=null; renderBwList(); });
    $('bwqCancelAll').addEventListener('click',function(){
      if(!confirm('التراجع عن كل التعديلات التي أجريتها على أسئلة هذه الورقة في هذه الجلسة؟')) return;
      var wsId=s.wsId, d2=document.getElementById('w-'+wsId);
      s.snapshot.forEach(function(row){
        var el=d2.querySelector('[data-k="'+row.key+'"]'); if(!el) return;
        var q=el.closest('.q'), txtEl=q.querySelector('.txt');
        if(txtEl&&txtEl.firstChild){ txtEl.firstChild.textContent=row.t+' '; syncQI18n(txtEl.firstChild, wsId); }
        if(row.ans!==undefined) el.dataset.ans=row.ans; else delete el.dataset.ans;
        if(row.show!==undefined) el.dataset.show=row.show; else delete el.dataset.show;
        if(row.mode!==undefined) el.dataset.mode=row.mode; else delete el.dataset.mode;
      });
      if(WS_OVERRIDES[wsId]) delete WS_OVERRIDES[wsId].questions;
      saveOverrides();
      bwQSession=null; renderBwList();
      msg('↩️ أُلغيت كل تعديلات أسئلة هذه الجلسة',true);
    });
    $('bwList').querySelectorAll('.reveal').forEach(function(b){
      b.addEventListener('click',function(){
        var wrap=b.closest('.ans-wrap'), h=wrap.querySelector('.ans-hidden'), v=wrap.querySelector('.ans-val');
        var show=v.hidden; v.hidden=!show; h.hidden=show; b.textContent=show?'🙈 إخفاء':'👁️ الإجابة';
      });
    });
    $('bwList').querySelectorAll('[data-bwqedit]').forEach(function(b){
      b.addEventListener('click',function(){ startEditBwQuestion(b.dataset.bwqedit); });
    });
  }
  function startEditBwQuestion(key){
    var s=bwQSession; if(!s) return;
    var d=document.getElementById('w-'+s.wsId);
    var el=d.querySelector('[data-k="'+key+'"]'); if(!el) return;
    var q=el.closest('.q'), txtEl=q.querySelector('.txt');
    var curT=txtEl?txtEl.firstChild.textContent.replace(/\s+$/,''):'';
    var curAns=el.dataset.show||el.dataset.ans||'';
    var row=$('bwList').querySelector('[data-bwqrow="'+key+'"]');
    row.innerHTML='<label class="edit-field">نص السؤال <input type="text" class="ed-t" value="'+escA(curT)+'"></label>'+
      '<label class="edit-field">الإجابة/الإجابة النموذجية <input type="text" class="ed-a" value="'+escA(curAns)+'"></label>'+
      '<button class="act print ed-save" type="button">💾 حفظ</button>'+
      '<button class="act ed-cancel" type="button">إلغاء</button>';
    row.querySelector('.ed-cancel').addEventListener('click',renderBwQuestionList);
    row.querySelector('.ed-save').addEventListener('click',function(){
      var t=row.querySelector('.ed-t').value.trim();
      var a=row.querySelector('.ed-a').value.trim();
      if(!t) return;
      var edit={t:t};
      if(a){ edit.show=a; edit.ans=(a.length<=16)?norm(a):undefined; }
      else { edit.show=''; }
      var res=applyQuestionEdit(d, key, edit);
      WS_OVERRIDES[s.wsId]=WS_OVERRIDES[s.wsId]||{};
      WS_OVERRIDES[s.wsId].questions=WS_OVERRIDES[s.wsId].questions||{};
      WS_OVERRIDES[s.wsId].questions[key]=edit;
      saveOverrides();
      renderBwQuestionList();
      msg(res&&res.i18nWarning ? '⚠️ حُفظ التعديل — '+res.i18nWarning : '✅ حُفظ تعديل السؤال', !(res&&res.i18nWarning));
    });
  }
  renderBwList();
  applyHidden();
  applyOverrides();
  function startEditBuiltin(id){
    var d=document.getElementById('w-'+id); if(!d) return;
    editingBuiltinId=id; editingWsIdx=-1;
    $('nwSuraPick').value='';
    $('nwCat').value=d.dataset.cat; toggleAyaField();
    $('nwNum').value=d.dataset.surano||'';
    $('nwAyat').value=d.dataset.ayat||'';
    $('nwAya').value=d.dataset.ayano||'';
    $('nwAyaTo').value='';
    var extraMatch=(d.dataset.name||'').match(/\(([^)]+)\)\s*$/);
    $('nwNameExtra').value=extraMatch?extraMatch[1]:'';
    computeNwName();
    $('nwVerse').value='(نص الورقة الأصلية — غير قابل للتعديل هنا)';
    $('nwVerse').disabled=true; $('nwAyaMark').disabled=true;
    var inf=d.querySelector('.sheet-head .info'); $('nwInfo').value=inf?inf.textContent:'';
    var fv=d.querySelector('.sheet-foot .fv'); $('nwFootV').value=fv?fv.textContent:'';
    var fm=d.querySelector('.sheet-foot .fm'); $('nwFootM').value=fm?fm.textContent:'';
    var acVar=(d.style.getPropertyValue('--ac')||'').replace(/var\(|\)/g,'').trim();
    $('nwHue').value=acVar||'--teal';
    var heads=d.querySelectorAll('.sec .sec-head h3');
    $('nwSec0').value=heads[0]?heads[0].textContent:'';
    $('nwSec1').value=heads[1]?heads[1].textContent:'';
    $('nwSec2').value=heads[2]?heads[2].textContent:'';
    $('nwSave').textContent='💾 حفظ تعديلات العنوان والوصف';
    $('nwCancelEdit').hidden=false;
    nwMsg('تعديل ورقة أصلية «'+d.dataset.name+'» — العنوان والوصف واللون وعناوين الأقسام فقط (نص الآيات محمي)',true);
    try{ $('nwName').focus(); panel.scrollTop=0; }catch(e){}
  }
  /* ---------- إعدادات عامة: إظهار الإجابة الصحيحة تلقائيًا بعد إجابة خاطئة ---------- */
  (function(){
    var box=$('setShowAnsMistake'); if(!box) return;
    var cur;
    try{ cur=JSON.parse(localStorage.getItem('tahleel-settings')||'{}'); }catch(e){ cur={}; }
    box.checked = cur.showAnswerOnMistake!==false;
    box.addEventListener('change',function(){
      var s; try{ s=JSON.parse(localStorage.getItem('tahleel-settings')||'{}'); }catch(e){ s={}; }
      s.showAnswerOnMistake=box.checked;
      try{ localStorage.setItem('tahleel-settings', JSON.stringify(s)); }catch(e){}
    });
  })();
  renderNwList();
  function fillTypeOptions(){
    var sec=+($('admSec').value||0);
    var ids=SECTION_TYPE_MAP[sec]||TYPES.map(function(t){return t.id;});
    var cur=$('admType').value;
    $('admType').innerHTML='';
    ids.forEach(function(id){
      var t=TYPES.filter(function(x){return x.id===id;})[0]; if(!t) return;
      var o=document.createElement('option'); o.value=t.id; o.textContent=t.label; $('admType').appendChild(o);
    });
    if(cur && ids.indexOf(cur)>-1) $('admType').value=cur;
    renderFields();
    renderAdmList();
  }
  function renderFields(){
    var t=TYPES.filter(function(x){return x.id===$('admType').value;})[0];
    $('admFields').innerHTML=t.fields.map(function(f){
      if(f.type==='select') return '<label>'+f.label+' <select data-f="'+f.k+'">'+f.opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>';}).join('')+'</select></label>';
      return '<label>'+f.label+' <input type="text" data-f="'+f.k+'"></label>';
    }).join('');
    $('admPrev').hidden=true; msg('');
  }
  $('admType').addEventListener('change',renderFields); renderFields();
  function params(){ var p={}; $('admFields').querySelectorAll('[data-f]').forEach(function(el){p[el.dataset.f]=el.value;}); return p; }
  function makeQ(){
    var t=TYPES.filter(function(x){return x.id===$('admType').value;})[0];
    var r=t.gen(params(), $('admWs').value);
    return r;
  }
  function msg(s,ok){ $('admMsg').textContent=s; $('admMsg').className='admin-msg '+(s?(ok?'ok':'err'):''); }
  $('admPreview').addEventListener('click',function(){
    var r=makeQ();
    if(typeof r==='string'){ msg(r,false); $('admPrev').hidden=true; return; }
    $('admPrev').textContent='السؤال: '+r.t+(r.show?'  —  الإجابة: '+r.show:'');
    $('admPrev').hidden=false; msg('');
  });
  $('admAdd').addEventListener('click',function(){
    var ws=$('admWs').value, r=makeQ();
    if(typeof r==='string'){ msg(r,false); return; }
    if(isDup(ws,r.t)){ msg('⚠️ هذا السؤال موجود مسبقًا في هذه الورقة — لن تتم إضافته مرة أخرى.',false); return; }
    r.sec=+$('admSec').value||0;
    (CUSTOM[ws]=CUSTOM[ws]||[]).push(r);
    saveCustom(); renderCustomAll();
    if(window.renderNwList) window.renderNwList();
    refreshStats();
    msg('✅ تمت إضافة السؤال إلى '+wsName(ws),true);
  });
  function renderAdmList(){
    var curWs=$('admWs').value, curSec=+($('admSec').value||0);
    var items=(CUSTOM[curWs]||[]).map(function(it,idx){ return {it:it, idx:idx}; })
      .filter(function(x){ return (+(x.it.sec||0))===curSec; });
    var out='';
    items.forEach(function(x){
      var it=x.it, idx=x.idx;
      var ans=it.show||it.ans||'—';
      out+='<div class="row" data-row="'+curWs+':'+idx+'"><b>'+escA(wsName(curWs))+'</b><span class="txt-cell">'+escA(it.t)+'</span>'+
        '<span class="ans-wrap"><span class="ans-hidden">••••</span><span class="ans-val" hidden>'+escA(ans)+'</span>'+
        '<button class="reveal" type="button">👁️ الإجابة</button></span>'+
        '<button class="edit" data-ws="'+curWs+'" data-i="'+idx+'">تعديل</button>'+
        '<button class="del" data-ws="'+curWs+'" data-i="'+idx+'">حذف</button></div>';
    });
    var secLabel=($('admSec').selectedOptions[0]||{}).textContent||'';
    $('admListHead').textContent='الأسئلة المضافة في «'+wsName(curWs)+'» — '+secLabel+' ('+toArD2(items.length)+')';
    $('admList').innerHTML=out||'<div class="row">لا توجد أسئلة مضافة في هذا القسم من هذه الورقة بعد.</div>';
    $('admList').querySelectorAll('.reveal').forEach(function(b){
      b.addEventListener('click',function(){
        var wrap=b.closest('.ans-wrap');
        var h=wrap.querySelector('.ans-hidden'), v=wrap.querySelector('.ans-val');
        var show=v.hidden;
        v.hidden=!show; h.hidden=show;
        b.textContent=show?'🙈 إخفاء':'👁️ الإجابة';
      });
    });
    $('admList').querySelectorAll('.edit').forEach(function(b){
      b.addEventListener('click',function(){ startEditQuestion(b.dataset.ws,+b.dataset.i); });
    });
    $('admList').querySelectorAll('.del').forEach(function(b){
      b.addEventListener('click',function(){
        CUSTOM[b.dataset.ws].splice(+b.dataset.i,1);
        if(!CUSTOM[b.dataset.ws].length) delete CUSTOM[b.dataset.ws];
        saveCustom(); renderCustomAll();
      });
    });
  }
  window.renderAdmList=renderAdmList;
  /* ---------- تعديل سؤال مضاف: تحرير نصّ السؤال وإجابته مباشرة داخل القائمة ---------- */
  function startEditQuestion(ws,idx){
    var it=(CUSTOM[ws]||[])[idx]; if(!it) return;
    var row=$('admList').querySelector('[data-row="'+ws+':'+idx+'"]'); if(!row) return;
    var curAns=it.show||it.ans||'';
    row.innerHTML='<b>'+escA(wsName(ws))+'</b>'+
      '<label class="edit-field">نص السؤال <input type="text" class="ed-t" value="'+escA(it.t)+'"></label>'+
      '<label class="edit-field">الإجابة/الإجابة النموذجية <input type="text" class="ed-a" value="'+escA(curAns)+'"></label>'+
      '<button class="act print ed-save" type="button">💾 حفظ</button>'+
      '<button class="act ed-cancel" type="button">إلغاء</button>';
    row.querySelector('.ed-cancel').addEventListener('click',renderAdmList);
    row.querySelector('.ed-save').addEventListener('click',function(){
      var t=row.querySelector('.ed-t').value.trim();
      var a=row.querySelector('.ed-a').value.trim();
      if(!t) return;
      it.t=t;
      if(a){
        if(it.ans!==undefined || (!it.dyn && a.length<=16)){ it.ans=norm(a); it.mode='contains'; }
        it.show=a;
      } else { delete it.ans; delete it.show; }
      saveCustom(); renderCustomAll();
      msg('✅ حُفظت تعديلات السؤال',true);
    });
  }
  if($('admToggleAns')) $('admToggleAns').addEventListener('click',function(){
    var vals=$('admList').querySelectorAll('.ans-val'), anyHidden=false;
    vals.forEach(function(v){ if(v.hidden) anyHidden=true; });
    $('admList').querySelectorAll('.ans-wrap').forEach(function(w){
      var h=w.querySelector('.ans-hidden'), v=w.querySelector('.ans-val'), b=w.querySelector('.reveal');
      v.hidden=!anyHidden; h.hidden=anyHidden;
      b.textContent=anyHidden?'🙈 إخفاء':'👁️ الإجابة';
    });
  });

  /* ---------- قوالب أسئلة جاهزة لكل قسم ---------- */
  var SECTION_TEMPLATES={
    0:['wordCount','letterCount','count','freqL','freqW','dots'],
    1:['hasLetter','startsLetter','endsLetter','firstLetter','lastLetter','lamType'],
    2:['copy','firstWord','lastWord','task']
  };
  function bestLetter(ws){
    var counts={}; vNorm(ws).join('').split('').forEach(function(c){
      if('اأإآءئؤى'.indexOf(c)>-1) return; counts[c]=(counts[c]||0)+1;
    });
    var best=null,bn=0; Object.keys(counts).forEach(function(c){ if(counts[c]>bn){bn=counts[c];best=c;} });
    return best;
  }
  function autoParams(id,ws){
    var o=vOrig(ws); if(!o.length) return null;
    var first=o[0];
    var longestW=o.reduce(function(a,b){return lettersOf(b).length>lettersOf(a).length?b:a;},o[0]);
    switch(id){
      case 'wordCount': case 'letterCount': case 'firstWord': case 'lastWord': case 'longest': return {};
      case 'count': case 'dots': case 'freqW': case 'firstLetter': case 'lastLetter': return {word:first};
      case 'freqL': case 'hasLetter': case 'startsLetter': case 'endsLetter': {
        var L=bestLetter(ws)||norm(first)[0]; return L?{letter:L}:null;
      }
      case 'lamType': {
        var withAl=o.filter(function(w){
          var n=norm(w); return n.indexOf('ال')===0 || ['و','ف','ب','ل','ك'].some(function(p){return n.indexOf(p+'ال')===0;});
        })[0];
        return withAl?{word:withAl}:null;
      }
      case 'scramble': return lettersOf(longestW).length>=3?{word:longestW}:null;
      case 'copy': return {text:o.slice(0,Math.min(3,o.length)).join(' ')};
      case 'task': return {q:'اقرأ النص بطلاقة 3 مرات'};
      default: return {};
    }
  }
  function addTemplate(sec){
    var ws=$('admWs').value; if(!ws) return;
    var ids=SECTION_TEMPLATES[sec]||[];
    var added=0, skipped=0;
    ids.forEach(function(id){
      var t=TYPES.filter(function(x){return x.id===id;})[0]; if(!t) return;
      var p=autoParams(id,ws); if(!p){ skipped++; return; }
      var r=t.gen(p,ws);
      if(typeof r==='string'){ skipped++; return; }
      if(isDup(ws,r.t)){ skipped++; return; }
      r.sec=sec;
      (CUSTOM[ws]=CUSTOM[ws]||[]).push(r); added++;
    });
    saveCustom(); renderCustomAll();
    if(window.renderNwList) window.renderNwList();
    refreshStats();
    msg('✅ أُضيف '+toArD2(added)+' سؤالًا جاهزًا لهذا القسم'+(skipped?(' — تخطّي '+toArD2(skipped)+' (مكرر أو غير ممكن آليًا)'):''),true);
  }
  if($('admTpl0')) $('admTpl0').addEventListener('click',function(){ addTemplate(0); });
  if($('admTpl1')) $('admTpl1').addEventListener('click',function(){ addTemplate(1); });
  if($('admTpl2')) $('admTpl2').addEventListener('click',function(){ addTemplate(2); });
  if($('admTplAll')) $('admTplAll').addEventListener('click',function(){ addTemplate(0); addTemplate(1); addTemplate(2); });
  window.__exportHtml=function(){
    var json=JSON.stringify(CUSTOM).replace(/</g,'\\u003c');
    var jsonw=JSON.stringify(CUSTOMWS).replace(/</g,'\\u003c');
    var html=ORIGINAL_HTML
      .replace(/(<script type="application\/json" id="customq">)[\s\S]*?(<\/script>)/, '$1'+json+'$2')
      .replace(/(<script type="application\/json" id="customws">)[\s\S]*?(<\/script>)/, '$1'+jsonw+'$2')
      .replace(/<body class="[^"]*"/, '<body');
    return html;
  };
  $('admExport').addEventListener('click',function(){
    try{
      var blob=new Blob([window.__exportHtml()],{type:'text/html;charset=utf-8'});
      var a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='التحليل-اللغوي-المجهري-محدث.html';
      document.body.appendChild(a); a.click(); a.remove();
      msg('✅ تم تنزيل نسخة تحتوي كل الأسئلة المضافة — استخدمها بدل الملف القديم.',true);
    }catch(e){ msg('تعذر التنزيل في هذا المتصفح: '+e.message,false); }
  });

  /* ---------- تصدير/استيراد كل الأسئلة بالجملة (للمدير فقط) ---------- */
  function importMsg(s,ok){ if($('admImportMsg')){ $('admImportMsg').textContent=s||''; $('admImportMsg').className='admin-msg '+(s?(ok?'ok':'err'):''); } }
  function collectAllQuestions(){
    var out=[];
    document.querySelectorAll('.ws-item').forEach(function(d){
      var wsId=d.id.slice(2);
      var secs=d.querySelectorAll('.sec');
      d.querySelectorAll('.q').forEach(function(q){
        var el=q.querySelector('[data-k]'); if(!el) return;
        var txtEl=q.querySelector('.txt');
        var secIdx=0;
        for(var i=0;i<secs.length;i++){ if(secs[i].contains(q)){ secIdx=i; break; } }
        out.push({
          ws: wsId,
          name: d.dataset.name,
          key: el.dataset.k,
          sec: secIdx,
          t: txtEl?txtEl.firstChild.textContent.replace(/\s+$/,''):'',
          show: el.dataset.show||'',
          ans: el.dataset.ans!==undefined?el.dataset.ans:null,
          lvl: q.dataset.lvl||''
        });
      });
    });
    return out;
  }
  if($('admExportAll')) $('admExportAll').addEventListener('click',function(){
    try{
      var data=collectAllQuestions();
      var blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json;charset=utf-8'});
      var a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='tahleel-all-questions.json';
      document.body.appendChild(a); a.click(); a.remove();
      importMsg('✅ صُدِّر '+toArD2(data.length)+' سؤالًا من كل الأوراق.',true);
    }catch(e){ importMsg('تعذر التصدير: '+e.message,false); }
  });
  var pendingImportRows=null;
  if($('admImportFile')) $('admImportFile').addEventListener('change',function(){
    var f=$('admImportFile').files[0];
    pendingImportRows=null; $('admImportApply').disabled=true;
    if(!f) return;
    var reader=new FileReader();
    reader.onload=function(){
      try{
        var rows=JSON.parse(reader.result);
        if(!Array.isArray(rows)) throw new Error('الملف ليس قائمة أسئلة صالحة');
        pendingImportRows=rows;
        $('admImportApply').disabled=false;
        importMsg('📄 جاهز للتطبيق: '+toArD2(rows.length)+' سؤالًا من الملف. اضغط «تطبيق التحديثات» للمتابعة.',true);
      }catch(e){ importMsg('تعذرت قراءة الملف: '+e.message,false); }
    };
    reader.readAsText(f);
  });
  if($('admImportApply')) $('admImportApply').addEventListener('click',function(){
    if(!pendingImportRows) return;
    if(!confirm('سيُطبَّق تحديث نص/إجابة '+pendingImportRows.length+' سؤالًا من الملف على هذا المتصفح. متابعة؟')) return;
    var applied=0, skipped=0;
    pendingImportRows.forEach(function(row){
      var d=document.getElementById('w-'+row.ws); if(!d||!row.key){ skipped++; return; }
      var el=d.querySelector('[data-k="'+row.key+'"]'); if(!el){ skipped++; return; }
      var edit={t:row.t};
      if(row.show){ edit.show=row.show; if(row.ans!==undefined&&row.ans!==null) edit.ans=row.ans; }
      else { edit.show=''; }
      applyQuestionEdit(d, row.key, edit);
      if(d.classList.contains('ws-custom')){
        var m=row.key.match(/^.+-c-(\d+)$/);
        if(m && CUSTOM[row.ws] && CUSTOM[row.ws][+m[1]]){
          CUSTOM[row.ws][+m[1]].t=row.t;
          if(row.show){ CUSTOM[row.ws][+m[1]].show=row.show; if(row.ans!==undefined&&row.ans!==null) CUSTOM[row.ws][+m[1]].ans=norm(row.ans); }
        }
      } else {
        WS_OVERRIDES[row.ws]=WS_OVERRIDES[row.ws]||{};
        WS_OVERRIDES[row.ws].questions=WS_OVERRIDES[row.ws].questions||{};
        WS_OVERRIDES[row.ws].questions[row.key]=edit;
      }
      applied++;
    });
    saveOverrides(); saveCustom();
    pendingImportRows=null; $('admImportApply').disabled=true; $('admImportFile').value='';
    renderBwList(); renderAdmList();
    importMsg('✅ طُبِّق التحديث على '+toArD2(applied)+' سؤالًا'+(skipped?(' — تخطّي '+toArD2(skipped)+' لم يُعثر لها على مطابقة'):''),true);
  });
} else { window.renderAdmList=function(){}; }
renderCustomWs();
renderCustomAll();
refreshStats();
