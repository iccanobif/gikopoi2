import express from "express"
import { readFile } from "fs";
import { defaultRoom, rooms } from "./rooms";
import { addNewUser, getConnectedUserList, getUser, Player, removeUser } from "./users";
import { sleep } from "./utils";
const app: express.Application = express()
const http = require('http').Server(app);
const io = require("socket.io")(http);

const delay = 0

io.on("connection", function (socket: any)
{
    console.log("Connection attempt");

    let user: Player;
    let currentRoom = defaultRoom;
    let currentStreamSlotId: number | null = null;

    socket.join(currentRoom.id)

    socket.on("user-connect", function (userId: string)
    {
        try
        {
            user = getUser(userId);
            if (!user)
                socket.emit("server-cant-log-you-in")

            console.log("userId: " + userId + " name: " + user.name);

            socket.emit("server-update-current-room-state", currentRoom, getConnectedUserList(user.roomId))
            emitServerStats()
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });
    socket.on("user-msg", function (msg: string)
    {
        try
        {
            msg = msg
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/((https?:\/\/|www\.)[^\s]+)/gi, function(url, prefix)
                {
                    let href = (prefix == "www." ? "http://" + url : url);
                    return "<a href='" + href + "' target='_blank'>" + url + "</a>";
                })
            
            const userName = user.name

            console.log(userName + ": " + msg);
            io.to(user.roomId).emit("server-msg", "<span class=\"messageAuthor\">" + userName + "</span>", "<span class=\"messageBody\">" + msg + "</span>");
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });

    socket.on("user-move", async function (direction: 'up' | 'down' | 'left' | 'right')
    {
        await sleep(delay)

        try
        {
            if (user.direction != direction)
            {
                // ONLY CHANGE DIRECTION
                user.direction = direction;
            }
            else
            {
                // MOVE
                let newX = user.position.x
                let newY = user.position.y

                switch (direction)
                {
                    case "up": newY++; break;
                    case "down": newY--; break;
                    case "left": newX--; break;
                    case "right": newX++; break;
                }

                const rejectMovement = () => socket.emit("server-reject-movement")

                // prevent going outside of the map
                if (newX < 0) { rejectMovement(); return }
                if (newY < 0) { rejectMovement(); return }
                if (newX >= currentRoom.grid[0]) { rejectMovement(); return }
                if (newY >= currentRoom.grid[1]) { rejectMovement(); return }

                // prevent moving over a blocked square
                if (currentRoom.blocked.find((p: { x: number, y: number }) => p.x == newX && p.y == newY))
                {
                    rejectMovement();
                    return
                }

                user.position.x = newX
                user.position.y = newY
            }

            io.to(user.roomId).emit("server-move",
                user.id,
                user.position.x,
                user.position.y,
                user.direction,
                false);
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });
    socket.on("user-stream-data", function (data: any)
    {
        try
        {

            io.to(user.roomId).emit("server-stream-data", data)
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    })
    socket.on("user-want-to-stream", function (streamRequest: { streamSlotId: number, withVideo: boolean, withSound: boolean })
    {
        try
        {
            const { streamSlotId } = streamRequest

            if (currentRoom.streams[streamSlotId].isActive)
                socket.emit("server-not-ok-to-stream", "sorry, someone else is already streaming in this slot")
            else
            {
                currentStreamSlotId = streamSlotId
                currentRoom.streams[streamSlotId].isActive = true
                currentRoom.streams[streamSlotId].userId = user.id

                socket.emit("server-ok-to-stream")

                const streamInfo = { ...streamRequest, userId: user.id }
                socket.to(user.roomId).emit("server-stream-started", streamInfo)
            }
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    })
    socket.on("user-want-to-stop-stream", function ()
    {
        try
        {
            if (currentStreamSlotId === null) return // should never happen

            currentRoom.streams[currentStreamSlotId].isActive = false

            socket.to(user.roomId).emit("server-stream-stopped", {
                streamSlotId: currentStreamSlotId,
            })

            currentStreamSlotId = null
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    })
    socket.on("user-change-room", async function (data: { targetRoomId: string, targetX: number, targetY: number })
    {
        try
        {
            await sleep(delay)

            const { targetRoomId, targetX, targetY } = data

            currentRoom = rooms[targetRoomId]

            io.to(user.roomId).emit("server-user-left-room", user.id);
            socket.leave(user.roomId)

            user.position = { x: targetX, y: targetY }
            user.roomId = targetRoomId

            socket.emit("server-update-current-room-state", currentRoom, getConnectedUserList(targetRoomId))
            socket.join(targetRoomId)
            socket.to(targetRoomId).emit("server-user-joined-room", user);
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    })
});

function emitServerStats()
{
    io.emit("server-stats", {
        userCount: getConnectedUserList(null).length
    })
}

app.use(express.static('static',
    { setHeaders: (res) => res.set("Cache-Control", "no-cache") }
));

app.get("/rooms/:roomName", (req, res) =>
{
    const roomName = req.params.roomName
    res.json(rooms[roomName])
})

app.post("/ping/:userId", async (req, res) =>
{
    readFile("version", (err, data) =>
    {
        if (err)
            res.json(err)
        else
        {
            // Update last ping date for the user
            const { userId } = req.params
            const user = getUser(userId)

            if (!user)
                return

            user.lastPing = Date.now()

            // Return software version, so that the client can refresh the page
            // if there has been a new deploy.
            const str = data.toString()
            const version = Number.parseInt(str)
            res.json({ version })
        }
    })
})

app.use(express.json());

app.post("/login", (req, res) =>
{
    const { userName } = req.body

    console.log(userName, "logging in")

    if (!userName)
    {
        res.statusCode = 500
        res.end("please specify a username")
    }
    else
    {
        const sanitizedUserName = userName.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        const user = addNewUser(sanitizedUserName);
        res.json(user.id)

        io.to(user.roomId).emit("server-msg", "SYSTEM", sanitizedUserName + " connected");
        io.to(user.roomId).emit("server-user-joined-room", user);
    }
})

function disconnectUser(user: Player)
{
    try
    {
        console.log("Disconnecting user ", user.id, user.name)
        removeUser(user)
        // for (const r of Object.values(rooms))
        //     r.users = r.users.filter(u => u != user)

        io.to(user.roomId).emit("server-msg", "SYSTEM", user.name + " disconnected");
        io.to(user.roomId).emit("server-user-left-room", user.id);
        emitServerStats()
    }
    catch (e)
    {
        console.log(e.message + " " + e.stack);
    }
}

app.post("/logout", (req, res) =>
{
    // this has never been tested
    const { userID } = req.body
    if (!userID)
    {
        res.statusCode = 500
        res.end("please specify a username")
    }
    else
    {
        const user = getUser(userID);
        if (!user) return;

        removeUser(user)

        res.end()
    }
})


// Disconnect users that have failed to ping in the last 30 seconds

setInterval(() =>
{
    for (const user of getConnectedUserList(null))
        if (Date.now() - user.lastPing > 80 * 1000)
            disconnectUser(user)
}, 1 * 1000)

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

http.listen(port, "0.0.0.0");

console.log("Server running on http://localhost:" + port);
