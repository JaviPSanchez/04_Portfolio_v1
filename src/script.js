import "./styles/main.scss";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import gsap from "gsap";

////////////////CARDS/////////////////

const cards = document.querySelectorAll(".card");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    removeActiveClass();
    card.classList.add("active");
  });
});

function removeActiveClass() {
  cards.forEach((card) => {
    card.classList.remove("active");
  });
}

//////////SMOOTH SCROLLING//////////

// const btnScrollTo = document.querySelector(".btn");
// const sectionWevDeb = document.querySelector(".portfolio");

// btnScrollTo.addEventListener("click", function (e) {
//   e.preventDefault();
//   sectionWevDeb.scrollIntoView({ behavior: "smooth" });
// });

///////////////////////FONDO PAGINA////////////////////////

//GUI OBJECT
// const gui = new dat.GUI();

const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  },
};

// gui.add(world.plane, "width", 1, 500).onChange(generatePlane);
// gui.add(world.plane, "height", 1, 500).onChange(generatePlane);
// gui.add(world.plane, "widthSegments", 1, 100).onChange(generatePlane);
// gui.add(world.plane, "heightSegments", 1, 100).onChange(generatePlane);

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );

  const randomValues = [];

  const { array } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 3;
    }

    randomValues.push(Math.random() * Math.PI * 2);
  }
  // console.log(randomValues);

  planeMesh.geometry.attributes.position.randomValues = randomValues;

  planeMesh.geometry.attributes.position.originalPosition =
    planeMesh.geometry.attributes.position.array;

  // console.log(planeMesh.geometry.attributes.position);

  const colors = [];

  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }

  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

///////////RAYCASTER//////////
const raycaster = new THREE.Raycaster();
// console.log(raycaster);

///////////SCENE//////////
const scene = new THREE.Scene();

///////////CAMERA//////////
const fieldOfView = 75;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let aspectRatio = WIDTH / HEIGHT;
const nearClippingPlane = 0.1;
const farClippingPlane = 1000;

const camera = new THREE.PerspectiveCamera(
  fieldOfView,
  aspectRatio,
  nearClippingPlane,
  farClippingPlane
);
camera.position.set(0, 0, 50);

///////////RENDER//////////
const renderer = new THREE.WebGLRenderer({});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

document.body.appendChild(renderer.domElement);

///////////ORBIT//////////

// new OrbitControls(camera, renderer.domElement);

///////////PLANE/////////////////////////////////////////

const planeWidth = world.plane.width;
const planeHeight = world.plane.height;
const widthSegments = world.plane.widthSegments;
const heightSegments = world.plane.heightSegments;
const planeGeometry = new THREE.PlaneGeometry(
  planeWidth,
  planeHeight,
  widthSegments,
  heightSegments
);

const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

//////////////////////////////////////////////////////////

generatePlane();

const colors = [];
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
  // colors.push(0, 0.19, 0.4);
  colors.push(0.2, 0.2, 0.2);
}

planeMesh.geometry.setAttribute(
  "color",
  new THREE.BufferAttribute(new Float32Array(colors), 3)
);

///////////LIGHT//////////

const colorLight = 0xffffff;
const intensityLight = 1;
const light = new THREE.DirectionalLight(colorLight, intensityLight);
//Inclinamos un poco la camara
light.position.set(0, 1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(colorLight, intensityLight);
backLight.position.set(0, 0, -1);
scene.add(backLight);

///////POINTS OBJECT////////////

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});
const starVerticies = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVerticies.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVerticies, 3)
);

const stars = new THREE.Points(starGeometry, starMaterial);

scene.add(stars);

// console.log(starGeometry, starMaterial, starVerticies);

///////DEFINIMOS MOUSE OBJECT////////////
const mouse = {
  x: undefined,
  y: undefined,
};

///////////ANIMATE//////////

let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  frame += 0.01;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes;
    //Vertice 1
    color.setX(intersects[0].face.a, 0.1); //r
    color.setY(intersects[0].face.a, 0.5); //g
    color.setZ(intersects[0].face.a, 1); //b
    //vertice 2
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);
    //Vertice 3
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    //LIBRERIA GSAP

    // const initialColor = {
    //   r: 0,
    //   g: 0.19,
    //   b: 0.4,
    // };
    const initialColor = {
      r: 0.1,
      g: 0.1,
      b: 0.1,
    };
    const hoverColor = {
      r: 1,
      g: 1,
      b: 1,
    };
    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        color.setX(intersects[0].face.a, hoverColor.r); //r
        color.setY(intersects[0].face.a, hoverColor.g); //g
        color.setZ(intersects[0].face.a, hoverColor.b); //b
        //vertice 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);
        //Vertice 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
        color.needsUpdate = true;
      },
    });

    stars.rotation.x += 0.001;
  }

  const { array, originalPosition, randomValues } =
    planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    // x

    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.008;
    // y
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.008;
  }
  planeMesh.geometry.attributes.position.needsUpdate = true;
}
animate();

//////////////////////EVENT LISTENERS//////////////////////

addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});

//Animaciones con GSAP

gsap.to("#JaviPS", {
  opacity: 1,
  duration: 1.5,
  y: 0,
  ease: "expo",
});
gsap.to("#Description", {
  opacity: 1,
  duration: 1.5,
  delay: 0.3,
  y: 0,
  ease: "expo",
});
gsap.to("#viewWorkBtn", {
  opacity: 1,
  duration: 1.5,
  delay: 0.6,
  y: 0,
  ease: "expo",
});

document.querySelector("#viewWorkBtn").addEventListener("click", (e) => {
  e.preventDefault();
  gsap.to(".app", {
    opacity: 0,
  });
  gsap.to(camera.position, {
    z: 25,
    ease: "power3.inOut",
    duration: 1.5,
  });
  gsap.to(camera.rotation, {
    x: Math.PI / 2,
    ease: "power3.inOut",
    duration: 2,
  });
  gsap.to(camera.position, {
    y: 1000,
    ease: "power3.in",
    duration: 1,
    delay: 2,
    onComplete: () => {
      window.location.assign("https://javipsanchez.netlify.app/");
    },
  });
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
});
