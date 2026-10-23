'use strict';
// 감빛 페달 운영판 — 시연용 모의 데이터. 실제 센서 대신 회전수를 흉내 낸다.
// 밝기 = Σ min(자리 회전수, 90) ÷ (운영 대수 × 기준 60), 0~100%.

const ZONES = 12, PER = 25, TOTAL = ZONES * PER, BASE = 60, CAP_RPM = 90;
const MY = { z: 7, s: 18 };
const myIdx = (MY.z - 1) * PER + (MY.s - 1);
const TURN = 600;
const pad2 = (n) => String(n).padStart(2, '0');
const seatCode = (i) => `${pad2(Math.floor(i / PER) + 1)}-${pad2(i % PER + 1)}`;
const fmt = (n) => Math.round(n).toLocaleString('ko-KR');
const $ = (id) => document.getElementById(id);

const SCENES = [
  null,
  { story: '시민이 자기 자전거를 롤러 07-18 자리에 올렸어요.', todo: '휴대폰에서 [자리 QR 찍기]를 눌러 주세요.', ok: '휴대폰에 07-18 준비 완료, 운영판 07구역에 내 자리가 초록으로 떠요.', tab: 'phone', time: '10월 29일(금) 18:02' },
  { story: '300자리 중 260자리에 사람이 앉았어요.', todo: '[밟기 시작]을 눌러 주세요. 다 같이 멈추면 감 벽이 어두워져요.', ok: '회전수 합만큼 감 벽이 밝아지고, 내 칸은 내 회전수만큼 밝아요.', tab: 'phone', time: '10월 29일(금) 18:05' },
  { story: '10분이 거의 다 지났어요. 대기 줄에 420명이 서 있어요.', todo: '[10분 빨리 감기]를 눌러 교대 시간을 맞이해 보세요.', ok: '휴대폰에 "다음 분께 넘겨 주세요"가 뜨고, 대기 줄이 줄었어요.', tab: 'phone', time: '10월 29일(금) 18:13' },
  { story: '04구역 센서 신호가 끊겼고, 대기 줄은 350명으로 길어졌어요.', todo: '운영판에서 빨갛게 뜬 04구역을 눌러 보세요.', ok: '04구역은 평균값으로 채워 감 벽이 꺼지지 않고, 다음 회차 번호표가 나가요.', tab: 'ops', time: '10월 29일(금) 19:20' },
  { story: '비가 세져 빗물이 들이치는 바깥쪽 8~12구역을 비웠어요. 지금 169명만 밟고 있어요.', todo: '운영판의 [비 모드]를 한 번 눌러 주세요.', ok: '목표 기준이 300대에서 180대로 바뀌어, 적은 사람으로도 감 벽 밝기가 돌아와요.', tab: 'ops', time: '10월 30일(토) 20:40' },
  { story: '낮에 건 감 한 줄의 이름표 번호는 G-27-04521이에요.', todo: '번호를 넣고 [찾기]를 누른 뒤, 1월에 받는 방법을 골라 주세요.', ok: '내 감 줄 자리를 확인하고 1월 곶감축제 때 받는 방법을 정했어요.', tab: 'phone', time: '10월 31일(일) 14:30' },
];

const S = {};
let toastT;
function reset(scene) {
  Object.assign(S, {
    scene, running: false, rain: false, broken: new Set(), queue: 0, turnLeft: TURN, checked: false,
    turnDone: false, rental: false, typed: '', ticket: '', sheet: 0, done: false, look: null, lookErr: '', pick: '', picked: false,
    seats: Array.from({ length: TOTAL }, () => ({ st: 'idle', rpm: 0, tgt: 0 })),
  });
}
// 운영 대수 안의 자리인지: 비 모드면 안쪽 180대(1~7구역 175대 + 8구역 1~5번)만
const active = (i) => !S.rain || i < 7 * PER + 5;
const cap = () => (S.rain ? 180 : TOTAL);
// 결정적인 '빈 자리' 40개: i×37 mod 300 < 40
const seatedSet = (i) => (i * 37) % TOTAL >= 40;
function seatRiders(filter) {
  S.seats.forEach((p, i) => { p.st = filter(i) ? 'ride' : 'idle'; if (p.st === 'ride') p.rpm = p.tgt = 45 + ((i * 53) % 31); });
}

