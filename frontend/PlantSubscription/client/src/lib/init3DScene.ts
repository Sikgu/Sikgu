import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface SceneControls {
  cleanup: () => void;
  save: () => string;
  load: (jsonString: string) => Promise<void>;
}

interface ModelConfig {
  label: string;
  url: string;
  targetHeight: number;
  wallSnap?: boolean;
  canPlaceOn?: boolean;
  onlyOnSideboard?: boolean;
}

const MODEL_MAP: Record<string, ModelConfig> = {
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

const PLANT_STAND_KEYS = new Set(['plant_table_small', 'plant_table_medium', 'plant_table_large']);
const FURNITURE_BLOCK_KEYS = new Set(['sofa', 'coffee_table', 'sideboard', 'console_table', ...PLANT_STAND_KEYS]);

function checkWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

function showWebGLError(container: HTMLElement) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 40px; max-width: 500px; text-align: center; color: white;">
          <h2>WebGL을 사용할 수 없습니다</h2>
        </div>
      </div>
    `;
  container.appendChild(errorDiv);
}

function createWallpaperTexture(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f4efe7';
  ctx.fillRect(0, 0, 512, 512);

  const stripeWidth = 14;
  for (let x = 0; x < 512; x += stripeWidth) {
    ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? '#ecebe6' : '#f4efe7';
    ctx.globalAlpha = 0.25;
    ctx.fillRect(x, 0, stripeWidth, 512);
  }
  ctx.globalAlpha = 1;

  const img = ctx.getImageData(0, 0, 512, 512);
  const noise = 6;
  for (let i = 0; i < img.data.length; i += 4) {
    const n = Math.random() * noise - noise / 2;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() ?? 1;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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

function getHalfHeight(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj);
  return (box.max.y - box.min.y) / 2 || 0.5;
}

function normalizeHeight(obj: THREE.Object3D, targetHeight = 1.2) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.y > 0) {
    obj.scale.setScalar(targetHeight / size.y);
  }
}

export function init3DScene(appElement: HTMLElement, toolbarElement: HTMLElement) {
  if (!checkWebGL()) {
    showWebGLError(appElement);
    return { cleanup: () => { }, save: () => "", load: async () => { } };
  }

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

  const camera = new THREE.PerspectiveCamera(60, appElement.clientWidth / appElement.clientHeight, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.5, 0);

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

  function updateSunPosition(elevDeg = 45, thetaDeg = -40) {
    const elev = THREE.MathUtils.degToRad(elevDeg);
    const theta = THREE.MathUtils.degToRad(thetaDeg);
    const r = 20;
    sun.position.set(
      r * Math.cos(elev) * Math.cos(theta),
      r * Math.sin(elev),
      r * Math.cos(elev) * Math.sin(theta)
    );
    sun.target.position.set(0, Math.max(ROOM_WIDTH, ROOM_DEPTH) * 0.35, 0);
    scene.add(sun.target);
  }
  updateSunPosition(40);
  scene.add(sun);

  const shadowSize = 10;
  sun.shadow.camera.left = -shadowSize;
  sun.shadow.camera.right = shadowSize;
  sun.shadow.camera.top = shadowSize;
  sun.shadow.camera.bottom = -shadowSize;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 50;

  const texLoader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy?.() ?? 1;

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

  const wallGroup = new THREE.Group();
  scene.add(wallGroup);

  let floor: THREE.Mesh;
  let grass: THREE.Mesh;
  let grid: THREE.GridHelper;
  let wallFront: THREE.Mesh, wallBack: THREE.Mesh, wallLeft: THREE.Mesh, wallRight: THREE.Mesh, ceiling: THREE.Mesh;
  let floorTex: THREE.Texture;
  let wallpaperTexFB: THREE.Texture, wallpaperTexLR: THREE.Texture;
  let wallMatFB: THREE.MeshStandardMaterial, wallMatLR: THREE.MeshStandardMaterial;

  function buildRoom() {
    const metersPerRepeat = 6.0;
    const wallRepeatX = ROOM_WIDTH / metersPerRepeat;
    const wallRepeatY = WALL_HEIGHT / metersPerRepeat;
    const wallRepeatZ = ROOM_DEPTH / metersPerRepeat;
    const floorRepeatX = ROOM_WIDTH / metersPerRepeat;
    const floorRepeatY = ROOM_DEPTH / metersPerRepeat;

    if (grid) grid.dispose();
    grid = new THREE.GridHelper(Math.max(ROOM_WIDTH, ROOM_DEPTH) - 0.02, 24, 0x475569, 0x334155);
    grid.position.y = FLOOR_Y + 0.01;

    floorTex = loadTiledTexture('/planterior-assets/textures/wood_floor.jpg', floorRepeatX, floorRepeatY);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85, side: THREE.DoubleSide });

    if (floor) scene.remove(floor);
    floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    floor.receiveShadow = true;
    scene.add(floor);

    const grassTex = texLoader.load('/planterior-assets/textures/grass.jpg');
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(100, 100);
    grassTex.colorSpace = THREE.SRGBColorSpace;
    const GRASS_SIZE = Math.max(ROOM_WIDTH, ROOM_DEPTH) * 10;

    if (grass) scene.remove(grass);
    grass = new THREE.Mesh(new THREE.PlaneGeometry(GRASS_SIZE, GRASS_SIZE), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1.0, side: THREE.DoubleSide }));
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = FLOOR_Y - 0.001;
    grass.receiveShadow = true;
    scene.add(grass);

    wallpaperTexFB = createWallpaperTexture(renderer);
    wallpaperTexLR = wallpaperTexFB.clone();
    wallpaperTexFB.repeat.set(wallRepeatX, wallRepeatY);
    wallpaperTexLR.repeat.set(wallRepeatZ, wallRepeatY);

    wallMatFB = new THREE.MeshStandardMaterial({ map: wallpaperTexFB, roughness: 1.0, side: THREE.DoubleSide });
    wallMatLR = new THREE.MeshStandardMaterial({ map: wallpaperTexLR, roughness: 1.0, side: THREE.DoubleSide });

    wallGroup.clear();

    const wallGeoFB = new THREE.PlaneGeometry(ROOM_WIDTH, WALL_HEIGHT);
    wallFront = new THREE.Mesh(wallGeoFB, wallMatFB);
    wallFront.position.set(0, WALL_HEIGHT / 2, ROOM_DEPTH / 2);
    wallFront.rotateY(Math.PI);
    wallFront.receiveShadow = true;
    wallGroup.add(wallFront);

    wallBack = new THREE.Mesh(wallGeoFB, wallMatFB);
    wallBack.position.set(0, WALL_HEIGHT / 2, -ROOM_DEPTH / 2);
    wallBack.receiveShadow = true;
    wallGroup.add(wallBack);

    const winW = 12, winH = 4;
    const winYCenter = 1 + winH / 2;
    const holeRect = { x: 0, y: winYCenter - WALL_HEIGHT / 2, w: winW, h: winH };

    if (wallLeft) scene.remove(wallLeft);
    wallLeft = makeWallWithWindow(ROOM_DEPTH, WALL_HEIGHT, holeRect, wallMatLR);
    wallLeft.position.set(-ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
    wallLeft.rotateY(Math.PI / 2);
    scene.add(wallLeft);

    if (wallRight) scene.remove(wallRight);
    wallRight = makeWallWithWindow(ROOM_DEPTH, WALL_HEIGHT, holeRect, wallMatLR);
    wallRight.position.set(ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
    wallRight.rotateY(-Math.PI / 2);
    scene.add(wallRight);

    ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), new THREE.MeshStandardMaterial({ color: 0xf7f7f7, roughness: 1, side: THREE.DoubleSide }));
    ceiling.position.set(0, WALL_HEIGHT, 0);
    ceiling.rotateX(Math.PI / 2);
    ceiling.receiveShadow = true;
    wallGroup.add(ceiling);

    updateSunPosition();
  }

  buildRoom();

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

  function clampInRoomXZ(x: number, z: number, margin = 0.3) {
    const innerX = ROOM_WIDTH / 2 - margin;
    const innerZ = ROOM_DEPTH / 2 - margin;
    return {
      x: THREE.MathUtils.clamp(x, -innerX, innerX),
      z: THREE.MathUtils.clamp(z, -innerZ, innerZ),
    };
  }

  function getNearestWallSide(posXZ: THREE.Vector3) {
    const halfW = ROOM_WIDTH / 2;
    const halfD = ROOM_DEPTH / 2;
    const dists = {
      left: Math.abs(posXZ.x - -halfW),
      right: Math.abs(posXZ.x - +halfW),
      back: Math.abs(posXZ.z - -halfD),
      front: Math.abs(posXZ.z - +halfD)
    };
    const min = Math.min(...Object.values(dists));
    return Object.keys(dists).find(key => dists[key as keyof typeof dists] === min) || 'front';
  }

  function placeAgainstWall(obj: THREE.Object3D, side: string, gap = 0.03) {
    const rotations: Record<string, number> = { front: Math.PI, left: -Math.PI / 2, right: Math.PI / 2, back: 0 };
    obj.rotation.y = rotations[side] ?? 0;

    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
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

  async function addModelByKey(key: string, options: { pos?: { x: number, y: number, z: number }, rotY?: number } = {}) {
    const cfg = MODEL_MAP[key];
    if (!cfg) return;

    try {
      const base = await ensurePrototype(cfg.url);
      const model = base.clone(true);
      normalizeHeight(model, cfg.targetHeight);

      if (options.pos) {
        model.position.set(options.pos.x, options.pos.y, options.pos.z);
      } else {
        const spawn = pointInFrontOfCamera().clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6));
        const hh = getHalfHeight(model);
        model.position.set(spawn.x, hh, spawn.z);

        if (cfg.wallSnap) {
          const side = getNearestWallSide(spawn);
          placeAgainstWall(model, side);
        }
      }

      if (options.rotY !== undefined) model.rotation.y = options.rotY;

      model.userData.modelKey = key;
      if (!model.parent) scene.add(model);
      draggable.push(model);

      reconstructStacking(draggable);
      return model;
    } catch (err) {
      console.error('Failed to load', key, err);
    }
  }

  function isPlantModelKey(key: string) {
    return MODEL_MAP[key]?.url?.includes('/models/dynamic/') ?? false;
  }

  function getPlaceableBases(selectedKey: string, selectedCfg: ModelConfig, excludeObj: THREE.Object3D | null) {
    return draggable.filter((obj) => {
      if (!obj || obj === excludeObj) return false;
      const baseKey = obj.userData?.modelKey;
      if (!baseKey) return false;
      const baseCfg = MODEL_MAP[baseKey];
      if (!baseCfg) return false;

      if (baseKey === 'flower_vase') return false;
      if (selectedCfg?.onlyOnSideboard) return baseKey === 'sideboard';
      if (PLANT_STAND_KEYS.has(selectedKey)) return false;
      if (PLANT_STAND_KEYS.has(baseKey)) return isPlantModelKey(selectedKey);
      if (isPlantModelKey(selectedKey)) return baseCfg.canPlaceOn || false;
      return baseCfg.canPlaceOn || false;
    });
  }

  function placeOnTopOf(obj: THREE.Object3D, base: THREE.Object3D, gapY = 0.02) {
    obj.rotation.y = base.rotation.y;
    const baseBox = new THREE.Box3().setFromObject(base);
    const objBox = new THREE.Box3().setFromObject(obj);
    const objSize = new THREE.Vector3();
    objBox.getSize(objSize);
    obj.position.set(base.position.x, baseBox.max.y + objSize.y / 2 + gapY, base.position.z);
  }

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

    if (selectedKey && FURNITURE_BLOCK_KEYS.has(selectedKey) && !isPlantModelKey(selectedKey)) {
      removePreview();
      return;
    }

    const placeableFurniture = getPlaceableBases(selectedKey!, selectedCfg!, selected);
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
        const baseBox = new THREE.Box3().setFromObject(baseObj);
        const objBox = new THREE.Box3().setFromObject(previewModel);
        const objSize = new THREE.Vector3();
        objBox.getSize(objSize);
        previewModel.position.set(baseObj.position.x, baseBox.max.y + objSize.y / 2 + 0.01, baseObj.position.z);
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
        const placeableFurniture = getPlaceableBases(selectedKey!, selectedCfg!, selected);
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

  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button === 2) {
      setMouseFromEvent(e);
      raycaster.setFromCamera(mouseNDC, camera);
      const hits = raycaster.intersectObjects(draggable, true);
      if (hits.length) {
        let obj: any = hits[0].object;
        while (obj && !draggable.includes(obj)) obj = obj.parent;
        if (obj) {
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
      if (now - lastClickTime < 300) return;
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
        const placedItems = obj.userData?.placedItems;
        if (placedItems) {
          placedItems.forEach((item: THREE.Object3D) => {
            item.rotation.y += Math.PI / 2;
            placeOnTopOf(item, obj, 0.01);
          });
        }
        const wallSide = obj.userData?.wallSide;
        if (wallSide) {
          placeAgainstWall(obj, wallSide, 0.03);
          if (placedItems) {
            placedItems.forEach((item: THREE.Object3D) => placeOnTopOf(item, obj, 0.01));
          }
        }
      }
    }
  });

  function renderModelButtons() {
    if (!toolbarElement) return;
    const wrap = document.createElement('div');
    wrap.className = 'model-buttons-row';
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
    while (toolbarElement.firstChild) toolbarElement.removeChild(toolbarElement.firstChild);
    toolbarElement.appendChild(wrap);
  }
  renderModelButtons();

  toolbarElement.addEventListener('click', (e: any) => {
    const key = e.target?.dataset?.model;
    if (!key) return;
    addModelByKey(key);
  });

  const controlsDiv = document.createElement('div');
  Object.assign(controlsDiv.style, {
    position: 'absolute', bottom: '10px', right: '10px',
    background: 'rgba(255,255,255,0.9)', padding: '10px',
    borderRadius: '8px', display: 'flex', flexDirection: 'column',
    gap: '5px', fontSize: '14px', zIndex: '100'
  });
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

  const btnSave = document.getElementById('btn-save');
  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      const jsonString = exportSceneToJson();
      const token = sessionStorage.getItem("bearerToken");

      try {
        const response = await fetch('/room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
    const minSize = 5, maxSize = 50, minH = 3, maxH = 30;
    ROOM_WIDTH = THREE.MathUtils.clamp(w, minSize, maxSize);
    ROOM_DEPTH = THREE.MathUtils.clamp(d, minSize, maxSize);
    WALL_HEIGHT = THREE.MathUtils.clamp(h, minH, maxH);
    buildRoom();

    draggable.forEach(obj => {
      const { x, z } = clampInRoomXZ(obj.position.x, obj.position.z);
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

  const keys: Record<string, boolean> = {};
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  function handleCameraMovement() {
    const moveSpeed = 0.15;
    if (!Object.values(keys).some(k => k)) return;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const forward = new THREE.Vector3(dir.x, 0, dir.z).normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const moveVec = new THREE.Vector3();

    if (keys.ArrowUp || keys.KeyW) moveVec.add(forward.multiplyScalar(moveSpeed));
    if (keys.ArrowDown || keys.KeyS) moveVec.add(forward.multiplyScalar(-moveSpeed));
    if (keys.ArrowRight || keys.KeyD) moveVec.add(right.multiplyScalar(moveSpeed));
    if (keys.ArrowLeft || keys.KeyA) moveVec.add(right.multiplyScalar(-moveSpeed));

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

  camera.position.set(Math.min(ROOM_WIDTH / 2 - 1, 8), WALL_HEIGHT * 0.6, Math.min(ROOM_DEPTH / 2 - 1, 8));

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
  Object.assign(hint.style, {
    position: 'absolute', bottom: '10px', left: '10px',
    color: '#333', background: 'rgba(255,255,255,0.8)',
    padding: '10px', borderRadius: '8px', pointerEvents: 'none'
  });
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

  function exportSceneToJson() {
    const data = {
      room: { width: ROOM_WIDTH, depth: ROOM_DEPTH, height: WALL_HEIGHT },
      coordinates: draggable.map((obj) => ({
        name: obj.userData.modelKey,
        x: parseFloat(obj.position.x.toFixed(3)),
        y: parseFloat(obj.position.y.toFixed(3)),
        z: parseFloat(obj.position.z.toFixed(3)),
        rotation: parseFloat(obj.rotation.y.toFixed(3))
      })),
    };
    return JSON.stringify(data);
  }

  async function importSceneFromJson(jsonString: string) {
    try {
      const json = JSON.parse(jsonString);
      [...draggable].forEach(obj => scene.remove(obj));
      draggable.length = 0;

      if (json.room) {
        updateRoomSize(Number(json.room.width), Number(json.room.depth), Number(json.room.height));
        const inputs = { rw: json.room.width, rd: json.room.depth, rh: json.room.height };
        Object.entries(inputs).forEach(([id, val]) => {
          const el = document.getElementById(id) as HTMLInputElement;
          if (el) el.value = String(val);
        });
      }

      const items = json.coordinates || json.objects || [];
      await Promise.all(items.map((item: any) => {
        const key = item.name || item.modelKey;
        const posX = item.x !== undefined ? item.x : item.position?.x;
        const posY = item.y !== undefined ? item.y : item.position?.y;
        const posZ = item.z !== undefined ? item.z : item.position?.z;
        const rotY = item.rotation !== undefined ? item.rotation : item.rotation?.y;

        return addModelByKey(key, { pos: { x: posX, y: posY, z: posZ }, rotY });
      }));

      reconstructStacking(draggable);
    } catch (e) {
      console.error("JSON 파싱 또는 로딩 실패", e);
    }
  }

  function reconstructStacking(objects: THREE.Object3D[]) {
    const EPSILON = 0.0001;
    objects.forEach(child => {
      const potentialParents = objects.filter(parent => {
        if (child === parent) return false;
        if (parent.position.y >= child.position.y) return false;
        const dx = Math.abs(child.position.x - parent.position.x);
        const dz = Math.abs(child.position.z - parent.position.z);
        return dx < EPSILON && dz < EPSILON;
      });

      if (potentialParents.length === 0) return;
      potentialParents.sort((a, b) => b.position.y - a.position.y);
      const realParent = potentialParents[0];

      child.userData.placedOn = realParent;
      if (!realParent.userData.placedItems) realParent.userData.placedItems = [];
      if (!realParent.userData.placedItems.includes(child)) realParent.userData.placedItems.push(child);
    });
  }

  return {
    cleanup: () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      window.removeEventListener('resize', onResize);
      if (appElement.contains(renderer.domElement)) appElement.removeChild(renderer.domElement);
      if (appElement.contains(controlsDiv)) appElement.removeChild(controlsDiv);
      if (appElement.contains(hint)) appElement.removeChild(hint);
    },
    save: exportSceneToJson,
    load: importSceneFromJson
  };
}