const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require("socket.io")(http);
const users = require("./users.js");
const { rooms } = require("./rooms.js");

/*
Supported websocket messages:
- user-connect(id):                     sent by the client, basically to ask the server to send the user list
- user-msg(msg):                        sent by the client to the server, basically makes the server send a server_msg to everyone
- disconnect:                           sent by the client to the server (wouldn't it be simpler to just do this stuff when the websocket dies?)
- user-move:                            sent by the client to the server, move the avatar somewhere
- server-update-current-room-users(dto):      sent by the server to a single client
- server-msg(userName, msg):            sent by the server to ALL clients, it's a message to display on the chat
- server-user-joined-room(user):          sent by the server to ALL clients, notifies everyone that a new user logged in
- server-user-left-room(userId):       sent by the server to ALL clients, notifies everyone that a user logged out
- server-move(userId, x, y, direction): sent by the server to ALL clients, asks everyone to move a character to coordinates (x, y)
- server-reject-movement:               sent by the server to a single client
- user-stream-data                      sent by the client to the server, it's a chunk of video/audio data
*/

io.on("connection", function (socket)
{
    console.log("Connection attempt");

    let user = null;
    let currentRoom = rooms.bar;

    socket.on("user-connect", function (userId)
    {
        try
        {
            user = users.getUser(userId);

            console.log("userId: " + userId + " name: " + user.name);

            socket.emit("server-update-current-room-users", {
                users: users.getConnectedUserList(user.roomId)
            })
            socket.join(user.roomId)
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });
    socket.on("user-msg", function (msg)
    {
        try
        {
            console.log(user.name + ": " + msg);
            io.to(user.roomId).emit("server-msg", "<span class=\"messageAuthor\">" + user.name + "</span>", "<span class=\"messageBody\">" + msg + "</span>");
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });

    socket.on("user-move", function (direction)
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

                const rejectMovement = () => socket.emit("server-reject-movement")

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

            io.to(user.roomId).emit("server-move",
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
    socket.on("user-stream-data", function (data)
    {
        io.to(user.roomId).emit("server-stream-data", data)
    })
    socket.on("user-change-room", function (data)
    {
        const { targetRoomId, targetX, targetY } = data

        currentRoom = rooms[targetRoomId]

        io.to(user.roomId).emit("server-user-left-room", user.id);
        socket.leave(user.roomId)
        user.position = { x: targetX, y: targetY }
        user.roomId = targetRoomId
        socket.join(targetRoomId)

        socket.emit("server-update-current-room-users", {
            users: users.getConnectedUserList(targetRoomId)
        })

        io.to(targetRoomId).emit("server-user-joined-room", user);
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

        io.emit("server-msg", "SYSTEM", userName + " connected");
        io.emit("server-user-joined-room", user);
    }
})

function disconnectUser(user)
{
    console.log("Disconnecting user ", user.id, user.name)
    user["connected"] = false;
    io.emit("server-msg", "SYSTEM", user.name + " disconnected");
    io.emit("server-user-left-room", user.id);
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
    const allUsers = users.getConnectedUserList(null)
    for (const user of Object.values(allUsers))
        if (Date.now() - user.lastPing > 30 * 1000)
            disconnectUser(user)
}, 20 * 1000)

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

http.listen(port, "0.0.0.0");

console.log("Server running on http://localhost:" + port);
