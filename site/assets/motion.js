// Motion diagrams for CKA Coach, in the Whiteboard Explainer style (Lemo-Opuscar engine, MIT: assets/wb/).
// One glossy board = one map of the cluster. Same boxes, same positions in the home film and every short.
// No sound. Plays once, Replay button, no loop. prefers-reduced-motion → still frame + caption.
import * as W from './wb/wb.js';

const { INK } = W;
const VW = 1080, VH = 1350, BW = 2400, BH = 3420;
W.setView(VW, VH);
const GREY = '#6b7280';
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let fontP = null;
const font = () => (fontP ||= W.loadFont('tech', new URL('./wb/EMSTech.json', import.meta.url)));

// ───────── the map (world units)
const B = {
  gh: [100, 170, 580, 250, 'GitHub', 'Java code'], act: [900, 170, 600, 250, 'Actions', 'mvn package'], reg: [1720, 170, 580, 250, 'Registry', 'image'],
  you: [100, 600, 580, 230, 'You', 'kubectl'], helm: [1720, 600, 580, 230, 'helm', 'upgrade'],
  cm: [110, 1110, 580, 320, 'controller', 'manager'], api: [900, 1080, 600, 560, 'API server', null], etcd: [1720, 1110, 580, 320, 'etcd', null],
  sched: [900, 1700, 600, 190, 'scheduler', null],
  kubelet: [110, 2190, 580, 270, 'kubelet', null], cri: [900, 2190, 600, 270, 'containerd', null], pod: [1700, 2160, 640, 440, 'Pod', null],
  proxy: [900, 2680, 600, 230, 'kube-proxy', null], user: [100, 3130, 580, 230, 'User', null], svc: [900, 3130, 600, 230, 'Service', null],
};
const CHIP = { dep: [930, 1260, 230, 110, 'Deploy'], rs: [1190, 1260, 120, 110, 'RS'], pchip: [1340, 1260, 130, 110, 'Pod'] };
const FR = { cp: [50, 980, 2300, 940, 'control plane'], node: [50, 2060, 2300, 960, 'node01'] };
const P = {
  gh_act: [[680, 295], [900, 295]], act_reg: [[1500, 295], [1720, 295]],
  helm_api: [[2010, 830], [2010, 950], [1350, 950], [1350, 1080]], you_api: [[390, 830], [390, 950], [1050, 950], [1050, 1080]],
  api_etcd: [[1500, 1270], [1720, 1270]], cm_api: [[690, 1270], [900, 1270]], sched_api: [[1200, 1700], [1200, 1640]],
  api_kubelet: [[900, 1560], [400, 1560], [400, 2190]], kubelet_cri: [[690, 2325], [900, 2325]], cri_pod: [[1500, 2325], [1700, 2325]],
  pull: [[2300, 295], [2378, 295], [2378, 2110], [1200, 2110], [1200, 2190]],
  user_svc: [[680, 3245], [900, 3245]], svc_proxy: [[1200, 3130], [1200, 2910]], proxy_pod: [[1500, 2795], [2020, 2795], [2020, 2600]],
  ssh: [[100, 715], [30, 715], [30, 2325], [110, 2325]],
};
const BOTH = { cm_api: 1, sched_api: 1, api_kubelet: 1 };
// where red / green / orange marker notes are written
const NOTE = { api: [1210, 1525], pod: [2020, 2545], sched: [1560, 1820], kubelet: [140, 2560], kubelet2: [140, 2635], status: [400, 2132], pull: [2378, 1250], ssh: [70, 1990], fix: [430, 930] };

