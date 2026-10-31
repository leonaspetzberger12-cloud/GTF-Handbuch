import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
globalThis.crypto ||= webcrypto;
const code=await readFile(new URL('../functions/api/admin/[[path]].js',import.meta.url),'utf8');
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
function setup(){
 const sessions=new Map(),attempts=new Map();let file;
 const db={prepare(sql){return {bind(...v){return {async run(){if(sql.startsWith('INSERT INTO admin_sessions'))sessions.set(v[0],{expires:v[1],pin_version:v[2]});if(sql==='DELETE FROM admin_sessions WHERE token=?')sessions.delete(v[0]);return {}},async first(){return sessions.get(v[0])},async all(){const k=v.join(':');const count=(attempts.get(k)||0)+1;attempts.set(k,count);return {results:[{count}]}}}}}},async batch(items){return Promise.all(items.map(i=>i.all()))}};
 const env={ADMIN_PIN:'937261840562',ADMIN_DB:db,ADMIN_FILES:{async get(){return file?{body:file}:null},async put(k,data){file=data}}};
 const req=(action,method='GET',body,token,origin='https://example.com')=>onRequest({env,request:new Request('https://example.com/api/admin/'+action,{method,headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...(token?{Cookie:token}:{})},...(body===undefined?{}:{body:typeof body==='string'?body:JSON.stringify(body)})})});
 const login=()=>req('login','POST',{pin:env.ADMIN_PIN});return {req,login,env,sessions};
}
test('unconfigured service fails closed',async()=>{const {req,env}=setup();delete env.ADMIN_PIN;assert.equal((await req('file')).status,503)});
test('anonymous and forged cookies cannot download or upload',async()=>{const {req}=setup();assert.equal((await req('file')).status,401);assert.equal((await req('file','PUT','PKxx','__Host-gtf_admin='+'a'.repeat(64))).status,401)});
test('wrong PIN and attempts limit',async()=>{const {req,login}=setup();for(let n=0;n<5;n++)assert.equal((await req('login','POST',{pin:'000000000000'})).status,401);assert.equal((await login()).status,429)});
test('cross-origin mutations blocked',async()=>{const {req}=setup();assert.equal((await req('login','POST',{pin:'937261840562'},null,'https://evil.example')).status,403)});
test('login, private download, logout invalidation',async()=>{const {req,login,env}=setup();const r=await login();assert.equal(r.status,200);const cookie=r.headers.get('Set-Cookie');assert.match(cookie,/Secure; HttpOnly; SameSite=Strict/);const token=cookie.split(';')[0];assert.equal((await req('session','GET',undefined,token)).status,200);assert.equal((await req('file','GET',undefined,token)).status,404);await env.ADMIN_FILES.put('file',new Uint8Array([80,75,3,4]));const file=await req('file','GET',undefined,token);assert.equal(file.status,200);assert.match(file.headers.get('Cache-Control'),/no-store/);assert.equal((await req('logout','POST',undefined,token)).status,200);assert.equal((await req('file','GET',undefined,token)).status,401)});
test('PIN rotation invalidates sessions',async()=>{const {req,login,env}=setup();const token=(await login()).headers.get('Set-Cookie').split(';')[0];env.ADMIN_PIN='827361045892';assert.equal((await req('session','GET',undefined,token)).status,401)});
test('expired sessions fail',async()=>{const {req,login,sessions}=setup();const token=(await login()).headers.get('Set-Cookie').split(';')[0];for(const s of sessions.values())s.expires=0;assert.equal((await req('file','GET',undefined,token)).status,401)});
test('authenticated upload validates size and signature',async()=>{const {req,login}=setup();const token=(await login()).headers.get('Set-Cookie').split(';')[0];assert.equal((await req('file','PUT','plain text',token)).status,400);assert.equal((await req('file','PUT','PK\u0003\u0004test',token)).status,200);assert.equal((await req('file','GET',undefined,token)).status,200);assert.equal((await req('file','PUT','x'.repeat(10*1024*1024+1),token)).status,413)});
