# `html/` — todo HTML do repositório que **não** é o app

> Se você está procurando um arquivo `.html`, ele está aqui ou é o
> `index.html` da raiz. São só essas duas possibilidades, de propósito.

## Inventário completo

| Arquivo | O que é | Entra no build? |
|---|---|---|
| **`../index.html`** (raiz) | o casco do app: `<div id="root">`, meta tags do PWA, telas de abertura do iOS e a tela de carregamento inline | **sim** — é a entrada do Vite |
| `landing/convite.html` | página de captação do QR code do outdoor. `.html` autocontido, abre direto no navegador | não |
| `legacy/TRIADE-APP-TESTE-BUBBLE.html` | o app original, HTML único, de quando ele vivia dentro do Bubble.io. Referência visual — **não edite** | não |

## Por que o `index.html` não veio junto

Ele é a **entrada do Vite**, e o Vite resolve o entry a partir do `root` do
projeto. Movê-lo para cá exigiria mudar `root` no `vite.config.ts`, o que
arrasta junto o caminho do `public/`, a saída do `dist/` e a configuração da
Vercel — três coisas que hoje funcionam, para ganhar uma pasta mais
arrumada. Não compensa.

Então a regra fica: **`index.html` é do app e mora na raiz; todo o resto do
HTML mora aqui.** Dois lugares, e este arquivo lista os dois.

## Sub-pastas

- **`landing/`** — tem `README.md` próprio com o status da página, o que
  ainda falta e como publicá-la em `/convite.html` na Vercel;
- **`legacy/`** — congelado. Serve para conferir como algo era antes da
  migração para React, e nada mais.
