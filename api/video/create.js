import {ready,identity,allowed,cache,send,safeError,checkInput,videoPrompt,openai,jobKey,lessonKey,MODEL} from '../../lib/video-service.js';
export default async function handler(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Use POST.'});
 if(!ready())return send(res,503,{error:'AI video generation is not enabled yet. An administrator must configure the video provider, Redis and pilot users.'});
 try{
  const uid=await identity(req);if(!allowed(uid))return send(res,403,{error:'AI video rendering is currently limited to approved pilot learners.'});
  const input=checkInput(req.body);
  const db=cache(),key=lessonKey(uid,input.lessonId,input.language,input.part);
  const existing=await db.get(key);
  if(existing){const record=await db.get(jobKey(existing));if(record?.uid===uid)return send(res,200,{id:existing,status:record.status||'queued',reused:true});}
  const day=new Date().toISOString().slice(0,10),quota='skillbridge:video:quota:'+uid+':'+day;
  const count=await db.incr(quota);if(count===1)await db.expire(quota,90000);
  if(count>3)return send(res,429,{error:'Daily limit: three 4-second video clips per learner.'});
  const fd=new FormData();fd.set('model',MODEL);fd.set('seconds','4');fd.set('size','1280x720');fd.set('prompt',videoPrompt(input));
  const job=await (await openai('',{method:'POST',body:fd})).json();
  if(!/^video_[\w-]+$/.test(job.id||''))throw Error('Unexpected provider response');
  await db.set(jobKey(job.id),{uid,lessonId:input.lessonId,language:input.language,part:input.part,status:job.status||'queued',createdAt:Date.now()},{ex:60*60*24*7});
  await db.set(key,job.id,{ex:60*60*24*7});
  return send(res,202,{id:job.id,status:job.status||'queued'});
 }catch(e){return safeError(res,e)}
}