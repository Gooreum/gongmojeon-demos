'use strict';
const CACHE='council-watch-v2-20261023';
const ROOT=new URL('./',self.location).href;
const SHELL=['index.html','style.css','app.js','data.js','manifest.webmanifest','fonts/InterVariable.woff2','img/icon.svg','img/icon-192.png','img/icon-512.png','data/week.json','data/week.sample.json','data/run.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(p=>new URL(p,ROOT).href))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('council-watch-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}
  catch{const saved=await cache.match(event.request);if(saved)return saved;if(event.request.mode==='navigate')return (await cache.match(new URL('index.html',ROOT).href))||Response.error();return Response.error();}
 })());
});
