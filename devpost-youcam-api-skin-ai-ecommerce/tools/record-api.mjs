// Records real YouCam API responses for the sample shoppers and measures unit cost per call.
// Usage: YOUCAM_API_KEY=... node tools/record-api.mjs <out-dir> <shopper>:<photo.jpg> [hex,hex,...]
// The key is read from the environment only and is never written to disk.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {basename} from 'node:path';

const API = 'https://yce-api-01.makeupar.com';
const KEY = process.env.YOUCAM_API_KEY;
if (!KEY) throw new Error('YOUCAM_API_KEY is not set');
const [out, target, hexList = ''] = process.argv.slice(2);
const [shopper, photo] = target.split(':');
const auth = {Authorization: 'Bearer ' + KEY};
const delay = ms => new Promise(r => setTimeout(r, ms));

async function call(path, init = {}) {
  const r = await fetch(API + path, {...init, headers: {...auth, 'Content-Type': 'application/json', ...init.headers}});
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${path} ${r.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}
async function credit() {
  const body = await call('/s2s/v1.0/client/credit');
  return body.results.reduce((sum, t) => sum + Number(t.amount_dec ?? t.amount), 0);
}
async function task(kind, payload) {
  const created = await call('/s2s/v2.0/task/' + kind, {method: 'POST', body: JSON.stringify(payload)});
  const id = created.data?.task_id;
  if (!id) throw new Error(kind + ' no task_id ' + JSON.stringify(created));
  const started = Date.now();
  while (Date.now() - started < 90000) {
    await delay(2000);
    const result = await call('/s2s/v2.0/task/' + kind + '/' + encodeURIComponent(id));
    const status = result.data?.task_status;
    if (status === 'success') return {result, seconds: (Date.now() - started) / 1000};
    if (status === 'error') return {result, seconds: (Date.now() - started) / 1000, error: true};
  }
  throw new Error(kind + ' timeout');
}

await mkdir(out, {recursive: true});
const log = [];
const bytes = await readFile(photo);
const type = photo.endsWith('.png') ? 'image/png' : 'image/jpeg';
let before = await credit();
const file = await call('/s2s/v2.0/file', {method: 'POST', body: JSON.stringify({files: [{content_type: type, file_name: basename(photo), file_size: bytes.length}]})});
const f = file.data.files[0], req = f.requests[0];
const put = await fetch(req.url, {method: req.method || 'PUT', headers: req.headers, body: bytes});
if (!put.ok) throw new Error('upload ' + put.status);
let after = await credit();
log.push({step: 'file', units: before - after});

async function run(name, kind, payload) {
  before = after;
  const {result, seconds, error} = await task(kind, payload);
  after = await credit();
  log.push({step: name, units: +(before - after).toFixed(2), seconds, error: !!error});
  await writeFile(`${out}/${shopper}-${name}.json`, JSON.stringify(result, null, 2));
  return result;
}
if(!process.env.SKIP_SKIN) await run('skin-analysis', 'skin-analysis', {src_file_id: f.file_id, dst_actions: ['oiliness', 'redness', 'moisture', 'acne'], format: 'json'});
if(!process.env.SKIP_TONE) await run('skin-tone', 'skin-tone-analysis', {src_file_id: f.file_id, face_angle_strictness_level: 'high'});
for (const hex of hexList.split(',').filter(Boolean)) {
  const result = await run('makeup-vto-' + hex.slice(1).toLowerCase(), 'makeup-vto', {src_file_id: f.file_id, effects: [{category: 'foundation', palettes: [{color: hex, colorIntensity: 50, glowIntensity: 20, coverageIntensity: 50}]}], version: '1.0'});
  const link = result.data?.results?.url || result.data?.results?.[0]?.download_url;
  if (link) await writeFile(`${out}/${shopper}-vto-${hex.slice(1).toLowerCase()}.jpg`, Buffer.from(await (await fetch(link)).arrayBuffer()));
}
log.push({recordedAt: new Date().toISOString(), balance: after});
await writeFile(`${out}/${shopper}-log.json`, JSON.stringify(log, null, 2));
console.log(JSON.stringify(log));
