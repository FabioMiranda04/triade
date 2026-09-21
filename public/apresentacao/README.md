# `apresentacao/` — página de apresentação da marca

Importada em 21/09/2026 do site que a Lívia montou no ChatGPT
(`triade-conecta-apresentacao.liviaduartelopes.chatgpt.site`), para sair
de um domínio de terceiro e passar a viver num endereço nosso.

Serve em **`/apresentacao`**. Fica em `public/` porque precisa ser
servida: a Vercel copia `public/` inteiro para `dist/` sem passar pelo
Vite. Não é exceção à regra do `html/README.md` — é o destino final que
aquele arquivo chama de "quando for para valer".

## O que mudou na importação

- **Saiu o `<script>` de challenge da Cloudflare** injetado pelo host.
  Não era da página, era do serviço que a hospedava;
- **Imagens reduzidas de 3,7 MB para 936 KB.** Vinham em 2240×3360 —
  resolução de câmera, não de web. Redimensionadas para 1400px no lado
  maior, JPEG 80 progressivo; a logo, de 1254px para 400px;
- **`loading="lazy"`** em tudo que nasce abaixo da primeira tela, e
  `fetchpriority="high"` na foto do topo.

O conteúdo — texto, estrutura, CSS — é o original, sem uma palavra
alterada. A página é autocontida: abrir o `index.html` no navegador
mostra ela inteira. Nenhuma dependência externa, nenhuma fonte de CDN,
nenhum rastreador. O único link para fora é o Instagram.

## Pendências

- [ ] **Não segue o Manual de Marca (R16).** O dourado aqui é `#b79a63`,
      o oficial é `#C9A66B`; as fontes são as de sistema (Arial e
      Georgia), não Cormorant SC / Playfair Display / Inter. Foi assim
      que a ferramenta gerou. Alinhar ao manual é a próxima rodada —
      importar primeiro, redesenhar depois, para que dê para comparar as
      duas versões lado a lado;
- [ ] **Botão do WhatsApp em `href="#"`** — falta o número comercial. A
      própria página avisa isso em `<small>` na seção de contato;
- [ ] **Decidir a relação com `/convite`.** São duas páginas com públicos
      diferentes: esta apresenta a marca (inclusive para patrocinadores),
      a outra capta quem escaneia o outdoor. O QR do outdoor continua
      apontando para `/convite`.
