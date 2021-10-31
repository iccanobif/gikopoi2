import express, { Request } from "express"
import { rooms } from "./rooms";
import { Direction, RoomState, RoomStateDto, JanusServer, LoginResponseDto, PlayerDto, StreamSlotDto, StreamSlot, PersistedState, CharacterSvgDto, RoomStateCollection, ChessboardStateDto } from "./types";
import { addNewUser, getConnectedUserList, getUsersByIp, getAllUsers, getLoginUser, getUser, Player, removeUser, createPlayerDto, getFilteredConnectedUserList, setUserAsActive, restoreUserState } from "./users";
import { sleep } from "./utils";
import got from "got";
import log from "loglevel";
import { settings } from "./settings";
import compression from 'compression';
import { getAbuseConfidenceScore } from "./abuse-ip-db";
import { existsSync, readFileSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { Chess } from "chess.js";
import { Socket } from "socket.io";

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
const maxGhostRetention = 30 * 60 * 1000
const inactivityTimeout = 30 * 60 * 1000
const maxWaitForChessMove = 1000 * 60 * 5
const maximumUsersPerIpPerArea = 2
const maximumAbuseConfidenceScore = 50

const appVersion = Number.parseInt(readFileSync("version").toString())

log.setLevel(log.levels.INFO)

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
let roomStates: RoomStateCollection = {};
let bannedIPs: Set<string> = new Set<string>()

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
                chess: {
                    instance: null,
                    blackUserID: null,
                    whiteUserID: null,
                    lastMoveTime: null,
                    timer: null,
                }
            }
            for (let i = 0; i < rooms[roomId].streamSlotCount; i++)
            {
                roomStates[areaId][roomId].streams.push({
                    isActive: false,
                    isReady: false,
                    withSound: null,
                    withVideo: null,
                    isPrivateStream: null,
                    publisher: null,
                    listeners: [],
                })
            }
            roomNumberId++;
        }
        areaNumberId++;
    }
}

initializeRoomStates()

// Reject HTTP connections from bad IPs
app.use(async function (req, res, next) {
    const ip = getRealIp(req)

    if (bannedIPs.has(ip))
    {
        res.end("")
        return
    }

    const confidenceScore = await getAbuseConfidenceScore(ip)

    if (confidenceScore > maximumAbuseConfidenceScore)
    {
        log.info("Rejected " + ip)
        res.setHeader("Content-Type", "text/html; charset=utf-8")

        const abuseIPDBURL = "https://www.abuseipdb.com/check/" + ip
        res.end("あなたのIPは拒否されました。TorやVPNを使わないでください。Your IP was rejected. Please do not use Tor or VPNs. <a href='" + abuseIPDBURL + "'>" + abuseIPDBURL + "</a>")
        return
    }

    next()
})

// Reject websocket connections from bad IPs
io.use(async (socket: Socket, next: () => void) => {
    const ip = getRealIpWebSocket(socket)

    if (!ip) {
        next();
        return;
    }

    if (bannedIPs.has(ip))
        socket.disconnect()

    const confidenceScore = await getAbuseConfidenceScore(ip)
    if (confidenceScore > maximumAbuseConfidenceScore)
        socket.disconnect()
    else
        next()
})

