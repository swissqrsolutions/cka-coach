// "An evening at Luigi's": Kubernetes explained as a real restaurant. One long, slow episode (three.js, MIT).
// Models: Quaternius Ultimate Animated Character Pack, KayKit Restaurant Bits, Kenney, Quaternius props (all CC0): assets/3d/models/.
// Plays once, Replay, no loop. Reduced motion → last frame + caption. Voice + music: assets/3d/voice.json (optional).
import * as THREE from './3d/three.module.min.js';
import { GLTFLoader } from './3d/GLTFLoader.js';
import { clone as skClone } from './3d/SkeletonUtils.js';

const BASE = new URL('./3d/', import.meta.url);
const NAMES = ['chef', 'waiter', 'manager', 'guest1', 'guest2', 'nina', 'dad', 'mom', 'oven', 'stove', 'counter', 'counter_long', 'table', 'chair', 'plate', 'pizza', 'pizza_box', 'shelf', 'book', 'phone',
  'modular_walls', 'modular_kitchen_parts', 'extractor_hood', 'kitchen_cabinet', 'pot', 'pan', 'cutting_board', 'crate_tomatoes', 'crate_cheese', 'plant_pothos_medium', 'houseplant_quaternius',
  'candle', 'glass_wine', 'bottle_wine', 'flowers_vase_creativetrio', 'menu_sign_wooden', 'painting', 'fridge'];
let cache = null;
const load = () => (cache ||= Promise.all([
  ...NAMES.map(n => new GLTFLoader().loadAsync(new URL('models/' + n + '.glb', BASE).href).then(g => [n, g])),
  fetch(new URL('voice.json', BASE)).then(r => r.ok ? r.json() : null).catch(() => null).then(v => ['_voice', v]),
]).then(Object.fromEntries));

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = u => { u = clamp(u); return u * u * u * (u * (u * 6 - 15) + 10); };
const lerp = (a, b, u) => a + (b - a) * u;
const F = .8;           // KayKit scale
const CH = .5;          // character scale (about 1.9 m)

