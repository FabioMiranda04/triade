import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MeshBackground } from '@/components/Brand';
import { TopBar } from '@/components/TopBar';
import { TabBar } from '@/components/TabBar';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { TabBarStyleProvider, useTabBarStyle } from '@/context/TabBarStyleContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Home from '@/screens/Home';
import Sobre from '@/screens/Sobre';
import Eventos from '@/screens/Eventos';
import Palestrantes from '@/screens/Palestrantes';
import Planos from '@/screens/Planos';

/**
 * App shell: header fixo + área de conteúdo com scroll próprio + tab bar
 * fixa embaixo. É o mesmo comportamento do protótipo original — o body não
 * rola, só a `.app-main`, como num app nativo.
 */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <TabBarStyleProvider>
            <AppShell />
          </TabBarStyleProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  // No estilo "Padrão 2" a tab bar é uma pílula que flutua POR CIMA do
  // conteúdo — o feed passa por baixo dela e aparece através do vidro. Isso
  // exige tirar o <nav> do fluxo e devolver o espaço em padding na
  // `.app-main`; ver docs/DESIGN-SYSTEM.md, seção 6.2.
  const { style } = useTabBarStyle();

  // ao trocar de aba, volta o conteúdo para o topo
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    setRolou(false);
  }, [location.pathname]);

  // O cabeçalho ganha peso assim que o conteúdo começa a passar por baixo
  // dele. Parado no topo ele é quase invisível, o que dá a impressão de
  // tela inteira; com conteúdo rolando, a separação precisa existir para o
  // vidro não virar borrão. É o mesmo gesto que app nativo faz.
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    // 4px de zona morta: sem ela, o quique do scroll do iOS liga e desliga
    // a sombra no repouso
    const aoRolar = () => setRolou(el.scrollTop > 4);
    el.addEventListener('scroll', aoRolar, { passive: true });
    return () => el.removeEventListener('scroll', aoRolar);
  }, []);

  return (
    <>
      <MeshBackground />
      <div
        className={`app${style === 'padrao2' ? ' app-tabs-floating' : ''}${rolou ? ' rolando' : ''}`}
      >
        <TopBar />
        <main className="app-main" ref={mainRef}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/palestrantes" element={<Palestrantes />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <TabBar />
      </div>
    </>
  );
}
