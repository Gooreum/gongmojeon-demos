# Deploying the rule networks

The three rule networks live in a short folder `ad/` at the root of the collection repository (`Gooreum/gongmojeon-demos`), and are served from jsDelivr:

`https://cdn.jsdelivr.net/gh/Gooreum/gongmojeon-demos@<tag>/ad/<aca|erisa|ma>/<network name>`

for example `.../ad/aca/aca_appeal_rules`. `node build.mjs` writes these short-named copies to `deploy-root/ad/` (`aca`, `erisa`, `ma`, plus `tam` and `brk`, the test-only changed and damaged copies used by the buttons in "Rule networks are checked"). Copy the `ad/` folder into the repository root.

1. Copy `deploy-root/ad/` to `ad/` at the repository root, push, and create a release tag (for example `ad-v1`).
2. In `peers.config.json`, replace `@TAG` in every `deployed` URL with the tag, and set `"active": "deployed"`. The `partner` entry is `partner-demo/`, a path beside the main site.
3. Run `node build.mjs`. It refuses to build while `@TAG` is left in. It also checks, with the stand-in tag `@ad-v1`, that the three tool names stay distinct, and it rewrites `links.json` and `partner-demo/links.json` from the active set (spec section 3.3 format), and it rebuilds the partner site's own manifest and one-agent network (`partner-demo/agent-manifest.json`, `maple_street_billing_help.network.json`).
4. After publishing, fetch each manifest, network JSON and `links.json` with `curl` and check for HTTP 200 and `access-control-allow-origin`.

## Known limits, stated plainly

- **allowed_peers becomes the whole jsDelivr origin.** The runtime checks `allowed_peers` by origin, not by path. With jsDelivr that origin covers every repository on it. Appeal Desk closes this gap in the page: `js/app.js` refuses any address that is not exactly one of the bindings in `links.json` (plus the two test-only copies). `test-web.mjs` checks that an unlisted path on the same host is refused before any request is made. The vendored runtime itself is unchanged.
- **Tool-name collision.** The runtime derives a tool name from the URL path, cut to 60 characters. The short `ad/` folder keeps the three names apart (they differ before the 60th character); `build.mjs` stops with an error if a set would collide.
- **The partner page is not a third origin once deployed.** On the public site `partner-demo/` sits beside the main site (same origin). It is a small agent site of its own that loads the rules from another origin (jsDelivr). The local tests keep three origins.
- **Checks 1 and 2 need the live site.** An ordinary HTTPS host, and a run with the published default router and model, can only be shown after deployment.
