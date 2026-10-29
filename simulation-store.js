import {firebaseConfig} from './firebase-config.js';
import {user} from './auth.js';

const KEY_PREFIX='skillbridge-workplace-v1-';
const empty=()=>({updatedAt:0,attempts:[],drafts:{},opened:{},choices:{}});
let cloudPromise=null;
const storeKey=()=>KEY_PREFIX+(user()?.uid||'guest');
export function readPractice(){try{const raw=JSON.parse(localStorage.getItem(storeKey())||'null');return raw&&typeof raw==='object'?{...empty(),...raw}:empty()}catch{return empty()}}
export function savePractice(data){
 data.updatedAt=Date.now();data.attempts=(data.attempts||[]).slice(-40);
 try{localStorage.setItem(storeKey(),JSON.stringify(data));}catch(e){console.warn('Local storage full: ',e)}
 queueCloud(data);
}
let timer=null;
async function cloud(){
 if(!cloudPromise)cloudPromise=Promise.all([
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
 ]).then(([app,f])=>{const instance=app.getApps().length?app.getApp():app.initializeApp(firebaseConfig);return {db:f.getFirestore(instance),f}}).catch(e=>{cloudPromise=null;throw e});
 return cloudPromise;
}
function queueCloud(data){
 const uid=user()?.uid;
 if(!uid||user()?.offline||!navigator.onLine)return;
 clearTimeout(timer);
 const snapshot=JSON.parse(JSON.stringify(data));
 timer=setTimeout(async()=>{
  if(user()?.uid!==uid)return;
  try{
   const {db,f}=await cloud();
   await f.setDoc(f.doc(db,'learners',uid),{workplaceStudio:snapshot,workplaceUpdatedAt:snapshot.updatedAt},{merge:true});
   document.dispatchEvent(new CustomEvent('skillbridge:workplace-synced'));
  }catch(e){console.warn('Workplace cloud backup pending:',e?.code||e?.message);document.dispatchEvent(new CustomEvent('skillbridge:workplace-sync-error'));}
 },1400);
}
export async function restorePractice(){
 const uid=user()?.uid;
 const local=readPractice();
 if(!uid||user()?.offline||!navigator.onLine)return local;
 try{
  const {db,f}=await cloud(),snapshot=await f.getDoc(f.doc(db,'learners',uid));
  if(user()?.uid!==uid)return readPractice();
  const remote=snapshot.data()?.workplaceStudio;
  if(remote&&typeof remote==='object'&&!Array.isArray(remote)&&Number(remote.updatedAt)>Number(local.updatedAt)){
   const value={...empty(),...remote};
   localStorage.setItem(KEY_PREFIX+uid,JSON.stringify(value));
   return value;
  }
  if(local.updatedAt)queueCloud(local);
 }catch(e){console.warn('Workplace offline: ',e?.code||e?.message)}
 return readPractice();
}
export function exportEvidence(data){
 const payload={application:'SkillBridge AI',type:'Learner practice record (not a professional credential)',exportedAt:new Date().toISOString(),attempts:(data.attempts||[]).map(({caseId,caseTitle,version,score,mode,answer,criteria,createdAt,coach})=>({caseId,caseTitle,version,score,feedbackType:mode,answer,criteria,createdAt,coach}))};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='skillbridge-workplace-evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),8000);
}