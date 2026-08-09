# التحليل اللغوي المجهري — تطبيق أندرويد

الموقع نفسه (`../dist/index.html` — ملف واحد قائم بذاته يضم كل CSS/JS)
مُحزَّمًا داخل تطبيق أندرويد أصلي، عبر WebView بسيط. لا خادم مضمَّن ولا
تبعيات إضافية — الموقع لا يحتاج شيئًا سوى تلاوة القرآن عبر
`quranapi.pages.dev`، وهي طلبات HTTPS عادية تعمل من WebView كأي متصفح.

## كيف تحصل على ملف APK

1. اذهب إلى تبويب **Actions** في المستودع على GitHub.
2. افتح **Android APK** ثم **Run workflow** (أو انتظر أي دفعة جديدة تُشغّله
   تلقائيًا).
3. بعد اكتمال التشغيل، حمّل **AcademicQuran-apk** من قسم **Artifacts** —
   ملف APK جاهز للتثبيت المباشر (فعّل "السماح بالتثبيت من مصادر غير
   معروفة" أولًا).

## البناء محليًا

يحتاج JDK 21 وAndroid SDK (اضبط `ANDROID_HOME`، أو `sdk.dir` في
`android/local.properties`):

```bash
node build.js --prod      # يولّد dist/index.html أولًا
cd android
./gradlew assembleRelease   # → app/build/outputs/apk/release/app-release.apk
```

`dist/index.html` يُحزَّم داخل التطبيق عبر مهمة `syncWebAssets` في كل بناء،
فأعد البناء بعد أي تعديل على الموقع.

يُوقَّع إصدار الإطلاق بـ**مفتاح التطوير (debug key)** كي يُثبَّت كما هو
مباشرة؛ للنشر الرسمي على متجر Google Play استبدل `signingConfig` في
`app/build.gradle` بمفتاح توقيع حقيقي.

## ما لا يتضمّنه هذا التطبيق

لوحة المدير وإعداداتها (كلمة المرور، الأسئلة المضافة) محلية للجهاز
(localStorage داخل WebView) تمامًا كما هي محلية للمتصفح على الموقع —
لا مزامنة بينهما ولا بين نسخ APK المختلفة.
