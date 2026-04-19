// =====================
// SCENE
// =====================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
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
light.position.set(5,5,5);
scene.add(light);

// =====================
// GROUPS
// =====================
const molecule = new THREE.Group();
scene.add(molecule);

// =====================
// ATOM CREATION
// =====================
function createAtom(color, size) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ color })
  );
}

// =====================
// BOND CREATION
// =====================
function createBond(start, end) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();

  const bond = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, length, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );

  bond.position.copy(start).add(end).multiplyScalar(0.5);
  bond.lookAt(end);
  bond.rotateX(Math.PI / 2);

  molecule.add(bond);
}

// =====================
// CLEAR MOLECULE
// =====================
function clear() {
  while (molecule.children.length) {
    molecule.remove(molecule.children[0]);
  }
}

// =====================
// MOLECULE BUILDER
// =====================
function buildMolecule(type) {
  clear();

  if (type === "H2O") {
    // Oxygen center
    const O = createAtom(0xff4444, 0.6);
    O.position.set(0,0,0);
    molecule.add(O);

    // Hydrogen
    const H1 = createAtom(0x66ccff, 0.3);
    const H2 = createAtom(0x66ccff, 0.3);

    H1.position.set(1, 0.8, 0);
    H2.position.set(-1, 0.8, 0);

    molecule.add(H1, H2);

    createBond(O.position, H1.position);
    createBond(O.position, H2.position);
  }

  if (type === "CO2") {
    const C = createAtom(0xffffff, 0.5);
    const O1 = createAtom(0xff4444, 0.6);
    const O2 = createAtom(0xff4444, 0.6);

    C.position.set(0,0,0);
    O1.position.set(-2,0,0);
    O2.position.set(2,0,0);

    molecule.add(C, O1, O2);

    createBond(C.position, O1.position);
    createBond(C.position, O2.position);
  }

  if (type === "CH4") {
    const C = createAtom(0xffffff, 0.5);

    const H = [
      createAtom(0x66ccff, 0.3),
      createAtom(0x66ccff, 0.3),
      createAtom(0x66ccff, 0.3),
      createAtom(0x66ccff, 0.3)
    ];

    C.position.set(0,0,0);

    H[0].position.set(1,1,1);
    H[1].position.set(-1,-1,1);
    H[2].position.set(1,-1,-1);
    H[3].position.set(-1,1,-1);

    molecule.add(C, ...H);

    H.forEach(h => createBond(C.position, h.position));
  }
}

// =====================
// CAMERA
// =====================
camera.position.z = 8;

// =====================
// ANIMATION
// =====================
function animate() {
  requestAnimationFrame(animate);

  molecule.rotation.y += 0.002;

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

// default
buildMolecule("H2O");

