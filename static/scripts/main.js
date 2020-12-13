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

    const users = {};
    let currentRoom = null;
    const gikoCharacter = new Character("giko")
    let myUserID = null;
    let isWaitingForServerResponseOnMovement = false

    async function connectToServer(username)
    {
        const loginResponse = await postJson("/login", { userName: username })

        myUserID = await loginResponse.json()

        socket = io()

        socket.on("connect", function ()
        {
            socket.emit("user_connect", myUserID);
        });

        socket.on("server_connection_complete", async function (dto)
        {
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

        socket.on("server_move", function (userId, x, y, direction)
        {
            const user = users[userId];
            user.moveToPosition(x, y, direction)

            if (userId == myUserID)
                isWaitingForServerResponseOnMovement = false
        });

        socket.on("server_reject_movement", () => isWaitingForServerResponseOnMovement = false)

        socket.on("server_new_direction", function (userId, direction)
        {
            const user = users[userId];
            user.direction = direction;
        });

        socket.on("server_new_user_login", function (user)
        {
            document.getElementById("login-sound").play()

            if (user.id != myUserID)
                addUser(user);
        });

        socket.on("server_user_disconnect", function (userId)
        {
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
            console.log(newVersion)
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
        const newUser = new User(currentRoom, gikoCharacter, userDTO.name);
        newUser.moveImmediatelyToPosition(userDTO.position[0], userDTO.position[1]);
        newUser.direction = userDTO.direction;
        users[userDTO.id] = newUser;
    }

    function drawImage(image, x, y)
    {
        const context = document.getElementById("room-canvas").getContext("2d");
        context.drawImage(image,
            x,
            y - image.height * scale,
            image.width * scale,
            image.height * scale)
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
        // draw background
        drawImage(currentRoom.backgroundImage, 0, 511)

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
                drawImage(o.o.image, o.o.physicalPositionX, o.o.physicalPositionY)
            }
            else // o.type == "user"
            {
                drawCenteredText(o.o.name, o.o.currentPhysicalPositionX + 40, o.o.currentPhysicalPositionY - 95)

                switch (o.o.direction)
                {
                    case "up":
                    case "right":
                        drawHorizontallyFlippedImage(o.o.getCurrentImage(), o.o.currentPhysicalPositionX, o.o.currentPhysicalPositionY)
                        break;
                    case "down":
                    case "left":
                        drawImage(o.o.getCurrentImage(), o.o.currentPhysicalPositionX, o.o.currentPhysicalPositionY)
                        break;
                }

                o.o.spendTime()
            }
        }

        requestAnimationFrame(paint)
    }

    async function loadRoom(roomName)
    {
        currentRoom = await (await fetch("/rooms/" + roomName)).json()

        currentRoom.backgroundImage = await loadImage("rooms/" + roomName + "/background.png")
        for (const o of currentRoom.objects)
        {
            o.image = await loadImage("rooms/" + roomName + "/" + o.url)
            const { x, y } = calculateRealCoordinates(currentRoom, o.x, o.y);
            o.physicalPositionX = x
            o.physicalPositionY = y
        }
        await gikoCharacter.loadImages()
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

