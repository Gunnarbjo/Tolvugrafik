import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( 1120, 1050 );
renderer.domElement.style.position = 'absolute'; // Position the canvas element absolutely
renderer.domElement.style.top = '50%'; // Align the top edge of the canvas to the vertical center of the screen
renderer.domElement.style.left = '50%'; // Align the left edge of the canvas to the horizontal center of the screen
renderer.domElement.style.transform = 'translate(-50%, -50%)'; // Offset the canvas by half of its width and height to center it
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 0.2, 0.5, 0.2 );
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

const cube = new THREE.Mesh( geometry, material );
cube.position.y = -1 * (window.innerHeight / 2) / 100;
cube.position.z = -5;
scene.add( cube );

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

// Function to handle arrow key presses
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    // Arrow keys have the following keyCodes: 37 (left), 38 (up), 39 (right), 40 (down)
    if (keyCode == 37) {
        cube.position.x -= 0.2; // Move left
    } else if (keyCode == 38) {
        cube.position.y += 0.2; // Move up
    } else if (keyCode == 39) {
        cube.position.x += 0.1; // Move right
    } else if (keyCode == 40) {
        cube.position.y -= 0.1; // Move down
    }
}

// Attach event listener to the document
document.addEventListener("keydown", onDocumentKeyDown, false);
