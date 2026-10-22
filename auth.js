import {firebaseConfig} from './firebase-config.js';
export const authReady=Boolean(firebaseConfig.apiKey && firebaseConfig.projectId) && !globalThis.__SKILLBRIDGE_TEST_MODE;
let auth=null,api=null,current=null,loaded=false;
const OFFLINE_UID_KEY='skillbridge-last-verified-uid';
const listeners=new Set();
const notify=()=>{for(const callback of listeners)callback(current,loaded)};
export function subscribeAuth(callback){listeners.add(callback);callback(current,loaded);return ()=>listeners.delete(callback)}
export const user=()=>current;
export const authLoaded=()=>loaded;
export async function initAuth(){if(!authReady){loaded=true;notify();return}
 // Never block the whole app indefinitely on a slow third-party SDK.
 const watchdog=setTimeout(()=>{if(!loaded){loaded=true;notify()}},6500);
 try{
  const [firebase,mod]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js')
  ]);
  auth=mod.getAuth(firebase.initializeApp(firebaseConfig));api=mod;
  mod.onAuthStateChanged(auth,u=>{current=u;loaded=true;clearTimeout(watchdog);try{if(u)localStorage.setItem(OFFLINE_UID_KEY,u.uid);else if(navigator.onLine)localStorage.removeItem(OFFLINE_UID_KEY)}catch{}notify()},err=>{console.error('auth observer',err);clearTimeout(watchdog);loaded=true;notify()});
 }catch(err){clearTimeout(watchdog);console.error('auth init',err);if(!navigator.onLine){try{const uid=localStorage.getItem(OFFLINE_UID_KEY);if(uid&&/^[-\w]{12,128}$/.test(uid))current={uid,offline:true,email:null}}catch{}}loaded=true;notify()}
}
function assertReady(){if(!auth || !api)throw Error('Account service could not load. Connect to the internet and reload.')}
export async function register(email,pwd,name){assertReady();const result=await api.createUserWithEmailAndPassword(auth,email,pwd);if(name.trim())await api.updateProfile(result.user,{displayName:name.trim().slice(0,70)});current=auth.currentUser;notify()}
export async function login(email,pwd){assertReady();await api.signInWithEmailAndPassword(auth,email,pwd)}
export async function logout(){
 if(current?.offline){current=null;try{localStorage.removeItem(OFFLINE_UID_KEY)}catch{}notify();return}
 assertReady();await api.signOut(auth);current=null;try{localStorage.removeItem(OFFLINE_UID_KEY)}catch{}notify();
}
export async function resetPassword(email){assertReady();await api.sendPasswordResetEmail(auth,email)}
export function readableAuthError(e){const codes={
 'auth/email-already-in-use':'An account already exists with that email. Sign in instead.',
 'auth/invalid-email':'Enter a valid email address.',
 'auth/invalid-credential':'Email or password is incorrect.',
 'auth/user-not-found':'Email or password is incorrect.',
 'auth/weak-password':'Choose a stronger password.',
 'auth/password-does-not-meet-requirements':'Choose a stronger password.',
 'auth/too-many-requests':'Too many attempts. Please try again later.',
 'auth/network-request-failed':'Check your internet connection and retry.'
};return codes[e?.code]||e?.message||'Account action failed. Please retry.'}
