# Deploy — Vercel

## Primeira publicação (pelo site, recomendado)

1. Entre em [vercel.com](https://vercel.com) com a conta do GitHub.
2. **Add New → Project** → importe `FabioMiranda04/triade`.
3. A Vercel detecta Vite sozinha. Confira que ficou:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Em **Environment Variables**, adicione as duas chaves do Supabase:

   | Nome | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://SEU-PROJETO.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | a chave `anon public` |

   Marque **Production**, **Preview** e **Development**. Sem elas o deploy
   funciona igual, mas com dados locais em vez do banco.

5. **Deploy**. Em ~1 minuto sai a URL `triade-*.vercel.app`.

> Variável de ambiente entra no bundle **em tempo de build**. Se você
> adicionar ou mudar uma depois, é preciso **redeploy** — não basta salvar.

## Deploys seguintes

Automático: todo push na `main` publica em produção; todo pull request ganha
uma URL de preview própria (ótimo para mandar para as idealizadoras verem
antes de virar oficial).

## Pela CLI (opcional)

```bash
npm i -g vercel
vercel login
vercel          # preview
vercel --prod   # produção
```

## Por que o `vercel.json` importa

O app usa rotas reais (`/eventos`, `/planos`). Sem o rewrite abaixo, abrir
essas URLs direto ou recarregar a página dá **404**, porque não existe um
arquivo `eventos.html` no servidor:

```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

O arquivo também põe cache longo nos assets com hash em `/assets/*`.

## Domínio próprio

Ainda não comprado (pedido em 23/08/2026) — passo a passo completo abaixo:
onde registrar, quanto custa, e o que mais precisa mudar depois (Vercel,
Supabase, Google).

### 1. Onde registrar

| Opção | Onde | Custo aproximado | Quando faz sentido |
|---|---|---|---|
| `.com.br` (ex: `triadeconecta.com.br`) | **[registro.br](https://registro.br)** — registro oficial brasileiro (NIC.br) | ~R$ 40/ano | **Recomendado** — Tríade é uma comunidade de Goiânia, `.com.br` passa mais credibilidade pro público local e é o mais barato. Não use revendedor terceirizado pra esse domínio: o Registro.br já é o registrador oficial, sem intermediário cobrando a mais. |
| `.com` (ex: `triadeconecta.com`) | **[Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)** (preço de custo, sem markup) ou **[Namecheap](https://www.namecheap.com)** | ~US$ 9–15/ano | Se quiser um nome mais curto/internacional. Evite GoDaddy — preço de renovação alto e upsell agressivo no checkout. |

Antes de registrar, confira se o nome escolhido está livre nos dois formatos
(`.com.br` e `.com`) — vale garantir os dois mesmo usando só um como
principal, pra ninguém registrar o outro depois.

### 2. Passo a passo

1. **Registrar o domínio** (Registro.br ou o registrador escolhido) — cria
   conta, verifica disponibilidade, paga (Registro.br aceita Pix, boleto e
   cartão).
2. **Vercel** → o projeto → **Settings → Domains** → **Add** → cole o
   domínio.
3. A Vercel mostra os registros DNS a criar (normalmente um registro `A`
   apontando pro IP dela, ou `CNAME` se for um subdomínio tipo `www`). Cadastre
   esses registros no painel de DNS de onde o domínio foi registrado (no
   Registro.br isso fica em "DNS" dentro do painel do domínio).
4. Aguarde a propagação (geralmente minutos, pode levar até 24–48h). A
   Vercel confirma sozinha quando detectar o DNS certo e emite o certificado
   HTTPS automaticamente (Let's Encrypt) — nenhuma ação manual extra aqui.
5. **Supabase** → **Authentication → URL Configuration** → atualize **Site
   URL** para o domínio novo e adicione-o em **Redirect URLs**
   (`https://SEUDOMINIO.com.br/**`) — pode manter a URL antiga da Vercel
   (`triade-sand.vercel.app`) na lista também, não precisa remover.
6. **Google Cloud Console** → OAuth consent screen → **Authorized domains**
   → adicione o domínio novo.
7. `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` **não mudam** — o domínio do
   site não afeta a configuração do Supabase (isso já valia antes deste
   guia, mantido aqui por importância).

### 3. Sobre a tela do Google mostrar "zirrdajydxbydnyaebza.supabase.co"

Investigado em 23/08/2026 (ver `docs/CHANGELOG.md`): a tela "Escolha uma
conta" do Google mostra o domínio do **Supabase** (`*.supabase.co`), não o
nome do app, porque o `redirect_uri` que o Google efetivamente chama de
volta é esse — o domínio do site (Vercel ou próprio) nunca aparece nessa
etapa, é o Supabase que devolve pro app depois. Ter um domínio próprio
sozinho (passos 1–7 acima) **não resolve isso por completo** — ajuda a
legitimar o app no Google (Authorized domains, app já com identidade
própria), mas pra trocar de fato o texto por "Comunidade Tríade" o
`redirect_uri` precisaria estar no **seu** domínio, o que exige o recurso
**Custom Domain do Supabase Auth** (plano Pro do Supabase pra cima, custo
recorrente mensal — bem diferente do custo único do domínio) apontando
algo como `auth.SEUDOMINIO.com.br` pro Supabase. Fica registrado aqui como
opção futura, não incluído neste guia por ser um gasto recorrente adicional
que precisa de decisão separada.

## Instalar no celular (PWA)

Já existe `public/manifest.webmanifest`, então dá para adicionar à tela de
início e abrir em tela cheia, sem a barra do navegador:

- **iPhone (Safari)**: Compartilhar → Adicionar à Tela de Início
- **Android (Chrome)**: menu ⋮ → Adicionar à tela inicial

Não há service worker — sem internet, o app não abre.

## Checklist antes de publicar

- [ ] `npm run build` passa localmente
- [ ] Testado em 375px de largura (DevTools, iPhone SE)
- [ ] Tab bar ancorada na borda inferior, sem invadir a área de gestos
- [ ] Curtir, salvar, RSVP e escolher plano persistem após recarregar
- [ ] Console sem avisos `[supabase]` (se houver, o app está caindo no seed
      local — veja `SUPABASE.md`)
- [ ] Variáveis do Supabase configuradas na Vercel, com redeploy feito
- [ ] `docs/CHANGELOG.md` e `docs/ESTADO-DO-PROJETO.md` atualizados
