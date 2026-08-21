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

Project → **Settings → Domains** → adicione o domínio e siga os registros DNS
que a Vercel indicar. O certificado HTTPS é emitido automaticamente.

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
