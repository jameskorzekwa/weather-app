"""Weather App Dashboard integration.

Makes the Weather App add-on turnkey as a Home Assistant dashboard:

  1. Serves + registers a small Lovelace card (`custom:weather-app-card`) that
     embeds the add-on's ingress UI over HA's own HTTPS origin — no HACS card
     install, no mixed-content, no rotating-token URL to manage.
  2. Auto-creates a "Weather" Lovelace dashboard (panel mode) that uses that
     card, so it shows up in the sidebar and can be set as a default dashboard.

Everything here is best-effort and defensive: a failure to create the
dashboard must never take down the rest of Home Assistant.
"""

from __future__ import annotations

import hashlib
import logging
import os
from pathlib import Path

import aiohttp

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CARD_FILENAME,
    CARD_URL,
    DASHBOARD_ICON,
    DASHBOARD_TITLE,
    DASHBOARD_URL_PATH,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

# hass.data flag so the card's static path + frontend module are only
# registered once per HA session (not on every config-entry reload).
_CARD_REGISTERED_KEY = f"{DOMAIN}_card_registered"

# Config-entry data flag: set once we've hidden the add-on's own sidebar
# panel, so we don't re-hide it on every restart and fight a user who has
# deliberately turned it back on.
_PANEL_HIDDEN_FLAG = "addon_sidebar_panel_hidden"

# The Supervisor is reachable at this host (with the SUPERVISOR_TOKEN env
# var) from inside the Home Assistant Core container on supervised installs.
_SUPERVISOR = "http://supervisor"

# The dashboard config: one panel-mode view holding the single full-screen card.
_DASHBOARD_CONFIG = {
    "views": [
        {
            "title": DASHBOARD_TITLE,
            "panel": True,
            "cards": [{"type": "custom:weather-app-card"}],
        }
    ]
}


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the integration from a config entry."""
    await _async_register_card(hass)
    await _async_ensure_dashboard(hass)
    await _async_hide_addon_panel_once(hass, entry)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove the dashboard when the integration is removed."""
    await _async_remove_dashboard(hass)
    return True


async def _async_register_card(hass: HomeAssistant) -> None:
    """Serve the card JS and make Lovelace load it before rendering cards.

    The card is registered as a Lovelace **resource** (the same mechanism
    HACS cards use), NOT via `add_extra_js_url`. Resources are loaded by the
    Lovelace engine *before* any card renders, so the custom element is
    guaranteed defined in time. `add_extra_js_url` loads the module at app
    boot instead, which races a panel-mode dashboard's first render — when
    the module loses that race (e.g. a cold load with no service-worker
    cache) the view shows "Configuration error" and never retries.

    Falls back to `add_extra_js_url` only when the resource collection isn't
    writable (a YAML-managed `lovelace: resources:` setup).

    Idempotent across config-entry reloads (aiohttp refuses to register the
    same static GET route twice), guarded by a hass.data flag.
    """
    if hass.data.get(_CARD_REGISTERED_KEY):
        return

    card_path = Path(__file__).parent / CARD_FILENAME
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_path), False)]
    )

    if await _async_register_card_resource(hass, card_path):
        _LOGGER.debug("Registered weather-app-card as a Lovelace resource")
    else:
        # Fallback for YAML resource mode: load at boot (racy, but works
        # once the browser has the module cached).
        frontend.add_extra_js_url(hass, f"{CARD_URL}?v={_card_version(card_path)}")
        _LOGGER.debug("Registered weather-app-card as an extra JS module")

    hass.data[_CARD_REGISTERED_KEY] = True


async def _async_register_card_resource(
    hass: HomeAssistant, card_path: Path
) -> bool:
    """Add (or update) the card in Lovelace resources, with a versioned URL.

    The resource URL carries a `?v=<content hash>` so a card update busts the
    browser cache: the file is served without no-cache headers, so an
    unversioned URL would keep serving the *old* card to a long-running
    kiosk that never gets a hard refresh. When the card changes, the hash
    changes, the resource URL changes, and the next dashboard load fetches
    the new module.

    Returns False when the resource collection is unavailable or read-only
    (YAML mode), so the caller can fall back to an extra-JS module URL.
    """
    try:
        from homeassistant.components.lovelace import (  # noqa: PLC0415
            LOVELACE_DATA,
        )
    except ImportError:  # pragma: no cover - depends on HA internals
        return False

    lovelace_data = hass.data.get(LOVELACE_DATA)
    resources = getattr(lovelace_data, "resources", None)
    if resources is None:
        return False

    # Lovelace loads the collection at startup, but be defensive.
    try:
        if not getattr(resources, "loaded", True):
            await resources.async_load()
    except Exception:  # noqa: BLE001
        return False

    versioned_url = f"{CARD_URL}?v={_card_content_version(card_path)}"

    try:
        items = list(resources.async_items())
    except Exception:  # noqa: BLE001
        return False

    existing = next(
        (i for i in items if (i.get("url") or "").split("?", 1)[0] == CARD_URL),
        None,
    )

    # Only storage-mode collections support create/update; YAML mode raises.
    try:
        if existing is None:
            await resources.async_create_item(
                {"res_type": "module", "url": versioned_url}
            )
        elif existing.get("url") != versioned_url:
            await resources.async_update_item(
                existing["id"], {"res_type": "module", "url": versioned_url}
            )
    except Exception:  # noqa: BLE001
        return False
    return True


