import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ışık
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

// kamera
camera.position.set(0, 1.5, 3);

// loader
const loader = new GLTFLoader();

loader.load("model.glb", function (gltf) {
  const model = gltf.scene;
  scene.add(model);

  model.position.set(0, 0, 0);
}, undefined, function (error) {
  console.error(error);
});

// animasyon loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
const canvas = document.getElementById("avatarCanvas");
const statusText = document.getElementById("status");

let mixer, actions = {}, currentAction;

// SCENE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// LIGHT
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

// LOAD AVATAR
const loader = new GLTFLoader();

loader.load("./avatar.glb", (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  mixer = new THREE.AnimationMixer(model);

  gltf.animations.forEach((clip) => {
    actions[clip.name.toLowerCase()] = mixer.clipAction(clip);
  });

  playAnimation("idle");
});

// ANIMATION PLAY
function playAnimation(name) {
  if (!actions[name]) return;

  if (currentAction) currentAction.fadeOut(0.3);

  currentAction = actions[name];
  currentAction.reset().fadeIn(0.3).play();
}

// LOOP
function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(0.01);
  renderer.render(scene, camera);
}
animate();

// 🎤 SPEECH
window.startListening = function () {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = "tr-TR";

  rec.start();
  statusText.innerText = "Dinliyorum...";

  playAnimation("wave");

  rec.onresult = async (e) => {
    const text = e.results[0][0].transcript;
    statusText.innerText = text;

    const res = await fetch("https://todicar.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();

    speak(data.reply);
  };
};

// 🔊 TTS
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "tr-TR";

  utter.onstart = () => playAnimation("wave");
  utter.onend = () => playAnimation("idle");

  speechSynthesis.speak(utter);
}