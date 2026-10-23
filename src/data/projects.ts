export type ProjectKind = "Site" | "Sistema" | "PWA" | "Landing page";

/** Layout do mock usado enquanto o projeto não tem screenshot real. */
export type PreviewVariant = "app" | "landing" | "dashboard" | "catalog" | "table" | "grid";

export interface Project {
  slug: string;
  name: string;
  kind: ProjectKind;
  description: string;
  stack: string[];
  /** Matiz OKLCH (0–360). A ordem da lista percorre o espectro, do vermelho ao magenta. */
  hue: number;
  preview: PreviewVariant;
  /** Screenshot em /public/projects (opcional). Sem ela, o card mostra o mock. */
  image?: string;
  href?: string;
  /** Fora do site por enquanto; os dados ficam aqui para voltar depois. */
  hidden?: boolean;
}

// TODO: trocar os mocks por screenshots reais (public/projects/<slug>.webp) e adicionar links
export const PROJECTS: Project[] = [
  {
    slug: "thaylor",
    name: "Thaylor Personal",
    kind: "Landing page",
    description: "Página de captação para personal trainer em Belo Horizonte, feita para agendar a primeira aula.",
    stack: ["React", "TanStack Start", "Tailwind"],
    hue: 22,
    preview: "landing",
    image: "/projects/thaylor.webp",
  },
  {
    slug: "kitnets-bh",
    name: "Kitnets BH",
    kind: "Site",
    description: "Site de aluguel de kitnets em Santa Efigênia, com lista de espera e API própria.",
    stack: ["Next.js", "Tailwind", "Zod"],
    hue: 88,
    preview: "landing",
  },
  {
    slug: "olkos",
    name: "Olkos",
    kind: "PWA",
    description: "Finanças pessoais: junta os gastos de vários bancos, fecha o relatório do mês e acompanha metas.",
    stack: ["React", "Supabase", "Recharts"],
    hue: 148,
    preview: "dashboard",
  },
  {
    slug: "ascend",
    name: "ASCEND",
    kind: "PWA",
    description: "Ficha de treino e dieta no celular, com base de alimentos da TACO e do Open Food Facts.",
    stack: ["React", "TanStack Start", "Lovable Cloud"],
    hue: 185,
    preview: "app",
  },
  {
    slug: "scala-studio",
    name: "Scala Studio",
    kind: "Sistema",
    description: "Gestão de obras de uma construtora: equipes, diário de obra e custo de cada obra.",
    stack: ["React", "Supabase", "PWA"],
    hue: 262,
    preview: "table",
  },
  {
    slug: "storix",
    name: "Storix",
    kind: "Sistema",
    description: "Controle de estoque de obra para várias empresas: entradas, saídas e saldo por obra, no lugar do caderno.",
    stack: ["React", "Supabase", "shadcn/ui"],
    hue: 298,
    preview: "table",
  },
  {
    slug: "lazinho",
    name: "Lazinho Automóveis",
    kind: "Site",
    description: "Catálogo de seminovos com contato direto pelo WhatsApp, sem depender de portal de anúncios.",
    stack: ["React", "Supabase", "Tailwind"],
    hue: 225,
    preview: "catalog",
    hidden: true,
  },
  {
    slug: "meep-hotel",
    name: "MEEP Hotel",
    kind: "Sistema",
    description: "Um só sistema para hotel, sauna e serviço programado, com cobrança por tempo e por faixa de horário.",
    stack: ["React", "Supabase", "shadcn/ui"],
    hue: 298,
    preview: "grid",
    hidden: true,
  },
  {
    slug: "dra-larissa",
    name: "Dra. Larissa",
    kind: "Landing page",
    description: "Proposta de landing page para uma biomédica esteta na Savassi.",
    stack: ["React", "Tailwind v4"],
    hue: 338,
    preview: "landing",
    hidden: true,
  },
];
