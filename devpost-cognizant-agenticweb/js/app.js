// app.js - the Appeal Desk screen. Deterministic: no model is needed for anything on the page.
// The official runtime loads and checks the rule networks (resolveRemote, consent, allowed_peers);
// this file asks for them, reads their rule table, and draws the results. Apache-2.0.
import { extractNotice, buildRedactionTable, redact, REASON_LABELS, SLY_ALLOWED } from "./extract.js";
import { buildDeadlines, deadlinesAsText, longDate } from "./deadlines.js";
import { todayIso as clockToday } from "./clock.js";
import { buildLetter, letterAsText } from "./letter.js";
import { SAMPLES } from "./samples.js";
import { scanPeer, validateRuleTable } from "./scan.js";
import { loadBuiltInRules, PEER_FOR, PLAN_SHORT } from "./rules.js";
import { Page, OPTIONAL_PARAGRAPHS } from "./state.js";
import { parseDate, isoDate } from "./extract.js";

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
};
const clear = (el) => { el.textContent = ""; return el; };

// ---------- peers.config.json (where the rule networks live) ----------
let PEERS = null;
async function loadPeers() {
  if (PEERS) return PEERS;
  const cfg = await (await fetch(new URL("../peers.config.json", import.meta.url))).json();
  const links = await (await fetch(new URL("../links.json", import.meta.url))).json();
  PEERS = { urls: cfg.sets[cfg.active], labels: cfg.labels, testOnly: (cfg.test_only || []).map((k) => cfg.sets[cfg.active][k]), links: Object.values(links?.networks?.appeal_desk || {}) };
  return PEERS;
}
const hostOf = (u) => { try { return new URL(u).host; } catch { return String(u); } };

// ---------- engine ----------
let engine = null;
const engineReady = new Promise((resolve) => {
  if (window.__appealEngine) { engine = window.__appealEngine; resolve(engine); return; }
  window.addEventListener("appeal-engine", (e) => { engine = e.detail; resolve(engine); }, { once: true });
  setTimeout(() => resolve(null), 20000);
});

// ---------- exact address gate ----------
// The runtime's allowed_peers list is per origin. On a shared host such as jsDelivr that is every
// repository on the host, so Appeal Desk also refuses any address that is not exactly one it lists:
// the bindings in links.json, plus the two test-only copies used by the buttons in "Rule networks are checked".
let gateInstalled = false;
async function installExactGate() {
  if (!engine || gateInstalled) return;
  gateInstalled = true;
  const peers = await loadPeers();
  const exact = new Set([...peers.links, ...peers.testOnly].map((u) => new URL(u).href));
  const original = engine.resolveRemote.bind(engine);
  engine.resolveRemote = async (ref, chain, span, manifest) => {
    const target = new URL(ref, `${engine.top.base}/`);
    const origins = ((manifest || engine.top.manifest)?.allowed_peers || []).map((o) => { try { return new URL(o).origin; } catch { return o; } });
    if (origins.includes(target.origin) && !exact.has(target.href)) {
      throw Object.assign(new Error(`Not listed: ${target.href} is on an allowed host but is not one of the exact addresses in links.json.`), { code: "NOT_LISTED" });
    }
    return original(ref, chain, span, manifest);
  };
}

// ---------- the "what was sent" panel ----------
const net = () => window.__appealNet || [];
function renderCounters() {
  const peerOrigins = new Set(((engine?.top?.manifest?.allowed_peers) || []).map((o) => { try { return new URL(o).origin; } catch { return o; } }));
  const modelReqs = net().filter((r) => /\/chat\/completions/.test(r.url)).length + localModelRuns;
  const peerBytes = net().filter((r) => peerOrigins.has(r.origin)).reduce((n, r) => n + r.bytes, 0);
  $("#c-model").textContent = String(modelReqs);
  $("#c-peer").textContent = String(peerBytes);
}
let localModelRuns = 0;
window.addEventListener("appeal-net", renderCounters);
function log(text, kind = "info") {
  const li = h("li", { class: `log-${kind}` }, text);
  $("#log").prepend(li);
  while ($("#log").children.length > 40) $("#log").lastChild.remove();
  renderCounters();
}

