# CHANGELOG — Tríade Conecta (App)

> Histórico versionado do projeto. Entradas mais recentes primeiro.
> Para o estado atual (o que importa para continuar o trabalho), veja
> `ESTADO-DO-PROJETO.md` — este arquivo é o "como chegamos aqui", não
> precisa ser lido por completo a cada sessão.

Formato de versão: `vMAJOR.MINOR.0` — MAJOR sobe quando o módulo/escopo
muda (ex: sair do Módulo 1 para o Módulo 2); MINOR sobe a cada sessão de
desenvolvimento dentro do mesmo módulo.

---

## v3.10.0 — Rótulo da tab bar vira opção, desligada por padrão
**Sessão 22 (quarta parte) — 03/09/2026**

O nome embaixo do ícone agora é uma chave em **Configurações → Navegação**,
e vem **desligada**: os ícones comunicam sozinhos, e sem o texto a barra
cai de 61px para 50px e a bolha fica mais redonda.

Isso reverte a decisão de 26/08/2026, que tinha posto rótulo em tudo
porque "coração = Sobre" e "microfone = Palestrantes" não são deduzíveis
de primeira. O trade-off não sumiu — virou escolha de quem usa, que é o
que a §6.3 do manual já mandava fazer com variação de UI.

**A acessibilidade não muda:** o `aria-label` continua dizendo o nome de
cada aba, então leitor de tela e comando de voz seguem iguais. Sem texto
visível, a regra 2.5.3 da WCAG deixa de se aplicar.

**Sem rótulo a pílula é mais alta, e é de propósito.** A largura da célula
é fixa (5 abas em 307px = ~60px cada), então a bolha só fica redonda se a
altura subir até perto disso: com 18px de respiro ela mede **60×56**,
razão 0,94 — o olho lê círculo. A pílula fica em 64px contra 61 da versão
com texto. Estreitar a bolha daria o mesmo arredondamento com menos
altura, mas ela deixaria de ocupar a célula inteira, que é o oposto do
pedido.

**A auditoria pegou uma regressão no caminho.** Numa versão intermediária,
com respiro de 8px, o alvo de toque caiu para **36px** — abaixo do piso de
38 do app. Reprovou nas 20 combinações, com a barra parecendo ótima. Com
os 18px atuais o alvo é 56px, bem acima dos 44 da Apple.

Entrou também a chave liga/desliga (`.ios-switch`) no padrão iOS, usável
em qualquer `.ios-row`: quem carrega estado e toque é o botão da linha
inteira (`aria-pressed`), então o alvo é a linha, não um retângulo de 44px
na ponta.

## v3.9.0 — Bolha na tab bar flutuante, e a pílula vira vidro de verdade
**Sessão 22 (terceira parte) — 03/09/2026**

### A pílula ficou mais baixa e virou vidro

Altura de 68 para 61px (o respiro do conteúdo, `--tabbar-float-h`,
acompanhou: 92 → 80px).

A bolha passou por três formas até fechar, e as duas primeiras foram
descartadas olhando a captura, não o código: esfera de 38px atrás do ícone
(solta o rótulo, mas o destaque fica leve demais), célula exata (certo, mas
ainda tímido) e a final — **célula inteira com a moldura da pílula afinada
de 6px para 3px**, o que dá 60×53 numa pílula de 61. Bolha grande em aro
fino lê melhor que bolha pequena em faixa larga. O item ganhou de volta,
em padding próprio, o que a pílula perdeu: a altura total não mudou.

O vidro são três camadas: `blur(30px) saturate(190%)` (o desfoque sozinho
dá leitosa — a saturação devolve a cor do que está por baixo), um brilho de
1px no topo (a quina que a luz pega; sem ele há transparência, não
espessura) e a sombra projetada (vidro que não levanta lê como adesivo).

**Uma camada de blur, e ela não se move.** A esfera NÃO tem
`backdrop-filter` próprio: um segundo desfoque que anda a cada quadro é o
que derruba desempenho. O efeito dela é pintura.

### A auditoria não olhava a tab bar — e era lá que ia quebrar

O filtro que pula elementos cobertos pela barra acabava pulando a própria
barra. Corrigido, e a primeira rodada com ela incluída **reprovou na
hora**: no Pérola os rótulos ativos caíram para 3,2–3,9:1, abaixo dos 4,5
da WCAG AA — vidro claro demais atrás de texto claro. A transparência do
Pérola subiu para 0.78 (o Ônix ficou em 0.52).

Não é inconsistência entre temas: a pílula é escura nos dois, mas no claro
o que passa por trás é conteúdo claro. No escuro passava — é o tipo de
defeito que só existe em um tema, e que o olho não pega.

O item ativo da pílula tinha fundo próprio: ao trocar de aba, um fundo
apagava e outro acendia. O destaque **piscava** de um lugar para outro.

Agora existe **um** elemento — a bolha — que desliza por baixo de todas as
abas. A diferença é de leitura: o destaque não pula, ele viaja, e o olho
segue a viagem.

Detalhes que decidem se fica bom ou amador:

- **posição por índice, não por medida** — as abas são `flex: 1`, então a
  bolha tem a largura de uma aba e anda 100% de si mesma por casa;
- **a curva passa do destino e volta** (`cubic-bezier(0.34, 1.42, 0.5, 1)`,
  0,62s). É o que faz ler como bolha em vez de gaveta;
- **raio 20px, não `999px`** — a célula é quase quadrada (59×57), e raio
  total viraria círculo. O círculo cortava o rótulo, que ficava cruzando a
  curva. Foi corrigido depois de olhar a captura, não antes;
- **só `transform` e `opacity`** — a pílula carrega o `backdrop-filter`, e
  mexer no tamanho dela refaria o desfoque a cada quadro (§9);
- **em `/planos`, que não é aba**, a bolha some **onde estava** e volta de
  lá. Mandá-la para a primeira aba apontaria para o lugar errado.

Medido: a bolha para exatamente sobre a aba ativa nas quatro rotas (7, 66,
124 e 183px, contra 7, 66, 124 e 183 das abas), e no meio da troca está
entre as duas posições — ou seja, viaja mesmo, não teleporta.

Só na pílula flutuante. Na barra fixa o item ativo continua como estava:
lá as células encostam nas bordas da tela e uma bolha viajando não tem
margem para respirar.

## v3.8.0 — Diretório de membras e o convite de entrada
**Sessão 22 (segunda parte) — 03/09/2026**

### Módulo 3, primeira fatia: o diretório

`db.getMembers()` lê `profiles` e a tela Sobre ganhou a seção **Membras da
Tríade** — mas só para quem está logada. A checagem na tela não é a
segurança: a RLS de `profiles` só devolve linha para `authenticated`, e
essa política existe desde o Módulo 2 **exatamente** para isto. Deslogada,
quem recusa é o banco; a tela só evita mostrar um vazio sem explicação.

Duas decisões:

- **sem `withFallback`.** Todas as outras leituras caem no seed quando o
  Supabase falha. Aqui não: não existe seed de membra, e cair num fallback
  significaria inventar gente. Erro ou deslogada devolve lista vazia;
- **perfil incompleto aparece assim mesmo**, com rótulo genérico. Sumir com
  a pessoa da lista da própria comunidade é pior que um cartão incompleto —
  e o cartão incompleto convida a preencher.

O `@` é o próprio link para o Instagram: não há glifo dele no `Icon.tsx`, e
criar um só para isso trocaria uma palavra legível por um símbolo (regra 7).

**Falta do Módulo 3:** o feed real (membra publicar) e "minhas inscrições".
O feed precisa de tabela nova, tela de escrever e moderação.

### Convite de boas-vindas

Pop-up na primeira abertura, com os benefícios de virar membra. Três
regras decidem se ele aparece, e todas existem para o convite não virar
praga:

1. **uma vez por aparelho** — fechou, não volta. Um pop-up que reaparece a
   cada abertura não convence: ensina a fechar rápido;
2. **nunca para quem já escolheu plano** — vender de novo para quem já
   comprou é o jeito mais rápido de parecer que o app não sabe quem ela é;
3. **900ms depois da tela desenhar** — cair por cima de uma tela ainda
   montando lê como erro, não como convite.

**Os benefícios não são texto fixo:** saem do plano em destaque
(`featured`), então corrigir uma vantagem em Planos → "..." → Editar já
corrige o convite. Duas listas para a mesma coisa sairiam de sincronia na
primeira alteração.

A lista entra em cascata (§7 do manual) e o selo da marca usa o raio
direcional da §12 — a forma que nasceu no calendário começou a se repetir,
que era o objetivo dela.

### A auditoria precisou saber do pop-up

`npm run auditoria` mede a TELA, e o convite cobriria o conteúdo em todas
as rotas. O script passou a marcar a preferência de "já visto" no
`addInitScript`, junto com o tema.

## v3.7.0 — Módulo 5 fechado: palestrante e plano gravam de verdade
**Sessão 22 — 02/09/2026**

### O que faltava

O Módulo 5 (painel administrativo) estava em 🔸 desde 31/08: permissão,
upload de foto e gravação real de **evento** funcionavam; **post** entrou
em 01/09. Sobravam palestrante e plano.

- **Palestrante.** O formulário já existia e já estava escondido atrás do
  `usePodeEditar()`, mas gravava só no navegador. Agora tem os mesmos dois
  destinos do evento — com permissão vai para a tabela `speakers`, sem
  permissão fica no overlay local — e o aviso no topo diz qual dos dois
  está valendo antes de a pessoa digitar.
- **Plano não tinha editor nenhum.** Entrou o `PlanEditSheet`, com nome,
  preço, período, vantagens (uma por linha) e o destaque "Mais escolhido".

**Nenhuma migração de SQL foi precisa:** as políticas `admin escreve
palestrantes` e `admin escreve planos` já existiam no `schema.sql` desde
31/08. Só faltava o front usá-las.

### Duas decisões sobre o plano

**Ele é o único formulário do app sem caminho local.** Preço só faz
sentido se valer para todo mundo: uma sócia que corrige um valor no
navegador dela e acha que arrumou é pior do que não poder corrigir.

**Ele edita, mas não cria.** São três faixas fixas, e "novo plano" é
decisão de negócio que não deveria caber num botão.

### Um defeito que a auditoria pegou no próprio ferramental

Rodar `npm run auditoria` depois das mudanças quebrou com
`Cannot find package 'pngjs'` — o script precisa de **dois** pacotes, e a
mensagem de instalação que eu tinha escrito citava só o `playwright`.
Corrigida, e o script passou a **degradar em vez de quebrar**: sem
`pngjs`, ele pula só o contraste e roda as outras três verificações. Três
valem mais que nenhuma.

Auditoria limpa nas 20 combinações depois de tudo.

## v3.6.0 — Calendário que mostra o evento, e Eventos organizada por ano
**Sessão 21 (segunda parte) — 02/09/2026**

### O dia com encontro virou um quadro

Era um ponto de 4px embaixo do número, que não competia com nada numa
grade de sete colunas: quem abria o calendário para achar "quando é o
próximo" tinha que caçar. Agora o dia é um quadro de 45px, e quando a
edição tem foto **é a foto** que preenche a célula — o calendário passa a
dizer *qual* evento é, não só *que existe um*.

Sem foto ele cai no dourado (evento por vir) ou no vidro (já realizado).
O véu escuro por cima da foto não é enfeite: o acervo tem edição em parede
clara e edição em salão escuro, e sem ele um único valor de cor para o
número reprovaria numa das duas.

Evento de vários dias vira **um bloco só**: a Feira é 11 e 12, e dois
quadrados separados leem como dois eventos. `margin` negativa fecha o vão
e os cantos internos somem, então a moldura contorna o par inteiro. A
emenda só vale dentro da mesma semana.

E o quadro tem **moldura que respira** — 2,8s, só opacidade, porque a
célula vive dentro de um elemento com `backdrop-filter` e animar tamanho
ali é o bug de performance conhecido (seção 9 do manual).

**Bug encontrado no caminho:** o calendário comparava só com `event.date`,
então a Feira de Negócios (11 **e** 12 de setembro) marcava só o dia 11 —
o dia 12 ficava em branco. Agora marca o intervalo inteiro.

### A tela de Eventos parou de ser uma parede

Dois problemas, os dois de ordem:

- **A busca vinha depois da grade.** Para filtrar as edições era preciso
  rolar por todas as edições que se queria filtrar. Subiu para antes.
- **A retrospectiva era uma parede única de quadradinhos** — nada dizia
  onde um ano terminava e o outro começava. Agora as edições são agrupadas
  por ano, com uma faixa ("2026 · 3 edições"). A grade vira linha do
  tempo. A revelação progressiva continua valendo: o agrupamento é feito
  sobre o que já está visível.

