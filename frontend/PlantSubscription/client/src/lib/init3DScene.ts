import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface SceneControls {
  cleanup: () => void;
  save: () => string;
  load: (jsonString: string) => Promise<void>;
}

export function init3DScene(appElement: HTMLElement, toolbarElement: HTMLElement): SceneControls {
  // --- Constants & Config ---
  const METERS_PER_REPEAT = 6.0;
  const PLANT_STAND_KEYS = new Set(['plant_table_small', 'plant_table_medium', 'plant_table_large']);
  const FURNITURE_BLOCK_KEYS = new Set(['sofa', 'coffee_table', 'sideboard', 'console_table', ...PLANT_STAND_KEYS]);

  interface ModelConfig {
    label: string;
    url: string;
    targetHeight: number;
    wallSnap?: boolean;
    canPlaceOn?: boolean;
    onlyOnSideboard?: boolean;
  }

  const MODEL_MAP: Record<string, ModelConfig> = {
    // Plants
    euphorbia_trigona: { label: '유포르비아 트리고나', url: '/planterior-assets/models/dynamic/big/Euphorbia_Trigona.glb', targetHeight: 5 },
    paradise_plant: { label: '극락조', url: '/planterior-assets/models/dynamic/big/Paradise_Plant.glb', targetHeight: 4.5 },
    rubber_tree: { label: '고무나무', url: '/planterior-assets/models/dynamic/big/Rubber_Tree.glb', targetHeight: 5 },
    philodendron_congo: { label: '필로덴드론 콩고', url: '/planterior-assets/models/dynamic/big/Philodendron_Congo.glb', targetHeight: 4.3 },
    areca_palm: { label: '아레카 야자', url: '/planterior-assets/models/dynamic/middle/Areca_Palm.glb', targetHeight: 3.5 },
    monstera: { label: '몬스테라', url: '/planterior-assets/models/dynamic/middle/Monstera.glb', targetHeight: 3.5 },
    spathiphyllum: { label: '스파티필룸', url: '/planterior-assets/models/dynamic/middle/Spathiphyllum.glb', targetHeight: 3.5 },
    travelers_tree: { label: '여인초', url: '/planterior-assets/models/dynamic/middle/Travelers_Tree.glb', targetHeight: 3.5 },
    calathea_orbifolia: { label: '칼라데아 오르비폴리아', url: '/planterior-assets/models/dynamic/small/Calathea_Orbifolia.glb', targetHeight: 2.2 },
    golden_pothos: { label: '스킨답서스', url: '/planterior-assets/models/dynamic/small/Golden_Pothos.glb', targetHeight: 2.2 },
    mini_cactus: { label: '미니 선인장', url: '/planterior-assets/models/dynamic/small/Mini_Cactus.glb', targetHeight: 2.2 },
    tillandsia: { label: '틸란드시아', url: '/planterior-assets/models/dynamic/small/Tillandsia.glb', targetHeight: 2.2 },
    // Furniture
    sofa: { label: '소파', url: '/planterior-assets/models/static/Sofa.glb', targetHeight: 2 },
    coffee_table: { label: '커피 테이블', url: '/planterior-assets/models/static/Coffee_Table.glb', targetHeight: 1.2, canPlaceOn: true },
    sideboard: { label: '사이드보드', url: '/planterior-assets/models/static/Sideboard.glb', targetHeight: 1.5, canPlaceOn: true },
    television: { label: '텔레비전', url: '/planterior-assets/models/static/Television.glb', targetHeight: 3, onlyOnSideboard: true },
    console_table: { label: '콘솔 테이블', url: '/planterior-assets/models/static/Console_Table.glb', targetHeight: 2, canPlaceOn: true },
    plant_table_small: { label: '식물 받침대 (소)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.45, canPlaceOn: true },
    plant_table_medium: { label: '식물 받침대 (중)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.6, canPlaceOn: true },
    plant_table_large: { label: '식물 받침대 (대)', url: '/planterior-assets/models/static/Plant_Table.glb', targetHeight: 0.8, canPlaceOn: true },
    flower_vase: { label: '꽃병', url: '/planterior-assets/models/static/Flower_Vase.glb', targetHeight: 1.8 },
  };

  // --- WebGL Check ---
  function checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) { return false; }
  }

  if (!checkWebGL()) {
    console.error('WebGL not supported');
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);"><div style="background:rgba(255,255,255,0.1);border-radius:20px;padding:40px;color:white;"><h2>WebGL을 사용할 수 없습니다</h2></div></div>`;
    appElement.appendChild(errorDiv);
    return { cleanup: () => { }, save: () => "", load: async () => { } };
  }

  // --- Scene Setup ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(appElement.clientWidth, appElement.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  appElement.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cubeLoader = new THREE.CubeTextureLoader();
  const skybox = cubeLoader.load([
    '/planterior-assets/textures/skybox/px.bmp', '/planterior-assets/textures/skybox/nx.bmp',
    '/planterior-assets/textures/skybox/py.bmp', '/planterior-assets/textures/skybox/ny.bmp',
    '/planterior-assets/textures/skybox/pz.bmp', '/planterior-assets/textures/skybox/nz.bmp',
  ]);
  scene.background = skybox;
  scene.environment = skybox;

  const camera = new THREE.PerspectiveCamera(60, appElement.clientWidth / appElement.clientHeight, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.5, 0);

  // --- Room Variables ---
  let ROOM_WIDTH = 15;
  let ROOM_DEPTH = 15;
  let WALL_HEIGHT = 10;
  const FLOOR_Y = 0;

  // --- Lights ---
  scene.add(new THREE.AmbientLight(0xffe8c4, 0.35));
  const dirLight = new THREE.DirectionalLight(0xffe8c4, 0.8);
  dirLight.position.set(4, 8, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  scene.add(dirLight);

  const sun = new THREE.DirectionalLight(0xfff3d1, 1.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  
  function updateSun(elevDeg = 45) {
    const elev = THREE.MathUtils.degToRad(elevDeg);
    const theta = THREE.MathUtils.degToRad(-40);
    const r = 20;
    sun.position.set(r * Math.cos(elev) * Math.cos(theta), r * Math.sin(elev), r * Math.cos(elev) * Math.sin(theta));
    sun.target.position.set(0, Math.max(ROOM_WIDTH, ROOM_DEPTH) * 0.35, 0);
    scene.add(sun.target);
  }
  updateSun(40);
  scene.add(sun);
  
  const s = 10;
  sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
  sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 50;

  // --- Texture & Material Helpers ---
  const texLoader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy?.() ?? 1;

  function loadTiledTexture(url: string, repeatX: number, repeatY: number, rotate90 = false) {
    const t = texLoader.load(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
    if (rotate90) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; }
    t.anisotropy = maxAniso;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function createHomeWallpaperTexture({ base = '#f4efe7', stripe = '#ecebe6', noise = 6, stripeWidth = 14 } = {}) {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d')!;
    ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);

    for (let x = 0; x < 512; x += stripeWidth) {
      ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? stripe : base;
      ctx.globalAlpha = 0.25; ctx.fillRect(x, 0, stripeWidth, 512);
    }
    ctx.globalAlpha = 1;

    const img = ctx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = Math.random() * noise - noise / 2;
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    
    const t = new THREE.CanvasTexture(cvs);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAniso;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeWallWithWindow(width: number, height: number, holeRect: { x: number; y: number; w: number; h: number }, material: THREE.Material) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.lineTo(-width / 2, -height / 2);

    const hole = new THREE.Path();
    const { x, y, w, h } = holeRect;
    hole.moveTo(x - w / 2, y - h / 2);
    hole.lineTo(x + w / 2, y - h / 2);
    hole.lineTo(x + w / 2, y + h / 2);
    hole.lineTo(x - w / 2, y + h / 2);
    hole.lineTo(x - w / 2, y - h / 2);
    shape.holes.push(hole);

    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
  }

  // --- Room Construction ---
  const wallGroup = new THREE.Group();
  scene.add(wallGroup);

  let floor: THREE.Mesh, grass: THREE.Mesh, grid: THREE.GridHelper;
  let wallFront: THREE.Mesh, wallBack: THREE.Mesh, wallLeft: THREE.Mesh, wallRight: THREE.Mesh, ceiling: THREE.Mesh;
  let floorTex: THREE.Texture, wallpaperTexFB: THREE.Texture, wallpaperTexLR: THREE.Texture;
  let wallGeoFB: THREE.PlaneGeometry;

  const wallMatFB = new THREE.MeshStandardMaterial({ roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });
  const wallMatLR = new THREE.MeshStandardMaterial({ roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });
  
  function buildRoom() {
    const repX = ROOM_WIDTH / METERS_PER_REPEAT;
    const repY = WALL_HEIGHT / METERS_PER_REPEAT;
    const repZ = ROOM_DEPTH / METERS_PER_REPEAT;

    // Floor
    if (floor) floor.geometry.dispose();
    floorTex = loadTiledTexture('/planterior-assets/textures/wood_floor.jpg', repX, repZ, false);
    floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85, side: THREE.DoubleSide }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grass
    if (grass) grass.geometry.dispose();
    const grassTex = loadTiledTexture('/planterior-assets/textures/grass.jpg', 100, 100);
    const GRASS_SIZE = Math.max(ROOM_WIDTH, ROOM_DEPTH) * 10;
    grass = new THREE.Mesh(new THREE.PlaneGeometry(GRASS_SIZE, GRASS_SIZE), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1.0, side: THREE.DoubleSide }));
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = FLOOR_Y - 0.001;
    grass.receiveShadow = true;
    scene.add(grass);

    // Grid
    if (grid) { grid.dispose(); scene.remove(grid); }
    grid = new THREE.GridHelper(Math.max(ROOM_WIDTH, ROOM_DEPTH) - 0.02, 24, 0x475569, 0x334155);
    grid.position.y = FLOOR_Y + 0.01;

    // Walls
    if (wallGeoFB) wallGeoFB.dispose();
    wallGeoFB = new THREE.PlaneGeometry(ROOM_WIDTH, WALL_HEIGHT);
    
    wallpaperTexFB = createHomeWallpaperTexture();
    wallpaperTexLR = wallpaperTexFB.clone();
    wallpaperTexFB.repeat.set(repX, repY);
    wallpaperTexLR.repeat.set(repZ, repY);
    
    wallMatFB.map = wallpaperTexFB;
    wallMatLR.map = wallpaperTexLR;

    if (wallFront) scene.remove(wallFront);
    wallFront = new THREE.Mesh(wallGeoFB, wallMatFB);
    wallFront.position.set(0, WALL_HEIGHT / 2, ROOM_DEPTH / 2);
    wallFront.rotateY(Math.PI);
    wallFront.receiveShadow = true;
    scene.add(wallFront);

    if (wallBack) scene.remove(wallBack);
    wallBack = new THREE.Mesh(wallGeoFB, wallMatFB);
    wallBack.position.set(0, WALL_HEIGHT / 2, -ROOM_DEPTH / 2);
    wallBack.receiveShadow = true;
    scene.add(wallBack);

    const winW = 12, winH = 4;
    const winY = 1 + winH / 2;
    
    if (wallLeft) scene.remove(wallLeft);
    wallLeft = makeWallWithWindow(ROOM_DEPTH, WALL_HEIGHT, { x: 0, y: winY - WALL_HEIGHT / 2, w: winW, h: winH }, wallMatLR);
    wallLeft.position.set(-ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
    wallLeft.rotateY(Math.PI / 2);
    scene.add(wallLeft);

    if (wallRight) scene.remove(wallRight);
    wallRight = makeWallWithWindow(ROOM_DEPTH, WALL_HEIGHT, { x: 0, y: winY - WALL_HEIGHT / 2, w: winW, h: winH }, wallMatLR);
    wallRight.position.set(ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
    wallRight.rotateY(-Math.PI / 2);
    scene.add(wallRight);

    // Ceiling
    if (ceiling) scene.remove(ceiling);
    ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), new THREE.MeshStandardMaterial({ color: 0xf7f7f7, roughness: 1, side: THREE.DoubleSide }));
    ceiling.position.set(0, WALL_HEIGHT, 0);
    ceiling.rotateX(Math.PI / 2);
    ceiling.receiveShadow = true;
    scene.add(ceiling);
    
    sun.target.position.set(0, Math.max(ROOM_WIDTH, ROOM_DEPTH) * 0.35, 0);
  }
  
  buildRoom(); // Initialize Room

  // --- Logic Helpers ---
  const loader = new GLTFLoader();
  const prototypeCache = new Map<string, THREE.Group>();
  const loadingCache = new Map<string, Promise<THREE.Group>>();
  const draggable: THREE.Object3D[] = [];

  function ensurePrototype(url: string): Promise<THREE.Group> {
    if (prototypeCache.has(url)) return Promise.resolve(prototypeCache.get(url)!);
    if (loadingCache.has(url)) return loadingCache.get(url)!;
    const p = new Promise<THREE.Group>((resolve, reject) => {
      loader.load(url, (gltf) => {
        gltf.scene.traverse((c: any) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        prototypeCache.set(url, gltf.scene);
        resolve(gltf.scene);
      }, undefined, reject);
    });
    loadingCache.set(url, p);
    return p;
  }

  function getHalfHeight(obj: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(obj);
    return (box.max.y - box.min.y) / 2 || 0.5;
  }

  function clampInRoomXZ(x: number, z: number, margin = 0.3) {
    const innerX = ROOM_WIDTH / 2 - margin;
    const innerZ = ROOM_DEPTH / 2 - margin;
    return { x: THREE.MathUtils.clamp(x, -innerX, innerX), z: THREE.MathUtils.clamp(z, -innerZ, innerZ) };
  }

  function normalizeHeight(obj: THREE.Object3D, targetHeight = 1.2) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3(); box.getSize(size);
    if (size.y > 0) obj.scale.setScalar(targetHeight / size.y);
  }

  function getNearestWallSide(pos: THREE.Vector3) {
    const hw = ROOM_WIDTH / 2, hd = ROOM_DEPTH / 2;
    const dists = { left: Math.abs(pos.x + hw), right: Math.abs(pos.x - hw), back: Math.abs(pos.z + hd), front: Math.abs(pos.z - hd) };
    const min = Math.min(dists.left, dists.right, dists.back, dists.front);
    return min === dists.left ? 'left' : min === dists.right ? 'right' : min === dists.back ? 'back' : 'front';
  }

  function placeAgainstWall(obj: THREE.Object3D, side: string, gap = 0.03) {
    const rots: any = { front: Math.PI, left: -Math.PI/2, right: Math.PI/2, back: 0 };
    obj.rotation.y = rots[side] || 0;
    
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3(); box.getSize(size);
    const hw = ROOM_WIDTH/2, hd = ROOM_DEPTH/2, hh = getHalfHeight(obj);
    const cur = obj.position.clone();

    if (side === 'back') obj.position.set(cur.x, hh, -hd + size.z/2 + gap);
    else if (side === 'front') obj.position.set(cur.x, hh, hd - size.z/2 - gap);
    else if (side === 'left') obj.position.set(-hw + size.x/2 + gap, hh, cur.z);
    else if (side === 'right') obj.position.set(hw - size.x/2 - gap, hh, cur.z);
    obj.userData.wallSide = side;
  }

  function placeOnTopOf(obj: THREE.Object3D, base: THREE.Object3D, gap = 0.02) {
    obj.rotation.y = base.rotation.y;
    const baseBox = new THREE.Box3().setFromObject(base);
    const objBox = new THREE.Box3().setFromObject(obj);
    const objSize = new THREE.Vector3(); objBox.getSize(objSize);
    obj.position.set(base.position.x, baseBox.max.y + objSize.y / 2 + gap, base.position.z);
  }

  function getPlaceableBases(selectedKey: string, selectedCfg: any, excludeObj: THREE.Object3D | null) {
    return draggable.filter((obj) => {
      if (!obj || obj === excludeObj) return false;
      const baseKey = obj.userData?.modelKey;
      const baseCfg = MODEL_MAP[baseKey];
      if (!baseKey || !baseCfg) return false;
      if (baseKey === 'flower_vase') return false;
      if (selectedCfg?.onlyOnSideboard) return baseKey === 'sideboard';
      if (PLANT_STAND_KEYS.has(selectedKey)) return false;
      if (PLANT_STAND_KEYS.has(baseKey)) return MODEL_MAP[selectedKey]?.url.includes('/dynamic/');
      if (MODEL_MAP[selectedKey]?.url.includes('/dynamic/')) return baseCfg.canPlaceOn || false;
      return baseCfg.canPlaceOn || false;
    });
  }

  async function addModelByKey(key: string, opts: { pos?: { x: number, y: number, z: number }, rotY?: number } = {}) {
    const cfg = MODEL_MAP[key];
    if (!cfg) return;
    try {
      const base = await ensurePrototype(cfg.url);
      const model = base.clone(true);
      normalizeHeight(model, cfg.targetHeight);

      if (opts.pos) {
        model.position.set(opts.pos.x, opts.pos.y, opts.pos.z);
      } else {
        const randPos = new THREE.Vector3((Math.random()-0.5)*0.6, 0, (Math.random()-0.5)*0.6);
        const spawn = controls.target.clone().sub(camera.position).normalize().multiplyScalar(5).add(camera.position).add(randPos);
        const clamped = clampInRoomXZ(spawn.x, spawn.z);
        model.position.set(clamped.x, getHalfHeight(model), clamped.z);
        
        if (cfg.wallSnap) placeAgainstWall(model, getNearestWallSide(new THREE.Vector3(clamped.x, 0, clamped.z)));
      }

      if (opts.rotY !== undefined) model.rotation.y = opts.rotY;
      model.userData.modelKey = key;
      
      if (!model.parent) scene.add(model);
      draggable.push(model);
      reconstructStacking(draggable);
      
      return model;
    } catch (err) { console.error('Failed to load', key, err); }
  }

  // --- Interaction (Drag, Drop, Stacking) ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selected: THREE.Object3D | null = null;
  let dragPlane: THREE.Plane | null = null;
  let dragOffset = new THREE.Vector3();
  let isDragging = false;
  let previewModel: THREE.Object3D | null = null;
  let previewBase: THREE.Object3D | null = null;
  let clickTimer: any = null;

  function updatePreview() {
    if (!selected) { if (previewModel) { scene.remove(previewModel); previewModel = null; } return; }
    
    const key = selected.userData.modelKey;
    const isFurniture = FURNITURE_BLOCK_KEYS.has(key) && !MODEL_MAP[key]?.url.includes('/dynamic/');
    if (isFurniture) { if (previewModel) scene.remove(previewModel); return; }

    const checkPt = selected.position.clone().add(new THREE.Vector3(0, 1, 0));
    const ray = new THREE.Raycaster(checkPt, new THREE.Vector3(0, -1, 0), 0, 15);
    const bases = getPlaceableBases(key, MODEL_MAP[key], selected);
    const hits = ray.intersectObjects(bases, true);
    
    let targetBase = hits.length ? hits[0].object : bases.find(b => selected!.position.distanceTo(b.position) < 3);
    while (targetBase && !draggable.includes(targetBase)) targetBase = targetBase.parent;

    if (targetBase && targetBase !== selected) {
      if (previewBase !== targetBase) {
        if (previewModel) scene.remove(previewModel);
        previewModel = selected.clone(true);
        previewModel.traverse((c: any) => { if(c.isMesh) { c.material = c.material.clone(); c.material.transparent = true; c.material.opacity = 0.4; c.material.emissive = new THREE.Color(0x4488ff).multiplyScalar(0.2); }});
        scene.add(previewModel);
        previewBase = targetBase;
      }
      if (previewModel) {
        placeOnTopOf(previewModel, targetBase, 0.01);
        previewModel.rotation.y = selected.rotation.y;
      }
    } else {
      if (previewModel) { scene.remove(previewModel); previewModel = null; previewBase = null; }
    }
  }

  function onPointerDown(e: MouseEvent) {
    if (e.button === 2) { // Right click delete
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.set(((e.clientX - rect.left)/rect.width)*2-1, -((e.clientY - rect.top)/rect.height)*2+1);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(draggable, true);
      if (hits.length) {
        let obj: any = hits[0].object;
        while(obj && !draggable.includes(obj)) obj = obj.parent;
        if(obj) {
          (obj.userData.placedItems || []).forEach((item: any) => { item.position.y = getHalfHeight(item); item.userData.placedOn = null; });
          scene.remove(obj);
          draggable.splice(draggable.indexOf(obj), 1);
        }
      }
      return;
    }
    
    // Double click check
    if (Date.now() - (lastClickTime || 0) < 300) return; 
    lastClickTime = Date.now();
    clickTimer = setTimeout(() => { clickTimer = null; }, 300);

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - rect.left)/rect.width)*2-1, -((e.clientY - rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(draggable, true);
    
    if (hits.length) {
      let obj: any = hits[0].object;
      while(obj && !draggable.includes(obj)) obj = obj.parent;
      if (obj) {
        selected = obj;
        dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -getHalfHeight(obj));
        const hitPt = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, hitPt);
        dragOffset.copy(selected.position).sub(hitPt);
        isDragging = true;
        controls.enabled = false;
        renderer.domElement.style.cursor = 'grabbing';
        if (previewModel) { scene.remove(previewModel); previewModel = null; }
      }
    }
  }
  let lastClickTime = 0;

  function onPointerMove(e: MouseEvent) {
    if (!isDragging || !selected || !dragPlane) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - rect.left)/rect.width)*2-1, -((e.clientY - rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(mouse, camera);
    
    const pt = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, pt)) {
      pt.add(dragOffset);
      const clamped = clampInRoomXZ(pt.x, pt.z);
      
      // Detach
      if (selected.userData.placedOn) {
        const pItems = selected.userData.placedOn.userData.placedItems;
        if (pItems) pItems.splice(pItems.indexOf(selected), 1);
        selected.userData.placedOn = null;
      }
      
      const oldPos = selected.position.clone();
      const side = selected.userData.wallSide;
      const hh = getHalfHeight(selected);
      
      if (side === 'back' || side === 'front') selected.position.set(clamped.x, hh, selected.position.z);
      else if (side === 'left' || side === 'right') selected.position.set(selected.position.x, hh, clamped.z);
      else selected.position.set(clamped.x, hh, clamped.z);

      // Move children
      const diff = selected.position.clone().sub(oldPos);
      (selected.userData.placedItems || []).forEach((c: any) => c.position.add(diff));
      
      updatePreview();
    }
  }

  function onPointerUp() {
    isDragging = false;
    controls.enabled = true;
    renderer.domElement.style.cursor = 'default';
    if (previewModel) { scene.remove(previewModel); previewModel = null; }
    
    if (selected) {
      if (previewBase && previewBase !== selected) {
        placeOnTopOf(selected, previewBase, 0.01);
        selected.userData.placedOn = previewBase;
        if (!previewBase.userData.placedItems) previewBase.userData.placedItems = [];
        if (!previewBase.userData.placedItems.includes(selected)) previewBase.userData.placedItems.push(selected);
      } else {
        const key = selected.userData.modelKey;
        const isFurniture = FURNITURE_BLOCK_KEYS.has(key) && !MODEL_MAP[key]?.url.includes('/dynamic/');
        if (!isFurniture) selected.position.y = getHalfHeight(selected);
        selected.userData.placedOn = null;
      }
    }
    selected = null; previewBase = null;
  }

  function onDoubleClick(e: MouseEvent) {
    e.preventDefault();
    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - rect.left)/rect.width)*2-1, -((e.clientY - rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(draggable, true);
    if (hits.length) {
      let obj: any = hits[0].object;
      while(obj && !draggable.includes(obj)) obj = obj.parent;
      if (obj) {
        obj.rotation.y += Math.PI / 2;
        (obj.userData.placedItems || []).forEach((c: any) => { c.rotation.y += Math.PI/2; placeOnTopOf(c, obj, 0.01); });
        if (obj.userData.wallSide) placeAgainstWall(obj, obj.userData.wallSide);
      }
    }
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('dblclick', onDoubleClick);
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

  // --- UI & Controls ---
  const controlsDiv = document.createElement('div');
  Object.assign(controlsDiv.style, { position:'absolute', bottom:'10px', right:'10px', background:'rgba(255,255,255,0.9)', padding:'15px', borderRadius:'8px', display:'flex', flexDirection:'column', gap:'8px', fontSize:'14px', zIndex:'100', boxShadow:'0 2px 10px rgba(0,0,0,0.1)' });
  controlsDiv.innerHTML = `
    <button id="btn-save" style="cursor:pointer; width:100%; padding:8px; background:#4CAF50; color:white; border:none; border-radius:4px; font-weight:bold; margin-bottom:10px;">💾 현재 상태 저장</button>
    <div style="border-top:1px solid #ddd; padding-top:10px; margin-top:5px;">
      <div style="margin-bottom:5px;"><strong>방 크기 설정</strong></div>
      <div style="margin-bottom:5px;"><label>가로(m): <input type="number" id="rw" value="15" style="width:50px"></label></div>
      <div style="margin-bottom:5px;"><label>세로(m): <input type="number" id="rd" value="15" style="width:50px"></label></div>
      <div style="margin-bottom:5px;"><label>높이(m): <input type="number" id="rh" value="10" style="width:50px"></label></div>
      <button id="btn-resize" style="cursor:pointer; width:100%; padding:5px;">적용</button>
    </div>
  `;
  appElement.appendChild(controlsDiv);

  if (toolbarElement) {
    const wrap = document.createElement('div');
    wrap.className = 'model-buttons-row';
    Object.assign(wrap.style, { display:'flex', gap:'8px', overflowX:'auto', padding:'8px' });
    Object.entries(MODEL_MAP).forEach(([key, cfg]) => {
      const btn = document.createElement('button');
      btn.textContent = cfg.label;
      btn.onclick = () => addModelByKey(key);
      Object.assign(btn.style, { padding:'6px 12px', whiteSpace:'nowrap', cursor:'pointer' });
      wrap.appendChild(btn);
    });
    while(toolbarElement.firstChild) toolbarElement.removeChild(toolbarElement.firstChild);
    toolbarElement.appendChild(wrap);
  }

  // --- Save / Load / Resize Logic ---
  document.getElementById('btn-resize')?.addEventListener('click', () => {
    const w = parseFloat((document.getElementById('rw') as HTMLInputElement).value);
    const d = parseFloat((document.getElementById('rd') as HTMLInputElement).value);
    const h = parseFloat((document.getElementById('rh') as HTMLInputElement).value);
    if (!isNaN(w) && !isNaN(d) && !isNaN(h)) {
      ROOM_WIDTH = THREE.MathUtils.clamp(w, 5, 50);
      ROOM_DEPTH = THREE.MathUtils.clamp(d, 5, 50);
      WALL_HEIGHT = THREE.MathUtils.clamp(h, 3, 30);
      buildRoom();
      draggable.forEach(obj => {
        const clamped = clampInRoomXZ(obj.position.x, obj.position.z);
        if(!obj.userData.placedOn) obj.position.set(clamped.x, getHalfHeight(obj), clamped.z);
      });
      controls.maxDistance = Math.max(ROOM_WIDTH, ROOM_DEPTH, WALL_HEIGHT) * 1.5;
    }
  });

  document.getElementById('btn-save')?.addEventListener('click', async () => {
    const token = sessionStorage.getItem("bearerToken");
    const json = JSON.stringify({
      room: { width: ROOM_WIDTH, depth: ROOM_DEPTH, height: WALL_HEIGHT },
      coordinates: draggable.map(obj => ({
        name: obj.userData.modelKey,
        x: parseFloat(obj.position.x.toFixed(3)),
        y: parseFloat(obj.position.y.toFixed(3)),
        z: parseFloat(obj.position.z.toFixed(3)),
        rotation: parseFloat(obj.rotation.y.toFixed(3))
      }))
    });
    
    try {
      const res = await fetch('/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        credentials: 'include',
        body: json
      });
      if (res.ok) alert('성공적으로 저장되었습니다!');
      else if (res.status === 403) alert('권한이 없습니다. 다시 로그인해 주세요.');
      else alert('저장에 실패했습니다.');
    } catch (e) { console.error(e); }
  });

  function reconstructStacking(objs: THREE.Object3D[]) {
    const EPSILON = 0.0001;
    objs.forEach(c => {
      const parents = objs.filter(p => c !== p && p.position.y < c.position.y && Math.abs(c.position.x-p.position.x) < EPSILON && Math.abs(c.position.z-p.position.z) < EPSILON);
      if(!parents.length) return;
      parents.sort((a,b) => b.position.y - a.position.y);
      const parent = parents[0];
      c.userData.placedOn = parent;
      if(!parent.userData.placedItems) parent.userData.placedItems = [];
      if(!parent.userData.placedItems.includes(c)) parent.userData.placedItems.push(c);
    });
  }

  // --- Animation Loop ---
  const keys: any = {};
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);

  renderer.setAnimationLoop(() => {
    const move = new THREE.Vector3();
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const fwd = new THREE.Vector3(dir.x, 0, dir.z).normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0,1,0)).normalize();
    if(keys.ArrowUp || keys.KeyW) move.add(fwd);
    if(keys.ArrowDown || keys.KeyS) move.sub(fwd);
    if(keys.ArrowRight || keys.KeyD) move.add(right);
    if(keys.ArrowLeft || keys.KeyA) move.sub(right);
    
    if(move.lengthSq() > 0) {
      move.normalize().multiplyScalar(0.15);
      camera.position.add(move); controls.target.add(move);
    }
    
    const margin = 0.5, hw = ROOM_WIDTH/2 - margin, hd = ROOM_DEPTH/2 - margin;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -hw, hw);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.5, WALL_HEIGHT-0.5);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -hd, hd);
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -hw, hw);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -hd, hd);
    
    controls.update();
    renderer.render(scene, camera);
  });

  function onResize() {
    camera.aspect = appElement.clientWidth / appElement.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(appElement.clientWidth, appElement.clientHeight);
  }
  window.addEventListener('resize', onResize);

  return {
    cleanup: () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      window.removeEventListener('resize', onResize);
      appElement.innerHTML = ''; // Remove canvas & UI
    },
    save: () => "", // Handled by internal button event
    load: async (jsonStr: string) => {
      try {
        const json = JSON.parse(jsonStr);
        [...draggable].forEach(o => scene.remove(o)); draggable.length = 0;
        
        if (json.room) {
          ROOM_WIDTH = Number(json.room.width); ROOM_DEPTH = Number(json.room.depth); WALL_HEIGHT = Number(json.room.height);
          buildRoom();
          ['rw','rd','rh'].forEach((id, i) => (document.getElementById(id) as HTMLInputElement).value = String([ROOM_WIDTH, ROOM_DEPTH, WALL_HEIGHT][i]));
        }

        const items = json.coordinates || json.objects || [];
        await Promise.all(items.map((i: any) => addModelByKey(i.name || i.modelKey, { pos: { x: i.x??i.position?.x, y: i.y??i.position?.y, z: i.z??i.position?.z }, rotY: i.rotation??i.rotation?.y })));
        reconstructStacking(draggable);
      } catch (e) { console.error(e); }
    }
  };
}