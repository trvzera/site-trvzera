# trvzera. — Meu espaço pessoal

Site estático, em uma única página, com redes sociais, portfólio, setup, apresentação pessoal e gostos. HTML, CSS e JavaScript, sem dependências de build.

A identidade exibida é **trvzera.**, incluindo apresentação, metadados e rodapé. O endereço do portfólio aponta para giovannitrivellato.com.br.

## Abrir localmente

Use o Live Server do editor ou rode `python3 -m http.server 5500` na raiz. Abra `http://localhost:5500`.

## Editar conteúdo

- `index.html`: links, textos, tier lists, playlists e setup.
- `css/design.css`: tipografia SF Pro Display, cores, navegação e acessibilidade.
- `css/index.css`: disposição e espaçamento das seções.
- `js/main.js`: tema, blur ligado à rolagem, progresso da leitura, menu de preferências e transição das abas.
- `js/components/lottie-controller.js`: player compartilhado, cache dos JSONs e interações dos ícones.
- `js/components/photo-viewer.js`: visualização da foto completa do setup em um diálogo modal.
- `js/vendor/`: player SVG local `lottie-web` 5.12.2 e sua licença MIT.
- `js/transition-init.js`: aplica o tema salvo antes da primeira renderização.

As rotas antigas `about.html` e `produtos/` redirecionam para as seções da página inicial. O catálogo, os links de compra e sua lógica foram removidos. As fotos pessoais antigas não são carregadas. As capas de jogos, animes e músicas são reutilizadas nas seções de gostos.

As redes ficam em botões de ícone de 56 × 56 px, com nomes curtos abaixo, bordas arredondadas e destaque azul no portfólio. São seis botões lado a lado no desktop e duas fileiras de três no celular. Eles respondem ao hover, foco e toque, e o grupo mantém o blur ligado à rolagem. A seção `#setup` vem logo depois das redes sociais. O PC e o MacBook ficam em `setup-devices`, sempre visíveis; refrigeração, monitores, periféricos, fone, VR e jogos competitivos ficam sempre visíveis em `setup-content`. O monitor principal é de 200 Hz, e o secundário é Fast VA de 165 Hz. O fone é um Mchose V9+ Turbo.

## Tier lists

Os rankings S+, S e A refletem as classificações escolhidas por trvzera. São 15 jogos e 8 animes/mangás, em ordem alfabética dentro de cada tier. Cada `article.tier-entry` é um card estático com a capa, o nome e o ano de lançamento (jogos) ou os gêneros (animes/mangás). Edite esses campos em `index.html` e mova a entrada para a `tier-row` desejada para alterar o ranking. Jogos e animes/mangás são separados por abas que também funcionam com as setas do teclado, Home e End. A troca anima a altura do bloco por 360 ms e a entrada da lista por 320 ms, com blur leve e deslocamento. Trocas rápidas cancelam a transição anterior; movimento reduzido mostra a nova lista imediatamente. Sem JavaScript, ambas as listas ficam visíveis.

A barra de progresso usa a altura da maior lista como referência comum. A diferença de altura é distribuída ao percorrer a seção; um ponto de referência preserva o percentual no instante da troca, inclusive durante a animação. A barra continua chegando a 0% no início e 100% no fim da página, sem reservar uma área vazia sob a lista mais curta.


