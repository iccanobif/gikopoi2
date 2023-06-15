const isProduction = process.env.NODE_ENV == "production"

import express, { Request } from "express"
import ViteExpress from "vite-express";
import { rooms, dynamicRooms } from "./rooms";
import type { SiteAreasInfo, RoomStateDto, JanusServer, LoginResponseDto, PlayerDto, StreamSlotDto, StreamSlot, PersistedState, CharacterSvgDto, RoomStateCollection, ChessboardStateDto, JankenStateDto, Room, DynamicRoom, ListedRoom, MoveDto } from "./types";
import { addNewUser, getConnectedUserList, getUsersByIp, getAllUsers, getUserByPrivateId, getUser, Player, removeUser, getFilteredConnectedUserList, setUserAsActive, restoreUserState, isUserBlocking } from "./users";
import got from "got";
import log from "loglevel";
import { settings } from "./settings";
import compression from 'compression';
import { getAbuseConfidenceScore } from "./abuse-ip-db";
import { existsSync, readdirSync, readFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { Chess } from "chess.js";
import { Socket } from "socket.io";
import { subscribeToAnnualEvents } from "../common/annualevents";

const app = express()
const server = require('http').Server(app);

import { Server } from "socket.io"

const io = new Server(server, {
    pingInterval: 25 * 1000, // Heroku fails with "H15 Idle connection" if a socket is inactive for more than 55 seconds with
    pingTimeout: 60 * 1000
})

const tripcode = require('tripcode');
const enforce = require('express-sslify');
const JanusClient = require('janus-videoroom-client').Janus;

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
    settings.janusServers.map(s => ({
        id: s.id,
        client: new JanusClient({
            url: s.url,
            apiSecret: settings.janusApiSecret,
        })
    }))
const janusServersObject = Object.fromEntries(janusServers.map(o => [o.id, o]));

// Initialize room states:
let roomStates: RoomStateCollection = {};
let bannedIPs: Set<string> = new Set<string>()

function initializeRoomStates()
{
    roomStates = Object.fromEntries(settings.siteAreas.map((area, areaNumberId) =>
    {
        return [area.id, Object.fromEntries(Object.entries(rooms).map(([roomId, room], roomNumberId) =>
        {
            const roomState = {
                streams: (!janusServers.length ? [] : Array.from({ length: room.streamSlotCount }, (v, i) => i).map(slotId =>
                {
                    return {
                        streamId: 0,
                        janusServer: null,
                        janusSession: null,
                        janusRoomName: settings.janusRoomNamePrefix + ":" + area.id + ":" + roomId + ":" + slotId,
                        janusRoomIntName: (settings.janusRoomNameIntPrefix * 1000000000) + (areaNumberId * 1000000) + (roomNumberId * 100) + slotId,
                        isActive: false,
                        isReady: false,
                        withSound: null,
                        withVideo: null,
                        publisher: null,
                        listeners: [],
                        isVisibleOnlyToSpecificUsers: null,
                        allowedListenerIDs: [],
                        streamIsVtuberMode: false,
                        isNicoNicoMode: false,
                    }
                })),
                chess: {
                    instance: null,
                    blackUserID: null,
                    whiteUserID: null,
                    lastMoveTime: null,
                    timer: null,
                },
                janken: {
                    stage: "joining",
                    player1Id: null,
                    player2Id: null,
                    player1Hand: null,
                    player2Hand: null,
                    namedPlayerId: null,
                    timeoutTimer: null,
                },
                coinCounter: 0,
            }
            return [roomId, roomState]
        }))]
    }))
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

    let user: Player | null = null
    try
    {
        const privateUserId = socket.handshake.headers["private-user-id"]

        // Array.isArray(privateUserId) is needed only to make typescript happy
        // and make it understand that I expect privateUserId to be just a string
        user = (privateUserId && !Array.isArray(privateUserId)) 
                            ? getUserByPrivateId(privateUserId) 
                            : null;

        const ip = getRealIpWebSocket(socket)

        log.info("Connection attempt",
                ip,
                user?.id,
                "private-user-id:", privateUserId
                );
        
        if (!user)
        {
            log.info("server-cant-log-you-in", privateUserId)
            socket.emit("server-cant-log-you-in")
            // socket.disconnect(true)
            // return;
            next()
            return
        }

        socket.data = { user: user }

        if (!user.ips.some(i => i == ip))
        {
            log.info("Adding ip", ip, "for user", user.id)
            user.ips.push(ip)
        }

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
    }
    catch (exc)
    {
        logException(exc, user)
    }
})


const sendRoomState = (socket: Socket, user: Player, currentRoom: Room) =>
{
    const connectedUsers: PlayerDto[] = getFilteredConnectedUserList(user, user.roomId, user.areaId)
        .map(p => toPlayerDto(p))

    const state: RoomStateDto = {
        currentRoom,
        connectedUsers,
        streams: toStreamSlotDtoArray(user, roomStates[user.areaId][user.roomId].streams),
        chessboardState: buildChessboardStateDto(roomStates, user.areaId, user.roomId),
        jankenState: buildJankenStateDto(user.areaId, user.roomId),
        coinCounter: roomStates[user.areaId][user.roomId].coinCounter,
        hideStreams: settings.noStreamIPs.some(noStreamIP => user.ips.some(ip => ip == noStreamIP)),
    }

    socket.emit("server-update-current-room-state", state)
}

