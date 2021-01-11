import express from "express"
import { readFile } from "fs";
import { defaultRoom, rooms } from "./rooms";
import { Direction } from "./types";
import { addNewUser, getConnectedUserList, getUser, Player, removeUser } from "./users";
import { sleep } from "./utils";
import { RTCPeer, defaultIceConfig } from "./rtcpeer";
const app: express.Application = express()
const http = require('http').Server(app);
const io = require("socket.io")(http);
const tripcode = require('tripcode');
const enforce = require('express-sslify');

const delay = 0

io.on("connection", function (socket: any)
{
    console.log("Connection attempt");

    let user: Player;
    let currentRoom = defaultRoom;
    //let currentStreamSlotId: number | null = null;

    let rtcPeer: RTCPeer = new RTCPeer(defaultIceConfig, emitRTCMessage);

    socket.join(currentRoom.id)

    socket.on("disconnect", function ()
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
            socket.emit("server-update-current-room-streams", currentRoom.streams)
            
            emitServerStats()
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
            console.error(e.message + " " + e.stack);
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

            io.to(user.roomId).emit("server-move",
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

            if (currentRoom.streams[streamSlotId].isActive)
            {
                socket.emit("server-not-ok-to-stream", "sorry, someone else is already streaming in this slot")
                return;
            }

            openRTCConnection()
            if (rtcPeer.conn === null) return;

            //currentStreamSlotId = streamSlotId
            currentRoom.streams[streamSlotId].isActive = true
            currentRoom.streams[streamSlotId].isReady = false
            currentRoom.streams[streamSlotId].withVideo = withVideo
            currentRoom.streams[streamSlotId].withSound = withSound
            currentRoom.streams[streamSlotId].userId = user.id
            io.to(user.roomId).emit("server-update-current-room-streams", currentRoom.streams)
            const handleTrack = (event: RTCTrackEvent) =>
            {
                if (rtcPeer.conn === null) return;
                user.mediaStream = event.streams[0]
                currentRoom.streams[streamSlotId].isReady = true
                io.to(user.roomId).emit("server-update-current-room-streams", currentRoom.streams)
                try
                {
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
            //currentStreamSlotId = null
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-want-to-get-stream", function (streamSlotId: number)
    {
        try
        {
            const userid = currentRoom.streams[streamSlotId].userId;
            if (userid === null) return;
            const user = getUser(userid)

            if (user.mediaStream === null) return;

            openRTCConnection()
            
            if (rtcPeer.conn === null) return;
            
            user.mediaStream.getTracks().forEach(track =>
                rtcPeer.conn!.addTrack(track, user.mediaStream!))
            socket.emit("server-ok-to-get-stream", streamSlotId)
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })
    
    socket.on("user-want-to-stop-getting-stream", function (streamSlotId: number)
    {
        try
        {
            if (user.mediaStream === null) return;
            if (rtcPeer.conn === null) return;
            
            const tracks = user.mediaStream.getTracks();
            rtcPeer.conn.getSenders().forEach((sender: any) =>
            {
                if (sender === null) return;
                if (sender.track && tracks.includes(sender.track))
                    rtcPeer.conn!.removeTrack(sender)
            });
                
        }
        catch (e)
        {
            console.error(e.message + " " + e.stack);
        }
    })
    
    socket.on("user-change-room", async function (data: { targetRoomId: string, targetX: number, targetY: number })
    {
        try
        {
            await sleep(delay)

            let { targetRoomId, targetX, targetY } = data

            currentRoom = rooms[targetRoomId]

            if (targetX == undefined)
                targetX = rooms[targetRoomId].spawnPoint.x
            if (targetY == undefined)
                targetY = rooms[targetRoomId].spawnPoint.y

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
        catch(e){console.error(e.message + " " + e.stack);}
    }
    
    function handleIceConnectionStateChange(event: Event)
    {
        try
        {
            if (rtcPeer.conn === null) return;
            const state = rtcPeer.conn.iceConnectionState;
            
            console.log("["+user.id+"]", 'ICE state change event: ', state)
            if (["failed", "disconnected", "closed"].includes(state))
            {
                rtcPeer.close()
                clearStream(user)
            }
        }
        catch(e){console.error(e.message + " " + e.stack);}
    }
    
    function emitRTCMessage(type: string, message: any)
    {
        try{socket.emit('server-rtc-' + type, message)}
        catch(e){console.error(e.message + " " + e.stack);}
    }
    
    socket.on("user-rtc-offer", (offer: RTCSessionDescription) =>
    {
        try{rtcPeer.acceptOffer(offer)}
        catch(e){console.error(e.message + " " + e.stack);}
    })
    
    socket.on("user-rtc-answer", (answer: RTCSessionDescription) =>
    {
        try{rtcPeer.acceptAnswer(answer)}
        catch(e){console.error(e.message + " " + e.stack);}
    })
    
    socket.on("user-rtc-candidate", (candidate: RTCIceCandidate) =>
    {
        try{rtcPeer.addCandidate(candidate)}
        catch(e){console.error(e.message + " " + e.stack);}
    })
});

function emitServerStats()
{
    io.emit("server-stats", {
        userCount: getConnectedUserList(null).length
    })
}

if (process.env.NODE_ENV == "production")
    app.use(enforce.HTTPS({ trustProtoHeader: true }))

app.use(express.static('static',
    { setHeaders: (res) => res.set("Cache-Control", "no-cache") }
));

app.get("/rooms/:roomName", (req, res) =>
{
    try
    {
        const roomName = req.params.roomName
        res.json(rooms[roomName])
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
    }
    catch (e)
    {
        res.end(e.message + " " + e.stack)
    }
})

function clearStream(user: Player)
{
    if (!user) return

    const room = rooms[user.roomId]
    const stream = room.streams.find(s => s.userId == user.id)
    if (stream)
    {
        stream.isActive = false
        stream.isReady = false
        stream.userId = null
        io.to(user.roomId).emit("server-update-current-room-streams", room.streams)
    }
}

function disconnectUser(user: Player)
{
    console.log("Disconnecting user ", user.id, user.name)
    clearStream(user)
    removeUser(user)

    io.to(user.roomId).emit("server-msg", "SYSTEM", user.name + " disconnected");
    io.to(user.roomId).emit("server-user-left-room", user.id);
    emitServerStats()
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
        for (const user of getConnectedUserList(null))
            if (Date.now() - user.lastPing > 80 * 1000)
                disconnectUser(user)
    }
    catch (e)
    {
        console.error(e.message + " " + e.stack);
    }
}, 1 * 1000)

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

http.listen(port, "0.0.0.0");

console.log("Server running on http://localhost:" + port);
