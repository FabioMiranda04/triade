# `landing/` — página de captação (rascunho)

Página de captação que vai ser o destino do **QR code do outdoor**. Fica
aqui, e não em `src/`, de propósito: **não faz parte do app** e não entra
no build. É um `.html` autocontido — abrir o arquivo no navegador já mostra
a página inteira, sem servidor, sem `npm install`.

**Status: rascunho aprovado em conceito, pendente de ajustes.** Apresentado
às sócias em 27/08/2026 e bem recebido; a lista do que falta está no fim
deste arquivo.

## Link de revisão

Publicado como artifact para as sócias abrirem no celular:

<https://claude.ai/code/artifact/f7735e3e-c67e-44f4-86e4-40a7e86bfb54>

**Ao atualizar a página numa sessão futura, republique NESSE endereço** (o
mecanismo de artifact aceita a URL como destino). Publicar sem informar a
URL cria um artifact novo, e aí passam a existir duas versões circulando
entre as sócias — que é exatamente o problema que este arquivo existe para
evitar.

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
- **O roteiro das 5h existe por um motivo**: o medo de quem nunca foi não é
  o preço, é "vou chegar e não vou saber o que fazer". Mostrar hora a hora
  resolve isso melhor que texto de venda.
- **Visual comprometido com o Ônix** (preto quente + dourado), o mesmo tema
  padrão do app, igual para todo mundo — página de marca não segue o tema
  do aparelho.
- **A estrutura é a própria tríade**: as três setas da marca separam as
  seções, os números são três, as idealizadoras são três. É o que faz a
  página parecer dela e não um template.

## Ajustes pendentes

Levantados com as sócias em 27/08/2026:

- [ ] **Padding e formatação** — revisão de espaçamentos em geral.
- [ ] **Imagens** — as quatro fotos ainda são espaços reservados, mas
      **o material já existe**: o Módulo 11 fechou em 26/08/2026 e há 11
      fotos reais no bucket `media` do Supabase Storage, em
      `media/<slug-da-edição>/foto-N.jpg`. É só apontar as URLs.
- [ ] **Verossimilhança das informações — os números do rascunho estão
      DESATUALIZADOS.** O rascunho foi escrito antes do Módulo 11 fechar e
      usa o conteúdo mock que existia então. Os dados reais já estão em
      `src/data/seed.ts` desde 26/08/2026:

      | No rascunho (errado) | Real |
      |---|---|
      | Próximo encontro: 19 de setembro | **Jantar da Tríade para Casais, 30/09/2026** |
      | "3 edições realizadas" | **11+ edições** |
      | "85+ mulheres na mesa" | número real a confirmar |
      | Convidada: — | Geórgia Maia, Carla Martins e outras já passaram |

      O roteiro das 5h (14h/15h/17h/18h30) também é suposição minha e
      precisa bater com o formato real dos encontros.
- [ ] **Depoimento é fictício.** Precisa ser real, com nome e negócio, ou
      sair da página.
- [ ] **Descrição da Cris Miranda** está marcada como pendente no HTML.
- [ ] **Texto da headline** — proposta minha; vale as sócias lerem em voz
      alta e verem se soa como elas.
- [ ] **Links do WhatsApp e do Instagram** estão em `href="#"`.

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
