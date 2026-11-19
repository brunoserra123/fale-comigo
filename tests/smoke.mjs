import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const done = Promise.withResolvers ? Promise.withResolvers() : (()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};})();
let upgraded = false;
const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(pathname==='/result' && req.method==='POST'){
        let body='';req.on('data',b=>body+=b);req.on('end',()=>{res.end('ok');const result=JSON.parse(body);result.error?done.reject(Error(result.error)):done.resolve(result.tests);});return;
    }
    if(pathname==='/advance' && req.method==='POST'){upgraded=true;res.end('ok');return;}
    if(pathname==='/sw.js' && upgraded){res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n// next release');return;}
    if(pathname==='/mock') {res.setHeader('Content-Type','application/json');let body='';req.on('data',b=>body+=b);req.on('end',()=>{
        if(!body){res.end('[]');return;}const op=JSON.parse(body);res.end(JSON.stringify({status:'ok',uuid:op.uuid,revision:1}));});return;}
    const name=pathname==='/'?'index.html':pathname.slice(1);
    const file=path.resolve(root,name);
    if(!file.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'js':'text/javascript','html':'text/html','css':'text/css','json':'application/json','png':'image/png','jpg':'image/jpeg'})[name.split('.').pop()]||'text/plain');
    if(name==='index.html'){
        const inject='<script>Object.defineProperty(navigator,"onLine",{configurable:true,get:()=>window.testOnline===true});localStorage.setItem("caa_sync_apps_script_url_default",location.origin+"/mock");localStorage.setItem("caa_last_seen_version","3.0.0");</script>';
        const html=fs.readFileSync(file,'utf8').replace('<head>','<head>'+inject).replace(/<script src="https:[^"]*"><\/script>/g,'').replace(/<link[^>]*https:\/\/fonts[^>]*>/g,'');
        res.end(html.replace('</body>','<script type="module" src="./tests/conversation.browser.js"></script></body>'));
    } else fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const appUrl='http://127.0.0.1:'+server.address().port+'/';
const userData=fs.mkdtempSync(path.join(os.tmpdir(),'fale-smoke-'));
const browser=spawn(process.env.CHROME_PATH||'google-chrome',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--no-first-run','--user-data-dir='+userData,appUrl],{stdio:'ignore',windowsHide:true});
browser.on('error',err=>done.reject(err));
browser.on('exit',code=>{if(code)done.reject(Error('Chrome exit '+code));});
const timeout=setTimeout(()=>done.reject(Error('Tempo esgotado no teste de navegador')),45000);
try {console.log(await done.promise);} finally {clearTimeout(timeout);browser.kill();server.closeAllConnections();server.close();}