io.on("connection", function (socket)
{
    let user: Player;
    
    const sendCurrentRoomState = () => sendRoomState(socket, user, rooms[user.roomId]);

    const sendNewUserInfo = () =>
    {
        userRoomEmit(user, "server-user-joined-room", toPlayerDto(user));
    }

    socket.on("disconnect", async function ()
    {
        try
        {
            if (!user) return;

            log.info("disconnect", user.id, "socket id:", socket.id)

            if (user.socketId != socket.id)
            {
                // No need to do anything because before we got this "disconnect" event, a new valid socket
                // has already connected.
                return;
            }

            user.isGhost = true
            user.disconnectionTime = Date.now()
            user.socketId = null

            await clearStream(user) // This also calls emitServerStats(), but only if the user was streaming...
            emitServerStats(user.areaId)
            await clearRoomListener(user)
            userRoomEmit(user, "server-user-left-room", user.id);
            stopChessGame(roomStates, user)
            quitJanken(user)
        }
        catch (exc)
        {
            logException(exc, user)
        }
    })

    function handleNewSocketConnection() {
        // NOTE: keep in mind that it's possible that another socket is still open (for example, because the old socket
        //       is about to timeout, but the client has already opened a new one).
        try
        {
            user = socket.data.user;
            if (!user)
            {
                log.info(getRealIpWebSocket(socket), "tried to connect to websocket but failed authentication", socket.id)
                return
            }
            user.socketId = socket.id;
    
            log.info("user-connect userId:", user.id, "name:", "<" + user.name + ">", "disconnectionTime:", user.disconnectionTime, "socket id:" , socket.id);
    
            socket.join(user.areaId)
            socket.join(user.areaId + user.roomId)
    
            user.isGhost = false
            user.disconnectionTime = null
    
            sendCurrentRoomState()
    
            sendNewUserInfo()
    
            emitServerStats(user.areaId)
        }
        catch (e)
        {
            logException(e, socket?.data?.user)
            try
            {
                socket.emit("server-cant-log-you-in")
                log.info("DISCONNECTING WEBSOCKET")
                socket.disconnect(true)
            }
            catch (e)
            {
                logException(e, socket?.data?.user)
            }
        }
    }
    handleNewSocketConnection()
    
    const lastEventDates: number[] = []
    socket.onAny((...params) => {
        try {
            // Flood detection (no more than 50 events in the span of one second)
            lastEventDates.push(Date.now())
            if (lastEventDates.length > 50)
            {
                const firstEventTime = lastEventDates.shift()!
                if (Date.now() - firstEventTime < 1000)
                {
                    socket.disconnect(true)
                }
            }

            // It seems that sometimes (when network conditions are bad) the server receives a "disconnect"
            // event (which removes the user from all clients) but, when the socket reconnects, a
            // "connection" event is not raised again, leaving him as a ghost. To try to recover
            // from this anomalous state, I execute here the code that should run when a socket connects
            // or reconnects. It's possible that this problem won't happen anymore now that "disconnect" events
            // don't do anything if the user's current socket id is different from the disconnecting socket's id.
            if (user && user.isGhost)
            {
                log.info(`${getRealIpWebSocket(socket)} ${user.id} TRYING TO RECOVER FROM SOCKET ANOMALY. Received this event:`, ...params)
                handleNewSocketConnection()
            }
        } catch (exc)
        {
            logException(exc, socket?.data?.user)
        }
    })

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
            
            // Whitespace becomes an empty string (to clear bubbles)
            if (!msg.match(/[^\s]/g))
            {
                msg = ""
            }
            
            if (msg == "" && user.lastRoomMessage == "")
            {
                return;
            }
            
            if (msg != "")
            {
                // No more than 5 messages in the last 5 seconds
                user.lastMessageDates.push(Date.now())
                if (user.lastMessageDates.length > 5)
                {
                    const firstMessageTime = user.lastMessageDates.shift()!
                    if (Date.now() - firstMessageTime < 5000)
                    {
                        socket.emit("server-system-message", "flood_warning", msg)
                        return
                    }
                }
                
                if (msg == "#ika")
                {
                    changeCharacter(user, "ika", false)
                    return;
                }
                
                msg = msg.replace(/(vod)(k)(a)/gi, "$1$3$2")
                
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
                
                msg = msg.substr(0, 500)
            } else {
              user.lastRoomMessageDate = null;
            }

            user.lastRoomMessage = msg;

            // Log only if non empty message
            if (msg)
                log.info("MSG:", "[" + user.ips.join(",") + "]", user.id, user.areaId, user.roomId, "<" + user.name + ">" + ": " + msg.replace(/[\n\r]+/g, "<br>"));

            user.lastAction = Date.now()

            if (msg.toLowerCase().match(settings.censoredWordsRegex)) {
                user.lastRoomMessageDate = null;
                socket.emit("server-msg", user.id, msg, Date.now()); // if there's a bad word, show the message only to the guy who wrote it
            } else {
                user.lastRoomMessageDate = user.lastMessageDates[user.lastMessageDates.length - 1];
                userRoomEmit(user, "server-msg", user.id, msg, user.lastRoomMessageDate);
            }
        }
        catch (e)
        {
            logException(e, user)
        }
    });
    socket.on("user-move", async function (direction: string)
    {
        try
        {
            if (direction != "up" && direction != "down" && direction != "left" && direction != "right")
                return

            if (user.disconnectionTime)
            {
                log.error("user-move called for disconnected user!", user.id)
                return
            }

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
                if (newX >= rooms[user.roomId].size.x) { rejectMovement(); return }
                if (newY >= rooms[user.roomId].size.y) { rejectMovement(); return }

                // prevent moving over a blocked square
                if (rooms[user.roomId].blocked.find(p => p.x == newX && p.y == newY))
                {
                    rejectMovement();
                    return
                }
                if (rooms[user.roomId].forbiddenMovements.find(p =>
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
                if (user.roomId == "yoshinoya" && user.position.x == 2 && user.position.y == 4)
                {
                    changeCharacter(user, "hungry_giko", false)
                }

                user.position.x = newX
                user.position.y = newY
                user.lastMovement = Date.now()
                
                if (user.roomId == "idoA" && user.position.x == 6 && user.position.y == 6)
                {
                    setTimeout(() => {
                        if (user.position.x == 6 && user.position.y == 6)
                        {
                            log.info(user.id, "changing to takenoko")
                            changeCharacter(user, "takenoko", false)
                        }
                    }, 10000)
                }

            }

            const move: MoveDto = {
                userId: user.id,
                x: user.position.x,
                y: user.position.y,
                direction: user.direction,
                lastMovement: user.lastMovement,
                isInstant: false,
                shouldSpinwalk,
            }
            userRoomEmit(user, "server-move", move);
        }
        catch (e)
        {
            logException(e, user)
        }
    });
    socket.on("user-bubble-position", function (position: string)
    {
        try
        {
            if (position != "up" && position != "down" && position != "left" && position != "right")
                return

            user.bubblePosition = position;

            userRoomEmit(user, "server-bubble-position", user.id, position);
        }
        catch (e)
        {
            logException(e, user)
        }
    });
    socket.on("user-want-to-stream", async function (data: {
        streamSlotId: number,
        withVideo: boolean,
        withSound: boolean,
        isVisibleOnlyToSpecificUsers: boolean,
        isPrivateStream: boolean,
        isNicoNicoMode: boolean,
        streamIsVtuberMode: boolean,
        info: any,
    })
    {
        try
        {
            const {
                streamSlotId,
                withVideo,
                withSound,
                info,
                isVisibleOnlyToSpecificUsers,
                streamIsVtuberMode,
                isNicoNicoMode
            } = data

            log.info("user-want-to-stream", user.id,
                     "streamSlotId:", streamSlotId,
                     "room:", user.roomId,
                     "isVisibleOnlyToSpecificUsers:", isVisibleOnlyToSpecificUsers,
                     "streamIsVtuberMode:", streamIsVtuberMode,
                     JSON.stringify(info))

            if (!getUser(user.id))
            {
                log.info("ERROR server-not-ok-to-stream", "start_stream_user_does_not_exist", user.id, user.roomId, streamSlotId)
                socket.emit("server-not-ok-to-stream", "start_stream_user_does_not_exist")
                return
            }

            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId]

            if (!stream)
            {
                // I'm not sure why the log is full of errors about the stream object being undefined... Maybe
                // there are some race conditions with users quickly starting a stream after changing room? Sounds unlikely,
                // so for now I'll just add some more detailed logging and let the client also know something wrong happened.
                log.info("ERROR server-not-ok-to-stream", "start_stream_stream_slot_does_not_exist", user.id, user.roomId, streamSlotId)
                socket.emit("server-not-ok-to-stream", "start_stream_stream_slot_does_not_exist")
                return
            }

            if (stream.publisher !== null && stream.publisher.user == user)
            {
                await clearStream(user);
            }

            if (stream.isActive && stream.publisher !== null)
            {
                log.info("server-not-ok-to-stream", user.id)
                if (isUserBlocking(stream.publisher.user, user))
                    socket.emit("server-not-ok-to-stream", "start_stream_stream_slot_already_taken_by_blocking_streamer")
                else if (isUserBlocking(user, stream.publisher.user))
                    socket.emit("server-not-ok-to-stream", "start_stream_stream_slot_already_taken_by_blocked_streamer")
                else
                    socket.emit("server-not-ok-to-stream", "start_stream_stream_slot_already_taken")
                return;
            }
            
            const streamId = stream.streamId + 1

            stream.streamId = streamId
            stream.isActive = true
            stream.isReady = false
            stream.janusSession = null
            stream.withVideo = withVideo
            stream.withSound = withSound
            stream.isVisibleOnlyToSpecificUsers = isVisibleOnlyToSpecificUsers
            stream.publisher = { user: user, janusHandle: null };
            stream.streamIsVtuberMode = streamIsVtuberMode
            stream.isNicoNicoMode = isNicoNicoMode

            setTimeout(async () =>
            {
                if (stream.streamId == streamId &&
                    stream.isActive &&
                    stream.janusServer == null)
                {
                    log.info(user.id, "No RTC message received")
                    await clearStream(user)
                }
            }, 10000);

            sendUpdatedStreamSlotState(user)

            emitServerStats(user.areaId)

            socket.emit("server-ok-to-stream")
        }
        catch (e)
        {
            logException(e, user)
            socket.emit("server-not-ok-to-stream", "start_stream_unknown_error")
        }
    })
    socket.on("user-want-to-stop-stream", async function ()
    {
        try
        {
            log.info(user.id, "user-want-to-stop-stream")
            await clearStream(user)
        }
        catch (e)
        {
            logException(e, user)
        }
    })

    socket.on("user-want-to-take-stream", async function (streamSlotId: number)
    {
        try
        {
            log.info("user-want-to-take-stream", user.id, streamSlotId)

            if (streamSlotId === undefined) return;
            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId];

            if (stream.publisher === null
                || isUserBlocking(stream.publisher.user, user)
                || stream.publisher.janusHandle === null
                || stream.janusServer === null
                || (stream.isVisibleOnlyToSpecificUsers && !stream.allowedListenerIDs.find(id => id == user.id))
                )
            {
                log.info("server-not-ok-to-take-stream", user.id, streamSlotId)
                socket.emit("server-not-ok-to-take-stream", streamSlotId);
                return;
            };

            const client = stream.janusServer.client;

            await janusClientConnect(client);
            
            const publisherId = stream.publisher.janusHandle.getPublisherId();
            
            if (!stream.isActive) return;
            const janusHandle = await stream.janusSession.videoRoom().listenFeed(
                stream.janusRoomIntName, publisherId)
                
            log.info("user-want-to-take-stream", user.id,
                "Janus listener handle", janusHandle.getId(),
                "created on server", stream.janusServer.id)
            
            if (!stream.isActive)
            {
                log.info("user-want-to-take-stream", user.id,
                    "Janus listener handle", janusHandle.getId(),
                    "detached before full connection on server", stream.janusServer.id)
                await janusHandle.detach()
                return
            }
            
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
            logException(e, user)
            socket.emit("server-not-ok-to-take-stream", streamSlotId);
        }
    })
    
    async function dropListener(user: Player, stream: StreamSlot) {
        if (stream.janusSession === null) return;
        const listenerIndex = stream.listeners.findIndex(p => p.user == user);
        if (listenerIndex !== -1)
        {
            const listener = stream.listeners.splice(listenerIndex, 1)[0];
            log.info("dropListener", listener.user.id,
                "Janus listener handle", listener.janusHandle.getId(),
                "detached on server", stream.janusServer!.id)
            await listener.janusHandle.detach();
        }
    }
    
    socket.on("user-want-to-drop-stream", async function (streamSlotId: number)
    {
        try
        {
            log.info(user.id, "user-want-to-drop-stream")
            if (streamSlotId === undefined) return;
            const roomState = roomStates[user.areaId][user.roomId];
            const stream = roomState.streams[streamSlotId];
            await dropListener(user, stream);
        }
        catch (e)
        {
            logException(e, user)
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
                if (stream.publisher && stream.publisher.user !== user) return;

                stream.janusServer = getLeastUsedJanusServer()
                const client = stream.janusServer.client;

                await janusClientConnect(client);
                stream.janusSession = await client.createSession()
                log.info("user-rtc-message", user.id,
                    "Janus session", stream.janusSession.getId(),
                    "created on server", stream.janusServer.id)

                const videoRoomHandle = await stream.janusSession.videoRoom().createVideoRoomHandle();
                log.info("user-rtc-message", user.id,
                    "Janus video room handle", videoRoomHandle.getId(),
                    "created on server", stream.janusServer.id)
                
                if (!stream.isActive) return;
                
                try
                {
                    await videoRoomHandle.create({
                        room: stream.janusRoomIntName,
                        publishers: 20
                    })
                    log.info("user-rtc-message", user.id,
                        "Janus room", stream.janusRoomIntName, "(" + stream.janusRoomName + ")",
                        "created on server", stream.janusServer.id)
                }
                catch (e: any)
                {
                    // Check if error isn't just that the room already exists, code 427
                    if (!e.getCode || e.getCode() !== 427) throw e;
                }
                
                if (!stream.isActive)
                {
                    await destroySession(videoRoomHandle, stream, user)
                    return;
                }
                log.info("user-rtc-message", user.id,
                    "Janus video room handle", videoRoomHandle.getId(),
                    "detached on server", stream.janusServer.id)
                await videoRoomHandle.detach()
                
                const janusHandle = await stream.janusSession.videoRoom().publishFeed(
                    stream.janusRoomIntName, msg)
                log.info("user-rtc-message", user.id,
                    "Janus publisher handle", janusHandle.getId(),
                    "created on server", stream.janusServer.id)
                
                if (!stream.isActive)
                {
                    await destroySession(janusHandle, stream, user)
                    return
                }
                participantObject.janusHandle = janusHandle
                
                janusHandle.onTrickle((candidate: any) =>
                {
                    socket.emit("server-rtc-message", streamSlotId, "candidate", candidate);
                })

                const answer = janusHandle.getAnswer();

                janusHandle.onWebrtcUp(() =>
                {
                    stream.isReady = true
                    sendUpdatedStreamSlotState(user)
                })

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
            logException(e, user)

            try
            {
                if (data.type === "offer")
                {
                    await clearStream(user)
                    socket.emit("server-not-ok-to-stream", "start_stream_unknown_error")
                }
            }
            catch (e) { }
        }
    })

    socket.on("user-change-room", async function (data: { targetRoomId: string, targetDoorId?: string })
    {
        try
        {
            let { targetRoomId, targetDoorId } = data

            log.info("user-change-room", user.id, targetRoomId, targetDoorId)

            // Validation
            if (!rooms.hasOwnProperty(targetRoomId)) return;
            if (targetDoorId && !rooms[targetRoomId].doors.hasOwnProperty(targetDoorId)) return;
            
            await clearStream(user)
            await clearRoomListener(user)
            stopChessGame(roomStates, user)
            quitJanken(user)
            userRoomEmit(user, "server-user-left-room", user.id)
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
            logException(e, user)
        }
    })

    socket.on("user-room-list", function ()
    {
        try
        {
            const roomList: ListedRoom[] =
                Object.values(rooms)
                .filter(room => !room.secret)
                .map(room => ({
                    id: room.id,
                    group: room.group,
                    userCount: getFilteredConnectedUserList(user, room.id, user.areaId).length,
                    streams: toStreamSlotDtoArray(user, roomStates[user.areaId][room.id].streams)
                        .filter(stream => stream.isActive && stream.userId != null)
                        .map(stream => {
                            if (room.forcedAnonymous)
                                return { userName: "", isVisibleOnlyToSpecificUsers: stream.isVisibleOnlyToSpecificUsers! }

                            const streamUser = getUser(stream.userId!)
                            if (!streamUser)
                            {
                                log.error("ERROR: Can't find user", stream.userId, "when doing #rula")
                                return { userName: "N/A", isVisibleOnlyToSpecificUsers: stream.isVisibleOnlyToSpecificUsers! }
                            }

                            return { userName: streamUser.name, isVisibleOnlyToSpecificUsers: stream.isVisibleOnlyToSpecificUsers! }
                        }),
                }))

            socket.emit("server-room-list", roomList)
        }
        catch (e)
        {
            logException(e, user)
        }
    })

    socket.on("user-block", function ( userId: string )
    {
        try
        {
            log.info("user-block", user.id, userId)
            const blockedUser = getUser(userId);
            if (!blockedUser) return; // TODO Return a message to tell the user that the blocking failed
            
            // filter out previous blockers and blockees
            const blockersUserList = getFilteredConnectedUserList(user, user.roomId, user.areaId)

            for (const ip of blockedUser.ips)
                user.blockedIps.push(ip);

            const streams = roomStates[user.areaId][user.roomId].streams;

            blockersUserList
                .filter((u) => u.socketId && isUserBlocking(user, u))
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
            logException(e, user)
        }
    })

    socket.on("user-ping", function() {
        try
        {
            if (!user) return
            if (user.disconnectionTime) return

            log.info("user-ping", user.id)
            setUserAsActive(user)
            userRoomEmit(user, "server-user-active", user.id);
        }
        catch (e)
        {
            logException(e, user)
        }
    })

    function createChessMoveTimeout() {
        return setTimeout(() => {
            const chessState = roomStates[user.areaId][user.roomId].chess
            if (!chessState) return

            const blackUserSocketId = chessState.blackUserID && getUser(chessState.blackUserID) && getUser(chessState.blackUserID).socketId
            if (blackUserSocketId)
                io.to(blackUserSocketId).emit("server-system-message", "chess_timeout_reached")
            
            const whiteUserSocketId = chessState.whiteUserID && getUser(chessState.whiteUserID) && getUser(chessState.whiteUserID).socketId
            if (whiteUserSocketId)
                io.to(whiteUserSocketId).emit("server-system-message", "chess_timeout_reached")

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
            logException(e, user)
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
                usersToNotify.forEach(u => {
                    if (u.socketId)
                        io.to(u.socketId).emit("server-chess-quit", user.id)
                })
            }

            stopChessGame(roomStates, user)
        }
        catch (e)
        {
            logException(e, user)
        }
    })

    socket.on("special-events:client-add-shrine-coin", function () {
        try
        {
            if (user.roomId != "jinja")
                return;
            //this only triggers in the jinja room so, technically speaking, I don't have to check for state
            //get donation box
            roomStates[user.areaId][user.roomId].coinCounter += 10;
            //send the value to users
            userRoomEmit(user, "special-events:server-add-shrine-coin", roomStates[user.areaId][user.roomId].coinCounter);
        }
        catch (e)
        {
            logException(e, user)
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
                usersToNotify.forEach(u => {
                    if (u.socketId)
                        io.to(u.socketId).emit("server-chess-win", winnerUserID)
                })

                stopChessGame(roomStates, user)
            }

            sendUpdatedChessboardState(roomStates, user.areaId, user.roomId)
        }
        catch (e)
        {
            logException(e, user)
        }
    })
    
    socket.on("user-want-to-join-janken", function()
    {
        try
        {
            log.info("user-want-to-join-janken", user.id)
            const state = roomStates[user.areaId][user.roomId].janken
            if(state.stage != "joining") return
            
            if(!state.player1Id)
            {
                state.player1Id = user.id
                sendUpdatedJankenState(user.areaId, user.roomId)
            }
            else if(!state.player2Id)
            {
                state.player2Id = user.id
                setupJankenStageChoosing(user.areaId, user.roomId)
            }
        }
        catch (e)
        {
            logException(e, user)
        }
    })
    
    socket.on("user-want-to-choose-janken-hand", function(hand: any)
    {
        try
        {
            log.info("user-want-to-choose-janken-hand", user.id, hand)
            const state = roomStates[user.areaId][user.roomId].janken
            if (state.stage != "choosing") return
            
            if(state.player1Id == user.id && !state.player1Hand)
                state.player1Hand = hand
            if(state.player2Id == user.id && !state.player2Hand)
                state.player2Hand = hand
            if (!state.player1Hand || !state.player2Hand)
                return
            state.stage = "phrase"
            sendUpdatedJankenState(user.areaId, user.roomId)
            if (state.player1Hand && state.player2Hand)
                setTimeout(determineJankenResults, 2000, user.areaId, user.roomId)
        }
        catch (e)
        {
            logException(e, user)
        }
    })
    
    socket.on("user-want-to-quit-janken", function()
    {
        try
        {
            log.info("user-want-to-quit-janken", user.id)
            quitJanken(user)
        }
        catch (e)
        {
            logException(e, user)
        }
    })

    socket.on("user-update-allowed-listener-ids", async function (allowedListenerIDs: string[]) {
        try
        {
            log.info("user-update-allowed-listener-ids", user.id, JSON.stringify(allowedListenerIDs))
            const stream = roomStates[user.areaId][user.roomId].streams.find(s => s.publisher?.user.id == user.id)
            if(!stream) return;
            stream.allowedListenerIDs = allowedListenerIDs
            const revokedListeners = stream.listeners.filter(l => !allowedListenerIDs.includes(l.user.id));
            for (const listener of revokedListeners) {
                await dropListener(listener.user, stream);
            }
            
            sendUpdatedStreamSlotState(user)
        }
        catch (e)
        {
            logException(e, user)
        }
    })

});

