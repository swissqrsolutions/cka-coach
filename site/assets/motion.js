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
function makeFilm(script, bh = BH) {
  const tl = new W.Timeline();
  const pen = {
    K: new W.Pen('black', INK.black, { park: [VW + 260, VH + 160] }), Bl: new W.Pen('blue', INK.blue, { park: [VW + 300, VH - 200] }),
    R: new W.Pen('red', INK.red, { park: [VW + 200, VH + 260] }), G: new W.Pen('green', INK.green, { park: [VW + 320, VH + 80] }), O: new W.Pen('orange', INK.orange, { park: [VW + 240, VH - 40] }),
  };
  const m = mapShapes(), mags = [], caps = [], overlays = [], terms = [];
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
    magnet: (color, legs, o = {}) => mags.push({ color, legs: legs.map(([k, t0, t1, rev]) => ({ s: typeof k === 'string' ? m['a_' + k].shaft : k, t0, t1, rev })), until: o.until ?? 1e9, size: o.size ?? 46 }),
    caption: (t, s) => caps.push([t, s]),
    overlay: f => overlays.push(f), term: (t, lines) => terms.push({ t, lines }),
  };
  const cam = script(a);
  tl.end();
  const board = new W.Board(tl, { W: BW, H: bh, ghosts: ghosts() });
  for (const f of overlays) board.overlays.push({ draw: f });
  board.objs.push({ draw(ctx, t, c) { for (const e of tl.erasers) W.drawEraser(ctx, e, t, c); } });
  board.objs.push({ draw(ctx, t, c) { for (const g of mags) drawMag(ctx, g, t, c); } });
  board.objs.push({ draw(ctx, t, c) { for (const k in pen) { const p = pen[k]; ctx.save(); W.drawMarker(ctx, p, W.penPose(p, t, cam), c, t); ctx.restore(); } } });
  const end = Math.max(cam.k[cam.k.length - 1].t, ...tl.strokes.map(s => s.t1), ...tl.erasers.map(e => e.t1 + .5), ...caps.map(c => c[0] + .6)) + .3;
  return { board, cam, caps, end, terms };
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

// ───────── shorts: the map is already on the board; red = broken, orange = your fix, green = fixed
function preDraw(a) {
  const { m, pen: { K, Bl } } = a, blk = [], blu = [];
  for (const k in m) { if (k === 'a_you_api' || k === 'a_ssh') continue; (k.startsWith('a_') ? blu : blk).push(m[k]); }
  a.draw(K, blk, -40, -20); a.draw(Bl, blu, -19, -10);
}
const CAM0 = [[0, 1200, 1710, .395], [1.2, 1200, 1800, .45]];
const SHORTS = {
  1: { long: true, audio: 'media/q1.mp3', json: 'media/q1film.json', film: genFilm },
  2: { long: true, audio: 'media/q2.mp3', json: 'media/q2film.json', film: genFilm },
  3: { long: true, audio: 'media/q3.mp3', json: 'media/q3film.json', film: genFilm },
  4: { long: true, audio: 'media/q4.mp3', json: 'media/q4film.json', film: q4Film },
  5: { long: true, audio: 'media/q5.mp3', json: 'media/q5film.json', film: genFilm },
  6: { long: true, audio: 'media/q6.mp3', json: 'media/q6film.json', film: genFilm },
  7: { long: true, audio: 'media/q7.mp3', json: 'media/q7film.json', film: genFilm },
  9: { long: true, audio: 'media/q9.mp3', json: 'media/q9film.json', film: genFilm },
  10: { long: true, audio: 'media/q10.mp3', json: 'media/q10film.json', film: genFilm },
  11: { long: true, audio: 'media/q11.mp3', json: 'media/q11film.json', film: genFilm },
  12: { long: true, audio: 'media/q12.mp3', json: 'media/q12film.json', film: genFilm },
  14: { long: true, audio: 'media/q14.mp3', json: 'media/q14film.json', film: genFilm },
  16: { long: true, audio: 'media/q16.mp3', json: 'media/q16film.json', film: genFilm },
  8: { long: true, audio: 'media/q8.mp3', json: 'media/q8film.json', film: genFilm },
  13: { long: true, audio: 'media/q13.mp3', json: 'media/q13film.json', film: genFilm },
  15: { long: true, audio: 'media/q15.mp3', json: 'media/q15film.json', film: genFilm },
  20: { long: true, audio: 'media/q20.mp3', json: 'media/q20film.json', film: genFilm },
  21: { long: true, audio: 'media/q21.mp3', json: 'media/q21film.json', film: genFilm },
  23: { long: true, audio: 'media/q23.mp3', json: 'media/q23film.json', film: genFilm },
  25: { long: true, audio: 'media/q25.mp3', json: 'media/q25film.json', film: genFilm },
  26: { long: true, audio: 'media/q26.mp3', json: 'media/q26film.json', film: genFilm },
  31: { long: true, audio: 'media/q31.mp3', json: 'media/q31film.json', film: genFilm },
  36: { long: true, audio: 'media/q36.mp3', json: 'media/q36film.json', film: genFilm },
  40: { long: true, audio: 'media/q40.mp3', json: 'media/q40film.json', film: genFilm },
  17: { long: true, audio: 'media/q17.mp3', json: 'media/q17film.json', film: genFilm },
  18: { long: true, audio: 'media/q18.mp3', json: 'media/q18film.json', film: genFilm },
  19: { long: true, audio: 'media/q19.mp3', json: 'media/q19film.json', film: genFilm },
  22: { long: true, audio: 'media/q22.mp3', json: 'media/q22film.json', film: genFilm },
  24: { long: true, audio: 'media/q24.mp3', json: 'media/q24film.json', film: genFilm },
  27: { long: true, audio: 'media/q27.mp3', json: 'media/q27film.json', film: genFilm },
  28: { long: true, audio: 'media/q28.mp3', json: 'media/q28film.json', film: genFilm },
  29: { long: true, audio: 'media/q29.mp3', json: 'media/q29film.json', film: genFilm },
};

