import {ready,identity,cache,send,safeError,openai,jobKey} from '../../lib/video-service.js';
export default async function handler(req,res){
 if(req.method!=='GET')return send(res,405,{error:'Use GET.'});
 if(!ready())return send(res,503,{error:'Video service is not configured.'});
 try{
  const uid=await identity(req),id=String(req.query?.id||'');
  if(!/^video_[\w-]{5,100}$/.test(id))return send(res,400,{error:'Invalid video ID.'});
  const db=cache(),record=await db.get(jobKey(id));if(!record||record.uid!==uid)return send(res,404,{error:'Video not found.'});
  const job=await (await openai('/'+encodeURIComponent(id))).json();
  const state=String(job.status||'queued');
  if(record.status!==state)await db.set(jobKey(id),{...record,status:state},{ex:60*60*24*7});
  return send(res,200,{id,status:state,progress:Number(job.progress)||0,error:state==='failed'?'Rendering failed. Please try again.':undefined,ready:state==='completed'});
 }catch(e){return safeError(res,e)}
}