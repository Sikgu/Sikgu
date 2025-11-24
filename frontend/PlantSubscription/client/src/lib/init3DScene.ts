import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// [1] 외부에서 사용할 컨트롤러 타입 정의
export interface SceneControls {
  cleanup: () => void;
  save: () => string;
  load: (jsonString: string) => Promise<void>;
}

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
  let WALL_HEIGHT = 10;
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
    canPlaceOn?: boolean;
    onlyOnSideboard?: boolean;
  }

  const MODEL_MAP: Record<string, ModelConfig> = {
    // Plants (Big)
    euphorbia_trigona: { label: '유포르비아 트리고나', url: '/planterior-assets/models/dynamic/big/Euphorbia_Trigona.glb', targetHeight: 5 },
    paradise_plant: { label: '극락조', url: '/planterior-assets/models/dynamic/big/Paradise_Plant.glb', targetHeight: 4.5 },
    rubber_tree: { label: '고무나무', url: '/planterior-assets/models/dynamic/big/Rubber_Tree.glb', targetHeight: 5 },
    philodendron_congo: { label: '필로덴드론 콩고', url: '/planterior-assets/models/dynamic/big/Philodendron_Congo.glb', targetHeight: 4.3 },
    // Plants (Middle)
    areca_palm: { label: '아레카 야자', url: '/planterior-assets/models/dynamic/middle/Areca_Palm.glb', targetHeight: 3.5 },
    monstera: { label: '몬스테라', url: '/planterior-assets/models/dynamic/middle/Monstera.glb', targetHeight: 3.5 },
    spathiphyllum: { label: '스파티필룸', url: '/planterior-assets/models/dynamic/middle/Spathiphyllum.glb', targetHeight: 3.5 },
    travelers_tree: { label: '여인초', url: '/planterior-assets/models/dynamic/middle/Travelers_Tree.glb', targetHeight: 3.5 },
    // Plants (Small)
    calathea_orbifolia: { label: '칼라데아 오르비폴리아', url: '/planterior-assets/models/dynamic/small/Calathea_Orbifolia.glb', targetHeight: 2.2 },
    golden_pothos: { label: '스킨답서스', url: '/planterior-assets/models/dynamic/small/Golden_Pothos.glb', targetHeight: 2.2 },
    mini_cactus: { label: '미니 선인장', url: '/planterior-assets/models/dynamic/small/Mini_Cactus.glb', targetHeight: 2.2 },
    tillandsia: { label: '틸란드시아', url: '/planterior-assets/models/dynamic/small/Tillandsia.glb', targetHeight: 2.2 },
    // Furniture
    sofa: { label: '소파', url: '/planterior-assets/models/static/Sofa.glb', targetHeight: 2},
    coffee_table: { label: '커피 테이블', url: '/planterior-assets/models/static/Coffee_Table.glb', targetHeight: 1.2, canPlaceOn: true },
    sideboard: { label: '사이드보드', url: '/planterior-assets/models/static/Sideboard.glb', targetHeight: 1.5, canPlaceOn: true },
    television: { label: '텔레비전', url: '/planterior-assets/models/static/Television.glb', targetHeight: 3, onlyOnSideboard: true },
    console_table: { label: '콘솔 테이블', url: '/planterior-assets/models/static/Console_Table.glb', targetHeight: 2, canPlaceOn: true },
    plant_table_small: { label: '식물 받침대 (소)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.45, canPlaceOn: true },
    plant_table_medium: { label: '식물 받침대 (중)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.6, canPlaceOn: true },
    plant_table_large: { label: '식물 받침대 (대)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.8, canPlaceOn: true },
    flower_vase: { label: '꽃병', url: '/planterior-assets/models/static/Flower_Vase.glb', targetHeight: 1.8 },
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

// // 아까 드린 테스트용 JSON 데이터
// const TEST_JSON_DATA = {
//   "room": {
//     "width": 15,
//     "depth": 15,
//     "height": 20
//   },
//   "objects": [
//     {
//       "modelKey": "sofa",
//       "position": { "x": -4.0, "y": 1.0, "z": -3.0 },
//       "rotation": { "y": 90 }
//     },
//     {
//       "modelKey": "coffee_table",
//       "position": { "x": 2.0, "y": 0.6, "z": 2.0 },
//       "rotation": { "y": 0 }
//     },
//     {
//       "modelKey": "mini_cactus",
//       "position": { "x": 2.0, "y": 2.31, "z": 2.0 }, // 테이블 위 좌표
//       "rotation": { "y": 0 }
//     },
//     {
//       "modelKey": "travelers_tree",
//       "position": { "x": -5.0, "y": 1.75, "z": 4.0 },
//       "rotation": { "y": 0 }
//     }
//   ]
// };


async function addModelByKey(key: string, options: { 
      pos?: { x: number, y: number, z: number }, 
      rotY?: number 
  } = {}) {
    const cfg = MODEL_MAP[key];
    if (!cfg) return;

    try {
      const base = await ensurePrototype(cfg.url);
      const model = base.clone(true);
      normalizeHeight(model, cfg.targetHeight);

      // [중요] 위치 설정 로직 분기
      if (options.pos) {
        // 1. 저장된 위치가 있으면 그대로 사용 (랜덤 X, 벽 스냅 X)
        model.position.set(options.pos.x, options.pos.y, options.pos.z);
      } else {
        // 2. 신규 생성일 때만 랜덤 배치 및 벽 스냅 적용
        const spawn = pointInFrontOfCamera().clone().add(randJitter());
        placeOnFloor(model, spawn);
        
        if (cfg.wallSnap) {
          const side = getNearestWallSide(spawn);
          placeAgainstWall(model, side);
        }
      }

      // 회전값 복원
      if (options.rotY !== undefined) {
        model.rotation.y = options.rotY;
      }

      model.userData.modelKey = key;
      
      if (!model.parent) scene.add(model);
      draggable.push(model);
      
      // reconstructStacking(objects)
      reconstructStacking(draggable)  
      
      // 로딩 중이 아닐 때만 로그 출력 (options.pos가 없으면 신규 생성)
      if (!options.pos) {
          logRoomState(`모델 생성: ${cfg.label}`);
      }

      return model; // 로딩 시 참조를 위해 모델 객체 반환

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

      logRoomState('객체 이동/배치');
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

          logRoomState('객체 삭제');
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
            logRoomState('객체 회전');
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
      const btn = document.createElement('button');
      btn.dataset.model = key;
      btn.textContent = cfg.label;
      btn.style.padding = '6px 12px';
      btn.style.whiteSpace = 'nowrap';
      btn.style.cursor = 'pointer';
      wrap.appendChild(btn);
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
    <button id="btn-save" style="cursor:pointer; width:100%; padding:8px; background:#4CAF50; color:white; border:none; border-radius:4px; font-weight:bold; margin-bottom:10px;">
      💾 현재 상태 저장
    </button>
    <div style="border-top:1px solid #ddd; padding-top:10px; margin-top:5px;">
      <div style="margin-bottom:5px;"><strong>방 크기 설정</strong></div>
      <div style="margin-bottom:5px;"><label>가로(m): <input type="number" id="rw" value="15" style="width:50px"></label></div>
      <div style="margin-bottom:5px;"><label>세로(m): <input type="number" id="rd" value="15" style="width:50px"></label></div>
      <div style="margin-bottom:5px;"><label>높이(m): <input type="number" id="rh" value="10" style="width:50px"></label></div>
      <button id="btn-resize" style="cursor:pointer; width:100%; padding:5px;">적용</button>
    </div>
  `;
  appElement.appendChild(controlsDiv);
  appElement.appendChild(controlsDiv);

  // const btnSave = document.getElementById('btn-save');
  // if (btnSave) {
  //   btnSave.addEventListener('click', async () => {
  //     // 1. 현재 씬 상태를 JSON 문자열로 변환
  //     const jsonString = exportSceneToJson();
      
  //     try {
  //       // 2. 백엔드로 전송 (엔드포인트는 본인 서버에 맞게 수정 필요)
  //       const response = await fetch('/room', { 
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         credentials: 'include', 
  //         body: jsonString // JSON 데이터 본문
  //       });

  //       if (response.ok) {
  //         alert('성공적으로 저장되었습니다!');
  //       } else {
  //         alert('저장에 실패했습니다. 상태 코드를 확인하세요.');
  //         console.error('Save failed:', response.status, response.statusText);
  //       }
  //     } catch (error) {
  //       console.error('Error saving room:', error);
  //       alert('서버 연결 중 오류가 발생했습니다.');
  //     }
  //   });
  // }

  // ... (상단 코드 생략)

  const btnSave = document.getElementById('btn-save');
  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      const jsonString = exportSceneToJson();

      // [수정됨] sessionStorage에서 토큰 가져오기
      const token = sessionStorage.getItem("bearerToken"); 

      try {
        const response = await fetch('/room', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // [수정됨] 토큰이 있으면 헤더에 추가 (없으면 안 보냄)
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          credentials: 'include', 
          body: jsonString
        });

        if (response.ok) {
          alert('성공적으로 저장되었습니다!');
        } else {
          if (response.status === 403) alert('권한이 없습니다. 다시 로그인해 주세요.');
          else alert('저장에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error saving room:', error);
      }
    });
  }

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

  /** ===== 방 상태 출력 함수 ===== */
  function logRoomState(action = '') {
    const state = {
      action: action || '상태 확인',
      room: {
        width: ROOM_WIDTH,
        depth: ROOM_DEPTH,
        height: WALL_HEIGHT,
      },
      objects: draggable.map((obj) => {
        const modelKey = obj.userData?.modelKey
        const cfg = modelKey ? MODEL_MAP[modelKey] : null
        const placedOn = obj.userData?.placedOn
        const placedItems = obj.userData?.placedItems || []

        return {
          modelKey: modelKey || 'unknown',
          label: cfg?.label || '알 수 없음',
          position: {
            x: Math.round(obj.position.x * 100) / 100,
            y: Math.round(obj.position.y * 100) / 100,
            z: Math.round(obj.position.z * 100) / 100,
          },
          rotation: {
            y: Math.round(((obj.rotation.y * 180) / Math.PI) * 100) / 100, // 도 단위로 변환
          },
          placedOn: placedOn
            ? {
                modelKey: placedOn.userData?.modelKey || 'unknown',
                label:
                  MODEL_MAP[placedOn.userData?.modelKey]?.label || '알 수 없음',
              }
            : null,
          placedItemsCount: placedItems.length,
          placedItems: placedItems.map((item) => ({
            modelKey: item.userData?.modelKey || 'unknown',
            label: MODEL_MAP[item.userData?.modelKey]?.label || '알 수 없음',
          })),
        }
      }),
    }

    console.log('=== 방 상태 ===', state)
    return state
  }

  function exportSceneToJson() {
    const data = {
      room: {
        width: ROOM_WIDTH,
        depth: ROOM_DEPTH,
        height: WALL_HEIGHT,
      },
      // 백엔드 DTO 구조에 맞춰서 변환 (objects -> coordinates)
      coordinates: draggable.map((obj) => ({
        name: obj.userData.modelKey, // modelKey -> name
        x: parseFloat(obj.position.x.toFixed(3)),
        y: parseFloat(obj.position.y.toFixed(3)),
        z: parseFloat(obj.position.z.toFixed(3)),
        rotation: parseFloat(obj.rotation.y.toFixed(3)) // rotation.y -> rotation
      })),
    };
    return JSON.stringify(data);
  }

  async function importSceneFromJson(jsonString: string) {
    try {
        const json = JSON.parse(jsonString);
        
        // 1. 기존 객체 모두 삭제
        [...draggable].forEach(obj => scene.remove(obj));
        draggable.length = 0;

        // 2. 방 크기 복원
        if (json.room) {
          updateRoomSize(
            Number(json.room.width), 
            Number(json.room.depth), 
            Number(json.room.height)
          );
          // UI 업데이트
          const rw = document.getElementById('rw') as HTMLInputElement;
          const rd = document.getElementById('rd') as HTMLInputElement;
          const rh = document.getElementById('rh') as HTMLInputElement;
          if(rw) rw.value = json.room.width;
          if(rd) rd.value = json.room.depth;
          if(rh) rh.value = json.room.height;
        }

        // 3. 모델 생성 (백엔드 구조: coordinates 배열, name, x, y, z, rotation)
        // 혹시 모를 호환성을 위해 json.coordinates가 없으면 json.objects를 보도록 처리
        const items = json.coordinates || json.objects || [];

        const loadPromises = items.map((item: any) => {
            // 백엔드: name, 프론트엔드 구버전: modelKey
            const key = item.name || item.modelKey;
            
            // 백엔드: 평탄화된 x,y,z / 프론트엔드 구버전: item.position.x
            const posX = item.x !== undefined ? item.x : item.position?.x;
            const posY = item.y !== undefined ? item.y : item.position?.y;
            const posZ = item.z !== undefined ? item.z : item.position?.z;

            // 백엔드: rotation (float), 프론트엔드 구버전: item.rotation.y
            const rotY = item.rotation !== undefined ? item.rotation : item.rotation?.y;

            return addModelByKey(key, {
                pos: { x: posX, y: posY, z: posZ },
                rotY: rotY
            });
        });

        await Promise.all(loadPromises);

        // 4. 관계 재설정 (Stacking)
        reconstructStacking(draggable);

        console.log("씬 복원 완료 (Backend Format)");
        logRoomState("불러오기 완료");

    } catch (e) {
        console.error("JSON 파싱 또는 로딩 실패", e);
    }
  }

  function reconstructStacking(objects: THREE.Object3D[]) {
    // 1. 오차 범위 (약 10cm 이내면 수직으로 겹친다고 판단)
    const EPSILON = 0.0001; 

    objects.forEach(child => {
        // 모든 물체 중에서 '나(child)'의 부모가 될 후보들을 찾습니다.
        const potentialParents = objects.filter(parent => {
            // 1. 나 자신은 제외
            if (child === parent) return false;

            // 2. Y축 높이 비교: 나보다 아래에 있어야 함 (부모 < 자식)
            if (parent.position.y >= child.position.y) return false;

            // 3. X, Z축 위치 비교: 수직으로 겹쳐야 함
            const dx = Math.abs(child.position.x - parent.position.x);
            const dz = Math.abs(child.position.z - parent.position.z);

            return dx < EPSILON && dz < EPSILON;
        });

        // 후보가 없다면 바닥에 있는 것이므로 패스
        if (potentialParents.length === 0) return;

        // 후보가 여러 개라면(예: 바닥 -> 탁자 -> 책), 그중에서 가장 높이 있는(Y가 가장 큰) 것이 내 바로 밑의 부모입니다.
        // Y좌표 내림차순 정렬
        potentialParents.sort((a, b) => b.position.y - a.position.y);
        
        const realParent = potentialParents[0]; // 가장 가까운 바로 아래 물체

        // === 관계 형성 (move 함수가 작동하기 위해 필수) ===
        // 1. 자식에게 부모 정보 입력
        child.userData.placedOn = realParent;

        // 2. 부모에게 자식 목록 추가
        if (!realParent.userData.placedItems) {
            realParent.userData.placedItems = [];
        }
        // 중복 방지 후 추가
        if (!realParent.userData.placedItems.includes(child)) {
            realParent.userData.placedItems.push(child);
        }
    });
  }
  
  // Cleanup 및 외부 함수 노출
  return {
      cleanup: () => {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        window.removeEventListener('resize', onResize);
        if (appElement.contains(renderer.domElement)) {
          appElement.removeChild(renderer.domElement);
        }
        if (appElement.contains(controlsDiv)) appElement.removeChild(controlsDiv);
        if (appElement.contains(hint)) appElement.removeChild(hint);
      },
      save: exportSceneToJson, // 이제 이 함수를 호출하면 JSON 문자열을 줌
      load: importSceneFromJson // 이 함수에 JSON 문자열을 주면 화면이 복구됨
  };
  
  // // Cleanup
  // return () => {
  //   renderer.setAnimationLoop(null);
  //   renderer.dispose();
  //   window.removeEventListener('resize', onResize);
  //   if (appElement.contains(renderer.domElement)) {
  //     appElement.removeChild(renderer.domElement);
  //   }
  //   if (appElement.contains(controlsDiv)) appElement.removeChild(controlsDiv);
  //   if (appElement.contains(hint)) appElement.removeChild(hint);
  // }
}