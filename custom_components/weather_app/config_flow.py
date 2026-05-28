"""Config flow for the Weather App Dashboard integration.

Single-instance, no user input: the user just clicks "Submit" and the
integration registers the card + creates the dashboard.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class WeatherAppConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the (trivial) config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        # Only one instance makes sense — it owns a single dashboard.
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Weather App Dashboard", data={})

        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))
