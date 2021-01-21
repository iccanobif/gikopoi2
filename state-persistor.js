const express = require("express")

const app = express()
const http = require('http').Server(app);
const fs = require("fs").promises

const port = 8086

// to test POST with CURL:
// curl -X POST http://localhost:8086 -H "Content-Type: text/plain" -d "content of the state"

app.get("/", async (req, res) =>
{
    try
    {
        fs.readFile("persisted-state")
            .then((state) => res.end(state))
            .catch((err) =>
            {
                console.error(err)
                res.end("")
            })
    }
    catch (e)
    {
        res.end(e)
    }
})

app.use(express.text());


app.post("/", async (req, res) =>
{
    try
    {
        console.log("received state", req.body)
        const state = req.body

        await fs.writeFile("persisted-state", state)
        res.end()
    }
    catch (e)
    {
        res.end(e)
    }
})

http.listen(port, "0.0.0.0");

console.log("Server running on http://localhost:" + port);
