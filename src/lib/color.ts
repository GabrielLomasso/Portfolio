/*
 * Cores saturadas para as faixas do arco-íris. Croma fixo deixa cada matiz com uma
 * saturação diferente (o vermelho claro vira salmão); aqui cada matiz usa o croma máximo
 * que a tela (sRGB) consegue mostrar, numa luminosidade perto do ponto mais saturado dele.
 */

const RAD = Math.PI / 180;

/** OKLCH para sRGB linear (Björn Ottosson, oklab.com) */
function toLinearSrgb(l: number, c: number, h: number) {
  const a = c * Math.cos(h * RAD);
  const b = c * Math.sin(h * RAD);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (l: number, c: number, h: number) => toLinearSrgb(l, c, h).every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** Maior croma visível em sRGB para essa luminosidade e matiz */
function maxChroma(l: number, h: number) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(l, mid, h)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Amarelos só ficam saturados claros; os outros matizes ficam mais escuros, para não lavar. */
const lightnessCap = (h: number) => (h >= 70 && h <= 115 ? 0.88 : 0.72);

const cache = new Map<number, { l: number; c: number }>();

/** Luminosidade e croma mais vivos para o matiz, sem passar do teto de luminosidade */
export function vivid(h: number) {
  const hit = cache.get(h);
  if (hit) return hit;
  let best = { l: 0.6, c: 0 };
  for (let l = 0.4; l <= lightnessCap(h) + 1e-9; l += 0.01) {
    const c = maxChroma(l, h);
    if (c > best.c) best = { l, c };
  }
  cache.set(h, best);
  return best;
}

/** Cor da faixa; `shade` < 1 escurece mantendo o matiz saturado */
export function vividColor(h: number, shade = 1) {
  const { l } = vivid(h);
  const dark = l * shade;
  return `oklch(${dark.toFixed(3)} ${(maxChroma(dark, h) * 0.98).toFixed(3)} ${h})`;
}
