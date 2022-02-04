import { readFileSync } from "fs"
import log from "loglevel"

interface PoiPoiSettings
{
    persistorUrl: string,
    persistorSecret: string,
    enableSSL: boolean,
    janusServers: { url: string, id: string }[]
    janusApiSecret: string
    janusRoomNamePrefix: string
    janusRoomNameIntPrefix: number
    isBehindProxy: boolean
    restrictLoginByIp: boolean
    abuseIpDBApiKey: string
    adminKey: string
    censoredWordsRegex: string
    noStreamIPs: string[]
    removeStreamBanIPs: string[]
}

let jsonContents: PoiPoiSettings;

try
{
    const fileStringContents = readFileSync("local-settings.json", { encoding: "utf8" })
    jsonContents = JSON.parse(fileStringContents)
}
catch {
    log.warn("No local-settings.json file found")

    jsonContents = JSON.parse(process.env.GIKO2_SETTINGS || "{}" as string)
}

export const settings: PoiPoiSettings = {
    enableSSL: jsonContents.enableSSL || false,
    persistorUrl: jsonContents.persistorUrl,
    persistorSecret: jsonContents.persistorSecret,

    janusServers: jsonContents.janusServers || [],
    janusApiSecret: jsonContents.janusApiSecret,
    janusRoomNamePrefix: jsonContents.janusRoomNamePrefix,
    janusRoomNameIntPrefix: jsonContents.janusRoomNameIntPrefix,
    isBehindProxy: jsonContents.isBehindProxy == undefined ? true : jsonContents.isBehindProxy,
    restrictLoginByIp: jsonContents.restrictLoginByIp == undefined ? true : jsonContents.restrictLoginByIp,
    abuseIpDBApiKey: jsonContents.abuseIpDBApiKey,
    adminKey: jsonContents.adminKey,
    // $-^ is a regex that never matches any string
    censoredWordsRegex: jsonContents.censoredWordsRegex || "$-^",
    noStreamIPs: jsonContents.noStreamIPs || [],
    removeStreamBanIPs: jsonContents.removeStreamBanIPs || [],
}
