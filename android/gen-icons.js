const sharp = require('sharp');
const path = require('path');

// أيقونة التطبيق: عدسة مجهر خضراء داكنة على خلفية بيج فاتحة، بنفس هوية الموقع البصرية
const svg = (size, bg, safe) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${bg}"/>
  <g transform="translate(256,${safe ? 240 : 256})">
    <circle cx="0" cy="-30" r="140" fill="none" stroke="#1E6E63" stroke-width="26"/>
    <circle cx="0" cy="-30" r="96" fill="#CDE6E1"/>
    <rect x="-16" y="90" width="32" height="90" rx="16" fill="#1E6E63" transform="rotate(35)"/>
  </g>
</svg>`;

async function run() {
  const out = path.join(__dirname, 'icons');
  // أيقونة عادية (512) بخلفية شفافة تقريبًا كاملة الإطار
  await sharp(Buffer.from(svg(512, '#FBF8F0', false))).png().toFile(path.join(out, 'icon-512.png'));
  await sharp(Buffer.from(svg(512, '#FBF8F0', false))).resize(192, 192).png().toFile(path.join(out, 'icon-192.png'));
  // أيقونة قابلة للتشكيل (maskable) — العنصر الأساسي داخل المنطقة الآمنة المركزية
  await sharp(Buffer.from(svg(512, '#FBF8F0', true))).png().toFile(path.join(out, 'icon-maskable-512.png'));
  console.log('icons written to', out);
}
run().catch(e => { console.error(e); process.exit(1); });
