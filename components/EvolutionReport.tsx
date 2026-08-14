
import React, { useMemo } from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
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
import { DailyLog, UserProfile, JourneyProgress, AppView } from '../types';
import { motion } from 'framer-motion';
import NextStepGuide from './NextStepGuide';

interface EvolutionReportProps {
  logs: DailyLog[];
  userProfile: UserProfile;
  setView?: (view: AppView) => void;
}

const EvolutionReport: React.FC<EvolutionReportProps> = ({ logs, userProfile, setView }) => {
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs]);

  const chartData = useMemo(() => {
    const dataPoints: Array<{
      date: string;
      rawDate: string;
      energy: number;
      awareness: number;
      symptoms: number;
      vibration: number;
      type: 'log' | 'diagnosis';
    }> = [];

    const latestDiag = userProfile.diagnosisHistory && userProfile.diagnosisHistory.length > 0
      ? userProfile.diagnosisHistory[0] // diagnosisHistory is descending chronologically in App state, or ascending
      : null;

    // Get overall latest diagnosis symptom count
    const sortedDiags = userProfile.diagnosisHistory
      ? [...userProfile.diagnosisHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];
    const currentDiag = sortedDiags.length > 0 ? sortedDiags[sortedDiags.length - 1] : null;
    const currentSymptomsCount = currentDiag
      ? (currentDiag.glutenCount || 0) + (currentDiag.caseinCount || 0) + (currentDiag.lactoseCount || 0) + (currentDiag.spiritualCount || 0)
      : 0;

    // 1. Adicionar pontos do histórico de diagnóstico (Teste do Corpo e da Alma)
    if (userProfile.diagnosisHistory && userProfile.diagnosisHistory.length > 0) {
      userProfile.diagnosisHistory.forEach(diag => {
        const bodyMarked = (diag.glutenCount || 0) + (diag.caseinCount || 0) + (diag.lactoseCount || 0);
        const spiritMarked = diag.spiritualCount || 0;
        const totalSymptoms = bodyMarked + spiritMarked;
        
        // Boost por práticas ativas
        const practiceBoost = Math.min(1.0, (diag.favoriteActivities?.length || 0) * 0.15);

        // Total de sintomas físicos no teste: 17 gluten + 7 casein + 4 lactose = 28
        const baseEnergy = ((28 - bodyMarked) / 28) * 4 + 1;
        const computedEnergy = Math.max(1, Math.min(5, Math.round(baseEnergy + practiceBoost)));

        // Total de sintomas espirituais: 6
        const baseAwareness = ((6 - spiritMarked) / 6) * 4 + 1;
        const computedAwareness = Math.max(1, Math.min(5, Math.round(baseAwareness + practiceBoost)));

        // Densidade de sintomas na escala de 1 a 5
        const computedSymptoms = Number(Math.min(5, Math.max(1, Math.round((totalSymptoms / 34) * 4 + 1))).toFixed(1));

        const computedVibration = Number(((computedEnergy + computedAwareness) / 2).toFixed(1));

        dataPoints.push({
          date: new Date(diag.date.includes('T') ? diag.date : diag.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          rawDate: diag.date,
          energy: computedEnergy,
          awareness: computedAwareness,
          symptoms: computedSymptoms,
          vibration: computedVibration,
          type: 'diagnosis'
        });
      });
    }

    // 2. Adicionar pontos dos registros diários (considerando presença, práticas e carga de sintomas)
    sortedLogs.forEach(log => {
      const completedPracticesCount = Object.values(log.completedActions || {}).filter(Boolean).length;
      const practiceBoost = Math.min(1.2, (completedPracticesCount / 8) * 1.2);

      let foodSymptomPenalty = 0;
      if (log.foodRecord) {
        const foodStr = `${log.foodRecord.breakfast} ${log.foodRecord.lunch} ${log.foodRecord.dinner} ${log.foodRecord.snacks}`.toLowerCase();
        if (foodStr.includes('glúten') || foodStr.includes('leite') || foodStr.includes('lactose')) {
          foodSymptomPenalty += 0.5;
        }
      }
      
      // Aumento de sintomas reduz a densidade vital da energia
      const symptomDeduction = (currentSymptomsCount / 34) * 1.5 + foodSymptomPenalty;

      const adjustedEnergy = Math.max(1, Math.min(5, Math.round((log.energyLevel || 3) - symptomDeduction + practiceBoost)));
      const adjustedAwareness = Math.max(1, Math.min(5, Math.round((log.awarenessLevel || 3) - ((currentDiag?.spiritualCount || 0) / 6) * 0.8 + practiceBoost)));
      const adjustedSymptoms = Number(Math.min(5, Math.max(1, Math.round(((currentSymptomsCount / 34) * 4 + 1) + foodSymptomPenalty))).toFixed(1));
      const adjustedVibration = Number(((adjustedEnergy + adjustedAwareness) / 2).toFixed(1));

      dataPoints.push({
        date: new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        rawDate: log.date + 'T12:00:00', // Offset para ordenar corretamente
        energy: adjustedEnergy,
        awareness: adjustedAwareness,
        symptoms: adjustedSymptoms,
        vibration: adjustedVibration,
        type: 'log'
      });
    });

    // Ordenar cronologicamente
    return dataPoints.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
  }, [sortedLogs, userProfile.diagnosisHistory]);

  const currentVibration = useMemo(() => {
    if (chartData.length === 0) return null;
    const lastPoint = chartData[chartData.length - 1];
    const avg = lastPoint.vibration;
    if (avg >= 4.5) return { label: "Frequência Cristalina", color: "text-aura-teal" };
    if (avg >= 3.5) return { label: "Frequência Elevada", color: "text-aura-violet" };
    if (avg >= 2.5) return { label: "Frequência em Alinhamento", color: "text-aura-gold" };
    return { label: "Frequência em Purificação", color: "text-aura-rose" };
  }, [chartData]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const firstPoint = chartData[0];
    const lastPoint = chartData[chartData.length - 1];
    
    const energyDiff = lastPoint.energy - firstPoint.energy;
    const awarenessDiff = lastPoint.awareness - firstPoint.awareness;
    
    const totalRituals = logs.reduce((acc, log) => {
      const completed = Object.values(log.completedActions).filter(Boolean).length;
      return acc + completed;
    }, 0);

    return {
      energyDiff,
      awarenessDiff,
      currentEnergy: lastPoint.energy,
      currentAwareness: lastPoint.awareness,
      totalRituals,
      daysCount: logs.length
    };
  }, [chartData, logs]);

  const sortedDiagnosis = useMemo(() => {
    if (!userProfile.diagnosisHistory) return [];
    return [...userProfile.diagnosisHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [userProfile.diagnosisHistory]);

  const symptomReduction = useMemo(() => {
    if (sortedDiagnosis.length === 0) return null;
    const firstDiag = sortedDiagnosis[0];
    const latestDiag = sortedDiagnosis[sortedDiagnosis.length - 1];
    
    const firstCount = (firstDiag.glutenCount || 0) + (firstDiag.caseinCount || 0) + (firstDiag.lactoseCount || 0) + (firstDiag.spiritualCount || 0);
    const latestCount = (latestDiag.glutenCount || 0) + (latestDiag.caseinCount || 0) + (latestDiag.lactoseCount || 0) + (latestDiag.spiritualCount || 0);
    
    const diff = latestCount - firstCount;
    const hasIncreased = latestCount > firstCount;
    const hasReduced = latestCount < firstCount;

    return {
      first: firstCount,
      latest: latestCount,
      diff,
      hasReduced,
      hasIncreased,
      percentChange: firstCount > 0 ? Math.round(((firstCount - latestCount) / firstCount) * 100) : 0
    };
  }, [sortedDiagnosis]);

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 bg-[#18245C]/5 rounded-full flex items-center justify-center mx-auto text-[#18245C]/30">
          <History size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-[#18245C] italic">O Livro está em branco</h3>
          <p className="text-sm text-[#4A506B] italic">Comece a registrar sua jornada no Diário ou realize o Teste do Corpo e da Alma para ver sua evolução florescer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-safe pb-safe-nav max-w-2xl mx-auto space-y-10 animate-in fade-in">
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-[#A268D7]">
          <TrendingUp size={20} className="animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Portal da Evolução</p>
        </div>
        <h2 className="text-4xl font-serif text-[#18245C] tracking-tighter italic leading-none">Sua Ascensão</h2>
      </header>

      {chartData.length === 0 ? (
        <div className="glass-mystic p-8 rounded-[3rem] border border-[#18245C]/10 space-y-4 text-center">
          <div className="w-12 h-12 bg-[#18245C]/5 rounded-full flex items-center justify-center mx-auto text-[#18245C]/30">
            <BookOpen size={24} />
          </div>
          <h4 className="text-[#18245C] font-serif text-lg italic">Diário em Branco</h4>
          <p className="text-xs text-[#4A506B] italic leading-relaxed">
            Comece a registrar sua jornada diária (nível de energia, presença e alimentação) no diário para gerar gráficos de fluxo vibracional, resumos de alquimia e acompanhar seus ritos sagrados.
          </p>
        </div>
      ) : (
        <>
          {logs.length === 0 && (
            <div className="glass-mystic p-6 rounded-[2.5rem] border border-[#E9B44C]/30 bg-[#E9B44C]/5 text-center space-y-2 mx-2">
              <Sparkles size={16} className="text-[#E9B44C] mx-auto animate-pulse" />
              <p className="text-sm font-serif text-[#18245C] italic font-bold">Seu ponto de partida está traçado!</p>
              <p className="text-xs text-[#4A506B] leading-relaxed max-w-sm mx-auto">
                As métricas abaixo e o gráfico de Fluxo Vibracional foram estimados com base no seu <strong className="text-[#18245C]">Teste do Corpo e da Alma</strong>. Registre seu dia no <strong className="text-[#18245C] font-semibold">Diário</strong> para acompanhar as oscilações diárias de sua energia e presença!
              </p>
            </div>
          )}
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-mystic p-6 rounded-[2.5rem] border border-[#2E7D68]/30 bg-gradient-to-br from-[#2E7D68]/10 to-transparent space-y-2 shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 text-[#2E7D68]">
                <Zap size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Vitalidade</span>
              </div>
              <div className="flex items-end justify-between w-full">
                <div className="flex items-end gap-1.5">
                  <span className="text-3xl font-serif text-[#18245C] italic font-bold">
                    {stats?.currentEnergy || 0}
                  </span>
                  <span className="text-[10px] text-[#4A506B] mb-1">/5</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
                  (stats?.energyDiff || 0) > 0 ? 'bg-[#2E7D68]/20 text-[#2E7D68]' : 
                  (stats?.energyDiff || 0) < 0 ? 'bg-rose-100 text-rose-700' : 
                  'bg-[#18245C]/5 text-[#4A506B]'
                }`}>
                  {(stats?.energyDiff || 0) > 0 ? `+${stats?.energyDiff}` : stats?.energyDiff || 0}
                </div>
              </div>
              <p className="text-[8px] text-[#4A506B] uppercase font-bold tracking-tighter">Estado Atual e Evolução</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-mystic p-6 rounded-[2.5rem] border border-[#A268D7]/30 bg-gradient-to-br from-[#A268D7]/10 to-transparent space-y-2 shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 text-[#A268D7]">
                <Eye size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Presença</span>
              </div>
              <div className="flex items-end justify-between w-full">
                <div className="flex items-end gap-1.5">
                  <span className="text-3xl font-serif text-[#18245C] italic font-bold">
                    {stats?.currentAwareness || 0}
                  </span>
                  <span className="text-[10px] text-[#4A506B] mb-1">/5</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
                  (stats?.awarenessDiff || 0) > 0 ? 'bg-[#2E7D68]/20 text-[#2E7D68]' : 
                  (stats?.awarenessDiff || 0) < 0 ? 'bg-rose-100 text-rose-700' : 
                  'bg-[#18245C]/5 text-[#4A506B]'
                }`}>
                  {(stats?.awarenessDiff || 0) > 0 ? `+${stats?.awarenessDiff}` : stats?.awarenessDiff || 0}
                </div>
              </div>
              <p className="text-[8px] text-[#4A506B] uppercase font-bold tracking-tighter">Estado Atual e Evolução</p>
            </motion.div>
          </div>

          {/* Sintomas e Sensibilidades do Templo */}
          <section className="glass-mystic p-8 rounded-[3rem] border border-rose-300/40 bg-gradient-to-br from-rose-50/50 via-transparent to-rose-50/20 space-y-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-700">
                <Activity size={18} />
              </div>
              <h3 className="text-xl font-serif text-[#18245C] italic font-bold">
                {symptomReduction?.hasIncreased ? "Mapeamento e Evolução de Sintomas" : "Redução de Sintomas"}
              </h3>
            </div>
            <p className="text-xs text-[#4A506B] italic leading-relaxed">
              {symptomReduction?.hasIncreased 
                ? "Identificado um aumento na manifestação dos sintomas do templo. O surgimento de novas sensibilidades reflete densidade temporária ou processo ativo de purificação. A constância nos ritos e no alimento puro restabelecerá o alinhamento."
                : "Acompanhe a diminuição da densidade e o aumento da sua frequência vibracional. Quanto mais alta sua energia e presença, menor a manifestação de sintomas de desequilíbrio."}
            </p>
            {symptomReduction ? (
              <div className="grid grid-cols-3 gap-4 pt-2 relative z-10">
                <div className="text-center space-y-1">
                  <p className="text-[8px] font-black text-[#18245C]/60 uppercase tracking-widest">Início</p>
                  <p className="text-lg font-serif text-[#18245C] italic font-bold">{symptomReduction.first} {symptomReduction.first === 1 ? 'sintoma' : 'sintomas'}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  {symptomReduction.percentChange > 0 ? (
                    <span className="text-[9px] font-bold text-[#2E7D68] uppercase tracking-widest">
                      -{symptomReduction.percentChange}% em Sintomas
                    </span>
                  ) : symptomReduction.percentChange < 0 ? (
                    <span className="text-[9px] font-bold text-rose-700 uppercase tracking-widest">
                      +{Math.abs(symptomReduction.percentChange)}% em Sintomas
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-[#4A506B] uppercase tracking-widest">
                      Estável
                    </span>
                  )}
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent my-1" />
                  <ChevronRight size={16} className="text-rose-600" />
                </div>
                <div className="text-center space-y-1">
                  <p className={`text-[8px] font-black uppercase tracking-widest ${symptomReduction.hasIncreased ? 'text-rose-700' : 'text-[#2E7D68]'}`}>
                    {symptomReduction.hasIncreased ? "Aumento Atual" : "Atual"}
                  </p>
                  <p className="text-lg font-serif text-[#18245C] italic font-bold">
                    {symptomReduction.latest} {symptomReduction.latest === 1 ? 'sintoma' : 'sintomas'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10 text-center">
                <p className="text-[10px] text-[#4A506B] italic">
                  Nenhum teste do corpo e da alma realizado ainda para mapear sintomas de desequilíbrio.
                </p>
              </div>
            )}
          </section>

          {/* Matriz Integrada de Evolução */}
          <section className="glass-mystic p-6 rounded-[2.5rem] border border-[#E9B44C]/30 bg-gradient-to-br from-[#E9B44C]/10 via-transparent to-transparent space-y-4">
            <div className="flex items-center gap-2 text-[#E9B44C]">
              <Sparkles size={16} />
              <h4 className="text-sm font-serif text-[#18245C] italic font-bold">Matriz de Evolução Consciente</h4>
            </div>
            <p className="text-xs text-[#4A506B] italic leading-relaxed">
              Sua evolução considera quatro pilares interdependentes. Se os sintomas aumentaram, a vitalidade pondera essa densidade temporária, enquanto seu grau de presença e os ritos praticados trabalham para restaurar o fluxo vibracional.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-rose-700">1. Sintomas do Templo</span>
                  <span className="text-[10px] font-bold text-[#18245C]">{symptomReduction ? `${symptomReduction.latest} identificados` : '0'}</span>
                </div>
                <p className="text-[9px] text-[#4A506B] italic">
                  {symptomReduction && symptomReduction.hasIncreased 
                    ? "Aumento de sintomas atua como indicador de densidade a transmutar."
                    : "Sintomas controlados promovem menor densidade biológica e espiritual."}
                </p>
              </div>

              <div className="p-3 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#2E7D68]">2. Vibração Vital</span>
                  <span className="text-[10px] font-bold text-[#18245C]">{stats?.currentEnergy || 3}/5</span>
                </div>
                <p className="text-[9px] text-[#4A506B] italic">
                  Energia recalibrada ponderando o peso dos sintomas e a purificação alimentar.
                </p>
              </div>

              <div className="p-3 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#A268D7]">3. Grau de Presença</span>
                  <span className="text-[10px] font-bold text-[#18245C]">{stats?.currentAwareness || 3}/5</span>
                </div>
                <p className="text-[9px] text-[#4A506B] italic">
                  Presença consciente e alinhamento do observador no aqui e agora.
                </p>
              </div>

              <div className="p-3 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#E9B44C]">4. Práticas Realizadas</span>
                  <span className="text-[10px] font-bold text-[#18245C]">{stats?.totalRituals || 0} ritos</span>
                </div>
                <p className="text-[9px] text-[#4A506B] italic">
                  Ritos ancorados que constroem a imunidade espiritual e a elevação vibracional.
                </p>
              </div>
            </div>
          </section>

          {/* Chart Section */}
          <section className="glass-mystic p-8 rounded-[3.5rem] border border-[#A268D7]/30 space-y-8 shadow-sm relative overflow-hidden bg-gradient-to-br from-[#A268D7]/10 via-transparent to-[#18245C]/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-serif text-[#18245C] italic tracking-tight font-bold">Fluxo Vibracional</h3>
                <p className="text-[9px] font-black text-[#A268D7] uppercase tracking-widest">Escala de Consciência (1 a 5)</p>
              </div>
              {currentVibration && (
                <div className={`px-4 py-2 rounded-full bg-[#18245C]/5 border border-[#18245C]/10 flex items-center gap-2 ${currentVibration.color}`}>
                  <Sparkles size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{currentVibration.label}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-6 px-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D68]" />
                <span className="text-[10px] font-black text-[#18245C] uppercase">Energia (Vitalidade)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A268D7]" />
                <span className="text-[10px] font-black text-[#18245C] uppercase">Presença (Consciência)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-black text-[#18245C] uppercase">Sintomas (Densidade)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E9B44C]" />
                <span className="text-[10px] font-black text-[#18245C] uppercase">Vibração (Média)</span>
              </div>
            </div>

            <div className="p-4 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10">
              <p className="text-[10px] text-[#4A506B] italic leading-relaxed">
                O Fluxo Vibracional é a síntese da sua jornada em uma escala de 1 (Densidade) a 5 (Sutileza). A linha dourada representa o seu estado de equilíbrio atual, a linha rosa tracejada monitora a densidade dos sintomas, integrando sua força vital e sua capacidade de estar presente no agora.
              </p>
            </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAwareness" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSymptoms" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(24,36,92,0.1)" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4A506B', fontSize: 10 }}
                dy={10}
              />
              <YAxis 
                domain={[0, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4A506B', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(247, 242, 236, 0.95)', 
                  border: '1px solid rgba(24, 36, 92, 0.2)',
                  borderRadius: '1rem',
                  fontSize: '10px',
                  color: '#18245C'
                }}
                itemStyle={{ color: '#18245C' }}
                formatter={(value: number, name: string) => {
                  const label = 
                    name === 'energy' ? 'Vitalidade (Energia)' : 
                    name === 'awareness' ? 'Presença (Consciência)' : 
                    name === 'symptoms' ? 'Sintomas (Densidade)' :
                    'Vibração (Média)';
                  return [`Nível ${value}`, label];
                }}
              />
              <Area 
                type="monotone" 
                dataKey="energy" 
                stroke="#10b981" 
                fillOpacity={0.05} 
                fill="url(#colorEnergy)" 
                strokeWidth={1}
              />
              <Area 
                type="monotone" 
                dataKey="awareness" 
                stroke="#8b5cf6" 
                fillOpacity={0.05} 
                fill="url(#colorAwareness)" 
                strokeWidth={1}
              />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 1.5 }}
              />
              <Line 
                type="monotone" 
                dataKey="awareness" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 1.5 }}
              />
              <Line 
                type="monotone" 
                dataKey="symptoms" 
                stroke="#f43f5e" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ fill: '#f43f5e', r: 3 }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 1.5 }}
              />
              <Line 
                type="monotone" 
                dataKey="vibration" 
                stroke="#d4af37" 
                strokeWidth={3.5} 
                dot={{ fill: '#d4af37', r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
        </>
      )}

      {/* Histórico dos Testes do Corpo e da Alma - NOVO */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <Sparkles size={20} className="text-[#E9B44C]" />
          <h3 className="text-2xl font-serif text-[#18245C] italic font-bold">Histórico de Alinhamento</h3>
        </div>

        {(!userProfile.diagnosisHistory || userProfile.diagnosisHistory.length === 0) ? (
          <div className="glass-mystic p-8 rounded-[3rem] border border-[#18245C]/10 space-y-4 text-center">
            <p className="text-xs text-[#4A506B] italic leading-relaxed">
              Nenhum ciclo de teste foi gravado ainda. Realize o <strong className="text-[#18245C]">Teste do Corpo e da Alma</strong> na página inicial para registrar seu ponto de partida e acompanhar sua evolução.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userProfile.diagnosisHistory.map((test, idx) => (
              <motion.div
                key={`test-${test.date}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-mystic p-6 rounded-[2.5rem] border border-[#E9B44C]/20 bg-gradient-to-br from-[#E9B44C]/5 via-transparent to-transparent space-y-4 relative overflow-hidden group shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-[#18245C]/10 pb-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[#E9B44C] uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={10} />
                      {new Date(test.date.includes('T') ? test.date : test.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <h4 className="text-[#18245C] font-serif text-md italic font-bold">Ciclo de Renovação Sagrada</h4>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-[#E9B44C]/10 border border-[#E9B44C]/20 flex flex-col items-center justify-center min-w-[70px]">
                    <span className="text-[7px] font-black text-[#E9B44C] uppercase tracking-widest leading-none">Vitalidade</span>
                    <span className="text-lg font-bold text-[#18245C] leading-none mt-1">{test.score}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10 space-y-3">
                    <p className="text-[8px] font-black text-[#E9B44C] uppercase tracking-widest flex items-center gap-1">
                      <Activity size={10} /> Sinais do Corpo (Sensibilidades)
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="p-1.5 bg-white/50 rounded-xl border border-[#18245C]/10">
                        <p className="text-[6px] font-bold text-[#4A506B] uppercase">Glúten</p>
                        <p className={`text-xs font-bold ${test.glutenCount > 0 ? 'text-rose-600' : 'text-[#2E7D68]'}`}>{test.glutenCount}</p>
                      </div>
                      <div className="p-1.5 bg-white/50 rounded-xl border border-[#18245C]/10">
                        <p className="text-[6px] font-bold text-[#4A506B] uppercase">Caseína</p>
                        <p className={`text-xs font-bold ${test.caseinCount > 0 ? 'text-rose-600' : 'text-[#2E7D68]'}`}>{test.caseinCount}</p>
                      </div>
                      <div className="p-1.5 bg-white/50 rounded-xl border border-[#18245C]/10">
                        <p className="text-[6px] font-bold text-[#4A506B] uppercase">Lactose</p>
                        <p className={`text-xs font-bold ${test.lactoseCount > 0 ? 'text-rose-600' : 'text-[#2E7D68]'}`}>{test.lactoseCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10 space-y-2 flex flex-col justify-between">
                    <p className="text-[8px] font-black text-[#A268D7] uppercase tracking-widest flex items-center gap-1">
                      <Eye size={10} /> Senda da Alma (Espírito)
                    </p>
                    <p className="text-[10px] text-[#4A506B] italic leading-snug">
                      {test.spiritualCount === 0 
                        ? 'Alinhamento cristalino alcançado.' 
                        : `Identificadas ${test.spiritualCount} áreas de resistência/sombra.`}
                    </p>
                  </div>
                </div>

                {test.favoriteActivities && test.favoriteActivities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#18245C]/10">
                    {test.favoriteActivities.map(actId => (
                      <span key={actId} className="px-2.5 py-1 rounded-full bg-[#2E7D68]/10 border border-[#2E7D68]/20 text-[8px] font-black uppercase text-[#2E7D68] tracking-wider">
                        {actId === 'walk' ? 'Caminhada Meditativa' : 
                         actId === 'yoga' ? 'Hatha Yoga Leve' : 
                         actId === 'swim' ? 'Natação Leve' : 
                         actId === 'garden' ? 'Jardinagem' : 
                         actId === 'bike' ? 'Ciclismo Lento' : actId}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {logs.length > 0 && (
        <>
          {/* Resumo da Alquimia Alimentar e Sintomas - NOVO */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Apple size={20} className="text-[#2E7D68]" />
              <h3 className="text-2xl font-serif text-[#18245C] italic font-bold">Resumo da Alquimia Alimentar</h3>
            </div>
            
            <div className="p-6 glass-mystic rounded-[2.5rem] border border-[#18245C]/10 space-y-4">
               <p className="text-xs text-[#4A506B] italic leading-relaxed">
                 Correlacione sua nutrição com sua vibração. Observe como a presença ou ausência de glúten, laticínios e açúcares impacta sua vitalidade e clareza mental. O descanso do templo (jejum) é essencial para a regeneração.
               </p>
               
               <div className="space-y-4 pt-2">
                 {sortedLogs.slice().reverse().filter(l => l.foodRecord).map((log) => (
                   <div key={`food-${log.date}`} className="p-5 bg-[#18245C]/5 rounded-3xl border border-[#18245C]/10 space-y-4">
                     <div className="flex justify-between items-center border-b border-[#18245C]/10 pb-2">
                       <span className="text-[9px] font-black text-[#E9B44C] uppercase tracking-widest">
                         {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                       </span>
                       <div className="flex gap-2">
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${log.energyLevel >= 4 ? 'bg-[#2E7D68]/20 text-[#2E7D68]' : 'bg-rose-100 text-rose-700'}`}>
                           Energia: {log.energyLevel}
                         </span>
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${log.awarenessLevel >= 4 ? 'bg-[#A268D7]/20 text-[#A268D7]' : 'bg-rose-100 text-rose-700'}`}>
                           Presença: {log.awarenessLevel}
                         </span>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-1">
                         <p className="text-[8px] font-black text-[#18245C]/50 uppercase tracking-tighter">Desjejum & Almoço</p>
                         <p className="text-[10px] text-[#18245C] italic">
                           {log.foodRecord?.breakfast || 'Não registrado'} • {log.foodRecord?.lunch || 'Não registrado'}
                         </p>
                       </div>
                       <div className="space-y-1">
                         <p className="text-[8px] font-black text-[#18245C]/50 uppercase tracking-tighter">Jantar & Lanches</p>
                         <p className="text-[10px] text-[#18245C] italic">
                           {log.foodRecord?.dinner || 'Não registrado'} • {log.foodRecord?.snacks || 'Não registrado'}
                         </p>
                       </div>
                     </div>

                     {log.foodRecord?.fastingHours && log.foodRecord.fastingHours > 0 && (
                       <div className="flex items-center gap-2 px-3 py-1 bg-[#A268D7]/10 rounded-lg border border-[#A268D7]/20">
                         <Moon size={10} className="text-[#A268D7]" />
                         <span className="text-[8px] font-bold text-[#A268D7] uppercase">Descanso do Templo: {log.foodRecord.fastingHours}h de Jejum</span>
                       </div>
                     )}
                     
                     {(log.foodRecord?.breakfast?.toLowerCase().includes('glúten') || 
                       log.foodRecord?.breakfast?.toLowerCase().includes('leite') ||
                       log.foodRecord?.lunch?.toLowerCase().includes('glúten') ||
                       log.foodRecord?.lunch?.toLowerCase().includes('leite') ||
                       log.foodRecord?.dinner?.toLowerCase().includes('glúten') ||
                       log.foodRecord?.dinner?.toLowerCase().includes('leite')) && (
                       <div className="flex items-center gap-2 px-3 py-1 bg-rose-100 rounded-lg border border-rose-200">
                         <Activity size={10} className="text-rose-700" />
                         <span className="text-[8px] font-bold text-rose-700 uppercase">Potencial Alérgeno Detectado</span>
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
              <History size={20} className="text-[#E9B44C]" />
              <h3 className="text-2xl font-serif text-[#18245C] italic font-bold">Recordatário da Alma</h3>
            </div>

            <div className="space-y-4">
              {sortedLogs.slice().reverse().map((log, idx) => (
                <motion.div 
                  key={log.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-mystic p-6 rounded-[2.5rem] border border-[#18245C]/10 space-y-4 relative overflow-hidden group shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-[#E9B44C] uppercase tracking-widest">
                        {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                      </p>
                      <h4 className="text-[#18245C] font-serif text-lg italic font-bold">
                        {log.reflection ? (log.reflection.length > 60 ? log.reflection.substring(0, 60) + '...' : log.reflection) : "Silêncio Sagrado"}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-[#2E7D68]/10 rounded-lg border border-[#2E7D68]/20">
                        <Zap size={10} className="text-[#2E7D68]" />
                        <span className="text-[10px] font-bold text-[#18245C]">{log.energyLevel}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-[#A268D7]/10 rounded-lg border border-[#A268D7]/20">
                        <Eye size={10} className="text-[#A268D7]" />
                        <span className="text-[10px] font-bold text-[#18245C]">{log.awarenessLevel}</span>
                      </div>
                    </div>
                  </div>

                  {log.synchronicities && (
                    <div className="p-4 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/10">
                      <p className="text-[8px] font-black text-[#5B8DE6] uppercase tracking-widest mb-1">Sincronicidade</p>
                      <p className="text-[11px] text-[#4A506B] italic leading-relaxed">{log.synchronicities}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#18245C]/10">
                    <div className="flex gap-1">
                       {Object.entries(log.completedActions)
                         .filter(([key, val]) => val && !['journaling', 'alignmentConfirmed'].includes(key))
                         .slice(0, 5)
                         .map(([key]) => (
                           <div key={key} className="w-2 h-2 rounded-full bg-[#2E7D68]" />
                         ))
                       }
                    </div>
                    <button className="text-[9px] font-black text-[#18245C]/60 uppercase tracking-widest group-hover:text-[#18245C] transition-colors flex items-center gap-1">
                      Ver Detalhes <ChevronRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Journey Summary */}
          <section className="glass-mystic p-10 rounded-[4rem] border border-[#E9B44C]/30 bg-gradient-to-br from-[#E9B44C]/10 to-transparent space-y-6 text-center relative overflow-hidden shadow-sm">
            <div className="w-16 h-16 bg-[#E9B44C]/10 rounded-full flex items-center justify-center mx-auto text-[#E9B44C] border border-[#E9B44C]/20 mb-4">
              <Star size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-serif text-[#18245C] italic font-bold">Resumo da Senda</h3>
              <p className="text-xs text-[#4A506B] italic px-4">
                Você já percorreu {stats?.daysCount} dias desta jornada sagrada. Cada rito realizado é uma semente de luz plantada em seu ser.
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#18245C]/5 rounded-full border border-[#18245C]/10">
                <ArrowUpRight size={16} className="text-[#2E7D68]" />
                <span className="text-[10px] font-black text-[#18245C] uppercase tracking-widest">
                  {stats?.totalRituals} Ritos Ancorados
                </span>
              </div>
            </div>
          </section>
        </>
      )}

      {setView && (
        <NextStepGuide 
          currentStepName="Portal da Evolução"
          stepNumber={6}
          totalSteps={7}
          nextStepName="Portal da Egrégora"
          nextStepLabel="Conectar na Egrégora de Luz"
          onNavigate={() => setView(AppView.COMMUNITY)}
          message="Sua evolução foi devidamente registrada! Compartilhe vibrações e inspirações com a egrégora da comunidade."
        />
      )}
    </div>
  );
};

export default EvolutionReport;
