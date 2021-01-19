//localStorage.debug = '*'; // socket.io debug
localStorage.removeItem("debug");

import { characters } from "./character.js";
import User from "./user.js";
import { loadImage, calculateRealCoordinates, globalScale, postJson, BLOCK_WIDTH, BLOCK_HEIGHT } from "./utils.js";
import { messages } from "./lang.js";
import { RTCPeer, defaultIceConfig } from "./rtcpeer.js";

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
        webcamStream: null,
        streamSlotIdInWhichIWantToStream: null,
        isInfoboxVisible: localStorage.getItem("isInfoboxVisible") == "true",
        rtcPeer: null,
        takenStreams: [],
        isSoundEnabled: localStorage.getItem("isSoundEnabled") == "true",
        isRulaPopupOpen: false,
        characterId: "giko",
        isLoggingIn: false,
        streams: [],
        areaId: "gen", // 'gen' or 'for'
        roomList: [],
        rulaRoomSelection: null,

        isRedrawRequired: false,
        isDraggingCanvas: false,
        canvasDragStartPoint: null,
        canvasDragOffset: null,
        canvasOffset: { x: 0, y: 0 },
        canvasDimensions: { w: 0, h: 0 },

        // Possibly redundant data:
        username: "",
        roomid: "admin_st",
        serverStats: {
            userCount: 0,
        },
        loggedIn: false,
        wantToStream: false,
        iAmStreaming: false,
        currentStreamerName: "",
        connectionLost: false,
        steppingOnPortalToNonAvailableRoom: false,
    },
    methods: {
        login: async function (ev)
        {
            ev.preventDefault();
            this.isLoggingIn = true;

            await Promise.all([
                characters.giko.loadImages(),
                characters.naito.loadImages(),
                characters.funkynaito.loadImages(),
                characters.furoshiki.loadImages(),
                characters.naitoapple.loadImages(),
            ]);
            if (this.username === "") this.username = i18n.t("default_user_name");

            if (this.characterId === "naito")
            {
                const die = Math.random()
                console.log(die)
                if (die < 0.25)
                    this.characterId = "funkynaito"
            }

            this.loggedIn = true;
            this.selectedCharacter = characters[this.characterId];
            this.registerKeybindings();
            await this.connectToServer(this.username);
            this.isLoggingIn = false;
            this.paint();
        },
        setLanguage: function (code)
        {
            i18n.locale = code;
        },
        showWarningToast: function showWarningToast(text)
        {
            // TODO make this a nice, non-blocking message
            alert(text);
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
                this.currentRoom.backgroundImage = image;
                this.isRedrawRequired = true;
            });
            for (const o of this.currentRoom.objects)
            {
                loadImage("rooms/" + this.currentRoom.id + "/" + o.url).then(
                    (image) =>
                    {
                        if (this.roomLoadId != roomLoadId) return;
                        o.image = image;
                        const { x, y } = calculateRealCoordinates(
                            this.currentRoom,
                            o.x,
                            o.y
                        );
                        o.physicalPositionX = x + (o.xOffset || 0);
                        o.physicalPositionY = y + (o.yOffset || 0);
                        this.isRedrawRequired = true;
                    }
                );
            }

            // stream stuff
            this.takenStreams = streamsDto.map(() => false);
            this.streams = streamsDto;
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

            this.socket = io();

            const sendIdToServer = () =>
            {
                // it can happen that the user is pressing the arrow keys while the
                // socket is down, in which case the server will never answer to the
                // user-move event, and isWaitingForServerResponseOnMovement would never
                // be reset. So, just in case, I reset it at every socket reconnection.
                this.isWaitingForServerResponseOnMovement = false

                console.log("sending user-connect")
                this.connectionLost = false;
                this.socket.emit("user-connect", this.myUserID);

                this.rtcPeer = new RTCPeer(defaultIceConfig, (type, msg) =>
                    this.emitRTCMessage(type, msg)
                );
            }

            this.socket.on("connect", sendIdToServer);
            this.socket.on("reconnect", sendIdToServer);

            this.socket.on("disconnect", () =>
            {
                if (this.isSoundEnabled)
                    document.getElementById("connection-lost-sound").play();
                this.connectionLost = true;
            });
            this.socket.on("server-cant-log-you-in", () =>
            {
                this.connectionLost = true;
            });

            this.socket.on("server-update-current-room-state",
                (dto) => this.updateRoomState(dto)
            );

            this.socket.on("server-msg", (userName, msg) =>
            {
                const chatLog = document.getElementById("chatLog");
                if (this.isSoundEnabled)
                {
                    document.getElementById("message-sound").play();
                }

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
            });

            this.socket.on("server-stats", (serverStats) =>
            {
                this.serverStats = serverStats;
            });

            this.socket.on("server-move", (userId, x, y, direction, isInstant) =>
            {
                const user = this.users[userId];

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
                if (this.isSoundEnabled) document.getElementById("login-sound").play();
                this.addUser(user);
                this.isRedrawRequired = true;
            });

            this.socket.on("server-user-left-room", (userId) =>
            {
                if (userId != this.myUserID) delete this.users[userId];
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
                this.streams = streams;
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

            let version = Infinity;

            const ping = async () =>
            {
                if (this.connectionLost) return;
                const response = await postJson("/ping/" + this.myUserID, {
                    userId: this.myUserID,
                });
                const { version: newVersion } = await response.json();
                // if (newVersion > version)
                // {
                //     // TODO refresh page while keeping username ,selected character and room
                //     showWarningToast("Sorry, a new version of gikopoi2 is ready, please refresh this page!")
                // }
                // else
                // {
                //     version = newVersion
                // }
            };

            setInterval(ping, 1000 * 60);
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
            this.users[userDTO.id] = newUser;
        },
        drawImage: function (image, x, y, scale)
        {
            if (!image) return; // image might be null when rendering a room that hasn't been fully loaded

            if (!scale) scale = 1;

            const context = document.getElementById("room-canvas").getContext("2d");
            context.drawImage(
                image,
                x,
                y - image.height * globalScale * scale,
                image.width * globalScale * scale,
                image.height * globalScale * scale
            );
        },
        drawHorizontallyFlippedImage: function (image, x, y)
        {
            const context = document.getElementById("room-canvas").getContext("2d");
            context.scale(-1, 1);
            this.drawImage(image, -x - image.width / 2, y);
            context.setTransform(1, 0, 0, 1, 0, 0); // clear transformation
        },
        drawCenteredText: function (text, x, y)
        {
            const context = document.getElementById("room-canvas").getContext("2d");
            // const width = context.measureText(text).width
            context.font = "bold 13px Arial, Helvetica, sans-serif";
            context.textBaseline = "bottom";
            context.textAlign = "center";
            context.fillStyle = "blue";
            context.fillText(text, x, y);
        },
        detectCanvasResize: function (canvasElement, context)
        {
            if (this.canvasDimensions.w != canvasElement.offsetWidth ||
                this.canvasDimensions.h != canvasElement.offsetHeight)
            {
                this.canvasDimensions.w = canvasElement.offsetWidth;
                this.canvasDimensions.h = canvasElement.offsetHeight;

                context.canvas.width = this.canvasDimensions.w;
                context.canvas.height = this.canvasDimensions.h;
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

            return canvasOffset;
        },

        // TODO: Refactor this entire function
        paint: function (timestamp)
        {

            try
            {
                if (this.forceUserInstantMove)
                {
                    this.forcePhysicalPositionRefresh();
                    this.forceUserInstantMove = false;
                }


                const canvasElement = document.getElementById("room-canvas");
                const context = canvasElement.getContext("2d");

                this.detectCanvasResize(canvasElement, context);



                let isRedrawRequired = this.isRedrawRequired
                    || this.isDraggingCanvas
                    || Object.values(this.users).find(u => u.checkIfRedrawRequired());

                if (!isRedrawRequired)
                {
                    requestAnimationFrame(this.paint);
                    return;
                }

                this.isRedrawRequired = false;

                context.fillStyle = this.currentRoom.backgroundColor;
                context.fillRect(0, 0, this.canvasDimensions.w, this.canvasDimensions.h);
                
                const canvasOffset = this.getCanvasOffset();

                // draw background
                if (!this.currentRoom.backgroundOffset)
                    this.currentRoom.backgroundOffset = { x: 0, y: 0 }
                this.drawImage(
                    this.currentRoom.backgroundImage,
                    0 + this.currentRoom.backgroundOffset.x + canvasOffset.x,
                    this.canvasDimensions.h + this.currentRoom.backgroundOffset.y + canvasOffset.y,
                    this.currentRoom.scale
                );

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
                        this.drawImage(
                            o.o.image,
                            o.o.physicalPositionX + canvasOffset.x,
                            o.o.physicalPositionY + canvasOffset.y,
                            this.currentRoom.scale * o.o.scale
                        );
                    } // o.type == "user"
                    else
                    {
                        if (!this.isLoadingRoom)
                        {
                            // draw users only when the room is fully loaded, so that the "physical position" calculations
                            // are done with the correct room's data.
                            this.drawCenteredText(
                                o.o.name,
                                (o.o.currentPhysicalPositionX + 40) + canvasOffset.x,
                                (o.o.currentPhysicalPositionY - 95) + canvasOffset.y
                            );

                            let drawFunc;

                            switch (o.o.direction)
                            {
                                case "up": case "right":
                                    drawFunc = o.o.character.leftFacing ? this.drawHorizontallyFlippedImage : this.drawImage
                                    break;
                                case "down": case "left":
                                    drawFunc = o.o.character.leftFacing ? this.drawImage : this.drawHorizontallyFlippedImage
                                    break;
                            }

                            drawFunc(
                                o.o.getCurrentImage(this.currentRoom),
                                o.o.currentPhysicalPositionX + canvasOffset.x,
                                o.o.currentPhysicalPositionY + canvasOffset.y
                            );
                        }

                        o.o.spendTime(this.currentRoom);
                    }
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
                                realCoord.x + 40,
                                realCoord.y - 20
                            );
                        }
                }
                this.changeRoomIfSteppingOnDoor();
            } catch (err)
            {
                console.log(err);
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
            if (this.webcamStream) this.stopStreaming();

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
        toggleSound: function ()
        {
            localStorage.setItem(
                "isSoundEnabled",
                (this.isSoundEnabled = !this.isSoundEnabled)
            );
            console.log(localStorage.getItem("isSoundEnabled"));
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
            for (const slotId in streams)
            {
                const stream = streams[slotId];
                if (stream.isActive)
                    Vue.set(stream, "title", this.users[stream.userId].name);
                else Vue.set(stream, "title", "OFF");
                if (!stream.isActive || !stream.isReady)
                    Vue.set(this.takenStreams, slotId, false);
            }
        },

        wantToStartStreaming: async function (streamSlotId, withVideo, withSound)
        {
            try
            {
                this.wantToStream = true;
                this.streamSlotIdInWhichIWantToStream = streamSlotId;

                let userMedia = {};
                if (withVideo)
                    userMedia.video = {
                        width: 320,
                        height: 240,
                        frameRate: {
                            ideal: 60,
                            min: 10,
                        },
                    };
                if (withSound) userMedia.audio = true;

                this.webcamStream = await navigator.mediaDevices.getUserMedia(
                    userMedia
                );

                this.socket.emit("user-want-to-stream", {
                    streamSlotId: streamSlotId,
                    withVideo: withVideo,
                    withSound: withSound,
                });
            } catch (err)
            {
                this.showWarningToast("sorry, can't find a webcam");
                console.error(err);
                this.wantToStream = false;
                this.webcamStream = false;
            }
        },
        startStreaming: async function ()
        {
            this.openRTCConnection();

            this.webcamStream
                .getTracks()
                .forEach((track) =>
                    this.rtcPeer.conn.addTrack(track, this.webcamStream)
                );

            document.getElementById(
                "local-video-" + this.streamSlotIdInWhichIWantToStream
            ).srcObject = this.webcamStream;
        },
        stopStreaming: function ()
        {
            this.iAmStreaming = false;
            for (const track of this.webcamStream.getTracks()) track.stop();
            document.getElementById(
                "local-video-" + this.streamSlotIdInWhichIWantToStream
            ).srcObject = this.webcamStream = null;
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
        cancelRula: function ()
        {
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        logout: async function ()
        {
            await postJson("/logout", { userID: this.myUserID });
        },
        changeVolume: function (streamSlotId)
        {
            const volumeSlider = document.getElementById("volume-" + streamSlotId);

            const videoElement = document.getElementById(
                "received-video-" + streamSlotId
            );

            videoElement.volume = volumeSlider.value;
        },
        requestRoomList: function ()
        {
            this.socket.emit("user-room-list");
        },
        selectRoomForRula: function (roomId)
        {
            this.rulaRoomSelection = roomId;
        }
    },
});
