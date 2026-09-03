import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/styles/index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Elemento #root não encontrado no index.html');

// Só em produção: em `npm run dev` um service worker serviria arquivo
// velho por cima do hot reload, e o sintoma ("minha alteração não
// aparece") não parece cache nenhum.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // depois do `load` para não disputar banda com o primeiro render
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch((erro) => {
      console.warn('[triade] service worker não registrou:', erro);
    });
  });
}

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Some a tela de carregamento (declarada no `index.html`) depois que o app
// pintou. O `requestAnimationFrame` duplo espera o primeiro quadro REAL:
// sem ele o fade começa enquanto a tela ainda está em branco e aparece um
// piscar entre uma coisa e outra.
const carregando = document.getElementById('carregando');
if (carregando) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      carregando.classList.add('sumiu');
      carregando.addEventListener('transitionend', () => carregando.remove(), { once: true });
    }),
  );
}
