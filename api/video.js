import { experimental_generateVideo as generateVideo } from 'ai';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { ready, cache, identity, allowed, checkInput, videoPrompt, digest, send, safeError, MODEL, lessonKey } from '../lib/video-service.js';

export const config = { maxDuration: 300 };
export default async function handler(req, res) {
  res.setHeader('Allow','GET, POST');
  if (req.method !== 'GET' && req.method !== 'POST') return send(res,405,{error:'Method not allowed'});
  let uid;
  try { uid = await identity(req); }
  catch(e) { return safeError(res,e); }
  const configured = ready();
  const access = allowed(uid);
  if (req.method === 'GET') return send(res,200,{configured,enabled:configured&&access,model:configured&&access?MODEL:undefined,description:'Short AI-rendered video clips, up to three per lesson. Generation can be slow and may incur provider charges.'});
  if (!configured) return send(res,503,{error:'AI video rendering has not been activated by the SkillBridge administrator.'});
  if (!access) return send(res,403,{error:'AI video rendering is currently limited to invited pilot accounts.'});
  let input;
  try { input = checkInput(req.body); } catch(e) {return safeError(res,e);}
  const redis=cache(), key=lessonKey(uid,input.lessonId,input.language,input.part);
  const cached=await redis.get(key+':result');
  if(cached?.url) return send(res,200,{status:'completed',url:cached.url,part:input.part,cached:true});
  const date=new Date().toISOString().slice(0,10);
  const quotaKey='skillbridge:video:quota:'+digest(uid)+':'+date;
  const activeKey='skillbridge:video:active:'+digest(uid);
  const lock=await redis.set(activeKey,randomUUID(),{nx:true,ex:360});
  if(lock!== 'OK') return send(res,429,{error:'Another video is generating for this learner. Retry when that generation finishes.'});
  try {
    const n=await redis.incr(quotaKey);
    if(n===1) await redis.expire(quotaKey,86400*2);
    const dailyLimit=Math.max(1,Math.min(Number(process.env.VIDEO_DAILY_LIMIT)||3,12));
    if(n>dailyLimit) return send(res,429,{error:'Today’s pilot video limit has been reached. Try again tomorrow.'});
    const {video}=await generateVideo({
      model: MODEL,
      prompt:videoPrompt(input),
      aspectRatio:'16:9',
      duration:5,
      abortSignal:AbortSignal.timeout(275000),
    });
    if (!video?.uint8Array?.length) throw new Error('No playable video was returned');
    const name='skillbridge-ai/'+digest(uid)+'/'+digest(input.lessonId+'/'+input.language+'/'+input.part)+'-'+Date.now()+'.mp4';
    const stored=await put(name,Buffer.from(video.uint8Array),{access:'public',contentType:'video/mp4',addRandomSuffix:true});
    const result={status:'completed',url:stored.url,part:input.part,cached:false};
    await redis.set(key+':result',result,{ex:60*60*24*60});
    return send(res,200,result);
  } catch(e) { return safeError(res,e); }
  finally { await redis.del(activeKey).catch(()=>{}); }
}
