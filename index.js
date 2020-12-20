const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require("socket.io")(http);
const users = require("./users.js");
const { rooms } = require("./rooms.js");

/*
Supported websocket messages:
- user_connect(id):                     sent by the client, basically to ask the server to send the user list
- user_msg(msg):                        sent by the client to the server, basically makes the server send a server_msg to everyone
- disconnect:                           sent by the client to the server (wouldn't it be simpler to just do this stuff when the websocket dies?)
- user_move:                            sent by the client to the server, move the avatar somewhere
- server_connection_complete(dto):      sent by the server to a single client
- server_msg(userName, msg):            sent by the server to ALL clients, it's a message to display on the chat
- server_user_joined_room(user):          sent by the server to ALL clients, notifies everyone that a new user logged in
- server_user_left_room(userId):       sent by the server to ALL clients, notifies everyone that a user logged out
- server_move(userId, x, y, direction): sent by the server to ALL clients, asks everyone to move a character to coordinates (x, y)
- server_reject_movement:               sent by the server to a single client
- user_stream_data                      sent by the client to the server, it's a chunk of video/audio data
*/

io.on("connection", function (socket)
{
    console.log("Connection attempt");

    let user = null;
    let currentRoom = rooms.bar;

    socket.on("user_connect", function (userId)
    {
        try
        {
            user = users.getUser(userId);

            console.log("userId: " + userId + " name: " + user.name);

            socket.emit("server_connection_complete", {
                users: users.getConnectedUserList()
            })
            socket.join(user.roomId)
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });
    socket.on("user_msg", function (msg)
    {
        try
        {
            console.log(user.name + ": " + msg);
            io.to(user.roomId).emit("server_msg", "<span class=\"messageAuthor\">" + user.name + "</span>", "<span class=\"messageBody\">" + msg + "</span>");
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });

    socket.on("user_move", function (direction)
    {
        try
        {
            if (user.direction != direction)
            {
                // ONLY CHANGE DIRECTION
                user.direction = direction;
            }
            else
            {
                // MOVE
                let newX = user.position.x
                let newY = user.position.y

                switch (direction)
                {
                    case "up": newY++; break;
                    case "down": newY--; break;
                    case "left": newX--; break;
                    case "right": newX++; break;
                }

                const rejectMovement = () => socket.emit("server_reject_movement")

                // prevent going outside of the map
                if (newX < 0) { rejectMovement(); return }
                if (newY < 0) { rejectMovement(); return }
                if (newX >= currentRoom.grid[0]) { rejectMovement(); return }
                if (newY >= currentRoom.grid[1]) { rejectMovement(); return }

                // prevent moving over a blocked square
                if (currentRoom.blocked.find(p => p[0] == newX && p[1] == newY))
                {
                    rejectMovement();
                    return
                }

                user.position.x = newX
                user.position.y = newY
            }

            io.to(user.roomId).emit("server_move",
                user.id,
                user.position.x,
                user.position.y,
                user.direction,
                false);
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });
    socket.on("user_stream_data", function (data)
    {
        io.to(user.roomId).emit("server_stream_data", data)
    })
    socket.on("user_change_room", function (data)
    {
        const { targetRoomId, targetX, targetY } = data

        currentRoom = rooms[targetRoomId]

        io.to(user.roomId).emit("server_user_left_room", user.id);
        socket.leave(user.roomId)
        user.position = { x: targetX, y: targetY }
        user.roomId = targetRoomId
        socket.join(targetRoomId)

        io.to(targetRoomId).emit("server_user_joined_room", user);
    })
});

app.use(express.static('static',
    { setHeaders: (res) => res.set("Cache-Control", "no-cache") }
));

app.get("/rooms/:roomName", (req, res) =>
{
    const roomName = req.params.roomName
    res.json(rooms[roomName])
})

app.post("/ping/:userId", async (req, res) =>
{
    fs.readFile("version", (err, data) =>
    {
        if (err)
            res.json(err)
        else
        {
            // Update last ping date for the user
            const { userId } = req.params
            const user = users.getUser(userId)

            if (!user)
                return

            user.lastPing = Date.now()

            // Return software version, so that the client can refresh the page
            // if there has been a new deploy.
            const str = data.toString()
            const version = Number.parseInt(str)
            res.json({ version })
        }
    })
})

app.use(express.json());

app.post("/login", (req, res) =>
{
    const { userName } = req.body

    console.log(userName, "logging in")
    if (!userName)
    {
        res.statusCode = 500
        res.end("please specify a username")
    }
    else
    {
        const user = users.addNewUser(userName);
        res.json(user.id)

        io.emit("server_msg", "SYSTEM", userName + " connected");
        io.emit("server_user_joined_room", user);
    }
})

function disconnectUser(user)
{
    console.log("Disconnecting user ", user.id, user.name)
    user["connected"] = false;
    io.emit("server_msg", "SYSTEM", user.name + " disconnected");
    io.emit("server_user_left_room", user.id);
}

app.post("/logout", (req, res) =>
{
    const { userID } = req.body
    if (!userID)
    {
        res.statusCode = 500
        res.end("please specify a username")
    }
    else
    {
        const user = users.getUser(userId);
        if (!user) return;

        res.end()
    }
})

// Disconnect users that have failed to ping in the last 30 seconds
setInterval(() =>
{
    const allUsers = users.getConnectedUserList()
    for (const user of Object.values(allUsers))
        if (Date.now() - user.lastPing > 30 * 1000)
            disconnectUser(user)
}, 20 * 1000)

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

http.listen(port, "0.0.0.0");

console.log("Server running on http://localhost:" + port);
