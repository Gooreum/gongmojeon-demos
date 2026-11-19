// rules.js - the built-in fallback rules. Same numbers as the rule peers (rules/rules.json),
// used only when the visitor declines to contact a rule publisher.
// Apache-2.0.
let cache = null;
export async function loadBuiltInRules() {
  if (cache) return cache;
  const resp = await fetch(new URL("../rules/rules.json", import.meta.url));
  if (!resp.ok) throw new Error(`rules.json ${resp.status}`);
  cache = (await resp.json()).rulesets;
  return cache;
}
export const PEER_FOR = { aca: "aca_appeal_rules", erisa: "erisa_claims_rules", ma: "medicare_advantage_rules" };
export const PLAN_SHORT = { aca: "ACA plan", erisa: "Employer plan (ERISA)", ma: "Medicare Advantage" };
