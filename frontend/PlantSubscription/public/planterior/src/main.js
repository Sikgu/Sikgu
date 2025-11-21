import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/** Renderer */
const app = document.getElementById('app')
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
app.appendChild(renderer.domElement)

/** Scene & Camera */
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0x123456)
const cubeLoader = new THREE.CubeTextureLoader()
const skybox = cubeLoader.load([
  '/textures/skybox/px.bmp', // +X
  '/textures/skybox/nx.bmp', // -X
  '/textures/skybox/py.bmp', // +Y
  '/textures/skybox/ny.bmp', // -Y
  '/textures/skybox/pz.bmp', // +Z
  '/textures/skybox/nz.bmp', // -Z
])
scene.background = skybox
scene.environment = skybox

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)
camera.position.set(10, 8, 10)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.target.set(0, 0.5, 0)

/** Room with textured wallpaper & floor */
const ROOM_SIZE = 15 // 방 가로/세로
const WALL_HEIGHT = 6 // 벽 높이 (미터 단위 느낌)
const FLOOR_Y = 0

/** Lights */
scene.add(new THREE.AmbientLight(0xffe8c4, 0.35))
const dirLight = new THREE.DirectionalLight(0xffe8c4, 0.8)
dirLight.position.set(4, 8, 4)
dirLight.castShadow = true
dirLight.shadow.mapSize.set(2048, 2048)
dirLight.shadow.bias = -0.0002
dirLight.shadow.normalBias = 0.02
scene.add(dirLight)

// 태양 빛 (DirectionalLight)
const sun = new THREE.DirectionalLight(0xfff3d1, 1.2) // 약간 따뜻한 톤
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.bias = -0.0002
sun.shadow.normalBias = 0.02

// 태양 위치 (r=20, 고도 45°, 방위 -40° 정도)
let thetaDeg = -40
function updateSun(elevDeg = 45) {
  const elev = THREE.MathUtils.degToRad(elevDeg)
  const theta = THREE.MathUtils.degToRad(thetaDeg)
  const r = 20
  const x = r * Math.cos(elev) * Math.cos(theta)
  const y = r * Math.sin(elev)
  const z = r * Math.cos(elev) * Math.sin(theta)
  sun.position.set(x, y, z)
  sun.target.position.set(0, ROOM_SIZE * 0.35, 0) // 방 중앙 위를 향하게
  scene.add(sun.target)
}
updateSun(40) // 초기 고도 40°
scene.add(sun)

const s = 10 // 그림자 카메라 크기
sun.shadow.camera.left = -s
sun.shadow.camera.right = s
sun.shadow.camera.top = s
sun.shadow.camera.bottom = -s
sun.shadow.camera.near = 0.5
sun.shadow.camera.far = 50

// --- 공용 유틸(텍스처/캔버스) ---
const texLoader = new THREE.TextureLoader()
const maxAniso = renderer.capabilities.getMaxAnisotropy?.() ?? 1

function canvasTexture(cvs) {
  const t = new THREE.CanvasTexture(cvs)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = maxAniso
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
function makeCanvas(w = 512, h = 512) {
  const cvs = document.createElement('canvas')
  cvs.width = w
  cvs.height = h
  return { cvs, ctx: cvs.getContext('2d') }
}
function loadTiledTexture(url, repeatX, repeatY, rotate90 = false) {
  const t = texLoader.load(url)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeatX, repeatY)
  if (rotate90) {
    t.center.set(0.5, 0.5)
    t.rotation = Math.PI / 2
  }
  t.anisotropy = maxAniso
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ===========================
  ① 홈 스타일 벽지(절차 생성)
  =========================== */
// 따뜻한 크림톤 바탕 + 아주 미세한 노이즈 + 은은한 세로 스트라이프
function createHomeWallpaperTexture({
  base = '#f4efe7',
  stripe = '#ecebe6',
  noise = 6,
  stripeWidth = 14,
  scale = 1.0,
} = {}) {
  const { cvs, ctx } = makeCanvas(512, 512)

  // 바탕
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 512, 512)

  // 은은한 세로 스트라이프
  for (let x = 0; x < 512; x += stripeWidth) {
    ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? stripe : base
    ctx.globalAlpha = 0.25
    ctx.fillRect(x, 0, stripeWidth, 512)
  }
  ctx.globalAlpha = 1

  // 미세 노이즈로 페인트 질감
  const img = ctx.getImageData(0, 0, 512, 512)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = Math.random() * noise - noise / 2 // -noise/2 ~ +noise/2
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)

  const tex = canvasTexture(cvs)
  tex.repeat.set(1 * scale, 1 * scale)
  return tex
}

// 1m 당 타일 반복 기준
const metersPerRepeat = 6.0
const wallRepeatX = ROOM_SIZE / metersPerRepeat
const wallRepeatY = ROOM_SIZE / metersPerRepeat
const floorRepeat = ROOM_SIZE / metersPerRepeat