function arrowP(pts, o = {}) {
  const sh = W.poly(pts.flat(), { w: 7, jitter: .6, ...o });
  const head = (ex, ey, px, py) => { const a = Math.atan2(ey - py, ex - px), hl = 34; return [W.line(ex + Math.cos(a + 2.6) * hl, ey + Math.sin(a + 2.6) * hl, ex, ey, { w: 7, ...o, bow: 0 }), W.line(ex, ey, ex + Math.cos(a - 2.6) * hl, ey + Math.sin(a - 2.6) * hl, { w: 7, ...o, bow: 0 })]; };
  const n = pts.length, out = [sh, ...head(pts[n - 1][0], pts[n - 1][1], pts[n - 2][0], pts[n - 2][1])];
  if (o.both) out.push(...head(pts[0][0], pts[0][1], pts[1][0], pts[1][1]));
  out.shaft = sh; return out;
}
function boxShapes([x, y, w, h, l1, l2], top) {
  const fr = W.rect(x, y, w, h, { w: 8, over: 8 });
  const lab = l2 ? [...W.text(l1, x + w / 2, y + h / 2 - 4, { h: 68, align: 'center' }), ...W.text(l2, x + w / 2, y + h / 2 + 70, { h: 50, align: 'center', color: GREY })]
    : W.text(l1, x + w / 2, top ? y + 100 : y + h / 2 + 34, { h: 68, align: 'center' });
  return [...fr, ...lab];
}
function mapShapes() {
  const m = {};
  for (const k in B) m[k] = boxShapes(B[k], k === 'api' || k === 'pod');
  for (const k in CHIP) { const [x, y, w, h, l] = CHIP[k]; m[k] = [...W.rect(x, y, w, h, { w: 6, over: 5 }), ...W.text(l, x + w / 2, y + h / 2 + 20, { h: 42, align: 'center' })]; }
  m.ctr = [...W.rect(1790, 2290, 460, 140, { w: 6, over: 6 }), ...W.text('container', 2020, 2380, { h: 52, align: 'center' })];
  for (const k in FR) { const [x, y, w, h, l] = FR[k]; m[k] = [...W.rect(x, y, w, h, { w: 5, over: 10, color: GREY, alpha: .7 }), ...W.text(l, x + 40, y + 72, { h: 56, color: GREY })]; }
  for (const k in P) m['a_' + k] = arrowP(P[k], { both: !!BOTH[k] });
  return m;
}
function ghosts() {
  const g = []; let s = 42; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const [t, x, y] of [['x = 4', 1650, 1520], ['ok!', 760, 1980], ['q.2', 2100, 3250], ['f(x)', 700, 520], ['→ 12', 1600, 2980], ['tue', 300, 1900]])
    g.push(...W.text(t, x, y, { h: 50 + R() * 30, color: R() < .3 ? '#8aa0c8' : '#9aa0a8', alpha: .06 + R() * .04, w: 12 }));
  g.push(W.circle(2150, 1700, 90, { w: 12, color: '#9aa0a8', alpha: .05 }));
  return g;
}

