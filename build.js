const fs=require('fs');
const path=require('path');
const R=p=>fs.readFileSync(path.join(__dirname,p),'utf8');
const W=JSON.parse(R('src/data/worksheets.json'));
const css=R('src/css/main.css');
const extraCSSFile=R('src/css/ui.css');
const adminCss=R('src/css/admin.css');
const responsiveCss=R('src/css/responsive.css');
const js=R('src/js/app.js');
let adminJs=R('src/js/admin.js');
const adminHtml=R('src/partials/admin.html');
const VERSION='1.1.0';
const BUILD_DATE=new Date().toISOString().slice(0,10);
const PROD = process.env.NODE_ENV==='production' || process.argv.includes('--prod');

/* ================= كلمة مرور المدير: قابلة للتهيئة عبر متغيّر بيئة =================
   عند البناء للإنتاج، مرّر ADMIN_PASS كمتغيّر بيئة بدل الاعتماد على القيمة الافتراضية
   المكتوبة في المصدر (مقروءة من أي شخص يفتح كود الصفحة، وهذا متوقّع ومذكور في الوثائق):
     ADMIN_PASS=كلمة-سر-قوية npm run build -- --prod
   ================================================================================= */
const DEFAULT_ADMIN_PASS='change-me-set-ADMIN_PASS-env-var';
const ADMIN_PASS = process.env.ADMIN_PASS || DEFAULT_ADMIN_PASS;
if(PROD && ADMIN_PASS===DEFAULT_ADMIN_PASS){
  console.warn('⚠️  تحذير: بناء إنتاجي بكلمة مرور المدير الافتراضية. مرّر ADMIN_PASS=... لتغييرها.');
}
adminJs = adminJs.replace(/var ADMIN_PASS='[^']*';/, "var ADMIN_PASS="+JSON.stringify(ADMIN_PASS)+";");