// ───────── the episode: one line of narration per scene; the camera holds on each scene
// shot: [camera position, look-at, fov]; min: shortest length in seconds (actions need the time)
export const SCENES = [
  { id: 'open', say: "This is Luigi's, a small pizza restaurant. Tonight, it will show you how Kubernetes works.", shot: [V(9, 7.5, 15), V(0, 1, -1), 40], min: 7 },
  { id: 'idea', say: "In Kubernetes, you never cook the food yourself. You only say what you want, and a team makes sure it happens. Let's meet the team.", shot: [V(5, 4.2, 10), V(-1, 1, -1), 42], min: 8 },
  { id: 'leo', say: "This is Leo. He sits at the order desk. Every order, from anyone, goes through Leo. In Kubernetes, Leo is the API server.", shot: [V(-3.8, 2.0, 1.6), V(-5.6, 1.5, -1.9), 38], tags: ['leo'], min: 8 },
  { id: 'book', say: "Leo writes every order in this book. The book is the single source of truth: what is written here is what we want. In Kubernetes, this book is called etcd.", shot: [V(-3.9, 2.1, 1.4), V(-5.5, 1.5, -1.6), 40], tags: ['book'], min: 9 },
  { id: 'sofia', say: "This is Sofia, the manager. All night she does one thing: she compares the book with what is really on the counter. If they are different, she makes them the same. In Kubernetes, Sofia is the controller manager.", shot: [V(-1.2, 2.1, 1.1), V(-3.4, 1.45, -1.6), 38], tags: ['sofia'], min: 11 },
  { id: 'kitchen', say: "Behind this wall is the kitchen. A big restaurant has many kitchens, and each one is a node. Ours is Kitchen 1.", shot: [V(.4, 2.4, 3.2), V(0, 2.0, -3), 42], tags: ['sign'], min: 8 },
  { id: 'marco', say: "This is Marco, the chef of Kitchen 1. He cooks whatever is given to his kitchen, and tells Leo when it is ready. In Kubernetes, Marco is the kubelet: there is one on every node.", shot: [V(.4, 2.3, -3.7), V(2.3, 1.2, -5.4), 44], tags: ['marco'], min: 10 },
  { id: 'oven', say: "Marco doesn't bake by hand. He puts a meal kit in the oven, and the oven does the baking. In Kubernetes, the oven is the container runtime, called containerd.", shot: [V(3.0, 1.9, -3.9), V(4.4, 1.0, -6.3), 38], tags: ['oven'], min: 9 },
  { id: 'store', say: "The meal kits wait here, in the store room. A kit is packed once, and it bakes the same pizza every time. The store room is the registry, and each meal kit is an image.", shot: [V(-4.2, 2.2, -3.8), V(-7.3, 1.1, -5.2), 42], tags: ['store'], min: 10 },
  { id: 'build', say: "Where do the kits come from? The recipe is your Java code on GitHub. When it changes, GitHub Actions builds it and packs a new kit: docker build. Then the kit is stored here: docker push.", shot: [V(-4.6, 1.8, -4.2), V(-7.3, 1.2, -5.0), 34], tags: ['kit'], min: 11 },
  { id: 'window', say: "Guests never walk into the kitchen. All food comes out of one place: this serving window. It is always the same window, whichever kitchen cooked. In Kubernetes, that is a Service.", shot: [V(3.6, 1.9, 1.2), V(3.2, 1.5, -3), 38], tags: ['window'], min: 10 },
  { id: 'nina', say: "And this is Nina. She takes the food from the serving window to the right table. In Kubernetes, Nina is kube-proxy.", shot: [V(4.6, 1.9, 1.8), V(2.6, 1.2, -1.6), 38], tags: ['nina'], min: 9 },
  { id: 'meet', say: "Now you know the team. Let's watch a real evening.", shot: [V(8, 6.5, 13), V(0, 1, -1), 42], min: 5 },
  { id: 'call', say: "The phone rings. It's head office: from now on, always keep two Margherita pizzas ready. That phone call is you, running helm upgrade, or kubectl apply.", shot: [V(-3.8, 2.0, 1.5), V(-5.7, 1.4, -1.6), 40], tags: ['phone'], min: 10 },
  { id: 'write', say: "Leo writes it in the book: Margherita, two wanted. Head office hangs up. It does not watch. It said what it wants, once.", shot: [V(-3.9, 2.1, 1.4), V(-5.5, 1.5, -1.6), 40], min: 9 },
  { id: 'compare', say: "Sofia reads the book. Two wanted. On the counter: zero. That is a difference, so she acts.", shot: [V(-2.6, 2.2, 1.9), V(-4.8, 1.5, -1.6), 42], min: 8 },
  { id: 'ticket', say: "She picks a kitchen with free space, Kitchen 1, and hangs the ticket there. Choosing the kitchen is the job of the scheduler.", shot: [V(-1.6, 4.8, .8), V(.8, .9, -4.0), 52], tags: ['sched'], min: 11 },
  { id: 'fetch', say: "Marco sees the ticket. He walks to the store room and takes a Margherita kit.", shot: [V(.4, 5.6, -.6), V(-2.2, .6, -5.2), 52], min: 9 },
  { id: 'bake', say: "He puts the kit into the oven, and the oven bakes it.", shot: [V(2.2, 2.3, -3.8), V(4.0, 1.0, -6.0), 42], min: 10 },
  { id: 'pods', say: "Two pizzas come out. Marco puts them on the serving counter. In Kubernetes, these two pizzas are two Pods, running.", shot: [V(1.8, 2.0, -4.6), V(3.4, 1.0, -3.6), 40], tags: ['pods'], min: 11 },
  { id: 'calm', say: "Marco tells Leo, and Leo updates the book: two wanted, two ready. The difference is gone. Everyone is calm.", shot: [V(-3.9, 2.1, 1.4), V(-5.5, 1.5, -1.6), 40], min: 8 },
  { id: 'family', say: "The door opens. A family comes in. It's Mia's birthday, and she is very excited.", shot: [V(6.5, 3.2, 8.5), V(3.2, 1.0, 3.2), 42], tags: ['mia'], min: 11 },
  { id: 'order', say: "Her dad orders a Margherita. Nina goes to the serving window and takes one of the two pizzas.", shot: [V(5.2, 2.4, 2.4), V(3.0, 1.2, -2.2), 42], min: 9 },
  { id: 'carry', say: "She carries it carefully across the room...", shot: [V(6.6, 2.0, .4), V(3.2, 1.0, .6), 42], min: 5 },
  { id: 'crash', say: '', shot: [V(6.4, 1.4, .6), V(3.5, .5, 2.0), 40], min: 4.5 },
  { id: 'gone', say: "The pizza is on the floor. Mia looks at it. Her birthday pizza is gone.", shot: [V(3.4, 1.05, 1.2), V(5.2, .75, 2.4), 36], min: 9 },
  { id: 'sofia2', say: "But look at Sofia. She doesn't panic. She just looks at the book. Two wanted. Only one ready.", shot: [V(-2.6, 2.2, 1.9), V(-4.8, 1.5, -1.6), 42], min: 9 },
  { id: 'heal', say: "Nobody shouts. Nobody calls Marco. Sofia simply sees the difference, and a new ticket goes to Kitchen 1.", shot: [V(-1.6, 4.8, .8), V(.8, .9, -4.0), 52], min: 9 },
  { id: 'again', say: "Marco takes a new kit from the store room and puts it in the oven. Same kit, same recipe, the same pizza.", shot: [V(.4, 5.6, -.6), V(-.4, .6, -5.2), 56], min: 12 },
  { id: 'ready', say: "A new pizza is ready, and the book says it again: two wanted, two ready.", shot: [V(1.8, 2.0, -4.6), V(3.4, 1.0, -3.6), 40], min: 8 },
  { id: 'serve', say: "Nina brings it to Mia's table, with a birthday candle.", shot: [V(7.0, 2.6, 2.0), V(3.4, 1.0, .8), 44], min: 9 },
  { id: 'smile', say: "Mia smiles. The evening goes on, as if nothing had happened.", shot: [V(3.4, 1.05, 1.2), V(5.2, .75, 2.4), 36], min: 8 },
  { id: 'moral', say: "That is Kubernetes. You don't fix things one by one. You write down what you want, and the team keeps it true. Even when a plate falls.", shot: [V(8, 6.8, 13.5), V(0, 1, -1), 40], min: 10 },
  { id: 'recap', say: "So remember. Leo is the API server, and his book is etcd. Sofia is the controller manager, and choosing the kitchen is the scheduler. Marco is the kubelet, on a node. The oven is containerd, and a meal kit is an image. Each pizza is a Pod. The serving window is a Service, and Nina is kube-proxy.", shot: [V(9.5, 8.5, 15.5), V(0, .8, -1.4), 40], tags: ['leo', 'book', 'sofia', 'marco', 'oven', 'store', 'pods', 'window', 'nina'], min: 24 },
];

