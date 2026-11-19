// deadlines.js - calendar arithmetic for the appeal deadline list. Pure functions.
// Numbers come from the rule table that the caller passes in (rules.json or a rule peer).
// Apache-2.0.
import { parseDate, isoDate } from "./extract.js";

const DAY = 86400000;

export function addDays(dt, n) {
  const ms = Date.UTC(dt.y, dt.m - 1, dt.d) + n * DAY;
  const r = new Date(ms);
  return { y: r.getUTCFullYear(), m: r.getUTCMonth() + 1, d: r.getUTCDate() };
}

/** Add whole months; a day that does not exist in the target month falls to its last day. */
export function addMonths(dt, n) {
  const idx = dt.y * 12 + (dt.m - 1) + n;
  const y = Math.floor(idx / 12);
  const m = (idx % 12) + 1;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { y, m, d: Math.min(dt.d, last) };
}

export function daysBetween(a, b) {
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / DAY);
}

const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function longDate(dt) {
  const wd = WD[new Date(Date.UTC(dt.y, dt.m - 1, dt.d)).getUTCDay()];
  return `${wd}, ${MN[dt.m - 1]} ${dt.d}, ${dt.y}`;
}

/**
 * Build the deadline list.
 * @param rules   one ruleset (appeal_rules table)
 * @param noticeIso  ISO date of the denial notice, or null when not found
 * @param opts    {urgent, finalDecisionIso, todayIso}
 * @returns array of rows {id, label, date|null, dateText, note, cite, ecfr_url, daysLeft|null, overdue}
 */
export function buildDeadlines(rules, noticeIso, opts = {}) {
  const notice = parseDate(noticeIso);
  const today = parseDate(opts.todayIso) || null;
  const rows = [];
  const mk = (row) => {
    if (row.date && today) { row.daysLeft = daysBetween(today, row.date); row.overdue = row.daysLeft < 0; }
    else { row.daysLeft = null; row.overdue = false; }
    row.dateText = row.date ? longDate(row.date) : row.dateText;
    row.dateIso = row.date ? isoDate(row.date) : null;
    rows.push(row);
  };
  if (opts.urgent) {
    mk({ id: "urgent", label: "Urgent care: ask for an expedited decision", date: null, dateText: `Decision due within ${rules.urgent_decision_hours} hours of receipt`, note: "Ask your doctor to confirm that waiting could seriously harm your health, then call your plan and ask for an expedited review in writing.", cite: rules.urgent_decision_cite, ecfr_url: rules.ecfr_url });
  }
  const offset = rules.receipt_presumed_days_after_notice || 0;
  const appealWord = rules.appeal_name === "reconsideration" ? "reconsideration request" : "internal appeal";
  if (notice) {
    mk({ id: "internal", label: `Last day to file your ${appealWord}`, date: addDays(notice, rules.internal_appeal_filing_days + offset), note: offset ? `${rules.internal_appeal_filing_days} days counted from receipt. The plan presumes you received the notice ${offset} days after its date, so the count starts ${offset} days after the date on the notice.` : `${rules.internal_appeal_filing_days} days counted from the date on the notice. If you received it later, the plan's count starts at receipt, but file by this date to be safe.`, cite: rules.internal_appeal_filing_cite, ecfr_url: rules.internal_appeal_filing_url || rules.ecfr_url });
  } else {
    mk({ id: "internal", label: `Last day to file your ${appealWord}`, date: null, dateText: "Enter the notice date to see it", note: `${rules.internal_appeal_filing_days} days after you receive the notice.`, cite: rules.internal_appeal_filing_cite, ecfr_url: rules.internal_appeal_filing_url || rules.ecfr_url, needsDate: true });
  }
  mk({ id: "decision", label: "Plan's answer to your appeal", date: null, dateText: `${rules.decision_days_preservice} days (care not yet received) or ${rules.decision_days_postservice} days (care already received)`, note: `Counted from the day the plan receives your ${appealWord}.${rules.decision_days_part_b_drug ? ` A Part B drug takes ${rules.decision_days_part_b_drug} days.` : ""}`, cite: rules.decision_days_cite, ecfr_url: rules.ecfr_url });
  const fin = parseDate(opts.finalDecisionIso);
  if (rules.external_review_automatic) {
    mk({ id: "external", label: "Outside review", date: null, dateText: "Automatic. You do not file anything", note: "If the plan upholds its denial, it must send your case to an independent reviewer that has a contract with CMS.", cite: rules.external_review_cite, ecfr_url: rules.external_review_url || rules.ecfr_url });
  } else if (fin) {
    mk({ id: "external", label: "Last day to ask for external review", date: addMonths(fin, rules.external_review_request_months), note: `${rules.external_review_request_months} months from the day you received the final decision.`, cite: rules.external_review_cite, ecfr_url: rules.ecfr_url });
  } else {
    mk({ id: "external", label: "Last day to ask for external review", date: null, dateText: `${rules.external_review_request_months} months after you receive the final decision`, note: "The date is not known yet. Enter the day the plan's decision arrived to see it.", cite: rules.external_review_cite, ecfr_url: rules.ecfr_url, needsFinal: true });
  }
  return rows;
}

/** Plain text of the list, for the Copy button. No markup. */
export function deadlinesAsText(rows) {
  return rows.map((r) => `${r.label}: ${r.dateText}${r.cite ? ` (${r.cite})` : ""}`).join("\n");
}
