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
    if(last&&!endMark) return escA(s);
    return escA(s)+' <span class="aya">۝'+toArD2(start+i)+'</span>';
  }).join(' ');
  var loc = ws.cat==='surah'
    ? [ws.num?'السورة رقم '+toArD2(ws.num)+' في المصحف':'', ws.ayat?'عدد آياتها '+toArD2(ws.ayat):''].filter(Boolean).join(' · ')
    : [ws.aya?'الآية '+toArD2(ws.aya):'', ws.num?'(السورة رقم '+toArD2(ws.num)+' في المصحف)':''].filter(Boolean).join(' ');
  var ltag = ws.cat==='surah' ? (ws.num?'السورة '+toArD2(ws.num):'') : (ws.aya?'الآية '+toArD2(ws.aya):'');
  var secs=(ws.secs||[]).map(function(t,i){
    return '<section class="sec"><div class="sec-head"><span class="lens-badge">'+(['١','٢','٣'][i]||(i+1))+'</span>'+
      '<h3>'+escA(t)+'</h3><span class="rule"></span></div><div class="qlist"></div></section>';
  }).join('');
  var mf=function(lbl,k){ return '<div class="mf"><label>'+lbl+'</label><input type="text" data-mf="'+k+'" title="يُطبَّق على جميع الأوراق"></div>'; };
  return '<details class="ws-item ws-custom" id="w-'+ws.id+'" style="--ac:var('+(ws.hue||'--teal')+')" data-cat="'+ws.cat+'" data-name="'+escA(ws.name)+'" data-words="'+words+'">'+
    '<summary class="card">'+
      '<div class="tagrow"><span class="tag">'+(ws.cat==='surah'?'سورة كاملة':'آية مختارة')+'</span>'+
      (ltag?'<span class="loc-tag">📍 '+escA(ltag)+'</span>':'')+'<span class="loc-tag new">جديدة</span></div>'+
      '<h3>'+escA(ws.name)+'</h3>'+
      '<div class="vpeek">﴿ '+vHTML+' ﴾</div>'+
      '<div class="cmeta"><span class="prog-mini">0 سؤالًا</span><span class="go">افتح الورقة ▾</span></div>'+
    '</summary>'+
    '<div class="ws">'+
      '<div class="ws-top">'+
        '<button class="act close" data-close="'+ws.id+'">▲ إغلاق</button><div class="spacer"></div>'+
        '<button class="act reset" data-reset="'+ws.id+'">تفريغ الإجابات</button>'+
        '<button class="act print" data-print="'+ws.id+'">🖨️ طباعة الورقة</button>'+
      '</div>'+
      '<article class="sheet">'+
        '<header class="sheet-head"><div class="lab-line">التحليل اللغوي المجهري</div>'+
          '<h2>'+escA(ws.name)+'</h2>'+
          '<div class="info">'+escA(ws.info||'')+'</div>'+
          (loc?'<div class="loc">📍 '+escA(loc)+'</div>':'')+
          '<div class="meta-fields">'+mf('الاسم / اسم الباحث','name')+mf('التاريخ','date')+mf('المستوى','level')+mf('الدرجة','grade')+'</div>'+
        '</header>'+
        '<div class="verse-wrap"><div class="verse"><p>﴿ '+vHTML+' ﴾</p></div></div>'+
        '<div class="progress js-only"><div class="pbar"><i data-pfill="'+ws.id+'" style="width:0%"></i></div>'+
          '<b data-ptxt="'+ws.id+'">0 / 0</b><b class="score" data-score="'+ws.id+'"></b></div>'+
        secs+
        '<footer class="sheet-foot"><div class="fv">'+escA(ws.footV||'')+'</div>'+
          (ws.footM?'<div class="fm">'+escA(ws.footM)+'</div>':'')+'</footer>'+
      '</article>'+
      '<div class="ws-close"><button class="act" data-close="'+ws.id+'">▲ إغلاق الورقة</button></div>'+
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
  });
  refreshStats();
}
/* تحديث أرقام الصفحة الرئيسية بعد الإضافة */
function refreshStats(){
  var all=document.querySelectorAll('.ws-item');
  var qs=document.querySelectorAll('.q').length;
  var s=0,a=0;
  all.forEach(function(d){ if(d.dataset.cat==='surah') s++; else a++; });
  var set=function(k,v){ var el=document.querySelector('[data-stat="'+k+'"]'); if(el) el.textContent=v; };
  set('ws',all.length); set('surah',s); set('ayah',a); set('q',qs);
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
  if(item.ui==='seg') field='<input type="text" class="seg" data-k="'+key+'" data-ui="seg" data-parts="'+item.parts.join(',')+'"'+ansAttr+showAttr+' placeholder="اكتب الحروف — تُفصَل بـ + تلقائيًا" autocomplete="off">';
  else if(item.ui==='num') field='<input type="text" data-k="'+key+'" data-ui="num" inputmode="numeric"'+ansAttr+showAttr+' placeholder="اكتب العدد...">';
  else if(item.ui==='check') field='<div class="checkrow"><label><input type="checkbox" data-k="'+key+'"> تم ✓</label></div>';
  else if(item.ui==='mcq'){
    field='<div class="mcqopts">'+item.opts.map(function(o,i){return '<label><input type="radio" name="'+key+'" value="'+i+'"> '+escA(o)+'</label>';}).join('')+'</div>'+
      '<input type="hidden" data-k="'+key+'" data-ui="text"'+ansAttr+showAttr+'>';
  } else field='<input type="text" data-k="'+key+'" data-ui="text"'+ansAttr+dynAttr+showAttr+modeAttr+' placeholder="اكتب إجابتك...">';
  var lv=rateItem(item);
  return '<div class="q custom" data-lvl="'+lv+'"><span class="num">'+n+'</span><div class="body"><div class="txt">'+escA(item.t)+
    ' <span class="lvl lvl-'+lv+'">'+LVL_LABELS[lv-1]+'</span></div>'+field+'<div class="hint" hidden></div></div></div>';
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
function renderCustomAll(){
  document.querySelectorAll('.q.custom').forEach(function(el){el.remove();});
  Object.keys(CUSTOM).forEach(function(ws){
    var det=document.getElementById('w-'+ws); if(!det) return;
    var secs=det.querySelectorAll('.sec .qlist');
    var base=det.querySelectorAll('.q').length;
    (CUSTOM[ws]||[]).forEach(function(item,idx){
      var target=secs[Math.min(item.sec||0,secs.length-1)];
      var key=ws+'-c-'+idx;
      target.insertAdjacentHTML('beforeend', qHTML(item,key,base+idx+1));
    });
    bindQ(det); updateProg(ws);
    var pm=det.querySelector('.prog-mini'); if(pm) pm.textContent=det.querySelectorAll('.q').length+' سؤالًا';
  });
  renderAdmList();
  if(window.applyLvlFilter) window.applyLvlFilter();
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
   كلمة مرور صفحة المدير (ثابتة) — لتغييرها: عدّل السطر التالي ثم npm run build
   تنبيه: التحقق يجري في المتصفح، فهو يمنع الأطفال من الدخول عرضًا،
   ولا يُعدّ حماية أمنية (يمكن قراءة كلمة المرور من مصدر الصفحة).
   ======================================================================= */
var ADMIN_PASS='mijhar1447';
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
  $('nwSuraPick').addEventListener('change',function(){
    var opt=$('nwSuraPick').selectedOptions[0]; if(!opt||!opt.value) return;
    $('nwNum').value=opt.value;
    if($('nwCat').value==='surah'){
      $('nwName').value='سورة '+opt.dataset.name;
      $('nwAyat').value=opt.dataset.ayat;
    } else {
      $('nwName').value='سورة '+opt.dataset.name+' — الآية';
      $('nwAyat').value=opt.dataset.ayat;
      try{ $('nwAya').focus(); }catch(e){}
    }
  });

  /* ---------- نموذج إضافة/تعديل سورة أو آية ---------- */
  function nwMsg(s,ok){ $('nwMsg').textContent=s||''; $('nwMsg').className='admin-msg '+(s?(ok?'ok':'err'):''); }
  function slugId(){
    var i=1, id;
    do{ id='ws'+i; i++; }while(document.getElementById('w-'+id));
    return id;
  }
  function toggleAyaField(){ $('nwAyaWrap').style.display = ($('nwCat').value==='ayah')?'':'none'; }
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
    ['nwName','nwNum','nwAyat','nwAya','nwVerse','nwInfo','nwFootV','nwFootM'].forEach(function(id){ $(id).value=''; });
    $('nwSec0').value='أولًا: لغة الأرقام'; $('nwSec1').value='ثانيًا: مهارات الاستخراج'; $('nwSec2').value='ثالثًا: التدبر والنسخ';
    $('nwCat').value='surah'; toggleAyaField();
    $('nwSuraPick').value='';
    nwMsg('');
  }
  function startEditWs(i){
    var ws=CUSTOMWS[i]; if(!ws) return;
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
  $('nwCancelEdit').addEventListener('click',function(){
    editingWsIdx=-1; $('nwSave').textContent='💾 حفظ الورقة والانتقال للأسئلة'; $('nwCancelEdit').hidden=true;
    resetWsForm();
  });
  $('nwClear').addEventListener('click',function(){
    editingWsIdx=-1; $('nwSave').textContent='💾 حفظ الورقة والانتقال للأسئلة'; $('nwCancelEdit').hidden=true;
    resetWsForm();
  });
  $('nwSave').addEventListener('click',function(){
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
    var out='';
    Object.keys(CUSTOM).forEach(function(ws){
      (CUSTOM[ws]||[]).forEach(function(it,idx){
        var ans=it.show||it.ans||'—';
        out+='<div class="row" data-row="'+ws+':'+idx+'"><b>'+escA(wsName(ws))+'</b><span class="txt-cell">'+escA(it.t)+'</span>'+
          '<span class="ans-wrap"><span class="ans-hidden">••••</span><span class="ans-val" hidden>'+escA(ans)+'</span>'+
          '<button class="reveal" type="button">👁️ الإجابة</button></span>'+
          '<button class="edit" data-ws="'+ws+'" data-i="'+idx+'">تعديل</button>'+
          '<button class="del" data-ws="'+ws+'" data-i="'+idx+'">حذف</button></div>';
      });
    });
    $('admList').innerHTML=out||'<div class="row">لا توجد أسئلة مضافة بعد.</div>';
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
} else { window.renderAdmList=function(){}; }
renderCustomWs();
renderCustomAll();
refreshStats();
