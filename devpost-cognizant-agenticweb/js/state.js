// state.js - the page's own state and the three operations that both the screen and the
// assistant use. One set of rules, so the assistant cannot do what the page refuses.
// Import it by the same URL everywhere (no ?v= query). Apache-2.0.
export const OPTIONAL_PARAGRAPHS = ["docs", "urgent", "cont", "ext"];
export const DOC_IDS = ["claim_file", "new_evidence", "codes", "relevant_docs", "ire_case_file"];

export const Page = {
  s: { hasNotice: false, planType: null, noticeDate: null, reasonCategory: null, urgent: false, rulesSource: null, available: [], deadlines: [], included: new Set(["docs", "ext"]), checkedDocs: new Set(), docs: [] },
  listeners: new Set(),
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { for (const fn of this.listeners) fn(this.s); },
  reset() {
    this.s = { hasNotice: false, planType: null, noticeDate: null, reasonCategory: null, urgent: false, rulesSource: null, available: [], deadlines: [], included: new Set(["docs", "ext"]), checkedDocs: new Set(), docs: [] };
    this.emit();
  },
  /** What the assistant may read. Only the four allowed facts plus computed dates. No names or numbers. */
  getState() {
    const s = this.s;
    return {
      has_notice: s.hasNotice,
      plan_type: s.planType,
      notice_date: s.noticeDate,
      reason_category: s.reasonCategory,
      urgent: s.urgent,
      rules_source: s.rulesSource,
      deadlines: s.deadlines.map((d) => ({ label: d.label, date: d.dateIso || d.dateText })),
      letter_paragraphs: [...s.included],
      documents: s.docs.map((d) => ({ id: d.id, label: d.label, checked: s.checkedDocs.has(d.id) })),
    };
  },
  /** Put an optional paragraph into the letter. Refuses what does not apply. */
  insertParagraph(id) {
    const s = this.s;
    if (!s.hasNotice) return { ok: false, reason: "Paste a notice first, so there is a letter to add to." };
    if (!OPTIONAL_PARAGRAPHS.includes(id)) return { ok: false, reason: "That paragraph is not available." };
    if (s.available.length && !s.available.includes(id)) return { ok: false, reason: "This plan's rule table has no source for that paragraph, so it is not offered." };
    if (id === "urgent" && !s.urgent) return { ok: false, reason: "The notice does not show an urgent case, so the urgent paragraph is not offered." };
    if (s.included.has(id)) return { ok: true, already: true, letter_paragraphs: [...s.included] };
    s.included.add(id);
    this.emit();
    return { ok: true, letter_paragraphs: [...s.included] };
  },
  checkDocument(id, checked = true) {
    const s = this.s;
    if (!s.hasNotice) return { ok: false, reason: "Paste a notice first, so there is a document list." };
    if (!s.docs.some((d) => d.id === id)) return { ok: false, reason: "That document is not on this plan's list." };
    if (checked) s.checkedDocs.add(id); else s.checkedDocs.delete(id);
    this.emit();
    return { ok: true, checked: [...s.checkedDocs] };
  },
  paragraphPreview(id) {
    const text = { docs: "Ask the plan for your claim file and the documents behind the denial, free of charge.", urgent: "Ask for an expedited decision within the urgent time limit.", cont: "Ask the plan to keep your coverage in place while the appeal is decided.", ext: "Say that you plan to ask for an external review if the appeal is denied." };
    return text[id] || "";
  },
};
