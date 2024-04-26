import type { NextApiRequest, NextApiResponse } from 'next';
import AmbientWeatherApi from 'ambient-weather-api';

type ResponseData = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const apiKey = req.query.apiKey?.toString() || '';
    const applicationKey = req.query.applicationKey?.toString() || '';
    const api = new AmbientWeatherApi({
        apiKey,
        applicationKey
    });
    const json = await api.userDevices();

    // @ts-ignore
    res.status(200).json(json);
}
