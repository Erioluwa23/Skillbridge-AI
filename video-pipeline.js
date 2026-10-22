import {user} from './auth.js';
const $=s=>document.querySelector(s);
let active='', interval=0, currentJob=null, lessonUrl='';
const clean=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&#39;':'&#39;',"'":'&#39;'}[c]));
const chapters=['The big idea','Real-world example','Try it yourself'];
async function token(){
 const account=user();if(!account||account.offline)throw Error('Sign in and connect to the internet first.');
 const mod=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 const appmod=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js');
 const auth=mod.getAuth(appmod.getApp());if(!auth.currentUser)throw Error('Your login has expired. Sign in again.');
 return auth.currentUser.getIdToken();
}
async function api(method,url,body){
 const auth=await token();
 const r=await fetch(url,{method,headers:{Authorization:'Bearer '+auth,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const type=r.headers.get('content-type')||'';
 if(!r.ok){let detail='Request failed';if(type.includes('json'))detail=(await r.json()).error||detail;throw Error(detail)}
 return type.includes('json')?r.json():r.blob();
}
const status=m=>{const el=$('#sb-video-status');if(el)el.textContent=m;};
function reset(){clearInterval(interval);interval=0;currentJob=null;if(lessonUrl){URL.revokeObjectURL(lessonUrl);lessonUrl='';}}
function mount(){
 const panel=$('#sb-panel');
 if(!panel||!$('#sb-scene'))return;
 const ctx=window.__skillbridgeVideoLesson?.();
 if(!ctx?.lesson?.id)return;
 const key=ctx.lesson.id+'|'+ctx.language;
 if(!$('#sb-video-production')){
  const section=document.createElement('section');
  section.id='sb-video-production';
  section.innerHTML='<h3>✦ AI-generated video tutorials</h3><p>Render three short, original video clips for this lesson, one at a time. Each request uses paid AI processing (4 seconds per clip). Available to approved pilot users.</p><label for="sb-video-part">Tutorial section</label><select id="sb-video-part"><option value="0">1 · The big idea</option><option value="1">2 · Real-world example</option><option value="2">3 · Try it yourself</option></select><button type="button" id="sb-video-generate">Generate 4-second AI video</button><p id="sb-video-status" role="status">Video rendering requires an administrator to enable the service.</p><div id="sb-video-result"></div>';
  panel.append(section);
  $('#sb-video-generate').addEventListener('click',create);
 }
 if(active!==key){reset();active=key;$('#sb-video-status').textContent='Ready to request a short AI tutorial clip.';$('#sb-video-result').innerHTML='';}
}
async function create(){
 const ctx=window.__skillbridgeVideoLesson?.();
 if(!ctx?.lesson)return;
 const l=ctx.lesson,part=Number($('#sb-video-part')?.value||0),button=$('#sb-video-generate');
 button.disabled=true;status('Submitting the video-generation request…');
 try{
  const result=await api('POST','/api/video/create',{lessonId:l.id,title:l.title,explanation:l.explanation||l.title,example:l.example||l.explanation||l.title,keyPoint:l.keyPoint||'',language:ctx.language,part});
  currentJob=result.id;
  status('Generating '+chapters[part]+'… (job '+currentJob+')');
  clearInterval(interval);interval=setInterval(check,8000);await check();
 }catch(e){status(e.message||'Video generation is unavailable.');}finally{button.disabled=false;}
}
async function check(){
 const id=currentJob;if(!id)return;
 try{
  const r=await api('GET','/api/video/status?id='+encodeURIComponent(id));
  if(id!==currentJob)return;
  if(r.status==='completed'){
   clearInterval(interval);interval=0;status('Video ready. Loading…');
   const video=await api('GET','/api/video/content?id='+encodeURIComponent(id));
   if(lessonUrl)URL.revokeObjectURL(lessonUrl);lessonUrl=URL.createObjectURL(video);
   const target=$('#sb-video-result');if(!target)return;
   target.innerHTML='<video controls playsinline preload="metadata" style="width:100%;border-radius:16px;background:#081d14" aria-label="AI-generated lesson tutorial"></video><a id="sb-video-download" download="skillbridge-ai-tutorial.mp4">Save video</a>';
   target.querySelector('video').src=lessonUrl;target.querySelector('a').href=lessonUrl;
   status('AI-generated video complete. Review explanations for accuracy.');
  }else if(r.status==='failed'){clearInterval(interval);interval=0;status(r.error||'Generation failed.');}
  else status('Rendering '+r.status+' · '+(r.progress||0)+'% completed');
 }catch(e){clearInterval(interval);interval=0;status(e.message||'Could not check video status.');}
}
new MutationObserver(()=>{if(!$('#sb-video-production')&&active){reset();active='';}mount();}).observe(document.documentElement,{childList:true,subtree:true});
