import {ready,identity,cache,send,safeError,openai,jobKey} from '../../lib/video-service.js';
export default async function handler(req,res){
 if(req.method!=='GET')return send(res,405,{error:'Use GET.'});
 if(!ready())return send(res,503,{error:'Video service is not configured.'});
 try{
  const uid=await identity(req),id=String(req.query?.id||'');
  if(!/^video_[\w-]{5,100}$/.test(id))return send(res,400,{error:'Invalid video ID.'});
  const record=await cache().get(jobKey(id));
  if(!record||record.uid!==uid||record.status!=='completed')return send(res,403,{error:'This video is not ready for your account.'});
  const upstream=await openai('/'+encodeURIComponent(id)+'/content');
  res.setHeader('Content-Type','video/mp4');
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  const bytes=await upstream.arrayBuffer();
  if(bytes.byteLength>25_000_000)return send(res,413,{error:'Video too large.'});
  return res.status(200).send(Buffer.from(bytes));
 }catch(e){return safeError(res,e)}
}