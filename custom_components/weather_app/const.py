"""Constants for the Weather App Dashboard integration."""

DOMAIN = "weather_app"

# Path the card JS is served from (registered as a static path + frontend module).
CARD_URL = "/weather_app_dashboard/weather-app-card.js"
CARD_FILENAME = "weather-app-card.js"

# The Lovelace dashboard this integration creates.
DASHBOARD_URL_PATH = "weather-wall"
DASHBOARD_TITLE = "Weather"
DASHBOARD_ICON = "mdi:weather-partly-cloudy"

# Optional config-entry option: an explicit add-on slug to embed. When unset,
# the card auto-detects the installed add-on whose slug ends with
# `_weather_app`.
CONF_ADDON_SLUG = "addon_slug"
