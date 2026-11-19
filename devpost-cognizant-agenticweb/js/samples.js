// samples.js - fictional notices. No real person, plan or insurer.
// Every date is counted back from today (clock.js), so a sample deadline is always still ahead.
// Apache-2.0.
import { todayIso } from "./clock.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function back(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d - days));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
const long = (x) => `${MONTHS[x.m - 1]} ${x.d}, ${x.y}`;
const slash = (x) => `${String(x.m).padStart(2, "0")}/${String(x.d).padStart(2, "0")}/${x.y}`;

export function makeSamples(today = todayIso()) {
  const aca = back(today, 14), acaClaim = back(today, 28);
  const erisa = back(today, 21);
  const ma = back(today, 10);
  return [
    {
      id: "aca",
      title: "Marketplace plan: not medically necessary",
      blurb: "Individual plan, reason: not medically necessary",
      noticeIso: `${aca.y}-${String(aca.m).padStart(2, "0")}-${String(aca.d).padStart(2, "0")}`,
      text: `Evergreen Silver 2026 - Notice of Denial of Coverage
Date of notice: ${long(aca)}

Patient: Jordan Rivera
Member ID: EV-48201733
Claim number: CLM-2026-0093817
Date of birth: 07/19/1981
Plan name: Evergreen Silver 2026 (Marketplace individual plan)

We reviewed the claim for an outpatient MRI of the lumbar spine (CPT 72148, diagnosis M54.16) received on ${long(acaClaim)}.
Reason for denial: The service is not medically necessary under our clinical guideline for imaging.

You have the right to appeal this decision. Send appeals to: Evergreen Appeals, 400 Harbor Street, Suite 12, Portland, OR 97201. Questions: (555) 010-4477.

This notice was sent because you bought this plan on the Marketplace.`,
    },
    {
      id: "erisa",
      title: "Employer plan: ERISA self-funded",
      blurb: "Job-based plan, reason: no prior authorization",
      noticeIso: `${erisa.y}-${String(erisa.m).padStart(2, "0")}-${String(erisa.d).padStart(2, "0")}`,
      text: `Cedar Ridge Employee Health Plan - Adverse Benefit Determination
Date of notice: ${slash(erisa)}

Member name: Sam Okafor
Member ID: CR-7730-5521
Claim #: 9920318-A
Plan name: Cedar Ridge Employee Health Plan

Your claim for physical therapy (CPT 97110) was denied.
Reason: Prior authorization was not obtained before the service.

This plan is self-funded by your employer and is subject to ERISA, the Employee Retirement Income Security Act. You may appeal in writing. Cedar Ridge Plan Appeals, 88 Mill Road, Albany, NY 12207.`,
    },
    {
      id: "ma",
      title: "Medicare Advantage plan: not medically necessary",
      blurb: "Medicare Advantage HMO, reason: not medically necessary",
      noticeIso: `${ma.y}-${String(ma.m).padStart(2, "0")}-${String(ma.d).padStart(2, "0")}`,
      text: `Riverbend Advantage Plus (HMO) - Notice of Denial of Medicare Coverage
Date of notice: ${long(ma)}

Patient: Taylor Brooks
Member ID: RA-3391-7740
Claim number: RA-CL-2026-44018
Date of birth: 02/11/1952
Plan name: Riverbend Advantage Plus (HMO)

This is our organization determination on your request for home physical therapy (CPT 97110, diagnosis M62.81).
Reason for denial: The service is not medically necessary under our Medicare coverage criteria.

You have the right to ask us for a reconsideration of this decision. Send your request to: Riverbend Appeals, 77 Mill Road, Salem, OR 97301. Questions: (555) 010-2290.

This is a Medicare Advantage plan. Your Medicare Advantage rights are explained in your Evidence of Coverage.`,
    },
    {
      id: "unknown",
      title: "Unclear plan type, urgent, no date",
      blurb: "Plan type and date are missing; care cannot wait",
      noticeIso: null,
      text: `Summit Basic Health - Claim Decision
Patient: Riley Chen
Member ID: SB-1182907
Claim number: SB-CL-55012

We are unable to approve the infusion therapy ordered by your doctor. The provider is out-of-network for your plan.
Your doctor says the treatment is ongoing treatment and a delay could seriously jeopardize your health.
Call 555-010-9921 for help.`,
    },
  ];
}
export const SAMPLES = makeSamples();
