//localStorage.debug = '*'; // socket.io debug
localStorage.removeItem("debug");

import { characters } from "./character.js";
import User from "./user.js";
import { loadImage, calculateRealCoordinates, postJson, BLOCK_WIDTH, BLOCK_HEIGHT } from "./utils.js";
import { messages } from "./lang.js";
import { RTCPeer, defaultIceConfig } from "./rtcpeer.js";
import { RenderCache } from "./rendercache.js";

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
        characterId: "giko",
        isLoggingIn: false,
        areaId: "gen", // 'gen' or 'for'
        
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
        streamVoiceEnhancement: "off",
        streamEchoCancellation: true,
        streamNoiseSuppression: true,
        streamAutoGain: true,

        // Warning Toast
        isWarningToastOpen: false,
        warningToastMessage: "",
        loggedIn: false,

        enableGridNumbers: false,

        // Possibly redundant data:
        username: "",
        roomid: "admin_st",
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
    },
    methods: {
        login: async function (ev)
        {
            try {
                ev.preventDefault();
                this.isLoggingIn = true;

                window.addEventListener("resize", () =>
                {
                    this.isRedrawRequired = true;
                })

                await Promise.all(Object.values(characters).map(c => c.loadImages()));

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
        updateRoomState: async function (dto)
        {
            const roomDto = dto.currentRoom
            const usersDto = dto.connectedUsers
            const streamsDto = dto.streams

            this.isLoadingRoom = true;
            const roomLoadId = this.roomLoadId = this.roomLoadId + 1;

            if (this.currentRoom.needsFixedCamera)
                this.canvasManualOffset = { x: 0, y: 0 }
            this.currentRoom = roomDto;

            this.roomid = this.currentRoom.id;
            this.users = {};

            for (const u of usersDto) this.addUser(u);

            loadImage(this.currentRoom.backgroundImageUrl).then((image) =>
            {
                if (this.roomLoadId != roomLoadId) return;
                this.currentRoom.backgroundImage = RenderCache.Image(image, this.currentRoom.scale);
                this.isRedrawRequired = true;
            });
            for (const o of this.currentRoom.objects)
            {
                loadImage("rooms/" + this.currentRoom.id + "/" + o.url).then(
                    (image) =>
                    {
                        const scale = o.scale ? o.scale : 1;
                        if (this.roomLoadId != roomLoadId) return;
                        o.image = RenderCache.Image(image, scale);
                        
                        o.physicalPositionX = o.offset ? o.offset.x * scale : 0
                        o.physicalPositionY = o.offset ? o.offset.y * scale : 0
                        this.isRedrawRequired = true;
                    }
                );
            }

            // stream stuff
            this.takenStreams = streamsDto.map(() => false);
            this.updateCurrentRoomStreams(streamsDto);

            // Force update of user coordinates using the current room's logics (origin coordinates, etc)
            this.forcePhysicalPositionRefresh();

            document.getElementById("room-canvas").focus();
            this.justSpawnedToThisRoom = true;
            this.isLoadingRoom = false;
            this.requestedRoomChange = false;
            
            this.rtcPeerSlots.forEach(p => p !== null && p.close());
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
                // user-move event, and isWaitingForServerResponseOnMovement would never
                // be reset. So, just in case, I reset it at every socket reconnection.
                this.isWaitingForServerResponseOnMovement = false

                this.connectionLost = false;
                this.socket.emit("user-connect", this.myUserID);

                this.ping()
            }

            this.socket.on("connect", immanentizeConnection);
            this.socket.on("reconnect", immanentizeConnection);

            this.socket.on("disconnect", () =>
            {
                this.connectionLost = true;
            });
            this.socket.on("server-cant-log-you-in", () =>
            {
                this.connectionLost = true;
            });

            this.socket.on("server-update-current-room-state",
                (dto) => this.updateRoomState(dto)
            );

            this.socket.on("server-msg", async (userId, msg) =>
            {
                const user = this.users[userId]
                if (!user)
                    console.error("Received message", msg, "from user", userId)

                const chatLog = document.getElementById("chatLog");
                document.getElementById("message-sound").play();

                this.isRedrawRequired = true

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
                    new Notification(this.toDisplayName(user.name) + ": " + msg,
                        {
                            icon: "characters/" + character.characterName + "/front-standing." + character.format
                        })
                }

                this.users[userId].isInactive = false
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
                const rtcPeer = this.rtcPeerSlots[streamSlotId];
                if (rtcPeer === null) return;
                if(type == "offer")
                {
                    rtcPeer.acceptOffer(msg);
                }
                else if(type == "answer")
                {
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
            
            this.users[userDTO.id] = newUser;
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
                Math.round(x + this.canvasGlobalOffset.x),
                Math.round(y + this.canvasGlobalOffset.y)
            );
        },
        getNameImage: function(name, withBackground)
        {
            return new RenderCache(function(canvas, scale)
            {
                const height = 13 * scale;
                const font = "bold " + height + "px Arial, Helvetica, sans-serif";
                
                const context = canvas.getContext('2d');
                context.font = font;
                const metrics = context.measureText(name);
                const width = Math.ceil(metrics.width);
                
                canvas.width = width + 5 * scale;
                canvas.height = height * 2;

                // transparent background
                if (withBackground)
                {
                    const backgroundHeight = height + 3 * scale;
                    context.globalAlpha = 0.5
                    context.fillStyle = 'white';
                    context.fillRect(0, height - backgroundHeight/2,
                        canvas.width, backgroundHeight)
                    context.globalAlpha = 1
                }

                // text
                context.font = font;
                context.textBaseline = "middle";
                context.textAlign = "center"
                context.fillStyle = "blue";
                
                context.fillText(name, canvas.width/2, height);
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
                this.canvasGlobalOffset.x = -fixedCameraOffset.x
                this.canvasGlobalOffset.y = -fixedCameraOffset.y
                return;
            }
            
            const userOffset = { x: 0, y: 0 };
            if (this.myUserID in this.users)
            {
                const user = this.users[this.myUserID]
                
                userOffset.x = -(user.currentPhysicalPositionX - (this.canvasDimensions.w / 2 - BLOCK_WIDTH / 2)),
                userOffset.y = -(user.currentPhysicalPositionY - (this.canvasDimensions.h / 2 + BLOCK_HEIGHT))
            }
            
            const canvasOffset = {
                x: this.canvasManualOffset.x + userOffset.x,
                y: this.canvasManualOffset.y + userOffset.y
            };
            
            const backgroundImage = this.currentRoom.backgroundImage.getImage()
            
            const bcDiff =
            {
                w: backgroundImage.width - this.canvasDimensions.w,
                h: backgroundImage.height - this.canvasDimensions.h
            }
            
            const margin = (this.currentRoom.isBackgroundImageOffsetEdge ?
                {w: 0, h: 0} : this.canvasDimensions);
            
            let isAtEdge = false;
            
            if (canvasOffset.x > margin.w)
                {isAtEdge = true; this.canvasManualOffset.x = margin.w - userOffset.x}
            else if(canvasOffset.x < -margin.w - bcDiff.w)
                {isAtEdge = true; this.canvasManualOffset.x = -margin.w - (bcDiff.w + userOffset.x)}
            
            if (canvasOffset.y > margin.h)
                {isAtEdge = true; this.canvasManualOffset.y = margin.h - userOffset.y}
            else if(canvasOffset.y < -margin.h - bcDiff.h)
                {isAtEdge = true; this.canvasManualOffset.y = -margin.h - (bcDiff.h + userOffset.y)}
            
            if (isAtEdge)
            {
                canvasOffset.x = this.canvasManualOffset.x + userOffset.x
                canvasOffset.y = this.canvasManualOffset.y + userOffset.y
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

        paintBackground: function ()
        {
            const context = this.canvasContext;
            
            context.fillStyle = this.currentRoom.backgroundColor;
            context.fillRect(0, 0, this.canvasDimensions.w, this.canvasDimensions.h);
            
            this.drawImage(
                context,
                this.currentRoom.backgroundImage.getImage()
            );
        },

        paintForeground: function ()
        {
            const context = this.canvasContext;

            const allObjects = [].concat(
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

            for (const o of allObjects)
            {
                if (o.type == "room-object")
                {
                    if (!o.o.image) continue;
                    
                    this.drawImage(
                        context,
                        o.o.image.getImage(),
                        o.o.physicalPositionX,
                        o.o.physicalPositionY
                    );
                } // o.type == "user"
                else
                {
                    context.save();
                    
                    if (o.o.isInactive)
                        context.globalAlpha = 0.5
                    
                    const image = o.o.getCurrentImage(this.currentRoom).getImage()
                    this.drawImage(
                        context,
                        image,
                        o.o.currentPhysicalPositionX,
                        (o.o.currentPhysicalPositionY - image.height)
                    );
                    
                    context.restore()
                }
            }

            // Draw usernames on top of everything else
            for (const o of allObjects.filter(o => o.type == "user"))
            {
                if (o.o.nameImage == null || this.isUsernameRedrawRequired)
                    o.o.nameImage = this.getNameImage(this.toDisplayName(o.o.name), this.showUsernameBackground);
                
                const image = o.o.nameImage.getImage()
                
                this.drawImage(
                    context,
                    image,
                    (o.o.currentPhysicalPositionX - image.width/2) + BLOCK_WIDTH/2,
                    (o.o.currentPhysicalPositionY - 120)
                );
            }
            if (this.isUsernameRedrawRequired)
                this.isUsernameRedrawRequired = false;
            
            if (this.enableGridNumbers)
            {
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
                this.paintForeground();
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
        sendMessageToServer: function ()
        {
            const inputTextbox = document.getElementById("input-textbox");

            if (inputTextbox.value == "") return;

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
                        this.canvasManualOffset.x += 10
                        this.isRedrawRequired = true
                        break;
                    case "ArrowRight":
                    case "KeyD":
                        event.preventDefault()
                        this.canvasManualOffset.x -= 10
                        this.isRedrawRequired = true
                        break;
                    case "ArrowUp":
                    case "KeyW":
                        event.preventDefault()
                        this.canvasManualOffset.y += 10
                        this.isRedrawRequired = true
                        break;
                    case "ArrowDown":
                    case "KeyS":
                        event.preventDefault()
                        this.canvasManualOffset.y -= 10
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
                this.canvasManualOffset.x = this.canvasDragStartOffset.x + dragOffset.x
                this.canvasManualOffset.y = this.canvasDragStartOffset.y + dragOffset.y;
            }
        },
        handleMessageInputKeydown: function (event)
        {
            if (event.key != "Enter") return;

            this.sendMessageToServer();
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
            
            rtcPeer.open();
            rtcPeer.conn.addEventListener("iceconnectionstatechange", (ev) =>
            {
                const state = rtcPeer.conn.iceConnectionState;
                if (["failed", "disconnected", "closed"].includes(state))
                {
                    rtcPeer.close();
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

                const userMedia = {};

                const withVideo = this.streamMode != "sound";
                const withSound = this.streamMode != "video";

                if (withVideo)
                {
                    userMedia.video = {
                        width: 248,
                        height: 180,
                        frameRate: {
                            ideal: 24,
                            min: 10,
                        },
                    };
                }

                if (withSound)
                {
                    userMedia.audio = {
                        echoCancellation: this.streamEchoCancellation,
                        noiseSuppression: this.streamNoiseSuppression,
                        autoGainControl: this.streamAutoGain,
                        channelCount: 2
                    };

                    if (this.streamVoiceEnhancement == "on")
                    {
                        userMedia.audio.echoCancellation = true;
                        userMedia.audio.noiseSuppression = true;
                        userMedia.audio.autoGainControl = true;
                    }
                    else if (this.streamVoiceEnhancement == "off")
                    {
                        userMedia.audio.echoCancellation = false;
                        userMedia.audio.noiseSuppression = false;
                        userMedia.audio.autoGainControl = false;
                    }
                }

                this.mediaStream = await navigator.mediaDevices.getUserMedia(
                    userMedia
                );

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
            }
        },
        startStreaming: async function ()
        {
            const slotId = this.streamSlotIdInWhichIWantToStream;
            const rtcPeer = this.setupRTCConnection(slotId);
            this.rtcPeerSlots[slotId] = rtcPeer

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
            this.rtcPeerSlots[streamSlotId].close()
            this.rtcPeerSlots[streamSlotId] = null;
            
            this.streamSlotIdInWhichIWantToStream = null;
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
            
            const rtcPeer = this.setupRTCConnection(streamSlotId);
            this.rtcPeerSlots[streamSlotId] = rtcPeer;

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
            this.rtcPeerSlots[streamSlotId].close()
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
            this.streamVoiceEnhancement = "off";
            this.streamEchoCancellation = true;
            this.streamNoiseSuppression = true;
            this.streamAutoGain = true;
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
