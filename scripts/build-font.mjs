// Gera public/fonts/fajardo-cyber.otf: fonte própria para o nome, inspirada na
// estética dos títulos cyberpunk (inclinada, pesada, cantos chanfrados e um corte
// horizontal deslocado em cada letra). Não é cópia de nenhum logo.
//
// Rodar: npm run build:font
//
// Cada glifo é desenhado em pé, num grid de 1000 unidades por em (altura de
// maiúscula 700). Depois o script aplica o corte com deslocamento e a inclinação.
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const H = 700; // altura de maiúscula
const T = 180; // haste vertical
const Th = 150; // barra horizontal
const SLANT = 0.2; // ~11°
const CUT_GAP = 26; // vão do corte horizontal
const CUT_SHIFT = -16; // a parte de baixo escorrega para a esquerda
const SIDE = 28; // espaço lateral de cada letra

/**
 * Letras: largura, contornos (o primeiro é o externo, os demais são furos) e a
 * altura do corte. As alturas variam de letra para letra para o corte formar
 * uma linha quebrada ao longo da palavra.
 */
const GLYPHS = {
  A: {
    w: 660,
    cut: 500,
    contours: (W) => [
      [[0, 0], [T, 0], [T, 240], [W - T, 240], [W - T, 0], [W, 0], [W, H - 30], [W - 30, H], [200, H], [0, H - 200]],
      [[T, 370], [W - T, 370], [W - T, H - Th], [T + 110, H - Th], [T, H - Th - 110]],
    ],
  },
  B: {
    w: 670,
    cut: 560,
    contours: (W) => [
      [[0, 0], [W - 110, 0], [W, 110], [W, 300], [W - 55, 355], [W - 40, 370], [W - 40, H - 100], [W - 140, H], [0, H]],
      [[T, Th], [W - T - 60, Th], [W - T, Th + 60], [W - T, 285], [T, 285]],
      [[T, 415], [W - 40 - T, 415], [W - 40 - T, H - Th - 60], [W - 40 - T - 60, H - Th], [T, H - Th]],
    ],
  },
  D: {
    w: 640,
    cut: 470,
    contours: (W) => [
      [[0, 0], [W - 170, 0], [W, 170], [W, H - 170], [W - 170, H], [0, H]],
      [[T, Th], [W - T - 80, Th], [W - T, Th + 80], [W - T, H - Th - 80], [W - T - 80, H - Th], [T, H - Th]],
    ],
  },
  E: {
    w: 600,
    cut: 520,
    contours: (W) => [
      [[0, 0], [W - 50, 0], [W, Th], [T, Th], [T, 290], [W - 130, 290], [W - 80, 410], [T, 410], [T, H - Th], [W - 50, H - Th], [W, H], [0, H]],
    ],
  },
  F: {
    w: 580,
    cut: 440,
    contours: (W) => [
      [[0, 0], [T, 0], [T, 280], [W - 130, 280], [W - 80, 400], [T, 400], [T, H - Th], [W - 50, H - Th], [W, H], [0, H]],
    ],
  },
  G: {
    w: 660,
    cut: 455,
    contours: (W) => [
      [[60, 0], [W - 110, 0], [W, 110], [W, 380], [W - 260, 380], [W - 260, 270], [W - T, 270], [W - T, Th], [T, Th], [T, H - Th - 60], [T + 60, H - Th], [W, H - Th], [W, H], [150, H], [0, H - 150], [0, 60]],
    ],
  },
  I: {
    w: T,
    cut: 470,
    contours: () => [[[0, 0], [T, 0], [T, H], [0, H]]],
  },
  J: {
    w: 560,
    cut: 380,
    contours: (W) => [
      [[90, 0], [W - 110, 0], [W, 110], [W, H], [W - T, H], [W - T, Th], [T, Th], [T, 230], [0, 230], [0, 90]],
    ],
  },
  L: {
    w: 560,
    cut: 400,
    contours: (W) => [[[0, 0], [W - 50, 0], [W, Th], [T, Th], [T, H], [0, H]]],
  },
  O: {
    w: 660,
    cut: 410,
    contours: (W) => [
      [[30, 0], [W - 110, 0], [W, 110], [W, H - 30], [W - 30, H], [150, H], [0, H - 150], [0, 30]],
      [[T, Th], [W - T - 30, Th], [W - T, Th + 30], [W - T, H - Th], [T + 60, H - Th], [T, H - Th - 60]],
    ],
  },
  R: {
    w: 650,
    cut: 430,
    contours: (W) => [
      [[0, 0], [T, 0], [T, 270], [W - T - 90, 270], [W - T, 180], [W - T, 0], [W, 0], [W, 230], [W - 50, 280], [W, 330], [W, H - 110], [W - 110, H], [0, H]],
      [[T, 400], [W - T, 400], [W - T, H - Th - 60], [W - T - 60, H - Th], [T, H - Th]],
    ],
  },
};