Os jogos exibem apenas o ano de lançamento (`AAAA`). A data completa permanece no atributo `datetime` de cada `<time>`, no formato ISO `AAAA-MM-DD`. Usam a estreia oficial da edição do jogo; em títulos episódicos, a data do primeiro capítulo. [Resident Evil 2](https://blog.playstation.com/2018/06/11/resident-evil-2-remake-comes-to-playstation-4-january-25-2019/) corresponde ao remake de 2019, e [Pokémon FireRed](https://www.pokemon.co.jp/game/gba/fl/) usa a estreia japonesa de 2004. Detroit e Ghost of Tsushima usam a estreia original no PS4. A classe `tier-item-meta` mantém a apresentação dos anos e dos gêneros, com rótulos próprios para leitores de tela. Os gêneros são uma seleção resumida das categorias das editoras e distribuidoras, como [VIZ](https://www.viz.com/chainsaw-man) e [Crunchyroll](https://www.crunchyroll.com/pt-br/series/G4PH0WEKE/blue-lock).

As duas playlists estão em `music-section`, com links diretos para o Apple Music.

## Fotos

- `img/giovanni1.jpeg`: perfil, com um recorte ampliado dentro do avatar quadrado.
- `img/giovanni2.jpeg`: foto pessoal na seção sobre mim, em 4:5.
- `img/setup.jpeg`: foto do setup. O card usa 16:9 e `object-position: 50% 76%` para destacar a mesa e os monitores da foto vertical.
- `img/Frieren-2.jpg`: detalhe visual ao lado da introdução das tier lists, com tamanho menor no celular.

Ao clicar no setup, um `<dialog>` nativo exibe a imagem inteira, sem recorte, ajustada à tela. O foco fica dentro do modal e volta para a foto ao fechar; a rolagem do fundo fica bloqueada. Feche pelo botão, por Escape ou clicando no fundo. As transições de 220 ms respeitam a preferência de movimento. Sem JavaScript ou suporte ao diálogo, o link abre diretamente a imagem. Para trocar a foto do setup, atualize o `href`, a miniatura e a imagem do diálogo no `index.html`.

## Diretrizes de design

Cores e fontes baseadas no [portfólio do trvzera.](https://giovannitrivellato.com.br): fundo `#ecebef`, texto `#1c1c1e`, azul `#0267ff` e SF Pro Display nos arquivos de fonte já presentes no projeto. Links pequenos sobre o fundo cinza usam a variante `#005ce6` para manter contraste acima de 4,5:1.

Princípios das Human Interface Guidelines aplicados ao contexto web:

- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout): hierarquia, alinhamento, margens e adaptação ao tamanho da tela.
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography): escala clara de títulos, texto legível e tamanhos relativos em `rem`.
- [Motion](https://developer.apple.com/design/human-interface-guidelines/motion): blur, deslocamento e uma escala discreta acompanham a rolagem nas bordas da tela. A área central de leitura permanece nítida. A foto de perfil tem um deslocamento suave de até 18 px ao rolar. O header permanece no topo com uma linha de progresso e indicação da seção atual. A rolagem continua nativa.
- [UI Design Dos and Don’ts](https://developer.apple.com/design/tips/): áreas de interação de pelo menos 44 × 44 px, espaçamento e contraste.

O tema acompanha o sistema até que uma escolha seja salva. O menu hambúrguer é um botão circular de 56 px, fixo no canto inferior direito e afastado das áreas seguras da tela. Ele está fora do header, para que os filtros de vidro da barra não alterem sua posição fixa. O painel abre para cima, com os controles de tema e animações; no celular, também recebe os links de navegação. O menu fecha ao clicar fora, selecionar uma seção ou pressionar Escape. As animações respeitam `prefers-reduced-motion`, com o controle bloqueado quando a preferência do sistema está ativa. As escolhas de tema e movimento são salvas localmente. O conteúdo permanece visível sem JavaScript. Navegação por teclado, link para pular ao conteúdo, preferência de contraste e redução de transparência também são contemplados.

Setup, músicas, tier list, cards de títulos e botões das redes usam superfícies de vidro: fundo translúcido, gradiente de luz, borda fina, brilho interno e sombra suave. `backdrop-filter` desfoca o fundo em 24 px; os cards internos de jogos e animes usam 12 px. Texto e capas mantêm a nitidez. A preferência de reduzir transparência ou aumentar contraste usa superfícies sólidas. Sem suporte a `backdrop-filter`, o fundo sólido permanece como fallback.

## Como as animações funcionam hoje

- **Hover e foco:** os links não exibem sublinhados nem linhas de pseudo-elementos. As transições de cor, fundo, borda e sombra usam 300 ms, com as propriedades declaradas no estado base para suavizar tanto a entrada quanto a saída. Os botões das redes sociais usam `ease`; o ícone sobe 3 px e cresce 4%, e o toque comprime a escala para 94%. As setas ficam em espaços fixos `.link-motion-icon`, com o Lottie dentro de `.lottie-stage`, sem deslocamento extra de CSS no hover ou foco. Nenhum card estático simula ser um botão.
- **Voltar ao topo:** botão de vidro no canto inferior esquerdo, seguindo o portfólio. Aparece após rolar 65% da altura da tela; no celular, fica só com a seta. A entrada, saída e hover têm transição. Enquanto está oculto, não recebe foco ou cliques. O retorno usa a âncora `#inicio`, com rolagem suave quando as animações estão habilitadas.
- **Blur no scroll:** `requestAnimationFrame` atualiza os elementos `data-reveal` conforme a posição real na tela. Ao entrar pelos 30% inferiores, eles passam de até 12 px de blur, 44 px de deslocamento e escala 0,975 para o tamanho natural e nitidez total; no celular, os limites são 8 px e 32 px. Ao sair pelo topo, o blur retorna de forma mais discreta. O efeito funciona ao descer e subir, quantas vezes você rolar, sem um temporizador que termine antes de o conteúdo aparecer. Uma curva `smoothstep` suaviza as duas extremidades. A área central permanece nítida; o foco por teclado mantém o bloco legível até ele sair da tela. Fora da tela ou em repouso na área de leitura, filtros e transformações são removidos. As medidas descontam o próprio movimento para evitar oscilações e são lidas em lote antes de atualizar estilos. Sem JavaScript, todos os elementos continuam visíveis.
- **Vidro do header:** `backdrop-filter: blur(20px)` desfoca o conteúdo atrás da barra. A preferência de reduzir transparência usa um fundo sólido.
- **Painel flutuante:** o estado `data-open` controla transições CSS de opacidade e blur (220 ms) e deslocamento/escala (320 ms), a partir do canto inferior direito. Abrir ou fechar novamente no meio da transição inverte o movimento a partir da posição atual. Ao fechar, `inert` e `aria-hidden` bloqueiam a interação imediatamente; a visibilidade é removida depois da saída. O painel respeita a altura disponível e permite rolagem interna em telas baixas.
- **Movimento reduzido:** a preferência do sistema e o controle no menu desativam o blur, o deslocamento da foto, as transições e os Lotties. As especificações do setup permanecem visíveis.

## Lotties aplicados

O controlador adapta a lógica do portfólio aos três arquivos locais:

| Arquivo | Aplicação | Interação |
| --- | --- | --- |
| `hamburger.json` | `#menu-toggle`, preservando o rótulo do botão | Tocar ao abrir e voltar ao fechar |
| `arrow.json` | `.link-motion-icon` nos links | Avançar no hover/foco, voltar ao sair |
| `toggle.json` | `#motion-toggle`, dentro do menu | Anima ao ligar; azul quando ligado e cinza estático ao desativar |

A biblioteca local é carregada uma única vez quando as animações estão habilitadas. Cada JSON é buscado uma vez e clonado para criar instâncias SVG independentes, com `loop: false`, `autoplay: false` e velocidade 1,5. As setas avançam no hover/foco por teclado e voltam somente quando ambos terminam, continuando do frame atual. Toque não ativa um hover permanente. Os SVGs de seta e menu herdam a cor do controle, inclusive no tema escuro; a seta é orientada para baixo, para cima ou na diagonal conforme o link.

O arquivo atual `arrow.json` tem caminhos de seta para a direita com rotação de −45°, apontando para cima à direita. O atributo `data-arrow-direction` informa o destino exato: `down` gira +135°, `up` gira −45° e `up-right` mantém 0°. A rotação fica em `.lottie-stage` e permanece constante durante o hover; os fallbacks usam ↓, ↑ e ↗ respectivamente. CSS também define os outros cinco sentidos para reutilizar o mesmo arquivo.

O evento `DOMLoaded` marca o ícone com `data-animation-ready` e revela o SVG; antes disso, ou em caso de falha, o fallback HTML/SVG/CSS continua visível. Desativar movimento destrói as instâncias imediatamente; reativar as recria com os arquivos em cache. Em segundo plano, a reprodução é pausada. `pagehide` destrói as instâncias, e `pageshow` permite recriá-las ao voltar pelo histórico. O player cuida dos ícones; o blur da rolagem permanece independente. Referência: [API oficial do lottie-web](https://github.com/airbnb/lottie-web/wiki/Usage).

O futuro Lottie de tema pode ocupar `.theme-motion-icon` no botão `#theme-toggle`. Os ícones atuais de sol e lua indicam o tema selecionado até esse arquivo ser fornecido.

## Referências dos novos títulos

Capas de jogos disponíveis no CDN da Steam; a capa de Pokémon FireRed vem do [TheGamesDB](https://thegamesdb.net/game.php?id=3490). As novas artes de animes foram consultadas em [Frieren](https://frieren-anime.jp/intro/), [VIZ / Death Note](https://www.viz.com/death-note) e [Demon Slayer](https://demonslayer-anime.com/risshihen/).
