/**
 * Exploded watch: a watch on its strap, taken apart along its axis into six
 * layers: caseback, movement, case (lugs, crown, strap), dial with its hands
 * at ten past ten, bezel, crystal. The pointer's x scrubs the gap between the
 * layers, on a spring; its y picks a layer, read from the target pose, which
 * takes the bright edge while the layers around it part, staggered outwards.
 * At rest the watch is slightly opened and the hands are the bright mark.
 * The slider is the widest gap, in world units.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, lerp, open, poly, prism, proj, rad, ringAt, rings, rrect, run, seg, circ,
  spring, stepS, tween, tset, tval, tdone, disposer, mk, place, pointer, register,
} = HL;

const R = 30, SL = 40, SW = 11, PART = 5, REST = 0.35, NAMES = ["caseback", "movement", "case", "dial", "bezel", "crystal"];

const disc2 = (r, b) => [rrect(-r, -r, r, r, r, 14), rrect(-r + b, -r + b, r - b, r - b, r - b, 14)];
const off = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);
/** 12 o'clock points along -y, so 3 o'clock (the crown) is +x: a world point at angle a (deg, clockwise from 12), radius r. */
const at = (a, r) => [Math.sin(rad(a)) * r, -Math.cos(rad(a)) * r];

/** A solid disc: silhouette and crease. */
function disc(P, front, r, z0, z1, b, glass) {
  const [o, i] = disc2(r, b), pr = prism(P, front, o, i, z0, z1);
  return [{ d: pr.sil, c: glass ? "nf sil" : "sil", hi: true }, { d: pr.crease, c: "nf lo" }];
}
/** A ring with a real hole: the far inner wall, then the band (outer hull with the hole wound the other way), then its crease. */
function band(P, front, ro, rh, z0, z1, b) {
  const [o, oi] = disc2(ro, b), h = rrect(-rh, -rh, rh, rh, rh, 14);
  const outer = hull(ringAt(P, o, z0).concat(ringAt(P, o, z1)));
  let hole = ringAt(P, h, z1);
  if (Math.sign(area(hole)) === Math.sign(area(outer))) hole = hole.slice().reverse();
  const back = run(h, (q) => !front(q));
  return [
    { d: poly(ringAt(P, back, z1).concat(ringAt(P, back, z0).reverse())), c: "lo" },
    { d: poly(outer) + poly(hole), c: "sil", hi: true },
    { d: open(ringAt(P, run(oi, front), z1)), c: "nf lo" },
  ];
}
/** A small rounded block: lugs, crown, straps. */
function block(P, front, x0, y0, x1, y1, r, b, z0, z1, hi) {
  const [o, i] = rings(x0, y0, x1, y1, r, b), pr = prism(P, front, o, i, z0, z1);
  return [{ d: pr.sil, c: "sil", hi }, { d: pr.crease, c: "nf lo" }];
}