def _card_content_version(card_path: Path) -> str:
    """Short content hash of the card file, for cache-busting the resource URL."""
    try:
        return hashlib.sha256(card_path.read_bytes()).hexdigest()[:10]
    except OSError:
        return "0"


def _card_version(card_path: Path) -> str:
    """Cheap content hash so the extra-JS URL changes when the card changes."""
    try:
        return str(int(card_path.stat().st_mtime))
    except OSError:
        return "0"


async def _async_hide_addon_panel_once(
    hass: HomeAssistant, entry: ConfigEntry
) -> None:
    """Turn off the Weather App add-on's own ingress sidebar panel.

    The integration provides a proper "Weather" dashboard, so the add-on's
    auto-registered sidebar entry is redundant. Home Assistant add-on
    configs can't ship with that panel disabled by default (there's no
    `ingress_panel` config.yaml key — the Supervisor defaults ingress
    add-ons to *shown*), so we flip it off here via the Supervisor API.

    Done only once per config entry (tracked in entry.data) so a user who
    deliberately re-enables "Show in sidebar" on the add-on isn't overridden
    on the next restart. No-ops cleanly when not running under the
    Supervisor (e.g. HA Core in a plain container).
    """
    if entry.data.get(_PANEL_HIDDEN_FLAG):
        return

    token = os.environ.get("SUPERVISOR_TOKEN")
    if not token:
        return  # not a supervised install — no add-ons to manage

    slug = await _async_resolve_addon_slug(hass, token)
    if not slug:
        _LOGGER.debug("Weather App add-on not found; leaving sidebar as-is")
        return

    session = async_get_clientsession(hass)
    headers = {"Authorization": f"Bearer {token}"}
    try:
        async with session.post(
            f"{_SUPERVISOR}/addons/{slug}/options",
            headers=headers,
            json={"ingress_panel": False},
            timeout=aiohttp.ClientTimeout(total=15),
        ) as resp:
            if resp.status != 200:
                _LOGGER.debug(
                    "Could not hide add-on sidebar panel (HTTP %s)", resp.status
                )
                return
    except (aiohttp.ClientError, TimeoutError):
        _LOGGER.debug("Could not reach Supervisor to hide add-on panel", exc_info=True)
        return

    # Remember we've done it so we don't fight a manual re-enable later.
    hass.config_entries.async_update_entry(
        entry, data={**entry.data, _PANEL_HIDDEN_FLAG: True}
    )
    _LOGGER.info(
        "Hid the Weather App add-on's sidebar panel (the integration's "
        "Weather dashboard replaces it)"
    )


async def _async_resolve_addon_slug(hass: HomeAssistant, token: str) -> str | None:
    """Find the installed add-on whose slug ends with `_weather_app`."""
    session = async_get_clientsession(hass)
    try:
        async with session.get(
            f"{_SUPERVISOR}/addons",
            headers={"Authorization": f"Bearer {token}"},
            timeout=aiohttp.ClientTimeout(total=15),
        ) as resp:
            if resp.status != 200:
                return None
            payload = await resp.json()
    except (aiohttp.ClientError, TimeoutError, ValueError):
        return None

    addons = (payload.get("data") or {}).get("addons") or []
    for addon in addons:
        slug = addon.get("slug")
        if isinstance(slug, str) and slug.endswith("_weather_app"):
            return slug
    return None


