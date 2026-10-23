/* docs/experiments/engine.py의 날짜·판정 규칙. 시간대에 영향받지 않는 UTC 날짜. */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const date = value => new Date(value + 'T00:00:00Z');
  const iso = value => value.toISOString().slice(0, 10);
  const shift = (value, days) => iso(new Date(date(value).getTime() + days * DAY));
  const months = (a, b) => (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7));
  function years(value, n) {
    const d = date(value), month = d.getUTCMonth();
    d.setUTCFullYear(d.getUTCFullYear() + n);
    if (d.getUTCMonth() !== month) d.setUTCDate(0);
    return iso(d);
  }
  function create(data) {
    const B = Object.fromEntries(data.benefits.map(b => [b.id, b]));
    function allowance(p, today) {
      const r = B.allowance.rules, out = { id: 'allowance', name: '자립수당' };
      const result = more => ({ ...out, ...more });
      if (p.still_in_care) return result({ status: '아직 보호 중', why: '만 18세 뒤 시설을 옮기는(전원) 것은 보호종료가 아님. 실제로 보호가 끝날 때 신청' });
      if (p.returned_home && p.end_type === '조기') return result({ status: '대상 아님', why: '보호 조기종료 뒤 원가정 복귀' });
      if (p.other_law_allowance) return result({ status: '대상 아님', why: '다른 법령으로 자립수당 등을 받는 중' });
      if (months(p.care_start, p.end_date) < r.care_min_months) return result({ status: '대상 아님', why: '보호종료 달 기준 2년 이상 연속 보호가 아님' });
      if (p.end_type === '조기') {
        const eighteen = years(p.birth, 18);
        if (p.end_date < years(p.birth, 15)) return result({ status: '대상 아님', why: '만 15세가 되기 전에 보호가 끝남' });
        if (eighteen < r.early_end_18th_after) return result({ status: '대상 아님', why: '2024-02-09 전에 만 18세가 됨(조기종료 기준 적용 전)' });
        if (today > years(eighteen, r.within_years_after_end)) return result({ status: '대상 아님', why: '만 18세가 된 날부터 5년이 지남' });
        if (today < eighteen) return result({ status: '기다림', why: '만 18세가 되면 신청', open: eighteen });
        return result({ status: '대상', open: eighteen, deadline: null, lost_won: null, check: B.allowance.open_questions[0] });
      }
      if (p.end_date < r.end_after + '-01') return result({ status: '대상 아님', why: '2018년 8월 전에 보호종료' });
      if (today > years(p.end_date, r.within_years_after_end)) return result({ status: '대상 아님', why: '보호종료 뒤 5년이 지남' });
      const open = shift(p.end_date, -r.pre_apply_days), deadline = shift(p.end_date, r.retro_days - 1);
      const res = result({ status: '대상', open, deadline });
      if (p.apply_date) {
        if (p.apply_date > years(p.end_date, r.within_years_after_end)) return { ...res, status: '신청 기간 지남', why: '신청하려는 날이 보호종료 뒤 5년을 넘음', lost_months: 60, lost_won: 60 * B.allowance.amount_won };
        if (p.apply_date < open) res.warn = `${open}부터 신청할 수 있음`;
        const start = (p.apply_date <= deadline ? p.end_date : p.apply_date).slice(0, 7);
        const lost = months(p.end_date, start);
        Object.assign(res, { pay_from: start, lost_months: lost, lost_won: lost * B.allowance.amount_won });
      }
      return res;
    }
    function settle(p, today) {
      const s = B.settle, out = { id: 'settle', name: '자립정착금' };
      const result = more => ({ ...out, ...more });
      if (p.still_in_care) return result({ status: '아직 보호 중', why: '보호가 끝난 뒤 신청' });
      if (p.settle_received) return result({ status: '이미 받음', why: '재지급·증액분 추가 지급 없음' });
      if (p.end_type === '조기' && p.birth && p.end_date < years(p.birth, 15)) return result({ status: '대상 아님', why: '만 15세가 되기 전에 보호가 끝남' });
      if (today > years(p.end_date, 5)) return result({ status: '대상 아님', why: '보호종료 뒤 5년이 지남' });
      if (p.returned_home && p.end_type === '조기') return result({ status: '확인 필요', why: '원가정 복귀는 원칙상 제외, 지자체 판단으로 지급 가능', check: `${p.region}에서 원가정 복귀 뒤에도 자립정착금을 받을 수 있나요?` });
      const reg = s.by_region[p.region];
      if (!reg) return result({ status: '대상', amount_won: null, range_won: s.other_region.amount_range_won, check: `${p.region} 자립정착금은 얼마인가요?` });
      return result({ status: '대상', amount_won: reg.amount_won, split: reg.split, basis: reg.status });
    }
    function jeonse(p, today) {
      const j = B.jeonse, out = { id: 'jeonse', name: j.name };
      const result = more => ({ ...out, ...more });
      if (p.still_in_care) return result({ status: '아직 보호 중', why: '퇴소 뒤 신청' });
      if (today > years(p.end_date, j.rules.within_years_after_end)) return result({ status: '대상 아님', why: '퇴소 뒤 5년이 지남' });
      if (p.returned_home) return result({ status: '확인 필요', why: '원가정 복귀한 경우 대상인지 원문에 없음', check: '조기 보호종료 뒤 원가정에 돌아간 경우도 자립준비청년 전세임대를 신청할 수 있나요?' });
      const area = data.regions_area[p.region] || '기타지역';
      return result({ status: '대상', area, limit_won: j.by_area[area].limit_won, check: '혼인 중이 아니고 집이 없어야 해요. 이 두 가지는 입력받지 않았어요.' });
    }
    function housingCompare(c) {
      const r = B.jeonse.rules;
      const rent = c.age <= 22 ? 0 : Math.round((c.b_jeonse - r.self_deposit_won) * r.rent_rate_range[0] / 12 * .5);
      const a = Array.from({ length: 12 }, (_, i) => c.a_rent + (i === 0 ? c.a_deposit : 0));
      const b = Array.from({ length: 12 }, (_, i) => i < c.b_wait_months ? c.b_wait_cost : rent + c.b_upkeep + (i === c.b_wait_months ? r.self_deposit_won : 0));
      const result = {};
      for (const [name, housing] of [['민간 월세', a], ['전세임대', b]]) {
        for (const delay of [0, 2]) {
          let balance = c.start_balance;
          const flow = housing.map((cost, i) => {
            let inflow = i < delay ? 0 : B.allowance.amount_won * (i === delay ? c.allowance_back_months + 1 + delay : 1);
            for (const [when, amount] of c.settle) if (when + delay === i) inflow += amount;
            balance += c.wage + inflow - c.living - cost;
            return { month: iso(new Date(Date.UTC(2026, 11 + i, 1))).slice(0, 7), in: inflow, housing: cost, balance };
          });
          result[`${name}·${delay ? '2달 늦게' : '제때'}`] = { min: Math.min(...flow.map(f => f.balance)), end: balance, flow };
        }
      }
      return result;
    }
    return { allowance, settle, jeonse, plan: (p, today) => [allowance(p, today), settle(p, today), jeonse(p, today)], housingCompare };
  }
  root.CalendarEngine = { create, shift, years, months, days: (a, b) => Math.round((date(b) - date(a)) / DAY) };
})(globalThis);
