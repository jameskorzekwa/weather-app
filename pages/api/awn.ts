import type { NextApiRequest, NextApiResponse } from 'next';
import AmbientWeatherApi from 'ambient-weather-api';

type ResponseData = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const awnApiKey = req.query.awnApiKey?.toString() || '';
    const awnApplicationKey = req.query.awnApplicationKey?.toString() || '';
    // The `ambient-weather-api` library expects its credentials in
    // `apiKey` / `applicationKey` properties — keep using those names
    // here even though our incoming query params are `awn`-prefixed.
    const api = new AmbientWeatherApi({
        apiKey: awnApiKey,
        applicationKey: awnApplicationKey
    });
    const json = await api.userDevices();

    // @ts-ignore
    res.status(200).json(json);
}