// ----- 격자(Grid)는 바닥 바로 위에 얇게 -----
const grid = new THREE.GridHelper(ROOM_SIZE - 0.02, 24, 0x475569, 0x334155)
grid.position.y = FLOOR_Y + 0.01
// scene.add(grid) // 필요하면 주석 해제

// ----- 바닥(Floor): 텍스처 + 그림자 수신 -----
const floorTex = loadTiledTexture(
  '/textures/wood_floor.jpg',
  floorRepeat,
  floorRepeat,
  false
)
const floorMat = new THREE.MeshStandardMaterial({
  map: floorTex,
  roughness: 0.85,
  metalness: 0.0,
  side: THREE.DoubleSide
})
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
  floorMat
)
floor.rotation.x = -Math.PI / 2
floor.position.y = FLOOR_Y
floor.receiveShadow = true
scene.add(floor)

/* ---------- 외부 잔디 바닥 ---------- */

// Grass texture
const grassTex = texLoader.load('/textures/grass.jpg')
grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping
grassTex.repeat.set(100, 100) // 반복 횟수 (넓게 깔기)
grassTex.anisotropy = renderer.capabilities.getMaxAnisotropy()
grassTex.colorSpace = THREE.SRGBColorSpace

// Grass material
const grassMat = new THREE.MeshStandardMaterial({
  map: grassTex,
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide
})

// Grass plane (집보다 훨씬 큰 면)
const GRASS_SIZE = ROOM_SIZE * 10 // 방보다 10배 넓게
const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(GRASS_SIZE, GRASS_SIZE),
  grassMat
)
grass.rotation.x = -Math.PI / 2
grass.position.y = FLOOR_Y - 0.001 // 실내 바닥과 거의 같은 높이
grass.receiveShadow = true

scene.add(grass)


// ----- 벽(Walls): 4개의 Plane으로 구성 (천장은 생략/단색 유지) -----
const wallGroup = new THREE.Group()
scene.add(wallGroup)

const wallGeo = new THREE.PlaneGeometry(ROOM_SIZE, WALL_HEIGHT)
const ceilGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE)

// 홈 스타일 벽지 텍스처 생성 & 적용
const wallpaperTexFB = createHomeWallpaperTexture({
  base: '#f4efe7', // 따뜻한 크림톤
  stripe: '#ecebe6', // 아주 옅은 스트라이프
  noise: 6, // 노이즈 강도(3~8 추천)
  stripeWidth: 14, // 줄 너비(작으면 촘촘)
  scale: 1.0, // 패턴 스케일
})
// 좌/우 벽에도 같은 텍스처 사용 (필요시 회전)
// Plane의 UV가 이미 +Y가 세로 축이므로, 기본적으로 모든 벽에서 수직 줄 유지됨.
const wallpaperTexLR = wallpaperTexFB.clone()

const wallMatFB = new THREE.MeshStandardMaterial({
  map: wallpaperTexFB,
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide
})
const wallMatLR = new THREE.MeshStandardMaterial({
  map: wallpaperTexLR,
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide
})

// 앞(남) 벽: z=+ROOM_SIZE/2
const wallFront = new THREE.Mesh(wallGeo, wallMatFB)
wallFront.position.set(0, WALL_HEIGHT / 2, ROOM_SIZE / 2)
wallFront.rotateY(Math.PI) // 안쪽을 보게 뒤집기
wallFront.receiveShadow = true
wallGroup.add(wallFront)

// 뒤(북) 벽: z=-ROOM_SIZE/2
const wallBack = new THREE.Mesh(wallGeo, wallMatFB)
wallBack.position.set(0, WALL_HEIGHT / 2, -ROOM_SIZE / 2)
wallBack.receiveShadow = true
wallGroup.add(wallBack)

// 창문 크기/위치 (미터 가정): 폭 12m, 높이 4m, 바닥에서 1m 띄움
const winW = 12,
  winH = 4
const winYCenter = 1 + winH / 2 // 바닥 0에서 창 중심 높이

// 좌(서) 벽: x = -ROOM_SIZE/2 (왼쪽 벽)
const wallLeft = makeWallWithWindow(
  ROOM_SIZE,
  WALL_HEIGHT,
  { x: 0, y: winYCenter - WALL_HEIGHT / 2, w: winW, h: winH }, // 로컬좌표로 변환
  wallMatLR
)
wallLeft.position.set(-ROOM_SIZE / 2, WALL_HEIGHT / 2, 0)
wallLeft.rotateY(Math.PI / 2)
scene.add(wallLeft)

// 우(동) 벽: x = +ROOM_SIZE/2 (오른쪽 벽)
const wallRight = makeWallWithWindow(
  ROOM_SIZE,
  WALL_HEIGHT,
  { x: 0, y: winYCenter - WALL_HEIGHT / 2, w: winW, h: winH },
  wallMatLR
)
wallRight.position.set(ROOM_SIZE / 2, WALL_HEIGHT / 2, 0)
wallRight.rotateY(-Math.PI / 2)
scene.add(wallRight)