## v3.5.0 — Camada de movimento, ícone de instalação e Palestrantes que abre cheia
**Sessão 21 — 02/09/2026**

Auditoria de UI/UX medida (360px e 375px, cinco telas), e o que ela
apontou, resolvido.

### O que a medição achou

- **Par de botões estourava o card em 360px** por 7px. "Quero participar"
  pede 168px e "Mais detalhes" 125px; um Android de 360px oferece 298px.
  Empilha até 379px agora — em 375px caberia por 7px, folga que quebra no
  primeiro rótulo que mudar.
- **Palestrantes abria com meia tela vazia**: o conteúdo terminava aos
  407px numa tela de 714px, porque nada aparecia até tocar num nome. Agora
  abre já na palestrante do **próximo encontro** (ou na primeira, se o
  próximo evento não tem convidada).
- **Falso positivo, registrado para não virar "correção" futura:** o campo
  de busca em Eventos mede 25px de altura, mas está dentro de um `<label>`
  de 49px — tocar em qualquer ponto da pílula foca o campo. A área real
  está correta.

### Movimento

Tudo em `translate`/opacidade, na curva do sistema, sem tocar em cor
(regra 16):

- **Cascata na troca de aba.** A tela deixou de entrar como bloco único: o
  `.panel` faz um fade curto e cada filho sobe 10px com atraso de 0,03s a
  0,22s. E a curva virou a do sistema — `.panel` usava `ease`, destoando
  de todo o resto.
- **Foto revela em vez de estalar.** `.foto-fade` + `.carregou` no
  `onLoad`, no post e nas capas da grade. Uma imagem de 1080×1350 que
  aparece de uma vez lê como "carregou agora"; revelada, lê como "estava
  ali".
- **Cabeçalho reage à rolagem.** Parado no topo não tem linha nem sombra;
  passou de 4px de rolagem, ganha as duas. Só cor e sombra mudam — altura
  causaria reflow a cada rolagem.
- **Correção de acessibilidade que a cascata expôs:** a guarda de
  `prefers-reduced-motion` zerava duração mas **não** o `animation-delay`.
  Com `fill-mode: backwards`, um item em cascata ficaria invisível durante
  o atraso. Agora zera os três.

### Service worker: o app abre do disco

Escrito à mão em `public/sw.js` — sem `vite-plugin-pwa`, sem dependência
nova (regra 7). Duas estratégias, e a diferença entre elas é o ponto:

- **navegação: rede primeiro.** O `index.html` aponta para o bundle com
  hash; servido do cache, um deploy novo só apareceria quando o cache
  expirasse. O cache entra só como rede de segurança quando não há
  conexão.
- **assets: cache primeiro.** `index-a1b2c3.js` é imutável por construção
  — mudou o conteúdo, mudou o nome. Não há o que revalidar.

**Nada do Supabase passa pelo service worker**, de propósito: curtida,
RSVP e edição precisam do estado real do banco, e servir isso do cache
mostraria número velho como se fosse atual.

Medido em rede simulada de 200ms de latência, visita repetida: **497ms →
292ms** (mediana de 3). O que sobra é a ida à rede pelo HTML, que é
justamente o preço de manter o deploy novo chegando na hora — troca
consciente.

Offline verificado numa rota interna: `/planos` abre com as cinco abas e o
conteúdo na tela, sem rede.

**Armadilha registrada no `CLAUDE.md`:** arquivo sem hash no nome (ícone,
manifesto, a máscara da marca) fica preso no cache primeiro. Trocou um
desses? Suba o nome do cache em `sw.js` — o `activate` apaga todo cache
com nome diferente.

### Instalar na tela de início

O manifesto só tinha ícone SVG, que o Android ignora — quem instalasse
veria um ícone genérico. Entraram `icon-192`, `icon-512` e um
`icon-maskable-512` (arte menor, porque o Android recorta em círculo),
desenhados a partir da própria seta tripla do `favicon.svg`, mais o
`apple-touch-icon`, que o iOS usa em vez do manifesto.

**E o favicon estava fora do manual**: usava `#7C2A3D` e `#F4EEE3`, que
não são cores de lá. Passou para Burgundy `#65202D` sobre Cream Quartz
`#F6F3EE` (regra 16). Isso destrava metade do Módulo 7 — falta o service
worker.

### A direção de design virou documento

O quadro do calendário foi a primeira peça que o usuário descreveu como
"muito mais interessante", e o pedido foi transformar isso em direção do
projeto: **inovar no design mantendo elegância e a proposta premium**.

Virou a **seção 12 do `docs/DESIGN-SYSTEM.md`**, com os cinco princípios
extraídos do que funcionou — e não uma descrição do quadro:

1. **geometria com direção** (raio assimétrico, canto aberto no superior
   esquerdo, que é para onde a seta da marca aponta);
2. **o que informa não se mexe; o que chama, sim** — a primeira versão
   tinha a borda piscando, e no vale da animação o dia deixava de estar
   marcado: a animação estava apagando a informação;
3. **hierarquia entre linhas** — a de fora sempre mais fina, senão lê como
   borda dupla;
4. **inovação vem de forma e tempo, não de cor** — a paleta tem dono
   externo (regra 16), e é essa restrição que segura a elegância;
5. **movimento caro é movimento proibido** (seção 9).

Mais uma fila de seis ideias candidatas com risco anotado, e um teste de
quatro perguntas que qualquer proposta precisa passar — a mais útil sendo
"com a animação zerada, o elemento ainda comunica o mesmo?".

### Material 3 e Expo, pesquisados a pedido

Não existem como skill instalável, e nenhum dos dois entra aqui como está:
o **M3** traz paleta e tipografia próprias, que brigam com o Manual de
Marca (regra 16) — dele valem as *regras* (alvo de toque, camadas de
estado, escala de duração), não a aparência. **Expo é React Native**:
trocar significaria reescrever o app e perder o deploy da Vercel, e o
motivo usual para querê-lo (Módulo 7) se resolve por PWA, que já estava
quase pronto.

## v3.4.0 — O post virou conteúdo de verdade
**Sessão 20 (terceira parte) — 01/09/2026**

### Por que a foto do post só salvava no aparelho

Não era bug nem falta de permissão: **o post era o único conteúdo sem
tabela**. Evento, palestrante e plano tinham as suas desde o Módulo 1.5; o
post vivia no `seed.ts`, e a única escrita possível era o overlay local do
navegador. A admin trocava a foto, via a mudança, e mais ninguém via.

Agora existe `public.posts`, com o mesmo desenho das outras: leitura
pública do que está publicado, escrita só para quem está em `admins`. O
caminho completo dos cinco passos — schema, `database.ts`, tipo de
domínio, mapeamento no provider, seed — mais `getPosts()` e `savePost()`
no `DataProvider`, e o `Home` lendo pelo `db` em vez de importar o array.

O `PostEditSheet` ficou igual ao de evento: com permissão grava no banco e
o aviso diz "vale para todo mundo"; sem permissão, overlay local, como
antes.

**Armadilha que custou uma rodada:** faltou `Relationships: []` na entrada
nova de `Tables`. Isso não dá erro onde está escrito — derruba o schema
inteiro para `never`, e o TypeScript reclama de `plan_selections` e
`rsvps`, tabelas que ninguém tocou. Ficou registrado na regra do
`CLAUDE.md`, ao lado do aviso de `type` vs `interface`.

### Notificação fora do caminho da barra

O toast tinha `bottom: 86px` fixo e entrava com `translate(-50%, 140%)`:
em qualquer aparelho com área de gestos ele parava **em cima** da pílula
flutuante, e para chegar lá atravessava a barra. Agora nasce quase no
lugar e sobe 10px aparecendo; a distância é `--tabbar-float-h + 16px`,
então acompanha a barra se ela mudar de altura. Medido: 18px de folga com
a barra flutuante, 30px com a fixa. A saída ficou mais lenta que a entrada
— aparecer é aviso, sumir é despedida.

### Barra flutuante

Já era o padrão desde 26/08/2026 (`getPref('tabbar_style', 'padrao2')`).
Quem escolheu a fixa antes disso mantém a escolha, de propósito — trocar
por baixo a preferência de quem decidiu é pior que o padrão errado.

## v3.3.0 — Curtida de verdade, edição só para quem pode, e recorte de foto
**Sessão 20 (segunda metade) — 01/09/2026**

### As curtidas pararam de ser enfeite

`baseLikes` saiu do `seed.ts` e do tipo `Post`. Eram números escritos à
mão (168, 141, 98) que só subiam +1 quando você mesma curtia — placar de
demonstração numa tela que vende plano.

O total agora vem do banco. O caminho não é óbvio e vale registrar:
`post_engagements` é **privada por usuária** (a RLS devolve só a própria
linha), o que é o certo — ninguém precisa saber quem curtiu o quê — mas
torna impossível contar do cliente. Abrir o `select` resolveria e vazaria
a lista. A saída foi uma função `security definer`,
`curtidas_do_post(p_post_id)`, que devolve **só o total** e nada mais,
liberada para `anon` e `authenticated`.

Sem Supabase configurado o total é o desta aba — e **zero não aparece**:
a linha some, como em qualquer feed. "0 curtidas" é pior que silêncio.

### Editar virou privilégio também na tela

Antes, o "..." → Editar aparecia para todo mundo e salvava no navegador de
cada uma. Parecia um painel administrativo e não era: a sócia abria no
celular dela e não via nada.

Agora a UI de edição só existe para quem está na tabela `admins` — post,
evento, palestrante, "Novo evento" e "Nova palestrante". O gate é um hook
único, `usePodeEditar()`, que substituiu as duas cópias do mesmo
`useEffect` que já existiam dentro dos formulários. A permissão de verdade
sempre esteve na RLS; o que faltava era a tela contar a mesma história.

### Início: só o que ainda vai acontecer

A primeira tela mostrava três cards competindo entre si, um deles uma
retrospectiva. Agora mostra **os eventos por vir**, em ordem de data —
setembro tem dois (Feira dia 11, Jantar dia 30) e os dois aparecem. A
edição mais próxima é a única com moldura, selo e animação de entrada.
Sem nada marcado, cai no primeiro post para a tela não abrir vazia.

### Dois botões no post de evento

Era um só, "Ver detalhes", e quem já tinha decidido precisava ler a ficha
do evento inteira antes de achar como falar com alguém. Agora são
**"Quero participar"** (abre direto no passo das sócias, com a mensagem de
WhatsApp pronta) e **"Mais detalhes"** ao lado, em vidro. Abaixo de 359px
os dois empilham. O `EventModal` ganhou `passoInicial` para isso — o passo
de contato já existia, só não dava para chegar nele direto.

A legenda do post também passou a respeitar parágrafos (`white-space:
pre-line`), porque a descrição da Feira tem quatro.

### Recorte antes de subir, no formato do Instagram

O bloco de imagem do post era **4:3 deitado**, e os cartazes da Tríade são
**4:5 em pé** — o do Jantar perdia a data e o local no corte. O bloco e o
recorte passaram para 4:5, e o arquivo sai em **1080×1350**, o tamanho
nativo do post retrato do Instagram.

O acervo é Stories 9:16, então o `object-fit: cover` ainda decide sozinho
onde cortar quando não há recorte manual — e às vezes decapitava alguém.
Entrou o `RecorteFoto`: arrasta para enquadrar, controle para aproximar. Sem biblioteca — `<input type="range">`, eventos de
ponteiro e `canvas.toBlob()` (regra 7).

Só a foto única (a do post) passa por ele. Numa galeria de várias,
recortar uma a uma seria castigo; ali o `cover` resolve.

Conferido de ponta a ponta com permissão forçada num build descartável:
recorte abre com a geometria do `cover`, arrastar e aproximar mexem no
enquadramento, e o arquivo gerado tem exatamente 1200×900. Sem permissão,
nenhuma das três telas mostra controle de edição.

### O admin da casa

`fabiomirandago@gmail.com` entra em `public.admins` pelo próprio
`schema.sql` (insert idempotente, por e-mail). **Ainda precisa rodar o
`schema.sql` no SQL Editor** — é lá que a permissão passa a valer.

## v3.2.0 — Foto de verdade no feed, e o destaque que se corrige sozinho
**Sessão 20 — 01/09/2026**

### Eventos certos, e um destaque que não envelhece mais

O export do Instagram mostrou que o app anunciava o evento errado: a
**Feira de Negócios Tríade** (11 e 12/09, Decorado Bambuí) não existia no
app, e a primeira tela chamava para o Jantar, que é só dia 30. O Jantar
ganhou o que faltava — Villa América e a convidada, a terapeuta **Valéria
Ruiz**, que também entrou na lista de palestrantes.

