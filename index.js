const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require("socket.io")(http);
const users = require("./users.js");
const { rooms } = require("./rooms.js");

/*
Supported websocket messages:
- user_connect(id):                 sent by the client, basically to ask the server to send the user list
- user_msg(msg):                    sent by the client to the server, basically makes the server send a server_msg to everyone
- disconnect:                       sent by the client to the server (wouldn't it be simpler to just do this stuff when the websocket dies?)
- user_move:                        sent by the client to the server, move the avatar somewhere
- server_connection_complete(dto):  sent by the server to a single client
- server_msg(userName, msg):        sent by the server to ALL clients, it's a message to display on the chat
- server_new_user_login(user):      sent by the server to ALL clients, notifies everyone that a new user logged in
- server_user_disconnect(userId):   sent by the server to ALL clients, notifies eveyrone that a user logged out
- server_move(userId, x, y):        sent by the server to ALL clients, asks everyone to move a character to coordinates (x, y)
- server_reject_movement:           sent by the server to a single client
- user_stream_data                  sent by the client to the server, it's a chunk of video/audio data
*/

io.on("connection", function (socket)
{
    console.log("Connection attempt");

    let user = null;
    let currentRoom = rooms.bar

    socket.on("user_connect", function (userId)
    {
        try
        {
            user = users.getUser(userId);

            console.log("userId: " + userId + " name: " + user.name);

            socket.emit("server_connection_complete", {
                users: users.getConnectedUserList()
            })
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
            io.emit("server_msg", "<span class=\"messageAuthor\">" + user.name + "</span>", "<span class=\"messageBody\">" + msg + "</span>");
        }
        catch (e)
        {
            console.log(e.message);
        }
    });

    socket.on("disconnect", function ()
    {
        try
        {

        }
        catch (e)
        {
            console.log(e.message);
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
                console.log(user.id, "facing", direction)
            }
            else
            {
                // MOVE
                const newPosition = { x: user.position[0], y: user.position[1] }

                switch (direction)
                {
                    case "up": newPosition.y++; break;
                    case "down": newPosition.y--; break;
                    case "left": newPosition.x--; break;
                    case "right": newPosition.x++; break;
                }

                const rejectMovement = () => socket.emit("server_reject_movement")

                // prevent going outside of the map
                if (newPosition.x < 0) { rejectMovement(); return }
                if (newPosition.y < 0) { rejectMovement(); return }
                if (newPosition.x >= currentRoom.grid[0]) { rejectMovement(); return }
                if (newPosition.y >= currentRoom.grid[1]) { rejectMovement(); return }

                // prevent moving over a blocked square
                if (currentRoom.blocked.filter(p => p[0] == newPosition.x && p[1] == newPosition.y).length > 0)
                { rejectMovement(); return }

                user.position = [newPosition.x, newPosition.y]

                console.log(user.id, "moved", direction, newPosition.x, newPosition.y);
            }

            io.emit("server_move", user.id, user.position[0], user.position[1], user.direction);
        }
        catch (e)
        {
            console.log(e.message);
        }
    });
    socket.on("user_new_direction", function (direction)
    {
        try
        {
            console.log(user.id + " changing direction: " + direction);
            user.direction = direction;
            io.emit("server_new_direction", user.id, direction);
        }
        catch (e)
        {
            console.log(e.message);
        }
    });
    socket.on("user_stream_data", function (data)
    {
        console.log("received stream data...")
        io.emit("server_stream_data", data)
    })
    socket.on("user_change_room", function (data)
    {
        const { targetRoomId } = data

        currentRoom = rooms[targetRoomId]

        console.log("switched to room", targetRoomId)
        // notify all users that were in the same room that this user left
        // notify all users in the new room that a new friend came in
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

    console.log(userName)
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
        io.emit("server_new_user_login", user);
    }
})

function disconnectUser(user)
{
    console.log("Disconnecting user ", user.id, user.name)
    user["connected"] = false;
    console.log(user.name + " disconnected");
    io.emit("server_msg", "SYSTEM", user.name + " disconnected");
    io.emit("server_user_disconnect", user.id);
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