// 참고: 기존 BoxGeometry(BackSide) "룸"은 제거함.
// 필요하면 천장 추가:
const ceiling = new THREE.Mesh(
  ceilGeo,
  new THREE.MeshStandardMaterial({ color: 0xf7f7f7, roughness: 1, side: THREE.DoubleSide })
)
ceiling.position.set(0, WALL_HEIGHT, 0)
ceiling.rotateX(Math.PI / 2)
ceiling.receiveShadow = true
wallGroup.add(ceiling)

/** ===== Models config (URL, 표준 높이) ===== */
/** ===== Models config (URL, 표준 높이) ===== */
const MODEL_MAP = {

  // 대형
  euphorbia_trigona: {
    label: '유포르비아 트리고나',
    url: '/models/dynamic/big/Euphorbia_Trigona.glb',
    targetHeight: 5,
    showInToolbar: true,
  },  
  paradise_plant: {
    label: '극락조',
    url: '/models/dynamic/big/Paradise_Plant.glb',
    targetHeight: 4.5,
    showInToolbar: true,
  },  
  rubber_tree: {
    label: '고무나무',
    url: '/models/dynamic/big/Rubber_Tree.glb',
    targetHeight: 5,
    showInToolbar: true,
  },
  stuckyi: {
    label: '스투키',
    url: '/models/dynamic/big/Stuckyi.glb',
    targetHeight: 4.3,
    showInToolbar: true,
  },

  // 중형
  areca_palm: {
    label: '아레카 야자',
    url: '/models/dynamic/middle/Areca_Palm.glb',
    targetHeight: 3.5,
    showInToolbar: true,
  },  
  monstera: {
    label: '몬스테라',
    url: '/models/dynamic/middle/Monstera.glb',
    targetHeight: 3.5,
    showInToolbar: true,
  },
  spathiphyllum: {
    label: '스파티필룸',
    url: '/models/dynamic/middle/Spathiphyllum.glb',
    targetHeight: 3.5,
    showInToolbar: true,
  },  
  travelers_tree: {
    label: '여인초',
    url: '/models/dynamic/middle/Travelers_Tree.glb',
    targetHeight: 3.5,
    showInToolbar: true,
  },

  // 소형
  calathea_orbifolia: {
    label: '칼라데아 오르비폴리아',
    url: '/models/dynamic/small/Calathea_Orbifolia.glb',
    targetHeight: 2.2,
    showInToolbar: true,
  },
  golden_pothos: {
    label: '스킨답서스',
    url: '/models/dynamic/small/Golden_Pothos.glb',
    targetHeight: 2.2,
    showInToolbar: true,
  },
  mini_cactus: {
    label: '미니 선인장',
    url: '/models/dynamic/small/Mini_Cactus.glb',
    targetHeight: 2.2,
    showInToolbar: true,
  },
  tillandsia: {
    label: '틸란드시아',
    url: '/models/dynamic/small/Tillandsia.glb',
    targetHeight: 2.2,
    showInToolbar: true,
  },


  sofa: {
    label: '소파',
    url: '/models/static/Sofa.glb',
    targetHeight: 2,
    wallSnap: true,
    showInToolbar: false, // ← 버튼 숨김
  },
  coffee_table: {
    label: '커피 테이블',
    url: '/models/static/Coffee_Table.glb',
    targetHeight: 1.2, // 테이블 높이(대략 42cm)
    showInToolbar: false, // 버튼 숨김
  },
  sideboard: {
    label: '사이드보드',
    url: '/models/static/Sideboard.glb',
    targetHeight: 1.5, // 전체 높이(대략 80cm)
    showInToolbar: false, // 버튼 숨김
  },
  television: {
    label: '텔레비전',
    url: '/models/static/Television.glb',
    targetHeight: 3, // TV 전체 높이(대략 60cm)
    showInToolbar: false, // 버튼 숨김
  },
  console_table: {
    label: '콘솔 테이블',
    url: '/models/static/Console_Table.glb',
    targetHeight: 2, // 테이블 약 75cm
    showInToolbar: false,
  },
  flower_vase: {
    label: '꽃병',
    url: '/models/static/Flower_Vase.glb',
    targetHeight: 1.8, // 꽃병 약 30cm
    showInToolbar: false,
  },
}

function renderModelButtons() {
  const bar = document.querySelector('.toolbar')
  if (!bar) return
  // 모델 버튼 묶음을 넣을 컨테이너
  const wrap = document.createElement('div')
  wrap.className = 'row'
  // 기존에 같은 row가 있으면 제거(중복 방지)
  const old = bar.querySelector('.row.model-buttons')
  if (old) old.remove()
  wrap.classList.add('model-buttons')

  for (const [key, cfg] of Object.entries(MODEL_MAP)) {
    if (cfg.showInToolbar){
      const btn = document.createElement('button')
      btn.dataset.model = key
      btn.textContent = cfg.label
      wrap.appendChild(btn)
    }
  }
  // 툴바 맨 앞에 끼워넣기 (원하면 위치 조절)
  bar.insertBefore(wrap, bar.firstChild)
}

