import React, { useState, useEffect } from 'react';
import { Project } from './types';
import { PortfolioSummary } from './components/PortfolioSummary';
import { GanttSchedule } from './components/GanttSchedule';
import { LayoutDashboard, Loader2, AlertTriangle } from 'lucide-react';
import { fetchDashboardData } from './services/sheetService';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const { data, isOffline, error } = await fetchDashboardData();
        setProjects(data);
        setIsOffline(isOffline);
        setConnectionError(error || null);
        setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
            <Loader2 className="w-12 h-12 text-criate-orange animate-spin" />
            <p className="text-sm text-gray-400">Sincronizando com Google Sheets...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#E0E0E0] font-sans selection:bg-criate-orange selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://storage.googleapis.com/msgsndr/gQyR2XiOdms3EGwaCYwm/media/683bb6485914154663334058.png" 
              alt="Criate Logo" 
              className="h-8 w-auto object-contain"
            />
            <div className="h-6 w-px bg-gray-800 mx-2"></div>
            <h1 className="text-xl font-bold tracking-tight text-white">Acompanhamento dos Projetos</h1>
          </div>
        </div>
      </header>

      {/* Connection Error Banner */}
      {isOffline && connectionError && (
        <div className="bg-red-900/10 border-b border-red-900/30 py-3">
            <div className="max-w-7xl mx-auto px-4 flex items-start gap-3 text-sm text-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                    <p className="font-bold text-red-400">Não foi possível ler a planilha.</p>
                    <p className="opacity-80 mt-1">{connectionError}</p>
                    <p className="text-xs mt-2 text-gray-400">
                        Certifique-se de que a planilha está <strong>compartilhada publicamente</strong> e que as abas se chamam <strong>"Projetos"</strong> e <strong>"Tarefas"</strong>.
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Section 1: Portfolio Summary */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="text-criate-orange" size={20} />
            <h2 className="text-lg font-medium text-white">Resumo do Portfólio</h2>
          </div>
          <PortfolioSummary projects={projects} />
        </section>

        {/* Section 2: Gantt / Scheduler */}
        <section>
          <GanttSchedule projects={projects} />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Criate AI Solutions. Dashboard Confidencial.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;