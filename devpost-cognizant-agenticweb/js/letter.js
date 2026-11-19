// letter.js - the appeal letter template. Every sentence carries the rule it rests on,
// or none. Personal details stay as [placeholders] that the visitor fills in.
// Apache-2.0.
import { REASON_LABELS, parseDate } from "./extract.js";
import { longDate } from "./deadlines.js";

const REASON_SENTENCE = {
  medical_necessity: "The notice says the service is not medically necessary. I ask the plan to review all the medical records and to have the review done by a health professional who was not involved in the first decision.",
  out_of_network: "The notice says the provider is out of network. I ask the plan to review whether the care was available in network and to reconsider the claim.",
  no_prior_auth: "The notice says prior authorization was missing. I ask the plan to review the facts around the approval request and to reconsider the claim.",
  benefit_exclusion: "The notice says the service is not covered by my plan. I ask the plan to show the plan language it relied on and to reconsider the claim.",
  missing_documents: "The notice says information was missing. I will send what the plan needs, and I ask the plan to reconsider the claim once it has it.",
};

/**
 * @param facts   {plan_type, notice_date, reason_category, urgent, plan_name}
 * @param rules   one ruleset (appeal_rules table)
 * @param opts    {verified: boolean}  when false each citation gets a "check" mark
 * @returns paragraphs: [{id, sentences:[{id, text, cite:string|null, url:string|null}]}]
 */
export function buildLetter(facts, rules, opts = {}) {
  const S = (id, text, cite = null, url = null) => ({ id, text, cite, url: cite ? (url || rules.ecfr_url) : null });
  const d = parseDate(facts.notice_date);
  const dateText = d ? longDate(d).replace(/^[A-Za-z]+, /, "") : "[date on the notice]";
  const plan = facts.plan_name || "[Plan name]";
  const paras = [];
  paras.push({ id: "from", sentences: [S("from1", "[Your name]\n[Your address]\n[Phone or email]\n[Today's date]")] });
  paras.push({ id: "to", sentences: [S("to1", `Appeals Department\n${plan}\n[Plan address from the notice]`)] });
  const recon = rules.appeal_name === "reconsideration";
  paras.push({ id: "re", sentences: [S("re1", `Re: ${recon ? "Request for reconsideration of an organization determination" : "Appeal of adverse benefit determination"}\nClaim number: [Claim number]   Member ID: [Member ID]\nNotice dated: ${dateText}`)] });
  paras.push({ id: "open", sentences: [
    S("open1", recon ? "I am writing to ask the plan to reconsider the denial described in the notice above." : "I am writing to appeal the denial described in the notice above and to ask for a full and fair review."),
    S("open2", `I am filing within the ${rules.internal_appeal_filing_days} days that a health plan must allow for ${recon ? "a reconsideration request" : "an appeal"}.`, rules.internal_appeal_filing_cite, rules.internal_appeal_filing_url),
  ] });
  const why = REASON_SENTENCE[facts.reason_category];
  paras.push({ id: "why", sentences: [
    S("why1", why || "[Say in your own words why you think the plan should pay. The notice reason could not be read automatically.]"),
    S("why2", `Please decide this ${recon ? "reconsideration" : "appeal"} without deferring to the first decision.`, rules.other_cites?.full_review?.cite || null, rules.other_cites?.full_review ? "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XXV/part-2560/section-2560.503-1" : null),
  ] });
  const docs = rules.documents_you_can_request || [];
  paras.push({ id: "docs", sentences: [
    S("docs0", "Please send me the following, free of charge:"),
    ...docs.map((x, i) => S(`docs${i + 1}`, `- ${x.label}.`, x.cite, x.ecfr_url)),
  ] });
  if (facts.urgent) {
    paras.push({ id: "urgent", sentences: [
      S("urg1", `My doctor believes that waiting could seriously harm my health. I ask for an expedited decision, within ${rules.urgent_decision_hours} hours.`, rules.urgent_decision_cite),
    ] });
  }
  const cont = rules.other_cites?.continued_coverage;
  if (cont) paras.push({ id: "cont", sentences: [S("cont1", "Please keep my coverage of this care in place while the appeal is decided.", cont.cite)] });
  paras.push({ id: "ext", sentences: [
    rules.external_review_automatic
      ? S("ext1", "If the plan upholds its denial, I understand it must send my case to the independent reviewer. Please confirm in writing the date it was sent.", rules.external_review_cite, rules.external_review_url)
      : S("ext1", `If this appeal is denied, I plan to ask for an external review within ${rules.external_review_request_months} months of the final decision.`, rules.external_review_cite),
  ] });
  paras.push({ id: "close", sentences: [S("close1", "Thank you for your prompt reply.\n\nSincerely,\n[Your name]")] });
  return paras.map((p) => ({ ...p, sentences: p.sentences.map((s) => ({ ...s, check: !!(s.cite && opts.verified === false) })) }));
}

export function letterAsText(paras) {
  return paras.map((p) => p.sentences.map((s) => s.text).join("\n")).join("\n\n");
}

export { REASON_LABELS };
