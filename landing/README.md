# `landing/` — página de captação (rascunho)

Página de captação que vai ser o destino do **QR code do outdoor**. Fica
aqui, e não em `src/`, de propósito: **não faz parte do app** e não entra
no build. É um `.html` autocontido — abrir o arquivo no navegador já mostra
a página inteira, sem servidor, sem `npm install`.

**Status: alinhado ao Manual de Marca (31/08/2026).** Apresentado às sócias
em 27/08/2026 e bem recebido; depois disso o manual da marca chegou e a
página foi refeita nas cores e nas fontes oficiais, e o conteúdo mock deu
lugar aos dados reais. A lista do que ainda falta está no fim deste
arquivo.

## Link de revisão

Publicado como artifact para as sócias abrirem no celular:

<https://claude.ai/code/artifact/f7735e3e-c67e-44f4-86e4-40a7e86bfb54>

**Ao atualizar a página numa sessão futura, republique NESSE endereço** (o
mecanismo de artifact aceita a URL como destino). Publicar sem informar a
URL cria um artifact novo, e aí passam a existir duas versões circulando
entre as sócias — que é exatamente o problema que este arquivo existe para
evitar.

Duas coisas que já pegaram e vão pegar de novo:

1. **O link compartilhado fica preso numa versão.** Republicar não move
   sozinho o que as sócias enxergam — quem tem o link continua vendo a
   versão fixada até alguém mover o "share pin" no menu de compartilhar da
   página. Publicou e elas dizem que está igual? É isso.
2. **A CSP do artifact bloqueia imagem externa.** As fotos do Supabase
   simplesmente não aparecem lá. A versão publicada é gerada a partir deste
   arquivo com as fotos embutidas em `data:` URI (redimensionadas para
   ~900px e ~500px, JPEG 78 — o arquivo fica em torno de 650 KB). **Este
   arquivo aqui continua apontando para as URLs do Supabase**, que é o certo
   quando ele virar `public/convite.html` na Vercel. Não troque um pelo
   outro.

## As decisões que já estão tomadas

Não são preferências soltas; cada uma responde ao fato de que o visitante
chega por **QR code de outdoor**, em pé na rua, com 15 a 30 segundos e
nenhum contexto sobre a marca.

- **Uma única ação na página inteira: WhatsApp.** Aparece três vezes (cartão
  do encontro, fecho, e uma barra fixa que só entra depois que a primeira
  sai de vista). Nada de formulário: e-mail parece trabalho, WhatsApp é um
  toque — e o app já tem esse fluxo com as três sócias.
- **A página NÃO vende assinatura.** Ninguém assina uma comunidade que nunca
  experimentou. O funil real é outdoor → encontro → ela vai e gosta → aí
  assina. A comunidade aparece uma vez, no fim, em caixa discreta. Promover
  a assinatura aqui rouba atenção da única conversão que essa página
  consegue entregar.
- **A primeira tela se basta**: marca, o que é, data do próximo encontro e o
  botão — sem rolar. Quem desistiu de rolar já teve o essencial.
- **Contar o que acontece num encontro existe por um motivo**: o medo de
  quem nunca foi não é o preço, é "vou chegar e não vou saber o que fazer".
  A primeira versão fazia isso com um roteiro hora a hora (14h/15h/17h/
  18h30) que **eu inventei** — não batia com o formato real. Virou "O que
  acontece numa edição", que descreve o que de fato acontece, sem fingir
  precisão que ninguém confirmou.
- **Visual comprometido com um mundo só** — igual para todo mundo, porque
  página de marca não segue o tema do aparelho. Esse mundo é a versão
  **"clara / uso reverso"** que o manual aprova na seção 06: assinatura
  creme e dourada sobre fundo escuro, o mesmo tema padrão do app. Vale
  saber que a versão **principal** do manual é o contrário (dourado sobre
  claro); virar a página para esse lado é trocar `--preto` por `--creme` e
  `--creme` por `--walnut` nos tokens do topo do arquivo, e mais nada.
