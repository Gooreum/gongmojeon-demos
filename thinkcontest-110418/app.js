// 제주 입도객 7일 예보 — 화면. 계산은 engine.js, 모형·자료는 model.js, 기록 숫자는 index.html 의 #logged.
(function () {
  "use strict";
  const E = window.JejuEngine, M = window.JEJU_MODEL;
  const $ = (s) => document.querySelector(s);
  const NAME = { dom: "내국인", for: "외국인" };
  const WD = "월화수목금토일";
  const fmt = (v) => (isNaN(v) ? "–" : Math.round(v).toLocaleString("ko-KR"));
  const pct = (v) => (isNaN(v) ? "–" : v.toFixed(1) + "%");
  const md = (d) => { const t = typeof d === "number" ? d : E.dayOf(d); const s = E.iso(t); return `${+s.slice(5, 7)}.${+s.slice(8, 10)}(${WD[E.dow(t)]})`; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const holTag = (d) => (M.holidays[d] ? ` <span class="hol">${esc(M.holidays[d])}</span>` : "");
  const logged = JSON.parse($("#logged").textContent);

  const base = () => E.makeSeries(M.start, M.dom, M.for);
  const ORIG = base();
  let S = base();

  // ---------- 그림 ----------
  // days: 날짜 번호 목록, lines: [{cls, pts:[[d,v]]}], band: [[d,lo,hi]]
  function chart(days, lines, band, label) {
    const W = 720, Hh = 230, L = 52, R = 20, T = 14, B = 30;
    const vals = [];
    lines.forEach((l) => l.pts.forEach(([, v]) => !isNaN(v) && vals.push(v)));
    band.forEach(([, lo, hi]) => vals.push(lo, hi));
    if (!vals.length) return "";
    const lo = Math.min(...vals) * 0.92, hi = Math.max(...vals) * 1.04;
    const d0 = days[0], d1 = days[days.length - 1];
    const x = (d) => L + ((W - L - R) * (d - d0)) / Math.max(1, d1 - d0);
    const y = (v) => T + (Hh - T - B) * (1 - (v - lo) / (hi - lo));
    let step = Math.pow(10, String(Math.floor(hi - lo)).length - 1);
    while ((hi - lo) / step < 3) step /= 2;
    const o = [`<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(label)}">`];
    for (let k = Math.floor(lo / step) + 1; k * step <= hi; k++) {
      const v = k * step;
      o.push(`<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="ax" x="${L - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${(v / 1000).toLocaleString("ko-KR")}천</text>`);
    }
    const every = Math.max(1, Math.round(days.length / 8));
    days.forEach((d, i) => { if (i % every === 0) { const s = E.iso(d); o.push(`<text class="ax" x="${x(d).toFixed(1)}" y="${Hh - 8}" text-anchor="middle">${+s.slice(5, 7)}.${+s.slice(8, 10)}</text>`); } });
    if (band.length) {
      const pts = band.map(([d, , h]) => `${x(d).toFixed(1)},${y(h).toFixed(1)}`).concat(band.slice().reverse().map(([d, l]) => `${x(d).toFixed(1)},${y(l).toFixed(1)}`));
      o.push(`<polygon class="band" points="${pts.join(" ")}"/>`);
    }
    for (const l of lines) {
      const segs = [[]];
      l.pts.forEach(([d, v]) => (isNaN(v) ? segs.push([]) : segs[segs.length - 1].push(`${x(d).toFixed(1)},${y(v).toFixed(1)}`)));
      segs.filter((s) => s.length > 1).forEach((s) => o.push(`<polyline class="${l.cls}" points="${s.join(" ")}"/>`));
      if (l.dots) l.pts.forEach(([d, v]) => !isNaN(v) && o.push(`<circle class="${l.cls}-dot" cx="${x(d).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3"/>`));
    }
    o.push("</svg>");
    return o.join("");
  }

  // ---------- 1. 오늘부터 7일 예보 ----------
  function renderForecast() {
    const t0 = performance.now();
    const fc = E.forecast(S, M);
    const ms = performance.now() - t0;
    const D = E.dayOf(fc.origin);
    $("#fc-meta").innerHTML = `마지막 실제치 <b>${md(D)}</b> · 브라우저가 방금 계산했어요(${ms < 1000 ? Math.max(1, Math.round(ms)) + "ms" : (ms / 1000).toFixed(1) + "초"}) · 모형은 ${md(M.trained_through)}까지 자료로 학습`;
    $("#fc-body").innerHTML = fc.rows.map((r) => {
      const cells = E.SERIES.map((k) => {
        const c = r[k], ch = (c.pred / c.lastweek - 1) * 100;
        return `<td class="num"><b>${fmt(c.pred)}</b><small>${fmt(c.lo)}~${fmt(c.hi)}</small></td><td class="num muted">${fmt(c.lastweek)} ${isNaN(ch) ? "" : `<small class="${ch >= 0 ? "up" : "dn"}">${ch >= 0 ? "+" : ""}${ch.toFixed(0)}%</small>`}</td>`;
      }).join("");
      return `<tr><th>${md(r.date)}${holTag(r.date)}</th>${cells}</tr>`;
    }).join("");
    // 매일 자동 기록한 예보와 같은지
    const lg = logged.forecast && logged.forecast.origin === fc.origin ? logged.forecast : null;
    let same = "";
    if (lg) {
      const diff = Math.max(...fc.rows.flatMap((r) => E.SERIES.map((k) => Math.abs(Math.round(r[k].pred) - lg[k][r.h - 1]))));
      same = diff <= 1 ? `<p class="ok">✓ ${esc(lg.issued)}에 자동으로 기록해 둔 예보와 같은 숫자예요(같은 모형·같은 자료).</p>`
        : `<p class="warn">${esc(lg.issued)}에 기록한 예보와 최대 ${fmt(diff)}명 달라요. 그 뒤 들어온 자료가 섞였는지 확인해 주세요.</p>`;
    } else if (S !== ORIG || E.lastDay(S) !== E.lastDay(ORIG)) {
      same = `<p class="muted small">넣어 주신 자료로 새로 계산한 예보예요. 이 숫자는 이 브라우저 안에만 있고 어디에도 보내지 않아요.</p>`;
    }
    $("#fc-same").innerHTML = same;
    // 그림: 최근 21일 실제치 + 7일 예보
    $("#fc-charts").innerHTML = E.SERIES.map((k) => {
      const days = []; for (let d = D - 20; d <= D + 7; d++) days.push(d);
      const act = days.filter((d) => d <= D).map((d) => [d, E.get(S, k, d)]);
      const pred = fc.rows.map((r) => [E.dayOf(r.date), r[k].pred]);
      const band = fc.rows.map((r) => [E.dayOf(r.date), r[k].lo, r[k].hi]);
      return `<b>${NAME[k]}</b>${chart(days, [{ cls: "act", pts: act }, { cls: "pred", pts: [[D, E.get(S, k, D)], ...pred], dots: true }], band, NAME[k] + " 최근 3주와 7일 예보")}`;
    }).join("");
  }

  // ---------- 2. 최신 자료 넣기 ----------
  function setMsg(html, cls) { const m = $("#in-msg"); m.className = "msg " + (cls || ""); m.innerHTML = html; }
  function nextDayDefaults() {
    const d = E.lastDay(S) + 1;
    $("#in-date").value = E.iso(d);
  }
  function addRows(rows, src) {
    const before = E.lastDay(S);
    let added = 0, changed = 0;
    if (S === ORIG) S = base();
    for (const r of rows) {
      const d = E.dayOf(r.date), old = [E.get(S, "dom", d), E.get(S, "for", d)];
      if (d < S.start) continue;
      E.put(S, d, r.dom, r.for);
      if (isNaN(old[0])) added++; else if (old[0] !== E.get(S, "dom", d) || old[1] !== E.get(S, "for", d)) changed++;
    }
    const after = E.lastDay(S);
    renderForecast(); nextDayDefaults();
    const gap = (() => { for (let d = after - 13; d <= after; d++) if (isNaN(E.get(S, "dom", d))) return E.iso(d); return ""; })();
    setMsg(`${esc(src)}: ${rows.length}일 읽음 · 새 날짜 ${added}일 · 값이 바뀐 날 ${changed}일 → 마지막 실제치 <b>${md(after)}</b>${after > before ? ` (${after - before}일 앞으로)` : ""}. 위 예보를 다시 계산했어요.` +
      (gap ? `<br>⚠ 최근 14일 중 ${gap} 값이 비어 있어요. 빈 날이 있으면 그 날을 쓰는 예보가 '–'로 나와요.` : ""), gap ? "warn" : "ok");
  }
  function wireInput() {
    nextDayDefaults();
    const readFile = (f) => {
      const rd = new FileReader();
      rd.onload = () => {
        const buf = new Uint8Array(rd.result);
        const text = new TextDecoder("utf-8").decode(buf);
        const rows = E.parseCsv(text);
        if (!rows.length) return setMsg(`'${esc(f.name)}'에서 날짜·내국인·외국인 숫자를 찾지 못했어요. 플랫폼 '입도 관광객 추이(일별)'에서 받은 CSV 인지 확인해 주세요.`, "warn");
        addRows(rows, `'${f.name}'`);
      };
      rd.readAsArrayBuffer(f);
    };
    $("#in-file").addEventListener("change", (e) => e.target.files[0] && readFile(e.target.files[0]));
    const dz = $("#drop");
    ["dragenter", "dragover"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add("over"); }));
    ["dragleave", "drop"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove("over"); }));
    dz.addEventListener("drop", (e) => e.dataTransfer.files[0] && readFile(e.dataTransfer.files[0]));
    $("#in-add").addEventListener("click", () => {
      const d = $("#in-date").value, a = +$("#in-dom").value.replace(/[^\d]/g, ""), b = +$("#in-for").value.replace(/[^\d]/g, "");
      if (!d || !(a >= 5000) || !($("#in-for").value.trim() !== "" && b >= 0)) return setMsg("날짜와 내국인(5,000명 이상)·외국인 숫자를 모두 넣어 주세요.", "warn");
      addRows([{ date: d, dom: a, for: b }], `${md(d)} 직접 입력`);
      $("#in-dom").value = ""; $("#in-for").value = "";
    });
    $("#in-reset").addEventListener("click", () => { S = ORIG; renderForecast(); nextDayDefaults(); setMsg("처음 자료(페이지에 들어 있는 플랫폼 자료)로 되돌렸어요.", ""); });
  }

  // ---------- 3. 지난 날짜로 되짚어 보기 ----------
  const P = M.past, p0 = E.dayOf(P.start), pN = p0 + P.dom.length - 1;
  function pastAt(D) {
    const i = D - p0;
    return E.H.map((h) => {
      const t = D + h, r = { date: E.iso(t) };
      for (const k of E.SERIES) {
        const v = P[k][i] ? P[k][i][h - 1] : null, pred = v == null ? NaN : v, act = E.get(ORIG, k, t), lw = E.get(ORIG, k, t - 7);
        r[k] = { pred, act, lw, e: Math.abs(pred - act) / act * 100, elw: Math.abs(lw - act) / act * 100 };
      }
      return r;
    });
  }
  const mean = (a) => { const v = a.filter((x) => !isNaN(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN; };
  function renderPast(D) {
    D = Math.min(Math.max(D, p0), pN);
    $("#past-date").value = E.iso(D);
    const rows = pastAt(D);
    $("#past-body").innerHTML = rows.map((r) => `<tr><th>${md(r.date)}${holTag(r.date)}</th>` + E.SERIES.map((k) => {
      const c = r[k], win = c.e <= c.elw;
      return `<td class="num">${fmt(c.pred)}</td><td class="num">${fmt(c.act)}</td><td class="num"><b class="${win ? "win" : ""}">${pct(c.e)}</b><small>지난주 ${pct(c.elw)}</small></td>`;
    }).join("") + "</tr>").join("");
    $("#past-sum").innerHTML = E.SERIES.map((k) => {
      const e = mean(rows.map((r) => r[k].e)), l = mean(rows.map((r) => r[k].elw));
      return `<div class="stat"><span>${NAME[k]} · 이 주 평균 오차</span><b>${pct(e)}</b><small>지난주 같은 요일 방식 ${pct(l)}${!isNaN(e) && !isNaN(l) ? (e <= l ? " · 예보가 더 가까웠어요" : " · 이 주는 지난주 방식이 더 가까웠어요") : ""}</small></div>`;
    }).join("");
    $("#past-meta").innerHTML = `${md(D)} 아침(${md(D)}까지 실제치를 아는 상태)에 낸 예보예요. 그 달 1일 전 자료로만 학습한 모형이라 미래 정보는 들어가지 않았어요.`;
    $("#past-charts").innerHTML = E.SERIES.map((k) => {
      const days = []; for (let d = D - 13; d <= D + 7; d++) days.push(d);
      const act = days.map((d) => [d, E.get(ORIG, k, d)]);
      const pred = rows.map((r) => [E.dayOf(r.date), r[k].pred]);
      return `<b>${NAME[k]}</b>${chart(days, [{ cls: "act", pts: act }, { cls: "pred", pts: pred, dots: true }], [], NAME[k] + " 지난 예보와 실제")}`;
    }).join("");
  }
  function wirePast() {
    const inp = $("#past-date");
    inp.min = E.iso(p0); inp.max = E.iso(pN);
    // 내국인 예보가 가장 크게 빗나간 주·가장 잘 맞은 주(모든 시점 중)
    let worst = [p0, -1], best = [p0, 1e9];
    for (let D = p0; D <= pN; D++) {
      const e = mean(pastAt(D).map((r) => r.dom.e));
      if (isNaN(e)) continue;
      if (e > worst[1]) worst = [D, e];
      if (e < best[1]) best = [D, e];
    }
    const presets = [["2025 추석 연휴 앞", E.dayOf("2025-09-30")], ["2026 설 연휴 앞", E.dayOf("2026-02-10")], ["2025 여름 성수기", E.dayOf("2025-07-25")],
      [`가장 크게 빗나간 주(${md(worst[0])})`, worst[0]], [`가장 잘 맞은 주(${md(best[0])})`, best[0]]].filter(([, d]) => d >= p0 && d <= pN);
    $("#past-presets").innerHTML = presets.map(([t, d]) => `<button type="button" data-d="${d}">${esc(t)}</button>`).join("");
    $("#past-presets").addEventListener("click", (e) => { const d = e.target.dataset && e.target.dataset.d; if (d) renderPast(+d); });
    inp.addEventListener("change", () => inp.value && renderPast(E.dayOf(inp.value)));
    $("#past-prev").addEventListener("click", () => renderPast(E.dayOf(inp.value) - 7));
    $("#past-next").addEventListener("click", () => renderPast(E.dayOf(inp.value) + 7));
    renderPast(E.dayOf("2025-09-30") <= pN ? E.dayOf("2025-09-30") : pN);
  }

  try {
    renderForecast(); wireInput(); wirePast();
    $("#loading").remove();
  } catch (err) {
    $("#loading").textContent = "계산 중 문제가 생겼어요: " + err.message;
    throw err;
  }
})();
