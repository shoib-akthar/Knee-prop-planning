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
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

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

  // console.log(`Position: `, spheres[1].position);

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
return line
}

function clearAllLines() {
  const linesToRemove = scene.children.filter(object => object instanceof MeshLine);

  linesToRemove.forEach(line => {
    scene.remove(line);
  });
}

function clearAllPlanes() {
    scene.remove(perpendicularPlane);
}

let varus_or_valgusplane = null
let lateralPlane = null
let distalPlane = null
let midpoint


const update = document.querySelector(".update-button");
update.addEventListener("click", () => {
  clearAllLines()
  // clearAllPlanes()

  //TBC
  // const mechanicalAxisFrom = getPosition(0)
  // const mechanicalAxisT0 = getPosition(1)

  //  const anatomicalAxisFrom =  getPosition(2)
  //  const anatomicalAxisTo =  getPosition(3)

  //  const TEAFrom =  getPosition(4)
  //  const TEATo =  getPosition(5)

  //  const PEAFrom =  getPosition(8)
  //  const PEATo =  getPosition(9)

  const mechanicalAxisFrom = spheres[0].position
  const mechanicalAxisT0 = spheres[1].position

   const anatomicalAxisFrom =  spheres[2].position
   const anatomicalAxisTo =  spheres[3].position

   const TEAFrom =  spheres[4].position
   const TEATo =  spheres[5].position

   const PEAFrom =  spheres[8].position
   const PEATo =  spheres[9].position

  createLineBetweenPositions(mechanicalAxisFrom,mechanicalAxisT0)
  createLineBetweenPositions(anatomicalAxisFrom,anatomicalAxisTo)
  createLineBetweenPositions(TEAFrom,TEATo)
  createLineBetweenPositions(PEAFrom,PEATo)

  //Perpendicular Plane
  const perpendicularPlane = createPlaneToAxis(spheres[0])
   
  
  //Anterior Line
  const anteriorLineEnd = getPosition(10)
  const anteriorLine = createLineBetweenPositions(mechanicalAxisT0,anteriorLineEnd)
  anteriorLine.material.color.set(0xD63484);
  

  //varus/valgus plane
  varus_or_valgusplane = createPlaneToAxis(spheres[0]) 
  varus_or_valgusplane.material.color.set(0x00eeff);

  //Lateral Line
  const LateralLineEnd = getPosition(11)
  const lateralLine = createLineBetweenPositions(mechanicalAxisFrom,LateralLineEnd)
  lateralLine.material.color.set(0xFFBF00);

     //Lateral plane
  lateralPlane = createPlaneToAxis(spheres[0]) 
  lateralPlane.material.color.set(0xf75f54);

     //Distal plane
  midpoint = new THREE.Vector3().copy(getPosition(6)).add(getPosition(7)).multiplyScalar(0.5);
  distalPlane = createPlaneToAxis(getPosition(12)) 
  distalPlane.material.color.set(0x618fc0);


  // DistalLateral=Distance between Distal resection plane and Distal Lateral Pt
const DL = getPosition(7)

//DistalMedial=Distance between Distal resection plane and Distal Medial Pt
const DM = getPosition(6)

const DistalLateralPlane = new THREE.Plane(defaultPointsPositions[13].position.normalize(), 0);

const distance1 = distanceFromPointToPlane(DM, DistalLateralPlane);

const distance2 = distanceFromPointToPlane(DL, DistalLateralPlane);

parseFloat(distance1.toFixed(2))

console.log('Distance from point to plane:', distance1);
console.log('Distance from point to plane:', distance2);

 createText1(scene, parseFloat(distance1.toFixed(3)).toString());
 createText2(scene, parseFloat(distance2.toFixed(3)).toString());

});

