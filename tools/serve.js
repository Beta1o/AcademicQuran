#!/usr/bin/env node
/* خادم ملفات ثابت بسيط لتشغيل dist/index.html — بلا أي حزم خارجية.
   الاستخدام:
     node tools/serve.js               → http://localhost:8080
     node tools/serve.js --port=3000   → منفذ مخصص
     node tools/serve.js --open        → يفتح المتصفح تلقائيًا
   الربط على 0.0.0.0 حتى تتمكن من فتح الموقع من الجوال على نفس الشبكة
   لتجربة العرض على شاشة حقيقية. */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..', 'dist');
const argv = process.argv.slice(2);
const portArg = argv.map(a => (a.match(/^--port=(\d+)$/) || [])[1]).find(Boolean);
const PORT = Number(portArg || process.env.PORT || 8080);
const OPEN = argv.includes('--open');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error('✘ لم يُعثر على dist/index.html — نفّذ أولًا:  npm run build');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent((req.url || '/').split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('403'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': MIME['.html'] }).end('<h1>404</h1>'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(buf);
  });
});

function lanAddresses() {
  const out = [];
  const ifs = os.networkInterfaces();
  Object.keys(ifs).forEach(name => (ifs[name] || []).forEach(ni => {
    if (ni.family === 'IPv4' && !ni.internal) out.push(ni.address);
  }));
  return out;
}

/* يفتح المتصفح على لينكس/ويندوز/WSL/ماك */
function openBrowser(url) {
  const isWSL = /microsoft/i.test(os.release());
  const cands = process.platform === 'darwin' ? [['open', [url]]]
    : process.platform === 'win32' ? [['cmd.exe', ['/c', 'start', '', url]]]
    : isWSL ? [['wslview', [url]], ['cmd.exe', ['/c', 'start', '', url]], ['xdg-open', [url]]]
    : [['xdg-open', [url]]];
  (function tryNext(i) {
    if (i >= cands.length) { console.log('… افتح الرابط يدويًا في المتصفح'); return; }
    const p = spawn(cands[i][0], cands[i][1], { stdio: 'ignore', detached: true });
    p.on('error', () => tryNext(i + 1));
    p.unref();
  })(0);
}

server.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.error('✘ المنفذ ' + PORT + ' مستخدم — جرّب:  node tools/serve.js --port=' + (PORT + 1));
    process.exit(1);
  }
  throw e;
});

server.listen(PORT, '0.0.0.0', () => {
  const url = 'http://localhost:' + PORT + '/';
  console.log('▶ التحليل اللغوي المجهري يعمل الآن');
  console.log('  الحاسب : ' + url);
  lanAddresses().forEach(ip => console.log('  الجوال  : http://' + ip + ':' + PORT + '/   (نفس شبكة الواي فاي)'));
  console.log('  للإيقاف: Ctrl+C');
  if (OPEN) openBrowser(url);
});