A Feira é o primeiro evento de dois dias, o que o `TriadeEvent` não
modelava: entrou `endDate` pelos cinco passos da regra, com
`formatEventDateRange()` devolvendo "11 e 12 de set. de 2026" (repetir o
mês nos dois lados leria como duas datas soltas).

E a causa raiz: **o Início escolhe sozinho o chamariz**, o post do evento
mais próximo, em vez do primeiro do array. Antes, entrar um evento novo
não trocava o destaque — era preciso lembrar de reordenar à mão.

### Chamariz e barra com mais presença

- O post do próximo encontro ganhou moldura dourada, anel e o selo
  "Próximo encontro"; na abertura do app ele entra com um brilho que
  passa uma vez. Uma vez por carregamento, não a cada volta para o Início:
  animação que repete vira ruído.
- A aba Eventos ganhou uma estrela de quatro pontas quando há edição por
  vir, pulsando devagar — e o ajuste vale para os **dois** estilos de barra
  inferior, não só o flutuante.

### O feed ganhou fotografia

Os posts do Início mostravam um gradiente com a marca no meio. Aquilo
nunca foi desenho pretendido — era o selo de "ainda não temos imagem" —,
mas como todos os posts caíam nele, virou a cara da primeira tela. Entrou
`Post.mediaUrl`: quando existe, a foto cobre o bloco; quando não existe, o
gradiente com a marca volta ao papel de template.

As três fotos vieram do acervo real (Storage, Módulo 11), escolhidas por
conteúdo:

| Post | Foto |
|---|---|
| Feira de Negócios | 6ª edição — seis mulheres na parede da marca |
| Jantar para Casais | edição de maio — grupo misto, que é o público do jantar |
| Retrospectiva Carla Martins | a própria edição dela, no letreiro TRÍADE conecta |

O recorte precisou de cuidado: o acervo é Stories 9:16 e o bloco do post é
4:3. Com `object-position: 50% 30%` a faixa visível vai de 17% a 60% da
altura — pega os rostos e corta a legenda queimada no rodapé, que é onde
o Instagram assina. Conferido nas três, nos dois temas, em 375px.

**Os cartazes do Instagram não deu para usar.** O `Instagram.html` foi
enviado sozinho; salvar página completa produz o `.html` **mais** a pasta
`Instagram_files/`, e é ela que carrega as imagens. Sem a pasta, o HTML só
tem endereços apontando para arquivos que não vieram. As únicas imagens
embutidas com URL absoluta no arquivo são um anúncio de terceiros e as
fotos de perfil em 150px.

### Trocar a foto sem mexer em código

O pop-up de edição do post em destaque passou a ter campo de foto — mesmo
`GaleriaEditor` do evento, agora com modo de foto única (`max={1}`): sem
campo de legenda, e escolher um arquivo novo **troca** em vez de empilhar.
O arquivo sobe para o Storage de verdade; o vínculo entre post e foto
continua no overlay local, porque post ainda não tem tabela no banco — e o
aviso no topo do formulário diz isso antes de a pessoa digitar.

### Skills no repositório

`caveman` e `ponytail` entraram via `npx skills add`, com os symlinks e o
`skills-lock.json` versionados. O contêiner de trabalho é efêmero: o que
não está no git não sobrevive à sessão.

## v3.1.0 — Telas, animação e o começo do Módulo 5
**Sessão 19 (segunda metade) — 31/08/2026**

Fila de pedidos do usuário, resolvida em quatro commits. Cada mudança foi
medida depois de aplicada, não só olhada.

### Telas

- **Respiro no topo.** O `.panel` abria colado no cabeçalho. O respiro agora
  mora nele (15px), e a prop `first` do `SectionHead` — que injetava um
  `margin-top` inline em cada tela — saiu, substituída por
  `.panel > .sec-head:first-child { margin-top: 0 }`. Sem essa segunda
  regra os dois espaços somavam e o topo virava 37px.
- **Idealizadoras empilhadas.** Eram uma faixa com rolagem lateral: em
  375px cabiam duas e meia, e a Cris ficava fora da tela. São três pessoas
  fixas — cabem todas. Acima de 560px viram grade de três colunas.
- **Ordem alfabética** nos nomes, com `byName()` em `lib/format.ts`. Usa
  `localeCompare` pt-BR: a comparação binária colocaria "Lívia" antes de
  "Lia", porque o "í" cai depois de qualquer letra sem acento.
- **Fotos reais nas miniaturas das edições anteriores.** As seis edições já
  tinham foto no Storage desde o Módulo 11. Tentei tirar a pílula de trás
  das etiquetas deixando só um véu: não fecha, sobre foto quase branca a
  data caía para 2,67:1. A pílula voltou, escura e com texto branco nos
  dois temas — ali o fundo é a fotografia, não a superfície do tema. Pior
  caso agora: 8,2:1. O rótulo da palestrante, que aparecia truncado como
  "Idealizador…" em quatro das seis células, agora só aparece quando a
  edição teve convidada.

### Palestrantes

Entraram **Geórgia Maia** e **Carla Martins**, que o histórico do Módulo 11
confirma terem conduzido edições e não estavam na lista. Tópico e bio saem
do que já estava gravado no evento (`theme` e `recapText`). A tela mostra a
edição que cada uma conduziu, com a ligação saindo do dado que já existe
(`event.speaker`) em vez de uma coluna nova que sairia de sincronia.

### Animação

- **Selo na aba Eventos**: a estrela de 4 pontas da marca, com brilho de
  ciclo longo (5,5s, a maior parte em repouso — pulsação contínua vira
  ruído e o olho aprende a ignorar). Só acende quando existe evento "em
  breve", então se apaga sozinho quando a agenda esvazia.
- **Post em destaque se anuncia na abertura**: sobe 12px e um brilho
  atravessa o card uma vez. Uma vez por carga da página, não a cada visita
  ao Início — trocar de aba remonta a tela, e um estado de componente faria
  a animação tocar de novo toda vez.
- As duas usam só `translate`/`opacity`/`rotate`. Nada de `scale`: as duas
  vivem dentro de elementos com `backdrop-filter` (§9 do design system).

### Módulo 5 — começado

O app passou a poder gravar conteúdo e subir foto. A escrita não foi
"liberada": ganhou dono.

- **`admins`**, tabela separada de `profiles` porque a política de
  `profiles` é `for all` sobre a própria linha — uma coluna `is_admin` ali
  seria gravável pela própria dona, e qualquer pessoa se promoveria com um
  update. A tabela nova não tem política de escrita: entra quem for
  inserido pelo SQL Editor.
- **`e_admin()`** é `security definer` com `search_path` fixo e `stable`.
  As políticas de escrita de events/speakers/plans e do bucket `media`
  chamam ela. As de leitura pública não foram tocadas.
- **`GaleriaEditor`**, componente novo: o arquivo sobe assim que é
  escolhido, não no "Salvar" — segurar tudo para enviar de uma vez deixaria
  a usuária olhando um botão travado sem saber se são 2s ou 40s. Cada foto
  tem seu estado, e um erro em uma não derruba as outras. A miniatura
  durante o envio é a prévia local `blob:`, revogada ao desmontar.
- **O formulário diz onde vai salvar antes de a pessoa digitar**, e o toast
  diz onde salvou.

Falta palestrante, plano e post — hoje só evento tem gravação real.

### Decisão registrada: o rótulo da aba

"Palestrantes" **não cabe** na navegação. Medido: célula de 59px em 375px
contra 72px que a palavra pede em 12px; não entra nem a 11px, e alargar a
pílula ao máximo ainda deixa 4px faltando. As saídas reais (tirar "Sobre"
da barra, ou voltar à barra fixa) foram apresentadas ao usuário, que
escolheu manter "Palestras". O título da tela continua "Palestrantes".

---

## v3.0.0 — Manual de Marca oficial: app e landing espelham a marca
**Sessão 19 — 31/08/2026**

As sócias organizaram um **manual de marca** e o entregaram (PDF de 10
páginas). Com ele, a camada 1 do `tokens.css` deixou de ser escolha nossa:
passou a ter dono externo. MAJOR sobe porque isso muda o contrato do
projeto, não só a aparência.

### O manual entrou no repositório

- **`docs/MANUAL-DE-MARCA.md`** — o manual transcrito: paleta com hex,
  papel de cada fonte, regras da logomarca, critério de imagens, e um mapa
  de onde cada coisa aparece no código. O PDF original ficou em
  **`docs/marca/`**, mas ninguém precisa abri-lo para trabalhar (são 10
  JPEGs de 300 dpi, não dá para pesquisar nem revisar em diff).
- O que é **decisão nossa** e não do manual está marcado como tal, para
  ninguém confundir depois.

### Cores

A paleta antiga (`--wine #7c2a3d`, `--gold #c79a55`, `--plum`, `--blush`)
saiu inteira. Entrou a oficial:

| | |
|---|---|
| Principais | Dourado `#C9A66B` · Cream Quartz `#F6F3EE` · Almond `#EADED0` · Sand `#D9B991` |
| Apoio | Walnut `#402814` · Deep Maroon `#400106` · Burgundy `#65202D` · Olive `#4A5A3A` · Moss `#8C916C` |

Os dois temas foram remapeados papel a papel. **Ônix**: preto derivado do
Walnut (`#0F0A06`) e, como superfície elevada, o `#372E25` **medido no
pixel** da página 06 do manual, onde a logo aparece em uso reverso — não é
um tom inventado. **Pérola**: Cream Quartz de fundo, texto Walnut, Burgundy
na ação. Saíram os dois azuis que sobravam (a quarta mancha do mesh e um
placeholder) — o manual não tem azul.

Duas cores derivadas, que o manual não tem e existem por medição:
`--brand-gold-deep #8A6B32`, porque o dourado oficial sobre o Cream Quartz
dá **1,9:1** e não pode carregar texto no tema claro (no Ônix dá 9,3:1, e
aí pode); e `--brand-reverse #372E25`, o tal pixel medido.

### Tipografia

Fraunces e Instrument Serif eram escolha nossa, de antes do manual, e
saíram. Entraram as do manual:

- **Cormorant SC** — só o "TRÍADE" da assinatura, caixa alta e tracking
  amplo, como o manual especifica. Não é fonte de título.
- **Playfair Display** — títulos, destaques e citações. "Usar sempre
  Playfair Display" está entre as regras fixas do manual.
- **Inter** — textos informativos, datas, locais. Já era a fonte de texto;
  o manual confirmou o papel.

A quarta fonte, **Slight** (o "conecta" da assinatura), **não entrou como
fonte** — e não precisava. Ela é comercial (Up Up Creative), e a licença
que a marca tem, Desktop, cobre "logo design" e "criação de imagens para
sites": **a logo como desenho**, não `font-family` num site (isso seria a
licença Webfont, ~US$27). Some-se "não trocar tipografia" estar entre os
usos incorretos, e a saída era tratar a assinatura como o que ela é.

Então o "conecta" virou **desenho**: o traço original, recortado da
logomarca da página 06 do manual a 400 dpi, guardado como máscara alfa em
`public/marca/conecta.png` (300×57, 10 KB) e aplicado com `mask-image` +
`background-color: currentColor` — por isso ele muda de cor com o tema,
dourado no Ônix e burgundy no Pérola, sem existirem duas imagens. O texto
segue no DOM dentro de um `@supports (mask-image)`, como reserva.

Efeito colateral bom: empilhada como o lockup do manual, a assinatura mede
a largura do "TRÍADE" (~110px) em vez dos ~165px que media lado a lado.
Com isso caiu a regra que escondia o "conecta" abaixo de 390px — a
assinatura completa voltou para as telas pequenas, e a folga do cabeçalho
não mudou (medido em 360, 375, 390 e 430px).

O cliente havia citado **Mont** como segunda fonte de texto; a página 04 do
manual mostra **Inter** nesse papel. Perguntado, confirmou Inter. Registrado
em `docs/MANUAL-DE-MARCA.md`.

### Contraste: três defeitos que já existiam

A migração exigiu medir tudo de novo, e a medição **no pixel renderizado**
(não na conta em cima dos tokens) expôs três reprovações da WCAG que já
estavam no ar antes desta sessão:

| Onde | Antes | Causa | Agora |
|---|---|---|---|
| Rótulo inativo da tab bar | 3,0–4,0:1 | a pílula é translúcida, então o contraste mudava conforme o conteúdo que passava por baixo | `--tab-idle` reforçado nos dois temas |
| "/mês" do plano em destaque (Pérola) | 1,6:1 | herdava `--ink-70`, que é escuro, num card de fundo escuro | token `--on-dark-70` novo, regra escopada |
| Rótulo **ativo** da tab bar (Pérola) | 4,3:1 | a pílula clareava demais sobre a página creme | fundo próprio para a pílula, mais escuro e ainda translúcido |

