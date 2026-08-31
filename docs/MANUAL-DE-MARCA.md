# Manual de Marca — Tríade Conecta

> Transcrição do **Manual de Marca Tríade Conecta**, entregue pelas sócias em
> 31/08/2026 (PDF de 10 páginas, páginas em sequência). Este arquivo existe
> para que o conteúdo do manual esteja **no repositório**, legível em texto e
> versionado — o PDF é um monte de JPEG de 300 dpi, não dá para pesquisar
> nem para conferir num code review.
>
> **Esta é a fonte de verdade da camada 1 do `tokens.css`.** Se um valor de
> marca no código divergir daqui, o código está errado. Se o manual mudar,
> muda aqui primeiro e o código depois.
>
> Onde este arquivo diz "**decisão nossa**", é uma escolha de implementação
> que o manual não cobre — está marcada assim de propósito, para ninguém
> confundir com determinação da marca.

## 1. Essência

> A Tríade Conecta existe para unir mulheres, impulsionar negócios e
> fortalecer conexões que transformam.
>
> Somos um espaço de pertencimento, crescimento e colaboração, onde relações
> verdadeiras geram impacto real e duradouro.

Valores listados: conexão · pertencimento · transformação · elegância ·
acolhimento · movimento · colaboração · força feminina.

Assinaturas de rodapé que o manual alterna: `MULHERES · NEGÓCIOS ·
CONEXÕES`, `PROPÓSITO · ELEGÂNCIA · IMPACTO`, `CONECTAR · INSPIRAR ·
TRANSFORMAR`.

## 2. Logomarca

O símbolo é a **seta tripla**: um triângulo cheio seguido de dois
contornos. A logomarca principal empilha `TRÍADE` (Cormorant SC, caixa
alta) sobre `conecta` (Slight, minúsculo), com o símbolo ao lado ou abaixo.

