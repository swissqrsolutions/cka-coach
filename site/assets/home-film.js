// Home film: Kubernetes as a restaurant chain. Big name = the restaurant, small grey name = the Kubernetes part.
// Uses the whiteboard engine (assets/wb/, MIT). Board 2400 x 3520 world units.
import * as W from './wb/wb.js';

const GREY = '#6b7280', PI = Math.PI;
export const HOME_H = 3580;

// ───────── doodles (all return Stroke[])
const L = (x0, y0, x1, y1, w = 8) => W.line(x0, y0, x1, y1, { w });
function person(cx, top, s = 1, o = {}) {
  const k = v => v * s, hy = top + k(48), out = [W.circle(cx, hy, k(46), { w: 8 }), L(cx, top + k(96), cx, top + k(240))];
  out.push(L(cx, top + k(130), cx - k(75), top + k(205)));                       // left arm
  if (o.point) out.push(L(cx, top + k(130), cx + k(150), top + k(110)));          // pointing arm
  else if (o.tray) out.push(L(cx, top + k(130), cx + k(80), top + k(150)), L(cx + k(40), top + k(150), cx + k(170), top + k(150), 9));
  else out.push(L(cx, top + k(130), cx + k(75), top + k(205)));
  out.push(L(cx, top + k(240), cx - k(60), top + k(340)), L(cx, top + k(240), cx + k(60), top + k(340)));
  if (o.hat) out.push(L(cx - k(40), hy - k(44), cx + k(40), hy - k(44)), W.arc(cx - k(22), hy - k(66), k(28), PI * .9, PI * 1.9, { w: 8 }), W.arc(cx + k(14), hy - k(76), k(32), PI * 1.1, PI * 2.1, { w: 8 }));
  if (o.clip) out.push(...W.rect(cx + k(70), top + k(160), k(70), k(90), { w: 7, over: 3 }), L(cx + k(85), top + k(190), cx + k(125), top + k(190), 5), L(cx + k(85), top + k(215), cx + k(125), top + k(215), 5));
  return out;
}
const paper = (cx, cy) => [...W.rect(cx - 130, cy - 150, 260, 300, { w: 8, over: 6 }), L(cx - 90, cy - 80, cx + 90, cy - 80, 6), L(cx - 90, cy - 20, cx + 90, cy - 20, 6), L(cx - 90, cy + 40, cx + 50, cy + 40, 6), L(cx - 90, cy + 100, cx + 70, cy + 100, 6)];
const pot = (cx, cy) => [L(cx - 210, cy, cx + 210, cy), W.arc(cx, cy, 180, 0, PI, { ry: 130, w: 8 }), L(cx - 210, cy + 10, cx - 260, cy + 10), L(cx + 210, cy + 10, cx + 260, cy + 10),
  W.curve([[cx - 70, cy - 30], [cx - 100, cy - 90], [cx - 60, cy - 150]], { w: 6 }), W.curve([[cx + 20, cy - 30], [cx - 10, cy - 100], [cx + 30, cy - 170]], { w: 6 }), W.curve([[cx + 100, cy - 30], [cx + 70, cy - 90], [cx + 110, cy - 150]], { w: 6 })];
const house = (cx, cy) => [W.poly([cx - 220, cy - 60, cx, cy - 210, cx + 220, cy - 60], { w: 8 }), ...W.rect(cx - 180, cy - 60, 360, 250, { w: 8, over: 6 }), L(cx - 180, cy + 40, cx + 180, cy + 40, 6), L(cx - 180, cy + 120, cx + 180, cy + 120, 6)];
const kit = (cx, cy, s = 1) => [...W.rect(cx - 55 * s, cy - 42 * s, 110 * s, 84 * s, { w: 7, over: 3 }), L(cx, cy - 42 * s, cx, cy + 42 * s, 6), L(cx - 55 * s, cy, cx + 55 * s, cy, 6)];
const envelope = (cx, cy) => [...W.rect(cx - 150, cy - 95, 300, 190, { w: 8, over: 5 }), W.poly([cx - 150, cy - 95, cx, cy + 15, cx + 150, cy - 95], { w: 7 })];
const desk = (cx, cy) => [L(cx - 260, cy, cx + 260, cy, 9), L(cx - 260, cy + 22, cx + 260, cy + 22, 7), L(cx - 225, cy + 22, cx - 225, cy + 150), L(cx + 225, cy + 22, cx + 225, cy + 150),
  W.arc(cx + 120, cy - 4, 42, PI, PI * 2, { w: 8 }), W.circle(cx + 120, cy - 54, 9, { w: 6 }),
  ...W.rect(cx - 170, cy - 130, 140, 120, { w: 6, over: 3 }), L(cx - 150, cy - 95, cx - 50, cy - 95, 5), L(cx - 150, cy - 60, cx - 70, cy - 60, 5)];