io.on("connection", function (socket: Socket)
{
    log.info("Connection attempt", getRealIpWebSocket(socket), getAllUsers().filter(u => u.ip == getRealIpWebSocket(socket)).map(u => u.id).join(" "));

    let user: Player;
    let currentRoom = rooms.admin_st;

    const sendCurrentRoomState = () =>
    {
        const connectedUsers: PlayerDto[] = getFilteredConnectedUserList(user, user.roomId, user.areaId)
            .map(p => toPlayerDto(p))

        const state: RoomStateDto = {
            currentRoom,
            connectedUsers,
            streams: toStreamSlotDtoArray(user, roomStates[user.areaId][user.roomId].streams),
            chessboardState: buildChessboardStateDto(roomStates, user.areaId, user.roomId)
        }

        socket.emit("server-update-current-room-state",
            state)
    }

    const sendNewUserInfo = () =>
    {
        userRoomEmit(user, user.areaId, user.roomId,
            "server-user-joined-room", toPlayerDto(user));
    }

    socket.on("disconnect", function ()
    {
        try
        {
            if (!user) return;

            log.info("disconnect", user.id)

            user.isGhost = true
            user.disconnectionTime = Date.now()

            stopChessGame(roomStates, user)
            userRoomEmit(user, user.areaId, user.roomId,
                "server-user-left-room", user.id);
            clearStream(user)
            emitServerStats(user.areaId)
        }
        catch (exc)
        {
            logException(exc)
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
            user.socketId = socket.id;

            log.info("user-connect userId:", user.id, "name:", "<" + user.name + ">", "disconnectionTime:", user.disconnectionTime);

            currentRoom = rooms[user.roomId]

            socket.join(user.areaId)
            socket.join(user.areaId + currentRoom.id)

            user.isGhost = false
            user.disconnectionTime = null

            currentRoom = rooms[user.roomId]

            sendCurrentRoomState()

            sendNewUserInfo()

            emitServerStats(user.areaId)
        }
        catch (e)
        {
            logException(e)
        }
    });
    socket.on("user-msg", function (msg: string)
    {
        try
        {
            setUserAsActive(user)

            // Don't do flood control on henshin, after all it's not more spammy or affects performance more than user-move
            if (msg == "#henshin")
            {
                changeCharacter(user, user.characterId, !user.isAlternateCharacter)
                return;
            }

            // No more than 5 messages in the last 5 seconds
            user.lastMessageDates.push(Date.now())
            if (user.lastMessageDates.length > 5)
            {
                const firstMessageTime = user.lastMessageDates.shift()!
                if (Date.now() - firstMessageTime < 5000)
                {
                    socket.emit("server-system-message", "msg.flood_warning")
                    return
                }
            }

            // Whitespace becomes an empty string (to clear bubbles)
            if (!msg.match(/[^\s]/g))
            {
                msg = ""
            }
            else
            {
                // no TIGER TIGER pls
                if (msg.length > "TIGER".length && "TIGER".startsWith(msg.replace(/TIGER/gi, "").replace(/\s/g, "")))
                    msg = "(´・ω・`)"

                // msg = msg.replace(/(BOKUDEN)|(ＢＯＫＵＤＥＮ)|(ボクデン)|(ぼくでん)|(卜伝)|(ﾎﾞｸﾃﾞﾝ)|(ボクデソ)/gi,
                //     "$&o(≧▽≦)o")

                // if (msg.match(/(合言葉)|(あいことば)|(アイコトバ)|aikotoba/gi))
                //     msg = "٩(ˊᗜˋ*)و"

                // and for the love of god no moonwalking
                if (msg.toLowerCase().includes("moonwalk") || msg.toLowerCase().includes("moon-walk"))
                    msg = "(^Д^)"

                msg = msg.replace(/◆/g, "◇")
            }

            if (msg == "#ika")
            {
                changeCharacter(user, "ika", false)
                return;
            }

            msg = msg.substr(0, 500)

            user.lastRoomMessage = msg;

            // Log only if non empty message
            if (msg)
                log.info("MSG:", user.id, user.areaId, user.roomId, "<" + user.name + ">" + ": " + msg.replace(/[\n\r]+/g, "<br>"));

            user.lastAction = Date.now()

            userRoomEmit(user, user.areaId, user.roomId,
                "server-msg", user.id, msg);
        }
        catch (e)
        {
            logException(e)
        }
    });
    socket.on("user-move", async function (direction: Direction)
    {
        await sleep(delay)

        try
        {
            log.debug("user-move", user.id, direction)
            setUserAsActive(user)

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
                    log.debug("movement rejected", user.id)
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
                // But if you're a squid, you'll stay a squid all your life!
                if (currentRoom.id == "yoshinoya" && user.position.x == 2 && user.position.y == 4)
                {
                    changeCharacter(user, "hungry_giko", false)
                }

                user.position.x = newX
                user.position.y = newY
            }

            userRoomEmit(user, user.areaId, user.roomId,
                "server-move",
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
            logException(e)
        }
    });
    socket.on("user-bubble-position", function (position: Direction)
    {
        try
        {
            user.bubblePosition = position;

            userRoomEmit(user, user.areaId, user.roomId,
                "server-bubble-position", user.id, position);
        }
        catch (e)
        {
            logException(e)
        }
    });
    socket.on("user-want-to-stream", function (data: {
        streamSlotId: number,
        withVideo: boolean,
        withSound: boolean,
        isPrivateStream: boolean,
        info: any
    })
    {
        try
        {
            const { streamSlotId, withVideo, withSound, info, isPrivateStream } = data

            log.info("user-want-to-stream", user.id, "private: ", isPrivateStream, JSON.stringify(info))

            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId]

            if (stream.publisher !== null && stream.publisher.user == user)
            {
                clearStream(user);
            }

            if (stream.isActive && stream.publisher !== null)
            {
                log.info("server-not-ok-to-stream", user.id)
                if (stream.publisher.user.blockedIps.includes(user.ip))
                    socket.emit("server-not-ok-to-stream", "start_stream_stream_slot_already_taken_by_blocking_streamer")
                else if (user.blockedIps.includes(stream.publisher.user.ip))
                    socket.emit("server-not-ok-to-stream", "start_stream_stream_slot_already_taken_by_blocked_streamer")
                else
                    socket.emit("server-not-ok-to-stream", "start_stream_stream_slot_already_taken")
                return;
            }

            stream.isActive = true
            stream.isReady = false
            stream.withVideo = withVideo
            stream.withSound = withSound
            stream.isPrivateStream = isPrivateStream
            stream.publisher = { user: user, janusHandle: null };

            setTimeout(() =>
            {
                if (stream.publisher!.janusHandle == null)
                {
                    log.info(user.id, "janusHandle is null")
                    clearStream(user)
                }
            }, 10000);

            sendUpdatedStreamSlotState(user)

            emitServerStats(user.areaId)

            socket.emit("server-ok-to-stream")
        }
        catch (e)
        {
            logException(e)
            socket.emit("server-not-ok-to-stream", "start_stream_unknown_error")
        }
    })
    socket.on("user-want-to-stop-stream", function ()
    {
        try
        {
            log.info(user.id, "user-want-to-stop-stream")
            clearStream(user)
        }
        catch (e)
        {
            logException(e)
        }
    })

    socket.on("user-want-to-take-stream", async function (streamSlotId: number)
    {
        log.info("user-want-to-take-stream", user.id, streamSlotId)
        try
        {
            if (streamSlotId === undefined) return;
            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId];
            if (stream.publisher === null
                || stream.publisher.user.blockedIps.includes(user.ip)
                || stream.publisher.janusHandle === null
                || roomState.janusRoomServer === null)
            {
                log.info("server-not-ok-to-take-stream", user.id, streamSlotId)
                socket.emit("server-not-ok-to-take-stream", streamSlotId);
                return;
            };

            const client = roomState.janusRoomServer.client;

            await janusClientConnect(client);
            const session = await client.createSession()
            
            const publisherId = stream.publisher.janusHandle.getPublisherId();
            const janusHandle = await session.videoRoom().listenFeed(
                roomState.janusRoomIntName, publisherId)
                
            stream.listeners.push({ user: user, janusHandle: janusHandle });

            janusHandle.onTrickle((candidate: any) =>
            {
                socket.emit("server-rtc-message", streamSlotId, "candidate", candidate);
            })

            const offer = janusHandle.getOffer();

            socket.emit("server-rtc-message", streamSlotId, "offer", offer);
        }
        catch (e)
        {
            logException(e)
            socket.emit("server-not-ok-to-take-stream", streamSlotId);
        }
    })
    
    socket.on("user-want-to-drop-stream", function (streamSlotId: number)
    {
        try
        {
            log.info(user.id, "user-want-to-drop-stream")
            if (streamSlotId === undefined) return;
            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId];
            const listenerIndex = stream.listeners.findIndex(p => p.user == user);
            if (listenerIndex !== -1)
            {
                const listener = stream.listeners.splice(listenerIndex, 1)[0];
                listener.janusHandle.detach();
            }
        }
        catch (e)
        {
            logException(e)
        }
    })

    socket.on("user-rtc-message", async function (data: { streamSlotId: number, type: string, msg: any })
    {
        try
        {
            const { streamSlotId, type, msg } = data
            log.info("user-rtc-message start", user.id, streamSlotId, type);
            
            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId];
            
            const participantObject = (stream.publisher != null && stream.publisher.user == user ?
                stream.publisher :
                stream.listeners.find((p) => p.user == user));
            
            if (participantObject == null) return; // Needs error message

            if (type == "offer")
            {
                if (stream.publisher!.user !== user) return;

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
                catch (e: any)
                {
                    // Check if error isn't just that the room already exists, code 427
                    if (!e.getCode || e.getCode() !== 427) throw e;
                }

                const janusHandle = await session.videoRoom().publishFeed(
                    roomState.janusRoomIntName, msg)

                janusHandle.onTrickle((candidate: any) =>
                {
                    socket.emit("server-rtc-message", streamSlotId, "candidate", candidate);
                })

                const answer = janusHandle.getAnswer();

                stream.isReady = true
                participantObject.janusHandle = janusHandle

                sendUpdatedStreamSlotState(user)

                socket.emit("server-rtc-message", streamSlotId, "answer", answer);
            }
            else if (type == "answer")
            {
                
                const janusHandle = participantObject.janusHandle;
                if (janusHandle == null) return;

                await janusHandle.setRemoteAnswer(msg)
            }
            else if (type == "candidate")
            {
                const janusHandle = participantObject.janusHandle;
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
        catch (e: any)
        {
            logException(e)

            try
            {
                if (data.type === "offer")
                {
                    clearStream(user)
                    socket.emit("server-not-ok-to-stream", "start_stream_unknown_error")
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

            log.info("user-change-room", user.id, targetRoomId, targetDoorId)

            currentRoom = rooms[targetRoomId]

            clearStream(user)
            stopChessGame(roomStates, user)
            userRoomEmit(user, user.areaId, user.roomId,
                "server-user-left-room", user.id)
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
            setUserAsActive(user)
            user.lastRoomMessage = "";

            sendCurrentRoomState()

            socket.join(user.areaId + targetRoomId)
            sendNewUserInfo()
        }
        catch (e)
        {
            logException(e)
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
                    userCount: getFilteredConnectedUserList(user, room.id, user.areaId).length,
                    streamers: toStreamSlotDtoArray(user, roomStates[user.areaId][room.id].streams)
                        .filter(stream => stream.isActive && stream.userId != null)
                        .map(stream => room.forcedAnonymous ? "" : getUser(stream.userId!).name),
                }))

            socket.emit("server-room-list", roomList)
        }
        catch (e)
        {
            logException(e)
        }
    })

    socket.on("user-block", function ( userId: string )
    {
        try
        {
            log.info("user-block", user.id, userId)
            const blockedUser = getUser(userId);
            if (!blockedUser) return; // TODO Return a message to tell the user that the blocking failed
            user.blockedIps.push(blockedUser.ip);

            const streams = roomStates[user.areaId][user.roomId].streams;

            getConnectedUserList(user.roomId, user.areaId)
                .filter((u) => u.socketId && user.blockedIps.includes(u.ip))
                .forEach((u) =>
            {
                io.to(u.socketId!).emit("server-user-left-room", user.id)
                io.to(u.socketId!).emit("server-update-current-room-streams", toStreamSlotDtoArray(u, streams))

                socket.emit("server-user-left-room", u.id);
            })

            socket.emit("server-update-current-room-streams", toStreamSlotDtoArray(user, streams))

            emitServerStats(user.areaId);
        }
        catch (e)
        {
            logException(e)
        }
    })

    socket.on("user-ping", function() {
        try
        {
            if (!user) return

            log.info("user-ping", user.id)
            setUserAsActive(user)
            userRoomEmit(user, user.areaId, user.roomId, "server-user-active", user.id);
        }
        catch (e)
        {
            logException(e)
        }
    })

    function createChessMoveTimeout() {
        return setTimeout(() => {
            const chessState = roomStates[user.areaId][user.roomId].chess

            if (chessState?.blackUserID)
                io.to(getUser(chessState?.blackUserID).socketId).emit("server-system-message", "msg.chess_timeout_reached")
            if (chessState?.whiteUserID)
                io.to(getUser(chessState?.whiteUserID).socketId).emit("server-system-message", "msg.chess_timeout_reached")

            stopChessGame(roomStates, user)
        }, maxWaitForChessMove)
    }

    function getUsersToNotifyAboutChessGame() {

        const chessState = roomStates[user.areaId][user.roomId].chess

        const blackUser = getUser(chessState?.blackUserID!)
        const whiteUser = getUser(chessState?.whiteUserID!)
        const usersToNotify = new Set<Player>()
        if (blackUser)
            getFilteredConnectedUserList(blackUser, blackUser.roomId, blackUser.areaId)
                .forEach(u => usersToNotify.add(u))
        if (whiteUser)
            getFilteredConnectedUserList(whiteUser, whiteUser.roomId, whiteUser.areaId)
                .forEach(u => usersToNotify.add(u))
        return usersToNotify
    }

    socket.on("user-want-to-play-chess", function () {
        try {
            // The first user who requests a game will be white, the second one will be black

            log.info("user-want-to-play-chess", user.id)
            const chessState = roomStates[user.areaId][user.roomId].chess

            if (chessState.blackUserID)
            {
                // Game already started
                return // TODO display error message to user
            }

            if (!chessState.whiteUserID)
                chessState.whiteUserID = user.id
            else
            {
                if (chessState.whiteUserID == user.id)
                    return // can't play against yourself

                log.info("chess game starts", user.id)

                chessState.blackUserID = user.id
                chessState.instance = new Chess()
                chessState.timer = createChessMoveTimeout()
            }

            sendUpdatedChessboardState(roomStates, user.areaId, user.roomId)
        }
        catch (e)
        {
            logException(e)
        }
    })

    socket.on("user-want-to-quit-chess", function () {
        try
        {
            log.info("user-want-to-quit-chess", user.id)

            const state = roomStates[user.areaId][user.roomId].chess

            if (state.blackUserID)
            {
                // Notify only if the game was already started.
                const usersToNotify = getUsersToNotifyAboutChessGame()
                usersToNotify.forEach(u => io.to(u.socketId).emit("server-chess-quit", user.id))
            }

            stopChessGame(roomStates, user)
        }
        catch (e)
        {
            logException(e)
        }
    })

    socket.on("user-chess-move", function(source: any, target: any) {
        try {
            log.info("user-chess-move", user.id, source, target)

            const chessState = roomStates[user.areaId][user.roomId].chess

            // Check if a game is on
            if (!chessState.instance)
                return

            if (source == target)
                return

            // Check if move comes from the right user
            if ((chessState.instance.turn() == "b" && chessState.blackUserID != user.id)
                || (chessState.instance.turn() == "w" && chessState.whiteUserID != user.id))
            {
                const stateDTO: ChessboardStateDto = buildChessboardStateDto(roomStates, user.areaId, user.roomId)
                socket.emit("server-update-chessboard", stateDTO);
                return
            }

            // If the move is illegal, nothing happens
            const result = chessState.instance.move({ from: source, to: target, promotion: "q" })

            if (result)
            {
                // Move was legal
                chessState.lastMoveTime = Date.now()
                if (chessState.timer)
                    clearTimeout(chessState.timer)
                chessState.timer = createChessMoveTimeout()
            }

            // If the game is over, clear the game and send a message declaring the winner
            if (chessState.instance.game_over())
            {
                const winnerUserID = chessState.instance?.turn() == "b" ? chessState.whiteUserID : chessState.blackUserID
                log.info("game over", winnerUserID)

                const usersToNotify = getUsersToNotifyAboutChessGame()
                usersToNotify.forEach(u => io.to(u.socketId).emit("server-chess-win", winnerUserID))

                stopChessGame(roomStates, user)
            }

            sendUpdatedChessboardState(roomStates, user.areaId, user.roomId)
        }
        catch (e)
        {
            logException(e)
        }
    })

});

