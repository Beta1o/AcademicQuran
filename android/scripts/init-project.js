/*
 * يولّد مشروع أندرويد (Gradle) من android/twa-manifest.json مباشرة، دون المرور
 * بأمر `bubblewrap init` التفاعلي — ذلك الأمر يسأل نحو 15 سؤالًا (اسم التطبيق،
 * معرّف الحزمة، الألوان، الأيقونات...) ولا يملك أي خيار لتخطّيها، فيتجمّد أي
 * تشغيل غير تفاعلي (كـ GitHub Actions) بلا استجابة. هذا السكربت يستدعي نفس
 * الدوال الداخلية التي يستدعيها `init` بعد جمع إجاباته — TwaGenerator من
 * @bubblewrap/core مباشرة ببيانات منمانيفست جاهزة مسبقًا بالكامل.
 */
const path = require('path');
const fs = require('fs');
const { TwaManifest, TwaGenerator } = require('@bubblewrap/core');
const { generateTwaProject, generateManifestChecksumFile } = require('@bubblewrap/cli/dist/lib/cmds/shared');
const { InquirerPrompt } = require('@bubblewrap/cli/dist/lib/Prompt');

async function main() {
  const targetDirectory = path.resolve(process.cwd(), process.argv[2] || './app');
  fs.mkdirSync(targetDirectory, { recursive: true });

  const data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'twa-manifest.json'), 'utf8'));
  data.signingKey = data.signingKey || { path: path.join(targetDirectory, 'android.keystore'), alias: 'android' };

  const twaManifest = new TwaManifest(data);
  const prompt = new InquirerPrompt(); // تُستخدم فقط لطباعة رسائل التقدّم هنا، لا لأي سؤال تفاعلي

  await twaManifest.saveToFile(path.join(targetDirectory, 'twa-manifest.json'));
  await generateTwaProject(prompt, new TwaGenerator(), targetDirectory, twaManifest);
  await generateManifestChecksumFile(path.join(targetDirectory, 'twa-manifest.json'), targetDirectory);

  console.log('TWA Android project generated at', targetDirectory);
}

main().catch((e) => { console.error(e); process.exit(1); });
