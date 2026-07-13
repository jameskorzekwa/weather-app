// Regression test for the per-user monochrome-after-reboot fix in
// custom_components/weather_app/weather-app-card.js.
//
// Bug: after an HA reboot the card's recovery reload reused a possibly-stale
// ingress URL and loaded the iframe even when re-creating the ingress session
// failed. Such a reload reaches the add-on without the X-Remote-User-* header,
// so nginx serves the color default — and because the page renders fine, the
// watchdog never retries. The fix makes the recovery reload behave like a
// fresh init: refresh the ingress URL and require a valid session BEFORE
// loading, else flag for a retry.
//
// Importing the card module for its side effect registers the custom element.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/custom_components/weather_app/weather-app-card.js';

function makeCard(): any {
    const el = document.createElement('weather-app-card') as any;
    el.setConfig({}); // builds the shadow DOM + iframe
    return el;
}

describe('weather-app-card recovery reload', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('refreshes the ingress URL and reloads once the session re-establishes', async () => {
        const el = makeCard();
        el._slug = 'abc_weather_app';
        el._ingressUrl = '/api/hassio_ingress/OLD/';
        el._hass = {
            callWS: vi.fn(async ({ endpoint, method }: any) => {
                if (endpoint.endsWith('/info'))
                    return { ingress_url: '/api/hassio_ingress/NEW/' };
                if (endpoint === '/ingress/session' && method === 'post')
                    return { session: 'sess-1' };
                throw new Error('unexpected callWS ' + endpoint);
            })
        };

        el._reloadIframe();
        await vi.runAllTimersAsync();

        // Picked up the rotated ingress token and pointed the iframe at it.
        expect(el._ingressUrl).toBe('/api/hassio_ingress/NEW/');
        expect(el._iframe.src).toContain('/api/hassio_ingress/NEW/');
        expect(el._iframeErrored).toBe(false);
        expect(el._reloading).toBe(false);
    });

    it('does NOT load a stale page when the session cannot be re-established', async () => {
        const el = makeCard();
        el._slug = 'abc_weather_app';
        el._ingressUrl = '/api/hassio_ingress/OLD/';
        el._hass = {
            callWS: vi.fn(async ({ endpoint, method }: any) => {
                if (endpoint.endsWith('/info'))
                    return { ingress_url: '/api/hassio_ingress/NEW/' };
                if (endpoint === '/ingress/session' && method === 'post')
                    throw new Error('supervisor not ready');
                throw new Error('unexpected callWS ' + endpoint);
            })
        };

        el._reloadIframe();
        await vi.runAllTimersAsync();

        // Never pointed the iframe at a page (would have loaded it in color)...
        expect(el._iframe.src).not.toContain('hassio_ingress');
        // ...and flagged itself so the next healthy watchdog tick retries.
        expect(el._iframeErrored).toBe(true);
        expect(el._reloading).toBe(false);
    });
});
