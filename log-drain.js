// files will be written to the current directory

const express = require("express")

const app = express()
const http = require('http').Server(app);
const fs = require("fs").promises

const jszip = require("jszip");
const { emitWarning } = require("process");

const port = 8087

// curl -d test -X POST -H "Content-Type: application/logplex-1" http://localhost:8087 

app.use(express.text({ limit: "5mb", type: "application/logplex-1" }));

// TODO: auth + zip old logs

function getPreviousDay(date = new Date()) {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - 1);
  
    return previous;
  }

function getFileName(date)
{
    const dateString = date.toISOString().substring(0, 10);
    return dateString + ".log"
}

app.post("/", async (req, res) =>
{
    try
    {
        const logs = req.body
        const today = new Date()
        const filename = getFileName(today)

        await fs.appendFile(filename, logs)

        res.end()
    }
    catch (e)
    {
        console.log(e)
        res.sendStatus(500)
    }
})

http.listen(port, "0.0.0.0");

let zipping = false

setInterval(async () => {
    if (zipping)
        return

    const yesterday = getPreviousDay()
    const filenameOfFileToZip = getFileName(yesterday)
    try {
        await fs.access(filenameOfFileToZip + ".zip")
    }
    catch {
        // zip file does not exist, let's zip
        console.log("zipping", filenameOfFileToZip + "...")

        zipping = true
        try {
            const txtContentBuffer = await fs.readFile(filenameOfFileToZip)
            const zip = new jszip()
            zip.file(filenameOfFileToZip, txtContentBuffer)
            
            const zipContents = await zip.generateAsync({ type: "uint8array" })

            await fs.writeFile(filenameOfFileToZip + ".zip", zipContents)
            await fs.unlink(filenameOfFileToZip)
        }
        catch (exc)
        {
            console.log(exc)
        }
        zipping = false
    }
}, 1000 * 60 * 60)

console.log("Server running on http://localhost:" + port);
