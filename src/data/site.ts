// Conteúdo das seções novas (manifesto em diante).
// Tudo marcado com TODO é provisório: trocar pelos dados reais antes de publicar.

export const CONTACT = {
  // TODO: e-mail e WhatsApp reais
  email: "seu-email@exemplo.com",
  whatsapp: "5531900000000",
  city: "Belo Horizonte",
  timeZone: "America/Sao_Paulo",
  // TODO: confirmar prazo de resposta
  responseTime: "Respondo em até 1 dia útil",
  links: [
    { label: "GitHub", href: "https://github.com/GabrielLomasso" },
    // TODO: LinkedIn real
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ],
};

/**
 * Manifesto: lido palavra por palavra no scroll. Palavras entre *asteriscos*
 * acendem com uma cor do espectro; as outras acendem em branco.
 */
export const MANIFESTO =
  "Eu construo *sites* e *sistemas* para quem precisa que a coisa *funcione* e que seja *lembrada*. Já passou pelas minhas mãos estoque de obra, finanças pessoais, agenda de personal e aluguel de kitnet. Cada projeto atravessa o mesmo *prisma*: entender quem usa, cortar o que sobra e entregar algo *rápido*, *bonito* e simples de manter.";

export const FACTS = [
  { label: "Base", value: "Belo Horizonte, MG" },
  { label: "Dia a dia", value: "Analista de Suporte de Sistemas" },
  { label: "Formação", value: "Ciência da Computação" },
];

export interface SkillBand {
  id: string;
  label: string;
  /** Matiz OKLCH da faixa no analisador */
  hue: number;
  /** 0–1: quanto a faixa "sobe" no analisador */
  level: number;
  summary: string;
  tools: string[];
}

export const SKILL_BANDS: SkillBand[] = [
  {
    id: "front",
    label: "Front-end",
    hue: 25,
    level: 0.95,
    summary: "Interfaces em React com TypeScript, do SPA em Vite ao SSR com TanStack Start e Next.js.",
    tools: ["React", "TypeScript", "Vite", "Next.js", "TanStack Start"],
  },
  {
    id: "ui",
    label: "Interface",
    hue: 75,
    level: 0.9,
    summary: "Design system com Tailwind e shadcn/ui, animação com framer-motion e acessibilidade de verdade.",
    tools: ["Tailwind CSS", "shadcn/ui", "Radix", "framer-motion", "Figma"],
  },
  {
    id: "back",
    label: "Back-end",
    hue: 140,
    level: 0.72,
    summary: "APIs e regras de negócio em Edge Functions e Node, com validação de dados de ponta a ponta.",
    tools: ["Supabase Edge Functions", "Node.js", "APIs REST", "Zod"],
  },
  {
    id: "data",
    label: "Banco de dados",
    hue: 195,
    level: 0.78,
    summary: "Modelagem em PostgreSQL, Row Level Security por usuário e migrations versionadas.",
    tools: ["PostgreSQL", "Supabase", "RLS", "Migrations"],
  },
  {
    id: "pwa",
    label: "PWA e mobile",
    hue: 255,
    level: 0.82,
    summary: "Apps que instalam no celular, funcionam com rede ruim e pensam primeiro na tela pequena.",
    tools: ["vite-plugin-pwa", "Service Worker", "Mobile-first", "Web App Manifest"],
  },
  {
    id: "tools",
    label: "Ferramentas",
    hue: 300,
    level: 0.88,
    summary: "Fluxo com Git, protótipo rápido no Lovable e desenvolvimento assistido por IA com Claude Code.",
    tools: ["Git e GitHub", "Lovable", "Claude Code", "Bun", "Cloudflare Pages"],
  },
];

/** Etapas reais de um projeto, na ordem em que acontecem. */
export const PROCESS = [
  {
    title: "Conversa",
    hue: 25,
    text: "Entendo o negócio antes da tela: quem vai usar, o que dói hoje e o que precisa estar pronto primeiro.",
    output: "Escopo em uma página",
  },
  {
    title: "Protótipo",
    hue: 95,
    text: "Em poucos dias você clica num protótipo de verdade. É mais barato errar aqui do que no código final.",
    output: "Protótipo navegável",
  },
  {
    title: "Construção",
    hue: 160,
    text: "Código, banco, login e regras de negócio. Commits pequenos, para dar pra voltar atrás em qualquer passo.",
    output: "Sistema funcionando",
  },
  {
    title: "Teste",
    hue: 230,
    text: "No celular de verdade, com dados de verdade. Desempenho, acessibilidade e os casos que ninguém lembra.",
    output: "Checklist aprovado",
  },
  {
    title: "No ar",
    hue: 300,
    text: "Deploy, domínio e o primeiro mês de ajustes junto com quem usa. Site no ar é começo, não fim.",
    output: "Link para compartilhar",
  },
];

// TODO: números provisórios do painel; trocar pelos reais (Lighthouse, commits etc.)
export const METRICS = [
  { label: "Projetos no ar", value: 6, suffix: "" },
  { label: "Lighthouse médio", value: 97, suffix: "" },
  { label: "Commits em 2026", value: 1240, suffix: "" },
  { label: "Disponibilidade", value: 99.9, suffix: "%", decimals: 1 },
];

export const LOG_LINES = [
  "deploy storix · build ok em 41s",
  "olkos · relatório de outubro gerado",
  "kitnets-bh · lista de espera +1",
  "thaylor · agendamento via WhatsApp",
  "scala-studio · migration 0006 aplicada",
  "ascend · cache de alimentos aquecido",
  "lighthouse · 98 desempenho / 100 acessibilidade",
  "storix · saída de cimento registrada na obra 2",
  "olkos · meta de reserva atingida",
  "backup diário concluído",
];

export interface Track {
  title: string;
  /** "Duração" da faixa: o período */
  period: string;
  note: string;
}

// TODO: revisar a trajetória (datas e textos são provisórios)
export const SIDE_A: Track[] = [
  { title: "Curiosidade", period: "antes de tudo", note: "O primeiro site, feito para descobrir como a internet funcionava por dentro." },
  { title: "Ciência da Computação", period: "em curso", note: "A base teórica: algoritmos, banco de dados e engenharia de software." },
  { title: "IA no fluxo", period: "2025 — hoje", note: "Lovable para prototipar em dias e Claude Code para levar ao código de produção." },
];

export const SIDE_B: Track[] = [
  { title: "Suporte de Sistemas", period: "hoje", note: "Analista de Suporte: ver de perto onde os sistemas travam para quem usa." },
  { title: "Landing pages", period: "2026", note: "Páginas de captação para profissionais de BH, pensadas para converter no WhatsApp." },
  { title: "Sistemas sob medida", period: "2026 — hoje", note: "Estoque de obra, gestão de construtora e finanças: sistemas completos com banco e login." },
];
