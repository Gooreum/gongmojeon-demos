// clock.js - "today" for the whole page. The real date, unless the address carries ?today=YYYY-MM-DD,
// which exists only so that automatic tests and screenshots see the same day every time.
// Apache-2.0.
export function todayIso() {
  try {
    const t = new URLSearchParams(location.search).get("today");
    if (t && /^\d{4}-\d{2}-\d{2}$/.test(t) && !Number.isNaN(Date.parse(t))) return t;
  } catch { /* no location, use the real date */ }
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
