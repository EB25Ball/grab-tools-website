import * as THREE from 'https://unpkg.com/three@0.145.0/build/three.module.js';
import { TransformControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/TransformControls.js';
import { TrackballControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/TrackballControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer, light, controls, transforms, trackball, loader, sun;
let objects = [];
let materials = [];
let shapes = [];

loader = new GLTFLoader();
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera( 75, window.innerWidth * .8 / window.innerWidth * .8, 0.1, 10000 );
renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize( window.innerWidth * .8, window.innerWidth * .8 );
document.getElementById('visual').appendChild( renderer.domElement );
light = new THREE.AmbientLight(0xffffff);
scene.add(light);
sun = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( sun );
controls = new OrbitControls( camera, renderer.domElement );
controls.mouseButtons = {LEFT: 2, MIDDLE: 1, RIGHT: 0}
controls.keys = {
	LEFT: 65,
	UP: 87,
	RIGHT: 68,
	BOTTOM: 83
}
addEventListener('resize', () => {
    camera.aspect = window.innerWidth * .8 / window.innerWidth * .6;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth * .8, window.innerWidth * .6 );
});
function initAttributes() {
    const attribPromises = [];
    let texture;
    [
    'textures/default.png',
    'textures/grabbable.png',
    'textures/ice.png',
    'textures/lava.png',
    'textures/wood.png',
    'textures/grapplable.png',
    'textures/grapplable_lava.png',
    'textures/grabbable_crumbling.png',
    'textures/default_colored.png',
    'textures/bouncing.png'
    ].forEach(path => {
        const attribPromise = new Promise((resolve) => {
            texture = new THREE.TextureLoader().load(path, function( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 2, 2 );
            });
            let material = new THREE.MeshBasicMaterial({ map: texture });
            materials.push(material);
            resolve();
        });
        attribPromises.push(attribPromise);
    });
    [
        'models/cube.glb',
        'models/sphere.glb',
        'models/cylinder.glb',
        'models/pyramid.glb',
        'models/prism.glb',
        'models/sign.glb',
        'models/start_end.glb'
    ].forEach(path => {
        const attribPromise = new Promise((resolve) => {
            loader.load(path, function( gltf ) {
                let glftScene = gltf.scene;
                shapes.push(glftScene.children[0]);
                resolve();
            });
        });
        attribPromises.push(attribPromise);
    });
    Promise.all(attribPromises).then(() => {
        console.log('Ready');
    });
}
function loadLevelNode(node, parent) {
    if (node.levelNodeGroup) {
        let cube = new THREE.Object3D()
        objects.push( cube );
        parent.add( cube );
        node.levelNodeGroup.position.x ? cube.position.x = node.levelNodeGroup.position.x : cube.position.x = 0;
        node.levelNodeGroup.position.y ? cube.position.y = node.levelNodeGroup.position.y : cube.position.y = 0;
        node.levelNodeGroup.position.z ? cube.position.z = node.levelNodeGroup.position.z : cube.position.z = 0;
        node.levelNodeGroup.scale.x ? cube.scale.x = node.levelNodeGroup.scale.x : cube.scale.x = 0;
        node.levelNodeGroup.scale.y ? cube.scale.y = node.levelNodeGroup.scale.y : cube.scale.y = 0;
        node.levelNodeGroup.scale.z ? cube.scale.z = node.levelNodeGroup.scale.z : cube.scale.z = 0;
        node.levelNodeGroup.rotation.x ? cube.quaternion.x = node.levelNodeGroup.rotation.x : cube.quaternion.x = 0;
        node.levelNodeGroup.rotation.y ? cube.quaternion.y = node.levelNodeGroup.rotation.y : cube.quaternion.y = 0;
        node.levelNodeGroup.rotation.z ? cube.quaternion.z = node.levelNodeGroup.rotation.z : cube.quaternion.z = 0;
        node.levelNodeGroup.rotation.w ? cube.quaternion.w = node.levelNodeGroup.rotation.w : cube.quaternion.w = 0;
        let groupComplexity = 0;
        node.levelNodeGroup.childNodes.forEach(node => {
            groupComplexity += loadLevelNode(node, cube);
        });
        return groupComplexity;
    } else if (node.levelNodeStatic) { 
        node = node.levelNodeStatic;
        var cube = shapes[node.shape-1000].clone();
        let material;
        node.material ? material = materials[node.material].clone() : material = materials[0].clone();
        if (node.material == 8) {
            // let colorMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(node.color.r, node.color.g, node.color.b) });
            // material.transparent = true;
            // material.opacity = 0.5;
            // material = [ colorMaterial, material ];
            node.color.r ? null : node.color.r = 0;
            node.color.g ? null : node.color.g = 0;
            node.color.b ? null : node.color.b = 0;
            material.color = new THREE.Color(node.color.r, node.color.g, node.color.b);
        }
        cube.material = material;
        // var cube = new THREE.Mesh(shapes[node.shape-1000], materials[node.material]);
        node.position.x ? cube.position.x = node.position.x : cube.position.x = 0;
        node.position.y ? cube.position.y = node.position.y : cube.position.y = 0;
        node.position.z ? cube.position.z = node.position.z : cube.position.z = 0;
        node.rotation.w ? cube.quaternion.w = node.rotation.w : cube.quaternion.w = 1;
        node.rotation.x ? cube.quaternion.x = node.rotation.x : cube.quaternion.x = 0;
        node.rotation.y ? cube.quaternion.y = node.rotation.y : cube.quaternion.y = 0;
        node.rotation.z ? cube.quaternion.z = node.rotation.z : cube.quaternion.z = 0;
        node.scale.x ? cube.scale.x = node.scale.x : cube.scale.x = 1;
        node.scale.y ? cube.scale.y = node.scale.y : cube.scale.y = 1;
        node.scale.z ? cube.scale.z = node.scale.z : cube.scale.z = 1;
        parent.add(cube);
        objects.push(cube);
        return 2;
    } else if (node.levelNodeCrumbling) {
        node = node.levelNodeCrumbling;
        var cube = shapes[node.shape-1000].clone();
        node.material ? cube.material = materials[node.material] : cube.material = materials[0];
        // var cube = new THREE.Mesh(shapes[node.shape-1000], materials[node.material]);
        node.position.x ? cube.position.x = node.position.x : cube.position.x = 0;
        node.position.y ? cube.position.y = node.position.y : cube.position.y = 0;
        node.position.z ? cube.position.z = node.position.z : cube.position.z = 0;
        node.rotation.w ? cube.quaternion.w = node.rotation.w : cube.quaternion.w = 1;
        node.rotation.x ? cube.quaternion.x = node.rotation.x : cube.quaternion.x = 0;
        node.rotation.y ? cube.quaternion.y = node.rotation.y : cube.quaternion.y = 0;
        node.rotation.z ? cube.quaternion.z = node.rotation.z : cube.quaternion.z = 0;
        node.scale.x ? cube.scale.x = node.scale.x : cube.scale.x = 1;
        node.scale.y ? cube.scale.y = node.scale.y : cube.scale.y = 1;
        node.scale.z ? cube.scale.z = node.scale.z : cube.scale.z = 1;
        parent.add(cube);
        objects.push(cube);
        return 3;
    } else if (node.levelNodeSign) {
        node = node.levelNodeSign;
        var cube = shapes[5].clone();
        cube.material = materials[4];
        node.position.x ? cube.position.x = node.position.x : cube.position.x = 0;
        node.position.y ? cube.position.y = node.position.y : cube.position.y = 0;
        node.position.z ? cube.position.z = node.position.z : cube.position.z = 0;
        node.rotation.w ? cube.quaternion.w = node.rotation.w : cube.quaternion.w = 1;
        node.rotation.x ? cube.quaternion.x = node.rotation.x : cube.quaternion.x = 0;
        node.rotation.y ? cube.quaternion.y = node.rotation.y : cube.quaternion.y = 0;
        node.rotation.z ? cube.quaternion.z = node.rotation.z : cube.quaternion.z = 0;
        parent.add(cube);
        objects.push(cube);
        return 5;
    } else if (node.levelNodeStart) {
        node = node.levelNodeStart;
        var cube = shapes[6].clone();
        cube.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
        node.position.x ? cube.position.x = node.position.x : cube.position.x = 0;
        node.position.y ? cube.position.y = node.position.y : cube.position.y = 0;
        node.position.z ? cube.position.z = node.position.z : cube.position.z = 0;
        node.rotation.w ? cube.quaternion.w = node.rotation.w : cube.quaternion.w = 1;
        node.rotation.x ? cube.quaternion.x = node.rotation.x : cube.quaternion.x = 0;
        node.rotation.y ? cube.quaternion.y = node.rotation.y : cube.quaternion.y = 0;
        node.rotation.z ? cube.quaternion.z = node.rotation.z : cube.quaternion.z = 0;
        node.radius ? cube.scale.x = node.radius : cube.scale.x = 1;
        node.radius ? cube.scale.z = node.radius : cube.scale.z = 1;
        parent.add(cube);
        objects.push(cube);
        return 0;
    } else if (node.levelNodeFinish) {
        node = node.levelNodeFinish;
        var cube = shapes[6].clone();
        cube.material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
        node.position.x ? cube.position.x = node.position.x : cube.position.x = 0;
        node.position.y ? cube.position.y = node.position.y : cube.position.y = 0;
        node.position.z ? cube.position.z = node.position.z : cube.position.z = 0;
        node.radius ? cube.scale.x = node.radius : cube.scale.x = 1;
        node.radius ? cube.scale.z = node.radius : cube.scale.z = 1;
        parent.add(cube);
        objects.push(cube);
        return 0;
    } else {
        return 0;
    }
}

