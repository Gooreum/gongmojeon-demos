// Rewrites the "patterns" array in data.js to be identical to patterns.json (read-only source).
// Run: node poc/web/sync-patterns.mjs        (add --check to only verify)
import {readFileSync,writeFileSync} from 'node:fs';
const dir=new URL('.',import.meta.url);
const src=JSON.parse(readFileSync(new URL('patterns.json',dir),'utf8'));
let js=readFileSync(new URL('data.js',dir),'utf8');
const start=js.indexOf('"patterns": [');
if(start<0) throw new Error('patterns not found in data.js');
let i=js.indexOf('[',start),depth=0,end=-1,inStr=false;
for(let k=i;k<js.length;k++){const c=js[k];
 if(inStr){if(c==='\\')k++;else if(c==='"')inStr=false;continue;}
 if(c==='"')inStr=true;else if(c==='[')depth++;else if(c===']'&&--depth===0){end=k+1;break;}}
const body=JSON.stringify(src,null,2).split('\n').map((l,n)=>n?'  '+l:l).join('\n');
const next=js.slice(0,i)+body+js.slice(end);
if(process.argv.includes('--check')){
 const m=next===js;console.log(m?'patterns in sync':'patterns OUT OF SYNC');process.exit(m?0:1);}
writeFileSync(new URL('data.js',dir),next);console.log('data.js patterns synced:',src.length,'cards');
