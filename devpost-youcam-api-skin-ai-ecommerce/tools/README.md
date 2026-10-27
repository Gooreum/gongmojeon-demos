# Recording real YouCam responses

`record-api.mjs` uploads one photo, runs Skin Analysis (4 concerns), Facial Color Tones and Foundation Makeup VTO,
and writes each response plus the unit cost (read from `/s2s/v1.0/client/credit` before and after each call).

```
YOUCAM_API_KEY=... node tools/record-api.mjs <out-dir> mina:img/shoppers-input/mina.jpg '#E6C7A4,#BE906F'
```

`SKIP_SKIN=1` / `SKIP_TONE=1` skip those calls. The key comes from the environment only.
Recorded responses in `data/recorded-2026-10-27/` have signed result URLs removed; try-on images are saved in `img/vto-real/`.