// ---------- consent (inline card, through the runtime's own consent path) ----------
let pageConsent = null; // set while the page itself is asking
function installConsent() {
  if (!engine || engine.__appealConsentInstalled) return;
  const previous = engine.onConsent;
  engine.onConsent = (info) => {
    if (pageConsent) return pageConsent(info);
    return previous ? previous(info) : "allow";
  };
  engine.__appealConsentInstalled = true;
}
function askConsent(label, url, purpose) {
  const slot = clear($("#consent-slot"));
  return new Promise((resolve) => {
    const card = h("section", { class: "card consent", role: "group", "aria-labelledby": "consent-h" },
      h("h2", { id: "consent-h", tabindex: "-1" }, "Load rules from another website?"),
      h("p", {}, h("b", {}, label), " is published at ", h("code", {}, hostOf(url)), "."),
      h("p", {}, purpose),
      h("ul", { class: "facts" },
        h("li", {}, "Your browser asks for the rule file. It sends nothing from your notice."),
        h("li", {}, "The rules are checked for hidden instructions before any number is used."),
        h("li", {}, "If you decline, the built-in rules are used, with a warning.")),
      h("div", { class: "actions" },
        h("button", { type: "button", class: "primary", "data-consent": "allow" }, "Allow"),
        h("button", { type: "button", class: "ghost", "data-consent": "decline" }, "Decline")));
    slot.append(card);
    $("#consent-h", card).focus();
    card.addEventListener("click", (e) => {
      const d = e.target.closest("[data-consent]")?.dataset.consent;
      if (!d) return;
      clear(slot);
      resolve(d);
    });
    card.scrollIntoView?.({ block: "nearest" });
  });
}

// ---------- readable error cards ----------
function errorCard(kind, err, extra = {}) {
  const msg = String(err?.message || err || "");
  const code = err?.code;
  let title, what, did;
  if (extra.title) { title = extra.title; what = extra.what; did = extra.did; }
  else if (code === "COMPOSITION_CYCLE") {
    title = "This rule network points back to a network already in use";
    what = "Following it would loop forever, so the runtime stopped at the first repeat.";
    did = "Nothing was loaded and nothing was sent.";
  } else if (code === "COMPOSITION_DEPTH") {
    title = "Too many rule networks in a chain";
    what = "Each network may call only so many others. This chain went past the limit.";
    did = "The chain was stopped. Nothing was sent.";
  } else if (code === "NOT_LISTED") {
    title = "This address is not one of the listed rule networks";
    what = "Appeal Desk loads a rule network only from an exact address that it lists. Other pages on the same website are refused, even when the website itself is allowed.";
    did = "The request was refused before any connection was made.";
  } else if (/allowed_peers|Policy:/.test(msg)) {
    title = "This website is not on the list this site may contact";
    what = "Appeal Desk only contacts the rule publishers it lists in its public manifest (allowed_peers). This address is not listed.";
    did = "The request was refused before any connection was made.";
  } else if (/JSON|Unexpected|parse|valid|No published network|network/i.test(msg) && kind === "broken") {
    title = "This rule file is damaged";
    what = "The file could not be read as a rule network, so its rules cannot be trusted.";
    did = "It was not used. Your notice was not sent anywhere.";
  } else {
    title = "The rules could not be loaded";
    what = "The rule network did not answer in a usable way.";
    did = "The built-in rules are available instead. Your notice was not sent anywhere.";
  }
  return h("section", { class: "card error", role: "alert" },
    h("h3", {}, title),
    h("dl", { class: "kv" },
      h("dt", {}, "What happened"), h("dd", {}, what),
      h("dt", {}, "What Appeal Desk did"), h("dd", {}, did),
      extra.detail ? [h("dt", {}, "Detail"), h("dd", {}, extra.detail)] : null));
}
function showError(card, slot = "#error-slot") { const el = clear($(slot)); el.append(card); }

// ---------- loading a rule peer ----------
async function loadPeer(url, label, purpose) {
  await engineReady;
  if (!engine) throw Object.assign(new Error("The rule loader did not start."), { code: "NO_ENGINE" });
  installConsent();
  const decision = await (async () => {
    pageConsent = (info) => askConsent(label, url, purpose);
    try {
      return await engine.requestConsent({ kind: "network", peerLabel: label, peerOrigin: new URL(url).origin, requestText: purpose });
    } finally { pageConsent = null; }
  })();
  if (decision !== "allow") { log(`You declined ${label}.`, "warn"); return { declined: true }; }
  log(`Asking ${hostOf(url)} for ${label} (no data from your notice).`);
  const chain = [`${engine.top.base}::appeal_desk`];
  const session = await engine.resolveRemote(url, chain, null, engine.top.manifest);
  const scan = scanPeer(session);
  if (!scan.ok) { log(`Blocked ${label}: ${scan.findings[0].why}.`, "bad"); return { blocked: scan, session }; }
  const table = session.network?.config?.metadata?.appeal_rules;
  const valid = validateRuleTable(table);
  if (!valid.ok) { log(`Blocked ${label}: ${valid.problems[0]}.`, "bad"); return { invalid: valid, session }; }
  log(`Loaded ${label} from ${hostOf(url)}. Rule table checked.`, "ok");
  return { rules: table, session };
}

// ---------- state of one run ----------
const run = { facts: null, text: "", sample: false, planKind: null, ruleSets: [], source: null, edits: new Map(), runs: {}, finalDecision: null, manualDate: null, answers: null };

function showStatus(text, kind = "info") {
  const el = clear($("#status-slot"));
  if (text) el.append(h("p", { class: `status ${kind}` }, text));
}