// ───────── Q4, explained slowly (layout v4): two computers side by side, You outside both; one focus at a time
const L4 = { goal: [1100, 80, 960, 260], cp: [40, 420, 960, 1300], node: [1100, 420, 960, 1300], api: [110, 560, 820, 420], dep: [230, 770, 580, 170],
  kubelet: [1170, 560, 820, 250], pod: [1290, 1180, 580, 320], you: [110, 1880, 640, 300], WIDE: [40, 80, 2020, 2100] };
const WIDE_Z = Math.min(VW / (L4.WIDE[2] * 1.24), VH / (L4.WIDE[3] * 1.24));
function fit4(k) {
  const [x, y, w, h] = L4[k] || L4.WIDE, mw = w * 1.24, mh = h * 1.24;
  return [x + w / 2, y + h / 2, Math.max(WIDE_Z, Math.min(WIDE_Z * 2, VW / mw, VH / mh))];
}
function q4Film(a, J) {
  const rec = [], draw = (pen, shapes, t0, t1) => { rec.push(shapes); a.draw(pen, shapes, t0, t1); };   // remember what each sentence writes
  const { pen: { K, Bl, R, G, O } } = a, T = (s, xy, o) => a.text(s, xy, { h: 70, ...o }), P = J.phrases, at = id => P.find(p => p.id === id).t;
  const GREY = '#6b7280';
  const frame = (k, label) => { const [x, y, w, h] = L4[k]; return [...W.rect(x, y, w, h, { w: 5, over: 10, color: GREY, alpha: .75 }), ...W.text(label, x + 40, y + 95, { h: 84, color: GREY })]; };
  const box = (k, label, sub, hh = 100) => { const [x, y, w, h] = L4[k]; const t = sub ? [...W.text(label, x + w / 2, y + h / 2 - 4, { h: hh, align: 'center' }), ...W.text(sub, x + w / 2, y + h / 2 + 84, { h: 64, align: 'center', color: GREY })] : W.text(label, x + w / 2, y + 140, { h: hh, align: 'center' }); return [...W.rect(x, y, w, h, { w: 8, over: 8 }), ...t]; };
  const arrow = (pts, o) => arrowP(pts, { w: 9, ...o });
  const SH = {
    goal: [...W.rect(...L4.goal, { w: 6, over: 6 }), ...W.text('Goal: Ready', 1180, 190, { h: 76 }), ...W.text('and survives reboot', 1180, 300, { h: 76 })],
    node: frame('node', 'node01'), cp: frame('cp', 'control plane'),
    pod: [...W.rect(...L4.pod, { w: 8, over: 8 }), ...W.text('Pod', 1580, 1290, { h: 90, align: 'center' }), ...W.rect(1390, 1340, 380, 120, { w: 6, over: 5 }), ...W.text('app', 1580, 1425, { h: 64, align: 'center' })],
    kubelet: box('kubelet', 'kubelet'), api: [...W.rect(...L4.api, { w: 8, over: 8 }), ...W.text('API server', 520, 690, { h: 100, align: 'center' })],
    dep: [...W.rect(...L4.dep, { w: 6, over: 5 }), ...W.text('Deployment', 520, 880, { h: 66, align: 'center' })],
    you: box('you', 'You', 'kubectl'),
    a_kp: arrow([[1580, 810], [1580, 1180]]), a_ya: arrow([[430, 1880], [430, 985]]), a_hb: arrow([[1170, 690], [935, 690]]),
    a_yk: W.dashed([[750, 1960], [1250, 815]], { w: 7, dash: 50, gap: 34 }), a_ssh: arrow([[750, 2060], [1580, 2060], [1580, 1725]]),
  };
  const PEN = { a_ya: O, a_ssh: O, a_hb: Bl, a_kp: Bl, goal: O };
  const N = {};   // notes we may wipe later
  const beats = (t0, t1) => { for (let t = t0; t < t1 - 1; t += 2.2) a.magnet(INK.green, [[SH.a_hb.shaft, t, t + 1.6]], { until: t + 1.6, size: 34 }); };
  const ring = () => W.circle(1580, 685, 470, { ry: 175, w: 9, lap: .3 });
  const flashes = [], pins = [];
  const ACT = {
    pin: t => pins.push({ t, from: [430, 1860], to: [430, 1860], d: .01 }),
    kubectl: t => draw(O, N.kc = T('kubectl', [470, 1460], { h: 84 }), t + 1.2, t + 2.2),
    beat: t => beats(t + 1.0, at('s15') + .3),
    hbword: t => draw(G, N.hb = T('heartbeat', [1050, 790], { h: 54, align: 'center' }), t + .4, t + 1.4),
    ready0: t => draw(G, N.rd = T('Ready', [1620, 515], { h: 84 }), t + .5, t + 1.3),
    stop: t => { draw(R, N.ring = ring(), t + 1.4, t + 2.3); draw(R, N.st = T('stopped', [1170, 960], { h: 76 }), t + 2.4, t + 3.2); },
    flat: t => draw(R, N.x = a.cross([1050, 690]), t + 1.4, t + 1.9),
    notready: t => { flashes.push([t + 1.2, 'cp']); a.wipe([N.rd], t + 2.4, .4); draw(R, N.nr = T('NotReady', [1620, 515], { h: 84 }), t + 2.9, t + 3.8); },
    nopods: t => { draw(R, N.np = T('no new pods', [1125, 1640], { h: 62 }), t + 2.4, t + 3.4); draw(R, N.na = [...arrow([[2045, 1340], [1880, 1340]]), ...a.cross([1962, 1340])], t + 3.5, t + 4.2); },
    pulse: t => a.blink([N.ring], t + .2, t + 1.6),
    pulseya: t => a.blink([SH.a_ya, N.kc], t + .2, t + 2.0),
    nokubectl: t => draw(R, N.yx = a.cross([1000, 1385]), t + 1.8, t + 2.3),
    program: t => draw(R, N.pg = T('a Linux program on node01', [1170, 1085], { h: 54 }), t + .8, t + 2.4),
    pinin: t => pins.push({ t: t + 1.6, path: SH.a_ssh.shaft, d: 2.2 }),
    inactive: t => { a.wipe([N.st], t + .1, .4); draw(R, N.ia = T('inactive', [1170, 960], { h: 76 }), t + .6, t + 1.4); },
    disabled: t => { a.wipe([N.pg], t + .1, .4); draw(R, N.di = T('disabled', [1170, 1085], { h: 76 }), t + .6, t + 1.4); a.blink(SH.goal.slice(-14), t + 1.2, t + 3.2); },
    fixcmd: t => draw(O, N.fx = T('enable --now kubelet', [1300, 1160], { h: 50 }), t + 3.0, t + 4.4),
    fixed: t => { a.wipe([N.ring, N.ia], t + 2.6, .5); a.wipe([N.di, N.fx], t + 3.1, .5); draw(G, N.ok = T('active, enabled ✓', [1170, 960], { h: 64 }), t + 3.7, t + 4.7); },
    beat2: t => { a.wipe([N.x], t + .2, .3); beats(t + .8, at('s37')); },
    pinout: t => pins.push({ t: t + 2.0, path: SH.a_ssh.shaft, d: 2.6, back: true }),
    ready: t => { a.wipe([N.nr], t + 2.4, .4); a.wipe([N.np, N.na], t + 2.8, .4); draw(G, T('Ready ✓', [1620, 515], { h: 84 }), t + 3.2, t + 4.0); draw(G, T('✓', [1950, 250], { h: 140 }), t + 4.2, t + 4.7); },
  };
  const keys = [[0, ...fit4('WIDE')]]; let cam = fit4('WIDE'); const spots = [];
  // a shot must contain the part being talked about AND everything the marker writes during that sentence
  const fitBox = (keys, strokes) => {
    const R0 = keys.map(k => { const [x, y, w, h] = L4[k]; return [x, y, x + w, y + h]; });
    for (const st of strokes.flat(9)) if (st && st.box) R0.push(st.box);
    if (!R0.length) return null;
    const x0 = Math.min(...R0.map(r => r[0])), y0 = Math.min(...R0.map(r => r[1])), x1 = Math.max(...R0.map(r => r[2])), y1 = Math.max(...R0.map(r => r[3]));
    const w = (x1 - x0) * 1.24 + 80, h = (y1 - y0) * 1.24 + 80;
    return [(x0 + x1) / 2, (y0 + y1) / 2, Math.max(WIDE_Z, Math.min(WIDE_Z * 2, VW / w, VH / h))];
  };
  for (const ph of P) {
    const t = ph.t, r0 = rec.length;
    (ph.draw || []).forEach((k, i) => { const n = ph.draw.length, d = Math.min(1.6, 3 / n); draw(PEN[k] || K, SH[k], t + .3 + i * d, t + .3 + (i + 1) * d - .1); });
    if (ph.act && ACT[ph.act]) ACT[ph.act](t);
    a.caption(t, ph.cap);
    const wrote = rec.slice(r0);
    if (ph.focus !== 'TERM' || wrote.length) {
      const next = ph.focus === 'WIDE' ? fit4('WIDE') : fitBox(ph.focus !== 'TERM' && L4[ph.focus] ? [ph.focus] : ['node'], wrote) || cam;
      keys.push([t, ...cam], [t + .7, ...next]); cam = next;
    }
    spots.push({ t, k: ph.focus && L4[ph.focus] && ph.focus !== 'WIDE' ? ph.focus : null });
  }
  keys.push([J.end, ...cam]);
  // strong dimming: what is not being talked about fades to grey; the lit part gets a soft halo
  a.overlay((ctx, t, c) => {
    let sp = null; for (const x of spots) if (t >= x.t) sp = x;
    const fl = flashes.find(([ft]) => t >= ft && t < ft + 1.0), k = fl ? fl[1] : sp && sp.k; if (!k) return;
    const al = fl ? .55 * Math.sin(Math.PI * (t - fl[0])) : Math.min(1, (t - sp.t - .2) / .5) * .7; if (al <= 0) return;
    const [x, y, w, h] = L4[k], [ax, ay] = W.toScreen(c, x - 40, y - 40), [bx, by] = W.toScreen(c, x + w + 40, y + h + 40);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.roundRect(ax, ay, bx - ax, by - ay, 30);
    ctx.fillStyle = `rgba(240,240,238,${al})`; ctx.fill('evenodd');
    ctx.beginPath(); ctx.roundRect(ax, ay, bx - ax, by - ay, 30); ctx.lineWidth = 10; ctx.strokeStyle = `rgba(47,111,222,${al * .45})`; ctx.stroke();
  });
  // the "You are here" pin: starts at You, follows the ssh arrow into node01, and back after the two exits
  a.overlay((ctx, t, c) => {
    let pos = null;
    for (const p of pins) { if (t < p.t) break; if (!p.path) { pos = p.to; continue; } const u = Math.min(1, (t - p.t) / p.d), e = u * u * (3 - 2 * u); pos = p.path.at(p.path.len * (p.back ? 1 - e : e)); }
    if (pos) W.drawPinMagnet(ctx, pos[0], pos[1] - 20, c, { size: 150 });
  });
  return new W.Camera(keys);
}

