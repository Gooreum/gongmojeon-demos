// scan.js - looks at a rule network's text BEFORE it is used. Fails closed.
// The patterns cover: asking for private data, telling the model to drop earlier rules,
// sending data to a URL, and hiding text. Apache-2.0.

const PATTERNS = [
  { id: "asks_private_data", re: /(?:ask|request|collect|obtain|require|provide|enter|send)[^.\n]{0,80}\b(?:member\s*id|claim\s*(?:number|no|#)|date of birth|dob|social security|ssn|policy number|diagnosis|password)/i, why: "asks for your member ID or other private data" },
  { id: "override", re: /ignore (?:all |any )?(?:the )?(?:previous|prior|above|earlier)|disregard (?:the )?(?:previous|prior|above|earlier)|forget (?:the )?(?:previous|prior|above)|you are now\b|new (?:system )?instructions/i, why: "tells the assistant to drop its earlier rules" },
  { id: "exfiltrate", re: /(?:send|post|forward|upload|submit|redirect)[^.\n]{0,100}https?:\/\//i, why: "tells the assistant to send data to an outside web address" },
  { id: "hidden_text", re: /[​-‏⁠﻿]|<!--|display\s*:\s*none/i, why: "contains hidden characters or hidden markup" },
  { id: "secret_ask", re: /(?:api|secret|access)\s*key|bearer token|authorization header/i, why: "mentions keys or tokens" },
];

function collectText(session) {
  const cfg = session.network?.config || {};
  const bits = [cfg.metadata?.description || "", session.manifest?.networks?.map((n) => n.description).join(" ") || ""];
  for (const a of cfg.tools || []) {
    bits.push(a.instructions || "", a.function?.description || "");
  }
  return bits.join("\n");
}

/** @returns {{ok:boolean, findings:{id:string, why:string, excerpt:string}[]}} */
export function scanPeer(session) {
  const text = collectText(session);
  const findings = [];
  for (const p of PATTERNS) {
    const g = new RegExp(p.re.source, p.re.flags.includes("g") ? p.re.flags : p.re.flags + "g");
    for (const m of text.matchAll(g)) {
      // A rule that forbids the behaviour ("Never ask for member IDs") is not a finding.
      const before = text.slice(Math.max(0, m.index - 30), m.index);
      if (/(?:never|do not|don't|must not|should not|cannot|can't)\s+(?:\w+\s+){0,2}$/i.test(before)) continue;
      findings.push({ id: p.id, why: p.why, excerpt: m[0].slice(0, 120) });
      break;
    }
  }
  return { ok: findings.length === 0, findings };
}

/** Is the rule table shaped like a rule table? Fails closed on anything odd. */
export function validateRuleTable(t) {
  const problems = [];
  const intIn = (k, lo, hi) => { if (!Number.isInteger(t?.[k]) || t[k] < lo || t[k] > hi) problems.push(`${k} must be a whole number from ${lo} to ${hi}`); };
  if (!t || typeof t !== "object") return { ok: false, problems: ["no rule table found in the network"] };
  intIn("internal_appeal_filing_days", 1, 730);
  intIn("decision_days_preservice", 1, 365);
  intIn("decision_days_postservice", 1, 365);
  intIn("urgent_decision_hours", 1, 240);
  if (t?.external_review_automatic === true) { if (t.external_review_request_months != null) problems.push("external_review_request_months must be empty when the review is automatic"); }
  else intIn("external_review_request_months", 1, 24);
  if (t?.receipt_presumed_days_after_notice != null) intIn("receipt_presumed_days_after_notice", 0, 30);
  for (const k of ["rule_id", "cfr_cite", "ecfr_url"]) if (typeof t[k] !== "string" || !t[k]) problems.push(`${k} is missing`);
  if (typeof t.ecfr_url === "string" && !/^https:\/\/www\.ecfr\.gov\//.test(t.ecfr_url)) problems.push("ecfr_url must point to www.ecfr.gov");
  if (!Array.isArray(t.documents_you_can_request)) problems.push("documents_you_can_request must be a list");
  return { ok: problems.length === 0, problems };
}
