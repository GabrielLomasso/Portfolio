/**
 * Detalhe de cada projeto, aberto ao clicar na cor dele em "Meus projetos".
 * Escrito a partir do que eu sabia de cada um. Os trechos marcados com TODO são suposições:
 * confirme ou troque pelo que o cliente realmente disse.
 */
export interface ProjectDetail {
  /** O que é, em uma ou duas frases */
  about: string;
  /** Para quem foi feito */
  client: string;
  /** As dores do cliente */
  pains: string[];
  /** Como resolvemos cada uma */
  solutions: string[];
  /** Com o que foi feito (completo; o card do túnel mostra só o principal) */
  stack: string[];
  status: string;
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  thaylor: {
    about:
      "Landing page de um personal trainer de Belo Horizonte, com a chamada \"Treino Pesado, Corpo Novo\". A página apresenta o trabalho dele e leva o visitante a marcar a primeira aula.",
    client: "Thaylor, personal trainer em Belo Horizonte",
    // TODO: confirmar as dores com o Thaylor
    pains: [
      "Não tinha um lugar próprio para apresentar o método e os planos; tudo dependia de conversa no Instagram.",
      "Quem chegava por indicação não tinha onde conferir o trabalho antes de chamar.",
    ],
    solutions: [
      "Uma página única, leve no celular, com um caminho só: marcar a primeira aula.",
      "Cada alteração pedida vira um registro próprio no histórico, então dá para saber o que mudou e quando.",
    ],
    stack: ["React", "TanStack Start", "Vite", "Tailwind", "Bun"],
    status: "Entregue", // TODO: confirmar se está no ar
  },
  "kitnets-bh": {
    about:
      "Site de aluguel de kitnets em Santa Efigênia, Belo Horizonte, para estudantes e jovens trabalhadores. Mostra as kitnets livres e guarda uma lista de espera quando todas estão ocupadas.",
    client: "Proprietário das kitnets, em Santa Efigênia",
    pains: [
      "O endereço completo não podia ficar exposto na internet.",
      "Com todas as kitnets ocupadas, quem se interessava não tinha como deixar contato.",
      "O cadastro das kitnets fica em outro sistema, e o site precisava ler de lá sem duplicar nada.",
    ],
    solutions: [
      "O site mostra só o bairro; o endereço vai pelo WhatsApp quando a visita é marcada.",
      "Lista de espera própria e uma chave que faz o site agir como \"nenhuma livre\" sem mudar o resto da página.",
      "API versionada (/api/v1), documentada em OpenAPI, para o sistema de gestão alimentar o site.",
      "Identidade própria, a etiqueta de chave com o código real de cada kitnet. Nota 100 em acessibilidade e SEO no Lighthouse mobile.",
    ],
    stack: ["Next.js 16", "TypeScript", "Tailwind v4", "Zod", "OpenAPI"],
    status: "Pronto, aguardando os dados do proprietário",
  },
  olkos: {
    about:
      "PWA de finanças pessoais. Junta os gastos de vários bancos num lugar só, fecha o relatório do mês e acompanha metas.",
    client: "Projeto próprio",
    pains: [
      "Gastos espalhados em cinco contas (Nubank, Mercado Pago, BTG, Alelo e Swile), cada uma com o seu extrato.",
      "Subir o mesmo extrato duas vezes duplicava tudo.",
      "Lançar compra por compra à mão não dura uma semana.",
    ],
    solutions: [
      "Importação de CSV com leitor próprio para cada banco e deduplicação por hash SHA-256 de data, valor e descrição.",
      "No Nubank é automático: o e-mail da compra vira transação, via Google Apps Script e Edge Function.",
      "Visual \"Noir\": o app é preto e branco, e a cor fica só para os dados.",
      "Nenhuma credencial de banco é guardada.",
    ],
    stack: ["React", "TypeScript", "Vite", "Supabase", "Edge Functions", "Recharts", "shadcn/ui", "PWA"],
    status: "Em desenvolvimento",
  },
  ascend: {
    about:
      "Ficha de treino e dieta no celular, feita para uso próprio e pensada para personal trainers acompanharem os alunos.",
    client: "Projeto próprio, com perfil para personal trainers",
    pains: [
      "Anotar carga e série em papel ou planilha no meio do treino.",
      "Academia com sinal ruim: registrar uma série não podia depender de internet.",
      "Buscar \"biceps\" não achava \"Bíceps\": a busca do banco ignora maiúsculas, mas não acentos.",
    ],
    solutions: [
      "Modo de execução offline: cada série entra numa fila no aparelho e sobe quando a conexão volta, sem duplicar.",
      "Catálogo com 873 exercícios em português e 593 alimentos da tabela TACO.",
      "Metas de calorias e macros calculadas por fórmula (Mifflin-St Jeor); a IA só explica os números, não inventa nenhum.",
      "Perfis de atleta, personal e aluno, com convite por link.",
    ],
    stack: ["React 19", "TanStack Start", "Tailwind 4", "shadcn/ui", "Lovable Cloud", "IndexedDB", "Bun"],
    status: "Publicado e em uso",
  },
  "scala-studio": {
    about:
      "Sistema de gestão de obras para uma construtora familiar: cerca de 25 funcionários e até quatro obras ao mesmo tempo. Reúne equipes, diário de obra e o custo de cada obra.",
    client: "Construtora de um engenheiro e da esposa",
    // TODO: confirmar as dores com o cliente
    pains: [
      "Equipes, diário de obra e gastos controlados em lugares diferentes.",
      "Difícil saber quanto cada obra já custou enquanto ela ainda está andando.",
    ],
    solutions: [
      "Todos os módulos mapeados antes do código: as telas que ainda faltam avisam \"em construção\", e o dono acompanha o que já está pronto.",
      "Banco com migrações versionadas e regras de acesso por usuário.",
      "PWA para usar no canteiro, pelo celular.",
    ],
    stack: ["React", "TypeScript", "Vite", "Tailwind v4", "Supabase", "PWA", "Cloudflare Pages"],
    status: "Em desenvolvimento",
  },
  storix: {
    about:
      "Controle de estoque de obra para a Empreiteira Bispo, no lugar do caderno. Feito para várias empresas desde o início, para poder virar produto para outras empreiteiras.",
    client: "Empreiteira Bispo",
    pains: [
      "Material e ferramenta sumindo, sem registro de quem pegou o quê.",
      "Controle todo em papel, sem histórico.",
      "Quatro obras ao mesmo tempo, e quase todo o uso pelo celular.",
    ],
    solutions: [
      "QR code em cada item: a câmera lê a etiqueta e abre direto a movimentação.",
      "Um fluxo para cada tipo: empréstimo de equipamento, entrega de EPI com validade e assinatura (NR-6), entrada e saída de material com alerta de estoque crítico.",
      "Etiquetas impressas em lote, em folha A4 ou em rolo de impressora térmica.",
      "Nota fiscal anexada à movimentação, permissões por obra e cada empresa isolada no banco.",
    ],
    stack: ["React", "TypeScript", "TanStack Start", "Tailwind", "shadcn/ui", "Supabase"],
    status: "Primeira versão entregue",
  },
};