// ───────── the general teaching film (Q1, Q2, Q3, Q5): a script in media/qNfilm.json drives the board, the camera, the terminal and the questions
const L5base = { goal: [1100, 80, 960, 260], reg: [40, 80, 960, 260], cp: [40, 420, 960, 1300], api: [110, 560, 820, 420], dep: [230, 770, 580, 170], sched: [110, 1300, 820, 200],
  node: [1100, 420, 960, 1300], kubelet: [1170, 560, 820, 250], cri: [1170, 880, 820, 170], conf: [1170, 880, 820, 170], pod: [1290, 1180, 580, 320], you: [110, 1880, 640, 300],
  cmdnote: [130, 1020, 790, 90], WIDE: [40, 80, 2020, 2100] };
function genFilm(a, J) {
  const GREY = '#6b7280', rec = [], L5 = { ...L5base, ...(J.wide ? { WIDE: J.wide } : {}) };
  for (const [k, sp] of Object.entries(J.shapes || {})) if (sp.rect) L5[k] = sp.rect;
  const { pen: { K, Bl, R, G, O } } = a, PENS = { K, B: Bl, R, G, O }, COL = { K: INK.black, B: INK.blue, R: INK.red, G: INK.green, O: INK.orange };
  const draw = (pen, shapes, t0, t1) => { rec.push(shapes); a.draw(pen, shapes, t0, t1); };
  const frame = (k, label) => { const [x, y, w, h] = L5[k]; return [...W.rect(x, y, w, h, { w: 5, over: 10, color: GREY, alpha: .75 }), ...W.text(label, x + 40, y + 95, { h: Math.min(84, w * .6 / Math.max(1, label.length) / .52), color: GREY })]; };
  const fitT = (str, x, y, h, maxW, o = {}) => { let t = W.text(str, x, y, { h, ...o }); if (t.width > maxW) t = W.text(str, x, y, { h: h * maxW / t.width, ...o }); return t; };
  const box = (k, label, sub, hh = 100) => { const [x, y, w, h] = L5[k]; const t = sub ? [...fitT(label, x + w / 2, y + h / 2 - 4, hh, w * .88, { align: 'center' }), ...fitT(sub, x + w / 2, y + h / 2 + 78, sub.length > 24 ? 46 : 60, w * .9, { align: 'center', color: GREY })] : fitT(label, x + w / 2, y + h / 2 + hh * .4, hh, w * .88, { align: 'center' }); return [...W.rect(x, y, w, h, { w: 8, over: 8 }), ...t]; };
  const arrow = (pts, o) => arrowP(pts, { w: 9, ...o });
  const SH = {
    goal: [...W.rect(...L5.goal, { w: 6, over: 6 }), ...W.text(J.goal[0], 1180, 190, { h: 72 }), ...W.text(J.goal[1], 1180, 295, { h: 72 })],
    reg: box('reg', 'Registry', 'images, e.g. Docker Hub', 90), cp: frame('cp', 'control plane'), node: frame('node', 'node01'),
    api: [...W.rect(...L5.api, { w: 8, over: 8 }), ...W.text('API server', 520, 690, { h: 100, align: 'center' })],
    dep: [...W.rect(...L5.dep, { w: 6, over: 5 }), ...W.text('Deployment', 520, 880, { h: 66, align: 'center' })],
    sched: box('sched', 'scheduler', null, 90), kubelet: box('kubelet', 'kubelet'), cri: box('cri', 'containerd', null, 84), conf: box('conf', '10-kubeadm.conf', null, 66),
    pod: [...W.rect(...L5.pod, { w: 8, over: 8 }), ...W.text('Pod', 1580, 1290, { h: 90, align: 'center' }), ...W.rect(1390, 1340, 380, 120, { w: 6, over: 5 }), ...W.text('app', 1580, 1425, { h: 64, align: 'center' })],
    you: box('you', 'You', 'kubectl'),
    a_kp: arrow([[1580, 810], [1580, 1180]]), a_ya: arrow([[430, 1880], [430, 985]]), a_hb: arrow([[1170, 690], [935, 690]]), a_ssh: arrow([[750, 2060], [1580, 2060], [1580, 1725]]),
    a_ak: arrow([[935, 620], [1170, 620]]), a_kc: arrow([[1580, 810], [1580, 880]]), a_cp: arrow([[1580, 1050], [1580, 1180]]),
    a_reg: arrow([[1000, 210], [1050, 210], [1050, 965], [1170, 965]]), a_sa: arrow([[850, 1300], [850, 985]], { both: true }), a_sn: arrow([[930, 1400], [1290, 1340]]),
  };
  for (const [k, sp] of Object.entries(J.shapes || {})) {
    if (sp.arrow) { SH[k] = sp.dashed ? W.dashed(sp.arrow, { w: 7, dash: 50, gap: 34 }) : arrow(sp.arrow, { both: !!sp.both }); if (sp.dashed) SH[k].shaft = W.poly(sp.arrow.flat(), { w: 1 }); }
    else if (sp.frame) SH[k] = frame(k, sp.label);
    else if (sp.rect) SH[k] = box(k, sp.label, sp.sub, sp.h || 90);
  }
  const PEN = { a_ya: O, a_ssh: O, goal: O, reg: K, ...Object.fromEntries(Object.entries(J.shapes || {}).filter(([, sp]) => sp.pen).map(([k, sp]) => [k, { O, R, G, B: Bl, K }[sp.pen]])) };
  const N = {}, pins = [], spots = [];
  const ring = k => { const [x, y, w, h] = L5[k]; return W.circle(x + w / 2, y + h / 2, w / 2 + 50, { ry: h / 2 + 60, w: 9, lap: .3 }); };
  const parts = id => N[id] || SH[id];
  const DO = (t, x) => {
    const at = t + (x.a || 0);
    if (x.t !== undefined) draw(PENS[x.c] || R, N[x.id] = a.text(x.t, [x.x, x.y], { h: x.h, align: x.align || undefined }), at, at + Math.min(1.6, .25 + x.t.length * .05));
    else if (x.ring) draw(PENS[x.c] || R, N[x.id] = ring(x.ring), at, at + .8);
    else if (x.cross) draw(PENS[x.c] || R, N[x.id] = a.cross(x.cross), at, at + .5);
    else if (x.wipe) a.wipe(x.wipe.map(parts).filter(Boolean), at, .5);
    else if (x.dots) for (let i = 0; i < (x.n || 1); i++) a.magnet(COL[x.color] || INK.green, [[SH[x.dots].shaft, at + i * 2.1, at + i * 2.1 + 1.6, x.back]], { until: at + i * 2.1 + 1.6, size: 34 });
    else if (x.blink) a.blink(x.blink.map(parts).filter(Boolean), at, at + (x.d || 2));
    else if (x.pin) pins.push(x.pin === 'show' ? { t: at, to: [430, 1860] } : { t: at, path: SH.a_ssh.shaft, d: 2.4, back: x.pin === 'out' });
  };
  const fitBox = (keys, strokes) => {
    const R0 = keys.map(k => { const [x, y, w, h] = L5[k]; return [x, y, x + w, y + h]; });
    for (const st of strokes.flat(9)) if (st && st.box) R0.push(st.box);
    if (!R0.length) return null;
    const x0 = Math.min(...R0.map(r => r[0])), y0 = Math.min(...R0.map(r => r[1])), x1 = Math.max(...R0.map(r => r[2])), y1 = Math.max(...R0.map(r => r[3]));
    const wz = Math.min(VW / (L5.WIDE[2] * 1.24), VH / (L5.WIDE[3] * 1.24));
    return [(x0 + x1) / 2, (y0 + y1) / 2, Math.max(wz, Math.min(wz * 2, VW / ((x1 - x0) * 1.24 + 80), VH / ((y1 - y0) * 1.24 + 80)))];
  };
  let cam = fitBox(['WIDE'], []); const keys = [[0, ...cam]];
  for (const ph of J.phrases) {
    const t = ph.t, r0 = rec.length;
    ph.draw.forEach((k, i) => { const n = ph.draw.length, d = Math.min(1.6, 3 / n); draw(PEN[k] || (k.startsWith('a_') ? Bl : K), SH[k], t + .3 + i * d, t + .3 + (i + 1) * d - .1); });
    ph.acts.forEach(x => DO(t, x));
    a.caption(t, ph.cap);
    const wrote = rec.slice(r0);
    if (ph.focus !== 'TERM' || wrote.length) {
      let next;
      if (ph.focus === 'WIDE') next = fitBox(['WIDE'], []);
      else if (ph.focus === 'TERM') { const xs = wrote.flat(9).filter(st => st && st.box).map(st => st.box[0]); next = fitBox([xs.length && Math.min(...xs) > 1050 ? 'node' : 'cp'], wrote); }
      else next = fitBox([ph.focus], wrote);
      if (next) { keys.push([t, ...cam], [t + .7, ...next]); cam = next; }
    }
    spots.push({ t, k: L5[ph.focus] && !['WIDE', 'TERM'].includes(ph.focus) ? ph.focus : null });
  }
  keys.push([J.end, ...cam]);
  a.overlay((ctx, t, c) => {
    let sp = null; for (const x of spots) if (t >= x.t) sp = x;
    if (!sp || !sp.k) return; const al = Math.min(1, (t - sp.t - .2) / .5) * .7; if (al <= 0) return;
    const [x, y, w, h] = L5[sp.k], [ax, ay] = W.toScreen(c, x - 40, y - 40), [bx, by] = W.toScreen(c, x + w + 40, y + h + 40);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.roundRect(ax, ay, bx - ax, by - ay, 30);
    ctx.fillStyle = `rgba(240,240,238,${al})`; ctx.fill('evenodd');
    ctx.beginPath(); ctx.roundRect(ax, ay, bx - ax, by - ay, 30); ctx.lineWidth = 10; ctx.strokeStyle = `rgba(47,111,222,${al * .45})`; ctx.stroke();
  });
  a.overlay((ctx, t, c) => {
    let pos = null;
    for (const p of pins) { if (t < p.t) break; if (!p.path) { pos = p.to; continue; } const u = Math.min(1, (t - p.t) / p.d), e = u * u * (3 - 2 * u); pos = p.path.at(p.path.len * (p.back ? 1 - e : e)); }
    if (pos) W.drawPinMagnet(ctx, pos[0], pos[1] - 20, c, { size: 150 });
  });
  return new W.Camera(keys);
}
const shortFilm = n => a => { const S = SHORTS[n]; if (S.film) return S.film(a, S._J); preDraw(a); S.run(a);
  if (S.long) { S.lines.forEach(([t, l]) => a.caption(t, l)); return new W.Camera(S.cam); }
  a.caption(2.4, S.cap); return new W.Camera(CAM0); };

