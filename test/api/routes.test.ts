import { describe, it, expect, vi, beforeEach } from 'vitest';

const userDevices = vi.fn();
vi.mock('ambient-weather-api', () => ({
    default: class {
        userDevices = userDevices;
    }
}));
vi.mock('uuid', () => ({ v4: () => 'test-nonce' }));

import awnHandler from '@/pages/api/awn';
import switchbotHandler from '@/pages/api/switchbot';

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('GET /api/awn', () => {
    beforeEach(() => userDevices.mockReset());

    it('returns the AWN user devices with 200', async () => {
        const devices = [{ macAddress: 'XX', lastData: { tempf: 70 } }];
        userDevices.mockResolvedValue(devices);
        const req: any = {
            query: { awnApiKey: 'a', awnApplicationKey: 'b' }
        };
        const res = mockRes();
        await awnHandler(req, res);
        expect(userDevices).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(devices);
    });
});

describe('GET /api/switchbot', () => {
    it('proxies SwitchBot status, stamps zipcode, returns 200', async () => {
        const body = { deviceId: 'ED505FE38F0D', temperature: 71 };
        global.fetch = vi.fn().mockResolvedValue({
            json: async () => ({ ...body })
        }) as any;

        const req: any = { query: { token: 't', secret: 's' } };
        const res = mockRes();
        await switchbotHandler(req, res);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('api.switch-bot.com'),
            expect.objectContaining({ method: 'GET' })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload.zipcode).toBe('80465');
        expect(payload.deviceId).toBe('ED505FE38F0D');
    });
});
