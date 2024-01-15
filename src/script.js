import * as THREE from "three";
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import {
  GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  TransformControls
} from "three/addons/controls/TransformControls.js";
import {MeshLine, MeshLineGeometry, MeshLineMaterial} from '@lume/three-meshline'

THREE.ColorManagement.enabled = false;

// Create a material for the bones
const boneMaterial = new THREE.MeshStandardMaterial({
  color: 0xe3dac9,      // Set the color of the material
  roughness: 0.5,       // Adjust the material's roughness
  metalness: 0.5        // Adjust the material's metalness
});

const loader = new GLTFLoader();
loader.load("models/leg.glb", function (gltf) {
  const model = gltf.scene;
  scene.add(model);

  model.traverse(function (object) {
    if (object.isMesh)
    {
      object.castShadow = true;
      //object.material = boneMaterial;
    }});
});



// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xDDE2DC);
scene.fog = new THREE.Fog(0xDDE2DC, 10, 50);

//Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xe3dac9, 3);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = -2;
dirLight.shadow.camera.left = -2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);

const dirLight1 = new THREE.DirectionalLight(0xe3dac9, 3);
dirLight1.position.set(-4, -10, -11);
dirLight1.castShadow = true;
dirLight1.shadow.camera.top = 2;
dirLight1.shadow.camera.bottom = -2;
dirLight1.shadow.camera.left = -2;
dirLight1.shadow.camera.right = 2;
dirLight1.shadow.camera.near = 0.1;
dirLight1.shadow.camera.far = 40;
scene.add(dirLight1);

//Ground
const mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshPhongMaterial({
    color: 0xffffff,
    depthWrite: false
  })
);
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
// mesh.position.y = -10
//scene.add(mesh);

//Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 2, 10);
scene.add(camera);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Update
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
tick();


// Function to create a sphere
function createSphere(position, buttonIndex) {
  // Check if a sphere already exists for this button
  const existingSphere = spheres[buttonIndex];
  if (existingSphere) {
    return existingSphere;
  }

  const sphereGeometry = new THREE.SphereGeometry(0.03, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.copy(position);
  scene.add(sphere);

  // Make the sphere clickable
  sphere.userData.isClickable = true;
  sphere.onClick = function () {
    toggleTransformControls();
    performButtonFunctionality(buttonIndex);
  };

  // Save the created sphere to the array
  spheres[buttonIndex] = sphere;

  return sphere;
}

/// Function to toggle transform controls state
function toggleTransformControls() {
  const selectedSphere = getSelectedSphere();
  if (selectedSphere && transformControls.object !== selectedSphere) {
    transformControls.detach();
    transformControls.attach(selectedSphere);
  } else {
    transformControls.detach();
  }
}
// Function to get the selected sphere
function getSelectedSphere() {
  const selectedButton = document.querySelector('.toggle-button.active');
  if (selectedButton) {
    const buttonIndex = buttonElements.indexOf(selectedButton);
    return spheres[buttonIndex];
  }
  return null;
}


// Functionality to perform when a button or sphere is clicked
function performButtonFunctionality(buttonIndex) {
  console.log(`Button ${buttonIndex + 1} clicked`);
  const position = getSpherePosition(buttonIndex)
  const newSphere = createSphere(position, buttonIndex);
  transformControls.attach(newSphere);
}

// Function to get the position for the sphere based on the button index
function getSpherePosition(buttonIndex) {
  return getPosition(buttonIndex)
}


// Create TransformControls
const transformControls = new TransformControls(camera, renderer.domElement);
scene.add(transformControls);

// Customize TransformControls axes
transformControls.showX = true; // Show X-axis
transformControls.showY = true; // Show Y-axis
transformControls.showZ = true; // Show Z-axis
transformControls.setSize(0.5); // Adjust the size of the axes

const buttonElements = Array.from(document.querySelectorAll(".toggle-button"));
const spheres = [];

buttonElements.forEach((button, i) => {
  button.addEventListener("click", () => {
    buttonElements.forEach((b, j) => {
      if (i !== j) {
        b.classList.remove("active");
      }
    });

    button.classList.toggle("active");

    if (button.classList.contains("active")) {
      console.log('Button is active');
      toggleTransformControls();
      performButtonFunctionality(i);
    } else {
      console.log('Button is inactive');
      toggleTransformControls();
    }

  console.log(`Position: `, spheres[1].position);

  });
});

// Disable orbit control on dragging
transformControls.addEventListener('dragging-changed', function (event) {
  controls.enabled = !event.value;
});

// Add a click event listener to the entire scene
document.addEventListener('click', (event) => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with clickable objects
  const clickableObjects = scene.children.filter(obj => obj.userData.isClickable);
  const intersects = raycaster.intersectObjects(clickableObjects);

  if (intersects.length > 0) {
    intersects[0].object.onClick();
  }
});

// // Function to create a line between two positions
// function createLineBetweenPositions(fromPosition,toPosition) {
//   const lineGeometry = new THREE.BufferGeometry();
//   const vertices = new Float32Array(6);

//   // Set the start and end points of the line
//   vertices[0] = fromPosition.x;
//   vertices[1] = fromPosition.y;
//   vertices[2] = fromPosition.z;
//   vertices[3] = toPosition.x;
//   vertices[4] = toPosition.y;
//   vertices[5] = toPosition.z;

//   lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

