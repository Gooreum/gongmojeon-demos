# Cart Check

Check the skincare already in your cart against one selfie, then keep, swap or remove products before checkout. Built inside the fictional Lumen & Leaf store.

Round 5 is a complete static-site rebuild with **real YouCam responses recorded on 2026-10-27**. The shopper photographs are generated fictional people. The readings and nine virtual try-on outputs came from actual API calls on those photographs.

## Why this moment

In a UK survey of 3,002 people reported by [Beauty Pie](https://sandbox.beautypie.com/en-us/blogs/articles/skincare-iq-guide), 59% of regular skincare users were unsure which products should be used together. Cart Check starts at the shopping cart, rather than asking people to build a new routine from scratch. No outcome improvement or reduction in returns has been measured.

## Try it in 30 seconds

Open `index.html` directly. No build, server, sign-up, API key or internet connection is needed for recorded shoppers. The interface defaults to English through `CART_CONFIG.DEFAULT_LANGUAGE`. Use `?lang=ko` for Korean or `?lang=en` for an explicit English override; the language button also switches between both.

1. Select **Check my cart** and **Mina**.
2. Inspect the retinol / acid pairing. Read the source, keep the original product or choose an alternative.
3. Select **Apply changes**, save your routine and **Checkout**.

The top tour strip supplies the current instruction. Every scene starts from a cart; the service itself remains a shopping application. On desktop, the phone is accompanied by a scene story, action, success condition and API references.

| Route | Story and success state |
| --- | --- |
| `#scene-1` | Retinol plus AHA: pairing caution and a suggested removal; keep 2, swap 1, remove 1 with Mina's real readings |
| `#scene-2` | Same rich cream and high-alcohol toner: Mina keeps both; Jules swaps both |
| `#scene-3` | Ari redness 56.7: replace the fragranced acid toner with a gentle hydrating toner |
| `#scene-4` | Mina real VTO outputs: Ivory ΔE 14.7, Sand 3.2, Honey 4.2; selectable cards and a comparison slider |
| `#scene-5` | Photo errors before upload: darkness, small face, side profile; separate server-face-error path |
| `#scene-6` | Daily or judging-period cap, 60-second timeout, offline fallback; continue with real recorded responses |
| `#scene-7` | Applied cart, changed total, morning/evening routine, PNG/copy export, order confirmation |
| `#merchant` | Local check count, suggested product changes, common pairing, actually applied shade-change rate, CSV export |
| `#full` | No tour strip; restores the locally saved cart |

The order is an in-browser confirmation, not a charge, shipment or external order submission. Support requests can be saved as text; outbound support delivery is not configured.

## Real recordings and decision thresholds

Only exact `raw_score` values feed decisions. Display values are rounded to one decimal; `ui_score` is retained in the recordings but never used by the rules.

| Shopper | Oil control | Redness | Moisture | Acne | Skin color |
| --- | ---: | ---: | ---: | ---: | --- |
| Mina | 69.1 | 92.6 | 57.3 | 93.8 | #B59276 |
| Jules | 47.0 | 100.0 | 39.2 | 82.4 | #9D6F54 |
| Ari | 75.1 | 56.7 | 53.9 | 96.9 | #B89880 |

Higher scores indicate healthier readings. **Calibrated on three recorded API calls, not clinically validated.** The UI states this limitation and exposes each applicable threshold.

| Metric | Threshold | Product preference outside the hold band |
| --- | ---: | --- |
| Oil control | 55 | Below threshold: replace a rich cream with a lighter gel |
| Moisture | 45 | Below threshold: replace a high-alcohol toner |
| Redness | 65 | Below threshold: consider fragrance-free, non-exfoliating alternatives |

Readings **within ±5 inclusive** of a threshold are held for review before a threshold-based swap is considered. These are cautious store preferences, not disease diagnoses, proven treatment recommendations or measured biological boundaries. Same-photo repeatability in the supplied Mina recordings does not establish population validation.

CIEDE2000 ranks catalog colors: less than 2 is a match, 2–5 is close, above 5 is noticeably different. For Jules, the nearest catalog shade is Deep at ΔE 9.9. The interface honestly reports **no close shade in this store** and permits keeping or removing foundation, without inventing a VTO result for an unrecorded shade.

## Architecture

```text
Browser cart
  ├─ Recorded shopper → local response fixtures (also embedded in data.js)
  └─ Consented selfie → on-device quality check → Worker proxy → File API
                                                   ├─ Skin Analysis ─┐
                                                   └─ Color Tones ───┤ shared file ID
                                                  Makeup VTO × 3 ──┘
      ingredient rules + CIEDE2000 → explicit shopper choices
      → updated cart → routine → local order → local merchant aggregate
```

- `index.html`, `style.css`, `app.js`: accessible UI, hash routing, interaction and exports.
- `data.js`: offline bundle, generated from the checked-in JSON files.
- `js/youcam.js`: recorded/live adapter, shared upload session, parallel skin/tone tasks, 2-second polling, 60-second task deadline, readable errors.
- `js/rules.js`, `js/color.js`, `js/routine.js`: deterministic decisions, CIEDE2000 and morning/evening ordering.
- `js/precheck.js`: file type/size, dimensions, mean luminance and face width when FaceDetector is available. Pose always requires manual confirmation; no false claim of universal face detection.
- `proxy/`: allowlisted Cloudflare Worker, CORS, atomic upload reservations and per-session task limits.
- `tools/`: recording script, never run automatically by this app.

The default stays `MODE: 'recorded', PROXY_URL: ''`. The live path exists but was not deployed or tested against the paid API in Round 5. Follow [proxy setup](proxy/README.md) separately. No API credentials appear in browser files.

## YouCam APIs

| API | Endpoint | Purpose | Observed units |
| --- | --- | --- | ---: |
| File API | `/s2s/v2.0/file` | Upload once and share file ID | 0 |
| AI Skin Analysis | `/s2s/v2.0/task/skin-analysis` | SD oiliness, redness, moisture, acne | 9 |
| AI Facial Color Tones Analyzer | `/s2s/v2.0/task/skin-tone-analysis` | Measured skin hex | 20 |
| AI Makeup Virtual Try-On | `/s2s/v2.0/task/makeup-vto` | Foundation color on the same face | 1 per shade |

These costs were observed in the supplied 2026-10-27 recording session. A three-shade check used 32 units. The project caps live uploads at **5 per UTC day and 22 across judging**, separately from the provider's rate limit. Reopening the same comparison uses in-memory VTO caching.

Official references: [Skin Analysis](https://docs.perfectcorp.com/reference/ai_skin_analysis), [Color Tones](https://docs.perfectcorp.com/reference/ai_skin_tone_analysis), [Makeup VTO](https://docs.perfectcorp.com/reference/ai_makeup_vto), [quick start](https://docs.perfectcorp.com/develop/quick_start_guide), [rate limits](https://docs.perfectcorp.com/develop/rate_limit).

## Privacy and real-world behavior

- No sign-up or personal name, email, telephone number, address or payment details are requested.
- Consent is required before opening a camera or selecting a personal photo. Camera denial offers a file picker. The face must exceed 60% of photo width. Photos under 480 pixels on the short side, unsupported formats or files of 10 MB or more are rejected.
- The app stores no personal photos, measured colors or skin scores. A selected live photo is held in session memory, released when leaving the workflow, and never automatically retried without the user's action.
- Device records contain product decisions and local orders only. They expire after 30 days when the app next reads them; individual and all-record deletion are available. Browser storage failure falls back to memory with a notice.
- The draft cart is saved locally. Offline mode keeps it available and permits retry or a recorded-shopper fallback; recording fixtures work directly from `file://`.
- History supports search, status filters and 10-record pagination. Merchant counts derive from these actual local events; no invented seed metrics are displayed.
- The provider's current [retention policy](https://docs.perfectcorp.com/develop/file_retention_period) says uploaded and generated media are removed after **30 days**. This supersedes the spec's earlier 24-hour statement; consent and help were corrected accordingly. This app's local record deletion does not delete provider-held images.

## Sources for rules

Rules link to primary sources in the decision UI. The distinction between the source and the store's conservative policy is explicit:

- [AAD: testing skincare products](https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products/): retinol and glycolic acid can irritate. Removing one or alternating nights is our cautious policy, not a universal incompatibility established by this page.
- [AAD: rosacea care](https://www.aad.org/public/diseases/rosacea/triggers/tips): fragrance and exfoliating acids can irritate sensitive skin. Applying this cautiously to a redness score does not diagnose rosacea.
- [AAD: choosing moisturizer](https://www.aad.org/public/everyday-care/skin-care-basics/dry/pick-moisturizer): lighter gels for oily skin, with separate care for oily and dry areas. A single score cannot capture all mixed-skin differences.
- [AAD: dry skin](https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin): avoid irritating alcohol and fragrance. The catalog's high-alcohol flag means denatured alcohol, not fatty alcohols.
- [MedlinePlus: tretinoin](https://medlineplus.gov/druginfo/meds/a682437.html): ask the prescriber about benzoyl peroxide and other topical medications; the rule does not generalize to every retinoid.
- [FDA: AHAs](https://www.fda.gov/cosmetics/cosmetic-ingredients/alpha-hydroxy-acids): sun protection reminder. Sunscreen is not silently added to the cart.

## Verification

```sh
node --check poc/web/app.js
for test in poc/web/test/*.test.mjs; do node "$test"; done
```

Unit tests cover actual fixture parity, raw-score bounds, threshold hold bands, scene outcomes, reference CIEDE2000 values, face checks, parsing, CORS and concurrent budget enforcement. Semantic DOM tests also exercise both languages, saved records, choices and routing. See [verification record](VERIFICATION.md).

The outer reviewer runs browser screenshots, as requested:

```sh
PW_ROOT=/path/to/worker node poc/web/shot.mjs
PW_ROOT=/path/to/worker node poc/web/test-web.mjs
```

`shot.mjs` imports Playwright with `createRequire(process.env.PW_ROOT + '/')('playwright')`. It captures the seven completed scenes and merchant at 390×844 and 1280×800 into `_codex/shots/demo-<scene>-<width>.png`. English screenshots are the default. Pass the file/Pages URL with `?lang=ko` to capture Korean. Browser execution and visual review remain external to this round.

For an optional local HTTP origin: `python3 -m http.server 8000 --directory poc/web`. This is not required for recorded replay.

## Design and limitations

English Inter, Korean Pretendard, local OFL fonts. Seven base colors: forest green, ink, muted gray, divider, warm paper, warning and danger. Derived surface tints, 12/14/16/20/28/36 type scale, 4-pixel spacing tokens, 12/24-pixel radii, two shadows, 180 ms transitions, 44-pixel minimum actions and reduced-motion support.

Skin readings vary with lighting and positioning. Thresholds are calibrated on three generated-person recordings, not clinical data. VTO images show appearance, not a guaranteed physical shade match. The catalog, prices, shoppers, checkout and order records are illustrative. Support delivery, live proxy deployment, live camera/device checks and payment processing are not completed integrations. The supplied file named as an uncropped-face error contains a success response; it is not used as evidence (see [assets](ASSETS.md)).

## Built during the hackathon and licensing

Work began 2026-10-23; real recordings were supplied on 2026-10-27. Round 5 rebuild preserves the previous site outside the public folder in `poc/web-old/round-4/`.

Authored code and inline interface artwork: [MIT](LICENSE), Cart Check contributors. Fonts retain their SIL OFL licenses. See [asset provenance](ASSETS.md) for generated portraits and genuine API outputs.
