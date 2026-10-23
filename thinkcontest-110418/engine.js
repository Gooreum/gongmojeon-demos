// 제주 입도객 7일 예보 — 브라우저 계산기. poc/forecast.py 의 make_rows·calendar·predict 를 그대로 옮겼다.
// 모형(나무)·자료는 model.js(window.JEJU_MODEL, poc/export_model.py 가 만듦)에서 읽는다. 외부 요청 없음.
(function (g) {
  "use strict";
  const DAY = 86400000;
  const SERIES = ["dom", "for"];
  const H = [1, 2, 3, 4, 5, 6, 7];

  // model.js 의 실수 배열은 base64(float64)로 들어 있다 — 처음 쓸 때 한 번 푼다
  function f64(s) {
    const b = atob(s), u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return new Float64Array(u.buffer);
  }
  function unpack(M) {
    if (M._ready) return M;
    for (const k of Object.keys(M.models)) {
      const md = M.models[k];
      md.base = f64(md.base)[0];
      for (const tr of md.trees) { tr.t = f64(tr.t); tr.v = f64(tr.v); }
    }
    M.doy = f64(M.doy);
    for (const k of Object.keys(M.band)) M.band[k] = Array.from(f64(M.band[k]));
    M._ready = true;
    return M;
  }

  const dayOf = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / DAY;
  const iso = (d) => new Date(d * DAY).toISOString().slice(0, 10);
  const dow = (d) => (new Date(d * DAY).getUTCDay() + 6) % 7;            // 월=0 (pandas 와 같음)
  const month = (d) => new Date(d * DAY).getUTCMonth() + 1;
  const doy = (d) => d - Date.UTC(new Date(d * DAY).getUTCFullYear(), 0, 1) / DAY + 1;

  // 자료: {start: 날짜 번호, dom: [], for: []}. 빈 값은 NaN.
  // 내국인 5천 명 미만(폭설·태풍으로 공항이 멈춘 날)은 forecast.py 처럼 두 값 모두 뺀다.
  function makeSeries(start, dom, fr) {
    const s = { start: dayOf(start), dom: [], for: [] };
    for (let i = 0; i < dom.length; i++) {
      const a = dom[i] == null ? NaN : +dom[i], b = fr[i] == null ? NaN : +fr[i];
      const bad = isNaN(a) || isNaN(b) || a < 5000;
      s.dom.push(bad ? NaN : a); s.for.push(bad ? NaN : b);
    }
    return s;
  }
  function get(S, k, d) { const v = S[k][d - S.start]; return v === undefined ? NaN : v; }
  function lastDay(S) {
    for (let i = S.dom.length - 1; i >= 0; i--) if (!isNaN(S.dom[i]) && !isNaN(S.for[i])) return S.start + i;
    return NaN;
  }
  // 하루치 넣기(덮어쓰기). 날짜가 자료 끝보다 뒤면 사이를 빈 값으로 채운다.
  function put(S, d, dom, fr) {
    while (S.start + S.dom.length <= d) { S.dom.push(NaN); S.for.push(NaN); }
    const i = d - S.start, bad = !(dom >= 5000) || !(fr >= 0);
    S.dom[i] = bad ? NaN : dom; S.for[i] = bad ? NaN : fr;
  }

  // 쉬는 날·연휴 특성 (forecast.calendar 와 같음)
  function calendar(lo, hi, hol) {
    const n = hi - lo + 1, c = { dow: [], hol: [], lunar: [], off: [], blk_len: [], blk_pos: [], to_long: [], from_long: [], to_lunar: [], from_lunar: [] };
    for (let i = 0; i < n; i++) {
      const d = lo + i, name = hol[iso(d)] || "";
      c.dow.push(dow(d)); c.hol.push(name ? 1 : 0);
      c.lunar.push(name.includes("설날") || name.includes("추석") ? 1 : 0);
      c.off.push(name || dow(d) >= 5 ? 1 : 0);
    }
    for (let i = 0; i < n;) {                       // 쉬는 날이 이어진 묶음의 길이·위치
      let j = i; while (j < n && c.off[j] === c.off[i]) j++;
      for (let k = i; k < j; k++) { c.blk_len[k] = c.off[i] ? j - i : 0; c.blk_pos[k] = c.off[i] ? k - i + 1 : 0; }
      i = j;
    }
    const clip = (v, m) => Math.min(Math.max(v, 0), m);
    let nxt = NaN, nl = NaN;
    for (let i = n - 1; i >= 0; i--) {             // 다음 3일 이상 연휴 시작·다음 설·추석까지
      if (c.off[i] && c.blk_len[i] >= 3 && c.blk_pos[i] === 1) nxt = i;
      if (c.lunar[i]) nl = i;
      c.to_long[i] = clip(isNaN(nxt) ? 99 : nxt - i, 8);
      c.to_lunar[i] = clip(isNaN(nl) ? 99 : nl - i, 15);
    }
    let prv = NaN, pl = NaN;
    for (let i = 0; i < n; i++) {                  // 지난 3일 이상 연휴 끝·지난 설·추석부터
      if (c.off[i] && c.blk_len[i] >= 3 && c.blk_pos[i] === c.blk_len[i]) prv = i;
      if (c.lunar[i]) pl = i;
      c.from_long[i] = clip(isNaN(prv) ? 99 : i - prv, 8);
      c.from_lunar[i] = clip(isNaN(pl) ? 99 : i - pl, 15);
    }
    c.at = (col, d) => (d < lo || d > hi ? NaN : c[col][d - lo]);
    return c;
  }

  // 예보 시점 D(마지막 실제치 날) → D+h 의 특성값 (forecast.make_rows 와 같음)
  function features(S, k, D, cal, M) {
    unpack(M);
    const ly = (d) => Math.log(get(S, k, d));
    const lv7 = (d) => { let s = 0; for (let i = 0; i < 7; i++) s += get(S, k, d - i); return Math.log(s / 7); };
    return H.map((h) => {
      const t = D + h, f = {
        h, lag7: ly(t - 7), lag14: ly(t - 14), lag364: ly(t - 364), lvl: lv7(D), lvl_ly: lv7(D - 364), last: ly(D),
        month: month(t), doy_s: M.doy[2 * doy(t)], doy_c: M.doy[2 * doy(t) + 1],
      };
      for (const col of M.cal_cols) { f[col] = cal.at(col, t); f[col + "_7"] = cal.at(col, t - 7); f[col + "_364"] = cal.at(col, t - 364); }
      return M.feats.map((name) => f[name]);
    });
  }

  function raw(model, x) {
    let s = model.base;
    for (const tr of model.trees) {
      let i = 0;
      while (tr.f[i] !== -1) {
        const v = x[tr.f[i]];
        i = (Number.isNaN(v) || v == null ? tr.m[i] : v <= tr.t[i]) ? tr.l[i] : tr.r[i];
      }
      s += tr.v[i];
    }
    return s;
  }

  // 7일 예보: [{date, h, dom:{pred,lo,hi,lastweek}, for:{…}}]
  function forecast(S, M, D) {
    unpack(M);
    D = D === undefined ? lastDay(S) : D;
    const cal = calendar(D - 400, D + 40, M.holidays);
    const out = H.map((h) => ({ date: iso(D + h), h }));
    for (const k of SERIES) {
      features(S, k, D, cal, M).forEach((x, i) => {
        const h = i + 1, p = Math.exp(raw(M.models[k], x) + x[M.feats.indexOf("lag7")]);
        const [lo, hi] = M.band[k + ":" + h];
        out[i][k] = { pred: p, lo: p * Math.exp(lo), hi: p * Math.exp(hi), lastweek: get(S, k, D + h - 7) };
      });
    }
    return { origin: iso(D), rows: out };
  }

  // 플랫폼 '입도 관광객 추이(일별)' CSV(기준일자, 내국인, 외국인, 전체)를 읽는다. 날짜·숫자만 보므로 인코딩과 무관.
  function parseCsv(text) {
    const rows = [];
    for (const line of text.split(/\r?\n/)) {
      const f = (line.match(/("[^"]*"|[^,]*)(,|$)/g) || []).map((c) => c.replace(/,$/, "").replace(/"/g, "").trim());
      const m = (f[0] || "").replace(/^\ufeff/, "").match(/^(20\d{2})[-./]?(\d{2})[-./]?(\d{2})$/);
      const a = (f[1] || "").replace(/,/g, ""), b = (f[2] || "").replace(/,/g, "");
      if (m && /^\d+$/.test(a) && /^\d+$/.test(b)) rows.push({ date: `${m[1]}-${m[2]}-${m[3]}`, dom: +a, for: +b });
    }
    return rows;
  }

  g.JejuEngine = { unpack, dayOf, iso, dow, makeSeries, get, lastDay, put, calendar, features, raw, forecast, parseCsv, SERIES, H };
})(typeof window !== "undefined" ? window : globalThis);
