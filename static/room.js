function buildRoom(scene)
{
    //WALLS
    var wallTexture = THREE.ImageUtils.loadTexture( "textures/ba2.png" );
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set( 100, 20);

    var wallMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    wallMaterial.map = wallTexture;

    var walls = new THREE.Mesh(new THREE.BoxGeometry(100, 20, 100), wallMaterial );

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
    var floorTexture = THREE.ImageUtils.loadTexture("textures/tex.jpg");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(32, 32);

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
}