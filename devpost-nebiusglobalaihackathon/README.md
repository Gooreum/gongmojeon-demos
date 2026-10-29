# Council Watch

A static, English-language Seattle council app. Open `index.html` directly or host this folder on GitHub Pages. No build step, external CDN, login, API key or tracking script is needed. The old app is preserved in `../web-old/round-1/`.

## Walkthrough

1. `#scene-1`: Start near Bitter Lake Playfield, District 5. Choose interests and find this week's items. Optional local storage consent; no location permission.
2. `#scene-2`: CB 121292, three Aurora Avenue parcels, 0.46 mi from the selected place. Passed status, short factual summary, original agenda page 5 and two honest news placeholders.
3. `#scene-3`: The regular This week list, with CB 121298 pinned first. Comment by Monday, October 26, 10:00 AM Pacific. Download an `.ics` reminder.
4. `#scene-4`: Support, Oppose or Question. Edit the draft, add a live signature, undo changes, save, copy or open an email. Council Watch never sends it.
5. `#scene-5`: Rainier Beach, District 2. No nearby items, three citywide alternatives, visible place switcher and one-tap return to Bitter Lake.
6. `#scene-6`: Citywide truck safety item, without an invented distance.
7. `#scene-7`: CB 121276 requires review. Only the source agenda page 8 is offered; no unsupported summary or generated draft.

The bottom tabs provide Saved records, CSV export, browser Print / Save as PDF, How it works, Run log and Privacy and help. A cancelled council meeting and past comment cutoff are shown accurately. Search and filters operate on all 20 public items. No extra items are fabricated to pad the list.

## Data and limitations

- The bundled snapshot uses real Seattle Legistar records for October 19 through November 9, 2026. The original 18 records and 2 October 26 transportation bills are retained.
- The public landmark profile and 0.46 mi match come from the existing offline pipeline output. No private address is used. Arbitrary address lookup is not implemented.
- Summaries and drafts are editorial placeholders, marked `sample: true`. News slots clearly say no verified article is available. They do not pretend Tavily ran.
- The original October 26 agenda, page 2, says written comments received **before 10:00 AM** are distributed before the 2:00 PM meeting; later comments enter the public record and are distributed after the meeting. Phone registration opens at 1:00 PM; in-person registration is requested at least 15 minutes before the meeting.
- Agenda: https://legistar2.granicus.com/seattle/meetings/2026/10/6911_A_City_Council_26-10-26_Full_Council_Meeting_Agenda.pdf
- Council guidance: https://www.seattle.gov/council/committees/public-comment
- Pew source: https://www.pewresearch.org/wp-content/uploads/sites/20/2026/07/PJ_26.07.16_engagement_topline.pdf (2025 survey, published 2026).
- `data/run.json` is an offline run: no model calls or token use. Cost is unmeasured. The log names planned NVIDIA Nemotron Nano / Super on Nebius Token Factory, clearly separated from measured usage.
- HTTP hosting reads `data/week.json`, falling back to `data/week.sample.json`, and reads `data/run.json`. `data.js` is a bundled equivalent for `file://` and immediate offline startup. Update it together with the JSON when publishing a new snapshot.
- The app uses real current time to disable expired reminders. Automated capture and browser checks freeze October 23, 2026, to reproduce the judging walkthrough.
- Calendar download does not silently modify the user's calendar. The toast is followed by instructions to open the downloaded file to finish importing it.
- No actual Nebius/Tavily call, push notification subscription or automatic sending is included in the static snapshot.

## Offline and privacy

On HTTPS or localhost the service worker caches the app shell, font and data after the first visit. Reload works without a connection. The banner gives the saved update's actual date (October 22), rather than incorrectly claiming it was Monday. Offline drafts can be saved locally, then copied or opened in email when the user chooses. There is no automatic send queue.

Direct file launch uses bundled data and fonts; service workers and install prompts require HTTPS or localhost. Preferences are stored only with optional consent. Explicitly saved drafts and calendar records expire after 7 days and are removed on the next visit. Privacy and help includes a Delete action. Downloads and sent emails are outside the app's retention policy.

## Design

Inter Variable is locally bundled under the SIL OFL 1.1. The interface is English throughout, including downloads, emails and scene notes. Original geometric inline SVGs are MIT-licensed; no stock imagery or generated images are used.

Tokens in `style.css`: teal `#145c50`, ink `#20342f`, muted `#596a63`, border `#d8dfd9`, paper `#f5f6f1`, white `#ffffff`, danger `#a13329`. Success uses teal and warning uses danger. Tints are derived from these seven colors. Type: 12/14/16/20/28/36 px. Spacing: multiples of 4 px. Component radii: 12/28 px. Two shadows. Controls are at least 44 px tall, with visible keyboard focus and 180 ms transitions. Reduced motion is respected.

## Verification

```sh
node --check poc/web/app.js
PW_ROOT=<folder with node_modules/playwright> node poc/web/test-web.mjs
PW_ROOT=<folder with node_modules/playwright> node poc/web/shot.mjs
```

Both browser scripts accept an optional hosted URL. `shot.mjs` writes 14 screenshots to `_codex/shots/demo-<scene>-<width>.png`, at 390x844 and 1280x800. Tests cover all scenes, consistent profile, source placement, no horizontal overflow, English-only output, calendar UTC time and line folding, live signature, real undo, copy/email confirmation, CSV, search, history, refresh/pageshow, service-worker offline reload, offline draft persistence and direct file opening.

Round 2 browser execution is blocked in the current macOS sandbox by Chromium MachPort `bootstrap_check_in: Permission denied`. New screenshots and actual browser pass status must be checked by the outer runner. Existing screenshot files are from round 1 until that runner executes `shot.mjs`. See `_codex/demo-verification-2.md` in the workspace for completed local checks.
