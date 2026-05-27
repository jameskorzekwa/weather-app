# Weather App add-on — documentation

This page is shown inside Home Assistant on the add-on's **Documentation**
tab.

## Configuration

All fields below are optional — the app falls back to the same defaults as
the Vercel deploy. Anything you leave blank simply doesn't get injected
into the URL.

| Option                  | Type     | Notes                                                        |
|-------------------------|----------|--------------------------------------------------------------|
| `latitude`              | float    | Decimal degrees. Used together with `longitude`.             |
| `longitude`             | float    | Decimal degrees.                                             |
| `zipcode`               | string   | Fallback location if lat/lon are blank.                      |
| `geoapify_api_key`      | password | Geoapify key, used for geocoding / reverse-geocoding.        |
| `openweathermap_appid`  | password | Only needed if `weather_source` is `OpenWeatherMap`.         |
| `awn_api_key`           | password | Ambient Weather Network key (local temp sensor).             |
| `awn_application_key`   | password | Ambient Weather Network *application* key.                   |
| `weather_source`        | list     | `OpenMeteo` (default) or `OpenWeatherMap`.                   |
| `monochrome`            | bool     | Default color mode for everyone (`true` = mono, `false` = color). Per-user lists below override this. |
| `monochrome_users`      | [string] | HA user display names that should always see **mono**, regardless of `monochrome`. |
| `color_users`           | [string] | HA user display names that should always see **color**, regardless of `monochrome`. |

After saving, click **Restart**. The values are URL-encoded and injected
into the request when you open `/` — exactly the same params documented in
`test-url.local`.

### Per-user color vs. mono

`monochrome` sets the default that everybody sees. To override it for
specific HA users, add their **display name** (e.g. `"James Korzekwa"`,
not `"james_korzekwa"`) to `monochrome_users` (force mono) or
`color_users` (force color). The match is exact and case-sensitive
against HA's `X-Remote-User-Display-Name` ingress header, which is the
name shown under **Settings → People** in HA.

Example: everyone sees color by default except the kitchen tablet user,
which is signed in as "Kitchen":

```yaml
monochrome: false
monochrome_users:
  - "Kitchen"
color_users: []
```

The override only applies when the page is opened from the HA sidebar
(or any `/` URL without query params). If you bookmark a URL with an
explicit `mono=1` or `mono=` already in it, that wins — the manual
choice is preserved.

Direct port access (no HA ingress, no user header) always falls back to
the `monochrome` default.

## Where does the configuration live?

HA Supervisor writes the saved options to `/data/options.json` inside the
container. `run.sh` reads that file with `jq` at startup, builds a query
string, and patches a redirect into `nginx.conf` so visiting the add-on
root sends the browser to `/?<params>`.

You can still type a fresh URL into the address bar (or open Settings →
Save inside the app) at any time — the addon options are only the
*default* the app loads with.

## Updating

Pulling a new version of the add-on pulls a new Docker image from GHCR
(published by `.github/workflows/build.yaml` on every push to `main` and
on `v*` tags). Your saved options carry over — they live in `/data`,
which HA persists across restarts and upgrades.

## Troubleshooting

- **Blank page / 404 on assets**: usually means nginx's `sub_filter` did
  not rewrite a path. Check the add-on log (Logs tab) for nginx warnings.
  The most common cause is a response coming back gzipped, which would
  bypass `sub_filter`; the proxy already forces `Accept-Encoding: ""` so
  this should not happen, but Next.js middleware changes can re-introduce
  it.
- **"Next.js exited before becoming ready"** in the log: the build failed
  or `next start` couldn't bind. Re-pull the image and check the GHCR
  publish ran successfully.
- **No sidebar entry**: confirm `Show in sidebar` is enabled in the
  add-on **Info** tab.