// ---------- analyze ----------
async function analyze() {
  clear($("#error-slot")); clear($("#consent-slot"));
  const text = $("#notice").value.trim();
  if (!text) { showStatus("Paste a notice first, or pick a sample below.", "warn"); $("#notice").focus(); return; }
  run.text = text;
  run.sample = SAMPLES.some((s) => s.text === text);
  run.facts = extractNotice(text);
  run.manualDate = null; run.finalDecision = null; run.edits = new Map();
  showStatus("");
  if (!run.facts.plan_type) { showQuestions(); return; }
  run.planKind = run.facts.plan_type;
  await loadRulesAndShow();
}

function showQuestions() {
  const sec = clear($("#step-questions")); sec.hidden = false; $("#results").hidden = true;
  const ans = { employer: null, erisa: null };
  const mk = (key, q, hint) => h("fieldset", { class: "q" }, h("legend", {}, q), h("p", { class: "hint" }, hint),
    ["yes", "no", "not sure"].map((v) => h("label", { class: "radio" }, h("input", { type: "radio", name: key, value: v, onchange: () => { ans[key] = v; go.disabled = !(ans.employer && ans.erisa); } }), v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure")));
  const go = h("button", { type: "button", class: "primary", disabled: true, onclick: async () => {
    run.answers = ans;
    run.planKind = ans.erisa === "yes" ? "erisa" : (ans.employer === "no" || (ans.employer === "yes" && ans.erisa === "no")) ? "aca" : "both";
    sec.hidden = true;
    await loadRulesAndShow();
  } }, "Continue");
  sec.append(h("h2", { id: "h-q" }, "Which kind of plan is this?"),
    h("p", { class: "hint" }, "The notice does not say. Two questions decide which rules apply. If you are still unsure, you will see both."),
    mk("employer", "Did you get this insurance through an employer?", "Job-based plans are often covered by a federal law called ERISA."),
    mk("erisa", "Does the notice or your card say ERISA, or that the plan is self-funded?", "Look for \"ERISA\", \"self-funded\" or \"self-insured\" on the back of the card or the last page."),
    go);
  $("input", sec)?.focus();
}

const PURPOSE = {
  aca: "Rules for the appeal time limits and the documents you can ask for, for plans under the Affordable Care Act.",
  erisa: "Rules for the appeal time limits and the documents you can ask for, for employer plans under ERISA.",
  ma: "Rules for the reconsideration time limits and the outside review, for Medicare Advantage plans.",
};
async function loadRulesAndShow() {
  const peers = await loadPeers();
  const kinds = run.planKind === "both" ? ["aca", "erisa"] : [run.planKind];
  const built = await loadBuiltInRules();
  const sets = [];
  let source = "peer";
  for (const kind of kinds) {
    const name = PEER_FOR[kind];
    const label = peers.labels[name];
    showStatus(`Waiting for your answer about ${label}.`);
    try {
      const res = await loadPeer(peers.urls[name], label, PURPOSE[kind]);
      showStatus("");
      if (res.rules) { sets.push({ kind, rules: res.rules, from: "peer", label, host: hostOf(peers.urls[name]) }); continue; }
      source = "fallback";
      if (res.blocked || res.invalid) {
        showError(errorCard("blocked", null, { title: "These rules were blocked", what: res.blocked ? `This rule network ${res.blocked.findings[0].why}.` : res.invalid.problems[0], did: "It was not used. The built-in rules are shown instead." }));
      } else {
        showError(h("section", { class: "banner warn", role: "note" }, h("b", {}, "No rule publisher was contacted. "), "These are the built-in rules. They have not been checked against a rule publisher."));
      }
    } catch (err) {
      showStatus("");
      source = "fallback";
      showError(errorCard("rules", err));
      log(`Could not load ${label}: ${String(err.message).slice(0, 90)}`, "bad");
    }
    sets.push({ kind, rules: built[PEER_FOR[kind]], from: "built-in", label: "Built-in rules", host: "this page" });
  }
  run.ruleSets = sets;
  run.source = sets.every((s) => s.from === "peer") ? "peer" : "fallback";
  delete run.runs[run.planKind]; // keep the most recent run last
  run.runs[run.planKind] = { sets };
  render();
}

// ---------- render ----------
const todayIso = clockToday;
function effectiveNoticeDate() { return run.manualDate || run.facts?.notice_date || null; }

function render() {
  const facts = run.facts;
  const primary = run.ruleSets[0];
  const nd = effectiveNoticeDate();
  const rows = run.ruleSets.map((s) => buildDeadlines(s.rules, nd, { urgent: facts.urgent, finalDecisionIso: run.finalDecision, todayIso: todayIso() }));
  const S = Page.s;
  S.hasNotice = true; S.planType = run.planKind === "both" ? null : run.planKind; S.noticeDate = nd; S.reasonCategory = facts.reason_category; S.urgent = !!facts.urgent;
  S.rulesSource = run.source; S.deadlines = rows[0]; S.docs = primary.rules.documents_you_can_request.map((d) => ({ id: d.id, label: d.label }));
  S.checkedDocs = new Set([...S.checkedDocs].filter((id) => S.docs.some((d) => d.id === id)));
  S.available = OPTIONAL_PARAGRAPHS.filter((p) => p !== "cont" || primary.rules.other_cites?.continued_coverage);
  if (facts.urgent) S.included.add("urgent");
  $("#results").hidden = false;
  renderSummary();
  renderUrgent(primary.rules);
  renderDateCard();
  const cols = clear($("#rule-columns")); cols.className = run.ruleSets.length > 1 ? "cols two" : "cols";
  run.ruleSets.forEach((s, i) => cols.append(renderRuleColumn(s, rows[i])));
  renderCompare();
  renderLetter();
  renderModelCard();
  renderCounters();
  $("#results").scrollIntoView?.({ block: "start", behavior: "auto" });
}

const PLAN_NAMES = { aca: "Marketplace or individual plan (ACA rules)", erisa: "Employer self-funded plan (ERISA rules)", ma: "Medicare Advantage plan (CMS rules)", both: "Plan type not known: both rule sets shown" };
function renderSummary() {
  const f = run.facts;
  const s = clear($("#summary"));
  const warn = run.source === "fallback" ? h("p", { class: "banner warn" }, "A verified rule publisher was not loaded. These numbers come from the built-in rules.") : null;
  s.append(h("h2", {}, "What we read in your notice"),
    h("dl", { class: "kv wide" },
      h("dt", {}, "Plan"), h("dd", {}, f.plan_name || "Not found"),
      h("dt", {}, "Plan type"), h("dd", {}, PLAN_NAMES[run.planKind], " ", h("button", { type: "button", class: "link", onclick: showQuestions }, "Not right?")),
      h("dt", {}, "Date of notice"), h("dd", {}, effectiveNoticeDate() ? longFromIso(effectiveNoticeDate()) : "Not found. Enter it below."),
      h("dt", {}, "Reason given"), h("dd", {}, f.reason_category ? REASON_LABELS[f.reason_category] : "Not found. Read the reason on your notice."),
      h("dt", {}, "Rules from"), h("dd", {}, run.ruleSets.map((x) => `${x.label} (${x.host})`).join("; "))));
  if (warn) s.append(warn);
}
function longFromIso(iso) { const d = parseDate(iso); return d ? new Date(Date.UTC(d.y, d.m - 1, d.d)).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" }) : iso; }

function renderUrgent(rules) {
  const el = $("#urgent");
  el.hidden = !run.facts.urgent;
  clear(el);
  if (run.facts.urgent) el.append(h("b", {}, "This looks urgent. "), `If waiting could seriously harm your health, ask for an expedited decision. The plan must answer within ${rules.urgent_decision_hours} hours. Ask your doctor to support the request.`);
}

function renderDateCard() {
  const el = clear($("#date-card"));
  const need = !effectiveNoticeDate();
  el.hidden = !need;
  if (!need) return;
  const input = h("input", { type: "date", id: "date-input", "aria-label": "Date of the notice" });
  el.append(h("h2", {}, "We could not find the date"), h("p", { class: "hint" }, "Enter the date printed on your notice. Your deadlines follow from it."),
    h("div", { class: "row" }, input, h("button", { type: "button", class: "primary", onclick: () => { if (input.value) { run.manualDate = input.value; render(); } } }, "Use this date")));
}

function chip(cite, url, verified) {
  return h("span", { class: "chips" }, h("a", { class: "chip", href: url, target: "_blank", rel: "noopener" }, cite), verified === false ? h("span", { class: "chip check", title: "This number is not fully verified. Check the rule yourself." }, "check") : null);
}

function renderRuleColumn(set, rows) {
  const r = set.rules;
  const col = h("div", { class: "col" });
  col.append(h("div", { class: "card", id: `deadlines-${set.kind}` },
    h("div", { class: "card-head" }, h("h2", {}, "Your deadlines"), h("button", { type: "button", class: "mini", onclick: (e) => copy(deadlinesAsText(rows), e.target) }, "Copy")),
    h("p", { class: "hint" }, PLAN_NAMES[set.kind], " · rules from ", set.host),
    h("ol", { class: "deadlines" }, rows.map((d, i) => h("li", { class: `deadline ${d.id === "internal" ? "key" : ""} ${d.id === "urgent" ? "urgent-row" : ""}` },
      h("div", { class: "d-label" }, d.label),
      h("div", { class: d.id === "internal" || d.id === "urgent" ? "d-date big" : "d-date" }, d.dateText),
      d.daysLeft != null ? h("div", { class: d.overdue ? "d-left late" : "d-left" }, d.overdue ? `${-d.daysLeft} days ago` : `${d.daysLeft} days from now`) : null,
      h("div", { class: "d-note" }, d.note),
      d.needsFinal ? h("label", { class: "inline" }, "Date of final decision ", h("input", { type: "date", onchange: (e) => { run.finalDecision = e.target.value || null; render(); } })) : null,
      chip(d.cite, d.ecfr_url, r.verified)))),
    null));
  col.append(h("div", { class: "card", id: `docs-${set.kind}` },
    h("h2", {}, "Documents you can ask for"),
    h("p", { class: "hint" }, "Tick what you will ask your plan for. Free of charge."),
    h("ul", { class: "docs" }, r.documents_you_can_request.map((d) => h("li", {},
      h("label", { class: "check-row" }, h("input", { type: "checkbox", "data-doc": d.id, checked: Page.s.checkedDocs.has(d.id) || null, onchange: (e) => Page.checkDocument(d.id, e.target.checked) }), h("span", {}, d.label)),
      chip(d.cite, d.ecfr_url, r.verified)))),
    h("p", { class: "path" }, h("b", {}, "If the appeal is denied: "), r.external_review_path),
    h("p", { class: "path" }, r.after_appeal_note, " ", chip(r.after_appeal_cite, r.ecfr_url, r.verified))));
  return col;
}

function renderCompare() {
  const el = clear($("#compare"));
  const order = Object.keys(run.runs);
  const prev = order.filter((k) => k !== run.planKind && k !== "both").pop();
  const cur = run.planKind;
  el.hidden = !prev || cur === "both";
  if (el.hidden) return;
  const a = run.runs[prev].sets[0].rules, b = run.ruleSets[0].rules;
  const first = (t) => t.split(/(?<=\.)\s/)[0];
  const filing = (r) => `${r.internal_appeal_filing_days} days`;
  const outside = (r) => r.external_review_automatic ? "Automatic. The plan sends it" : `You ask, within ${r.external_review_request_months} months`;
  const rows = [
    { label: "Days to file", x: filing(a), y: filing(b), big: true },
    { label: "Outside review", x: outside(a), y: outside(b), big: true, short: [a.external_review_automatic ? "Automatic" : "You ask", b.external_review_automatic ? "Automatic" : "You ask"] },
    { label: "Decision time, care not yet received", x: `${a.decision_days_preservice} days`, y: `${b.decision_days_preservice} days` },
    { label: "Urgent decision", x: `${a.urgent_decision_hours} hours`, y: `${b.urgent_decision_hours} hours` },
    { label: "Where an outside review goes", x: first(a.external_review_path), y: first(b.external_review_path) },
    { label: "If the plan skips its steps", x: a.after_appeal_note, y: b.after_appeal_note },
  ].map((r) => ({ ...r, same: r.x === r.y }));
  rows.sort((p, q) => Number(p.same) - Number(q.same)); // Changed rows first (stable)
  const changedBig = rows.filter((r) => r.big && !r.same);
  el.append(h("h2", {}, "What changed"),
    h("p", { class: "hint" }, `Compared with the ${PLAN_SHORT[prev]} you checked before.`),
    changedBig.length ? h("div", { class: "bigdiff" }, changedBig.map((r) => h("div", { class: "bd" },
      h("div", { class: "bd-label" }, r.label),
      h("div", { class: r.short ? "bd-num word" : "bd-num" }, h("span", { class: "from" }, r.short ? r.short[0] : r.x.replace(/ days$/, "")), h("span", { class: "arrow", "aria-hidden": "true" }, "\u2192"), h("span", { class: "to" }, r.short ? r.short[1] : r.y.replace(/ days$/, ""))),
      r.label === "Days to file" ? h("div", { class: "bd-unit" }, "days") : null))) : null,
    h("div", { class: "table-wrap" }, h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, ""), h("th", {}, PLAN_SHORT[prev]), h("th", {}, PLAN_SHORT[cur]), h("th", {}, ""))),
      h("tbody", {}, rows.map((r) => h("tr", { class: r.same ? "same-row" : "changed-row" }, h("th", { scope: "row" }, r.label), h("td", {}, r.x), h("td", {}, r.y), h("td", { class: r.same ? "same" : "diff" }, r.same ? "Same" : "Changed")))))));
}

