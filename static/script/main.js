(function()	
{
	var INNER_SQUARE = [40,20];
	var MOVE_DURATION = 600;
	
	var eRoom;
	var eBackground;
	
	var roomName;
	var config;
	var scale;
	var zoom = 1.3;
	
	var users = {};
	var currentUser;
	
	function setScale()
	{
		var w = eBackground.clientWidth/scale + "px";
		var h = eBackground.clientHeight/scale + "px";
		eBackground.style.width = w;
		eBackground.style.height = h;
		eRoom.style.width = w;
		eRoom.style.height = h;
	}
	
	function positionToXY(pos)
	{
		x = 0;
		y = (config.grid[1]-1) * INNER_SQUARE[1];
		
		x += pos[0] * INNER_SQUARE[0];
		y -= pos[0] * INNER_SQUARE[1];
		
		x += pos[1] * INNER_SQUARE[0];
		y += pos[1] * INNER_SQUARE[1];
		return [x, y]
	}
	
	function setElementIndex(element, position)
	{
		var p1 = position[0]+1;
		var p2 = config.grid[1]-position[1];
		element.style.zIndex = p1+p2;
	}
	
	function placeElement(element, position)
	{
		setElementIndex(element, position);
		var xy = positionToXY(position);
		element.style.left = xy[0] + "px";
		element.style.bottom = xy[1] + "px";
	}
	
	function directUser(user)
	{
		if(user.direction == 1 || user.direction == 2)
			var side = "front";
		else
			var side = "back";
		var isSit = false;
		
		for(var i=0; i<config.sit.length; i++)
		{
			if(user.position[0] == config.sit[i][0] &&
				user.position[1] == config.sit[i][1])
			{
				isSit = true;
				break;
			}
		}
		user.imgElement.src = "image/characters/" + user.character +
				"/" + side + (isSit ? "_sit" : "") + ".png";
		if(user.direction == 0 || user.direction == 1)
			user.imgElement.style.transform = "scaleX(-1) translateX(50%)";
		else
			user.imgElement.style.transform = "scaleX(1) translateX(-50%)";
	}
	
	var alternateInstance = null;
	function moveUser(user)
	{
		if(alternateInstance !== null)
			clearInterval(alternateInstance);
		
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
		alternateInstance = setInterval(alternateLegs, MOVE_DURATION/8);
		alternateLegs();
		
		var xy = positionToXY(user.position);
		$(user.element).stop().animate({left: xy[0], bottom: xy[1]},
			MOVE_DURATION, "linear", function()
		{
			clearInterval(alternateInstance);
			directUser(user);
		});
	}
	
	function createObject(scale)
	{
		var object = document.createElement("div");
		object.classList.add("square");
		object.style.visibility = "hidden";
		var image = document.createElement("img");
		image.onload = function()
		{
			image.onload = undefined;
			var w = image.clientWidth/scale;
			var h = image.clientHeight/scale;
			image.style.width = w + "px";
			image.style.height = h + "px";
			image.style.transform = "translateX(-50%)";
			object.style.visibility = "visible";
		};
		object.appendChild(image);
		return object;
	}
	
	function setUpUser(user)
	{
		user.element = createObject(2);
		user.imgElement = user.element.getElementsByTagName("img")[0];
		user.element.id = "u" + user.id;
		user.element.classList.add("character");
		placeElement(user.element, user.position);
		directUser(user);
		eRoom.appendChild(user.element);
	}
	
	function getOppositeDirection(direction)
	{
		if(direction < 2)
			return direction + 2;
		else
			return direction - 2;
	}
	
	function sendDirection(direction) // parts to be moved to server
	{
		var user = users[currentUser];
		if(direction != user.direction)
		{
			user.direction = direction;
			directUser(user);
		}
		else
		{
			var pos = user.position.slice();
			if(direction == 0)
			{
				if(pos[1]+1 < config.grid[1]) pos[1] += 1;
			}
			else if(direction == 2)
			{
				if(0 <= pos[1]-1) pos[1] -= 1;
			}
			else if(direction == 1)
			{
				if(pos[0]+1 < config.grid[0]) pos[0] += 1;
			}
			else if(direction == 3)
			{
				if(0 <= pos[0]-1) pos[0] -= 1;
			}
			
			if(user.position[0] == pos[0] &&
				user.position[1] == pos[1]) return;
			
			for(var i=0; i<config.blocked.length; i++)
			{
				var block = config.blocked[i];
				var isFullBlock = (typeof block[0] === "number");
				if(isFullBlock)
					var c = block;
				else
					var c = block[0];
				if(c[0] == pos[0] && c[1] == pos[1])
				{
					console.log(c, pos);
					if(isFullBlock ||
						block[1][getOppositeDirection(direction)])
					{
						return
					}
				}
				else if(!isFullBlock &&
					(c[0] == user.position[0] && c[1] == user.position[1]))
				{
					if(block[1][direction])
					{
						return
					}
				}
			}
			
			user.position = pos;
			moveUser(user);
		}
	}
	
	function final()
	{
		var keyCode = null;
		var isDown = false;
		var sendInterval = null;
		document.addEventListener("keydown", function(event)
		{
			e = event || window.event;
			if(keyCode == e.keyCode) return;
			if(sendInterval !== null)
				clearInterval(sendInterval);
			isDown = true;
			keyCode = e.keyCode;
			var direction = null;
			if (keyCode == 38) // up
				direction = 0;
			else if (keyCode == 40) // down
				direction = 2;
			else if (keyCode == 37) // left
				direction = 3;
			else if (keyCode == 39) // right
				direction = 1;
			if(direction !== null)
			{
				sendInterval = setInterval(function()
				{
					if(isDown)
					{
						sendDirection(direction);
					}
					else
					{
						clearInterval(sendInterval);
						keyCode = null;
					}
				}, MOVE_DURATION);
				sendDirection(direction);
				return false;
			}
		});
		
		document.addEventListener("keyup", function(event)
		{
			e = event || window.event;
			if(e.keyCode != keyCode) return;
			isDown = false;
			return false;
		});
	}
	
	function placeObjects()
	{
		for(var i=0; i<config.objects.length; i++)
		{
			var object = config.objects[i];
			var element = createObject(scale);
			placeElement(element, object[0]);
			var img = element.getElementsByTagName("img")[0];
			img.src =  "rooms/" + roomName + "/" + object[1];
			eRoom.appendChild(element);
		}
	}
	
	function setUpRoom()
	{
		setScale();
		placeObjects();
		
		for(var userId in users)
		{
			var user = users[userId];
			user.id = userId;
			setUpUser(user);
		}
		
		final();
	}
	
	function loadRoom()
	{
		currentUser = 420;
		users[420] = {
			"name": "maf",
			"character": "giko",
			"position": [8,4],
			"direction": 3
		};
		
		roomName = "bar";
		config = JSON.parse(
			document.getElementById("room-config").textContent);
		
		eBackground.src = "rooms/" + roomName + "/" + config.background;
		scale = ("scale" in config ? config.scale : 1);
	}
	
	run = function()
	{
		roomStyle = document.getElementById("room-style");
		eRoom = document.getElementById("room");
		eBackground = document.getElementById("background");
		eBackground.onload = setUpRoom;
		loadRoom();
	};
})();
