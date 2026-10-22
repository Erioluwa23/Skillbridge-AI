import { randomUUID } from 'node:crypto';
import { experimental_startVideo as startVideo } from 'ai';
import { identity, allowed, ready, cache, checkInput, lessonKey, jobKey, MODEL, videoPrompt, send, safeError } from '../lib/video-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  try {
    const uid = await identity(req);
    if (!allowed(uid)) return send(res, 403, { error: 'Video generation is currently available to pilot accounts only.' });
    if (!ready()) return send(res, 503, { error: 'Video generation is not configured yet.' });
    const item = checkInput(req.body);
    const db = cache();
    const key = lessonKey(uid, item.lessonId, item.language, item.part);
    // Redis NX lock prevents rapid repeat requests and duplicate paid generations.
    const id = randomUUID();
    const acquired = await db.set(key, id, { nx: true, ex: 60 * 60 * 24 * 7 });
    if (acquired !== 'OK') {
      const existing = await db.get(key);
      if (existing) return send(res, 200, { jobId: existing, reused: true });
      return send(res, 409, { error: 'This lesson is already being generated. Please retry shortly.' });
    }
    const quotaKey = 'skillbridge:video:quota:' + uid + ':' + new Date().toISOString().slice(0,10);
    const count = await db.incr(quotaKey);
    if (count === 1) await db.expire(quotaKey, 86400);
    if (count > 3) {
      await db.del(key);
      return send(res, 429, { error: 'Pilot limit: three new video clips per account per day.' });
    }
    try {
      const { operation } = await startVideo({
        model: MODEL, prompt: videoPrompt(item), aspectRatio: '16:9',
        duration: 5, abortSignal: AbortSignal.timeout(25000),
      });
      await db.set(jobKey(id), { uid, operation, model: MODEL, item, status: 'pending', createdAt: Date.now() }, { ex: 60*60*24*7 });
      return send(res, 202, { jobId: id, status: 'pending', chapter: item.part });
    } catch (err) {
      await db.del(key);
      console.error('Video start failed', err);
      return send(res, 502, { error: 'Video provider could not start this clip. Check provider access or budget.' });
    }
  } catch (err) { return safeError(res, err); }
}
