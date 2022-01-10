import { readFileSync } from "fs"
import log from "loglevel"

let fileJsonContents: any = {};

try
{
    const fileStringContents = readFileSync("local-settings.json", { encoding: "utf8" })
    fileJsonContents = JSON.parse(fileStringContents)
}
catch {
    log.warn("No local-settings.json file found")
}

export const settings = {
    janusServers: (fileJsonContents.janusServers
        || (process.env.GIKO2_JANUS_SERVERS && JSON.parse(process.env.GIKO2_JANUS_SERVERS as string)) || []) as { url: string, id: string }[],
    janusApiSecret: (fileJsonContents.janusApiSecret || process.env.GIKO2_JANUS_API_SECRET) as string,
    janusRoomNamePrefix: (fileJsonContents.janusRoomNamePrefix || process.env.GIKO2_JANUS_ROOM_NAME_PREFIX) as string,
    janusRoomNameIntPrefix: (fileJsonContents.janusRoomNameIntPrefix
        || (process.env.GIKO2_JANUS_ROOM_NAME_INT_PREFIX && Number.parseInt(process.env.GIKO2_JANUS_ROOM_NAME_INT_PREFIX))) as number,
    isBehindProxy: fileJsonContents.isBehindProxy == undefined ? true : fileJsonContents.isBehindProxy,
    restrictLoginByIp: fileJsonContents.restrictLoginByIp == undefined ? true : fileJsonContents.restrictLoginByIp,
    abuseIpDBApiKey: (fileJsonContents.abuseIpDBApiKey || process.env.ABUSE_IPDB_API_KEY) as string,
    adminKey: (fileJsonContents.adminKey || process.env.ADMIN_KEY) as string,
    // $-^ is a regex that never matches any string
    censoredWordsRegex: (fileJsonContents.censoredWordsRegex || process.env.GIKO2_CENSORED_WORDS_REGEX || "$-^") as string,
}
