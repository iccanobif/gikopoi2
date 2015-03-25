var Room = function(roomId) {
    //TODO: roomId is used to load the right XML map
    
    this.objs = {};
    
    //called at first when initializing the room
    this.buildRoom = function(scene) {
        
        //WALLS
        var wallTexture = THREE.ImageUtils.loadTexture( "textures/ba2.png" );
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set( 100, 20);

        var wallMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
        wallMaterial.map = wallTexture;

        this.objs.walls = new THREE.Mesh(new THREE.BoxGeometry(100, 20, 100), wallMaterial );

        this.objs.walls.position.set(0, 9.9, 0); 
        this.objs.walls.material.side = THREE.BackSide;
        this.objs.walls.receiveShadow =  true;
        scene.add(this.objs.walls);

        //SMOKING GIRL
        this.objs.smokingGirl = new THREE.Mesh(new THREE.BoxGeometry(10,10,10),
                                         new THREE.MeshPhongMaterial());
        this.objs.smokingGirl.material.map = THREE.ImageUtils.loadTexture("textures/smoking_girl.jpg");
        this.objs.smokingGirl.position.set(0, 5, 0);
        this.objs.smokingGirl.rotation.y = 100;
        scene.add(this.objs.smokingGirl);

        //SMOKING GIRL2
        this.objs.smokingGirl2 = new THREE.Mesh(new THREE.BoxGeometry(10,10,10),
                                         new THREE.MeshPhongMaterial());
        this.objs.smokingGirl2.material.map = THREE.ImageUtils.loadTexture("textures/smoking_girl.jpg");
        this.objs.smokingGirl2.position.set(0, 15, 0);
        this.objs.smokingGirl2.rotation.y = 50;
        scene.add(this.objs.smokingGirl2);

        //FLOOR
        var floorTexture = THREE.ImageUtils.loadTexture("textures/tex.jpg");
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(32, 32);

        var floorMaterial = new THREE.MeshPhongMaterial({color: 0xffffff})
        floorMaterial.map = floorTexture;

        this.objs.floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100),
                                   floorMaterial);
        this.objs.floor.rotation.x = - Math.PI / 2;
        this.objs.floor.position.y = 0;
        this.objs.floor.receiveShadow = true;
        scene.add(this.objs.floor);

        //LIGHT

        this.objs.light = new THREE.PointLight(0xffffff, 1, 0);
        this.objs.light.position.set(23, 7, 30);

        scene.add(this.objs.light);
        
        this.objs.ambientLight = new THREE.AmbientLight(0x101010)

        scene.add(this.objs.ambientLight);
        
    };
    //called at every frame, in order to animate pieces of forniture or stuff like that
 
    this.update = function() {
        this.objs.smokingGirl.rotation.y += 0.1;
        this.objs.smokingGirl2.rotation.y -= 0.1;
    };
    //returns true or false 
    //(alternatively, it could return a set of alternative coordinates to move to, if the give ones are no good, 
    //so the player can move diagonally towards a wall without getting stuck: if one of the coordinates is unwalkable, replace it with the nearest walkable one)
    this.isWalkable = function(x, z) {
        return false;
    };
    //removes every object, called when switching to another room
    this.disposeRoom = function(scene)
    {
        
    };
    
};

function buildRoom(scene)
{

}