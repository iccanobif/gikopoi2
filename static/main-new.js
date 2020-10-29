// RULES FOR MAKING ASSETS:
//      EVERYTHING HAS A WIDTH OF 160

import barData from "../rooms/bar/data.js"

(function ()
{
    const scale = 0.5

    const socket = io();

    const queryString = new URLSearchParams(window.location.search)
    const username = queryString.get("username")

    const users = {}
    let currentRoom = barData

    socket.on("connect", function ()
    {
        socket.emit("user_connect", username);
    });

    socket.on("server_usr_list", async function (users)
    {
        //oh, add table objects before the characters if possible. it's causing giko to appear behind the table
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

    function loadImage(url)
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                const img = new Image();
                img.addEventListener("load", () => 
                {
                    resolve(img)
                })
                img.addEventListener("error", reject)
                img.src = url;
            }
            catch (err)
            {
                reject(err)
            }
        })
    }

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

        realX *= scale
        realY *= scale

        return { x: realX, y: realY }
    }

    let conSuppellettili = true

    async function paint()
    {
        console.log(BLOCK_WIDTH)
        console.log(BLOCK_HEIGHT)

        const canvas = document.getElementById("room-canvas")
        const context = canvas.getContext("2d")

        const backgroundImage = await loadImage("rooms/bar/background.png")
        context.drawImage(backgroundImage, 0, 0, backgroundImage.width * scale, backgroundImage.height * scale)

        for (let x = 0; x < 9; x++)
            for (let y = 0; y < 9; y++)
            {
                const realCoordinates = calculateRealCoordinates(x, y);
                console.log(realCoordinates)
            }

        if (conSuppellettili)
            for (var i = 0; i < currentRoom.objects.length; i++)
            {
                const object = currentRoom.objects[i];
                const image = await loadImage("rooms/bar/" + object.url)
                const realCoordinates = calculateRealCoordinates(object.x, object.y);
                context.drawImage(image,
                    realCoordinates.x,
                    realCoordinates.y - image.height * scale,
                    image.width * scale,
                    image.height * scale)
            }

        conSuppellettili = !conSuppellettili

        // const image = await loadImage("image/characters/giko/front.png")
        // // for (let x = 0; x < 9; x++)
        // const x = 8
        // for (let y = 0; y < 9; y++)
        // {
        //     // const x = 0
        //     const realCoordinates = calculateRealCoordinates(x, y);
        //     context.drawImage(image,
        //         realCoordinates.x,
        //         realCoordinates.y - image.height * scale,
        //         image.width * scale,
        //         image.height * scale)
        //     context.fillRect(realCoordinates.x,
        //         realCoordinates.y,
        //         5,
        //         5)
        // }


    }

    paint()


    document.getElementById("wplus").addEventListener("click", () => { paint() })
})();
