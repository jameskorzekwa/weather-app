# Weather App Dashboard (Home Assistant integration)

A companion **custom integration** for the [Weather App add-on](../../homeassistant/).
Where the add-on provides the weather UI (as an ingress sidebar panel), this
integration makes it turnkey as a **dashboard** — no HACS card to install by
hand, no YAML to paste, no mixed-content headaches.

On setup it:

1. Registers a small Lovelace card (`custom:weather-app-card`) that embeds the
   add-on's ingress UI over Home Assistant's own HTTPS origin. The card creates
   and refreshes the ingress session itself, so the embed keeps working as the
   session token rotates. (Ingress session handling adapted from
   [ha-addon-iframe-card](https://github.com/lovelylain/ha-addon-iframe-card),
   Apache-2.0.)
2. Creates a panel-mode **"Weather"** dashboard that uses that card. Because
   it's a real Lovelace dashboard (not an `app`/ingress panel), you *can* set it
   as your default dashboard in **Profile → Dashboard**.

## Prerequisites

- The **Weather App add-on** installed and started (the integration auto-detects
  the add-on whose slug ends with `_weather_app`).
- Home Assistant 2024.7 or newer.

## Install

**Via HACS (recommended):** HACS → ⋮ → Custom repositories → add
`https://github.com/jameskorzekwa/weather-app` with category **Integration** →
download **Weather App Dashboard** → restart Home Assistant.

**Manual:** copy `custom_components/weather_app/` into your HA `config/custom_components/`
folder and restart Home Assistant.

Then: **Settings → Devices & Services → Add Integration → Weather App Dashboard**
→ Submit. A "Weather" dashboard appears in the sidebar; set it as your default
in **Profile → Dashboard** if you want it as your landing page.

## Notes

- **If the dashboard looks blank right after install, hard-refresh your
  browser once** (Ctrl/Cmd+Shift+R). Home Assistant's frontend service worker
  caches the app shell, so a newly added card module isn't always picked up
  until the next hard reload. The integration also posts a notification
  reminding you of this.
- The dashboard embeds the add-on over **ingress**, so it stays behind HA auth
  and per-user monochrome still works.
- **Self-healing on a kiosk:** the card health-checks the add-on every ~30s and
  automatically reloads the embed if it gets stuck on a transient error (e.g.
  a brief 502 while the add-on auto-updates overnight, or an expired ingress
  session). So a wall tablet won't sit on a dead page until someone
  re-navigates to it. Tune or disable via `watchdog_interval: <seconds>` on the
  card.
- On first setup the integration **hides the add-on's own sidebar panel**
  ("Show in sidebar" → off), since this integration's *Weather* dashboard
  replaces it — otherwise you'd get two "Weather" entries. It only does this
  once, so if you deliberately turn the add-on panel back on it won't be
  overridden. (HA add-ons can't ship with that panel off by default, so the
  integration flips it via the Supervisor API.)
- Removing the integration removes the dashboard it created.
- The card auto-detects the add-on; to pin a specific slug, edit the card and
  set `addon: <slug>`.
