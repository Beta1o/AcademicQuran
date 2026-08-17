const fs=require('fs');
const path=require('path');
const R=p=>fs.readFileSync(path.join(__dirname,p),'utf8');
/* بيانات الأوراق مقسّمة إلى ملفات فرعية أخف وأسرع للتحرير والفحص من ملف
   واحد ضخم (كانت تتجاوز ٣ ميغابايت) — تُدمَج هنا بترتيب أسماء الملفات في
   نفس المصفوفة W كما كانت، فلا يتأثر أي منطق لاحق يعتمد عليها. */
const WS_DIR=path.join(__dirname,'src/data/worksheets');
const W=fs.readdirSync(WS_DIR).filter(f=>f.endsWith('.json')).sort()
  .reduce((acc,f)=>acc.concat(JSON.parse(fs.readFileSync(path.join(WS_DIR,f),'utf8'))), []);
const css=R('src/css/main.css');
const extraCSSFile=R('src/css/ui.css');
const adminCss=R('src/css/admin.css');
const responsiveCss=R('src/css/responsive.css');
const js=R('src/js/app.js');
let adminJs=R('src/js/admin.js');
const adminHtml=R('src/partials/admin.html');
const VERSION='1.1.0';
const BUILD_DATE=new Date().toISOString().slice(0,10);
/* Fixed (not versioned like CACHE) — the audio cache's lifecycle is owned by
   app.js (per-worksheet prefetch/eviction), not tied to app deploys. Must
   match the AUDIO_CACHE_NAME constant in src/js/app.js exactly. */
const AUDIO_CACHE_NAME='tahleel-audio';
/* Line-style SVG icons for the settings menu (gear trigger + category rows)
   — consistent stroke weight/style across all of them, unlike mixing emoji
   (renders differently per OS/browser) with icons. currentColor lets them
   inherit theme color automatically in light/dark mode. */
const ICON_GEAR='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';
const ICON_GLOBE='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></svg>';
const ICON_THEME='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36A5.5 5.5 0 0 1 12 3Z"/></svg>';
const ICON_SPEAKER='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9v6h4l5 5V4L7 9H3Z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12"/></svg>';
const ICON_CHEVRON='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
const ICON_BACK='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
/* Reciter names only ever had an Arabic label baked into the page — visitors
   using any other language still saw Arabic names in that one list, since
   the generic [data-i18n-name] lookup (built for surah names, which do have
   full per-language dictionaries) was never actually populated for all 44
   reciters across every language. Arabic-script readers (ar/fa/ur/ps) read
   the Arabic name fine as-is; everyone else conventionally sees the
   standard English transliteration instead — one name per reciter to
   maintain, not 44 × 18 translations. [id, Arabic name, English name] */
const RECITERS=[
  [15,'إبراهيم الأخضر','Ibrahim Akhdar'],
  [4,'أبو بكر الشاطري','Abu Bakr Ash-Shaatree'],
  [27,'أحمد بن علي العجمي','Ahmed ibn Ali al-Ajamy'],
  [36,'أحمد نعانع','Ahmed Neana'],
  [44,'أكرم العلاقمي','Akram Al-Alaqimy'],
  [25,'أيمن سويد','Ayman Sowaid'],
  [22,'خالد القحطاني','Khaalid Abdullaah al-Qahtaanee'],
  [38,'خليفة التنيجي','Khalefa Al-Tunaiji'],
  [13,'سعد الغامدي','Saad Al-Ghamdi'],
  [10,'سعود الشريم','Saood ash-Shuraym'],
  [41,'سهل ياسين','Sahl Yassin'],
  [21,'صلاح البدير','Salah Al-Budair'],
  [30,'صلاح عبدالرحمن بخاطر','Salaah AbdulRahman Bukhatir'],
  [1,'عبد الباسط عبد الصمد (مجوّد)','Abdul Basit (Mujawwad)'],
  [2,'عبد الباسط عبد الصمد (مرتل)','Abdul Basit (Murattal)'],
  [3,'عبد الرحمن السديس','Abdurrahmaan As-Sudais'],
  [26,'عبدالله بصفر','Abdullah Basfar'],
  [31,'عبدالله عواد الجهني','Abdullaah Awwaad Al-Juhaynee'],
  [32,'عبدالله مطرود','Abdullah Matroud'],
  [42,'عزيز عليلي','Aziz Alili'],
  [14,'علي الحذيفي','Ali Al-Hudhaify'],
  [34,'علي جابر','Ali Jaber'],
  [40,'علي حجاج السويسي','Ali Hajjaj Al-Suesy'],
  [35,'فارس عباد','Fares Abbad'],
  [39,'كريم منصوري','Karim Mansoori'],
  [16,'ماهر المعيقلي','Maher Al-Muaiqly'],
  [20,'محسن القاسم','Muhsin Al-Qasim'],
  [11,'محمد الطبلاوي','Mohammad Al-Tablaway'],
  [17,'محمد أيوب','Muhammad Ayyoub'],
  [18,'محمد جبريل','Muhammad Jibreel'],
  [29,'محمد صديق المنشاوي (المصدر الآخر)','Muhammad Siddiq Al-Minshawi (alt.)'],
  [8,'محمد صديق المنشاوي (مجوّد)','Minshawy (Mujawwad)'],
  [9,'محمد صديق المنشاوي (مرتل)','Minshawy (Murattal)'],
  [37,'محمد عبدالكريم','Muhammad AbdulKareem'],
  [6,'محمود خليل الحصري','Mahmoud Khalil Al-Husary'],
  [28,'محمود خليل الحصري (مجوّد)','Al-Husary (Mujawwad)'],
  [12,'محمود خليل الحصري (معلّم)','Al-Husary (Muallim)'],
  [33,'محمود علي البنّا','Mahmoud Ali Al-Banna'],
  [7,'مشاري راشد العفاسي','Mishary Rashid Alafasy'],
  [19,'مصطفى إسماعيل','Mustafa Ismail'],
  [24,'ناصر القطامي','Nasser Alqatami'],
  [5,'هاني الرفاعي','Hani Rifai'],
  [23,'ياسر الدوسري','Yasser Ad-Dussary'],
  [43,'ياسر سلامة','Yaser Salamah']
];
/* Arabic-script languages: the original Arabic reciter name is already the
   natural, correctly-read form — no transliteration needed or wanted. */