Resultado medido depois, nas cinco telas e nos dois temas: **zero
reprovações** (era 14 no Ônix e 37 no Pérola quando a medição começou).

### Landing

Mesma paleta, mesmas fontes. Além disso:

- A barra fixa ainda dizia **"19 de setembro"** e o fecho falava em **"85
  vagas"** — restos do conteúdo mock que escaparam da rodada anterior.
- Faltava **`<meta viewport>`**. Dentro do artifact o invólucro injeta a
  dele e escondia o problema; publicada em `/convite.html`, a página
  montaria a 980px no celular e apareceria reduzida.
- Artifact republicado no mesmo endereço, com as fotos embutidas em `data:`
  URI (a CSP do artifact bloqueia imagem externa).

### Erro achado no manual

A página 03, no item **"1. LOGOMARCA PRINCIPAL"** — justamente a arte que
um designer copiaria —, traz a palavra escrita **"coneecta"**, com dois
"e". As versões da página 06 estão corretas, e foi de lá que a máscara
saiu. Registrado para as sócias corrigirem com quem produziu o manual.

### Nota de método

Duas armadilhas que valem para a próxima sessão, registradas porque as duas
quase produziram conclusão errada:

1. **O Google Fonts não é alcançável do contêiner** (ERR_CONNECTION_RESET,
   com ou sem proxy). Toda captura de tela sai em fonte de fallback, e
   "parece serifada" não é o mesmo que "é a Playfair". A verificação só
   passou a valer depois de servir os `.woff2` do disco no Playwright.
2. **`document.fonts.check()` mente** — devolve `true` mesmo quando o
   navegador só arranjou um fallback. O que não mente é a lista de faces
   com `status === 'loaded'`.

---

## v2.6.0 — Landing page de captação (rascunho)
**Sessão 17 — 27/08/2026**

As sócias vão colocar um outdoor com QR code e pediram uma página para ser
o destino dele. Não é o app: mandar um scan frio para o feed, que não
explica o que é a Tríade, desperdiçaria a mídia.

- **`landing/convite.html`** — `.html` autocontido, **fora do build**, que
  abre direto no navegador. Fica fora de `src/` de propósito: não faz parte
  do app e não deve ser confundido com ele.
- **Estratégia da página**, decidida antes do desenho e registrada em
  `landing/README.md`: **uma única ação, WhatsApp** (formulário com e-mail
  parece trabalho; o app já tem o fluxo com as três sócias); **a página não
  vende assinatura**, porque ninguém assina uma comunidade que nunca
  experimentou — o funil é outdoor → encontro → aí assina; e a primeira
  tela se basta sozinha, para quem não rolar.
- **Desenho**: mundo visual Ônix (o mesmo tema padrão do app), tipografia
  da marca com o Instrument Serif itálico dourado quebrando cada título na
  palavra que importa, e a estrutura organizada pela própria tríade — as
  três setas da marca separam as seções, os números são três, as
  idealizadoras são três.
- Publicado como artifact para as sócias revisarem no celular; **a URL está
  registrada no `landing/README.md`** para que uma sessão futura republique
  no mesmo endereço em vez de criar uma segunda versão circulando.

**Pendente:** padding e formatação, fotos reais (dependem do Módulo 11),
conferência de verossimilhança das informações, depoimento real no lugar do
fictício, descrição da Cris, e os links de WhatsApp/Instagram, hoje em
`href="#"`.

**Arquivos gerados:** `landing/convite.html`, `landing/README.md`,
`CLAUDE.md`, `docs/{CHANGELOG,ESTADO-DO-PROJETO}.md`

---

## v2.5.0 — Auditoria de UI/UX e recalibragem para o público real
**Sessão 17 — 26/08/2026**

Auditoria completa do app com as skills `design-systems` e `revisar-mobile`
mais medição automatizada, e as correções que saíram dela. O público foi
redefinido nesta sessão: **empreendedoras de ~35+, acostumadas ao
Instagram** — a calibragem é ficar um degrau acima da densidade do
Instagram, não replicá-la.

### O que a auditoria mediu (antes)

- **83% do texto visível abaixo de 16px**, 81% abaixo de 14px; o menor
  tinha 9,5px (pílula de status).
- **A tipografia inteira em `px`**, então o app ignorava por completo o
  tamanho de fonte escolhido no celular: navegador em 24px, app
  renderizando 13,5px — 0% do aumento aplicado.
- **Barra de navegação com cinco ícones e nenhum rótulo.**
- `--ink-45` em **2,7:1** no tema claro, abaixo do mínimo de 4,5:1 da WCAG;
  o tema Pérola (padrão) reprovava em 3 de 14 elementos, contra 2 do Ônix.
- CTA do cabeçalho e engrenagem a **6px** um do outro.

Relatório completo com método e plano de ação: publicado como artifact
nesta sessão.

### O que mudou

- **Escala tipográfica em `rem`** (`--fs-3xs` … `--fs-price`), com piso de
  12px e texto corrido em 16px. As 69 declarações de `font-size` em px do
  projeto viraram tokens; não sobrou nenhuma. Resultado medido: texto
  abaixo de 14px caiu de **81% para 28%**, e o conteúdo agora **escala de
  16 para 24px** quando a usuária aumenta a fonte do sistema.
- **Distinção conteúdo × cromo** (`--fs-chrome-*`): controles em espaço
  fixo — rótulo da tab bar (5 colunas) e botões do cabeçalho (uma linha) —
  usam `clamp` e param de crescer antes de quebrar. Sem isso, em fonte
  grande o cabeçalho estourava a largura e os rótulos das abas cortavam
  (as duas coisas medidas, e é por isso que a regra existe).
- **Ônix virou o tema padrão**, e por isso os valores dele **mudaram de
  lugar**: agora moram no `:root`, e o Pérola é que virou o bloco
  `[data-theme='perola']`. O tema padrão precisa pintar certo com CSS puro
  — se dependesse do script, toda abertura piscaria o tema errado. Testado
  com JavaScript desligado.
- **Barra flutuante ("Padrão 2") virou o padrão**, agora **com rótulo de
  texto** em cada item. A aba de palestrantes chama-se "Palestras": o nome
  completo não cabe nos ~64px por item e virava reticências (medido). O
  ponto indicador saiu — com o nome escrito, não informava mais nada.
- **Contraste corrigido no Pérola**: `--ink-70` e `--ink-45` escurecidos
  até 8,4:1 e 4,6:1. O tema passou de 3 reprovações no AA para **zero**.
  No Ônix os mesmos níveis subiram para 10,5:1 e 6,6:1.
- **Fileira de "stories" removida do Início.** Parecia stories do Instagram
  (anel circular = foto que some) mas entregava navegação **duplicada**:
  4 dos 5 atalhos levavam a destinos que já estão na barra de baixo ou no
  CTA, com nomes DIFERENTES dos de lá ("Conexão" para Sobre, "Inspiração"
  para Planos), ensinando um vocabulário errado; o 5º não levava a lugar
  nenhum. E os três nomes já apareciam escritos logo abaixo, na seção dos
  pilares. O componente ficou parado, documentado, para voltar no Módulo 11
  com foto real do export do Instagram.
- **Migração de preferências preservada**: quem escolheu o tema claro
  quando ele se chamava 'areia' continua no claro (e não cai no novo
  padrão escuro); quem escolheu a barra antiga continua com ela. A troca de
  padrão só vale para quem nunca escolheu.
- `min-height` da caixa de texto em `em` em vez de px — com fonte grande
  ela mostrava menos linhas e cortava o conteúdo.
- Manifest e `theme-color` acompanham o novo padrão escuro;
  `apple-mobile-web-app-status-bar-style` passou a `black`.

### Verificação

18 testes funcionais automatizados, todos passando: padrões de fábrica,
pintura sem JavaScript, escala tipográfica em 16/24px, cromo não escalando
junto, troca e persistência de tema, aplicação antes do React montar, e as
três migrações de valor salvo. Layout conferido em 375 e 360px, nos dois
temas, com a fonte do sistema em 16, 20 e 24px — sem estouro de largura e
sem texto cortado em nenhuma combinação.

**Um erro de método corrigido no caminho:** o primeiro teste de escala usou
`Page.setFontSizes` do CDP e acusou falha. Era o teste que estava errado —
esse comando não surte efeito neste Chromium. Conferido por outro caminho
(injetando `html{font-size:24px}`, que é o que o ajuste do navegador faz na
prática), o `rem` funcionava desde o início.

### Onda 2 da auditoria — executada na mesma sessão

- **Alvo de toque mínimo subiu de 38 para 44px** (referência da Apple HIG)
  em todo o app. Onde aumentar a caixa estragaria o desenho, só a área
  cresceu: `padding` + margem negativa nas ações do feed, e um `::after`
  com `inset` negativo na engrenagem — que continua com 38px de círculo
  para não pesar no cabeçalho. Verificado com clique real 2,5px fora do
  círculo: abre Configurações.
- **CTA e engrenagem separados**: 6px → 12px. Com 6px, abrir Configurações
  querendo ver os Planos era questão de tempo.
- **Abas Lista/Calendário de 32 para 44px** — é o controle que troca a tela
  inteira de Eventos, errar ali custa caro.
- **Botão de comentar removido do feed.** Ele só mostrava "em breve". Um
  botão que não faz o que promete não é lido como "ainda não pronto": é
  lido como "eu errei alguma coisa" ou "esse app está quebrado". Volta no
  Módulo 3, com comentários de verdade.
- **"Padrão" e "Padrão 2" viraram "Barra flutuante" e "Barra fixa"**, com
  miniatura mostrando a forma de cada uma, no mesmo espírito da amostra de
  tema. Os nomes antigos eram vocabulário de desenvolvedor e obrigavam a
  testar os dois para descobrir a diferença. Os valores salvos continuam
  'padrao'/'padrao2', então ninguém perde a escolha.

**O cabeçalho estourou por causa disso e foi recalibrado.** Somados, o CTA
maior, a engrenagem de 44px e os 12px de respiro deixaram logo e ações
encostados em 390px e abaixo (medido: 0px de folga). A correção foi tornar
explícita a **ordem de sacrifício** do cabeçalho — ≤430px o CTA encurta o
texto; ≤389px a marca solta a assinatura "conecta"; o espaço entre alvos
não cede nunca. Folga final: 23 a 63px conforme a largura.

### Acabamento do cabeçalho (fim da sessão)

O símbolo e "TRÍADE" estavam a 9px um do outro e a assinatura "conecta"
colada no nome, lendo como uma palavra só. Além disso, o `space-between`
não garantia separação nenhuma entre a marca e os botões quando os dois
lados cresciam. Gap interno da marca 9→13px, margem da assinatura 1→5px, e
um piso de 18px no `.app-top`. Folga entre marca e ações: 19 a 59px
conforme a largura, contra 0px antes.

**Arquivos alterados:** `index.html`, `public/manifest.webmanifest`,
`src/components/{TabBar,Stories}.tsx`, `src/screens/Home.tsx`,
`src/context/{ThemeContext,TabBarStyleContext}.tsx`,
`src/styles/{tokens,base,layout,components}.css`,
`docs/{DESIGN-SYSTEM,CHANGELOG,ESTADO-DO-PROJETO}.md`

---

## v2.4.0 — Ajustes de design a partir da revisão de UI/UX
**Sessão 16 — 25/08/2026**

Continuação direta da `v2.3.0`, com o tema já publicado e visto no
aparelho. Rodada a skill `revisar-mobile` (diagnóstico) + a
`design-systems` (regras) sobre o app inteiro nos dois temas.

- **Tema claro renomeado de "Areia" para "Pérola".** Faz par com "Ônix" —
  as duas são pedras, uma clara e uma escura, e "Pérola e Ônix" lê como
  uma coleção pensada em vez de duas escolhas soltas. O valor salvo no
  aparelho mudou junto (`areia` → `perola`); quem tinha o nome antigo
  gravado cai no tema padrão em vez de ficar com um `data-theme`
  inexistente (coberto por teste).
- **Cabeçalho borda a borda.** `.app-top` herdava o `border-radius` de
  `.glass` e vazava o fundo nos quatro cantos — quase invisível no tema
  claro, evidente no escuro. Zerado.
- **Amostra do tema redesenhada.** Era um disco com gradiente de três
  cores, que lia como uma mancha. Virou uma **mini-tela do app** (fundo,
  card com linha de texto e pílula de ação na cor de acento) — quem
  escolhe reconhece o app em vez de decodificar uma paleta. Alimentada por
  `--preview-<tema>-bg/-card/-ink/-accent`; o desenho é único e serve para
  qualquer tema futuro.