// ---------- the letter ----------
const FORM_IDS = new Set(["from", "to", "re", "close"]);
function currentParas() {
  const facts = { ...run.facts, notice_date: effectiveNoticeDate() };
  const set = run.ruleSets[0];
  return buildLetter(facts, set.rules, { verified: set.rules.verified }).filter((p) => !OPTIONAL_PARAGRAPHS.includes(p.id) || Page.s.included.has(p.id));
}
function renderLetter() {
  const box = clear($("#letter"));
  const paras = currentParas();
  for (const p of paras) {
    const pe = h("div", { class: "para", "data-pid": p.id });
    for (const s of p.sentences) {
      const text = run.edits.has(s.id) ? run.edits.get(s.id) : s.text;
      const span = h("span", { class: "sent", contenteditable: "true", role: "textbox", "aria-label": "Letter text, editable", spellcheck: "false", "data-sid": s.id, oninput: (e) => run.edits.set(s.id, e.target.innerText) }, text);
      const mark = s.cite ? chip(s.cite, s.url, s.check ? false : true) : (FORM_IDS.has(p.id) ? null : h("span", { class: "chip none" }, "no rule cited"));
      pe.append(h("div", { class: "sentence" }, span, " ", mark));
    }
    box.append(pe);
  }
  const holes = (letterAsTextLive().match(/\[[^\]]+\]/g) || []).length;
  $("#letter-hint").textContent = `Fill in the ${holes} bracketed items before you send it. Every sentence shows the rule it rests on, or says that none is cited. Click any text to edit.`;
  const add = clear($("#add-paras"));
  const labels = { docs: "Ask for documents", urgent: "Ask for an urgent decision", cont: "Keep coverage during the appeal", ext: "Mention external review" };
  const offer = OPTIONAL_PARAGRAPHS.filter((p) => Page.s.available.includes(p) && !Page.s.included.has(p) && (p !== "urgent" || run.facts.urgent));
  if (offer.length) add.append(h("p", { class: "hint" }, "Add a paragraph:"), h("div", { class: "row" }, offer.map((p) => h("button", { type: "button", class: "mini", "data-add": p, onclick: () => Page.insertParagraph(p) }, "+ ", labels[p]))));
}
function letterAsTextLive() {
  return [...document.querySelectorAll("#letter .para")].map((p) => [...p.querySelectorAll(".sent")].map((s) => s.innerText).join("\n")).join("\n\n");
}

