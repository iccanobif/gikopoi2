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

io.on("connection", function(socket){
    console.log("Connection attempt");
    
    var user = null;
    
    socket.on("user_connect", function(id)
    {
         try
        {
            if (users.getUser(id) === undefined)
            {
                console.log("Access denied to invalid userId " + id);
                socket.disconnect(); //TO TEST
                return;
            }
            
            user = users.getUser(id);
            
            console.log("userId: " + id + " name: " + user.name);
            
            socket.emit("server_usr_list", users.getConnectedUserList());
            io.emit("server_msg", "SYSTEM", user.name + " connected");
            io.emit("server_new_user_login", user);
        }
        catch (e)
        {
            console.log(e.message + " " + e.stack);
        }
    });
    socket.on("user_msg", function(msg)
    {
        try
        {
            console.log(user.name + ": " + msg);
            io.emit("server_msg", user.name, msg);
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
            if (user === null) return;
            
            user["connected"] = false; //TODO: siamo sicuri che funzioni?
            console.log(user.name + " disconnected");
            io.emit("server_msg", "system", user.name + " disconnected");
            io.emit("server_user_disconnect", user.id);
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
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile("index.htm", function(err, data) 
    {
        if (err) res.end(err);
        else res.end(data);
    });
});

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
        
        var userId = users.addNewUser(userName);
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile("fps.htm", function(err, data) 
        {
            if (err) return res.end(err);

            data = String(data).replace(/@USER_NAME@/g, userName)
                               .replace(/@USER_ID@/g, userId);
            res.end(data);
        });
    });
});

app.use(express.static('static'));

http.listen(80);

console.log("Server running");
