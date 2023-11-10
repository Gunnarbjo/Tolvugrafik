import * as THREE from 'three';


const lasers = []; // Array to keep track of lasers

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


let activeCamera = camera;
function toggleCamera() {
    activeCamera = (activeCamera === camera) ? camera2 : camera;
    if (activeCamera === camera2) {
        // Attach camera2 to the player
        player.add(camera2);

        // Position the camera above and slightly behind the player, relative to the player
        camera2.position.set(0, -1.5,1 ); // Position camera above (y = 1) and behind (z = 1) the player

        // Rotate the camera to look up along the Y-axis
        camera2.rotation.x = Math.PI / 2;
    } else {
        // When switching back to the main camera, detach camera2 from the player
        player.remove(camera2);
        scene.add(camera2); // Add camera2 back to the scene directly
    }
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize( 1120, 1050 );
renderer.domElement.style.position = 'absolute'; // Position the canvas element absolutely
renderer.domElement.style.top = '50%'; // Align the top edge of the canvas to the vertical center of the screen
renderer.domElement.style.left = '50%'; // Align the left edge of the canvas to the horizontal center of the screen
renderer.domElement.style.transform = 'translate(-50%, -50%)'; // Offset the canvas by half of its width and height to center it
document.body.appendChild( renderer.domElement );

const playerGeometry = new THREE.BoxGeometry( 0.2, 0.5, 0.2 );
const playerMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );

const player = new THREE.Mesh( playerGeometry, playerMaterial );
player.position.y = -1 * (window.innerHeight / 2) / 100;
player.position.z = -5;
scene.add( player );

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
    for (let i = lasers.length - 1; i >= 0; i--) {
        let laser = lasers[i];
        laser.position.y += 0.1; // Adjust speed as necessary

    }
	renderer.render( scene, activeCamera );
}
animate();

function createLaser() {
    const playerHeight = 0.5; // Assuming this is the player's height
    const laserLength = playerHeight / 4;
    const laserRadius = laserLength / 4; // Adjust the radius as needed

    const laserGeometry = new THREE.CylinderGeometry(laserRadius, laserRadius, laserLength, 32);
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);

    laser.rotation.x = Math.PI / 2; // Rotate the cylinder to point forward
    return laser;
}

// Function to handle arrow key presses
function onDocumentKeyDown(event) {
	var keyCode = event.which;
	// Arrow keys have the following keyCodes: 37 (left), 38 (up), 39 (right), 40 (down)
	if (keyCode == 37) {
		player.position.x -= 0.5; // Move left
	} else if (keyCode == 38) {
		player.position.y += 0.1; // Move up
	} else if (keyCode == 39) {
		player.position.x += 0.5; // Move right
	} else if (keyCode == 40) {
		player.position.y -= 0.1; // Move down
	}
	if (keyCode == 32) { // Spacebar
        const laser = createLaser();
        laser.position.set(player.position.x, player.position.y, player.position.z);
        scene.add(laser);
        lasers.push(laser);
    }

}

// Attach event listener to the document
document.addEventListener("keydown", onDocumentKeyDown, false);
document.querySelector('.toggle-button').addEventListener('click', toggleCamera);