// ---------- copy ----------
async function copy(text, btn) {
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
  catch {
    const ta = h("textarea", { class: "sr-copy" }, text); document.body.append(ta); ta.select();
    try { document.execCommand("copy"); btn.textContent = "Copied"; } catch { btn.textContent = "Select and copy"; }
    ta.remove();
  }
  setTimeout(() => { btn.textContent = old; }, 1500);
}

// ---------- model paths (optional) ----------
let polishPending = null;
function hasRealKey() { const k = engine?.byokKey; return !!(k && k !== "demo"); }
function renderModelCard() {
  const paths = clear($("#model-paths"));
  const badge = $("#model-badge");
  const chrome = typeof window.LanguageModel !== "undefined";
  $("#assistant-line").textContent = hasRealKey() ? "Your own key is set. Nothing is sent until you confirm." : "No model. Everything above works without one.";
  badge.textContent = polishPending?.used ? polishPending.used : (hasRealKey() ? "Your key is set. Nothing sent yet" : "No model used");
  paths.append(
    h("button", { type: "button", class: "mini", id: "preview-btn", onclick: () => preview(chrome ? "chrome" : (hasRealKey() ? "byok" : "sim")) }, "Preview what would be sent"),
    h("span", { class: "hint small" }, chrome ? "Chrome's built-in model is available. It runs on this device." : hasRealKey() ? "Your own key is set. The text goes to your provider after you confirm." : "No key is set, so a simulated answer is shown instead."));
}
// Only the letter draft leaves the page, never the notice. The plan name and the notice date are put back
// to placeholders, and anything the notice's redaction table knows is removed again. The only facts
// sent besides the letter are the two the rule publishers may also see: plan type and reason category.
function modelPayload(table) {
  const f = run.facts;
  let letter = letterAsTextLive();
  const plan = f.plan_name;
  if (plan) letter = letter.split(plan).join("[Plan name]");
  const nd = parseDate(effectiveNoticeDate());
  if (nd) letter = letter.split(longDate(nd).replace(/^[A-Za-z]+, /, "")).join("[date on the notice]");
  letter = redact(letter, table);
  const ctx = `plan_type: ${run.planKind === "both" ? "unknown" : run.planKind}; reason_category: ${f.reason_category || "unknown"}`;
  return `Polish the wording of this appeal letter. Keep every bracketed placeholder and do not add facts.\n\nContext: ${ctx}\n\nLetter draft:\n${letter}`;
}
function preview(path) {
  const table = buildRedactionTable(run.text);
  const payload = modelPayload(table);
  const box = clear($("#model-preview")); box.hidden = false;
  clear($("#model-result")).hidden = true;
  box.append(h("h3", {}, "This is exactly what would be sent"),
    h("p", { class: "hint" }, "Only the letter draft is sent, with its placeholders left as they are. The notice itself is never sent."),
    h("pre", { class: "redacted", id: "redacted-text", tabindex: "0" }, payload),
    h("p", { class: "hint" }, path === "chrome" ? "Goes to: Chrome's built-in model on this device. No network request." : path === "byok" ? `Goes to: ${hostOf(engine?.top?.llm?.baseUrl || "")} with your own key.` : "Goes to: nowhere. This is a simulated answer."),
    h("div", { class: "actions" }, h("button", { type: "button", class: "primary", id: "send-redacted", onclick: () => send(path, payload) }, "Send this letter draft"), h("button", { type: "button", class: "ghost", onclick: () => { box.hidden = true; } }, "Cancel")));
  log("Preview shown. Nothing sent yet.");
}
async function send(path, payload) {
  const out = clear($("#model-result")); out.hidden = false;
  $("#model-preview").hidden = true;
  out.append(h("p", { class: "status" }, "Working..."));
  try {
    let text, label;
    if (path === "chrome") {
      const sess = await window.LanguageModel.create();
      text = await sess.prompt(payload); localModelRuns += 1; label = "Chrome built-in model";
    } else if (path === "byok") {
      const llm = engine.top.llm; const front = engine.topFrontSpec?.();
      const model = engine.modelOverride || front?.llm_config?.model_name || "gpt-4o-mini";
      let acc = "";
      await llm.chat({ model, messages: [{ role: "user", content: payload }], origin: hostOf(location.href), onContentDelta: (t) => { acc += t; } }).then((r) => { if (!acc && r?.content) acc = r.content; });
      text = acc; label = "Your model";
    } else {
      text = "Dear Appeals Department, I am writing to appeal the denial described above and ask for a full and fair review by someone who was not involved in the first decision. Please send me my claim file and the documents behind the denial, free of charge. [Your name]";
      label = "Simulated response";
    }
    log(path === "sim" ? "Simulated response shown. No request was made." : `Model answered (${label}).`, "ok");
    clear(out).append(h("h3", {}, label));
    if (path === "sim") out.append(h("p", { class: "banner warn" }, "Simulated response. No model was called."));
    out.append(h("p", { class: "suggest" }, text), h("button", { type: "button", class: "mini", onclick: (e) => copy(text, e.target) }, "Copy wording"));
    polishPending = { used: path === "sim" ? "Simulated answer, no model" : "Model used (letter draft only)" };
    $("#model-badge").textContent = polishPending.used;
  } catch (err) {
    clear(out).append(h("p", { class: "banner warn" }, "The model did not answer. ", String(err.message || err).slice(0, 160)), h("p", { class: "hint" }, "Your letter is unchanged."));
  }
  renderCounters();
}

