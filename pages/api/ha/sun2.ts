import type { NextApiRequest, NextApiResponse } from 'next';

// Lists every Sun2 sunrise/sunset pair currently known to Home Assistant.
// Sun2 names each pair `sensor.<slug>_sun_rising` / `sensor.<slug>_sun_setting`,
// where `<slug>` comes from the config entry title (HA appends `_2`, `_3`, …
// when titles collide, so a user with two configs both named "Home" gets
// `home_sun_*` and `home2_sun_*`).
//
// Reachable only inside the HA addon — outside HA there's no
// SUPERVISOR_TOKEN, so we return 503 and the client falls back to the
// weather provider's sunrise/sunset.

type Sun2Pair = {
    prefix: string;
    friendlyName: string;
    sunrise: string;
    sunset: string;
    entities: { rising: string; setting: string };
};

type Sun2Response = { pairs: Sun2Pair[] } | { error: string };

interface HaState {
    entity_id: string;
    state: string;
    attributes: { friendly_name?: string };
}

const RISING_SUFFIX = '_sun_rising';
const SETTING_SUFFIX = '_sun_setting';

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse<Sun2Response>
) {
    const token = process.env.SUPERVISOR_TOKEN;
    if (!token) {
        res.status(503).json({ error: 'not running inside Home Assistant' });
        return;
    }

    const upstream = await fetch('http://supervisor/core/api/states', {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!upstream.ok) {
        res.status(upstream.status).json({
            error: `supervisor returned ${upstream.status}`
        });
        return;
    }

    const states: HaState[] = await upstream.json();
    const byId = new Map(states.map((s) => [s.entity_id, s]));

    const pairs: Sun2Pair[] = [];
    for (const s of states) {
        if (!s.entity_id.endsWith(RISING_SUFFIX)) continue;
        const settingId =
            s.entity_id.slice(0, -RISING_SUFFIX.length) + SETTING_SUFFIX;
        const setting = byId.get(settingId);
        if (!setting || !s.state || !setting.state) continue;
        const prefix = s.entity_id.slice(
            'sensor.'.length,
            -RISING_SUFFIX.length
        );
        // Drop the trailing " Sun Rising" / " Rising" if present so the
        // friendly name shown to the user describes the *config*, not the
        // sensor (e.g. "Home" vs "Home Sun Rising").
        const friendlyName = (s.attributes.friendly_name ?? prefix)
            .replace(/\s*Sun\s*Rising$/i, '')
            .replace(/\s*Rising$/i, '')
            .trim();
        pairs.push({
            prefix,
            friendlyName: friendlyName || prefix,
            sunrise: s.state,
            sunset: setting.state,
            entities: { rising: s.entity_id, setting: settingId }
        });
    }

    pairs.sort((a, b) => a.prefix.localeCompare(b.prefix));
    res.status(200).json({ pairs });
}