- **A tab bar "Padrão 2" virou um grupo de fato flutuante.** Antes o
  `<nav>` reservava altura em fluxo, então debaixo da pílula havia uma
  faixa opaca do fundo e o vidro não tinha o que desfocar. Agora o `<nav>`
  sai do fluxo (`.app-tabs-floating`), o conteúdo passa por baixo e a
  `.app-main` recebe o espaço de volta em `padding-bottom`, com
  `--tabbar-float-h` como régua única dos dois lados. A pílula ganhou
  `--tabbar-float-bg`, mais translúcido que o vidro dos pop-ups.
  **Isso troca de propósito uma invariante documentada** (o `<nav>`
  sempre em fluxo, `DESIGN-SYSTEM.md` §6.2) — a seção foi reescrita
  descrevendo os dois regimes e o que fazer num 3º estilo.
- **Alvos de toque** (achado da revisão, pré-existente): os botões do feed
  mediam 26–30px e o logo 28px, abaixo do mínimo confortável. Corrigidos
  com padding + margem negativa, então a área de toque vai a 38px **sem
  mover nada no desenho**. Virou regra 9 da seção 10 do manual.
- **`statusBar` saiu do `ThemeContext`.** Os hex `#F4EEE3`/`#0B0A0A`
  estavam repetidos no componente (violando a regra de cor só em token);
  agora a `<meta name="theme-color">` é lida do próprio `--sand` do tema
  aplicado, então não há como sair de sincronia.

**Medições da revisão** (Playwright, 375px, nos dois temas): nenhum
estouro de largura real (os avisos são as fileiras de rolagem horizontal
intencional — stories e idealizadoras); `body` continua sem rolar; safe
area preservada; contraste medido no pixel renderizado — o pior caso do
Ônix é 4,2:1 na linha secundária do post (AA para texto grande) e do
Pérola é 2,6:1 no mesmo elemento, ou seja **o tema escuro ficou mais
legível que o claro** nesse ponto. Com a tab bar flutuante, sobram 33–51px
entre o último item de cada tela e a pílula.

**Fica pendente, não alterado** (precisa da sua decisão, muda o desenho):
o controle Lista/Calendário da tela Eventos tem 30px de altura — abaixo
dos 38px recomendados. Aumentar deixa o controle visivelmente mais alto.

### Acabamento (mesma sessão, após ver o app no aparelho)

- **Realce azul de toque removido.** Tocar numa aba (e em qualquer botão)
  pintava um retângulo azul translúcido atrás do elemento — é o
  `-webkit-tap-highlight-color` padrão do navegador, que o projeto nunca
  tinha desligado. Quadrado, fora da paleta e por cima de cantos
  arredondados, aparecia como falta de acabamento.
- **Abas ganharam `:active` próprio**, que não existia: o ícone afunda
  (`scale(0.86)`) e, na pílula, o fundo acende como cápsula arredondada.
  Isso não é enfeite — sem o realce do navegador, um elemento sem
  `:active` fica **sem nenhum retorno ao toque**. Virou regra no manual
  (seção 7).
- **`:focus-visible` global** com anel de 2px na cor de acento, no lugar do
  padrão azul. Só aparece em navegação por teclado, então desligar o realce
  de toque não custou acessibilidade.
- **Respiro entre os atalhos e o primeiro post** aumentado de 4px para
  18px — com 4px os dois blocos liam como um só.

### Fechamento da sessão

Documentação atualizada pelo protocolo (seção 9 do `ESTADO-DO-PROJETO.md`):
mapa de arquivos com `ThemeContext.tsx`, `tokens.css` e `content-raw/`;
seção 5 registrando que os temas são **escolha manual** (não seguem
`prefers-color-scheme` nem horário); roadmap com o Módulo 12 (temas)
concluído e o **Módulo 11 marcado como próximo passo**; `LAST-SESSION.md`
de volta para "nada interrompido".

Registrada também, a pedido, a diferença entre **export oficial** e **Graph
API** do Instagram (`ESTADO-DO-PROJETO.md`, seção 6, item 10): o plano é o
export — sem app na Meta, sem token que expira e com o arquivo original —
porque o objetivo é trazer o acervo **uma vez**, por curadoria. A API só
faria sentido se o app fosse espelhar o Instagram continuamente, que é
outro escopo.

**Arquivos alterados:** `src/App.tsx`, `src/context/ThemeContext.tsx`,
`src/styles/{tokens,base,layout,components}.css`,
`docs/{DESIGN-SYSTEM,CHANGELOG,ESTADO-DO-PROJETO,LAST-SESSION}.md`,
`CLAUDE.md`

---

## v2.3.0 — Tema "Ônix" (preto, branco e dourado) selecionável no app
**Sessão 16 — 25/08/2026**

Pedido: uma das sócias questionou a paleta atual. Em vez de trocar o
visual (regra 7 da seção 10 do `DESIGN-SYSTEM.md`), o novo visual entrou
como **opção em Configurações → Aparência** — o tema Areia continua o
padrão e ninguém é surpreendido.

- **Sistema de temas de verdade, não um "modo escuro" remendado.**
  `tokens.css` foi reorganizado em três camadas: paleta de marca (não muda
  com o tema) → papéis semânticos (`--accent`, `--glass`, `--ph-grad`,
  `--btn-primary-grad`…) → blocos de tema. `layout.css` e `components.css`
  passaram a consumir **só** a camada semântica: não existe nenhum seletor
  `[data-theme=...]` fora do `tokens.css`, então um tema novo é um bloco
  de variáveis, sem tocar em componente. Documentado em
  `docs/DESIGN-SYSTEM.md`, seção 1 (reescrita).
- **Tema Ônix**: preto quente `#0B0A0A` (não azulado, pra casar com o
  dourado), texto `#F7F5F1`, dourado `#D9B36C` — 10,3:1 de contraste sobre
  o fundo. Dourado é **detalhe**, nunca superfície grande: hairline do
  pop-up e da tab bar, ícone da aba ativa, preço, pílula "em breve" e os
  botões de ação (dourado com texto preto — o ponto mais claro da tela é
  sempre uma ação). Vidro escuro virou superfície *mais clara* que o
  fundo, para preservar a hierarquia que no Areia vinha do contraste
  claro/escuro.
- **`ThemeContext`** (`src/context/ThemeContext.tsx`), no mesmo molde do
  `TabBarStyleContext`: grava `data-theme` no `<html>`, persiste via
  `prefs.ts` e atualiza a `<meta name="theme-color">` — sem isso o tema
  escuro fica com uma tira clara na barra de status do Android/atalho iOS.
- **Sem piscada ao abrir**: um `<script>` curto no `index.html` aplica o
  tema salvo antes do React montar. É o único ponto do projeto que lê
  `localStorage` fora de `prefs.ts`, exceção documentada nos dois lugares
  (qualquer import já seria tarde demais para evitar o flash).
- **Configurações ganhou a seção "Aparência"**, com amostra circular de
  cada tema, subtítulo e `aria-pressed` — variante nova da lista estilo
  iOS (`.ios-row-main`/`.theme-swatch`), documentada na seção 4.4 do
  manual.
- **Bug de fundo encontrado no caminho — placeholder gravado no conteúdo.**
  `post.mediaGradient` e `event.recapMedia[].url` guardam strings de
  gradiente que referenciavam cor de **marca** (`var(--gold-soft)`), que
  por definição não muda com o tema: no Ônix acendiam retângulos claros no
  meio da tela preta. Criada a escala `--ph-1`…`--ph-5`, que cada tema
  define, e o conteúdo (`src/data/seed.ts` + `supabase/seed.sql`) passou a
  referenciar ela. Regra nova no manual (seção 1.4).
- **`color-scheme` por tema**: os controles nativos do navegador (lista do
  `<select>`, botão de limpar da busca, barra de rolagem) seguem o tema —
  sem isso, o `<select>` do formulário de edição abriria um dropdown
  branco no meio do tema escuro.
- **Contorno de tile** (`--ph-border`) nas grades de Eventos e
  Palestrantes: sem ele o tile escuro sumia no fundo escuro. Feito com
  `outline`/`outline-offset: -1px` em vez de `border`, para custar zero no
  tema Areia, inclusive em layout.
- **Correção de robustez em `prefs.ts`** (pré-existente, encontrada nos
  testes): `typeof window.localStorage` **não** protege quando o navegador
  bloqueia o storage — o acesso já lança, e o app inteiro morria na
  primeira leitura de preferência. Agora cai no valor padrão.
- **Verificação**: 22 telas e pop-ups capturados nos dois temas em 375px
  (e o Ônix também em 360px) com Playwright — Início, Sobre, Eventos
  (lista/grade/calendário), Palestrantes, Planos, os 6 pop-ups, kebab,
  toast, busca e as duas tab bars. **O tema Areia foi comparado pixel a
  pixel com a versão anterior: 21 das 22 capturas idênticas**, e a única
  diferença é o pop-up de Configurações, que ganhou a seção nova de
  propósito. Duas regressões reais foram pegas assim e corrigidas antes de
  fechar (a borda superior do plano em destaque e o deslocamento de 1px
  dos chips das grades). Mais 14 testes funcionais: padrão, troca,
  persistência, `theme-color`, anti-flash e storage bloqueado.

**Arquivos gerados/alterados:** `src/context/ThemeContext.tsx` (novo),
`src/App.tsx`, `src/components/SettingsSheet.tsx`, `src/lib/db/prefs.ts`,
`src/data/seed.ts`, `src/styles/{tokens,base,layout,components}.css`,
`index.html`, `supabase/seed.sql`,
`docs/{DESIGN-SYSTEM,CHANGELOG,ESTADO-DO-PROJETO}.md`

---

## v2.2.0 — Estratégia de mídia real (Módulo 11) + código pronto pra fotos
**Sessão 15 — 23/08/2026**

- **Decisão de origem do material real** (fotos/vídeos de mais de 7
  edições e outros eventos): **não** fazer scraping do Instagram — violaria
  os Termos de Uso e arriscaria a conta ser bloqueada por atividade
  automatizada. Em vez disso, usar a ferramenta **oficial** de exportação
  de dados do próprio Instagram (Configurações → Central de Privacidade →
  Baixar suas informações), que traz posts + stories (destaques inclusos,
  já que são só stories arquivados fixados) com legendas, datas e os
  arquivos de mídia originais. Documentado em `docs/ESTADO-DO-PROJETO.md`,
  seção 7, item 1.
- **`content-raw/instagram-export/`** criada na raiz do projeto — pasta de
  trabalho local pro usuário extrair o export ali, **ignorada pelo Git**
  (`.gitignore`, com `content-raw/README.md` como exceção documentando o
  formato esperado) — nunca é commitada, é só matéria-prima.
- **Módulo 11 planejado** (`docs/ESTADO-DO-PROJETO.md`, seção 6): curadoria
  assistida do material → bucket público no Supabase Storage (leitura
  pública via toggle "Public bucket", escrita restrita por padrão — sem
  política de `insert`, a chave `anon` não grava) → plugar no app.
- **Código do Passo 3 já pronto, antes mesmo do bucket existir**:
  `EventRecapModal.tsx` agora detecta se `recapMedia[].url` é o gradiente
  placeholder (`começa com "linear-gradient"`) ou uma URL real — no
  segundo caso já renderiza `<img>` mantendo o `aspect-ratio` quadrado
  (`.recap-photo img` em `components.css`). Assim que uma URL real do
  Storage entrar no dado, a foto aparece sem precisar tocar em código de
  novo. Mesma lógica ainda falta portar pro Módulo 8 (Sobre) quando ele for
  implementado.
- **Pendente pro usuário**: criar o bucket `media` no painel do Supabase
  (Storage → New bucket → marcar "Public bucket") — não fazível por código,
  precisa do painel. Passo a passo em `docs/ESTADO-DO-PROJETO.md`, Módulo
  11, Passo 2. Sem o bucket, nada quebra — a retrospectiva continua com os
  gradientes placeholder normalmente.

**Arquivos gerados/alterados:** `.gitignore`, `content-raw/README.md`,
`src/components/EventRecapModal.tsx`, `src/styles/components.css`,
`docs/{CHANGELOG,ESTADO-DO-PROJETO,SUPABASE}.md`, `CLAUDE.md`

---

## v2.1.0 — Login com Google corrigido de verdade + guia de domínio próprio
**Sessão 15 — 23/08/2026**