async def _async_ensure_dashboard(hass: HomeAssistant) -> None:
    """Create the Weather dashboard if it doesn't already exist."""
    # Imported lazily: these are lovelace-internal helpers and we want a clean
    # failure (logged, non-fatal) if a future HA release moves them.
    try:
        from homeassistant.components.lovelace import (  # noqa: PLC0415
            LOVELACE_DATA,
            _register_panel,
            dashboard as ll_dashboard,
        )
        from homeassistant.components.lovelace.const import (  # noqa: PLC0415
            MODE_STORAGE,
        )
    except ImportError:  # pragma: no cover - depends on HA internals
        _LOGGER.warning(
            "Could not import lovelace internals; skipping automatic dashboard "
            "creation. Add a dashboard with a `custom:weather-app-card` manually."
        )
        return

    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is None:
        _LOGGER.warning("Lovelace not ready; skipping dashboard creation")
        return

    if DASHBOARD_URL_PATH in lovelace_data.dashboards:
        _LOGGER.debug("Dashboard %s already exists", DASHBOARD_URL_PATH)
        return

    # Persist the dashboard via its own collection (writes to the same store
    # lovelace reads on startup).
    collection = ll_dashboard.DashboardsCollection(hass)
    await collection.async_load()

    existing = next(
        (
            item
            for item in collection.async_items()
            if item.get("url_path") == DASHBOARD_URL_PATH
        ),
        None,
    )
    if existing is None:
        try:
            existing = await collection.async_create_item(
                {
                    "url_path": DASHBOARD_URL_PATH,
                    "title": DASHBOARD_TITLE,
                    "icon": DASHBOARD_ICON,
                    "show_in_sidebar": True,
                    "require_admin": False,
                }
            )
        except Exception:  # noqa: BLE001 - never break HA setup over a dashboard
            _LOGGER.exception("Failed to create the Weather dashboard")
            return

    # Register it in the *running* session so it appears without a 2nd restart,
    # mirroring lovelace's own storage_dashboard_changed(ADDED) handler.
    try:
        if DASHBOARD_URL_PATH not in lovelace_data.dashboards:
            store = ll_dashboard.LovelaceStorage(hass, existing)
            lovelace_data.dashboards[DASHBOARD_URL_PATH] = store
            _register_panel(hass, DASHBOARD_URL_PATH, MODE_STORAGE, existing, False)
        else:
            store = lovelace_data.dashboards[DASHBOARD_URL_PATH]
        # Seed the dashboard's contents.
        await store.async_save(_DASHBOARD_CONFIG)
        _LOGGER.info("Created Weather dashboard at /%s", DASHBOARD_URL_PATH)
        _notify_hard_refresh(hass)
    except Exception:  # noqa: BLE001
        _LOGGER.exception(
            "Created the Weather dashboard in storage but failed to register it "
            "live; it should appear after a Home Assistant restart"
        )


def _notify_hard_refresh(hass: HomeAssistant) -> None:
    """Tell the user to hard-refresh once.

    HA's frontend service worker caches the app shell, so a freshly added
    frontend module (our card) often isn't picked up until the browser does
    a hard reload. Surface that instead of leaving them staring at a blank
    dashboard.
    """
    try:
        from homeassistant.components import (  # noqa: PLC0415
            persistent_notification,
        )

        persistent_notification.async_create(
            hass,
            (
                "A **Weather** dashboard was created. If it looks blank, do a "
                "**hard refresh** of your browser once (Ctrl/Cmd+Shift+R) so it "
                "picks up the new card, then set it as your default dashboard "
                "under **Profile → Dashboard** if you like."
            ),
            title="Weather App Dashboard",
            notification_id=f"{DOMAIN}_setup",
        )
    except Exception:  # noqa: BLE001
        pass


async def _async_remove_dashboard(hass: HomeAssistant) -> None:
    """Best-effort removal of the dashboard when the integration is removed."""
    try:
        from homeassistant.components.lovelace import (  # noqa: PLC0415
            LOVELACE_DATA,
            dashboard as ll_dashboard,
        )
    except ImportError:  # pragma: no cover
        return

    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is None:
        return

    collection = ll_dashboard.DashboardsCollection(hass)
    await collection.async_load()
    item = next(
        (
            i
            for i in collection.async_items()
            if i.get("url_path") == DASHBOARD_URL_PATH
        ),
        None,
    )
    if item is not None:
        try:
            await collection.async_delete_item(item["id"])
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Failed to delete the Weather dashboard")

    if DASHBOARD_URL_PATH in lovelace_data.dashboards:
        frontend.async_remove_panel(hass, DASHBOARD_URL_PATH)
        lovelace_data.dashboards.pop(DASHBOARD_URL_PATH, None)
