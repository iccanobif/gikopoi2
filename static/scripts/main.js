//localStorage.debug = '*'; // socket.io debug
localStorage.clear()

import Character from "./character.js";
import User from "./user.js";
import { loadImage, calculateRealCoordinates, scale, sleep, postJson } from "./utils.js";
import VideoChunkPlayer from "./video-chunk-player.js";

const gikopoi = function ()
{
    let socket = null;

    let users = {};
    let currentRoom = null;
    const gikoCharacter = new Character("giko")
    let myUserID = null;
    let isWaitingForServerResponseOnMovement = false
    let justSpawnedToThisRoom = true
    let isLoadingRoom = false
    let requestedRoomChange = false
    let forceUserInstantMove = false

    let receivedVideoPlayers = []

    async function connectToServer(username)
    {
        const loginResponse = await postJson("/login", { userName: username })

        myUserID = await loginResponse.json()

        socket = io()

        socket.on("connect", function ()
        {
            vueApp.connectionLost = false;
            socket.emit("user-connect", myUserID);
            // TODO, give the server a way to reply "sorry, can't reconnect you"
            // so we can show a decent error message
        });

        socket.on("disconnect", () =>
        {
            document.getElementById("connection-lost-sound").play()
            vueApp.connectionLost = true;
        })
        socket.on("server-cant-log-you-in", () =>
        {
            vueApp.connectionLost = true;
        })

        socket.on("server-update-current-room-state", async function (roomDto, usersDto)
        {
            isLoadingRoom = true

            currentRoom = roomDto
            users = {}

            for (const u of usersDto)
                addUser(u);

            currentRoom.backgroundImage = await loadImage(currentRoom.backgroundImageUrl)
            for (const o of currentRoom.objects)
            {
                o.image = await loadImage("rooms/" + currentRoom.id + "/" + o.url)
                const { x, y } = calculateRealCoordinates(currentRoom, o.x, o.y);
                o.physicalPositionX = x
                o.physicalPositionY = y
            }

            // Force update of user coordinates using the current room's logics (origin coordinates, etc)
            forcePhysicalPositionRefresh()

            document.getElementById("room-canvas").focus()
            justSpawnedToThisRoom = true
            isLoadingRoom = false
            requestedRoomChange = false

            // stream stuff
            console.log(currentRoom)
            vueApp.currentRoomStreamSlots = currentRoom.streams

            await sleep(0) // Allow vue.js to render the received-video-* containers

            receivedVideoPlayers = currentRoom.streams.map((s, i) => new VideoChunkPlayer(document.getElementById("received-video-" + i)))
        });

        socket.on("server-msg", function (userName, msg)
        {
            const chatLog = document.getElementById("chatLog");
            if (userName != "SYSTEM")
                document.getElementById("message-sound").play()

            chatLog.innerHTML += userName + ": " + msg + "<br/>";
            chatLog.scrollTop = chatLog.scrollHeight;
        });

        socket.on("server-move", function (userId, x, y, direction, isInstant)
        {
            const user = users[userId];

            const oldX = user.logicalPositionX
            const oldY = user.logicalPositionY

            if (isInstant)
                user.moveImmediatelyToPosition(currentRoom, x, y, direction)
            else
                user.moveToPosition(x, y, direction)

            if (userId == myUserID)
            {
                isWaitingForServerResponseOnMovement = false
                if (oldX != x || oldY != y)
                    justSpawnedToThisRoom = false
            }
        });

        socket.on("server-reject-movement", () => isWaitingForServerResponseOnMovement = false)

        socket.on("server-user-joined-room", async function (user)
        {
            document.getElementById("login-sound").play()
            addUser(user);
        });

        socket.on("server-user-left-room", function (userId)
        {
            if (userId != myUserID)
                delete users[userId];
        });



        socket.on("server-stream-data", function (streamSlotId, data)
        {
            receivedVideoPlayers[streamSlotId].playChunk(data)
        })
        socket.on("server-not-ok-to-stream", (reason) =>
        {
            vueApp.wantToStream = false
            showWarningToast(reason)
        })
        socket.on("server-ok-to-stream", () =>
        {
            vueApp.wantToStream = false
            vueApp.iAmStreaming = true
            startStreaming()
        })
        socket.on("server-update-current-room-streams", (streams) =>
        {
            vueApp.currentRoomStreamSlots = currentRoom.streams = streams
        })

        let version = Infinity

        async function ping()
        {
            if (vueApp.connectionLost)
                return
            const response = await postJson("/ping/" + myUserID, { userId: myUserID })
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
    }

    function addUser(userDTO)
    {
        const newUser = new User(gikoCharacter, userDTO.name);
        newUser.moveImmediatelyToPosition(currentRoom, userDTO.position.x, userDTO.position.y, userDTO.direction);
        users[userDTO.id] = newUser;
    }

    function drawImage(image, x, y, roomScale)
    {
        if (!image) return // image might be null when rendering a room that hasn't been fully loaded

        if (!roomScale)
            roomScale = 1

        const context = document.getElementById("room-canvas").getContext("2d");
        context.drawImage(image,
            x,
            y - image.height * scale * roomScale,
            image.width * scale * roomScale,
            image.height * scale * roomScale)
    }

    function drawHorizontallyFlippedImage(image, x, y)
    {
        const context = document.getElementById("room-canvas").getContext("2d");
        context.scale(-1, 1)
        drawImage(image, - x - image.width / 2, y)
        context.setTransform(1, 0, 0, 1, 0, 0); // clear transformation
    }

    function drawCenteredText(text, x, y)
    {
        const context = document.getElementById("room-canvas").getContext("2d");
        // const width = context.measureText(text).width
        context.font = "bold 13px Arial, Helvetica, sans-serif"
        context.textBaseline = "bottom"
        context.textAlign = "center"
        context.fillStyle = "blue"
        context.fillText(text, x, y)
    }

    // TODO: Refactor this entire function
    async function paint(timestamp)
    {
        if (forceUserInstantMove)
        {
            forcePhysicalPositionRefresh()
            forceUserInstantMove = false
        }

        const context = document.getElementById("room-canvas").getContext("2d");
        context.fillStyle = "#c0c0c0"
        context.fillRect(0, 0, 721, 511)

        if (currentRoom)
        {
            // draw background
            drawImage(currentRoom.backgroundImage, 0, 511, currentRoom.scale)

            const allObjects = currentRoom.objects.map(o => ({
                o,
                type: "room-object",
                priority: o.x + 1 + (currentRoom.grid[1] - o.y)
            }))
                .concat(Object.values(users).map(o => ({
                    o,
                    type: "user",
                    priority: o.logicalPositionX + 1 + (currentRoom.grid[1] - o.logicalPositionY)
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
                    drawImage(o.o.image, o.o.physicalPositionX, o.o.physicalPositionY, currentRoom.scale)
                }
                else // o.type == "user"
                {
                    if (!isLoadingRoom)
                    {
                        // draw users only when the room is fully loaded, so that the "physical position" calculations
                        // are done with the correct room's data.
                        drawCenteredText(o.o.name.replace(/&gt;/g, ">").replace(/&lt;/g, "<"), o.o.currentPhysicalPositionX + 40, o.o.currentPhysicalPositionY - 95)

                        switch (o.o.direction)
                        {
                            case "up":
                            case "right":
                                drawHorizontallyFlippedImage(o.o.getCurrentImage(currentRoom), o.o.currentPhysicalPositionX, o.o.currentPhysicalPositionY)
                                break;
                            case "down":
                            case "left":
                                drawImage(o.o.getCurrentImage(currentRoom), o.o.currentPhysicalPositionX, o.o.currentPhysicalPositionY)
                                break;
                        }
                    }

                    o.o.spendTime(currentRoom)
                }
            }
        }
        changeRoomIfSteppingOnDoor()

        requestAnimationFrame(paint)
    }

    function changeRoomIfSteppingOnDoor()
    {
        if (justSpawnedToThisRoom) return
        if (isWaitingForServerResponseOnMovement) return
        if (requestedRoomChange) return

        const currentUser = users[myUserID]

        if (currentUser.isWalking) return

        vueApp.steppingOnPortalToNonAvailableRoom = false

        const door = currentRoom.doors.find(d =>
            d.x == currentUser.logicalPositionX &&
            d.y == currentUser.logicalPositionY)

        if (!door) return

        const { targetRoomId, targetX, targetY } = door

        if (targetRoomId == "NOT_READY_YET")
        {
            vueApp.steppingOnPortalToNonAvailableRoom = true
            return
        }

        if (webcamStream)
            stopStreaming()

        requestedRoomChange = true
        socket.emit("user-change-room", { targetRoomId, targetX, targetY });
    }

    function forcePhysicalPositionRefresh()
    {
        for (const u of Object.values(users))
            u.moveImmediatelyToPosition(currentRoom, u.logicalPositionX, u.logicalPositionY, u.direction)
    }

    function sendNewPositionToServer(direction)
    {
        if (isLoadingRoom || isWaitingForServerResponseOnMovement || users[myUserID].isWalking)
            return

        isWaitingForServerResponseOnMovement = true
        socket.emit("user-move", direction);
    }

    function sendMessageToServer()
    {
        const inputTextbox = document.getElementById("input-textbox")

        if (inputTextbox.value == "") return;
        socket.emit("user-msg", inputTextbox.value);
        inputTextbox.value = "";
    }

    function registerKeybindings()
    {
        function onKeyDown(event)
        {
            switch (event.key)
            {
                case "ArrowLeft": sendNewPositionToServer("left"); break;
                case "ArrowRight": sendNewPositionToServer("right"); break;
                case "ArrowUp": sendNewPositionToServer("up"); break;
                case "ArrowDown": sendNewPositionToServer("down"); break;
            }
        }

        const canvas = document.getElementById("room-canvas")

        canvas.addEventListener("keydown", onKeyDown);

        const inputTextbox = document.getElementById("input-textbox")

        inputTextbox.addEventListener("keydown", (event) =>
        {
            if (event.key != "Enter") return
            sendMessageToServer()
        })

        document.getElementById("send-button").addEventListener("click", () => sendMessageToServer())

        document.getElementById("btn-move-left").addEventListener("click", () => sendNewPositionToServer("left"))
        document.getElementById("btn-move-up").addEventListener("click", () => sendNewPositionToServer("up"))
        document.getElementById("btn-move-down").addEventListener("click", () => sendNewPositionToServer("down"))
        document.getElementById("btn-move-right").addEventListener("click", () => sendNewPositionToServer("right"))

        window.addEventListener("focus", () =>
        {
            forceUserInstantMove = true
        });
    }

    // WebRTC

    let webcamStream = null;

    async function startStreaming()
    {
        document.getElementById("local-video").srcObject = webcamStream;
        document.getElementById("local-video").style.display = "block";

        const recorder = new RecordRTCPromisesHandler(webcamStream, { type: "video" })
        while (webcamStream)
        {
            recorder.startRecording()
            await sleep(1000);
            await recorder.stopRecording();
            let blob = await recorder.getBlob();
            if (webcamStream)
            {
                socket.emit("user-stream-data", blob);
            }
        }
    }

    function stopStreaming()
    {
        vueApp.iAmStreaming = false
        vueApp.streamSlotIdInWhichIWantToStream = null
        for (const track of webcamStream.getTracks())
            track.stop()
        document.getElementById("local-video").srcObject = webcamStream = null;
        document.getElementById("local-video").style.display = "none"
        socket.emit("user-want-to-stop-stream")
    }

    async function logout()
    {
        await postJson("/logout", { userID: myUserID })
    }

    return {
        login: async function (username)
        {
            await gikoCharacter.loadImages()
            // await loadRoom("admin_st")
            registerKeybindings()
            await connectToServer(username)
            paint()
        },
        wantToStartStreaming: async function wantToStartStreaming(streamSlotId)
        {
            try
            {
                vueApp.wantToStream = true
                vueApp.streamSlotIdInWhichIWantToStream = streamSlotId
                webcamStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: { aspectRatio: { ideal: 1.333333 } }
                })

                socket.emit("user-want-to-stream", {
                    streamSlotId: streamSlotId,
                    withVideo: true,
                    withSound: true,
                })
            }
            catch (err)
            {
                showWarningToast("sorry, can't find a webcam")
                vueApp.wantToStream = false
                webcamStream = false
            }
        },
        stopStreaming: function () {
            stopStreaming()
        }
    }
}();

function showWarningToast(text)
{
    // TODO make this a nice, non-blocking message
    alert(text)
}

const vueApp = new Vue({
    el: '#vue-app',
    data: {
        username: "",
        loggedIn: false,
        wantToStream: false,
        iAmStreaming: false,
        connectionLost: false,
        steppingOnPortalToNonAvailableRoom: false,
        currentRoomStreamSlots: [],
        streamSlotIdInWhichIWantToStream: null,
    },
    methods: {
        login: function (ev)
        {
            ev.preventDefault()
            if (this.username === "")
                this.username = "名無しさん"
            this.loggedIn = true
            gikopoi.login(this.username).catch(console.error)
        },
        wantToStartStreaming: function (streamSlotID)
        {
            gikopoi.wantToStartStreaming(streamSlotID)
        },
        stopStreaming: function ()
        {
            gikopoi.stopStreaming()
        }
    }
})

