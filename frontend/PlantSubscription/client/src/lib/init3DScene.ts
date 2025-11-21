import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function init3DScene(appElement: HTMLElement, toolbarElement: HTMLElement) {
  // --- 1. WebGL Support Check ---
  function checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  if (!checkWebGL()) {
    console.error('WebGL is not supported');
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 40px; max-width: 500px; text-align: center; color: white;">
          <h2>WebGL을 사용할 수 없습니다</h2>
        </div>
      </div>
    `;
    appElement.appendChild(errorDiv);
    return () => {};
  }

  // --- 2. Renderer & Scene Setup ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(appElement.clientWidth, appElement.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  appElement.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cubeLoader = new THREE.CubeTextureLoader();
  const skybox = cubeLoader.load([
    '/planterior-assets/textures/skybox/px.bmp',
    '/planterior-assets/textures/skybox/nx.bmp',
    '/planterior-assets/textures/skybox/py.bmp',
    '/planterior-assets/textures/skybox/ny.bmp',
    '/planterior-assets/textures/skybox/pz.bmp',
    '/planterior-assets/textures/skybox/nz.bmp',
  ]);
  scene.background = skybox;
  scene.environment = skybox;

  // --- 3. Camera & Controls ---
  const camera = new THREE.PerspectiveCamera(
    60,
    appElement.clientWidth / appElement.clientHeight,
    0.1,
    100
  );
  
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.5, 0);

  // --- 4. Room Variables & Lights ---
  let ROOM_WIDTH = 15;
  let ROOM_DEPTH = 15;
  let WALL_HEIGHT = 6;
  const FLOOR_Y = 0;

  scene.add(new THREE.AmbientLight(0xffe8c4, 0.35));
  const dirLight = new THREE.DirectionalLight(0xffe8c4, 0.8);
  dirLight.position.set(4, 8, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.bias = -0.0002;
  dirLight.shadow.normalBias = 0.02;
  scene.add(dirLight);

  const sun = new THREE.DirectionalLight(0xfff3d1, 1.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.02;

  let thetaDeg = -40;
  function updateSun(elevDeg = 45) {
    const elev = THREE.MathUtils.degToRad(elevDeg);
    const theta = THREE.MathUtils.degToRad(thetaDeg);
    const r = 20;
    const x = r * Math.cos(elev) * Math.cos(theta);
    const y = r * Math.sin(elev);
    const z = r * Math.cos(elev) * Math.sin(theta);
    sun.position.set(x, y, z);
    sun.target.position.set(0, Math.max(ROOM_WIDTH, ROOM_DEPTH) * 0.35, 0);
    scene.add(sun.target);
  }
  updateSun(40);
  scene.add(sun);

  const s = 10;
  sun.shadow.camera.left = -s;
  sun.shadow.camera.right = s;
  sun.shadow.camera.top = s;
  sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 50;

  // --- 5. Textures & Materials ---
  const texLoader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy?.() ?? 1;

  function canvasTexture(cvs: HTMLCanvasElement) {
    const t = new THREE.CanvasTexture(cvs);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAniso;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeCanvas(w = 512, h = 512) {
    const cvs = document.createElement('canvas');
    cvs.width = w;
    cvs.height = h;
    return { cvs, ctx: cvs.getContext('2d')! };
  }

  function loadTiledTexture(url: string, repeatX: number, repeatY: number, rotate90 = false) {
    const t = texLoader.load(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
    if (rotate90) {
      t.center.set(0.5, 0.5);
      t.rotation = Math.PI / 2;
    }
    t.anisotropy = maxAniso;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function createHomeWallpaperTexture({
    base = '#f4efe7',
    stripe = '#ecebe6',
    noise = 6,
    stripeWidth = 14,
    scale = 1.0,
  } = {}) {
    const { cvs, ctx } = makeCanvas(512, 512);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    for (let x = 0; x < 512; x += stripeWidth) {
      ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? stripe : base;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(x, 0, stripeWidth, 512);
    }
    ctx.globalAlpha = 1;

    const img = ctx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = Math.random() * noise - noise / 2;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    const tex = canvasTexture(cvs);
    tex.repeat.set(1 * scale, 1 * scale);
    return tex;
  }

  // --- 6. Geometry Generation Helpers ---
  function makeWallWithWindow(width: number, height: number, holeRect: { x: number; y: number; w: number; h: number }, material: THREE.Material) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(+width / 2, -height / 2);
    shape.lineTo(+width / 2, +height / 2);
    shape.lineTo(-width / 2, +height / 2);
    shape.lineTo(-width / 2, -height / 2);

    const hole = new THREE.Path();
    const { x, y, w, h } = holeRect;
    hole.moveTo(x - w / 2, y - h / 2);
    hole.lineTo(x + w / 2, y - h / 2);
    hole.lineTo(x + w / 2, y + h / 2);
    hole.lineTo(x - w / 2, y + h / 2);
    hole.lineTo(x - w / 2, y - h / 2);
    shape.holes.push(hole);

    const geom = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geom, material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
  }

  // --- 7. Initial Room Build ---
  const metersPerRepeat = 6.0;
  let wallRepeatX = ROOM_WIDTH / metersPerRepeat;
  let wallRepeatY = WALL_HEIGHT / metersPerRepeat;
  let wallRepeatZ = ROOM_DEPTH / metersPerRepeat;
  let floorRepeatX = ROOM_WIDTH / metersPerRepeat;
  let floorRepeatY = ROOM_DEPTH / metersPerRepeat;

  // Grid
  let grid = new THREE.GridHelper(
    Math.max(ROOM_WIDTH, ROOM_DEPTH) - 0.02,
    24,
    0x475569,
    0x334155
  );
  grid.position.y = FLOOR_Y + 0.01;

  // Floor
  let floorTex = loadTiledTexture('/planterior-assets/textures/wood_floor.jpg', floorRepeatX, floorRepeatY, false);
  let floorMat = new THREE.MeshStandardMaterial({
    map: floorTex, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide
  });
  let floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grass
  const grassTex = texLoader.load('/planterior-assets/textures/grass.jpg');
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(100, 100);
  grassTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  grassTex.colorSpace = THREE.SRGBColorSpace;
  let GRASS_SIZE = Math.max(ROOM_WIDTH, ROOM_DEPTH) * 10;
  let grass = new THREE.Mesh(new THREE.PlaneGeometry(GRASS_SIZE, GRASS_SIZE), new THREE.MeshStandardMaterial({
    map: grassTex, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide
  }));
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = FLOOR_Y - 0.001;
  grass.receiveShadow = true;
  scene.add(grass);

  // Walls
  const wallGroup = new THREE.Group();
  scene.add(wallGroup);

  let wallGeoFB = new THREE.PlaneGeometry(ROOM_WIDTH, WALL_HEIGHT);
  let ceilGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);

  const wallpaperTexFB = createHomeWallpaperTexture({ base: '#f4efe7', stripe: '#ecebe6', noise: 6, stripeWidth: 14, scale: 1.0 });
  const wallpaperTexLR = wallpaperTexFB.clone();
  wallpaperTexFB.repeat.set(wallRepeatX, wallRepeatY);
  wallpaperTexLR.repeat.set(wallRepeatZ, wallRepeatY);

  const wallMatFB = new THREE.MeshStandardMaterial({ map: wallpaperTexFB, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });
  const wallMatLR = new THREE.MeshStandardMaterial({ map: wallpaperTexLR, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });

  let wallFront = new THREE.Mesh(wallGeoFB, wallMatFB);
  wallFront.position.set(0, WALL_HEIGHT / 2, ROOM_DEPTH / 2);
  wallFront.rotateY(Math.PI);
  wallFront.receiveShadow = true;
  wallGroup.add(wallFront);

  let wallBack = new THREE.Mesh(wallGeoFB, wallMatFB);
  wallBack.position.set(0, WALL_HEIGHT / 2, -ROOM_DEPTH / 2);
  wallBack.receiveShadow = true;
  wallGroup.add(wallBack);

  const winW = 12, winH = 4;
  const winYCenter = 1 + winH / 2;

  let wallLeft = makeWallWithWindow(ROOM_DEPTH, WALL_HEIGHT, { x: 0, y: winYCenter - WALL_HEIGHT / 2, w: winW, h: winH }, wallMatLR);
  wallLeft.position.set(-ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
  wallLeft.rotateY(Math.PI / 2);
  scene.add(wallLeft);

  let wallRight = makeWallWithWindow(ROOM_DEPTH, WALL_HEIGHT, { x: 0, y: winYCenter - WALL_HEIGHT / 2, w: winW, h: winH }, wallMatLR);
  wallRight.position.set(ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
  wallRight.rotateY(-Math.PI / 2);
  scene.add(wallRight);

  let ceiling = new THREE.Mesh(ceilGeo, new THREE.MeshStandardMaterial({ color: 0xf7f7f7, roughness: 1, side: THREE.DoubleSide }));
  ceiling.position.set(0, WALL_HEIGHT, 0);
  ceiling.rotateX(Math.PI / 2);
  ceiling.receiveShadow = true;
  wallGroup.add(ceiling);


  // --- 8. Models Configuration ---
  interface ModelConfig {
    label: string;
    url: string;
    targetHeight: number;
    wallSnap?: boolean;
    showInToolbar?: boolean;
    canPlaceOn?: boolean;
    onlyOnSideboard?: boolean;
  }

  const MODEL_MAP: Record<string, ModelConfig> = {
    // Plants (Big)
    euphorbia_trigona: { label: '유포르비아 트리고나', url: '/planterior-assets/models/dynamic/big/Euphorbia_Trigona.glb', targetHeight: 5, showInToolbar: true },
    paradise_plant: { label: '극락조', url: '/planterior-assets/models/dynamic/big/Paradise_Plant.glb', targetHeight: 4.5, showInToolbar: true },
    rubber_tree: { label: '고무나무', url: '/planterior-assets/models/dynamic/big/Rubber_Tree.glb', targetHeight: 5, showInToolbar: true },
    philodendron_congo: { label: '필로덴드론 콩고', url: '/planterior-assets/models/dynamic/big/Philodendron_Congo.glb', targetHeight: 4.3, showInToolbar: true },
    // Plants (Middle)
    areca_palm: { label: '아레카 야자', url: '/planterior-assets/models/dynamic/middle/Areca_Palm.glb', targetHeight: 3.5, showInToolbar: true },
    monstera: { label: '몬스테라', url: '/planterior-assets/models/dynamic/middle/Monstera.glb', targetHeight: 3.5, showInToolbar: true },
    spathiphyllum: { label: '스파티필룸', url: '/planterior-assets/models/dynamic/middle/Spathiphyllum.glb', targetHeight: 3.5, showInToolbar: true },
    travelers_tree: { label: '여인초', url: '/planterior-assets/models/dynamic/middle/Travelers_Tree.glb', targetHeight: 3.5, showInToolbar: true },
    // Plants (Small)
    calathea_orbifolia: { label: '칼라데아 오르비폴리아', url: '/planterior-assets/models/dynamic/small/Calathea_Orbifolia.glb', targetHeight: 2.2, showInToolbar: true },
    golden_pothos: { label: '스킨답서스', url: '/planterior-assets/models/dynamic/small/Golden_Pothos.glb', targetHeight: 2.2, showInToolbar: true },
    mini_cactus: { label: '미니 선인장', url: '/planterior-assets/models/dynamic/small/Mini_Cactus.glb', targetHeight: 2.2, showInToolbar: true },
    tillandsia: { label: '틸란드시아', url: '/planterior-assets/models/dynamic/small/Tillandsia.glb', targetHeight: 2.2, showInToolbar: true },
    // Furniture
    sofa: { label: '소파', url: '/planterior-assets/models/static/Sofa.glb', targetHeight: 2, wallSnap: false, showInToolbar: true },
    coffee_table: { label: '커피 테이블', url: '/planterior-assets/models/static/Coffee_Table.glb', targetHeight: 1.2, showInToolbar: true, canPlaceOn: true },
    sideboard: { label: '사이드보드', url: '/planterior-assets/models/static/Sideboard.glb', targetHeight: 1.5, showInToolbar: true, canPlaceOn: true },
    television: { label: '텔레비전', url: '/planterior-assets/models/static/Television.glb', targetHeight: 3, showInToolbar: true, onlyOnSideboard: true },
    console_table: { label: '콘솔 테이블', url: '/planterior-assets/models/static/Console_Table.glb', targetHeight: 2, showInToolbar: true, canPlaceOn: true },
    plant_table_small: { label: '식물 받침대 (소)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.45, showInToolbar: true, canPlaceOn: true },
    plant_table_medium: { label: '식물 받침대 (중)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.6, showInToolbar: true, canPlaceOn: true },
    plant_table_large: { label: '식물 받침대 (대)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.8, showInToolbar: true, canPlaceOn: true },
    flower_vase: { label: '꽃병', url: '/planterior-assets/models/static/Flower_Vase.glb', targetHeight: 1.8, showInToolbar: true },
  };

  const PLANT_STAND_KEYS = new Set(['plant_table_small', 'plant_table_medium', 'plant_table_large']);
  const FURNITURE_BLOCK_KEYS = new Set(['sofa', 'coffee_table', 'sideboard', 'console_table', ...PLANT_STAND_KEYS]);

  // --- 9. Loader & Logic Helpers ---
  const loader = new GLTFLoader();
  const prototypeCache = new Map<string, THREE.Group>();
  const loadingCache = new Map<string, Promise<THREE.Group>>();
  const draggable: THREE.Object3D[] = [];

  function ensurePrototype(url: string): Promise<THREE.Group> {
    if (prototypeCache.has(url)) return Promise.resolve(prototypeCache.get(url)!);
    if (loadingCache.has(url)) return loadingCache.get(url)!;

    const p = new Promise<THREE.Group>((resolve, reject) => {
      loader.load(url, (gltf) => {
        const base = gltf.scene;
        base.traverse((c: any) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        prototypeCache.set(url, base);
        resolve(base);
      }, undefined, reject);
    });
    loadingCache.set(url, p);
    return p;
  }

  function getHalfHeight(obj: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(obj);
    return (box.max.y - box.min.y) / 2 || 0.5;
  }

  function getWorldSize(obj: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    return size;
  }

  function clampInRoomXZ(x: number, z: number, margin = 0.3) {
    const innerX = ROOM_WIDTH / 2 - margin;
    const innerZ = ROOM_DEPTH / 2 - margin;
    return {
      x: THREE.MathUtils.clamp(x, -innerX, innerX),
      z: THREE.MathUtils.clamp(z, -innerZ, innerZ),
    };
  }

  function normalizeHeight(obj: THREE.Object3D, targetHeight = 1.2) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.y > 0) {
      const s = targetHeight / size.y;
      obj.scale.setScalar(s);
    }
  }

  function getNearestWallSide(posXZ: THREE.Vector3) {
    const halfW = ROOM_WIDTH / 2;
    const halfD = ROOM_DEPTH / 2;
    const dLeft = Math.abs(posXZ.x - -halfW);
    const dRight = Math.abs(posXZ.x - +halfW);
    const dBack = Math.abs(posXZ.z - -halfD);
    const dFront = Math.abs(posXZ.z - +halfD);
    const min = Math.min(dLeft, dRight, dBack, dFront);
    if (min === dLeft) return 'left';
    if (min === dRight) return 'right';
    if (min === dBack) return 'back';
    return 'front';
  }

  function placeOnFloor(obj: THREE.Object3D, posXZ: THREE.Vector3) {
    const hh = getHalfHeight(obj);
    obj.position.set(posXZ.x, hh, posXZ.z);
  }

  function placeAgainstWall(obj: THREE.Object3D, side: string, gap = 0.03) {
    switch (side) {
      case 'front': obj.rotation.y = Math.PI; break;
      case 'left': obj.rotation.y = -Math.PI / 2; break;
      case 'right': obj.rotation.y = Math.PI / 2; break;
      case 'back': default: obj.rotation.y = 0; break;
    }
    const size = getWorldSize(obj);
    const halfW = ROOM_WIDTH / 2;
    const halfD = ROOM_DEPTH / 2;
    const current = obj.position.clone();
    const hh = getHalfHeight(obj);

    if (side === 'back') obj.position.set(current.x, hh, -halfD + size.z / 2 + gap);
    else if (side === 'front') obj.position.set(current.x, hh, +halfD - size.z / 2 - gap);
    else if (side === 'left') obj.position.set(-halfW + size.x / 2 + gap, hh, current.z);
    else if (side === 'right') obj.position.set(+halfW - size.x / 2 - gap, hh, current.z);
    obj.userData.wallSide = side;
  }

  function pointInFrontOfCamera() {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
    const ray = new THREE.Ray(camera.position.clone(), dir);
    const hit = new THREE.Vector3();
    if (ray.intersectPlane(plane, hit)) {
      const { x, z } = clampInRoomXZ(hit.x, hit.z);
      return new THREE.Vector3(x, 0, z);
    }
    return new THREE.Vector3(0, 0, 0);
  }

  function randJitter() {
    return new THREE.Vector3((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6);
  }

  // Stacking helpers
  function isPlantStandKey(key: string) { return PLANT_STAND_KEYS.has(key); }
  function isPlantModelKey(key: string) {
    if (!key) return false;
    const cfg = MODEL_MAP[key];
    return cfg?.url?.includes('/models/dynamic/');
  }

  function canPlaceSelectedOnBase(selectedKey: string, selectedCfg: any, baseObj: THREE.Object3D, baseCfg: any) {
    const baseKey = baseObj.userData?.modelKey;
    if (!baseKey || !baseCfg) return false;
    if (baseKey === 'flower_vase') return false;
    if (selectedCfg?.onlyOnSideboard) return baseKey === 'sideboard';
    if (isPlantStandKey(selectedKey)) return false; 
    if (isPlantStandKey(baseKey)) return isPlantModelKey(selectedKey);
    if (isPlantModelKey(selectedKey)) return baseCfg.canPlaceOn || false;
    return baseCfg.canPlaceOn || false;
  }

  function getPlaceableBases(selectedKey: string, selectedCfg: any, excludeObj: THREE.Object3D | null) {
    return draggable.filter((obj) => {
      if (!obj || obj === excludeObj) return false;
      const baseKey = obj.userData?.modelKey;
      if (!baseKey) return false;
      const baseCfg = MODEL_MAP[baseKey];
      if (!baseCfg) return false;
      return canPlaceSelectedOnBase(selectedKey, selectedCfg, obj, baseCfg);
    });
  }

  function placeOnTopOf(obj: THREE.Object3D, base: THREE.Object3D, gapY = 0.02) {
    obj.rotation.y = base.rotation.y;
    const baseBox = new THREE.Box3().setFromObject(base);
    const objBox = new THREE.Box3().setFromObject(obj);
    const objSize = new THREE.Vector3();
    objBox.getSize(objSize);

    const topY = baseBox.max.y;
    const pos = base.position.clone();
    const hh = objSize.y / 2;
    obj.position.set(pos.x, topY + hh + gapY, pos.z);
  }

  async function addModelByKey(key: string, posXZ: THREE.Vector3 | null = null) {
    const cfg = MODEL_MAP[key];
    if (!cfg) return;
    try {
      const base = await ensurePrototype(cfg.url);
      const model = base.clone(true);
      normalizeHeight(model, cfg.targetHeight);

      const spawn = (posXZ ?? pointInFrontOfCamera()).clone().add(randJitter());
      placeOnFloor(model, spawn);

      if (cfg.wallSnap) {
        const side = getNearestWallSide(spawn);
        if (!model.parent) scene.add(model);
        placeAgainstWall(model, side);
      } else {
        if (!model.parent) scene.add(model);
      }

      model.userData.modelKey = key;
      draggable.push(model);
    } catch (err) {
      console.error('Failed to load', key, err);
    }
  }

  // --- 10. Interaction (Drag, Drop, Preview, Stack) ---
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  let selected: THREE.Object3D | null = null;
  let dragPlane: THREE.Plane | null = null;
  let dragOffset = new THREE.Vector3();
  let selectedHalfH = 0;
  let isPointerDown = false;
  let previewModel: THREE.Object3D | null = null;
  let previewBaseObj: THREE.Object3D | null = null;
  let isDoubleClick = false;
  let lastClickTime = 0;
  let clickTimeout: any = null;

  function removePreview() {
    if (previewModel) {
      scene.remove(previewModel);
      previewModel = null;
      previewBaseObj = null;
    }
  }

  function updatePreview() {
    if (!selected) {
      removePreview();
      return;
    }
    const checkPoint = selected.position.clone();
    checkPoint.y += 1.0;

    const downRay = new THREE.Raycaster(checkPoint, new THREE.Vector3(0, -1, 0), 0, 15);
    const selectedKey = selected.userData?.modelKey;
    const selectedCfg = selectedKey ? MODEL_MAP[selectedKey] : null;
    const isFurniture = selectedKey && FURNITURE_BLOCK_KEYS.has(selectedKey) && !isPlantModelKey(selectedKey);

    if (isFurniture) {
      removePreview();
      return;
    }

    const placeableFurniture = getPlaceableBases(selectedKey, selectedCfg, selected);
    const hits = downRay.intersectObjects(placeableFurniture, true);

    let baseObj: THREE.Object3D | null = null;
    if (hits.length > 0) {
      let obj: any = hits[0].object;
      while (obj && !draggable.includes(obj)) obj = obj.parent;
      baseObj = obj;
    } else {
      let minDist = Infinity;
      placeableFurniture.forEach((obj) => {
        const dist = selected!.position.distanceTo(obj.position);
        if (dist < minDist && dist < 3) {
          minDist = dist;
          baseObj = obj;
        }
      });
    }

    if (baseObj && baseObj !== selected) {
      if (previewBaseObj === baseObj && previewModel) {
        // Update existing preview pos
        const baseBox = new THREE.Box3().setFromObject(baseObj);
        const objBox = new THREE.Box3().setFromObject(previewModel);
        const objSize = new THREE.Vector3();
        objBox.getSize(objSize);
        const topY = baseBox.max.y;
        const hh = objSize.y / 2;
        previewModel.position.set(baseObj.position.x, topY + hh + 0.01, baseObj.position.z);
        previewModel.rotation.y = selected.rotation.y;
      } else {
        removePreview();
        previewModel = selected.clone(true);
        previewModel.traverse((child: any) => {
          if (child.isMesh && child.material) {
            const mat = Array.isArray(child.material) ? child.material[0].clone() : child.material.clone();
            mat.transparent = true;
            mat.opacity = 0.4;
            mat.emissive = new THREE.Color(0x4488ff).multiplyScalar(0.2);
            child.material = mat;
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });
        placeOnTopOf(previewModel, baseObj, 0.01);
        previewModel.rotation.y = selected.rotation.y;
        scene.add(previewModel);
        previewBaseObj = baseObj;
      }
    } else {
      removePreview();
    }
  }

  function setMouseFromEvent(e: MouseEvent | PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function pick(e: MouseEvent | PointerEvent) {
    setMouseFromEvent(e);
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(draggable, true);
    if (hits.length) {
      let obj: any = hits[0].object;
      while (obj && !draggable.includes(obj)) obj = obj.parent;
      if (!obj) return;

      selected = obj;
      selectedHalfH = getHalfHeight(obj);
      dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -selectedHalfH);

      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane!, hitPoint);
      dragOffset.copy(selected!.position).sub(hitPoint);

      removePreview();
      controls.enabled = false;
      renderer.domElement.style.cursor = 'grabbing';
    }
  }

  function move(e: MouseEvent | PointerEvent) {
    if (!selected || !dragPlane) return;
    setMouseFromEvent(e);
    raycaster.setFromCamera(mouseNDC, camera);
    const point = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, point)) {
      point.add(dragOffset);
      const { x, z } = clampInRoomXZ(point.x, point.z);

      // Detach from base if dragging
      if (selected.userData.placedOn) {
        const baseObj = selected.userData.placedOn;
        if (baseObj.userData.placedItems) {
          const idx = baseObj.userData.placedItems.indexOf(selected);
          if (idx !== -1) baseObj.userData.placedItems.splice(idx, 1);
        }
        selected.userData.placedOn = null;
      }

      const oldPos = selected.position.clone();
      const side = selected.userData?.wallSide;
      if (side === 'back' || side === 'front') {
        selected.position.set(x, selectedHalfH, selected.position.z);
      } else if (side === 'left' || side === 'right') {
        selected.position.set(selected.position.x, selectedHalfH, z);
      } else {
        selected.position.set(x, selectedHalfH, z);
      }

      // Move stacked items
      const placedItems = selected.userData?.placedItems;
      if (placedItems && placedItems.length > 0) {
        const offset = new THREE.Vector3().subVectors(selected.position, oldPos);
        placedItems.forEach((item: THREE.Object3D) => {
          if (item && item.parent) item.position.add(offset);
        });
      }
      updatePreview();
    }
  }

  function drop() {
    removePreview();
    if (selected) {
      const dropPoint = selected.position.clone();
      dropPoint.y += 1.0;
      const downRay = new THREE.Raycaster(dropPoint, new THREE.Vector3(0, -1, 0), 0, 15);
      
      const selectedKey = selected.userData?.modelKey;
      const selectedCfg = selectedKey ? MODEL_MAP[selectedKey] : null;
      const isFurniture = selectedKey && FURNITURE_BLOCK_KEYS.has(selectedKey) && !isPlantModelKey(selectedKey);

      if (isFurniture) {
        selected.position.y = selectedHalfH;
        selected.userData.placedOn = null;
      } else {
        const placeableFurniture = getPlaceableBases(selectedKey!, selectedCfg, selected);
        const hits = downRay.intersectObjects(placeableFurniture, true);
        let baseObj: THREE.Object3D | null = null;
        
        if (hits.length > 0) {
            let obj: any = hits[0].object;
            while (obj && !draggable.includes(obj)) obj = obj.parent;
            baseObj = obj;
        } else {
             let minDist = Infinity;
             placeableFurniture.forEach((obj) => {
                const dist = selected!.position.distanceTo(obj.position);
                if (dist < minDist && dist < 3) {
                    minDist = dist;
                    baseObj = obj;
                }
             });
        }

        if (baseObj && baseObj !== selected) {
            placeOnTopOf(selected, baseObj, 0.01);
            selected.userData.placedOn = baseObj;
            if (!baseObj.userData.placedItems) baseObj.userData.placedItems = [];
            if (!baseObj.userData.placedItems.includes(selected)) baseObj.userData.placedItems.push(selected);
        } else {
            selected.position.y = selectedHalfH;
            selected.userData.placedOn = null;
        }
      }
    }
    selected = null;
    dragPlane = null;
    controls.enabled = true;
    renderer.domElement.style.cursor = 'default';
  }

  // --- 11. Event Listeners ---
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button === 2) { // Right click -> Delete
      setMouseFromEvent(e);
      raycaster.setFromCamera(mouseNDC, camera);
      const hits = raycaster.intersectObjects(draggable, true);
      if (hits.length) {
        let obj: any = hits[0].object;
        while (obj && !draggable.includes(obj)) obj = obj.parent;
        if (obj) {
          // Reset items on top
          const placedItems = obj.userData?.placedItems;
          if (placedItems && placedItems.length > 0) {
            placedItems.forEach((item: THREE.Object3D) => {
                if (item && item.parent) {
                    const hh = getHalfHeight(item);
                    item.position.y = hh;
                    item.userData.placedOn = null;
                }
            });
          }
          scene.remove(obj);
          const idx = draggable.indexOf(obj);
          if (idx !== -1) draggable.splice(idx, 1);
        }
      }
      return;
    }
    if (e.button === 0) {
      const now = Date.now();
      if (now - lastClickTime < 300) {
          return; // Double click handled elsewhere
      }
      lastClickTime = now;
      clickTimeout = setTimeout(() => { clickTimeout = null; }, 300);
      isPointerDown = true;
      pick(e);
    }
  });

  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    move(e);
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
    if (isDoubleClick) {
        isDoubleClick = false;
        selected = null;
        return;
    }
    drop();
  });

  // Double click to rotate
  renderer.domElement.addEventListener('dblclick', (e) => {
      e.preventDefault();
      isDoubleClick = true;
      selected = null;
      if (clickTimeout) { clearTimeout(clickTimeout); clickTimeout = null; }

      setMouseFromEvent(e);
      raycaster.setFromCamera(mouseNDC, camera);
      const hits = raycaster.intersectObjects(draggable, true);
      if (hits.length) {
          let obj: any = hits[0].object;
          while (obj && !draggable.includes(obj)) obj = obj.parent;
          if (obj) {
            obj.rotation.y += Math.PI / 2;
            // Rotate items on top
            const placedItems = obj.userData?.placedItems;
            if (placedItems) {
                placedItems.forEach((item: THREE.Object3D) => {
                    item.rotation.y += Math.PI / 2;
                    placeOnTopOf(item, obj, 0.01);
                });
            }
            // Wall adjustment
            const wallSide = obj.userData?.wallSide;
            if (wallSide) {
                placeAgainstWall(obj, wallSide, 0.03); // snap back
                // Re-adjust children
                if (placedItems) {
                    placedItems.forEach((item: THREE.Object3D) => placeOnTopOf(item, obj, 0.01));
                }
            }
          }
      }
  });

  // --- 12. UI Generation (Buttons & Resize) ---
  function renderModelButtons() {
    if (!toolbarElement) return;
    const wrap = document.createElement('div');
    wrap.className = 'model-buttons-row'; // Ensure css exists for this
    wrap.style.display = 'flex';
    wrap.style.gap = '8px';
    wrap.style.overflowX = 'auto';
    wrap.style.padding = '8px';

    for (const [key, cfg] of Object.entries(MODEL_MAP)) {
      if (cfg.showInToolbar) {
        const btn = document.createElement('button');
        btn.dataset.model = key;
        btn.textContent = cfg.label;
        btn.style.padding = '6px 12px';
        btn.style.whiteSpace = 'nowrap';
        btn.style.cursor = 'pointer';
        wrap.appendChild(btn);
      }
    }
    // Remove old if any
    while(toolbarElement.firstChild) toolbarElement.removeChild(toolbarElement.firstChild);
    toolbarElement.appendChild(wrap);
  }
  renderModelButtons();

  toolbarElement.addEventListener('click', (e: any) => {
    const key = e.target?.dataset?.model;
    if (!key) return;
    addModelByKey(key);
  });

  // Room Size UI (Moved to Bottom-Right)
  const controlsDiv = document.createElement('div');
  controlsDiv.style.position = 'absolute';
  controlsDiv.style.bottom = '10px'; // Changed from top to bottom
  controlsDiv.style.right = '10px';
  controlsDiv.style.background = 'rgba(255,255,255,0.9)';
  controlsDiv.style.padding = '10px';
  controlsDiv.style.borderRadius = '8px';
  controlsDiv.style.display = 'flex';
  controlsDiv.style.flexDirection = 'column';
  controlsDiv.style.gap = '5px';
  controlsDiv.style.fontSize = '14px';
  controlsDiv.style.zIndex = '100'; // Ensure it's on top
  controlsDiv.innerHTML = `
    <div><label>가로(m): <input type="number" id="rw" value="15" style="width:50px"></label></div>
    <div><label>세로(m): <input type="number" id="rd" value="15" style="width:50px"></label></div>
    <div><label>높이(m): <input type="number" id="rh" value="6" style="width:50px"></label></div>
    <button id="btn-resize" style="cursor:pointer; margin-top:5px;">방 크기 적용</button>
  `;
  appElement.appendChild(controlsDiv);

  function updateRoomSize(w: number, d: number, h: number) {
     const minSize = 5, maxSize = 50, minH = 3, maxH = 15;
     ROOM_WIDTH = THREE.MathUtils.clamp(w, minSize, maxSize);
     ROOM_DEPTH = THREE.MathUtils.clamp(d, minSize, maxSize);
     WALL_HEIGHT = THREE.MathUtils.clamp(h, minH, maxH);

     wallRepeatX = ROOM_WIDTH / metersPerRepeat;
     wallRepeatY = WALL_HEIGHT / metersPerRepeat;
     wallRepeatZ = ROOM_DEPTH / metersPerRepeat;
     floorRepeatX = ROOM_WIDTH / metersPerRepeat;
     floorRepeatY = ROOM_DEPTH / metersPerRepeat;

     // Rebuild floor
     floor.geometry.dispose();
     floor.geometry = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);
     floorTex.repeat.set(floorRepeatX, floorRepeatY);

     // Rebuild grass
     GRASS_SIZE = Math.max(ROOM_WIDTH, ROOM_DEPTH) * 10;
     grass.geometry.dispose();
     grass.geometry = new THREE.PlaneGeometry(GRASS_SIZE, GRASS_SIZE);

     // Rebuild grid
     if(grid) grid.dispose();
     grid = new THREE.GridHelper(Math.max(ROOM_WIDTH, ROOM_DEPTH) - 0.02, 24, 0x475569, 0x334155);
     grid.position.y = FLOOR_Y + 0.01;

     // Update Walls
     wallGeoFB.dispose();
     wallGeoFB = new THREE.PlaneGeometry(ROOM_WIDTH, WALL_HEIGHT);
     wallpaperTexFB.repeat.set(wallRepeatX, wallRepeatY);
     wallpaperTexLR.repeat.set(wallRepeatZ, wallRepeatY);

     wallFront.geometry = new THREE.PlaneGeometry(ROOM_WIDTH, WALL_HEIGHT);
     wallFront.position.set(0, WALL_HEIGHT / 2, ROOM_DEPTH / 2);
     wallBack.geometry = new THREE.PlaneGeometry(ROOM_WIDTH, WALL_HEIGHT);
     wallBack.position.set(0, WALL_HEIGHT / 2, -ROOM_DEPTH / 2);

     scene.remove(wallLeft);
     scene.remove(wallRight);
     if(wallLeft.geometry) wallLeft.geometry.dispose();
     if(wallRight.geometry) wallRight.geometry.dispose();

     wallLeft = makeWallWithWindow(ROOM_DEPTH, WALL_HEIGHT, { x: 0, y: winYCenter - WALL_HEIGHT / 2, w: winW, h: winH }, wallMatLR);
     wallLeft.position.set(-ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
     wallLeft.rotateY(Math.PI / 2);
     scene.add(wallLeft);

     wallRight = makeWallWithWindow(ROOM_DEPTH, WALL_HEIGHT, { x: 0, y: winYCenter - WALL_HEIGHT / 2, w: winW, h: winH }, wallMatLR);
     wallRight.position.set(ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
     wallRight.rotateY(-Math.PI / 2);
     scene.add(wallRight);

     ceiling.geometry.dispose();
     ceiling.geometry = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);
     ceiling.position.set(0, WALL_HEIGHT, 0);

     sun.target.position.set(0, Math.max(ROOM_WIDTH, ROOM_DEPTH) * 0.35, 0);

     // Re-clamp objects
     draggable.forEach(obj => {
        const {x, z} = clampInRoomXZ(obj.position.x, obj.position.z);
        const placedOn = obj.userData?.placedOn;
        if (placedOn && placedOn.parent) {
             const baseXZ = clampInRoomXZ(placedOn.position.x, placedOn.position.z);
             const baseHh = getHalfHeight(placedOn);
             placedOn.position.set(baseXZ.x, baseHh, baseXZ.z);
             placeOnTopOf(obj, placedOn, 0.01);
        } else {
             const hh = getHalfHeight(obj);
             obj.position.set(x, hh, z);
        }
     });
     clampCameraToRoom();
  }

  const btnResize = document.getElementById('btn-resize');
  if (btnResize) {
      btnResize.addEventListener('click', () => {
         const w = parseFloat((document.getElementById('rw') as HTMLInputElement).value);
         const d = parseFloat((document.getElementById('rd') as HTMLInputElement).value);
         const h = parseFloat((document.getElementById('rh') as HTMLInputElement).value);
         if (!isNaN(w)) updateRoomSize(w, d, h);
      });
  }

  // --- 13. Camera Logic (Clamp & Keyboard) ---
  const keys: Record<string, boolean> = {};
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  function handleCameraMovement() {
     const moveSpeed = 0.15;
     if (!Object.values(keys).some(k => k)) return;

     const dir = new THREE.Vector3();
     camera.getWorldDirection(dir);
     const forward = new THREE.Vector3(dir.x, 0, dir.z).normalize();
     const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();
     const moveVec = new THREE.Vector3();

     if(keys.ArrowUp || keys.KeyW) moveVec.add(forward.multiplyScalar(moveSpeed));
     if(keys.ArrowDown || keys.KeyS) moveVec.add(forward.multiplyScalar(-moveSpeed));
     if(keys.ArrowRight || keys.KeyD) moveVec.add(right.multiplyScalar(moveSpeed));
     if(keys.ArrowLeft || keys.KeyA) moveVec.add(right.multiplyScalar(-moveSpeed));

     camera.position.add(moveVec);
     controls.target.add(moveVec);
  }

  function clampCameraToRoom() {
      const margin = 0.5;
      const minY = 0.5;
      const maxY = WALL_HEIGHT - 0.5;
      const halfW = ROOM_WIDTH / 2 - margin;
      const halfD = ROOM_DEPTH / 2 - margin;

      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -halfW, halfW);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, minY, maxY);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -halfD, halfD);

      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -halfW, halfW);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0, WALL_HEIGHT);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -halfD, halfD);

      controls.minDistance = 1;
      controls.maxDistance = Math.max(ROOM_WIDTH, ROOM_DEPTH, WALL_HEIGHT) * 1.5;
  }

  // Initial Camera Pos
  camera.position.set(Math.min(ROOM_WIDTH / 2 - 1, 8), WALL_HEIGHT * 0.6, Math.min(ROOM_DEPTH / 2 - 1, 8));

  // --- 14. Animation Loop & Resize Handler ---
  function onResize() {
    const width = appElement.clientWidth;
    const height = appElement.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  const hint = document.createElement('div');
  hint.className = 'planterior-hint';
  hint.style.position = 'absolute';
  hint.style.bottom = '10px';
  hint.style.left = '10px';
  hint.style.color = '#333';
  hint.style.background = 'rgba(255,255,255,0.8)';
  hint.style.padding = '10px';
  hint.style.borderRadius = '8px';
  hint.style.pointerEvents = 'none';
  hint.innerHTML = `
    <b>조작 방법</b><br/>
    - 상단 버튼: 모델 추가<br/>
    - 드래그: 이동 (가구 위 쌓기 가능)<br/>
    - 더블클릭: 90도 회전<br/>
    - 우클릭: 삭제<br/>
    - WASD/화살표: 카메라 이동
  `;
  appElement.appendChild(hint);

  renderer.setAnimationLoop(() => {
    handleCameraMovement();
    controls.update();
    clampCameraToRoom();
    renderer.render(scene, camera);
  });

  // Cleanup
  return () => {
    renderer.setAnimationLoop(null);
    renderer.dispose();
    window.removeEventListener('resize', onResize);
    if (appElement.contains(renderer.domElement)) {
      appElement.removeChild(renderer.domElement);
    }
    if (appElement.contains(controlsDiv)) appElement.removeChild(controlsDiv);
    if (appElement.contains(hint)) appElement.removeChild(hint);
  };
}