// people: model file, skin colour, start [x, z, facing]
const CAST = {
  marco: ['chef', '#e8b48c', [2.2, -5.0, Math.PI]], leo: ['manager', '#c98e62', [-5.6, -2.15, 0]], sofia: ['waiter', '#f0c8a8', [-3.4, -1.6, .3]],
  nina: ['nina', '#8d5a3b', [2.2, -1.9, -.4]], dad: ['dad', '#f3cfb1', [5.6, 8.4, Math.PI]], mom: ['mom', '#f0c39a', [6.3, 8.6, Math.PI]],
  mia: ['guest2', '#f3cfb1', [6.0, 9.2, Math.PI]], diner: ['guest1', '#c98e62', [-2.75, 3.3, Math.PI / 2]],
};
// name cards: [anchor, name, what they are in the restaurant, Kubernetes name]
const CARDS = {
  leo: ['leo', 'Leo', 'order desk', 'API server'], book: ['book', 'The order book', 'what we want', 'etcd'], sofia: ['sofia', 'Sofia', 'manager', 'controller manager'],
  sign: ['sign', 'Kitchen 1', 'one kitchen', 'node'], marco: ['marco', 'Marco', 'chef of Kitchen 1', 'kubelet'], oven: ['oven', 'The oven', 'bakes the kit', 'containerd'],
  store: ['shelf', 'Store room', 'all meal kits', 'registry'], kit: ['shelf', 'Meal kit', 'packed once', 'image'], window: ['window', 'Serving window', 'one fixed place', 'Service'],
  nina: ['nina', 'Nina', 'waiter', 'kube-proxy'], phone: ['phone', 'Head office call', 'that is you', 'helm / kubectl'], sched: ['sign', 'Ticket → Kitchen 1', 'choosing a kitchen', 'scheduler'],
  pods: ['pass', 'Two pizzas', 'running', 'Pods'], mia: ['mia', 'Mia', 'birthday girl', 'a user'],
};

function timeline(voice) {
  let t = 0; const out = [];
  for (const s of SCENES) {
    const words = s.say ? s.say.split(/\s+/).length : 0;
    const vd = voice?.dur?.[s.id];
    const d = Math.max(s.min, (vd ?? words / 2.4) + 1.4);
    out.push({ ...s, t, d }); t += d;
  }
  return { list: out, end: t + 1 };
}

export async function mountFilm(host) {
  host.classList.add('motion', 'mhome', 'm3d');
  host.innerHTML = `<div class="mwrap"><canvas aria-hidden="true"></canvas><div class="mtags"></div><div class="mload">Loading Luigi's…</div><button type="button" class="msnd" hidden aria-label="Sound on or off">🔇 Tap for sound</button></div><p class="mcap" aria-live="polite"></p><div class="mbar"><button type="button" class="btn ghost mrep" hidden>↻ Replay</button></div>`;
  const wrap = host.querySelector('.mwrap'), canvas = host.querySelector('canvas'), tags = host.querySelector('.mtags'), cap = host.querySelector('.mcap'), rep = host.querySelector('.mrep'), snd = host.querySelector('.msnd');
  const G = await load();
  host.querySelector('.mload').remove();
  const TL = timeline(G._voice);
  let S = null, raf = 0, playing = false, T = 0;
  // sound: one mixed track (voice + music), muted until tapped
  let audio = null, muted = true;
  if (G._voice?.file) {
    audio = new Audio(new URL(G._voice.file, BASE).href); audio.preload = 'auto'; snd.hidden = false;
    snd.onclick = () => { muted = !muted; snd.textContent = muted ? '🔇 Tap for sound' : '🔊'; if (muted) audio.pause(); else if (playing) { audio.currentTime = T; audio.play().catch(() => {}); } };
  }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const camera = new THREE.PerspectiveCamera(40, 4 / 5, 0.1, 120);
  const size = () => { const w = wrap.clientWidth || 358, h = Math.round(w * 5 / 4); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  size(); addEventListener('resize', size);

  const build = () => { S?.dispose(); S = makeScene(G, tags, TL); };
  const frame = (t, dt) => { S.step(t, dt); shoot(camera, t, TL); renderer.render(S.scene, camera); S.tagsAt(camera, t, wrap); showCap(t); canvas.style.filter = S.filter(t); };
  const showCap = t => { let c = null; for (const s of TL.list) if (t >= s.t && s.say) c = s; if (!c) return (cap.style.opacity = 0); if (cap.dataset.s !== c.id) { cap.dataset.s = c.id; cap.textContent = c.say; } cap.style.opacity = Math.min(1, (t - c.t) / .5); };
  const seek = t => { cancelAnimationFrame(raf); playing = false; audio?.pause(); build(); const dt = 1 / 30; for (let x = 0; x < t; x += dt) S.step(Math.min(x + dt, t), dt); frame(t, 0); };
  const play = () => {
    cancelAnimationFrame(raf); build(); rep.hidden = true; playing = true; T = 0; let last = performance.now();
    if (audio && !muted) { audio.currentTime = 0; audio.play().catch(() => {}); }
    const tick = now => {
      if (!host.isConnected) { audio?.pause(); return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      T = audio && !muted && !audio.paused ? audio.currentTime : T + dt;   // the sound leads when it plays
      frame(Math.min(T, TL.end), dt);
      if (T < TL.end) raf = requestAnimationFrame(tick); else { playing = false; rep.hidden = false; }
    };
    raf = requestAnimationFrame(tick);
  };
  rep.onclick = play;
  host._seek = seek; host._end = TL.end; host._scenes = TL.list.map(s => [s.id, +s.t.toFixed(1)]);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return seek(TL.end);
  seek(0);
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .4 });
  io.observe(host);
}

// camera: move to each scene's shot in about 2 s, then a slow push in while it is held
function shoot(cam, t, TL) {
  const L = TL.list; let i = 0; while (i < L.length - 1 && t >= L[i + 1].t) i++;
  const cur = L[i], prev = L[Math.max(0, i - 1)], mv = i ? Math.min(2.2, cur.d * .3) : .01, u = ss((t - cur.t) / mv);
  const push = clamp((t - cur.t) / cur.d) * .07;
  const p = new THREE.Vector3().lerpVectors(prev.shot[0], cur.shot[0], u), g = new THREE.Vector3().lerpVectors(prev.shot[1], cur.shot[1], u);
  p.lerp(g, push);
  const shake = cur.id === 'crash' ? Math.max(0, 1 - Math.abs(t - cur.t - 1.4) * 1.6) * .05 : 0;
  cam.position.set(p.x + Math.sin(t * .7) * .03 + Math.sin(t * 53) * shake, p.y + Math.sin(t * .9) * .02 + Math.cos(t * 47) * shake, p.z);
  cam.fov = lerp(prev.shot[2], cur.shot[2], u); cam.updateProjectionMatrix(); cam.lookAt(g);
}

