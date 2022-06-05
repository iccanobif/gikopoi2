const express = require("express")

const app = express()
const http = require('http').Server(app);
const fs = require("fs").promises

const port = 8087

app.use(express.text({ limit: "5mb", type: "application/logplex-1" }));

// TODO: auth + zip old logs

app.post("/", async (req, res) =>
{
    try
    {
        const logs = req.body

        const date = new Date().toISOString().substring(0, 10);
        
        await fs.appendFile("gikopoi2/" + date + ".log", logs)
        res.end()
    }
    catch (e)
    {
        console.log(e)
        res.sendStatus(500)
    }
})

http.listen(port, "0.0.0.0");

console.log("Server running on http://localhost:" + port);
