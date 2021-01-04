import express from "express"
import { readFile } from "fs";
import { defaultRoom, rooms } from "./rooms";
import { Direction } from "./types";
import { addNewUser, getConnectedUserList, getUser, Player, removeUser } from "./users";
import { appendBuffer, indexOfMulti, sleep } from "./utils";
const app: express.Application = express()
const http = require('http').Server(app);
const io = require("socket.io")(http);
const tripcode = require('tripcode');

const delay = 0

io.on("connection", function (socket: any)
{
    console.log("Connection attempt");

    let user: Player;
    let currentRoom = defaultRoom;
    let currentStreamSlotId: number | null = null;

    socket.join(currentRoom.id)

    socket.on("disconnect", function ()
    {
        clearStream(user)
    })

    socket.on("user-connect", function (userId: string)
    {
        try
        {
            user = getUser(userId);
            if (!user)
                socket.emit("server-cant-log-you-in")

            console.log("userId: " + userId + " name: " + user.name);

            currentRoom = rooms[user.roomId]

            socket.emit("server-update-current-room-state", currentRoom, getConnectedUserList(user.roomId))
            io.to(user.roomId).emit("server-update-current-room-streams", currentRoom.streams)

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
                .replace(/((https?:\/\/|www\.)[^\s]+)/gi, function (url, prefix)
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
    socket.on("user-move", async function (direction: Direction)
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
                if (newX >= currentRoom.size.x) { rejectMovement(); return }
                if (newY >= currentRoom.size.y) { rejectMovement(); return }

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
    socket.on("user-stream-data", function (data: ArrayBuffer)
    {
        try
        {
            const streamSlot = currentRoom.streams[currentStreamSlotId!]

            // the initialization segment is everything that's before the first 0x1F43B675
            // every cluster begins with a 0x1F43B675

            // cluster that starts with keyframe is 0x1F43B675 FFE7840000

            // console.log(streamSlot)

            if (!streamSlot.initializationSegment || !streamSlot.firstWebmCluster)
            {
                streamSlot.initialBuffer = streamSlot.initialBuffer
                    ? appendBuffer(streamSlot.initialBuffer, data)
                    : data
            }
            if (!streamSlot.initializationSegment)
            {
                const array = new Uint8Array(streamSlot.initialBuffer!)
                const startOfFirstCluster = indexOfMulti(array, [0x1F, 0x43, 0xB6, 0x75,], 0)
                if (startOfFirstCluster != -1)
                    streamSlot.initializationSegment = array.slice(0, startOfFirstCluster)
                else
                    streamSlot.initialBuffer = appendBuffer(streamSlot.initialBuffer!, data)
            }

            if (!streamSlot.firstWebmCluster)
            {
                const array = new Uint8Array(streamSlot.initialBuffer!)
                const startOfFirstCluster = indexOfMulti(array, [0x1F, 0x43, 0xB6, 0x75,], 0)
                const startOfSecondCluster = indexOfMulti(array, [0x1F, 0x43, 0xB6, 0x75,], startOfFirstCluster + 1)
                if (startOfFirstCluster != -1 && startOfSecondCluster != -1)
                    streamSlot.firstWebmCluster = array.slice(startOfFirstCluster, startOfSecondCluster)
                else
                    streamSlot.initialBuffer = appendBuffer(streamSlot.initialBuffer!, data)
            }


            socket.to(user.roomId).emit("server-stream-data", currentStreamSlotId, data)

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

                io.to(user.roomId).emit("server-update-current-room-streams", currentRoom.streams)
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
            clearStream(user)
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

            clearStream(user)
            io.to(user.roomId).emit("server-user-left-room", user.id);
            socket.leave(user.roomId)

            user.position = { x: targetX, y: targetY }
            user.roomId = targetRoomId

            socket.emit("server-update-current-room-state", currentRoom, getConnectedUserList(targetRoomId))
            socket.emit("server-update-current-room-streams", currentRoom.streams)
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
    if (!userName)
    {
        res.statusCode = 500
        res.end("please specify a username")
        return;
    }

    const n = userName.indexOf("#");
    let processedUserName = (n >= 0 ? userName.substr(0, n) : userName)
        .replace("◆", "◇");
    if (n >= 0)
        processedUserName = processedUserName + "◆" + tripcode(userName.substr(n + 1));

    console.log(processedUserName, "logging in")

    const sanitizedUserName = processedUserName.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const user = addNewUser(sanitizedUserName);
    res.json(user.id)

    io.to(user.roomId).emit("server-msg", "SYSTEM", sanitizedUserName + " connected");
    io.to(user.roomId).emit("server-user-joined-room", user);
})

function clearStream(user: Player)
{
    if (!user) return

    const room = rooms[user.roomId]
    const stream = room.streams.find(s => s.userId == user.id)
    if (stream)
    {
        stream.isActive = false
        stream.userId = null
        stream.initializationSegment = null
        stream.initialBuffer = null
        stream.firstWebmCluster = null
        io.to(user.roomId).emit("server-update-current-room-streams", room.streams)
    }
}

function disconnectUser(user: Player)
{
    try
    {
        console.log("Disconnecting user ", user.id, user.name)
        clearStream(user)
        removeUser(user)

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
