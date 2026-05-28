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
| `monochrome`            | bool     | Default color mode for everyone (`true` = mono, `false` = color). Adding a name to `monochrome_users` or a substring to `monochrome_devices` overrides this. |
| `monochrome_users`      | [string] | HA user display names that should always see **mono**. Everyone else uses the `monochrome` default. |
| `monochrome_devices`    | [string] | Substrings matched (case-insensitively) against the request's `User-Agent`. A device that matches always sees **mono**, regardless of which user is signed in. |

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

### Per-user / per-device mono

By default everyone sees the color dashboard. Two independent ways to
override it for specific viewers:

**By HA user** — add their **display name** (e.g. `"James Korzekwa"`,
not `"james_korzekwa"`) to `monochrome_users`. The match is exact and
case-sensitive against HA's `X-Remote-User-Display-Name` ingress header,
which is the name shown under **Settings → People** in HA.

**By device** — add a substring of the device's `User-Agent` to
`monochrome_devices`. Matching is case-insensitive and treats each entry
as a plain substring (no regex syntax). Common values:

| Device | What to put in `monochrome_devices` |
|---|---|
| iPhone | `iPhone` |
| iPad | `iPad` |
| Fire tablet (Silk browser) | `Silk` |
| Generic Android phone/tablet | `Android` |
| Macintosh | `Macintosh` |

If you're not sure of the exact User-Agent, open the dashboard on the
device and visit `https://www.whatismybrowser.com/detect/what-is-my-user-agent`
to see the full string — pick any uniquely-identifying substring.

A user **or** a device matching forces mono. Both checks fire on every
request, so the same dashboard URL renders differently depending on who
opens it from which device.

Example — most users see color, but the kitchen tablet (signed in as
"Kitchen") and any iPhone get mono:

```yaml
monochrome: false
monochrome_users:
  - "Kitchen"
monochrome_devices:
  - "iPhone"
```

If instead you want **everyone** to see mono by default, set
`monochrome: true` and leave both lists empty.

The override only applies when the page is opened from the HA sidebar
(or any `/` URL without query params). If you bookmark a URL with an
explicit `mono=1` or `mono=` already in it, that wins — the manual
choice is preserved.

Direct port access (no HA ingress, no user header) falls back to the
`monochrome` default, but device matching still works because
`User-Agent` is sent on every HTTP request.

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
