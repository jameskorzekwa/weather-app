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

import logging
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

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
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove the dashboard when the integration is removed."""
    await _async_remove_dashboard(hass)
    return True


async def _async_register_card(hass: HomeAssistant) -> None:
    """Serve the card JS and load it on the frontend (no HACS needed).

    Idempotent across config-entry reloads: aiohttp refuses to register the
    same static GET route twice ("Added route will never be executed"), and
    `add_extra_js_url` would stack duplicate <script> tags — so we only do
    this once per Home Assistant session.
    """
    if hass.data.get(_CARD_REGISTERED_KEY):
        return

    card_path = Path(__file__).parent / CARD_FILENAME
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_path), False)]
    )
    # Append a cache-busting query so frontends pick up new versions on upgrade.
    frontend.add_extra_js_url(hass, f"{CARD_URL}?v={_card_version(card_path)}")
    hass.data[_CARD_REGISTERED_KEY] = True
    _LOGGER.debug("Registered weather-app-card at %s", CARD_URL)


def _card_version(card_path: Path) -> str:
    """Cheap content hash so the extra-JS URL changes when the card changes."""
    try:
        return str(int(card_path.stat().st_mtime))
    except OSError:
        return "0"


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
    except Exception:  # noqa: BLE001
        _LOGGER.exception(
            "Created the Weather dashboard in storage but failed to register it "
            "live; it should appear after a Home Assistant restart"
        )


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