const RECITER_ARABIC_SCRIPT_LANGS=['ar','fa','ur','ps'];
const PROD = process.env.NODE_ENV==='production' || process.argv.includes('--prod');

/* ================= كلمة مرور المدير: قابلة للتهيئة عبر متغيّر بيئة =================
   عند البناء للإنتاج، مرّر ADMIN_PASS كمتغيّر بيئة بدل الاعتماد على القيمة الافتراضية
   المكتوبة في المصدر (مقروءة من أي شخص يفتح كود الصفحة، وهذا متوقّع ومذكور في الوثائق):
     ADMIN_PASS=كلمة-سر-قوية npm run build -- --prod
   ================================================================================= */
const DEFAULT_ADMIN_PASS='change-me-set-ADMIN_PASS-env-var';
const ADMIN_PASS = process.env.ADMIN_PASS || DEFAULT_ADMIN_PASS;
const DEFAULT_ADMIN_USER='admin';
const ADMIN_USER = process.env.ADMIN_USER || DEFAULT_ADMIN_USER;
if(PROD && ADMIN_PASS===DEFAULT_ADMIN_PASS){
  console.warn('⚠️  تحذير: بناء إنتاجي بكلمة مرور المدير الافتراضية. مرّر ADMIN_PASS=... لتغييرها.');
}
if(PROD && ADMIN_USER===DEFAULT_ADMIN_USER){
  console.warn('⚠️  تحذير: بناء إنتاجي باسم مستخدم المدير الافتراضي. مرّر ADMIN_USER=... لتغييره.');
}
adminJs = adminJs.replace(/var ADMIN_PASS='[^']*';/, "var ADMIN_PASS="+JSON.stringify(ADMIN_PASS)+";");
adminJs = adminJs.replace(/var ADMIN_USER='[^']*';/, "var ADMIN_USER="+JSON.stringify(ADMIN_USER)+";");

