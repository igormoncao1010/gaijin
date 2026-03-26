import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function initThree() {
  const container = document.getElementById("threeCanvasContainer");
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = null;

  // Câmera centralizada: ajuste o último número (Z) para zoom
  // Maior = mais longe (modelo menor), menor = mais perto (modelo maior)
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.5;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0x404060);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(2, 3, 4);
  scene.add(mainLight);

  const fillLight = new THREE.PointLight(0x6688aa, 0.6);
  fillLight.position.set(1, 2, 2);
  scene.add(fillLight);

  const backLight = new THREE.PointLight(0xaa8866, 0.5);
  backLight.position.set(-1, 1.5, -2);
  scene.add(backLight);

  const rimLight = new THREE.PointLight(0xccaa88, 0.7);
  rimLight.position.set(1.2, 1.8, -2);
  scene.add(rimLight);

  const loader = new GLTFLoader();
  const isFileProtocol = window.location.protocol === "file:";
  const baseUrl = new URL(".", window.location.href).href;
  const modelSources = Array.from(
    new Set([
      new URL("robo.glb", import.meta.url).href,
      new URL("robo.glb", baseUrl).href,
      new URL("/robo.glb", window.location.href).href,
      "./robo.glb",
      "robo.glb",
    ]),
  );

  const applyModel = (gltf) => {
    const model = gltf.scene;
    model.traverse((node) => {
      if (node.isMesh) {
        node.material.roughness = 0.3;
        node.material.metalness = 0.7;
      }
    });

    // Ajuste o tamanho aqui: maior = mais próximo de 1.0, menor = mais próximo de 0
    model.scale.set(1, 0.8, 0.8);

    // Centralizado no meio da cena
    model.position.set(0, -2.3, 0);

    scene.add(model);
  };

  const addFallback = (error) => {
    console.error("❌ Erro ao carregar modelo 3D:", error);
    const geometry = new THREE.IcosahedronGeometry(0.8, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.2,
    });
    const fallbackMesh = new THREE.Mesh(geometry, material);
    fallbackMesh.position.set(0, 0.5, 0);
    scene.add(fallbackMesh);

    if (isFileProtocol) {
      const warning = document.createElement("div");
      warning.style.cssText =
        "position:fixed;left:16px;bottom:16px;z-index:99999;background:#111;color:#fff;padding:10px 12px;border:1px solid #555;border-radius:8px;font:12px/1.4 Arial,sans-serif;max-width:320px;";
      warning.textContent = "Abra via servidor local: npm start ou ./start.sh";
      document.body.appendChild(warning);
    }
  };

  const loadModel = (sourceIndex = 0) => {
    const modelUrl = modelSources[sourceIndex];
    loader.load(
      modelUrl,
      (gltf) => {
        applyModel(gltf);
        console.log(`✅ Modelo 3D carregado com sucesso: ${modelUrl}`);
      },
      (xhr) => {
        if (xhr.total > 0) {
          console.log(
            `${((xhr.loaded / xhr.total) * 100).toFixed(1)}% carregado`,
          );
        }
      },
      (error) => {
        const hasNextSource = sourceIndex < modelSources.length - 1;
        if (hasNextSource) {
          console.warn(
            `Tentando caminho alternativo para o modelo: ${modelSources[sourceIndex + 1]}`,
          );
          loadModel(sourceIndex + 1);
          return;
        }
        addFallback(error);
      },
    );
  };

  loadModel();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}