**Versões aprovadas:** principal (ouro sobre claro) · escura (preto sobre
claro) · vinho · oliva · walnut · clara (creme sobre fundo escuro, "uso
reverso").

**Usos incorretos, listados explicitamente:** não distorcer · não alterar
cores · não aplicar efeitos · não rotacionar · **não trocar tipografia**.

Área de proteção: a medida "x", igual à altura do acento agudo do "í".
Tamanho mínimo: 30 mm de largura.

O manual fecha a seção 06 com: *"As cores apresentadas são referências da
identidade visual. Utilizar sempre os arquivos oficiais da marca."*

## 3. Cores

### Principais

> O dourado é a assinatura principal da marca. Os neutros claros sustentam
> leveza e sofisticação.

| Nome | Hex | Token |
|---|---|---|
| Dourado | `#C9A66B` | `--brand-gold` |
| Cream Quartz | `#F6F3EE` | `--brand-cream` |
| Almond | `#EADED0` | `--brand-almond` |
| Sand | `#D9B991` | `--brand-sand` |

### De apoio

> Maroon e oliva entram como acentos de profundidade e personalidade.

| Nome | Hex | Token |
|---|---|---|
| Walnut | `#402814` | `--brand-walnut` |
| Deep Maroon | `#400106` | `--brand-maroon` |
| Burgundy | `#65202D` | `--brand-burgundy` |
| Olive Green | `#4A5A3A` | `--brand-olive` |
| Moss | `#8C916C` | `--brand-moss` |

### Dois valores derivados (decisão nossa, não do manual)

| Token | Hex | Por quê |
|---|---|---|
| `--brand-gold-deep` | `#8A6B32` | O dourado oficial sobre o Cream Quartz dá **1,9:1** — abaixo do mínimo de 4,5:1 da WCAG para texto. Este tom dá 4,5:1 e cobre o que precisa ser lido em fundo claro. Sobre o fundo escuro o problema não existe: o dourado oficial dá 9,3:1. |
| `--brand-reverse` | `#372E25` | Medido no pixel da página 06, onde a versão clara da logo aparece sobre fundo escuro. É a superfície elevada do tema Ônix. |

## 4. Tipografia

| Fonte | Papel, nas palavras do manual |
|---|---|
| **Cormorant SC** | "Tipografia principal do logotipo TRÍADE. Transmite sofisticação, estabilidade e autoridade. Usada com letras maiúsculas e amplo espaçamento." |
| **Slight** | "Tipografia do logotipo conecta. Traz leveza, movimento e proximidade. Deve ser usada apenas em aplicações que reforcem a assinatura da marca." |
| **Playfair Display** | "Tipografia de apoio para títulos, destaques, frases de impacto e citações. Elegante, expressiva e ideal para transmitir emoção e importância." |
| **Inter** | "Tipografia de apoio para textos informativos, conteúdos institucionais, datas, horários, locais e materiais do dia a dia. Garante clareza, leiturabilidade e funcionalidade." |

A seção 09 ("Prompts de produção") repete como **regra fixa**: *"usar sempre
Playfair Display · manter a paleta oficial · preservar a logo original ·
evitar excesso de elementos · priorizar elegância, respiro e consistência
visual."*

### Divergência registrada

Ao entregar o manual, o cliente descreveu as fontes como: *"Textos gerais:
Playfair Display, explorando variações Regular, Bold e Italic; Nome Tríade:
Cormorant SC; Nome conecta: Slight em minúsculo; Textos gerais, segunda
variação: **Mont**."*

A página 04 do manual não cita a Mont — nesse papel ela mostra a **Inter**.
Perguntado, o cliente confirmou **Inter**. A Mont (Fontfabric) é comercial e
não está no Google Fonts; se um dia entrar, exige os arquivos licenciados.

### O caso da Slight — resolvido sem comprar fonte

A Slight é da **Up Up Creative**, vendida no Creative Market em licenças
separadas por uso: Desktop ~US$32, **Webfont ~US$27**, E-pub, App. Os sites
que a distribuem "de graça" liberam **apenas uso pessoal**, o que não cobre
a Tríade. E "uso pessoal" não existe para webfont em site público: o
arquivo é entregue a cada visitante, o que é redistribuição por definição.

Mas a licença Desktop — a que foi usada para desenhar a logo — cobre
*"logo design"* e *"creation of images for websites"*. Ou seja: **a logo
como desenho já está licenciada.** Somado a "não trocar tipografia" estar
na lista de usos incorretos, a saída não era comprar fonte nem achar uma
parecida: era tratar a assinatura como o que ela é, **desenho**.

**Como está no código:** o `conecta` é o traço original, recortado da
própria logomarca do manual (página 06, "1. Logo principal", a 400 dpi) e
guardado como **máscara alfa** em `public/marca/conecta.png` (300×57,
10 KB). O CSS aplica `mask-image` com `background-color: currentColor` —
por isso ele muda de cor junto com o tema, dourado no Ônix e burgundy no
Pérola, sem existirem duas imagens. Na `landing/convite.html` a mesma
máscara vai embutida em `data:` URI, porque aquele arquivo precisa
funcionar sozinho.

O texto "conecta" continua no DOM. O bloco é um `@supports (mask-image)`;
onde `mask` não existe, sobra o texto em Playfair itálico, que é fonte que
o manual autoriza para texto.

O `TRÍADE` sai em Cormorant SC, que é a fonte real e está no Google Fonts.
Então a assinatura inteira está correta hoje, sem pendência de licença.

**O que ainda ajudaria:** os arquivos vetoriais oficiais. A máscara é
raster, tirada de um JPEG de 300 dpi — ótima nos tamanhos em que a
assinatura aparece (66×12 px no cabeçalho), mas um SVG seria melhor para
um uso grande, tipo material impresso ou uma tela de abertura.

### Erro encontrado no manual

A página 03, no item **"1. LOGOMARCA PRINCIPAL"** — justamente a versão que
um designer copiaria —, traz a palavra escrita **"coneecta"**, com dois
"e". As versões da página 06 estão corretas ("conecta"), e foi de lá que a
máscara do código foi tirada. Vale as sócias corrigirem o arquivo com quem
produziu o manual, senão o erro se propaga para tudo que for feito a partir
dessa página.

## 5. Imagens

O manual não fecha um banco de imagens; fecha um **critério de busca**:

> Ao buscar referências, utilize sempre o termo: *aesthetic + o que deseja
> ter de assunto.* Ex.: aesthetic moda, aesthetic natureza, aesthetic luxo,
> aesthetic negócios.

O moodboard é consistente: cisne, lírio branco, tecido esvoaçando em oliva e
vinho, madeira escura, pérola, dourado, retratos em movimento com fundo
desfocado. Nada saturado, nada azul.

## 6. Onde isto aparece no código

| Manual | Arquivo |
|---|---|
| Paleta (seção 3) | `src/styles/tokens.css`, camada 1 (`--brand-*`) |
| Tipografia (seção 4) | `src/styles/tokens.css` (`--font-brand`, `--font-display`, `--font-ui`) + `<link>` do Google Fonts em `index.html` |
| Símbolo da seta tripla | `src/components/Brand.tsx` (`Mark`) e o SVG inline da `landing/convite.html` |
| Assinatura no cabeçalho | `.brand-lockup` / `.brand .name` / `.brand .tag` em `src/styles/layout.css` |
| O traço do "conecta" | `public/marca/conecta.png` (máscara alfa) e o mesmo arquivo em `data:` URI dentro de `landing/convite.html` |
| Como as cores viram papéis de interface | `docs/DESIGN-SYSTEM.md`, seções 1.1 a 1.3 |

## 7. O que ainda falta da marca

- [ ] **Arquivos vetoriais oficiais da logo** (SVG). Não bloqueiam nada: a
      assinatura já está correta, com o `TRÍADE` em Cormorant SC e o
      `conecta` como máscara recortada do manual. Um SVG só seria melhor
      para uso em tamanho grande.
- [ ] **Corrigir o "coneecta" da página 03 do manual** com quem o produziu.
- [ ] Decidir se o **tema claro** volta a ser o padrão. O manual é uma marca
      clara — a versão principal da logo é dourado sobre claro — mas o app
      abre no Ônix por decisão do cliente (31/08/2026), amparada pela versão
      "clara / uso reverso" que o próprio manual aprova. Não é violação;
      é escolha, e está registrada aqui para não se perder.
- [ ] O **ornamento flor-de-lis** que o manual usa como divisor de seção não
      existe no app (lá o divisor é a seta tripla).
