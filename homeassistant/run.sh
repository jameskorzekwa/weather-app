#!/usr/bin/env bash
# Startup script for the Home Assistant add-on.
#
# Responsibilities:
#   1. Read user-supplied options from /data/options.json (written by HA
#      Supervisor whenever the user saves the add-on Configuration tab).
#   2. Build a URL query string that mirrors the params the Vercel build
#      expects (lat, lon, zipcode, apikey, etc.) and inject it into the
#      nginx config so requests to `/` are redirected to `/?<params>`.
#   3. Launch `next start` on :3000 and nginx on :8099, then wait on
#      whichever exits first so the container restarts as a unit.
#
# Why URL params rather than env vars or a config endpoint: the Next.js app
# already reads everything from `useSearchParams()`. Threading the same
# values through the URL keeps the app's runtime behaviour identical to the
# Vercel deployment (the goal stated by the user) — no app-side changes,
# the Settings modal still works, and the URL remains the source of truth.

set -euo pipefail

OPTIONS_FILE="/data/options.json"
NGINX_TEMPLATE="/etc/nginx/nginx.conf.template"
NGINX_CONF="/etc/nginx/nginx.conf"

# ---- Read options ----------------------------------------------------------
# Each `jq -r '.foo // empty'` returns the empty string when the key is
# absent OR explicitly null, so unset options simply drop out of the URL.

if [ -f "$OPTIONS_FILE" ]; then
    LAT=$(jq -r '.latitude // empty' "$OPTIONS_FILE")
    LON=$(jq -r '.longitude // empty' "$OPTIONS_FILE")
    ZIPCODE=$(jq -r '.zipcode // empty' "$OPTIONS_FILE")
    GEOAPIFY_KEY=$(jq -r '.geoapify_api_key // empty' "$OPTIONS_FILE")
    OWM_APPID=$(jq -r '.openweathermap_appid // empty' "$OPTIONS_FILE")
    AWN_API_KEY=$(jq -r '.awn_api_key // empty' "$OPTIONS_FILE")
    AWN_APP_KEY=$(jq -r '.awn_application_key // empty' "$OPTIONS_FILE")
    WEATHER_SOURCE=$(jq -r '.weather_source // "OpenMeteo"' "$OPTIONS_FILE")
    MONOCHROME=$(jq -r '.monochrome // false' "$OPTIONS_FILE")
else
    echo "[run.sh] /data/options.json not found — using empty defaults" >&2
    LAT=""; LON=""; ZIPCODE=""; GEOAPIFY_KEY=""; OWM_APPID=""
    AWN_API_KEY=""; AWN_APP_KEY=""; WEATHER_SOURCE="OpenMeteo"
    MONOCHROME="false"
fi

# ---- Build the query string -----------------------------------------------
# URL-encode each value with `jq -sRr @uri` — this is the same encoding the
# browser produces. Keys mirror exactly what `app/page.tsx` reads via
# `useSearchParams()`; see test-url.local for the canonical reference.

QUERY=""
add_param() {
    local key="$1" value="$2"
    if [ -n "$value" ]; then
        local encoded
        encoded=$(printf '%s' "$value" | jq -sRr @uri)
        QUERY="${QUERY}&${key}=${encoded}"
    fi
}

add_param lat            "$LAT"
add_param lon            "$LON"
add_param zipcode        "$ZIPCODE"
add_param apikey         "$GEOAPIFY_KEY"
add_param appid          "$OWM_APPID"
add_param apiKey         "$AWN_API_KEY"
add_param applicationKey "$AWN_APP_KEY"
add_param weatherSource  "$WEATHER_SOURCE"
if [ "$MONOCHROME" = "true" ]; then
    add_param mono 1
fi

# Strip leading "&" (added by every add_param call).
QUERY="${QUERY#&}"

DEFAULT_REDIRECT=""
if [ -n "$QUERY" ]; then
    DEFAULT_REDIRECT="?${QUERY}"
fi

# ---- Inject the redirect into nginx.conf ----------------------------------
# Escape characters that are special to sed's replacement string. URL params
# can contain `&`, `/`, `=` — `&` is the dangerous one (sed expands it to
# the matched text). `|` is our delimiter so `/` is safe; `\` and `|` could
# appear in user-supplied values so we escape them defensively.

ESCAPED=$(printf '%s' "$DEFAULT_REDIRECT" | sed -e 's/[\\|&]/\\&/g')
sed "s|@@DEFAULT_REDIRECT@@|${ESCAPED}|g" "$NGINX_TEMPLATE" > "$NGINX_CONF"

# ---- Start Next.js --------------------------------------------------------

echo "[run.sh] starting next start on 127.0.0.1:3000"
(
    cd /app
    HOSTNAME=127.0.0.1 PORT=3000 \
        node node_modules/next/dist/bin/next start
) &
NEXT_PID=$!

# Poll until Next.js answers on :3000 — nginx will refuse to start otherwise.
echo "[run.sh] waiting for Next.js to come up..."
for _ in $(seq 1 60); do
    if wget -q -O /dev/null --tries=1 --timeout=1 http://127.0.0.1:3000/ 2>/dev/null; then
        echo "[run.sh] Next.js is responding"
        break
    fi
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "[run.sh] Next.js exited before becoming ready" >&2
        wait "$NEXT_PID" || true
        exit 1
    fi
    sleep 1
done

# ---- Start nginx ----------------------------------------------------------

echo "[run.sh] starting nginx on :8099"
nginx -g 'daemon off;' &
NGINX_PID=$!

# Propagate signals to the children so HA's `docker stop` shuts down cleanly.
trap 'kill -TERM $NEXT_PID $NGINX_PID 2>/dev/null || true' SIGTERM SIGINT

# Exit when either process exits — the container restart policy will bring
# us back up. -n waits for the first to terminate.
wait -n
EXIT_CODE=$?
echo "[run.sh] a child exited with code $EXIT_CODE; shutting down" >&2
kill -TERM $NEXT_PID $NGINX_PID 2>/dev/null || true
wait || true
exit "$EXIT_CODE"