function emitServerStats(areaId: string)
{
    const allConnectedUsers = getAllUsers().filter(u => !u.isGhost)
    const logLineAreas = settings.siteAreas.map(area =>
    {
        return area.id + " users: " + allConnectedUsers.filter(u => u.areaId == area.id).length + " " +
            area.id + " streams: " + Object.values(roomStates[area.id]).map(s => s.streams).flat().filter(s => s.publisher != null && s.publisher.user.id).length
    }).join(" ")
    const allIps = new Set(allConnectedUsers.map(u => Array.from(u.ips.values())).flat())
    const allActiveIps = new Set(allConnectedUsers.filter(u => !u.isInactive).map(u => Array.from(u.ips.values())).flat())

    log.info("Server stats:", logLineAreas, "total IPs:", allIps.size, "active IPs:", allActiveIps.size)

    getConnectedUserList(null, areaId).forEach((u) =>
    {
        const connectedUserIds: Set<string> = getFilteredConnectedUserList(u, null, areaId)
            .reduce((acc, val) => acc.add(val.id), new Set<string>())

        if (u.socketId)
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
    userRoomEmit(user, "server-character-changed", user.id, user.characterId, user.isAlternateCharacter)
}

function userRoomEmit(user: Player, event: string, ...params: any[])
{
    for (const u of getFilteredConnectedUserList(user, user.roomId, user.areaId))
        if (u.socketId)
            io.to(u.socketId).emit(event, ...params)
}

function roomEmit(areaId: string, roomId: string, event: string, ...msg: any[])
{
    getConnectedUserList(roomId, areaId)
        .forEach((u) => u.socketId && io.to(u.socketId).emit(event, ...msg));
}

function toStreamSlotDtoArray(user: Player, streamSlots: StreamSlot[]): StreamSlotDto[]
{
    if (settings.noStreamIPs.some(noStreamIP => user.ips.some(ip => ip == noStreamIP)))
        return []

    return streamSlots.map((s) =>
    {
        const publisherUser = (s.publisher !== null ? s.publisher.user : null);
        const isInactive = !publisherUser
            || (user && publisherUser.id != user.id
                && (isUserBlocking(user, publisherUser)
                    || isUserBlocking(publisherUser, user)));
        return {
            isActive: isInactive ? false : s.isActive,
            isReady: isInactive ? false : s.isReady,
            withSound: isInactive ? null : s.withSound,
            withVideo: isInactive ? null : s.withVideo,
            userId: isInactive ? null : publisherUser!.id,
            isVisibleOnlyToSpecificUsers: isInactive ? null : s.isVisibleOnlyToSpecificUsers,
            isAllowed: !s.isVisibleOnlyToSpecificUsers
                       || !!s.allowedListenerIDs.find(id => id == user.id)
                       || s.publisher?.user.id == user.id,
            streamIsVtuberMode: isInactive ? null : s.streamIsVtuberMode,
            isNicoNicoMode: isInactive ? null : s.isNicoNicoMode,
            isJumping: false,
        }
    })
}

function toPlayerDto(player: Player): PlayerDto
{
    const playerDto: PlayerDto = {
        id: player.id,
        name: player.name,
        position: player.position,
        direction: player.direction,
        roomId: player.roomId,
        characterId: player.characterId,
        isInactive: player.isInactive,
        bubblePosition: player.bubblePosition,
        voicePitch: player.voicePitch,
        lastRoomMessage: player.lastRoomMessage?.toLocaleLowerCase().match(settings.censoredWordsRegex) ? "" : player.lastRoomMessage,
        lastRoomMessageDate: player.lastRoomMessageDate,
        isAlternateCharacter: player.isAlternateCharacter,
        lastMovement: player.lastMovement,
    };
    if (rooms[player.roomId].forcedAnonymous)
    {
        playerDto.name = "";
    }
    return playerDto;
}

if (settings.enableSSL)
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

const cachedJsBundle = (() => {
    return ""
      + readFileSync("public/libraries/jquery-1.12.4.js").toString() + '\n'
      + readFileSync("public/libraries/jquery-ui/jquery-ui.min.js").toString() + '\n'
      + readFileSync("public/scripts/jquery.ui.touch-punch.min.js").toString() + '\n'
      + readFileSync("public/scripts/riffwave.js").toString() + '\n'
      + readFileSync("public/scripts/Blob.js").toString() + '\n'
      + readFileSync("public/scripts/animalese.js").toString() + '\n'
      + readFileSync("public/chess/js/chessboard-1.0.0.min.js").toString() + '\n'
      + readFileSync("public/scripts/input-knobs.js").toString() + '\n'
      + readFileSync("public/scripts/polyfills.js").toString() + '\n'
      + 'window.EXPECTED_SERVER_VERSION = Number.parseInt("' + appVersion.toString() + '")' + '\n'
      + 'window.siteAreas = JSON.parse("' + JSON.stringify(settings.siteAreas).replace(/\"/g, "\\\"") + '")' + '\n'
})()

app.get("/server_generated_bundle.js", async (req, res) =>
{
    const siteAreasInfo: SiteAreasInfo = Object.fromEntries(Object.keys(roomStates).map(areaId =>
    {
        const connectedUserIds: Set<string> = getConnectedUserList(null, areaId)
            .filter((u) => !u.blockedIps.includes(getRealIp(req)))
            .reduce((acc, val) => acc.add(val.id), new Set<string>())

        return [areaId, {
            userCount: connectedUserIds.size,
            streamCount: Object.values(roomStates[areaId])
                .map(s => s.streams)
                .flat()
                .filter(s => s.publisher != null && s.publisher.user.id && connectedUserIds.has(s.publisher.user.id))
                .length
        }]
    }))

    const fullJsBundle = cachedJsBundle + 'window.siteAreasInfo = JSON.parse("' + JSON.stringify(siteAreasInfo).replace(/\"/g, "\\\"") + '")' + '\n';

    res.set({
        'Content-Type': 'text/javascript; charset=utf-8',
        'Cache-Control': 'no-cache'
    })
    res.end(fullJsBundle)
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
        let data = await readFile("public" + svgPath, 'utf8')

        data = data.replace('<svg', '<svg shape-rendering="crispEdges"');

        svgCrispCache[svgPath] = data;

        returnImage(data);
    }
    catch (e)
    {
        res.end(stringifyException(e))
    }
})

if (isProduction)
{
    const static_properties = {
        setHeaders: (res: any, path: any) => {
            // Cache images for one week. I made the frontend append ?v=version to image URLs,
            // so that it won't try to use the cached images when it's opening a new version of the website.
            if (path.match(/\.(svg|png)$/i))
                res.set("Cache-Control", "public, max-age=604800, immutable")
            else
                res.set("Cache-Control", "no-cache")
        }
    };

    app.use(express.static('dist', static_properties));
    app.use(express.static('dist/favicons', static_properties));
}

app.get("/areas/:areaId/rooms/:roomId", (req, res) =>
{
    try
    {
        function setResponseToUnauthorized(msg: string)
        {
            log.error(getRealIp(req), msg)
            res.status(401)
            res.end("")
        }

        const roomId = req.params.roomId
        const areaId = req.params.areaId

        const bearerHeader = req.headers["authorization"]
        if (!bearerHeader)
        {
            setResponseToUnauthorized(`ERROR: Room API called with no authentication`)
            return
        }
        
        const userPrivateId = bearerHeader.split(" ")[1]
        const user = getUserByPrivateId(userPrivateId)

        if (!user)
        {
            setResponseToUnauthorized(`ERROR: User ${userPrivateId} doesn't exist`)
            return
        }

        if (user.areaId != areaId || user.roomId != roomId)
        {
            setResponseToUnauthorized(`ERROR: User ${userPrivateId} tried to access room ${roomId} on ${areaId} but he's in room ${user.roomId} on ${user.areaId}`)
            return
        }

        const filteredList: Player[] = getFilteredConnectedUserList(user, roomId, areaId)

        const dto: RoomStateDto = {
            currentRoom: rooms[roomId],
            connectedUsers: filteredList.map(toPlayerDto),
            streams: [],
            chessboardState: buildChessboardStateDto(roomStates, areaId, roomId),
            jankenState: buildJankenStateDto(areaId, roomId),
            coinCounter: roomStates[areaId][roomId].coinCounter,
            hideStreams: false,
        }

        res.json(dto)
    }
    catch (e)
    {
        res.end(stringifyException(e))
    }
})

function getCharacterImages(crisp: boolean)
{
    const characterIds = readdirSync("public/characters")

    const output: { [characterId: string]: CharacterSvgDto} = {}
    for (const characterId of characterIds)
    {
        const extension = characterId == "molgiko" ? "png" : "svg"

        const getCharacterImage = (path: string, crisp: boolean) => {
            const completePath = "public/characters/" + path

            if (!existsSync(completePath))
                return null
            
            let text = readFileSync(completePath, { encoding: path.endsWith(".svg") ? "utf-8" : "base64"})

            if (crisp && path.endsWith(".svg"))
                text = text.replace('<svg', '<svg shape-rendering="crispEdges"')

            return text
        }

        output[characterId] = {
            isBase64: extension == "png",
            frontSitting: (getCharacterImage(characterId + "/front-sitting." + extension, crisp))!,
            frontStanding: (getCharacterImage(characterId + "/front-standing." + extension, crisp))!,
            frontWalking1: (getCharacterImage(characterId + "/front-walking-1." + extension, crisp))!,
            frontWalking2: (getCharacterImage(characterId + "/front-walking-2." + extension, crisp))!,
            backSitting: (getCharacterImage(characterId + "/back-sitting." + extension, crisp))!,
            backStanding: (getCharacterImage(characterId + "/back-standing." + extension, crisp))!,
            backWalking1: (getCharacterImage(characterId + "/back-walking-1." + extension, crisp))!,
            backWalking2: (getCharacterImage(characterId + "/back-walking-2." + extension, crisp))!,
            frontSittingAlt: getCharacterImage(characterId + "/front-sitting-alt." + extension, crisp),
            frontStandingAlt: getCharacterImage(characterId + "/front-standing-alt." + extension, crisp),
            frontWalking1Alt: getCharacterImage(characterId + "/front-walking-1-alt." + extension, crisp),
            frontWalking2Alt: getCharacterImage(characterId + "/front-walking-2-alt." + extension, crisp),
            backSittingAlt: getCharacterImage(characterId + "/back-sitting-alt." + extension, crisp),
            backStandingAlt: getCharacterImage(characterId + "/back-standing-alt." + extension, crisp),
            backWalking1Alt: getCharacterImage(characterId + "/back-walking-1-alt." + extension, crisp),
            backWalking2Alt: getCharacterImage(characterId + "/back-walking-2-alt." + extension, crisp),
        }
    }
    return output
}

const regularCharacterImages = getCharacterImages(false)
app.get("/characters/regular", async (req, res) =>
{
    try
    {
        res.set("Cache-Control", "public, max-age=604800, immutable")
        res.json(regularCharacterImages) 
    }
    catch (e) { res.end(stringifyException(e)) }
})

const crispCharacterImages = getCharacterImages(true)
app.get("/characters/crisp", async (req, res) =>
{
    try
    {
        res.set("Cache-Control", "public, max-age=604800, immutable")
        res.json(crispCharacterImages) 
    }
    catch (e) { res.end(stringifyException(e)) }
})

app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(express.text());

app.get("/version", (req, res) =>
{
    res.json(appVersion)
})

app.get("/admin", (req, res) => {
    try 
    {
        const output = "<form action='user-list' method='post'><input type='text' name='pwd'><input type='submit' value='user-list'></form>"
                    + "<form action='banned-ip-list' method='post'><input type='text' name='pwd'><input type='submit' value='unban'></form>"
                    + "<form action='ban-ip-entry' method='post'><input type='text' name='pwd'><input type='submit' value='ban'></form>"

        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
        })

        res.end(output)
    }
    catch (exc)
    {
        logException(exc, null)
        res.end("error")
    }
})

