/*
 * weather-app-selfheal
 * --------------------
 * A tiny page-level watchdog, loaded on every Home Assistant frontend page
 * via the "extra module" mechanism — independent of the dashboard card.
 *
 * The weather dashboard embeds the add-on through a custom Lovelace card
 * (weather-app-card). That card has its own watchdog that recovers the
 * embed from a 502 / stuck splash — but only once the card itself has
 * loaded. If the card module ever fails to load — most commonly after a
 * Home Assistant update changes the frontend and a 24/7 kiosk tablet is
 * left on a stale cached session — the dashboard shows "Configuration
 * error" and the in-card watchdog can't help, because the card never ran.
 *
 * This script runs outside the card. When the weather dashboard shows a
 * broken/missing card for longer than the grace period, it clears the
 * stale frontend service worker + caches and reloads the page, so a wall
 * tablet recovers on its own instead of sitting on the error until someone
 * manually refreshes it.
 *
 * It is deliberately conservative: it only ever acts on the weather
 * dashboard, only after a long grace period (so a normal slow load is
 * never reloaded), and at most once every few minutes (so a persistent
 * problem can't become a reload loop).
 */
(function () {
  "use strict";

  var DASH = "/weather-wall"; // url_path of the integration's dashboard
  var CHECK_INTERVAL_MS = 30 * 1000;
  var GRACE_MS = 90 * 1000; // must look broken this long before acting
  var MIN_RECOVER_GAP_MS = 5 * 60 * 1000; // never reload more often than this

  var brokenSince = 0;
  var lastRecover = 0;

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
    // 1) The card's custom element never registered — its module failed to
    //    load (e.g. stale frontend cache after an HA update).
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

  function reloadFresh() {
    try {
      location.reload();
    } catch (e) {
      /* ignore */
    }
  }

  function recover() {
    var now = Date.now();
    if (now - lastRecover < MIN_RECOVER_GAP_MS) return;
    lastRecover = now;
    // Clear the frontend service worker + caches so the reload pulls a fresh
    // (post-update) frontend instead of the stale cached one.
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
        brokenSince = 0;
        return;
      }
      var now = Date.now();
      if (!brokenSince) {
        brokenSince = now;
      } else if (now - brokenSince > GRACE_MS) {
        brokenSince = 0;
        recover();
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
