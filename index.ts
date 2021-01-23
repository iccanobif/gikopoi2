import express from "express"
import { readFile, writeFile } from "fs";
import { defaultRoom, rooms } from "./rooms";
import { Direction, RoomState, RoomStateDto } from "./types";
import { addNewUser, deserializeUserState, getConnectedUserList, getGhostUsers, getUser, Player, removeUser, serializeUserState } from "./users";
import { sleep } from "./utils";
import { RTCPeer, defaultIceConfig } from "./rtcpeer";
import got from "got";
const app: express.Application = express()
const http = require('http').Server(app);
const io = require("socket.io")(http);
const tripcode = require('tripcode');
const enforce = require('express-sslify');

const delay = 0

// Initialize room states:
let roomStates: {
    [areaId: string]: { [roomId: string]: RoomState }
} = {};

function initializeRoomStates()
{
    roomStates = {}
    for (const areaId of ["for", "gen"])
    {
        roomStates[areaId] = {}
        for (const roomId in rooms)
        {
            roomStates[areaId][roomId] = { streams: [] }
            for (let i = 0; i < rooms[roomId].streamSlotCount; i++)
            {
                roomStates[areaId][roomId].streams.push({
                    isActive: false,
                    isReady: false,
                    withSound: null,
                    withVideo: null,
                    userId: null
                })
            }
        }
    }
}

initializeRoomStates()

