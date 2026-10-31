(() => {
 const dialog=document.createElement('dialog');
 dialog.className='gtf-admin';
 dialog.innerHTML=`<div class="panel-header"><h2 class="panel-title">GTF Admin</h2><button type="button" class="action-btn" data-close aria-label="Schließen">✕</button></div><form data-login><label for="gtf-pin">Admin-PIN</label><input id="gtf-pin" type="password" inputmode="numeric" autocomplete="current-password" required pattern="[0-9]{10,32}" minlength="10" maxlength="32"><button class="action-btn" type="submit">Anmelden</button></form><section data-private hidden><p>GTF-GANGTASKFORCE AUSZAHLUNG</p><button type="button" class="action-btn" data-download>Excel-Datei abrufen</button><hr><form data-upload><label for="gtf-file">Auszahlungstabelle hinterlegen / ersetzen</label><input id="gtf-file" type="file" accept=".xlsx" required><p class="panel-subtitle">Ersetzt die hinterlegte Datei für alle Admins.</p><button class="action-btn" type="submit">Datei speichern</button></form><button type="button" class="action-btn" data-logout>Abmelden</button></section><p data-status role="status" aria-live="polite"></p>`;
 document.body.append(dialog);
 const login=dialog.querySelector('[data-login]'), area=dialog.querySelector('[data-private]'), status=dialog.querySelector('[data-status]');let expiry;
 const showLogin=()=>{area.hidden=true;login.hidden=false;clearTimeout(expiry)};
 const showAdmin=(expires)=>{login.hidden=true;area.hidden=false;clearTimeout(expiry);expiry=setTimeout(()=>{showLogin();status.textContent='Sitzung abgelaufen. Bitte erneut anmelden.'},Math.max(0,expires*1000-Date.now()))};
 async function api(path,options={}){
  const r=await fetch('/api/admin/'+path,{credentials:'same-origin',cache:'no-store',...options});
  if(!r.ok){if(r.status===401)showLogin();let data;try{data=await r.json()}catch{}throw Error(data?.error||'Admin-Dienst nicht erreichbar. Cloudflare-Einrichtung prüfen.')}
  return r;
 }
 async function open(){if(dialog.open)return;showLogin();status.textContent='';dialog.showModal();try{const r=await api('session');showAdmin((await r.json()).expires)}catch(e){if(!e.message.includes('Bitte als Admin'))status.textContent=e.message}if(!login.hidden)dialog.querySelector('input').focus()}
 let clicks=0,last=0;
 const brand=document.querySelector('.topbar-brand');
 if(brand){brand.addEventListener('click',()=>{const now=Date.now();clicks=now-last<1500?clicks+1:1;last=now;if(clicks>=5){clicks=0;open()}})}
 document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='a'){e.preventDefault();open()}});
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{login.reset();status.textContent=''});
 async function task(button,fn){button.disabled=true;status.textContent='';try{await fn()}catch(e){status.textContent=e.message}finally{button.disabled=false}}
 login.onsubmit=e=>{e.preventDefault();task(login.querySelector('button'),async()=>{const r=await api('login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin:dialog.querySelector('#gtf-pin').value})});login.reset();showAdmin((await r.json()).expires);status.textContent='Angemeldet. Sitzung gilt 30 Minuten.'})};
 dialog.querySelector('[data-download]').onclick=e=>task(e.target,async()=>{const r=await api('file');const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download='GTF-GANGTASKFORCE-AUSZAHLUNG.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
 dialog.querySelector('[data-upload]').onsubmit=e=>{e.preventDefault();const form=e.target;task(form.querySelector('button'),async()=>{const file=dialog.querySelector('#gtf-file').files[0];if(!file||!file.name.toLowerCase().endsWith('.xlsx'))throw Error('Bitte eine XLSX-Datei auswählen.');if(file.size>10*1024*1024)throw Error('Maximal 10 MB erlaubt.');if(!confirm('Die hinterlegte Auszahlungstabelle für alle Admins ersetzen?'))return;await api('file',{method:'PUT',body:file,headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}});form.reset();status.textContent='Auszahlungstabelle gespeichert.'})};
 dialog.querySelector('[data-logout]').onclick=e=>task(e.target,async()=>{await api('logout',{method:'POST'});showLogin();status.textContent='Abgemeldet.'});
})();