function loadScene() {
    let data = JSON.parse(document.getElementById('out').value);
    let levelNodes = data["levelNodes"];

    let complexity = 0;
    objects = [];
    scene.clear();

    levelNodes.forEach((node) => {
        complexity += loadLevelNode(node, scene);
    });

    // console.log(complexity);
    document.getElementById('complexity').innerText = `Complexity: ${complexity}`;

    renderer.render( scene, camera );
}
initAttributes();
loadScene();
document.getElementById('out').addEventListener('change', loadScene);
document.getElementById('refresh').addEventListener('click', loadScene);
document.getElementById('goto-start').addEventListener('click', () => {
    let data = JSON.parse(document.getElementById('out').value);
    data["levelNodes"].forEach(node => {
        if (node.levelNodeStart) {
            let x, y, z;
            node.levelNodeStart.x ? x = node.levelNodeStart.x : x = 0;
            node.levelNodeStart.y ? y = node.levelNodeStart.y : y = 0;
            node.levelNodeStart.z ? z = node.levelNodeStart.z : z = 0;
            camera.position.x = x;
            camera.position.y = y;
            camera.position.z = z;
            // camera.zoom = 1;
        }
    });
});
document.querySelector('#fullscreenButton').addEventListener('click', () => {
    var canvas = renderer.domElement;
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) { /* Firefox */
      canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { /* IE/Edge */
      canvas.msRequestFullscreen();
    }
});
document.getElementById('functions').addEventListener('click', (e) => {
    if (e.target.nodeName == 'INPUT') {
        loadScene();
    }
});
camera.position.set(0, 10, 10);

function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}

animate();