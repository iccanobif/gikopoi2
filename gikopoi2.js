var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var io = require("socket.io")(http);
var users = require("./users.js");

function readCookie(cookies, cookieName)
{
    c = cookies.split(";");
    for (var i = 0; i < c.length; i++)
    {
        s = c[i].trim().split("=")
        if (s[0] == cookieName)
            return s[1];
    }
    return null;
}

/*
Supported websocket messages:
- user_connect(id):                 sent by the client, basically to ask the server to send the user list
- server_usr_list(id):              sent by the server to a single client
- user_msg(msg):                    sent by the client to the server, basically makes the server send a server_msg to everyone
- server_msg(userName, msg):        sent by the server to ALL clients, it's a message to display on the chat
- server_new_user_login(user):      sent by the server to ALL clients, notifies everyone that a new user logged in
- server_user_disconnect(userId):   sent by the server to ALL clients, notifies eveyrone that a user logged out
- disconnect:                       sent by the client to the server (wouldn't it be simpler to just do this stuff when the websocket dies?)
- user_move:                        sent by the client to the server, move the avater somewhere
- server_move(userId, x, y):        sent by the server to ALL clients, asks everyone to move a character to coordinates (x, y)
*/

io.on("connection", function (socket)
{
    console.log("Connection attempt");

    var user = null;

    socket.on("user_connect", function (id)
    {
        try
        {
            if (users.getUser(id) === undefined)
            {
                console.log("Access denied to invalid userId " + id);
                socket.disconnect(); //TO BE TESTED
                return;
            }

            user = users.getUser(id);

            console.log("userId: " + id + " name: " + user.name);

            socket.emit("server_usr_list", users.getConnectedUserList());
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
            //<p class=\"messageUsername\">" + user.name + "</p>: "  + "<p class=\"messageBody\">" + msg
            console.log(user.name + ": " + msg);
            io.emit("server_msg", "<span class=\"messageAuthor\">" + user.name + "</span>", "<span class=\"messageBody\">" + msg + "</span>");
        }
        catch (e)
        {
            console.log(e.message);
        }
    });
    function handleDisconnect()
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
    }
    socket.on("disconnect", handleDisconnect);
    /*socket.on("user_disconnect", function(){
        console.log("user_disconnect!"); 
        handleDisconnect();
    });*/
    socket.on("user_move", function (x, z)
    {
        try
        {
            console.log(user.id  + " moving to " + x + ", " + z);
            user.x = x;
            user.z = z;
            io.emit("server_move", user.id, x, z);
        }
        catch (e)
        {
            console.log(e.message);
        }
    });
});

app.get("/", function (req, res)
{
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile("index.htm", function (err, data)
    {
        if (err) res.end(err);
        else res.end(data);
    });
});

app.post("/", function (req, res) 
{
    var body = "";
    req.on("data", function (data)
    {
        body += data;
    });
    req.on("end", function ()
    {
        //TODO: if the users simply did an F5 or for some reason the websocket is reconnecting,
        //      reuse the old user that's still in the user list flagged as disconnected
        var post = require("querystring").parse(body);
        var userName = post["name"];

        var userId = users.addNewUser(userName);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile("fps.htm", function (err, data)
        {
            if (err) return res.end(err);

            data = String(data).replace(/@USER_NAME@/g, userName)
                .replace(/@USER_ID@/g, userId);
            res.end(data);
        });
    });
});

app.use(express.static('static'));

//http.listen(80);
http.listen(process.env.OPENSHIFT_NODEJS_PORT || 80,
    process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

console.log("Server running");