/* ================= Arabic helpers (build-time) ================= */
const DIAC=/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]/g;
const PUNCT=/[﴿﴾«»()،:؟\.!ۚۖۗۘۙۛۜ۩\u06DD]/g;
const stripD=s=>String(s).replace(DIAC,'');
const norm=s=>stripD(String(s)).replace(PUNCT,'').replace(/[ٱآأإ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
/* أرقام الآيات لكل مقطع — تُذكر صراحةً حين لا تكون متتالية (مقاطع مختارة) */
const AYA_SEQ={
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
/* لا تُغلَّف كلمات الآيات بـ span مستقل لكل كلمة وقت البناء — كان هذا يُضاعف
   وزن الصفحة تضاعفًا كبيرًا (٦٨٧ ورقة × عشرات الكلمات لكل منها، كلها مضمَّنة
   دومًا في الصفحة الواحدة سواء فُتحت الورقة أم لا)، فأبطأ التطبيق كثيرًا.
   التغليف الآن يتم وقت التشغيل فقط، ولحظيًّا فقط للآية التي تُقرأ فعلًا
   (انظر wrapSegWords في app.js) — نفس تمييز الكلمة أثناء الاستماع، بلا أي
   كلفة على البقية غير المفتوحة أبدًا. */
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
const I18N_LANGS=['ar','en','ur','tr','ug','id','fr','bn','ha','fa','ml','sw','hi','es','ru','zh','so','ps'];
/* معرّف قالب مستقر ومحايد اللغة، يُشتق من نص القالب العربي وقت البناء —
   لا يبقى أي نص عربي حرفي كمفتاح بحث وقت التشغيل، فلا صلة بين "المفتاح"
   وأي لغة بعينها. src/data/i18n/*.json نفسها مُرقَّمة بهذه المعرّفات مسبقًا
   (لا مفاتيح عربية فيها إطلاقًا)؛ هذه الدالة تبقى هنا لأن نقاط توليد
   data-i18n-tpl أدناه تحسب نفس المعرّف من نص القالب العربي وقت البناء
   لمطابقته مع مفاتيح الملفات. */
function tid(s){
  var h=5381;
  for(var i=0;i<s.length;i++){ h=((h*33)^s.charCodeAt(i))>>>0; }
  return 't'+h.toString(36);
}
/* قواميس الترجمة الكاملة لكل لغة ثقيلة (تضم كل قوالب الأسئلة وأسماء السور) —
   تضمينها كلها في الصفحة يُحمِّل كل زائر بيانات ٩ لغات مهما كانت لغته
   الفعلية. تبقى العربية فقط مضمَّنة مباشرة (أول عرض فوري بلا طلب شبكة)،
   وتُنشَر بقية اللغات كملفات API منفصلة (dist/api/i18n/<code>.json) يجلبها
   المتصفح عند التبديل إليها فقط — عبر src/js/app.js's Locale.set(). */
const I18N_CATALOGS=Object.fromEntries(I18N_LANGS.map(l=>[l,JSON.parse(R('src/data/i18n/'+l+'.json'))]));
const I18N=JSON.stringify({ar:I18N_CATALOGS.ar});
/* أسماء سور القرآن بالترتيب — لأسئلة «السورة السابقة/التالية» ورقم السورة */
/* تصنيف كل سورة مكية أو مدنية — بترتيب المصحف (١ فاتحة ← ١١٤ ناس)، مصدره
   بيانات quran.com الرسمية (revelation_place)؛ حرف واحد لكل سورة: م=مكية، د=مدنية. */
const REV_PLACE='م د د د د م م د د م م م د م م م م م م م م د م د م م م م م م م م د م م م م م م م م م م م م م د د د م م م م م د م د د د د د د د د د د م م م م م م م م م د م م م م م م م م م م م م م م م م م م م م م د د م م م م م م م م م م د م م م م'.split(' ');
/* بداية كل جزء من الأجزاء الثلاثين (رقم السورة:رقم الآية) — بيانات معتمدة
   (quran.com الرسمية)، تُستخدم لاشتقاق أي آية تنتمي لأي جزء وقت البناء. */
const JUZ_STARTS=[[1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1]];
function juzOf(suraNo, ayaNo){
  if(!suraNo) return null;
  ayaNo=ayaNo||1;
  let j=1;
  for(let i=0;i<JUZ_STARTS.length;i++){
    const [s,a]=JUZ_STARTS[i];
    if(suraNo>s || (suraNo===s && ayaNo>=a)) j=i+1; else break;
  }
  return j;
}
function revPlaceOf(id){ const n=SURA_NO[id]; return n?REV_PLACE[n-1]:null; }
const SURA_NAMES=['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
/* أسماء الحروف → الحرف نفسه */
const LETTER_NAMES={'الألف':'ا','الباء':'ب','التاء':'ت','الثاء':'ث','الجيم':'ج','الحاء':'ح','الخاء':'خ','الدال':'د','الذال':'ذ','الراء':'ر','الزاي':'ز','السين':'س','الشين':'ش','الصاد':'ص','الضاد':'ض','الطاء':'ط','الظاء':'ظ','العين':'ع','الغين':'غ','الفاء':'ف','القاف':'ق','الكاف':'ك','اللام':'ل','الميم':'م','النون':'ن','الهاء':'ه','الواو':'و','الياء':'ي'};
/* عدد آيات السورة التي تنتمي إليها الورقة */
const AYAT={falaq:5,shams:15,teen:8,takwir:29,ghashiya:26,masad:5,kafirun:6,nasr:3,takathur:8,bayyina:8,adiyat:11,quraysh:4,alaq:19,asr:3,zalzala:8,feel:5,kawthar:3,qaria:11,nas:6,fatiha1:7,ikhlas:4,nahl90:128,duha:11,layl:21,balad:20,qadr:5,humaza:9,maun:7,tariq:17,infitar:19,fajr:30,naba:40,naziat:46,abasa:42,mutaffifin:36,inshiqaq:25,buruj:22,aala:19,sharh:8};
const SURA_OF={fatiha1:'الفاتحة',kursi:'البقرة',baqara201:'البقرة',baqara286:'البقرة',sharh56:'الشرح',ibrahim7:'ابراهيم',talaq3:'الطلاق',hadid3:'الحديد',hashr22:'الحشر',ikhlas:'الإخلاص',nahl90:'النحل',anbiya87:'الأنبياء',yusuf4:'يوسف',qasas7:'القصص',nur35:'النور',kahf9:'الكهف',adam30:'البقرة',nar69:'الأنبياء',hudhud20:'النمل',jalut249:'البقرة',ayyub83:'الأنبياء',zakariya2:'مريم'};
const AYA_NUM={kursi:'255',baqara201:'201',baqara286:'286',ibrahim7:'7',talaq3:'3',hadid3:'3',hashr22:'22',fatiha1:'1',nahl90:'90',yusuf4:'4',qasas7:'7',nur35:'35',kahf9:'9',adam30:'30',nar69:'68',hudhud20:'20',jalut249:'249',ayyub83:'83',zakariya2:'2'};
/* نص بديل لموضع الآية عندما لا يكون رقمًا واحدًا */
/* Formerly held irregular-range text for the standalone "featured ayah"
   worksheets (Ayat al-Kursi, prophet-story highlights, etc.) — all deleted
   to eliminate their overlap with the sequential chunked coverage, so this
   is empty now. Kept (not removed outright) since locText/locHTML still
   reference it as a first-choice override before falling back to
   AYA_NUM for any future irregular-range worksheet. */
const AYA_TXT={};
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
/* أوراق مقسَّمة تلقائيًا (سور طويلة مجزّأة إلى أجزاء ≤٢٠ آية) تحمل بيانات
   موقعها داخل كائن الورقة نفسه (suraNo/ayaFrom/ayat/suraOf/ayaEndMark) بدل
   تكرارها يدويًا هنا لكل جزء جديد — تُدمَج هذه القيم مرة واحدة في نفس
   الخرائط أعلاه، فيستمر كل الكود اللاحق بالعمل عليها كالمعتاد دون أي تعديل. */
W.forEach(w=>{
  if(w.suraNo && !SURA_NO[w.id]) SURA_NO[w.id]=w.suraNo;
  if(w.ayaFrom && !AYA_NUM[w.id]) AYA_NUM[w.id]=toAr(w.ayaFrom);
  if(w.suraOf && !SURA_OF[w.id]) SURA_OF[w.id]=w.suraOf;
  if(w.ayaCount && !AYAT[w.id]) AYAT[w.id]=w.ayaCount;
  if(w.ayaEndMark && !AYA_END[w.id]) AYA_END[w.id]=1;
});
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
    if(n) parts.push(`<span data-i18n-tpl="${tid('السورة رقم {} في المصحف')}" data-i18n-word="${toAr(n)}">السورة رقم ${toAr(n)} في المصحف</span>`);
    if(AYAT[w.id]) parts.push(`<span data-i18n-tpl="${tid('عدد آياتها {}')}" data-i18n-word="${toAr(AYAT[w.id])}">عدد آياتها ${toAr(AYAT[w.id])}</span>`);
    return parts.join(' · ');
  }
  const parts=[];
  if(AYA_TXT[w.id]) parts.push(esc(AYA_TXT[w.id]));
  else if(AYA_NUM[w.id]) parts.push(`<span data-i18n-tpl="${tid('الآية {}')}" data-i18n-word="${toAr(AYA_NUM[w.id])}">الآية ${toAr(AYA_NUM[w.id])}</span>`);
  if(SURA_OF[w.id]) parts.push(`<span data-i18n-tpl="${tid('من سورة {}')}" data-i18n-word="${esc(SURA_OF[w.id])}">من سورة ${esc(SURA_OF[w.id])}</span>`);
  if(n) parts.push(`(<span data-i18n-tpl="${tid('السورة رقم {} في المصحف')}" data-i18n-word="${toAr(n)}">السورة رقم ${toAr(n)} في المصحف</span>)`);
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
  if(w.cat==='surah') return n?`<span data-i18n-tpl="${tid('السورة {}')}" data-i18n-word="${toAr(n)}">السورة ${toAr(n)}</span>`:'';
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
  if(/عدد حروف\s*(?:السورة|الآيات|الآية|الآيتين)/.test(q)){
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
  if(/أول كلمة\s*(?:في|ب)\s*(?:السورة|الآيات|الآية)|أول كلمة بالسورة/.test(q)) return {ui:'text',ans:vWordsN[0],show:verseWordsOrig(w)[0]};
  if(/آخر كلمة\s*(?:في|ب)\s*(?:السورة|الآيات|الآية)|آخر كلمة بالسورة|بماذا تنتهي السورة|خاتمة السورة بكلمة|خاتمة الآية بكلمة|آخر كلمة:$/.test(q)){
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

/* محتوى كل ورقة (كل الأسئلة، لا البطاقة المطوية) ثقيل جدًا مجمّعًا لـ٦٨٧ ورقة
   دفعة واحدة (٤٢ ألف سؤال، ٤٣٥ ألف عنصر DOM) — يُبنى الآن هنا كنص خام يُخزَّن
   في wsBodies بدل إدراجه مباشرة في HTML الصفحة الرئيسة، ويُغلَّف مكانه بعنصر
   نائب فارغ (.ws[data-lazy]) لا يُستبدَل بالمحتوى الحقيقي إلا عند فتح تلك
   الورقة فعليًا (app.js). يبقى الملف قائمًا بذاته تمامًا (لا طلب شبكة إضافي):
   wsBodies نفسه نص JSON مضمَّن في <script> — لا يُبنى DOM فعلي له إلا لحظة
   الحاجة، فتنخفض كلفة إنشاء الصفحة الأولى (Layout/Style) كثيرًا. */
const wsBodies={};
/* Lightweight per-worksheet summary (question count + per-level counts),
   captured alongside the full body but kept separate and embedded inline in
   the page — a few dozen KB total, unlike wsBodies. Lets the admin panel's
   builtin-worksheets list show counts for all 687 worksheets immediately
   without ever loading a single worksheet's actual body/DOM, which is the
   only thing that needed loading all of them up front before (see
   ensureAllBuiltinBodiesLoaded in admin.js) and was what made opening the
   admin panel freeze the tab for several seconds. */
const wsIndex={};
const blockHTMLs=W.map((w,wi)=>{
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
        field=`<div class="checkrow"><label><input type="checkbox" data-k="${key}"> <span data-i18n="checkActivity">أدّيتُ النشاط ✓</span></label></div>`;
      } else if(c.ui==='draw'){
        field=`<input type="text" data-k="${key}" placeholder="صف رسمتك هنا... (أو ارسم على الورقة المطبوعة)" data-i18n-ph="drawPh"><div class="drawbox" data-i18n="drawBox">✏️ مساحة الرسم — على النسخة المطبوعة</div>`;
      } else if(c.ui==='check'){
        field=`<div class="checkrow"><label><input type="checkbox" data-k="${key}"> <span data-i18n="checkSimple">تم ✓</span></label></div>`;
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
        ? ` data-i18n-tpl="${tid(q.slice(0,qm.index)+'({})'+q.slice(qm.index+qm[0].length))}" data-i18n-word="${esc(qm[1])}"`
        : ` data-i18n-tpl="${tid(q)}"`;
      return `<div class="q" data-lvl="${lvl}"><span class="num">${n}</span><div class="body"><div class="txt"><span class="qtxt"${qTplAttr}>${esc(q)}</span> <span class="lvl lvl-${lvl}" data-i18n="lvl${lvl}">${LEVELS[lvl-1]}</span></div>${field}<div class="hint" hidden></div></div></div>`;
    }).join('\n');
    const secNum=['١','٢','٣'][si]||toAr(si+1);
    return `<section class="sec"><div class="sec-head"><span class="lens-badge" data-i18n-num="${secNum}">${secNum}</span><h3 data-i18n-tpl="${tid(s.t)}">${esc(s.t)}</h3><span class="rule"></span></div><div class="qlist">${items}</div></section>`;
  }).join('\n');
  const lvlLegend=LEVELS.map((L,i)=>lvlCount[i]?`<span class="lvl lvl-${i+1}"><span data-i18n="lvl${i+1}">${L}</span> <span data-i18n-num="${toAr(lvlCount[i])}">${toAr(lvlCount[i])}</span></span>`:'').filter(Boolean).join('');
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
  const juzNo=juzOf(SURA_NO[w.id], AYA_NUM[w.id]?arNum(AYA_NUM[w.id]):1);
  /* الاستعاذة (أعوذ بالله من الشيطان الرجيم) تُقال قبل أي تلاوة قرآنية —
     نصًّا ثابتًا هنا (لا صوتًا: لا يوجد مقطع صوتي موثَّق لها في مصدر التلاوة
     المستخدَم، ولن نخترع رابطًا غير متحقَّق منه لمحتوى ديني). البسملة تُعرَض
     كعنوان مستقل قبل كل سورة كاملة تبدأ من آيتها الأولى (ما عدا التوبة التي
     لا بسملة في مطلعها، والفاتحة التي آيتها الأولى هي البسملة نفسها فعرضها
     مجددًا يُكرِّرها). */
  wsIndex[w.id] = [n, lvlCount];
  wsBodies[w.id] = `<div class="ws">
    <div class="ws-top">
      <button class="act close" data-close="${w.id}" data-i18n="closeWs">▲ إغلاق</button>
      <div class="spacer"></div>
      <button class="act reset" data-reset="${w.id}" data-i18n="resetWs">تفريغ الإجابات</button>
      <button class="act print" data-print="${w.id}" data-i18n="printWs">🖨️ طباعة الورقة</button>
    </div>
    <article class="sheet">
      <header class="sheet-head">
        <div class="lab-line" data-i18n-tpl="${tid(w.lab)}">${esc(w.lab)}</div>
        <h2>${nameHTML(w)}</h2>
        <div class="info" data-i18n-tpl="${tid(w.info)}">${esc(w.info)}</div>
        ${loc?`<div class="loc">📍 ${locHTML(w)}</div>`:''}
        <div class="lvl-legend"><span data-i18n="lvlLegendLabel">مستويات الأسئلة:</span> ${lvlLegend}</div>
      </header>
      <div class="verse-wrap">
        <button class="act audio-play js-only" data-audio="${w.id}" hidden data-i18n="listenWs">🔊 استماع للتلاوة</button>
        <button class="act repeat-toggle js-only" data-repeat="${w.id}" hidden data-i18n="repeatToggle">🔁 تكرار</button>
        <div class="verse"><p>﴿ ${verseHTML(w)} ﴾</p></div>
      </div>
      <div class="progress js-only"><div class="pbar"><i data-pfill="${w.id}" style="width:0%"></i></div><b data-ptxt="${w.id}">0 / ${total}</b><b class="score" data-score="${w.id}"></b></div>
      ${secs}
      <footer class="sheet-foot"><div class="fv">${esc(w.footV)}</div>${w.footM?`<div class="fm" data-i18n-tpl="${tid(w.footM)}">${esc(w.footM)}</div>`:''}</footer>
    </article>
    <div class="ws-close"><button class="act" data-close="${w.id}" data-i18n="closeWsFull">▲ إغلاق الورقة</button></div>
  </div>`;
  return `<details class="ws-item" id="w-${w.id}" style="--ac:var(${w.hue})" data-cat="${w.cat}" data-name="${esc(w.name)}" data-words="${wordsJson}"${SURA_NO[w.id]?` data-surano="${SURA_NO[w.id]}"`:''}${AYAT[w.id]?` data-ayat="${AYAT[w.id]}"`:''}${AYA_NUM[w.id]?` data-ayano="${AYA_NUM[w.id]}"`:''}${SURA_OF[w.id]?` data-sura="${esc(SURA_OF[w.id])}"`:''}${w.story?` data-story="1"`:''}${endMark?` data-ayaend="1"`:''}${juzNo?` data-juz="${juzNo}"`:''}${ayaListAttr}>
  <summary class="card">
    <div class="tagrow">
      <span class="tag" data-i18n="${w.cat==='surah'?'tagSurah':(w.group?'tagPart':'tagAyah')}">${w.cat==='surah'?'سورة كاملة':(w.group?'جزء من سورة':'آية مختارة')}</span>
      ${(!w.group && revPlaceOf(w.id))?`<span class="tag rev-tag" data-i18n="${revPlaceOf(w.id)==='م'?'revMeccan':'revMedinan'}">${revPlaceOf(w.id)==='م'?'مكية':'مدنية'}</span>`:''}
      ${ltag?`<span class="loc-tag">📍 ${locTagHTML(w)}</span>`:''}
    </div>
    <h2>${nameHTML(w)}</h2>
    <div class="vpeek">﴿ ${verseHTML(w)} ﴾</div>
    <div class="cmeta"><span class="prog-mini" data-i18n-tpl="${tid('{} سؤالًا')}" data-i18n-word="${toAr(total)}">${total} سؤالًا</span><span class="go" data-i18n="openWs">افتح الورقة ▾</span></div>
  </summary>
  <div class="ws" data-lazy="1"></div>
</details>`;
});
/* السور الطويلة المجزَّأة (group على كل ورقة جزء) تُجمَع بصريًا هنا تحت بطاقة
   واحدة قابلة للطي بدل تشتّت أجزائها كبطاقات مستقلة في الشبكة الرئيسة —
   كل جزء يبقى <details class="ws-item"> عاديًا تمامًا داخلها (لا تغيير على
   آلياته: التصحيح، الصوت، الطباعة)، فقط غلافه الظاهر في الشبكة يتغيّر. */
/* ترتيب الشبكة الرئيسة يتبع تسلسل المصحف الفعلي (رقم السورة ثم رقم الآية)
   بدل ترتيب الإدراج في الملف — كل سورة طويلة مجزَّأة تظهر ببطاقتها المجمَّعة
   في موضعها الصحيح ضمن هذا التسلسل، لا مبعثرة حسب متى أُضيف كل جزء. */
const seenGroups=new Set();
const topEntries=[]; // {key:[suraNo, ayaFrom], html}
W.forEach((w,wi)=>{
  const suraNo=SURA_NO[w.id]||999;
  const ayaFrom=w.ayaFrom||(AYA_NUM[w.id]?arNum(AYA_NUM[w.id]):0);
  if(!w.group){
    topEntries.push({key:[suraNo,ayaFrom,wi], html:blockHTMLs[wi], weight:1});
    return;
  }
  if(seenGroups.has(w.group)) return; /* أُدرِج بالفعل ضمن بطاقة المجموعة عند أول ظهور لها */
  seenGroups.add(w.group);
  const members=W.map((x,xi)=>({x,xi}))
    .filter(({x})=>x.group===w.group)
    .sort((a,b)=>{
      const af=a.x.ayaFrom||(AYA_NUM[a.x.id]?arNum(AYA_NUM[a.x.id]):0);
      const bf=b.x.ayaFrom||(AYA_NUM[b.x.id]?arNum(AYA_NUM[b.x.id]):0);
      return af-bf;
    });
  const groupItems=members.map(({xi})=>blockHTMLs[xi]).join('\n');
  const first=members.length?members[0].x:w;
  const groupMinAya=members.length?(first.ayaFrom||(AYA_NUM[first.id]?arNum(AYA_NUM[first.id]):0)):0;
  const groupTotalQ=members.reduce((a,{x})=>a+x.secs.reduce((s,sec)=>s+sec.q.length,0),0);
  const groupRev=revPlaceOf(first.id);
  const groupJuz=juzOf(SURA_NO[first.id], AYA_NUM[first.id]?arNum(AYA_NUM[first.id]):1);
  topEntries.push({key:[suraNo,groupMinAya,wi], html:`<details class="ws-group">
  <summary class="ws-group-head card">
    <div class="tagrow">
      <span class="tag" data-i18n="tagSurah">سورة كاملة</span>
      ${groupRev?`<span class="tag rev-tag" data-i18n="${groupRev==='م'?'revMeccan':'revMedinan'}">${groupRev==='م'?'مكية':'مدنية'}</span>`:''}
      ${groupJuz?`<span class="loc-tag">📍 <span data-i18n-tpl="${tid('الجزء {}')}" data-i18n-word="${toAr(groupJuz)}">الجزء ${toAr(groupJuz)}</span></span>`:''}
    </div>
    <h2><span class="ws-group-icon">📖</span> <span data-i18n="surahWord">سورة</span> <span data-i18n-name="${esc(w.suraOf)}">${esc(w.suraOf)}</span></h2>
    <div class="vpeek">﴿ ${verseHTML(first)} ﴾</div>
    <div class="cmeta">
      <span class="cmeta-start">
        <span class="prog-mini" data-i18n-tpl="${tid('{} سؤالًا')}" data-i18n-word="${toAr(groupTotalQ)}">${toAr(groupTotalQ)} سؤالًا</span>
        <span class="ws-group-count" data-i18n-tpl="${tid('{} جزءًا')}" data-i18n-word="${toAr(w.groupTotal)}">${toAr(w.groupTotal)} جزءًا</span>
      </span>
      <span class="cmeta-end">
        <button type="button" class="icon-btn group-audio-play js-only" data-audio-group="${members.map(({x})=>x.id).join(',')}" hidden aria-label="استماع لكامل السورة" title="استماع لكامل السورة" data-i18n-aria="listenSurahWs">${ICON_SPEAKER}</button>
        <span class="go" data-i18n="openWs">افتح الورقة ▾</span>
      </span>
    </div>
  </summary>
  <div class="ws-group-items">
${groupItems}
  </div>
</details>`, weight:members.length||1});
});
topEntries.sort((a,b)=> a.key[0]-b.key[0] || a.key[1]-b.key[1] || a.key[2]-b.key[2]);
/* الصفحة الرئيسية كانت تبني ٦٨٧ بطاقة/مجموعة في الـDOM دفعة واحدة عند
   التحميل الأول رغم أن الزائر يرى بضع عشرات منها فقط — هذا هو السبب
   الرئيسي لثقل Style & Layout في تقرير Lighthouse (٤.٣ ثانية). الحل:
   أول GRID_PAGE_SIZE بطاقة تُكتب كعناصر DOM حقيقية كالمعتاد (أول ما يراه
   الزائر)، والباقي يُخزَّن كنص HTML خام داخل <script type="application/json">
   (يبقى الملف ذاتي الاكتفاء ويعمل بفتحه مباشرة بلا خادم) ليُدرجه app.js
   تدريجيًا (تمرير للأسفل) أو دفعة واحدة عند البحث/التصفية. */
const GRID_PAGE_SIZE=30;
let gridPageCut=topEntries.length, gridWeight=0;
for(let i=0;i<topEntries.length;i++){
  gridWeight+=topEntries[i].weight;
  if(gridWeight>=GRID_PAGE_SIZE){ gridPageCut=i+1; break; }
}
const firstPage=topEntries.slice(0,gridPageCut);
const restPage=topEntries.slice(gridPageCut);
const blocks=firstPage.map(e=>e.html).join('\n');
const gridRestJSON=JSON.stringify(restPage.map(e=>e.html)).replace(/<\/script/gi,'<\\/script');


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
<html dir="rtl" lang="ar" translate="no" class="notranslate">
<head>
<meta charset="UTF-8">
<meta name="google" content="notranslate">
<!-- The Quranic text must never be machine-translated by a browser extension
     (e.g. Google Translate) — only our own reviewed translations, via the
     in-app language switcher, are shown. translate="no" + class="notranslate"
     + this meta tag together are the most reliable known way to stop Chrome
     from offering to translate the whole page. -->
<script>
/* إضافة class="js" على <html> فورًا هنا — لا في نهاية app.js كما كانت —
   فتظهر عناصر .js-only (التصفية، الصوت...) منذ أول رسم للصفحة بدل ومضة
   "عارية" قبل اكتمال تحميل app.js في نهاية الصفحة. */
document.documentElement.classList.add('js');
/* تطبيق الوضع الداكن/الفاتح المحفوظ فورًا هنا — قبل أي CSS أو رسم للصفحة —
   بدل انتظار app.js في نهاية الصفحة؛ كان التأخير يُسبِّب ومضة (FOUC) تُظهر
   الوضع الافتراضي (يتبع إعداد الجهاز) للحظة قبل تصحيحه، فتبدو الصفحة كأنها
   "عادت" لوضع مختلف عمّا اختاره المستخدم صراحةً عند كل إعادة تحميل. */
try{
  var __t=localStorage.getItem('tahleel-theme');
  if(__t) document.documentElement.setAttribute('data-theme',__t);
}catch(e){}
/* بدء جلب قاموس اللغة غير العربية المحفوظة فورًا هنا (لا الانتظار حتى نهاية
   الصفحة) — يقلّل مدة ظهور النص العربي قبل تبدّله للغة المختارة عند إعادة
   التحميل؛ Locale في app.js تعيد استخدام نفس الطلب (نفس الرابط) بدل تكراره. */
try{
  var __L=localStorage.getItem('tahleel-locale');
  if(__L && __L!=='ar'){
    var __lk=document.createElement('link');
    __lk.rel='preload'; __lk.as='fetch'; __lk.href='api/i18n/'+__L+'.json'; __lk.crossOrigin='anonymous';
    document.head.appendChild(__lk);
  }
}catch(e){}
</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>التحليل اللغوي المجهري — مختبر تحليل السور والآيات</title>
<meta name="description" content="${DESC}">
<meta name="robots" content="index, follow">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; media-src 'self' https://everyayah.com; object-src 'none'; base-uri 'self'; form-action 'self'">
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
<!-- Loaded non-render-blocking (media="print" trick, swapped to "all" on
     load): the page already stays fully hidden (visibility:hidden below)
     until document.fonts.ready resolves, so there is no flash-of-unstyled
     text risk to trade off here — only wasted render-blocking time from
     loading it the normal blocking way. -->
<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Baloo+Bhaijaan+2:wght@500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Baloo+Bhaijaan+2:wght@500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"></noscript>
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
<div id="settingsPanel" class="audio-settings-panel settings-panel" hidden>
  <div class="settings-root" id="settingsRoot">
    <div class="settings-title" data-i18n="settingsBtn">الإعدادات</div>
    <button type="button" class="settings-cat" data-cat="lang">
      <span class="settings-cat-icon" aria-hidden="true">${ICON_GLOBE}</span>
      <span class="settings-cat-label" data-i18n="languageLabel">اللغة</span>
      <span class="settings-cat-value" id="settingsLangValue"></span>
      <span class="settings-chevron" aria-hidden="true">${ICON_CHEVRON}</span>
    </button>
    <button type="button" class="settings-cat" data-cat="theme">
      <span class="settings-cat-icon" aria-hidden="true">${ICON_THEME}</span>
      <span class="settings-cat-label" data-i18n="themeLabel">المظهر</span>
      <span class="settings-cat-value" id="settingsThemeValue"></span>
      <span class="settings-chevron" aria-hidden="true">${ICON_CHEVRON}</span>
    </button>
    <button type="button" class="settings-cat" data-cat="reciter">
      <span class="settings-cat-icon" aria-hidden="true">${ICON_SPEAKER}</span>
      <span class="settings-cat-label" data-i18n="reciterLabel">القارئ</span>
      <span class="settings-cat-value" id="settingsReciterValue"></span>
      <span class="settings-chevron" aria-hidden="true">${ICON_CHEVRON}</span>
    </button>
  </div>
  <div class="settings-sub" data-cat="lang" hidden>
    <div class="settings-sub-head">
      <button type="button" class="settings-back" aria-label="رجوع" title="رجوع">${ICON_BACK}</button>
      <div class="settings-group-title" data-i18n="languageLabel">اللغة</div>
    </div>
    <button type="button" class="lang-opt" data-lang="ar">العربية</button>
    <button type="button" class="lang-opt" data-lang="en">English</button>
    <button type="button" class="lang-opt" data-lang="ur">اردو</button>
    <button type="button" class="lang-opt" data-lang="tr">Türkçe</button>
    <button type="button" class="lang-opt" data-lang="ug">ئۇيغۇرچە</button>
    <button type="button" class="lang-opt" data-lang="id">Bahasa Indonesia/Melayu</button>
    <button type="button" class="lang-opt" data-lang="fr">Français</button>
    <button type="button" class="lang-opt" data-lang="bn">বাংলা</button>
    <button type="button" class="lang-opt" data-lang="ha">Hausa</button>
    <button type="button" class="lang-opt" data-lang="fa">فارسی</button>
    <button type="button" class="lang-opt" data-lang="ml">മലയാളം</button>
    <button type="button" class="lang-opt" data-lang="sw">Kiswahili</button>
    <button type="button" class="lang-opt" data-lang="hi">हिन्दी</button>
    <button type="button" class="lang-opt" data-lang="es">Español</button>
    <button type="button" class="lang-opt" data-lang="ru">Русский</button>
    <button type="button" class="lang-opt" data-lang="zh">中文</button>
    <button type="button" class="lang-opt" data-lang="so">Soomaali</button>
    <button type="button" class="lang-opt" data-lang="ps">پښتو</button>
  </div>
  <div class="settings-sub" data-cat="theme" hidden>
    <div class="settings-sub-head">
      <button type="button" class="settings-back" aria-label="رجوع" title="رجوع">${ICON_BACK}</button>
      <div class="settings-group-title" data-i18n="themeLabel">المظهر</div>
    </div>
    <button type="button" class="theme-switch-row" id="themeToggle" aria-label="تبديل الوضع الداكن/الفاتح">
      <span class="settings-cat-icon" id="themeIcon" aria-hidden="true">${ICON_THEME}</span>
      <span class="settings-cat-label" id="themeToggleLabel">الوضع الداكن</span>
      <span class="theme-switch" aria-hidden="true"><span class="theme-switch-thumb"></span></span>
    </button>
  </div>
  <div class="settings-sub" data-cat="reciter" hidden>
    <div class="settings-sub-head">
      <button type="button" class="settings-back" aria-label="رجوع" title="رجوع">${ICON_BACK}</button>
      <div class="settings-group-title" data-i18n="reciterLabel">القارئ</div>
    </div>
    <button type="button" class="theme-switch-row" id="istiadhahToggle" aria-label="تشغيل الاستعاذة قبل التلاوة">
      <span class="settings-cat-icon" aria-hidden="true">${ICON_SPEAKER}</span>
      <span class="settings-cat-label" data-i18n="istiadhahToggleLabel">الاستعاذة قبل التلاوة</span>
      <span class="theme-switch" aria-hidden="true"><span class="theme-switch-thumb"></span></span>
    </button>
    <div class="settings-search"><input type="text" id="reciterSearch" placeholder="ابحث عن قارئ..." data-i18n-ph="reciterSearchPh"></div>
    <div id="reciterOpts" class="reciter-opts">
${RECITERS.map(([id,ar,en])=>`      <button type="button" class="lang-opt reciter-opt${id===21?' on':''}" data-reciter="${id}" data-ar-name="${esc(ar)}" data-en-name="${esc(en)}">${esc(ar)}</button>`).join('\n')}
    </div>
    <span class="admin-hint" data-i18n="audioHint">يعمل تلقائيًا مع أي ورقة سورة أو آية كاملة.</span>
  </div>
</div>
<header class="topbar">
  <div class="topbar-in">
    <div class="brand" id="brandKey" title="التحليل اللغوي المجهري">
      <span class="lens" aria-hidden="true"></span>
      <span class="bt"><span data-i18n="brand">التحليل اللغوي المجهري</span><small data-i18n="brandSub">مختبر تحليل السور والآيات — نسخة ${VERSION}</small></span>
    </div>
    <div class="spacer"></div>
    <div class="settings-switch">
      <button type="button" class="act icon-btn" id="settingsBtn" aria-haspopup="true" aria-expanded="false" aria-label="الإعدادات" title="الإعدادات" data-i18n-aria="settingsBtn">${ICON_GEAR}</button>
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
    <div class="flat-hint" id="flatHint" hidden data-i18n="flatHint">الأجزاء معروضة منفصلة الآن — اضغط "آيات مختارة" مجددًا أو اختر "كل الأوراق" للعودة إلى تجميعها.</div>
    <div class="juz-filter">
      <button type="button" class="act" id="juzBtn" aria-haspopup="true" aria-expanded="false">📖 <span id="juzBtnLabel" data-i18n="fJuzAll">اختر جزءًا</span></button>
      <div id="juzPanel" class="audio-settings-panel juz-panel" hidden>
        <button type="button" class="lang-opt juz-opt on" data-juz="0" data-i18n="fJuzAll">اختر جزءًا</button>
        ${Array.from({length:30},(_,i)=>`<button type="button" class="lang-opt juz-opt" data-juz="${i+1}" data-i18n-tpl="${tid('الجزء {}')}" data-i18n-word="${toAr(i+1)}">الجزء ${toAr(i+1)}</button>`).join('')}
      </div>
    </div>
    <div class="tabs lvl-tabs"><button class="on" data-lf="all" data-i18n="lvlAll">كل المستويات</button>${LEVELS.map((L,i)=>`<button data-lf="${i+1}" class="lvl-tab lvl-${i+1}" data-i18n="lvl${i+1}">${L}</button>`).join('')}</div>
    <div class="search"><input id="q" type="text" placeholder="ابحث عن سورة أو آية..." data-i18n-ph="searchPh"></div>
  </div>
</div>
<section class="grid">
${blocks}
<div id="gridSentinel" aria-hidden="true"></div>
</section>
<script type="application/json" id="gridRest">${gridRestJSON}</script>
</main>
${adminHtml}
<footer class="site-foot">
  <div dir="rtl">﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾</div>
  <span class="ver">التحليل اللغوي المجهري — الإصدار ${VERSION} · بُني بتاريخ ${BUILD_DATE} · ${W.length} ورقة · ${totQ} سؤالًا</span>
</footer>
<script type="application/json" id="customws">[]</script>
<script type="application/json" id="customq">{}</script>
<script type="application/json" id="quranfull">${QURAN_FULL}</script>
<script type="application/json" id="i18nData">${I18N}</script>
<script type="application/json" id="wsIndex">${JSON.stringify(wsIndex)}</script>
<script>
${js}
</script>
<script>
${adminJs}
</script>
<script>
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')){
  window.addEventListener('load',function(){
    /* self.clients.claim() in the worker's activate handler fires
       controllerchange even on a visitor's very first-ever page load (no
       service worker ever controlled this page before) — not just when an
       already-installed worker is updated, which is the only case the
       auto-reload below was meant for. Without this check, every new
       visitor got an unexpected forced reload moments after their first
       load, landing at random inside whatever they were doing (typing an
       answer, opening the admin panel while it was mid-way through loading
       hundreds of worksheets) and reading as the page freezing or
       resetting. Only reload when a controller already existed pre-register
       — i.e. a real update on a returning visit, not a first visit. */
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('service-worker.js', {updateViaCache:'none'}).then(function(reg){
      /* تحقّق من وجود نسخة جديدة عند كل زيارة (يتجاوز أي تخزين مؤقت للمتصفح لملف الووركر نفسه) */
      reg.update().catch(function(){});
      setInterval(function(){ reg.update().catch(function(){}); }, 30*60*1000);
    }).catch(function(){});
    if(hadController){
      var refreshed=false;
      navigator.serviceWorker.addEventListener('controllerchange',function(){
        if(refreshed) return; refreshed=true; window.location.reload();
      });
    }
  });
}
</script>
</body>
</html>`;
/* ================= إخراج الملفات الثابتة المرافقة (PWA وSEO) ================= */
fs.mkdirSync(path.join(__dirname,'dist'), {recursive:true});
/* Isti'adhah audio: a local file provided by the repo owner (audios/istiadhah.mp3),
   copied to dist/audios/ as-is — no external, unverified link. */
fs.mkdirSync(path.join(__dirname,'dist/audios'), {recursive:true});
const istiadhahSrc=path.join(__dirname,'audios/istiadhah.mp3');
if(fs.existsSync(istiadhahSrc)) fs.copyFileSync(istiadhahSrc, path.join(__dirname,'dist/audios/istiadhah.mp3'));
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
  fs.mkdirSync(path.join(__dirname,'dist/api/i18n'), {recursive:true});
  I18N_LANGS.forEach(l=>{
    fs.writeFileSync(path.join(__dirname,'dist/api/i18n/'+l+'.json'), JSON.stringify(I18N_CATALOGS[l]));
  });
  fs.writeFileSync(path.join(__dirname,'dist/api/worksheets.json'), JSON.stringify(apiWorksheets));
  /* Each worksheet body gets its own .js file instead of all 687 (~23MB)
     being embedded in one JSON blob inside the page itself — that forced
     downloading/parsing every worksheet up front even though the visitor
     may never open most of them, which is exactly what the lazy-loading
     work (ensureBodyLoaded) was meant to avoid; it just hadn't been applied
     to the data transfer itself yet, only to building DOM from it. Plain
     <script src> (not fetch/XHR) so this still works when index.html is
     opened directly by double-click (file://) with no server — fetch/XHR
     to separate local files is blocked by browser same-origin policy under
     file://, but <script> tags load without that restriction. */
  fs.mkdirSync(path.join(__dirname,'dist/api/ws'), {recursive:true});
  Object.keys(wsBodies).forEach(id=>{
    fs.writeFileSync(path.join(__dirname,'dist/api/ws/'+id+'.js'),
      'window.__WSB=window.__WSB||{};window.__WSB['+JSON.stringify(id)+']='+JSON.stringify(wsBodies[id])+';');
  });
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
const AUDIO_CACHE='${AUDIO_CACHE_NAME}';
const ASSETS=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))); });
/* AUDIO_CACHE is intentionally excluded from the versioned-cache cleanup
   below — app.js manages its contents directly (prefetching a worksheet's
   recitation on play, clearing it when the visitor switches worksheets),
   independent of app deploys/versions. */
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==AUDIO_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
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
  /* Cross-origin requests (recitation audio from everyayah.com) are looked
     up only in AUDIO_CACHE, which app.js populates explicitly per worksheet
     — never written to from here, so this cache's contents stay exactly
     what app.js decided to keep, not an unbounded, ever-growing archive of
     every audio file ever played. */
  if(new URL(e.request.url).origin!==self.location.origin){
    e.respondWith(caches.open(AUDIO_CACHE).then(c=>c.match(e.request)).then(hit=>hit||fetch(e.request)));
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
