import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("avatarCanvas");
const statusText = document.getElementById("status");

let mixer;

// SCENE
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.2, 5);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222);

// LIGHT
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(2, 5, 2);
scene.add(dirLight);

// LOAD MODEL
const loader = new GLTFLoader();

loader.load(
  "model.glb",
  (gltf) => {
    const model = gltf.scene;

    model.scale.set(2, 2, 2);
    model.position.set(0, -1, 0);

    scene.add(model);

    mixer = new THREE.AnimationMixer(model);

    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play(); // hepsini oynat (test için)
    });

    console.log("MODEL OK");
  },
  undefined,
  (err) => console.error("MODEL HATA:", err)
);

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
  speechSynthesis.speak(utter);
}