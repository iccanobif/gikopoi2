//WEBSOCKETS STUFF
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

function byId(id)
{
    return document.getElementById(id);
}

function getMyUserId()
{
    //return readCookie(document.cookie, "token");
    return byId("userId").value;
}

var socket = io();

socket.on("connect", function()
{
    socket.emit("user_connect", getMyUserId());
});

socket.on("server_usr_list", function(users)
{
    for (var u in users)
        if (users.hasOwnProperty(u)
            && u != getMyUserId())
        {
            addUser(u, users[u].name);
        }
});
socket.on("server_msg", function(userName, msg) 
{
    var chatLog = byId("chatLog");
    chatLog.innerHTML += userName + ": " + msg + "<br/>";
    byId("chatLog").scrollTop = byId("chatLog").scrollHeight;
});
socket.on("server_move", function(userId, x, z)
{
    //console.log(userId + ", " + x + ", " + z + " e io sono " + getMyUserId());
    if (userId != getMyUserId())
    {
        players[userId].setPosition(x, z);
    }
});
socket.on("server_new_user_login", function(userId, userName)
{
    if (userId != getMyUserId())
    {
        addUser(userId, userName);
    }
});
socket.on("server_user_disconnect", function(userId)
{
    players[userId].dispose();
    delete players[userId];
});

function sendMessage(msg)
{
    socket.emit("user_msg", msg);
}
function sendNewPosition(x, z)
{
    socket.emit("user_move", x, z);
}

//THREE.JS STUFF

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.bottom = '0px';
stats.domElement.style.right = '0px';
document.body.appendChild( stats.domElement );

byId("textBox").onkeydown = function (e)
{
    if (e.keyCode == 27) // ESC
    {
        byId('messageBox').style.display = "none";
        byId('textBox').value = "";
        return;
    }

    if (e.keyCode != 13) return; // Not Enter
    
    sendMessage(byId('textBox').value);
    byId('textBox').value = "";
}

window.addEventListener("keypress", function (event) 
{
    if (event.keyCode == 13)
    {
        document.exitPointerLock();
        byId('messageBox').style.display = "block";
        byId("textBox").focus();
    }
});

function writeToConsole(str)
{   
    byId("console").innerHTML = str;
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({precision: "lowp"});
//renderer.setPixelRatio(1/4);
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setSize(500, 200);
renderer.setClearColor( 0xff0000 );

document.body.appendChild(renderer.domElement);

var fpsControls = new FpsControls(camera, renderer.domElement, {godMode: false});

var players = {};

var Player = function(options)
{
    if (options === undefined) options = {};
    
    this.name = options["name"] === undefined ? "Anonymous" : options["name"];
    this.color = options["color"] === undefined ? 0x00ffcc : options["color"];
    
    //CUBE
    var cube = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 4), 
                              new THREE.MeshLambertMaterial({ color: this.color }));

    cube.position.set(0, 4, 0);
    cube.castShadow = true;
    cube.material.side = THREE.DoubleSide;
    scene.add(cube);

    //TEXT
    var textGeo = 
        new THREE.TextGeometry( this.name, 
                               { size: 1, 
                                 height: 1, 
                                 curveSegments: 6, 
                                 font: "droid serif", 
                                 weight: "normal", 
                                 style: "normal" });
    
    textGeo.computeBoundingBox();
    
    var text = new THREE.Mesh(textGeo,
                              new THREE.MeshPhongMaterial({color: 0xffffff}));
    
    text.position.set(0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x), 
                       8.2, 
                       0.5 * (textGeo.boundingBox.max.z - textGeo.boundingBox.min.z));
    
    this.setPosition = function(x, z) {
        cube.position.x = x;
        cube.position.z = z;
        
        text.position.set(x - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x), 
                           8.2, 
                           z - 0.5 * (textGeo.boundingBox.max.z - textGeo.boundingBox.min.z));
        return this;
    }
    
    this.setPosition(0, 0);
    scene.add(text);
    
    this.dispose = function()
    {
        scene.remove(text);
        scene.remove(cube);
    }
}

function addUser(userId, userName)
{
    //console.log("addUser: " + userId + " " + userName);
    players[userId] = new Player({name: userName, color: 0xff0000})
                                 .setPosition(Math.random() * 100 - 50, Math.random() * 100 - 50);
                                 
    
}

//WALLS
var walls = new THREE.Mesh(new THREE.BoxGeometry(100, 10, 100), 
                          new THREE.MeshLambertMaterial({ color: 0x333333 }));

walls.position.set(0, 4.9, 0);
walls.material.side = THREE.BackSide;
scene.add(walls);

//SMOKING GIRL
var smokingGirl = new THREE.Mesh(new THREE.BoxGeometry(4,4,4),
                                 new THREE.MeshPhongMaterial());
smokingGirl.material.map = THREE.ImageUtils.loadTexture("textures/smoking_girl.jpg");
smokingGirl.position.set(-8, 2, 0);
smokingGirl.rotation.y = -800;
scene.add(smokingGirl);

//FLOOR
var floorTexture = THREE.ImageUtils.loadTexture("textures/blacklodge.png");
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);

var floorMaterial = new THREE.MeshPhongMaterial({color: 0xffffff})
floorMaterial.map = floorTexture;

var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100),
                           floorMaterial);
floor.rotation.x = - Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

//LIGHT

var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(10, 7, 20);
scene.add(light);

scene.add(new THREE.AmbientLight(0x101010));

camera.position.set(0, 4, 30);

window.addEventListener("resize", function () 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});

var i = 0;

fpsControls.cameraMovementCallback = function ()
{
    if (i == 0)
    {
        sendNewPosition(camera.position.x, camera.position.z);
        i = 10;
    }
}

function render() {
    requestAnimationFrame(render);
    fpsControls.update();
    
    //Boundary checks TODO: move this stuff somewhere else, together with collision detection
    
    smokingGirl.rotation.y += 0.01;
    
    if (camera.position.y < 1)
        camera.position.y = 1;
    if (camera.position.y > 9.7)
        camera.position.y = 9.7;
    
    stats.update();
    renderer.render(scene, camera);
    if (i > 0) i--;
}

render();