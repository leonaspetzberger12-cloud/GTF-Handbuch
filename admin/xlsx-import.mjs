// Reads the supplied workbook layout using native browser ZIP/XML support.
export async function importXlsx(file){
 if(file.size>10*1024*1024)throw Error('Maximal 10 MB erlaubt.');
 const data=new Uint8Array(await file.arrayBuffer()),view=new DataView(data.buffer),decoder=new TextDecoder(),entries=new Map();
 let end=-1;for(let i=data.length-22;i>=Math.max(0,data.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break}
 if(end<0)throw Error('Ungültige XLSX-Datei.');
 let pos=view.getUint32(end+16,true);const count=view.getUint16(end+10,true);if(count>2000)throw Error('Datei enthält zu viele ZIP-Einträge.');
 for(let i=0;i<count;i++){
  if(view.getUint32(pos,true)!==0x02014b50)throw Error('Ungültiges ZIP-Verzeichnis.');
  const nameLen=view.getUint16(pos+28,true),extra=view.getUint16(pos+30,true),comment=view.getUint16(pos+32,true);
  const name=decoder.decode(data.slice(pos+46,pos+46+nameLen));entries.set(name,{method:view.getUint16(pos+10,true),size:view.getUint32(pos+20,true),offset:view.getUint32(pos+42,true)});pos+=46+nameLen+extra+comment;
 }
 let totalBytes=0;
 async function xml(name,optional=false){const e=entries.get(name);if(!e){if(optional)return null;throw Error('XLSX-Bestandteil fehlt: '+name)}
  const start=e.offset+30+view.getUint16(e.offset+26,true)+view.getUint16(e.offset+28,true),bytes=data.slice(start,start+e.size);let stream=new Blob([bytes]).stream();
  if(e.method===8)stream=stream.pipeThrough(new DecompressionStream('deflate-raw'));else if(e.method!==0)throw Error('ZIP-Kompression nicht unterstützt.');
  const reader=stream.getReader(),parts=[];let length=0;while(true){const r=await reader.read();if(r.done)break;length+=r.value.length;totalBytes+=r.value.length;if(length>20e6||totalBytes>40e6){await reader.cancel();throw Error('Entpackte Datei zu groß.')}parts.push(r.value)}
  const raw=new Uint8Array(length);let at=0;for(const p of parts){raw.set(p,at);at+=p.length}const doc=new DOMParser().parseFromString(decoder.decode(raw),'application/xml');if(doc.querySelector('parsererror'))throw Error('Ungültiges Tabellen-XML.');return doc;
 }
 const strings=await xml('xl/sharedStrings.xml',true),shared=strings?Array.from(strings.getElementsByTagName('si'),n=>Array.from(n.getElementsByTagName('t'),t=>t.textContent).join('')):[];
 const workbook=await xml('xl/workbook.xml'),rels=await xml('xl/_rels/workbook.xml.rels'),targets=new Map(Array.from(rels.getElementsByTagName('Relationship'),n=>[n.getAttribute('Id'),n.getAttribute('Target')]));const sheets=[];
 for(const sheet of workbook.getElementsByTagName('sheet')){
  const target=targets.get(sheet.getAttribute('r:id'));if(!target)throw Error('Blattzuordnung fehlt.');const path=target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.\//,'');
  if(!path.startsWith('xl/')||path.includes('..'))throw Error('Ungültiger Tabellenpfad.');const doc=await xml(path),cells=new Map();
  for(const c of doc.getElementsByTagName('c')){const type=c.getAttribute('t'),raw=c.getElementsByTagName('v')[0]?.textContent;let value;if(type==='s')value=shared[Number(raw)];else if(type==='inlineStr')value=Array.from(c.getElementsByTagName('t'),n=>n.textContent).join('');else if(type==='b')value=raw==='1';else if(type==='str')value=raw;else value=raw===undefined?null:Number(raw);cells.set(c.getAttribute('r'),value)}
  const rows=[];
  for(const [address,name] of cells){if(!/^B\d+$/.test(address)||Number(address.slice(1))<3||typeof name!=='string'||!name.trim()||name.trim().toLowerCase()==='zwischensummen')continue;const n=address.slice(1);rows.push({id:n,name,countA:cells.get('C'+n)??0,countB:cells.get('F'+n)??0,refund:cells.get('I'+n)??0,paid:cells.get('L'+n)===true,note:String(cells.get('M'+n)??'')})}
  sheets.push({name:sheet.getAttribute('name'),labelA:cells.get('C1')||'Abhandlungen',labelB:cells.get('F1')||'Akten',rateA:cells.get('D2'),rateB:cells.get('G2'),rows});
 }
 return {sheets};
}