/** ===== Loader & cache ===== */
const loader = new GLTFLoader()
const prototypeCache = new Map() // url -> loaded scene
const loadingCache = new Map() // url -> Promise

function setShadow(obj, cast, receive) {
  obj.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = cast
      c.receiveShadow = receive
    }
  })
}

function ensurePrototype(url) {
  if (prototypeCache.has(url)) return Promise.resolve(prototypeCache.get(url))
  if (loadingCache.has(url)) return loadingCache.get(url)

  const p = new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const base = gltf.scene
        setShadow(base, true, true)
        prototypeCache.set(url, base)
        resolve(base)
      },
      undefined,
      (err) => reject(err)
    )
  })
  loadingCache.set(url, p)
  return p
}

/** ===== Utilities ===== */
const draggable = []

function getHalfHeight(obj) {
  const box = new THREE.Box3().setFromObject(obj)
  return (box.max.y - box.min.y) / 2 || 0.5
}
function placeOnFloor(obj, posXZ) {
  const hh = getHalfHeight(obj)
  obj.position.set(posXZ.x, hh, posXZ.z)
}
function clampInRoomXZ(x, z, margin = 0.3) {
  const inner = ROOM_SIZE / 2 - margin
  return {
    x: THREE.MathUtils.clamp(x, -inner, inner),
    z: THREE.MathUtils.clamp(z, -inner, inner),
  }
}
function pointInFrontOfCamera() {
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // y=0
  const dir = new THREE.Vector3()
    .subVectors(controls.target, camera.position)
    .normalize()
  const ray = new THREE.Ray(camera.position.clone(), dir)
  const hit = new THREE.Vector3()
  if (ray.intersectPlane(plane, hit)) {
    const { x, z } = clampInRoomXZ(hit.x, hit.z)
    return new THREE.Vector3(x, 0, z)
  }
  return new THREE.Vector3(0, 0, 0)
}
function randJitter() {
  return new THREE.Vector3(
    (Math.random() - 0.5) * 0.6,
    0,
    (Math.random() - 0.5) * 0.6
  )
}
function normalizeHeight(obj, targetHeight = 1.2) {
  const box = new THREE.Box3().setFromObject(obj)
  const size = new THREE.Vector3()
  box.getSize(size)
  if (size.y > 0) {
    const s = targetHeight / size.y
    obj.scale.setScalar(s)
  }
}

// 어떤 벽이 가까운지 계산
function getNearestWallSide(posXZ) {
  const half = ROOM_SIZE / 2
  const dLeft = Math.abs(posXZ.x - -half)
  const dRight = Math.abs(posXZ.x - +half)
  const dBack = Math.abs(posXZ.z - -half)
  const dFront = Math.abs(posXZ.z - +half)
  const min = Math.min(dLeft, dRight, dBack, dFront)
  if (min === dLeft) return 'left'
  if (min === dRight) return 'right'
  if (min === dBack) return 'back'
  return 'front'
}

// 회전이 반영된 실제 월드 크기
function getWorldSize(obj) {
  const box = new THREE.Box3().setFromObject(obj)
  const size = new THREE.Vector3()
  box.getSize(size)
  return size
}

// target(소파) 정면 방향으로 gap 만큼 띄워 앞에 배치
function placeInFrontOf(obj, target, gap = 0.2) {
  // 테이블 회전을 소파와 맞춤
  obj.rotation.y = target.rotation.y

  const sofaSize = getWorldSize(target)
  const tableSize = getWorldSize(obj)

  // 소파의 "정면" 방향 벡터 (y-회전만 고려)
  const fwd = new THREE.Vector3(0, 0, 1)
    .applyEuler(new THREE.Euler(0, target.rotation.y, 0))
    .normalize()

  // 두 물체의 하프-깊이 + 간격만큼 전방으로 이동
  const offset = sofaSize.z / 2 + tableSize.z / 2 + gap

  const pos = target.position
    .clone()
    .add(new THREE.Vector3(fwd.x, 0, fwd.z).multiplyScalar(offset))

  // 방 범위 클램프 + 바닥에 올리기
  const { x, z } = clampInRoomXZ(pos.x, pos.z)
  const hh = getHalfHeight(obj)
  obj.position.set(x, hh, z)
}

