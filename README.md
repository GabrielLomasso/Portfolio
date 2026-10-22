# Gabriel Fajardo — Portfólio

Portfólio pessoal. O nome abre a página em letras de vidro, cortado por um feixe de luz que sai do outro lado aberto em espectro. Ao rolar, os projetos atravessam um túnel 3D e o nome assume a cor de cada um, percorrendo o arco-íris do vermelho ao magenta.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- framer-motion
- Estrutura compatível com shadcn/ui (`components.json`, `src/components/ui`, alias `@/`)

## Rodando

```bash
npm install
npm run dev
```

Abre em http://localhost:5186.

## Onde mexer

- `src/data/projects.ts` — lista de projetos (nome, tipo, descrição, stack, matiz da cor, screenshot)
- `src/components/ui/glass-text.tsx` — texto de vidro (camadas em `src/index.css`, classes `.glass-*`)
- `src/components/ui/perspective-tunnel.tsx` — túnel 3D, adaptado do *perspective-tunnel-hero* do 21st.dev para usar o scroll da página
- `src/components/portfolio/` — hero, feixe do prisma, cards e trilho de projetos

Screenshots reais dos projetos vão em `public/projects/<slug>.webp`; enquanto não existem, cada card mostra um mock da interface.
