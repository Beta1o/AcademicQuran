const fs=require('fs');
const path=require('path');
const http=require('http');
const zlib=require('zlib');
const puppeteer=require('puppeteer');
const lighthouse=require('lighthouse').default;

/* Chrome needs a few shared libs (libnspr4, libnss3, ...) that aren't part
   of a bare system install here — vendored under ~/.local/chromelibs (see
   session setup) and exposed via LD_LIBRARY_PATH so the spawned browser
   process (which inherits this process's env) can find them. Harmless to
   set even where the system libs already exist. */
const localLibs=path.join(process.env.HOME||'', '.local/chromelibs/usr/lib/x86_64-linux-gnu');
if(fs.existsSync(localLibs)){
  process.env.LD_LIBRARY_PATH=localLibs+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'');
}

const distRoot=path.join(__dirname,'../dist');
const distPath=path.join(distRoot,'index.html');

/* Same static server as test/smoke.js (real http, not file://, so fetch()
   of the i18n/API JSON isn't blocked by file:// CORS — matters for the
   audit to see the page as a real visitor would, not a false-error page).
   Also gzips text responses, same as the mod_deflate block already shipped
   in dist/.htaccess for real Apache hosting — a plain unconfigured static
   server (what this was before) understates every real deployment, since
   dist/index.html is >85% smaller over the wire once gzipped (mostly
   repetitive Arabic text/HTML/JSON, which compresses very well). */
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const COMPRESSIBLE=/^text\/|javascript|json|manifest/;
function startServer(){
  return new Promise((resolve)=>{
    const server=http.createServer((req,res)=>{
      let rel=decodeURIComponent((req.url||'/').split('?')[0]);
      if(rel.endsWith('/')) rel+='index.html';
      const file=path.join(distRoot, path.normalize(rel).replace(/^(\.\.[/\\])+/,''));
      if(!file.startsWith(distRoot)){ res.writeHead(403).end('403'); return; }
      fs.readFile(file,(err,buf)=>{
        if(err){ res.writeHead(404).end('404'); return; }
        const type=MIME[path.extname(file).toLowerCase()]||'application/octet-stream';
        const acceptsGzip=/gzip/.test(req.headers['accept-encoding']||'');
        if(acceptsGzip && COMPRESSIBLE.test(type)){
          res.writeHead(200,{'Content-Type':type,'Content-Encoding':'gzip'});
          res.end(zlib.gzipSync(buf,{level:9}));
        } else {
          res.writeHead(200,{'Content-Type':type});
          res.end(buf);
        }
      });
    });
    server.listen(0,'127.0.0.1',()=>resolve(server));
  });
}

const KEY_AUDITS=['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','interactive','mainthread-work-breakdown','total-byte-weight','dom-size'];

/* Presets mirror Chrome DevTools' own Lighthouse panel:
   - mobile: default Lighthouse throttling (simulated Slow 4G + 4x CPU slowdown)
   - desktop: no throttling, desktop form factor/screen emulation — same as
     picking "Desktop" in the DevTools Lighthouse panel */
function optsFor(preset, wsPort){
  if(preset==='desktop'){
    return {logLevel:'error', output:'json', port:wsPort, formFactor:'desktop', screenEmulation:{disabled:true}, throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}};
  }
  return {logLevel:'error', output:'json', port:wsPort};
}

(async()=>{
  if(!fs.existsSync(distPath)){
    console.error('dist/index.html not found — run `npm run build:prod` first.');
    process.exit(1);
  }
  const server=await startServer();
  const port=server.address().port;
  const url='http://127.0.0.1:'+port+'/';

  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const wsPort=new URL(browser.wsEndpoint()).port;

  const results={};
  for(const preset of ['mobile','desktop']){
    const runnerResult=await lighthouse(url, optsFor(preset, wsPort));
    const lhr=runnerResult.lhr;
    const score=Math.round(lhr.categories.performance.score*100);
    results[preset]=score;
    console.log('\n=== '+preset+' === score:', score+'%');
    KEY_AUDITS.forEach(id=>{
      const a=lhr.audits[id];
      if(a) console.log(' ', id, ':', a.displayValue||a.numericValue);
    });
  }

  await browser.close();
  server.close();

  console.log('\n---');
  console.log('mobile:', results.mobile+'%', ' desktop:', results.desktop+'%');
})();
