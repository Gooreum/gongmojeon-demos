import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {writeFile,readFile} from 'node:fs/promises';
if(!process.env.PW_ROOT)throw new Error('Set PW_ROOT to the directory containing Playwright.');
const {chromium}=createRequire(process.env.PW_ROOT + '/')('playwright');
const root=dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:760,height:520},deviceScaleFactor:1});
const manifest=[];
for(let n=1;n<=4;n++){
 await page.goto(pathToFileURL(join(root,'samples',`message-${n}.html`)).href);
 await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
 await page.screenshot({path:join(root,'samples',`message-${n}.png`)});
 const boxes=await page.locator('[data-personal]').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {type:node.dataset.personal,x:Math.floor(r.x),y:Math.floor(r.y),width:Math.ceil(r.right)-Math.floor(r.x),height:Math.ceil(r.bottom)-Math.floor(r.y)};}));
 manifest.push({scene:n,file:`samples/message-${n}.png`,width:760,height:520,personalDetails:boxes,fictional:true});
}
await writeFile(join(root,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const dataFile=join(root,'data.js');
const data=(await readFile(dataFile,'utf8')).split('\nwindow.SHAPE_SAMPLES = ')[0];
await writeFile(dataFile,data+'\nwindow.SHAPE_SAMPLES = '+JSON.stringify(manifest,null,2)+';\n');
await browser.close();
console.log('Rendered 4 fictional screenshots and personal-detail coordinates.');
