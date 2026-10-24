import { put } from '@vercel/blob';
import { identity, allowed, ready, cache, jobKey, send, safeError } from '../lib/video-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  try {
    const uid = await identity(req);
    if (!allowed(uid)) return send(res, 403, { error: 'Not in pilot.' });
    if (!ready()) return send(res, 503, { error: 'Video generation is not configured.' });
    const id = String(req.query?.id || '');
    if (!/^[a-f0-9-]{36}$/.test(id)) return send(res, 400, { error: 'Invalid job ID.' });
    const db = cache();
    const job = await db.get(jobKey(id));
    if (!job || job.uid !== uid) return send(res, 404, { error: 'Video not found.' });
    if (job.status === 'completed') return send(res, 200, { status:'completed', url:job.url, chapter:job.item.part });
    if (job.status === 'failed') return send(res, 200, { status:'failed', error:'This clip could not be generated.' });
    const { experimental_getVideoStatus: getVideoStatus } = await import('ai');
    if (typeof getVideoStatus !== 'function') return send(res, 503, { error: 'AI video status requires an approved, compatible provider adapter.' });
    const result = await getVideoStatus(job.model, { operation: job.operation });
    if (result.status !== 'completed') {
      if (result.status === 'failed') {
        await db.set(jobKey(id), { ...job, status:'failed' }, { ex: 60*60*24*7 });
        return send(res, 200, { status:'failed' });
      }
      return send(res, 200, { status: result.status || 'pending' });
    }
    const video = result.videos?.[0];
    if (!video) return send(res, 502, { error:'Provider returned no video.' });
    let bytes;
    let mimeType = video.mediaType || 'video/mp4';
    if (video.uint8Array) bytes = video.uint8Array;
    else if (video.base64) bytes = Buffer.from(video.base64, 'base64');
    else if (video.url) {
      const url = new URL(video.url);
      if (url.protocol !== 'https:') throw Error('Unsafe provider video URL.');
      const response = await fetch(url, { signal:AbortSignal.timeout(25000), redirect:'error' });
      if (!response.ok) throw Error('Could not download provider video.');
      const len = Number(response.headers.get('content-length') || 0);
      if (len > 40*1024*1024) throw Error('Video exceeds storage limit.');
      bytes = Buffer.from(await response.arrayBuffer());
      mimeType = response.headers.get('content-type')?.split(';')[0] || mimeType;
    } else throw Error('Unsupported provider video format.');
    if (bytes.byteLength > 40*1024*1024) throw Error('Video is too large.');
    const blob = await put('skillbridge/videos/' + uid + '/' + id + '.mp4', bytes, {
      access:'public', addRandomSuffix:false, contentType:mimeType,
    });
    await db.set(jobKey(id), { ...job, status:'completed', url:blob.url }, { ex:60*60*24*30 });
    return send(res, 200, { status:'completed', url:blob.url, chapter:job.item.part });
  } catch (err) { return safeError(res, err); }
}
