/*
 * Auditoria de UI — roda o app e mede o que o olho não vê.
 *
 * Cada defeito que este script procura já apareceu de verdade no projeto:
 * botão estourando o card em 360px por 7px, três reprovações de contraste
 * da WCAG, alvo de toque menor que o mínimo. Até 02/09/2026 isso vivia num
 * scratchpad que morria no fim da sessão e era remontado do zero toda vez.
 *
 *   npm run auditoria
 *
 * Sobe o `vite preview` sozinho, varre as 5 telas nos 2 temas, e sai com
 * código 1 se achar algo — serve em CI.
 *
 * Playwright NÃO é dependência do projeto de propósito (regra 7): ele
 * baixa ~300 MB de navegador, e quem só quer rodar o app não deve pagar
 * isso. Instale sob demanda; o script diz como.
 */
import { spawn } from 'node:child_process';
import net from 'node:net';

// `AUDIT_ROTAS` / `AUDIT_TEMAS` estreitam a varredura ao investigar um
// achado — rodar as 20 combinações para olhar uma tela é desperdício.
const ROTAS = (process.env.AUDIT_ROTAS || '/,/sobre,/eventos,/palestrantes,/planos').split(',');
const TEMAS = (process.env.AUDIT_TEMAS || 'onix,perola').split(',');
const PORTA = 4319;
/** Mínimo de alvo de toque. 44px é o ideal da Apple; 38 é o piso que o app adotou. */
const TOQUE_MIN = 38;
/** WCAG AA: 4,5:1 para texto normal, 3:1 para texto grande (≥18,66px ou ≥14px bold). */
const AA_NORMAL = 4.5;
const AA_GRANDE = 3;

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log('\nPlaywright não está instalado. Para rodar a auditoria:\n');
  console.log('  npm i -D playwright pngjs && npx playwright install chromium\n');
  console.log('(ficam fora do package.json de propósito — ver comentário no topo deste arquivo)');
  process.exit(0);
}

// `pngjs` só é preciso para o contraste, que lê o pixel da captura. Sem ele
// as outras três verificações continuam valendo — melhor rodar três do que
// nenhuma, e a mensagem diz o que está faltando.
let PNG = null;
try {
  ({ PNG } = await import('pngjs'));
} catch {
  console.log('(sem `pngjs` — pulando a verificação de contraste. `npm i -D pngjs` liga ela.)');
}

const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const razao = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

function esperaPorta(porta, tentativas = 40) {
  return new Promise((ok, falha) => {
    const tenta = (n) => {
      const s = net.connect(porta, '127.0.0.1');
      s.on('connect', () => (s.end(), ok()));
      s.on('error', () => (n ? setTimeout(() => tenta(n - 1), 250) : falha(new Error('preview não subiu'))));
    };
    tenta(tentativas);
  });
}

const servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--strictPort'], {
  stdio: 'ignore',
  detached: false,
});
process.on('exit', () => servidor.kill());
await esperaPorta(PORTA);

const achados = [];
// `CHROMIUM_BIN` cobre ambiente onde o navegador não está onde o Playwright
// espera (o contêiner remoto do Claude Code é um caso). Vazio = padrão.
const nav = await chromium.launch(
  process.env.CHROMIUM_BIN ? { executablePath: process.env.CHROMIUM_BIN } : {},
);

