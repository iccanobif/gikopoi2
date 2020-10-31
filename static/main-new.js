// RULES FOR MAKING ASSETS:
//      EVERYTHING HAS A WIDTH OF 160

import barData from "../rooms/bar/data.js"
import Character from "./character.js"
import { loadImage } from "./utils.js"

(function ()
{
    const scale = 0.5

    const socket = io();

    const queryString = new URLSearchParams(window.location.search)
    const username = queryString.get("username")

    const users = {}
    let currentRoom = barData
    const gikoCharacter = new Character("giko")

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
        directUser(user);
        moveUser(user, [x, y]);
    });

    socket.on("server_new_direction", function (userId, direction)
    {
        var user = users[userId];
        user.direction = direction;
        directUser(user);
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

    function addUser(user)
    {
        users[user.id] = user;
    }

    let BLOCK_WIDTH = 160
    let BLOCK_HEIGHT = 80

    // returns "left" and "bottom" positions
    function calculateRealCoordinates(x, y)
    {
        let realX = currentRoom.originCoordinates.x
            + x * BLOCK_WIDTH / 2
            + y * BLOCK_WIDTH / 2

        let realY = currentRoom.originCoordinates.y
            + x * BLOCK_HEIGHT / 2
            - y * BLOCK_HEIGHT / 2

        realY += BLOCK_HEIGHT / 2

        realX *= scale
        realY *= scale

        return { x: realX, y: realY }
    }

    function drawImage(image, x, y)
    {
        const canvas = document.getElementById("room-canvas")
        const context = canvas.getContext("2d")

        context.drawImage(image,
            x,
            y - image.height * scale,
            image.width * scale,
            image.height * scale)
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
            const { x, y } = calculateRealCoordinates(object.x, object.y);
            drawImage(object.image, x, y)
        }

        // draw users
        for (const user of Object.values(users))
        {
            const { x, y } = calculateRealCoordinates(user.position[0], user.position[1]);
            // console.log(user)
            // console.log(x, y, user.name, user.direction)

            drawImage(gikoCharacter.frontStandingImage, x, y)
        }

        requestAnimationFrame(paint)
    }

    async function loadAllImages()
    {
        currentRoom.backgroundImage = await loadImage("rooms/bar/background.png")
        for (const o of currentRoom.objects)
            o.image = await loadImage("rooms/bar/" + o.url) // TODO: make generic
        await gikoCharacter.loadImages()
    }

    loadAllImages()
        .then(() =>
        {
            paint()
        })
        .catch(console.error)
})();
