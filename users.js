var users = {};

function generateToken()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
}

module.exports.addNewUser = function(name)
{
    var token = generateToken();
    while (users[token] != undefined)
        token = generateToken();
    users[token] = {name: name, connected: true};
    return token;
};

module.exports.getConnectedUserList = function()
{
    //Forse è meglio fare una copia della lista users, eliminando quelli non connessi
    //Vale la pena anche di escludere l'utente a cui sto inviando la lista
    var output = {};
    for (var u in users)
    {
        if (users.hasOwnProperty(u)
            && users[u]["connected"] == true)
        {
            output[u] = {name: users[u].name};
        }
    }
    console.log("lista utenti: ");
    console.log(output);
    return output;
};

module.exports.getUser = function(userId)
{
    return users[userId];
};