function createPlaneToAxis(sphere) {
  let spherePosition
  if(sphere instanceof THREE.Vector3)
  {
    spherePosition = sphere
  }
  else{
    // Extract position of the sphere
     spherePosition = sphere.position;
  }

  // Create a plane geometry
  const planeGeometry = new THREE.PlaneGeometry(1.5, 1.5); // Adjust the size of the plane as needed

  // Create a plane material
  const planeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    transparent: true,
    opacity : 0.7,
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

  { name: 'Anterior End Pt', position: new THREE.Vector3(0.1, 4.233, 0.135) },
  { name: 'Lateral End Pt', position: new THREE.Vector3(-0.126, 0.058, 0.026) },

  { name: 'Distal Center Pt', position: new THREE.Vector3(0.024, -0.026, -0.22) },
  { name: 'Clipping Plane Pt', position: new THREE.Vector3(0.024, 0.074, -0.22) },

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

let counterVarus = 0;
let counterLateral = 0;
let counterDistal = 0;

 const buttonSetIncV = document.querySelector(".increment-v");
 buttonSetIncV.addEventListener("click", () =>{
  if(varus_or_valgusplane!==null){
    counterVarus++;
    updateCounterVarus();
    rotatePlane(1,varus_or_valgusplane,'inc')
  }
 } )
 const buttonSetDecV = document.querySelector(".decrement-v");
 buttonSetDecV.addEventListener("click", () =>{
  if(varus_or_valgusplane!==null){
    counterVarus--;
    updateCounterVarus();
    rotatePlane(1,varus_or_valgusplane,'dec')
  }
 } )

 const buttonSetIncL = document.querySelector(".increment-l");
 buttonSetIncL.addEventListener("click", () =>{
  if(lateralPlane!==null){
    counterLateral++;
    updateCounterLateral();
    rotatePlanelateral(1,lateralPlane,'inc')
  }
 } )
 const buttonSetDecL = document.querySelector(".decrement-l");
 buttonSetDecL.addEventListener("click", () =>{
  if(lateralPlane!==null){
    counterLateral--;
    updateCounterLateral();
    rotatePlanelateral(1,lateralPlane,'dec')
  }
 } )

 const buttonSetIncD = document.querySelector(".increment-d");
 buttonSetIncD.addEventListener("click", () =>{
  if(varus_or_valgusplane!==null){
    counterDistal++;
    updateCounterDistal();
    rotatePlane(1,varus_or_valgusplane,'inc')
  }
 } )
 const buttonSetDecD = document.querySelector(".decrement-d");
 buttonSetDecD.addEventListener("click", () =>{
  if(varus_or_valgusplane!==null){
    counterDistal--;
    updateCounterDistal();
    rotatePlane(1,varus_or_valgusplane,'dec')
  }
 } )


function updateCounterVarus() {
  document.querySelector('.counter-text-varus').innerText = counterVarus + '\xB0';
}
function updateCounterLateral() {
  document.querySelector('.counter-text-lateral').innerText = counterLateral + '\xB0';
}
function updateCounterDistal() {
  document.querySelector('.counter-text-distal').innerText = counterDistal + 'mm';
}


function rotatePlane(degrees,plane,action) {
  const radians = THREE.MathUtils.degToRad(degrees);
  if(action==='inc')
  {
    plane.rotation.y += radians;
  }
  else if(action==='dec')
  {
    plane.rotation.y -= radians;
  }
}

function rotatePlanelateral(degrees,plane,action) {
  const radians = THREE.MathUtils.degToRad(degrees);
  if(action==='inc')
  {
    plane.rotation.x += radians;
  }
  else if(action==='dec')
  {
    plane.rotation.x -= radians;
  }
}

//Resection Functionality
function createClippingPlane(scene, renderer, position, normal, size = 1.5) {

  const planeGeometry = new THREE.PlaneGeometry(size, size);
  const planeMaterial = new THREE.MeshBasicMaterial({
    //color: 0x00ff00,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.position.copy(position);
  plane.lookAt(new THREE.Vector3().addVectors(position, normal));

  scene.add(plane);

  renderer.clippingPlanes.push(new THREE.Plane(normal, -position.dot(normal)));

  return plane;
}

const clippingPlanePosition = new THREE.Vector3(0, 0.5, 0);
const clippingPlaneNormal = new THREE.Vector3(0, 0.5, 0);

let clippingPlane
const checkbox = document.getElementById("switch");
checkbox.addEventListener("change", function () {
  if (checkbox.checked) {
    renderer.localClippingEnabled = true;
      clippingPlane = createClippingPlane(
      scene,
      renderer,
      clippingPlanePosition,
      clippingPlaneNormal
    );
  } else {
    renderer.localClippingEnabled = false;
     if (clippingPlane) {
      scene.remove(clippingPlane);
      clippingPlane = undefined;
      }
      renderer.clippingPlanes = [];
}
});

// Create a FontLoader
const fontLoader = new FontLoader();
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';



function createText1(scene, text) {
  // Load the font
  fontLoader.load('helvetiker_regular.typeface.json', function (font) {

      // Create a TextGeometry
      const textGeometry = new TextGeometry(text, {
          font: font,
          size: 0.1,        // Size of the text
          height: 0.01,     // Thickness of the text
          curveSegments: 4, // Smoothness of the text curves
      });

      // Create a MeshBasicMaterial for the text
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

      // Create a Mesh using the TextGeometry and TextMaterial
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      // Set the position of the text mesh in world coordinates
      textMesh.position.set(0.5, 0.5, 0); // Replace with your desired position

      // Add the text mesh to the scene
      scene.add(textMesh);
      return textMesh;
  });
}

function createText2(scene, text) {
  // Load the font
  fontLoader.load('helvetiker_regular.typeface.json', function (font) {

      // Create a TextGeometry
      const textGeometry = new TextGeometry(text, {
          font: font,
          size: 0.1,        // Size of the text
          height: 0.01,     // Thickness of the text
          curveSegments: 4, // Smoothness of the text curves
      });

      // Create a MeshBasicMaterial for the text
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

      // Create a Mesh using the TextGeometry and TextMaterial
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      // Set the position of the text mesh in world coordinates
      textMesh.position.set(-0.8, 0.5, 0); // Replace with your desired position

      // Add the text mesh to the scene
      scene.add(textMesh);
      return textMesh;
  });
}

function distanceFromPointToPlane(point, plane) {
  const { x, y, z } = point;
  const { normal, constant } = plane;

  // Calculate the distance using the formula
  const distance = Math.abs(normal.dot(point) + constant) / normal.length();

  return distance;
}