/** Every layer's drawing at lift z (added to its closed-up heights), as [{d, c, hi} | {dot, c}]. */
const LAYERS = [
  { k: -2, zm: -0.5, draw: (P, f, z) => [
    ...disc(P, f, R - 2, z - 2, z + 1, 1.6),
    { d: poly(ringAt(P, circ(R - 12, 40), z + 1)), c: "nf lo" },
  ] },
  { k: -1, zm: 4, draw: (P, f, z) => {
    const top = z + 6.5, rotor = [[0, 0]];
    for (let a = 200; a <= 340; a += 20) rotor.push(at(a, R - 10));
    return [
      ...disc(P, f, R - 7, z + 1.5, top, 1.4),
      { d: poly(fillet(rotor.map((w) => P(w[0], w[1], top)), rotor.map(() => 0.8))), c: "lo" },
      { d: poly(ringAt(P, off(circ(5, 24), 7, 5), top)) + poly(ringAt(P, off(circ(3.5, 20), -4, 11), top)), c: "nf lo" },
      ...[[7, 5], [-4, 11], [12, -6]].map((w) => ({ dot: P(w[0], w[1], top), c: "dot off" })),
    ];
  } },
  { k: 0, zm: 5, draw: (P, f, z) => {
    const lug = (x0, x1, y0, y1) => block(P, f, x0, y0, x1, y1, 1.6, 0.6, z + 1, z + 8, true);
    const strapFar = block(P, f, -SW, -R - SL, SW, -R + 1, 4, 1.2, z + 2.5, z + 5, false);
    const strapNear = block(P, f, -SW, R - 1, SW, R + SL, 4, 1.2, z + 2.5, z + 5, false);
    const holes = [16, 21, 26, 31].map((y) => ({ dot: P(0, R + y, z + 5), c: "dot off" }));
    return [
      ...strapFar, ...lug(-15, -11, -R - 4, -R + 6), ...lug(11, 15, -R - 4, -R + 6),
      ...band(P, f, R, R - 4, z, z + 10, 1.4),
      ...lug(-15, -11, R - 6, R + 4), ...lug(11, 15, R - 6, R + 4),
      ...block(P, f, R - 2, -4, R + 6, 4, 3.5, 1, z + 2.5, z + 7.5, true),
      ...strapNear, ...holes,
    ];
  } },
  { k: 1, zm: 7.2, draw: (P, f, z) => {
    const top = z + 8, hz = top + 0.4, ticks = [];
    for (let i = 0; i < 12; i++) { const a = at(i * 30, R - 7), b = at(i * 30, R - (i % 3 ? 9.5 : 12)); ticks.push(seg(P(a[0], a[1], top), P(b[0], b[1], top))); }
    const hand = (a, len, w) => {
      const d = at(a, 1), p = [d[1] * -1, d[0]], pt = (s, t) => P(d[0] * s + p[0] * t, d[1] * s + p[1] * t, hz);
      const pts = [pt(-3, w), pt(len * 0.82, w * 0.55), pt(len, 0), pt(len * 0.82, -w * 0.55), pt(-3, -w)];
      return poly(fillet(pts, [0.6, 0.6, 0.4, 0.6, 0.6]));
    };
    return [
      ...disc(P, f, R - 5, z + 6.5, top, 1.2),
      { d: ticks.join(""), c: "nf lo" },
      { d: hand(305, R - 15, 2.2) + hand(60, R - 9, 1.6), c: "", hands: true },
      { dot: P(0, 0, hz + 0.2), c: "dot m" },
    ];
  } },
  { k: 2, zm: 11.7, draw: (P, f, z) => [...band(P, f, R + 1, R - 5, z + 10, z + 13.5, 1.2), { dot: P(...at(0, R - 2), z + 13.6), c: "dot off" }] },
  { k: 3, zm: 14.2, draw: (P, f, z) => disc(P, f, R - 3, z + 13.5, z + 15, 1, true) },
];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let G = value, act = -1, last = null;
  const C = Cam(45, 0.5, 2.2), GM = 15 + PART;
  const ext = [];
  for (const z of [15 + 3 * GM, -2 - 2 * GM]) ext.push([R, 0, z], [-R, 0, z], [0, R, z], [0, -R, z]);
  ext.push([SW, -R - SL, 5], [-SW, R + SL, 5], [R + 6, 0, 5]);
  fit(C, ext, 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const parts = LAYERS.map((L) => ({ ...L, g: mk("g", {}, g), els: [], tw: tween(0) }));
  const gap = spring(REST * G, { eps: 0.02 });

  function render(pt, list, on) {
    list.forEach((e, i) => {
      let el = pt.els[i];
      if (!el) el = pt.els[i] = e.dot ? mk("circle", { r: 1.1 }, pt.g) : mk("path", {}, pt.g);
      if (e.dot) place(el, e.dot);
      else el.setAttribute("d", e.d);
      const lit = (e.hi && on) || (e.hands && (act < 0 || act === 3));
      el.setAttribute("class", (e.c + (lit ? " hi" : "")).trim());
    });
  }
  function drawAll(now) {
    const lifts = parts.map((pt) => pt.k * gap.x + tval(pt.tw, now));
    const key = lifts.map((v) => v.toFixed(2)).join() + act;
    if (key === last) return;
    last = key;
    parts.forEach((pt, i) => render(pt, pt.draw(P, front, lifts[i]), i === act));
  }

  const B = register(stage, (dt, now) => {
    let m = stepS(gap, dt);
    for (const pt of parts) if (!tdone(pt.tw, now)) m = true;
    drawAll(now);
    return m;
  });
  bag.add(B.unregister);

  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    parts.forEach((pt, i) => tset(pt.tw, a < 0 || i === a ? 0 : Math.sign(i - a) * PART, now, Math.abs(i - from) * 45));
    read.textContent = a < 0 ? "rest" : NAMES[a];
    last = null;
    B.wake();
  }
  let over = null;
  function aim() {
    if (!over) { gap.t = REST * G; choose(-1); B.wake(); return; }
    gap.t = G * lerp(0.12, 1, clamp((over[0] - 90) / 220, 0, 1));
    // Pick from the target pose: each layer's centre at the gap the spring is heading for.
    let best = -1, bd = Infinity;
    parts.forEach((pt, i) => { const d = Math.abs(over[1] - P(0, 0, pt.zm + pt.k * gap.t)[1]); if (d < bd) { bd = d; best = i; } });
    choose(bd < 30 && Math.abs(over[0] - 200) < 150 ? best : -1);
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => { over = p; aim(); }, leave: () => { over = null; aim(); } }));
  bag.add(() => svg.replaceChildren());
  drawAll(performance.now());
  read.textContent = "rest";

  return {
    set: (v) => { G = v; last = null; aim(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "exploded-watch",
  means: "A watch taken apart along its axis: the pointer's x opens the layers, its y picks one and the rest part around it.",
  rules: [1, 2, 6, 8],
  range: [6, 10, 15],
  tour: [[150, 177], [300, 208], [270, 122], null],
  mount,
});