- **Bug real encontrado e corrigido: login com Google não completava.**
  Documentado como "confirmado" numa sessão anterior no mesmo dia, mas a
  verificação tinha parado na tela de login do Google, sem completar o
  fluxo de volta pro app — o login na prática falhava (não redirecionava,
  tab bar não trocava o ícone pela foto). Rastreei a rede real com
  Playwright (app → `supabase.auth.signInWithOAuth` → `.../authorize` →
  tela real do Google, tudo certo até ali) e cheguei à causa: faltava
  `https://triade-sand.vercel.app` em **Authentication → URL Configuration
  → Redirect URLs** no painel do Supabase — sem essa entrada, o Supabase
  recebe a resposta do Google mas não sabe pra onde te devolver, e falha
  essa última perna em silêncio. Corrigido pelo usuário no painel; validado
  em produção depois — login completo, tab bar já mostra a foto.
- **Problema secundário corrigido**: 4 instâncias de `npm run dev`
  esquecidas de sessões anteriores (portas 5173–5180) — isso faria o
  servidor local cair sempre numa porta diferente, quebrando o mesmo tipo
  de lista de URLs permitidas em ambiente local. Encerradas.
- **Foto de perfil maior na tab bar** (`TabBar.tsx`): 22px→28px (Padrão) e
  20px→26px (Padrão 2) — um pouco maior que os outros ícones, pra se
  destacar como "você" (padrão Instagram/TikTok).
- **Guia de domínio próprio** (`docs/DEPLOY.md`): onde registrar (`.com.br`
  no Registro.br, ~R$40/ano, recomendado; `.com` via Cloudflare
  Registrar/Namecheap, ~US$9–15/ano), passo a passo completo (Vercel →
  Supabase → Google Cloud), e nota importante: **o domínio próprio sozinho
  não troca** o texto "zirrdajydxbydnyaebza.supabase.co" pela marca na tela
  de login do Google — isso exigiria o Custom Domain do Supabase Auth
  (plano Pro, custo recorrente), registrado como decisão separada.

**Arquivos gerados/alterados:** `src/components/TabBar.tsx`,
`docs/{DEPLOY,SUPABASE,ESTADO-DO-PROJETO}.md`

---

## v2.0.0 — Eventos redesenhado: calendário + retrospectiva (Módulo 9)
**Sessão 14 — 23/08/2026**

Redesenho completo da tela Eventos (`src/screens/Eventos.tsx`), planejado e
detalhado com o usuário na mesma sessão antes de codar (ver
`docs/ESTADO-DO-PROJETO.md`, Módulo 9):

- **Controle Lista / Calendário** no topo (`.segmented`), no lugar do
  antigo filtro Todos/Em breve/Realizados — o novo layout já separa
  "próximo" de "anteriores" visualmente, então o filtro ficou redundante.
- **Modo Lista**: próximo evento em **card grande** (`EventCard`, novo
  `variant="featured"`) → **grade 3 colunas** das edições anteriores
  (`.event-grid`/`.event-cell`, mesmo padrão visual da grade de
  Palestrantes) com **scroll infinito** (`useInfiniteReveal`,
  `IntersectionObserver`, sem paginação real — dataset ainda pequeno) →
  **busca** (`.ev-search`) filtrando por tema/palestrante/mês, escopada a
  esta tela.
- **Modo Calendário**: `EventCalendar.tsx` novo — mês corrente, navegação
  ‹ ›, marcador nos dias com evento; tocar num dia com evento volta pro
  modo Lista e abre o card certo direto.
- **Retrospectiva em artigo**: `EventRecapModal.tsx` novo (sempre via
  `ModalOverlay`) — texto longo + galeria de fotos/vídeos para edições já
  realizadas, abre ao tocar numa célula da grade. `TriadeEvent` ganhou
  `recapText?`/`recapMedia?`, populados nas duas primeiras edições em
  `data/seed.ts` (fotos ainda em gradiente placeholder, sem material real).
- **Pendente no banco real**: `recap_text`/`recap_media` foram
  acrescentados a `supabase/schema.sql` (`alter table ... add column if
  not exists`, idempotente) e `supabase/seed.sql`, mas ainda **não foram
  rodados contra o projeto Supabase real** — isso é uma ação em sistema
  externo, fora do escopo do que o Claude Code roda sozinho. Até rodar, o
  pop-up de retrospectiva mostra "Em breve, o registro completo dessa
  edição" em vez do conteúdo (degradação graciosa, comportamento
  esperado). Instruções em `docs/SUPABASE.md`.
- **Nota sobre o calendário "que sumiu"**: o usuário lembrava de uma
  visualização em calendário que existia antes — não foi encontrada nem no
  código atual, nem no `git log`, nem no `legacy/`. O `EventCalendar.tsx`
  novo foi desenhado do zero, não restaurado.
- **Validado** com `tsc -b` + `vite build` e Playwright em 375px: modo
  Lista, modo Calendário, abrir a retrospectiva a partir da grade e do
  calendário, busca filtrando e mostrando estado vazio — inclusive um teste
  isolado forçando o provider local (sem credenciais do Supabase) pra
  confirmar o render de texto/galeria da retrospectiva, já que o projeto
  real ainda não tem as colunas novas.

**Arquivos gerados/alterados:** `src/screens/Eventos.tsx`,
`src/components/{EventCalendar,EventRecapModal,EventCard}.tsx`,
`src/hooks/useInfiniteReveal.ts`, `src/lib/format.ts`,
`src/lib/db/supabaseProvider.ts`, `src/types/{index,database}.ts`,
`src/data/seed.ts`, `src/styles/components.css`,
`supabase/{schema,seed}.sql`,
`docs/{DESIGN-SYSTEM,ESTADO-DO-PROJETO,SUPABASE}.md`

---

## v1.2.0 — Google confirmado + navegação reestruturada para vender melhor
**Sessão 13 — 23/08/2026**

- **Login com Google confirmado funcionando de ponta a ponta**: o usuário
  concluiu a configuração no Google Cloud e no painel do Supabase; o botão
  agora redireciona até a tela real de login do Google (antes retornava
  "provider is not enabled"). `docs/SUPABASE.md` atualizado de "pendente"
  para "configurado".
- **Navegação reestruturada** (pedido do usuário, pesquisado antes de
  implementar — precedente Instagram/TikTok para avatar na tab bar +
  Duolingo para upsell sempre visível):
  - **"Planos" saiu da tab bar** e virou o CTA `.btn-cta-member` — pílula
    gradiente `--gold`→`--wine`, texto "Quero ser membro!", sempre visível
    no cabeçalho, leva direto para `/planos`. A rota continua existindo
    normalmente, só não tem mais aba própria.
  - **"Perfil" entrou na tab bar** como último item (`TabBar.tsx`), no
    lugar de Planos — continua com 5 itens. Não é rota: é um botão que
    chama `useAuth().openAccount()`, mostrando a foto de quem estiver
    logada (`.tab-avatar`) ou o ícone genérico.
  - **Busca e notificações saíram do cabeçalho** — eram só placeholders
    "em breve", sem função real, e não cabiam mais junto do CTA. O bug já
    reportado do badge do sino preso na tela deixou de existir junto.
  - **Bug real encontrado por medição, não por olho**: o texto completo
    "Quero ser membro!" estourava o padding do cabeçalho em telas ≤389px
    (inclusive 375px, a referência do projeto) — só apareceu medindo
    `getBoundingClientRect()` via Playwright, visualmente parecia OK.
    Corrigido com um texto mais curto ("Seja membro!") abaixo de 390px via
    media query, medido de volta para confirmar (ver `docs/DESIGN-SYSTEM.md`
    seção 6.1 — não assuma que um CTA de texto cabe, meça).
- **Validado** com `tsc --noEmit`, `vite build`, Playwright em 360/375/390px
  nos dois estilos de tab bar (Padrão e Padrão 2) — 5 itens, sem
  sobreposição, sem erros de console, CTA navegando certo, Perfil abrindo
  o pop-up de conta nos dois estilos.

- **Nova regra operacional** (pedido do usuário, `CLAUDE.md` regra 15):
  se a sessão chegar perto do limite de contexto/créditos no meio de uma
  tarefa, gravar o estado em `docs/LAST-SESSION.md` antes de continuar —
  diferente do protocolo de fim de sessão (regra 13), que é só para tarefa
  concluída. Arquivo criado com um modelo, hoje "nada pendente".

**Arquivos gerados/alterados:** `src/components/{TopBar,TabBar}.tsx`,
`src/styles/layout.css`, `CLAUDE.md`, `docs/LAST-SESSION.md`,
`docs/{DESIGN-SYSTEM,ESTADO-DO-PROJETO,SUPABASE}.md`

---

## v1.1.0 — Login com Google + área de perfil
**Sessão 12 — 23/08/2026**

Continuação da sessão anterior, a pedido do usuário: Google como mais uma
opção de login (não substitui e-mail/senha) e uma área de perfil de
verdade, em vez do "Sua conta" só com e-mail e sair.

- **Botão "Continuar com o Google"** no `AccountSheet`, abaixo de um
  divisor "ou" — `AuthContext.signInWithGoogle()` chama
  `supabase.auth.signInWithOAuth({ provider: 'google' })`. Testado até onde
  dava sem a conta do Google Cloud: o redirecionamento até o Supabase
  funciona certinho, retornando `provider is not enabled` — ou seja, só
  falta a configuração manual (não é código). Passo a passo completo, com
  a URL de callback exata do projeto, em `docs/SUPABASE.md`.
- **Ícone do Google** novo em `Icon.tsx` — as 4 cores oficiais da marca em
  paths separados (`fill` fixo, não `currentColor`), porque o logo precisa
  ser colorido para ser reconhecível.
- **Área de perfil**: `AuthContext` agora carrega a linha de `profiles` da
  usuária (`profile`) e expõe `updateProfile()`. Novo pop-up
  `ProfileEditSheet.tsx` (reaproveitando `EditSheet`) edita nome, bio,
  Instagram e negócio. O "Sua conta" agora mostra avatar (se houver) e
  nome, com um botão "Editar perfil" antes do "Sair".
- **Foto do Google preenche `avatar_url` sozinha**: ao carregar o perfil,
  se `avatar_url` estiver vazio e a sessão tiver vindo do Google
  (`user.user_metadata.avatar_url`), grava automaticamente — nunca
  sobrescreve uma foto que a usuária já tenha. `supabase/schema.sql`
  também atualizado (`handle_new_user()` passa a copiar `avatar_url` do
  cadastro), para o mesmo já valer desde a criação da conta.
- **Domínio próprio entrou no roadmap** (pedido do usuário) — documentado
  em `docs/ESTADO-DO-PROJETO.md` e `CLAUDE.md`: a Vercel já resolve quando
  houver um domínio; só é preciso lembrar de adicioná-lo em "Authorized
  domains" no Google Cloud depois, se o login com Google já estiver ativo.
- **Validado** com `tsc --noEmit`, `vite build`, Playwright (formulário
  renderiza, botão do Google redireciona pro lugar certo, sem erros de
  console). Não foi possível testar o login completo com Google nem o
  preenchimento automático da foto, porque isso depende da configuração
  pendente no painel do Supabase.

**Arquivos gerados/alterados:** `src/context/AuthContext.tsx`,
`src/components/{AccountSheet,ProfileEditSheet,Icon}.tsx`,
`src/styles/components.css`, `supabase/schema.sql`, `CLAUDE.md`,
`docs/{ARQUITETURA,SUPABASE,DESIGN-SYSTEM,ESTADO-DO-PROJETO}.md`

---

## v1.0.0 — Módulo 2: autenticação com Supabase Auth
**Sessão 11 — 23/08/2026**

Sobe MAJOR porque fecha o Módulo 2 do roadmap (autenticação) — primeiro
marco desde a migração do Bubble (v0.x) em que o app passa a ter conta de
usuária de verdade.

- **Entrar / cadastrar / sair** via Supabase Auth (e-mail/senha), num pop-up
  novo (`AccountSheet.tsx`) acessível por um ícone de conta no cabeçalho.
  Cadastro respeita a confirmação de e-mail já exigida no projeto Supabase
  (mostra uma tela "confira seu e-mail" em vez de tentar logar direto).
  Mensagens de erro comuns do Supabase traduzidas para PT-BR
  (`AuthContext.tsx`).
- **App continua livre para navegar sem conta** — login só é pedido na hora
  de uma ação que precisa saber quem é a usuária: curtir, confirmar
  presença (RSVP) e escolher plano. `useAuth().requireAuth()` é o gate,
  chamado nesses três pontos; se o app estiver rodando sem Supabase
  configurado, a checagem sempre libera (sem backend, não tem como logar,
  então o comportamento continua idêntico a antes).
- **Engajamento passa a ser assíncrono de verdade**: `isLiked`, `toggleLike`,
  `isSaved`, `toggleSave`, `hasRsvp`, `rsvpEvent`, `cancelRsvp`,
  `getChosenPlan`, `choosePlan` — no `supabaseProvider`, gravam nas tabelas
  reais (`post_engagements`, `rsvps`, `plan_selections`) quando há sessão
  ativa; sem sessão (ou no `localProvider`), caem exatamente no mesmo
  comportamento local de sempre. `useEngagement`, `Eventos.tsx` e
  `Planos.tsx` atualizados para `await` essas chamadas.
