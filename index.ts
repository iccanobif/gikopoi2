// const fs = require('fs');
import express from "express"
import { readFile } from "fs";
const app: express.Application = express()
const http = require('http').Server(app);
const io = require("socket.io")(http);
const users = require("./users.js");
const { rooms } = require("./rooms.js");

io.on("connection", function (socket: any)
{
    console.log("Connection attempt");

    let user: any = null;
    let currentRoom = rooms.bar;
    let currentStreamSlotId: number | null = null;

    socket.on("user-connect", function (userId: number)
    {
        try
        {
            user = users.getUser(userId);

            console.log("userId: " + userId + " name: " + user.name);

            socket.emit("server-update-current-room-users", {
                users: users.getConnectedUserList(user.roomId)
            })
            socket.join(user.roomId)
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
            console.log(user.name + ": " + msg);
            io.to(user.roomId).emit("server-msg", "<span class=\"messageAuthor\">" + user.name + "</span>", "<span class=\"messageBody\">" + msg + "</span>");
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });

    socket.on("user-move", function (direction: 'up' | 'down' | 'left' | 'right')
    {
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
        io.to(user.roomId).emit("server-stream-data", data)
    })
    socket.on("user-want-to-stream", function (streamRequest: { streamSlotId: number, withVideo: boolean, withSound: boolean })
    {
        const { streamSlotId } = streamRequest

        if (currentRoom.streams[streamSlotId].isActive)
            socket.emit("server-not-ok-to-stream", "sorry, someone else is already streaming in this slot")
        else
        {
            currentStreamSlotId = streamSlotId

            socket.emit("server-ok-to-stream")

            const streamInfo = { ...streamRequest, userId: user.id }
            socket.to(user.roomId).emit("server-stream-started", streamInfo)
        }
    })
    socket.on("user-want-to-stop-stream", function ()
    {
        if (currentStreamSlotId === null) return // should never happen

        currentRoom.streams[currentStreamSlotId].isActive = false

        socket.to(user.roomId).emit("server-stream-stopped", {
            streamSlotId: currentStreamSlotId,
        })

        currentStreamSlotId = null
    })
    socket.on("user-change-room", function (data: { targetRoomId: number, targetX: number, targetY: number })
    {
        const { targetRoomId, targetX, targetY } = data

        currentRoom = rooms[targetRoomId]

        io.to(user.roomId).emit("server-user-left-room", user.id);
        socket.leave(user.roomId)
        user.position = { x: targetX, y: targetY }
        user.roomId = targetRoomId
        socket.join(targetRoomId)

        socket.emit("server-update-current-room-users", {
            users: users.getConnectedUserList(targetRoomId)
        })

        io.to(targetRoomId).emit("server-user-joined-room", user);
    })
});

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
            const user = users.getUser(userId)

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
        const user = users.addNewUser(userName);
        res.json(user.id)

        io.emit("server-msg", "SYSTEM", userName + " connected");
        io.emit("server-user-joined-room", user);
    }
})

function disconnectUser(user: any)
{
    console.log("Disconnecting user ", user.id, user.name)
    user["connected"] = false;
    io.emit("server-msg", "SYSTEM", user.name + " disconnected");
    io.emit("server-user-left-room", user.id);
}

app.post("/logout", (req, res) =>
{
    const { userID } = req.body
    if (!userID)
    {
        res.statusCode = 500
        res.end("please specify a username")
    }
    else
    {
        const user = users.getUser(userID);
        if (!user) return;

        res.end()
    }
})

// Disconnect users that have failed to ping in the last 30 seconds
setInterval(() =>
{
    const allUsers = users.getConnectedUserList(null)
    for (const user of Object.values(allUsers))
        if (Date.now() - (user as any)["lastPing"] > 30 * 1000)
            disconnectUser(user)
}, 20 * 1000)

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

http.listen(port, "0.0.0.0");

console.log("Server running on http://localhost:" + port);
