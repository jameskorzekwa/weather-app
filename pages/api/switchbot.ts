import type {NextApiRequest, NextApiResponse} from 'next'
import {v4 as uuidv4} from "uuid";
import crypto from "crypto";

type ResponseData = {
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const token = req.query.token?.toString() || ""
    const secretKey = req.query.secret?.toString() || ""
    const nonce: string = uuidv4()
    const t = Date.now();
    const data: string = token + t + nonce
    const sign: string = crypto.createHmac("sha256", secretKey).update(Buffer.from(data, 'utf-8')).digest().toString("base64")
    const headers = {
        Authorization: token,
        'Content-Type': 'application/json',
        nonce,
        t: t.toString(),
        sign
    }
    console.log('headers', headers)
    const result = await fetch(`https://api.switch-bot.com/v1.1/devices/ED505FE38F0D/status`, {
        method: "GET",
        headers: headers
    })

    res.status(200).json(await result.json())
}