const area = (poly) => poly.reduce((sum, [x1, y1], i) => {
  const [x2, y2] = poly[(i + 1) % poly.length];
  return sum + x1 * y2 - x2 * y1;
}, 0) / 2;

/** Sutherland–Hodgman contra um semiplano horizontal. keep(y) diz que lado fica. */
function clipHorizontal(poly, yc, keepBelow) {
  const inside = ([, y]) => (keepBelow ? y <= yc : y >= yc);
  const cross = ([x1, y1], [x2, y2]) => [x1 + ((yc - y1) / (y2 - y1)) * (x2 - x1), yc];
  const out = [];
  poly.forEach((cur, i) => {
    const prev = poly[(i + poly.length - 1) % poly.length];
    if (inside(cur)) {
      if (!inside(prev)) out.push(cross(prev, cur));
      out.push(cur);
    } else if (inside(prev)) {
      out.push(cross(prev, cur));
    }
  });
  return out;
}

function buildGlyph(char, spec) {
  const contours = spec.contours(spec.w).map((poly, i) => {
    // Externo anti-horário (área positiva), furos horário — o preenchimento nonzero recorta os furos.
    const positive = area(poly) > 0;
    return (i === 0) === positive ? poly : [...poly].reverse();
  });

  const pieces = contours.flatMap((poly) => [
    clipHorizontal(poly, spec.cut - CUT_GAP / 2, true).map(([x, y]) => [x + CUT_SHIFT, y]),
    clipHorizontal(poly, spec.cut + CUT_GAP / 2, false),
  ]).filter((p) => p.length >= 3 && Math.abs(area(p)) > 1);

  const glyphPath = new opentype.Path();
  for (const piece of pieces) {
    piece.forEach(([x, y], i) => {
      const px = Math.round(x + SIDE + y * SLANT);
      const py = Math.round(y);
      if (i === 0) glyphPath.moveTo(px, py);
      else glyphPath.lineTo(px, py);
    });
    glyphPath.close();
  }

  return new opentype.Glyph({
    name: char,
    unicode: char.charCodeAt(0),
    advanceWidth: spec.w + SIDE * 2,
    path: glyphPath,
  });
}

const glyphs = [
  new opentype.Glyph({ name: ".notdef", unicode: 0, advanceWidth: 500, path: new opentype.Path() }),
  new opentype.Glyph({ name: "space", unicode: 32, advanceWidth: 260, path: new opentype.Path() }),
  ...Object.entries(GLYPHS).map(([char, spec]) => buildGlyph(char, spec)),
];

const font = new opentype.Font({
  familyName: "Fajardo Cyber",
  styleName: "Black",
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  designer: "Gabriel Fajardo",
  glyphs,
});

const out = path.resolve(import.meta.dirname, "../public/fonts/fajardo-cyber.otf");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(font.toArrayBuffer()));
console.log(`Fonte gerada: ${out} (${Object.keys(GLYPHS).join("")})`);
