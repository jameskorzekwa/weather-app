/*
 * weather-app-card
 * ----------------
 * A Lovelace card that embeds the "Weather App" Home Assistant add-on's UI
 * (served over ingress) in an iframe — over the same HTTPS origin as Home
 * Assistant, so there's no mixed-content issue and no rotating-token URL to
 * manage by hand.
 *
 * The ingress session handling (create session -> set `ingress_session`
 * cookie -> periodically re-validate) is adapted from ha-addon-iframe-card
 * by lovelylain, which is licensed Apache-2.0:
 *   https://github.com/lovelylain/ha-addon-iframe-card
 *
 * Watchdog: on a long-running kiosk the embedded page can get stuck on a
 * transient error (a 502 while the add-on briefly restarts for an
 * auto-update, an expired ingress session, etc.) and never recover on its
 * own, because an <iframe> doesn't retry a failed load. This card
 * health-checks the add-on every WATCHDOG_INTERVAL and reloads the iframe
 * once the add-on is reachable again — so the dashboard self-heals instead
 * of sitting on a dead page until someone re-navigates to it.
 *
 * Config:
 *   type: custom:weather-app-card
 *   addon: <optional addon slug>     # auto-detected when omitted
 *   watchdog_interval: <seconds>     # health-check cadence (default 30)
 */

const INGRESS_PATH = "/api/hassio_ingress/";
const DEFAULT_WATCHDOG_INTERVAL = 30; // seconds
// If the add-on is reachable but the embed shows less than this much text for
// longer than STUCK_TIMEOUT_MS, treat it as stuck (e.g. loaded but its initial
// data fetch failed, leaving it on the splash) and reload it. The fully
// rendered app has ~180 chars of text; the splash/blank has almost none.
const EMBED_CONTENT_MIN = 40;
const STUCK_TIMEOUT_MS = 90 * 1000;

class WeatherAppCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._explicitSlug = this._config.addon || null;
    const wi = Number(this._config.watchdog_interval);
    this._watchdogInterval =
      Number.isFinite(wi) && wi >= 5 ? wi * 1000 : DEFAULT_WATCHDOG_INTERVAL * 1000;
    if (!this._built) {
      this._built = true;
      this._root = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent =
        ":host{display:block;height:100%;}" +
        ".wrap{position:relative;width:100%;height:100%;min-height:60vh;}" +
        "iframe{width:100%;height:100%;border:0;display:block;}" +
        ".msg{padding:16px;font-family:var(--paper-font-body1_-_font-family,sans-serif);" +
        "color:var(--error-color,#db4437);}";
      this._wrap = document.createElement("div");
      this._wrap.className = "wrap";
      this._iframe = document.createElement("iframe");
      this._iframe.setAttribute("allow", "fullscreen; geolocation");
      this._iframe.setAttribute("title", "Weather App");
      // The iframe firing an error means the load failed at the network
      // level; flag it so the watchdog reloads once the add-on is back.
      this._iframe.addEventListener("error", () => {
        this._iframeErrored = true;
      });
      // After each (re)load, if it landed on an nginx/ingress error page,
      // nudge the watchdog so we don't wait a full interval to recover.
      this._iframe.addEventListener("load", () => {
        this._iframeErrored = false;
        if (this._looksBroken()) {
          window.setTimeout(() => this._watchdogTick().catch(() => {}), 1500);
        }
      });
      this._wrap.appendChild(this._iframe);
      this._root.appendChild(style);
      this._root.appendChild(this._wrap);
    }
  }

  // Panel-mode dashboards ask for a size; return a large value so the card
  // fills the view.
  getCardSize() {
    return 12;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initStarted) {
      this._initStarted = true;
      this._init().catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[weather-app-card] init failed:", err);
        this._showMessage(
          "Weather App card failed to initialize. See the browser console for details."
        );
      });
    }
  }

  async _resolveSlug() {
    if (this._explicitSlug) return this._explicitSlug;
    const data = await this._hass.callWS({
      type: "supervisor/api",
      endpoint: "/addons",
      method: "get",
    });
    const addons = (data && data.addons) || [];
    const match = addons.find(
      (a) => typeof a.slug === "string" && a.slug.endsWith("_weather_app")
    );
    return match ? match.slug : null;
  }

  _setIngressCookie(session) {
    document.cookie =
      "ingress_session=" +
      session +
      ";path=" +
      INGRESS_PATH +
      ";SameSite=Strict" +
      (location.protocol === "https:" ? ";Secure" : "");
  }

  async _createSession() {
    const resp = await this._hass.callWS({
      type: "supervisor/api",
      endpoint: "/ingress/session",
      method: "post",
    });
    this._session = resp.session;
    this._setIngressCookie(this._session);
  }

  async _validateSession() {
    try {
      await this._hass.callWS({
        type: "supervisor/api",
        endpoint: "/ingress/validate_session",
        method: "post",
        data: { session: this._session },
      });
      this._setIngressCookie(this._session);
    } catch (err) {
      await this._createSession();
    }
  }

  async _init() {
    const slug = await this._resolveSlug();
    if (!slug) {
      this._showMessage(
        "Weather App add-on not found. Install it from the add-on store and start it."
      );
      return;
    }
    this._slug = slug;
    const info = await this._hass.callWS({
      type: "supervisor/api",
      endpoint: "/addons/" + slug + "/info",
      method: "get",
    });
    const ingressUrl = info && info.ingress_url;
    if (!ingressUrl) {
      this._showMessage(
        "The Weather App add-on isn't exposing an ingress URL. Start the add-on, then reload."
      );
      return;
    }
    this._ingressUrl = ingressUrl;
    this._lastHealthy = true;
    this._iframeErrored = false;
    this._stuckSince = 0;
    await this._createSession();
    this._iframe.src = ingressUrl;
    // Single loop: keep the ingress session alive AND watchdog the embed.
    this._timer = window.setInterval(
      () => this._watchdogTick().catch(() => {}),
      this._watchdogInterval
    );
  }

  // Health-check URL: append a query param so the add-on's nginx proxies
  // straight through to Next.js instead of serving its `/` -> `/?params`
  // redirect (which answers 302 even when Next.js is down). This makes the
  // check reflect what the iframe actually depends on.
  _healthUrl() {
    return (
      this._ingressUrl + (this._ingressUrl.includes("?") ? "&" : "?") + "wa_health=1"
    );
  }

  // Best-effort: is the iframe currently showing a server error page?
  // The embed is same-origin (ingress), so we can read its document. nginx /
  // ingress 5xx pages are short and contain the status text.
  _looksBroken() {
    try {
      const doc = this._iframe.contentDocument;
      if (!doc || !doc.body) return false;
      const txt = (doc.body.innerText || doc.body.textContent || "").trim();
      if (!txt) return false; // blank — can't conclude; health-check handles it
      return (
        txt.length < 600 &&
        /\b(50[234])\b|bad gateway|gateway time-?out|service unavailable/i.test(txt)
      );
    } catch (e) {
      return false; // inaccessible — don't assume broken
    }
  }

  // Re-resolve the add-on's ingress URL. HA can rotate the ingress token when
  // the add-on restarts (e.g. after an HA reboot or an add-on update), which
  // leaves the cached _ingressUrl pointing at a dead session. A request to a
  // dead ingress URL is proxied to the add-on WITHOUT the X-Remote-User-*
  // headers it uses to decide per-user monochrome — so the embed comes back in
  // color instead of mono. Refetch the URL before a recovery reload so the
  // reload behaves like a fresh init (which is why the manual "switch
  // dashboards and back" workaround fixes it).
  async _refreshIngressUrl() {
    const slug = this._slug || (await this._resolveSlug());
    if (!slug) return;
    this._slug = slug;
    const info = await this._hass.callWS({
      type: "supervisor/api",
      endpoint: "/addons/" + slug + "/info",
      method: "get",
    });
    if (info && info.ingress_url) {
      this._ingressUrl = info.ingress_url;
    }
  }

  _reloadIframe() {
    if (this._reloading) return;
    this._reloading = true;
    // Recover like a fresh init, not a bare reload. Re-resolve the ingress URL
    // (the token may have rotated across an add-on restart) AND establish a
    // valid, user-scoped ingress session BEFORE pointing the iframe at it. If
    // either step fails — common in the seconds after an HA reboot, before
    // Supervisor is ready — do NOT load a stale/unauthenticated URL: that's
    // what strips the X-Remote-User-* header and brings the embed back in
    // color, and because a rendered-but-wrong page never trips the watchdog it
    // stays stuck. Instead leave the current page up and flag for a retry on
    // the next healthy tick.
    (async () => {
      try {
        await this._refreshIngressUrl();
        await this._createSession();
      } catch (e) {
        // Couldn't re-establish the session yet — force the next healthy
        // watchdog tick to retry rather than leaving it on a stale page.
        this._iframeErrored = true;
        this._reloading = false;
        return;
      }
      const url = this._ingressUrl;
      try {
        this._iframe.src = "about:blank";
      } catch (e) {
        /* ignore */
      }
      window.setTimeout(() => {
        try {
          this._iframe.src = url;
        } catch (e) {
          /* ignore */
        }
        this._iframeErrored = false;
        this._reloading = false;
      }, 100);
    })();
  }

  // True if the embed has rendered real content (vs sitting on the splash or
  // a blank/black screen). Same-origin, so we can read the document.
  _embedHasContent() {
    try {
      const doc = this._iframe.contentDocument;
      if (!doc || !doc.body) return false;
      return (doc.body.innerText || "").trim().length >= EMBED_CONTENT_MIN;
    } catch (e) {
      return true; // can't inspect (mid-navigation) — don't reload blindly
    }
  }

  async _watchdogTick() {
    if (!this._ingressUrl) return;
    // Keep the ingress session fresh.
    await this._validateSession().catch(() => {});

    let healthy = false;
    try {
      const resp = await fetch(this._healthUrl(), {
        cache: "no-store",
        redirect: "follow",
      });
      healthy = resp.ok; // 2xx => Next.js answered
    } catch (e) {
      healthy = false; // network error => add-on unreachable
    }

    const iframeBad = this._iframeErrored || this._looksBroken();

    if (healthy) {
      // Add-on is reachable.
      if (iframeBad || this._lastHealthy === false) {
        // Stuck on a server error, or recovering from a down add-on.
        this._reloadIframe();
        this._stuckSince = 0;
      } else if (this._embedHasContent()) {
        // Rendering fine — leave it alone (no kiosk flicker).
        this._stuckSince = 0;
      } else {
        // Reachable, but the embed shows no real content — stuck on the
        // splash or blank (e.g. its initial data fetch failed). Give it a
        // grace period, then reload; the reload re-runs the app's fetches,
        // which typically succeed on retry.
        const now = Date.now();
        if (!this._stuckSince) {
          this._stuckSince = now;
        } else if (now - this._stuckSince > STUCK_TIMEOUT_MS) {
          this._reloadIframe();
          this._stuckSince = 0;
        }
      }
      this._lastHealthy = true;
    } else {
      // Add-on down — don't thrash; the reload happens on the next tick that
      // sees it healthy again.
      this._lastHealthy = false;
      this._stuckSince = 0;
    }
  }

  _showMessage(text) {
    if (this._timer) {
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
    this._wrap.innerHTML = "";
    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = text;
    this._wrap.appendChild(div);
  }

  disconnectedCallback() {
    if (this._timer) {
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
  }
}

if (!customElements.get("weather-app-card")) {
  customElements.define("weather-app-card", WeatherAppCard);
}

// Make it discoverable in the dashboard card picker.
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "weather-app-card")) {
  window.customCards.push({
    type: "weather-app-card",
    name: "Weather App Card",
    description:
      "Embeds the Weather App add-on's dashboard (over ingress) full-screen.",
    preview: false,
  });
}