function enter(scene) {
  reset(scene);
  clearTimeout(toastT); $('toast').hidden = true;
  if (scene >= 2 && scene <= 5) { S.checked = true; seatRiders(seatedSet); }
  if (scene === 2) { S.queue = 180; S.seats.forEach((p) => { p.rpm = 0; }); }
  if (scene === 3) { S.running = true; S.turnLeft = 75; S.queue = 420; }
  if (scene === 4) { S.running = true; S.turnLeft = 410; S.queue = 350; S.broken.add(4); S.ticket = '19:31 회차 · 0301~0350번'; }
  if (scene === 5) { S.running = true; S.turnLeft = 300; S.queue = 40; seatRiders((i) => i < 7 * PER + 5 && i % 17 !== 3); }
  if (scene === 1) S.queue = 120;
  S.tab = SCENES[scene].tab;
  render(true);
}

function zoneAvg(skip) {
  let sum = 0, n = 0;
  S.seats.forEach((p, i) => { const z = Math.floor(i / PER) + 1; if (skip.has(z) || p.st !== 'ride' || !active(i)) return; sum += p.rpm; n++; });
  return n ? sum / n : 0;
}
function shownRpm(i, avg) {
  const z = Math.floor(i / PER) + 1;
  if (!active(i)) return 0;
  if (S.broken.has(z)) return S.seats[i].st === 'ride' ? avg : 0;
  return S.seats[i].rpm;
}
function totals() {
  const avg = zoneAvg(S.broken);
  let sum = 0, riding = 0;
  S.seats.forEach((p, i) => { if (!active(i)) return; sum += Math.min(shownRpm(i, avg), CAP_RPM); if (p.st === 'ride') riding++; });
  return { avg, sum, riding, bright: Math.min(100, (sum / (cap() * BASE)) * 100) };
}

let tickN = 0;
function tick() {
  tickN++;
  S.seats.forEach((p, i) => {
    const want = S.running && p.st === 'ride' ? p.tgt + Math.sin((tickN + i) / 4) * 6 : 0;
    p.rpm += (want - p.rpm) * 0.3;
    if (p.rpm < 0.5) p.rpm = 0;
  });
  if (S.running && !S.turnDone && tickN % 5 === 0 && S.turnLeft > 0) S.turnLeft--;
  const t = totals();
  if (S.scene === 2 && S.running && t.bright >= 50) markDone();
  render(false);
}

function markDone() {
  if (S.done) return;
  S.done = true;
  document.body.dataset.success = String(S.scene);
}

