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
    # Per-user mono override — array of HA display names that should
    # always see the mono dashboard, regardless of the default above.
    # Defaults to an empty array via `.// []`. Pulled as a newline-
    # separated list for the bash loop below.
    MONO_USERS=$(jq -r '(.monochrome_users // []) | .[]' "$OPTIONS_FILE")
else
    echo "[run.sh] /data/options.json not found — using empty defaults" >&2
    LAT=""; LON=""; ZIPCODE=""; GEOAPIFY_KEY=""; OWM_APPID=""
    AWN_API_KEY=""; AWN_APP_KEY=""; WEATHER_SOURCE="OpenMeteo"
    MONOCHROME="false"
    MONO_USERS=""
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

# `mono` is NOT a static query param anymore — its value is determined
# per-request inside nginx based on the requesting HA user. We append a
# literal `mono=$user_mono` so nginx interpolates `$user_mono` at request
# time. See the `map $http_x_remote_user_display_name $user_mono` block in
# nginx.conf for the resolution logic.
#
# We only append it when something mono-related is actually configured
# (or some other param was set). Otherwise an addon with zero config would
# still trigger a `/` → `/?mono=` redirect on every visit — pointless and
# leaves a stray empty `mono=` param in the user's URL bar.
if [ -n "$QUERY" ] \
   || [ "$MONOCHROME" = "true" ] \
   || [ -n "$MONO_USERS" ]; then
    QUERY="${QUERY}&mono=\$user_mono"
fi

# Strip leading "&" (added by every add_param call).
QUERY="${QUERY#&}"

DEFAULT_REDIRECT=""
if [ -n "$QUERY" ]; then
    DEFAULT_REDIRECT="?${QUERY}"
fi

# ---- Build the per-user mono map entries ----------------------------------
# Each entry maps a quoted HA display name to "1" (force mono) or "" (force
# color). Generated as nginx-config syntax lines, ready to be sed'd into
# the template at the @@USER_MONO_MAP_ENTRIES@@ marker.

USER_MONO_MAP_ENTRIES=""
escape_nginx_string() {
    # Escape backslashes and double quotes for inclusion inside an nginx
    # double-quoted string. Newlines aren't valid in display names so we
    # don't worry about them.
    printf '%s' "$1" | sed -e 's/[\\"]/\\&/g'
}
if [ -n "$MONO_USERS" ]; then
    while IFS= read -r u; do
        [ -z "$u" ] && continue
        esc=$(escape_nginx_string "$u")
        USER_MONO_MAP_ENTRIES="${USER_MONO_MAP_ENTRIES}        \"${esc}\" \"1\";"$'\n'
    done <<< "$MONO_USERS"
fi
# Trim trailing newline so the resulting nginx block isn't padded.
USER_MONO_MAP_ENTRIES="${USER_MONO_MAP_ENTRIES%$'\n'}"

# Addon-wide default for users not in either list.
if [ "$MONOCHROME" = "true" ]; then
    DEFAULT_MONO="1"
else
    DEFAULT_MONO=""
fi

# ---- Inject the redirect + per-user map into nginx.conf -------------------
# Escape characters that are special to sed's replacement string. URL params
# can contain `&`, `/`, `=` — `&` is the dangerous one (sed expands it to
# the matched text). `|` is our delimiter so `/` is safe; `\` and `|` could
# appear in user-supplied values so we escape them defensively.
#
# The map-entries placeholder is on its own line in the template — we
# replace the whole line via awk so newline-bearing replacements work
# (sed substitution can't easily emit literal newlines portably).

ESCAPED=$(printf '%s' "$DEFAULT_REDIRECT" | sed -e 's/[\\|&]/\\&/g')
sed \
    -e "s|@@DEFAULT_REDIRECT@@|${ESCAPED}|g" \
    -e "s|@@DEFAULT_MONO@@|${DEFAULT_MONO}|g" \
    "$NGINX_TEMPLATE" > "$NGINX_CONF.partial"

# Replace the map-entries line with the (possibly multi-line) per-user
# entries block. We write the entries to a temp file and stream them in via
# awk's getline so multi-line replacement works in both busybox awk
# (alpine) and bsd awk (macOS, for dry-runs).
ENTRIES_FILE="/tmp/.weather-app-mono-entries"
printf '%s' "$USER_MONO_MAP_ENTRIES" > "$ENTRIES_FILE"
awk -v entries_file="$ENTRIES_FILE" '
    /@@USER_MONO_MAP_ENTRIES@@/ {
        # Stream the entries file in place of this marker line. Skip the
        # marker itself (the `next` below). If the file is empty (no
        # per-user overrides configured), nothing is emitted and the map
        # block just contains its `default` line — which is correct.
        while ((getline line < entries_file) > 0) print line
        close(entries_file)
        next
    }
    { print }
' "$NGINX_CONF.partial" > "$NGINX_CONF"
rm -f "$NGINX_CONF.partial" "$ENTRIES_FILE"

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