- **Bug de tipos real encontrado e corrigido, retroativo ao app inteiro**:
  as linhas de tabela em `src/types/database.ts` eram `interface`, e o
  `@supabase/supabase-js` v2 exige que cada linha satisfaça
  `Record<string, unknown>` para inferir o schema tipado — uma `interface`
  não satisfaz essa checagem (um `type` com o mesmo formato, sim). Isso
  fazia **toda** consulta ao Supabase (inclusive as de eventos/palestrantes/
  planos, que já existiam) resolver silenciosamente para `never`, sem erro
  nenhum na declaração — só ao usar o resultado, o que nunca tinha
  acontecido porque essas leituras só faziam `.select('*')` seguido de uma
  função `map` (um `never` ali passa despercebido). Corrigido convertendo
  todas as linhas para `type`; documentado em `docs/ARQUITETURA.md` para
  não voltar a acontecer.
- **Validado** com `tsc --noEmit`, `vite build`, e testes com Playwright:
  layout do cabeçalho com o 4º ícone em 375px, abrir/alternar entrar↔
  cadastrar, e o gate de login abrindo (sem gravar nada) ao tentar curtir/
  confirmar presença/escolher plano deslogada. Não foi testado um cadastro
  real de ponta a ponta de propósito, para não criar usuária de teste no
  projeto Supabase de produção.

**Arquivos gerados/alterados:** `src/context/AuthContext.tsx`,
`src/components/AccountSheet.tsx`, `src/lib/db/{types,prefs,localProvider,
supabaseProvider}.ts`, `src/types/database.ts`, `src/hooks/useEngagement.ts`,
`src/screens/{Eventos,Planos}.tsx`, `src/components/{TopBar,Icon}.tsx`,
`src/App.tsx`, `src/styles/{tokens,components}.css`, `CLAUDE.md`,
`docs/{ARQUITETURA,SUPABASE,DESIGN-SYSTEM}.md`

---

## v0.10.0 — Manual de design vira documento vivo + skill `design-systems`
**Sessão 10 — 23/08/2026**

- **`docs/DESIGN-SYSTEM.md` reescrito por completo.** A versão anterior
  cobria só a v0.1 (cores, vidro, tipografia, um punhado de componentes).
  Agora documenta tudo construído nas sessões 6–9: o sistema de pop-up
  (`ModalOverlay`, padrão único centralizado/escuro), os dois estilos de
  ícone (linha fina vs. glifo de marca preenchido), navegação (tab bar
  Padrão/Padrão 2, regra de "variação vira opção em Configurações"), o
  catálogo de animações com a curva de easing padrão, e — em destaque,
  seção própria — a regra de performance de `backdrop-filter` que já
  causou um bug real (nunca `scale` num elemento com vidro; pausar o que
  se mexe atrás dele). Passa a ser um documento que a própria seção 11 dele
  pede para manter atualizado a cada sessão que mexer em UI.
- **Nova skill `design-systems`** (`.claude/commands/design-systems.md`):
  checklist obrigatório de UI/UX (cor só via token, vidro certo, pop-up via
  `ModalOverlay`, animação com a curva padrão, alvo de toque, variação vs.
  substituição, mobile 375px) para invocar antes de qualquer implementação
  visual nova — e lembrete de atualizar o manual depois.
- **`CLAUDE.md` atualizado** para refletir o estado real do repositório:
  mapa de arquivos com todos os componentes/contexto/libs novos desde a
  v0.5, regra nova apontando para a skill `design-systems`, a confirmação
  ao vivo de que as tabelas do Módulo 2 e a autenticação por e-mail já
  existem no Supabase (não é só o `schema.sql` do repo), e o roadmap com o
  Módulo 7 (atalho de instalação + notificações, pedido em 23/08/2026).

**Arquivos gerados/alterados:** `docs/DESIGN-SYSTEM.md`,
`.claude/commands/design-systems.md`, `CLAUDE.md`

---

## v0.9.0 — Configurações do app + tab bar flutuante (estilo Uber) como opção
**Sessão 9 — 23/08/2026**

- **Tela de Configurações** (`SettingsSheet.tsx`), acessível por um ícone de
  engrenagem novo no cabeçalho, com lista agrupada estilo iOS (seção em
  caixa alta, linhas com checkmark — `.ios-group`/`.ios-row` em
  `components.css`).
- **Tab bar com dois estilos, trocáveis nas Configurações** (pedido
  explícito do usuário: "salve como opção de dev", não substituir a atual):
  - **Padrão** — o estilo original, fixo e borda a borda.
  - **Padrão 2** — pílula flutuante e compacta, estilo Uber.
  A escolha persiste no aparelho via `TabBarStyleContext` (novo, em
  `src/context/`) e não muda o espaço reservado no rodapé entre um estilo e
  outro — só a aparência interna do `<nav>` muda, então nenhuma tela
  precisou de ajuste.
- **Bug de verdade encontrado e corrigido**: o pop-up de Configurações,
  por nascer dentro do `<header>` (que tem `backdrop-filter` via `.glass`),
  renderizava espremido dentro da caixinha do cabeçalho em vez de cobrir a
  tela — no Chrome, um ancestral com `backdrop-filter` vira o "containing
  block" de `position: fixed`. Corrigido de forma definitiva com
  `ModalOverlay.tsx` (novo): todo pop-up agora renderiza via
  `createPortal` direto em `document.body`, então a posição dele na árvore
  de componentes nunca mais pode causar esse problema. `EventModal` e
  `EditSheet` foram migrados para o mesmo componente.
- **Validado** com `tsc --noEmit`, `vite build`, e testes de ponta a ponta
  com Playwright (trocar de estilo, navegar por todas as abas, recarregar a
  página, voltar ao padrão — sem erros de console).
- Ajuste fino de proporção da pílula "Padrão 2" (feedback do usuário após
  ver a primeira versão): mais estreita e mais alta.

**Arquivos gerados/alterados:** `src/components/{SettingsSheet,
ModalOverlay,EventModal,EditSheet,TabBar,TopBar,Icon}.tsx`,
`src/context/TabBarStyleContext.tsx`, `src/App.tsx`,
`src/styles/{components,layout}.css`

---

## v0.8.0 — Desconfirmar presença em eventos
**Sessão 8 — 23/08/2026**