// ---------- safety tries ----------
async function tryBad(kind) {
  const out = clear($("#safety-out"));
  const peers = await loadPeers();
  await engineReady;
  const outCard = (c) => out.append(c);
  if (kind === "tampered") {
    const url = peers.urls.tampered;
    try {
      const res = await loadPeer(url, "ACA appeal rules (changed copy)", "This copy of the rules was changed after it was published. See whether the check catches it.");
      if (res.declined) return;
      if (res.blocked) {
        outCard(h("section", { class: "card error", role: "alert" }, h("h3", {}, "This rule network asks for your member ID. Blocked."),
          h("dl", { class: "kv" }, h("dt", {}, "What it said"), h("dd", {}, "“" + res.blocked.findings.map((f) => f.excerpt).join("”, “") + "”"),
            h("dt", {}, "Why it was blocked"), h("dd", {}, res.blocked.findings.map((f) => f.why).join("; ")),
            h("dt", {}, "Fields shared with it"), h("dd", {}, `0 of ${SLY_ALLOWED.length} allowed fields were sent (${SLY_ALLOWED.join(", ")}). Always blocked: name, member ID, claim number, date of birth, diagnosis code.`))));
        log("Changed rules blocked. 0 fields shared.", "bad");
      } else outCard(h("p", { class: "status" }, "The copy passed the check."));
    } catch (err) { outCard(errorCard("rules", err)); }
    return;
  }
  try {
    if (kind === "broken") { await loadPeerSilently(peers.urls.broken, "Damaged rule file"); }
    else if (kind === "cycle") {
      const base = engine.top.base;
      await engine.resolveRemote(peers.urls.aca_appeal_rules, [`${base}::appeal_desk`, `${new URL("./", peers.urls.aca_appeal_rules).href.replace(/\/$/, "")}::aca_appeal_rules`], null, engine.top.manifest);
    } else if (kind === "budget") {
      const { consumeRemoteBudget } = await import("../runtime/runner.js");
      const comp = { deadline: Date.now() + 90000, remoteCalls: 0, maxRemoteCalls: 4, peerCalls: new Map(), maxCallsPerPeer: 1, agentCalls: 0, maxAgentCalls: 12 };
      let reason = null, n = 0;
      while (!reason && n < 10) { reason = consumeRemoteBudget(comp, `rules-${n}::net`); n += 1; }
      outCard(errorCard("budget", null, { title: "Too many rule networks for one question", what: `One question may use up to ${comp.maxRemoteCalls} outside networks, once each, within 90 seconds. Request ${n} went past the limit: ${reason}.`, did: `${comp.remoteCalls} requests were allowed. The next one was refused and nothing was sent.` }));
      log("Budget limit reached after 4 outside calls.", "bad");
      return;
    } else if (kind === "unlisted") {
      const u = new URL(peers.urls.aca_appeal_rules); u.pathname = u.pathname.replace(/aca_appeal_rules/g, "other_project_rules");
      await engine.resolveRemote(u.href, [`${engine.top.base}::appeal_desk`], null, engine.top.manifest);
    } else if (kind === "denied") {
      await engine.resolveRemote("https://unlisted.example/unlisted_rules/unlisted_rules", [`${engine.top.base}::appeal_desk`], null, engine.top.manifest);
    }
  } catch (err) {
    outCard(errorCard(kind, err, kind === "cycle" ? {} : {}));
    log(`Refused (${kind}): ${String(err.message).slice(0, 80)}`, "bad");
    return;
  }
  outCard(h("p", { class: "status" }, "The runtime accepted it."));
}
async function loadPeerSilently(url, label) {
  installConsent();
  pageConsent = () => askConsent(label, url, "This rule file was damaged on purpose, to show what a failure looks like.");
  try {
    const d = await engine.requestConsent({ kind: "network", peerLabel: label, peerOrigin: new URL(url).origin, requestText: "damaged file test" });
    if (d !== "allow") throw Object.assign(new Error("You declined."), { code: "DECLINED" });
  } finally { pageConsent = null; }
  await engine.resolveRemote(url, [`${engine.top.base}::appeal_desk`], null, engine.top.manifest);
}

