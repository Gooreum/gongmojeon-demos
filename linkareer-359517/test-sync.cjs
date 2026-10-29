// 네트워크는 대체 응답으로 검사한다. 실제 센터에 시험 기록을 보내지 않는다.
const { JSDOM } = require(require('node:path').join(process.env.DOM_ROOT, 'node_modules/jsdom'));
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const pause = () => new Promise(resolve => setTimeout(resolve, 20));
const key = 'jangnal-observations-v1';
const makeRecord = (id, practice) => ({
  id, practice, market: 'seogwipo', line: '880-1', date: '2026-11-04',
  otherDate: '2026-11-05', rows: [{ hour: 9, market: 12, other: 3 }],
  savedAt: Date.now(), reviewed: false, sent: false
});

(async () => {
  const dom = new JSDOM(read('index.html'), {
    url: 'http://127.0.0.1:8873/#scene-5', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  const posts = [];
  let online = true, fail = false, hold;
  w.scrollTo = () => {};
  w.matchMedia = () => ({ matches: true });
  w.AbortSignal = AbortSignal;
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  Object.defineProperty(w.navigator, 'onLine', { get: () => online });
  w.fetch = async (url, options = {}) => {
    if (url === '/api/markets') return { ok: true, json: async () => w.JANGNAL_DATA.markets };
    assert.equal(url, '/api/observe');
    assert.equal(options.method, 'POST');
    posts.push(JSON.parse(options.body));
    if (hold) await hold;
    return { ok: !fail };
  };
  w.eval(read('data.js'));
  w.eval(read('app.js'));
  await pause();
  const $ = selector => w.document.querySelector(selector);
  const load = records => {
    w.localStorage.setItem(key, JSON.stringify(records));
    w.dispatchEvent(new w.StorageEvent('storage', { key, newValue: JSON.stringify(records) }));
    $('#nav-records').click();
  };
  const send = async () => { $('[data-action="sync"]').click(); await pause(); };
  const saved = () => JSON.parse(w.localStorage.getItem(key));
  const notice = () => $('#toast').textContent;
  const skip = '시연용 입력 예시는 센터로 보내지 않아요.';
  try {
    load([makeRecord('practice', true)]);
    await send();
    assert.equal(posts.length, 0);
    assert.equal(notice(), skip);
    assert.equal(saved()[0].sent, false);
    console.log('통과: 연습 기록만 있으면 전송 없이 안내하고 기기에 보관');

    load([makeRecord('practice', true), makeRecord('real', false)]);
    await send();
    assert.equal(posts.length, 1);
    assert.equal(posts[0].counts.practice, false);
    assert.deepEqual(posts[0].counts.market_counts, [{ hour: 9, line: '880-1', n: 12 }]);
    assert.equal(saved()[0].sent, false);
    assert.equal(saved()[1].sent, true);
    assert.ok(notice().includes(skip) && notice().includes('1건을 센터에 보냈어요.'));
    console.log('통과: 혼합 목록에서 실제 기록만 전송하고 practice:false 전달');

    await send();
    assert.equal(posts.length, 1);
    console.log('통과: 다시 눌러도 이미 보낸 기록과 연습 기록을 전송하지 않음');

    load([makeRecord('practice', true), makeRecord('offline', false)]);
    online = false;
    await send();
    assert.equal(posts.length, 1);
    assert.ok(notice().includes(skip) && notice().includes('센터 연결이 없어요.'));
    assert.ok(saved().every(r => !r.sent));
    online = true;
    await send();
    assert.equal(posts.length, 2);
    assert.equal(saved()[1].sent, true);
    console.log('통과: 오프라인 보관 후 재연결 시 실제 기록만 전송');

    load([makeRecord('practice', true), makeRecord('retry', false)]);
    fail = true;
    await send();
    assert.ok(saved().every(r => !r.sent));
    assert.ok(notice().includes(skip) && notice().includes('보내지 못한 기록'));
    fail = false;
    await send();
    assert.equal(saved()[1].sent, true);
    console.log('통과: 서버 실패 시 미전송 상태 유지하고 재시도 성공');

    load([makeRecord('concurrent', false)]);
    let release;
    hold = new Promise(resolve => { release = resolve; });
    const before = posts.length;
    $('[data-action="sync"]').click();
    assert.equal($('[data-action="sync"]').disabled, true);
    $('#nav-records').click();
    $('[data-action="sync"]').click();
    assert.equal(posts.length, before + 1);
    release();
    hold = undefined;
    await pause();
    assert.equal(saved()[0].sent, true);
    assert.equal($('[data-action="sync"]').disabled, false);
    console.log('통과: 전송 중 화면 재진입과 중복 클릭에도 요청 한 번');
    assert.ok(posts.every(p => p.counts.practice === false));
    console.log('전송 회귀 검사 6개 모두 통과');
  } finally { w.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
