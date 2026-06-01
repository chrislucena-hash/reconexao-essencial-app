
import React, { useEffect, useState, useMemo } from 'react';
import { analyzeSoulJourney, generateDailyContent } from '../services/geminiService';
import { DailyLog, UserProfile, AppView, DailyContent } from '../types';
import { RITUALS, INITIAL_JOURNEY } from '../constants.tsx';
import { 
  Sparkles as SparklesIcon, 
  Star as StarIcon, 
  Compass as CompassIcon,
  Zap,
  Target,
  Calendar,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile;
  logs: DailyLog[];
  onToggleGoal: (goalKey: keyof DailyLog['completedActions']) => void;
  setView: (view: AppView) => void;
  preview?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, logs, onToggleGoal, setView, preview = false }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);

  const currentSenda = useMemo(() => {
    const hasToday = logs.some(l => l.date === todayStr);
    return hasToday ? logs.length : logs.length + 1;
  }, [logs, todayStr]);

  const [journeyDay, setJourneyDay] = useState(1);
  const [journeyPercent, setJourneyPercent] = useState(0);
  const [journeyTitle, setJourneyTitle] = useState("");
  const [journeyTask, setJourneyTask] = useState("");

  useEffect(() => {
    if (preview) {
      setJourneyDay(7);
      setJourneyPercent(29);
      setJourneyTitle(INITIAL_JOURNEY[6].title);
      setJourneyTask(INITIAL_JOURNEY[6].task);
      return;
    }

    const saved = localStorage.getItem('soul_journey_progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setJourneyDay(progress.currentDay);
        const completed = progress.days.filter((d: any) => d.completed).length;
        setJourneyPercent(Math.round((completed / 21) * 100));
        
        const currentDayData = INITIAL_JOURNEY.find(d => d.day === progress.currentDay);
        if (currentDayData) {
          setJourneyTitle(currentDayData.title);
          setJourneyTask(currentDayData.task);
        }
      } catch (e) {}
    } else {
      setJourneyTitle(INITIAL_JOURNEY[0].title);
      setJourneyTask(INITIAL_JOURNEY[0].task);
    }
  }, [preview]);

  useEffect(() => {
    if (preview) {
      return;
    }

    const fetchContent = async () => {
      setLoadingContent(true);
      const content = await generateDailyContent();
      setDailyContent(content);
      setLoadingContent(false);
    };
    fetchContent();
  }, [preview]);

  const todaysGoals = useMemo(() => {
    const activityMap: Record<string, string> = {
      walk: 'Caminhada',
      yoga: 'Yoga',
      stretch: 'Alongamento',
      dance: 'Dança',
      taichi: 'Tai Chi',
      swim: 'Natação',
      garden: 'Jardinagem',
      bike: 'Ciclismo'
    };

    const favoriteNames = userProfile.favoriteActivities
      ?.map(id => activityMap[id])
      .filter(Boolean)
      .join(', ');

    const movementDesc = favoriteNames 
      ? `Praticar: ${favoriteNames}. Observando cada ato, praticando a presença.` 
      : 'Movimentar o corpo com amor e leveza, observando cada ato e praticando a presença.';

    return RITUALS.map(ritual => {
      if (ritual.id === 'movement') {
        return { ...ritual, desc: movementDesc };
      }
      return ritual;
    });
  }, [userProfile.favoriteActivities]);

  const totalGoals = todaysGoals.length + 2; // 8 Rituals + 1 Journey Task + 1 Daily Challenge = 10
  const completedCount = todaysGoals.filter(g => todayLog?.completedActions[g.id as keyof DailyLog['completedActions']]).length 
    + (todayLog?.completedActions.journeyTask ? 1 : 0)
    + (todayLog?.completedActions.dailyChallenge ? 1 : 0);

  const isAlignmentConfirmed = todayLog?.completedActions.alignmentConfirmed;
  const allTasksDone = completedCount >= totalGoals;

  useEffect(() => {
    if (preview) {
      return;
    }

    const fetchInsight = async () => {
      if (logs.length >= 2 && !insight) {
        setLoadingInsight(true);
        const result = await analyzeSoulJourney(logs);
        setInsight(result);
        setLoadingInsight(false);
      }
    };
    fetchInsight();
  }, [logs, insight, preview]);

  return (
    <div className="store-page navigated-screen p-4 sm:p-6 pb-40 max-w-2xl mx-auto space-y-12 animate-in fade-in relative">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <p className="text-aura-gold font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Portal do Início</p>
          <h2 className="text-5xl font-serif text-white leading-none italic font-black">Olá, {userProfile.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView(AppView.SETTINGS)}
            className="glass-mystic text-white p-3 rounded-full border border-white/20 shadow-xl hover:bg-white/10 transition-all"
          >
            <SettingsIcon size={18} />
          </button>
          <div className="glass-mystic text-white px-5 py-3 rounded-full flex items-center gap-3 border border-white/20 shadow-xl iridescent-border">
            <StarIcon size={16} className="text-aura-gold fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Senda {currentSenda}</span>
          </div>
        </div>
      </header>

      {/* Resumo da Jornada */}
      <section 
        onClick={() => setView(AppView.EVOLUTION)}
        className="glass-mystic p-6 rounded-[2.5rem] border border-magic-gold/30 bg-gradient-to-r from-magic-gold/10 via-aura-violet/5 to-transparent flex items-center justify-between cursor-pointer hover:border-magic-gold/50 transition-all group shadow-[0_10px_40px_rgba(212,175,55,0.1)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-magic-gold/10 rounded-2xl flex items-center justify-center text-magic-gold border border-magic-gold/20">
            <CompassIcon size={24} className="group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-magic-gold uppercase tracking-widest">Progresso da Senda</p>
            <h4 className="text-white font-serif text-lg italic">Dia {journeyDay} de 21</h4>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">{journeyPercent}%</p>
            <div className="w-20 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-magic-gold" style={{ width: `${journeyPercent}%` }} />
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
        </div>
      </section>

      {/* Resumo do Dia - NOVO */}
      {todayLog && (
        <section className="glass-mystic p-8 rounded-[3rem] border border-aura-teal/30 space-y-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-aura-teal/10 via-transparent to-aura-violet/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-aura-teal/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-aura-violet/10 blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-aura-teal/10 rounded-xl text-aura-teal">
                <Calendar size={18} />
              </div>
              <h3 className="text-xl font-serif text-white italic">Resumo do Dia</h3>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-aura-teal/10 rounded-full border border-aura-teal/20 text-[9px] font-bold text-aura-teal uppercase">
                Energia: {todayLog.energyLevel}/5
              </div>
              <div className="px-3 py-1 bg-aura-violet/10 rounded-full border border-aura-violet/20 text-[9px] font-bold text-aura-violet uppercase">
                Presença: {todayLog.awarenessLevel}/5
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {todayLog.reflection && (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Reflexão</p>
                <p className="text-xs text-ethereal-200 italic leading-relaxed line-clamp-2">{todayLog.reflection}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(todayLog.completedActions)
                .filter(([key, val]) => val && !['journaling', 'alignmentConfirmed'].includes(key))
                .map(([key]) => (
                  <span key={key} className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-black text-white/40 uppercase tracking-tighter">
                    {key === 'purification' ? 'Purificação' : 
                     key === 'nourishment' ? 'Nutrição' : 
                     key === 'nature' ? 'Natureza' : 
                     key === 'presence' ? 'Presença' : 
                     key === 'shadowWork' ? 'Sombra' : 
                     key === 'study' ? 'Estudo' : 
                     key === 'gratitude' ? 'Gratidão' : key}
                  </span>
                ))
              }
            </div>
          </div>
        </section>
      )}

      {/* Gráfico e Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="relative flex flex-col items-center justify-center p-10 glass-mystic rounded-[4rem] iridescent-border bg-gradient-to-br from-aura-violet/10 via-aura-indigo/5 to-aura-teal/10 shadow-[0_20px_60px_rgba(139,92,246,0.15)] overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors" />
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-aura-violet/30 blur-[70px] rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-aura-teal/20 blur-[90px] rounded-full animate-pulse" style={{ animationDelay: '-2s' }} />
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="42" 
                fill="none" 
                stroke="url(#progressGrad)" 
                strokeWidth="8" 
                strokeDasharray="264" 
                strokeDashoffset={264 - (264 * completedCount / totalGoals)}
                strokeLinecap="round"
                className="transition-all duration-[2000ms] ease-out"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-5xl font-serif font-black transition-colors duration-1000 ${isAlignmentConfirmed ? 'text-aura-teal' : 'text-white'}`}>
                {completedCount}
              </span>
              <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">
                {isAlignmentConfirmed ? "Concluídos" : "Planejados"}
              </span>
            </div>
          </div>
          <div className="mt-8 text-center relative z-10">
             <p className={`text-[11px] font-black uppercase tracking-[0.4em] transition-colors duration-1000 ${isAlignmentConfirmed ? 'text-aura-teal' : 'text-aura-violet'}`}>
               {isAlignmentConfirmed ? "Dia Concluído em Luz" : "Alinhamento Vibracional"}
             </p>
          </div>
        </section>

        <section className="glass-mystic rounded-[4rem] p-10 flex flex-col justify-center items-center text-center space-y-6 border border-white/15 bg-gradient-to-tr from-aura-indigo/15 via-aura-violet/10 to-aura-rose/5 relative overflow-hidden group shadow-[0_20px_60px_rgba(99,102,241,0.15)]">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform duration-1000">
            <CompassIcon size={80} className="text-white" />
          </div>
          <div className="absolute bottom-0 left-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <SparklesIcon size={60} className="text-aura-rose" />
          </div>
          <CompassIcon size={32} className="text-aura-violet animate-spin-slow" />
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-aura-violet">O Oráculo Diz</h3>
            <p className="text-lg text-white font-serif italic leading-relaxed">
              {loadingInsight ? "Sintonizando..." : insight ? `"${insight}"` : "Sua jornada de autocura é um farol para sua alma."}
            </p>
          </div>
        </section>
      </div>

      {/* Ritos de Hoje (Checklist) */}
      <section className="space-y-8">
        <div className="px-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-serif text-white italic font-bold">Ritos de Hoje</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent ml-6" />
          </div>
          <p className="text-[10px] text-aura-gold/60 font-black uppercase tracking-widest">
            Práticas fundamentais para ancorar sua luz no agora ({completedCount}/{totalGoals}).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 px-2">
          {/* Missão da Senda */}
          <button 
            onClick={() => onToggleGoal('journeyTask')}
            className={`group relative p-8 rounded-[3rem] flex items-center gap-6 border transition-all duration-700 text-left overflow-hidden ${
              todayLog?.completedActions.journeyTask 
                ? 'bg-white/10 border-white/30 shadow-2xl' 
                : 'glass-mystic border-white/5 hover:border-white/20'
            }`}
          >
            {todayLog?.completedActions.journeyTask && <div className="absolute inset-0 bg-magic-gold/10 opacity-20 blur-2xl" />}
            <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${
              todayLog?.completedActions.journeyTask 
                ? 'bg-magic-gold/20 text-magic-gold scale-110 shadow-lg' 
                : 'bg-white/5 text-white/30 group-hover:text-white/60'
            }`}>
              <CompassIcon size={28} />
            </div>
            <div className="relative flex-1">
              <span className={`font-black text-base uppercase tracking-widest block transition-colors duration-500 ${
                todayLog?.completedActions.journeyTask ? 'text-white' : 'text-white/60 group-hover:text-white'
              }`}>
                Missão da Senda (Dia {journeyDay})
              </span>
              <span className="text-[10px] text-white/40 leading-relaxed block mt-1.5 font-medium tracking-wide">
                {journeyTask}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
              todayLog?.completedActions.journeyTask ? 'bg-magic-gold border-magic-gold scale-110' : 'border-white/10 group-hover:border-white/30'
            }`}>
              {todayLog?.completedActions.journeyTask && <SparklesIcon size={14} className="text-nature-950" />}
            </div>
          </button>

          {/* Desafio de Presença */}
          <button 
            onClick={() => onToggleGoal('dailyChallenge')}
            className={`group relative p-8 rounded-[3rem] flex items-center gap-6 border transition-all duration-700 text-left overflow-hidden ${
              todayLog?.completedActions.dailyChallenge 
                ? 'bg-white/10 border-white/30 shadow-2xl' 
                : 'glass-mystic border-white/5 hover:border-white/20'
            }`}
          >
            {todayLog?.completedActions.dailyChallenge && <div className="absolute inset-0 bg-aura-emerald/10 opacity-20 blur-2xl" />}
            <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${
              todayLog?.completedActions.dailyChallenge 
                ? 'bg-aura-emerald/20 text-aura-emerald scale-110 shadow-lg' 
                : 'bg-white/5 text-white/30 group-hover:text-white/60'
            }`}>
              <Zap size={28} />
            </div>
            <div className="relative flex-1">
              <span className={`font-black text-base uppercase tracking-widest block transition-colors duration-500 ${
                todayLog?.completedActions.dailyChallenge ? 'text-white' : 'text-white/60 group-hover:text-white'
              }`}>
                Desafio de Presença
              </span>
              <span className="text-[10px] text-white/40 leading-relaxed block mt-1.5 font-medium tracking-wide">
                {loadingContent ? "Sintonizando desafio..." : dailyContent?.dailyChallenge}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
              todayLog?.completedActions.dailyChallenge ? 'bg-aura-emerald border-aura-emerald scale-110' : 'border-white/10 group-hover:border-white/30'
            }`}>
              {todayLog?.completedActions.dailyChallenge && <SparklesIcon size={14} className="text-white" />}
            </div>
          </button>

          {todaysGoals.map((goal) => (
            <button 
              key={goal.id}
              onClick={() => onToggleGoal(goal.id as any)}
              className={`group relative p-8 rounded-[3rem] flex items-center gap-6 border transition-all duration-700 text-left overflow-hidden ${
                todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] 
                  ? 'bg-white/10 border-white/30 shadow-2xl' 
                  : 'glass-mystic border-white/5 hover:border-white/20'
              }`}
            >
              {todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] && (
                <div className={`absolute inset-0 ${goal.bg} opacity-20 blur-2xl`} />
              )}
              
              <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${
                todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] 
                  ? `${goal.bg} ${goal.color} scale-110 shadow-lg` 
                  : 'bg-white/5 text-white/30 group-hover:text-white/60'
              }`}>
                <goal.icon size={28} />
              </div>
              
              <div className="relative flex-1">
                <span className={`font-black text-base uppercase tracking-widest block transition-colors duration-500 ${
                  todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] ? 'text-white' : 'text-white/60 group-hover:text-white'
                }`}>
                  {goal.label}
                </span>
                <span className="text-[10px] text-white/40 leading-relaxed block mt-1.5 font-medium tracking-wide">
                  {goal.desc}
                </span>
              </div>

              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
                todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] 
                  ? 'bg-aura-emerald border-aura-emerald scale-110 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                  : 'border-white/10 group-hover:border-white/30'
              }`}>
                {todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] && (
                  <SparklesIcon size={14} className="text-white" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Alinhamento Vibracional Final (Selo do Dia) */}
        <button 
          onClick={() => {
            if (!isAlignmentConfirmed) {
              setShowConfirmation(true);
            }
          }}
          disabled={isAlignmentConfirmed}
          className={`group relative p-8 rounded-[3rem] flex items-center gap-6 border transition-all duration-700 text-left overflow-hidden ${
            isAlignmentConfirmed 
              ? 'bg-white/10 border-white/30 shadow-2xl' 
              : 'bg-aura-violet/10 border-aura-violet/30 hover:bg-aura-violet/20'
          }`}
        >
          {isAlignmentConfirmed && <div className="absolute inset-0 bg-aura-teal/10 opacity-20 blur-2xl" />}
          <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${
            isAlignmentConfirmed 
              ? 'bg-aura-teal/20 text-aura-teal scale-110 shadow-lg' 
              : 'bg-aura-violet text-white animate-pulse'
          }`}>
            <StarIcon size={28} className={isAlignmentConfirmed ? 'fill-current' : ''} />
          </div>
          <div className="relative flex-1">
            <span className={`font-black text-base uppercase tracking-widest block transition-colors duration-500 ${
              isAlignmentConfirmed ? 'text-white' : 'text-white/60 group-hover:text-white'
            }`}>
              Alinhamento Vibracional Final
            </span>
            <span className="text-[10px] text-white/40 leading-relaxed block mt-1.5 font-medium tracking-wide">
              {isAlignmentConfirmed ? "Dia Selado em Luz" : "Selar o dia em luz e consciência"}
            </span>
          </div>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
            isAlignmentConfirmed ? 'bg-aura-teal border-aura-teal scale-110' : 'border-white/10 group-hover:border-white/30'
          }`}>
            {isAlignmentConfirmed && <SparklesIcon size={14} className="text-white" />}
          </div>
        </button>

        {/* Botão de Alinhamento Final Removido daqui e movido para o Planejamento */}

        {isAlignmentConfirmed && (
          <div className="px-2 pt-8 animate-in zoom-in duration-1000">
            <div className="w-full p-12 rounded-[4rem] glass-mystic border border-aura-teal/30 bg-aura-teal/5 flex flex-col items-center justify-center gap-6 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-aura-teal/5 animate-pulse" />
              <div className="w-24 h-24 bg-aura-teal rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                <StarIcon size={40} className="fill-current" />
              </div>
              <div className="space-y-3">
                <h4 className="text-3xl font-serif text-white italic">Dia Selado em Luz</h4>
                <p className="text-xs text-ethereal-300 italic leading-relaxed px-8">
                  Sua alma está em harmonia com o cosmos. Descanse no silêncio da sua essência e prepare-se para o novo amanhecer.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-aura-teal uppercase tracking-[0.5em] mt-4">
                <SparklesIcon size={14} />
                Gratidão Infinita
                <SparklesIcon size={14} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modal de Confirmação de Alinhamento */}
      {showConfirmation && (
        <div className="safe-overlay fixed inset-0 z-[100] bg-ethereal-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="glass-mystic border border-white/10 w-full max-w-md rounded-[3rem] p-10 flex flex-col items-center text-center space-y-8 shadow-2xl animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-aura-violet/20 rounded-full flex items-center justify-center text-aura-violet shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <StarIcon size={36} className="animate-spin-slow" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-serif text-white italic">Selo de Alinhamento</h3>
              <p className="text-sm text-ethereal-300 italic leading-relaxed">
                Você confirma que realizou o alinhamento vibracional e está pronto para selar este dia em luz e consciência?
              </p>
            </div>
            <div className="flex flex-col w-full gap-4">
              <button 
                onClick={() => {
                  onToggleGoal('alignmentConfirmed');
                  setShowConfirmation(false);
                }}
                className="w-full py-5 bg-aura-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Sim, estou alinhado
              </button>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="w-full py-5 bg-white/5 text-ethereal-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all"
              >
                Ainda não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
