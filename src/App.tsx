import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MeshBackground } from '@/components/Brand';
import { TopBar } from '@/components/TopBar';
import { TabBar } from '@/components/TabBar';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { TabBarStyleProvider } from '@/context/TabBarStyleContext';
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

  // ao trocar de aba, volta o conteúdo para o topo
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <>
      <MeshBackground />
      <div className="app">
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