function emitServerStats(areaId: string)
{
    getConnectedUserList(null, areaId).forEach((u) =>
    {
        const connectedUserIds: Set<string> = getFilteredConnectedUserList(u, null, areaId)
            .reduce((acc, val) => acc.add(val.id), new Set<string>())

        io.to(u.socketId).emit("server-stats", {
            userCount: connectedUserIds.size,
            streamCount: Object.values(roomStates[areaId])
                .map(s => s.streams)
                .flat()
                .filter(s => s.publisher !== null && s.publisher.user.id && connectedUserIds.has(s.publisher.user.id))
                .length.toString()
        })
    });
}

function changeCharacter(user: Player, characterId: string, isAlternateCharacter: boolean)
{
    if (user.characterId == "ika")
        return // The curse of being a squid can never be lifted.

    user.characterId = characterId
    user.isAlternateCharacter = isAlternateCharacter
    user.lastAction = Date.now()
    userRoomEmit(user, user.areaId, user.roomId, "server-character-changed", user.id, user.characterId, user.isAlternateCharacter)
}

// TODO remove areaId and roomId parameters, we can get them from user.areaId and user.roomId
function userRoomEmit(user: Player, areaId: string, roomId: string | null, ...msg: any[])
{
    getFilteredConnectedUserList(user, roomId, areaId)
        .forEach((u) => u.socketId && io.to(u.socketId).emit(...msg));
}

