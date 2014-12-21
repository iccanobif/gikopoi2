var app = require("express")();
var http = require('http').Server(app);
var fs = require('fs');
var io = require("socket.io")(http);


io.on("connection", function(socket){
    console.log("user connected");
    io.emit("server_msg", "SYSTEM", "someone connected");
    socket.on("user_msg", function(user, msg)
    {
        console.log(user + ": " + msg);
        io.emit("server_msg", user, msg);
    });
    socket.on("disconnect", function()
    {
        console.log("user disconnected");
        io.emit("server_msg", "system", "someone disconnected");
    });
});

app.get("/", function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile("index.htm", function(err, data) {
        if (err) res.end(err);
        else res.end(data);
    });
});

app.post("/", function (req, res) {
    var body = "";
    req.on("data", function (data) {
        body += data;
    });
    req.on("end", function () {
        var post = require("querystring").parse(body);
        var userName = post["name"];
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile("chat.htm", function(err, data) {
            if (err) res.end(err);
            else res.end(data);
        });
    });
});

http.listen(1337);

console.log("Server running");