- **Cancelar presença**: o botão "Presença confirmada ✓" na aba Eventos
  agora funciona como alternância — tocar de novo desconfirma ("Presença
  confirmada ✓ · cancelar"). Novo método `cancelRsvp` no `DataProvider`
  (`src/lib/db/prefs.ts`, mixin `engagement`, compartilhado pelos dois
  providers automaticamente) e na tela `Eventos.tsx`.
- **Validado** com `tsc --noEmit`, `vite build` e teste de ponta a ponta
  (confirmar → cancelar → recarregar a página → estado correto persistido).

**Arquivos gerados/alterados:** `src/lib/db/{prefs,types}.ts`,
`src/components/EventCard.tsx`, `src/screens/Eventos.tsx`,
`src/styles/components.css`

---

## v0.7.0 — Pop-ups unificados, animação corrigida (jank de backdrop-filter) e planejamento do Módulo 7
**Sessão 7 — 23/08/2026**

- **Feedback visual do pop-up de WhatsApp aplicado**: centralizado na tela
  (em vez de bottom sheet), ícone oficial do WhatsApp (glifo real, selo
  verde `--whatsapp: #25d366`, em vez do desenho aproximado da sessão
  anterior), cargo trocado pelo telefone de cada sócia, sócias em ordem
  alfabética (sem hierarquia visual entre elas), cor de fundo dos cards
  trocada para um gradiente vinho/dourado translúcido, e título mais
  convidativo ("Fale com a gente!"). Removido também o emoji 🤍 do fim da
  mensagem do WhatsApp, que não renderizava (aparecia como `�`).
- **Diagnóstico de animação travada, com medição real** (Playwright + CDP
  `Emulation.setCPUThrottlingRate`, contagem de frames via
  `requestAnimationFrame`): a causa era **`backdrop-filter: blur()` tendo
  que recalcular a cada quadro** — tanto por causa do `scale()` na animação
  de entrada do pop-up quanto, de forma contínua, por causa do fundo
  animado (`.mesh`) se mexendo atrás dele o tempo todo enquanto o pop-up
  ficava aberto. Medido antes/depois: pior quadro caiu de ~117ms para
  ~50ms na entrada, e o pop-up aberto e parado foi de instável para
  **16.7ms constante (60fps)** depois da correção.
  - `useModalEffects` (novo hook, `src/hooks/`): pausa a animação do
    `.mesh` (`body.modal-open .mesh span { animation-play-state: paused }`)
    enquanto qualquer pop-up estiver aberto, e centraliza o fechar-no-Esc
    que antes estava duplicado em `EventModal` e `EditSheet`.
  - Animação de entrada (`modalup`) e de troca de etapa (`stepin`) passam a
    usar só `translateY` + opacidade — nunca `scale` — em elementos com
    `backdrop-filter`.
- **Todos os pop-ups do app unificados num único padrão visual**: `EditSheet`
  (formulários de evento/palestrante/post) deixa de ser um bottom sheet
  claro e passa a ser centralizado e escuro (`glass-dark`), igual ao
  `EventModal` — mesmo comportamento, mesma cor de fundo, mesma animação.
- **Planejamento do Módulo 7** (pedido em 23/08/2026, ainda não
  implementado): atalho na tela de início (Android/iOS) + notificações de
  evento/abertura de ingressos — documentado em
  `docs/ESTADO-DO-PROJETO.md`, seção 6, com a dependência real (login antes
  de notificação por usuária) e as duas rotas possíveis (push de verdade
  via Service Worker/Web Push + backend, ou lembrete só com o app aberto).
- **Validado** com `tsc --noEmit` (strict), `vite build`, e testes visuais/
  de performance com Playwright (mobile 375px e desktop 1440px, com e sem
  CPU throttling).

**Arquivos gerados/alterados:** `src/hooks/useModalEffects.ts`,
`src/components/{EventModal,EditSheet,Icon}.tsx`, `src/lib/whatsapp.ts`,
`src/styles/{components,layout,tokens}.css`, `docs/ESTADO-DO-PROJETO.md`

---

## v0.6.0 — Pop-up de evento com compra via WhatsApp + edição inline de conteúdo
**Sessão 6 — 23/08/2026**

- **Pop-up "Detalhes do evento"** (`EventModal.tsx`): tocar no post em
  destaque da Início abre um pop-up com tema, data, local, palestrante e
  vagas. Botão **"Quero participar"** leva a um segundo passo do mesmo
  pop-up com as **3 sócias** (Lívia, Lia, Cris) — cada uma abre o WhatsApp
  (`wa.me`) com uma mensagem pronta citando o evento e a data. Números
  ficam em `founders[].whatsapp` (`src/data/seed.ts`); a montagem do link e
  da mensagem está em `src/lib/whatsapp.ts`.
- **Edição de conteúdo estilo Instagram, só no aparelho** (sem autenticação,
  não grava no Supabase — decisão explícita para não expor escrita pública
  no banco antes do Módulo 2):
  - Novo componente `Kebab.tsx` — botão "..." com menu flutuante de cantos
    arredondados, igual ao padrão Instagram (usado no post em destaque, nos
    cards de evento e na bio da palestrante).
  - Novo componente `EditSheet.tsx` — bottom sheet genérico para
    formulários, com `EventEditSheet`, `SpeakerEditSheet` e `PostEditSheet`
    por cima dele.
  - Novo `src/lib/db/localContent.ts` — overlay de edições/criações em
    localStorage, aplicado sobre o resultado de `db.getEvents()` /
    `db.getSpeakers()` (funciona com os dois providers, local ou Supabase,
    já que a edição nunca sai do navegador).
  - Eventos e Palestrantes ganharam botão de criar novo item
    (`+ Novo evento` / célula `+ Nova`); o post em destaque da Início ganhou
    edição de legenda, texto do botão e evento vinculado.
- **Correção de bug pré-existente**: o toast (`Toast.tsx`) ficava com uma
  pequena pastilha residual visível perto do rodapé mesmo sem mensagem —
  o deslocamento para escondê-lo era proporcional ao tamanho da própria
  caixa, que encolhe a quase nada quando o texto está vazio. Corrigido
  adicionando `opacity: 0` (além do `transform`) no estado escondido.
- 6 ícones novos em `Icon.tsx`: `chevronLeft`, `close`, `users`, `whatsapp`,
  `edit`, `plus`.
- **Testado de ponta a ponta com Playwright** (headless, viewport 375px):
  fluxo completo do pop-up até os 3 links `wa.me` corretos, edição e criação
  de evento/palestrante com persistência após reload, sem erros de console.
- **Validado** com `tsc --noEmit` (strict) e `vite build`.

**Arquivos gerados/alterados:** `src/components/EventModal.tsx`,
`Kebab.tsx`, `EditSheet.tsx`, `EventEditSheet.tsx`, `SpeakerEditSheet.tsx`,
`PostEditSheet.tsx`, `src/lib/whatsapp.ts`, `src/lib/db/localContent.ts`,
`src/components/{EventCard,PostCard,Icon}.tsx`,
`src/screens/{Home,Eventos,Palestrantes}.tsx`, `src/data/seed.ts`,
`src/types/index.ts`, `src/styles/components.css`

---

## v0.5.0 — Supabase como banco de dados
**Sessão 5**

- **Decisão**: o banco do projeto passa a ser o **Supabase** (Postgres +
  RLS), substituindo o plano anterior de usar o banco do Bubble.
- **Camada de dados reestruturada** em `src/lib/db/`, com dois providers
  atrás da mesma interface `DataProvider`:
  - `supabaseProvider` — conteúdo vindo do Postgres;
  - `localProvider` — localStorage, usado quando não há credenciais.
  A escolha é **automática** pelas variáveis de ambiente, então o app
  continua rodando após um clone limpo, sem configurar nada.
- **Leitura de conteúdo virou assíncrona** em ambos os providers (mesmo no
  local), para que ligar ou desligar o Supabase não exija mexer em nenhum
  componente. Criado o hook `useAsyncData` e o componente `<Skeleton>` para
  os estados de carregamento.
- **Divisão explícita de responsabilidade**: conteúdo (eventos, palestrantes,
  planos) no Supabase; engajamento (curtir, salvar, RSVP, plano escolhido)
  segue no localStorage — sem autenticação não há usuária a quem atribuir
  esses registros.
- **`supabase/schema.sql`** criado, idempotente: tabelas `events`,
  `speakers` e `plans` com RLS de leitura pública apenas para linhas
  publicadas, triggers de `updated_at`, e — já prontas para o Módulo 2 — as
  tabelas `profiles`, `rsvps`, `post_engagements` e `plan_selections` com RLS
  restrita por `auth.uid()`, além do trigger que cria o perfil no cadastro.
- **`supabase/seed.sql`** criado, espelhando `src/data/seed.ts`, com upsert
  para poder rodar de novo sem duplicar.
- **Degradação graciosa**: falha de consulta, RLS bloqueando ou tabela vazia
  fazem o app cair no conteúdo local com aviso no console, em vez de tela
  branca.
- **Tipos do banco** em `src/types/database.ts`, com a conversão
  snake_case → camelCase isolada nos mapeadores do provider.
- **`docs/SUPABASE.md`** criado: configuração em 10 minutos, o que é seguro
  expor (anon sim, service_role nunca), explicação do RLS do projeto, edição
  de conteúdo no dia a dia e tabela de diagnóstico de falhas.
- Finalizados os itens pendentes da sessão anterior: CI no GitHub Actions
  (typecheck + build, de propósito sem credenciais), quatro comandos do
  Claude Code em `.claude/commands/`, e configurações do VS Code.
- **Validado** com `tsc --noEmit` (strict) e `vite build`.

**Arquivos gerados/alterados:** `src/lib/db/*`, `src/lib/supabase.ts`,
`src/types/database.ts`, `src/hooks/useAsyncData.ts`,
`src/components/Skeleton.tsx`, telas `Eventos`/`Palestrantes`/`Planos`,
`supabase/schema.sql`, `supabase/seed.sql`, `docs/SUPABASE.md`, `CLAUDE.md`,
`README.md`, `docs/ARQUITETURA.md`, `.env.example`, `.github/workflows/ci.yml`,
`.claude/commands/*`

---

## v0.4.0 — Migração do Bubble para código (GitHub + Vercel)
**Sessão 4**

- **Decisão**: sair do Bubble.io e do HTML único. O projeto passa a ser um
  repositório de código real, trabalhado no VS Code com o Claude Code,
  versionado no GitHub (`FabioMiranda04/triade`) e hospedado na Vercel.
- **Stack escolhida**: Vite + React 18 + TypeScript (strict) +
  react-router-dom + CSS puro com variáveis. Sem Tailwind, sem biblioteca de
  ícones — o visual pronto foi migrado, não reescrito.
- **Mesmas 5 telas, mesmas funcionalidades**: feed com curtir/duplo
  toque/salvar, Sobre com idealizadoras e trajetória, Eventos com filtro e
  RSVP, Palestrantes em grade com bio, Planos com seleção persistida e bloco
  de patrocínio.
- **CSS migrado com valores idênticos** ao protótipo, reorganizado em quatro
  arquivos: `tokens.css`, `base.css`, `layout.css`, `components.css`.
- **Navegação virou rotas reais** (`/`, `/sobre`, `/eventos`,
  `/palestrantes`, `/planos`) em vez de troca de painel por JavaScript —
  ganha deep link, botão voltar do Android e URL compartilhável.
- **Camada de dados tipada**: `TriadeData` virou `src/lib/storage.ts`, com
  tipos em `src/types/` e conteúdo em `src/data/seed.ts`. Mantido o namespace
  `triade_` no localStorage, então dados do protótipo continuam válidos.
- **Ícones** viraram um componente `<Icon name="..." />` com SVG inline.
- **Gesto de duplo toque** reimplementado com detecção por `pointerup`, mais
  confiável em mobile do que `ondblclick`.
- **Infra criada**: `CLAUDE.md` (regras do projeto para o Claude Code),
  `docs/ARQUITETURA.md`, `docs/DESIGN-SYSTEM.md`, `docs/DEPLOY.md`,
  `vercel.json` com rewrite de SPA, `.gitignore`, `.editorconfig`,
  `.prettierrc`, CI no GitHub Actions (typecheck + build), comandos do Claude
  Code em `.claude/commands/`, manifest de PWA.
- **HTML original preservado** em `legacy/` como referência visual.
- **Validado** com `tsc --noEmit` (strict) e `vite build` — sem erros.

**Arquivos gerados/alterados:** projeto inteiro (`src/`, `docs/`, `CLAUDE.md`,
`README.md`, `vercel.json`, `index.html`, configs)

---

## v0.3.0 — App shell single-file + navegação estilo Instagram
**Sessão 3**

- Reescrita completa da entrega em **um único arquivo HTML**
  (`TRIADE-APP-TESTE-BUBBLE.html`), pensado especificamente para colar num
  único elemento HTML do Bubble e testar como um app de verdade.
- As 5 telas (Início, Sobre, Eventos, Palestrantes, Planos) viraram
  **painéis trocados via JavaScript** (SPA simples), sem reload de página.
- **Barra de navegação inferior redesenhada**: de uma pílula flutuante para
  uma **barra fixa, borda a borda, ancorada exatamente no fundo da tela**
  (`position:fixed` dentro de um shell `100vh` com flexbox), igual ao padrão
  do Instagram no iPhone. Usa `env(safe-area-inset-bottom)` para respeitar a
  área de gestos.
- Estrutura de "app shell": header fixo no topo (logo + busca + sino), área
  de conteúdo com scroll independente, tab bar fixa embaixo — em vez de uma
  página comum que rola inteira.
- Conteúdo da Home reformulado em **formato de feed/post** (estilo rede
  social): avatar, nome, imagem, ações de curtir/comentar/compartilhar/
  salvar, com **like por duplo toque na imagem** (gesto clássico do
  Instagram) e contagem de curtidas dinâmica.
- Curtidas e itens salvos agora persistem no `localStorage` e voltam a
  aparecer corretamente ao recarregar a página.
- Testado com automação (Playwright) em 4 tamanhos de tela (iPhone SE,
  iPhone Pro, Android médio, tablet): sem erros de JavaScript, barra sempre
  ancorada na borda inferior, troca de painéis confirmada
  programaticamente.

**Arquivos gerados/alterados:** `TRIADE-APP-TESTE-BUBBLE.html`

---

## v0.2.0 — Redesign "Liquid Glass"
**Sessão 2**

- Design visual anterior (editorial/clássico) **substituído por completo**
  a pedido do cliente, buscando um visual moderno, inspirado em redes
  sociais (Instagram) e no design "Liquid Glass" da Apple (iOS 26).
- Pesquisa na web sobre os princípios do Liquid Glass (Apple) e sobre
  técnicas atuais de glassmorphism/mesh gradient em CSS antes de
  implementar.
- Novo sistema de design implementado:
  - Painéis de vidro translúcido (`backdrop-filter: blur + saturate`) com
    brilho superior simulando reflexo de luz.
  - Fundo com manchas de cor desfocadas e fixas (mesh gradient) nas cores
    da marca, com flutuação lenta via CSS.
  - Barra superior de vidro + tab bar inferior fixa (primeira versão, em
    formato de pílula flutuante — depois evoluída na v0.3).
  - Fileira de "stories" no topo da Página Inicial.
  - Tipografia trocada para `Fraunces` + `Instrument Serif` (itálico) +
    `Inter`.
  - Paleta ajustada para tom areia + vinho + dourado/blush.
  - Marca de setas triplas do logo mantida como elemento de assinatura,
    agora em formato de badge de vidro circular.
- As 5 páginas HTML foram **completamente regeradas** com o novo visual
  (mesma estrutura de conteúdo do v0.1.0, camada visual nova).
- Prévia em PDF navegável **recriada usando Chromium real via Playwright**
  (em vez do conversor antigo, que não suportava `backdrop-filter` e não
  mostrava o efeito de vidro corretamente).
- `CONTEXTO-PROJETO.md` atualizado com uma seção descrevendo o redesign.

**Arquivos gerados/alterados:** `01-pagina-inicial.html` … `05-planos.html`,
`Triade-Conecta-Modulo1-Preview.pdf`, `CONTEXTO-PROJETO.md`

---

## v0.1.0 — Módulo 1: Landing Page (primeira versão)
**Sessão 1**

- Recebido o material de marca da Tríade Conecta (PDF de patrocínio) com:
  posicionamento ("mulheres • negócios • conexões"), as 3 idealizadoras
  (Lívia Duarte, Lia Chaves, Cris Miranda), histórico das 2 primeiras
  edições, palestrantes convidadas, formato do evento, público-alvo e
  cotas de patrocínio (R$ 1.500/edição). Também recebido um protótipo HTML
  anterior (feito no Bubble) como referência de estrutura de app.
- Definido o escopo do **Módulo 1 — Landing Page**, com 5 telas: Página
  inicial, Sobre a Tríade, Eventos, Palestrantes, Planos de assinatura.
- Decisão de arquitetura de dados em 3 fases: **localStorage (agora) → 
  Bubble Database (produção) → Supabase (se/quando necessário)**, abstraída
  atrás de um único objeto `TriadeData` no JS para que a migração troque só
  a implementação, não o HTML/CSS.
- Primeira versão visual: editorial/clássica (`Playfair Display` +
  `Playball` + `Inter`, paleta marfim/vinho/dourado), 5 arquivos HTML
  separados e navegáveis por link relativo, cada um autocontido
  (CSS+JS inline) para colar em elementos HTML do Bubble.
- Criados os primeiros documentos de apoio: `PLANO-DE-ACAO.md` (roadmap,
  como inserir no Bubble, próximos módulos sugeridos) e
  `CONTEXTO-PROJETO.md` (contexto de marca e decisões técnicas).
- A pedido do cliente, as 5 páginas foram reunidas numa **prévia única em
  PDF navegável** (capa + marcadores/bookmarks por seção), gerada
  inicialmente com `wkhtmltopdf` (depois substituído na v0.2.0 por não
  suportar o efeito de vidro).

**Arquivos gerados:** `01-pagina-inicial.html` … `05-planos.html`,
`PLANO-DE-ACAO.md`, `CONTEXTO-PROJETO.md`,
`Triade-Conecta-Modulo1-Preview.pdf`

---

## Como adicionar uma nova entrada

No início da próxima sessão de desenvolvimento, copie o modelo abaixo para
o **topo** deste arquivo (mantendo as entradas antigas abaixo) e preencha
ao final da sessão:

```md
## vX.Y.0 — <título curto da sessão>
**Sessão N**

- O que foi pedido / decidido.
- O que foi implementado (bullets objetivos).
- O que foi testado/validado.

**Arquivos gerados/alterados:** `arquivo1.html`, `arquivo2.md`
```

Depois, atualize o `ESTADO-DO-PROJETO.md` conforme o protocolo descrito na
seção 9 daquele arquivo.
