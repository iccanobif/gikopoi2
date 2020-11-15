let nextUserID = 1
function generateId()
{
    return nextUserID++;
}

var Player = function (options)
{
    if (options === undefined) options = {};

    this.id = generateId();

    this.name = options["name"] === undefined ? "Anonymous" : options["name"];
    this.position = options["position"] === undefined ? [8, 4] : options["position"];
    this.character = options["character"] === undefined ? "giko" : options["character"];
    this.direction = options["direction"] === undefined ? "left" : options["direction"];
    this.connected = options["connected"] === undefined ? true : options["connected"];
}

var users = {};

module.exports.addNewUser = function (name)
{
    var p = new Player({ name: name, connected: true });
    users[p.id] = p;
    return p.id;
};

module.exports.getConnectedUserList = function ()
{
    //It'd be nice to benchmark this and check if not sending through the wire the disconnected users
    //is worth iterating through "users"' properties like this (I expect it is).
    var output = {};
    for (var u in users)
        if (users.hasOwnProperty(u)
            && users[u].connected == true)
        {
            output[u] = users[u];
        }
    return output;
};

module.exports.getUser = function (userId)
{
    return users[userId];
};

