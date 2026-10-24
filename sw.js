const VERSION='skillbridge-v4.2.1';
const ASSETS=['/','/index.html','/app.css','/app.js','/studio.js','/studio.css','/video-studio.js','/video-studio.css','/any-topic.js','/cloud-db.js','/catalog.js','/skill-cases.js','/auth.js','/firebase-config.js','/content.js','/offline.js','/icon.svg','/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(x=>x!==VERSION).map(x=>caches.delete(x)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 const req=event.request;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{const online=fetch(req).then(r=>r.ok?r:null).catch(()=>null);const first=await Promise.race([online,new Promise(resolve=>setTimeout(()=>resolve(null),3500))]);return first||(await caches.match('/index.html'))||(await online)||new Response('Reconnect to open SkillBridge.',{status:503});})());
 }else if(/\.(js|css)$/.test(new URL(req.url).pathname)){
  event.respondWith((async()=>{const cached=await caches.match(req);if(cached){event.waitUntil(fetch(req).then(res=>res.ok?caches.open(VERSION).then(c=>c.put(req,res)):null).catch(()=>{}));return cached;}return fetch(req);})());
 }else{
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{if(res.ok){const copy=res.clone();event.waitUntil(caches.open(VERSION).then(c=>c.put(req,copy)));}return res;})));
 }
});
self.addEventListener('message',event=>{if(event.data?.type==='CACHE_PACK'){const port=event.ports?.[0];caches.open(VERSION).then(cache=>cache.addAll(ASSETS)).then(()=>port?.postMessage({ok:true})).catch(err=>port?.postMessage({ok:false,error:String(err)}));}});