// 지정한 벽에 ‘등’이 닿도록 붙이고, 드래그시 벽 따라만 움직이게 세팅
function placeAgainstWall(obj, side, gap = 0.03) {
  // 1) 회전: 방 안쪽을 바라보게
  //   - back(z=-half)  → +Z 바라봄 (rotY = 0)
  //   - front(z=+half) → -Z (rotY = Math.PI)
  //   - left(x=-half)  → +X (rotY = -Math.PI/2)
  //   - right(x=+half) → -X (rotY =  Math.PI/2)
  switch (side) {
    case 'front':
      obj.rotation.y = Math.PI
      break
    case 'left':
      obj.rotation.y = -Math.PI / 2
      break
    case 'right':
      obj.rotation.y = Math.PI / 2
      break
    case 'back':
    default:
      obj.rotation.y = 0
      break
  }

  // 2) 회전이 적용된 상태에서 실제 월드 bbox 크기 측정
  const size = getWorldSize(obj)
  const half = ROOM_SIZE / 2

  // 3) 벽에 밀착: 해당 축을 고정하고, 나머지 축은 현재 위치 유지
  const current = obj.position.clone()
  const hh = getHalfHeight(obj)

  if (side === 'back') {
    obj.position.set(current.x, hh, -half + size.z / 2 + gap)
  } else if (side === 'front') {
    obj.position.set(current.x, hh, +half - size.z / 2 - gap)
  } else if (side === 'left') {
    obj.position.set(-half + size.x / 2 + gap, hh, current.z)
  } else if (side === 'right') {
    obj.position.set(+half - size.x / 2 - gap, hh, current.z)
  }

  // 4) 드래그 제약 정보 저장 (벽을 따라만 이동)
  obj.userData.wallSide = side
}

// base의 "앞을 바라보는 기준"에서 오른쪽(+1) 또는 왼쪽(-1)으로 obj를 같은 벽에 나란히 배치
function placeBesideOnWall(obj, base, sideSign = +1, gap = 0.12) {
  // 회전 동일
  obj.rotation.y = base.rotation.y

  // 오른쪽 방향 벡터 (base의 y-회전 기준)
  const right = new THREE.Vector3(1, 0, 0)
    .applyEuler(new THREE.Euler(0, base.rotation.y, 0))
    .normalize()

  const baseSize = getWorldSize(base)
  const objSize = getWorldSize(obj)
  const offset = baseSize.x / 2 + objSize.x / 2 + gap

  // 가로(평행축)로만 이동
  const target = base.position
    .clone()
    .add(right.multiplyScalar(sideSign * offset))

  // 방 범위 보정 후 임시 위치
  const { x, z } = clampInRoomXZ(target.x, target.z)
  const hh = getHalfHeight(obj)
  obj.position.set(x, hh, z)

  // base와 같은 벽에 밀착
  const wall = base.userData?.wallSide || 'front'
  placeAgainstWall(obj, wall, 0.02)
}

// 소파가 붙은 벽의 반대편 벽을 구함
function oppositeSide(side) {
  switch (side) {
    case 'back':
      return 'front'
    case 'front':
      return 'back'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
    default:
      return 'front'
  }
}

// base(거실장) 위 가운데에 obj(TV)를 올림
function placeOnTopOf(obj, base, gapY = 0.02) {
  // 회전은 거실장과 동일하게 맞춤 (정면 동일)
  obj.rotation.y = base.rotation.y

  // 월드 박스 사이즈/최상단 Y 계산
  const baseBox = new THREE.Box3().setFromObject(base)
  const objBox = new THREE.Box3().setFromObject(obj)
  const baseSize = new THREE.Vector3()
  const objSize = new THREE.Vector3()
  baseBox.getSize(baseSize)
  objBox.getSize(objSize)

  // 거실장 상단 높이
  const topY = baseBox.max.y

  // 거실장 중심 기준으로 TV 중심 정렬
  const pos = base.position.clone()
  const hh = objSize.y / 2
  obj.position.set(pos.x, topY + hh + gapY, pos.z)
}

/** ===== Create instance by key ===== */
async function addModelByKey(key, posXZ = null) {
  const cfg = MODEL_MAP[key]
  if (!cfg) return
  const base = await ensurePrototype(cfg.url)
  const model = base.clone(true)

  // 표준 높이로 정규화 후 배치 기준점 계산
  normalizeHeight(model, cfg.targetHeight)
  const spawn = (posXZ ?? pointInFrontOfCamera()).clone().add(randJitter())
  placeOnFloor(model, spawn)

  // 소파처럼 벽 스냅 대상이면, 가장 가까운 벽을 골라 붙임
  if (cfg.wallSnap) {
    const side = getNearestWallSide(spawn)
    // scene에 있어야 bbox가 제대로 나와서, 없으면 임시로 추가
    if (!model.parent) scene.add(model)
    placeAgainstWall(model, side)
  } else {
    // 일반 모델은 그냥 바닥에
    if (!model.parent) scene.add(model)
  }

  // 드래그 대상 등록
  // model.userData.kind =
  //   key.includes('sofa') || key.includes('coffee') ? 'furniture' : 'plant'
  // applyShadowPolicyTo(model) // ← 추가
  // scene.add(model)
  draggable.push(model)
}

