/* SkillBridge per-user cloud backup. Works only with Firebase Auth verified UID. */
import {firebaseConfig} from './firebase-config.js';
import {validCourse,MAX_COURSES} from './any-topic.js';
let db=null,sdk=null,initTask=null,activeUid=null,revision=0,timer=null,report=()=>{};
export function observeCloudStatus(fn){report=fn}
const setStatus=s=>report(s);
const stateKey=uid=>'skillbridge-state-user-'+uid;
const courseKey=uid=>'skillbridge-custom-v1-'+uid;
const stampKey=uid=>'skillbridge-last-edited-'+uid;
function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v===null?fallback:v}catch{return fallback}}
function goodState(v){return !!v&&typeof v==='object'&&!Array.isArray(v)}
async function connection(){
 if(!initTask)initTask=(async()=>{
  const [app,firestore]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
  ]);
  sdk=firestore;
  const instance=app.getApps().length?app.getApp():app.initializeApp(firebaseConfig);
  db=firestore.getFirestore(instance);
 })().catch(err=>{initTask=null;throw err});
 await initTask;
}
const profile=uid=>sdk.doc(db,'learners',uid);
const library=uid=>sdk.doc(db,'learners',uid,'courses','catalog');
async function upload(uid){
 if(!uid||activeUid!==uid||!navigator.onLine){setStatus('offline');return}
 await connection();
 const state=read(stateKey(uid),null),courses=read(courseKey(uid),[]);
 if(!goodState(state))return;
 const edited=Number(localStorage.getItem(stampKey(uid))||Date.now());
 await Promise.all([
  sdk.setDoc(profile(uid),{data:state,updatedAt:edited,schemaVersion:1},{merge:true}),
  sdk.setDoc(library(uid),{items:Array.isArray(courses)?courses.filter(validCourse).slice(0,MAX_COURSES):[],updatedAt:edited},{merge:true})
 ]);
 setStatus('synced');
}
export function queueSync(uid){
 if(!uid||activeUid!==uid)return;
 // A timestamp distinguishes local offline edits from older cloud snapshots.
 const stamp=Date.now();localStorage.setItem(stampKey(uid),String(stamp));
 revision++;clearTimeout(timer);setStatus(navigator.onLine?'saving':'offline');
 if(navigator.onLine)timer=setTimeout(()=>upload(uid).catch(e=>{console.warn('Sync:',e.code||e.message);setStatus('pending')}),1200);
}
export async function startCloudSync(uid,{onRemote}={}){
 clearTimeout(timer);const current=++revision;activeUid=uid;
 if(!uid)return;
 if(!navigator.onLine){setStatus('offline');return}
 setStatus('loading');
 try{
  await connection();
  const [p,c]=await Promise.all([sdk.getDoc(profile(uid)),sdk.getDoc(library(uid))]);
  if(uid!==activeUid||current!==revision)return;
  const local=read(stateKey(uid),null);
  const lastEdit=Number(localStorage.getItem(stampKey(uid))||0);
  let updated=false;
  if(p.exists()){
   const v=p.data()?.data,cloudEdit=Number(p.data()?.updatedAt||0);
   if(goodState(v)&&(!goodState(local)||cloudEdit>lastEdit)){
    localStorage.setItem(stateKey(uid),JSON.stringify(v));localStorage.setItem(stampKey(uid),String(cloudEdit));updated=true;
   }
  }
  if(c.exists()){
   const v=c.data()?.items;
   if(Array.isArray(v)){
    const existing=read(courseKey(uid),[]);
    const combined=[...((Array.isArray(existing)?existing:[]).filter(validCourse))];
    const seen=new Set(combined.map(x=>x.id));
    for(const course of v.filter(validCourse)){if(!seen.has(course.id)){combined.push(course);seen.add(course.id);updated=true}}
    localStorage.setItem(courseKey(uid),JSON.stringify(combined.slice(0,MAX_COURSES)));
   }
  }
  if(updated)onRemote?.();
  if(!p.exists()||lastEdit>Number(p.data()?.updatedAt||0)||!c.exists()){
   await upload(uid);
  } else setStatus('synced');
 }catch(e){console.warn('Cloud restore:',e.code||e.message);setStatus('pending')}
}
export function stopCloudSync(){activeUid=null;revision++;clearTimeout(timer);setStatus('idle')}
export async function syncNow(){if(!activeUid)throw Error('Sign in to synchronise.');await upload(activeUid)}
