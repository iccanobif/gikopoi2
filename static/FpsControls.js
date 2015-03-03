var FpsControls = function(camera, canvas, options)
{
    var godMode = true;
    var angles = new THREE.Vector2(0, 0);
    var moveLeft = false;
    var moveRight = false;
    var moveForward = false;
    var moveBackwards = false;
    
    this.cameraMovementCallback = null;
    this.cameraRotationCallback = null;
    this.positionValidationCallback = null;
    
    if (options != undefined)
        if (options["godMode"] != undefined)
            godMode = options["godMode"];

    camera.lookAt(new THREE.Vector3(camera.position.x,
                                    camera.position.y,
                                    camera.position.z - 1));
    
    //
    //KEYBOARD STUFF
    //

    window.addEventListener("keydown", function (event) 
    {
        if (document.pointerLockElement != canvas &&
            document.mozPointerLockElement != canvas &&
            document.webkitPointerLockElement != canvas)
            return;
        
        switch (String.fromCharCode(event.keyCode))
        {
            case "A": moveLeft = true;      moveRight = false;     break;
            case "D": moveRight = true;     moveLeft = false;      break;
            case "W": moveForward = true;   moveBackwards = false; break;
            case "S": moveBackwards = true; moveForward = false;   break;
        }
    });
    
    window.addEventListener("keyup", function (event) 
    {
        if (document.pointerLockElement != canvas &&
            document.mozPointerLockElement != canvas &&
            document.webkitPointerLockElement != canvas)
            return;
        
        switch (String.fromCharCode(event.keyCode))
        {
            case "A": moveLeft = false;      break;
            case "D": moveRight = false;     break;
            case "W": moveForward = false;   break;
            case "S": moveBackwards = false; break;
        }
    });
    
    this.update = function()
    {
        if (moveLeft) camera.translateX(-1);
        if (moveRight) camera.translateX(1);
        if (moveForward) 
            if (godMode)
                camera.translateZ(-1);
            else
            {
                camera.position.x = camera.position.x + Math.sin(angles.x);
                camera.position.z = camera.position.z - Math.cos(angles.x);
            }
        if (moveBackwards) 
            if (godMode)
                camera.translateZ(1);
            else
            {
                camera.position.x = camera.position.x - Math.sin(angles.x);
                camera.position.z = camera.position.z + Math.cos(angles.x);
            }
        
        if (moveLeft || moveRight || moveForward || moveBackwards)
            if (this.cameraMovementCallback != null)
                this.cameraMovementCallback();
    }
    
    //
    //MOUSE STUFF
    //
    
    function handleMouseMovements(e)
    {
        var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        
        angles.x += movementX/400;
        angles.y -= movementY/400;
        if (angles.y > Math.PI / 2 - 0.001) angles.y = Math.PI / 2 - 0.001; 
        if (angles.y < - Math.PI / 2 + 0.001) angles.y = - Math.PI / 2 + 0.001;

        camera.lookAt(new THREE.Vector3(camera.position.x + Math.sin(angles.x) * Math.cos(angles.y),
                                        camera.position.y + Math.sin(angles.y),
                                        camera.position.z - Math.cos(angles.x) * Math.cos(angles.y)));
                                        
        if (this.cameraRotationCallback != null)
            this.cameraRotationCallback();
    }
    
    canvas.requestPointerLock = canvas.requestPointerLock ||
               canvas.mozRequestPointerLock ||
               canvas.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
             document.mozExitPointerLock ||
             document.webkitExitPointerLock;
    
    canvas.addEventListener("click", canvas.requestPointerLock, false);
    
    function lockChangeAlert() 
    {
        if(document.pointerLockElement === canvas ||
                document.mozPointerLockElement === canvas ||
                document.webkitPointerLockElement === canvas) 
            document.addEventListener("mousemove", handleMouseMovements, false);
        else 
            document.removeEventListener("mousemove", handleMouseMovements, false);
    }
    
    document.addEventListener("pointerlockchange", lockChangeAlert, false);
    document.addEventListener("mozpointerlockchange", lockChangeAlert, false);
    document.addEventListener("webkitpointerlockchange", lockChangeAlert, false);

}

