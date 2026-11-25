// "Friday night": Kubernetes as a restaurant, a small 3D film (three.js, MIT).
// Models: Quaternius Ultimate Animated Character Pack, KayKit, Kenney, Quaternius props (all CC0), in assets/3d/models/.
// Plays once, Replay, no sound, no loop. Reduced motion → last frame + caption.
import * as THREE from './3d/three.module.min.js';
import { GLTFLoader } from './3d/GLTFLoader.js';
import { clone as skClone } from './3d/SkeletonUtils.js';

const BASE = new URL('./3d/models/', import.meta.url);
const NAMES = ['chef', 'waiter', 'manager', 'guest1', 'guest2', 'oven', 'stove', 'counter', 'counter_long', 'table', 'chair', 'plate', 'pizza', 'pizza_box', 'shelf', 'book', 'menu', 'phone', 'fridge', 'door', 'crate'];
let cache = null;
const load = () => (cache ||= Promise.all(NAMES.map(n => new GLTFLoader().loadAsync(new URL(n + '.glb', BASE).href).then(g => [n, g]))).then(Object.fromEntries));

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = u => { u = clamp(u); return u * u * u * (u * (u * 6 - 15) + 10); };
const lerp = (a, b, u) => a + (b - a) * u;

// ───────── the film script (seconds)
const CAPS = [
  [0.3, 'Friday night. A busy little restaurant. Watch closely: this is exactly how Kubernetes works.'],
  [5.0, '1. The chef writes a new recipe. That is your Java code, saved in GitHub.'],
  [9.5, '2. The test kitchen cooks it once to check it works: GitHub Actions runs mvn package.'],
  [14.0, '3. The meal is packed into a meal kit (docker build) and stored in the warehouse (the registry).'],
  [19.0, '4. Head office sends one order: "always 2 pizzas". That is helm upgrade. It sends it once and never checks again.'],
  [24.5, '5. The order desk (API server) writes it in the order book (etcd).'],
  [28.5, '6. The manager reads the book: 2 wanted, 0 ready, so make 2. He is the controller manager.'],
  [32.5, '7. The ticket goes to a kitchen with free space: Kitchen 1. That choice is the scheduler.'],
  [36.5, '8. The chef of Kitchen 1 (kubelet) gets the meal kit from the warehouse and puts it in the oven (containerd).'],
  [44.0, '9. Two pizzas are ready: the Pods are Running. The chef tells the desk.'],
  [48.5, '10. A guest calls the one phone number (the Service). The waiter (kube-proxy) brings a ready pizza.'],
  [55.0, 'Then… CRASH.'],
  [58.5, 'One pizza is gone. Nobody called the chef.'],
  [61.5, 'The manager checks the book: 2 wanted, only 1 ready.'],
  [64.5, 'So the chef makes a new one. Right away. On his own.'],
  [71.0, 'That is Kubernetes: you say what you want, and it keeps it true. Even when things break.'],
];
const END = 76;

// labels: [t, key, big, small]
const LABELS = [
  [5.6, 'menu', 'Recipe', 'Java code in GitHub'], [10.0, 'stove', 'Test kitchen', 'GitHub Actions'],
  [15.0, 'shelf', 'Warehouse', 'registry'], [19.6, 'door', 'Head office', 'helm upgrade'],
  [24.8, 'desk', 'Order desk', 'API server'], [25.6, 'book', 'Order book', 'etcd'],
  [28.8, 'manager', 'Manager', 'controller manager'],
  [37.0, 'chef', 'Chef', 'kubelet'], [38.0, 'oven', 'Oven', 'containerd'], [44.4, 'pass', 'Pizzas', 'Pods'],
  [49.0, 'phone', 'Phone number', 'Service'], [50.0, 'waiter', 'Waiter', 'kube-proxy'],
];