app.post("/user-list", (req, res) => {
    try 
    {
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
                                                    + " " + user.ips
                                                    + "</label>").join("</br>")

        const pwdInput = "<input type='hidden' name='pwd' value='" + pwd + "'>"
        const banButton = "<br/><input type='submit'>"

        const output = "<form action='ban' method='post'>" + pwdInput + userList + banButton + "</form>"

        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
        })

        res.end(output)
    }
    catch (exc)
    {
        logException(exc, null)
        res.end("error")
    }
})

app.post("/banned-ip-list", (req, res) => {
    try 
    {
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
    }
    catch (exc)
    {
        logException(exc, null)
        res.end("error")
    }
})

app.post("/ban-ip-entry", (req, res) => {
    try 
    {
        const pwd = req.body.pwd

        if (pwd != settings.adminKey)
        {
            res.end("nope")
            return
        }
        
        const ipInput = "<input type='text' name='ip'>"
        const pwdInput = "<input type='hidden' name='pwd' value='" + pwd + "'>"
        const banButton = "<br/><input type='submit'>"

        const output = "<form action='ban-ip' method='post'>" + pwdInput + ipInput + banButton + "</form>"

        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
        })

        res.end(output)
    }
    catch (exc)
    {
        logException(exc, null)
        res.end("error")
    }
})

