import got from "got";
import log from "loglevel";
import { settings } from "./settings";

const abuseIpDBabuseConfidenceScoreCache: { [ip: string]: number } = {};

export async function getAbuseConfidenceScore(ip: string): Promise<number>
{
    if (!settings.abuseIpDBApiKey)
        return 0

    if (ip in abuseIpDBabuseConfidenceScoreCache)
    {
        // log.info("Cached confidence score " + ip + ": " + abuseIpDBabuseConfidenceScoreCache[ip])
        return abuseIpDBabuseConfidenceScoreCache[ip]
    }

    try
    {
        const baseUrl = 'https://api.abuseipdb.com/api/v2/check'

        const { statusCode: abuseIpStatusCode, body: abuseIpBody } = await got(baseUrl,
            {
                searchParams: { ipAddress: ip },
                headers: {
                    "Key": settings.abuseIpDBApiKey,
                    "Accept": "application/json",
                },
                timeout: 1000 * 10,
            })

        if (abuseIpStatusCode != 200)
            return 0

        const confidenceScore = JSON.parse(abuseIpBody)?.data?.abuseConfidenceScore
        abuseIpDBabuseConfidenceScoreCache[ip] = confidenceScore
        log.info("Confidence score " + ip + ": " + confidenceScore)
        return confidenceScore
    }
    catch (exc)
    {
        log.error(exc)
        // caching the result because if for some reason the api is slow, ALL http requests to poipoi will
        // become slow. If the API is broken, abuse checking is also broken anyway.
        abuseIpDBabuseConfidenceScoreCache[ip] = 0
        return 0
    }
}