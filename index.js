const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require("socket.io")(http);
const users = require("./users.js");
const { bar } = require("./static/rooms/bar/data.js");

/*
Supported websocket messages:
- user_connect(id):                 sent by the client, basically to ask the server to send the user list
- user_msg(msg):                    sent by the client to the server, basically makes the server send a server_msg to everyone
- disconnect:                       sent by the client to the server (wouldn't it be simpler to just do this stuff when the websocket dies?)
- user_move:                        sent by the client to the server, move the avater somewhere
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

    var user = null;

    socket.on("user_connect", function (userName)
    {
        try
        {
            const userId = users.addNewUser(userName);
            

            if (users.getUser(userId) === undefined)
            {
                console.log("Access denied to invalid userId " + userId);
                socket.disconnect(); //TO BE TESTED
                return;
            }

            user = users.getUser(userId);

            console.log("userId: " + userId + " name: " + user.name);

            socket.emit("server_connection_complete", {
                userId,
                users: users.getConnectedUserList()
            })
            io.emit("server_msg", "<span class=\"system\">SYSTEM</span>", user.name + " connected");
            io.emit("server_new_user_login", user);
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
            if (user === null) return;

            user["connected"] = false; //TODO: I'm not sure this works.
            console.log(user.name + " disconnected");
            io.emit("server_msg", "<span class=\"system\">SYSTEM</span>", user.name + " disconnected");
            io.emit("server_user_disconnect", user.id);
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
                if (newPosition.x >= bar.grid[0]) { rejectMovement(); return }
                if (newPosition.y >= bar.grid[1]) { rejectMovement(); return }

                // prevent moving over a blocked square
                if (bar.blocked.filter(p => p[0] == newPosition.x && p[1] == newPosition.y).length > 0)
                    { rejectMovement(); return }

                user.position = [newPosition.x, newPosition.y]

                console.log(user.id, "moved", direction);
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
    socket.on("user_stream_data", function (data) {
        console.log("received stream data...")
        io.emit("server_stream_data", data)
    })
});

app.use(express.static('static',
    { setHeaders: (res) => res.set("Cache-Control", "no-cache") }
));

app.get("/rooms/:roomName", (req, res) =>
{
    const roomName = req.params.roomName
    res.json(bar)
})

const port = process.env.PORT == undefined
    ? 8085
    : Number.parseInt(process.env.PORT)

http.listen(port, "0.0.0.0");

console.log("Server running on http://localhost:" + port);
