# YouCam proxy

No deployment or secret upload was performed in Round 5. Keep `MODE: 'recorded'` and `PROXY_URL: ''` until deployment and live verification.

## Deployment (operator task)

1. Use the existing Cloudflare account and KV binding in `wrangler.toml`, or provision your own binding.
2. Put the key into Worker secrets with `wrangler secret put YOUCAM_API_KEY`.
3. Run `wrangler deploy` from this directory.
4. Set the deployed URL and live mode in the public `config.js`. Never put credentials in public code.
5. Verify one authorized live upload from the allowed Pages origin, including signed upload CORS, the shared file ID, parallel Skin/Tone requests and three VTO outputs.

## Request and budget protection

Only the File, Skin Analysis, Color Tones and Makeup VTO paths are forwarded. Allowed payloads are reconstructed. External source URLs and unknown task types are rejected. CORS accepts only `https://gooreum.github.io`.

One Durable Object atomically reserves upload slots, so concurrent requests cannot exceed limits. KV mirrors counts but does not enforce them. `DAILY_CAP` defaults to 5 and is capped at 5 per UTC day. `TOTAL_CAP` defaults to 22 and is capped at 22 across the judging period. Failed requests conservatively consume a reservation. The proxy currently returns `daily_cap` for either limit; the client message covers both and also recognizes `total_cap`.

One upload authorizes one Skin Analysis task, one Color Tones task and up to three Makeup VTO tasks on that file ID. Only task IDs owned by the upload session can be polled. The browser retains its session token when opening shade comparison; downloaded VTO responses are cached in memory so reopening does not spend three more calls.

Session metadata expires after one hour. This proxy does not store photo bytes. Uploaded and generated media at YouCam are covered by the provider's [30-day retention policy](https://docs.perfectcorp.com/develop/file_retention_period), checked during Round 5. Local product-decision records expire after 30 days on the next application access and can be deleted sooner.

Recording costs observed on 2026-10-27: File upload 0, Skin Analysis four concerns 9, Color Tones 20, VTO 1 per shade. A complete three-shade check used 32 units. Limits are project budget controls, not provider rate limits or a guarantee about remaining balance.
