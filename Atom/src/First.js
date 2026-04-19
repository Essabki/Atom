const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* Axes */
//scene.add(new THREE.AxesHelper(5));

/* Lights */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

/* Materials & Geometries */
const bigGeom = new THREE.SphereGeometry(1, 32, 32);
const centralMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const blueMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });

/* Central Red Ball */
const centralBall = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), centralMat);
centralBall.position.set(0, 0, 1);
scene.add(centralBall);

/* Big Balls */
const bigBalls = [
  { pos: [ 1.2,  0.0,  0.0], mat: blueMat },
  { pos: [ 0.0,  1.2,  0.0], mat: blueMat },
  { pos: [ 0.0, -1.2,  0.0], mat: blueMat },
  { pos: [-1.2,  0.0,  0.0], mat: blueMat },
  { pos: [ 0.0,  0.0, -1.5], mat: centralMat },
  { pos: [ 1.0,  1.0, -1.0], mat: centralMat },
  { pos: [ 1.0, -1.0, -1.0], mat: centralMat },
  { pos: [-1.0, -1.0, -1.0], mat: centralMat },
  { pos: [-1.0,  1.0, -1.0], mat: centralMat }
];
bigBalls.forEach(({pos, mat}) => {
  const m = new THREE.Mesh(bigGeom, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  scene.add(m);
});

/* Orbit circles */
function createCircle(radius, segments, plane, color = 0xcccccc) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    let x = 0, y = 0, z = 0;
    if (plane === 'x') { y = radius * Math.cos(t); z = radius * Math.sin(t); }
    if (plane === 'y') { x = radius * Math.cos(t); z = radius * Math.sin(t); }
    if (plane === 'z') { x = radius * Math.cos(t); y = radius * Math.sin(t); }
    pts.push(new THREE.Vector3(x, y, z));
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const m = new THREE.LineBasicMaterial({ color });
  const circle = new THREE.LineLoop(g, m);
  scene.add(circle);
  return circle;
}

const radius = 4;
const circleX = createCircle(radius, 64, 'x', 0xcccccc);
const circleY = createCircle(radius, 64, 'y', 0xcccccc);
const circleZ = createCircle(radius, 64, 'z', 0xcccccc);

/* Small yellow orbiting balls */
const smallGeom = new THREE.SphereGeometry(0.3, 16, 16);
const smallMat  = new THREE.MeshPhongMaterial({ color: 0xffff66 });
const ballX = new THREE.Mesh(smallGeom, smallMat);
const ballY = new THREE.Mesh(smallGeom, smallMat);
const ballZ = new THREE.Mesh(smallGeom, smallMat);
scene.add(ballX, ballY, ballZ);

const membraneGeom = new THREE.SphereGeometry(
  4,          // radius
  32, 32,     // width & height segments
  0, Math.PI, // thetaStart, thetaLength → vertical slice = half sphere
  0, Math.PI / 1 // phiStart, phiLength → horizontal full
);
const membraneMat = new THREE.MeshPhongMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.2,
  side: THREE.DoubleSide
});
const membrane = new THREE.Mesh(membraneGeom, membraneMat);
membrane.position.x = -3; // shift to left
scene.add(membrane);
membrane.position.x=0;
membrane.rotation.y=Math.PI/1;
membrane.scale.x=1.1;
membrane.scale.y=1.1;
membrane.scale.z=1.1;
/* Camera Orbit Control */
let isDragging = false;
let prevX = 0, prevY = 0;
let theta = 0;
let phi   = Math.PI / 2;
const camRadius = 15;

function updateCamera() {
  const x = camRadius * Math.sin(phi) * Math.sin(theta);
  const y = camRadius * Math.cos(phi);
  const z = camRadius * Math.sin(phi) * Math.cos(theta);
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
}
updateCamera();

document.addEventListener('mousedown', (e) => {
  isDragging = true;
  prevX = e.clientX; prevY = e.clientY;
});
document.addEventListener('mouseup', () => { isDragging = false; });
document.addEventListener('mouseleave', () => { isDragging = false; });
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prevX;
  const dy = e.clientY - prevY;
  prevX = e.clientX; prevY = e.clientY;

  const ROT_SPEED = 0.005;
  theta -= dx * ROT_SPEED;
  phi   -= dy * ROT_SPEED;

  const EPS = 0.001;
  phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
  updateCamera();.2
});

/* Animate */
let angleX = 0, angleY = 0, angleZ = 0;
function animate() {
  requestAnimationFrame(animate);

  angleX += 0.05;
  angleY += 0.05;
  angleZ += 0.05;

  ballX.position.set(0, radius * Math.cos(angleX), radius * Math.sin(angleX));
  ballY.position.set(radius * Math.cos(angleY), 0, radius * Math.sin(angleY));
  ballZ.position.set(radius * Math.cos(angleZ), radius * Math.sin(angleZ), 0);

  circleX.rotation.x += 0.003;
  circleY.rotation.y += 0.003;
  circleZ.rotation.z += 0.003;
  //scene.rotation.y += 0.005;

  renderer.render(scene, camera);
}
animate();

/* Resize */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
console.log("Use mouse drag to rotate the view");