io.on("connection", function (socket: any)
{
    console.log("Connection attempt");

    let user: Player;
    let currentRoom = defaultRoom;
    //let currentStreamSlotId: number | null = null;

    let rtcPeer: RTCPeer = new RTCPeer(defaultIceConfig, emitRTCMessage);

    socket.on("disconnect", function ()
    {
        try
        {
            if (!user) return;

            console.log("disconnect")

            user.isGhost = true
            io.to(user.areaId + user.roomId).emit("server-user-left-room", user.id);
            clearStream(user)
            emitServerStats(user.areaId)
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-connect", function (userId: string)
    {
        try
        {
            console.log("user-connect", userId)
            user = getUser(userId);
            if (!user)
            {
                socket.emit("server-cant-log-you-in")
                return;
            }

            currentRoom = rooms[user.roomId]

            socket.join(user.areaId)
            socket.join(user.areaId + currentRoom.id)

            user.isGhost = false

            console.log("userId: " + userId + " name: " + user.name);

            currentRoom = rooms[user.roomId]

            socket.emit("server-update-current-room-state",
                <RoomStateDto>{
                    currentRoom,
                    connectedUsers: getConnectedUserList(user.roomId, user.areaId),
                    streams: roomStates[user.areaId][user.roomId].streams
                })

            socket.to(user.areaId + currentRoom.id).emit("server-user-joined-room", user);

            emitServerStats(user.areaId)
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    });
    socket.on("user-msg", function (msg: string)
    {
        try
        {
            msg = msg.substr(0, 500)

            const userName = user.name

            console.log(userName + ": " + msg);

            io.to(user.areaId + user.roomId).emit("server-msg", userName, msg);
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    });
    socket.on("user-move", async function (direction: Direction)
    {
        await sleep(delay)
        console.log("user-move", direction)

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
                if (currentRoom.blocked.find(p => p.x == newX && p.y == newY))
                {
                    rejectMovement();
                    return
                }
                if (currentRoom.forbiddenMovements.find(p =>
                    p.xTo == newX &&
                    p.yTo == newY &&
                    p.xFrom == user.position.x &&
                    p.yFrom == user.position.y))
                {
                    rejectMovement()
                    return
                }

                user.position.x = newX
                user.position.y = newY
            }

            io.to(user.areaId + user.roomId).emit("server-move",
                user.id,
                user.position.x,
                user.position.y,
                user.direction,
                false);
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    });
    socket.on("user-want-to-stream", function (streamRequest: { streamSlotId: number, withVideo: boolean, withSound: boolean })
    {
        try
        {
            const { streamSlotId, withVideo, withSound } = streamRequest

            const streams = roomStates[user.areaId][user.roomId].streams

            if (streams[streamSlotId].isActive)
            {
                socket.emit("server-not-ok-to-stream", "sorry, someone else is already streaming in this slot")
                return;
            }

            openRTCConnection()
            if (rtcPeer.conn === null) return;

            //currentStreamSlotId = streamSlotId
            streams[streamSlotId].isActive = true
            streams[streamSlotId].isReady = false
            streams[streamSlotId].withVideo = withVideo
            streams[streamSlotId].withSound = withSound
            streams[streamSlotId].userId = user.id
            io.to(user.areaId + user.roomId).emit("server-update-current-room-streams", streams)

            const handleTrack = (event: RTCTrackEvent) =>
            {
                try
                {
                    if (rtcPeer.conn === null) return;
                    user.mediaStream = event.streams[0]
                    streams[streamSlotId].isReady = true
                    io.to(user.areaId + user.roomId).emit("server-update-current-room-streams", streams)
                    rtcPeer.conn.removeEventListener('track', handleTrack);
                }
                catch (e)
                {
                    console.error(e.message + " " + e.stack);
                }
            };
            rtcPeer.conn.addEventListener('track', handleTrack);
            socket.emit("server-ok-to-stream")
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })
    socket.on("user-want-to-stop-stream", function () //TODO
    {
        try
        {
            clearStream(user)
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-want-to-take-stream", function (streamSlotId: number)
    {
        try
        {
            const streams = roomStates[user.areaId][currentRoom.id].streams
            const userid = streams[streamSlotId].userId;
            if (userid === null) return;
            const userWhoIsStreaming = getUser(userid)

            if (userWhoIsStreaming.mediaStream === null) return;

            openRTCConnection()

            if (rtcPeer.conn === null) return;

            userWhoIsStreaming.mediaStream.getTracks().forEach(track =>
                rtcPeer.conn!.addTrack(track, userWhoIsStreaming.mediaStream!))
            socket.emit("server-ok-to-take-stream", streamSlotId)
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-want-to-drop-stream", function (streamSlotId: number)
    {
        try
        {
            const streams = roomStates[user.areaId][currentRoom.id].streams
            const userid = streams[streamSlotId].userId;
            if (userid === null) return;
            const userWhoIsStreaming = getUser(userid)
            if (userWhoIsStreaming.mediaStream === null) return;
            if (rtcPeer.conn === null) return;

            const tracks = userWhoIsStreaming.mediaStream.getTracks();
            rtcPeer.conn.getSenders().forEach((sender: RTCRtpSender) =>
            {
                if (sender === null || sender.track === null) return;
                if (sender.track && tracks.includes(sender.track))
                    rtcPeer.conn!.removeTrack(sender)
            });
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-change-room", async function (data: { targetRoomId: string, targetDoorId: string })
    {
        try
        {
            await sleep(delay)
            console.log("user-change-room")

            let { targetRoomId, targetDoorId } = data

            currentRoom = rooms[targetRoomId]

            clearStream(user)
            io.to(user.areaId + user.roomId).emit("server-user-left-room", user.id);
            socket.leave(user.areaId + user.roomId)

            if (targetDoorId == undefined)
                targetDoorId = rooms[targetRoomId].spawnPoint;

            if (!(targetDoorId in rooms[targetRoomId].doors))
            {
                console.error("Could not find door " + targetDoorId + " in room " + targetRoomId);
                return;
            }

            const door = rooms[targetRoomId].doors[targetDoorId]

            user.position = { x: door.x, y: door.y }
            if (door.direction !== null) user.direction = door.direction
            user.roomId = targetRoomId

            rtcPeer.close()

            socket.emit("server-update-current-room-state",
                <RoomStateDto>{
                    currentRoom,
                    connectedUsers: getConnectedUserList(targetRoomId, user.areaId),
                    streams: roomStates[user.areaId][targetRoomId].streams
                })

            socket.join(user.areaId + targetRoomId)
            socket.to(user.areaId + targetRoomId).emit("server-user-joined-room", user);
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-room-list", function () //TODO
    {
        try
        {
            const roomList: any[] = [];
            for (const roomId in rooms)
            {
                if (rooms[roomId].secret) continue;
                const listRoom: { id: string, userCount: number, streamers: string[] } =
                {
                    id: roomId,
                    userCount: getConnectedUserList(roomId, user.areaId).length,
                    streamers: []
                }
                roomStates[user.areaId][roomId].streams.forEach(stream =>
                {
                    if (!stream.isActive || stream.userId == null) return;
                    try
                    {
                        listRoom.streamers.push(getUser(stream.userId).name);
                    }
                    catch (e) { }
                })
                roomList.push(listRoom)
            }

            socket.emit("server-room-list", roomList)
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })

    function openRTCConnection()
    {
        try
        {
            rtcPeer.open()
            if (rtcPeer.conn === null) return;
            rtcPeer.conn.addEventListener('iceconnectionstatechange',
                handleIceConnectionStateChange);
        }
        catch (e) { console.error(e.message + " " + e.stack); }
    }

    function handleIceConnectionStateChange(event: Event)
    {
        try
        {
            if (rtcPeer.conn === null) return;
            const state = rtcPeer.conn.iceConnectionState;

            if (["failed", "disconnected", "closed"].includes(state))
            {
                rtcPeer.close()
                clearStream(user)
            }
        }
        catch (e) { console.error(e.message + " " + e.stack); }
    }

    function emitRTCMessage(type: string, message: any)
    {
        try { socket.emit('server-rtc-' + type, message) }
        catch (e) { console.error(e.message + " " + e.stack); }
    }

    socket.on("user-rtc-offer", (offer: RTCSessionDescription) =>
    {
        try { rtcPeer.acceptOffer(offer) }
        catch (e) { console.error(e.message + " " + e.stack); }
    })

    socket.on("user-rtc-answer", (answer: RTCSessionDescription) =>
    {
        try { rtcPeer.acceptAnswer(answer) }
        catch (e) { console.error(e.message + " " + e.stack); }
    })

    socket.on("user-rtc-candidate", (candidate: RTCIceCandidate) =>
    {
        try { rtcPeer.addCandidate(candidate) }
        catch (e) { console.error(e.message + " " + e.stack); }
    })
});

function emitServerStats(areaId: string)
{
    io.to(areaId).emit("server-stats", {
        userCount: getConnectedUserList(null, areaId).length
    })
}

if (process.env.NODE_ENV == "production")
    app.use(enforce.HTTPS({ trustProtoHeader: true }))

app.get("/", (req, res) =>
{
    console.log("Fetching root...")
    readFile("static/index.html", 'utf8', async (err, data) =>
    {
        try
        {
            if (err)
            {
                res.statusCode = 500
                res.end("Could not retrieve index.html [${err}]")
                return
            }

            const { statusCode, body } = await got(
                'https://raw.githubusercontent.com/iccanobif/gikopoi2/master/external/change_log.html')

            data = data.replace("@CHANGE_LOG@", statusCode === 200 ? body : "")

            for (const areaId in roomStates)
            {
                data = data.replace("@USER_COUNT_" + areaId.toUpperCase() + "@",
                    getConnectedUserList(null, areaId).length.toString())
            }

            res.set({
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache'
            })
            res.end(data)
        }
        catch (e)
        {
            res.end(e.message + " " + e.stack)
        }
    })
})

app.use(express.static('static',
    { setHeaders: (res) => res.set("Cache-Control", "no-cache") }
));

app.get("/areas/:areaId/rooms/:roomId", (req, res) =>
{
    try
    {
        const roomId = req.params.roomId
        const areaId = req.params.areaId

        const dto: RoomStateDto = {
            currentRoom: rooms[roomId],
            connectedUsers: getConnectedUserList(roomId, areaId),
            streams: roomStates[areaId][roomId].streams
        }

        res.json(dto)
    }
    catch (e)
    {
        res.end(e.message + " " + e.stack)
    }
})

app.post("/ping/:userId", async (req, res) =>
{
    readFile("version", (err, data) =>
    {
        if (err)
            res.json(err)
        else
        {
            try
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
            catch (e)
            {
                res.end(e.message + " " + e.stack)
            }
        }
    })
})

app.use(express.json());

app.post("/login", (req, res) =>
{
    try
    {
        let { userName, characterId, areaId } = req.body
        if (!userName)
        {
            res.statusCode = 500
            res.end("please specify a username")
            return;
        }

        if (userName.length > 20)
            userName = userName.substr(0, 20)

        const n = userName.indexOf("#");
        let processedUserName = (n >= 0 ? userName.substr(0, n) : userName)
            .replace("◆", "◇");
        if (n >= 0)
            processedUserName = processedUserName + "◆" + tripcode(userName.substr(n + 1));

        console.log(processedUserName, "logging in")

        const user = addNewUser(processedUserName, characterId, areaId);
        res.json(user.id)
    }
    catch (e)
    {
        res.end(e.message + " " + e.stack)
    }
})

function clearStream(user: Player)
{
    try
    {
        if (!user) return

        console.log("trying clearStream:", user.areaId, user.roomId)

        const streams = roomStates[user.areaId][user.roomId].streams

        const stream = streams.find(s => s.userId == user.id)
        if (stream)
        {
            stream.isActive = false
            stream.isReady = false
            stream.userId = null
            io.to(user.areaId + user.roomId).emit("server-update-current-room-streams", streams)
        }
    }
    catch (error)
    {
        console.log(error)
    }
}

function disconnectUser(user: Player)
{
    console.log("Disconnecting user ", user.id, user.name, user.areaId)
    clearStream(user)
    removeUser(user)

    io.to(user.areaId + user.roomId).emit("server-user-left-room", user.id);
    emitServerStats(user.areaId)
}

app.post("/logout", (req, res) =>
{
    try
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
    }
    catch (e)
    {
        res.end(e.message + " " + e.stack)
    }
})

// Disconnect users that have failed to ping in the last 30 seconds

setInterval(() =>
{
    try
    {
        for (const user of getGhostUsers())
            if (Date.now() - user.lastPing > 1 * 60 * 1000)
                disconnectUser(user)
    }
    catch (e)
    {
        console.error(e.message + " " + e.stack);
    }
}, 1 * 1000)

// Persist state every few seconds, so that people can seamless reconnect on a server restart

async function persistState()
{
    console.log("persisting...")
    const serializedUserState = serializeUserState()
    console.log(serializedUserState)
    try
    {

        if (process.env.PERSISTOR_URL)
        {
            await got.post(process.env.PERSISTOR_URL, {
                headers: {
                    "persistor-secret": process.env.PERSISTOR_SECRET,
                    "Content-Type": "text/plain"
                },
                body: serializedUserState
            })
        }
        else
        {
            // use local file
            writeFile("persisted-state",
                serializedUserState,
                { encoding: "utf-8" },
                (err) =>
                {
                    if (err) console.error(err)
                })
        }
    }
    catch (exc)
    {
        console.log(exc)
    }
}

function restoreState()
{
    initializeRoomStates()
    // If there's an error, just don't deserialize anything
    // and start with a fresh state
    return new Promise<void>(async (resolve, reject) =>
    {
        console.log("Restoring state...")
        if (process.env.PERSISTOR_URL)
        {
            // remember to do it as defensive as possible
            try
            {
                const response = await got.get(process.env.PERSISTOR_URL, {
                    headers: {
                        "persistor-secret": process.env.PERSISTOR_SECRET
                    }
                })
                if (response.statusCode == 200)
                    deserializeUserState(response.body)
                resolve()
            }
            catch (exc)
            {
                console.log(exc)
                resolve()
            }
        }
        else 
        {
            readFile("persisted-state", { encoding: "utf-8" }, (err, data) =>
            {
                if (err)
                {
                    console.log(err)
                }
                else
                {
                    deserializeUserState(data)
                    resolve()
                }
            })
        }
    })
}

setInterval(() => persistState(), 5 * 1000)

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

restoreState().then(() =>
{
    http.listen(port, "0.0.0.0");

    console.log("Server running on http://localhost:" + port);
})
    .catch(console.error)

    