function roomEmit(areaId: string, roomId: string, ...msg: any[])
{
    getConnectedUserList(roomId, areaId)
        .forEach((u) => u.socketId && io.to(u.socketId).emit(...msg));
}

function toStreamSlotDtoArray(user: Player | null, streamSlots: StreamSlot[]): StreamSlotDto[]
{
    return streamSlots.map((s) =>
    {
        const u = (s.publisher !== null ? s.publisher.user : null);
        const isInactive = !u
            || (user && u.id != user.id
                && (user.blockedIps.includes(u.ip)
                || u.blockedIps.includes(user.ip)));
        return {
            isActive: isInactive ? false : s.isActive,
            isReady: isInactive ? false : s.isReady,
            withSound: isInactive ? null : s.withSound,
            withVideo: isInactive ? null : s.withVideo,
            userId: isInactive ? null : u!.id,
        }
    })
}

function toPlayerDto(player: Player): PlayerDto
{
    const playerDto = createPlayerDto(player);
    if (rooms[player.roomId].forcedAnonymous)
    {
        playerDto.name = "";
    }
    return playerDto;
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

// https://stackoverflow.com/a/18517550
// "The router doesn't overwrite X-Forwarded-For, but it does guarantee that the real origin will always be the last item in the list."
function getRealIp(req: Request)
{
    return req.ips[req.ips.length - 1] ?? req.ip
}

function getRealIpWebSocket(socket: Socket): string
{
    const forwardedFor = socket.request.headers["x-forwarded-for"] as string
    if (!forwardedFor)
        return socket.request.socket.remoteAddress!

    return forwardedFor.split(",").map(x => x.trim()).pop()!
}

app.get("/", async (req, res) =>
{
    if (req.headers.host == "gikopoi2.herokuapp.com")
    {
        log.info("Redirecting to gikopoipoi.net ", getRealIp(req))
        res.redirect(301, 'https://gikopoipoi.net')
        return
    }

    log.info("Fetching root..." + getRealIp(req) + " " + req.rawHeaders.join("|"))

    try
    {
        let data = await readFile("static/index.html", 'utf8')

        try {
            const { statusCode: loginFooterStatusCode, body: loginFooterBody } = await got(
                'https://raw.githubusercontent.com/iccanobif/gikopoi2/master/external/login_footer.html')

            data = data.replace("@LOGIN_FOOTER@", loginFooterStatusCode === 200 ? loginFooterBody : "")
        }
        catch (e)
        {
            logException(e)
        }

        data = data.replace("@EXPECTED_SERVER_VERSION@", appVersion.toString())

        for (const areaId in roomStates)
        {
            const connectedUserIds: Set<string> = getConnectedUserList(null, areaId)
                .filter((u) => !u.blockedIps.includes(getRealIp(req)))
                .reduce((acc, val) => acc.add(val.id), new Set<string>())

            data = data
                .replace("@USER_COUNT_" + areaId.toUpperCase() + "@",
                    connectedUserIds.size.toString())
                .replace("@STREAMER_COUNT_" + areaId.toUpperCase() + "@",
                    Object.values(roomStates[areaId])
                        .map(s => s.streams)
                        .flat()
                        .filter(s => s.publisher != null && s.publisher.user.id && connectedUserIds.has(s.publisher.user.id))
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
        res.end(stringifyException(e))
    }

})

const svgCrispCache: { [path: string]: string } = {};

app.get(/(.+)\.crisp\.svg$/i, async (req, res) =>
{
    try
    {
        const returnImage = function (data: string)
        {
            res.set({
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=604800, immutable'
            });
            res.end(data);
        };

        const svgPath = req.params[0] + ".svg";

            if (svgPath in svgCrispCache)
            {
                returnImage(svgCrispCache[svgPath]);
                return;
            }

        log.info("Fetching svg: " + svgPath)
        let data = await readFile("static" + svgPath, 'utf8')

        data = data.replace('<svg', '<svg shape-rendering="crispEdges"');

        svgCrispCache[svgPath] = data;

        returnImage(data);
    }
    catch (e)
    {
        res.end(stringifyException(e))
    }
})

app.use(express.static('static',
    {
        setHeaders: (res, path) => {
            // Cache images for one week. I made the frontend append ?v=version to image URLs,
            // so that it won't try to use the cached images when it's opening a new version of the website.
            if (path.match(/\.(svg|png)$/i))
                res.set("Cache-Control", "public, max-age=604800, immutable")
            else
                res.set("Cache-Control", "no-cache")
        }
    }
));

app.get("/areas/:areaId/rooms/:roomId", (req, res) =>
{
    try
    {
        const roomId = req.params.roomId
        const areaId = req.params.areaId

        const connectedUsers: PlayerDto[] = getConnectedUserList(roomId, areaId)
            .map(p => toPlayerDto(p))

        const dto: RoomStateDto = {
            currentRoom: rooms[roomId],
            connectedUsers,
            streams: toStreamSlotDtoArray(null, roomStates[areaId][roomId].streams), // FIX: ignoring/banning ignored...
            chessboardState: buildChessboardStateDto(roomStates, areaId, roomId)
        }

        res.json(dto)
    }
    catch (e)
    {
        res.end(stringifyException(e))
    }
})

async function getCharacterImages(crisp: boolean)
{
    const characterIds = await readdir("static/characters")

    const output: { [characterId: string]: CharacterSvgDto} = {}
    for (const characterId of characterIds)
    {
        const extension = characterId == "funkynaito" || characterId == "molgiko" ? "png" : "svg"

        const getCharacterImage = async (path: string, crisp: boolean) => {
            const completePath = "static/characters/" + path

            if (!existsSync(completePath))
                return null
            
            let text = await readFile(completePath, { encoding: path.endsWith(".svg") ? "utf-8" : "base64"})

            if (crisp && path.endsWith(".svg"))
                text = text.replace('<svg', '<svg shape-rendering="crispEdges"')

            return text
        }

        output[characterId] = {
            isBase64: extension == "png",
            frontSitting: (await getCharacterImage(characterId + "/front-sitting." + extension, crisp))!,
            frontStanding: (await getCharacterImage(characterId + "/front-standing." + extension, crisp))!,
            frontWalking1: (await getCharacterImage(characterId + "/front-walking-1." + extension, crisp))!,
            frontWalking2: (await getCharacterImage(characterId + "/front-walking-2." + extension, crisp))!,
            backSitting: (await getCharacterImage(characterId + "/back-sitting." + extension, crisp))!,
            backStanding: (await getCharacterImage(characterId + "/back-standing." + extension, crisp))!,
            backWalking1: (await getCharacterImage(characterId + "/back-walking-1." + extension, crisp))!,
            backWalking2: (await getCharacterImage(characterId + "/back-walking-2." + extension, crisp))!,
            frontSittingAlt: await getCharacterImage(characterId + "/front-sitting-alt." + extension, crisp),
            frontStandingAlt: await getCharacterImage(characterId + "/front-standing-alt." + extension, crisp),
            frontWalking1Alt: await getCharacterImage(characterId + "/front-walking-1-alt." + extension, crisp),
            frontWalking2Alt: await getCharacterImage(characterId + "/front-walking-2-alt." + extension, crisp),
            backSittingAlt: await getCharacterImage(characterId + "/back-sitting-alt." + extension, crisp),
            backStandingAlt: await getCharacterImage(characterId + "/back-standing-alt." + extension, crisp),
            backWalking1Alt: await getCharacterImage(characterId + "/back-walking-1-alt." + extension, crisp),
            backWalking2Alt: await getCharacterImage(characterId + "/back-walking-2-alt." + extension, crisp),
        }
    }
    return output
}

app.get("/characters/regular", async (req, res) =>
{
    try { res.json(await getCharacterImages(false)) } catch (e) { res.end(stringifyException(e)) }
})

app.get("/characters/crisp", async (req, res) =>
{
    try { res.json(await getCharacterImages(true)) } catch (e) { res.end(stringifyException(e)) }
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
                if (!stream.isActive) return;
                if (stream.publisher == null) return;
                if (stream.isPrivateStream) return;

                try
                {
                    listRoom.streamers.push(stream.publisher.user.name);
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
        logException(e)
    }
})

app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(express.text());

app.get("/version", (req, res) =>
{
    res.json(appVersion)
})

app.get("/admin", (req, res) => {
    const output = "<form action='user-list' method='post'><input type='text' name='pwd'><input type='submit' value='user-list'></form>"
                 + "<form action='banned-ip-list' method='post'><input type='text' name='pwd'><input type='submit' value='unban'></form>"

    res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
    })

    res.end(output)
})

app.post("/user-list", (req, res) => {
    const pwd = req.body.pwd

    if (pwd != settings.adminKey)
    {
        res.end("nope")
        return
    }

    const users = getAllUsers()
                    .filter(u => !u.isGhost)
                    .sort((a, b) => (a.areaId + a.roomId + a.name + a.lastRoomMessage).localeCompare(b.areaId + b.roomId + b.name + b.lastRoomMessage))

    const streamSlots = Object.values(roomStates).map(x => Object.values(x))
                            .flat()
                            .map(x => x.streams)
                            .flat()

    const userList: string = users.map(user => "<input type='checkbox' name='" + user.id + "' id='" + user.id + "'><label for='" + user.id + "'>"
                                                + user.areaId + " "
                                                + user.roomId + " "
                                                + " &lt;" + user.name +  "&gt;"
                                                + user.lastRoomMessage
                                                + " streaming: " + (streamSlots.find(s=> s.publisher !== null && s.publisher.user == user) ? "Y" : "N")
                                                + " " + user.ip
                                                + "</label>").join("</br>")

    const pwdInput = "<input type='hidden' name='pwd' value='" + pwd + "'>"
    const banButton = "<br/><input type='submit'>"

    const output = "<form action='ban' method='post'>" + pwdInput + userList + banButton + "</form>"

    res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
    })

    res.end(output)
})

