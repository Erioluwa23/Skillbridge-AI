export const STORAGE_KEY = 'skillbridge-state-v1';
export function readState() { try { const v=JSON.parse(localStorage.getItem(STORAGE_KEY)); return v && typeof v==='object' ? v : {}; } catch { return {}; } }
export function writeState(v) { try {localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); return true;} catch {return false;} }
export function hasWorker() { return 'serviceWorker' in navigator; }
export async function registerWorker() { if (!hasWorker() || !window.isSecureContext) return false; try { await navigator.serviceWorker.register('/sw.js'); return true; } catch (e) { console.warn('Offline unavailable',e); return false; } }
export async function cachePack() {
  if (!hasWorker()) return {ok:false,error:'Service workers are not supported'};
  const registration = await navigator.serviceWorker.ready;
  const worker = navigator.serviceWorker.controller || registration.active;
  if(!worker) return {ok:false,error:'Offline service is not ready'};
  return new Promise(resolve=>{
    const channel=new MessageChannel();
    const timeout=setTimeout(()=>resolve({ok:false,error:'Offline download timed out'}),12000);
    channel.port1.onmessage=e=>{clearTimeout(timeout); resolve(e.data);};
    worker.postMessage({type:'CACHE_PACK'},[channel.port2]);
  });
}
export function exportProgress(state){
  const data={exportedAt:new Date().toISOString(), language:state.lang, completed:state.completed||[], quizResults:state.quizResults||{}, practice:state.practice||{}, diagnostic:state.diagnostic||null};
  const link=document.createElement('a'); link.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})); link.download='skillbridge-my-progress.json'; link.click(); setTimeout(()=>URL.revokeObjectURL(link.href),3000);
}
