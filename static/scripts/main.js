//localStorage.debug = '*'; // socket.io debug
localStorage.removeItem("debug")

import Character from "./character.js";
import User from "./user.js";
import { loadImage, calculateRealCoordinates, globalScale, sleep, postJson } from "./utils.js";
import { messages } from "./lang.js";

const stunServers = [{
    urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302"
        //    "stun:stun2.l.google.com:19302",
        //    "stun:stun3.l.google.com:19302",
        //    "stun:stun4.l.google.com:19302"
    ]
}]

const iceConfig = {
    iceServers: stunServers
}

const i18n = new VueI18n({
    locale: localStorage.getItem("locale") || 'ja',
    fallbackLocale: 'ja',
    messages,
})

const vueApp = new Vue({
    i18n,
    el: '#vue-app',
    data: {
        gikoCharacter: new Character("giko"),
        socket: null,
        users: {},
        currentRoom: null,
        myUserID: null,
        isWaitingForServerResponseOnMovement: false,
        justSpawnedToThisRoom: true,
        isLoadingRoom: false,
        requestedRoomChange: false,
        forceUserInstantMove: false,
        webcamStream: null,
        streamSlotIdInWhichIWantToStream: null,
        isInfoboxVisible: localStorage.getItem("isInfoboxVisible") == "true",
        rtcPeerConnection: null,
        isSoundEnabled: localStorage.getItem("isSoundEnabled") == "true",

        // Possibly redundant data:
        username: "",
        roomid: "admin_st",
        serverStats: {
            userCount: 0
        },
        loggedIn: false,
        wantToStream: false,
        iAmStreaming: false,
        roomAllowsStreaming: false,
        currentStreamerName: "",
        connectionLost: false,
        steppingOnPortalToNonAvailableRoom: false,
        currentRoomStreamSlots: [],
        receivedVideoPlayers: [],
    },
    methods: {
        login: async function (ev)
        {
            ev.preventDefault()
            if (this.username === "")
                this.username = i18n.t('default_user_name')
            this.loggedIn = true
            await this.gikoCharacter.loadImages()
            this.registerKeybindings()
            await this.connectToServer(this.username)
            this.paint()
        },
        showWarningToast: function showWarningToast(text)
        {
            // TODO make this a nice, non-blocking message
            alert(text)
        },
        updateStreamSlots: async function ()
        {
            this.currentRoomStreamSlots = this.currentRoom.streams
        },
        connectToServer: async function (username)
        {
            const loginResponse = await postJson("/login", { userName: username })

            this.myUserID = await loginResponse.json()

            this.socket = io()

            this.socket.on("connect", () => 
            {
                this.connectionLost = false;
                this.socket.emit("user-connect", this.myUserID);
                // TODO, give the server a way to reply "sorry, can't reconnect you"
                // so we can show a decent error message
            });

            this.socket.on("disconnect", () =>
            {
                if (this.isSoundEnabled)
                    document.getElementById("connection-lost-sound").play()
                this.connectionLost = true;
            })
            this.socket.on("server-cant-log-you-in", () =>
            {
                this.connectionLost = true;
            })

            this.socket.on("server-update-current-room-state", async (roomDto, usersDto) =>
            {
                this.isLoadingRoom = true

                this.currentRoom = roomDto

                // HACK: i set isActive to false for all streams so that when server-update-current-room-streams
                // comes, the MediaSource gets initialized
                this.currentRoom.streams.forEach(s => s.isActive = false)

                this.roomid = this.currentRoom.id
                this.users = {}

                for (const u of usersDto)
                    this.addUser(u);

                loadImage(this.currentRoom.backgroundImageUrl).then(image =>
                {
                    this.currentRoom.backgroundImage = image
                })
                for (const o of this.currentRoom.objects)
                {
                    loadImage("rooms/" + this.currentRoom.id + "/" + o.url).then(image =>
                    {
                        o.image = image
                        const { x, y } = calculateRealCoordinates(this.currentRoom, o.x, o.y);
                        o.physicalPositionX = x + (o.xOffset || 0)
                        o.physicalPositionY = y + (o.yOffset || 0)
                    })
                }

                // Force update of user coordinates using the current room's logics (origin coordinates, etc)
                this.forcePhysicalPositionRefresh()

                document.getElementById("room-canvas").focus()
                this.justSpawnedToThisRoom = true
                this.isLoadingRoom = false
                this.requestedRoomChange = false

                // stream stuff
                this.roomAllowsStreaming = this.currentRoom.streams.length > 0

                this.updateStreamSlots()
            });

            this.socket.on("server-msg", (userName, msg) =>
            {
                const chatLog = document.getElementById("chatLog");
                if (userName != "SYSTEM" && this.isSoundEnabled)
                {
                    document.getElementById("message-sound").play()
                }

                chatLog.innerHTML += userName + ": " + msg + "<br/>";
                chatLog.scrollTop = chatLog.scrollHeight;
            });

            this.socket.on("server-stats", (serverStats) =>
            {
                this.serverStats = serverStats;
            });

            this.socket.on("server-move", (userId, x, y, direction, isInstant) =>
            {
                const user = this.users[userId];

                const oldX = user.logicalPositionX
                const oldY = user.logicalPositionY

                if (isInstant)
                    user.moveImmediatelyToPosition(this.currentRoom, x, y, direction)
                else
                    user.moveToPosition(x, y, direction)

                if (userId == this.myUserID)
                {
                    this.isWaitingForServerResponseOnMovement = false
                    if (oldX != x || oldY != y)
                        this.justSpawnedToThisRoom = false
                }
            });

            this.socket.on("server-reject-movement", () => this.isWaitingForServerResponseOnMovement = false)

            this.socket.on("server-user-joined-room", async (user) =>
            {
                if (this.isSoundEnabled)
                    document.getElementById("login-sound").play()
                this.addUser(user);
            });

            this.socket.on("server-user-left-room", (userId) =>
            {
                if (userId != this.myUserID)
                    delete this.users[userId];
            });

            this.socket.on("server-stream-data", (streamSlotId, arrayBuffer) =>
            {
                const slot = this.currentRoomStreamSlots[streamSlotId]

                if (!slot || !slot.mediaSource || slot.mediaSource.readyState != "open")
                    return
                slot.queue.push(arrayBuffer)
                if (!slot.isPlaying) slot.playFromQueue()
            })
            this.socket.on("server-not-ok-to-stream", (reason) =>
            {
                this.wantToStream = false
                this.showWarningToast(reason)
            })
            this.socket.on("server-ok-to-stream", () =>
            {
                this.wantToStream = false
                this.iAmStreaming = true
                this.startStreaming()
            })
            this.socket.on("server-update-current-room-streams", (streams) =>
            {
                const mimeType = 'video/webm;codecs="vp8,opus"'

                this.currentRoom.streams = streams.map((s, i) =>
                {
                    if (s.userId == this.myUserID)
                        return s

                    if (this.currentRoom.streams[i].isActive == s.isActive)
                        return this.currentRoom.streams[i]

                    s.isPlaying = false
                    s.mediaSource = new MediaSource()

                    if (s.initializationSegment)
                        s.queue = [s.initializationSegment]
                    else
                        s.queue = []

                    s.playFromQueue = () =>
                    {
                        if (!s.queue.length)
                        {
                            s.isPlaying = false
                            return
                        }
                        s.isPlaying = true
                        s.sourceBuffer.appendBuffer(s.queue.shift())
                    }

                    s.mediaSource.addEventListener("sourceopen", (e) =>
                    {
                        s.sourceBuffer = s.mediaSource.addSourceBuffer(mimeType);
                        s.sourceBuffer.addEventListener('updateend', () =>
                        {
                            s.playFromQueue()
                        });
                    })

                    s.src = URL.createObjectURL(s.mediaSource);

                    return s
                })

                this.updateStreamSlots()
            })

            this.socket.on("server-rtc-answer", async (answer) =>
            {
                if (this.rtcPeerConnection === null) return;
                await this.rtcPeerConnection.setRemoteDescription(answer)
            })
            this.socket.on("server-rtc-ice-candidate", async (candidate) =>
            {
                if (this.rtcPeerConnection === null) return;
                await this.rtcPeerConnection.addIceCandidate(candidate)
            })
            this.socket.on("server-ok-to-get-stream", async (candidate) =>
            {
                if (this.rtcPeerConnection === null) return;
                await this.negotiateRTCPeerConnection()
            })

            let version = Infinity

            const ping = async () =>
            {
                if (this.connectionLost)
                    return
                const response = await postJson("/ping/" + this.myUserID, { userId: this.myUserID })
                const { version: newVersion } = await response.json()
                // if (newVersion > version)
                // {
                //     // TODO refresh page while keeping username ,selected character and room
                //     showWarningToast("Sorry, a new version of gikopoi2 is ready, please refresh this page!")
                // }
                // else
                // {
                //     version = newVersion
                // }
            }

            setInterval(ping, 1000 * 60)
        },
        addUser: function (userDTO)
        {
            const newUser = new User(this.gikoCharacter, userDTO.name);
            newUser.moveImmediatelyToPosition(this.currentRoom, userDTO.position.x, userDTO.position.y, userDTO.direction);
            this.users[userDTO.id] = newUser;
        },
        drawImage: function (image, x, y, scale)
        {
            if (!image) return // image might be null when rendering a room that hasn't been fully loaded

            if (!scale)
                scale = 1

            const context = document.getElementById("room-canvas").getContext("2d");
            context.drawImage(image,
                x,
                y - image.height * globalScale * scale,
                image.width * globalScale * scale,
                image.height * globalScale * scale)
        },
        drawHorizontallyFlippedImage: function (image, x, y)
        {
            const context = document.getElementById("room-canvas").getContext("2d");
            context.scale(-1, 1)
            this.drawImage(image, - x - image.width / 2, y)
            context.setTransform(1, 0, 0, 1, 0, 0); // clear transformation
        },
        drawCenteredText: function (text, x, y)
        {
            const context = document.getElementById("room-canvas").getContext("2d");
            // const width = context.measureText(text).width
            context.font = "bold 13px Arial, Helvetica, sans-serif"
            context.textBaseline = "bottom"
            context.textAlign = "center"
            context.fillStyle = "blue"
            context.fillText(text, x, y)
        },
        // TODO: Refactor this entire function
        paint: function (timestamp)
        {
            if (this.forceUserInstantMove)
            {
                this.forcePhysicalPositionRefresh()
                this.forceUserInstantMove = false
            }

            const context = document.getElementById("room-canvas").getContext("2d");
            context.fillStyle = "#c0c0c0"
            context.fillRect(0, 0, 721, 511)

            if (this.currentRoom)
            {
                context.fillStyle = this.currentRoom.backgroundColor
                context.fillRect(0, 0, 721, 511)

                // draw background
                this.drawImage(this.currentRoom.backgroundImage, 0, 511, this.currentRoom.scale)

                const allObjects = this.currentRoom.objects.map(o => ({
                    o,
                    type: "room-object",
                    priority: o.x + 1 + (this.currentRoom.size.y - o.y)
                }))
                    .concat(Object.values(this.users).map(o => ({
                        o,
                        type: "user",
                        priority: o.logicalPositionX + 1 + (this.currentRoom.size.y - o.logicalPositionY)
                    })))
                    .sort((a, b) =>
                    {
                        if (a.priority < b.priority) return -1
                        if (a.priority > b.priority) return 1
                        return 0
                    })

                for (const o of allObjects)
                {
                    if (o.type == "room-object")
                    {
                        this.drawImage(o.o.image, o.o.physicalPositionX, o.o.physicalPositionY, this.currentRoom.scale * o.o.scale)
                    }
                    else // o.type == "user"
                    {
                        if (!this.isLoadingRoom)
                        {
                            // draw users only when the room is fully loaded, so that the "physical position" calculations
                            // are done with the correct room's data.
                            this.drawCenteredText(o.o.name.replace(/&gt;/g, ">").replace(/&lt;/g, "<"), o.o.currentPhysicalPositionX + 40, o.o.currentPhysicalPositionY - 95)

                            switch (o.o.direction)
                            {
                                case "up":
                                case "right":
                                    this.drawHorizontallyFlippedImage(o.o.getCurrentImage(this.currentRoom), o.o.currentPhysicalPositionX, o.o.currentPhysicalPositionY)
                                    break;
                                case "down":
                                case "left":
                                    this.drawImage(o.o.getCurrentImage(this.currentRoom), o.o.currentPhysicalPositionX, o.o.currentPhysicalPositionY)
                                    break;
                            }
                        }

                        o.o.spendTime(this.currentRoom)
                    }
                }
            }
            this.changeRoomIfSteppingOnDoor()

            requestAnimationFrame(this.paint)
        },
        changeRoomIfSteppingOnDoor: function ()
        {
            if (this.justSpawnedToThisRoom) return
            if (this.isWaitingForServerResponseOnMovement) return
            if (this.requestedRoomChange) return

            const currentUser = this.users[this.myUserID]

            if (currentUser.isWalking) return

            this.steppingOnPortalToNonAvailableRoom = false

            const door = this.currentRoom.doors.find(d =>
                d.x == currentUser.logicalPositionX &&
                d.y == currentUser.logicalPositionY)

            if (!door) return

            const { targetRoomId, targetX, targetY } = door

            if (targetRoomId == "NOT_READY_YET")
            {
                this.steppingOnPortalToNonAvailableRoom = true
                return
            }

            if (this.webcamStream)
                this.stopStreaming()

            this.requestedRoomChange = true
            this.socket.emit("user-change-room", { targetRoomId, targetX, targetY });
        },
        forcePhysicalPositionRefresh: function ()
        {
            for (const u of Object.values(this.users))
                u.moveImmediatelyToPosition(this.currentRoom, u.logicalPositionX, u.logicalPositionY, u.direction)
        },
        sendNewPositionToServer: function (direction)
        {
            if (this.isLoadingRoom || this.isWaitingForServerResponseOnMovement || this.users[this.myUserID].isWalking)
                return

            this.isWaitingForServerResponseOnMovement = true
            this.socket.emit("user-move", direction);
        },
        sendMessageToServer: function ()
        {
            const inputTextbox = document.getElementById("input-textbox")

            if (inputTextbox.value == "") return;
            this.socket.emit("user-msg", inputTextbox.value);
            inputTextbox.value = "";
        },
        registerKeybindings: function ()
        {
            window.addEventListener("focus", () => this.forceUserInstantMove = true);
        },
        toggleInfobox: function ()
        {
            localStorage.setItem("isInfoboxVisible", this.isInfoboxVisible = !this.isInfoboxVisible);
        },
        toggleSound: function ()
        {
            localStorage.setItem("isSoundEnabled", this.isSoundEnabled = !this.isSoundEnabled);
            console.log(localStorage.getItem("isSoundEnabled"))
        },
        switchLanguage: function ()
        {
            i18n.locale = (i18n.locale == "ja" ? "en" : "ja")
            localStorage.setItem("locale", i18n.locale)
        },
        handleCanvasKeydown: function (event)
        {
            switch (event.key)
            {
                case "ArrowLeft": this.sendNewPositionToServer("left"); break;
                case "ArrowRight": this.sendNewPositionToServer("right"); break;
                case "ArrowUp": this.sendNewPositionToServer("up"); break;
                case "ArrowDown": this.sendNewPositionToServer("down"); break;
            }
        },
        handleMessageInputKeydown: function (event)
        {
            if (event.key != "Enter") return
            this.sendMessageToServer()
        },


        openRTCPeerConnection: function ()
        {
            if (this.rtcPeerConnection !== null) return;

            this.rtcPeerConnection = new RTCPeerConnection(iceConfig);

            this.rtcPeerConnection.addEventListener('icecandidate', (event) =>
            {
                if (event.candidate && event.candidate.candidate)
                    this.socket.emit('user-rtc-ice-candidate', event.candidate)
            });
            this.rtcPeerConnection.addEventListener('iceconnectionstatechange',
                (event) => console.log('ICE state change event: ', this.rtcPeerConnection.iceConnectionState));
        },

        /*
            Used initially to start the ICE candidate comms and
            for informing the peers about track changes
        */
        negotiateRTCPeerConnection: async function ()
        {
            const offer = await this.rtcPeerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            })
            await this.rtcPeerConnection.setLocalDescription(offer);
            this.socket.emit('user-rtc-offer', offer)
        },

        closeRTCPeerConnection: function ()
        {
            if (this.rtcPeerConnection === null) return;
            this.rtcPeerConnection.close();
            this.rtcPeerConnection = null;
        },

        wantToStartStreaming: async function (streamSlotId)
        {
            try
            {
                const withVideo = true;
                const withSound = true;

                this.wantToStream = true
                this.streamSlotIdInWhichIWantToStream = streamSlotId

                let userMedia = {}
                if (withVideo) userMedia.audio = true;
                if (withSound) userMedia.video = {
                    width: 320,
                    height: 240,
                    frameRate: {
                        ideal: 60,
                        min: 10
                    }
                };

                this.webcamStream = await navigator.mediaDevices.getUserMedia(userMedia)

                this.socket.emit('user-want-to-stream', {
                    streamSlotId: streamSlotId,
                    withVideo: withVideo,
                    withSound: withSound
                })

            }
            catch (err)
            {
                this.showWarningToast("sorry, can't find a webcam")
                console.error(err)
                this.wantToStream = false
                this.webcamStream = false
            }
        },
        startStreaming: async function ()
        {
            this.openRTCPeerConnection()

            this.webcamStream.getTracks().forEach(track =>
                this.rtcPeerConnection.addTrack(track, this.webcamStream));

            this.negotiateRTCPeerConnection()

            document.getElementById(
                "local-video-" + this.streamSlotIdInWhichIWantToStream)
                .srcObject = this.webcamStream;
        },
        stopStreaming: function ()
        {
            this.iAmStreaming = false
            for (const track of this.webcamStream.getTracks())
                track.stop()
            document.getElementById("local-video-" + this.streamSlotIdInWhichIWantToStream).srcObject = this.webcamStream = null;
            this.streamSlotIdInWhichIWantToStream = null
            this.socket.emit("user-want-to-stop-stream")
        },
        wantToGetStream: function (streamSlotId)
        {
            this.openRTCPeerConnection()

            this.rtcPeerConnection.addEventListener('track', (event) =>
            {
                document.getElementById("received-video-" + streamSlotId).srcObject = event.streams[0];
            }, { once: true });

            this.socket.emit("user-want-to-get-stream", streamSlotId)
        },


        logout: async function ()
        {
            await postJson("/logout", { userID: this.myUserID })
        }
    }
})
