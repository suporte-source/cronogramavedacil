import React from 'react';
import { Project } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SpeedAuditProps {
  projects: Project[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121212] border border-gray-800 p-4 rounded-lg shadow-2xl backdrop-blur-sm">
        <p className="text-white font-bold mb-3 border-b border-gray-800 pb-2">{label}</p>
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-8">
                <span className="text-gray-400 text-xs">Execução (Criate):</span>
                <span className="text-criate-orange font-mono font-bold">{payload[0].value} dias</span>
            </div>
            <div className="flex items-center justify-between gap-8">
                <span className="text-gray-400 text-xs">Espera (Cliente):</span>
                <span className="text-white font-mono font-bold">{payload[1].value} dias</span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

export const SpeedAudit: React.FC<SpeedAuditProps> = ({ projects }) => {
  const data = projects.map(p => ({
    name: p.name,
    criate: p.criateDays,
    vedacil: p.clientDays
  }));

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-xl p-8 mb-8 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <span className="w-1 h-6 bg-criate-orange rounded-full"></span>
            Auditoria de Velocidade
          </h2>
          <p className="text-gray-500 text-xs tracking-wide uppercase">Quem está segurando o projeto?</p>
        </div>
        
        {/* Cleaner Legend */}
        <div className="flex gap-6 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-criate-orange"></div>
                <span className="text-xs text-gray-400">Criate (Agilidade)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                <span className="text-xs text-gray-400">Cliente (Gargalo)</span>
            </div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            barSize={12}
            barGap={4}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#888', fontSize: 11, fontWeight: 500 }} 
              width={140} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            
            {/* Background Bars (Track) - Optional Visual Flair */}
            <Bar 
              dataKey="criate" 
              stackId="a" 
              fill="#f74600" 
              radius={[2, 0, 0, 2]}
              animationDuration={1500}
            />
            <Bar 
              dataKey="vedacil" 
              stackId="a" 
              fill="#333333" 
              radius={[0, 2, 2, 0]} 
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};