//   const lineMaterial = new THREE.LineBasicMaterial({ 
//     color: 0x0033FF,
//     depthTest: false,
//     renderOrder: 10,
//    });
//   const line = new THREE.Line(lineGeometry, lineMaterial);

//   scene.add(line);
 
//   return line;
// }

// Function to create a line between two positions
function createLineBetweenPositions(fromPosition, toPosition) {
  const points = []
    points.push(fromPosition,toPosition)
    const geometry = new MeshLineGeometry()
    geometry.setPoints(points)
    const material = new MeshLineMaterial({
      color: 0x0033FF,
      depthTest:false,
      lineWidth:0.01
    })
    const line = new MeshLine(geometry, material)
scene.add(line)
}

function clearAllLines() {
  // Assuming `scene` is the Three.js scene where lines are added
  const linesToRemove = scene.children.filter(object => object instanceof MeshLine);

  linesToRemove.forEach(line => {
    scene.remove(line);
    // If you need to dispose of the line geometry and material, uncomment the lines below
    // line.geometry.dispose();
    // line.material.dispose();
  });
}



const update = document.querySelector(".update-button");
update.addEventListener("click", () => {
  clearAllLines()
  const mechanicalAxisFrom = getPosition(0)
  const mechanicalAxisT0 = getPosition(1)

   const anatomicalAxisFrom =  getPosition(2)
   const anatomicalAxisTo =  getPosition(3)

   const TEAFrom =  getPosition(4)
   const TEATo =  getPosition(5)

   const PEAFrom =  getPosition(8)
   const PEATo =  getPosition(9)

  // const mechanicalAxisFrom = spheres[0].position
  // const mechanicalAxisT0 = spheres[1].position

  //  const anatomicalAxisFrom =  spheres[2].position
  //  const anatomicalAxisTo =  spheres[3].position

  //  const TEAFrom =  spheres[4].position
  //  const TEATo =  spheres[5].position

  //  const PEAFrom =  spheres[8].position
  //  const PEATo =  spheres[9].position

  createLineBetweenPositions(mechanicalAxisFrom,mechanicalAxisT0)
  createLineBetweenPositions(anatomicalAxisFrom,anatomicalAxisTo)
  createLineBetweenPositions(TEAFrom,TEATo)
  createLineBetweenPositions(PEAFrom,PEATo)

  
  createPlanePerpendicularToXAxis(spheres[0])

  
  
  //Step 4 
  const anteriorLineEnd = getPosition(10)
  createLineBetweenPositions(mechanicalAxisT0,anteriorLineEnd)
  
  //varus/valgus plane
  createPlanePerpendicularToXAxis(spheres[0]) 

});

function createPlanePerpendicularToXAxis(sphere) {
  // Extract position of the sphere
  const spherePosition = sphere.position;

  // Create a plane geometry
  const planeGeometry = new THREE.PlaneGeometry(1, 1); // Adjust the size of the plane as needed

  // Create a plane material
  const planeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    transparent: true,
    opacity : 0.5,
    side: THREE.DoubleSide });

  // Create the plane mesh
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  // Set the position of the plane to be centered on the sphere and perpendicular to the X-axis
  plane.position.copy(spherePosition);

  // Orient the plane to be perpendicular to the X-axis
  const normal = new THREE.Vector3(0, 1, 0); // Normal along the y-axis (perpendicular to x-axis)
  const tangent = new THREE.Vector3(1, 0, 0); // Tangent along the x-axis
  const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

  plane.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tangent, binormal, normal));

  // Add the plane to the scene
  scene.add(plane);

  return plane;
}

//Default position of the points
const defaultPointsPositions = [
  { name: 'Femur Center', position: new THREE.Vector3(-0.026, 0.058, 0.026) },
  { name: 'Hip Center', position: new THREE.Vector3(0.1, 4.233, 0.034) },

  { name: 'Femur Proximal Canal', position: new THREE.Vector3(-0.153, 3.898, -0.044) },
  { name: 'Femur Distal Canal', position: new THREE.Vector3(0.058, 0.056, -0.099) },

  { name: 'Medial Epicondyle', position: new THREE.Vector3(0.436, 0.131, -0.334) },
  { name: 'Lateral Epicondyle', position: new THREE.Vector3(-0.362, 0.240, -0.2) },

  { name: 'Distal Medial Pt', position: new THREE.Vector3(-0.209, 0, -0.236) },
  { name: 'Distal Lateral Pt', position: new THREE.Vector3(0.258, -0.052, -0.206) },

  { name: 'Posterior Medial Pt', position: new THREE.Vector3(0.323, -0.053, -0.258) },
  { name: 'Posterior Lateral Pt', position: new THREE.Vector3(-0.226, 0, -0.219) },

  { name: 'Hip Center To', position: new THREE.Vector3(0.1, 4.233, 0.135) }

];

function getPosition(identifier) {
  let positionObject;

  if (typeof identifier === 'number') {
    // If identifier is a number, treat it as an index
    positionObject = defaultPointsPositions[identifier];
  } else if (typeof identifier === 'string') {
    // If identifier is a string, treat it as a name
    positionObject = defaultPointsPositions.find(point => point.name === identifier);
  }

  if (positionObject) {
    return positionObject.position;
  } else {
    console.warn(`Position not found for identifier '${identifier}'.`);
    return new THREE.Vector3(); // Default to (0, 0, 0) if not found
  }
}


