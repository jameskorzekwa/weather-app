/*
 * weather-app-selfheal
 * --------------------
 * A tiny page-level watchdog, loaded on every Home Assistant frontend page
 * via the "extra module" mechanism — independent of the dashboard card.
 *
 * The weather dashboard embeds the add-on through a custom Lovelace card
 * (weather-app-card). That card has its own watchdog that recovers the
 * embed from a 502 / stuck splash — but only once the card itself has
 * loaded and rendered. The failure this script handles is the dashboard
 * showing "Configuration error" / "Custom element doesn't exist:
 * weather-app-card", i.e. the card's custom element isn't defined at the
 * moment the view paints. The in-card watchdog can't help there, because
 * the card never ran.
 *
 * Two ways that happens, and we treat them differently:
 *
 *   1) FIRST-RENDER RACE (common). The card module *does* load, but the
 *      panel-mode view paints before `customElements.define(...)` runs, so
 *      the first paint is an error card. This is exactly the case you fix
 *      by hand by switching to another dashboard and back: a re-render,
 *      with the element now defined, succeeds — no page reload needed.
 *      => Stage 1: a "soft re-render" that bounces to another panel and
 *         back via HA's SPA router. Cheap, fast, non-disruptive.
 *
 *   2) MODULE GENUINELY MISSING (rarer). The module wasn't fetched at all
 *      — e.g. a stale frontend service-worker shell after an HA frontend
 *      change. A re-render can't conjure an undefined element, so the soft
 *      bounce won't fix it.
 *      => Stage 2: a "hard recover" that clears the service worker + caches
 *         and reloads, so the browser refetches a fresh shell + module.
 *
 * We always try the cheap fix first and only escalate to the reload if the
 * soft bounce doesn't take. It is deliberately conservative: it only ever
 * acts on the weather dashboard, only after a grace period (so a normal
 * slow load is never disturbed), and rate-limits the heavy reload so a
 * persistent problem can't become a reload loop.
 */
(function () {
  "use strict";

  var DASH = "/weather-wall"; // url_path of the integration's dashboard
  var CHECK_INTERVAL_MS = 10 * 1000; // cheap DOM check; snappy detection
  var SOFT_GRACE_MS = 20 * 1000; // broken this long -> soft re-render
  var SOFT_GAP_MS = 15 * 1000; // min spacing between soft re-renders
  var MAX_SOFT_TRIES = 2; // soft attempts before escalating to a reload
  var HARD_GRACE_MS = 90 * 1000; // still broken this long -> hard reload
  var MIN_HARD_GAP_MS = 5 * 60 * 1000; // never hard-reload more often than this

  var brokenSince = 0; // when the dashboard first looked broken (0 = healthy)
  var softTries = 0; // soft re-renders attempted in the current broken spell
  var lastSoftAt = 0; // timestamp of the last soft re-render
  var lastHardAt = 0; // timestamp of the last hard reload

  function deepFind(root, tag) {
    if (!root || !root.querySelectorAll) return null;
    var direct = root.querySelector(tag);
    if (direct) return direct;
    var all = root.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      if (all[i].shadowRoot) {
        var found = deepFind(all[i].shadowRoot, tag);
        if (found) return found;
      }
    }
    return null;
  }

  function onWeatherDashboard() {
    return location.pathname.indexOf(DASH) === 0;
  }

  function dashboardBroken() {
    if (!onWeatherDashboard()) return false;
    // 1) The card's custom element isn't defined — either its module hasn't
    //    loaded yet (a first-render race) or it failed to load entirely.
    if (!customElements.get("weather-app-card")) return true;
    // 2) An error card is rendered where our card should be.
    var err = deepFind(document, "hui-error-card");
    if (err) {
      var t = (err.textContent || "").toLowerCase();
      if (
        t.indexOf("weather-app-card") !== -1 ||
        t.indexOf("configuration error") !== -1 ||
        t.indexOf("custom element") !== -1
      ) {
        return true;
      }
    }
    return false;
  }

  // Tell Home Assistant's SPA router the location changed, so it re-resolves
  // the route without a full page load. This is the same event custom cards
  // fire for navigation (`fireEvent(node, "location-changed")`); HA listens
  // for it on window.
  function fireLocationChanged() {
    try {
      var ev = new Event("location-changed", {
        bubbles: true,
        composed: true,
      });
      ev.detail = { replace: false };
      window.dispatchEvent(ev);
    } catch (e) {
      /* ignore */
    }
  }

  function spaNavigate(path) {
    try {
      history.pushState(null, "", path);
    } catch (e) {
      /* ignore */
    }
    fireLocationChanged();
  }

  // Stage 1: mimic the manual "switch to another dashboard and back" fix.
  // Bounce to the user's profile panel (always exists, side-effect free),
  // which tears down the weather panel, then return — forcing HA to rebuild
  // the view with the (now-defined) card element. If the location-changed
  // event isn't honored, we simply end up back on the weather URL unchanged
  // and Stage 2 takes over later; no harm done.
  function softRerender() {
    if (!onWeatherDashboard()) return;
    var back = location.pathname + location.search;
    spaNavigate("/profile");
    window.setTimeout(function () {
      spaNavigate(back);
    }, 350);
  }

  function reloadFresh() {
    try {
      location.reload();
    } catch (e) {
      /* ignore */
    }
  }

  // Stage 2: clear the frontend service worker + caches so the reload pulls a
  // fresh (post-change) shell + card module instead of the stale cached one.
  function hardRecover() {
    var jobs = [];
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        jobs.push(
          navigator.serviceWorker
            .getRegistrations()
            .then(function (regs) {
              return Promise.all(
                regs.map(function (r) {
                  return r.unregister();
                })
              );
            })
            .catch(function () {})
        );
      }
      if (window.caches && caches.keys) {
        jobs.push(
          caches
            .keys()
            .then(function (keys) {
              return Promise.all(
                keys.map(function (k) {
                  return caches.delete(k);
                })
              );
            })
            .catch(function () {})
        );
      }
    } catch (e) {
      /* ignore */
    }
    if (jobs.length) {
      Promise.all(jobs).then(reloadFresh, reloadFresh);
    } else {
      reloadFresh();
    }
  }

  function tick() {
    try {
      if (!dashboardBroken()) {
        // Healthy (or not on the dashboard) — reset the broken spell.
        brokenSince = 0;
        softTries = 0;
        return;
      }

      var now = Date.now();
      if (!brokenSince) {
        brokenSince = now; // start of a broken spell
        return;
      }
      var brokenFor = now - brokenSince;

      // Stage 1: cheap soft re-render first (the manual workaround).
      if (
        softTries < MAX_SOFT_TRIES &&
        brokenFor > SOFT_GRACE_MS &&
        now - lastSoftAt > SOFT_GAP_MS
      ) {
        softTries++;
        lastSoftAt = now;
        softRerender();
        return;
      }

      // Stage 2: soft bounce didn't take and we've been broken a while —
      // clear caches and reload. Rate-limited so it can't loop.
      if (brokenFor > HARD_GRACE_MS && now - lastHardAt > MIN_HARD_GAP_MS) {
        lastHardAt = now;
        hardRecover();
      }
    } catch (e) {
      /* a watchdog must never throw */
    }
  }

  if (!window.__weatherAppSelfHeal) {
    window.__weatherAppSelfHeal = true;
    setInterval(tick, CHECK_INTERVAL_MS);
  }
})();
