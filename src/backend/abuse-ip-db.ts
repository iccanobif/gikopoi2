import got from "got";
import log from "loglevel";
import { settings } from "./settings";
import dns from "dns"

const abuseIpDBabuseConfidenceScoreCache: { [ip: string]: number } = {};
const reverseDnsLookupCache: { [ip: string]: string[] } = {};

async function getAbuseConfidenceScore(ip: string): Promise<number>
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

async function reverseDnsLookup(ip: string): Promise<string[]>
{
    if (ip in reverseDnsLookupCache)
        return reverseDnsLookupCache[ip]

    return new Promise((resolve, reject) =>
    {
        const startTime = Date.now()

        // If dns.reverse() doesn't finish in less than one second, let's resolve immediately
        let alreadyResolved = false
        setTimeout(() => {
            if (alreadyResolved) return

            log.info("reverse dns lookup timeout")
            alreadyResolved = true
            reverseDnsLookupCache[ip] = []
            resolve([])
        }, 1000)

        dns.reverse(ip, (err, hostnames) =>
        {
            if (alreadyResolved) return

            alreadyResolved = true
            // Todo, set a timeout or resolve if an answer doesn't come within a second
            const elapsedTime = Date.now() - startTime
            log.info("reverse dns lookup:", elapsedTime, hostnames, err?.code)
            if (err)
            {
                reverseDnsLookupCache[ip] = []
                resolve([])
            }
            else
            {
                reverseDnsLookupCache[ip] = hostnames
                resolve(hostnames)
            }
        })
    })
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
    const hostnames = await reverseDnsLookup(ip)
    if (hostnames.find(h => h.toLowerCase().endsWith("datapacket.com")))
        return { status: "vpn" }

    return { status: "ok" }
}