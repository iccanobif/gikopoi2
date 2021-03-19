import express from "express"
import { readFile, readFileSync, writeFile } from "fs";
import { defaultRoom, rooms } from "./rooms";
import { Direction, RoomState, RoomStateDto, JanusServer, LoginResponseDto } from "./types";
import { addNewUser, deserializeUserState, getConnectedUserList, getUsersByIp, getAllUsers, getLoginUser, getUser, Player, removeUser, serializeUserState } from "./users";
import { sleep } from "./utils";
import got from "got";
import log from "loglevel";
import { settings } from "./settings";
import { cloneDeep } from "lodash";
import compression from 'compression';

const app: express.Application = express()
const http = require('http').Server(app);
const io = require("socket.io")(http, {
    pingInterval: 25 * 1000, // Heroku fails with "H15 Idle connection" if a socket is inactive for more than 55 seconds with
    pingTimeout: 60 * 1000
});
const tripcode = require('tripcode');
const enforce = require('express-sslify');
const JanusClient = require('janus-videoroom-client').Janus;

const delay = 0
const persistInterval = 5 * 1000
const maxGhostRetention = 5 * 60 * 1000
const inactivityTimeout = 30 * 60 * 1000
const maximumUsersPerIpPerArea = 2

const appVersion = Number.parseInt(readFileSync("version").toString())

log.setLevel(log.levels.DEBUG)

console.log("Gikopoipoi (version " + appVersion + ")")
console.log("Using settings:", JSON.stringify(settings))

if (settings.isBehindProxy)
    app.set('trust proxy', true)

const janusServers: JanusServer[] =
    [{
        id: "maf",
        client: new JanusClient({
            url: settings.janusServerUrl,
            apiSecret: settings.janusApiSecret,
        })
    }]
const janusServersObject = Object.fromEntries(janusServers.map(o => [o.id, o]));

// Initialize room states:
let roomStates: {
    [areaId: string]: { [roomId: string]: RoomState }
} = {};

function initializeRoomStates()
{
    let areaNumberId = 0;
    roomStates = {}
    for (const areaId of ["for", "gen"])
    {
        let roomNumberId = 0;
        roomStates[areaId] = {}
        for (const roomId in rooms)
        {
            roomStates[areaId][roomId] = {
                streams: [],
                janusRoomServer: null,
                janusRoomName: settings.janusRoomNamePrefix + ":" + areaId + ":" + roomId,
                janusRoomIntName: (settings.janusRoomNameIntPrefix * 10000000) + (areaNumberId * 10000) + roomNumberId,
            }
            for (let i = 0; i < rooms[roomId].streamSlotCount; i++)
            {
                roomStates[areaId][roomId].streams.push({
                    isActive: false,
                    isReady: false,
                    withSound: null,
                    withVideo: null,
                    userId: null,
                    publisherId: null
                })
            }
            roomNumberId++;
        }
        areaNumberId++;
    }
}

initializeRoomStates()

