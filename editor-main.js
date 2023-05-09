// Setup
import * as THREE from 'https://unpkg.com/three@0.145.0/build/three.module.js';
import { TransformControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/TransformControls.js';
import { TrackballControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/TrackballControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';
import { FlyControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/FlyControls.js';

var camera, scene, renderer, light, controls, fly, transforms, trackball, loader, sun;
var objects = [];
var materials = [];
var shapes = [];


// Terminal 
var lastRan = '';
document
    .getElementById('terminal-input')
    .addEventListener('keydown', (e) => {
        if (e.which === 13 && e.shiftKey === false) {
            e.preventDefault();
            var input = document
                .getElementById('terminal-input')
                .value;
            var level = getLevel();
            var success = 0;
            var fail = 0;
            level.levelNodes.forEach(node => {
                try {
                    eval(input);
                    success++;
                } catch (e) {
                    console.error(e)
                    fail++;
                }
                document.getElementById("terminal-input").placeholder = `[Enter] to run JS code\n[Alt] & [UpArrow] for last ran\nvar level.levelNodes.forEach(node => {})\n\n${success} success | ${fail} error${fail != 0 ? "\n[ctrl]+[shift]+[i] for details" : ""}`;
            });
            setLevel(level);
            lastRan = input
            document
                .getElementById('terminal-input')
                .value = '';
        } else if (e.which === 38 && e.altKey === true) {
            e.preventDefault();
            document
                .getElementById('terminal-input')
                .value = lastRan;
        }
    });

// Highlighting
function highlightTextEditor() {
    var textEditor = document.getElementById('edit-input');

    const editText = textEditor.innerText;

    var highlightedText = editText.replace(/([bruf]*)(\"""|'''|"|')(?:(?!\2)(?:\\.|[^\\]))*\2:?/gs, (match) => {
    if (match.endsWith(":")) {
        return `<span style="color: #dd612e">${match.slice(0,-1)}</span><span style="color: #007acc">:</span>`;
    } else {
        return `<span style="color: #487e02">${match}</span>`;
    }
    });

    highlightedText = highlightedText.replace(/<span style="color: #dd612e">"material"<\/span><span style="color: #007acc">:<\/span> ?[0-9]/gsi, (match) => {
        switch (parseInt(match.split(">")[4])) {
            case 0:
                return `<span style="background-image: url(textures/default.png); background-size: contain">${match}</span>`;
            case 1:
                return `<span style="background-image: url(textures/grabbable.png); background-size: contain">${match}</span>`;
            case 2:
                return `<span style="background-image: url(textures/ice.png); background-size: contain">${match}</span>`;
            case 3:
                return `<span style="background-image: url(textures/lava.png); background-size: contain">${match}</span>`;
            case 4:
                return `<span style="background-image: url(textures/wood.png); background-size: contain">${match}</span>`;
            case 5:
                return `<span style="background-image: url(textures/grapplable.png); background-size: contain">${match}</span>`;
            case 6:
                return `<span style="background-image: url(textures/grapplable_lava.png); background-size: contain">${match}</span>`;
            case 7:
                return `<span style="background-image: url(textures/grabbable_crumbling.png); background-size: contain">${match}</span>`;
            case 8:
                return `<span style="background-image: url(textures/default_colored.png); background-size: contain">${match}</span>`;
            case 9:
                return `<span style="background-image: url(textures/bouncing.png); background-size: contain">${match}</span>`;
            default:
                break;
        }
        return match;
    });

    textEditor.innerHTML = highlightedText;
}
var textEditor = document.getElementById('edit-input').addEventListener('blur', () => {highlightTextEditor(); refreshScene();});

var textEditor = document.getElementById('edit-input').addEventListener('keydown', (e) => {
    if (e.which === 9) {
        e.preventDefault();
        let selection = window.getSelection();
        selection.collapseToStart();
        let range = selection.getRangeAt(0);
        range.insertNode(document.createTextNode("    "));
        selection.collapseToEnd();
    }
});






loader = new GLTFLoader();
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize( window.innerWidth , window.innerHeight );
document.getElementById('render-container').appendChild( renderer.domElement );
light = new THREE.AmbientLight(0xffffff);
scene.add(light);
sun = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( sun );
controls = new OrbitControls( camera, renderer.domElement );
controls.mouseButtons = {LEFT: 2, MIDDLE: 1, RIGHT: 0}
fly = new FlyControls( camera, renderer.domElement );
fly.pointerdown = fly.pointerup = fly.pointermove = () => {};
fly.dragToLook = false;
fly.rollSpeed = 0;
fly.movementSpeed = 0.2;
addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
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

camera.position.set(0, 10, 10);

initAttributes();

function refreshScene() {
    var levelData = getLevel();
    let levelNodes = levelData["levelNodes"];
    
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

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();


// proto functions

function readArrayBuffer(file) {
    return new Promise(function(resolve, reject) {
        let reader = new FileReader();
        reader.onload = function() {
            let data = reader.result;
            var root = protobuf.parse(PROTOBUF_DATA, { keepCase: true }).root;
            // protobuf.load("proto/level.proto", function(err, root) {
                // if(err) throw err;
                console.log(root);
                let message = root.lookupType("COD.Level.Level");
                let decoded = message.decode(new Uint8Array(data));
                let object = message.toObject(decoded);
                resolve(object);
            // });
        }
        reader.onerror = function() {
            reject(reader);
        }
        reader.readAsArrayBuffer(file);
    });
}


function openJSON(link) {
    fetch(link)
        .then(response => response.json())
        .then(data => {
            setLevel(data)
        })
}
function openProto(link) {
    fetch(link)
        .then(response => response.arrayBuffer())
        .then(data => {
            let readers = [];
            let blob = new Blob([data]);
            readers.push(readArrayBuffer(blob));
            

            Promise.all(readers).then((values) => {
                setLevel(values[0]);
            });
        })
}
openProto('levels/new.level');

function openLevelFile(level) {
    let files = level;
    let readers = [];

    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
        readers.push(readArrayBuffer(files[i]));
    }

    Promise.all(readers).then((values) => {
        setLevel(values[0]);
    });
}

function appendJSON(Link) {

}
function appendLevelFile(level) {
    let files = e.target.files;
    let readers = [];

    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
        readers.push(readArrayBuffer(files[i]));
    }

    Promise.all(readers).then((values) => {
        obj = getLevel();
        obj.levelNodes += values.levelNodes;
        setLevel(JSON.stringify(obj, null, 4));
    });
}

function downloadProto(obj) {
    var root = protobuf.parse(PROTOBUF_DATA, { keepCase: true }).root;
    // protobuf.load("proto/level.proto", function(err, root) {
        // if(err) throw err;

        let message = root.lookupType("COD.Level.Level");
        let errMsg = message.verify(obj);
        if(errMsg) throw Error(errMsg);
        let buffer = message.encode(message.fromObject(obj)).finish();
        
        let blob = new Blob([buffer], {type: "application/octet-stream"});

        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = (Date.now()).toString().slice(0, -3)+".level";
        link.click();
    // });
}


// Buttons
document.getElementById('empty-btn').addEventListener( 'click', () => {
    setLevel({
        "formatVersion": 6,
        "title": "New Level",
        "creators": ".index-editor",
        "description": ".index - Level modding",
        "levelNodes": [],
        "maxCheckpointCount": 10,
        "ambienceSettings": {
            "skyZenithColor": {
                "r": 0.28,
                "g": 0.476,
                "b": 0.73,
                "a": 1
            },
            "skyHorizonColor": {
                "r": 0.916,
                "g": 0.9574,
                "b": 0.9574,
                "a": 1
            },
            "sunAltitude": 45,
            "sunAzimuth": 315,
            "sunSize": 1,
            "fogDDensity": 0
        }
    });
});

document.getElementById('json-btn').addEventListener('click', () => {
    const json = JSON.stringify(getLevel());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (Date.now()).toString().slice(0, -3)+".json";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
});

document.getElementById('pc-btn').addEventListener('click', () => {
    document.getElementById('pc-btn-input').click();
});
document.getElementById('pc-btn-input').addEventListener('change', (e) => {
    openLevelFile(e.target.files);
});
//
document.getElementById('title-btn').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'grid';
    document.getElementById('prompt-title').style.display = 'flex';
});

document.querySelector('#prompt-title .prompt-cancel').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-title').style.display = 'none';
    document.getElementById('title-prompt').value = '';
});

document.querySelector('#prompt-title .prompt-submit').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-title').style.display = 'none';
    var input = document.getElementById('title-prompt').value;
    var levelData = getLevel();
    levelData.title = input;
    setLevel(levelData);
    document.getElementById('title-prompt').value = '';
});
//
document.getElementById('description-btn').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'grid';
    document.getElementById('prompt-description').style.display = 'flex';
});

document.querySelector('#prompt-description .prompt-cancel').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-description').style.display = 'none';
    document.getElementById('description-prompt').value = '';
});

document.querySelector('#prompt-description .prompt-submit').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-description').style.display = 'none';
    var input = document.getElementById('description-prompt').value;
    var levelData = getLevel();
    levelData.description = input;
    setLevel(levelData);
    document.getElementById('description-prompt').value = '';
});
//
document.getElementById('creators-btn').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'grid';
    document.getElementById('prompt-creators').style.display = 'flex';
});

document.querySelector('#prompt-creators .prompt-cancel').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-creators').style.display = 'none';
    document.getElementById('creators-prompt').value = '';
});

document.querySelector('#prompt-creators .prompt-submit').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-creators').style.display = 'none';
    var input = document.getElementById('creators-prompt').value;
    var levelData = getLevel();
    levelData.creators = input;
    setLevel(levelData);
    document.getElementById('creators-prompt').value = '';
});
//
document.getElementById('checkpoints-btn').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'grid';
    document.getElementById('prompt-checkpoints').style.display = 'flex';
});

document.querySelector('#prompt-checkpoints .prompt-cancel').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-checkpoints').style.display = 'none';
    document.getElementById('checkpoints-prompt').value = '';
});

document.querySelector('#prompt-checkpoints .prompt-submit').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-checkpoints').style.display = 'none';
    var input = document.getElementById('checkpoints-prompt').value;
    var levelData = getLevel();
    levelData.maxCheckpointCount = parseInt(input);
    setLevel(levelData);
    document.getElementById('checkpoints-prompt').value = '';
});

document.getElementById('cleardetails-btn').addEventListener('click', () => {
    var levelData = getLevel();
    levelData.maxCheckpointCount = 0;
    levelData.title = "";
    levelData.description = "";
    levelData.creators = "";
    setLevel(levelData);
});


document.getElementById('protobuf-btn').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'grid';
    document.getElementById('prompt-protobuf').style.display = 'flex';
    document.getElementById('protobuf-prompt').value = PROTOBUF_DATA;
});

document.querySelector('#prompt-protobuf .prompt-cancel').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-protobuf').style.display = 'none';
    document.getElementById('protobuf-prompt').value = PROTOBUF_DATA;
});

document.getElementById('topc-btn').addEventListener('click', () => {
    downloadProto(getLevel());
});

document.querySelector('#prompt-protobuf .prompt-submit').addEventListener('click', () => {
    document.getElementById('prompts').style.display = 'none';
    document.getElementById('prompt-protobuf').style.display = 'none';
    var input = document.getElementById('protobuf-prompt').value;
    PROTOBUF_DATA = input;
});


// Main
var PROTOBUF_DATA = `
syntax = "proto3";

package COD.Level;

message Level
{
  uint32 formatVersion = 1;

  string title = 2;
  string creators = 3;
  string description = 4;
  uint32 complexity = 5;
  uint32 maxCheckpointCount = 7;

  AmbienceSettings ambienceSettings = 8;

  repeated LevelNode levelNodes = 6;
}

message Vector
{
	float x = 1;
	float y = 2;
	float z = 3;
}

message Quaternion
{
	float x = 1;
	float y = 2;
	float z = 3;
	float w = 4;
}

message Color
{
	float r = 1;
	float g = 2;
	float b = 3;
	float a = 4;
}

message AmbienceSettings
{
	Color skyZenithColor = 1;
	Color skyHorizonColor = 2;

	float sunAltitude = 3;
	float sunAzimuth = 4;
	float sunSize = 5;

	float fogDDensity = 6;
}

enum LevelNodeShape
{
	START = 0;
	FINISH = 1;
	SIGN = 2;

	__END_OF_SPECIAL_PARTS__ = 3;

	CUBE = 1000;
	SPHERE = 1001;
	CYLINDER = 1002;
	PYRAMID = 1003;
	PRISM = 1004;
}

enum LevelNodeMaterial
{
	DEFAULT = 0;
	GRABBABLE = 1;
	ICE = 2;
	LAVA = 3;
	WOOD = 4;
	GRAPPLABLE = 5;
	GRAPPLABLE_LAVA = 6;

	GRABBABLE_CRUMBLING= 7;
	DEFAULT_COLORED = 8;
	BOUNCING = 9;
}

message LevelNodeGroup
{
	Vector position = 1;
	Vector scale = 2;
	Quaternion rotation = 3;

	repeated LevelNode childNodes = 4;
}

message LevelNodeStart
{
	Vector position = 1;
	Quaternion rotation = 2;
	float radius = 3;
}

message LevelNodeFinish
{
	Vector position = 1;
	float radius = 2;
}

message LevelNodeStatic
{
	LevelNodeShape shape = 1;
	LevelNodeMaterial material = 2;

	Vector position = 3;
	Vector scale = 4;
	Quaternion rotation = 5;

	Color color = 6;
	bool isNeon = 7;
}

message LevelNodeCrumbling
{
	LevelNodeShape shape = 1;
	LevelNodeMaterial material = 2;

	Vector position = 3;
	Vector scale = 4;
	Quaternion rotation = 5;

	float stableTime = 6;
	float respawnTime = 7;
}

message LevelNodeSign
{
	Vector position = 1;
	Quaternion rotation = 2;

	string text = 3;
}

message AnimationFrame
{
	float time = 1;
	Vector position = 2;
	Quaternion rotation = 3;
}

message Animation
{
	enum Direction
	{
		RESTART = 0;
		PINGPONG = 1;
	}

	string name = 1;
	repeated AnimationFrame frames = 2;
	Direction direction = 3;
	float speed = 4;
}

message LevelNode
{
	bool isLocked = 6;

	oneof content
	{
		LevelNodeStart levelNodeStart = 1;
		LevelNodeFinish levelNodeFinish = 2;
		LevelNodeStatic levelNodeStatic = 3;
		LevelNodeSign levelNodeSign = 4;
		LevelNodeCrumbling levelNodeCrumbling = 5;
		LevelNodeGroup levelNodeGroup = 7;
	}

	//A level node can have any number (might limit it in the UI) of named animations, if groups are involved every block that is part of the same animation should have an animation with the same name
	repeated Animation animations = 15;
}
`

highlightTextEditor();
refreshScene();

function getLevel() {
    return JSON.parse(document.getElementById('edit-input').innerText);
}
function setLevel(level) {
    if (level.formatVersion != 6) {
        document.getElementById('warning').style.display = "block";
    } else {
        document.getElementById('warning').style.display = "none";
    }
    document.getElementById('edit-input').innerText = JSON.stringify(level, null, 4);
    highlightTextEditor();
    refreshScene();
}