// ───────── a film = timeline + camera + magnets + captions
function makeFilm(script) {
  const tl = new W.Timeline();
  const pen = {
    K: new W.Pen('black', INK.black, { park: [VW + 260, VH + 160] }), Bl: new W.Pen('blue', INK.blue, { park: [VW + 300, VH - 200] }),
    R: new W.Pen('red', INK.red, { park: [VW + 200, VH + 260] }), G: new W.Pen('green', INK.green, { park: [VW + 320, VH + 80] }), O: new W.Pen('orange', INK.orange, { park: [VW + 240, VH - 40] }),
  };
  const m = mapShapes(), mags = [], caps = [];
  const a = {
    m, pen, tl,
    draw: (p, shapes, t, by) => tl.draw(p, shapes, t, { by }),
    text: (s, [x, y], o = {}) => W.text(s, x, y, { h: 56, ...o }),
    ring: (k, pad = 30) => { const [x, y, w, h] = B[k] || CHIP[k]; return W.circle(x + w / 2, y + h / 2, w / 2 + pad, { ry: h / 2 + pad, w: 8, lap: .3 }); },
    cross: ([x, y]) => [W.line(x - 34, y - 34, x + 34, y + 34, { w: 9 }), W.line(x + 34, y - 34, x - 34, y + 34, { w: 9 })],
    // the felt eraser passes; each stroke vanishes when the eraser reaches it
    wipe: (strokes, t, dur) => {
      const L = strokes.flat(9); if (!L.length) return;
      const bx = Math.min(...L.map(s => s.box[0])) - 30, by = Math.min(...L.map(s => s.box[1])) - 30, ex = Math.max(...L.map(s => s.box[2])) + 30, ey = Math.max(...L.map(s => s.box[3])) + 30;
      const n = Math.max(1, Math.round((ey - by) / 110));
      tl.erase(W.zigzag(bx, by + 30, ex - bx, Math.max(1, ey - by - 60), n), t, dur, { strength: 0, width: 120 });
      const E = tl.erasers[tl.erasers.length - 1], S = [];
      for (let i = 0; i <= 60; i++) S.push(E.path.at(E.path.len * i / 60));
      for (const s of L) {
        const cx = (s.box[0] + s.box[2]) / 2, cy = (s.box[1] + s.box[3]) / 2; let bi = 0, bd = 1e18;
        S.forEach(([x, y], i) => { const d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; bi = i; } });
        const ht = t + dur * bi / 60; s.hide = tt => tt >= ht;
      }
    },
    blink: (strokes, t0, t1) => strokes.flat(9).forEach(s => { s.hide = t => t > t0 && t < t1 && ((t - t0) * 2.2) % 1 < .45; }),
    // a glossy magnet (the hero) slides along arrow shafts: legs [[arrow, t0, t1, reverse]]
    magnet: (color, legs, o = {}) => mags.push({ color, legs: legs.map(([k, t0, t1, rev]) => ({ s: m['a_' + k].shaft, t0, t1, rev })), until: o.until ?? 1e9, size: o.size ?? 46 }),
    caption: (t, s) => caps.push([t, s]),
  };
  const cam = script(a);
  tl.end();
  const board = new W.Board(tl, { W: BW, H: BH, ghosts: ghosts() });
  board.objs.push({ draw(ctx, t, c) { for (const e of tl.erasers) W.drawEraser(ctx, e, t, c); } });
  board.objs.push({ draw(ctx, t, c) { for (const g of mags) drawMag(ctx, g, t, c); } });
  board.objs.push({ draw(ctx, t, c) { for (const k in pen) { const p = pen[k]; ctx.save(); W.drawMarker(ctx, p, W.penPose(p, t, cam), c, t); ctx.restore(); } } });
  const end = Math.max(cam.k[cam.k.length - 1].t, ...tl.strokes.map(s => s.t1), ...tl.erasers.map(e => e.t1 + .5), ...caps.map(c => c[0] + .6)) + .3;
  return { board, cam, caps, end };
}
const shade = (h, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(h.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
function drawMag(ctx, g, t, c) {
  if (t < g.legs[0].t0 || t > g.until) return;
  let leg = g.legs[0]; for (const L of g.legs) if (t >= L.t0) leg = L;
  const u = leg.t1 > leg.t0 ? Math.max(0, Math.min(1, (t - leg.t0) / (leg.t1 - leg.t0))) : 1, e = u * u * (3 - 2 * u);
  const [x, y] = leg.s.at(leg.s.len * (leg.rev ? 1 - e : e)), lift = leg.t1 > leg.t0 ? Math.sin(Math.PI * u) * .6 : 0;
  const [sx, sy] = W.toScreen(c, x, y), r = g.size * c.z, up = lift * 14 * c.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.filter = `blur(${(5 + lift * 8) * c.z}px)`; ctx.fillStyle = `rgba(30,30,40,${.32 - lift * .1})`; ctx.beginPath(); ctx.arc(sx + 6 * c.z + up * .6, sy + 9 * c.z + up, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  const gr = ctx.createRadialGradient(sx - r * .35, sy - up - r * .4, r * .1, sx, sy - up, r);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(.25, g.color); gr.addColorStop(1, shade(g.color, .55));
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(sx, sy - up, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(1.5, 5 * c.z); ctx.strokeRect(sx - r * .38, sy - up - r * .3, r * .76, r * .6);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(sx - r * .4, sy - up - r * .55, r * .3, r * .14, -.5, 0, Math.PI * 2); ctx.fill();
}

// ───────── home film: git push → running Pod → traffic (~63 s)
function homeFilm(a) {
  const { m, pen: { K, Bl, G, O }, draw } = a;
  const C = [[0, 390, 520, 1.0]];
  a.caption(0.2, '1. You push your Java code to GitHub.');
  draw(K, m.gh, 0.4, 2.4);
  a.magnet(INK.orange, [['gh_act', 2.6, 2.6]], { until: 7.3 });
  a.caption(4.6, '2. GitHub Actions runs mvn package and builds a .jar file.');
  C.push([4.4, 390, 520, 1.0], [6.2, 1100, 520, .9]);
  draw(K, m.act, 5.6, 7.0); draw(Bl, m.a_gh_act, 7.0, 7.6);
  a.magnet(INK.orange, [['gh_act', 7.3, 8.6]], { until: 12.6 });
  a.caption(9.6, '3. docker build makes an image. docker push stores it in the registry.');
  C.push([9.4, 1100, 520, .9], [11.2, 1800, 560, .85]);
  draw(K, m.reg, 10.4, 11.9); draw(Bl, m.a_act_reg, 11.9, 12.5);
  a.magnet(INK.blue, [['act_reg', 12.6, 13.9]], { until: 42.4 });
  a.caption(14.8, '4. helm upgrade sends the YAML to the API server, once. Helm does not watch.');
  C.push([14.6, 1800, 560, .85], [16.6, 1500, 1000, .6]);
  draw(K, m.helm, 15.4, 16.8); draw(K, m.cp, 16.9, 17.8); draw(K, m.api, 17.8, 19.0); draw(Bl, m.a_helm_api, 19.0, 19.7);
  a.magnet('#8a94a6', [['helm_api', 19.8, 21.0]], { until: 21.0, size: 36 });
  a.caption(21.4, '5. The API server stores it in etcd.');
  C.push([21.2, 1500, 1000, .6], [22.6, 1650, 1300, .68]);
  draw(K, m.etcd, 21.8, 23.2); draw(Bl, m.a_api_etcd, 23.2, 23.7);
  a.caption(25.2, '6. The controller manager turns the Deployment into a ReplicaSet, then into Pods.');
  C.push([25, 1650, 1300, .68], [26.6, 900, 1300, .62]);
  draw(K, m.cm, 25.6, 27.0); draw(Bl, m.a_cm_api, 27.0, 27.5);
  draw(K, m.dep, 27.7, 28.6); draw(K, m.rs, 28.9, 29.5); draw(K, m.pchip, 29.8, 30.5);
  a.caption(31.6, '7. The scheduler picks a node for the Pod: node01.');
  C.push([31.4, 900, 1300, .62], [32.8, 1300, 1650, .62]);
  draw(K, m.sched, 32.0, 33.4); draw(Bl, m.a_sched_api, 33.4, 33.9);
  draw(Bl, a.text('Pod → node01', NOTE.sched), 34.1, 35.4);
  a.caption(36.8, '8. The kubelet on node01 tells containerd to pull the image and start the container.');
  C.push([36.6, 1300, 1650, .62], [38.4, 1200, 2250, .5]);
  draw(K, m.node, 37.4, 38.3); draw(K, m.kubelet, 38.3, 39.4); draw(Bl, m.a_api_kubelet, 39.4, 40.0);
  draw(K, m.cri, 40.0, 41.0); draw(Bl, m.a_kubelet_cri, 41.0, 41.3); draw(Bl, m.a_pull, 41.3, 42.3);
  a.magnet(INK.blue, [['pull', 42.4, 44.2]], { until: 44.2 });
  a.caption(45.2, '9. The Pod is Running. The kubelet reports this to the API server.');
  C.push([45, 1200, 2250, .5], [46.4, 1700, 2350, .66]);
  draw(K, m.pod, 45.6, 46.8); draw(Bl, m.a_cri_pod, 46.8, 47.2); draw(K, m.ctr, 47.2, 48.0);
  draw(G, a.text('Running', NOTE.pod, { h: 62, align: 'center' }), 48.2, 49.0);
  a.magnet(INK.green, [['api_kubelet', 49.2, 50.6, true]], { until: 50.6, size: 34 });
  a.caption(51.6, '10. A Service and kube-proxy send user traffic to the Pod.');
  C.push([51.4, 1700, 2350, .66], [52.8, 1250, 2900, .58]);
  draw(K, m.proxy, 52.2, 53.4); draw(K, m.svc, 53.4, 54.5); draw(K, m.user, 54.5, 55.5);
  draw(Bl, [m.a_user_svc, m.a_svc_proxy, m.a_proxy_pod], 55.5, 56.6);
  a.magnet(INK.orange, [['user_svc', 56.8, 57.6], ['svc_proxy', 57.6, 58.4], ['proxy_pod', 58.4, 59.4]], { until: 59.6, size: 32 });
  a.caption(60.2, 'From git push to a running Pod. Every question breaks one box on this map.');
  C.push([60, 1250, 2900, .58], [62.6, 1200, 1710, .395]);
  draw(K, m.you, 60.6, 62.0); draw(O, m.a_you_api, 62.0, 62.8);
  return new W.Camera(C);
}

// ───────── shorts: the map is already on the board; red = broken, orange = your fix, green = fixed
function preDraw(a) {
  const { m, pen: { K, Bl } } = a, blk = [], blu = [];
  for (const k in m) { if (k === 'a_you_api' || k === 'a_ssh') continue; (k.startsWith('a_') ? blu : blk).push(m[k]); }
  a.draw(K, blk, -40, -20); a.draw(Bl, blu, -19, -10);
}
const CAM0 = [[0, 1200, 1710, .395], [1.2, 1200, 1800, .45]];
const SHORTS = {
  1: { cap: 'The wrong image name is in the Deployment, and the Deployment lives in the API server. kubectl talks to the API server, so k set image fixes it from where you are.',
    run(a) { const { pen: { R, O, G }, draw } = a;
      const r1 = a.ring('dep'), n1 = a.text('image: not found', NOTE.api, { h: 52, align: 'center' }), x1 = a.cross(NOTE.pull), n2 = a.text('ImagePullBackOff', NOTE.pod, { h: 44, align: 'center' });
      draw(R, r1, 1.2, 1.8); draw(R, n1, 1.8, 2.6); draw(R, x1, 2.7, 3.0); draw(R, n2, 3.1, 3.9);
      draw(O, a.m.a_you_api, 4.4, 5.2); draw(O, a.text('k set image', NOTE.fix, { h: 52 }), 5.2, 5.9);
      a.wipe([r1, n1], 6.1, .5); a.wipe([x1], 6.6, .3); a.wipe([n2], 6.9, .4);
      draw(G, a.text('image: nginx:1.27', NOTE.api, { h: 50, align: 'center' }), 6.7, 7.4); a.magnet(INK.blue, [['pull', 7.4, 8.4]], { until: 8.4, size: 36 });
      draw(G, a.text('Running ✓', NOTE.pod, { h: 56, align: 'center' }), 8.4, 9.1); } },
  2: { cap: 'A Deployment lives in the API server. kubectl talks to the API server, so k edit fixes it from where you are.',
    run(a) { const { pen: { R, O, G }, draw } = a;
      const r1 = a.ring('dep'), n1 = a.text('command: exit 1', NOTE.api, { h: 52, align: 'center' }), n2 = a.text('CrashLoopBackOff', NOTE.pod, { h: 44, align: 'center' });
      draw(R, r1, 1.2, 1.8); draw(R, n1, 1.8, 2.6); draw(R, n2, 2.8, 3.6); a.blink(a.m.ctr, 1.4, 4.6);
      draw(O, a.m.a_you_api, 4.4, 5.2); draw(O, a.text('k edit', NOTE.fix, { h: 52 }), 5.2, 5.7);
      a.wipe([r1, n1], 6.0, .5); a.wipe([n2], 6.6, .4);
      draw(G, a.text('command: sleep 3600', NOTE.api, { h: 46, align: 'center' }), 6.6, 7.4); a.magnet(INK.green, [['api_kubelet', 7.4, 8.3]], { until: 8.3, size: 34 });
      draw(G, a.text('Running ✓', NOTE.pod, { h: 56, align: 'center' }), 8.3, 9.0); } },
  3: { cap: 'The scheduler finds no node with enough free CPU for this request. The request is in the Deployment in the API server, so kubectl fixes it.',
    run(a) { const { pen: { R, O, G }, draw } = a;
      const r1 = a.ring('dep'), n1 = a.text('cpu request: 100', NOTE.api, { h: 50, align: 'center' }), n2 = a.text('no node fits', NOTE.sched, { h: 54 }), n3 = a.text('Pending', NOTE.pod, { h: 56, align: 'center' });
      draw(R, r1, 1.2, 1.8); draw(R, n1, 1.8, 2.6); draw(R, n2, 2.7, 3.4); draw(R, n3, 3.5, 4.1);
      draw(O, a.m.a_you_api, 4.5, 5.3); draw(O, a.text('k set resources', NOTE.fix, { h: 50 }), 5.3, 6.1);
      a.wipe([r1, n1], 6.2, .5); a.wipe([n2], 6.7, .3); a.wipe([n3], 7.0, .3);
      draw(G, a.text('cpu request: 100m', NOTE.api, { h: 48, align: 'center' }), 6.8, 7.5); draw(G, a.text('→ node01 ✓', NOTE.sched, { h: 54 }), 7.5, 8.1);
      draw(G, a.text('Running ✓', NOTE.pod, { h: 56, align: 'center' }), 8.3, 9.0); } },
  4: { cap: 'The kubelet is a Linux service on node01, not a Kubernetes object. kubectl can\'t start it, so you ssh to the node.',
    run(a) { const { pen: { R, O, G }, draw } = a;
      const r1 = a.ring('kubelet', 26), n1 = a.text('stopped', NOTE.kubelet), n2 = a.text('NotReady', NOTE.status), x1 = a.cross([430, 1760]);
      draw(R, r1, 1.2, 1.9); draw(R, n1, 1.9, 2.5); draw(R, n2, 2.6, 3.2); draw(R, x1, 3.3, 3.6);
      draw(O, a.m.a_ssh, 4.2, 5.2); draw(O, a.text('ssh node01', NOTE.ssh, { h: 52 }), 5.2, 5.9); draw(O, a.text('systemctl enable --now kubelet', NOTE.kubelet2, { h: 40 }), 5.9, 6.9);
      a.wipe([r1, n1], 7.0, .5); a.wipe([x1], 7.5, .25); a.wipe([n2], 7.75, .3);
      draw(G, a.text('active ✓', NOTE.kubelet), 7.6, 8.2); a.magnet(INK.green, [['api_kubelet', 8.0, 8.9, true]], { until: 8.9, size: 32 });
      draw(G, a.text('Ready ✓', NOTE.status), 8.9, 9.5); } },
  5: { cap: 'The kubelet can\'t start: its systemd file on node01 points to a wrong path. That file is on the node, not in Kubernetes, so you ssh there to fix it.',
    run(a) { const { pen: { R, O, G }, draw } = a;
      const r1 = a.ring('kubelet', 26), n1 = a.text('10-kubeadm.conf:', NOTE.kubelet, { h: 46 }), n1b = a.text('wrong path', NOTE.kubelet2, { h: 46 }), n2 = a.text('NotReady', NOTE.status);
      draw(R, r1, 1.2, 1.9); draw(R, [n1, n1b], 1.9, 3.0); draw(R, n2, 3.1, 3.7);
      draw(O, a.m.a_ssh, 4.2, 5.2); draw(O, a.text('ssh node01', NOTE.ssh, { h: 52 }), 5.2, 5.9);
      a.wipe([r1, n1, n1b], 6.1, .6); a.wipe([n2], 6.7, .3);
      draw(G, a.text('path fixed ✓', NOTE.kubelet, { h: 50 }), 6.8, 7.5); draw(G, a.text('daemon-reload, restart', NOTE.kubelet2, { h: 40 }), 7.5, 8.3);
      a.magnet(INK.green, [['api_kubelet', 8.3, 9.1, true]], { until: 9.1, size: 32 });
      draw(G, a.text('Ready ✓', NOTE.status), 9.1, 9.7); } },
};
const shortFilm = n => a => { preDraw(a); SHORTS[n].run(a); a.caption(2.4, SHORTS[n].cap); return new W.Camera(CAM0); };

// ───────── mounting
async function build(host, kind) {
  host.classList.add('motion', kind === 'home' ? 'mhome' : 'mshort');
  host.innerHTML = `<div class="mwrap"><canvas width="${VW}" height="${VH}" aria-hidden="true"></canvas></div><p class="mcap" aria-live="polite"></p><div class="mbar"><button type="button" class="btn ghost mrep" hidden>↻ Replay</button></div>`;
  await font();
  const F = makeFilm(kind === 'home' ? homeFilm : shortFilm(kind));
  const cv = host.querySelector('canvas'), ctx = cv.getContext('2d'), cap = host.querySelector('.mcap'), rep = host.querySelector('.mrep');
  let raf = 0;
  const showCap = t => {
    let c = null; for (const x of F.caps) if (t >= x[0]) c = x;
    if (!c) { cap.style.opacity = 0; return; }
    if (cap.dataset.s !== c[1]) { cap.dataset.s = c[1]; cap.textContent = c[1]; }
    cap.style.opacity = Math.min(1, (t - c[0]) / .5);
  };
  const frame = t => { F.board.render(ctx, t, F.cam); showCap(t); };
  const play = () => {
    cancelAnimationFrame(raf); rep.hidden = true; const t0 = performance.now();
    const tick = now => { if (!host.isConnected) return; const t = (now - t0) / 1000; frame(Math.min(t, F.end)); if (t < F.end) raf = requestAnimationFrame(tick); else rep.hidden = false; };
    raf = requestAnimationFrame(tick);
  };
  rep.onclick = play;
  if (reduce()) { frame(F.end); return; }
  frame(0);
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .4 });
  io.observe(host);
  host._seek = t => { cancelAnimationFrame(raf); frame(Math.min(t, F.end)); };   // for screenshots
}
function scan(root) {
  root.querySelectorAll('[data-motion]:not(.motion)').forEach(h => {
    const k = h.dataset.motion;
    if (k === 'home' || SHORTS[k]) build(h, k).catch(e => { console.warn('motion', e); h.remove(); });
    else h.remove();
  });
}
const app = document.getElementById('app');
if (app) { scan(app); new MutationObserver(() => scan(app)).observe(app, { childList: true }); }
