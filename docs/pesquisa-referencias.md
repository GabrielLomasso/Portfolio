# Pesquisa de referências — seções novas do portfólio

Feita em 23/10/2026, antes de criar as seções novas (branch `secoes-novas`). O estado anterior está na tag `v1-hero-prisma`.

## Como foi feita

Foram levantados **183 portfólios** em cinco listas curadas, mais artigos de tendências 2026 e de padrões web (CSS scroll-driven animations, View Transitions). A maior parte foi avaliada pela descrição e pelas imagens das próprias listas, e não abrindo site por site: vários são WebGL pesado que não abre bem fora de um navegador real. A ideia de cada um está resumida em uma linha.

Fontes:

- [Muzli — 100 Best Designer Portfolio Websites of 2026](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/)
- [Really Good Designs — 18 Interactive Portfolio Examples](https://reallygooddesigns.com/interactive-portfolio-examples/)
- [Really Good Designs — 30 Unique Portfolio Websites](https://reallygooddesigns.com/unique-portfolio-websites/)
- [Site Builder Report — 29 Web Designer & Developer Portfolios (2026)](https://www.sitebuilderreport.com/inspiration/web-developer-designer-portfolios)
- [WeAreDevelopers — Web Developer Portfolio Inspiration](https://www.wearedevelopers.com/magazine/561-web-developer-portfolio-inspiration-and-examples-march-2025)
- [AdPlist — 11 Best Design Portfolio Examples (2026)](https://adplist.org/blog/top-11-design-portfolio-examples-for-inspiration), [Wegic — 15 Modern Portfolio Examples](https://wegic.ai/inspiration/best-modern-portfolio-website-design-examples), [Figma — 23 Portfolio Website Examples](https://www.figma.com/resource-library/portfolio-website-examples/), [Hostinger — 25 Portfolio Examples](https://www.hostinger.com/tutorials/portfolio-website-examples/)
- [Awwwards — Portfolio](https://www.awwwards.com/websites/portfolio/) e [Developer Award](https://www.awwwards.com/websites/developer/)
- Codrops: [case study Stefan Vitasović](https://tympanus.net/codrops/?p=88357), [demos de scroll](https://tympanus.net/codrops/demos/?tag=scroll), [scroll-driven animations com CSS](https://tympanus.net/codrops/?p=75216)
- Tendências: [Line25 — Web Design Trends 2026](https://line25.com/articles/web-design-trends-2026/), [The Plus Addons — trends 2026](https://theplusaddons.com/blog/web-design-trends-2026/), [Tiny Frog — In and Out](https://tinyfrog.com/web-design-trends)
- Padrões web: [Scroll-driven animations sem JS](https://rebeccamdeprey.com/blog/scroll-driven-animations-css), [scroll-linked view transition header](https://freefrontend.com/code/scroll-linked-view-transition-header-2026-02-05/), [scroll-driven view transitions](https://freefrontend.com/code/scroll-driven-view-transitions-2026-03-12/), [Cyd Stumpel — CSS no lugar de GSAP](https://cydstumpel.nl/about/)

## O que se repete (e por isso evitei copiar)

- Hero com nome gigante + lista de projetos em grid. O seu hero já resolve isso de outro jeito.
- Cursor customizado em bolinha e "magnetic button" em todo lugar.
- Mundo 3D navegável (Bruno Simon, Jesse Zhou, Maxime Guillon): impressiona, mas é pesado, foge do que você vende (sites e sistemas que funcionam) e brigaria com o túnel.
- Bento grid de "features" com ícone + título + texto. Usei a estrutura de bento só onde cada tile faz algo de verdade (o laboratório).

## Ideias que entraram e de onde vieram

| Seção nova | Ideia | Referências |
|---|---|---|
| Manifesto | Texto grande que acende palavra por palavra conforme o scroll, cada palavra pegando uma cor do espectro | Joe Garner (revelação por capítulos), Mat Voyce e Joseph San (tipografia cinética), Jordyn Brenner |
| Espectro de habilidades | Habilidades como um analisador de espectro de áudio: barras que pulsam e reagem ao mouse; passar por uma barra mostra as ferramentas | Ligação com Pink Floyd; Pierre Nel e Max Milkin (objetos que reagem ao cursor), Yifei Luo (playground de hover) |
| Processo | As etapas reais de um projeto num scroll horizontal fixado, com o feixe de luz atravessando as etapas | Silvia Sguotti, Rickman, Polygon Design (scroll horizontal), Discover Design (processo em etapas), tendência de seções fixadas com scroll |
| Laboratório | Bento onde cada tile é um componente vivo para mexer: botão com refração, slider de matiz, lista arrastável, texto com glitch, interruptor | André Souza e Lydia Amaruch (elementos arrastáveis), Yifei Luo, Clément Grellier (microinterações), Studio Null (espaços interativos) |
| Painel do sistema | Um painel de monitoramento como de um sistema em produção: métricas animadas, gráfico ao vivo e log rolando | Pensado para mostrar o lado "sistemas"; Phantom.Land (grids cinéticos), Drexler (nostalgia de interface) |
| Terminal | Um terminal que aceita comandos (`ajuda`, `projetos`, `stack`, `contato`...) | Jordan Cruz-Correa (Windows 98 funcional), Robby Leonardi (currículo como jogo) |
| Lado A / Lado B | Trajetória como a contracapa de um disco: faixas com "duração" em anos | Jerald (toca-discos para navegar), André Souza (vitrolas arrastáveis), ligação com a capa do Dark Side |
| Contato | Chamada grande, e-mail que copia com um clique, formulário com validação que monta a mensagem para o WhatsApp, relógio de BH ao vivo | Brittany Chiang (contato direto e honesto), Joe Stanford (clareza), padrão de "copy to clipboard" |

Extras globais, só por inclusão:

- **Barra de progresso em espectro** no topo da página.
- **Paleta de comandos (Ctrl+K)** para pular entre seções, como em ferramentas de desenvolvedor.
- **Luz que segue o cursor** nas seções novas (Brittany Chiang, Stephane Willems).

## Lista completa dos portfólios avaliados

### Really Good Designs — interativos (18)

Wildy Riftian (chaveiro que reage ao cursor) · André Souza (vitrolas, fotos e raspadinha arrastáveis) · Lydia Amaruch (fotos orbitando o título) · Robby Leonardi (currículo como jogo retrô) · Yifei Luo (playground de hover) · Chris Pokrzywa (mesa 3D clicável) · Pierre Nel (formas 3D seguem o cursor) · Stephane Willems (cursor como luz num rosto 3D) · Valeriia Shchebetovska (rastro suave do cursor) · Max Milkin (objetos 3D com rastro) · Jesse Ermens (scroll 3D com efeitos de texto) · Seungyun Shin (forma 3D que segue o cursor) · Jesse Martinez (cubos 3D giráveis) · Joe Garner (storytelling por capítulos no scroll) · Aseem Gautam (formas que mudam no hover) · Dorian Lods (refração WebGL no hover) · Marie Antoine (cursor geométrico gigante) · Maxime Guillon (ilha virtual com objetos = habilidades)

### Muzli — 100 melhores de 2026 (100)

Alche (mundos em Unreal) · Cappen (scroll em camadas) · Brand Appart · 1:09 Ichiki (ilustração fluorescente) · bychudy · Stōkt (3D com movimento) · Sergey Lisovskiy · Orage Studio (renders cinematográficos) · General Condition · Twice · Stiff (tipografia com textura) · Samsy Ninja (gráficos 3D computacionais) · Olha Lazarieva · Grit Pictures (colagem com bordas rasgadas) · L'Étude · T-KO 2.0 (configurar modelos 3D) · Lax Space · KARO Crafts (galeria tátil) · Geex Arts · Abhishek Jha · Chipsa (WebGL para interfaces vivas) · Jens Bosman · Sun Hung · Supersolid · Double Play · MIUX · TUX · Adrien Lamy (colagem e tipografia) · Cyphr Studio · Clay Boan · Hnine Interaction · Bindery · First Frame · We Are Example · Studio Null (espécimes de tipo interativos) · Mikki Sindhunata · Joseph San (tipografia cinética) · Ragged Edge · Thingy & Thingy · Eduard Bodak (ritmo visual) · Robot · Portal One · Studio Herrström · SAMI · Karim Saab (GSAP + Three.js) · Caffè Design · LEOLEO · GM Meme · Reform Collective · Nuageboi · Fine Thought · Jordan Delcros (visuais generativos) · Obys (tipografia refinada) · Laugh Mind · Alternative Aesthetics · Phantom.Land (grids cinéticos em WebGL) · Kidzfrmnowhere · Clément Grellier (microinterações) · Alejandro Mejias · Drexler (interfaces nostálgicas) · Marga Navarro · basement.studio · Nite Riot · Stravagar (interfaces futuristas) · ArtPill · RAYRAYlab · Siena Film · SoScale Media · Mark Clennon · Bulletproof · MenuXL · Poster · Microdot · OddCommon · Yellow Fellow · Stas Bondar (WebGL com GSAP) · Lazy Eight · Photoyoshi · Sarah Oh · Fiddle.Digital · Ottografie · Huge · Ingamana · Mat Voyce (tipografia cinética) · Gianluca Gradogna (scroll infinito) · Johanna Arrieta · NIKI Studio · Alina Papazova · Merodev (visuais generativos em código) · Burocratik · Dipsy · November · Polecat (software como trabalho criativo) · Your Creative · Immersive Garden · La Rue Michel · Utsubo (WebGPU) · dverso · Chain Labs · Roberta Ungaro · ANALOGUE

### Really Good Designs — únicos (30)

Anna Froltsova (preto com pontos de cor) · Just a Web Developer (autorretrato ilustrado) · Kevin Valete · Pudding Studio · Lee Porter · Pierre Couture (formas que viram preview no hover) · Mitchel Eaton · Seth Hampton · MP Kelley · Brad Mace · Natasha Talevski · Robby Leonardi · La Fiorellaia · Lenka's Lens · Max Milkin · Matthew Jones · Zahra Ziaei · Silvia Sguotti (scroll horizontal) · Lisa Maltby · Airborne Studio · Rickman (scroll horizontal + cursor) · Anna McNaught · Polygon Design (casa navegável na horizontal) · Discover Design (processo em quatro etapas) · Atilla Ceylan · Beans Agency · Jordyn Brenner (texto animado no scroll) · Unfauxgettable · Jerald (toca-discos como navegação) · Hocus Pocus

### Site Builder Report — desenvolvedores (29)

Akasha Michelle · Diana Lu (estudos de caso narrativos) · La Playa · Georgi Valk · James Almond · Jan Henneberg (trajetória por empresas) · Michael Mannucci (mostra a própria stack) · Sonja Todd · Nick Stepuk (seção de filosofia de design) · Annie Rudisill · Devon Stank · Kate Gilbert · Make it Dandy · Josh Leibold · Sherman · Nima Yousefi · Lyn Muldrow · Michael Lackey · Jessica Ruiters · Jonathan McMaster · Josh Unger · Kevin Waltermire · Kani Leung · Erin E. Dawson · Leilani Roylo · Sam Bohon · Laura Hines · Joe Stanford (velocidade como argumento) · Henry Hu

### WeAreDevelopers e outros (6)

Tim TB · Jordan Cruz-Correa (Windows 98 funcional) · Jesse Zhou (ramen 3D com máquina de vendas de projetos) · Henri Heymans · Ryan Furrer · Brittany Chiang (brilho que segue o cursor, navegação que acompanha o scroll, versões antigas do site acessíveis)

Citados nas listas gerais: Ben Mingo (navegar arrastando um canvas), Bruno Simon (mundo 3D dirigível), Dion Pieters (shaders reagindo ao usuário), CUSP / Adam Bricker (navegação experimental), Griflan (composição assimétrica), Enrico Deiana (microinterações em layout escuro), Robin Noguier (a lista de projetos é a navegação), Léo Parpeix e Emilian (Awwwards Developer), Stefan Vitasović, Arnaud Rocca e Corentin Bernadou (Codrops).
