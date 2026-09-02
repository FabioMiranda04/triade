/*
 * Service worker do Tríade Conecta — escrito à mão, sem plugin.
 *
 * O que ele resolve: em visita repetida o app abre do disco, sem esperar a
 * rede. É isso que separa a sensação de "app instalado" da de "site que
 * carrega". E, sem rede, o app ainda abre.
 *
 * Duas estratégias, e a diferença entre elas importa:
 *
 * - **Navegação (o HTML): rede primeiro.** O `index.html` aponta para o
 *   bundle com hash no nome; se ele viesse do cache, um deploy novo só
 *   apareceria quando o cache expirasse. Rede primeiro garante que a
 *   Vercel manda a versão nova assim que existe, e o cache só entra como
 *   rede de segurança quando não há conexão.
 * - **Assets: cache primeiro.** `index-a1b2c3.js` é imutável por
 *   construção — mudou o conteúdo, mudou o nome. Não há o que revalidar.
 *
 * Nada de outra origem passa por aqui: o Supabase (conteúdo e fotos) fica
 * de fora de propósito. Curtida, RSVP e edição precisam do estado real do
 * banco; servir isso do cache mostraria número velho como se fosse atual.
 *
 * Trocar o nome do cache abaixo é o botão de "esquece tudo": o `activate`
 * apaga qualquer cache com nome diferente. É o que fazer quando um arquivo
 * SEM hash mudar (ícones, manifesto, a máscara da marca) — esses o cache
 * primeiro seguraria para sempre.
 */
const CACHE = 'triade-v1';

self.addEventListener('install', () => {
  // assume o lugar do worker anterior sem esperar a aba fechar. É seguro
  // aqui porque o build é um bundle só: não existe risco de a página velha
  // pedir um pedaço que a versão nova não tem.
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      for (const nome of await caches.keys()) {
        if (nome !== CACHE) await caches.delete(nome);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    evento.respondWith(
      (async () => {
        try {
          const resposta = await fetch(req);
          const cache = await caches.open(CACHE);
          // guardado sob '/index.html' e não sob a URL pedida: qualquer
          // rota do app (/eventos, /planos...) devolve o mesmo HTML, que é
          // o que o rewrite da Vercel já faz no servidor
          cache.put('/index.html', resposta.clone());
          return resposta;
        } catch {
          return (await caches.match('/index.html')) ?? Response.error();
        }
      })(),
    );
    return;
  }

  evento.respondWith(
    (async () => {
      const guardado = await caches.match(req);
      if (guardado) return guardado;
      const resposta = await fetch(req);
      if (resposta.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, resposta.clone());
      }
      return resposta;
    })(),
  );
});