// ───────── the restaurant
function makeScene(G, tagsEl, TL) {
  const T = Object.fromEntries(TL.list.map(s => [s.id, s.t]));   // scene start times
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#141a26'); scene.fog = new THREE.Fog('#141a26', 26, 48);
  const canvasTex = (draw, rep) => { const c = document.createElement('canvas'); c.width = c.height = 256; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const wood = canvasTex(g => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#8a5a3b', '#93623f', '#87573a', '#956641'][i % 4]; g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, i * 32 + 31, 256, 1); g.fillRect((i * 97) % 256, i * 32, 1, 32); } }, [4, 4]);
  const tiles = canvasTex(g => { for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) { g.fillStyle = (x + y) % 2 ? '#e9ecef' : '#cfd6dc'; g.fillRect(x * 64, y * 64, 64, 64); } }, [8, 2.4]);
  const floorD = new THREE.Mesh(new THREE.PlaneGeometry(16.6, 10.2), new THREE.MeshStandardMaterial({ map: wood, roughness: .75 })); floorD.rotation.x = -Math.PI / 2; floorD.position.set(0, 0, 2.1); floorD.receiveShadow = true;
  const floorK = new THREE.Mesh(new THREE.PlaneGeometry(16.6, 4.6), new THREE.MeshStandardMaterial({ map: tiles, roughness: .5 })); floorK.rotation.x = -Math.PI / 2; floorK.position.set(0, .001, -5.3); floorK.receiveShadow = true;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#2b2f3a' })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.02;
  scene.add(floorD, floorK, ground);
  for (const x of [-8.7, 8.7]) { const n = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), new THREE.MeshBasicMaterial({ color: '#1d3156' })); n.position.set(x, 2, 1); n.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(n); }

  const shade = o => o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; if (m.isSkinnedMesh) m.frustumCulled = false; if (m.material) m.material = m.material.clone(); } });
  const put = (name, x, y, z, ry = 0, s = F) => { const o = G[name].animations.length ? skClone(G[name].scene) : G[name].scene.clone(true); o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s); shade(o); scene.add(o); return o; };
  const piece = (file, node, x, y, z, ry = 0, s = F) => { const src = G[file].scene.getObjectByName(node); const o = src.clone(true); o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.scale.setScalar(s); shade(o); scene.add(o); return o; };
  // walls (KayKit modular pieces: 4 wide, 4 high, centred)
  const WY = 2 * F;
  [['wall', -6.4], ['wall', -3.2], ['wall_doorway', 0], ['wall_orderwindow_decorated', 3.2], ['wall', 6.4]].forEach(([n, x]) => piece('modular_walls', n, x, WY, -3));
  [-6.4, -3.2, 0, 3.2, 6.4].forEach(x => piece('modular_walls', 'wall', x, WY, -7.5));
  for (const sx of [-1, 1]) {
    const x = sx * 8.1, ry = Math.PI / 2;
    piece('modular_walls', 'wall', x, WY, -5.9, ry); piece('modular_walls', 'wall', x, WY, -4.3, ry);
    piece('modular_walls', 'wall_window_closed', x, WY, -1.3, ry); piece('modular_walls', 'wall', x, WY, 1.9, ry); piece('modular_walls', sx < 0 ? 'wall_window_closed' : 'wall_window_open', x, WY, 5.1, ry);
  }
  // kitchen
  piece('modular_kitchen_parts', 'kitchencounter_straight_A_backsplash', -2.2, .5 * F, -6.7);
  piece('modular_kitchen_parts', 'kitchencounter_straight_A_decorated', -.6, 1.0 * F, -6.7);
  piece('modular_kitchen_parts', 'kitchencounter_sink_backsplash', 1.0, .9 * F, -6.7);
  put('stove', 2.7, 0, -6.6); put('extractor_hood', 2.7, 0, -6.6);
  const oven = put('oven', 4.5, 0, -6.55); put('fridge', 6.6, 0, -6.6);
  put('kitchen_cabinet', -2.2, 0, -6.95); put('kitchen_cabinet', -.6, 0, -6.95);
  put('pot', 2.4, 1.2 * F, -6.55, 0, .45); put('pan', 3.1, 1.2 * F, -6.4, .5, .45); put('cutting_board', -.6, .82 * F + .05, -6.5, 0, .45);
  const pass = put('counter_long', 3.2, 0, -3.95, 0, .7);
  // store room (left side of the kitchen)
  const shelf = put('shelf', -7.55, 0, -5.1, Math.PI / 2, .5);
  put('crate_tomatoes', -6.2, 0, -6.6, 0, .42); put('crate_cheese', -4.9, 0, -6.6, .2, .42);
  const kitMat = [new THREE.MeshStandardMaterial({ color: '#b98a55', roughness: .9 }), new THREE.MeshStandardMaterial({ color: '#d9c28f', roughness: .8 })];
  const box = () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(.42, .22, .42), kitMat[0]); const t = new THREE.Mesh(new THREE.BoxGeometry(.43, .005, .1), kitMat[1]); t.position.y = .111; const l = new THREE.Mesh(new THREE.PlaneGeometry(.18, .1), new THREE.MeshBasicMaterial({ color: '#c8413a' })); l.position.set(0, 0, .211); g.add(b, t, l); b.castShadow = b.receiveShadow = true; g.position.y = .11; const w = new THREE.Group(); w.add(g); scene.add(w); return w; };
  const kits = [[.05, -5.75], [.05, -5.25], [.82, -5.7], [.82, -4.85], [1.58, -5.45], [1.58, -4.8]].map(([y, z]) => { const k = box(); k.position.set(-7.25, y, z); k.rotation.y = Math.PI / 2; return k; });
  // dining room
  put('counter', -5.6, 0, -1.25, 0, .75); const book = put('book', -5.25, .75 + .22, -1.1, -.4, .5); const phone = put('phone', -6.05, .75 + .13, -1.0, .5, .28);
  put('table', 3.4, 0, 3.0, 0, 1.0); put('chair', 2.45, 0, 3.0, Math.PI / 2, .9); put('chair', 4.35, 0, 3.0, -Math.PI / 2, .9);
  put('table', -2.0, 0, 3.3, 0, .85); put('chair', -2.75, 0, 3.3, Math.PI / 2, .85); put('chair', -1.25, 0, 3.3, -Math.PI / 2, .85);
  put('table', -2.0, 0, .2, 0, .85); put('chair', -2.75, 0, .2, Math.PI / 2, .85);
  put('candle', 3.0, 1.0, 3.25, 0, .9); put('flowers_vase_creativetrio', -2.0, .85, 3.3, 0, 1.6); put('glass_wine', -1.7, .85, 3.2, 0, 1.4); put('bottle_wine', -2.3, .85, 3.5, 0, 1.4); 
  put('plant_pothos_medium', 7.3, .45, -2.2, 0, .9); put('plant_pothos_medium', -7.3, .45, 5.6, 1, .9); put('houseplant_quaternius', 7.2, 0, 5.6, 0, 1.0);
  put('menu_sign_wooden', 6.2, 0, 7.0, -.5, .9);
  const pic = put('painting', -7.95, 2.0, 1.9, 0, 4); pic.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
  // lamps
  const lamps = [];
  for (const [x, z, c] of [[3.4, 3.0, '#ffc98a'], [-2.0, 3.3, '#ffc98a'], [-2.0, .2, '#ffc98a'], [-5.6, -1.2, '#ffd9a8'], [0, -5.2, '#f4f7ff'], [3.6, -5.2, '#f4f7ff'], [-5.6, -5.2, '#f4f7ff']]) {
    const sh = new THREE.Mesh(new THREE.ConeGeometry(.32, .28, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#2d3a33', side: THREE.DoubleSide }));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8), new THREE.MeshBasicMaterial({ color: c }));
    sh.position.set(x, 2.9, z); bulb.position.set(x, 2.77, z);
    const pl = new THREE.PointLight(c, 5.5, 7.5, 1.5); pl.position.set(x, 2.6, z); scene.add(sh, bulb, pl); lamps.push(pl);
  }
  scene.add(new THREE.HemisphereLight('#ffe9cc', '#2a2420', .75));
  const key = new THREE.DirectionalLight('#fff1dc', 1.3); key.position.set(5, 14, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); key.shadow.bias = -.0004; scene.add(key);
  const ovenGlow = new THREE.PointLight('#ff7a2e', 0, 3.5, 1.4); ovenGlow.position.set(4.5, .8, -5.6); scene.add(ovenGlow);
  const candleLight = new THREE.PointLight('#ffb35c', 0, 2.2, 1.5); candleLight.position.set(3.4, 1.4, 2.8); scene.add(candleLight);

  // the kitchen sign and the book's page (canvas sprites)
  const sprite = (lines, w, h, bg, fg) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })); s.renderOrder = 9;
    s.draw = (ls, col = fg, b = bg) => { g.clearRect(0, 0, w, h); g.fillStyle = b; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 24); g.fill(); g.textAlign = 'center'; ls.forEach((l, i) => { g.fillStyle = Array.isArray(col) ? col[i] : col; g.font = `${i ? 600 : 800} ${h * (ls.length > 2 ? .2 : .3)}px system-ui,sans-serif`; g.fillText(l, w / 2, h * ((i + 1) / (ls.length + 1)) + h * .08); }); tex.needsUpdate = true; };
    s.draw(lines); scene.add(s); return s;
  };
  const sign = sprite(['KITCHEN 1'], 512, 120, '#2f6fde', '#fff'); sign.position.set(0, 2.95, -2.55); sign.scale.set(1.1, .26, 1); sign.material.depthTest = true;
  const page = sprite(['Order book', 'nothing yet', ''], 420, 260, '#fffdf5', '#14213d'); page.material.depthTest = true; page.position.set(-5.6, 2.45, -2.55); page.scale.set(1.0, .62, 1);
  const mkTicket = () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.18, .26), new THREE.MeshStandardMaterial({ color: '#fffdf5', side: THREE.DoubleSide })); m.visible = false; scene.add(m); return m; };
  const rail = new THREE.Mesh(new THREE.BoxGeometry(.9, .04, .04), new THREE.MeshStandardMaterial({ color: '#888' })); rail.position.set(1.9, 1.85, -3.55); scene.add(rail);
  const tickets = [mkTicket(), mkTicket()];

  // food
  const plateAt = (x, y, z) => { const p = put('plate', x, y, z, 0, .45), pz = put('pizza', x, y + .04, z, Math.random() * 3, .12); p.visible = pz.visible = false; return { p, z: pz, set(x, y, z) { p.position.set(x, y, z); pz.position.set(x, y + .04, z); }, show(v) { p.visible = pz.visible = v; } }; };
  const P1 = plateAt(2.8, .7, -3.95), P2 = plateAt(3.6, .7, -3.95), P3 = plateAt(3.2, .7, -3.95);
  const kitC = box(); kitC.visible = false;
  const candle2 = put('candle', 0, 0, 0, 0, .5); candle2.visible = false;

  // ───────── timeline helpers
  const ev = [], tw = [];
  const at = (t, f) => ev.push({ t, f, done: false });
  const tween = (t0, t1, f) => tw.push({ t0, t1, f });
  const pageAt = (t, lines, col) => at(t, () => page.draw(lines, col));

  // ───────── people
  const mixers = [], C = {};
  for (const [k, [file, skin, [x, z, ry]]] of Object.entries(CAST)) {
    const o = put(file, x, 0, z, ry, k === 'mia' ? .32 : CH);
    o.traverse(m => { if (!m.isMesh || !m.material) return; if (m.material.name === 'Skin') m.material.color.set(skin); if (m.material.name === 'Face') { m.material.color.set('#1b1b1f'); m.material.roughness = .35; } });
    const mx = new THREE.AnimationMixer(o); mixers.push(mx);
    const clips = Object.fromEntries(G[file].animations.map(c => [c.name, mx.clipAction(c)]));
    const a = { o, clips, cur: null };
    a.play = (n, { once = false, fade = .3, speed = 1 } = {}) => { const c = clips[n]; if (!c || a.cur === c) return; c.reset(); c.setEffectiveTimeScale(speed); c.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); c.clampWhenFinished = once; c.fadeIn(fade).play(); if (a.cur) a.cur.fadeOut(fade); a.cur = c; };
    a.play('Idle'); C[k] = a;
  }
  for (const k of ['dad', 'mom', 'mia']) C[k].o.visible = false;
  at(0, () => C.diner.play('SitDown', { once: true, fade: .01 }));

  const walk = (a, pts, t0, speed = 1.3, clip = 'Walk', carry) => {
    let t = t0;
    for (let i = 1; i < pts.length; i++) {
      const A = pts[i - 1], Bp = pts[i], d = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), t1 = t + d / speed;
      tween(t, t1, u => { a.o.position.x = lerp(A[0], Bp[0], u); a.o.position.z = lerp(A[1], Bp[1], u); a.o.rotation.y = Math.atan2(Bp[0] - A[0], Bp[1] - A[1]); if (carry) carry(a); });
      t = t1;
    }
    at(t0, () => a.play(clip, { speed: clip.startsWith('Run') ? 1 : .95 })); at(t, () => a.play('Idle'));
    return t;
  };
  const turn = (a, ry, t0, d = .6) => { let from; tween(t0, t0 + d, u => { if (from === undefined) from = a.o.rotation.y; const dr = ((ry - from + Math.PI * 3) % (Math.PI * 2)) - Math.PI; a.o.rotation.y = from + dr * ss(u); }); };
  const act = (a, clip, t, back = 'Idle', len = 1.4) => { at(t, () => a.play(clip, { once: true })); if (back) at(t + len, () => a.play(back)); };
  const held = (o, dy = .78, fwd = .42) => a => { o.position.set(a.o.position.x + Math.sin(a.o.rotation.y) * fwd, dy, a.o.position.z + Math.cos(a.o.rotation.y) * fwd); o.rotation.y = a.o.rotation.y; };
  const heldPlate = (P, dy = .98) => a => P.set(a.o.position.x + Math.sin(a.o.rotation.y) * .4, dy, a.o.position.z + Math.cos(a.o.rotation.y) * .4);
  const glow = (t0, d) => tween(t0, t0 + d, u => { ovenGlow.intensity = 9 * Math.sin(Math.PI * u) * (1 + .15 * Math.sin(u * 80)); });

  // particles
  const puffTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const puffs = [], shards = [];
  const puff = (x, y, z, col = '#fff', life = 1.6, size = .35) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: col, transparent: true, depthWrite: false })); s.position.set(x, y, z); s.userData = { age: 0, life, size, vx: (Math.random() - .5) * .15, vz: (Math.random() - .5) * .15 }; scene.add(s); puffs.push(s); };
  const steam = (t, x, y, z, n = 5) => { for (let k = 0; k < n; k++) at(t + k * .45, () => puff(x + (Math.random() - .5) * .2, y, z)); };
  const shatter = (x, y, z) => { for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(.04 + Math.random() * .05), new THREE.MeshStandardMaterial({ color: '#f4f1ea' })); m.position.set(x, y, z); m.castShadow = true; m.userData = { v: V((Math.random() - .5) * 2.4, 1 + Math.random() * 1.6, (Math.random() - .5) * 2.4), r: V(Math.random() * 9, Math.random() * 9, 0) }; scene.add(m); shards.push(m); } };

  // ───────── the story
  act(C.leo, 'PickUp', T.leo + 2.0); turn(C.sofia, -.6, T.sofia + 2.5); turn(C.sofia, .6, T.sofia + 4.5); turn(C.sofia, .3, T.sofia + 6.5);
  act(C.marco, 'PickUp', T.marco + 1.5, 'Idle', 1.6); steam(T.marco + 2, 2.6, 1.4, -6.4, 7);
  glow(T.oven + 1.5, 4);
  tween(T.store + .5, T.store + 3, u => { kits.forEach(k => k.scale.setScalar(1 + .08 * Math.sin(u * Math.PI * 4) * (1 - u))); });
  const ninaHome = [2.2, -1.9];
  const nw = walk(C.nina, [ninaHome, [3.2, -2.4]], T.nina + 1.0, 1.2); turn(C.nina, Math.PI, nw); const nb = walk(C.nina, [[3.2, -2.4], [3.4, .4], ninaHome], nw + 1.6, 1.2); turn(C.nina, -.4, nb);
  // the call
  tween(T.call + .3, T.call + 2.2, u => { phone.rotation.z = Math.sin(u * 70) * .15 * (1 - u); });
  act(C.leo, 'PickUp', T.call + 2.4, 'Idle', 1.8);
  pageAt(T.write + 1.5, ['Order book', 'Margherita', 'wanted 2'], ['#14213d', '#14213d', '#14213d']);
  // Sofia compares, then hangs the ticket in Kitchen 1
  const s1 = walk(C.sofia, [[-3.4, -1.6], [-4.6, -1.7]], T.compare + .5, 1.1); turn(C.sofia, -1.2, s1); pageAt(T.compare + 2.5, ['Margherita', 'wanted 2', 'ready 0'], ['#14213d', '#14213d', '#c8413a']);
  const s2 = walk(C.sofia, [[-4.6, -1.7], [-.4, -2.2], [0, -3.6], [1.9, -3.9]], T.ticket + .3, 1.4); turn(C.sofia, Math.PI, s2);
  act(C.sofia, 'PickUp', s2 + .3); at(s2 + 1.1, () => { tickets[0].visible = true; tickets[0].position.set(1.75, 1.7, -3.57); });
  walk(C.sofia, [[1.9, -3.9], [0, -3.6], [-.4, -2.2], [-3.4, -1.6]], s2 + 2.4, 1.4);
  // Marco fetches a kit and bakes
  const m1 = walk(C.marco, [[2.2, -5.0], [-5.0, -4.9], [-6.5, -5.2]], T.fetch + .4, 1.45); turn(C.marco, -Math.PI / 2, m1, .4);
  act(C.marco, 'PickUp', m1 + .4); at(m1 + 1.0, () => { kits[1].visible = false; kitC.visible = true; });
  const m2 = walk(C.marco, [[-6.5, -5.2], [-4.6, -4.9], [4.5, -4.9]], Math.max(m1 + 1.8, T.bake + .2), 1.6, 'Walk_Carry', held(kitC)); turn(C.marco, Math.PI, m2, .3);
  act(C.marco, 'PickUp', m2 + .3); at(m2 + .8, () => { kitC.visible = false; }); glow(m2 + .9, 4.5);
  // two pizzas onto the serving counter
  const pz = Math.max(m2 + 5.6, T.pods + .4);
  at(pz, () => { P1.show(true); P1.set(4.5, .98, -4.5); });
  const m3 = walk(C.marco, [[4.5, -4.9], [3.0, -4.6]], pz, 1.2, 'Walk_Carry', heldPlate(P1)); turn(C.marco, 0, m3, .3);
  at(m3 + .4, () => P1.set(2.8, .7, -3.95)); steam(m3 + .4, 2.8, .9, -3.95, 4);
  const m4 = walk(C.marco, [[3.0, -4.6], [4.5, -4.9]], m3 + 1.0, 1.4); at(m4 + .3, () => { P2.show(true); P2.set(4.5, .98, -4.5); });
  const m5 = walk(C.marco, [[4.5, -4.9], [3.7, -4.6]], m4 + .6, 1.2, 'Walk_Carry', heldPlate(P2)); turn(C.marco, 0, m5, .3);
  at(m5 + .4, () => P2.set(3.6, .7, -3.95)); steam(m5 + .4, 3.6, .9, -3.95, 4);
  act(C.marco, 'Victory', m5 + 1.0, 'Idle', 2.2);
  pageAt(T.calm + 1.4, ['Margherita', 'wanted 2', 'ready 2'], ['#14213d', '#14213d', '#2e7a4d']);
  // the family
  for (const [k, path, sit] of [['dad', [[5.6, 8.4], [5.4, 5.0], [2.45, 3.6], [2.45, 3.0]], Math.PI / 2], ['mom', [[6.3, 8.6], [6.0, 5.0], [4.35, 3.6], [4.35, 3.0]], -Math.PI / 2], ['mia', [[6.0, 9.2], [5.8, 4.4], [5.2, 2.4]], -1.9]]) {
    at(T.family + .2, () => { C[k].o.visible = true; });
    const e = walk(C[k], path, T.family + .3 + (k === 'mia' ? .6 : 0), k === 'mia' ? 1.7 : 1.3);
    turn(C[k], sit, e, .4);
    if (k !== 'mia') at(e + .5, () => C[k].play('SitDown', { once: true })); else act(C.mia, 'Victory', e + .6, 'Idle', 2.2);
  }
  // the order: Nina takes pizza 1 from the serving window
  const n1 = walk(C.nina, [ninaHome, [2.8, -2.35]], T.order + 2.5, 1.2); turn(C.nina, Math.PI, n1, .3); act(C.nina, 'PickUp', n1 + .3);
  at(n1 + 1.0, () => P1.set(2.8, 1.0, -2.75));
  const n2 = walk(C.nina, [[2.8, -2.35], [3.2, -.4], [3.35, 1.7]], Math.max(n1 + 1.4, T.carry + .2), .8, 'Walk_Carry', heldPlate(P1, 1.0));
  // the crash
  const cr = T.crash + .4;
  at(cr, () => { C.nina.play('Defeat', { once: true, fade: .15 }); });
  tween(cr, cr + .9, u => { const e = u * u; P1.p.position.set(3.4, 1.0 - e * .95, 1.95 + u * .7); P1.p.rotation.x = e * 2.2; P1.z.position.set(3.45, 1.04 - e * 1.0, 2.0 + u * .9); P1.z.rotation.x = e * Math.PI; });
  at(cr + .9, () => { P1.p.visible = false; shatter(3.4, .06, 2.6); P1.z.position.set(3.5, .02, 2.9); for (let k = 0; k < 4; k++) at(cr + 1 + k * .3, () => puff(3.4, .15, 2.7, '#d8d0c4', 1.6, .3)); });
  at(T.gone + .5, () => C.nina.play('Idle'));
  act(C.mia, 'Defeat', T.gone + 1.2, null);
  pageAt(T.sofia2 + 2.5, ['Margherita', 'wanted 2', 'ready 1'], ['#14213d', '#14213d', '#c8413a']);
  turn(C.sofia, -1.4, T.sofia2 + 1.0);
  // healing: a new ticket, a new kit, a new pizza
  const s3 = walk(C.sofia, [[-3.4, -1.6], [-.4, -2.2], [0, -3.6], [1.9, -3.9]], T.heal + 1.6, 1.6); turn(C.sofia, Math.PI, s3); act(C.sofia, 'PickUp', s3 + .3);
  at(s3 + 1.0, () => { tickets[1].visible = true; tickets[1].position.set(2.05, 1.7, -3.57); }); walk(C.sofia, [[1.9, -3.9], [0, -3.6], [-.4, -2.2], [-3.4, -1.6]], s3 + 2.4, 1.6);
  const g1 = walk(C.marco, [[3.7, -4.6], [-5.0, -4.9], [-6.5, -5.2]], T.again + .3, 2.6, 'Run'); turn(C.marco, -Math.PI / 2, g1, .3);
  at(g1 + .5, () => { kits[3].visible = false; kitC.visible = true; });
  const g2 = walk(C.marco, [[-6.5, -5.2], [-4.6, -4.9], [4.5, -4.9]], g1 + .9, 2.6, 'Run_Carry', held(kitC)); turn(C.marco, Math.PI, g2, .3);
  act(C.marco, 'PickUp', g2 + .2); at(g2 + .7, () => { kitC.visible = false; }); glow(g2 + .8, 3);
  const rz = Math.max(g2 + 3.8, T.ready + .3);
  at(rz, () => { P3.show(true); P3.set(4.5, .98, -4.5); });
  const g3 = walk(C.marco, [[4.5, -4.9], [3.2, -4.6]], rz, 1.2, 'Walk_Carry', heldPlate(P3)); turn(C.marco, 0, g3, .3);
  at(g3 + .4, () => P3.set(3.2, .7, -3.95)); steam(g3 + .4, 3.2, .9, -3.95, 4);
  pageAt(T.ready + 3.0, ['Margherita', 'wanted 2', 'ready 2'], ['#14213d', '#14213d', '#2e7a4d']);
  // Nina serves the new pizza, with a candle
  const v1 = walk(C.nina, [[3.35, 1.7], [3.2, -2.35]], T.serve + .1, 1.6); turn(C.nina, Math.PI, v1, .3);
  at(v1 + .5, () => { candle2.visible = true; });
  const candleOn = a => { heldPlate(P3, 1.0)(a); candle2.position.set(P3.p.position.x, 1.06, P3.p.position.z); };
  const v2 = walk(C.nina, [[3.2, -2.35], [3.4, 1.6]], v1 + .8, 1.1, 'Walk_Carry', candleOn); turn(C.nina, 0, v2, .3);
  at(v2 + .4, () => { P3.set(3.4, 1.0, 2.75); candle2.position.set(3.4, 1.06, 2.75); }); tween(v2 + .4, v2 + 1.5, u => { candleLight.intensity = 3 * u; });
  act(C.mia, 'Victory', T.smile + .6, 'Idle', 2.4); act(C.mia, 'Victory', T.smile + 3.4, 'Idle', 2.4);
  act(C.marco, 'Victory', T.smile + 1.2, 'Idle', 2.2);

  // ───────── name cards (HTML): name, what they are, Kubernetes name
  const anchors = { leo: [C.leo.o, 2.25], book: [book, .5], sofia: [C.sofia.o, 2.2], sign: [sign, .35], marco: [C.marco.o, 2.45], oven: [oven, 1.75], shelf: [shelf, 2.3], window: [pass, 1.9],
    nina: [C.nina.o, 2.15], phone: [phone, .45], pass: [pass, 1.25], mia: [C.mia.o, 1.35] };
  const cardEls = {};
  for (const [k, [anc, name, what, k8s]] of Object.entries(CARDS)) { const d = document.createElement('div'); d.className = 'mtag'; d.innerHTML = '<b></b><i></i><small></small>'; d.children[0].textContent = name; d.children[1].textContent = what; d.children[2].textContent = k8s; d.style.opacity = 0; tagsEl.appendChild(d); cardEls[k] = { d, anc }; }
  const tmp = new THREE.Vector3();

  return {
    scene,
    step(t, dt) {
      for (const e of ev) if (!e.done && t >= e.t) { e.done = true; e.f(); }
      for (const w of tw) if (t >= w.t0 && !w.fin) { w.f(clamp((t - w.t0) / Math.max(1e-3, w.t1 - w.t0))); if (t >= w.t1) w.fin = true; }
      for (const m of mixers) m.update(dt);
      for (let i = puffs.length - 1; i >= 0; i--) { const s = puffs[i], u = s.userData; u.age += dt; const k = u.age / u.life; s.position.y += dt * .45; s.position.x += u.vx * dt; s.position.z += u.vz * dt; s.scale.setScalar(u.size * (.4 + k)); s.material.opacity = .5 * (1 - k); if (k >= 1) { scene.remove(s); puffs.splice(i, 1); } }
      for (const m of shards) { const u = m.userData; if (m.position.y > .03) { u.v.y -= 9.8 * dt; m.position.addScaledVector(u.v, dt); m.rotation.x += u.r.x * dt; m.rotation.y += u.r.y * dt; } else { m.position.y = .03; u.v.multiplyScalar(.85); m.position.addScaledVector(u.v.setY(0), dt); } }
      const dim = t > T.crash + 1.2 && t < T.sofia2 ? .55 : 1;
      lamps.forEach((l, i) => { l.intensity = 5.5 * dim * (1 + .03 * Math.sin(t * 2 + i)); });
      if (candle2.visible && t > T.serve) candleLight.intensity = Math.min(3, candleLight.intensity) * (1 + .08 * Math.sin(t * 13));
    },
    tagsAt(cam, t, wrap) {
      const Wd = wrap.clientWidth, H = wrap.clientHeight; let cur = TL.list[0]; for (const s of TL.list) if (t >= s.t) cur = s;
      for (const [k, c] of Object.entries(cardEls)) {
        let on = (cur.tags || []).includes(k) && t > cur.t + 1.4;
        if (cur.id === 'recap') { const L = cur.tags, i = L.indexOf(k), step = (cur.d - 3) / L.length; on = i >= 0 && t >= cur.t + 2 + i * step && t < cur.t + 2 + (i + 1) * step; }
        if (!on) { c.d.style.opacity = 0; continue; }
        const [o, off] = anchors[c.anc]; o.getWorldPosition(tmp); tmp.y += off; tmp.project(cam);
        const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.15 && Math.abs(tmp.y) < 1.15;
        const px = clamp((tmp.x + 1) / 2 * Wd, 70, Wd - 70), py = clamp((1 - tmp.y) / 2 * H, 64, H - 6);
        c.d.style.opacity = vis ? 1 : 0; c.d.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`;
      }
    },
    filter: t => t > T.crash + 1.0 && t < T.sofia2 + 1.5 ? `saturate(${t < T.gone + 4 ? .3 : .3 + (t - T.gone - 4) / 6 * .7}) contrast(1.06)` : 'none',
    dispose() { tagsEl.innerHTML = ''; },
  };
}
