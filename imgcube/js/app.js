'use strict';

Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
var initScene, renderer, scene, camera, am_light,
dir_light, block_material, render, createTower, blocks = [],  intersect_plane,
table, table_material,
selected_block = null, mouse_position = new THREE.Vector3, block_offset = new THREE.Vector3, _i, _v3 = new THREE.Vector3;
var image = 'demo.jpg';

initScene = function(){
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    document.getElementById( 'viewport' ).appendChild( renderer.domElement );
    scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
    scene.setGravity(new THREE.Vector3( 0, -60, 0 ));
    scene.addEventListener(
        'update',
        function() {

            if ( selected_block !== null ) {
                _v3.copy( mouse_position ).add( block_offset ).sub( selected_block.position ).multiplyScalar( 5 );
                _v3.y = 0;
                selected_block.setLinearVelocity( _v3 );
                // Reactivate all of the blocks
                _v3.set( 0, 0, 0 );
                for ( _i = 0; _i < blocks.length; _i++ ) {
                    blocks[_i].applyCentralImpulse( _v3 );
                }
            }
            scene.simulate( undefined, 1 );
            //physics_stats.update();
        }
    );
    camera = new THREE.PerspectiveCamera(
            90,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
    camera.position.set( 0, 0, 7);
    camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
    scene.add( camera );
    
    // ambient light
    am_light = new THREE.AmbientLight( 0x444444 );
    scene.add( am_light );

    // directional light
    dir_light = new THREE.DirectionalLight( 0xFFFFFF );
    dir_light.position.set( 10, 50, 150);
    dir_light.target.position.copy( scene.position );
    dir_light.castShadow = true;
    dir_light.shadowCameraLeft = -30;
    dir_light.shadowCameraTop = -30;
    dir_light.shadowCameraRight = 30;
    dir_light.shadowCameraBottom = 30;
    dir_light.shadowCameraNear = 200;
    dir_light.shadowCameraFar = 200;
    dir_light.shadowBias = -.001
    dir_light.shadowMapWidth = dir_light.shadowMapHeight = 2048;
    dir_light.shadowDarkness = .5;
    scene.add( dir_light );

    // Materials
    table_material = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ color: 0x888888, opacity: 0 }),
        .9, // high friction
        .2 // low restitution
    );        

    block_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( image , new THREE.UVMapping()), ambient: 0xFFFFFF }),
            .4, // medium friction
            .4 // medium restitution
        );
    block_material.map.wrapS = block_material.map.wrapT = THREE.RepeatWrapping;
    block_material.map.repeat.set( 1, 1 );

// Table
        table = new Physijs.BoxMesh(
            new THREE.CubeGeometry(50, 1, 10),
            table_material,
            0, // mass
            { restitution: .2, friction: .8 }
        );
        table.position.y = -.5;
        table.receiveShadow = true;
        scene.add( table );

    createTower();

    intersect_plane = new THREE.Mesh(
        new THREE.PlaneGeometry( 150, 150 ),
        new THREE.MeshBasicMaterial({ opacity: 0, transparent: true })
    );
    intersect_plane.rotation.x = Math.PI / -2;
    scene.add( intersect_plane );

    requestAnimationFrame( render );
    scene.simulate();

};

render = function() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
    //render_stats.update();
};

createTower = (function() {
    var block_length = 1, block_height = 1, block_width = 1, block_offset = 1,
        block_geometry = new THREE.CubeGeometry( block_length, block_height, block_width );
    
    return function() {
        block = new Physijs.BoxMesh( block_geometry, block_material );
        console.log(block);

        var i, j, k, rows = 10, block;
        for(k = 0; k< 2; k++){
            for(i = 0; i< rows; i++){
                for ( j = 0; j < rows; j++ ) {
                    block = new Physijs.BoxMesh( block_geometry, block_material );
                    block.overdraw = true;
                    block.position.y = (block_width / 2) + block_width * i;
                    block.position.x = block_offset * j - ( block_offset * 3 / 2 - block_offset / 2 );
                    block.position.z = k;
                    block.receiveShadow = true;
                    block.castShadow = true;

                    //block.material.map.offset.x = 0.4;
                    //block.material.map.offset.y = 0.4;
                    //block.material.map.offset.set(k/2, k/2);
                    //block.material.map.repeat.set( k/10, k/10 );
                    scene.add( block );
                    blocks.push( block );
                }
            }
        }
    }
})();


window.onload = initScene;