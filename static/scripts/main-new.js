import Character from "./character.js";
import User from "./user.js";
import { loadImage, calculateRealCoordinates, scale } from "./utils.js";

const canvas = document.getElementById("room-canvas");
const context = canvas.getContext("2d");

(function ()
{
    let socket = null;

    const queryString = new URLSearchParams(window.location.search);
    const username = queryString.get("username");

    const users = {};
    let currentRoom = null;
    const gikoCharacter = new Character("giko")
    let myUserID = null;

    function connectToServer()
    {
        socket = io()

        socket.on("connect", function ()
        {
            socket.emit("user_connect", username);
        });

        socket.on("server_usr_list", async function (users)
        {
            for (var u in users)
                addUser(users[u]);
        });

        socket.on("server_msg", function (userName, msg)
        {
            const chatLog = document.getElementById("chatLog");
            chatLog.innerHTML += userName + ": " + msg + "<br/>";
            chatLog.scrollTop = chatLog.scrollHeight;
        });

        socket.on("server_move", function (userId, x, y, direction)
        {
            var user = users[userId];
            user.moveToPosition(x, y, direction)
        });

        socket.on("server_new_direction", function (userId, direction)
        {
            var user = users[userId];
            user.direction = direction;
            // directUser(user);
        });

        socket.on("server_new_user_login", function (user)
        {
            addUser(user);
        });

        socket.on("server_user_disconnect", function (userId)
        {
            delete users[userId];
        });

        socket.on("your_user_id", function (userId)
        {
            myUserID = userId
        })

        window.addEventListener("beforeunload", function ()
        {
            socket.disconnect();
        });
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
        context.drawImage(image,
            x,
            y - image.height * scale,
            image.width * scale,
            image.height * scale)
    }

    function drawHorizontallyFlippedImage(image, x, y)
    {
        context.scale(-1, 1)
        drawImage(image, - x - image.width / 2, y)
        context.setTransform(1, 0, 0, 1, 0, 0); // clear transformation
    }

    function drawCenteredText(text, x, y)
    {
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
    }

    function sendNewPositionToServer(direction)
    {
        if (users[myUserID].isWalking)
            return

        socket.emit("user_move", direction);
    }

    function sendMessageToServer(msg)
    {
        socket.emit("user_msg", msg);
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

        document.addEventListener("keydown", onKeyDown);
        const inputTextbox = document.getElementById("textBox")

        inputTextbox.addEventListener("keydown", (event) =>
        {
            if (event.key != "Enter") return

            if (inputTextbox.value == "") return;
            sendMessageToServer(inputTextbox.value);
            inputTextbox.value = "";

        })
    }

    loadRoom("bar")
        .then(() =>
        {
            registerKeybindings()
            connectToServer()
            paint()
        })
        .catch(console.error)
})();
