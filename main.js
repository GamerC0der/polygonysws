import './style.css';
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setSize( window.innerWidth, window.innerHeight );

const snowflakes = [];
const accumulatedSnow = [];
const snowCount = 500;
const groundY = -30;
let maxAccumulationHeight = 10;

function createSnowflake() {
  const geometry = new THREE.SphereGeometry(0.3, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const snowflake = new THREE.Mesh(geometry, material);
  
  snowflake.position.x = (Math.random() - 0.5) * 900;
  snowflake.position.y = 50 + Math.random() * 20;
  snowflake.position.z = (Math.random() - 0.5) * 900;
  
  snowflake.userData.speed = Math.random() * 0.5 + 0.3;
  snowflake.userData.wobble = Math.random() * 0.3;
  snowflake.userData.wobbleSpeed = Math.random() * 0.02 + 0.01;
  snowflake.userData.falling = true;
  
  scene.add(snowflake);
  snowflakes.push(snowflake);
}

for (let i = 0; i < snowCount; i++) {
  createSnowflake();
}

const defaultView = { x: 0, y: 20, z: 450 };
const aboveView = { x: 0, y: 300, z: 0 };
const isometricView = { x: 240, y: 240, z: 240 };

camera.position.set(defaultView.x, defaultView.y, defaultView.z);
camera.lookAt(0, 0, 0);

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  maxAccumulationHeight = 10 + Math.max(0, -t * 0.05);
  
  const scrollProgress = Math.max(0, Math.min(1, -t * 0.002));
  
  let pos;
  if (scrollProgress < 0.5) {
    const t1 = scrollProgress * 2;
    pos = {
      x: defaultView.x + (aboveView.x - defaultView.x) * t1,
      y: defaultView.y + (aboveView.y - defaultView.y) * t1,
      z: defaultView.z + (aboveView.z - defaultView.z) * t1
    };
  } else {
    const t2 = (scrollProgress - 0.5) * 2;
    pos = {
      x: aboveView.x + (isometricView.x - aboveView.x) * t2,
      y: aboveView.y + (isometricView.y - aboveView.y) * t2,
      z: aboveView.z + (isometricView.z - aboveView.z) * t2
    };
  }
  
  camera.position.set(pos.x, pos.y, pos.z);
  camera.lookAt(0, 0, 0);
}

document.body.onscroll = moveCamera;
moveCamera();

function updateCountdown() {
  const christmas = new Date('December 25, 2025 00:00:00').getTime();
  const now = new Date().getTime();
  const distance = christmas - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const countdownElement = document.getElementById('countdown');
  if (countdownElement) {
    countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s until Christmas!`;
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

function getAccumulationHeight(x, z) {
  const checkRadius = 2;
  let maxY = groundY;
  
  accumulatedSnow.forEach(snow => {
    const dx = snow.position.x - x;
    const dz = snow.position.z - z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < checkRadius && snow.position.y > maxY) {
      maxY = snow.position.y;
    }
  });
  
  return maxY - groundY;
}

function animate() {
  requestAnimationFrame( animate );

  let fallingCount = 0;

  snowflakes.forEach(snowflake => {
    if (snowflake.userData.falling) {
      fallingCount++;
      snowflake.position.y -= snowflake.userData.speed;
      snowflake.position.x += Math.sin(Date.now() * snowflake.userData.wobbleSpeed) * snowflake.userData.wobble;
      snowflake.position.z += Math.cos(Date.now() * snowflake.userData.wobbleSpeed) * snowflake.userData.wobble * 0.5;
      
      const currentHeight = getAccumulationHeight(snowflake.position.x, snowflake.position.z);
      
      if (snowflake.position.y <= groundY + currentHeight) {
        if (currentHeight < maxAccumulationHeight) {
          snowflake.position.y = groundY + currentHeight + 0.3;
          snowflake.userData.falling = false;
          accumulatedSnow.push(snowflake);
        } else {
          snowflake.position.y = 50 + Math.random() * 20;
          snowflake.position.x = (Math.random() - 0.5) * 900;
          snowflake.position.z = (Math.random() - 0.5) * 900;
        }
      }
    }
  });

  while (fallingCount < snowCount * 0.3) {
    createSnowflake();
    fallingCount++;
  }

  renderer.render( scene, camera );
}

animate();