const book = (cx, cy) => [W.poly([cx, cy - 100, cx - 190, cy - 130, cx - 190, cy + 90, cx, cy + 120, cx + 190, cy + 90, cx + 190, cy - 130, cx, cy - 100, cx, cy + 120], { w: 8 })];
const oven = (cx, cy) => [...W.rect(cx - 230, cy - 160, 460, 320, { w: 8, over: 6 }), ...W.rect(cx - 170, cy - 70, 340, 190, { w: 7, over: 4 }), W.circle(cx - 150, cy - 115, 16, { w: 6 }), W.circle(cx - 90, cy - 115, 16, { w: 6 }), L(cx + 60, cy - 115, cx + 170, cy - 115, 6)];
const plate = (cx, cy) => [W.circle(cx, cy, 120, { ry: 38, w: 8 }), W.circle(cx, cy, 70, { ry: 20, w: 6 })];
const food = (cx, cy) => [W.curve([[cx - 55, cy - 8], [cx - 30, cy - 60], [cx + 20, cy - 66], [cx + 55, cy - 8]], { w: 8 })];
const phone = (cx, cy) => [W.roundRect(cx - 95, cy - 140, 190, 280, 30, { w: 8 }), ...W.rect(cx - 65, cy - 100, 130, 170, { w: 6, over: 3 }), W.circle(cx, cy + 105, 14, { w: 6 })];
function arrow(pts, o = {}) {
  const sh = W.poly(pts.flat(), { w: 7, jitter: .6 });
  const hd = (ex, ey, px, py) => { const a = Math.atan2(ey - py, ex - px); return [L(ex + Math.cos(a + 2.6) * 34, ey + Math.sin(a + 2.6) * 34, ex, ey, 7), L(ex, ey, ex + Math.cos(a - 2.6) * 34, ey + Math.sin(a - 2.6) * 34, 7)]; };
  const n = pts.length, out = [sh, ...hd(pts[n - 1][0], pts[n - 1][1], pts[n - 2][0], pts[n - 2][1])];
  if (o.both) out.push(...hd(pts[0][0], pts[0][1], pts[1][0], pts[1][1]));
  out.shaft = sh; return out;
}
// big restaurant name + small Kubernetes name
const name = (big, small, x, y, al = 'center') => [...W.text(big, x, y, { h: 64, align: al }), ...W.text(small, x, y + 54, { h: 42, align: al, color: GREY })];

