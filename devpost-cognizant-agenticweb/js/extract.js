// extract.js - deterministic reading of a denial notice. No model, no network.
// Finds the four fields that may leave the browser (plan type, notice date, reason
// category, urgent) and builds a redaction table for everything that must not.
// Apache-2.0.

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MON_ABBR = MONTHS.map((m) => m.slice(0, 3));

const DATE_RE = /(\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b|\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}\b|\b\d{4}-\d{2}-\d{2}\b)/i;

/** Parse one date string into {y,m,d} (m is 1-12) or null. Rejects impossible dates. */
export function parseDate(text) {
  if (!text) return null;
  const s = String(text).trim();
  let m;
  let y; let mo; let d;
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
  else if ((m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/))) { mo = +m[1]; d = +m[2]; y = +m[3]; }
  else if ((m = s.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/))) {
    const name = m[1].toLowerCase();
    const idx = MONTHS.indexOf(name) >= 0 ? MONTHS.indexOf(name) : MON_ABBR.indexOf(name.slice(0, 3));
    if (idx < 0) return null;
    mo = idx + 1; d = +m[2]; y = +m[3];
  } else return null;
  const probe = new Date(Date.UTC(y, mo - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== mo - 1 || probe.getUTCDate() !== d) return null;
  if (y < 2000 || y > 2100) return null;
  return { y, m: mo, d };
}

export function isoDate(dt) {
  return `${String(dt.y).padStart(4, "0")}-${String(dt.m).padStart(2, "0")}-${String(dt.d).padStart(2, "0")}`;
}

function findNoticeDate(text) {
  const labelled = text.match(/(?:date of (?:this )?notice|notice date|date of letter|letter date|date issued|date mailed|date)\s*[:\-]\s*([^\n]+)/gi) || [];
  for (const line of labelled) {
    if (/birth|dob|service|received|admission|discharge/i.test(line)) continue;
    const found = line.match(DATE_RE);
    const parsed = found && parseDate(found[1]);
    if (parsed) return parsed;
  }
  return null;
}

const REASONS = [
  { id: "medical_necessity", label: "Not medically necessary", re: /medical(?:ly)? necessa|medical necessity|not necessary for/i },
  { id: "out_of_network", label: "Out-of-network provider", re: /out[- ]of[- ]network|non[- ]participating|not a participating|non[- ]par\b/i },
  { id: "no_prior_auth", label: "No prior authorization", re: /prior auth|pre[- ]?authori[sz]|precertification|pre[- ]?cert\b|referral was not/i },
  { id: "benefit_exclusion", label: "Service not covered by the plan", re: /not a covered|not covered|exclu(?:sion|ded)|benefit (?:limit|maximum)|experimental|investigational/i },
  { id: "missing_documents", label: "Missing information or documents", re: /additional information|missing|incomplete|did not receive (?:the )?(?:requested|records|documentation)|documentation (?:was )?(?:not|insufficient)/i },
];
export const REASON_LABELS = Object.fromEntries(REASONS.map((r) => [r.id, r.label]));

function findReason(text) {
  const line = (text.match(/(?:reason|denial reason|why we denied)[^\n:]{0,25}:\s*([^\n]+(?:\n(?!\s*\n)[^\n]+)?)/i) || [])[1];
  const scopes = line ? [line, text] : [text];
  for (const scope of scopes) for (const r of REASONS) if (r.re.test(scope)) return r.id;
  return null;
}

/** Read the notice. Returns plain facts; every guess is separate from the redaction table. */
export function extractNotice(text) {
  const t = String(text || "");
  const noticeDate = findNoticeDate(t);
  const planName = ((t.match(/^[ \t]*plan(?: name)?[ \t]*:[ \t]*([^\n]{3,80})/im) || [])[1] || "").trim() || null;
  const erisaText = /subject to (?:the )?(?:employee retirement income security act|erisa)|\bERISA\b/i.test(t);
  const selfFunded = /self[- ](?:funded|insured)/i.test(t);
  const employer = /employer|group health plan|group plan|your (?:job|employer)/i.test(t);
  const marketplace = /marketplace|healthcare\.gov|individual (?:market|plan|coverage)|exchange plan/i.test(t);
  const medicareAdvantage = /medicare advantage|organization determination|part c\b|\bMA plan\b|reconsideration/i.test(t);
  let planType = null;
  if (medicareAdvantage) planType = "ma";
  else if (erisaText || (selfFunded && employer)) planType = "erisa";
  else if (marketplace) planType = "aca";
  const urgentCue = /urgent|expedited|ongoing treatment|serious(?:ly)? jeopardi[sz]|delay (?:in|of) (?:care|treatment)|life[- ]threatening/i.test(t);
  return {
    plan_type: planType,
    notice_date: noticeDate ? isoDate(noticeDate) : null,
    reason_category: findReason(t),
    urgent: urgentCue,
    plan_name: planName,
    signals: { erisaText, selfFunded, employer, marketplace, medicareAdvantage },
  };
}

// ---- redaction ---------------------------------------------------------------

