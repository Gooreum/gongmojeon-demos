// netlog.js - records every request this page sends to another origin (URL, method, body size).
// It feeds the "Requests sent" panel with real numbers, not claims. It never changes a request.
// Classic script, loaded first. Apache-2.0.
(function () {
  var log = (window.__appealNet = []);
  var orig = window.fetch.bind(window);
  window.fetch = function (input, init) {
    try {
      var url = typeof input === "string" ? input : (input && input.url) || String(input);
      var u = new URL(url, location.href);
      if (u.origin !== location.origin) {
        var body = init && typeof init.body === "string" ? init.body : "";
        log.push({ url: u.href, origin: u.origin, method: (init && init.method) || (input && input.method) || "GET", bytes: new Blob([body]).size, body: body.slice(0, 300000) });
        window.dispatchEvent(new CustomEvent("appeal-net"));
      }
    } catch (e) { /* logging must never break a request */ }
    return orig(input, init);
  };
})();