export function homeFilm(a) {
  const { pen: { K, Bl, G, O, R }, draw } = a, T = (s, x, y, o) => W.text(s, x, y, { h: 48, ...o });
  // the picture
  const S = {
    recipe: [...paper(350, 290), ...name('Recipe', 'Java code in GitHub', 350, 535)],
    test: [...pot(1150, 320), ...name('Test kitchen', 'GitHub Actions', 1150, 535)],
    ware: [...house(2000, 300), ...name('Warehouse', 'registry', 2000, 585)],
    kitW: kit(2000, 395, .9),
    form: [...envelope(2000, 790), ...name('Order form', 'helm upgrade', 2000, 965)],
    office: [...W.rect(50, 1080, 2300, 880, { w: 5, over: 10, color: GREY, alpha: .7 }), ...W.text('Head office', 90, 1150, { h: 56, color: GREY }), ...W.text('(control plane)', 610, 1150, { h: 42, color: GREY })],
    manager: [...person(380, 1200, .95, { clip: true }), ...name('Manager', 'controller manager', 380, 1615)],
    desk: [...desk(1200, 1420), ...name('Order desk', 'API server', 1200, 1660)],
    book: [...book(2000, 1400), ...name('Order book', 'etcd', 2000, 1640)],
    host: [...person(760, 1700, .62, { point: true }), ...name('Host', 'scheduler', 1010, 1840, 'left')],
    kitchen: [...W.rect(50, 2060, 2300, 980, { w: 5, over: 10, color: GREY, alpha: .7 }), ...W.text('Kitchen 1', 90, 2130, { h: 56, color: GREY }), ...W.text('(node01)', 500, 2130, { h: 42, color: GREY })],
    chef: [...person(380, 2250, .95, { hat: true }), ...name('Chef', 'kubelet', 380, 2665)],
    oven: [...oven(1200, 2380), ...name('Oven', 'containerd', 1200, 2665)],
    counter: [L(1690, 2470, 2320, 2470, 9), ...plate(1850, 2425), ...plate(2160, 2425), ...name('Plates', 'Pods', 2005, 2665)],
    meals: [...food(1850, 2420), ...food(2160, 2420)],
    waiter: [...person(1480, 2760, .8, { tray: true }), ...name('Waiter', 'kube-proxy', 1700, 2920, 'left')],
    guests: [...person(260, 3130, .72), ...person(470, 3130, .72), ...name('Guests', 'users', 365, 3450)],
    phone: [...phone(1200, 3230), ...name('Phone number', 'Service', 1200, 3470)],
  };
  const A = {
    r_t: arrow([[500, 290], [880, 290]]), t_w: arrow([[1420, 290], [1760, 290]]),
    f_d: arrow([[1850, 790], [1200, 790], [1200, 1180]]), d_b: arrow([[1480, 1400], [1790, 1400]]), m_d: arrow([[560, 1400], [920, 1400]], { both: true }),
    h_d: arrow([[870, 1735], [970, 1590]], { both: true }),
    d_c: arrow([[960, 1560], [700, 1560], [700, 2010], [380, 2010], [380, 2170]], { both: true }),
    c_o: arrow([[540, 2380], [950, 2380]]), o_p: arrow([[1440, 2380], [1720, 2400]]),
    pull: arrow([[2200, 300], [2378, 300], [2378, 2170], [1200, 2170], [1200, 2210]]),
    g_p: arrow([[600, 3240], [1080, 3240]]), p_w: arrow([[1300, 3100], [1430, 3040]]), w_p: arrow([[1640, 2860], [1850, 2500]]),
  };
  const C = [[0, 350, 420, 1.0]];
  const cap = (t, s) => a.caption(t, s);
  // 1 recipe
  cap(0.2, '1. You write a new recipe: your Java code. You save it in GitHub.');
  draw(K, S.recipe, 0.5, 3.0);
  // 2 test kitchen
  cap(5.2, '2. The test kitchen cooks it once to check it works. That is GitHub Actions running mvn package.');
  C.push([5.0, 350, 420, 1.0], [6.6, 1050, 440, .9]);
  draw(Bl, A.r_t, 5.6, 6.3); draw(K, S.test, 6.3, 8.6);
  a.magnet('#d97757', [[A.r_t.shaft, 8.7, 9.8]], { until: 11.6, size: 40 });
  // 3 meal kit → warehouse
  cap(11, '3. The meal is packed into a meal kit (docker build) and stored in the warehouse (the registry).');
  C.push([10.8, 1050, 440, .9], [12.4, 1750, 460, .9]);
  draw(K, S.ware, 11.8, 13.6); draw(Bl, A.t_w, 13.6, 14.2);
  a.magnet('#d97757', [[A.t_w.shaft, 11.6, 11.6], [A.t_w.shaft, 14.3, 15.4]], { until: 15.5, size: 40 });
  draw(K, S.kitW, 15.4, 16.0);
  // 4 order form
  cap(17, '4. Head office sends one order form: "always 2 plates of this meal". That is helm upgrade. It sends it once and does not check again.');
  C.push([16.8, 1750, 460, .9], [18.6, 1500, 1050, .62]);
  draw(K, S.form, 17.6, 19.2); draw(K, S.office, 19.2, 20.0); draw(K, S.desk, 20.0, 21.6); draw(Bl, A.f_d, 21.6, 22.3);
  a.magnet('#8a94a6', [[A.f_d.shaft, 22.4, 23.6]], { until: 23.7, size: 34 });
  // 5 desk + book
  cap(24.2, '5. The order desk (API server) writes the order in the order book (etcd).');
  C.push([24, 1500, 1050, .62], [25.4, 1600, 1400, .72]);
  draw(K, S.book, 25.0, 26.4); draw(Bl, A.d_b, 26.4, 26.9); draw(Bl, T('2 plates', 2000, 1420, { align: 'center' }), 27.0, 28.0);
  // 6 manager
  cap(29.2, '6. The manager reads the book: "2 plates wanted, 0 ready, so make 2". That is the controller manager.');
  C.push([29, 1600, 1400, .72], [30.4, 800, 1420, .72]);
  draw(K, S.manager, 30.0, 32.0); draw(Bl, A.m_d, 32.0, 32.5);
  // 7 host
  cap(34, '7. The host picks a kitchen with free space: Kitchen 1. That is the scheduler.');
  C.push([33.8, 800, 1420, .72], [35.2, 1000, 1700, .72]);
  draw(K, S.host, 34.6, 36.4); draw(Bl, A.h_d, 36.4, 36.9); draw(Bl, T('→ Kitchen 1', 1430, 1860), 37.0, 38.0);
  // 8 chef + oven + pull the kit
  cap(39, '8. The chef in Kitchen 1 (kubelet) gets the meal kit from the warehouse and puts it in the oven (containerd).');
  C.push([38.8, 1000, 1700, .72], [40.6, 1200, 2280, .5]);
  draw(K, S.kitchen, 39.6, 40.4); draw(K, S.chef, 40.4, 42.0); draw(Bl, A.d_c, 42.0, 42.7);
  draw(K, S.oven, 42.7, 44.0); draw(Bl, A.c_o, 44.0, 44.4); draw(Bl, A.pull, 44.4, 45.4);
  a.magnet('#d97757', [[A.pull.shaft, 45.5, 47.4]], { until: 47.5, size: 40 });
  // 9 plates ready
  cap(48.2, '9. The meals are ready on the plates: the Pods are Running. The chef tells the order desk.');
  C.push([48, 1200, 2280, .5], [49.4, 1700, 2420, .72]);
  draw(Bl, A.o_p, 48.6, 49.0); draw(K, S.counter, 49.0, 50.6); draw(O, S.meals, 50.6, 51.3);
  a.magnet('#2e7a4d', [[A.d_c.shaft, 51.6, 53.0, true]], { until: 53.0, size: 30 });
  // 10 guests → phone → waiter → plate
  cap(54, '10. Guests call one phone number (the Service). The waiter (kube-proxy) brings them a ready plate.');
  C.push([53.8, 1700, 2420, .72], [55.4, 1150, 2980, .55]);
  draw(K, S.phone, 54.6, 55.8); draw(K, S.guests, 55.8, 57.0); draw(K, S.waiter, 57.0, 58.2);
  draw(Bl, [A.g_p, A.p_w, A.w_p], 58.2, 59.2);
  a.magnet('#2a5cb3', [[A.g_p.shaft, 59.4, 60.2], [A.p_w.shaft, 60.2, 60.8], [A.w_p.shaft, 60.8, 61.6]], { until: 61.7, size: 28 });
  // end: whole picture + the key idea
  cap(62.2, 'One recipe, always 2 plates. If a plate breaks, the manager sees "1 missing" and the chef makes a new one.');
  C.push([62, 1150, 2980, .55], [64.4, 1200, 1790, .377]);
  return new W.Camera(C);
}
