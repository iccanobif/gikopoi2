//localStorage.debug = '*'; // socket.io debug
localStorage.removeItem("debug");

import { characters } from "./character.js";
import User from "./user.js";
import { loadImage, calculateRealCoordinates, globalScale, postJson, BLOCK_WIDTH, BLOCK_HEIGHT } from "./utils.js";
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
            streams: [],
            objects: [],
        },
        myUserID: null,
        isWaitingForServerResponseOnMovement: false,
        justSpawnedToThisRoom: true,
        isLoadingRoom: false,
        requestedRoomChange: false,
        forceUserInstantMove: false,
        mediaStream: null,
        streamSlotIdInWhichIWantToStream: null,
        isInfoboxVisible: localStorage.getItem("isInfoboxVisible") == "true",
        rtcPeer: null,
        takenStreams: [], // streams taken by me
        soundEffectVolume: 0,
        characterId: "giko",
        isLoggingIn: false,
        streams: [],
        areaId: "gen", // 'gen' or 'for'

        canvasContext: null,
        isRedrawRequired: false,
        isDraggingCanvas: false,
        canvasDragStartPoint: null,
        canvasDragOffset: null,
        canvasOffset: { x: 0, y: 0 },
        canvasDimensions: { w: 0, h: 0 },

        // rula stuff
        isRulaPopupOpen: false,
        roomList: [],
        rulaRoomSelection: null,

        // stream settings
        isStreamPopupOpen: false,
        streamMode: "video_sound",
        streamVoiceEnhancement: "on",
        streamEchoCancellation: true,
        streamNoiseSuppression: true,
        streamAutoGain: true,

        // Warning Toast
        isWarningToastOpen: false,
        warningToastMessage: "",
        loggedIn: false,

        // Possibly redundant data:
        username: "",
        roomid: "admin_st",
        serverStats: {
            userCount: 0,
        },
        wantToStream: false,
        iAmStreaming: false,
        connectionLost: false,
        steppingOnPortalToNonAvailableRoom: false,

        pageRefreshRequired: false,
        expectedServerVersion: null,
        passwordInputVisible: false,
        password: "",

        allCharacters: Object.values(characters),
    },
    mounted: function ()
    {
        window.addEventListener("keydown", (ev) =>
        {
            if (ev.shiftKey && ev.ctrlKey && ev.code == "Digit9")
                this.passwordInputVisible = true
        })
    },
    methods: {
        login: async function (ev)
        {
            ev.preventDefault();
            this.isLoggingIn = true;

            window.addEventListener("resize", () =>
            {
                this.isBackgroundRedrawRequired = true;
                this.isForegroundRedrawRequired = true;
            })

            await Promise.all(Object.values(characters).map(c => c.loadImages()));

            if (this.username === "") this.username = i18n.t("default_user_name");

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
            this.paint();

            this.soundEffectVolume = localStorage.getItem(this.areaId + "soundEffectVolume") || 0
            this.updateAudioElementsVolume()
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
                this.canvasOffset = { x: 0, y: 0 }
            this.currentRoom = roomDto;

            this.roomid = this.currentRoom.id;
            this.users = {};

            for (const u of usersDto) this.addUser(u);

            loadImage(this.currentRoom.backgroundImageUrl).then((image) =>
            {
                if (this.roomLoadId != roomLoadId) return;
                this.currentRoom.backgroundImage = RenderCache.Image(image);
                this.isRedrawRequired = true;
            });
            for (const o of this.currentRoom.objects)
            {
                loadImage("rooms/" + this.currentRoom.id + "/" + o.url).then(
                    (image) =>
                    {
                        if (this.roomLoadId != roomLoadId) return;
                        o.image = RenderCache.Image(image);

                        if (o.offset)
                        {
                            o.physicalPositionX = o.offset.x
                            o.physicalPositionY = o.offset.y
                        }
                        else
                        {
                            const { x, y } = calculateRealCoordinates(
                                this.currentRoom,
                                o.x,
                                o.y
                            );

                            o.physicalPositionX = x + (o.xOffset || 0);
                            o.physicalPositionY = y + (o.yOffset || 0);
                        }
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

            if (this.rtcPeer !== null) this.rtcPeer.close();
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
            const { version: newVersion } = await pingResponse.json();
            this.expectedServerVersion = newVersion

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

                this.rtcPeer = new RTCPeer(defaultIceConfig, (type, msg) =>
                    this.emitRTCMessage(type, msg)
                );

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

            this.socket.on("server-msg", async (userId, userName, msg) =>
            {
                const chatLog = document.getElementById("chatLog");
                document.getElementById("message-sound").play();

                this.isRedrawRequired = true
                this.users[userId].isInactive = false

                const isAtBottom = (chatLog.scrollHeight - chatLog.clientHeight) - chatLog.scrollTop < 5;

                const messageDiv = document.createElement("div");
                messageDiv.className = "message";

                const authorSpan = document.createElement("span");
                authorSpan.className = "message-author";
                authorSpan.textContent = userName;

                const bodySpan = document.createElement("span");
                bodySpan.className = "message-body";
                bodySpan.textContent = msg;
                bodySpan.innerHTML = bodySpan.innerHTML
                    .replace(/(https?:\/\/|www\.)[^\s]+/gi, (url, prefix) =>
                    {
                        const href = (prefix == "www." ? "http://" + url : url);
                        return "<a href='" + href + "' target='_blank' tabindex='-1'>" + url + "</a>";
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
                    new Notification(userName + ": " + msg,
                        {
                            icon: "characters/" + character.characterName + "/front-standing." + character.format
                        })
                }
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
                this.showWarningToast(reason);
            });
            this.socket.on("server-ok-to-stream", () =>
            {
                this.wantToStream = false;
                this.iAmStreaming = true;
                this.startStreaming();
            });
            this.socket.on("server-update-current-room-streams", (streams) =>
            {
                this.updateCurrentRoomStreams(streams);
            });

            this.socket.on("server-room-list", async (roomList) =>
            {
                this.roomList = roomList;
                this.isRulaPopupOpen = true;
            });

            this.socket.on("server-ok-to-take-stream", async (slotId) => { });

            this.socket.on("server-rtc-offer", async (offer) =>
            {
                try
                {
                    this.rtcPeer.acceptOffer(offer);
                } catch (e)
                {
                    console.error(e.message + " " + e.stack);
                }
            });
            this.socket.on("server-rtc-answer", async (answer) =>
            {
                try
                {
                    this.rtcPeer.acceptAnswer(answer);
                } catch (e)
                {
                    console.error(e.message + " " + e.stack);
                }
            });
            this.socket.on("server-rtc-candidate", async (candidate) =>
            {
                try
                {
                    this.rtcPeer.addCandidate(candidate);
                } catch (e)
                {
                    console.error(e.message + " " + e.stack);
                }
            });
        },
        ping: async function ()
        {
            if (this.connectionLost) return;
            const response = await postJson("/ping/" + this.myUserID, {
                userId: this.myUserID,
            });
            const { version: newVersion } = await response.json();
            if (newVersion > this.expectedServerVersion)
            {
                this.pageRefreshRequired = true
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
        drawImage: function (context, image, x, y, scale)
        {
            if (!image) return; // image might be null when rendering a room that hasn't been fully loaded

            if (!scale) scale = 1;
            
            if (image instanceof RenderCache)
            {
                const renderedImage = image.getImage(globalScale * scale)
                
                context.drawImage(
                    renderedImage,
                    Math.round(x),
                    Math.round(y - renderedImage.height)
                );
            }
            else
            {
                context.drawImage(
                    image,
                    Math.round(x),
                    Math.round(y - image.height * globalScale * scale),
                    Math.round(image.width * globalScale * scale),
                    Math.round(image.height * globalScale * scale)
                );
            }
        },
        drawHorizontallyFlippedImage: function (context, image, x, y)
        {
            context.scale(-1, 1);
            this.drawImage(context, image, -x - image.width / 2, y);
            context.setTransform(1, 0, 0, 1, 0, 0); // clear transformation
        },
        drawCenteredText: function (context, text, x, y)
        {
            // const width = context.measureText(text).width
            context.font = "bold 13px Arial, Helvetica, sans-serif";
            context.textBaseline = "bottom";
            context.textAlign = "center";
            context.fillStyle = "blue";
            context.fillText(text, x, y);
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
        getCanvasOffset: function ()
        {
            if (this.currentRoom.needsFixedCamera)
                return { x: 0, y: 0 }

            const canvasOffset = {
                x: this.canvasOffset.x,
                y: this.canvasOffset.y
            };

            if (this.isDraggingCanvas)
            {
                canvasOffset.x += this.canvasDragOffset.x;
                canvasOffset.y += this.canvasDragOffset.y;
            }

            if (this.myUserID in this.users)
            {
                const user = this.users[this.myUserID]

                canvasOffset.x -= user.currentPhysicalPositionX - (this.canvasDimensions.w / 2 - BLOCK_WIDTH / 4);
                canvasOffset.y -= user.currentPhysicalPositionY - (this.canvasDimensions.h / 2 + BLOCK_HEIGHT / 2);
            }

            // Prevent going outside of the background picture borders
            // if (canvasOffset.x > 0) canvasOffset.x = 0;
            // if (canvasOffset.y > 0) canvasOffset.y = 0;
            // if (this.canvasDimensions.w < this.currentRoom.backgroundImage.width)
            //     if (canvasOffset.x < this.canvasDimensions.w - this.currentRoom.backgroundImage.width)
            //         canvasOffset.x = this.canvasDimensions.w - this.currentRoom.backgroundImage.width
            // if (this.canvasDimensions.h < this.currentRoom.backgroundImage.height)
            //     if (canvasOffset.y < this.canvasDimensions.h - this.currentRoom.backgroundImage.height)
            //         canvasOffset.y = this.canvasDimensions.h - this.currentRoom.backgroundImage.height

            return canvasOffset;
        },

        paintBackground: function (canvasOffset)
        {
            const context = this.canvasContext;

            context.fillStyle = this.currentRoom.backgroundColor;
            context.fillRect(0, 0, this.canvasDimensions.w, this.canvasDimensions.h);

            if (!this.currentRoom.backgroundOffset)
                this.currentRoom.backgroundOffset = { x: 0, y: 0 }
            this.drawImage(
                context,
                this.currentRoom.backgroundImage,
                0 + this.currentRoom.backgroundOffset.x + canvasOffset.x,
                this.canvasDimensions.h + this.currentRoom.backgroundOffset.y + canvasOffset.y,
                this.currentRoom.scale
            );
        },

        paintForeground: function (canvasOffset)
        {
            const context = this.canvasContext;

            const allObjects = this.currentRoom.objects
                .map(o => ({
                    o,
                    type: "room-object",
                    priority: o.x + 1 + (this.currentRoom.size.y - o.y),
                }))
                .concat(
                    Object.values(this.users).map(o => ({
                        o,
                        type: "user",
                        priority:
                            o.logicalPositionX +
                            1 +
                            (this.currentRoom.size.y - o.logicalPositionY),
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
                    let temporaryBodgeYOffset = 0;
                    if (o.o.offset)
                    {
                        if (!o.o.image || !this.currentRoom.backgroundImage) continue;
                        temporaryBodgeYOffset = (o.o.image.height * globalScale * (o.o.scale * this.currentRoom.scale)) + (this.canvasDimensions.h - this.currentRoom.backgroundImage.height * globalScale * this.currentRoom.scale);
                    }

                    this.drawImage(
                        context,
                        o.o.image,
                        o.o.physicalPositionX + canvasOffset.x,
                        o.o.physicalPositionY + canvasOffset.y + temporaryBodgeYOffset,
                        this.currentRoom.scale * o.o.scale
                    );
                } // o.type == "user"
                else
                {
                    if (!this.isLoadingRoom)
                    {
                        // draw users only when the room is fully loaded, so that the "physical position" calculations
                        // are done with the correct room's data.

                        let drawFunc;

                        switch (o.o.direction)
                        {
                            case "up": case "right": drawFunc = this.drawImage; break;
                            case "down": case "left": drawFunc = this.drawHorizontallyFlippedImage; break;
                        }

                        if (o.o.isInactive)
                            context.globalAlpha = 0.5

                        drawFunc(
                            context,
                            o.o.getCurrentImage(this.currentRoom),
                            o.o.currentPhysicalPositionX + canvasOffset.x,
                            o.o.currentPhysicalPositionY + canvasOffset.y
                        );

                        context.globalAlpha = 1
                    }
                }
            }

            // Draw usernames on top of everything else
            for (const o of allObjects.filter(o => o.type == "user"))
            {
                if (!this.isLoadingRoom)
                {
                    this.drawCenteredText(
                        context,
                        o.o.name,
                        (o.o.currentPhysicalPositionX + 40) + canvasOffset.x,
                        (o.o.currentPhysicalPositionY - 95) + canvasOffset.y
                    );
                }

                o.o.spendTime(this.currentRoom);
            }

            if (localStorage.getItem("enableGridNumbers") == "true")
            {
                context.font = "bold 13px Arial, Helvetica, sans-serif";
                context.textBaseline = "bottom";
                context.textAlign = "right";

                for (let x = 0; x < this.currentRoom.size.x; x++)
                    for (let y = 0; y < this.currentRoom.size.y; y++)
                    {
                        context.fillStyle = this.currentRoom.blocked.find(b => b.x == x && b.y == y)
                            ? "red"
                            : "blue";
                        const realCoord = calculateRealCoordinates(
                            this.currentRoom,
                            x,
                            y
                        );
                        context.fillText(
                            x + "," + y,
                            (realCoord.x + 40) + canvasOffset.x,
                            (realCoord.y - 20) + canvasOffset.y
                        );
                    }
            }
        },

        paint: function (timestamp)
        {

            try
            {
                if (this.forceUserInstantMove)
                {
                    this.forcePhysicalPositionRefresh();
                    this.forceUserInstantMove = false;
                }

                this.detectCanvasResize();

                const canvasOffset = this.getCanvasOffset();

                const usersRequiringRedraw = [];
                for (const [userId, user] of Object.entries(this.users))
                    if (user.checkIfRedrawRequired()) usersRequiringRedraw.push(userId);

                if (this.isRedrawRequired
                    || this.isDraggingCanvas
                    || usersRequiringRedraw.length)
                {
                    this.paintBackground(canvasOffset);
                    this.paintForeground(canvasOffset);
                    this.isRedrawRequired = false;
                }

                this.changeRoomIfSteppingOnDoor();
            } catch (err)
            {
                console.error(err);
            }

            requestAnimationFrame(this.paint);
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
                if (this.isDraggingCanvas)
                {
                    this.canvasOffset.x += this.canvasDragOffset.x;
                    this.canvasOffset.y += this.canvasDragOffset.y;

                    // if (this.canvasOffset.x > 0) this.canvasOffset.x = 0
                    // if (this.canvasOffset.y > 0) this.canvasOffset.y = 0

                    this.isDraggingCanvas = false;
                }
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
        handleCanvasKeydown: function (event)
        {
            switch (event.key)
            {
                case "ArrowLeft":
                    event.preventDefault()
                    this.sendNewPositionToServer("left");
                    break;
                case "ArrowRight":
                    event.preventDefault()
                    this.sendNewPositionToServer("right");
                    break;
                case "ArrowUp":
                    event.preventDefault()
                    this.sendNewPositionToServer("up");
                    break;
                case "ArrowDown":
                    event.preventDefault()
                    this.sendNewPositionToServer("down");
                    break;
            }
        },
        handleCanvasMousedown: function (event)
        {
            this.isCanvasMousedown = true;
            this.canvasDragStartPoint = { x: event.offsetX, y: event.offsetY };
            this.canvasDragOffset = { x: 0, y: 0 };
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
                this.canvasDragOffset.x = dragOffset.x
                this.canvasDragOffset.y = dragOffset.y;
            }
        },
        handleMessageInputKeydown: function (event)
        {
            if (event.key != "Enter") return;

            this.sendMessageToServer();
        },

        openRTCConnection: function ()
        {
            try
            {
                this.rtcPeer.open();
                if (this.rtcPeer.conn === null) return;
                this.rtcPeer.conn.addEventListener("iceconnectionstatechange", (ev) =>
                    this.handleIceConnectionStateChange(ev)
                );
            } catch (e)
            {
                console.error(e.message + " " + e.stack);
            }
        },

        handleIceConnectionStateChange: function (event)
        {
            try
            {
                if (this.rtcPeer.conn === null) return;
                const state = this.rtcPeer.conn.iceConnectionState;

                if (["failed", "disconnected", "closed"].includes(state))
                {
                    this.rtcPeer.close();
                }
            } catch (e)
            {
                console.error(e.message + " " + e.stack);
            }
        },

        emitRTCMessage: function (type, message)
        {
            try
            {
                this.socket.emit("user-rtc-" + type, message);
            } catch (e)
            {
                console.error(e.message + " " + e.stack);
            }
        },

        updateCurrentRoomStreams: function (streams)
        {
            this.streams = streams;

            this.iAmStreaming = false;
            this.streamSlotIdInWhichIWantToStream = null;

            for (const slotId in streams)
            {
                const stream = streams[slotId];
                if (stream.isActive)
                {
                    Vue.set(stream, "title", this.users[stream.userId].name);
                    if (stream.userId == this.myUserID)
                    {
                        this.iAmStreaming = true;
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
                        width: 320,
                        height: 240,
                        frameRate: {
                            ideal: 60,
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

                this.socket.emit("user-want-to-stream", {
                    streamSlotId: this.streamSlotIdInWhichIWantToStream,
                    withVideo: withVideo,
                    withSound: withSound,
                });
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
            this.openRTCConnection();

            this.mediaStream
                .getTracks()
                .forEach((track) =>
                    this.rtcPeer.conn.addTrack(track, this.mediaStream)
                );

            document.getElementById(
                "local-video-" + this.streamSlotIdInWhichIWantToStream
            ).srcObject = this.mediaStream;
        },
        stopStreaming: function ()
        {
            this.iAmStreaming = false;
            for (const track of this.mediaStream.getTracks()) track.stop();
            document.getElementById(
                "local-video-" + this.streamSlotIdInWhichIWantToStream
            ).srcObject = this.mediaStream = null;
            this.streamSlotIdInWhichIWantToStream = null;
            this.socket.emit("user-want-to-stop-stream");
        },
        wantToTakeStream: function (streamSlotId)
        {
            Vue.set(this.takenStreams, streamSlotId, true);
            this.openRTCConnection();

            this.rtcPeer.conn.addEventListener(
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
            this.socket.emit("user-want-to-drop-stream", streamSlotId);
        },
        rula: function (roomId)
        {
            if (!roomId) return;
            this.changeRoom(roomId);
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        closeRulaPopup: function ()
        {
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        openStreamPopup: function (streamSlotId)
        {
            this.streamSlotIdInWhichIWantToStream = streamSlotId;
            this.wantToStream = true;

            this.isStreamPopupOpen = true;
            this.streamMode = "video_sound";
            this.streamVoiceEnhancement = "on";
            this.streamEchoCancellation = true;
            this.streamNoiseSuppression = true;
            this.streamAutoGain = true;
        },
        closeStreamPopup: function ()
        {
            this.isStreamPopupOpen = false;
            this.wantToStream = false;
        },
        logout: async function ()
        {
            await postJson("/logout", { userID: this.myUserID });
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