// ---------- scenes ----------
const BAND = [
  "Pick sample 1, press Check this notice, then Allow. You should see deadlines, documents and a letter.",
  "Pick sample 3, the Medicare Advantage plan, and Allow again. A What changed table shows 180 days become 60.",
  "Open Assistant and AI model settings: no key. Check a sample. The badge says No model used.",
  "Press Preview what would be sent. Only the letter draft is shown. Nothing leaves until you press Send this letter draft.",
  "Press Load a changed copy of the rules. It is blocked. Then try the other five.",
  "Open the example page: another website uses the same rule networks.",
];
function route() {
  const m = /^#scene-([1-6])$/.exec(location.hash);
  const n = m ? Number(m[1]) : 1;
  document.body.dataset.scene = String(n);
  $("#band-n").textContent = String(n);
  $("#band-text").textContent = BAND[n - 1];
  $("#band-back").disabled = n === 1; $("#band-next").disabled = n === 6;
  if (n === 3) $("#assistant-wrap").open = true;
  const target = { 4: "#model-card", 5: "#safety", 6: "#partner" }[n];
  if (target && !(n === 4 && $("#results").hidden)) $(target)?.scrollIntoView?.({ block: "start" });
}
window.addEventListener("hashchange", route);

// ---------- wiring ----------
function init() {
  const row = $("#sample-row");
  SAMPLES.forEach((s, i) => row.append(h("button", { type: "button", class: "sample", "data-sample": s.id, onclick: () => { $("#notice").value = s.text; showStatus(`Sample ${i + 1} loaded. Press Check this notice.`); } },
    h("b", {}, `Sample ${i + 1}`), h("span", {}, s.title), h("small", {}, s.blurb))));
  $("#analyze").addEventListener("click", analyze);
  $("#clear").addEventListener("click", () => { $("#notice").value = ""; showStatus(""); });
  $("#copy-letter").addEventListener("click", (e) => copy(letterAsTextLive(), e.target));
  $("#plain-view").addEventListener("click", (e) => { const on = document.body.classList.toggle("plain"); e.target.setAttribute("aria-pressed", String(on)); e.target.textContent = on ? "Back to full view" : "Plain view"; });
  document.querySelectorAll("[data-try]").forEach((b) => b.addEventListener("click", () => tryBad(b.dataset.try)));
  $("#band-next").addEventListener("click", () => { const n = Number(document.body.dataset.scene); if (n < 6) location.hash = `#scene-${n + 1}`; });
  $("#band-back").addEventListener("click", () => { const n = Number(document.body.dataset.scene); if (n > 1) location.hash = `#scene-${n - 1}`; });
  $("#wipe").addEventListener("click", async () => {
    try { localStorage.clear(); sessionStorage.clear(); } catch { /* storage may be blocked */ }
    try { for (const db of (await indexedDB.databases?.()) || []) indexedDB.deleteDatabase(db.name); } catch { /* ignore */ }
    Page.reset(); run.runs = {}; location.hash = "#scene-1"; location.reload();
  });
  Page.subscribe(() => { if (Page.s.hasNotice && run.ruleSets.length) { renderLetter(); syncChecks(); } });
  loadPeers().then((p) => { try { if (p.urls.partner) $("#partner-link").href = new URL(p.urls.partner, location.href).href; } catch { /* keep default */ } });
  route();
  engineReady.then((e) => { installConsent(); installExactGate(); if (e) log(engine.mockLLM || (engine.byokKey && engine.byokKey !== "demo") ? "Assistant connected to this page." : "Assistant needs a model key. Everything else works without one."); renderCounters(); });
}
function syncChecks() {
  document.querySelectorAll("input[data-doc]").forEach((c) => { c.checked = Page.s.checkedDocs.has(c.dataset.doc); });
}
init();
window.__appeal = { run, Page, analyze, loadRulesAndShow };