// camera: [t, pos, target, fov]
const SHOTS = [
  [0, V(8, 7, 12), V(0, .6, 0), 40], [4.6, V(5.5, 4.6, 9), V(-.5, .8, -.5), 40, 1],
  [5.4, V(-3.0, 2.3, -.2), V(-4.8, 1.1, -3.3), 40], [9.2, V(-3.2, 2.1, -.6), V(-4.8, 1.1, -3.3), 36, 1],
  [13.6, V(-3.6, 2.6, 2.6), V(-7.4, 1.2, -.6), 42], [18.6, V(-1.6, 2.9, 7.6), V(-6.6, 1.3, 2.4), 46],
  [24.0, V(-1.0, 2.1, 3.0), V(-2.4, 1.1, .3), 36], [28.2, V(-1.1, 2.05, 2.8), V(-2.4, 1.45, -.5), 34],
  [32.2, V(1.2, 3.4, 4.6), V(2.4, 1.9, -3.0), 46], [36.2, V(-.6, 4.6, 6.8), V(-2.2, .9, -1.4), 52],
  [42.0, V(3.9, 2.4, 2.6), V(3.3, 1.0, -1.6), 40], [43.4, V(3.6, 2.0, 1.9), V(3.2, .8, -.6), 36],
  [48.0, V(.4, 4.0, 8.8), V(1.6, .8, 1.6), 46],
  [54.8, V(5.4, 1.5, 2.2), V(3.7, .5, .3), 38],
  [58.2, V(1.9, 1.7, 5.9), V(3.4, 1.1, 3.4), 30],
  [61.2, V(-1.3, 1.9, 2.2), V(-2.4, 1.4, -.3), 32],
  [64.2, V(.4, 4.6, 6.0), V(-.6, 1, -1.4), 54],
  [70.6, V(7.5, 6.6, 11.5), V(0, .6, 0), 40], [END, V(8.4, 7.2, 12.6), V(0, .5, 0), 40, 1],
];

export async function mountFilm(host) {
  host.classList.add('motion', 'mhome', 'm3d');
  host.innerHTML = `<div class="mwrap"><canvas aria-hidden="true"></canvas><div class="mtags"></div><div class="mload">Loading the restaurant…</div></div><p class="mcap" aria-live="polite"></p><div class="mbar"><button type="button" class="btn ghost mrep" hidden>↻ Replay</button></div>`;
  const wrap = host.querySelector('.mwrap'), canvas = host.querySelector('canvas'), tags = host.querySelector('.mtags'), cap = host.querySelector('.mcap'), rep = host.querySelector('.mrep');
  const G = await load();
  host.querySelector('.mload').remove();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const camera = new THREE.PerspectiveCamera(38, 4 / 5, 0.1, 100);
  const size = () => { const w = wrap.clientWidth || 358, h = Math.round(w * 5 / 4); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  size(); addEventListener('resize', size);

  let S = null, raf = 0;
  const build = () => { S?.dispose(); S = makeScene(G, tags); };
  const frame = (t, dt) => { S.step(t, dt); shoot(camera, t); renderer.render(S.scene, camera); S.tagsAt(camera, t, wrap); showCap(t); canvas.style.filter = S.filter(t); };
  const showCap = t => { let c = null; for (const x of CAPS) if (t >= x[0]) c = x; if (!c) return (cap.style.opacity = 0); if (cap.dataset.s !== c[1]) { cap.dataset.s = c[1]; cap.textContent = c[1]; } cap.style.opacity = Math.min(1, (t - c[0]) / .4); };
  const seek = t => { cancelAnimationFrame(raf); build(); const dt = 1 / 30; for (let x = 0; x < t; x += dt) S.step(Math.min(x + dt, t), dt); frame(t, 0); };
  const play = () => {
    cancelAnimationFrame(raf); build(); rep.hidden = true; let last = performance.now(), t = 0;
    const tick = now => { if (!host.isConnected) return; const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; frame(Math.min(t, END), dt); if (t < END) raf = requestAnimationFrame(tick); else rep.hidden = false; };
    raf = requestAnimationFrame(tick);
  };
  rep.onclick = play;
  host._seek = seek;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return seek(END);
  seek(0);
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .4 });
  io.observe(host);
}