function toast(msg) {
  const el = $('toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2600);
}

function act(name) {
  if (name === 'next' && S.scene < 6) location.hash = `#scene-${S.scene + 1}`;
  if (name === 'prev' && S.scene > 1) location.hash = `#scene-${S.scene - 1}`;
  if (name === 'scan') { S.checked = true; S.seats[myIdx].st = 'ready'; S.seats[myIdx].tgt = 68; markDone(); toast('07-18 자리에 접수했어요.'); }
  if (name === 'rental') { S.checked = true; S.rental = true; S.seats[myIdx].st = 'ready'; S.seats[myIdx].tgt = 64; toast('비치 자전거로 바꿨어요. 자리는 그대로 07-18이에요.'); }
  if (name === 'pedal-start') { S.running = true; if (S.seats[myIdx].st === 'ready') S.seats[myIdx].st = 'ride'; S.turnDone = false; toast('밟는 만큼 감 벽이 켜져요.'); }
  if (name === 'pedal-stop') { S.running = false; toast('모두 멈추면 감 벽이 서서히 어두워져요.'); }
  if (name === 'skip') {
    S.turnLeft = 0; S.turnDone = true;
    const inn = Math.min(S.queue, totals().riding); S.queue -= inn;
    markDone(); toast(`교대 시간이에요. 대기 줄에서 ${fmt(inn)}명이 자리로 가요.`);
  }
  if (name === 'rain') {
    S.rain = !S.rain;
    if (S.scene === 5 && S.rain) markDone();
    toast(S.rain ? '비 모드를 켰어요. 운영 대수 180대 기준이에요.' : '비 모드를 껐어요. 운영 대수 300대 기준이에요.');
  }
  if (name === 'sheet-close') S.sheet = 0;
  if (name === 'lookup') {
    const v = ($('tag-in')?.value || '').trim().toUpperCase();
    S.typed = v;
    const m = /^G-27-(\d{5})$/.exec(v);
    const n = m ? Number(m[1]) : 0;
    if (!m || n < 1 || n > 10000) { S.look = null; S.lookErr = '번호를 다시 확인해 주세요. 이름표의 G-27-00001~G-27-10000 형식이에요.'; }
    else {
      const k = n - 1;
      S.lookErr = ''; S.look = { code: v, shed: k % 2 ? 'B' : 'A', col: Math.floor(k / 2 / 1000) + 1, line: Math.floor(k / 2) % 1000 + 1 };
    }
  }
  if (name === 'pick-confirm') {
    const sel = document.querySelector('input[name="pick"]:checked');
    if (!sel) { toast('받는 방법을 하나 골라 주세요.'); return; }
    S.pick = sel.value; S.picked = true; markDone();
  }
  render(true);
}

function zoneClick(z) { S.sheet = z; if (S.scene === 4 && S.broken.has(z)) markDone(); render(true); }

// ── 그리기 ──
function phoneHTML(t) {
  const me = S.seats[myIdx];
  const turn = `${Math.floor(S.turnLeft / 60)}:${pad2(S.turnLeft % 60)}`;
  if (S.scene === 6) {
    let h = `<div class="pcard kam"><h3>내 감 한 줄 찾기</h3><p class="muted">낮에 건 감 한 줄의 이름표 번호를 넣어 주세요.</p></div>
      <div class="field"><label for="tag-in"><b>이름표 번호</b></label><input id="tag-in" inputmode="text" autocomplete="off" placeholder="G-27-00000" value="${S.typed || ''}"></div>
      ${S.lookErr ? `<p class="err" role="alert">${S.lookErr}</p>` : ''}
      <button class="btn primary block" data-action="lookup" type="button">찾기</button>`;
    if (S.look) {
      const L = S.look;
      h += `<div class="pcard ok"><span class="state ok">건조 중</span><h3>${L.shed}덕장 ${L.col}열 ${fmt(L.line)}번째 줄</h3>
        <p class="muted">축제가 끝나면 참여 농가 덕장으로 옮겨 60일쯤 말려요.</p><div class="rack" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<span class="${i === 5 ? 'me' : ''}"></span>`).join('')}</div></div>`;
      if (!S.picked) {
        h += `<div class="pcard"><h3>1월에 어떻게 받을까요?</h3><div class="choice">
          <label><input type="radio" name="pick" value="site">1월 곶감축제 때 찾는 곳에서 받기</label>
          <label><input type="radio" name="pick" value="post">택배로 받기 · 4,000원</label></div></div>
          <button class="btn primary block" data-action="pick-confirm" type="button">이대로 정하기</button>`;
      } else {
        h += `<div class="pcard ok"><span class="state ok">정했어요</span><h3>${S.pick === 'site' ? '2028년 1월 곶감축제 찾는 곳에서 받기' : '택배로 받기(4,000원)'}</h3>
          <p class="muted">${S.pick === 'site' ? '곶감축제 날짜가 정해지면 문자로 알려 드려요. 이름표 번호만 보여 주시면 돼요.' : '곶감이 다 마르면 1월 둘째 주에 보내 드려요. 받는 주소는 축제 안내소에서 한 번만 적어요.'}</p></div>`;
      }
    }
    return h;
  }
  if (!S.checked) {
    return `<div class="pcard"><h3>자리 QR을 찍어 주세요</h3><p class="muted">롤러 자리마다 번호와 QR이 붙어 있어요.</p></div>
      <div class="qr" aria-hidden="true"><div><b style="font-size:28px">07-18</b><br>7구역 18번 자리</div></div>
      <button class="btn primary block" data-action="scan" type="button">자리 QR 찍기</button>
      <button class="btn block" data-action="rental" type="button">바퀴가 롤러에 안 맞아요</button>
      <p class="muted">휴대폰이 없으면 구역 요원에게 번호표를 받으세요.</p>`;
  }
  if (S.turnDone) {
    return `<p class="seat-big">07-18</p><div class="pcard warn"><span class="state warn">교대 시간</span><h3>다음 분께 자리를 넘겨 주세요</h3>
      <p>10분 동안 고마웠어요. 자전거를 롤러에서 내려 주세요.</p></div>
      <div class="pcard"><h3>내 기록</h3><p>10분 · 평균 ${fmt(me.tgt)}회전 · 감 벽 내 칸 켬</p></div>
      <div class="pcard kam"><h3>낮에는 감 한 줄 걸기</h3><p class="muted">이름표를 단 감 한 줄을 걸면 1월에 다 마른 곶감으로 찾아가요.</p></div>`;
  }
  const lv = Math.min(me.rpm, CAP_RPM) / CAP_RPM;
  return `<div><p class="muted">내 자리</p><p class="seat-big">07-18</p></div>
    <div class="pcard ${S.running ? 'kam' : 'ok'}"><span class="state ok">${S.rental ? '비치 자전거 · ' : ''}${S.running ? '밟는 중' : '준비됐어요'}</span>
      <h3>${S.running ? '내 칸이 켜졌어요' : '밟으면 감 벽 내 칸이 켜져요'}</h3>
      <div class="mycell"><i id="p-cell" style="opacity:${(0.15 + 0.85 * lv).toFixed(2)}"></i><div><span class="rpm" id="p-rpm">${fmt(me.rpm)}</span> 회전/분<br><span class="muted">90회전이면 내 칸이 가장 밝아요</span></div></div></div>
    <div class="pcard"><p>감 벽 밝기 <b id="p-bright">${fmt(t.bright)}%</b> · 남은 시간 <b id="p-turn">${turn}</b></p><p class="muted">통신이 끊겨도 자리 번호는 그대로 남아요.</p></div>
    ${S.running ? '<button class="btn block" data-action="pedal-stop" type="button">모두 멈춤</button>' : '<button class="btn primary block" data-action="pedal-start" type="button">밟기 시작</button>'}
    ${S.scene === 3 ? '<button class="btn primary block" data-action="skip" type="button">10분 빨리 감기</button>' : ''}`;
}

function zonesHTML(t) {
  let h = '';
  for (let z = 1; z <= ZONES; z++) {
    let ride = 0, act = 0;
    for (let s = 0; s < PER; s++) { const i = (z - 1) * PER + s; if (active(i)) { act++; if (S.seats[i].st === 'ride') ride++; } }
    let cls = 'ok', note = `${act}자리 중 ${ride} 밟는 중`;
    if (S.broken.has(z)) { cls = 'bad'; note = '신호 끊김 · 평균값으로 채움'; }
    else if (!act) { cls = 'idle'; note = '비 모드 · 쉬는 구역'; }
    else if (!ride) { cls = 'idle'; note = `${act}자리 · 비어 있음`; }
    if (z === MY.z && S.checked && S.scene === 1) note = '07-18 접수됨';
    h += `<button class="zone ${cls}${z === MY.z && S.checked ? ' mine' : ''}" data-zone="${z}" type="button"><b>${pad2(z)}구역</b><span>${note}</span></button>`;
  }
  return h;
}

function sheetHTML(z, t) {
  const bad = S.broken.has(z);
  let ride = 0; for (let s = 0; s < PER; s++) if (S.seats[(z - 1) * PER + s].st === 'ride') ride++;
  return {
    title: `${pad2(z)}구역 · ${bad ? '센서 신호 끊김' : '정상'}`,
    body: `<table><tr><th>항목</th><th>값</th></tr>
      <tr><td>앉은 자리</td><td class="n">${ride} / ${PER}</td></tr>
      <tr><td>구역 수신기</td><td class="n">${bad ? '응답 없음(유선 확인)' : '정상'}</td></tr>
      <tr><td>감 벽에 쓰는 값</td><td class="n">${bad ? `다른 구역 평균 ${fmt(t.avg)}회전` : '자리별 실제 회전수'}</td></tr>
      <tr><td>할 일</td><td class="n">${bad ? '구역 요원 2명에게 수신기 점검 알림을 보냈어요' : '없음'}</td></tr></table>`,
  };
}

let wallBuilt = false;
function render(full) {
  const t = totals();
  const sc = SCENES[S.scene];
  if (full) {
    $('g-step').textContent = `장면 ${S.scene}/6`;
    $('g-story').textContent = sc.story;
    $('g-do').textContent = sc.todo;
    $('o-time').textContent = sc.time;
    document.querySelector('[data-action="prev"]').disabled = S.scene === 1;
    document.querySelector('[data-action="next"]').textContent = S.scene === 6 ? '처음으로' : '다음';
    document.body.dataset.tab = S.tab;
    ['phone', 'ops'].forEach((k) => $(`tab-${k}`).setAttribute('aria-selected', String(S.tab === k)));
    $('phone-body').innerHTML = phoneHTML(t);
    $('zones').innerHTML = zonesHTML(t);
    $('rain-btn').setAttribute('aria-pressed', String(S.rain));
    $('rain-band').hidden = !S.rain;
    const sh = $('sheet');
    if (S.sheet) { const c = sheetHTML(S.sheet, t); $('sheet-title').textContent = c.title; $('sheet-body').innerHTML = c.body; sh.hidden = false; sh.style.borderTopColor = S.broken.has(S.sheet) ? '' : 'var(--ok)'; } else sh.hidden = true;
  } else if ($('p-rpm')) {
    const me = S.seats[myIdx];
    $('p-rpm').textContent = fmt(me.rpm);
    $('p-cell').style.opacity = (0.15 + 0.85 * Math.min(me.rpm, CAP_RPM) / CAP_RPM).toFixed(2);
    $('p-bright').textContent = `${fmt(t.bright)}%`;
    $('p-turn').textContent = `${Math.floor(S.turnLeft / 60)}:${pad2(S.turnLeft % 60)}`;
  }
  $('g-ok').hidden = !S.done;
  $('g-ok-text').textContent = sc.ok;
  if (!S.done) delete document.body.dataset.success;
  if (!wallBuilt) { $('wall').innerHTML = Array.from({ length: TOTAL }, (_, i) => `<span class="cell${i === myIdx ? ' me' : ''}" title="${seatCode(i)}"></span>`).join(''); wallBuilt = true; }
  const cells = $('wall').children;
  for (let i = 0; i < TOTAL; i++) {
    const c = cells[i];
    const z = Math.floor(i / PER) + 1;
    const off = !active(i);
    c.classList.toggle('off', off);
    c.classList.toggle('fill', !off && S.broken.has(z) && S.seats[i].st === 'ride');
    c.style.opacity = off ? '' : (0.12 + 0.88 * Math.min(shownRpm(i, t.avg), CAP_RPM) / CAP_RPM).toFixed(2);
    c.classList.toggle('me', i === myIdx && S.checked);
  }
  $('k-bright').textContent = `${fmt(t.bright)}%`;
  $('k-rpm').textContent = fmt(t.sum);
  $('k-riding').textContent = `${fmt(t.riding)} / ${fmt(cap())}`;
  $('k-queue').textContent = `${fmt(S.queue)}명`;
  $('meter-bar').style.width = `${t.bright.toFixed(1)}%`;
  $('f-cap').textContent = fmt(cap());
  $('f-val').textContent = `${fmt(t.sum)} ÷ ${fmt(cap() * BASE)} = ${fmt(t.bright)}%`;
  $('turn-left').textContent = S.turnDone ? '교대 중' : `${Math.floor(S.turnLeft / 60)}:${pad2(S.turnLeft % 60)}`;
  $('ticket').textContent = S.ticket || (S.queue > 300 ? '발급 중' : '발급 안 함');
  $('queue-note').textContent = S.queue > 300 ? `대기 ${fmt(S.queue)}명 · 예상 대기 ${fmt(Math.ceil(S.queue / 300) * 11)}분. 번호표를 받고 다른 곳을 둘러보다 오세요.` : '대기 줄이 300명을 넘으면 다음 회차 번호표를 나눠 드려요.';
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-action]');
  if (a) { act(a.dataset.action); return; }
  const z = e.target.closest('[data-zone]');
  if (z) { zoneClick(Number(z.dataset.zone)); return; }
  const tb = e.target.closest('button[data-tab]');
  if (tb) { S.tab = tb.dataset.tab; render(true); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'tag-in') act('lookup'); });

function route() {
  if (document.body.dataset.mode === 'full') { enter(2); S.running = true; render(true); return; }
  const m = /#scene-(\d)/.exec(location.hash);
  const n = m ? Math.min(6, Math.max(1, Number(m[1]))) : 1;
  enter(n);
}
// 6장면 끝에서 [처음으로]
const nextBtn = document.querySelector('[data-action="next"]');
nextBtn.addEventListener('click', () => { if (S.scene === 6) location.hash = '#scene-1'; });
window.addEventListener('hashchange', route);
window.addEventListener('pageshow', route);
setInterval(tick, 200);
