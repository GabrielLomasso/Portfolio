// Traçado de raios num prisma triangular: refração pela lei de Snell, dispersão
// pela equação de Cauchy n(λ) = A + B/λ² e reflexão interna total quando não há
// raio refratado. Tudo em coordenadas de tela (px).

export interface Vec {
  x: number;
  y: number;
}

const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
const norm = (a: Vec): Vec => {
  const l = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / l, y: a.y / l };
};

/** Comprimentos de onda (nm) e o matiz OKLCH usado para desenhar cada um. */
export const WAVELENGTHS = [
  { nm: 700, hue: 25 },
  { nm: 620, hue: 50 },
  { nm: 580, hue: 95 },
  { nm: 530, hue: 145 },
  { nm: 480, hue: 210 },
  { nm: 440, hue: 265 },
  { nm: 400, hue: 300 },
];

/** Índice de refração pela equação de Cauchy (λ em µm). */
export const refractiveIndex = (nm: number, a: number, b: number) => a + b / (nm / 1000) ** 2;

interface Hit {
  point: Vec;
  t: number;
  edge: number;
}

/** Interseção do raio com os lados do triângulo, ignorando o lado de onde ele sai. */
function intersect(origin: Vec, dir: Vec, tri: Vec[], skip: number): Hit | null {
  let best: Hit | null = null;
  for (let i = 0; i < 3; i++) {
    if (i === skip) continue;
    const a = tri[i];
    const b = tri[(i + 1) % 3];
    const e = sub(b, a);
    const denom = dir.x * e.y - dir.y * e.x;
    if (Math.abs(denom) < 1e-9) continue;
    const ao = sub(a, origin);
    const t = (ao.x * e.y - ao.y * e.x) / denom;
    const u = (ao.x * dir.y - ao.y * dir.x) / denom;
    if (t > 1e-6 && u >= 0 && u <= 1 && (!best || t < best.t)) best = { point: add(origin, mul(dir, t)), t, edge: i };
  }
  return best;
}

/** Normal do lado i apontando para fora do triângulo. */
function outwardNormal(tri: Vec[], i: number): Vec {
  const a = tri[i];
  const b = tri[(i + 1) % 3];
  const n = norm({ x: b.y - a.y, y: -(b.x - a.x) });
  const center = mul(add(add(tri[0], tri[1]), tri[2]), 1 / 3);
  return dot(n, sub(a, center)) < 0 ? mul(n, -1) : n;
}

/** Refração vetorial; devolve null quando há reflexão interna total. */
function refract(dir: Vec, normalTowardIncident: Vec, eta: number): Vec | null {
  const cosi = -dot(normalTowardIncident, dir);
  const k = 1 - eta * eta * (1 - cosi * cosi);
  if (k < 0) return null;
  return norm(add(mul(dir, eta), mul(normalTowardIncident, eta * cosi - Math.sqrt(k))));
}

const reflect = (dir: Vec, n: Vec): Vec => norm(sub(dir, mul(n, 2 * dot(dir, n))));

export interface RayPath {
  /** Pontos do caminho dentro do prisma (da entrada até a saída) */
  inside: Vec[];
  /** Ponto e direção de saída, ou null se o raio ficou preso ou não entrou */
  exit: { point: Vec; dir: Vec } | null;
  /** Ponto de entrada (null se o feixe não acerta o prisma) */
  entry: Vec | null;
  /** Ângulo de incidência na entrada, em graus */
  incidence: number;
  /** Quantas reflexões internas totais aconteceram */
  reflections: number;
}

/** Traça um comprimento de onda pelo prisma. */
export function traceRay(source: Vec, dir: Vec, tri: Vec[], n: number, maxBounces = 6): RayPath {
  const first = intersect(source, dir, tri, -1);
  if (!first) return { inside: [], exit: null, entry: null, incidence: 0, reflections: 0 };

  const nOut = outwardNormal(tri, first.edge);
  const incidence = (Math.acos(Math.min(1, Math.abs(dot(nOut, dir)))) * 180) / Math.PI;
  let d = refract(dir, nOut, 1 / n);
  if (!d) return { inside: [], exit: null, entry: first.point, incidence, reflections: 0 };

  let point = first.point;
  let edge = first.edge;
  const inside: Vec[] = [point];
  let reflections = 0;

  for (let bounce = 0; bounce < maxBounces; bounce++) {
    const hit = intersect(point, d, tri, edge);
    if (!hit) break;
    inside.push(hit.point);
    const out = outwardNormal(tri, hit.edge);
    // Saindo do vidro para o ar: a normal "do lado de onde vem a luz" é a interna
    const refracted = refract(d, mul(out, -1), n);
    if (refracted) return { inside, exit: { point: hit.point, dir: refracted }, entry: first.point, incidence, reflections };
    d = reflect(d, out);
    point = hit.point;
    edge = hit.edge;
    reflections++;
  }

  return { inside, exit: null, entry: first.point, incidence, reflections };
}

/** Desvio angular entre a direção de entrada e a de saída, em graus. */
export function deviation(inDir: Vec, outDir: Vec) {
  return (Math.acos(Math.max(-1, Math.min(1, dot(norm(inDir), norm(outDir))))) * 180) / Math.PI;
}

export { norm, sub };
