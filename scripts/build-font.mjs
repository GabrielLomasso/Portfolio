// Gera public/fonts/fajardo-cyber.otf: fonte própria para o nome, inspirada na
// estética dos títulos cyberpunk — traços de lâmina, pontas afiadas, espinhos
// passando da linha de base e barras que varrem para o lado. Não é cópia de
// nenhum logo: as letras são desenhadas do zero.
//
// Rodar: npm run build:font
//
// Cada glifo é desenhado em pé, num grid de 1000 unidades por em (altura de
// maiúscula 700), como uma lista de polígonos. Polígonos podem se sobrepor
// (o preenchimento nonzero une tudo); os marcados com hole viram furos.
// Depois o script aplica o corte com deslocamento e a inclinação.
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import polygonClipping from "polygon-clipping";

const H = 700; // altura de maiúscula
const V = 145; // haste vertical
const B = 135; // barra horizontal
const SLANT = 0.24; // ~13°
const CUT_GAP = 22; // vão do corte horizontal
const CUT_SHIFT = -14; // a parte de baixo escorrega para a esquerda
const SIDE = 20; // espaço lateral de cada letra

const hole = (pts) => ({ hole: true, pts });

/**
 * Letras: largura (avanço, sem contar espinhos), polígonos e a altura do corte.
 * Os espinhos podem invadir a letra vizinha de propósito.
 */
const GLYPHS = {
  G: {
    w: 640,
    cut: 455,
    shapes: (W) => [
      // barra de cima com lâmina para a esquerda e ponta para a direita
      [[-90, H], [W + 70, H], [W - 70, H - B], [V, H - B]],
      [[0, 90], [90, 0], [V, 0], [V, H], [0, H - 40]],
      [[60, 0], [W - 50, 0], [W, 50], [W, B], [V, B]],
      [[W - V, B - 1], [W, B - 1], [W, 340], [W - V, 340]],
      [[W - 300, 225], [W, 225], [W, 340], [W - 230, 340]],
    ],
  },
  A: {
    w: 640,
    cut: 500,
    shapes: (W) => [
      [[0, -90], [V, 0], [V, 240], [W - V, 240], [W - V, 20], [W, -50], [W, H - 40], [W - 40, H], [210, H], [0, H - 210]],
      hole([[V, 365], [W - V, 365], [W - V, H - B], [V + 115, H - B], [V, H - B - 115]]),
    ],
  },
  B: {
    w: 650,
    cut: 560,
    shapes: (W) => [
      [[0, -70], [V, 0], [W - 110, 0], [W, 110], [W, 300], [W - 55, 355], [W - 40, 370], [W - 40, H - 100], [W - 140, H], [0, H]],
      hole([[V, B], [W - V - 60, B], [W - V, B + 60], [W - V, 290], [V, 290]]),
      hole([[V, 410], [W - 40 - V, 410], [W - 40 - V, H - B - 60], [W - 40 - V - 60, H - B], [V, H - B]]),
    ],
  },
  D: {
    w: 640,
    cut: 470,
    shapes: (W) => [
      [[0, 0], [W - 170, 0], [W, 170], [W, H - 140], [W - 140, H], [-70, H], [0, H - 70]],
      hole([[V, B], [W - V - 75, B], [W - V, B + 75], [W - V, H - B - 60], [W - V - 60, H - B], [V, H - B]]),
    ],
  },
  E: {
    w: 600,
    cut: 520,
    shapes: (W) => [
      // pontas das barras viram setas para fora: a de baixo aponta pela base, a de cima pelo topo
      [[0, 0], [W, 0], [W - 80, B], [V, B], [V, 290], [W - 70, 290], [W - 140, 410], [V, 410], [V, H - B], [W - 70, H - B], [W + 30, H], [0, H]],
    ],
  },
  F: {
    w: 590,
    cut: 440,
    shapes: (W) => [
      // haste com espinho abaixo da base e barra de cima varrendo para a direita
      [[0, -90], [V, 0], [V, 280], [W - 120, 280], [W - 180, 400], [V, 400], [V, H - B], [W - 20, H - B], [W + 150, H], [0, H]],
    ],
  },
  I: {
    w: V,
    cut: 470,
    shapes: () => [[[0, -60], [V, 0], [V, H + 50], [0, H]]],
  },
  J: {
    w: 580,
    cut: 380,
    shapes: (W) => [
      // haste da direita desce além da base num espinho; gancho curto à esquerda
      [[W - V, -60], [W, -210], [W, H + 40], [W - V, H]],
      [[60, 0], [W - V + 1, 0], [W - V + 1, B], [V, B]],
      [[0, 60], [60, 0], [V, 0], [V, 230], [0, 260]],
    ],
  },
  L: {
    w: 560,
    cut: 400,
    shapes: (W) => [
      // barra de baixo vira uma lâmina longa que passa da letra
      [[0, 0], [W + 210, 0], [W - 40, B], [V, B], [V, H + 50], [0, H]],
    ],
  },
  O: {
    w: 660,
    cut: 410,
    shapes: (W) => [
      [[30, 0], [W - 110, 0], [W, 110], [W, H - 30], [W - 30, H], [150, H], [0, H - 150], [0, 30]],
      // espinho no alto à direita (embaixo leria como Q)
      [[W - 150, H], [W + 70, H + 60], [W, H - 120]],
      hole([[V, B], [W - V - 30, B], [W - V, B + 30], [W - V, H - B], [V + 60, H - B], [V, H - B - 60]]),
    ],
  },
  R: {
    w: 650,
    cut: 430,
    shapes: (W) => [
      [[0, -80], [V, 0], [V, 270], [W - V, 270], [W, 330], [W, H - 110], [W - 110, H], [0, H]],
      hole([[V, 395], [W - V, 395], [W - V, H - B - 60], [W - V - 60, H - B], [V, H - B]]),
      // perna em lâmina, afinando até um espinho abaixo da base
      [[250, 290], [400, 290], [W + 40, -110], [W - 120, 0]],
    ],
  },
};

