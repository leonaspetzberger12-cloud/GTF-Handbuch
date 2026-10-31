import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateBook,total} from '../admin/payout-model.mjs';
const row=()=>({id:'1',name:'Test',countA:5,countB:2,refund:500,paid:false,note:''});
const book=()=>({sheets:[{name:'KW 1',labelA:'Abhandlungen',labelB:'Akten',rateA:10000,rateB:17000,rows:[row()]}]});
test('payout recomputes from quantities, rates and refund',()=>{const b=book(),s=b.sheets[0];assert.equal(total(s,s.rows[0]),84500);s.rateA=20000;s.rows[0].countB=0;assert.equal(total(s,s.rows[0]),100500);validateBook(b)});
test('invalid and duplicate inputs rejected',()=>{for(const v of [-1,1.5,NaN]){const b=book();b.sheets[0].rows[0].countA=v;assert.throws(()=>validateBook(b))}const b=book();b.sheets.push(b.sheets[0]);assert.throws(()=>validateBook(b))});