/** ===== Drag & Delete ===== */
const raycaster = new THREE.Raycaster()
const mouseNDC = new THREE.Vector2()
let selected = null
let dragPlane = null
let dragOffset = new THREE.Vector3()
let selectedHalfH = 0
let isPointerDown = false

function setMouseFromEvent(e) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
}

function pick(e) {
  setMouseFromEvent(e)
  raycaster.setFromCamera(mouseNDC, camera)
  const hits = raycaster.intersectObjects(draggable, true) // recursive
  if (hits.length) {
    let obj = hits[0].object
    while (obj && !draggable.includes(obj)) obj = obj.parent
    if (!obj) return

    selected = obj
    selectedHalfH = getHalfHeight(selected)
    dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -selectedHalfH) // y=halfH

    const hitPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(dragPlane, hitPoint)
    dragOffset.copy(selected.position).sub(hitPoint)

    controls.enabled = false
    renderer.domElement.style.cursor = 'grabbing'
  }
}

function move(e) {
  if (!selected) return
  setMouseFromEvent(e)
  raycaster.setFromCamera(mouseNDC, camera)
  const point = new THREE.Vector3()
  if (raycaster.ray.intersectPlane(dragPlane, point)) {
    point.add(dragOffset)
    const { x, z } = clampInRoomXZ(point.x, point.z)

    const side = selected?.userData?.wallSide
    if (side === 'back' || side === 'front') {
      // z 고정, x만 이동
      selected.position.set(x, selectedHalfH, selected.position.z)
    } else if (side === 'left' || side === 'right') {
      // x 고정, z만 이동
      selected.position.set(selected.position.x, selectedHalfH, z)
    } else {
      // 일반 자유 이동
      selected.position.set(x, selectedHalfH, z)
    }
  }
}

function drop() {
  if (selected) selected.position.y = selectedHalfH
  selected = null
  dragPlane = null
  controls.enabled = true
  renderer.domElement.style.cursor = 'default'
}

/** Pointer & context menu */
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault())

renderer.domElement.addEventListener('pointerdown', (e) => {
  // 우클릭 → 삭제
  if (e.button === 2) {
    setMouseFromEvent(e)
    raycaster.setFromCamera(mouseNDC, camera)
    const hits = raycaster.intersectObjects(draggable, true)
    if (hits.length) {
      let obj = hits[0].object
      while (obj && !draggable.includes(obj)) obj = obj.parent
      if (obj) {
        scene.remove(obj)
        const idx = draggable.indexOf(obj)
        if (idx !== -1) draggable.splice(idx, 1)
      }
    }
    return
  }

  // 좌클릭 → 드래그
  if (e.button === 0) {
    isPointerDown = true
    pick(e)
  }
})

renderer.domElement.addEventListener('pointermove', (e) => {
  if (!isPointerDown) return
  move(e)
})

window.addEventListener('pointerup', () => {
  isPointerDown = false
  drop()
})

/** Toolbar actions */
renderModelButtons() // ← 버튼 자동 생성

document.querySelector('.toolbar').addEventListener('click', (e) => {
  const key = e.target?.dataset?.model
  if (!key) return
  addModelByKey(key)
})

/** Resize */
window.addEventListener('resize', onResize)
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

/** UI hint */
const hint = document.createElement('div')
hint.className = 'hint'
hint.innerHTML = `
<b>조작 방법</b><br/>
- 상단 버튼으로 4개 식물 모델 추가<br/>
- 드래그: 바닥(XZ) 위 이동(높이 고정)<br/>
- 우클릭: 객체 삭제<br/>
- Orbit: 좌클릭 회전 / 휠 줌 / 우클릭 패닝
`
app.appendChild(hint)

/** Loop */
renderer.setAnimationLoop(() => {
  controls.update()
  renderer.render(scene, camera)
})

// 벽 중앙(로컬) 기준으로 직사각형 구멍을 뚫은 벽 생성
function makeWallWithWindow(width, height, holeRect, material) {
  // holeRect: { x, y, w, h } — 벽 로컬좌표(중앙 0,0), +x 오른쪽, +y 위
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, -height / 2)
  shape.lineTo(+width / 2, -height / 2)
  shape.lineTo(+width / 2, +height / 2)
  shape.lineTo(-width / 2, +height / 2)
  shape.lineTo(-width / 2, -height / 2)

  const hole = new THREE.Path()
  const { x, y, w, h } = holeRect
  hole.moveTo(x - w / 2, y - h / 2)
  hole.lineTo(x + w / 2, y - h / 2)
  hole.lineTo(x + w / 2, y + h / 2)
  hole.lineTo(x - w / 2, y + h / 2)
  hole.lineTo(x - w / 2, y - h / 2)
  shape.holes.push(hole)

  const geom = new THREE.ShapeGeometry(shape)
  const mesh = new THREE.Mesh(geom, material)
  mesh.receiveShadow = true
  mesh.castShadow = true // 벽 자체도 햇빛을 가려 창문 모양 그림자 생성
  return mesh
}

