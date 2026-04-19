// =====================
// SCENE
// =====================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// =====================
// LIGHTS
// =====================
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// =====================
// ELEMENT DATA
// =====================
const elements = {
  H:  { p: 1, n: 0, e: 1 },
  He: { p: 2, n: 2, e: 2 },
  Li: { p: 3, n: 4, e: 3 },
  Be: { p: 4, n: 5, e: 4 },
  B:  { p: 5, n: 6, e: 5 },
  C:  { p: 6, n: 6, e: 6 },
  N:  { p: 7, n: 7, e: 7 },
  O:  { p: 8, n: 8, e: 8 },
  F:  { p: 9, n: 10, e: 9 },
  Ne: { p: 10, n: 10, e: 10 }
};

// =====================
// GROUPS
// =====================
const nucleusGroup = new THREE.Group();
const electronGroup = new THREE.Group();

scene.add(nucleusGroup);
scene.add(electronGroup);

// =====================
// ORBIT RINGS
// =====================
const orbitRings = [];

function createOrbitRing(radius) {
  const points = [];

  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;

    points.push(
      new THREE.Vector3(
        Math.cos(a) * radius,
        0,
        Math.sin(a) * radius
      )
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color: 0x4444ff,
    transparent: true,
    opacity: 0.4
  });

  const ring = new THREE.LineLoop(geometry, material);
  scene.add(ring);

  orbitRings.push(ring);
}

// =====================
// CLEAR
// =====================
function clearAtom() {
  nucleusGroup.clear();
  electronGroup.clear();

  orbitRings.forEach(r => scene.remove(r));
  orbitRings.length = 0;
}

// =====================
// NUCLEUS
// =====================
function buildNucleus(p, n) {
  const geom = new THREE.SphereGeometry(0.2, 12, 12);

  for (let i = 0; i < p; i++) {
    const proton = new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({ color: 0xff4444 })
    );

    proton.position.set(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8
    );

    nucleusGroup.add(proton);
  }

  for (let i = 0; i < n; i++) {
    const neutron = new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({ color: 0xffaa00 })
    );

    neutron.position.set(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8
    );

    nucleusGroup.add(neutron);
  }
}

// =====================
// ELECTRONS
// =====================
function buildElectrons(count) {
  const geom = new THREE.SphereGeometry(0.1, 12, 12);

  const shells = [2, 8, 18];
  let remaining = count;
  let shell = 0;

  while (remaining > 0) {
    const max = shells[shell] || 8;
    const inShell = Math.min(max, remaining);

    const radius = 2 + shell * 1.5;

    createOrbitRing(radius);

    for (let i = 0; i < inShell; i++) {
      const angle = (i / inShell) * Math.PI * 2;

      const electron = new THREE.Mesh(
        geom,
        new THREE.MeshStandardMaterial({
          color: 0x66ccff,
          emissive: 0x113355
        })
      );

      electron.userData = {
        radius,
        angle,
        speed: 0.02 + Math.random() * 0.01
      };

      electronGroup.add(electron);
    }

    remaining -= inShell;
    shell++;
  }
}

// =====================
// BUILD ATOM
// =====================
function buildAtom(symbol) {
  const el = elements[symbol];
  if (!el) return;

  clearAtom();
  buildNucleus(el.p, el.n);
  buildElectrons(el.e);
}

// =====================
// CAMERA START
// =====================
camera.position.z = 12;

// =====================
// ⭐ MOUSE CAMERA CONTROL (FIXED)
// =====================
let isDragging = false;
let prevX = 0;
let prevY = 0;

let theta = 0;
let phi = Math.PI / 2;

const camRadius = 12;

function updateCamera() {
  camera.position.x = camRadius * Math.sin(phi) * Math.sin(theta);
  camera.position.y = camRadius * Math.cos(phi);
  camera.position.z = camRadius * Math.sin(phi) * Math.cos(theta);

  camera.lookAt(0, 0, 0);
}

updateCamera();

document.addEventListener("mousedown", (e) => {
  isDragging = true;
  prevX = e.clientX;
  prevY = e.clientY;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mouseleave", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - prevX;
  const dy = e.clientY - prevY;

  prevX = e.clientX;
  prevY = e.clientY;

  const speed = 0.005;

  theta -= dx * speed;
  phi -= dy * speed;

  const EPS = 0.01;
  phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

  updateCamera();
});

// =====================
// UI
// =====================
const ui = document.getElementById("ui");

Object.keys(elements).forEach(sym => {
  const btn = document.createElement("button");
  btn.innerText = sym;
  btn.onclick = () => buildAtom(sym);
  ui.appendChild(btn);
});

// =====================
// START
// =====================
buildAtom("C");

// =====================
// ANIMATION
// =====================
function animate() {
  requestAnimationFrame(animate);

  nucleusGroup.rotation.y += 0.002;

  electronGroup.children.forEach(e => {
    e.userData.angle += e.userData.speed;

    e.position.x = Math.cos(e.userData.angle) * e.userData.radius;
    e.position.z = Math.sin(e.userData.angle) * e.userData.radius;
    e.position.y = 0;
  });

  renderer.render(scene, camera);
}

animate();

// =====================
// RESIZE
// =====================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});