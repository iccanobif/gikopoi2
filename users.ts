let nextUserID = 1
function generateId()
{
    return nextUserID++;
}

const Player = function (options)
{
    if (options === undefined) options = {};

    this.id = generateId();

    this.name = options["name"] === undefined ? "Anonymous" : options["name"];
    this.position = options["position"] === undefined ? { x: 8, y: 4 } : options["position"];
    this.character = options["character"] === undefined ? "giko" : options["character"];
    this.direction = options["direction"] === undefined ? "left" : options["direction"];
    this.connected = options["connected"] === undefined ? true : options["connected"];
    this.roomId = "bar"
    this.lastPing = Date.now();
}

const users = {};

module.exports.addNewUser = function (name)
{
    const p = new Player({ name });
    users[p.id] = p;
    return p;
};

module.exports.getConnectedUserList = function (roomId)
{
    const output = {};
    for (const u in users)
        if (users.hasOwnProperty(u)
            && users[u].connected == true
            && (roomId == null || users[u].roomId == roomId))
        {
            output[u] = users[u];
        }
    return output;
};

module.exports.getUser = function (userId)
{
    return users[userId];
};

