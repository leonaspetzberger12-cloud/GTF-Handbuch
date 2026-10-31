export function validateBook(book) {
 if(!book||!Array.isArray(book.sheets)||!book.sheets.length||book.sheets.length>104)throw Error('Ungültige Wochenliste.');
 const names=new Set();
 for(const s of book.sheets){
  if(typeof s.name!=='string'||!s.name.trim()||s.name.length>40||names.has(s.name))throw Error('Wochenname fehlt oder ist doppelt.');names.add(s.name);
  for(const label of ['labelA','labelB'])if(typeof s[label]!=='string'||s[label].length>80)throw Error('Ungültige Spaltenbezeichnung.');
  for(const k of ['rateA','rateB'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1e9)throw Error('Ungültiger Multiplikationsfaktor.');
  if(!Array.isArray(s.rows)||s.rows.length>1000)throw Error('Zu viele Einträge.');
  const ids=new Set();
  for(const r of s.rows){
   if(typeof r.id!=='string'||!r.id||ids.has(r.id)||r.id.length>80)throw Error('Ungültige Eintrags-ID.');ids.add(r.id);
   if(typeof r.name!=='string'||!r.name.trim()||r.name.length>120)throw Error('Name fehlt oder ist zu lang.');
   for(const k of ['countA','countB'])if(!Number.isInteger(r[k])||r[k]<0||r[k]>1e6)throw Error('Anzahlen müssen ganze, nicht negative Zahlen sein.');
   if(!Number.isFinite(r.refund)||Math.abs(r.refund)>1e12)throw Error('Ungültige Rückerstattung.');
   if(typeof r.paid!=='boolean'||typeof r.note!=='string'||r.note.length>500)throw Error('Ungültiger Status oder Hinweis.');
  }
 }
 return book;
}
export const total=(sheet,row)=>Math.round((row.countA*sheet.rateA+row.countB*sheet.rateB+row.refund)*100)/100;
