//localStorage.debug = '*'; // socket.io debug
localStorage.removeItem("debug");

import { characters, loadCharacters } from "./character.js";
import User from "./user.js";
import { loadImage, calculateRealCoordinates, postJson, BLOCK_WIDTH, BLOCK_HEIGHT } from "./utils.js";
import { messages } from "./lang.js";
import { RTCPeer, defaultIceConfig } from "./rtcpeer.js";
import { RenderCache } from "./rendercache.js";

const urlRegex = /(https?:\/\/|www\.)[^\s]+/gi

let loadCharacterImagesPromise = null

const i18n = new VueI18n({
    locale: "ja",
    fallbackLocale: "ja",
    messages,
});

const vueApp = new Vue({
    i18n,
    el: "#vue-app",
    data: {
        selectedCharacter: null,
        socket: null,
        users: {},
        roomLoadId: 0,
        currentRoom: {
            id: null,
            objects: [],
        },
        myUserID: null,
        isWaitingForServerResponseOnMovement: false,
        justSpawnedToThisRoom: true,
        isLoadingRoom: false,
        requestedRoomChange: false,
        forceUserInstantMove: false,
        isInfoboxVisible: localStorage.getItem("isInfoboxVisible") == "true",
        soundEffectVolume: 0,
        characterId: localStorage.getItem("characterId") || "giko",
        isLoggingIn: false,
        areaId: localStorage.getItem("areaId") ||"gen", // 'gen' or 'for'
        
        // canvas
        canvasContext: null,
        isRedrawRequired: false,
        isUsernameRedrawRequired: false,
        isDraggingCanvas: false,
        canvasDragStartPoint: null,
        canvasDragStartOffset: null,
        canvasManualOffset: { x: 0, y: 0 },
        canvasGlobalOffset: { x: 0, y: 0 },
        canvasDimensions: { w: 0, h: 0 },
        canvasScale: 1,
        svgMode: null,

        // rula stuff
        isRulaPopupOpen: false,
        roomList: [],
        lastRoomListSortKey: null,
        rulaRoomSelection: null,
        
        // streaming
        streams: [],
        mediaStream: null,
        streamSlotIdInWhichIWantToStream: null,
        rtcPeerSlots: [],
        takenStreams: [], // streams taken by me

        // stream settings
        isStreamPopupOpen: false,
        streamMode: "video_sound",
        displayAdvancedStreamSettings: false,
        streamEchoCancellation: false,
        streamNoiseSuppression: false,
        streamAutoGain: false,
        streamScreenCapture: false,

        // Warning Toast
        isWarningToastOpen: false,
        warningToastMessage: "",
        loggedIn: false,

        enableGridNumbers: false,
        username: localStorage.getItem("username") || "",

        // Possibly redundant data:
        serverStats: {
            userCount: 0,
        },
        wantToStream: false,
        connectionLost: false,
        steppingOnPortalToNonAvailableRoom: false,

        pageRefreshRequired: false,
        expectedServerVersion: null,
        passwordInputVisible: false,
        password: "",

        allCharacters: Object.values(characters),

        vuMeterTimer: null,
        showUsernameBackground: localStorage.getItem("showUsernameBackground") != "false",
    },
    mounted: function ()
    {
        window.addEventListener("keydown", (ev) =>
        {
            if (ev.shiftKey && ev.ctrlKey && ev.code == "Digit9")
            this.passwordInputVisible = true
            if (ev.shiftKey && ev.ctrlKey && ev.code == "Digit8")
            {
                this.enableGridNumbers = !this.enableGridNumbers
                this.isRedrawRequired = true
            }
        })

        if (this.areaId == "gen")
            this.setLanguage("ja")
        else
            this.setLanguage("en")

        loadCharacterImagesPromise = loadCharacters();
    },
    methods: {
        login: async function (ev)
        {
            try {
                ev.preventDefault();
                this.isLoggingIn = true;

                localStorage.setItem("username", this.username)
                localStorage.setItem("characterId", this.characterId)
                localStorage.setItem("areaId", this.areaId)

                window.addEventListener("resize", () =>
                {
                    this.isRedrawRequired = true;
                })

                await loadCharacterImagesPromise;

                if (this.characterId === "naito")
                {
                    const die = Math.random()
                    if (die < 0.25)
                        this.characterId = "funkynaito"
                }

                if (this.password == "iapetus56")
                    this.characterId = "shar_naito"

                this.loggedIn = true;
                this.selectedCharacter = characters[this.characterId];
                this.registerKeybindings();

                await this.connectToServer(this.username);

                this.isLoggingIn = false;

                this.canvasContext = document.getElementById("room-canvas")
                    .getContext("2d");
                this.paintLoop();

                this.soundEffectVolume = localStorage.getItem(this.areaId + "soundEffectVolume") || 0
                this.updateAudioElementsVolume()
            }
            catch (exc)
            {
                console.log(exc)
                alert("Connection failed :(")
            }
        },
        toggleCrispMode: function ()
        {
            this.svgMode = this.svgMode != "crisp" ? "crisp" : null;
            this.reloadImages()
        },
        reloadImages: async function ()
        {
            this.loadRoomBackground();
            this.loadRoomObjects();
            
            await (loadCharacters(this.svgMode));
            this.isRedrawRequired = true;
        },
        setLanguage: function (code)
        {
            i18n.locale = code;
        },
        showWarningToast: function (text)
        {
            this.warningToastMessage = text;
            this.isWarningToastOpen = true;
        },
        closeWarningToast: function ()
        {
            this.isWarningToastOpen = false;
        },
        loadRoomBackground: async function ()
        {
            const urlMode = (!this.svgMode ? "" : "." + this.svgMode);
            
            const roomLoadId = this.roomLoadId;
            
            const image = await loadImage(this.currentRoom.backgroundImageUrl.replace(".svg", urlMode + ".svg"))
            
            if (this.roomLoadId != roomLoadId) return;
            this.currentRoom.backgroundImage = RenderCache.Image(image, this.currentRoom.scale);
            this.isRedrawRequired = true;
        },
        loadRoomObjects: async function (mode)
        {
            const urlMode = (!this.svgMode ? "" : "." + this.svgMode);
            
            const roomLoadId = this.roomLoadId;
            
            await Promise.all(Object.values(this.currentRoom.objects).map(o =>
                loadImage("rooms/" + this.currentRoom.id + "/" + o.url.replace(".svg", urlMode + ".svg"))
                    .then((image) =>
                {
                    const scale = o.scale ? o.scale : 1;
                    if (this.roomLoadId != roomLoadId) return;
                    o.image = RenderCache.Image(image, scale);
                    
                    o.physicalPositionX = o.offset ? o.offset.x * scale : 0
                    o.physicalPositionY = o.offset ? o.offset.y * scale : 0
                    this.isRedrawRequired = true;
                })
            ))
        },
        updateRoomState: async function (dto)
        {
            const roomDto = dto.currentRoom
            const usersDto = dto.connectedUsers
            const streamsDto = dto.streams

            this.isLoadingRoom = true;
            const roomLoadId = this.roomLoadId = this.roomLoadId + 1;

            if (this.currentRoom.needsFixedCamera)
                this.canvasManualOffset = { x: 0, y: 0 }
            
            const previousRoomId = this.currentRoom && this.currentRoom.id
            this.currentRoom = roomDto;
            
            this.users = {};

            for (const u of usersDto)
            {
                this.addUser(u);
                if(previousRoomId != this.currentRoom.id && this.users[u.id].message)
                    this.displayMessage(u.id, this.users[u.id].message);
            }
            
            this.loadRoomBackground();
            this.loadRoomObjects();

            // stream stuff
            this.takenStreams = streamsDto.map(() => false);
            this.updateCurrentRoomStreams(streamsDto);

            // Force update of user coordinates using the current room's logics (origin coordinates, etc)
            this.forcePhysicalPositionRefresh();

            document.getElementById("room-canvas").focus();
            this.justSpawnedToThisRoom = true;
            this.isLoadingRoom = false;
            this.requestedRoomChange = false;
            
            this.rtcPeerSlots.forEach(s => s !== null && s.rtcPeer.close());
            this.rtcPeerSlots = streamsDto.map(() => null);
        },
        connectToServer: async function ()
        {
            const loginResponse = await postJson("/login", {
                userName: this.username,
                characterId: this.characterId,
                areaId: this.areaId,
            });

            this.myUserID = await loginResponse.json();

            // load the room state before connecting the websocket, so that all
            // code handling websocket events (and paint() events) can assume that
            // currentRoom, streams etc... are all defined

            const response = await fetch("/areas/" + this.areaId + "/rooms/admin_st")
            this.updateRoomState(await response.json())
            
            const pingResponse = await postJson("/ping/" + this.myUserID, {
                userId: this.myUserID,
            });
            if (pingResponse.ok)
            {
                const { version: newVersion } = await pingResponse.json();
                this.expectedServerVersion = newVersion
            }

            this.socket = io();

            const immanentizeConnection = () =>
            {
                // it can happen that the user is pressing the arrow keys while the
                // socket is down, in which case the server will never answer to the
                // user-move event, and isWaitingForServerResponseOnMovement will never
                // be reset. So, just in case, I reset it at every socket reconnection.
                this.isWaitingForServerResponseOnMovement = false

                this.connectionLost = false;
                this.socket.emit("user-connect", this.myUserID);

                this.ping()
            }

            this.socket.on("connect", immanentizeConnection);
            this.socket.on("reconnect", immanentizeConnection);

            this.socket.on('connect_error', (error) => {
                console.error(error)
              });

            this.socket.on("disconnect", (reason) =>
            {
                console.error("Socket disconnected:", reason)
                this.connectionLost = true;
            });
            this.socket.on("server-cant-log-you-in", () =>
            {
                this.connectionLost = true;
            });

            this.socket.on("server-update-current-room-state", (dto) =>
            {
                this.updateRoomState(dto);
            });

            this.socket.on("server-msg", (userId, msg) =>
            {
                this.displayMessage(userId, msg);
            });

            this.socket.on("server-stats", (serverStats) =>
            {
                this.serverStats = serverStats;
            });

            this.socket.on("server-move", (userId, x, y, direction, isInstant) =>
            {
                const user = this.users[userId];

                user.isInactive = false

                const oldX = user.logicalPositionX;
                const oldY = user.logicalPositionY;

                if (isInstant)
                    user.moveImmediatelyToPosition(this.currentRoom, x, y, direction);
                else user.moveToPosition(x, y, direction);

                if (userId == this.myUserID)
                {
                    this.isWaitingForServerResponseOnMovement = false;
                    if (oldX != x || oldY != y) this.justSpawnedToThisRoom = false;
                }
                this.updateCanvasObjects();
            });
            
            this.socket.on("server-bubble-position", (userId, position) =>
            {
                const user = this.users[userId];

                user.isInactive = false
                user.bubblePosition = position;
                user.bubbleImage = null;
                this.isRedrawRequired = true;
            });

            this.socket.on("server-reject-movement",
                () => (this.isWaitingForServerResponseOnMovement = false)
            );

            this.socket.on("server-user-joined-room", async (user) =>
            {
                document.getElementById("login-sound").play();
                this.addUser(user);
                this.isRedrawRequired = true;
            });

            this.socket.on("server-user-left-room", (userId) =>
            {
                if (userId != this.myUserID) delete this.users[userId];
                this.isRedrawRequired = true;
            });

            this.socket.on("server-user-inactive", (userId) =>
            {
                this.users[userId].isInactive = true;
                this.isRedrawRequired = true;
            });

            this.socket.on("server-not-ok-to-stream", (reason) =>
            {
                this.wantToStream = false;
                this.stopStreaming();
                this.showWarningToast(reason);
            });
            this.socket.on("server-not-ok-to-take-stream", (streamSlotId) =>
            {
                this.wantToDropStream(streamSlotId);
            });
            this.socket.on("server-ok-to-stream", () =>
            {
                this.wantToStream = false;
                this.startStreaming();
            });
            this.socket.on("server-update-current-room-streams", (streams) =>
            {
                this.updateCurrentRoomStreams(streams);
            });

            this.socket.on("server-room-list", async (roomList) =>
            {
                roomList.forEach(r => {
                    r.sortName = i18n.t("room." + r.id, {reading: true});
                    r.streamerCount = r.streamers.length;
                    r.streamerDisplayNames = r.streamers.map(s => this.toDisplayName(s))
                })
                this.roomList = roomList;
                this.lastRoomListSortKey = null;
                this.sortRoomList("sortName")
                this.isRulaPopupOpen = true;
            });

            this.socket.on("server-rtc-message", async (streamSlotId, type, msg) =>
            {
                console.log(streamSlotId, type, msg);
                const rtcPeer = this.rtcPeerSlots[streamSlotId].rtcPeer;
                if (rtcPeer === null) return;
                if(type == "offer")
                {
                    rtcPeer.acceptOffer(msg);
                }
                else if(type == "answer")
                {
                    msg = msg.replace(/\r\n.*candidate.*udp.*\r\n/g, "\r\n");
                    console.log(msg)
                    rtcPeer.acceptAnswer(msg);
                }
                else if(type == "candidate")
                {
                    rtcPeer.addCandidate(msg);
                }
            });

            this.socket.on("server-character-changed", (userId, characterId) => {
                this.users[userId].character = characters[characterId]
            })
        },
        ping: async function ()
        {
            try {
                if (this.connectionLost) return;
                
                const response = await postJson("/ping/" + this.myUserID, {
                    userId: this.myUserID,
                });
                if (!response.ok)
                    throw new Error(response)
                const { version: newVersion } = await response.json();
                if (newVersion > this.expectedServerVersion)
                {
                    this.pageRefreshRequired = true
                }
            }
            catch (exc)
            {
                console.log(exc)
            }
        },
        addUser: function (userDTO)
        {
            const newUser = new User(characters[userDTO.characterId], userDTO.name);
            newUser.moveImmediatelyToPosition(
                this.currentRoom,
                userDTO.position.x,
                userDTO.position.y,
                userDTO.direction
            );
            newUser.isInactive = userDTO.isInactive;
            newUser.message = userDTO.lastRoomMessage;
            newUser.bubblePosition = userDTO.bubblePosition;
            
            this.users[userDTO.id] = newUser;
        },
        displayMessage: async function (userId, msg)
        {
            const user = this.users[userId]
            if (!user)
                console.error("Received message", msg, "from user", userId)
            
            const plainMsg = msg.replace(urlRegex, s => decodeURI(s));
            
            user.message = plainMsg;
            if(user.lastMessage != user.message)
            {
                user.bubbleImage = null;
                this.isRedrawRequired = true;
                user.lastMessage = user.message;
            }
            
            
            user.isInactive = false;
            
            if(!user.message) return;
            
            const chatLog = document.getElementById("chatLog");
            document.getElementById("message-sound").play();

            const isAtBottom = (chatLog.scrollHeight - chatLog.clientHeight) - chatLog.scrollTop < 5;

            const messageDiv = document.createElement("div");
            messageDiv.className = "message";

            const authorSpan = document.createElement("span");
            authorSpan.className = "message-author";
            authorSpan.textContent = this.toDisplayName(user.name);

            const bodySpan = document.createElement("span");
            bodySpan.className = "message-body";
            bodySpan.textContent = msg;
            bodySpan.innerHTML = bodySpan.innerHTML
                .replace(/(https?:\/\/|www\.)[^\s]+/gi, (htmlUrl, prefix) =>
                {
                    const anchor = document.createElement('a');
                    anchor.target = '_blank';
                    anchor.setAttribute('tabindex', '-1');
                    anchor.innerHTML = htmlUrl;
                    const url = anchor.textContent;
                    anchor.href = (prefix == 'www.' ? 'http://' + url : url);
                    anchor.textContent = decodeURI(url);
                    return anchor.outerHTML;
                });

            messageDiv.append(authorSpan);
            messageDiv.append(document.createTextNode(
                i18n.t("message_colon")));
            messageDiv.append(bodySpan);

            chatLog.appendChild(messageDiv);

            if (isAtBottom)
                chatLog.scrollTop = chatLog.scrollHeight -
                    chatLog.clientHeight;

            const permission = await Notification.requestPermission()
            if (permission == "granted" && document.visibilityState != "visible" && userId != this.myUserID)
            {
                const character = this.users[userId].character
                new Notification(this.toDisplayName(user.name) + ": " + plainMsg,
                    {
                        icon: "characters/" + character.characterName + "/front-standing." + character.format
                    })
            }
        },
        toDisplayName: function (name)
        {
            if (name == "")
                return i18n.t("default_user_name");
            return name;
        },
        drawImage: function (context, image, x, y)
        {
            if (!x) x = 0;
            if (!y) y = 0;
            context.drawImage(
                image,
                Math.round(this.canvasScale * x + this.canvasGlobalOffset.x),
                Math.round(this.canvasScale * y + this.canvasGlobalOffset.y)
            );
        },
        getNameImage: function(name, withBackground)
        {
            const lineHeight = 13
            const height = lineHeight + 3;
            
            const fontPrefix = "bold ";
            const fontSuffix = "px Arial, Helvetica, sans-serif";
            
            return new RenderCache(function(canvas, scale)
            {
                const fontSize = lineHeight * scale;
                
                const context = canvas.getContext('2d');
                context.font = fontPrefix + lineHeight + fontSuffix;
                const metrics = context.measureText(name);
                const width = Math.ceil(metrics.width) + 5;
                
                canvas.width = width * scale;
                canvas.height = height * scale;

                // transparent background
                if (withBackground)
                {
                    context.globalAlpha = 0.5
                    context.fillStyle = 'white';
                    context.fillRect(0, 0, canvas.width, canvas.height)
                    context.globalAlpha = 1
                }

                // text
                const scaledLineHeight = lineHeight * scale;
                context.font = fontPrefix + scaledLineHeight + fontSuffix;
                context.textBaseline = "middle";
                context.textAlign = "center"
                context.fillStyle = "blue";
                
                context.fillText(name, canvas.width/2, canvas.height/2 + 1 * scale);
                
                return [width, height];
            });
        },
        getBubbleImage: function(user)
        {
            const maxLineWidth = 250;
            const lineHeight = 15;
            const fontHeight = 13;
            const fontSuffix = "px IPAMonaPGothic,'IPA モナー Pゴシック',Monapo,Mona,'MS PGothic','ＭＳ Ｐゴシック',submona,sans-serif";
            
            const boxArrowOffset = 5;
            const boxMargin = 6;
            const boxPadding = [5, 3];
            
            let messageLines = user.message.split(/\r\n|\n\r|\n|\r/);
            let preparedLines = null;
            let textWidth = null;
            
            const arrowCorner = [
                ["down", "left"].includes(user.bubblePosition),
                ["up", "left"].includes(user.bubblePosition)];
            
            return new RenderCache(function(canvas, scale)
            {
                const context = canvas.getContext('2d');
                context.font = fontHeight + fontSuffix;
                
                if (preparedLines === null)
                {
                    preparedLines = [];
                    textWidth = 0;
                    
                    while (messageLines.length && preparedLines.length < 5)
                    {
                        const line = messageLines.shift()
                        let lastPreparedLine = "";
                        let lastLineWidth = 0;
                        for (let i=0; i<line.length; i++)
                        {
                            const preparedLine = line.substring(0, i+1);
                            const lineWidth = context.measureText(preparedLine).width
                            if (lineWidth > maxLineWidth)
                            {
                                if (i == 0)
                                {
                                    lastPreparedLine = preparedLine;
                                    lastLineWidth = maxLineWidth;
                                }
                                break;
                            }
                            lastPreparedLine = preparedLine;
                            lastLineWidth = lineWidth;
                        }
                        preparedLines.push(lastPreparedLine)
                        if (line.length > lastPreparedLine.length)
                            messageLines.push(line.substring(lastPreparedLine.length))
                        textWidth = Math.max(textWidth, lastLineWidth);
                    }
                    messageLines = null;
                }
                
                const boxWidth = textWidth + 2 * boxPadding[0];
                const boxHeight = preparedLines.length * lineHeight + 2 * boxPadding[1];
                
                
                const sLineHeight = lineHeight * scale
                const sFontHeight = fontHeight * scale;
                
                const sBoxArrowOffset = boxArrowOffset * scale;
                const sBoxMargin = boxMargin * scale;
                const sBoxPadding = [boxPadding[0] * scale, boxPadding[1] * scale];
                
                const sBoxWidth = boxWidth * scale
                const sBoxHeight = boxHeight * scale
                
                canvas.width = sBoxWidth + sBoxMargin;
                canvas.height = sBoxHeight + sBoxMargin;
                
                context.fillStyle = 'white';
                context.fillRect(
                    !arrowCorner[0] * sBoxMargin,
                    !arrowCorner[1] * sBoxMargin,
                    sBoxWidth,
                    sBoxHeight)
                    
                context.beginPath();
                context.moveTo(
                    arrowCorner[0] * canvas.width,
                    arrowCorner[1] * canvas.height);
                context.lineTo(
                    (arrowCorner[0] ? sBoxWidth - sBoxArrowOffset : sBoxMargin + sBoxArrowOffset),
                    (arrowCorner[1] ? sBoxHeight: sBoxMargin));
                context.lineTo(
                    (arrowCorner[0] ? sBoxWidth : sBoxMargin),
                    (arrowCorner[1] ? sBoxHeight - sBoxArrowOffset : sBoxMargin + sBoxArrowOffset));
                context.closePath();
                context.fill();
                
                context.font = sFontHeight + fontSuffix;
                context.textBaseline = "middle";
                context.textAlign = "left"
                context.fillStyle = "black";
                
                for (let i=0; i<preparedLines.length; i++)
                {
                    context.fillText(preparedLines[i],
                        !arrowCorner[0] * sBoxMargin + sBoxPadding[0],
                        !arrowCorner[1] * sBoxMargin + sBoxPadding[1] + (i*sLineHeight) + (sLineHeight/2));
                }
                
                return [boxWidth + boxMargin, boxHeight + boxMargin]
            });
        },
        detectCanvasResize: function ()
        {
            if (this.canvasDimensions.w != this.canvasContext.canvas.offsetWidth ||
                this.canvasDimensions.h != this.canvasContext.canvas.offsetHeight)
            {
                this.canvasDimensions.w = this.canvasContext.canvas.offsetWidth;
                this.canvasDimensions.h = this.canvasContext.canvas.offsetHeight;

                this.canvasContext.canvas.width = this.canvasDimensions.w;
                this.canvasContext.canvas.height = this.canvasDimensions.h;
            }
        },
        setCanvasGlobalOffset: function ()
        {
            if (this.currentRoom.needsFixedCamera)
            {
                const fixedCameraOffset = this.currentRoom.backgroundOffset ||
                    { x: 0, y: 0 };
                this.canvasGlobalOffset.x = this.canvasScale * -fixedCameraOffset.x
                this.canvasGlobalOffset.y = this.canvasScale * -fixedCameraOffset.y
                return;
            }
            
            const userOffset = { x: 0, y: 0 };
            if (this.myUserID in this.users)
            {
                const user = this.users[this.myUserID]
                
                userOffset.x -= this.canvasScale * (user.currentPhysicalPositionX + BLOCK_WIDTH/2) - this.canvasDimensions.w / 2,
                userOffset.y -= this.canvasScale * (user.currentPhysicalPositionY - 60) - this.canvasDimensions.h / 2
            }
            
            const manualOffset = {
                x: this.canvasScale * this.canvasManualOffset.x,
                y: this.canvasScale * this.canvasManualOffset.y
            }
            
            const canvasOffset = {
                x: manualOffset.x + userOffset.x,
                y: manualOffset.y + userOffset.y
            };
            
            const backgroundImage = this.currentRoom.backgroundImage.getImage(this.canvasScale)
            
            const bcDiff =
            {
                w: backgroundImage.width - this.canvasDimensions.w,
                h: backgroundImage.height - this.canvasDimensions.h
            }
            
            const margin = (this.currentRoom.isBackgroundImageOffsetEdge ?
                {w: 0, h: 0} : this.canvasDimensions);
            
            let isAtEdge = false;
            
            if (canvasOffset.x > margin.w)
                {isAtEdge = true; manualOffset.x = margin.w - userOffset.x}
            else if(canvasOffset.x < -margin.w - bcDiff.w)
                {isAtEdge = true; manualOffset.x = -margin.w - (bcDiff.w + userOffset.x)}
            
            if (canvasOffset.y > margin.h)
                {isAtEdge = true; manualOffset.y = margin.h - userOffset.y}
            else if(canvasOffset.y < -margin.h - bcDiff.h)
                {isAtEdge = true; manualOffset.y = -margin.h - (bcDiff.h + userOffset.y)}
            
            if (isAtEdge)
            {
                canvasOffset.x = manualOffset.x + userOffset.x
                canvasOffset.y = manualOffset.y + userOffset.y
                this.isCanvasMousedown = false;
            }
            
            this.canvasGlobalOffset.x = canvasOffset.x;
            this.canvasGlobalOffset.y = canvasOffset.y;
        },
        
        calculateUserPhysicalPositions: function ()
        {
            for (const id in this.users)
            {
                this.users[id].calculatePhysicalPosition(this.currentRoom);
            }
        },
        
        updateCanvasObjects: function ()
        {
            this.canvasObjects = [].concat(
                this.currentRoom.objects
                    .map(o => ({
                        o,
                        type: "room-object",
                        priority: o.x + 1 + (this.currentRoom.size.y - o.y),
                    })),
                Object.values(this.users).map(o => ({
                    o,
                    type: "user",
                    priority: o.logicalPositionX + 1 + (this.currentRoom.size.y - o.logicalPositionY),
                }))
                )
                .sort((a, b) =>
                {
                    if (a.priority < b.priority) return -1;
                    if (a.priority > b.priority) return 1;
                    return 0;
                });
        },

        paintBackground: function ()
        {
            const context = this.canvasContext;
            
            context.fillStyle = this.currentRoom.backgroundColor;
            context.fillRect(0, 0, this.canvasDimensions.w, this.canvasDimensions.h);
            
            this.drawImage(
                context,
                this.currentRoom.backgroundImage.getImage(this.canvasScale)
            );
        },
        
        drawObjects: function ()
        {
            const context = this.canvasContext;
            
            for (const o of this.canvasObjects)
            {
                if (o.type == "room-object")
                {
                    if (!o.o.image) continue;
                    
                    this.drawImage(
                        context,
                        o.o.image.getImage(this.canvasScale),
                        o.o.physicalPositionX,
                        o.o.physicalPositionY
                    );
                } // o.type == "user"
                else
                {
                    context.save();
                    
                    if (o.o.isInactive)
                        context.globalAlpha = 0.5
                    
                    const renderImage = o.o.getCurrentImage(this.currentRoom);
                    this.drawImage(
                        context,
                        renderImage.getImage(this.canvasScale),
                        o.o.currentPhysicalPositionX + BLOCK_WIDTH/2 - renderImage.width/2,
                        o.o.currentPhysicalPositionY - renderImage.height
                    );
                    
                    context.restore()
                }
            }
        },
        
        drawUsernames: function ()
        {
            for (const o of this.canvasObjects.filter(o => o.type == "user"))
            {
                if (o.o.nameImage == null || this.isUsernameRedrawRequired)
                    o.o.nameImage = this.getNameImage(this.toDisplayName(o.o.name), this.showUsernameBackground);
                
                const image = o.o.nameImage.getImage(this.canvasScale)
                
                this.drawImage(
                    this.canvasContext,
                    image,
                    o.o.currentPhysicalPositionX + BLOCK_WIDTH/2 - o.o.nameImage.width/2,
                    o.o.currentPhysicalPositionY - 120
                );
            }
            if (this.isUsernameRedrawRequired)
                this.isUsernameRedrawRequired = false;
        },
        
        drawBubbles: function()
        {
            for (const o of this.canvasObjects.filter(o => o.type == "user"))
            {
                const user = o.o;
                
                if (!user.message) continue;
                
                if (user.bubbleImage == null)
                    user.bubbleImage = this.getBubbleImage(user)
                
                const image = user.bubbleImage.getImage(this.canvasScale)
                
                const pos = [
                    ["up", "right"].includes(user.bubblePosition),
                    ["down", "right"].includes(user.bubblePosition)];
                
                this.drawImage(
                    this.canvasContext,
                    image,
                    user.currentPhysicalPositionX + BLOCK_WIDTH/2
                        + (pos[0] ? 21 : -21 - user.bubbleImage.width),
                    user.currentPhysicalPositionY
                        - (pos[1] ? 62 : 70 + user.bubbleImage.height)
                );
            }
        },
        
        drawOriginLines: function ()
        {
            const context = this.canvasContext;
            
            context.strokeStyle = "#ff0000";
                
            const co = this.canvasGlobalOffset;
            
            context.beginPath();
            context.moveTo(co.x+11, co.y-1);
            context.lineTo(co.x-1, co.y-1);
            context.lineTo(co.x-1, co.y+10);
            context.stroke();
            
            const origin = calculateRealCoordinates(this.currentRoom, 0, 0)
            
            const cr_x = co.x+origin.x;
            const cr_y = co.y+origin.y;
            
            context.beginPath();
            context.rect(cr_x-1, cr_y+1, BLOCK_WIDTH+2, -BLOCK_HEIGHT-2);
            context.stroke();
            
            const cc_x = co.x+this.currentRoom.originCoordinates.x;
            const cc_y = co.y+this.currentRoom.originCoordinates.y;
            
            context.strokeStyle = "#0000ff";
            
            context.beginPath();
            context.moveTo(co.x-1, co.y);
            context.lineTo(cc_x, co.y);
            context.lineTo(cc_x, cc_y);
            context.stroke();
        },
        
        drawGridNumbers: function ()
        {
            const context = this.canvasContext;
            
            context.font = "bold 13px Arial, Helvetica, sans-serif";
            context.textBaseline = "bottom";
            context.textAlign = "center";
            
            for (let x = 0; x < this.currentRoom.size.x; x++)
                for (let y = 0; y < this.currentRoom.size.y; y++)
                {
                    context.fillStyle = "#0000ff";
                    if (Object.values(this.currentRoom.doors).find(d => d.x == x && d.y == y))
                        context.fillStyle = "#00cc00";
                    if (this.currentRoom.blocked.find(b => b.x == x && b.y == y))
                        context.fillStyle = "#ff0000";
                    if (this.currentRoom.sit.find(b => b.x == x && b.y == y))
                        context.fillStyle = "yellow";
                    const realCoord = calculateRealCoordinates(
                        this.currentRoom,
                        x,
                        y
                    );
                    context.fillText(
                        x + "," + y,
                        (realCoord.x + BLOCK_WIDTH/2) + this.canvasGlobalOffset.x,
                        (realCoord.y - BLOCK_HEIGHT/3) + this.canvasGlobalOffset.y
                    );
                }
        },
        
        paint: function ()
        {
            if (this.forceUserInstantMove)
            {
                this.forcePhysicalPositionRefresh();
                this.forceUserInstantMove = false;
            }
            
            if (this.isLoadingRoom || !this.currentRoom.backgroundImage)
                return;

            this.detectCanvasResize();

            const usersRequiringRedraw = [];
            for (const [userId, user] of Object.entries(this.users))
                if (user.checkIfRedrawRequired()) usersRequiringRedraw.push(userId);
            
            if (this.isRedrawRequired
                || this.isDraggingCanvas
                || usersRequiringRedraw.length
                || this.enableGridNumbers)
            {
                this.calculateUserPhysicalPositions();
                this.setCanvasGlobalOffset();
                this.paintBackground();
                this.drawObjects();
                this.drawUsernames();
                this.drawBubbles();
                if (this.enableGridNumbers)
                {
                    this.drawOriginLines();
                    this.drawGridNumbers();
                }
                this.isRedrawRequired = false;
            }

            this.changeRoomIfSteppingOnDoor();
        },

        paintLoop: function (timestamp)
        {
            try
            {
                this.paint()
            }
            catch (err)
            {
                console.error(err, err.lineNumber);
            }

            requestAnimationFrame(this.paintLoop);
        },
        changeRoomIfSteppingOnDoor: function ()
        {
            if (this.justSpawnedToThisRoom) return;
            if (this.isWaitingForServerResponseOnMovement) return;
            if (this.requestedRoomChange) return;

            const currentUser = this.users[this.myUserID];

            if (currentUser.isWalking) return;

            this.steppingOnPortalToNonAvailableRoom = false;

            const door = Object.values(this.currentRoom.doors).find(
                (d) =>
                    d.target !== null &&
                    d.x == currentUser.logicalPositionX &&
                    d.y == currentUser.logicalPositionY
            );

            if (!door) return;

            if (door.target == "NOT_READY_YET")
            {
                this.steppingOnPortalToNonAvailableRoom = true;
                return;
            }

            const { roomId, doorId } = door.target;

            this.changeRoom(roomId, doorId);
        },
        changeRoom: function (targetRoomId, targetDoorId)
        {
            if (this.mediaStream) this.stopStreaming();

            this.requestedRoomChange = true;
            this.socket.emit("user-change-room", { targetRoomId, targetDoorId });
        },
        forcePhysicalPositionRefresh: function ()
        {
            for (const u of Object.values(this.users))
                u.moveImmediatelyToPosition(
                    this.currentRoom,
                    u.logicalPositionX,
                    u.logicalPositionY,
                    u.direction
                );
            this.updateCanvasObjects();
            this.isRedrawRequired = true;
        },
        sendNewPositionToServer: function (direction)
        {
            if (
                this.isLoadingRoom ||
                this.isWaitingForServerResponseOnMovement ||
                this.users[this.myUserID].isWalking
            )
                return;

            this.isWaitingForServerResponseOnMovement = true;
            this.socket.emit("user-move", direction);
        },
        sendNewBubblePositionToServer: function (position)
        {
            this.socket.emit("user-bubble-position", position);
        },
        sendMessageToServer: function ()
        {
            const inputTextbox = document.getElementById("input-textbox");

            const message = inputTextbox.value.substr(0, 500);
            if (message == "#rula"
                || message == "#ﾙｰﾗ"
                || message == '#ﾘｽﾄ'
                || message == '#list'
            )
                this.requestRoomList();
            else
                this.socket.emit("user-msg", message);
            inputTextbox.value = "";
        },
        registerKeybindings: function ()
        {
            window.addEventListener(
                "focus",
                () => (this.forceUserInstantMove = true)
            );
            window.addEventListener('mouseup', e =>
            {
                this.isDraggingCanvas = false;
                this.isCanvasMousedown = false;
            });
        },
        toggleInfobox: function ()
        {
            localStorage.setItem(
                "isInfoboxVisible",
                (this.isInfoboxVisible = !this.isInfoboxVisible)
            );
        },
        toggleUsernameBackground: function () {
            localStorage.setItem(
                "showUsernameBackground",
                (this.showUsernameBackground = !this.showUsernameBackground)
            );
            this.isUsernameRedrawRequired = true;
            this.isRedrawRequired = true;
        },
        handleCanvasKeydown: function (event)
        {
            if (event.shiftKey && !event.altKey && !event.ctrlKey)
            {
                // Move camera
                switch (event.code)
                {
                    case "ArrowLeft":
                    case "KeyA":
                        event.preventDefault()
                        this.canvasManualOffset.x += 10 / this.canvasScale
                        this.isRedrawRequired = true
                        break;
                    case "ArrowRight":
                    case "KeyD":
                        event.preventDefault()
                        this.canvasManualOffset.x -= 10 / this.canvasScale
                        this.isRedrawRequired = true
                        break;
                    case "ArrowUp":
                    case "KeyW":
                        event.preventDefault()
                        this.canvasManualOffset.y += 10 / this.canvasScale
                        this.isRedrawRequired = true
                        break;
                    case "ArrowDown":
                    case "KeyS":
                        event.preventDefault()
                        this.canvasManualOffset.y -= 10 / this.canvasScale
                        this.isRedrawRequired = true
                        break;
                }
            }
            if (!event.shiftKey && !event.altKey && !event.ctrlKey)
            {
                // Move avatar
                switch (event.key)
                {
                    case "ArrowLeft":
                    case "a":
                        event.preventDefault()
                        this.sendNewPositionToServer("left");
                        break;
                    case "ArrowRight":
                    case "d":
                        event.preventDefault()
                        this.sendNewPositionToServer("right");
                        break;
                    case "ArrowUp":
                    case "w":
                        event.preventDefault()
                        this.sendNewPositionToServer("up");
                        break;
                    case "ArrowDown":
                    case "s":
                        event.preventDefault()
                        this.sendNewPositionToServer("down");
                        break;
                }
            }
        },
        handleCanvasMousedown: function (event)
        {
            this.isCanvasMousedown = true;
            this.canvasDragStartOffset = { x: this.canvasManualOffset.x, y: this.canvasManualOffset.y };
            this.canvasDragStartPoint = { x: event.offsetX, y: event.offsetY };
        },
        handleCanvasMousemove: function (event)
        {
            if (!this.isCanvasMousedown) return;

            const dragOffset = {
                x: -(this.canvasDragStartPoint.x - event.offsetX),
                y: -(this.canvasDragStartPoint.y - event.offsetY)
            };

            if (!this.isDraggingCanvas &&
                (Math.sqrt(Math.pow(dragOffset.x, 2) + Math.pow(dragOffset.y, 2)) > 4))
            {
                this.isDraggingCanvas = true;
            }

            if (this.isDraggingCanvas)
            {
                this.canvasManualOffset.x = this.canvasDragStartOffset.x + dragOffset.x / this.canvasScale
                this.canvasManualOffset.y = this.canvasDragStartOffset.y + dragOffset.y / this.canvasScale;
            }
        },
        handleMessageInputKeydown: function (event)
        {
            if (event.key != "Enter" || event.shiftKey) return;

            this.sendMessageToServer();
            event.preventDefault();
            return false;
        },
        handleCanvasWheel: function (event)
        {
            this.adjustScale(-Math.sign(event.deltaY) * 0.1);
            event.preventDefault();
            return false;
        },
        
        adjustScale: function (scaleAdjustment)
        {
            let canvasScale = this.canvasScale;
            
            canvasScale += scaleAdjustment
            
            if(canvasScale > 3)
                canvasScale = 3;
            else if(canvasScale < 0.70)
                canvasScale = 0.70;
            
            this.canvasScale = canvasScale;
            this.isRedrawRequired = true;
        },

        setupRTCConnection: function (slotId)
        {
            const rtcPeer = new RTCPeer(defaultIceConfig, (type, msg) =>
            {
                // TODO figure out if keeping this line causes issues.
                // More privacy with candidates not being sent.
                if(type == "candidate") return;
                this.socket.emit("user-rtc-message", {
                    streamSlotId: slotId, type, msg})
            });
            
            const reconnect = () =>
            {
                if (slotId == this.streamSlotIdInWhichIWantToStream)
                {
                    console.log("Attempting to restart stream")
                    this.startStreaming()
                }
                else if (this.takenStreams[slotId])
                {
                    console.log("Attempting to retake stream")
                    this.wantToTakeStream(slotId)
                }
                else
                {
                    console.log("Stream connection closed")
                } 
            };
            
            const terminate = () =>
            {
                if (slotId == this.streamSlotIdInWhichIWantToStream)
                    this.stopStreaming()
                else if (this.takenStreams[slotId])
                    this.wantToDropStream(slotId)
            };
            
            rtcPeer.open();
            rtcPeer.conn.addEventListener("iceconnectionstatechange", (ev) =>
            {
                const state = rtcPeer.conn.iceConnectionState;
                console.log("RTC Connection state", state)
                
                
                if (state == "connected")
                {
                    if (this.rtcPeerSlots[slotId])
                        this.rtcPeerSlots[slotId].attempts = 0;
                }
                else if (["failed", "disconnected", "closed"].includes(state))
                {
                    rtcPeer.close();
                    if (!this.rtcPeerSlots[slotId]) return;
                    if (this.rtcPeerSlots[slotId].attempts > 4)
                    {
                        terminate()
                    }
                    else
                    {
                        setTimeout(reconnect,
                            Math.max(this.takenStreams[slotId] ? 1000 : 0,
                                this.rtcPeerSlots[slotId].attempts * 1000));
                    }
                    
                    this.rtcPeerSlots[slotId].attempts++;
                }
            });
            return rtcPeer;
        },
        
        updateCurrentRoomStreams: function (streams)
        {
            this.streams = streams;
                
            this.streamSlotIdInWhichIWantToStream = null;

            for (const slotId in streams)
            {
                const stream = streams[slotId];
                if (stream.isActive)
                {
                    Vue.set(stream, "title", this.toDisplayName(this.users[stream.userId].name));
                    if (stream.userId == this.myUserID)
                    {
                        this.streamSlotIdInWhichIWantToStream = slotId;
                    }
                }
                else Vue.set(stream, "title", "OFF");
                if (!stream.isActive || !stream.isReady)
                    Vue.set(this.takenStreams, slotId, false);
            }
        },

        wantToStartStreaming: async function (streamSlotId)
        {
            try
            {
                this.isStreamPopupOpen = false;

                const withVideo = this.streamMode != "sound";
                const withSound = this.streamMode != "video";
                const withScreenCapture = this.streamScreenCapture && withVideo

                // TODO use Promise.all() for both promises

                let userMediaPromise = null
                if (withSound || !withScreenCapture)
                    userMediaPromise = navigator.mediaDevices.getUserMedia(
                        {
                            video: !withVideo || withScreenCapture ? undefined : {
                                width: 248,
                                height: 180,
                                frameRate: {
                                    ideal: 24,
                                    min: 10,
                                },
                            },
                            audio: !withSound ? undefined : {
                                channelCount: 2,
                                echoCancellation: this.streamEchoCancellation,
                                noiseSuppression: this.streamNoiseSuppression,
                                autoGainControl: this.streamAutoGain,
                            }
                        }
                    );
                
                let screenMediaPromise = null
                if (withScreenCapture)
                    screenMediaPromise = navigator.mediaDevices.getDisplayMedia()

                // I need to use Promise.allSettled() because the browser needs to be convinced that both getDisplayMedia()
                // and getUserMedia() were initiated by a user action.
                const promiseResults = await Promise.allSettled([userMediaPromise, screenMediaPromise])

                if (promiseResults.find(r => r.status == "rejected"))
                    throw new Error(promiseResults.find(r => r.status == "rejected").reason)

                const userMedia = promiseResults[0].value
                const screenMedia = promiseResults[1].value

                // Populate this.mediaStream
                if (!withScreenCapture)
                    this.mediaStream = userMedia
                else 
                {
                    this.mediaStream = screenMedia
                    if (withSound)
                    {
                        const audioTrack = userMedia.getAudioTracks()[0]
                        this.mediaStream.addTrack(audioTrack)
                    }
                }

                // VU Meter
                if (withSound)
                {
                    const context = new AudioContext();
                    const microphone = context.createMediaStreamSource(this.mediaStream);
                    const analyser = context.createAnalyser()
                    analyser.minDecibels = -60;
                    analyser.maxDecibels = 0;
                    analyser.smoothingTimeConstant = 0.01;
                    analyser.fftSize = 32
                    const bufferLengthAlt = analyser.frequencyBinCount;
                    const dataArrayAlt = new Uint8Array(bufferLengthAlt);
                    microphone.connect(analyser);

                    this.vuMeterTimer = setInterval(() => {
                        try {
                            if (this.streamSlotIdInWhichIWantToStream == null)
                                clearInterval(this.vuMeterTimer)    
                            analyser.getByteFrequencyData(dataArrayAlt)
                            
                            const max = dataArrayAlt.reduce((acc, val) => Math.max(acc, val))
                            const level = max / 255
                            const vuMeterBarPrimary = document.getElementById("vu-meter-bar-primary-" + this.streamSlotIdInWhichIWantToStream)
                            const vuMeterBarSecondary = document.getElementById("vu-meter-bar-secondary-" + this.streamSlotIdInWhichIWantToStream)
                            
                            vuMeterBarSecondary.style.width = vuMeterBarPrimary.style.width
                            vuMeterBarPrimary.style.width = level * 100 + "%"
                        }
                        catch (exc)
                        {
                            console.error(exc)
                            clearInterval(this.vuMeterTimer)
                        }
                    }, 100)
                }

                this.socket.emit("user-want-to-stream", {
                    streamSlotId: this.streamSlotIdInWhichIWantToStream,
                    withVideo: withVideo,
                    withSound: withSound,
                    info: []
                        .concat(this.mediaStream.getAudioTracks().map(t => ({
                            constraints: t.getConstraints && t.getConstraints(),
                            settings: t.getSettings && t.getSettings(),
                            capabilities: t.getCapabilities && t.getCapabilities(),
                        })))
                        .concat(this.mediaStream.getVideoTracks().map(t => ({
                            constraints: t.getConstraints && t.getConstraints(),
                            settings: t.getSettings && t.getSettings(),
                            capabilities: t.getCapabilities && t.getCapabilities(),
                        })))
                });

                // On small screens, displaying the <video> element seems to cause a reflow in a way that
                // makes the canvas completely gray, so i force a redraw
                this.isRedrawRequired = true; 
            } catch (err)
            {
                this.showWarningToast(i18n.t("msg.error_obtaining_media_device"));
                console.error(err);
                this.wantToStream = false;
                this.mediaStream = false;
                this.streamSlotIdInWhichIWantToStream = null;
            }
        },
        setupRtcPeerSlot: function(slotId, rtcPeer)
        {
            return this.rtcPeerSlots[slotId] = {
                rtcPeer: this.setupRTCConnection(slotId),
                attempts: 0
            }
        },
        startStreaming: async function ()
        {
            const slotId = this.streamSlotIdInWhichIWantToStream;
            const rtcPeer = this.setupRtcPeerSlot(slotId).rtcPeer;

            this.mediaStream
                .getTracks()
                .forEach((track) =>
                    rtcPeer.conn.addTrack(track, this.mediaStream)
                );
            
            document.getElementById("local-video-" + slotId).srcObject = this.mediaStream;
        },
        stopStreaming: function ()
        {
            for (const track of this.mediaStream.getTracks()) track.stop();
            
            const streamSlotId = this.streamSlotIdInWhichIWantToStream;
            
            document.getElementById("local-video-" + streamSlotId).srcObject = this.mediaStream = null;
            if (this.vuMeterTimer)
                clearInterval(this.vuMeterTimer)
            
            this.streamSlotIdInWhichIWantToStream = null;
            
            this.rtcPeerSlots[streamSlotId].rtcPeer.close()
            this.rtcPeerSlots[streamSlotId] = null;
            
            this.socket.emit("user-want-to-stop-stream");

            // On small screens, displaying the <video> element seems to cause a reflow in a way that
            // makes the canvas completely gray, so i force a redraw
            this.isRedrawRequired = true; 
        },
        wantToTakeStream: function (streamSlotId)
        {
            if (!window.RTCPeerConnection)
            {
                this.showWarningToast(i18n.t("msg.no_webrtc"));
                return;
            }
            
            Vue.set(this.takenStreams, streamSlotId, true);
            
            const rtcPeer = this.setupRtcPeerSlot(streamSlotId).rtcPeer;

            rtcPeer.conn.addEventListener(
                "track",
                (event) =>
                {
                    document.getElementById("received-video-" + streamSlotId).srcObject =
                        event.streams[0];
                },
                { once: true }
            );
            this.socket.emit("user-want-to-take-stream", streamSlotId);
        },
        wantToDropStream: function (streamSlotId)
        {
            Vue.set(this.takenStreams, streamSlotId, false);
            if(!this.rtcPeerSlots[streamSlotId]) return;
            this.rtcPeerSlots[streamSlotId].rtcPeer.close()
            this.rtcPeerSlots[streamSlotId] = null;
            //this.socket.emit("user-want-to-drop-stream", streamSlotId);
        },
        rula: function (roomId)
        {
            if (!roomId) return;
            this.canvasManualOffset = { x: 0, y: 0 };
            this.changeRoom(roomId);
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        closeRulaPopup: function ()
        {
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        sortRoomList: function (key)
        {
            this.roomList.sort((a, b) =>
            {
                let sort;
                if (key == "sortName")
                    sort = a[key].localeCompare(b[key]);
                else if(key == "streamers")
                    sort = b[key].length - a[key].length;
                else
                    sort = b[key] - a[key];
                return this.lastRoomListSortKey != key ? sort : sort * -1;
            })
            this.lastRoomListSortKey =
                (this.lastRoomListSortKey != key ? key : null);
        },
        openStreamPopup: function (streamSlotId)
        {
            if (!window.RTCPeerConnection)
            {
                this.showWarningToast(i18n.t("msg.no_webrtc"));
                return;
            }
            
            this.streamSlotIdInWhichIWantToStream = streamSlotId;
            this.wantToStream = true;

            this.isStreamPopupOpen = true;
            this.streamMode = "video_sound";
            this.streamEchoCancellation = false;
            this.streamNoiseSuppression = false;
            this.streamAutoGain = false;
            this.streamScreenCapture = false;
        },
        closeStreamPopup: function ()
        {
            this.isStreamPopupOpen = false;
            this.wantToStream = false;
            this.streamSlotIdInWhichIWantToStream = null;
        },
        changeStreamVolume: function (streamSlotId)
        {
            const volumeSlider = document.getElementById("volume-" + streamSlotId);

            const videoElement = document.getElementById(
                "received-video-" + streamSlotId
            );

            videoElement.volume = volumeSlider.value;
        },
        changeSoundEffectVolume: function ()
        {
            const volumeSlider = document.getElementById("sound-effect-volume");

            this.soundEffectVolume = volumeSlider.value

            this.updateAudioElementsVolume()
            localStorage.setItem(this.areaId + "soundEffectVolume", this.soundEffectVolume);
        },
        updateAudioElementsVolume: function ()
        {
            for (const elementId of ["message-sound", "login-sound"])
            {
                const el = document.getElementById(elementId)
                el.volume = this.soundEffectVolume
            }
        },
        requestRoomList: function ()
        {
            this.socket.emit("user-room-list");
        },
        selectRoomForRula: function (roomId)
        {
            this.rulaRoomSelection = roomId;
        },
        showPasswordInput: function ()
        {
            this.passwordInputVisible = true;
        }
    },
});
