# Resumo da madrugada (23/10/2026)

Tudo desta noite está na branch **`secoes-novas`**. A versão de antes está guardada na tag **`v1-hero-prisma`** e na branch `main`, que não foi tocada.

## Como ver e como voltar

```bash
git checkout secoes-novas   # site com as seções novas (é onde a pasta ficou)
git checkout main           # volta exatamente para como estava antes desta noite
```

Para ficar com as seções novas de vez: `git checkout main && git merge secoes-novas && git push`.

## Regra seguida

Nada do que existia foi editado ou apagado. O hero, o túnel de projetos, o prisma e o rodapé estão iguais. As mudanças em arquivos existentes foram só inclusões:

- `src/App.tsx`: inclui as seções novas, a barra de progresso, a paleta de comandos e o easter egg.
- `src/index.css`: blocos novos adicionados no fim do arquivo.
- `package.json`: scripts `build:changelog` e dependências de desenvolvimento.

## O que entrou, na ordem da página

1. **Manifesto**: texto que acende palavra por palavra no scroll; palavras-chave em cores do espectro.
2. **Espectro de habilidades**: analisador de áudio em canvas; cada faixa é uma área (front-end, interface, back-end, banco, PWA, ferramentas). Botão **Ligar som** transforma em instrumento.
3. **Processo**: as cinco etapas reais de um projeto num scroll horizontal fixado, com um ponto de luz percorrendo o trilho. No celular vira lista.
4. **Do rascunho ao ar**: divisória arrastável entre o wireframe anotado e o print do Thaylor.
5. **Laboratório**: bento com seis componentes vivos (refração, paleta OKLCH que copia o hex, lista arrastável, glitch editável, interruptor, odômetro).
6. **Brinque com a luz**: prisma com física de verdade; arraste a lanterna, mude dispersão e mira.
7. **Painel do sistema**: métricas com contagem, gráfico ao vivo, log rolando e um terminal com comandos (`ajuda`, `projetos`, `stack`, `processo`, `contato`, `sudo contratar`, `pinkfloyd`).
8. **Lado A, lado B**: trajetória como contracapa de disco; vinil gira, braço pousa na faixa escolhida.
9. **Este site, commit a commit**: histórico real do Git (`npm run build:changelog` atualiza).
10. **Perguntas frequentes**: acordeão com mini prisma.
11. **Contato**: e-mail que copia, WhatsApp, relógio de BH e formulário que valida e abre o WhatsApp com a mensagem pronta.

Extras: barra de progresso em espectro no topo, paleta de comandos (**Ctrl+K**, botão no canto inferior esquerdo depois da abertura) e o easter egg (digite **prisma**).

A pesquisa (183 portfólios, tendências e padrões web) e de onde veio cada ideia estão em `docs/pesquisa-referencias.md`.

## O que é provisório e precisa dos seus dados

Tudo marcado com `TODO` em `src/data/site.ts`:

- **E-mail, WhatsApp e LinkedIn** (`CONTACT`): estão com valores de exemplo.
- **Prazo de resposta** do contato.
- **Números do painel** (`METRICS`): 6 projetos, Lighthouse 97, 1.240 commits e 99,9% são de exemplo.
- **Trajetória** (`SIDE_A`, `SIDE_B`): textos e datas foram escritos por mim a partir do que eu sabia.
- **Perguntas frequentes** (`FAQ`): prazos e a forma de cobrar precisam da sua confirmação.
- **Manifesto e habilidades**: revise se o texto soa como você.

## O que eu não consegui verificar

- **O som do analisador**: testei só o liga/desliga, sem passar o mouse, para não tocar nada no seu computador de madrugada.
- **"Reduzir movimento" do sistema**: o código respeita a preferência em todas as seções, mas não consegui simular a preferência no navegador de testes.
- **Safari e iPhone de verdade**: testei no Chrome do app, em desktop e na emulação de celular (375 px).
- O aviso de `NaN` no console vem do cálculo da legenda do hero no primeiro render (código anterior a esta noite); não mexi por causa da regra de não editar.
