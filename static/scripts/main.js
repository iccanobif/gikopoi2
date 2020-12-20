//localStorage.debug = '*'; // socket.io debug
localStorage.clear()

import Character from "./character.js";
import User from "./user.js";
import { loadImage, calculateRealCoordinates, scale, sleep, postJson } from "./utils.js";
import VideoChunkPlayer from "./video-chunk-player.js";

const gikopoi = function ()
{
    const STOP_STREAM = "STOP_STREAM"

    let socket = null;

    const queryString = new URLSearchParams(window.location.search);

    let users = {};
    let currentRoom = null;
    const gikoCharacter = new Character("giko")
    let myUserID = null;
    let isWaitingForServerResponseOnMovement = false
    let justSpawnedToThisRoom = true

    async function connectToServer(username)
    {
        const loginResponse = await postJson("/login", { userName: username })

        myUserID = await loginResponse.json()

        socket = io()

        socket.on("connect", function ()
        {
            socket.emit("user_connect", myUserID);
        });

        socket.on("server_update_current_room_users", async function (dto)
        {
            users = {}
            for (const u in dto.users)
                addUser(dto.users[u]);
        });

        socket.on("server_msg", function (userName, msg)
        {
            const chatLog = document.getElementById("chatLog");
            console.log(userName)
            if (userName != "SYSTEM")
                document.getElementById("message-sound").play()

            chatLog.innerHTML += userName + ": " + msg + "<br/>";
            chatLog.scrollTop = chatLog.scrollHeight;
        });

        socket.on("server_move", function (userId, x, y, direction, isInstant)
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

        socket.on("server_reject_movement", () => isWaitingForServerResponseOnMovement = false)

        socket.on("server_user_joined_room", async function (user)
        {
            document.getElementById("login-sound").play()

            if (user.id == myUserID)
            {
                await loadRoom(user.roomId)
                users[myUserID].moveImmediatelyToPosition(currentRoom, user.position.x, user.position.y, user.direction)
            }
            else
            {
                addUser(user);
            }
        });

        socket.on("server_user_left_room", function (userId)
        {
            if (userId != myUserID)
                delete users[userId];
        });

        const receivedVideoPlayer = new VideoChunkPlayer(document.getElementById("received-video-1"))

        socket.on("server_stream_data", function (data)
        {
            if (data == STOP_STREAM)
            {
                receivedVideoPlayer.stop()
            }
            else 
            {
                receivedVideoPlayer.playChunk(data)
            }
        })

        let version = Infinity

        async function ping()
        {
            const response = await postJson("/ping/" + myUserID, { userId: myUserID })
            const { version: newVersion } = await response.json()
            if (newVersion > version)
            {
                // TODO refresh page while keeping username ,selected character and room
            }
            else
            {
                version = newVersion
            }
        }

        setInterval(ping, 1000 * 10)
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
        const context = document.getElementById("room-canvas").getContext("2d");
        context.fillStyle = "#c0c0c0"
        context.fillRect(0, 0, 721, 511)
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
                drawCenteredText(o.o.name, o.o.currentPhysicalPositionX + 40, o.o.currentPhysicalPositionY - 95)

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

                o.o.spendTime(currentRoom)
            }
        }
        changeRoomIfSteppingOnDoor()

        requestAnimationFrame(paint)
    }

    async function changeRoomIfSteppingOnDoor()
    {
        if (justSpawnedToThisRoom)
            return

        const currentUser = users[myUserID]

        if (currentUser.isWalking)
            return

        const door = currentRoom.doors.find(d =>
            d.x == currentUser.logicalPositionX &&
            d.y == currentUser.logicalPositionY)

        if (!door)
            return

        const { targetRoomId, targetX, targetY } = door

        socket.emit("user_change_room", { targetRoomId, targetX, targetY });
    }

    async function loadRoom(roomName)
    {
        justSpawnedToThisRoom = true
        currentRoom = await (await fetch("/rooms/" + roomName)).json()
        console.log("currentRoom updated")

        currentRoom.backgroundImage = await loadImage("rooms/" + roomName + "/background.png")
        for (const o of currentRoom.objects)
        {
            o.image = await loadImage("rooms/" + roomName + "/" + o.url)
            const { x, y } = calculateRealCoordinates(currentRoom, o.x, o.y);
            o.physicalPositionX = x
            o.physicalPositionY = y
        }

        // Force update of user coordinates using the current room's logics (origin coordinates, etc)

        for (const u of Object.values(users))
            u.moveImmediatelyToPosition(currentRoom, u.logicalPositionX, u.logicalPositionY, u.direction)

        document.getElementById("room-canvas").focus()
    }

    function sendNewPositionToServer(direction)
    {
        if (isWaitingForServerResponseOnMovement || users[myUserID].isWalking)
            return

        isWaitingForServerResponseOnMovement = true
        socket.emit("user_move", direction);
    }

    function sendMessageToServer()
    {
        const inputTextbox = document.getElementById("textBox")

        if (inputTextbox.value == "") return;
        socket.emit("user_msg", inputTextbox.value);
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

        const inputTextbox = document.getElementById("textBox")

        inputTextbox.addEventListener("keydown", (event) =>
        {
            if (event.key != "Enter") return
            sendMessageToServer()
        })

        document.getElementById("send-button").addEventListener("click", () => sendMessageToServer())
        document.getElementById("start-streaming-button").addEventListener("click", () => startStreaming())
        document.getElementById("stop-streaming-button").addEventListener("click", () => stopStreaming())
        // document.getElementById("logout").addEventListener("click", () => logout())
    }

    // WebRTC

    let webcamStream = null;

    async function startStreaming()
    {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { aspectRatio: { ideal: 1.333333 } }
        });
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
                socket.emit("user_stream_data", blob);
            }
        }
    }

    function stopStreaming()
    {
        for (const track of webcamStream.getTracks())
            track.stop()
        document.getElementById("local-video").srcObject = webcamStream = null;
        document.getElementById("local-video").style.display = "none"
        socket.emit("user_stream_data", STOP_STREAM)
    }

    async function logout()
    {
        await postJson("/logout", { userID: myUserID })
    }

    return {
        login: async function (username)
        {
            await gikoCharacter.loadImages()
            await loadRoom("bar")
            registerKeybindings()
            await connectToServer(username)
            paint()
        }
    }
}();

const app = new Vue({
    el: '#vue-app',
    data: {
        username: "",
        loggedIn: false,
    },
    methods: {
        login: function (ev)
        {
            ev.preventDefault()
            if (this.username === "")
                alert("Please write a username")
            else
            {
                this.loggedIn = true
                gikopoi.login(this.username).catch(console.error)
            }
        }
    }
})

