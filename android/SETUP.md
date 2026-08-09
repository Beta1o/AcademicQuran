# تطبيق أندرويد (Trusted Web Activity)

يفتح هذا التطبيق الموقع المنشور فعليًا (`beta1o.github.io/AcademicQuran`) داخل
غلاف تطبيق أندرويد حقيقي، عبر تقنية Google الرسمية **TWA**. يرث كل تصميمك
المتجاوب (جوال/تابلت) تلقائيًا، ويبقى متزامنًا مع كل تحديث تنشره على الموقع —
لا حاجة لإعادة بناء التطبيق عند إضافة ورقة عمل جديدة أو تعديل أي محتوى.

## كيف تحصل على ملف APK

1. اذهب إلى تبويب **Actions** في المستودع على GitHub.
2. افتح **Build Android APK (TWA)** ثم **Run workflow**.
3. بعد اكتمال التشغيل (بضع دقائق)، حمّل الملف من قسم **Artifacts** باسم
   `academicquran-android-apk` — وهو ملف APK جاهز للتثبيت المباشر (sideload)
   على أي جهاز أندرويد (فعّل "السماح بالتثبيت من مصادر غير معروفة" أولًا).

هذا يعمل فقط داخل GitHub Actions، وليس في بيئة العمل المحلية — الجهاز المحلي
هنا لا يملك Java وAndroid SDK.

## مفتاح التوقيع (Signing Key) — مهم لأي تحديث لاحق

أول تشغيل للسير بلا سرّ `ANDROID_KEYSTORE_BASE64` يُنشئ مفتاح توقيع مؤقتًا
يصلح للتجربة فقط. **كل تطبيقات أندرويد يجب توقيعها بنفس المفتاح دائمًا** —
فإن غيّرته، لن يقبل أي جهاز ثبّت النسخة القديمة تحديثها لاحقًا (يعتبرها تطبيقًا
مختلفًا). لذلك يلزم إنشاء مفتاح دائم مرة واحدة وحفظه كسرّ في المستودع:

```bash
keytool -genkeypair -v -keystore android.keystore -alias android \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 android.keystore > android.keystore.b64
```

ثم في إعدادات المستودع على GitHub (Settings → Secrets and variables → Actions)
أضف:
- `ANDROID_KEYSTORE_BASE64` = محتوى `android.keystore.b64`
- `ANDROID_KEYSTORE_PASSWORD` = كلمة مرور الملف التي اخترتها
- `ANDROID_KEY_ALIAS` = `android` (أو ما اخترته)
- `ANDROID_KEY_PASSWORD` = كلمة مرور المفتاح

احتفظ بنسخة من `android.keystore` في مكان آمن خارج GitHub أيضًا — فقدانه يعني
عدم القدرة على نشر تحديثات لنفس التطبيق مستقبلًا.

## إخفاء شريط عنوان المتصفح (وضع التطبيق الكامل)

بعد إعداد مفتاح دائم وأول بناء ناجح، احصل على بصمة SHA256 للمفتاح:

```bash
keytool -list -v -keystore android.keystore -alias android
```

انسخ قيمة `SHA256:` (بصيغة `AA:BB:CC:...`)، ثم أضفها كمتغيّر مستودع (وليس سرًّا،
هذه القيمة عامة وليست حساسة): Settings → Secrets and variables → Actions →
Variables → أضف `ANDROID_ASSETLINKS_SHA256` بهذه القيمة (بلا نقطتين، أو معها —
كلاهما مقبول). أعد نشر الموقع (أي دفعة جديدة تكفي)، فيُنشر ملف
`.well-known/assetlinks.json` بالبصمة الصحيحة تلقائيًا، ويفتح التطبيق حينها
بلا شريط عنوان متصفح ظاهر.

## رفعه على متجر Google Play (اختياري، لاحقًا)

يتطلب حساب مطوّر Google Play (رسم اشتراك لمرة واحدة) ورفع نفس ملف APK (أو
تحويله إلى App Bundle عبر `bubblewrap build` بخيارات إضافية). هذه خطوة منفصلة
عن الأتمتة الحالية، ولم تُنفَّذ هنا.
