import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { MarketStrip } from './components/MarketStrip';
import { SearchOverlay } from './components/SearchOverlay';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { RoutingSimulator } from './components/RoutingSimulator';
import { BenchmarkExplorer } from './components/BenchmarkExplorer';
import { StatusPage } from './components/StatusPage';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { useAppStore } from './store/useAppStore';

const ModelDetailPage = lazy(() => import('./pages/ModelDetailPage').then(m => ({ default: m.ModelDetailPage })));

function KeyboardShortcuts() {
  const { refreshData } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        refreshData();
      }
      if ((e.key === 'c' || e.key === 'C') && location.pathname !== '/simulate') {
        e.preventDefault();
        document.querySelector('input[type="number"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshData, location]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <KeyboardShortcuts />
      <div className="min-h-screen bg-aura-base text-aura-textPrimary flex flex-col">
        <Header />
        <MarketStrip />
        <SearchOverlay />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/model/:id" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <ModelDetailPage />
              </Suspense>
            } />
            <Route path="/simulate" element={<RoutingSimulator />} />
            <Route path="/benchmarks" element={<BenchmarkExplorer />} />
            <Route path="/status" element={<StatusPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