/* ================= Arabic helpers (build-time) ================= */
const DIAC=/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]/g;
const PUNCT=/[﴿﴾«»()،:؟\.!ۚۖۗۘۙۛۜ۩\u06DD]/g;
const stripD=s=>String(s).replace(DIAC,'');
const norm=s=>stripD(String(s)).replace(PUNCT,'').replace(/[ٱآأإ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
/* أرقام الآيات لكل مقطع — تُذكر صراحةً حين لا تكون متتالية (مقاطع مختارة) */
const AYA_SEQ={
  takwir:[1,2,3,4,5,6,19,20],   // ٦ آيات ثم مقطع من ١٩ و ٢٠
  alaq:[1,2,3,4,5,6,7,8,19],    // ٨ آيات ثم خاتمة الآية ١٩
  sharh56:[5,6],
  anbiya87:[87,88],
  adam30:[30,31,32,33,34],
  nar69:[68,69,70],
  hudhud20:[20,21,22,23,24,25,26],
  jalut249:[249,250,251],
  ayyub83:[83,84],
  zakariya2:[2,3,4,5,6,7,8,9,10,11]
};
function ayaNumbers(w,count){
  if(AYA_SEQ[w.id]) return AYA_SEQ[w.id];
  const start=AYA_NUM[w.id]?arNum(AYA_NUM[w.id]):1;
  return Array.from({length:count},(_,i)=>start+i);
}
/* علامة نهاية الآية ۝ مع رقمها داخلها (خط أميري يُدرج الرقم داخل الزخرفة) */
/* أوراق الآيات التي ينتهي نصّها عند نهاية الآية (تُختم بعلامة مرقّمة)،
   أما ما ينتهي في وسط الآية (كمطلع آية الكرسي) فلا علامة ختام له. */
const AYA_END={fatiha1:1,baqara201:1,sharh56:1,ibrahim7:1,hadid3:1,hashr22:1,nahl90:1,anbiya87:1,kahf9:1,adam30:1,nar69:1,hudhud20:1,jalut249:1,ayyub83:1,zakariya2:1};
function verseHTML(w){
  const segs=esc(w.verse).split('۝').map(p=>p.trim()).filter(Boolean);
  const nums=ayaNumbers(w,segs.length);
  const endMark=w.cat==='surah'||!!AYA_END[w.id];
  return segs.map((s,i)=>{
    const last=i===segs.length-1;
    const n=nums[i]!==undefined?nums[i]:i+1;
    if(last&&!endMark) return '<span class="aya-seg" data-aya="'+n+'">'+s+'</span>';
    return '<span class="aya-seg" data-aya="'+n+'">'+s+' <span class="aya" aria-label="آية '+toAr(n)+'">۝'+toAr(n)+'</span></span>';
  }).join(' ');
}
const arDigits='٠١٢٣٤٥٦٧٨٩';
const toAr=n=>String(n).split('').map(d=>/\d/.test(d)?arDigits[+d]:d).join('');
const arNum=s=>parseInt(String(s).replace(/[٠-٩]/g,d=>String(arDigits.indexOf(d))),10);
const DOTS={'ب':1,'ت':2,'ث':3,'ج':1,'خ':1,'ذ':1,'ز':1,'ش':3,'ض':1,'ظ':1,'غ':1,'ف':1,'ق':2,'ن':1,'ي':2,'ة':2,'ئ':2,'ؤ':1};
const SUN='تثدذرزسشصضطظلن';
const LEX=JSON.parse(R('src/data/lexicon.json'));
const ANSWERS=JSON.parse(R('src/data/answers.json'));
/* نص القرآن الكريم كاملًا (١١٤ سورة) — لتعبئة صفحة المدير تلقائيًا عند اختيار سورة */
const QURAN_FULL=R('src/data/quran-full.json');
/* قاموس ترجمة واجهة الموقع (الأزرار والتسميات فقط) — النصوص القرآنية والأسئلة تبقى عربية دائمًا */
const I18N_LANGS=['en','ur','tr','ug'];
const I18N=JSON.stringify(Object.fromEntries(I18N_LANGS.map(l=>[l,JSON.parse(R('src/data/i18n/'+l+'.json'))])));
/* أسماء سور القرآن بالترتيب — لأسئلة «السورة السابقة/التالية» ورقم السورة */
const SURA_NAMES=['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
/* أسماء الحروف → الحرف نفسه */
const LETTER_NAMES={'الألف':'ا','الباء':'ب','التاء':'ت','الثاء':'ث','الجيم':'ج','الحاء':'ح','الخاء':'خ','الدال':'د','الذال':'ذ','الراء':'ر','الزاي':'ز','السين':'س','الشين':'ش','الصاد':'ص','الضاد':'ض','الطاء':'ط','الظاء':'ظ','العين':'ع','الغين':'غ','الفاء':'ف','القاف':'ق','الكاف':'ك','اللام':'ل','الميم':'م','النون':'ن','الهاء':'ه','الواو':'و','الياء':'ي'};
/* عدد آيات السورة التي تنتمي إليها الورقة */
const AYAT={falaq:5,shams:15,teen:8,takwir:29,ghashiya:26,masad:5,kafirun:6,nasr:3,takathur:8,bayyina:8,adiyat:11,quraysh:4,alaq:19,asr:3,zalzala:8,feel:5,kawthar:3,qaria:11,nas:6,fatiha1:7,ikhlas:4,nahl90:128,duha:11,layl:21,balad:20,qadr:5,humaza:9,maun:7,tariq:17,infitar:19,fajr:30,naba:40,naziat:46,abasa:42,mutaffifin:36,inshiqaq:25,buruj:22,aala:19,sharh:8};
const SURA_OF={fatiha1:'الفاتحة',kursi:'البقرة',baqara201:'البقرة',baqara286:'البقرة',sharh56:'الشرح',ibrahim7:'ابراهيم',talaq3:'الطلاق',hadid3:'الحديد',hashr22:'الحشر',ikhlas:'الإخلاص',nahl90:'النحل',anbiya87:'الأنبياء',yusuf4:'يوسف',qasas7:'القصص',nur35:'النور',kahf9:'الكهف',adam30:'البقرة',nar69:'الأنبياء',hudhud20:'النمل',jalut249:'البقرة',ayyub83:'الأنبياء',zakariya2:'مريم'};
const AYA_NUM={kursi:'255',baqara201:'201',baqara286:'286',ibrahim7:'7',talaq3:'3',hadid3:'3',hashr22:'22',fatiha1:'1',nahl90:'90',yusuf4:'4',qasas7:'7',nur35:'35',kahf9:'9',adam30:'30',nar69:'68',hudhud20:'20',jalut249:'249',ayyub83:'83',zakariya2:'2'};
/* نص بديل لموضع الآية عندما لا يكون رقمًا واحدًا */
const AYA_TXT={sharh56:'الآيتان ٥ و ٦',anbiya87:'الآيتان ٨٧ و ٨٨',kahf9:'الآيات ٩-١٢',adam30:'الآيات ٣٠-٣٤',nar69:'الآيات ٦٨-٧٠',hudhud20:'الآيات ٢٠-٢٦',jalut249:'الآيات ٢٤٩-٢٥١',ayyub83:'الآيتان ٨٣ و ٨٤',zakariya2:'الآيات ٢-١١'};
/* رقم السورة في المصحف (لكل ورقة: السورة نفسها أو السورة التي منها الآية) */
const SURA_NO={
  fatiha1:1, kursi:2, baqara201:2, baqara286:2, ibrahim7:14, nahl90:16, talaq3:65, hadid3:57, hashr22:59,
  takwir:81, ghashiya:88, shams:91, sharh56:94, teen:95, alaq:96, bayyina:98, zalzala:99, adiyat:100,
  qaria:101, takathur:102, asr:103, feel:105, quraysh:106, kawthar:108, kafirun:109, nasr:110, masad:111,
  ikhlas:112, falaq:113, nas:114, balad:90, layl:92, duha:93, anbiya87:21,
  qadr:97, humaza:104, maun:107, tariq:86, infitar:82, yusuf4:12, qasas7:28,
  fajr:89, nur35:24, kahf9:18,
  adam30:2, nar69:21, hudhud20:27, jalut249:2, ayyub83:21, zakariya2:19,
  naba:78, naziat:79, abasa:80, mutaffifin:83, inshiqaq:84, buruj:85, aala:87, sharh:94
};
/* سطر الموقع المعروض في رأس الورقة وعلى البطاقة (نص عربي خام، للبحث/التصدير) */
function locText(w){
  const n=SURA_NO[w.id];
  if(w.cat==='surah'){
    const parts=[];
    if(n) parts.push('السورة رقم '+toAr(n)+' في المصحف');
    if(AYAT[w.id]) parts.push('عدد آياتها '+toAr(AYAT[w.id]));
    return parts.join(' · ');
  }
  const parts=[];
  if(AYA_TXT[w.id]) parts.push(AYA_TXT[w.id]);
  else if(AYA_NUM[w.id]) parts.push('الآية '+toAr(AYA_NUM[w.id]));
  if(SURA_OF[w.id]) parts.push('من سورة '+SURA_OF[w.id]);
  if(n) parts.push('(السورة رقم '+toAr(n)+' في المصحف)');
  return parts.join(' ');
}
/* نفس سطر الموقع، لكن مقسّمًا إلى مقاطع قابلة للترجمة كل على حدة (رقم السورة،
   عدد الآيات، اسم السورة...). نطاقات الآيات غير المنتظمة (AYA_TXT، كـ"الآيتان
   ٨٧ و ٨٨") تبقى عربية حاليًا — حالات قليلة (٩ أوراق) غير نمطية. */
function locHTML(w){
  const n=SURA_NO[w.id];
  if(w.cat==='surah'){
    const parts=[];
    if(n) parts.push(`<span data-i18n-tpl="السورة رقم {} في المصحف" data-i18n-word="${toAr(n)}">السورة رقم ${toAr(n)} في المصحف</span>`);
    if(AYAT[w.id]) parts.push(`<span data-i18n-tpl="عدد آياتها {}" data-i18n-word="${toAr(AYAT[w.id])}">عدد آياتها ${toAr(AYAT[w.id])}</span>`);
    return parts.join(' · ');
  }
  const parts=[];
  if(AYA_TXT[w.id]) parts.push(esc(AYA_TXT[w.id]));
  else if(AYA_NUM[w.id]) parts.push(`<span data-i18n-tpl="الآية {}" data-i18n-word="${toAr(AYA_NUM[w.id])}">الآية ${toAr(AYA_NUM[w.id])}</span>`);
  if(SURA_OF[w.id]) parts.push(`<span data-i18n-tpl="من سورة {}" data-i18n-word="${esc(SURA_OF[w.id])}">من سورة ${esc(SURA_OF[w.id])}</span>`);
  if(n) parts.push(`(<span data-i18n-tpl="السورة رقم {} في المصحف" data-i18n-word="${toAr(n)}">السورة رقم ${toAr(n)} في المصحف</span>)`);
  return parts.join(' ');
}
/* اسم الورقة قابل للترجمة جزئيًا: "سورة X" أو "سورة X — Y" — تُترجَم كلمة
   «سورة» واسم السورة X عبر القاموس، بينما يبقى الوصف الإضافي Y (نطاق الآية
   ونحوه) عربيًا حاليًا؛ مقتطف تدريجي أفضل من عدم الترجمة إطلاقًا. */
function nameHTML(w){
  const m=w.name.match(/^سورة (.+?)(?: — (.+))?$/);
  if(!m) return esc(w.name);
  return `<span data-i18n="surahWord">سورة</span> <span data-i18n-name="${esc(m[1])}">${esc(m[1])}</span>${m[2]?' — '+esc(m[2]):''}`;
}
function locTag(w){
  const n=SURA_NO[w.id];
  if(w.cat==='surah') return n?('السورة '+toAr(n)):'';
  const a=AYA_NUM[w.id];
  return (SURA_OF[w.id]||'')+(a?' '+toAr(a):'');
}
/* بطاقة الموقع المختصرة على الغلاف — مقسّمة لمقاطع قابلة للترجمة كسابقتها */
function locTagHTML(w){
  const n=SURA_NO[w.id];
  if(w.cat==='surah') return n?`<span data-i18n-tpl="السورة {}" data-i18n-word="${toAr(n)}">السورة ${toAr(n)}</span>`:'';
  const a=AYA_NUM[w.id];
  const suraPart = SURA_OF[w.id] ? `<span data-i18n-name="${esc(SURA_OF[w.id])}">${esc(SURA_OF[w.id])}</span>` : '';
  return suraPart+(a?' '+toAr(a):'');
}

function verseWordsOrig(w){ // original (with diacritics), Quran-mark-free
  return w.verse.replace(/۝/g,' ').replace(/[ۚۖۗۘۙۛۜ۩﴿﴾]/g,'').split(/\s+/).filter(Boolean);
}
function verseWordsNorm(w){ return verseWordsOrig(w).map(norm); }
function letters(word){ return stripD(word).replace(/[ـ\s\-،()]/g,'').split(''); }
function inParens(q){ const mm=q.match(/[(]([^)]+)[)]/); return mm?mm[1].trim():null; }
function lettersFromParens(q){ const p=inParens(q); if(!p) return null;
  const ls=stripD(p).replace(/ـ/g,'').split(/[\s\-–]+/).filter(x=>x&&/[\u0621-\u064A]/.test(x));
  return ls.length>1?ls:null; }
function countWordFreq(w,word){
  const t=norm(word), vw=verseWordsNorm(w); let c=0;
  vw.forEach(x=>{ if(x===t||['و','ف','ب','ك','ل'].some(p=>x===p+t)) c++; });
  return c;
}
function findWindow(w,wordsGiven){
  const vw=verseWordsNorm(w), g=wordsGiven.map(norm), k=g.length;
  const key=a=>a.slice().sort().join('|');
  const strip=x=>x.replace(/^[وفبكل]/,'');
  const gk=key(g), gks=key(g.map(strip));
  for(let i=0;i+k<=vw.length;i++){
    const win=vw.slice(i,i+k);
    if(key(win)===gk||key(win.map(strip))===gks) return win.join(' ');
  }
  return null;
}
/* ================= classifier ================= */
function classify(q,w){
  const vN=norm(w.verse.replace(/۝/g,' '));
  const vWordsN=verseWordsNorm(w);
  const qs=stripD(q);   // نص السؤال بلا تشكيل — لمطابقة «شدّة/شِدَّة» ونحوها
  const dynLen=k=>{
    const ow=verseWordsOrig(w);
    const ex=ow.find(x=>letters(x).length===k);
    if(!ex) return {ui:'text'};
    return {ui:'text',dyn:'len:'+k,show:'مثال: '+ex};
  };
  const dyn=(kind,extra)=>{
    // find an example word for the hint
    const ow=verseWordsOrig(w), nw=vWordsN;
    let ex=null;
    for(let i=0;i<ow.length;i++){ if(dynTest(kind,extra,ow[i],nw[i])){ ex=ow[i]; break; } }
    if(!ex) return {ui:'text'}; // nothing in verse satisfies → don't grade
    return {ui:'text',dyn:kind+(extra?':'+extra:''),show:'مثال: '+ex};
  };
  if(q.includes('ارسم')) return {ui:'draw'};
  if(q.includes('✓')) return {ui:'check'};
  // أنشطة أداء لا إجابة مكتوبة لها → تُعلَّم بعلامة ✓
  if(/^قراءة عكسية|^قراءة بطلاقة|^ردد|^لوّن|^اقرأ|بخط جميل/.test(q)) return {ui:'act'};

  /* أكمل: … ___  → إكمال كلمة أو الكلمة التالية في الآية */
  let mm=q.match(/^أكمل\s*:\s*(.+)$/);
  if(mm){
    const ow=verseWordsOrig(w);
    const full=mm[1].replace(/[﴿﴾]/g,'');
    const raw=(full.split('_')[0]||full).trim();            // ما قبل الفراغ
    const glued=norm(raw.replace(/[ـ\s]/g,''));
    const strip=x=>x.replace(/^[وفبكل]/,'');
    // ١) إكمال كلمة واحدة: النـفـّاثـا___ → النفاثات (وتقبل سابقة و/ف/ب/ك/ل)
    if(glued.length>1){
      let i=vWordsN.findIndex(x=>x.startsWith(glued));
      if(i>-1) return {ui:'text',ans:vWordsN[i],show:ow[i]};
      i=vWordsN.findIndex(x=>strip(x).startsWith(glued)&&strip(x).length>1);
      if(i>-1) return {ui:'text',ans:strip(vWordsN[i]),show:ow[i]};
    }
    // ٢) كلمات متتالية ثم فراغ: «والليل إذا ___» → الكلمة التالية في الآية
    const pw=norm(raw).split(' ').filter(Boolean);
    if(pw.length>1){
      for(let i=0;i+pw.length<=vWordsN.length;i++){
        if(pw.every((t,k)=>vWordsN[i+k]===t)){
          const j=i+pw.length;
          if(j<vWordsN.length) return {ui:'text',ans:vWordsN[j],show:ow[j]};
        }
      }
    }
    // ٣) بداية كلمتين متجاورتين: «حُنفاء مُخلِ___» / «ر سـ و ل كـ ر يـ ___»
    if(pw.length>1){
      for(let i=0;i<vWordsN.length;i++){
        for(let k=1;k<=3&&i+k<=vWordsN.length;k++){
          const win=vWordsN.slice(i,i+k).join('');
          if(win.startsWith(glued)){
            return {ui:'text',ans:vWordsN.slice(i,i+k).join(' '),show:ow.slice(i,i+k).join(' ')};
          }
        }
      }
    }
  }
  // letter decomposition: "الشتاء : __ + __" or "حَسَنَة : _ _ _ _"
  mm=q.match(/^(\S+)\s*:\s*(.*_.*)$/);
  if(mm && /_/.test(mm[2]) && !/سؤال|أكمل/.test(q)){
    const word=mm[1].replace(/[:،]/g,'');
    const ls=letters(word);
    const blanks=(mm[2].match(/_+/g)||[]).length;
    let parts;
    if(blanks===2 && norm(word).startsWith('ال') && ls.length>3) parts=[2,ls.length-2];
    else parts=ls.map(()=>1);
    return {ui:'seg', parts, ans:norm(ls.join('')), show:(parts.length===2&&parts[0]===2)?('ال + '+stripD(word).slice(2)):ls.join(' + ')};
  }
  // تحليل كلمة (خـ - سـ - ر) أو (الرحمن) ككلمة واحدة
  if(/تحليل/.test(q)){
    const ls=lettersFromParens(q);
    if(ls) return {ui:'seg', parts:ls.map(()=>1), ans:norm(ls.join('')), show:ls.join(' + ')};
    const p=inParens(q);
    if(p){
      const l2=letters(p);
      if(l2.length>1){
        const isAl=norm(p).startsWith('ال')&&l2.length>3;
        const parts=isAl?[2,l2.length-2]:l2.map(()=>1);
        return {ui:'seg',parts,ans:norm(l2.join('')),show:isAl?('ال + '+stripD(p).slice(2)):l2.join(' + ')};
      }
    }
  }
  // سؤال رقم (4) هو؟ → نص السؤال الرابع في الورقة نفسها (مفتاح فقط)
  mm=q.match(/^سؤال رقم\s*[«(]?\s*([٠-٩0-9]+)\s*[)»]?/);
  if(mm){
    const i=arNum(mm[1]), all=w.secs.reduce((a,s)=>a.concat(s.q),[]);
    if(all[i-1]) return {ui:'text',show:all[i-1]};
    return {ui:'text',show:'لا يوجد سؤال بهذا الرقم في الورقة (عدد الأسئلة '+toAr(all.length)+')'};
  }
  /* ---- أنواع جديدة: موقع السورة، ترتيب الكلمات، الأطول، عدد الحروف ---- */
  // الكلمة رقم (٣) في السورة / في الآية
  mm=q.match(/الكلمة\s+رقم\s*[(]?\s*([٠-٩0-9]+)\s*[)]?/);
  if(mm){
    const i=arNum(mm[1]), ow=verseWordsOrig(w);
    if(i>=1&&i<=ow.length) return {ui:'text',ans:vWordsN[i-1],show:ow[i-1]};
    return {ui:'text'};
  }
  // أطول كلمة في السورة/الآية (تُصحَّح آليًا إذا كانت وحيدة)
  if(/أطول كلمة/.test(q)){
    const ow=verseWordsOrig(w); let best=[],len=-1;
    ow.forEach(x=>{ const L=letters(x).length; if(L>len){len=L;best=[x];} else if(L===len) best.push(x); });
    const uniq=[...new Set(best.map(norm))];
    if(uniq.length===1) return {ui:'text',ans:uniq[0],show:best[0]};
    return {ui:'text'};
  }
  // رقم السورة في المصحف
  if(/رقم\s+(?:هذه\s+)?السورة|رقم\s+سورة\s+\S+/.test(q) && SURA_NO[w.id]){
    return {ui:'num',ans:SURA_NO[w.id],show:toAr(SURA_NO[w.id])};
  }
  // عدد حروف السورة / الآية
  if(/عدد حروف\s*(?:السورة|الآية|الآيتين)/.test(q)){
    const n=verseWordsOrig(w).reduce((s,x)=>s+letters(x).length,0);
    return {ui:'num',ans:n,show:toAr(n)};
  }
  // حروف كلمة (x) = / عدد حروف (x)
  mm=q.match(/(?:عدد\s+)?حروف(?:\s+كلمة)?\s*[(]([^)]+)[)]/);
  if(mm){ const n=letters(mm[1]).length; return {ui:'num', ans:n, show:toAr(n)}; }
  // كم (ن) في كلمة (الإنسان)؟
  mm=q.match(/كم\s*[(](.)[)]\s*في كلمة\s*[(]([^)]+)[)]/);
  if(mm){ const n=norm(mm[2]).split('').filter(c=>c===norm(mm[1])).length; return {ui:'num',ans:n,show:toAr(n)}; }
  // عدد النقاط في كلمة (x)
  mm=q.match(/عدد النقاط في كلمة\s*[(]([^)]+)[)]/);
  if(mm){ const n=stripD(mm[1]).split('').reduce((s,c)=>s+(DOTS[c]||0),0); return {ui:'num',ans:n,show:toAr(n)}; }
  // عدد كلمات السورة/الآية/الآيتين
  if(/عدد كلمات/.test(q)){
    if(w.id==='alaq') return {ui:'text'};
    const n=vWordsN.length; return {ui:'num',ans:n,show:toAr(n)};
  }
  // عدد آيات
  if(/عدد آيات/.test(q)){
    if(AYAT[w.id] && /السورة/.test(q)) return {ui:'num',ans:AYAT[w.id],show:toAr(AYAT[w.id])};
    if(/البقرة/.test(q)) return {ui:'num',ans:286,show:'٢٨٦'};
    if(/الشرح/.test(q)) return {ui:'num',ans:8,show:'٨'};
    return {ui:'text'};
  }
  // تكرار حرف (x) بآخر الآيات = → عدد الآيات المنتهية بهذا الحرف
  mm=q.match(/تكرار\s+(?:حرف\s*)?[«(]\s*(\S+?)\s*[)»]\s*بآخر الآيات/);
  if(mm){
    const L=stripD(mm[1]).replace(/ـ/g,'');
    const segs2=w.verse.split('۝').map(s=>s.trim()).filter(Boolean);
    const n=segs2.filter(s=>{ const ws2=norm(s).split(' ').filter(Boolean); const lw=ws2[ws2.length-1]||''; return lw.endsWith(L)||(L==='ا'&&/[اى]$/.test(lw)); }).length;
    return {ui:'num',ans:n,show:toAr(n)};
  }
  // تكرار كلمة (x) — وتقبل البدائل: (وتب / تَب)
  mm=q.match(/تكرار\s+كلمة\s*[(]([^)]+)[)]/);
  if(mm){
    const forms=mm[1].split('/').map(s=>s.trim()).filter(Boolean);
    const n=forms.reduce((a,f)=>a+countWordFreq(w,f),0);
    if(n>0) return {ui:'num',ans:n,show:toAr(n)};
    return {ui:'text'};
  }
  // عدد المرات التي ورد فيها (مَنْ)
  mm=q.match(/عدد المرات التي ورد(?:ت)? فيها\s*[«(]([^)»]+)[)»]/);
  if(mm){ const n=countWordFreq(w,mm[1]); if(n>0) return {ui:'num',ans:n,show:toAr(n)}; }
  // تكرار فعل/لفظ (x) = → مثل تكرار كلمة
  mm=q.match(/تكرار\s+(?:فعل|لفظ)\s*[«(]([^)»]+)[)»]/);
  if(mm){ const n=countWordFreq(w,mm[1]); if(n>0) return {ui:'num',ans:n,show:toAr(n)}; }
  // كم مرة ورد اسم (رب)؟ / كم مرة تكرر (ولا أنتم)؟ / كم مرة ذُكر اسم (الله)
  mm=q.match(/كم مرة\s+(?:ورد|تكرر|تكررت|ذُكر|ذكر)\s*(?:اسم|لفظ|كلمة)?\s*[«(]([^)»]+)[)»]/);
  if(mm){
    const ph=norm(mm[1]);
    if(ph.includes(' ')){ let c=0,i=0; while((i=vN.indexOf(ph,i))>-1){c++;i+=ph.length;} if(c>0) return {ui:'num',ans:c,show:toAr(c)}; }
    else { const n=countWordFreq(w,mm[1]); if(n>0) return {ui:'num',ans:n,show:toAr(n)}; }
  }
  // تكرار واو الجماعة (وا) = / تكرار الميم الساكنة (ـهم) =
  mm=q.match(/تكرار\s+(?:واو الجماعة|الميم الساكنة|النون|الهاء)\s*[«(]\s*(\S+?)\s*[)»]/);
  if(mm){
    const t=norm(mm[1].replace(/ـ/g,''));
    const n=vWordsN.filter(x=>x.endsWith(t)).length;
    if(n>0) return {ui:'num',ans:n,show:toAr(n)};
  }
  // كلمات تبدأ بـ ( عـ ) = → عدد الكلمات المبتدئة بحرف معيّن
  mm=q.match(/^كلمات\s+تبدأ\s+بـ?\s*[«(]\s*(\S+?)\s*[)»]/);
  if(mm){
    const L=stripD(mm[1]).replace(/ـ/g,'');
    if(L.length===1){ const n=vWordsN.filter(x=>x.startsWith(L)).length; return {ui:'num',ans:n,show:toAr(n)}; }
  }
  // تكرار (phrase)
  mm=q.match(/^تكرار\s*[(]([^)]+)[)]/);
  if(mm && !/كلمة|حرف|فعل|واو|الميم/.test(q)){
    const ph=norm(mm[1]); let c=0,i=0;
    while((i=vN.indexOf(ph,i))>-1){c++;i+=ph.length;}
    if(c>0) return {ui:'num',ans:c,show:toAr(c)};
    return {ui:'text'};
  }
  // تكرار حرف (x) — plain only
  mm=q.match(/(?:تكرار\s+حرف|حرف)\s*[(]\s*(\S+?)\s*[)]/);
  if(mm && /تكرار|كم مرة/.test(q) && !/بآخر|آية\s*[«(]?[٠-٩0-9]|واو الجماعة|الميم الساكنة|فعل/.test(q)){
    const L=stripD(mm[1]).replace(/ـ/g,'');
    if(L.length===1 && !'اأإآءئؤى'.includes(L)){
      const n=vN.split('').filter(c=>c===L).length;
      if(n>0) return {ui:'num',ans:n,show:toAr(n)};
    }
    // الألف والهمزة: تُعدّ بالحرف نفسه كما رُسم في الآية (دون توحيد)
    if(L.length===1 && 'اأإآءئؤى'.includes(L)){
      const plain=stripD(w.verse).replace(/[۝ۚۖۗۘۙۛۜ۩﴿﴾\s]/g,'');
      const n=plain.split('').filter(c=>c===L).length;
      if(n>0) return {ui:'num',ans:n,show:toAr(n)};
    }
    return {ui:'text'};
  }
  // ادمج / وصل (letters)
  if(/ادمج|وصل/.test(q)){
    const ls=lettersFromParens(q);
    if(ls){ const word=ls.join(''); return {ui:'text',ans:norm(word),show:word}; }
  }
  // انسخ / إملاء
  mm=q.match(/(?:انسخ|إملاء)\s*:\s*[(]([^)]+)[)]/);
  if(mm) return {ui:'text',ans:norm(mm[1]),show:mm[1].trim()};
  // رتب
  mm=q.match(/رتب\s*:?\s*[(]([^)]+)[)]/);
  if(mm){ const words=mm[1].split(/[-–]/).map(s=>s.trim()).filter(Boolean);
    const ansStr=findWindow(w,words);
    if(ansStr) return {ui:'text',ans:ansStr,show:ansStr};
    return {ui:'text'};
  }
  // first/last word of surah (تسمح بالمسافات: «أول كلمة في السورة؟»)
  if(/أول كلمة\s*(?:في|ب)\s*(?:السورة|الآية)|أول كلمة بالسورة/.test(q)) return {ui:'text',ans:vWordsN[0],show:verseWordsOrig(w)[0]};
  if(/آخر كلمة\s*(?:في|ب)\s*(?:السورة|الآية)|آخر كلمة بالسورة|بماذا تنتهي السورة|خاتمة السورة بكلمة|خاتمة الآية بكلمة|آخر كلمة:$/.test(q)){
    const o=verseWordsOrig(w); return {ui:'text',ans:vWordsN[vWordsN.length-1],show:o[o.length-1]};
  }
  if(/^أول كلمة:$/.test(q.trim())) return {ui:'text',ans:vWordsN[0],show:verseWordsOrig(w)[0]};
  // آخر حرف في الآية
  if(/آخر حرف في الآية/.test(q)){ const lw=vWordsN[vWordsN.length-1]; return {ui:'text',ans:lw.slice(-1),show:lw.slice(-1)}; }
  // first/last letter of (word)
  mm=q.match(/أول\s*[(]([^)]+)[)]\s*حرف|أول حرف في\s*(?:كلمة\s*)?[(]([^)]+)[)]/);
  if(mm){ const word=(mm[1]||mm[2]); const L=norm(word)[0]; return {ui:'text',ans:L,show:L}; }
  mm=q.match(/آخر\s*[(]([^)]+)[)]\s*حرف|آخر حرف في\s*(?:كلمة\s*)?[(]([^)]+)[)]/);
  if(mm){ const word=(mm[1]||mm[2]); const nn=norm(word); return {ui:'text',ans:nn.slice(-1),show:nn.slice(-1)}; }
  /* ================= معجم: معنى / مضاد / جمع / مفرد / مرادف ================= */
  // المعاني: إجابة نموذجية (شرح) — لا تُصحَّح آليًا لأن للطفل صياغته الخاصة
  mm=q.match(/^(?:ما\s+)?معنى\s*[«(]([^)»]+)[)»]/) || q.match(/^ما\s+(?:هو|هي)\s*[«(]([^)»]+)[)»]/)
    || q.match(/^معنى\s*[«(]([^)»]+)[)»]/) || q.match(/^ما\s+معنى\s+(البسملة|التكاثر)/);
  if(mm){ const g=LEX.meaning[mm[1].trim()]||LEX.meaning[stripD(mm[1].trim())]; if(g) return {ui:'text',show:g}; }
  // المضاد / الضد / العكس — كلمة واحدة تُصحَّح آليًا
  mm=q.match(/^(?:ما\s+)?(?:مضاد|ضد|عكس)\s*(?:كلمة\s*)?[«(]([^)»]+)[)»]/);
  if(mm){ const a=LEX.opp[mm[1].trim()]||LEX.opp[stripD(mm[1].trim())];
    if(a) return a.length>14?{ui:'text',show:a}:{ui:'text',ans:norm(a),show:a,mode:'contains'}; }
  mm=q.match(/^جمع\s*(?:كلمة\s*)?[«(]([^)»]+)[)»]/);
  if(mm){ const a=LEX.plural[mm[1].trim()]||LEX.plural[stripD(mm[1].trim())];
    if(a) return {ui:'text',ans:norm(a),show:a,mode:'contains'}; }
  mm=q.match(/^مفرد\s*(?:كلمة\s*)?[«(]([^)»]+)[)»]/);
  if(mm){ const a=LEX.single[mm[1].trim()]||LEX.single[stripD(mm[1].trim())];
    if(a) return {ui:'text',ans:norm(a),show:a,mode:'contains'}; }
  mm=q.match(/^مرادف\s*(?:كلمة\s*)?[«(]([^)»]+)[)»]/);
  if(mm){ const a=LEX.syn[mm[1].trim()]||LEX.syn[stripD(mm[1].trim())];
    if(a) return {ui:'text',ans:norm(a),show:a,mode:'contains'}; }

  /* ================= قواعد محسوبة إضافية ================= */
  // فصّل: الرَّحمن =   → تقسيم إلى حروف
  mm=q.match(/^فصّ?ل\s*:?\s*([^=\s]+)\s*=?\s*$/);
  if(mm){
    const ls=letters(mm[1]);
    if(ls.length>1){
      const isAl=norm(mm[1]).startsWith('ال')&&ls.length>3;
      const parts=isAl?[2,ls.length-2]:ls.map(()=>1);
      return {ui:'seg',parts,ans:norm(ls.join('')),show:isAl?('ال + '+stripD(mm[1]).slice(2)):ls.join(' + ')};
    }
  }
  // شكّل: X / شكّل كلمة (X) / شكّل حرف (ح) في (X) → الإجابة: الكلمة مشكَّلة من الآية
  if(/^شكّ?ل/.test(q)){
    const cand=[...q.matchAll(/[«(]([^)»]+)[)»]/g)].map(x=>x[1].trim());
    const bare=q.replace(/^شكّ?ل\s*(?:كلمة\s*)?:?\s*/,'').replace(/[«(][^)»]*[)»]/g,'').trim();
    const targets=cand.concat(bare?[bare]:[]);
    const ow=verseWordsOrig(w);
    for(const t of targets){
      const nt=norm(t); if(!nt||nt.length<2) continue;
      const hit=ow.find((o,i)=>vWordsN[i]===nt||vWordsN[i].replace(/^[وفبلك]/,'')===nt);
      if(hit) return {ui:'text',show:hit};
    }
  }
  // نوع الـ في (X): شمسية أم قمرية — محسوبة من الكلمة نفسها
  mm=q.match(/نوع\s*(?:الـ|ال|اللام)\s*في\s*[«(]([^)»]+)[)»]/);
  if(mm){
    let x=norm(mm[1]); ['و','ف','ب','ل','ك'].forEach(p=>{ if(x.startsWith(p+'ال')) x=x.slice(1); });
    if(x.startsWith('ال')&&x.length>2){
      const t=SUN.includes(x[2])?'شمسية':'قمرية';
      return {ui:'text',ans:t,show:'لام '+t,mode:'contains'};
    }
  }
  // كلمات تبدأ بـ (الـ) = / كلمات بها (ال) =  → عدد الكلمات المعرّفة
  if(/^كلمات\s+تبدأ\s+بـ?\s*[«(]\s*ال/.test(q)||/^كلمات\s+بها\s*[«(]\s*ال\s*[)»]/.test(q)||/كلمات بها \(الـ\) التعريف|كلمات بها \(ال\) التعريف/.test(q)){
    const n=vWordsN.filter(x=>{ let y=x; ['و','ف','ب','ل','ك'].forEach(p=>{ if(y.startsWith(p+'ال')) y=y.slice(1); }); return y.startsWith('ال')&&y.length>2; }).length;
    return {ui:'num',ans:n,show:toAr(n)};
  }
  // كلمات تنتهي بحرف (د) = / كلمات تنتهي بـ ( ـتْ ) =
  mm=q.match(/^كلمات\s+تنتهي\s+ب\S*\s*[«(]\s*(\S+?)\s*[)»]/);
  if(mm){
    const L=stripD(mm[1]).replace(/ـ/g,'');
    if(L.length===1){ const n=vWordsN.filter(x=>x.endsWith(L)||(L==='ه'&&x.endsWith('ة'))).length; return {ui:'num',ans:n,show:toAr(n)}; }
  }
  // كلمة بها (4) حروف = / كلمة من ٣ حروف / كلمة بها (٥) حرف =
  mm=q.match(/كلمة\s*(?:بها|من)\s*[«(]?\s*([٠-٩0-9]+)\s*[)»]?\s*(?:حروف|حرف)/);
  if(mm){ const k=arNum(mm[1]); if(k>=2) return dynLen(k); }
  if(/كلمة من حرفين/.test(q)) return dynLen(2);
  // تكرار لفظ/اسم الجلالة (الله)
  if(/تكرار\s*(?:لفظ|اسم)\s*الجلالة/.test(q)){ const n=countWordFreq(w,'الله'); return {ui:'num',ans:n,show:toAr(n)}; }
  // اسم السورة السابقة / التالية
  if(/السورة\s+السابقة|السورة\s+التي\s+قبلها/.test(q) && SURA_NO[w.id]>1){
    const nm=SURA_NAMES[SURA_NO[w.id]-2]; if(nm) return {ui:'text',ans:norm(nm),show:'سورة '+nm,mode:'contains'};
  }
  if(/السورة\s+التالية|السورة\s+التي\s+بعدها/.test(q) && SURA_NO[w.id]<114){
    const nm=SURA_NAMES[SURA_NO[w.id]]; if(nm) return {ui:'text',ans:norm(nm),show:'سورة '+nm,mode:'contains'};
  }
  if(/آخر سورة في القرآن/.test(q)) return {ui:'text',ans:norm('الناس'),show:'سورة الناس',mode:'contains'};
  if(/أول سورة في القرآن/.test(q)) return {ui:'text',ans:norm('الفاتحة'),show:'سورة الفاتحة',mode:'contains'};
  /* ---- أسئلة على مستوى الآية داخل السورة ---- */
  const segs=w.verse.split('۝').map(s=>s.trim()).filter(Boolean);
  const segNums=ayaNumbers(w,segs.length);
  const ordinal={'الأولى':1,'الثانية':2,'الثالثة':3,'الرابعة':4,'الخامسة':5,'السادسة':6,'السابعة':7,'الثامنة':8};
  const segIndexOf=txt=>{
    let m=txt.match(/آية\s*[«(]?\s*([٠-٩0-9]+)/); if(m){ const n=arNum(m[1]); const i=segNums.indexOf(n); return i>-1?i:(n<=segs.length?n-1:-1); }
    for(const k in ordinal) if(txt.includes(k)) return ordinal[k]-1;
    return -1;
  };
  // عدد الكلمات في آية # / عدد النقاط في الآية الأولى
  if(/عدد الكلمات في آية|عدد كلمات الآية\s*[«(]?[٠-٩0-9]/.test(q)){
    const i=segIndexOf(q);
    if(i>=0&&segs[i]){ const n=segs[i].split(/\s+/).filter(Boolean).length; return {ui:'num',ans:n,show:toAr(n)}; }
  }
  if(/عدد النقاط في الآية/.test(q)){
    const i=segIndexOf(q);
    if(i>=0&&segs[i]){ const n=stripD(segs[i]).split('').reduce((s,c)=>s+(DOTS[c]||0),0); return {ui:'num',ans:n,show:toAr(n)}; }
  }
  // تكرار حرف (x) في آية #
  mm=q.match(/تكرار حرف\s*[«(]\s*(\S+?)\s*[)»].*آية/);
  if(mm){
    const L=stripD(mm[1]).replace(/ـ/g,''), i=segIndexOf(q);
    if(L.length===1&&i>=0&&segs[i]&&!'اأإآءئؤى'.includes(L)){
      const n=norm(segs[i]).split('').filter(c=>c===L).length;
      return {ui:'num',ans:n,show:toAr(n)};
    }
  }
  // خاتمة الآية # بكلمة:
  if(/خاتمة الآية\s*[«(]?[٠-٩0-9]/.test(q)){
    const i=segIndexOf(q);
    if(i>=0&&segs[i]){ const ws2=segs[i].replace(/[ۚۖۗۘۙۛۜ۩]/g,'').split(/\s+/).filter(Boolean); const last=ws2[ws2.length-1];
      return {ui:'text',ans:norm(last),show:last}; }
  }
  // رقم آية (نص) / رقم آية «نص» / رقم آية السجدة
  mm=q.match(/^رقم آية\s*[«(]?\s*([^)»?]+)/);
  if(mm && !/السجدة/.test(mm[1])){
    const ph=norm(mm[1]);
    const i=segs.findIndex(s=>norm(s).includes(ph));
    if(i>-1) return {ui:'num',ans:segNums[i],show:toAr(segNums[i])};
  }
  if(/رقم آية السجدة/.test(q) && /۩/.test(w.verse)){
    const i=segs.findIndex(s=>s.includes('۩'));
    if(i>-1) return {ui:'num',ans:segNums[i],show:toAr(segNums[i])};
  }
  // كم آية تنتهي بـ (X)؟ / كم مرة انتهت الآيات بـ (X)؟
  mm=q.match(/(?:كم آية تنتهي|كم مرة انتهت الآيات)\s*بـ?\s*[«(]\s*(\S+?)\s*[)»]/);
  if(mm){
    const L=stripD(mm[1]).replace(/ـ/g,'');
    const n=segs.filter(s=>{ const ws2=norm(s).split(' ').filter(Boolean); const lw=ws2[ws2.length-1]||''; return L.length===1?lw.endsWith(L):lw.endsWith(norm(L)); }).length;
    if(n>0) return {ui:'num',ans:n,show:toAr(n)};
  }
  // أول/آخر كلمة حرفها (اسم الحرف)
  mm=q.match(/(أول|آخر)\s+كلمة\s+حرفها\s+(\S+)\s*:?/);
  if(mm){
    const L=LETTER_NAMES[mm[2].replace(/[:؟]/g,'')];
    if(L){
      const ow=verseWordsOrig(w);
      const idxs=vWordsN.map((x,i)=>x.includes(L)?i:-1).filter(i=>i>-1);
      if(idxs.length){ const i=mm[1]==='أول'?idxs[0]:idxs[idxs.length-1];
        return {ui:'text',ans:vWordsN[i],show:ow[i]}; }
    }
  }
  // surah name
  if(/ما اسم هذه السورة|^اسم السورة؟$/.test(q.trim())){
    let nm = SURA_OF[w.id] || norm(w.name).replace(/^سورة\s*/,'').split(' ')[0];
    return {ui:'text',ans:norm(nm),show:'سورة '+nm,mode:'contains'};
  }
  // ayah number
  if(/رقم الآية/.test(q) && AYA_NUM[w.id]) return {ui:'num',ans:+AYA_NUM[w.id],show:toAr(AYA_NUM[w.id])};
  /* ---- dynamic (verse-membership) checks ---- */
  mm=q.match(/كلمة بها حرف\s*[(]\s*(\S+?)\s*[)]/);
  if(mm){ const L=stripD(mm[1]).replace(/ـ/g,''); if(L.length===1) return dyn('has',L); }
  // كلمة بها مد (ا) = → وجود الحرف
  mm=q.match(/كلمة بها مد\s*[«(]\s*(\S+?)\s*[)»]/);
  if(mm){ const L=stripD(mm[1]).replace(/ـ/g,''); if(L.length===1) return dyn('has',L); }
  // ظواهر إملائية/تشكيلية إضافية
  // كلمة بها (الـ) التعريف / كلمة بها (ال) =
  if(/كلمة بها\s*[«(]\s*الـ?\s*[)»]|كلمة بها \(الـ\) التعريف/.test(q)) return dyn('al','');
  // كلمة بها (هاء) بآخرها / هاء الغائب
  if(/[«(]\s*هاء\s*[)»]\s*بآخرها|هاء الغائب/.test(qs)) return dyn('ends','ه');
  // كلمة بها (ى) / ألف مقصورة
  if(/كلمة بها\s*[«(]\s*ى\s*[)»]/.test(q)) return dyn('mark','maqsura');
  // كلمة بها (ألف خنجرية)
  if(/ألف خنجرية/.test(qs)) return dyn('mark','dagger');
  // كلمة بها (تنوين) / (فتح)
  if(/كلمة بها\s*[«(]\s*تنوين\s*[)»]/.test(qs)) return dyn('mark','tany');
  if(/كلمة بها\s*[«(]\s*فتح\s*[)»]/.test(qs)) return dyn('mark','fatha');
  // كلمة تبدأ بـ (إذ) / كلمة تبدأ بـ (أ) وتنتهي بـ (ن)
  mm=q.match(/كلمة\s+تبدأ\s+بـ?\s*[«(]\s*(\S+?)\s*[)»]\s*وتنتهي\s+بـ?\s*[«(]\s*(\S+?)\s*[)»]/);
  if(mm){
    const a=norm(mm[1]), b=norm(mm[2]);
    const ow=verseWordsOrig(w);
    const i=vWordsN.findIndex(x=>x.startsWith(a)&&x.endsWith(b));
    if(i>-1) return {ui:'text',ans:vWordsN[i],show:ow[i]};
  }
  mm=q.match(/كلمة\s+تبدأ\s+بـ\s*[«(]\s*(\S+?)\s*[)»]\s*$/);
  if(mm){
    const a=norm(mm[1].replace(/ـ/g,''));
    if(a.length>=1){
      const ow=verseWordsOrig(w);
      const i=vWordsN.findIndex(x=>x.startsWith(a));
      if(i>-1) return a.length===1?dyn('starts',a):{ui:'text',ans:vWordsN[i],show:ow[i]};
    }
  }
  // كلمة بها (غ) / (ث) / (ف) — بدون كلمة «حرف»
  mm=q.match(/^كلمة بها\s*[«(]\s*(\S)\s*[)»]\s*$/);
  if(mm && /[ء-ي]/.test(mm[1])) return dyn('has',stripD(mm[1]));
  if(/تاء مربوطة/.test(qs)) return dyn('mark','ta');
  if(/تاء مفتوحة/.test(qs)) return dyn('mark','tt');
  if(/ألف مقصورة/.test(qs)) return dyn('mark','maqsura');
  if(/ضمة/.test(qs)) return dyn('mark','damma');
  if(/فتحة/.test(qs)) return dyn('mark','fatha');
  if(/كسرة/.test(qs)) return dyn('mark','kasra');
  if(/(?:حرف|لام|ميم|نون)\s*مشدد|مشددة/.test(qs)) return dyn('mark','shadda');
  if(/حرف مكرر|مكرر فيها حرف|كلمة بها .* مكررة/.test(qs)){
    mm=q.match(/[«(]\s*(\S+?)\s*[)»]/);
    if(mm){ const L=stripD(mm[1]).replace(/ـ/g,''); if(L.length===1) return dyn('twice',L); }
  }
  mm=q.match(/كلمة تبدأ بحرف\s*[(]\s*(\S+?)\s*[)]/);
  if(mm){ const L=stripD(mm[1]).replace(/ـ/g,''); if(L.length===1) return dyn('starts',L); }
  mm=q.match(/كلمة تنتهي ب\S*\s*[(]\s*(\S+?)\s*[)]/);
  if(mm){ const L=stripD(mm[1]).replace(/ـ/g,''); if(L.length===1) return dyn('ends',L); }
  if(/شدة/.test(qs) && /استخرج|كلمة بها|كلمة فيها/.test(qs)) return dyn('mark','shadda');
  if(/تنوين كسر/.test(qs)) return dyn('mark','tk');
  if(/تنوين فتح/.test(qs)) return dyn('mark','tf');
  if(/تنوين ضم/.test(qs)) return dyn('mark','td');
  if(/كلمة بها تنوين|استخرج.*تنوين/.test(qs)) return dyn('mark','tany');
  if(/سكون/.test(qs) && /كلمة بها|استخرج/.test(qs)) return dyn('mark','sukun');
  if(/همزة/.test(qs) && /كلمة بها|استخرج/.test(qs)) return dyn('mark','hamza');
  if(/مد بالألف/.test(qs)) return dyn('has','ا');
  if(/مد بالواو/.test(qs)) return dyn('has','و');
  if(/مد بالياء/.test(qs)) return dyn('has','ي');
  if(/لام شمسية/.test(qs)) return dyn('lam','sun');
  if(/لام قمرية/.test(qs)) return dyn('lam','moon');
  if(/^استخرج|^هات|حوط|حوّط/.test(q)) {
    if(/حوط|حوّط/.test(q)) return {ui:'check2'}; // circle-on-sheet task → checkbox
    return dyn('inverse');
  }
  return {ui:'text'};
}
/* ================= مستوى صعوبة السؤال ================= */
const LEVELS=['بسيط','سهل','متوسط','صعب','صعب جدًا'];
function rateQ(q,c){
  if(c.ui==='check'||c.ui==='check2'||c.ui==='act') return 1;
  if(/^انسخ|^إملاء/.test(q)) return 1;
  if(c.ui==='draw') return 2;
  if(c.ui==='seg') return (c.parts&&c.parts.length>4)?3:2;
  if(c.ui==='num'){
    if(/عدد كلمات|عدد حروف|عدد آيات|رقم السورة|رقم سورة|رقم الآية|رقم آية|كلمات تبدأ|كلمات تنتهي|كلمات بها/.test(q)) return 3;
    if(/تكرار/.test(q)) return 3;
    return 2;                                  // حروف كلمة / عدد النقاط
  }
  if(c.dyn){
    const k=String(c.dyn).split(':')[0];
    if(k==='mark'||k==='lam'||k==='inverse'||k==='twice') return 4;
    return 3;                                  // has / starts / ends / len
  }
  if(c.ans!==undefined){
    if(/أول كلمة|آخر كلمة|خاتمة|أول حرف|آخر حرف/.test(q)) return 2;
    if(/مضاد|ضد|عكس|جمع|مفرد|مرادف|أطول كلمة/.test(q)) return 4;
    if(/^رتب|نوع\s*(?:الـ|ال|اللام)|الكلمة رقم|اسم السورة|السورة السابقة|السورة التالية/.test(q)) return 3;
    return 3;
  }
  // بلا تصحيح آلي
  if(/^شكّ?ل|^فصّ?ل|^سؤال رقم/.test(q)) return 3;
  if(/^معنى|ما معنى|^ما هو|^ما هي|مرادف|بمعنى/.test(q)) return 4;
  if(/لماذا|كيف|ما الفرق|ما الدرس|ماذا (?:تعلم|نتعلم|تفهم|تُعلِّمنا)|استدل|اذكر مثال|ما الحكمة|ما الرسالة|ما جزاء|هل /.test(q)) return 5;
  return 4;
}
function dynTest(kind,extra,orig,nrm){
  if(kind==='len') return stripD(orig).replace(/[ـ\s]/g,'').length===+extra;
  if(kind==='twice') return (nrm.split(extra).length-1)>=2;
  if(kind==='has') return nrm.includes(extra==='ا'?'ا':extra) || (extra==='ت'&&nrm.includes('ت'));
  if(kind==='starts') return nrm.startsWith(extra) || (nrm.length>1 && ['و','ف','ب','ل'].includes(nrm[0]) && nrm.slice(1).startsWith(extra));
  if(kind==='ends') return nrm.endsWith(extra) || (extra==='ه'&&nrm.endsWith('ة'));
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
    let x=nrm; ['و','ف','ب','ل','ك'].forEach(p=>{ if(x.startsWith(p+'ال')) x=x.slice(1); });
    return x.startsWith('ال')&&x.length>2;
  }
  if(kind==='lam'){
    let x=nrm; ['و','ف','ب','ل','ك'].forEach(p=>{ if(x.startsWith(p+'ال')) x=x.slice(1); });
    if(!x.startsWith('ال')||x.length<3) return false;
    const after=x[2];
    return extra==='sun' ? SUN.includes(after) : !SUN.includes(after);
  }
  if(kind==='inverse') return true;
  return false;
}

/* ================= generate ================= */
const totQ=W.reduce((s,w)=>s+w.secs.reduce((a,x)=>a+x.q.length,0),0);
const nS=W.filter(w=>w.cat==='surah').length, nA=W.filter(w=>w.cat==='ayah').length;
let graded=0, withKey=0;
const lvlTotals=[0,0,0,0,0];

const blocks=W.map((w,wi)=>{
  let n=0;
  const lvlCount=[0,0,0,0,0];
  const wordsJson=esc(JSON.stringify(verseWordsOrig(w).map(o=>[o,norm(o)])));
  const secs=w.secs.map((s,si)=>{
    const items=s.q.map((q,qi)=>{
      n++;
      const key=w.id+'-'+si+'-'+qi;
      const c=classify(q,w);
      /* مفتاح الإجابات اليدوي: يُستخدم لما لا يمكن حسابه من النص (فهم وتدبر) */
      if(c.ans===undefined && !c.dyn && !c.show && ['text','num','seg'].includes(c.ui||'text')){
        const a=(ANSWERS[w.id]||{})[q.trim()];
        if(a){
          if(String(a).length<=16){ c.ans=norm(a); c.show=a; c.mode='contains'; }
          else c.show=a;
        }
      }
      const lvl=rateQ(q,c);
      lvlCount[lvl-1]++; lvlTotals[lvl-1]++;
      if(c.show) withKey++;
      let field='';
      const ansAttr = c.ans!==undefined? ` data-ans="${esc(String(c.ans))}"` : '';
      const dynAttr = c.dyn? ` data-dyn="${esc(c.dyn)}"` : '';
      const showAttr= c.show? ` data-show="${esc(String(c.show))}"` : '';
      const modeAttr= c.mode? ` data-mode="${c.mode}"`:'';
      if(c.ans!==undefined||c.dyn) graded++;
      if(c.ui==='act'){
        field=`<div class="checkrow"><label><input type="checkbox" data-k="${key}"> أدّيتُ النشاط ✓</label></div>`;
      } else if(c.ui==='draw'){
        field=`<input type="text" data-k="${key}" placeholder="صف رسمتك هنا... (أو ارسم على الورقة المطبوعة)"><div class="drawbox">✏️ مساحة الرسم — على النسخة المطبوعة</div>`;
      } else if(c.ui==='check'){
        field=`<div class="checkrow"><label><input type="checkbox" data-k="${key}"> تم ✓</label></div>`;
      } else if(c.ui==='check2'){
        field=`<div class="checkrow"><label><input type="checkbox" data-k="${key}"> <span data-i18n="checkDone">تم التحويط على الورقة ✓</span></label></div>`;
      } else if(c.ui==='seg'){
        field=`<input type="text" class="seg" data-k="${key}" data-ui="seg" data-parts="${c.parts.join(',')}"${ansAttr}${showAttr} placeholder="اكتب الحروف — تُفصَل بـ + تلقائيًا" data-i18n-ph="segPh" autocomplete="off">`;
      } else if(c.ui==='num'){
        field=`<input type="text" data-k="${key}" data-ui="num" inputmode="numeric"${ansAttr}${showAttr} placeholder="اكتب العدد..." data-i18n-ph="numPh">`;
      } else {
        field=`<input type="text" data-k="${key}" data-ui="text"${ansAttr}${dynAttr}${showAttr}${modeAttr} placeholder="اكتب إجابتك..." data-i18n-ph="textPh">`;
      }
      /* دعم الترجمة: نفصل الكلمة/الحرف القرآني (بين قوسين) عن صيغة السؤال المحيطة بها،
         فتبقى الكلمة عربية كما وردت حرفيًا في نص السؤال الأصلي (لا تُعاد كتابتها أبدًا)،
         بينما تُترجَم الصيغة المحيطة بها عبر قاموس القوالب إذا توفرت ترجمة له. تُعزَل
         الترجمة في span مستقل خاص بها كي لا يمسح استبدال النص شارة المستوى المجاورة. */
      const qm=q.match(/\(([^)]*)\)/);
      const qTplAttr = qm
        ? ` data-i18n-tpl="${esc(q.slice(0,qm.index)+'({})'+q.slice(qm.index+qm[0].length))}" data-i18n-word="${esc(qm[1])}"`
        : ` data-i18n-tpl="${esc(q)}"`;
      return `<div class="q" data-lvl="${lvl}"><span class="num">${n}</span><div class="body"><div class="txt"><span class="qtxt"${qTplAttr}>${esc(q)}</span> <span class="lvl lvl-${lvl}" data-i18n="lvl${lvl}">${LEVELS[lvl-1]}</span></div>${field}<div class="hint" hidden></div></div></div>`;
    }).join('\n');
    return `<section class="sec"><div class="sec-head"><span class="lens-badge">${['١','٢','٣'][si]||si+1}</span><h3 data-i18n-tpl="${esc(s.t)}">${esc(s.t)}</h3><span class="rule"></span></div><div class="qlist">${items}</div></section>`;
  }).join('\n');
  const lvlLegend=LEVELS.map((L,i)=>lvlCount[i]?`<span class="lvl lvl-${i+1}"><span data-i18n="lvl${i+1}">${L}</span> ${toAr(lvlCount[i])}</span>`:'').filter(Boolean).join('');
  const total=w.secs.reduce((a,s)=>a+s.q.length,0);
  const loc=locText(w), ltag=locTag(w);
  /* قائمة أرقام الآيات الفعلية المعروضة نصًّا — تُستخدم لجلب صوت التلاوة، فتُطابق
     ما يُعرض حرفيًا (حتى للمقاطع غير المتسلسلة كمطلع سورة التكوير)، لا عددها
     الكلي في المصحف؛ وإلا تُتلى آيات لا وجود لها على الورقة. */
  const ayaListAttr = ` data-ayalist="${ayaNumbers(w, w.verse.split('۝').length).join(',')}"`;
  /* الصوت يُتاح فقط حين يكون النص المعروض مطابقًا تمامًا لنص الآية الكاملة كما تُتلى —
     أي حين تنتهي الورقة عند نهاية الآية فعليًا (endMark)، وليس لمقتطف جزئي منها
     (كمطلع آية الكرسي)، تجنّبًا لسماع تلاوة أطول مما هو ظاهر على الورقة. */
  const endMark=w.cat==='surah'||!!AYA_END[w.id];
  return `<details class="ws-item" id="w-${w.id}" style="--ac:var(${w.hue})" data-cat="${w.cat}" data-name="${esc(w.name)}" data-words="${wordsJson}"${SURA_NO[w.id]?` data-surano="${SURA_NO[w.id]}"`:''}${AYAT[w.id]?` data-ayat="${AYAT[w.id]}"`:''}${AYA_NUM[w.id]?` data-ayano="${AYA_NUM[w.id]}"`:''}${SURA_OF[w.id]?` data-sura="${esc(SURA_OF[w.id])}"`:''}${w.story?` data-story="1"`:''}${endMark?` data-ayaend="1"`:''}${ayaListAttr}>
  <summary class="card">
    <div class="tagrow">
      <span class="tag" data-i18n="${w.cat==='surah'?'tagSurah':'tagAyah'}">${w.cat==='surah'?'سورة كاملة':'آية مختارة'}</span>
      ${ltag?`<span class="loc-tag">📍 ${locTagHTML(w)}</span>`:''}
    </div>
    <h3>${nameHTML(w)}</h3>
    <div class="vpeek">﴿ ${verseHTML(w)} ﴾</div>
    <div class="cmeta"><span class="prog-mini" data-i18n-tpl="{} سؤالًا" data-i18n-word="${toAr(total)}">${total} سؤالًا</span><span class="go" data-i18n="openWs">افتح الورقة ▾</span></div>
  </summary>
  <div class="ws">
    <div class="ws-top">
      <button class="act close" data-close="${w.id}" data-i18n="closeWs">▲ إغلاق</button>
      <div class="spacer"></div>
      <button class="act reset" data-reset="${w.id}" data-i18n="resetWs">تفريغ الإجابات</button>
      <button class="act print" data-print="${w.id}" data-i18n="printWs">🖨️ طباعة الورقة</button>
    </div>
    <article class="sheet">
      <header class="sheet-head">
        <div class="lab-line">${esc(w.lab)}</div>
        <h2>${nameHTML(w)}</h2>
        <div class="info" data-i18n-tpl="${esc(w.info)}">${esc(w.info)}</div>
        ${loc?`<div class="loc">📍 ${locHTML(w)}</div>`:''}
        <div class="lvl-legend"><span data-i18n="lvlLegendLabel">مستويات الأسئلة:</span> ${lvlLegend}</div>
      </header>
      <div class="verse-wrap">
        <button class="act audio-play js-only" data-audio="${w.id}" hidden data-i18n="listenWs">🔊 استماع للتلاوة</button>
        <div class="verse"><p>﴿ ${verseHTML(w)} ﴾</p></div>
      </div>
      <div class="progress js-only"><div class="pbar"><i data-pfill="${w.id}" style="width:0%"></i></div><b data-ptxt="${w.id}">0 / ${total}</b><b class="score" data-score="${w.id}"></b></div>
      ${secs}
      <footer class="sheet-foot"><div class="fv">${esc(w.footV)}</div>${w.footM?`<div class="fm" data-i18n-tpl="${esc(w.footM)}">${esc(w.footM)}</div>`:''}</footer>
    </article>
    <div class="ws-close"><button class="act" data-close="${w.id}" data-i18n="closeWsFull">▲ إغلاق الورقة</button></div>
  </div>
</details>`;
}).join('\n');


const extraCSS = extraCSSFile;
const favicon = "data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔬</text></svg>');
const SITE_URL = (process.env.SITE_URL||'').replace(/\/$/,'');
const DESC = `منصة تعليمية تفاعلية لتحليل سور وآيات القرآن الكريم لغويًا: ${W.length} ورقة عمل و${totQ} سؤالًا مع تصحيح تلقائي وطباعة وصفحة مدير لإضافة الأسئلة.`;
const jsonLd = JSON.stringify({
  "@context":"https://schema.org","@type":"WebApplication",
  "name":"التحليل اللغوي المجهري","description":DESC,
  "applicationCategory":"EducationalApplication","operatingSystem":"Any",
  "inLanguage":"ar", "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}
});

const html=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>التحليل اللغوي المجهري — مختبر تحليل السور والآيات</title>
<meta name="description" content="${DESC}">
<meta name="robots" content="index, follow">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://quranapi.pages.dev https://the-quran-project.github.io https://github.com https://raw.githubusercontent.com; media-src https://the-quran-project.github.io https://github.com https://raw.githubusercontent.com; object-src 'none'; base-uri 'self'; form-action 'self'">
${SITE_URL?`<link rel="canonical" href="${SITE_URL}/">`:''}
<meta name="application-name" content="التحليل اللغوي المجهري">
<meta property="og:title" content="التحليل اللغوي المجهري">
<meta property="og:description" content="أوراق عمل تفاعلية لتحليل سور القرآن الكريم — ${W.length} ورقة و${totQ} سؤالًا بتصحيح تلقائي.">
<meta property="og:type" content="website">
${SITE_URL?`<meta property="og:url" content="${SITE_URL}/">`:''}
<meta name="theme-color" content="#FBF8F0">
<meta name="color-scheme" content="light">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="التحليل المجهري">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="${favicon}">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Baloo+Bhaijaan+2:wght@500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${jsonLd}</script>
<style>
/* تمنع "الوميض": تبقى الصفحة مخفية حتى يُطبَّق السكربت اللغة والوضع الداكن/
   الفاتح المحفوظين بالكامل (آخر سطر في app.js يزيل هذا بوسم data-ready على
   <html>) — فلا يُعرض المحتوى الافتراضي (عربي/فاتح) للحظة قبل استبداله. */
html:not([data-ready]) body{visibility:hidden}
${css}
${extraCSS}
${adminCss}
${responsiveCss}</style>
</head>
<body>
<noscript><style>body{visibility:visible!important}</style></noscript>
<script>
/* شبكة أمان: لو تعطّل السكربت الرئيسي بخطأ قبل بلوغ سطر الإظهار في آخره،
   لا تبقى الصفحة مخفية إلى الأبد — تظهر تلقائيًا بعد ثانية واحدة كحدّ أقصى. */
setTimeout(function(){ document.documentElement.setAttribute('data-ready','1'); },1000);
</script>
<div id="popoverBackdrop" class="popover-backdrop" hidden></div>
<!-- القائمتان المنبثقتان هنا خارج <header> عمدًا، رغم أن زرَّيهما داخله: أي
     عنصر position:fixed محصور داخل عنصر أب ينشئ سياق تكديس خاصًّا به (كما
     يفعل .topbar بـ position:sticky + z-index) يبقى z-index الخاص به محليًّا
     ضمن ذلك الأب فقط، فلا يتفوّق على الحاجز الخلفي الواقع خارج .topbar مهما
     كانت قيمته — وهذا بالضبط ما كان يجعل الحاجز يُظلِّل القائمة ويلتقط النقر
     المقصود لأحد خياراتها بدلًا منها. القائمتان الآن أبناء مباشرون لـ body،
     في نفس سياق التكديس الجذري الذي يقارَن فيه z-index فعليًا. -->
<div id="langPanel" class="audio-settings-panel" hidden>
  <button type="button" class="lang-opt" data-lang="ar">العربية</button>
  <button type="button" class="lang-opt" data-lang="en">English</button>
  <button type="button" class="lang-opt" data-lang="ur">اردو</button>
  <button type="button" class="lang-opt" data-lang="tr">Türkçe</button>
  <button type="button" class="lang-opt" data-lang="ug">ئۇيغۇرچە</button>
</div>
<div id="pubAudioPanel" class="audio-settings-panel" hidden>
  <label class="admin-field"><span data-i18n="reciterLabel">القارئ</span>
    <select id="pubAudioReciter">
      <option value="1">مشاري راشد العفاسي</option>
      <option value="2">أبو بكر الشاطري</option>
      <option value="3">ناصر القطامي</option>
      <option value="4">ياسر الدوسري</option>
      <option value="5">هاني الرفاعي</option>
    </select>
  </label>
  <span class="admin-hint" data-i18n="audioHint">يعمل تلقائيًا مع أي ورقة سورة أو آية كاملة.</span>
</div>
<header class="topbar">
  <div class="topbar-in">
    <div class="brand" id="brandKey" title="التحليل اللغوي المجهري">
      <span class="lens" aria-hidden="true"></span>
      <span class="bt"><span data-i18n="brand">التحليل اللغوي المجهري</span><small data-i18n="brandSub">مختبر تحليل السور والآيات — نسخة ${VERSION}</small></span>
    </div>
    <div class="spacer"></div>
    <div class="lang-switch">
      <button type="button" class="act" id="langBtn" aria-haspopup="true" aria-expanded="false">🌐 <span id="langBtnLabel">العربية</span></button>
    </div>
    <button type="button" class="act" id="themeToggle" title="الوضع الداكن/الفاتح" aria-label="تبديل الوضع الداكن/الفاتح">🌙</button>
    <div class="audio-settings js-only">
      <button type="button" class="act" id="pubAudioBtn" aria-haspopup="true" aria-expanded="false">🔊 <span data-i18n="audioSettingsBtn">إعدادات التلاوة</span></button>
    </div>
  </div>
</header>
<main id="app">
<div class="home">
  <section class="hero">
    <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <h1><span data-i18n="heroTitleMain">التحليل اللغوي</span> <span class="mag" data-i18n="heroTitleMag">المجهري</span></h1>
    <p class="sub" data-i18n="heroSub">ضع آيات القرآن الكريم تحت المجهر — اضغط أي بطاقة لفتح ورقة العمل، واكتب إجاباتك: الأسئلة القابلة للتصحيح تُصحَّح تلقائيًا (✓ صحيح / ✗ حاول مجددًا)، ويمكن طباعة أي ورقة كما هي.</p>
  </section>
  <div class="controls js-only">
    <div class="tabs"><button class="on" data-f="all" data-i18n="fAll">الكل</button><button data-f="surah" data-i18n="fSurah">السور الكاملة</button><button data-f="ayah" data-i18n="fAyah">الآيات المختارة</button><button data-f="story" data-i18n="fStory">القصص</button></div>
    <div class="tabs lvl-tabs"><button class="on" data-lf="all" data-i18n="lvlAll">كل المستويات</button>${LEVELS.map((L,i)=>`<button data-lf="${i+1}" class="lvl-tab lvl-${i+1}" data-i18n="lvl${i+1}">${L}</button>`).join('')}</div>
    <div class="search"><input id="q" type="text" placeholder="ابحث عن سورة أو آية..." data-i18n-ph="searchPh"></div>
  </div>
</div>
<section class="grid">
${blocks}
</section>
</main>
${adminHtml}
<footer class="site-foot">
  <div>﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾</div>
  <span class="ver">التحليل اللغوي المجهري — الإصدار ${VERSION} · بُني بتاريخ ${BUILD_DATE} · ${W.length} ورقة · ${totQ} سؤالًا</span>
</footer>
<script type="application/json" id="customws">[]</script>
<script type="application/json" id="customq">{}</script>
<script type="application/json" id="quranfull">${QURAN_FULL}</script>
<script type="application/json" id="i18nData">${I18N}</script>
<script>
${js}
</script>
<script>
${adminJs}
</script>
<script>
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('service-worker.js', {updateViaCache:'none'}).then(function(reg){
      /* تحقّق من وجود نسخة جديدة عند كل زيارة (يتجاوز أي تخزين مؤقت للمتصفح لملف الووركر نفسه) */
      reg.update().catch(function(){});
      setInterval(function(){ reg.update().catch(function(){}); }, 30*60*1000);
    }).catch(function(){});
    /* بمجرد تفعيل نسخة جديدة من الووركر، أعد تحميل الصفحة تلقائيًا لعرض آخر تحديث
       (أوراق/ميزات جديدة) دون الحاجة لمسح ذاكرة التخزين المؤقت يدويًا */
    var refreshed=false;
    navigator.serviceWorker.addEventListener('controllerchange',function(){
      if(refreshed) return; refreshed=true; window.location.reload();
    });
  });
}
</script>
</body>
</html>`;
/* ================= إخراج الملفات الثابتة المرافقة (PWA وSEO) ================= */
fs.mkdirSync(path.join(__dirname,'dist'), {recursive:true});
function writeStaticAssets(){
  const manifest = {
    name:"التحليل اللغوي المجهري", short_name:"المجهري اللغوي",
    description: DESC, start_url:".", scope:".", display:"standalone",
    background_color:"#FBF8F0", theme_color:"#FBF8F0", lang:"ar", dir:"rtl",
    icons:[
      {src:favicon, sizes:"192x192", type:"image/svg+xml", purpose:"any"},
      {src:favicon, sizes:"512x512", type:"image/svg+xml", purpose:"any"}
    ]
  };
  fs.writeFileSync(path.join(__dirname,'dist/manifest.webmanifest'), JSON.stringify(manifest));
  /* ================= API ثابتة (JSON) لكل الأوراق المبنية في الموقع =================
     تُعاد كتابتها في كل بناء/نشر من نفس مصدر البيانات (worksheets.json) — أي ورقة
     جديدة تُضاف للموقع تظهر هنا تلقائيًا دون أي خطوة يدوية إضافية. يمكن لأي تطبيق
     خارجي (كتطبيق جوال) قراءتها عبر GET بسيط، دون خادم أو مصادقة. ملاحظة: الأوراق
     التي يضيفها المدير من صفحة المدير محلية لمتصفحه (localStorage) ولا تظهر هنا —
     ذلك يتطلب خادمًا وقاعدة بيانات فعليين، وهو تغيير بنية منفصل عن هذا الموقع الثابت. */
  const apiWorksheets = W.map(w => ({
    id: w.id, cat: w.cat, name: w.name, info: w.info,
    suraNo: SURA_NO[w.id]||null, ayat: AYAT[w.id]||null, ayaFrom: AYA_NUM[w.id]?arNum(AYA_NUM[w.id]):null,
    hue: w.hue, story: !!w.story,
    verse: w.verse.split('۝').map(s=>s.trim()).filter(Boolean),
    footV: w.footV||'', footM: w.footM||'',
    sections: w.secs.map(s => ({
      title: s.t,
      questions: s.q.map(q => ({ text: q, answer: (ANSWERS[w.id]&&ANSWERS[w.id][q])||null }))
    }))
  }));
  fs.mkdirSync(path.join(__dirname,'dist/api'), {recursive:true});
  fs.writeFileSync(path.join(__dirname,'dist/api/worksheets.json'), JSON.stringify(apiWorksheets));
  fs.writeFileSync(path.join(__dirname,'dist/api/meta.json'), JSON.stringify({
    version: VERSION, buildDate: BUILD_DATE,
    worksheets: W.length, questions: W.reduce((a,w)=>a+w.secs.reduce((b,s)=>b+s.q.length,0),0)
  }));
  fs.writeFileSync(path.join(__dirname,'dist/robots.txt'),
    'User-agent: *\nAllow: /\n'+(SITE_URL?`Sitemap: ${SITE_URL}/sitemap.xml\n`:''));
  if(SITE_URL){
    fs.writeFileSync(path.join(__dirname,'dist/sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>\n`);
  }
  const swVersion = VERSION+'-'+BUILD_DATE;
  const sw = `const CACHE='tahleel-cache-${swVersion}';
const ASSETS=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    const copy=res.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
    return res;
  }).catch(()=>caches.match('./index.html'))));
});`;
  fs.writeFileSync(path.join(__dirname,'dist/service-worker.js'), sw);
  fs.writeFileSync(path.join(__dirname,'dist/.htaccess'),
`# رؤوس أمان أساسية لاستضافة Apache التقليدية (cPanel وغيرها)
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/manifest+json
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType application/manifest+json "access plus 1 day"
</IfModule>
`);
}
writeStaticAssets();

async function finalize(){
  let out = html;
  if(PROD){
    try{
      const { minify } = require('html-minifier-terser');
      out = await minify(html, {
        collapseWhitespace:true, conservativeCollapse:true, removeComments:true,
        minifyCSS:true, minifyJS:true, keepClosingSlash:true
      });
    }catch(e){
      console.warn('⚠️  تعذّر التصغير (html-minifier-terser) — سيُنشر الملف كما هو:', e.message);
    }
  }
  fs.writeFileSync(path.join(__dirname,'dist/index.html'), out);
  console.log('✔ dist/index.html — '+(out.length/1024).toFixed(0)+'KB'+(PROD?' (مُصغَّر)':'')+' · '+W.length+' worksheets · '+totQ+' questions');
  console.log('  تصحيح آلي: '+graded+' · لها إجابة/مفتاح: '+withKey+' · المستويات: '+LEVELS.map((L,i)=>L+'='+lvlTotals[i]).join(' · '));
}
finalize();
