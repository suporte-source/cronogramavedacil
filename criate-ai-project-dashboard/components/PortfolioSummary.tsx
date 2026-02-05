import React from 'react';
import { Project } from '../types';
import { CircularProgress } from './CircularProgress';
import { AlertCircle, CheckCircle, Clock, HelpCircle, Activity } from 'lucide-react';

interface PortfolioSummaryProps {
  projects: Project[];
}

const getStatusConfig = (status: string) => {
  const normalizedStatus = status ? status.toUpperCase().trim() : '';

  if (normalizedStatus.includes('NO_PRAZO') || normalizedStatus === 'OK') {
    return { icon: CheckCircle, text: 'No Prazo', color: 'text-emerald-500', dot: 'bg-emerald-500', border: 'border-emerald-500/20' };
  }
  if (normalizedStatus.includes('AGUARDANDO') || normalizedStatus.includes('CLIENTE')) {
    return { icon: Clock, text: 'Aguardando', color: 'text-amber-500', dot: 'bg-amber-500', border: 'border-amber-500/20' };
  }
  if (normalizedStatus.includes('IMPEDIDO') || normalizedStatus.includes('ATRASADO')) {
    return { icon: AlertCircle, text: 'Impedido', color: 'text-red-500', dot: 'bg-red-500', border: 'border-red-500/20' };
  }

  return { icon: HelpCircle, text: 'Status Desconhecido', color: 'text-gray-500', dot: 'bg-gray-500', border: 'border-gray-800' };
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {projects.map((project) => {
        const statusConfig = getStatusConfig(project.status);

        return (
          <div 
            key={project.id} 
            className={`bg-[#121212] border ${statusConfig.border} rounded-xl p-5 hover:bg-[#151515] transition-all duration-300 group flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col justify-between h-full min-h-[80px]">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{project.category}</span>
                  <h3 className="text-base font-bold text-white mt-1 leading-tight">{project.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                    <span className={`text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.text}
                    </span>
                </div>
              </div>

              <div className="relative">
                 <CircularProgress percentage={project.progress} size={52} strokeWidth={4} color={statusConfig.color.replace('text-', '').replace('-500', '') === 'emerald' ? '#10b981' : statusConfig.color.replace('text-', '').replace('-500', '') === 'amber' ? '#f59e0b' : statusConfig.color.replace('text-', '').replace('-500', '') === 'red' ? '#ef4444' : '#f74600'} />
              </div>
            </div>
            
            {/* Footer Metrics - Optimized for wrapping */}
            <div className="mt-4 pt-3 border-t border-gray-800/50">
                <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2">
                    <div className="flex items-center gap-1 shrink-0 text-[10px] text-gray-400">
                        <Activity size={10} />
                        <span>Prazo: {formatDate(project.originalDeadline)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px]">
                        {/* Criate Days (Execution) */}
                        {project.criateDays > 0 && (
                            <span className="text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded whitespace-nowrap" title="Dias de execução interna">
                                {project.criateDays}d execut.
                            </span>
                        )}
                        
                        {/* Client Days (Delay/Wait) */}
                        {project.clientDays > 0 && (
                            <span className="text-red-400 bg-red-900/10 px-1.5 py-0.5 rounded whitespace-nowrap" title="Dias aguardando cliente">
                                +{project.clientDays}d
                            </span>
                        )}
                    </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};