const ICD10 = /\b[A-TV-Z][0-9][0-9AB]\.[0-9A-TV-Z]{1,4}\b/g;
const PHONE = /(?:\+?1[ .-]?)?\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/g;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const SSN = /\b\d{3}-\d{2}-\d{4}\b/g;
const STREET = /\b\d{1,6}\s+(?:[A-Z][A-Za-z0-9.]*\s+){1,4}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place|Pkwy|Parkway)\b\.?(?:[ ,]+(?:Apt|Unit|Suite|Ste|#)\s*[A-Za-z0-9-]+)?/g;
const CITY_ZIP = /\b[A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)?,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g;
const LABELLED = [
  { kind: "MEMBER ID", re: /(?:member|subscriber|policy|group member|insured)\s*(?:id|number|no\.?|#)\s*[:#]?\s*([A-Z0-9][A-Z0-9-]{4,})/gi },
  { kind: "CLAIM NUMBER", re: /claim\s*(?:id|number|no\.?|#)\s*[:#]?\s*([A-Z0-9][A-Z0-9-]{4,})/gi },
  { kind: "DATE OF BIRTH", re: /(?:date of birth|dob|birth ?date)\s*[:\-]?\s*([^\n]+)/gi, dateOnly: true },
  { kind: "CPT CODE", re: /(?:cpt|hcpcs|procedure code)s?(?:\s*code)?\s*[:#]?\s*([A-Z]?\d{4,5}[A-Z]?)/gi },
  { kind: "NAME", re: /(?<![Pp]lan )(?<![Pp]rovider )(?:[Pp]atient|[Mm]ember name|[Ss]ubscriber name|[Cc]laimant|[Nn]ame|[Dd]ear)[ \t]*[:,\-]?[ \t]+((?:Mr\.|Ms\.|Mrs\.|Dr\.)?[ \t]*[A-Z][a-z'’-]+(?:[ \t]+[A-Z]\.)?(?:[ \t]+[A-Z][a-z'’-]+){0,2})/g },
  { kind: "DIAGNOSIS CODE", re: /(?:diagnosis|dx|icd-?10)\s*(?:code)?s?\s*[:#]?\s*([A-TV-Z][0-9][0-9AB](?:\.[0-9A-TV-Z]{1,4})?)/gi },
];
const NAME_STOP = new Set(["Member", "Patient", "Plan", "Date", "Claim", "Reason", "Provider", "Notice", "Appeals", "Customer", "Service", "Sincerely", "Regards", "Hello", "Name"]);

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/**
 * Build the redaction table: every private value found, with its kind. The table stays in
 * the browser. redact() uses it to replace each value by a tag such as [NAME].
 */
export function buildRedactionTable(text) {
  const t = String(text || "");
  const found = new Map();
  const add = (kind, value) => {
    const v = String(value || "").trim().replace(/[.,;]+$/, "");
    if (v.length < 2 || NAME_STOP.has(v)) return;
    if (!found.has(v)) found.set(v, kind);
  };
  for (const spec of LABELLED) {
    for (const m of t.matchAll(spec.re)) {
      let v = m[1];
      if (spec.dateOnly) { const d = v.match(DATE_RE); v = d ? d[1] : v.split(/\s{2,}/)[0]; }
      if (spec.kind === "NAME") {
        v = v.replace(/^(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s*/, "");
        v = v.split(/\s+/).filter((w) => !NAME_STOP.has(w)).join(" ");
      }
      add(spec.kind, v);
    }
  }
  for (const m of t.matchAll(ICD10)) add("DIAGNOSIS CODE", m[0]);
  for (const m of t.matchAll(PHONE)) add("PHONE", m[0]);
  for (const m of t.matchAll(EMAIL)) add("EMAIL", m[0]);
  for (const m of t.matchAll(SSN)) add("SSN", m[0]);
  for (const m of t.matchAll(STREET)) add("ADDRESS", m[0]);
  for (const m of t.matchAll(CITY_ZIP)) add("ADDRESS", m[0]);
  // A name found once is hidden everywhere, including each separate word of 2+ words (first/last).
  for (const [v, kind] of [...found]) {
    if (kind === "NAME") for (const w of v.split(/\s+/)) if (w.length > 2 && !NAME_STOP.has(w) && /^[A-Z]/.test(w)) add("NAME", w);
  }
  return [...found.entries()].map(([value, kind]) => ({ value, kind })).sort((a, b) => b.value.length - a.value.length);
}

/** Replace every value of the table in text with its tag. Longest values first. */
export function redact(text, table) {
  let out = String(text || "");
  for (const { value, kind } of table) {
    out = out.replace(new RegExp(esc(value), "gi"), `[${kind}]`);
  }
  return out;
}

/** The four fields allowed to leave the browser, and nothing else. */
export const SLY_ALLOWED = ["plan_type", "notice_date", "reason_category", "urgent"];
export function slyData(facts) {
  const out = {};
  for (const k of SLY_ALLOWED) if (facts[k] !== null && facts[k] !== undefined) out[k] = facts[k];
  return out;
}