app.post("/banned-ip-list", (req, res) => {
    const pwd = req.body.pwd

    if (pwd != settings.adminKey)
    {
        res.end("nope")
        return
    }

    const userList: string = Array.from(bannedIPs).map(ip => "<input type='checkbox' name='" + ip + "' id='" + ip + "'><label for='" + ip + "'>" + ip + "</label>").join("</br>")

    const pwdInput = "<input type='hidden' name='pwd' value='" + pwd + "'>"
    const banButton = "<br/><input type='submit'>"

    const output = "<form action='unban' method='post'>" + pwdInput + userList + banButton + "</form>"

    res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
    })

    res.end(output)
})

app.post("/ban", (req, res) => {
    try 
    {
        const pwd = req.body.pwd

        if (pwd != settings.adminKey)
        {
            res.end("nope")
            return
        }

        const userIdsToBan = Object.keys(req.body).filter(x => x != "pwd")
        console.log(userIdsToBan)
        for (const id of userIdsToBan)
        {
            const user = getUser(id)
            banIP(user.ip)
        }
        res.end("done")
    }
    catch (exc)
    {
        logException(exc)
        res.end("error")
    }
})

app.post("/unban", (req, res) => {
    try 
    {
        const pwd = req.body.pwd

        if (pwd != settings.adminKey)
        {
            res.end("nope")
            return
        }

        const userIPsToUnban = Object.keys(req.body).filter(x => x != "pwd")
        for (const ip of userIPsToUnban)
        {
            bannedIPs.delete(ip)
        }
        res.end("done")
    }
    catch (exc)
    {
        logException(exc)
        res.end("error")
    }
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
            if (!response.isLoginSuccessful)
                res.statusCode = 500
            res.json(response)
        }

        const ip = getRealIp(req)
        if (bannedIPs.has(ip))
        {
            sendResponse({
                appVersion,
                isLoginSuccessful: false,
                error: "ip_restricted"
            })
            return
        }

        let { userName, characterId, areaId, roomId } = req.body

        if (typeof userName !== "string")
        {
            try
            {
                log.info("Invalid username", getRealIp(req), "<" + JSON.stringify(userName) + ">", characterId, areaId)
            }
            catch {}

            sendResponse({
                appVersion,
                isLoginSuccessful: false,
                error: "invalid_username",
            })
            return;
        }

        log.info("Attempting to login", getRealIp(req), "<" + userName.replace(/#.*/, "#??????") + ">", characterId, areaId)

        if (settings.restrictLoginByIp)
        {
            const users = getUsersByIp(getRealIp(req), areaId);
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
            .replace(/◆/g, "◇");
        if (n >= 0)
            processedUserName = processedUserName + "◆" + (tripcode(userName.substr(n + 1)) || "fnkquv7jY2");

        const user = addNewUser(processedUserName, characterId, areaId, roomId, getRealIp(req));

        log.info("Logged in", user.id, user.privateId, "<" + user.name + ">", "from", getRealIp(req), areaId)
        sendResponse({
            appVersion,
            isLoginSuccessful: true,
            userId: user.id,
            privateUserId: user.privateId,
        })

    }
    catch (e)
    {
        res.end(stringifyException(e))
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
        if (roomState.janusRoomServer == null) return;
        
        const janusServer = roomState.janusRoomServer;
        roomState.janusRoomServer = null;

        const client = janusServer.client;
        await janusClientConnect(client);
        const session = await client.createSession()
        
        const videoRoomHandle = await session.videoRoom().createVideoRoomHandle();
        
        log.info("video room handle list");
        
        const roomList = await videoRoomHandle.list();
        log.info(roomList.list);
        
        log.info("video room handle list participants");
        
        const participantList = await videoRoomHandle.listParticipants({ room: roomState.janusRoomIntName });
        log.info(participantList.participants);
        
        if (roomState.streams.filter(s => s.isActive).length) return;
        
        videoRoomHandle.destroy({ room: roomState.janusRoomIntName })
        log.info("Janus room " + roomState.janusRoomIntName
            + "(" + roomState.janusRoomName + ") destroyed on server "
            + janusServer.id)
    }
    catch (error)
    {
        logException(error)
    }
}

function clearStream(user: Player)
{
    try
    {
        if (!user) return

        log.info(user.id, "trying clearStream:", user.areaId, user.roomId)

        const roomState = roomStates[user.areaId][user.roomId];
        const stream = roomState.streams.find(s => s.publisher !== null && s.publisher.user == user);
        if (stream)
        {
            stream.isActive = false
            stream.isReady = false
            
            if (stream.publisher!.janusHandle !== null)
                stream.publisher!.janusHandle.detach();
            stream.publisher = null
            
            sendUpdatedStreamSlotState(user)
            emitServerStats(user.areaId)
            annihilateJanusRoom(roomState);
        }
    }
    catch (error)
    {
        logException(error)
    }
}

function buildChessboardStateDto(roomStates: RoomStateCollection, areaId: string, roomId: string): ChessboardStateDto
{
    const state = roomStates[areaId][roomId].chess

    return {
        fenString: state.instance?.fen() || null,
        turn: state.instance?.turn() || null,
        blackUserID: state.blackUserID,
        whiteUserID: state.whiteUserID,
    }
}

function sendUpdatedChessboardState(roomStates: RoomStateCollection, areaId: string, roomId: string)
{
    const stateDTO: ChessboardStateDto = buildChessboardStateDto(roomStates, areaId, roomId)
    roomEmit(areaId, roomId, "server-update-chessboard", stateDTO);
}

function stopChessGame(roomStates: RoomStateCollection, user: Player)
{
    const state = roomStates[user.areaId][user.roomId].chess

    if (user.id != state.blackUserID && user.id != state.whiteUserID)
        return

    log.info("stopChessGame", user.id)

    if (state.timer)
        clearTimeout(state.timer)

    roomStates[user.areaId][user.roomId].chess = {
        instance: state.instance,
        blackUserID: null,
        whiteUserID: null,
        lastMoveTime: null,
        timer: null,
    }

    sendUpdatedChessboardState(roomStates, user.areaId,user. roomId)
}


function disconnectUser(user: Player)
{
    log.info("Removing user ", user.id, "<" + user.name + ">", user.areaId)
    clearStream(user)
    removeUser(user)

    userRoomEmit(user, user.areaId, user.roomId,
        "server-user-left-room", user.id);
    emitServerStats(user.areaId)
}

function banIP(ip: string)
{
    log.info("BANNING " + ip)

    bannedIPs.add(ip)

    for (const user of getUsersByIp(ip, null))
    {
        if (user.socketId)
        {
            const socket = io.sockets.sockets[user.socketId]
            if (socket)
                socket.disconnect();
        }

        disconnectUser(user)
    }
}

function sendUpdatedStreamSlotState(user: Player)
{
    const roomState = roomStates[user.areaId][user.roomId] 
    getFilteredConnectedUserList(user, user.roomId, user.areaId)
        .forEach((u) => 
        {
            if (u.socketId)
                io.to(u.socketId).emit("server-update-current-room-streams", toStreamSlotDtoArray(u, roomState.streams))
        });
}

function stringifyException(exception: any)
{
    const logMessage = exception.message + " " + exception.stack
    return logMessage.replace(/\n/g, "")
}

export function logException(exception: any)
{
    log.error(stringifyException(exception));

    if (exception.message.match(/Couldn't attach to plugin: error '-1'/))
    {
        // When this exception is raised, usually it means that the janus server has broken
        // and so far the only thing that will fix it is to restart the server, so that all streams
        // stop and all rooms are cleared. Would be nice to find a way to prevent this problem in the first place...
        log.error("EMERGENCY SERVER RESTART BECAUSE OF JANUS FUCKUP")

        process.exit()
    }
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
                log.info(user.id, "is a ghost without connection time")
                disconnectUser(user)
            }
            else
            {
                // Make user transparent after 30 minutes without moving or talking
                if (!user.isInactive && Date.now() - user.lastAction > inactivityTimeout)
                {
                    userRoomEmit(user, user.areaId, user.roomId,
                        "server-user-inactive", user.id);
                    user.isInactive = true
                    log.info(user.id, "is inactive", Date.now(), user.lastAction);
                }
            }
        }
    }
    catch (e)
    {
        logException(e)
    }
}, 1 * 1000)