// 앱 시작 시 소파와 테이블을 자동 배치
;(async function spawnInitialSofaAndTable() {
  // 1) 소파
  const sofaCfg = MODEL_MAP.sofa
  if (!sofaCfg) return

  const sofaBase = await ensurePrototype(sofaCfg.url)
  const sofa = sofaBase.clone(true)
  normalizeHeight(sofa, sofaCfg.targetHeight)
  placeOnFloor(sofa, new THREE.Vector3(0, 0, 0))
  scene.add(sofa)

  // 기본은 'back'(뒷벽 z=-half)에 붙임. 원하면 'left' | 'right' | 'front'로 변경
  placeAgainstWall(sofa, 'back', 0.03)
  // 중앙 정렬(뒷/앞벽이면 x=0, 좌/우벽이면 z=0)
  const hh = getHalfHeight(sofa)
  sofa.position.set(0, hh, sofa.position.z)
  // draggable.push(sofa)

  // 2) 테이블 – 소파 앞에 자동 배치
  const tableCfg = MODEL_MAP.coffee_table
  if (!tableCfg) return

  const tableBase = await ensurePrototype(tableCfg.url)
  const table = tableBase.clone(true)
  normalizeHeight(table, tableCfg.targetHeight)

  // 소파 앞에 배치하고 씬에 추가
  // (gap은 취향껏 0.15~0.35 정도)
  scene.add(table)
  placeInFrontOf(table, sofa, 0.8)

  // draggable.push(table)

  // sofa.userData.kind = 'furniture'
  // applyShadowPolicyTo(sofa)
  // table.userData.kind = 'furniture'
  // applyShadowPolicyTo(table)
})()

// 앱 시작 시 거실장 + TV 자동 배치 (소파 반대편 벽)
;(async function spawnSideboardAndTV() {
  // 소파 참조 찾기(이전에 스폰된 소파가 있어야 이상적)
  const sofa =
    draggable.find(
      (o) => o.userData?.kind === 'furniture' && /sofa/i.test(o.name || '')
    ) ||
    draggable.find(
      (o) => o.userData?.kind === 'furniture' && o.userData.wallSide
    ) ||
    null

  // 소파가 어떤 벽에 붙었는지 확인 → 반대편 벽 결정
  const sofaSide = sofa?.userData?.wallSide // || 'back' // 기본값 가정
  const boardSide = oppositeSide(sofaSide) // 소파 반대편

  // 1) 거실장
  const boardCfg = MODEL_MAP.sideboard
  if (!boardCfg) return
  const boardBase = await ensurePrototype(boardCfg.url)
  const board = boardBase.clone(true)
  board.userData.kind = 'furniture'
  normalizeHeight(board, boardCfg.targetHeight)

  // 우선 바닥에 놓고 장면에 추가
  placeOnFloor(board, new THREE.Vector3(0, 0, 0))
  scene.add(board)

  // 반대편 벽에 밀착 + 중앙 정렬
  placeAgainstWall(board, boardSide, 0.02)
  const bh = getHalfHeight(board)
  if (boardSide === 'back' || boardSide === 'front')
    board.position.set(0, bh, board.position.z)
  if (boardSide === 'left' || boardSide === 'right')
    board.position.set(board.position.x, bh, 0)

  applyShadowPolicyTo?.(board) // 퍼포먼스 정책 사용 중이면 적용
  // draggable.push(board)

  // 2) TV (거실장 위)
  const tvCfg = MODEL_MAP.television
  if (!tvCfg) return
  const tvBase = await ensurePrototype(tvCfg.url)
  const tv = tvBase.clone(true)
  tv.userData.kind = 'furniture'
  normalizeHeight(tv, tvCfg.targetHeight)

  // 씬에 추가 후 거실장 위 중앙에 올리기
  scene.add(tv)
  placeOnTopOf(tv, board, 0.015)

  // TV가 방 안쪽을 바라보도록(거실장과 동일 회전이지만, 혹시 반대로 왔다면 반전)
  // placeAgainstWall 사용 시 board 회전이 이미 방 안쪽을 향하므로 보통 필요 없음.
  // 필요 시 아래 주석 해제:
  // tv.rotation.y = board.rotation.y

  applyShadowPolicyTo?.(tv)
  // draggable.push(tv)

  board.userData.role = 'sideboard'
  tv.userData.role = 'tv'
})()

