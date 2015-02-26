var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var io = require("socket.io")(http);


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

io.on("connection", function(socket){
    console.log("Connection attempt");
    
    var userId = null;
    
    socket.on("user_connect", function(id)
    {
         try
        {
            userId = id;
            
            if (users[userId] === undefined)
            {
                console.log("Access denied to invalid userId " + userId);
                socket.disconnect(); //TO TEST
                return;
            }
            
            console.log("userId: " + userId + " name: " + users[userId]["name"]);
            
            socket.emit("server_usr_list", users);
            io.emit("server_msg", "SYSTEM", users[userId]["name"] + " connected");
            io.emit("new_user_login", userId, users[userId]["name"]);
            
        }
        catch (e)
        {
            console.log(e.message);
        }
    });
    socket.on("user_msg", function(msg)
    {
        try
        {
            var userName = users[userId]["name"];
            console.log(userName + ": " + msg);
            io.emit("server_msg", userName, msg);
        }
        catch (e)
        {
            console.log(e.message);
        }
    });
    socket.on("disconnect", function()
    {
        try
        {
            console.log(users[userId]["name"] + " disconnected");
            io.emit("server_msg", "system", "someone disconnected");
        }
        catch (e)
        {
            console.log(e.message);
        }
    });
    socket.on("user_move", function(x, z)
    {
        try
        {
            console.log(userId + ", " + x + ", "+ z);
            io.emit("server_move", userId, x, z);
        }
        catch (e)
        {
            console.log(e.message);
        }
    });
});

app.get("/", function (req, res) 
    {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile("index.htm", function(err, data) 
    {
        if (err) res.end(err);
        else res.end(data);
    });
});

var users = {};

function generateToken()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
}

function addNewUser(name)
{
    var token = generateToken();
    while (users[token] != undefined)
        token = generateToken();
    users[token] = {name: name};
    return token;
}

app.post("/giko", function (req, res) 
{
    var body = "";
    req.on("data", function (data) 
    {
        body += data;
    });
    req.on("end", function () 
    {
        var post = require("querystring").parse(body);
        var userName = post["name"];
        
        var userId = addNewUser(userName);
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        //fs.readFile("chat.htm", function(err, data) 
        fs.readFile("fps.htm", function(err, data) 
        {
            if (err) 
            {
                res.end(err);
                return;
            }

            data = String(data).replace(/@USER_NAME@/g, userName)
                               .replace(/@USER_ID@/g, userId);
            res.end(data);
        });
    });
});

app.use(express.static('static'));

http.listen(1337);

console.log("Server running");
