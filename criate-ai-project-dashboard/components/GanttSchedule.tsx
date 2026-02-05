import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { ChevronRight, User, Calendar, CheckSquare } from 'lucide-react';

interface GanttScheduleProps {
  projects: Project[];
}

export const GanttSchedule: React.FC<GanttScheduleProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  // Ensure we have a valid project selected
  const activeProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId) || projects[0], 
  [projects, selectedProjectId]);

  // --- Gantt Logic ---
  const { timelineDates, gridStartDate } = useMemo(() => {
    if (!activeProject || activeProject.tasks.length === 0) {
      const now = new Date();
      return { timelineDates: [now], gridStartDate: now };
    }

    // Find min start date and max end date
    let minDate = new Date(activeProject.tasks[0].startDate);
    let maxDate = new Date(activeProject.tasks[0].startDate);

    // Validate dates to prevent crashes
    if (isNaN(minDate.getTime())) minDate = new Date();
    if (isNaN(maxDate.getTime())) maxDate = new Date();

    activeProject.tasks.forEach(t => {
      const start = new Date(t.startDate);
      if (!isNaN(start.getTime())) {
          const end = new Date(start);
          end.setDate(start.getDate() + t.durationDays);

          if (start < minDate) minDate = start;
          if (end > maxDate) maxDate = end;
      }
    });

    // Add padding (3 days before, 7 days after)
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 7);

    const dates = [];
    const currentDate = new Date(minDate);
    
    // Safety break loop to prevent infinite loops if dates are crazy
    let safeGuard = 0;
    while (currentDate <= maxDate && safeGuard < 180) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
      safeGuard++;
    }

    return { 
      timelineDates: dates, 
      gridStartDate: minDate
    };
  }, [activeProject]);

  const getPositionStyle = (startDateStr: string, duration: number) => {
    if (!startDateStr) return { display: 'none' };
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return { display: 'none' };

    const diffTime = start.getTime() - gridStartDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      left: `${diffDays * 48}px`, // 48px per day column
      width: `${duration * 48}px`
    };
  };

  const formatDateShort = (dateStr: string) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getEstimatedEndDate = (startDate: string, duration: number) => {
      if (!startDate) return '-';
      const date = new Date(startDate);
      if (isNaN(date.getTime())) return '-';
      date.setDate(date.getDate() + duration);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  if (!activeProject) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar: Project Selector */}
      <div className="lg:col-span-1 bg-[#121212] border border-gray-800 rounded-xl p-6 shadow-lg h-fit sticky top-24">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-criate-orange rounded-full"></span>
            Projetos
        </h2>

        <div className="flex flex-col gap-2">
            {projects.map(p => (
                <button
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`text-left px-4 py-3 rounded-lg border transition-all ${
                        activeProject.id === p.id 
                        ? 'bg-criate-orange/10 border-criate-orange text-white shadow-[0_0_15px_rgba(247,70,0,0.2)]' 
                        : 'bg-[#1E1E1E] border-transparent text-gray-400 hover:bg-[#252525]'
                    }`}
                >
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{p.name}</span>
                        {activeProject.id === p.id && <ChevronRight className="w-4 h-4 text-criate-orange" />}
                    </div>
                </button>
            ))}
        </div>
        
        {/* Info Box */}
        <div className="mt-6 bg-[#1E1E1E] p-4 rounded-lg border border-gray-700">
             <h3 className="text-xs font-bold text-white mb-2 uppercase">Status Atual</h3>
             <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                    activeProject.status === 'NO_PRAZO' ? 'bg-emerald-500' :
                    activeProject.status === 'IMPEDIDO' ? 'bg-red-500' : 'bg-amber-500'
                }`}></div>
                <span className="text-sm text-gray-300">
                    {activeProject.status === 'NO_PRAZO' ? 'No Prazo' :
                     activeProject.status === 'IMPEDIDO' ? 'Impedido/Atrasado' : 'Aguardando Cliente'}
                </span>
             </div>
             <p className="text-[10px] text-gray-500">
                Selecione um projeto para ver detalhes das tarefas e cronograma Gantt.
             </p>
        </div>
      </div>

      {/* Main Content: Tasks List + Gantt */}
      <div className="lg:col-span-3 space-y-8">
         
         {/* SECTION 1: TASK LIST TABLE */}
         <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col">
             <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">Lista de Tarefas</h2>
                    <p className="text-gray-500 text-sm">Status detalhado das atividades para {activeProject.name}.</p>
                </div>
             </div>

             <div className="overflow-x-auto pb-2">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="border-b border-gray-800">
                             <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap min-w-[280px]">Tarefa</th>
                             <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Responsável</th>
                             <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Status</th>
                             <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Duração</th>
                             <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right whitespace-nowrap">Término</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-800">
                         {activeProject.tasks.map((task) => {
                             const isBallInCourt = task.status === 'IN_PROGRESS';
                             const isDelayed = activeProject.status === 'IMPEDIDO' && isBallInCourt;
                             const hasEndDate = task.endDate && task.endDate.length > 5;
                             const isCompleted = task.status === 'COMPLETED';

                             return (
                                 <tr key={task.id} className={`group transition-colors ${isBallInCourt ? 'bg-[#1E1E1E]' : 'hover:bg-[#1E1E1E]/50'}`}>
                                     {/* Task Name Column: Min-width triggers scroll, line-clamp limits height */}
                                     <td className="py-4 px-4 relative min-w-[280px]">
                                         {isBallInCourt && (
                                             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-criate-orange rounded-r"></div>
                                         )}
                                         <div className="flex items-start gap-3">
                                             {isBallInCourt && (
                                                 <div className="relative mt-1 shrink-0">
                                                     <div className={`w-3 h-3 rounded-full ${isDelayed ? 'bg-red-500' : 'bg-criate-orange'} shadow-[0_0_10px_rgba(247,70,0,0.8)] animate-pulse`}></div>
                                                 </div>
                                             )}
                                             <span 
                                                className={`font-medium text-sm leading-tight line-clamp-2 ${task.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-white'}`}
                                                title={task.name} // Full text on hover
                                             >
                                                {task.name}
                                             </span>
                                         </div>
                                     </td>
                                     
                                     <td className="py-4 px-4 whitespace-nowrap">
                                         <div className="flex items-center gap-2">
                                             <div className={`p-1 rounded bg-gray-800 ${task.responsible === 'Criate' ? 'text-criate-orange' : 'text-gray-400'}`}>
                                                <User size={14} />
                                             </div>
                                             <span className={`text-xs ${task.responsible === 'Criate' ? 'text-criate-orange font-medium' : 'text-gray-400'}`}>
                                                {task.responsibleName}
                                             </span>
                                         </div>
                                     </td>
                                     
                                     <td className="py-4 px-4 whitespace-nowrap">
                                         <span className={`text-[10px] px-2 py-1 rounded border uppercase font-semibold tracking-wider ${
                                             task.status === 'COMPLETED' ? 'border-green-900 bg-green-900/20 text-green-500' :
                                             task.status === 'IN_PROGRESS' ? 'border-criate-orange/30 bg-criate-orange/10 text-criate-orange' :
                                             'border-gray-800 bg-gray-800 text-gray-500'
                                         }`}>
                                             {task.status === 'COMPLETED' ? 'Concluído' : task.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Pendente'}
                                         </span>
                                     </td>
                                     
                                     <td className="py-4 px-4 whitespace-nowrap">
                                         <span className="text-gray-500 text-xs">
                                             {task.durationDays} dias
                                         </span>
                                     </td>
                                     
                                     <td className="py-4 px-4 text-right whitespace-nowrap">
                                         {isCompleted && hasEndDate ? (
                                            <div className="flex items-center justify-end gap-1 text-emerald-500 text-xs font-medium">
                                                <CheckSquare size={14} />
                                                {formatDateShort(task.endDate!)}
                                            </div>
                                         ) : (
                                            <div className="flex items-center justify-end gap-1 text-gray-600 text-xs">
                                                <Calendar size={14} />
                                                <span>Prev: {getEstimatedEndDate(task.startDate, task.durationDays)}</span>
                                            </div>
                                         )}
                                     </td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             </div>
         </div>
         
         {/* SECTION 2: GANTT CHART */}
         <div className="bg-[#121212] border border-gray-800 rounded-xl flex flex-col shadow-lg overflow-hidden">
             {/* Header */}
             <div className="p-6 border-b border-gray-800 bg-[#151515]">
                <h2 className="text-xl font-bold text-white mb-1">Linha do Tempo</h2>
                <p className="text-gray-500 text-sm">Visão cronológica de {activeProject.name}</p>
             </div>

             <div className="flex-1 overflow-hidden flex flex-col relative min-h-[350px]">
                {/* Scrollable Timeline Area */}
                <div className="overflow-x-auto custom-scrollbar flex-1 relative">
                    <div className="min-w-fit">
                        {/* Timeline Header (Dates) */}
                        <div className="flex border-b border-gray-800 sticky top-0 bg-[#121212] z-10 h-12">
                            {/* Task Name Column Header (Fixed) */}
                            <div className="w-56 shrink-0 border-r border-gray-800 px-4 py-3 bg-[#151515] sticky left-0 z-20 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Atividade
                            </div>
                            
                            {/* Dates */}
                            {timelineDates.map((date, i) => {
                                const isToday = new Date().toDateString() === date.toDateString();
                                return (
                                    <div key={i} className={`w-12 shrink-0 border-r border-gray-800/30 flex flex-col items-center justify-center text-[10px] ${isToday ? 'bg-criate-orange/10 text-criate-orange font-bold' : 'text-gray-500'}`}>
                                        <span>{date.toLocaleDateString('pt-BR', { weekday: 'narrow' })}</span>
                                        <span>{date.getDate()}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Task Rows */}
                        <div className="divide-y divide-gray-800/50">
                            {activeProject.tasks.map((task) => {
                                const isCriate = task.responsible === 'Criate';
                                const isCompleted = task.status === 'COMPLETED';
                                const isPending = task.status === 'PENDING';
                                
                                let barColorClass = isCriate ? 'bg-criate-orange' : 'bg-gray-600';
                                if (isPending) {
                                    barColorClass = isCriate ? 'border border-criate-orange border-dashed bg-criate-orange/10' : 'border border-gray-600 border-dashed bg-gray-600/10';
                                }

                                return (
                                    <div key={task.id} className="flex hover:bg-white/[0.02] transition-colors h-12 group">
                                        {/* Fixed Left Column: Task Name */}
                                        <div className="w-56 shrink-0 border-r border-gray-800 px-4 flex items-center bg-[#121212] sticky left-0 z-10 group-hover:bg-[#181818] transition-colors">
                                            <div className="text-xs font-medium text-gray-300 truncate" title={task.name}>{task.name}</div>
                                        </div>

                                        {/* Timeline Grid Cell */}
                                        <div className="relative flex-1 h-full">
                                            {/* Background Grid Lines */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {timelineDates.map((d, i) => {
                                                    const isToday = new Date().toDateString() === d.toDateString();
                                                    return (
                                                        <div key={i} className={`w-12 h-full border-r border-gray-800/20 ${isToday ? 'bg-criate-orange/5' : ''}`}></div>
                                                    );
                                                })}
                                            </div>

                                            {/* The Gantt Bar */}
                                            <div 
                                                className={`absolute top-1/2 -translate-y-1/2 h-6 rounded text-[9px] flex items-center justify-center text-white whitespace-nowrap overflow-hidden transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${barColorClass} ${isCompleted ? 'opacity-50 saturate-0' : ''}`}
                                                style={getPositionStyle(task.startDate, task.durationDays)}
                                                title={`${task.name} (${task.durationDays} dias)`}
                                            >
                                                {task.durationDays > 1 && `${task.durationDays}d`}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Today Line Indicator */}
                        <div className="absolute top-12 bottom-0 pointer-events-none z-0" 
                            style={{ 
                                left: `${(Math.ceil((new Date().getTime() - gridStartDate.getTime()) / (1000 * 60 * 60 * 24)) * 48) + 224}px` // 224 = sidebar width (56*4)
                            }}>
                            <div className="h-full w-px bg-criate-orange shadow-[0_0_10px_#f74600]"></div>
                        </div>
                    </div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};