
import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Zap, 
  Eye, 
  BookOpen, 
  Star,
  ChevronRight,
  History,
  ArrowUpRight,
  Sparkles,
  Apple,
  Moon
} from 'lucide-react';
import { DailyLog, UserProfile, JourneyProgress } from '../types';
import { motion } from 'framer-motion';

interface EvolutionReportProps {
  logs: DailyLog[];
  userProfile: UserProfile;
}

const EvolutionReport: React.FC<EvolutionReportProps> = ({ logs, userProfile }) => {
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs]);

  const chartData = useMemo(() => {
    return sortedLogs.map(log => ({
      date: new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      energy: log.energyLevel,
      awareness: log.awarenessLevel,
      vibration: (log.energyLevel + log.awarenessLevel) / 2
    }));
  }, [sortedLogs]);

  const currentVibration = useMemo(() => {
    if (logs.length === 0) return null;
    const lastLog = sortedLogs[sortedLogs.length - 1];
    const avg = (lastLog.energyLevel + lastLog.awarenessLevel) / 2;
    if (avg >= 4.5) return { label: "Frequência Cristalina", color: "text-aura-teal" };
    if (avg >= 3.5) return { label: "Frequência Elevada", color: "text-aura-violet" };
    if (avg >= 2.5) return { label: "Frequência em Alinhamento", color: "text-aura-gold" };
    return { label: "Frequência em Purificação", color: "text-aura-rose" };
  }, [logs, sortedLogs]);

  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    
    const firstLog = sortedLogs[0];
    const lastLog = sortedLogs[sortedLogs.length - 1];
    
    const energyDiff = lastLog.energyLevel - firstLog.energyLevel;
    const awarenessDiff = lastLog.awarenessLevel - firstLog.awarenessLevel;
    
    const totalRituals = logs.reduce((acc, log) => {
      const completed = Object.values(log.completedActions).filter(Boolean).length;
      return acc + completed;
    }, 0);

    return {
      energyDiff,
      awarenessDiff,
      totalRituals,
      daysCount: logs.length
    };
  }, [logs, sortedLogs]);

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
          <History size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-white italic">O Livro está em branco</h3>
          <p className="text-sm text-ethereal-400 italic">Comece a registrar sua jornada no Diário para ver sua evolução florescer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page navigated-screen p-4 pb-32 max-w-2xl mx-auto space-y-10 animate-in fade-in">
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-aura-violet">
          <TrendingUp size={20} className="animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Portal da Evolução</p>
        </div>
        <h2 className="text-4xl font-serif text-white tracking-tighter italic leading-none">Sua Ascensão</h2>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-mystic p-6 rounded-[2.5rem] border border-aura-teal/30 bg-gradient-to-br from-aura-teal/10 to-transparent space-y-2 shadow-[0_0_30px_rgba(16,185,129,0.1)] group hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all"
        >
          <div className="flex items-center gap-2 text-aura-teal">
            <Zap size={14} className="group-hover:animate-bounce" />
            <span className="text-[9px] font-black uppercase tracking-widest">Vitalidade</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-serif text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {stats?.energyDiff && stats.energyDiff > 0 ? `+${stats.energyDiff}` : stats?.energyDiff || 0}
            </span>
            <span className="text-[10px] text-ethereal-400 mb-1">níveis</span>
          </div>
          <p className="text-[8px] text-ethereal-500 uppercase font-bold tracking-tighter">Evolução de Energia</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-mystic p-6 rounded-[2.5rem] border border-aura-violet/30 bg-gradient-to-br from-aura-violet/10 to-transparent space-y-2 shadow-[0_0_30px_rgba(139,92,246,0.1)] group hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all"
        >
          <div className="flex items-center gap-2 text-aura-violet">
            <Eye size={14} className="group-hover:animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Presença</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-serif text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {stats?.awarenessDiff && stats.awarenessDiff > 0 ? `+${stats.awarenessDiff}` : stats?.awarenessDiff || 0}
            </span>
            <span className="text-[10px] text-ethereal-400 mb-1">níveis</span>
          </div>
          <p className="text-[8px] text-ethereal-500 uppercase font-bold tracking-tighter">Expansão de Consciência</p>
        </motion.div>
      </div>

      {/* Redução de Sintomas - NOVO */}
      <section className="glass-mystic p-8 rounded-[3rem] border border-aura-rose/30 bg-gradient-to-br from-aura-rose/10 via-transparent to-aura-rose/5 space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-aura-rose/10 blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
        <div className="flex items-center gap-3">
          <div className="p-2 bg-aura-rose/20 rounded-xl text-aura-rose">
            <Activity size={18} className="animate-pulse" />
          </div>
          <h3 className="text-xl font-serif text-white italic">Redução de Sintomas</h3>
        </div>
        <p className="text-xs text-ethereal-300 italic leading-relaxed">
          Acompanhe a diminuição da densidade e o aumento da sua frequência vibracional. Quanto mais alta sua energia e presença, menor a manifestação de sintomas de desequilíbrio.
        </p>
        <div className="grid grid-cols-3 gap-4 pt-2 relative z-10">
          <div className="text-center space-y-1">
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Início</p>
            <p className="text-lg font-serif text-white italic">{sortedLogs[0].energyLevel + sortedLogs[0].awarenessLevel}/10</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-aura-rose/50 to-transparent" />
            <ChevronRight size={16} className="text-aura-rose animate-bounce-x" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[8px] font-black text-aura-emerald uppercase tracking-widest">Atual</p>
            <p className="text-lg font-serif text-white italic drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{sortedLogs[sortedLogs.length - 1].energyLevel + sortedLogs[sortedLogs.length - 1].awarenessLevel}/10</p>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="glass-mystic p-8 rounded-[3.5rem] border border-aura-violet/30 space-y-8 shadow-2xl relative overflow-hidden bg-gradient-to-br from-aura-violet/10 via-transparent to-aura-indigo/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-aura-violet/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif text-white italic tracking-tight">Fluxo Vibracional</h3>
            <p className="text-[9px] font-black text-aura-violet uppercase tracking-widest">Escala de Consciência (1 a 5)</p>
          </div>
          {currentVibration && (
            <div className={`px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 ${currentVibration.color}`}>
              <Sparkles size={12} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">{currentVibration.label}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-6 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-aura-teal" />
            <span className="text-[8px] font-black text-white/40 uppercase">Energia (Vitalidade)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-aura-violet" />
            <span className="text-[8px] font-black text-white/40 uppercase">Presença (Consciência)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-aura-gold" />
            <span className="text-[8px] font-black text-white/40 uppercase">Vibração (Média)</span>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[9px] text-ethereal-400 italic leading-relaxed">
            O Fluxo Vibracional é a síntese da sua jornada em uma escala de 1 (Densidade) a 5 (Sutileza). A linha dourada representa o seu estado de equilíbrio atual, integrando sua força vital e sua capacidade de estar presente no agora.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAwareness" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                dy={10}
              />
              <YAxis 
                domain={[0, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(10, 5, 2, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  fontSize: '10px'
                }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`Nível ${value}`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="energy" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorEnergy)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="awareness" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorAwareness)" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="vibration" 
                stroke="#d4af37" 
                strokeWidth={3} 
                dot={{ fill: '#d4af37', r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Resumo da Alquimia Alimentar e Sintomas - NOVO */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <Apple size={20} className="text-aura-teal" />
          <h3 className="text-2xl font-serif text-white italic">Resumo da Alquimia Alimentar</h3>
        </div>
        
        <div className="p-6 glass-mystic rounded-[2.5rem] border border-white/5 space-y-4">
           <p className="text-xs text-ethereal-300 italic leading-relaxed">
             Correlacione sua nutrição com sua vibração. Observe como a presença ou ausência de glúten, laticínios e açúcares impacta sua vitalidade e clareza mental. O descanso do templo (jejum) é essencial para a regeneração.
           </p>
           
           <div className="space-y-4 pt-2">
             {sortedLogs.slice().reverse().filter(l => l.foodRecord).map((log) => (
               <div key={`food-${log.date}`} className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                   <span className="text-[9px] font-black text-aura-gold uppercase tracking-widest">
                     {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                   </span>
                   <div className="flex gap-2">
                     <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${log.energyLevel >= 4 ? 'bg-aura-teal/20 text-aura-teal' : 'bg-aura-rose/20 text-aura-rose'}`}>
                       Energia: {log.energyLevel}
                     </span>
                     <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${log.awarenessLevel >= 4 ? 'bg-aura-violet/20 text-aura-violet' : 'bg-aura-rose/20 text-aura-rose'}`}>
                       Presença: {log.awarenessLevel}
                     </span>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <p className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Desjejum & Almoço</p>
                     <p className="text-[10px] text-ethereal-200 italic">
                       {log.foodRecord?.breakfast || 'Não registrado'} • {log.foodRecord?.lunch || 'Não registrado'}
                     </p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Jantar & Lanches</p>
                     <p className="text-[10px] text-ethereal-200 italic">
                       {log.foodRecord?.dinner || 'Não registrado'} • {log.foodRecord?.snacks || 'Não registrado'}
                     </p>
                   </div>
                 </div>

                 {log.foodRecord?.fastingHours && log.foodRecord.fastingHours > 0 && (
                   <div className="flex items-center gap-2 px-3 py-1 bg-aura-violet/10 rounded-lg border border-aura-violet/20">
                     <Moon size={10} className="text-aura-violet" />
                     <span className="text-[8px] font-bold text-aura-violet uppercase">Descanso do Templo: {log.foodRecord.fastingHours}h de Jejum</span>
                   </div>
                 )}
                 
                 {(log.foodRecord?.breakfast?.toLowerCase().includes('glúten') || 
                   log.foodRecord?.breakfast?.toLowerCase().includes('leite') ||
                   log.foodRecord?.lunch?.toLowerCase().includes('glúten') ||
                   log.foodRecord?.lunch?.toLowerCase().includes('leite') ||
                   log.foodRecord?.dinner?.toLowerCase().includes('glúten') ||
                   log.foodRecord?.dinner?.toLowerCase().includes('leite')) && (
                   <div className="flex items-center gap-2 px-3 py-1 bg-aura-rose/10 rounded-lg border border-aura-rose/20">
                     <Activity size={10} className="text-aura-rose" />
                     <span className="text-[8px] font-bold text-aura-rose uppercase">Potencial Alérgeno Detectado</span>
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Recordatário (History) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <History size={20} className="text-aura-gold" />
          <h3 className="text-2xl font-serif text-white italic">Recordatário da Alma</h3>
        </div>

        <div className="space-y-4">
          {sortedLogs.slice().reverse().map((log, idx) => (
            <motion.div 
              key={log.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-mystic p-6 rounded-[2.5rem] border border-white/5 space-y-4 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-aura-gold uppercase tracking-widest">
                    {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                  </p>
                  <h4 className="text-white font-serif text-lg italic">
                    {log.reflection ? (log.reflection.length > 60 ? log.reflection.substring(0, 60) + '...' : log.reflection) : "Silêncio Sagrado"}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-aura-teal/10 rounded-lg border border-aura-teal/20">
                    <Zap size={10} className="text-aura-teal" />
                    <span className="text-[10px] font-bold text-white">{log.energyLevel}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-aura-violet/10 rounded-lg border border-aura-violet/20">
                    <Eye size={10} className="text-aura-violet" />
                    <span className="text-[10px] font-bold text-white">{log.awarenessLevel}</span>
                  </div>
                </div>
              </div>

              {log.synchronicities && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Sincronicidade</p>
                  <p className="text-[11px] text-ethereal-300 italic leading-relaxed">{log.synchronicities}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex gap-1">
                   {Object.entries(log.completedActions)
                     .filter(([key, val]) => val && !['journaling', 'alignmentConfirmed'].includes(key))
                     .slice(0, 5)
                     .map(([key]) => (
                       <div key={key} className="w-1.5 h-1.5 rounded-full bg-aura-emerald/40" />
                     ))
                   }
                </div>
                <button className="text-[9px] font-black text-white/20 uppercase tracking-widest group-hover:text-white transition-colors flex items-center gap-1">
                  Ver Detalhes <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journey Summary */}
      <section className="glass-mystic p-10 rounded-[4rem] border border-magic-gold/20 bg-gradient-to-br from-magic-gold/5 to-transparent space-y-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
        <div className="w-16 h-16 bg-magic-gold/10 rounded-full flex items-center justify-center mx-auto text-magic-gold border border-magic-gold/20 mb-4">
          <Star size={32} className="animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-serif text-white italic">Resumo da Senda</h3>
          <p className="text-xs text-ethereal-300 italic px-4">
            Você já percorreu {stats?.daysCount} dias desta jornada sagrada. Cada rito realizado é uma semente de luz plantada em seu ser.
          </p>
        </div>
        <div className="pt-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
            <ArrowUpRight size={16} className="text-aura-emerald" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {stats?.totalRituals} Ritos Ancorados
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EvolutionReport;
