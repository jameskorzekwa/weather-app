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
 * Config:
 *   type: custom:weather-app-card
 *   addon: <optional addon slug>   # auto-detected when omitted
 */

const INGRESS_PATH = "/api/hassio_ingress/";

class WeatherAppCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._explicitSlug = this._config.addon || null;
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
    await this._createSession();
    this._iframe.src = ingressUrl;
    // Keep the ingress session alive; recreate it if it lapses.
    this._timer = window.setInterval(() => {
      this._validateSession().catch(() => {});
    }, 60000);
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