// 앱 시작 시: front(정면) 벽의 "오른쪽"에 콘솔 테이블 + 그 위 꽃병 자동 배치
;(async function spawnConsoleTableAndVaseOnFrontLeft() {
  const half = ROOM_SIZE / 2

  // 1) 콘솔 테이블
  const tCfg = MODEL_MAP.console_table
  if (!tCfg) return
  const tBase = await ensurePrototype(tCfg.url)
  const table = tBase.clone(true)
  table.userData.kind = 'furniture'
  normalizeHeight(table, tCfg.targetHeight)

  // 씬에 추가 후 front 벽에 밀착
  scene.add(table)
  // gap은 벽에서 떨어지는 거리(미세)
  placeAgainstWall(table, 'front', 0.02)

  // "오른쪽" 끝으로 이동 (방의 +X 방향)
  const tSize = getWorldSize(table)
  const margin = 1.5 // 벽 모서리에서 살짝 띄우는 여유
  const hh = getHalfHeight(table)
  // front 벽은 z=+half 쪽, placeAgainstWall에서 z를 이미 세팅해줌 → x만 조정
  table.position.set(half - tSize.x / 2 - margin, hh, table.position.z)

  // 그림자/성능 정책 사용 중이면 적용
  if (typeof applyShadowPolicyTo === 'function') applyShadowPolicyTo(table)
  // draggable.push(table)

  // 2) 꽃병
  const vCfg = MODEL_MAP.flower_vase
  if (!vCfg) return
  const vBase = await ensurePrototype(vCfg.url)
  const vase = vBase.clone(true)
  vase.userData.kind = 'decor'
  normalizeHeight(vase, vCfg.targetHeight)

  // 씬에 추가 후 테이블 위 중앙에 올리기
  scene.add(vase)
  placeOnTopOf(vase, table, 0.01)

  if (typeof applyShadowPolicyTo === 'function') applyShadowPolicyTo(vase)
  // draggable.push(vase)
})()

/** antialiasing */
// ===== 퍼포먼스 프리셋 =====
let currentQuality = 'low' // 'low' | 'medium' | 'high'
const deviceDPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))

// 씬 전체 텍스처 anisotropy 일괄 조정
function setGlobalAnisotropy(value = 2) {
  scene.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const m of mats) {
        if (m.map && 'anisotropy' in m.map) m.map.anisotropy = value
        if (m.normalMap) m.normalMap.anisotropy = value
        if (m.roughnessMap) m.roughnessMap.anisotropy = value
        if (m.metalnessMap) m.metalnessMap.anisotropy = value
        if (m.emissiveMap) m.emissiveMap.anisotropy = value
      }
    }
  })
}

// 식물/가구에 따라 그림자 정책 적용
function applyShadowPolicyTo(obj) {
  const kind = obj.userData?.kind || 'plant'
  obj.traverse((c) => {
    if (!c.isMesh) return
    // 기본: 식물 castShadow 끔(리프 많으면 비용 큼), 가구는 켬
    if (kind === 'plant') {
      c.castShadow = currentQuality === 'high' // 고사양에서만 식물 그림자
      c.receiveShadow = true
    } else {
      c.castShadow = currentQuality !== 'low'
      c.receiveShadow = true
    }
  })
}

function reapplyShadowPolicyAll() {
  draggable.forEach(applyShadowPolicyTo)
}

// 격자 참조 필요 (이미 변수 grid가 있으면 이 라인은 생략)
const _gridRef = typeof grid !== 'undefined' ? grid : null

// 퀄리티 프리셋 적용
function applyQuality(mode = 'low') {
  currentQuality = mode

  // 1) 해상도(DPR) 다운스케일
  const targetDPR =
    mode === 'high'
      ? deviceDPR
      : mode === 'medium'
      ? Math.min(deviceDPR, 1.5)
      : 1 // low
  renderer.setPixelRatio(targetDPR)
  renderer.setSize(window.innerWidth, window.innerHeight)

  // 2) 섀도우 해상도/알고리즘
  const mapSize = mode === 'high' ? 2048 : mode === 'medium' ? 1024 : 512 // low
  renderer.shadowMap.type =
    mode === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap // medium/low

  // 메인 태양 라이트 찾아서 조정(네 코드에선 dirLight 또는 sun 중 하나)
  const mainDirLight = scene.children.find((o) => o.isDirectionalLight)
  if (mainDirLight) {
    mainDirLight.shadow.mapSize.set(mapSize, mapSize)
    mainDirLight.shadow.bias = -0.0002
    mainDirLight.shadow.normalBias = mode === 'high' ? 0.02 : 0.04
    // 그림자 카메라 폭을 줄이면 선명하지만 커팅 위험 → 중간값 유지
  }

  // 3) 격자 표시/숨김
  if (_gridRef) _gridRef.visible = mode !== 'low'

  // 4) 텍스처 필터링 강도
  const aniso = mode === 'high' ? 8 : mode === 'medium' ? 4 : 1 // low
  setGlobalAnisotropy(aniso)

  // 5) 오브젝트 그림자 정책 재적용
  reapplyShadowPolicyAll()
}
