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
            user.direction = direction;
            user.logicalPositionX = x
            user.logicalPositionY = y
            const realCoordinates = calculateRealCoordinates(currentRoom, user.logicalPositionX, user.logicalPositionY)
            user.currentPhysicalPositionX = realCoordinates.x;
            user.currentPhysicalPositionY = realCoordinates.y;
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


        window.addEventListener("beforeunload", function ()
        {
            socket.disconnect();
        });
    }

    function addUser(userDTO)
    {
        const newUser = new User(currentRoom, userDTO.name)
        newUser.logicalPositionX = userDTO.position[0];
        newUser.logicalPositionY = userDTO.position[1];
        const realCoordinates = calculateRealCoordinates(currentRoom, newUser.logicalPositionX, newUser.logicalPositionY)
        newUser.currentPhysicalPositionX = realCoordinates.x;
        newUser.currentPhysicalPositionY = realCoordinates.y;

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

    function drawCenteredText(text, x, y)
    {
        // const width = context.measureText(text).width
        context.font = "bold 13px Arial, Helvetica, sans-serif"
        context.textBaseline = "bottom"
        context.textAlign = "center"
        context.fillStyle = "blue"
        context.fillText(text, x, y)
    }

    async function paint(timestamp)
    {
        // draw background
        drawImage(currentRoom.backgroundImage, 0, 511)

        // draw objects
        for (var i = 0; i < currentRoom.objects.length; i++)
        {
            const object = currentRoom.objects[i];
            // const image = await loadImage("rooms/bar/" + object.url)
            const { x, y } = calculateRealCoordinates(currentRoom, object.x, object.y);
            drawImage(object.image, x, y)
        }

        // draw users
        for (const user of Object.values(users))
        {
            drawCenteredText(user.name, user.currentPhysicalPositionX + 40, user.currentPhysicalPositionY - 95)
            drawImage(gikoCharacter.frontStandingImage, user.currentPhysicalPositionX, user.currentPhysicalPositionY)
        }

        requestAnimationFrame(paint)
    }

    async function loadRoom(roomName)
    {
        currentRoom = await (await fetch("/rooms/" + roomName)).json()

        currentRoom.backgroundImage = await loadImage("rooms/" + roomName + "/background.png")
        for (const o of currentRoom.objects)
            o.image = await loadImage("rooms/" + roomName + "/" + o.url) // TODO: make generic
        await gikoCharacter.loadImages()
    }

    function sendNewPositionToServer(x, y)
    {
        socket.emit("user_move", x, y);
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
