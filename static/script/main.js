(function ()
{
    function byId(id)
    {
        return document.getElementById(id);
    }

    const INNER_SQUARE = [40, 20];
    const MOVE_DURATION = 600;

    var config; // holds the structure of the room (shape, assets...)
    var scale;
    var users = {};
    let myUserId = null
    var socket = io();

    function positionToXY(pos)
    {
        x = 0;
        y = (config.grid[1] - 1) * INNER_SQUARE[1];

        x += pos[0] * INNER_SQUARE[0];
        y -= pos[0] * INNER_SQUARE[1];

        x += pos[1] * INNER_SQUARE[0];
        y += pos[1] * INNER_SQUARE[1];
        return [x, y]
    }

    function setElementIndex(element, position)
    {
        var p1 = position[0] + 1;
        var p2 = config.grid[1] - position[1];
        element.style.zIndex = p1 + p2;
    }

    function placeElement(element, position)
    {
        setElementIndex(element, position);
        var xy = positionToXY(position);
        element.style.left = xy[0] + "px";
        element.style.bottom = xy[1] + "px";
    }

    // Draw the correct sprite for a certain user according to the direction it's facing towards
    function directUser(user)
    {
        if (user.direction == 1 || user.direction == 2)
            var side = "front";
        else
            var side = "back";
        var isSit = false;

        for (var i = 0; i < config.sit.length; i++)
        {
            if (user.position[0] == config.sit[i][0] &&
                user.position[1] == config.sit[i][1])
            {
                isSit = true;
                break;
            }
        }
        user.imgElement.src = "image/characters/" + user.character +
            "/" + side + (isSit ? "_sit" : "") + ".png";
        if (user.direction == 0 || user.direction == 1)
            user.imgElement.style.transform = "scaleX(-1) translateX(50%)";
        else
            user.imgElement.style.transform = "scaleX(1) translateX(-50%)";
    }

    function moveUser(user, pos)
    {
        user.position = pos;

        if ("alternateInstance" in user)
            clearInterval(user.alternateInstance);

        setElementIndex(user.element, user.position);

        var isRight = false;
        function alternateLegs()
        {
            var side = ((user.direction == 1 || user.direction == 2) ?
                "front" : "back");
            var leg = (isRight ? "right" : "left");
            user.imgElement.src = "image/characters/" +
                user.character + "/" + side + "_" + leg + "_leg.png";

            isRight = !isRight;
        }
        user.alternateInstance = setInterval(alternateLegs, MOVE_DURATION / 8);
        alternateLegs();

        var xy = positionToXY(user.position);
        $(user.element).stop().animate({ left: xy[0], bottom: xy[1] },
            MOVE_DURATION, "linear", function ()
        {
            clearInterval(user.alternateInstance);
            directUser(user);
        });
    }

    // Used to create DOM objects for both users and assets in the room
    function createObject(scale)
    {
        var object = document.createElement("div");
        object.classList.add("square");
        object.style.visibility = "hidden";

        var image = document.createElement("img");
        image.onload = function ()
        {
            image.onload = undefined;
            var w = image.clientWidth / scale;
            var h = image.clientHeight / scale;
            image.style.width = w + "px";
            image.style.height = h + "px";
            image.style.transform = "translateX(-50%)";
            object.style.visibility = "visible";
        };
        object.appendChild(image);
        return object;
    }

    function getOppositeDirection(direction)
    {
        if (direction < 2)
            return direction + 2;
        else
            return direction - 2;
    }

    // If the player is already facing towards that direction, move one block forward, otherwise
    // change the direction without moving.
    function pushTowardsDirection(direction) // parts to be moved to server
    {
        var user = users[getMyUserId()];
        if (direction != user.direction)
        {
            user.direction = direction;
            directUser(user);
            sendDirectionToServer(user.direction);
        }
        else
        {
            var pos = user.position.slice();
            if (direction == 0)
            {
                if (pos[1] + 1 < config.grid[1]) pos[1] += 1;
            }
            else if (direction == 2)
            {
                if (0 <= pos[1] - 1) pos[1] -= 1;
            }
            else if (direction == 1)
            {
                if (pos[0] + 1 < config.grid[0]) pos[0] += 1;
            }
            else if (direction == 3)
            {
                if (0 <= pos[0] - 1) pos[0] -= 1;
            }

            if (user.position[0] == pos[0] &&
                user.position[1] == pos[1]) return;

            for (var i = 0; i < config.blocked.length; i++)
            {
                var block = config.blocked[i];
                var isFullBlock = (typeof block[0] === "number");
                if (isFullBlock)
                    var c = block;
                else
                    var c = block[0];
                if (c[0] == pos[0] && c[1] == pos[1])
                {
                    console.log(c, pos);
                    if (isFullBlock ||
                        block[1][getOppositeDirection(direction)])
                    {
                        return
                    }
                }
                else if (!isFullBlock &&
                    (c[0] == user.position[0] && c[1] == user.position[1]))
                {
                    if (block[1][direction])
                    {
                        return
                    }
                }
            }
            sendNewPositionToServer(pos[0], pos[1]);
        }
    }

    function setUpRoom()
    {
        config = {
            "offset": [1, 1],
            "scale": 2,
            "grid": [9, 9],
            "background": "background.png",
            "background_size": [1442, 1022],
            "objects": [
                [[2, 1], "table.png"],
                [[2, 2], "table.png"],

                [[6, 1], "table.png"],
                [[6, 2], "table.png"],

                [[2, 5], "counter_bottom_left.png"],
                [[3, 5], "counter_bottom.png"],
                [[4, 5], "counter_bottom.png"],
                [[5, 5], "counter_bottom.png"],
                [[6, 5], "counter_bottom_right.png"],

                [[2, 6], "counter_left.png"],
                [[2, 7], "counter_left.png"],

                [[6, 6], "counter_right.png"],
                [[6, 7], "counter_right.png"]
            ],
            "sit": [
                [1, 1],
                [1, 2],

                [3, 1],
                [3, 2],

                [5, 1],
                [5, 2],

                [7, 1],
                [7, 2],

                [1, 5],
                [1, 6],
                [1, 7],

                [2, 4],
                [3, 4],
                [4, 4],
                [5, 4],
                [6, 4],

                [7, 5],
                [7, 6],
                [7, 7]
            ],

            "blocked": [
                [2, 1],
                [2, 2],

                [6, 1],
                [6, 2],

                [2, 5],
                [3, 5],
                [4, 5],
                [5, 5],
                [6, 5],

                [2, 6],
                [2, 7],

                [6, 6],
                [6, 7],

                [1, 8],
                [2, 8],
                [3, 8],
                [4, 8],
                [5, 8],
                [6, 8],
                [7, 8]
            ],
            "doors": [
                [[0, 0], "bar_street", [1, 7], 1],
                [[3, 7], "underground", [0, 2], 1],
                [[8, 4], "bar_street", [3, 5], 1]
            ]
        };

        const eBackground = byId("background");
        eBackground.src = "rooms/bar/" + config.background;
        scale = ("scale" in config ? config.scale : 1);
        const w = config.background_size[0] / scale + "px";
        const h = config.background_size[1] / scale + "px";
        eBackground.style.width = w;
        eBackground.style.height = h;
        const eRoom = byId("room");
        eRoom.style.width = w;
        eRoom.style.height = h;

        // Place objects
        for (var i = 0; i < config.objects.length; i++)
        {
            var object = config.objects[i];
            var element = createObject(scale);
            placeElement(element, object[0]);
            var img = element.getElementsByTagName("img")[0];
            img.src = "rooms/bar/" + object[1];
            eRoom.appendChild(element);
        }

        registerEventListeners(); // FIXME: This should be done only once, not everytime I set up a room...
    }

    function getMyUserId()
    {
        return myUserId;
    }

    function addUser(user)
    {
        users[user.id] = user;

        user.element = createObject(2);
        user.imgElement = user.element.getElementsByTagName("img")[0];

        var label = document.createElement("label");
        label.innerText = user.name;
        user.element.insertBefore(label, user.element.imgElement);
        user.element.id = "u" + user.id;
        user.element.classList.add("character");
        placeElement(user.element, user.position);
        directUser(user);
        const eRoom = byId("room");
        eRoom.appendChild(user.element);
    }

    function login(username)
    {
        socket.on("connect", function ()
        {
            socket.emit("user_connect", username);
        });

        socket.on("your_user_id", function (userId) 
        {
            myUserId = userId
        })

        socket.on("server_usr_list", function (users)
        {
            setUpRoom();
            //oh, add table objects before the characters if possible. it's causing giko to appear behind the table
            for (var u in users)
                addUser(users[u]);
        });

        socket.on("server_msg", function (userName, msg)
        {
            var chatLog = byId("chatLog");
            chatLog.innerHTML += userName + ": " + msg + "<br/>";
            byId("chatLog").scrollTop = byId("chatLog").scrollHeight;
        });

        socket.on("server_move", function (userId, x, y, direction)
        {
            var user = users[userId];
            user.direction = direction;
            directUser(user);
            moveUser(user, [x, y]);
        });

        socket.on("server_new_direction", function (userId, direction)
        {
            var user = users[userId];
            user.direction = direction;
            directUser(user);
        });

        socket.on("server_new_user_login", function (user)
        {
            if (user.id != getMyUserId())
            {
                addUser(user);
            }
        });

        socket.on("server_user_disconnect", function (userId)
        {
            users[userId].element.remove();
            delete users[userId];
        });

        window.addEventListener("beforeunload", function ()
        {
            socket.disconnect();
        });
    }

    function sendMessageToServer(msg)
    {
        socket.emit("user_msg", msg);
    }

    function sendNewPositionToServer(x, y)
    {
        socket.emit("user_move", x, y);
    }

    // Sends to the server the new position of the player's character
    function sendDirectionToServer(direction)
    {
        socket.emit("user_new_direction", direction);
    }

    function registerEventListeners()
    {
        var keyCode = null;
        var isDown = false;
        var sendInterval = null;

        function directionKeyEventListener(event)
        {
            e = event || window.event;

            if (e.target.tagName == "INPUT") return;

            if (e.type == "keyup")
            {
                if (keyCode != e.keyCode) return
                isDown = false;
                return;
            }

            if (keyCode == e.keyCode) return;

            if (sendInterval !== null) clearInterval(sendInterval);
            isDown = true;
            keyCode = e.keyCode;

            switch (keyCode)
            {
                case 38: direction = 0; break; // up
                case 39: direction = 1; break; // right
                case 40: direction = 2; break; // down
                case 37: direction = 3; break; // left
                default: return;
            }
            sendInterval = setInterval(function ()
            {
                if (isDown)
                {
                    pushTowardsDirection(direction);
                }
                else
                {
                    clearInterval(sendInterval);
                    keyCode = null;
                }
            }, MOVE_DURATION);
            pushTowardsDirection(direction);
        }

        document.addEventListener("keydown", directionKeyEventListener);
        document.addEventListener("keyup", directionKeyEventListener);

        var eTextBox = byId("textBox");
        eTextBox.onkeydown = function (e)
        {
            if (e.keyCode != 13) return; // Not Enter
            else if (eTextBox.value == '') return;
            sendMessageToServer(eTextBox.value);
            eTextBox.value = "";
        }
    }

    $(function ()
    {
        const queryString = new URLSearchParams(window.location.search)
        const username = queryString.get("username")
        login(username);
    });

})();
