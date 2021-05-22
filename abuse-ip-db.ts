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
        log.info("Cached confidence score " + ip + ": " + abuseIpDBabuseConfidenceScoreCache[ip])
        return abuseIpDBabuseConfidenceScoreCache[ip]
    }

    try
    {
        const { statusCode: abuseIpStatusCode, body: abuseIpBody } = await got('https://api.abuseipdb.com/api/v2/check',
            {
                searchParams: { ipAddress: ip },
                headers: {
                    "Key": settings.abuseIpDBApiKey,
                    "Accept": "application/json",
                },
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
        return 0
    }
}