io.on("connection", function (socket: any)
{
    log.info("Connection attempt");

    let user: Player;
    let currentRoom = defaultRoom;
    let janusHandleSlots: any[] = [];

    const sendCurrentRoomState = () => 
    {
        const connectedUsers: Player[] = getConnectedUserList(user.roomId, user.areaId)
            .map(p =>
            {
                if (rooms[user.roomId].forcedAnonymous)
                {
                    const anonymousUser = cloneDeep(p)
                    anonymousUser.name = ""
                    return anonymousUser
                }
                else
                    return p
            })

        socket.emit("server-update-current-room-state",
            <RoomStateDto>{
                currentRoom,
                connectedUsers,
                streams: roomStates[user.areaId][user.roomId].streams
            })
    }

    const sendNewUserInfo = () =>
    {
        const userInfo = cloneDeep(user)
        delete userInfo.privateId;

        if (currentRoom.forcedAnonymous)
            userInfo.name = ""

        socket.to(user.areaId + currentRoom.id).emit("server-user-joined-room", userInfo);
    }

    const setupJanusHandleSlots = () =>
    {
        janusHandleSlots = roomStates[user.areaId][user.roomId].streams.map(() => null)
    }

    socket.on("disconnect", function ()
    {
        try
        {
            if (!user) return;

            log.info("disconnect", user.id)

            user.isGhost = true
            user.disconnectionTime = Date.now()
            io.to(user.areaId + user.roomId).emit("server-user-left-room", user.id);
            clearStream(user)
            emitServerStats(user.areaId)
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-connect", function (privateUserId: string)
    {
        try
        {
            log.info("user-connect private id:", privateUserId)
            const loginUser = getLoginUser(privateUserId);
            if (!loginUser)
            {
                log.info("server-cant-log-you-in", privateUserId)
                socket.emit("server-cant-log-you-in")
                socket.disconnect(true)
                return;
            }
            user = loginUser;

            log.info("user-connect userId:", user.id, "name:", "<" + user.name + ">", "disconnectionTime:", user.disconnectionTime);

            currentRoom = rooms[user.roomId]

            socket.join(user.areaId)
            socket.join(user.areaId + currentRoom.id)

            user.isGhost = false
            user.disconnectionTime = null

            currentRoom = rooms[user.roomId]

            sendCurrentRoomState()
            setupJanusHandleSlots()

            sendNewUserInfo()

            emitServerStats(user.areaId)
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
        }
    });
    socket.on("user-msg", function (msg: string)
    {
        try
        {
            user.isInactive = false

            // Whitespace becomes an empty string (to clear bubbles)
            if (!msg.match(/[^\s]/g))
            {
                msg = ""
            }
            else 
            {
                // no TIGER TIGER pls
                if ("TIGER".startsWith(msg.replace(/TIGER/gi, "").replace(/\s/g, "")))
                    msg = "(´・ω・`)"

                // and for the love of god no moonwalking
                if (msg.toLowerCase().includes("moonwalk") || msg.toLowerCase().includes("moon-walk"))
                    msg = "(^Д^)"
            }

            msg = msg.substr(0, 500)

            user.lastRoomMessage = msg;

            log.info("MSG:", user.id, user.areaId, user.roomId, "<" + user.name + ">" + ": " + msg);

            user.lastAction = Date.now()

            io.to(user.areaId + user.roomId).emit("server-msg", user.id, msg);
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
        }
    });
    socket.on("user-move", async function (direction: Direction)
    {
        await sleep(delay)

        try
        {
            log.info("user-move", user.id, direction)
            user.isInactive = false
            user.lastAction = Date.now()

            const shouldSpinwalk = user.directionChangedAt !== null
                && user.lastDirection == direction
                && (Date.now() - user.directionChangedAt) < 500

            if (user.direction != direction && !shouldSpinwalk)
            {
                // ONLY CHANGE DIRECTION
                user.lastDirection = user.direction;
                user.direction = direction;
                user.directionChangedAt = Date.now();
            }
            else
            {
                // MOVE
                let newX = user.position.x
                let newY = user.position.y

                user.directionChangedAt = null;

                switch (direction)
                {
                    case "up": newY++; break;
                    case "down": newY--; break;
                    case "left": newX--; break;
                    case "right": newX++; break;
                }

                const rejectMovement = () =>
                {
                    log.info("movement rejected", user.id)
                    socket.emit("server-reject-movement")
                }

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

                // Become fat if you're at position 2,4 in yoshinoya room
                if (currentRoom.id == "yoshinoya" && user.position.x == 2 && user.position.y == 4)
                {
                    user.characterId = "hungry_giko"
                    // sendCurrentRoomState()
                    io.to(user.areaId + user.roomId).emit("server-character-changed", user.id, user.characterId)
                }

                user.position.x = newX
                user.position.y = newY
            }

            io.to(user.areaId + user.roomId).emit("server-move",
                {
                    userId: user.id,
                    x: user.position.x,
                    y: user.position.y,
                    direction: user.direction,
                    isInstant: false,
                    shouldSpinwalk,
                });
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
        }
    });
    socket.on("user-bubble-position", function (position: Direction)
    {
        try
        {
            user.bubblePosition = position;

            io.to(user.areaId + user.roomId).emit("server-bubble-position", user.id, position);
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
        }
    });
    socket.on("user-want-to-stream", function (data: { streamSlotId: number, withVideo: boolean, withSound: boolean, info: any })
    {
        try
        {
            const { streamSlotId, withVideo, withSound, info } = data

            log.info("user-want-to-stream", user.id, JSON.stringify(info))

            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId]

            if (stream.userId == user.id) clearStream(user);

            if (stream.isActive)
            {
                log.info("server-not-ok-to-stream", user.id)
                socket.emit("server-not-ok-to-stream", "Sorry, someone else is already streaming in this slot")
                return;
            }

            stream.isActive = true
            stream.isReady = false
            stream.withVideo = withVideo
            stream.withSound = withSound
            stream.userId = user.id
            stream.publisherId = null

            setTimeout(() =>
            {
                if (stream.publisherId == null) clearStream(user)
            }, 10000);

            io.to(user.areaId + user.roomId).emit("server-update-current-room-streams", roomState.streams)

            socket.emit("server-ok-to-stream")
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
            socket.emit("server-not-ok-to-stream", "Sorry, could not start stream")
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
            log.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-want-to-take-stream", async function (streamSlotId: number)
    {
        try
        {
            if (streamSlotId === undefined) return;
            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId];
            if (stream.userId === null || stream.publisherId === null ||
                roomState.janusRoomServer === null)
            {
                socket.emit("server-not-ok-to-take-stream", streamSlotId);
                return;
            };

            const client = roomState.janusRoomServer.client;

            await janusClientConnect(client);
            const session = await client.createSession()

            const janusHandle = await session.videoRoom().listenFeed(
                roomState.janusRoomIntName, stream.publisherId)
            janusHandleSlots[streamSlotId] = janusHandle;

            janusHandle.onTrickle((candidate: any) =>
            {
                socket.emit("server-rtc-message", streamSlotId, "candidate", candidate);
            })

            const offer = janusHandle.getOffer();

            socket.emit("server-rtc-message", streamSlotId, "offer", offer);
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
            socket.emit("server-not-ok-to-take-stream", streamSlotId);
        }
    })

    // Not sure this is needed anymore:
    /*
        socket.on("user-want-to-drop-stream", function (streamSlotId: number)
        {
            try
            {
                const streams = roomStates[user.areaId][currentRoom.id].streams
                const userid = streams[streamSlotId].userId;
                if (userid === null) return;
                const userWhoIsStreaming = getUser(userid)
                
            }
            catch (e)
            {
                log.error(e.message + " " + e.stack);
            }
        })
    */

    socket.on("user-rtc-message", async function (data: { streamSlotId: number, type: string, msg: any })
    {
        try
        {
            const { streamSlotId, type, msg } = data
            log.debug("user-rtc-message start", user.id, streamSlotId, type, msg);

            if (type == "offer")
            {
                const roomState = roomStates[user.areaId][user.roomId];
                const stream = roomState.streams[streamSlotId];
                if (stream.userId !== user.id) return;

                if (roomState.janusRoomServer === null)
                {
                    roomState.janusRoomServer = getLeastUsedJanusServer()
                }
                const client = roomState.janusRoomServer.client;

                await janusClientConnect(client);
                const session = await client.createSession()

                const videoRoomHandle = await session.videoRoom().createVideoRoomHandle();
                try
                {
                    await videoRoomHandle.create({
                        room: roomState.janusRoomIntName,
                        publishers: 20
                    })
                    log.info("user-rtc-message", user.id, "Janus room " + roomState.janusRoomIntName
                        + "(" + roomState.janusRoomName + ") created on server "
                        + roomState.janusRoomServer.id)
                }
                catch (e)
                {
                    // Check if error isn't just that the room already exists, code 427
                    if (e.getCode === undefined && e.getCode() !== 427) throw e;
                }

                const janusHandle = await session.videoRoom().publishFeed(
                    roomState.janusRoomIntName, msg)

                janusHandle.onTrickle((candidate: any) =>
                {
                    socket.emit("server-rtc-message", streamSlotId, "candidate", candidate);
                })

                const answer = janusHandle.getAnswer();


                janusHandleSlots[streamSlotId] = janusHandle;

                stream.isReady = true
                stream.publisherId = janusHandle.getPublisherId();
                user.isStreaming = true;

                io.to(user.areaId + user.roomId).emit("server-update-current-room-streams", roomState.streams)

                socket.emit("server-rtc-message", streamSlotId, "answer", answer);
            }
            else if (type == "answer")
            {
                const janusHandle = janusHandleSlots[streamSlotId]
                if (janusHandle == null) return;

                await janusHandle.setRemoteAnswer(msg)
            }
            else if (type == "candidate")
            {
                const janusHandle = janusHandleSlots[streamSlotId]
                if (janusHandle == null) return;
                if (msg.candidate == "")
                {
                    await janusHandle.trickleCompleted(msg)
                }
                else
                {
                    await janusHandle.trickle(msg.candidate)
                }
            }
        }
        catch (e)
        {
            log.error(e.message + "\n" + e.stack);
            try
            {
                if (data.type === "offer")
                {
                    clearStream(user)
                    socket.emit("server-not-ok-to-stream", "Sorry, could not start stream")
                }
            }
            catch (e) { }
        }
    })

    socket.on("user-change-room", async function (data: { targetRoomId: string, targetDoorId: string })
    {
        try
        {
            await sleep(delay)

            let { targetRoomId, targetDoorId } = data

            log.info("user-change-room", user.id, targetDoorId)

            currentRoom = rooms[targetRoomId]

            clearStream(user)
            io.to(user.areaId + user.roomId).emit("server-user-left-room", user.id);
            socket.leave(user.areaId + user.roomId)

            if (targetDoorId == undefined)
                targetDoorId = rooms[targetRoomId].spawnPoint;

            if (!(targetDoorId in rooms[targetRoomId].doors))
            {
                log.error(user.id, "Could not find door " + targetDoorId + " in room " + targetRoomId);
                return;
            }

            const door = rooms[targetRoomId].doors[targetDoorId]

            user.position = { x: door.x, y: door.y }
            if (door.direction !== null) user.direction = door.direction
            user.roomId = targetRoomId
            user.isInactive = false
            user.lastRoomMessage = "";

            sendCurrentRoomState()
            setupJanusHandleSlots()

            socket.join(user.areaId + targetRoomId)
            sendNewUserInfo()
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
        }
    })

    socket.on("user-room-list", function ()
    {
        try
        {
            const roomList: { id: string, userCount: number, streamers: string[] }[] = 
                Object.values(rooms)
                .filter(room => !room.secret)
                .map(room => ({
                    id: room.id,
                    userCount: getConnectedUserList(room.id, user.areaId).length,
                    streamers: roomStates[user.areaId][room.id]
                        .streams
                        .filter(stream => stream.isActive && stream.userId != null)
                        .map(stream => getUser(stream.userId!).name),
                }))

            socket.emit("server-room-list", roomList)
        }
        catch (e)
        {
            log.error(e.message + " " + e.stack);
        }
    })
});

function emitServerStats(areaId: string)
{
    io.to(areaId).emit("server-stats", {
        userCount: getConnectedUserList(null, areaId).length
    })
}

if (process.env.GIKO2_ENABLE_SSL == "true")
    app.use(enforce.HTTPS({ trustProtoHeader: true }))

app.use(compression({
    filter: (req, res) =>
    {
        if (req.headers['x-no-compression'])
        {
            // don't compress responses with this request header
            return false
        }

        // fallback to standard filter function
        return compression.filter(req, res)
    }
}))

app.get("/", (req, res) =>
{
    if (req.headers.host == "gikopoi2.herokuapp.com")
    {
        log.info("Redirecting to gikopoipoi.net")
        res.redirect(301, 'https://gikopoipoi.net')
        return
    }

    log.info("Fetching root...")
    readFile("static/index.html", 'utf8', async (err, data) =>
    {
        try
        {
            if (err)
            {
                res.statusCode = 500
                res.end("Could not retrieve index.html [" + err + "]")
                return
            }

            const { statusCode, body } = await got(
                'https://raw.githubusercontent.com/iccanobif/gikopoi2/master/external/login_footer.html')

            data = data.replace("@LOGIN_FOOTER@", statusCode === 200 ? body : "")

            for (const areaId in roomStates)
            {
                data = data
                    .replace("@USER_COUNT_" + areaId.toUpperCase() + "@",
                        getConnectedUserList(null, areaId)
                            .length.toString())
                    .replace("@STREAMER_COUNT_" + areaId.toUpperCase() + "@",
                        getConnectedUserList(null, areaId)
                            .filter(u => u.isStreaming)
                            .length.toString())
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

//const svgCrispCache: { [path: string]: string }[] = {};
const svgCrispCache: any = {};
app.get(/(.+)\.crisp\.svg$/i, (req, res) =>
{
    const returnImage = function (data: string)
    {
        res.set({
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    };

    const svgPath = req.params[0] + ".svg";

    try
    {
        if (svgPath in svgCrispCache)
        {
            returnImage(svgCrispCache[svgPath]);
            return;
        }
    }
    catch (e)
    {
        res.end(e.message + " " + e.stack)
    }

    log.info("Fetching svg: " + svgPath)
    readFile("static" + svgPath, 'utf8', async (err, data) =>
    {
        try
        {
            if (err)
            {
                res.statusCode = 500
                res.end("Could not retrieve index.html [" + err + "]")
                return
            }

            data = data.replace('<svg', '<svg shape-rendering="crispEdges"');

            svgCrispCache[svgPath] = data;

            returnImage(data);
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

app.get("/areas/:areaId/streamers", (req, res) =>
{
    try
    {
        const areaId = req.params.areaId;
        const streamerList: any[] = [];

        for (const roomId in rooms)
        {
            if (rooms[roomId].secret ||
                rooms[roomId].streamSlotCount === 0) continue;

            const listRoom: { id: string, streamers: string[] } =
            {
                id: roomId,
                streamers: []
            }

            roomStates[areaId][roomId].streams.forEach(stream =>
            {
                if (!stream.isActive || stream.userId == null) return;
                try
                {
                    listRoom.streamers.push(getUser(stream.userId).name);
                }
                catch (e) { }
            })

            if (listRoom.streamers.length > 0)
            {
                streamerList.push(listRoom)
            }
        }

        res.json(streamerList)
    }
    catch (e)
    {
        log.error(e.message + " " + e.stack);
    }
})

app.use(express.json());
app.use(express.text());

app.get("/version", (req, res) =>
{
    res.json(appVersion)
})

app.post("/error", (req, res) =>
{
    log.error("Client log:", req.body.replace(/[\n\r]/g, ""))
    res.end()
})

app.post("/login", (req, res) =>
{
    try
    {
        const sendResponse = (response: LoginResponseDto) =>
        {
            res.json(response)
        }

        let { userName, characterId, areaId } = req.body

        log.info("Attempting to login", req.ip, "<" + userName + ">", characterId, areaId)

        if (typeof userName !== "string")
        {
            res.statusCode = 500
            sendResponse({
                appVersion,
                isLoginSuccessful: false,
                error: "invalid_username",
            })
            return;
        }

        if (settings.restrictLoginByIp)
        {
            const users = getUsersByIp(req.ip, areaId);
            let sameIpUserCount = 0;
            for (const u of users)
            {
                // Don't count ghosts and also remove them, while we're at it
                if (u.isGhost)
                    disconnectUser(u);
                else
                    sameIpUserCount++

                if (sameIpUserCount >= maximumUsersPerIpPerArea)
                    // No need to keep counting, 
                    break;
            }
            if (sameIpUserCount >= maximumUsersPerIpPerArea)
            {
                res.statusCode = 500
                sendResponse({
                    appVersion,
                    isLoginSuccessful: false,
                    error: "ip_restricted",
                })
                return;
            }
        }

        if (userName.length > 20)
            userName = userName.substr(0, 20)

        const n = userName.indexOf("#");
        let processedUserName = (n >= 0 ? userName.substr(0, n) : userName)
            .replace("◆", "◇");
        if (n >= 0)
            processedUserName = processedUserName + "◆" + tripcode(userName.substr(n + 1));

        const user = addNewUser(processedUserName, characterId, areaId, req.ip);

        log.info("Logged in", user.id, user.privateId, "<" + user.name + ">", "from", req.ip)
        sendResponse({
            appVersion,
            isLoginSuccessful: true,
            userId: user.id,
            privateUserId: user.privateId,
        })

    }
    catch (e)
    {
        res.end(e.message + " " + e.stack)
    }
})

async function janusClientConnect(client: typeof JanusClient): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            if (client.isConnected())
            {
                resolve()
            }
            else
            {
                client.onError((error: any) => reject(error))
                client.onConnected(() => resolve())
                client.connect()
            }
        }
        catch (exc)
        {
            reject(exc)
        }
    })
}

// Can probably be improved with number of users, though it might be difficult to determine without asking the janus server.
function getLeastUsedJanusServer()
{
    const roomCounts = Object.fromEntries(janusServers.map(o => [o.id, 0]));
    for (const areaId in roomStates)
        for (const roomId in roomStates[areaId])
        {
            const roomState = roomStates[areaId][roomId];
            if (roomState.janusRoomServer === null) continue;
            roomCounts[roomState.janusRoomServer.id]++;
        }
    const serverId = Object.keys(roomCounts).reduce((acc, cur) =>
        roomCounts[acc] < roomCounts[cur] ? acc : cur);
    return janusServersObject[serverId];
}

async function annihilateJanusRoom(roomState: RoomState)
{
    try
    {
        if (roomState.janusRoomServer == null ||
            roomState.streams.filter(s => s.isActive).length) return;

        const janusServer = roomState.janusRoomServer;
        roomState.janusRoomServer = null;

        const client = janusServer.client;
        await janusClientConnect(client);
        const session = await client.createSession()

        const videoRoomHandle = await session.videoRoom().createVideoRoomHandle();
        videoRoomHandle.destroy({ room: roomState.janusRoomIntName })
        log.info("Janus room " + roomState.janusRoomIntName
            + "(" + roomState.janusRoomName + ") destroyed on server "
            + janusServer.id)
    }
    catch (error)
    {
        log.error(error)
    }
}

function clearStream(user: Player)
{
    try
    {
        if (!user) return

        log.info(user.id, "trying clearStream:", user.areaId, user.roomId)

        user.isStreaming = false;
        const roomState = roomStates[user.areaId][user.roomId]
        const stream = roomState.streams.find(s => s.userId == user.id)
        if (stream)
        {
            stream.isActive = false
            stream.isReady = false
            stream.userId = null
            stream.publisherId = null
            io.to(user.areaId + user.roomId).emit("server-update-current-room-streams", roomState.streams)
            annihilateJanusRoom(roomState);
        }
    }
    catch (error)
    {
        log.error(error)
    }
}


function disconnectUser(user: Player)
{
    log.info("Removing user ", user.id, "<" + user.name + ">", user.areaId)
    clearStream(user)
    removeUser(user)

    io.to(user.areaId + user.roomId).emit("server-user-left-room", user.id);
    emitServerStats(user.areaId)
}

setInterval(() =>
{
    try
    {
        for (const user of getAllUsers())
        {
            if (user.disconnectionTime)
            {
                // Remove ghosts (that is, users for which there is no active websocket)
                if (Date.now() - user.disconnectionTime > maxGhostRetention)
                {
                    log.info(user.id, Date.now(), user.disconnectionTime, Date.now() - user.disconnectionTime)
                    disconnectUser(user)
                }
            }
            else if (!user.connectionTime && user.isGhost)
            {
                log.info(user.id, "is a ghost without disconnection time")
                disconnectUser(user)
            }
            else
            {
                // Make user transparent after 30 minutes without moving or talking
                if (!user.isInactive && Date.now() - user.lastAction > inactivityTimeout)
                {
                    io.to(user.areaId + user.roomId).emit("server-user-inactive", user.id);
                    user.isInactive = true
                    log.info(user.id, "is inactive", Date.now(), user.lastAction);
                }
            }
        }
    }
    catch (e)
    {
        log.error(e.message + " " + e.stack);
    }
}, 1 * 1000)

// Persist state every few seconds, so that people can seamless reconnect on a server restart

async function persistState()
{
    try
    {
        if (process.env.PERSISTOR_URL)
        {
            const serializedUserState = serializeUserState(false)
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
            const serializedUserState = serializeUserState(true)
            // use local file
            writeFile("persisted-state",
                serializedUserState,
                { encoding: "utf-8" },
                (err) =>
                {
                    if (err) log.error(err)
                })
        }
    }
    catch (exc)
    {
        log.error(exc)
    }
}

function restoreState()
{
    initializeRoomStates()
    // If there's an error, just don't deserialize anything
    // and start with a fresh state
    return new Promise<void>(async (resolve, reject) =>
    {
        log.info("Restoring state...")
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
                log.error(exc)
                resolve()
            }
        }
        else 
        {
            readFile("persisted-state", { encoding: "utf-8" }, (err, data) =>
            {
                if (err)
                {
                    log.error(err)
                }
                else
                {
                    try
                    {
                        deserializeUserState(data)
                    }
                    catch (exc)
                    {
                        log.error(exc)
                    }
                }
                resolve()
            })
        }
    })
}

setInterval(() => persistState(), persistInterval)

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

restoreState().then(() =>
{
    http.listen(port, "0.0.0.0");

    log.info("Server running on http://localhost:" + port);
})
    .catch(log.error)