app.post("/ban", async (req, res) => {
    try 
    {
        const pwd = req.body.pwd

        if (pwd != settings.adminKey)
        {
            res.end("nope")
            return
        }

        const userIdsToBan = Object.keys(req.body).filter(x => x != "pwd")
        for (const id of userIdsToBan)
        {
            const user = getUser(id)
            for (const ip of user.ips)
                await banIP(ip)
        }
        res.end("done")
    }
    catch (exc)
    {
        logException(exc, null)
        res.end("error")
    }
})

app.post("/ban-ip", async (req, res) => {
    try 
    {
        const pwd = req.body.pwd

        if (pwd != settings.adminKey)
        {
            res.end("nope")
            return
        }
        
        await banIP(req.body.ip)
        res.end("done")
    }
    catch (exc)
    {
        logException(exc, null)
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
        logException(exc, null)
        res.end("error")
    }
})

app.post("/client-log", (req, res) =>
{
    try
    {
        log.error(`Client log ${getRealIp(req)}:`, req.body.replace(/[\n\r]/g, ""))
        res.end()
    }
    catch (exc)
    {
        logException(exc, null)
        res.end()
    }
})

app.post("/login", async (req, res) =>
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
                error: "ip_restricted",
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
                    await disconnectUser(u);
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
            .replace(/[◆⯁♦⬥]/g, "◇");
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

// Next step is to determine the load of the stream: video+audio, video only, audio only, video/audio quality, etc
function getLeastUsedJanusServer()
{
    const serverUsageWeights = Object.fromEntries(janusServers.map(o => [o.id, 0]));
    for (const areaId in roomStates)
        for (const roomId in roomStates[areaId])
        {
            const streams = roomStates[areaId][roomId].streams;
            for (const streamSlotId in streams)
            {
                const streamSlot = streams[streamSlotId]
                if(streamSlot.publisher !== null && streamSlot.janusServer !== null)
                    serverUsageWeights[streamSlot.janusServer.id] += Math.max(streamSlot.listeners.length, 5)
                    // the number of listeners or, if larger, 5 to give streams space to expand into
            }
        }
    
    const serverId = Object.keys(serverUsageWeights).reduce((acc, cur) =>
        serverUsageWeights[acc] < serverUsageWeights[cur] ? acc : cur);
    return janusServersObject[serverId];
}

async function destroySession(janusHandle: any, stream: StreamSlot, user: Player)
{
    try
    {
        if (janusHandle === null || stream.janusSession === null) return;

        log.info("destroySession", "Janus room " + stream.janusRoomIntName
            + "(" + stream.janusRoomName + ") destroying on server "
            + stream.janusServer!.id)
        await janusHandle.destroy({ room: stream.janusRoomIntName })
        
        log.info("destroySession", "Handle", janusHandle.getId(), "detaching on server", stream.janusServer!.id)
        await janusHandle.detach()

        stream.publisher = null;
        
        while(stream.listeners.length > 0)
        {
            const listener = stream.listeners.pop();
            if(listener === undefined || listener === null) continue
            log.info("destroySession", "Listener handle", listener.janusHandle.getId(), "detaching on server", stream.janusServer!.id)
            await listener.janusHandle.detach()
        }
        
        if (stream.janusSession !== null)
        {
            log.info("destroySession", "Session", stream.janusSession.getId(), "destroying on server", stream.janusServer!.id)
            await stream.janusSession.destroy()
            stream.janusSession = null
        }
        
        stream.janusServer = null;
    }
    catch (error)
    {
        logException(error, user)
    }
}

async function clearStream(user: Player)
{
    try
    {
        if (!user) return

        log.info(user.id, "trying clearStream:", user.areaId, user.roomId)

        const roomState = roomStates[user.areaId][user.roomId];
        const stream = roomState.streams.find(s => s.publisher !== null && s.publisher.user == user);

        if (stream && stream.isActive)
        {
            const janusHandleToDestroy = stream.publisher!.janusHandle

            stream.isActive = false
            stream.isReady = false
            // Need to clear stream.publisher before calling sendUpdatedStreamSlotState(),
            // otherwise the DTO sent to the clients will erroneously have a userId despite
            // not being active.
            stream.publisher = null
            stream.isVisibleOnlyToSpecificUsers = null
            stream.allowedListenerIDs = []
            
            sendUpdatedStreamSlotState(user)
            emitServerStats(user.areaId)

            // For some reason if this line is executed before sendUpdatedStreamSlotState(user),
            // the listeners sometimes don't receive the updated slots message... Still don't know why.
            await destroySession(janusHandleToDestroy, stream, user)
        }
    }
    catch (error)
    {
        logException(error, user)
    }
}

async function clearRoomListener(user: Player)
{
    try
    {
        if (!user) return
        
        log.info(user.id, "trying to clear room of listener:", user.areaId, user.roomId)
        
        for (const s of roomStates[user.areaId][user.roomId].streams
                .filter(s => s.janusSession !== null))
        {
            let li;
            while((li = s.listeners.findIndex(l => l.user == user)) != -1)
            {
                const listener = s.listeners.splice(li, 1);
                const userId = listener[0].user === null ? "Unknown" : listener[0].user.id;
                    
                log.info("clearRoomListener", userId,
                    "Janus listener handle", listener[0].janusHandle.getId(),
                    "detached on server", s.janusServer!.id)
                await listener[0].janusHandle.detach();
            }
        }
    }
    catch (error)
    {
        logException(error, user)
    }
}

function buildJankenStateDto(areaId: string, roomId: string): JankenStateDto
{
    const state = roomStates[areaId][roomId].janken
    return {
        stage: state.stage,
        player1Id: state.player1Id,
        player2Id: state.player2Id,
        player1Hand: (state.stage == "win" || state.stage == "draw" ? state.player1Hand : null),
        player2Hand: (state.stage == "win" || state.stage == "draw" ? state.player2Hand : null),
        namedPlayerId: state.namedPlayerId,
    }
}

function sendUpdatedJankenState(areaId: string, roomId: string)
{
    const stateDTO: JankenStateDto = buildJankenStateDto(areaId, roomId)
    roomEmit(areaId, roomId, "server-update-janken", stateDTO);
}

function startJankenTimeout(areaId: string, roomId: string, length: number)
{
    const state = roomStates[areaId][roomId].janken
    if (state.timeoutTimer) clearTimeout(state.timeoutTimer)
    state.timeoutTimer = setTimeout(() =>
    {
        state.stage = "timeout"
        sendUpdatedJankenState(areaId, roomId)
        resetJanken(areaId, roomId, true)
    }, length)
}

function setupJankenStageChoosing(areaId: string, roomId: string)
{
    const state = roomStates[areaId][roomId].janken
    state.stage = "choosing"
    state.player1Hand = null
    state.player2Hand = null
    startJankenTimeout(areaId, roomId, 20000)
    sendUpdatedJankenState(areaId, roomId)
}

function determineJankenResults(areaId: string, roomId: string)
{
    const state = roomStates[areaId][roomId].janken
    if (state.player1Hand === null || state.player2Hand === null) return
    if (state.player1Hand !== state.player2Hand)
    {
        state.stage = "win"
        const winningHands = {
            rock: "scissors",
            paper: "rock",
            scissors: "paper",
        }
        state.namedPlayerId = (winningHands[state.player1Hand] == state.player2Hand
            ? state.player1Id
            : state.player2Id)
    }
    else
    {
        state.stage = "draw"
    }
    sendUpdatedJankenState(areaId, roomId)
    if (state.stage == "draw")
    {
        setTimeout(setupJankenStageChoosing, 2000, areaId, roomId)
    }
    else
    {
        resetJanken(areaId, roomId, true)
    }
}

function resetJanken(areaId: string, roomId: string, withoutEmit?: boolean)
{
    const state = roomStates[areaId][roomId].janken
    state.stage = "joining"
    state.player1Id = null
    state.player2Id = null
    state.namedPlayerId = null
    state.player1Hand = null
    state.player2Hand = null
    if (state.timeoutTimer) clearTimeout(state.timeoutTimer)
    state.timeoutTimer = null
    if (!withoutEmit)
        sendUpdatedJankenState(areaId, roomId)
}

function quitJanken(user: Player)
{
    const state = roomStates[user.areaId][user.roomId].janken
    if (!(state.player1Id == user.id || state.player2Id == user.id))
        return
    state.stage = "quit"
    state.namedPlayerId = user.id
    sendUpdatedJankenState(user.areaId, user.roomId)
    resetJanken(user.areaId, user.roomId, true)
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


async function disconnectUser(user: Player)
{
    log.info("Removing user ", user.id, "<" + user.name + ">", user.areaId)
    await clearStream(user)
    await clearRoomListener(user)
    removeUser(user)

    userRoomEmit(user, "server-user-left-room", user.id);
    emitServerStats(user.areaId)
}

async function banIP(ip: string)
{
    log.info("BANNING " + ip)

    bannedIPs.add(ip)

    for (const user of getUsersByIp(ip, null))
    {
        if (user.socketId)
        {
            const socket = io.sockets.sockets.get(user.socketId)
            if (socket)
                socket.disconnect();
        }

        await disconnectUser(user)
    }
}

// TODO rename "user" parameter (what does it mean? it's not immediately clear)
function sendUpdatedStreamSlotState(user: Player)
{
    const roomState = roomStates[user.areaId][user.roomId]
    for (const u of getFilteredConnectedUserList(user, user.roomId, user.areaId))
        if (u.socketId)
        {
            const dtoArray = toStreamSlotDtoArray(u, roomState.streams)
            io.to(u.socketId).emit("server-update-current-room-streams", dtoArray)
        }
}

function stringifyException(exception: any)
{
    // Handle the case when exception isn't an Exception object
    const logMessage = exception.message
                        ? (exception.message + " " + exception.stack)
                        : (exception + "")
    return logMessage.replace(/\n/g, "")
}

export function logException(exception: any, user: Player | null)
{
    if (user)
        log.error("Server error:", user.id, stringifyException(exception));
    else
        log.error("Server error:", stringifyException(exception));

    if (exception?.message?.match(/Couldn't attach to plugin: error '-1'/))
    {
        // When this exception is raised, usually it means that the janus server has broken
        // and so far the only thing that will fix it is to restart the server, so that all streams
        // stop and all rooms are cleared. Would be nice to find a way to prevent this problem in the first place...
        log.error("EMERGENCY SERVER RESTART BECAUSE OF JANUS FUCKUP")

        process.exit()
    }
}

let isBackgroundTaskRunning = false
setInterval(async () =>
{
    if (isBackgroundTaskRunning)
        return
    isBackgroundTaskRunning = true
    try
    {
        for (const user of getAllUsers())
        {
            if (user.disconnectionTime)
            {
                // Remove ghosts (that is, users for which there is no active websocket)
                if (Date.now() - user.disconnectionTime > maxGhostRetention)
                {
                    log.info("Remove ghost without websocket", user.id, Date.now(), user.disconnectionTime, Date.now() - user.disconnectionTime)
                    await disconnectUser(user)
                }
            }
            else if (user.isGhost)
            {
                log.info(user.id, "is a ghost without connection time")
                await disconnectUser(user)
            }
            else
            {
                // Make user transparent after 30 minutes without moving or talking
                if (!user.isInactive && Date.now() - user.lastAction > inactivityTimeout)
                {
                    userRoomEmit(user, "server-user-inactive", user.id);
                    user.isInactive = true
                    log.info(user.id, "is inactive", Date.now(), user.lastAction);
                }
            }
        }
    }
    catch (e)
    {
        logException(e, null)
    }
    isBackgroundTaskRunning = false
}, 1 * 1000)

// Persist state every few seconds, so that people can seamless reconnect on a server restart

async function persistState()
{
    try
    {
        const state: PersistedState = {
            users: getAllUsers(),
            bannedIPs: Array.from(bannedIPs),
            areas: settings.siteAreas.map(area =>
            {
                return {
                    id: area.id,
                    coinCounter: roomStates[area.id]["jinja"].coinCounter
                }
            }),
        }

        if (settings.persistorUrl)
        {
            await got.post(settings.persistorUrl, {
                headers: {
                    "persistor-secret": settings.persistorSecret,
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
        logException(exc, null)
    }
}

function applyState(state: PersistedState)
{
    restoreUserState(state.users)
    bannedIPs = new Set(state.bannedIPs)
    
    if(state.areas) state.areas.forEach(area =>
    {
        try {
            roomStates[area.id]["jinja"].coinCounter = area.coinCounter
        } catch {}
    })
    
    // backwards compatibility
    try {
        if (state.forCoinCount) roomStates["for"]["jinja"].coinCounter = state.forCoinCount
        if (state.genCoinCount) roomStates["gen"]["jinja"].coinCounter = state.genCoinCount
    } catch {}
}

async function restoreState()
{
    try
    {
        initializeRoomStates()
        // If there's an error, just don't deserialize anything
        // and start with a fresh state

        log.info("Restoring state...")
        if (settings.persistorUrl)
        {
            // remember to do it as defensive as possible

                const response = await got.get(settings.persistorUrl, {
                    headers: {
                        "persistor-secret": settings.persistorSecret
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
                logException(exc, null)
            }
        }
    }
    catch (exc)
    {
        logException(exc, null)
    }
}

setInterval(() => persistState(), persistInterval)


dynamicRooms.forEach((dynamicRoom: DynamicRoom) =>
{
    let previousVariant: string | null = null
    subscribeToAnnualEvents(dynamicRoom.subscribedAnnualEvents, (current, added, removed) =>
    {
        log.info("subscribed event", dynamicRoom)
        const room = dynamicRoom.build(current, added, removed)
        if (previousVariant != room.variant)
        {
            rooms[dynamicRoom.roomId] = room
            settings.siteAreas.forEach(area =>
            {
                for (const u of getConnectedUserList(dynamicRoom.roomId, area.id))
                    if (u.socketId)
                    {
                        const socket = io.sockets.sockets.get(u.socketId)
                        if (socket)
                            sendRoomState(socket, u, rooms[dynamicRoom.roomId]);
                    }
            })
            if (typeof room.variant === "string")
                previousVariant = room.variant
        }
    })
})

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

restoreState()
    .then(() =>
    {
        server.listen(port, "0.0.0.0")
        if (!isProduction) ViteExpress.bind(app, server)
        log.info("Server running on http://localhost:" + port)
    })
    .catch(log.error)
