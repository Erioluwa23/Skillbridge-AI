import {user} from './auth.js';
const $=(s,p=document)=>p.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels=['The idea','Real-world example','Put it into practice'];
let loaded='',jobs={},active=new Set();
const context=()=>window.skillbridgeVideoContext?.();
function select(c){const key='skillbridge-video:'+c.uid+':'+c.lesson.id+':'+c.language;if(key!==loaded){loaded=key;try{jobs=JSON.parse(localStorage.getItem(key)||'{}')}catch{jobs={}}}}
const save=()=>localStorage.setItem(loaded,JSON.stringify(jobs));
async function api(path,data){
 const u=user();if(!u?.getIdToken||!navigator.onLine)throw Error('Sign in online to use AI video generation.');
 const response=await fetch(path,{method:data?'POST':'GET',headers:{Authorization:'Bearer '+await u.getIdToken(),...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
 const result=await response.json().catch(()=>({}));if(!response.ok)throw Error(result.error||'Video generation unavailable');return result;
}
function draw(){
 const c=context(),container=$('#sb-ai-video');if(!c||!container)return;select(c);
 container.innerHTML='<h3>✦ Generate AI tutorial videos</h3><p>Produce up to three short AI-rendered clips for this lesson. Each request may incur provider charges. Available to approved pilot users only.</p>'+
 labels.map((name,i)=>{const j=jobs[i],ready=j?.status==='completed';return '<div class="sb-ai-chapter"><strong>'+(i+1)+'. '+name+'</strong><span>'+(ready?'Ready':j?.status==='pending'?'Generating…':'Not generated')+'</span>'+(ready?'<video controls playsinline preload="metadata" src="'+esc(j.url)+'"></video>':'<button data-ai-video="'+i+'" '+(j?.status==='pending'?'disabled':'')+'>Generate '+name+'</button>')+'</div>'}).join('')+
 '<p class="sb-ai-note" role="status">Pilot limit: three new clips per day. Verify important educational information.</p>';
}
async function start(i){
 const c=context();if(!c)return;select(c);const note=$('.sb-ai-note');if(note)note.textContent='Submitting your request…';
 const l=c.lesson;try{const job=await api('/api/video-start',{lessonId:l.id,title:l.title,language:c.language,explanation:l.explanation||l.title,example:l.example||l.title,keyPoint:l.keyPoint||l.title,part:i});jobs[i]={jobId:job.jobId,status:'pending'};save();draw();poll(i);}catch(e){if(note)note.textContent=e.message;}
}
async function poll(i){const c=context();if(!c)return;select(c);const key=loaded+':'+i;if(active.has(key)||!jobs[i]?.jobId)return;active.add(key);
 try{for(let n=0;n<45;n++){if(!user()||loaded!=='skillbridge-video:'+c.uid+':'+c.lesson.id+':'+c.language)return;
 const result=await api('/api/video-status?id='+encodeURIComponent(jobs[i].jobId));if(['completed','failed'].includes(result.status)){jobs[i]={...jobs[i],status:result.status,url:result.url};save();draw();return;}
 await new Promise(resolve=>setTimeout(resolve,12000));}}
 catch(e){const note=$('.sb-ai-note');if(note)note.textContent=e.message;}finally{active.delete(key)}
}
function mount(){const c=context(),scene=$('#sb-scene');if(!c||!scene||$('#sb-ai-video'))return;const box=document.createElement('section');box.id='sb-ai-video';box.className='sb-ai-video';scene.parentElement.append(box);draw();Object.keys(jobs).filter(i=>jobs[i]?.status==='pending').forEach(i=>poll(i));}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ai-video]');if(b){e.preventDefault();start(Number(b.dataset.aiVideo));}});
new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount();