// ───────── mounting: a small player (play/pause, seek, time, sound, full screen)
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
async function build(host, kind) {
  const S = SHORTS[kind];
  host.classList.add('motion', 'mshort'); if (S.long) host.classList.add('mlong');
  host.innerHTML = `<div class="mwrap"><canvas width="${VW}" height="${VH}" aria-hidden="true"></canvas><button type="button" class="mbig" aria-label="Play">▶</button></div>
    <div class="mctl"><button type="button" class="mpp" aria-label="Play or pause">▶</button><input class="mseek" type="range" min="0" max="1000" value="0" aria-label="Position"><span class="mtime">0:00</span></div>
    <div class="mctl mctl2"><button type="button" class="mback" aria-label="Back 10 seconds">⟲ 10</button><button type="button" class="mfwd" aria-label="Forward 10 seconds">10 ⟳</button><button type="button" class="mspd" aria-label="Speed">1×</button><span class="mvolbox" hidden><button type="button" class="msnd" aria-label="Sound on or off">🔇</button><input class="mvol" type="range" min="0" max="100" value="80" aria-label="Volume"></span><button type="button" class="mfs" aria-label="Full screen">⛶</button></div>
    <p class="mcap" aria-live="polite"></p>`;
  await font();
  if (S.json && !S._J) S._J = await (await fetch(new URL('../' + S.json, import.meta.url), { cache: 'no-cache' })).json();
  const F = makeFilm(shortFilm(kind)); if (S.end) F.end = Math.max(F.end, S.end); if (S._J) F.end = Math.max(F.end, S._J.end);
  const J = S._J, $0 = q => host.querySelector(q);
  if (J) {
    $0('.mctl').insertAdjacentHTML('beforebegin', '<pre class="mterm" aria-label="Terminal"></pre>');
    const RU = J.rule || { title: 'Fix it where it lives', rows: [['Deployment', 'lives in the API server', 'kubectl'], ['kubelet', 'lives on the node', 'ssh + systemctl']] };
    $0('.mwrap').insertAdjacentHTML('beforeend', `<div class="mq" hidden></div><div class="mrule" hidden><b>${RU.title}</b>${RU.rows.map((r, i) => `<div class="r${i + 1}">${r.map(c => `<span>${c.replace(/</g, '&lt;')}</span>`).join('')}</div>`).join('')}</div>`);
    const chs = J.phrases.filter(p => p.ch); $0('.mcap').insertAdjacentHTML('beforebegin', `<div class="mchap">${chs.map(p => `<button type="button" data-t="${p.t}">${p.ch}</button>`).join('')}</div>`);
  }
  const term = $0('.mterm');
  // terminal: each entry types its command (slowly) after the current prompt; output lines follow; the prompt changes after ssh / sudo -i / exit
  const TE = J ? J.phrases.flatMap(p => { let st = p.t + .35; return (p.term || []).map(e => { const x = { ...e, t: st, r: Math.max(16, e.cmd.length / 2.4) }; st += e.cmd.length / x.r + .5 + e.out.length * .25 + .4; return x; }); }) : [];
  const phAt = t => { let c = null; if (J) for (const p of J.phrases) if (t >= p.t) c = p; return c; };
  const esc = x => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const termAt = t => {
    if (!term) return; const lines = []; let prompt = 'controlplane $', typing = '';
    for (const e of TE) {
      if (t < e.t) break;
      const n = Math.floor((t - e.t) * e.r);
      if (n < e.cmd.length) { typing = e.cmd.slice(0, n); prompt = e.p; break; }
      lines.push({ p: e.p, c: e.cmd }); let ot = e.t + e.cmd.length / e.r + .4;
      for (const o of e.out) { if (t < ot) break; lines.push({ o }); ot += .25; }
      prompt = e.next; typing = '';
    }
    const ph = phAt(t), hl = ph && ph.hl && t > ph.t + .6 ? ph.hl : null;
    const cls = x => /NotReady|inactive|disabled|Unknown|stopped/.test(x) ? 'bad' : /Ready|active|enabled/.test(x) ? 'ok' : '';
    const row = l => l.o !== undefined ? `<span class="${cls(l.o)}${hl && l.o.includes(hl) ? ' hl' : ''}">${esc(l.o)}</span>` : `<span class="pr${hl && l.p.includes(hl) ? ' hl' : ''}">${esc(l.p)}</span> <span class="c${hl && l.c.includes(hl) ? ' hl' : ''}">${esc(l.c)}</span>`;
    const all = [...lines.map(row), `<span class="pr${hl && prompt.includes(hl) ? ' hl' : ''}">${esc(prompt)}</span> <span class="c">${esc(typing)}</span><span class="cur">▌</span>`];
    const html = all.slice(-8).map(x => `<div>${x}</div>`).join(''); if (term.innerHTML !== html) term.innerHTML = html;
    host.classList.toggle('mtermfocus', !!(ph && ph.focus === 'TERM'));
  };
  // captions: key words in the same colours as the board
  const capHtml = s0 => esc(s0).replace(/\b(NotReady|inactive|disabled|stopped|Unknown)\b/g, '<b class="kr">$1</b>').replace(/\b(Ready|active|enabled|heartbeat)\b/g, '<b class="kg">$1</b>')
    .replace(/\b(kubectl|ssh node01|ssh|sudo -i|systemctl[\w -]*kubelet|exit|k get nodes|k describe node node01)\b/g, '<b class="ko">$1</b>').replace(/\b(kubelet|API server|control plane|node01)\b(?![^<]*<\/b>)/g, '<b class="kb">$1</b>');
  const $ = q => host.querySelector(q);
  const cv = $('canvas'), ctx = cv.getContext('2d'), cap = $('.mcap'), big = $('.mbig'), pp = $('.mpp'), bar = $('.mseek'), time = $('.mtime'), snd = $('.msnd'), fs = $('.mfs'), vol = $('.mvol'), spd = $('.mspd');
  const pref = (k, d) => { try { const v = JSON.parse(localStorage.getItem('cka:film-' + k)); return v ?? d; } catch { return d; } };
  const keep = (k, v) => { try { localStorage.setItem('cka:film-' + k, JSON.stringify(v)); } catch {} };
  let raf = 0, playing = false, T = 0, last = 0, audio = null, muted = true, rate = pref('rate', 1), gain = null;
  const RATES = [.75, 1, 1.25, 1.5];
  if (S.audio) { audio = new Audio(new URL('../' + S.audio, import.meta.url).href); audio.preload = 'auto'; $('.mvolbox').hidden = false; }
  vol.value = Math.round(pref('vol', .8) * 100);
  // volume through the Web Audio mixer: iPhones ignore audio.volume, a gain node works everywhere
  const applyVol = () => { const v = vol.value / 100; keep('vol', v); if (gain) gain.gain.value = v * v; else if (audio) audio.volume = v; snd.textContent = muted || v === 0 ? '🔇' : v < .5 ? '🔉' : '🔊'; };
  const mixer = () => { if (gain || !audio) return; try { const AC = window.AudioContext || window.webkitAudioContext, ac = new AC(); const src = ac.createMediaElementSource(audio); gain = ac.createGain(); src.connect(gain).connect(ac.destination); ac.resume?.(); } catch { gain = null; } applyVol(); };
  const setRate = r => { rate = r; keep('rate', r); spd.textContent = (r === 1 ? '1' : String(r)) + '×'; if (audio) audio.playbackRate = r; };
  setRate(rate);
  const syncAudio = () => { if (!audio) return; audio.playbackRate = rate; if (playing && !muted) { if (Math.abs(audio.currentTime - T) > .3) audio.currentTime = T; audio.play().catch(() => {}); } else audio.pause(); };
  const soundOn = on => { muted = !on; if (on) { mixer(); if (vol.value == 0) vol.value = 60; } applyVol(); syncAudio(); };
  snd.onclick = () => soundOn(muted);
  vol.oninput = () => { if (muted && vol.value > 0) soundOn(true); else applyVol(); };
  spd.onclick = () => setRate(RATES[(RATES.indexOf(rate) + 1) % RATES.length]);
  const jump = d => { T = Math.max(0, Math.min(F.end, T + d)); frame(T); syncAudio(); };
  $('.mback').onclick = () => jump(-10); $('.mfwd').onclick = () => jump(10);
  const showCap = t => {
    let c = null; for (const x of F.caps) if (t >= x[0]) c = x;
    if (!c) { cap.style.opacity = 0; return; }
    if (cap.dataset.s !== c[1]) { cap.dataset.s = c[1]; if (J) cap.innerHTML = capHtml(c[1]); else cap.textContent = c[1]; }
    cap.style.opacity = Math.min(1, (t - c[0]) / .5);
  };
  const frame = t => { F.board.render(ctx, t, F.cam); showCap(t); termAt(t); extras(t); if (!bar.dragging) bar.value = Math.round(t / F.end * 1000); time.textContent = `${fmt(t)} / ${fmt(F.end)}`; };
  const ruleEl = $0('.mrule'), qEl = $0('.mq'), qDone = new Set();
  const extras = t => {
    if (!J) return; const ph = phAt(t), id = ph && ph.id;
    if (ruleEl) { const r0 = J.phrases.findIndex(p => p.ch === 'The rule'), i = J.phrases.indexOf(ph), end = t >= J.end - .1;
      ruleEl.hidden = !(r0 >= 0 && i >= r0) && !end; ruleEl.classList.toggle('on1', i >= r0 + 1 || end); ruleEl.classList.toggle('on2', i >= r0 + 2 || end); }
    host.querySelectorAll('.mchap button').forEach(b => b.classList.toggle('on', ph && +b.dataset.t <= t && (!b.nextElementSibling || +b.nextElementSibling.dataset.t > t)));
  };
  const ask = q => {
    pause(); qEl.hidden = false;
    qEl.innerHTML = `<p class="mqq">❓ ${esc(q.q)}</p>${q.opts.map((o, i) => `<button type="button" data-i="${i}">${esc(o[0])}</button>`).join('')}<p class="mqf" aria-live="polite"></p>`;
    qEl.querySelectorAll('button').forEach(b => b.onclick = () => {
      const o = q.opts[+b.dataset.i], f = qEl.querySelector('.mqf');
      if (o[1]) { b.classList.add('right'); f.textContent = '✓ Correct.'; qDone.add(q.id); setTimeout(() => { qEl.hidden = true; play(); }, 1100); }
      else { b.classList.add('wrong'); f.textContent = `${o[2]} Try again.`; }
    });
  };
  const checkQ = (t0, t1) => { if (!J) return false; const q = J.questions.find(q => !qDone.has(q.id) && q.t > t0 && q.t <= t1); if (q) { T = q.t; frame(T); ask(q); return true; } return false; };
  const setUI = () => { pp.textContent = playing ? '⏸' : '▶'; big.hidden = playing; };
  const tick = now => {
    if (!playing) return; if (!host.isConnected) return pause();
    const dt = Math.min(.05, (now - last) / 1000); last = now; const T0 = T;
    // the sound leads while it plays; if it is far off (a jump, or a file that can't seek yet), the film keeps its own clock and pulls the sound along
    if (audio && !muted && !audio.paused && Math.abs(audio.currentTime - T) < 1.5) T = audio.currentTime;
    else { T += dt * rate; if (audio && !muted && Math.abs(audio.currentTime - T) > 1.5) try { audio.currentTime = T; } catch {} }
    if (checkQ(T0, T)) return;
    frame(Math.min(T, F.end));
    if (T < F.end) raf = requestAnimationFrame(tick); else { playing = false; setUI(); syncAudio(); }
  };
  let first = true;
  const play = () => { if (qEl && !qEl.hidden) return; if (first && audio) { first = false; soundOn(true); } if (T >= F.end - .05) T = 0; playing = true; last = performance.now(); setUI(); syncAudio(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
  const pause = () => { playing = false; cancelAnimationFrame(raf); setUI(); syncAudio(); };
  host.querySelectorAll('.mchap button').forEach(b => b.onclick = () => { qEl && (qEl.hidden = true); T = +b.dataset.t; frame(T); syncAudio(); if (!playing) play(); });
  pp.onclick = () => (playing ? pause() : play()); big.onclick = play; cv.onclick = () => (playing ? pause() : play());
  bar.oninput = () => { bar.dragging = true; T = bar.value / 1000 * F.end; frame(T); bar.dragging = false; };
  bar.onchange = () => { T = bar.value / 1000 * F.end; frame(T); syncAudio(); };
  const setFull = on => {
    host.classList.toggle('mfull', on); document.body.classList.toggle('mfull-open', on); fs.textContent = on ? '✕' : '⛶';
    if (on && host.requestFullscreen && !document.fullscreenElement) host.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
  fs.onclick = () => setFull(!host.classList.contains('mfull'));
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && host.classList.contains('mfull')) setFull(false); });
  host._seek = t => { pause(); T = Math.min(t, F.end); frame(T); };   // for screenshots
  setUI();
  if (reduce()) { T = F.end; frame(T); return; }
  frame(0);
  if (S.long) return;   // a long film waits for ▶
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .4 });
  io.observe(host);
}
function scan(root) {
  root.querySelectorAll('[data-motion]:not(.motion)').forEach(h => {
    const k = h.dataset.motion;
    if (SHORTS[k]) build(h, k).catch(e => { console.warn('motion', e); h.remove(); });
    else h.remove();
  });
}
const app = document.getElementById('app');
if (app) { scan(app); new MutationObserver(() => scan(app)).observe(app, { childList: true }); }