// Persist state every few seconds, so that people can seamless reconnect on a server restart

async function persistState()
{
    try
    {
        const state: PersistedState = {
            users: getAllUsers(),
            bannedIPs: Array.from(bannedIPs)
        }

        if (process.env.PERSISTOR_URL)
        {
            await got.post(process.env.PERSISTOR_URL, {
                headers: {
                    "persistor-secret": process.env.PERSISTOR_SECRET,
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify(state)
            })
        }
        else
        {
            // use local file
            await writeFile("persisted-state",
                JSON.stringify(state, null, 2),
                { encoding: "utf-8" },
                )
        }
    }
    catch (exc)
    {
        logException(exc)
    }
}

function applyState(state: PersistedState)
{
    // state.users should be undefined only the first time this code runs in production.
    if (state.users)
        restoreUserState(state.users)
    else
    {
        const users = (state as unknown) as { [id: string]: Player; }
        restoreUserState(Object.values(users))
    }

    bannedIPs = new Set(state.bannedIPs)
}

async function restoreState()
{
    try
    {
        initializeRoomStates()
        // If there's an error, just don't deserialize anything
        // and start with a fresh state

        log.info("Restoring state...")
        if (process.env.PERSISTOR_URL)
        {
            // remember to do it as defensive as possible

                const response = await got.get(process.env.PERSISTOR_URL, {
                    headers: {
                        "persistor-secret": process.env.PERSISTOR_SECRET
                    }
                })
                if (response.statusCode == 200)
                {
                    const state = JSON.parse(response.body) as PersistedState
                    applyState(state)
                }
        }
        else
        {
            const data = await readFile("persisted-state", { encoding: "utf-8" })
            try
            {
                const state = JSON.parse(data) as PersistedState
                applyState(state)
            }
            catch (exc)
            {
                logException(exc)
            }
        }
    }
    catch (exc)
    {
        logException(exc)
    }
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
