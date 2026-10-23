/**
 * Ajustes da pirâmide do encerramento do hero. Pode editar à mão: cada valor está explicado.
 *
 * Para testar ao vivo, rode `npm run dev` e abra http://localhost:5186/?piramide
 * Aparece um painel no canto da tela com um controle para cada valor abaixo. Quando gostar,
 * clique em "Copiar valores" e cole por cima do objeto PYRAMID deste arquivo.
 */
export const PYRAMID = {
  /**
   * Altura do vértice, comparada à altura do triângulo.
   * 1 = de frente, a pirâmide tem exatamente o contorno do triângulo (mesma base, mesmo vértice).
   * Menor que 1 deixa a pirâmide mais baixa; maior que 1, mais alta.
   */
  altura: 1,
  /**
   * Distância da câmera, em px.
   * 0 = sem perspectiva: a base fica parada na mesma linha e só as laterais se movem no giro.
   * Com um valor (ex.: 2600), o lado que vem para a frente fica um pouco maior que o de trás.
   */
  perspectiva: 0,
  /** Quanto ela gira até sair da tela, em graus. Negativo gira para a esquerda. */
  giro: -360,
  /**
   * Parte do giro feita parada no lugar, antes de começar a andar para a esquerda (0 a 1).
   * 0 = já sai andando; 0.3 = gira 30% do caminho no lugar e depois sai.
   */
  paradaNoLugar: 0.25,
  /** Quanto ela anda além da borda esquerda, em lados da pirâmide (abaixo de 0.75 ela não some inteira). */
  saida: 0.9,
  /**
   * Momento em que o triângulo vira pirâmide, como fração do encerramento do hero (0 a 1).
   * Fica depois de a luz apagar (que termina em 0.42). Este valor não aparece no painel.
   */
  inicio: 0.45,
};

export type PyramidConfig = typeof PYRAMID;
