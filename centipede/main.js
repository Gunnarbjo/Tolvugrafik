import * as THREE from 'three';

let score = 0;
const lasers = []; // Array to keep track of lasers
const mushrooms = []; // Array to keep track of mushrooms
let oldPlayerPosition = new THREE.Vector3(); // Initialize with a default position

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );


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
// Create canvas and set it's sise in the middle of the window
const multiplyer = 50;
const canvasInnerWidth = 16 * multiplyer;
const canvasInnerHeight = 15 * multiplyer;
renderer.setSize( canvasInnerWidth, canvasInnerHeight );
renderer.domElement.style.position = 'absolute'; // Position the canvas element absolutely
renderer.domElement.style.top = '50%'; // Align the top edge of the canvas to the vertical center of the screen
renderer.domElement.style.left = '50%'; // Align the left edge of the canvas to the horizontal center of the screen
renderer.domElement.style.transform = 'translate(-50%, -50%)'; // Offset the canvas by half of its width and height to center it
document.body.appendChild( renderer.domElement );

const playerWidthX = 0.2;
const playerHeightY = 0.1;
const playerDeapthZ = 0.2;

const playerGeometry = new THREE.BoxGeometry( playerWidthX, playerHeightY, playerDeapthZ );
const playerMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );

const player = new THREE.Mesh( playerGeometry, playerMaterial );
player.position.y = (-1 * (canvasInnerWidth / 2) / 100) + playerHeightY * 10;
player.position.x = 0;
player.position.z = 0;
scene.add( player );

camera.position.z = 5;

function createMushroom() {
    // Smaller radius for the mushroom cap
    const capRadius = 0.15; // Adjust this value to make the cap smaller

    // Keep the stem dimensions unchanged
    const stemRadius = 0.1;  
    const stemHeight = 0.2;  

    // Create mushroom cap (sphere)
    const capGeometry = new THREE.SphereGeometry(capRadius, 32, 32);
    const capMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 }); // Yellow color for the cap
    const cap = new THREE.Mesh(capGeometry, capMaterial);

    // Create mushroom stem (cylinder)
    const stemGeometry = new THREE.CylinderGeometry(stemRadius, stemRadius, stemHeight, 32);
    const stemMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF }); // White color for the stem
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);

    // Position the cap on top of the stem
    cap.position.y = stemHeight / 2; // Adjust so the cap is positioned correctly on the stem

    // Create an empty object to group cap and stem
    const mushroom = new THREE.Object3D();
    mushroom.add(cap);
    mushroom.add(stem);

    // Rotate the mushroom 90 degrees (π/2 radians) on the x-axis
    mushroom.rotation.x = Math.PI / 2;

	mushroom.hits = 0; // To track the number if hits on the mushroom

    return mushroom;
}

function createRandomMushrooms() {
    const minMushrooms = 14; // Minimum number of mushrooms
    const maxMushrooms = 20; // Maximum number of mushrooms
    const numMushrooms = Math.floor(Math.random() * (maxMushrooms - minMushrooms + 1)) + minMushrooms;

    // Canvas boundaries for x-coordinate
    const minX = (-(canvasInnerWidth/100) / 2) - 2;
    const maxX = ((canvasInnerWidth/100) / 2) + 2;

    // Canvas boundaries for y-coordinate, excluding the lowest 25%
    const minY = (-canvasInnerHeight/100) / 4; // Start from 25% above the bottom
    const maxY = (canvasInnerHeight/100) / 4;  // Up to the top

    for (let i = 0; i < numMushrooms; i++) {
        const mushroom = createMushroom();

        // Generate random positions within the designated area
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;

        // Set the mushroom's position
        mushroom.position.set(x, y, 0); // Z-coordinate is set to 0 (ground level)
        scene.add(mushroom);
		mushrooms.push(mushroom); // Add each created mushroom to the array
    }
}

createRandomMushrooms();



createRandomMushrooms();


function animate() {
	requestAnimationFrame( animate );
    for (let i = lasers.length - 1; i >= 0; i--) {
        let laser = lasers[i];
        laser.position.y += 0.1; // Adjust speed as necessary


    }
	// Check to see if mushrooms and laser collide
	checkLaserMushroomCollisions();
	// Check and reset player position if out of bounds
	checkBoundsAndResetPlayer();
	renderer.render( scene, activeCamera );
	const oldplayer = player.position;
}
animate();

function createLaser() {
    const playerHeight = playerHeightY; // Assuming this is the player's height
    const laserLength = playerHeight / 2;
    const laserRadius = laserLength / 2; // Adjust the radius as needed

    const laserGeometry = new THREE.CylinderGeometry(laserRadius, laserRadius, laserLength, 32);
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);

    laser.rotation.x = Math.PI / 2; // Rotate the cylinder to point forward
    return laser;
}

function checkBoundsAndResetPlayer() {
    // Define the boundaries of the canvas
	const ciw = canvasInnerWidth / 100;
	const cih = canvasInnerHeight / 100;
	
    const minX = (-ciw / 2) - 2;
    const maxX = (ciw / 2) + 2;
    const minY = -cih / 2;
    const maxY = -2;

    // Check if the player is outside the boundaries
    if (player.position.x < minX || player.position.x > maxX || 
        player.position.y < minY || player.position.y > maxY) {
        
        // Reset player position to old position
        player.position.copy( oldPlayerPosition );
    }
}

function checkLaserMushroomCollisions() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        let laser = lasers[i];
        for (let j = mushrooms.length - 1; j >= 0; j--) {
            let mushroom = mushrooms[j];
            if (isCollision(laser, mushroom)) {
                mushroom.hits += 1; // Increment hit count

                if (mushroom.hits >= 4) {
                    // Remove mushroom if hit 5 times
                    scene.remove(mushroom);
                    mushrooms.splice(j, 1);
                } else {
                    // Reduce mushroom size by 20%
                    mushroom.scale.x *= 0.75;
                    mushroom.scale.y *= 0.75;
                    mushroom.scale.z *= 0.75;
                }

                // Remove laser from scene and array
                scene.remove(laser);
                lasers.splice(i, 1);

                // Increment score
                score++;
				updateScoreDisplay();
                // Break out of the inner loop since the laser has been removed
                break;
            }
        }
    }
}

function isCollision(laser, mushroom) {
    // Simple distance check (point-based collision)
    const distance = laser.position.distanceTo(mushroom.position);
    const collisionThreshold = 0.5; // Adjust as needed
    return distance < collisionThreshold;
}


// Function to handle arrow key presses
function onDocumentKeyDown(event) {
	// Store the current player position before any movement
    oldPlayerPosition.copy(player.position);
	var keyCode = event.which;
	// Arrow keys have the following keyCodes: 37 (left), 38 (up), 39 (right), 40 (down)
	if (keyCode == 37) {
		player.position.x -= 0.3; // Move left
	} else if (keyCode == 38) {
		player.position.y += 0.3; // Move up
	} else if (keyCode == 39) {
		player.position.x += 0.3; // Move right
	} else if (keyCode == 40) {
		player.position.y -= 0.3; // Move down
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

function updateScoreDisplay() {
    document.getElementById('scoreDisplay').innerText = 'Score: ' + score;
}
