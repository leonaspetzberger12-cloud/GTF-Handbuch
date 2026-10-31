const FILE = 'GTF-GANGTASKFORCE-AUSZAHLUNG.xlsx';
const COOKIE = '__Host-gtf_admin';
const TTL = 1800;
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {status, headers: {'Content-Type':'application/json', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', ...extra}});
const cookie = (value, age) => `${COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
async function hash(value) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2,'0')).join(''); }
async function same(a,b) { const x=await hash(a), y=await hash(b); let d=0; for(let i=0;i<x.length;i++)d |= x.charCodeAt(i)^y.charCodeAt(i); return d===0; }
async function tokenHash(request) { const raw = request.headers.get('Cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1); return raw && /^[a-f0-9]{64}$/.test(raw) ? hash(raw) : ''; }
export async function onRequest({request,env}) {
 try {
  const url=new URL(request.url), action=url.pathname.replace(/\/$/,'').split('/').pop();
  if (!env.ADMIN_DB || !env.ADMIN_FILES || !/^\d{10,32}$/.test(env.ADMIN_PIN || '')) return json({error:'Admin-Zugang ist noch nicht eingerichtet.'},503);
  if (!['GET','POST','PUT'].includes(request.method)) return json({error:'Methode nicht erlaubt.'},405);
  if(request.method!=='GET' && request.headers.get('Origin')!==url.origin) return json({error:'Zugriff abgelehnt.'},403);
  const now=Math.floor(Date.now()/1000), db=env.ADMIN_DB;
  if(action==='login' && request.method==='POST') {
   if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Ungültige Anfrage.'},400);
   const text=await request.text(); if(text.length>256)return json({error:'Ungültige Anfrage.'},400);
   let pin;try{pin=JSON.parse(text).pin}catch{return json({error:'Ungültige Anfrage.'},400)}
   if(typeof pin!=='string'||!/^\d{10,32}$/.test(pin))return json({error:'PIN muss 10 bis 32 Ziffern enthalten.'},400);
   const ip=request.headers.get('CF-Connecting-IP'); if(!ip)return json({error:'Anmeldung nicht verfügbar.'},503);
   const bucket=Math.floor(now/900), key=await hash(ip);
   // Atomic counters, shared across instances; a global budget limits distributed guessing.
   await db.prepare('DELETE FROM admin_attempts WHERE bucket < ?').bind(bucket-1).run();
   const counts=await db.batch([key,'global'].map(k=>db.prepare('INSERT INTO admin_attempts (key,bucket,count) VALUES (?,?,1) ON CONFLICT(key,bucket) DO UPDATE SET count=count+1 RETURNING count').bind(k,bucket)));
   if(counts[0].results[0].count>5||counts[1].results[0].count>50)return json({error:'Zu viele Versuche. Bitte später erneut versuchen.'},429,{'Retry-After':String(900-now%900)});
   if(!await same(pin,env.ADMIN_PIN))return json({error:'PIN ist nicht korrekt.'},401);
   await db.prepare('DELETE FROM admin_sessions WHERE expires <= ?').bind(now).run();
   const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
   await db.prepare('INSERT INTO admin_sessions (token,expires,pin_version) VALUES (?,?,?)').bind(await hash(token),now+TTL,await hash(env.ADMIN_PIN)).run();
   return json({ok:true,expires:now+TTL},200,{'Set-Cookie':cookie(token,TTL)});
  }
  const token=await tokenHash(request);
  if(action==='logout' && request.method==='POST'){
   if(token)await db.prepare('DELETE FROM admin_sessions WHERE token=?').bind(token).run();
   return json({ok:true},200,{'Set-Cookie':cookie('',0)});
  }
  const session=token && await db.prepare('SELECT expires,pin_version FROM admin_sessions WHERE token=?').bind(token).first();
  if(!session||session.expires<=now||session.pin_version!==await hash(env.ADMIN_PIN))return json({error:'Bitte als Admin anmelden.'},401,{'Set-Cookie':cookie('',0)});
  if(action==='session' && request.method==='GET')return json({ok:true,expires:session.expires});
  if(action==='file' && request.method==='GET'){
   const file=await env.ADMIN_FILES.get(FILE);
   if(!file)return json({error:'Die Auszahlungstabelle wurde noch nicht hinterlegt.'},404);
   return new Response(file.body,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="${FILE}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(action==='file' && request.method==='PUT'){
   const max=10*1024*1024;
   if(!request.body)return json({error:'Datei fehlt.'},400);
   const reader=request.body.getReader(), chunks=[];let size=0;
   while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();return json({error:'Maximal 10 MB erlaubt.'},413)}chunks.push(value)}
   const data=new Uint8Array(size);let offset=0;for(const c of chunks){data.set(c,offset);offset+=c.length}
   if(size<4||data[0]!==80||data[1]!==75||data[2]!==3||data[3]!==4)return json({error:'Bitte eine XLSX-Datei auswählen.'},400);
   await env.ADMIN_FILES.put(FILE,data,{httpMetadata:{contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}});
   return json({ok:true});
  }
  return json({error:'Nicht gefunden.'},404);
 }catch { return json({error:'Admin-Dienst vorübergehend nicht verfügbar.'},503); }
}
