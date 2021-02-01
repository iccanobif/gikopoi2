import { readFileSync } from "fs"
import log from "loglevel"

let fileJsonContents: any = null

try
{
    const fileStringContents = readFileSync("local-settings.json", { encoding: "utf8" })
    fileJsonContents = JSON.parse(fileStringContents)
}
catch {
    log.warn("No settings.json file found")
}

export const settings = {
    janusServerUrl: fileJsonContents?.janusServerUrl || process.env.JANUS_SERVER_URL,
    janusApiSecret: fileJsonContents?.janusApiSecret || process.env.JANUS_API_SECRET,
}