for (const tema of TEMAS) {
  for (const largura of [360, 375]) {
    const ctx = await nav.newContext({
      viewport: { width: largura, height: 812 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    await ctx.addInitScript((t) => {
      localStorage.setItem('triade_pref_theme', JSON.stringify(t));
      // o convite de boas-vindas cobriria o conteúdo em toda rota, e a
      // auditoria mede a TELA. Marcado como já visto, ele não aparece.
      localStorage.setItem('triade_pref_boas_vindas_vista', JSON.stringify(true));
    }, tema);
    const page = await ctx.newPage();

    for (const rota of ROTAS) {
      const onde = `${tema} ${largura}px ${rota}`;
      const erros = [];
      page.removeAllListeners('pageerror');
      page.removeAllListeners('console');
      page.on('pageerror', (e) => erros.push(e.message.slice(0, 90)));
      page.on('console', (m) => {
        // recurso externo que não carrega não é defeito do app
        if (m.type() === 'error' && !/Failed to load resource/.test(m.text()))
          erros.push(m.text().slice(0, 90));
      });

      await page.goto(`http://127.0.0.1:${PORTA}${rota}`, { waitUntil: 'domcontentloaded' });
      // A fonte MUDA a medida do texto, e medida de texto é exatamente o que
      // causa overflow — então vale esperar por ela. Mas com limite: numa
      // máquina sem acesso ao Google Fonts (o contêiner remoto do Claude
      // Code é um caso) a espera nunca termina e a auditoria parece travada.
      // 5s cobre rede real; estourou, segue com a fonte de fallback.
      await page.waitForLoadState('load', { timeout: 5000 }).catch(() => {});
      // Conteúdo é assíncrono (regra 9): medir antes de o `<Skeleton>` sair
      // pega a tela meio montada.
      await page
        .waitForFunction(() => !document.querySelector('.skeleton'), null, { timeout: 8000 })
        .catch(() => {});
      // E esperar a ANIMAÇÃO DE ENTRADA terminar não é preciosismo: a
      // cascata do `.panel` desloca cada peça em `translateY(10px)`, então
      // `getBoundingClientRect` devolve a posição animada enquanto a captura
      // sai do lugar final. Dez pixels de defasagem foi o que fez a primeira
      // rodada acusar 9 reprovações de contraste que não existiam — a
      // leitura caía fora do botão, no fundo escuro do card.
      //
      // Espera pelo estado real, não por um tempo fixo. As animações
      // infinitas do app (mesh, halo do calendário, selo da aba) nunca
      // terminam e ficam de fora da conta.
      await page
        .waitForFunction(
          () =>
            document
              .getAnimations()
              .filter((a) => a.effect?.getTiming?.().iterations !== Infinity)
              .every((a) => a.playState === 'finished' || a.playState === 'idle'),
          null,
          { timeout: 8000 },
        )
        .catch(() => {});
      await page.waitForTimeout(200);

      // ---- overflow horizontal ----
      for (const alvo of await page.evaluate(() => {
        const fora = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) fora.push('documento');
        for (const el of document.querySelectorAll('.app-main *'))
          if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === 'visible')
            fora.push(el.className.split(' ')[0] || el.tagName);
        return [...new Set(fora)];
      }))
        achados.push(`OVERFLOW  ${onde}  ${alvo}`);

      // ---- alvo de toque ----
      // `<label>` que embrulha um campo conta pela área do label: tocar em
      // qualquer ponto dele foca o campo. Sem esta exceção o campo de busca
      // de Eventos aparece como falso positivo (25px dentro de um label de 49).
      for (const alvo of await page.evaluate((min) => {
        const fora = [];
        for (const el of document.querySelectorAll('button, a[href], [role=button], select')) {
          const r = el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4) continue;
          if (r.height < min || r.width < min)
            fora.push(
              `${el.className.split(' ')[0] || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`,
            );
        }
        for (const el of document.querySelectorAll('input, textarea')) {
          const cx = el.closest('label') ?? el;
          const r = cx.getBoundingClientRect();
          if (r.height && r.height < min) fora.push(`${el.type || 'campo'} ${Math.round(r.height)}px de altura`);
        }
        return [...new Set(fora)];
      }, TOQUE_MIN))
        achados.push(`TOQUE     ${onde}  ${alvo}`);

      // ---- contraste, medido no pixel renderizado ----
      // Calcular em cima dos tokens ignora gradiente, `backdrop-filter` e a
      // barra flutuante por cima do conteúdo. O jeito que funciona: apagar o
      // texto, fotografar, e ler o pixel do fundo onde ele estava.
      if (largura === 375 && PNG) {
        const alvos = await page.evaluate(() => {
          const rgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
          const barra = document.querySelector('.tabbar')?.getBoundingClientRect();
          const out = [];
          // A tab bar entra na conta. Ela ficava de fora porque o filtro
          // logo abaixo pula o que ela cobre — e acabava pulando ela
          // própria. É justamente onde o vidro é mais transparente, então
          // é onde o contraste tem mais chance de reprovar.
          for (const el of document.querySelectorAll('.app-main *, .app-top *, .tabbar *')) {
            const texto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
            if (!texto) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
            const r = el.getBoundingClientRect();
            if (r.width < 8 || r.height < 8) continue;
            if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) continue;
            // coberto pela tab bar — exceto se FOR a tab bar
            if (barra && r.bottom > barra.top && !el.closest('.tabbar')) continue;
            const px = parseFloat(cs.fontSize);
            out.push({
              nome: (el.className.split(' ')[0] || el.tagName) + ': ' + el.textContent.trim().slice(0, 22),
              cor: rgb(cs.color),
              grande: px >= 18.66 || (px >= 14 && +cs.fontWeight >= 700),
              x: Math.round(r.left + r.width / 2),
              y: Math.round(r.top + r.height / 2),
            });
          }
          return out;
        });
        if (alvos.length) {
          await page.addStyleTag({ content: '*{color:transparent!important;text-shadow:none!important}' });
          await page.waitForTimeout(120);
          const png = PNG.sync.read(await page.screenshot());
          const escala = png.width / largura;  // a captura pode sair em px de dispositivo
          await page.evaluate(() => document.querySelectorAll('style').forEach((s) => {
            if (s.textContent.includes('color:transparent')) s.remove();
          }));
          for (const a of alvos) {
            const i = (Math.round(a.y * escala) * png.width + Math.round(a.x * escala)) * 4;
            const fundo = [png.data[i], png.data[i + 1], png.data[i + 2]];
            const r = razao(a.cor, fundo);
            const min = a.grande ? AA_GRANDE : AA_NORMAL;
            if (process.env.AUDIT_DEBUG)
              console.log(`  [debug] ${a.nome} cor=[${a.cor}] px(${a.x},${a.y})=[${fundo}] r=${r.toFixed(2)}`);
            if (r < min) achados.push(`CONTRASTE ${onde}  ${r.toFixed(2)}:1 (mín ${min})  ${a.nome}`);
          }
        }
      }

      for (const e of erros) achados.push(`CONSOLE   ${onde}  ${e}`);
    }
    await ctx.close();
  }
}

await nav.close();
servidor.kill();

if (achados.length === 0) {
  console.log(`\n✓ auditoria limpa — ${ROTAS.length} telas x ${TEMAS.length} temas x 2 larguras\n`);
  process.exit(0);
}
console.log(`\n✗ ${achados.length} achado(s):\n`);
for (const a of achados) console.log('  ' + a);
console.log('');
process.exit(1);