function shoot(cam, t) {
  let i = 0; while (i < SHOTS.length - 2 && t >= SHOTS[i + 1][0]) i++;
  // hold each shot, then move to the next one in about 1.5 s (a 'drift' key moves for the whole gap: a slow dolly)
  const a = SHOTS[i], b = SHOTS[i + 1], gap = b[0] - a[0], mv = b[4] ? gap : Math.min(1.5, gap * .45), u = ss((t - (b[0] - mv)) / mv);
  // cuts: very short gaps (<1 s) ease fast, long ones drift slowly (a dolly)
  cam.position.lerpVectors(a[1], b[1], u);
  const tg = new THREE.Vector3().lerpVectors(a[2], b[2], u);
  const shake = t > 55 && t < 56.2 ? (56.2 - t) * .06 : 0;
  cam.position.x += Math.sin(t * 9.1) * .015 + Math.sin(t * 53) * shake; cam.position.y += Math.sin(t * 7.3) * .012 + Math.cos(t * 47) * shake;
  cam.fov = lerp(a[3], b[3], u); cam.updateProjectionMatrix();
  cam.lookAt(tg);
}

// ───────── the scene
function makeScene(G, tagsEl) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1c1714'); scene.fog = new THREE.Fog('#1c1714', 18, 34);
  const disposables = [];
  // room: warm wood floor, cream walls with a dark wainscot, pendant lamps
  const floorTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#8a5a3b' : '#93623f'; g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, i * 32 + 31, 256, 1); g.fillRect((i * 97) % 256, i * 32, 1, 32); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .8 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallM = new THREE.MeshStandardMaterial({ color: '#efe3cf', roughness: .95 }), woodM = new THREE.MeshStandardMaterial({ color: '#5b3a28', roughness: .7 });
  const wall = (w, x, z, ry) => { const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, 5), wallM); p.position.y = 2.5; const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, .08), woodM); b.position.set(0, .55, .04); g.add(p, b); g.position.set(x, 0, z); g.rotation.y = ry; p.receiveShadow = true; scene.add(g); };
  wall(18, 0, -4.6, 0); wall(14, -8.6, 2.4, Math.PI / 2);
  // kitchen tiles behind the oven
  const tile = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.4), new THREE.MeshStandardMaterial({ color: '#dfe9ee', roughness: .4 })); tile.position.set(3, 1.9, -4.55); scene.add(tile);
  scene.add(new THREE.HemisphereLight('#ffe7c4', '#3a2a20', .9));
  const key = new THREE.DirectionalLight('#fff1dc', 1.6); key.position.set(6, 12, 8); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -11, right: 11, top: 10, bottom: -10, near: 1, far: 40 }); key.shadow.bias = -.0005; scene.add(key);
  const lamps = [];
  for (const [x, z] of [[-2.4, .6], [2.8, 3.4], [3.2, -1.4], [-4.8, -2.4]]) {
    const shade = new THREE.Mesh(new THREE.ConeGeometry(.35, .3, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#2d3a33', side: THREE.DoubleSide }));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffd9a0' }));
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, 1.3), new THREE.MeshBasicMaterial({ color: '#222' }));
    shade.position.set(x, 3.6, z); bulb.position.set(x, 3.45, z); cord.position.set(x, 4.35, z);
    const pl = new THREE.PointLight('#ffc98a', 6, 7, 1.6); pl.position.set(x, 3.3, z);
    scene.add(shade, bulb, cord, pl); lamps.push(pl);
  }
  const ovenGlow = new THREE.PointLight('#ff7a2e', 0, 4, 1.5); ovenGlow.position.set(3.4, .9, -2.5); scene.add(ovenGlow);
  const stoveGlow = new THREE.PointLight('#ff8a3c', 0, 3.5, 1.5); stoveGlow.position.set(-4.8, 1.3, -2.8); scene.add(stoveGlow);

  const put = (name, x, y, z, ry = 0, s = 1) => {
    const o = (G[name].animations.length ? skClone(G[name].scene) : G[name].scene.clone(true));
    o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s);
    o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; if (m.isSkinnedMesh) m.frustumCulled = false; if (m.material) m.material = m.material.clone(); } });
    scene.add(o); return o;
  };
  // ── props
  const F = .8;   // KayKit furniture scale
  const P = {
    stove: put('stove', -4.8, 0, -3.6, 0, F), menu: put('menu', -5.3, F * 1.2, -3.5, .3, .6), fridge: put('fridge', -6.7, 0, -3.6, 0, F),
    shelf: put('shelf', -8.15, 0, -.2, Math.PI / 2, .55),
    oven: put('oven', 3.4, 0, -3.6, 0, F), oven2: put('stove', 1.6, 0, -3.6, 0, F),
    pass: put('counter_long', 3.2, 0, -.6, 0, F),
    desk: put('counter', -2.4, 0, .6, 0, F), book: put('book', -2.15, F + .23, .55, -.5, .55),
    door: put('door', -8.55, 0, 2.8, Math.PI / 2),
    table: put('table', 2.8, 0, 3.4, 0, .9), chair1: put('chair', 2.0, 0, 3.4, Math.PI / 2, .9), chair2: put('chair', 3.6, 0, 3.4, -Math.PI / 2, .9),
    stand: put('crate', -.8, 0, 4.2, 0, .35), phone: put('phone', -.8, .28 + .45 * .3, 4.2, .4, .3),
  };
  // warehouse: meal kits on the shelf, one appears at step 3
  const kits = [];
  for (const [y, z] of [[.03, -.9], [.03, -.3], [.82, -.8], [.82, .2], [1.62, -.5]]) { const k = put('pizza_box', -7.9, y, z, Math.PI / 2, .42); kits.push(k); }
  const newKit = put('pizza_box', -4.6, F * 1.2, -3.3, 0, .42); newKit.visible = false;
  const carryKit = put('pizza_box', 0, 0, 0, 0, .42); carryKit.visible = false;
  // plates + pizzas on the pass; a third plate for the guest
  const plates = [put('plate', 2.6, F, -.5, 0, .55), put('plate', 3.8, F, -.5, 0, .55)];
  const pizzas = plates.map(p => { const z = put('pizza', p.position.x, F + .05, p.position.z, Math.random(), .14); z.visible = false; return z; });
  const ticket = new THREE.Mesh(new THREE.PlaneGeometry(.32, .45), new THREE.MeshStandardMaterial({ color: '#fffdf5', side: THREE.DoubleSide })); ticket.visible = false; scene.add(ticket);
  const envelope = new THREE.Mesh(new THREE.BoxGeometry(.5, .04, .34), new THREE.MeshStandardMaterial({ color: '#f3e7c9' })); envelope.visible = false; envelope.castShadow = true; scene.add(envelope);
  // "Kitchen 1" sign + book text as canvas sprites
  const sprite = (lines, w = 512, h = 160, bg = '#14213d', fg = '#fff') => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const draw = (ls, col = fg, b = bg) => { g.clearRect(0, 0, w, h); g.fillStyle = b; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill(); g.fillStyle = col; g.textAlign = 'center'; g.font = `700 ${h * .36}px system-ui,sans-serif`; ls.forEach((l, i) => g.fillText(l, w / 2, h * (ls.length === 1 ? .62 : .42 + i * .36))); tex.needsUpdate = true; };
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })); s.scale.set(w / h * .32, .32, 1); s.renderOrder = 9; draw(lines); s.draw = draw; scene.add(s); return s;
  };
  const sign = sprite(['KITCHEN 1', 'node'], 512, 190, '#2f6fde'); sign.position.set(2.5, 3.3, -4.4); sign.scale.multiplyScalar(1.6);
  const bookNote = sprite(['2 pizzas'], 420, 130, '#fffdf5', '#14213d'); bookNote.position.set(-1.85, 1.28, .75); bookNote.visible = false; bookNote.scale.multiplyScalar(.7);

  // ── characters
  const C = {}, mixers = [], SKIN = { chef: '#f0c39a', manager: '#c98e62', waiter: '#f3cfb1', guest1: '#8d5a3b', guest2: '#e8b48c' };
  const actor = (name, x, z, ry) => {
    const o = put(name, x, 0, z, ry, .5); o.traverse(m => { if (m.isMesh && m.material?.name === 'Skin') m.material.color.set(SKIN[name]); }); const mx = new THREE.AnimationMixer(o); mixers.push(mx);
    const clips = Object.fromEntries(G[name].animations.map(c => [c.name, mx.clipAction(c)]));
    const a = { o, mx, clips, cur: null, name };
    a.play = (n, { once = false, fade = .25, speed = 1 } = {}) => { const c = clips[n]; if (!c || a.cur === c) return; c.reset(); c.setEffectiveTimeScale(speed); c.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); c.clampWhenFinished = once; c.fadeIn(fade).play(); if (a.cur) a.cur.fadeOut(fade); a.cur = c; };
    a.play('Idle'); C[name] = a; return a;
  };
  actor('chef', -4.0, -2.3, Math.PI); actor('manager', -2.4, -.55, 0); actor('waiter', .6, 1.6, -.5);
  actor('guest1', 2.0, 3.4, Math.PI / 2); actor('guest2', 3.6, 3.4, -Math.PI / 2);
  for (const g of [C.guest1, C.guest2]) g.o.visible = false;
  const anchors = { menu: P.menu, stove: P.stove, shelf: P.shelf, door: P.door, desk: P.desk, book: P.book, manager: C.manager.o, sign, chef: C.chef.o, oven: P.oven, pass: P.pass, phone: P.phone, waiter: C.waiter.o };
  const tagOff = { menu: .7, stove: 1.3, shelf: 2.6, door: 3.0, desk: 1.3, book: .55, manager: 2.15, sign: .45, chef: 2.3, oven: 1.9, pass: 1.25, phone: .55, waiter: 2.1 };

  // ── particles (steam / smoke) and shards
  const puffTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const puffs = [];
  const puff = (x, y, z, col = '#ffffff', life = 1.6, size = .5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: col, transparent: true, depthWrite: false })); s.position.set(x, y, z); s.userData = { age: 0, life, size, vx: (Math.random() - .5) * .2, vz: (Math.random() - .5) * .2 }; scene.add(s); puffs.push(s); };
  const shards = [];
  const shatter = (x, y, z) => { for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(.06 + Math.random() * .06), new THREE.MeshStandardMaterial({ color: '#f4f1ea' })); m.position.set(x, y, z); m.castShadow = true; m.userData = { v: V((Math.random() - .5) * 2.6, 1.2 + Math.random() * 1.8, (Math.random() - .2) * 2.6), r: V(Math.random() * 9, Math.random() * 9, 0) }; scene.add(m); shards.push(m); } };

  // ── timeline: scheduled one-shot events + continuous tweens
  const ev = [], tw = [];
  const at = (t, f) => ev.push({ t, f, done: false });
  const tween = (t0, t1, f) => tw.push({ t0, t1, f });
  const walk = (a, pts, t0, speed = 1.7, clip = 'Walk', end = 'Idle', carry) => {
    let t = t0; const segs = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push({ a: pts[i - 1], b: pts[i], t0: t, t1: t + d / speed }); t += d / speed; }
    at(t0, () => a.play(clip, { speed: clip.startsWith('Run') ? 1 : 1.1 }));
    for (const s of segs) tween(s.t0, s.t1, u => { a.o.position.x = lerp(s.a[0], s.b[0], u); a.o.position.z = lerp(s.a[1], s.b[1], u); a.o.rotation.y = Math.atan2(s.b[0] - s.a[0], s.b[1] - s.a[1]); if (carry) { carry.position.set(a.o.position.x + Math.sin(a.o.rotation.y) * .45, 1.05, a.o.position.z + Math.cos(a.o.rotation.y) * .45); carry.rotation.y = a.o.rotation.y; } });
    at(t, () => a.play(end)); return t;
  };
  const face = (a, ry, t0, d = .5) => { let from; tween(t0, t0 + d, u => { if (from === undefined) from = a.o.rotation.y; a.o.rotation.y = lerp(from, ry, ss(u)); }); };
  const fly = (o, from, to, t0, t1, arc = 1.2, spin = 0) => { at(t0, () => { o.visible = true; }); tween(t0, t1, u => { const e = ss(u); o.position.set(lerp(from.x, to.x, e), lerp(from.y, to.y, e) + Math.sin(Math.PI * e) * arc, lerp(from.z, to.z, e)); o.rotation.y = spin * e; }); };

  // 1–3: recipe, test kitchen, meal kit → warehouse
  walk(C.chef, [[-4.0, -2.3], [-4.8, -2.5]], 5.2); at(6.4, () => { face(C.chef, Math.PI, 6.4); }); at(7.0, () => C.chef.play('PickUp', { once: true })); at(8.6, () => C.chef.play('Idle'));
  tween(9.6, 13.4, u => { stoveGlow.intensity = 5 * Math.sin(Math.PI * u) * (1 + .15 * Math.sin(u * 60)); }); for (let k = 0; k < 8; k++) at(10 + k * .4, () => puff(-4.8 + Math.random() * .4, 1.2, -3.4, '#ffffff', 1.8, .6));
  at(12.2, () => C.chef.play('Victory', { once: true })); at(13.6, () => C.chef.play('Idle'));
  at(14.2, () => { newKit.visible = true; newKit.position.set(-4.6, F * 1.2, -3.3); newKit.scale.setScalar(.01); }); tween(14.2, 14.8, u => newKit.scale.setScalar(.42 * Math.max(.01, ss(u))));
  fly(newKit, V(-4.6, F * 1.2, -3.3), V(-7.9, 1.62, .4), 15.4, 17.2, 1.4, Math.PI / 2);
  // 4: order form flies in from the door to the desk
  fly(envelope, V(-8.2, 1.6, 3.6), V(-2.4, F + .05, .75), 19.8, 22.2, 1.6, Math.PI * 2);
  at(22.4, () => C.manager.play('PickUp', { once: true })); at(23.8, () => { envelope.visible = false; C.manager.play('Idle'); });
  // 5: order book
  at(25.8, () => { bookNote.visible = true; bookNote.draw(['2 pizzas']); }); tween(25.8, 26.3, u => bookNote.scale.set(420 / 130 * .17 * ss(u) + .001, .17 * ss(u) + .001, 1));
  // 6: manager compares
  face(C.manager, -.9, 29.4, .6); face(C.manager, .9, 30.4, .6); face(C.manager, 0, 31.4, .5);
  at(30.0, () => bookNote.draw(['wanted 2', 'ready 0'], '#c8413a', '#fffdf5'));
  // 7: ticket → Kitchen 1
  fly(ticket, V(-2.3, 1.2, .5), V(2.5, 2.7, -4.3), 32.8, 34.8, 1.4, Math.PI * 4); at(35.2, () => { ticket.visible = false; sign.draw(['KITCHEN 1 ✓', 'node'], '#fff', '#2e7a4d'); });
  // 8: chef → shelf, kit → oven
  walk(C.chef, [[-4.8, -2.5], [-7.3, -.4]], 36.8, 2.0);
  at(38.0, () => { face(C.chef, -Math.PI / 2, 38.0, .3); C.chef.play('PickUp', { once: true }); }); at(38.9, () => { kits[1].visible = false; carryKit.visible = true; });
  const back = walk(C.chef, [[-7.3, -.4], [-1, -2.0], [3.4, -2.0]], 39.6, 2.6, 'Walk_Carry', 'Idle', carryKit);
  at(back, () => { face(C.chef, Math.PI, back, .3); C.chef.play('PickUp', { once: true }); }); at(back + .7, () => { carryKit.visible = false; });
  tween(back + .6, back + 3.4, u => { ovenGlow.intensity = 9 * Math.sin(Math.PI * u) * (1 + .2 * Math.sin(u * 70)); });
  // 9: pizzas pop onto the plates
  pizzas.forEach((z, i) => { at(44.2 + i * .5, () => { z.visible = true; }); tween(44.2 + i * .5, 44.7 + i * .5, u => z.scale.setScalar(.14 * Math.max(.01, ss(u)))); for (let k = 0; k < 4; k++) at(44.6 + i * .5 + k * .35, () => puff(z.position.x, 1.25, z.position.z, '#ffffff', 1.4, .35)); });
  at(45.2, () => { C.chef.play('Victory', { once: true }); bookNote.draw(['wanted 2', 'ready 2'], '#2e7a4d', '#fffdf5'); }); at(47, () => C.chef.play('Idle'));
  // 10: guests arrive and sit; the phone rings; waiter serves pizza 1
  at(48.6, () => { for (const g of [C.guest1, C.guest2]) { g.o.visible = true; g.play('SitDown', { once: true, fade: .01 }); } });
  tween(49.0, 50.4, u => { P.phone.rotation.z = Math.sin(u * 60) * .12 * (1 - u); });
  const served = walk(C.waiter, [[.6, 1.6], [2.6, .75]], 50.4, 2.2);
  at(served, () => { face(C.waiter, Math.PI, served, .25); });
  at(served + .3, () => { pizzas[0].userData.carried = true; plates[0].userData.carried = true; });
  const toTable = walk(C.waiter, [[2.6, .75], [2.8, 2.5]], served + .6, 1.8, 'Walk_Carry', 'Idle', plates[0]);
  tween(served + .6, toTable, () => { pizzas[0].position.set(plates[0].position.x, plates[0].position.y + .05, plates[0].position.z); });
  at(toTable, () => { plates[0].position.set(2.6, .9, 3.25); pizzas[0].position.set(2.6, .95, 3.25); });
  walk(C.waiter, [[2.8, 2.5], [.4, 1.4]], toTable + .6, 1.8);
  // TWIST: the second plate slides off the pass and shatters
  tween(55.0, 55.7, u => { plates[1].position.z = -.5 + ss(u) * .62; pizzas[1].position.z = plates[1].position.z; });
  tween(55.7, 56.4, u => { const e = u * u; plates[1].position.set(3.8, F - e * (F - .05), .12 + u * .5); plates[1].rotation.x = e * 1.6; pizzas[1].position.set(3.8, F + .05 - e * F, .12 + u * .55); pizzas[1].rotation.x = e * 2.4; });
  at(56.4, () => { plates[1].visible = false; shatter(3.8, .08, .62); pizzas[1].traverse(m => { if (m.isMesh) m.material.color.set('#2a1c14'); }); pizzas[1].position.set(3.6, .03, .8); pizzas[1].rotation.set(0, 0, 0); for (let k = 0; k < 10; k++) at(56.5 + k * .25, () => puff(3.6, .25, .8, '#5a5a5a', 2.4, .7)); C.chef.play('Defeat', { once: true }); });
  at(58.4, () => C.guest2.play('Defeat', { once: true, fade: .4 }));
  // the manager checks
  at(61.6, () => bookNote.draw(['wanted 2', 'ready 1'], '#c8413a', '#fffdf5')); face(C.manager, -.7, 62.4, .5);
  // the fix: chef runs, new kit, oven, new pizza → guest 2
  const k2 = walk(C.chef, [[3.4, -2.0], [-1, -2.0], [-7.3, -.4]], 64.6, 4.6, 'Run');
  at(k2, () => { kits[2].visible = false; carryKit.visible = true; });
  const b2 = walk(C.chef, [[-7.3, -.4], [-1, -2.0], [3.4, -2.0]], k2 + .2, 4.6, 'Run_Carry', 'Idle', carryKit);
  at(b2, () => { carryKit.visible = false; face(C.chef, Math.PI, b2, .2); });
  tween(b2, b2 + 1.6, u => { ovenGlow.intensity = 10 * Math.sin(Math.PI * u); });
  const p3 = put('plate', 3.8, F, -.5, 0, .55), z3 = put('pizza', 3.8, F + .05, -.5, 1, .14); p3.visible = z3.visible = false;
  at(b2 + 1.2, () => { p3.visible = z3.visible = true; bookNote.draw(['wanted 2', 'ready 2'], '#2e7a4d', '#fffdf5'); }); tween(b2 + 1.2, b2 + 1.7, u => z3.scale.setScalar(.14 * Math.max(.01, ss(u))));
  at(b2 + 1.6, () => { C.chef.play('Victory', { once: true }); });
  tween(b2 + 1.8, b2 + 3.4, u => { const e = ss(u); p3.position.set(lerp(3.8, 3.05, e), lerp(F, .9, e) + Math.sin(Math.PI * e) * .5, lerp(-.5, 3.45, e)); z3.position.set(p3.position.x, p3.position.y + .05, p3.position.z); });
  at(b2 + 3.4, () => { C.guest2.play('Victory', { once: true, fade: .3 }); });

  // ── tags (HTML, app font): big restaurant name + small Kubernetes name
  const tagEls = LABELS.map(([t, k, big, small]) => { const d = document.createElement('div'); d.className = 'mtag'; d.innerHTML = `<b></b><small></small>`; d.firstChild.textContent = big; d.lastChild.textContent = small; d.style.opacity = 0; tagsEl.appendChild(d); return { t, k, d }; });
  const tmp = new THREE.Vector3(), END_TAGS = ['shelf', 'desk', 'chef', 'pass', 'waiter', 'phone'];

  let last = 0;
  return {
    scene,
    step(t, dt) {
      for (const e of ev) if (!e.done && t >= e.t) { e.done = true; e.f(); }
      for (const w of tw) if (t >= w.t0 && !w.fin) { w.f(clamp((t - w.t0) / Math.max(1e-3, w.t1 - w.t0))); if (t >= w.t1) w.fin = true; }
      for (const m of mixers) m.update(dt);
      for (let i = puffs.length - 1; i >= 0; i--) { const s = puffs[i], u = s.userData; u.age += dt; const k = u.age / u.life; s.position.y += dt * .5; s.position.x += u.vx * dt; s.position.z += u.vz * dt; s.scale.setScalar(u.size * (.4 + k)); s.material.opacity = .55 * (1 - k); if (k >= 1) { scene.remove(s); puffs.splice(i, 1); } }
      for (const m of shards) { const u = m.userData; if (m.position.y > .03) { u.v.y -= 9.8 * dt; m.position.addScaledVector(u.v, dt); m.rotation.x += u.r.x * dt; m.rotation.y += u.r.y * dt; } else { m.position.y = .03; u.v.multiplyScalar(.8); m.position.addScaledVector(u.v.setY(0), dt); } }
      lamps.forEach((l, i) => { l.intensity = 6 * (t > 55.9 && t < 58 ? .55 : 1) * (1 + .03 * Math.sin(t * 3 + i)); });
      last = t;
    },
    tagsAt(cam, t, wrap) {
      const W = wrap.clientWidth, H = wrap.clientHeight;
      for (const g of tagEls) {
        const on = (t >= g.t && t < g.t + 6.5 && t < 54.8) || (t >= 71.5 && END_TAGS.includes(g.k));
        if (!on) { g.d.style.opacity = 0; continue; }
        const o = anchors[g.k]; o.getWorldPosition(tmp); tmp.y += (tagOff[g.k] || 1) * (o.isSprite ? 0 : 1) + (o.isSprite ? .32 : 0); tmp.project(cam);
        const vis = tmp.z < 1 && tmp.x > -1.1 && tmp.x < 1.1 && tmp.y > -1.1 && tmp.y < 1.1;
        g.d.style.opacity = vis ? Math.min(1, (t - (t >= 71.5 ? 71.5 : g.t)) / .4) : 0;
        const px = clamp((tmp.x + 1) / 2 * W, 60, W - 60), py = clamp((1 - tmp.y) / 2 * H, 44, H - 4);
        g.d.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`;
      }
    },
    filter: t => t > 56.3 && t < 61.2 ? `saturate(${t < 58 ? .25 : .25 + (t - 58) / 3.2 * .75}) contrast(1.08)` : 'none',
    dispose() { tagsEl.innerHTML = ''; scene.traverse(o => { if (o.isMesh) { o.geometry?.dispose?.(); } }); },
  };
}
