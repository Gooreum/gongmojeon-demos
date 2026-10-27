/*
 * Semantic regression checks without a browser renderer.
 * DOM_ROOT=/directory/containing/jsdom node poc/web/test/dom-check.mjs
 * Does not validate layout, screenshots, camera hardware or actual YouCam calls.
 */
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
if(!process.env.DOM_ROOT)throw new Error('Set DOM_ROOT to the directory containing jsdom.');
const {JSDOM,VirtualConsole}=createRequire(process.env.DOM_ROOT + '/')('jsdom');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=(await readFile(root+'/index.html','utf8')).replace(/<script[^>]*>.*?<\/script>/gs,'');
const files=['config.js','data.js','js/color.js','js/rules.js','js/routine.js','js/precheck.js','js/youcam.js','app.js'];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let checks=0;
const languageCases=[
  {query:'',lang:'en'},
  {query:'?lang=en',lang:'en'},
  {query:'?lang=ko',lang:'ko'},
  {query:'?lang=fr',lang:'en'},
  {query:'',configured:'ko',lang:'ko'},
  {query:'?lang=en',configured:'ko',lang:'en'}
];
for(const {query,configured,lang} of languageCases){
  const errors=[],console=new VirtualConsole();
  console.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(html,{url:'https://cart-check.test/'+query+'#scene-1',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
  const w=dom.window;
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.structuredClone=structuredClone;w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
  const timer=w.setTimeout.bind(w);w.setTimeout=(fn,ms,...args)=>timer(fn,Math.min(ms,20),...args);
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.fetch=async url=>new Response(await readFile(path.join(root,String(url))));
  w.addEventListener('error',error=>errors.push(error.message));
  for(const file of files){
    w.eval(await readFile(path.join(root,file),'utf8'));
    if(file==='config.js'&&configured)w.CART_CONFIG=Object.freeze({...w.CART_CONFIG,DEFAULT_LANGUAGE:configured});
  }
  const screen=()=>w.document.querySelector('main').dataset.screen;
  const wait=async expected=>{
    for(let attempt=0;attempt<200&&screen()!==expected;attempt++)await sleep(10);
    assert.equal(screen(),expected);checks++;
  };
  const click=(action,id)=>{
    const selector='[data-action="'+action+'"]'+(id?'[data-id="'+id+'"]':'');
    const button=w.document.querySelector(selector);
    assert.ok(button,'Missing action '+action+' / '+(id||'')+' on '+screen());button.click();
  };
  const clean=()=>{
    const text=w.document.body.textContent;
    assert.doesNotMatch(text,/\[object Object\]|\bundefined\b|\bNaN\b|\bnull\b|\{"/);
    for(const image of w.document.querySelectorAll('img'))assert.ok(image.hasAttribute('alt'));
    checks++;
  };
  const route=async number=>{w.location.hash='scene-'+number;await sleep(40);await wait('cart');};
  const analyze=async id=>{click('start');await wait('consent');click('shopper',id);await wait('results');clean();};
  assert.equal(w.document.documentElement.lang,lang);
  assert.equal(w.document.querySelector('[data-action=start]').textContent.includes(lang==='en'?'Check my cart':'장바구니 점검'),true);
  click('language');assert.equal(w.document.documentElement.lang,lang==='en'?'ko':'en');
  click('language');assert.equal(w.document.documentElement.lang,lang);
  await analyze('mina');
  assert.match(w.document.querySelector('main').textContent,/레티놀|Retinol/);
  await route(2);await analyze('mina');click('compare');await wait('comparison');
  const mina=w.document.querySelector('.compare-card[data-person="mina"]').textContent;
  const jules=w.document.querySelector('.compare-card[data-person="jules"]').textContent;
  assert.match(mina,/69\.1/);assert.match(mina,/57\.3/);
  assert.match(jules,/47\.0/);assert.match(jules,/39\.2/);clean();
  click('back');await wait('results');click('cart');await wait('cart');await analyze('jules');
  click('compare');await wait('comparison');click('back');await wait('results');click('apply');await wait('updated');
  const comparisonRecord=JSON.parse(w.localStorage.getItem('cart-check-v5-records')).at(-1);
  assert.deepEqual(comparisonRecord.decisions.map(d=>d.status),['keep','keep'],'Comparison Back must record the currently displayed Mina suggestions, not stale Jules suggestions.');
  await route(3);await analyze('ari');click('alternative','aha');
  assert.ok(w.document.querySelector('dialog[open]'));
  click('choose-alternative','hydra-toner');
  assert.equal(w.document.querySelector('dialog').open,false);
  click('apply');await wait('updated');
  assert.match(w.document.querySelector('main').textContent,/수분 토너|Hydrating Toner/);clean();
  let vtoRequests=0;const originalVTO=w.YouCam.tryFoundation;
  w.YouCam.tryFoundation=(...args)=>{vtoRequests++;return originalVTO(...args);};
  await route(4);await analyze('mina');click('shade','ivory');await wait('shades');assert.equal(vtoRequests,3);
  assert.equal(w.document.querySelectorAll('.shade-option').length,3);
  assert.equal(w.document.querySelectorAll('main .shade-option img[src^="img/vto-real/"]').length,3);
  const shadeText=w.document.querySelector('main').textContent;
  for(const value of ['14.7','3.2','4.2'])assert.ok(shadeText.includes(value));
  click('use-shade');await wait('results');clean();
  click('shade','ivory');await wait('shades');assert.equal(vtoRequests,3,'Reopening a comparison must reuse the same three results.');
  click('use-shade');await wait('results');
  click('cart');await wait('cart');await analyze('jules');click('shade','ivory');await wait('shades');
  assert.equal(w.document.querySelectorAll('.shade-option').length,0);
  assert.match(w.document.querySelector('main').textContent,/가까운 색이 없어요|No close shade/);
  assert.match(w.document.querySelector('main').textContent,/9[.]9/);
  click('remove-foundation');await wait('results');clean();
  await route(5);click('start');await wait('quality');click('bad-photo','small');await wait('quality-error');clean();
  await route(6);click('start');await wait('unavailable');assert.match(w.document.querySelector('main').textContent,/5/);
  click('fallback');await wait('consent');click('shopper','mina');await wait('results');clean();
  await route(7);await analyze('mina');click('apply');await wait('updated');
  const latest=()=>JSON.parse(w.localStorage.getItem('cart-check-v5-records')).at(-1);
  const ids=()=>latest().cart;
  assert.deepEqual(ids(),['retinol','rich-cream','sand'],'Untouched Swap must use the closest shade.');
  assert.equal(latest().decisions.find(d=>d.id==='ivory').chosen,'sand');
  assert.match(w.document.querySelector('main .product-list').textContent,/내추럴 샌드 230|Natural Sand 230/);
  const expectedTotal=ids().reduce((sum,id)=>sum+w.CART_DATA.products.find(p=>p.id===id).price,0);
  assert.ok(w.document.querySelector('main .total').textContent.includes(expectedTotal.toFixed(2)));
  assert.doesNotMatch(w.document.querySelector('#routine').textContent,/각질 토너|Exfoliating Toner/);
  click('checkout');await wait('order');clean();
  const receipt=w.document.querySelector('.receipt').textContent;
  assert.match(receipt,/내추럴 샌드 230|Natural Sand 230/);
  assert.doesNotMatch(receipt,/웜 아이보리 120|Warm Ivory 120/);
  assert.ok(receipt.includes(expectedTotal.toFixed(2)));
  assert.ok(latest().order);
  // User overrides take precedence over default recommendations.
  await route(1);await analyze('mina');click('keep','ivory');click('apply');await wait('updated');
  assert.ok(ids().includes('ivory'));assert.ok(!ids().includes('sand'));
  await route(7);await analyze('mina');click('shade','ivory');await wait('shades');
  click('select-shade','honey');click('use-shade');await wait('results');click('apply');await wait('updated');
  assert.ok(ids().includes('honey'));assert.ok(!ids().includes('sand'));
  click('undo');await wait('results');click('apply');await wait('updated');
  assert.deepEqual(ids(),Array.from(w.CART_DATA.defaultCart),'Undo must retain the restored original choices.');
  await route(4);await analyze('jules');
  assert.match(w.document.querySelector('main').textContent,/가까운 색이 없어요|No close shade/);
  click('apply');await wait('updated');
  assert.ok(ids().includes('ivory'),'No eligible close shade means no automatic shade swap.');
  assert.ok(ids().includes('gel-cream'),'Untouched skincare Swap uses its first alternative.');
  assert.doesNotMatch(w.document.querySelector('#routine').textContent,/리치 세라마이드 크림|Rich Ceramide Cream/);
  assert.match(w.document.querySelector('#routine').textContent,/젤 크림|Gel Cream/);
  click('checkout');await wait('order');
  assert.match(w.document.querySelector('.receipt').textContent,/웜 아이보리 120|Warm Ivory 120/);
  checks+=18;
  click('merchant');await sleep(40);await wait('merchant');clean();
  assert.ok(Number(w.document.querySelector('[data-stat=checks]').textContent)>0);
  click('history');await wait('history');click('merchant');await sleep(40);await wait('merchant');
  const key='cart-check-v5-records', saved=JSON.parse(w.localStorage.getItem(key));
  assert.ok(saved.length>0);
  assert.ok(saved.every(r=>!('scores' in r)&&!('photo' in r)&&!('tone' in r)));
  const many=Array.from({length:105},(_,i)=>({...saved[0],id:'QA-'+String(i+1).padStart(3,'0'),time:Date.now()-i*1000}));
  w.localStorage.setItem(key,JSON.stringify(many));
  click('history');await wait('history');assert.equal(w.document.querySelectorAll('.history-row').length,10);
  click('next-page');assert.equal(w.document.querySelectorAll('.history-row').length,10);
  const search=w.document.querySelector('#history-search');search.value='no-such-product';
  search.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(w.document.querySelectorAll('.history-row').length,0);clean();
  let download;
  w.Blob=Blob;w.URL.createObjectURL=blob=>{download=blob;return 'blob:qa-export';};w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){};
  click('export-history');const csv=await download.text();
  assert.match(csv,lang==='ko'?/점검 번호/:/Check number/);
  assert.doesNotMatch(csv,/undefined|NaN|\[object Object\]|\{"/);
  click('clear-history');assert.ok(w.document.querySelector('dialog[open]'));click('confirm-clear');
  assert.equal(JSON.parse(w.localStorage.getItem(key)).length,0);
  click('merchant');await sleep(40);await wait('merchant');assert.equal(w.document.querySelector('[data-stat=checks]').textContent,'0');clean();
  w.location.hash='scene-1';await sleep(40);await wait('cart');click('empty-cart');assert.equal(w.document.querySelectorAll('.product-row').length,0);
  click('undo-empty');assert.equal(w.document.querySelectorAll('.product-row').length,4);clean();
  const storedBeforeQuota=w.localStorage.getItem(key);
  w.Storage.prototype.setItem=function(){throw new w.DOMException('Test quota full','QuotaExceededError');};
  await analyze('mina');click('history');await wait('history');
  assert.equal(w.document.querySelectorAll('.history-row').length,1,'Failed storage writes must remain readable in session memory.');
  assert.equal(w.localStorage.getItem(key),storedBeforeQuota,'Persistent storage stays unchanged when the quota is full.');
  clean();
  assert.deepEqual(errors,[],'No uncaught DOM errors.');
  w.close();
}
console.log('PASS semantic DOM: '+checks+' checks across six default/override language cases and seven scenes, recorded metrics, real VTO paths, choices, fallback, order and merchant.');
console.log('Not covered: rendering, screenshots, camera, browser download delivery or live requests.');