const BIG = 5000;
const band = (y0, y1) => [[[-BIG, y0], [BIG, y0], [BIG, y1], [-BIG, y1]]];

function buildGlyph(char, spec) {
  // União dos traços menos os furos, com operações booleanas de verdade: assim o
  // corte não deixa "pontes" de largura zero que o navegador desenha como fio.
  const shapes = spec.shapes(spec.w);
  const fills = shapes.filter((s) => Array.isArray(s)).map((pts) => [pts]);
  const holes = shapes.filter((s) => !Array.isArray(s)).map((s) => [s.pts]);
  let glyph = polygonClipping.union(...fills);
  if (holes.length) glyph = polygonClipping.difference(glyph, ...holes);

  const lower = polygonClipping
    .intersection(glyph, band(-BIG, spec.cut - CUT_GAP / 2))
    .map((poly) => poly.map((ring) => ring.map(([x, y]) => [x + CUT_SHIFT, y])));
  const upper = polygonClipping.intersection(glyph, band(spec.cut + CUT_GAP / 2, BIG));

  // Anéis externos saem anti-horários e furos horários, que é o que o preenchimento nonzero espera.
  const glyphPath = new opentype.Path();
  for (const poly of [...lower, ...upper]) {
    for (const ring of poly) {
      ring.slice(0, -1).forEach(([x, y], i) => {
        const px = Math.round(x + SIDE + y * SLANT);
        const py = Math.round(y);
        if (i === 0) glyphPath.moveTo(px, py);
        else glyphPath.lineTo(px, py);
      });
      glyphPath.close();
    }
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
  descender: -250,
  designer: "Gabriel Fajardo",
  glyphs,
});

const out = path.resolve(import.meta.dirname, "../public/fonts/fajardo-cyber.otf");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(font.toArrayBuffer()));
console.log(`Fonte gerada: ${out} (${Object.keys(GLYPHS).join("")})`);
