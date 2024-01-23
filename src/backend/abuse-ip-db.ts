import got from "got";
import log from "loglevel";
import { settings } from "./settings";
import dns from "dns"

// By caching promises instead of directly their output, we're handling the case of multiple HTTP requests
// from the same IP that come at the same time, making it so that we perform a reverse lookup or an abuseipdb
// api call only once per IP.
const abuseIpDBabuseConfidenceScoreCache: { [ip: string]: Promise<number> } = {};
const reverseDnsLookupCache: { [ip: string]: Promise<string[]> } = {};

async function callAbuseIpApi(ip: string): Promise<number>
{
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
        // the result will be cached because if for some reason the api is slow, ALL http requests to poipoi will
        // become slow. If the API is broken, abuse checking is also broken anyway.
        return 0
    }
}

function getAbuseConfidenceScore(ip: string): Promise<number>
{
    if (!settings.abuseIpDBApiKey)
        return Promise.resolve(0)

    if (ip in abuseIpDBabuseConfidenceScoreCache)
        return abuseIpDBabuseConfidenceScoreCache[ip]

    return abuseIpDBabuseConfidenceScoreCache[ip] = callAbuseIpApi(ip)
}

async function reverseDnsLookup(ip: string): Promise<string[]>
{
    if (ip in reverseDnsLookupCache)
        return reverseDnsLookupCache[ip]

    const promise = new Promise<string[]>((resolve, reject) =>
    {
        const startTime = Date.now()

        // If dns.reverse() doesn't finish in less than one second, let's resolve immediately
        let alreadyResolved = false
        setTimeout(() => {
            if (alreadyResolved) return

            log.info(ip, "reverse dns lookup timeout for ip")
            alreadyResolved = true
            resolve([])
        }, 1000)

        dns.reverse(ip, (err, hostnames) =>
        {
            if (alreadyResolved) return

            alreadyResolved = true
            const elapsedTime = Date.now() - startTime
            log.info("reverse dns lookup:", ip, elapsedTime, hostnames, err?.code)
            if (err)
                resolve([])
            else
                resolve(hostnames)
        })
    })

    reverseDnsLookupCache[ip] = promise
    return promise
}

export async function checkIfBadIp(ip: string, bannedIPs: Set<string>): Promise<{ status: "ok" | "banned" | "abusedb" | "vpn", abuseDbConfidenceScore?: number }>
{
    if (bannedIPs.has(ip)
        || ip.startsWith("77.111.245")
        || ip.startsWith("77.111.246")
        || ip.startsWith("77.111.247"))
        return { status: "banned" }

    const confidenceScore = await getAbuseConfidenceScore(ip)

    if (confidenceScore > 50)
        return { status: "abusedb", abuseDbConfidenceScore: confidenceScore }

    // Apparently datapacket.com is a large cloud provider for VPNs
    await reverseDnsLookup(ip)
    // const hostnames = await reverseDnsLookup(ip)
    // Comment this for now, until I get a better idea of how many users would be affected
    // if (hostnames.find(h => h.toLowerCase().endsWith("datapacket.com")))
    //     return { status: "vpn" }

    return { status: "ok" }
}