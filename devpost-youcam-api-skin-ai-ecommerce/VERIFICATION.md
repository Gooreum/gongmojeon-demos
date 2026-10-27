# Round 7 verification

Previous complete site: `poc/web-old/round-6/`. Site contains 84 files.

## Scope

Implemented _codex/demo-feedback-6.md only. Untouched Swap choices are now distinct from an explicit Keep original choice. Apply changes resolves each untouched Swap to the first rule alternative: the closest eligible foundation shade or first skincare alternative. Explicit shade, alternative, removal and original-product choices take precedence. Undo preserves original selections. Review decisions without a close shade remain unchanged, including Jules's existing no-close-shade explanation.

Scene 7 guidance now names Natural Sand 230. The corrected cart drives totals, routine generation, persisted decisions and the order. No rules, scores, product data, fonts, images, HTML or CSS were changed.

Changed site files: app.js, test-web.mjs, test/dom-check.mjs, VERIFICATION.md. All other 80 files match the previous round byte-for-byte.

## Passed

- Regression reproduced before the fix: Mina's untouched foundation remained ivory instead of sand.
- JavaScript syntax: app.js, test-web.mjs, test/dom-check.mjs and shot.mjs.
- Six unit suites: adapter, color, data, precheck, proxy and rules.
- `DOM_ROOT=/private/tmp/cart-check-round5-qa node poc/web/test/dom-check.mjs`: 648 checks across six language cases and all seven scenes.
- New regression coverage: default Sand replacement in cart/order/history, matching subtotal, removal from routine, explicit Keep original, explicit Honey choice, Undo, Jules no-close-shade retention, default gel cream replacement and corresponding routine.
- HTML closing-tag stack validation.
- Static CSS review: flexible mobile layout, 390px desktop phone, zero-minimum grid columns and reduced-motion support retained. CSS matches the prior round exactly.
- No submission PDFs exist. Read spec, feedback, PLAN, CONTEST and submission/devpost-story.md.

## External browser verification

As requested, Playwright execution belongs to outer Claude. No new browser screenshots or measured overflow results are claimed.

```sh
PW_ROOT=/path/to/worker node poc/web/shot.mjs
PW_ROOT=/path/to/worker node poc/web/test-web.mjs
```

shot.mjs uses createRequire(process.env.PW_ROOT + '/')('playwright') and the updated scene assertions. It captures seven scenes plus merchant at 390×844 and 1280×800 into `_codex/shots/demo-<scene>-<width>.png`. Scene 7 now requires Natural Sand 230 and rejects Warm Ivory 120 in the receipt, in English and Korean.

Not executed: visual screenshot review, actual browser viewport measurements, hardware camera checks, live API calls or proxy deployment. Existing local fonts (Inter and Pretendard, OFL), original MIT SVG artwork, generated fictional portraits and recorded YouCam VTO images are retained; see ASSETS.md.
