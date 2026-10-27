# Asset sources and provenance

## Local fonts

- Pretendard Variable, [orioncactus/pretendard](https://github.com/orioncactus/pretendard), SIL Open Font License 1.1. `fonts/PretendardVariable.woff2` and `fonts/OFL-Pretendard.txt`.
- Inter Variable, [rsms/inter](https://github.com/rsms/inter), SIL Open Font License 1.1. `fonts/InterVariable.woff2` and `fonts/OFL-Inter.txt`.

Existing licensed local copies were retained in Round 5. No CDN or remote font request is used, including when opening index.html from an offline ZIP. Font licenses are separate from the application MIT license.

## Original interface artwork

Inline SVG outline icons and product bottles/jars were created for Cart Check and are distributed under the project MIT license. No third-party icon package or real brand logo is embedded. Product packaging has fictional catalog codes. Every status also has a text label.

## Fictional shopper photographs

The three portraits in `img/shoppers/` and three poor-quality photographs in `img/precheck/` were generated with OpenAI image generation on 2026-10-23. They depict fictional adults and were not requested to resemble real people. Prompts requested a neutral background, natural skincare texture, no brand, no watermark, and respectively frontal daylight / darkness / distant face / side profile.

`img/shoppers-input/mina.jpg`, `jules.jpg`, and `ari.jpg` are the exact cropped generated portraits sent to YouCam on 2026-10-27. Their faces fill more of the width than the earlier square portraits. The application uses these input crops for shopper selection.

## Real virtual try-on outputs

All nine JPGs in `img/vto-real/` were returned by the actual YouCam Makeup VTO API on 2026-10-27, using the generated fictional input photographs. Settings: foundation, colorIntensity 50, coverageIntensity 50. They are actual API output images, not newly generated illustrations or client-side color overlays.

- Mina: e6c7a4 (Ivory), be906f (Sand), c79978 (Honey).
- Ari: e6c7a4 (Ivory), be906f (Sand), c79978 (Honey).
- Jules: e6c7a4 (Ivory), be906f (Sand), 80563d (Deep).

Signed result URLs were replaced by local paths. The prior illustrative try-on PNGs are absent from the new site; the complete prior site is archived outside it under `poc/web-old/round-4/`.

## Responses and evidence

`data/recorded-2026-10-27/` contains supplied sanitized responses. `data/responses/` and `data.js` use the exact same real values and results. Task identifiers and signed URLs are not required for replay. Decision code reads only raw_score, never ui_score.

Caution: the supplied file named `mina-uncropped-skin-analysis-error.json` actually contains a success response. It is retained unchanged as an input artifact but is not loaded or cited as proof of an API error. The failure described in PLAN.md is not independently evidenced by that file. Scene 5 is a controlled exception scenario; real uploads also run on-device checks.

Generated portrait assets are not clinical evidence. API outputs are not calibrated color standards. No public-domain or third-party ownership claim is made for generated/API imagery. The MIT license covers the authored code and interface artwork.