- **Cores e fontes são as oficiais**, não aproximações: Dourado `#C9A66B`,
  Cream Quartz, Sand, Burgundy, Walnut, Olive; Cormorant SC no "TRÍADE",
  Playfair Display nos títulos, Inter nos textos informativos. Se for mexer
  em qualquer uma delas, leia antes `docs/MANUAL-DE-MARCA.md`.
- **A estrutura é a própria tríade**: as três setas da marca separam as
  seções, os números são três, as idealizadoras são três. É o que faz a
  página parecer dela e não um template.

## Ajustes pendentes

Levantados com as sócias em 27/08/2026. **Riscados = resolvidos em
31/08/2026**, na rodada do manual de marca.

- [x] ~~**Padding e formatação**~~ — revisto junto com a troca de fontes.
      A página foi medida em 375px: zero rolagem lateral.
- [x] ~~**Imagens**~~ — as três fotos são reais, do bucket `media` do
      Supabase Storage (edição com Carla Martins, com Geórgia Maia, e a
      11ª). São capturas de Stories 9:16 com legenda queimada no rodapé;
      por isso o recorte é `object-position: 50% 28%`, que corta a legenda
      e mantém os rostos.
- [x] ~~**Verossimilhança das informações**~~ — os números do mock saíram:
      próximo encontro é o **Jantar da Tríade para Casais, 30/09/2026**,
      "11+ edições", e o roteiro inventado das 5h virou "O que acontece
      numa edição". O "85 vagas" do fecho e o "19 de setembro" da barra
      fixa também eram restos do mock e foram corrigidos.
- [x] ~~**Descrição da Cris Miranda**~~ — "Estilo · Contadora e consultora
      de estilo".
- [x] **Faltava `<meta viewport>`** (não estava na lista, apareceu na
      medição): sem ela o celular monta a página num viewport de 980px e
      mostra tudo reduzido. Dentro do artifact o invólucro injetava a dele
      e escondia o problema; publicada em `/convite.html` seria visível.

Ainda em aberto:

- [ ] **Depoimento.** O fictício saiu e no lugar entrou a frase da própria
      marca. Um depoimento real, com nome e negócio, é melhor — mas só
      entra quando existir de verdade.
- [x] **Assinatura da marca** — resolvida em 31/08/2026. "TRÍADE" em
      Cormorant SC e "conecta" com o traço original da logomarca, recortado
      do manual e embutido como máscara (a cor sai do CSS, então ele
      acompanha a paleta). Não precisou comprar a licença da Slight. Ver
      `docs/MANUAL-DE-MARCA.md`, seção 4.
- [ ] **Texto da headline** — proposta minha; vale as sócias lerem em voz
      alta e verem se soa como elas.
- [ ] **Links do WhatsApp e do Instagram** estão em `href="#"`.
- [ ] **O QR vai cair num jantar de casais.** O próximo encontro real é o
      Jantar da Tríade para Casais, e a página inteira promete um encontro
      de cinco horas entre empreendedoras. Para quem escaneia o outdoor sem
      conhecer a marca, é uma primeira impressão contraditória. Decisão das
      sócias: apontar o QR para a próxima edição regular, ou assumir o
      jantar e ajustar a promessa da página.

## Quando for para valer

O artifact serve para revisão, não como destino do QR code. Para virar
página de verdade faltam duas coisas:

1. **Publicar num endereço da Tríade.** O caminho mais curto é mover o
   arquivo para `public/convite.html`, que a Vercel serve automaticamente
   em `/convite.html`. **Verificar antes** se o rewrite de SPA do
   `vercel.json` (`/(.*)` → `/index.html`) não engole essa rota — arquivo
   estático costuma ter precedência sobre rewrite, mas isso precisa ser
   testado, não presumido.
2. **Parâmetro de origem no QR** (`/convite?origem=outdoor` ou endereço
   próprio). Sem isso, gasta-se em mídia e não se sabe se funcionou.
