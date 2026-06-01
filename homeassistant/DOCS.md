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
| `monochrome`            | bool     | Default color mode for everyone (`true` = mono, `false` = color). Adding a name to `monochrome_users` overrides this for that user. |
| `monochrome_users`      | [string] | HA user display names that should always see **mono**. Everyone else uses the `monochrome` default. |

After saving, click **Restart**. The values are URL-encoded and injected
into the request when you open `/` — exactly the same params documented in
`test-url.local`.

## Where to get the API keys

You don't need all of them — only the ones for the providers you actually
want to use. The shortest path to a working install is **Geoapify only**;
that gets you city names + the default OpenMeteo forecast.

### Geoapify — recommended

Used to turn coordinates into a place name (the big "Morrison" header in
the screenshot) and to look up a location from a zip code. Without it
the dashboard still renders, but the city header is blank.

1. Sign up at <https://www.geoapify.com/get-started-with-maps-api/>.
   Free tier is **3,000 requests/day** (more than enough for one HA
   dashboard).
2. Open the project dashboard at <https://myprojects.geoapify.com/>.
3. Create a project, then copy the **API Key** from the project's keys
   list.
4. Paste it into the addon's **`geoapify_api_key`** field.

### OpenMeteo — default forecast provider, no key needed

The 5-day forecast and current conditions ship by default from
<https://open-meteo.com/>, which is free and **does not require an API
key**. Leave `weather_source` set to `OpenMeteo` and you're done.

### OpenWeatherMap — optional alternative

Only needed if you flip `weather_source` to `OpenWeatherMap`. (You'd
typically do this if you prefer their condition descriptions or want to
match an existing OWM integration elsewhere.)

1. Sign up at <https://home.openweathermap.org/users/sign_up>. Free tier
   is **1,000 calls/day** plus 60/minute.
2. After verifying your email, open
   <https://home.openweathermap.org/api_keys>.
3. Use the default key or generate a new one. Copy the value.
4. Paste it into the addon's **`openweathermap_appid`** field.
5. Set `weather_source` to `OpenWeatherMap`.

**Heads up:** new OpenWeatherMap keys can take **up to a few hours** to
activate. If the dashboard shows no current temperature right after you
set the key, wait a bit and **Restart** the addon.

### Ambient Weather Network — optional, for personal weather stations

If you own an [Ambient Weather](https://ambientweather.com/) station that
reports to AWN, the addon can read its outdoor temperature sensor and
display it in place of the regional OpenMeteo / OWM temperature. Skip
this section if you don't have an AWN-connected station.

1. Sign in at <https://ambientweather.net/welcome> (or **Create Your
   Account** if you don't already have one — your station has to be set
   up there too).
2. After logging in, open the **Account** menu (top right) → look for
   the **API Keys** section.
3. Create an **API Key** and an **Application Key**. AWN distinguishes
   them — the API Key authenticates the account, the Application Key
   identifies your specific integration. Both are required.
4. Paste the **API Key** into **`awn_api_key`** and the **Application
   Key** into **`awn_application_key`**.

If you'd rather skip AWN, leave both fields blank — the dashboard just
uses the forecast provider's temperature.

### Per-user mono

By default everyone sees the color dashboard. To switch specific HA users
to mono, add them to `monochrome_users`. Each entry is matched against
**both** the user's **username** and their **display name** — so enter
whichever you like. Both are the values shown under **Settings → People**
in HA (e.g. username `weather-bw`, display name `Weather Station B&W`).
The match is exact and case-sensitive.

> **Why two?** HA add-on configuration fields can't show a user *picker*
> (the add-on schema has no "user" selector type), so this is a free-text
> list — type a value and press Enter. Matching on both the username and
> the display name means you don't have to remember which one HA forwards.

Example: most users see color, but the kitchen tablet (signed in as the
user `kitchen`) gets mono:

```yaml
monochrome: false
monochrome_users:
  - "kitchen"
```

If instead you want **everyone** to see mono by default, set
`monochrome: true` and leave `monochrome_users` empty.

The override only applies when the page is opened from the HA sidebar
(or any `/` URL without query params). If you bookmark a URL with an
explicit `mono=1` or `mono=` already in it, that wins — the manual
choice is preserved.

Direct port access (no HA ingress, no user header) always falls back to
the `monochrome` default.

## Using it as a default dashboard / wall display

The add-on shows up as a sidebar panel through HA's ingress. HA won't let
an ingress panel be your *default* dashboard, so there are two ways to use
the weather UI as a landing page:

**Option 1 — Ingress, keeps auth + per-user mono (recommended).** Install
the [Ingress webpage card](https://github.com/lovelylain/ha-addon-iframe-card)
from HACS, add it to a Lovelace dashboard in **Panel (1 card)** mode:

```yaml
type: custom:addon-iframe-card
url: 14c3574a_weather_app/
```

Then set that dashboard as your default in **Profile → Dashboard**.

**Option 2 — Direct host port, works with the built-in Webpage card.**
This add-on publishes its web UI on host port **8099** (remap it in the
**Network** tab). Point a built-in Lovelace **Webpage** card at:

```yaml
type: iframe
url: http://YOUR-HA-HOSTNAME:8099/
```

Simpler (no custom card), but note the trade-offs: this port has **no HA
authentication** (anyone on your LAN can open it, and the API keys are
visible in the redirected URL), and **per-user monochrome does not apply**
over the direct port — everyone gets the addon-wide `monochrome` default,
because the `X-Remote-User-Display-Name` header only exists on ingress
requests. Keep this port to a trusted network.

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
- **City header is blank**: missing or wrong `geoapify_api_key`. Confirm
  the key works by hitting `https://api.geoapify.com/v1/geocode/reverse?lat=<your lat>&lon=<your lon>&apiKey=<your key>` in a browser — it should return JSON, not an error.
- **OpenWeatherMap key returns 401 right after creating it**: the key
  hasn't activated yet. Wait an hour or two and restart the addon.
- **AWN temperature shows but is wrong / stale**: the addon picks the
  first station on your AWN account. If you have multiple, the sensor
  shown is whichever AWN's API lists first.
