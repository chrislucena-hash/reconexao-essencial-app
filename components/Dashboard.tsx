
import React, { useEffect, useState, useMemo } from 'react';
import { analyzeSoulJourney, generateDailyContent } from '../services/geminiService';
import { DailyLog, UserProfile, AppView, DailyContent, JourneyProgress } from '../types';
import { RITUALS, INITIAL_JOURNEY } from '../constants.tsx';
import NextStepGuide from './NextStepGuide';
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
  journeyProgress: JourneyProgress;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, logs, onToggleGoal, setView, journeyProgress }) => {
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

  const journeyDay = journeyProgress.currentDay;
  const journeyPercent = useMemo(() => {
    const completed = journeyProgress.days.filter((d: any) => d.completed).length;
    return Math.round((completed / 21) * 100);
  }, [journeyProgress]);

  const journeyTitle = useMemo(() => {
    const currentDayData = INITIAL_JOURNEY.find(d => d.day === journeyProgress.currentDay);
    return currentDayData ? currentDayData.title : INITIAL_JOURNEY[0].title;
  }, [journeyProgress]);

  const journeyTask = useMemo(() => {
    const currentDayData = INITIAL_JOURNEY.find(d => d.day === journeyProgress.currentDay);
    return currentDayData ? currentDayData.task : INITIAL_JOURNEY[0].task;
  }, [journeyProgress]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoadingContent(true);
      const content = await generateDailyContent();
      setDailyContent(content);
      setLoadingContent(false);
    };
    fetchContent();
  }, []);

  const todaysGoals = useMemo(() => {
    return RITUALS;
  }, []);

  const totalGoals = todaysGoals.length + 2; // 8 Rituals + 1 Journey Task + 1 Daily Challenge = 10
  const completedCount = todaysGoals.filter(g => todayLog?.completedActions[g.id as keyof DailyLog['completedActions']]).length 
    + (todayLog?.completedActions.journeyTask ? 1 : 0)
    + (todayLog?.completedActions.dailyChallenge ? 1 : 0);

  const isAlignmentConfirmed = todayLog?.completedActions.alignmentConfirmed;
  const allTasksDone = completedCount >= totalGoals;

  useEffect(() => {
    const fetchInsight = async () => {
      if (logs.length >= 2 && !insight) {
        setLoadingInsight(true);
        const result = await analyzeSoulJourney(logs);
        setInsight(result);
        setLoadingInsight(false);
      }
    };
    fetchInsight();
  }, [logs]);

  return (
    <div className="p-2 sm:p-6 pb-24 sm:pb-32 max-w-2xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in relative w-full">
      <header className="flex justify-between items-end gap-2">
        <div className="space-y-1 sm:space-y-2">
          <p className="text-[#E9B44C] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em]">Portal do Início</p>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#18245C] leading-tight italic font-black">Olá, {userProfile.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView(AppView.SETTINGS)}
            className="glass-mystic text-[#18245C] p-3 rounded-full border border-[#18245C]/10 shadow-sm hover:bg-[#18245C]/5 transition-all"
          >
            <SettingsIcon size={18} />
          </button>
          <div className="glass-mystic text-[#18245C] px-5 py-3 rounded-full flex items-center gap-3 border border-[#18245C]/10 shadow-sm">
            <StarIcon size={16} className="text-[#E9B44C] fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#18245C]">Senda {currentSenda}</span>
          </div>
        </div>
      </header>

      {/* Resumo da Jornada */}
      <section 
        onClick={() => setView(AppView.EVOLUTION)}
        className="glass-mystic p-6 rounded-[2.5rem] border border-[#E9B44C]/30 bg-gradient-to-r from-[#E9B44C]/10 via-[#A268D7]/5 to-transparent flex items-center justify-between cursor-pointer hover:border-[#E9B44C]/50 transition-all group shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E9B44C]/10 rounded-2xl flex items-center justify-center text-[#E9B44C] border border-[#E9B44C]/20">
            <CompassIcon size={24} className="group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[#E9B44C] uppercase tracking-widest">Progresso da Senda</p>
            <h4 className="text-[#18245C] font-serif text-lg italic">Dia {journeyDay} de 21</h4>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-black text-[#18245C] uppercase tracking-widest">{journeyPercent}%</p>
            <div className="w-20 h-1 bg-[#18245C]/10 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#E9B44C]" style={{ width: `${journeyPercent}%` }} />
            </div>
          </div>
          <ChevronRight size={16} className="text-[#18245C]/40 group-hover:text-[#18245C] transition-colors" />
        </div>
      </section>

      {/* Teste do Corpo e da Alma */}
      <section 
        onClick={() => setView(AppView.DIAGNOSIS)}
        className="glass-mystic p-6 rounded-[2.5rem] border border-[#D87CB5]/30 bg-gradient-to-r from-[#D87CB5]/10 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:border-[#D87CB5]/50 transition-all group shadow-sm gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#D87CB5]/10 rounded-2xl flex items-center justify-center text-[#D87CB5] border border-[#D87CB5]/20 shrink-0">
            <SparklesIcon size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-[#D87CB5] uppercase tracking-widest flex items-center gap-1.5">
              <span>Autoexame Sagrado</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D87CB5]" />
            </p>
            <h4 className="text-[#18245C] font-serif text-lg italic leading-tight">Teste do Corpo e da Alma</h4>
            <p className="text-[11px] text-[#4A506B] italic leading-relaxed">
              Altamente recomendável realizar este teste <strong className="text-[#18245C]">a cada 21 dias</strong> para medir com precisão a evolução da sua vitalidade e expansão de consciência.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end sm:justify-start gap-1 text-xs font-black text-[#18245C]/60 group-hover:text-[#18245C] transition-colors uppercase tracking-widest shrink-0">
          <span>Iniciar</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </section>

      {/* Resumo do Dia */}
      {todayLog && (
        <section className="glass-mystic p-8 rounded-[3rem] border border-[#2E7D68]/30 space-y-6 shadow-sm relative overflow-hidden bg-gradient-to-br from-[#2E7D68]/5 via-transparent to-[#A268D7]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2E7D68]/10 rounded-xl text-[#2E7D68]">
                <Calendar size={18} />
              </div>
              <h3 className="text-xl font-serif text-[#18245C] italic">Resumo do Dia</h3>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-[#2E7D68]/10 rounded-full border border-[#2E7D68]/20 text-[9px] font-bold text-[#2E7D68] uppercase">
                Energia: {todayLog.energyLevel}/5
              </div>
              <div className="px-3 py-1 bg-[#A268D7]/10 rounded-full border border-[#A268D7]/20 text-[9px] font-bold text-[#A268D7] uppercase">
                Presença: {todayLog.awarenessLevel}/5
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {todayLog.reflection && (
              <div className="p-4 bg-[#18245C]/5 rounded-2xl border border-[#18245C]/5">
                <p className="text-[8px] font-black text-[#4A506B] uppercase tracking-widest mb-1">Reflexão</p>
                <p className="text-xs text-[#18245C] italic leading-relaxed line-clamp-2">{todayLog.reflection}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(todayLog.completedActions)
                .filter(([key, val]) => val && !['journaling', 'alignmentConfirmed'].includes(key))
                .map(([key]) => (
                  <span key={key} className="px-2 py-1 bg-[#18245C]/5 rounded-lg text-[8px] font-black text-[#18245C] uppercase tracking-tighter">
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
        <section className="relative flex flex-col items-center justify-center p-10 glass-mystic rounded-[4rem] border border-[#18245C]/10 bg-gradient-to-br from-[#A268D7]/10 via-[#18245C]/5 to-[#2E7D68]/10 shadow-sm overflow-hidden group">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(24,36,92,0.1)" strokeWidth="8" />
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
                  <stop offset="0%" stopColor="#A268D7" />
                  <stop offset="100%" stopColor="#2E7D68" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-5xl font-serif font-black transition-colors duration-1000 ${isAlignmentConfirmed ? 'text-[#2E7D68]' : 'text-[#18245C]'}`}>
                {completedCount}
              </span>
              <span className="text-[9px] font-black text-[#4A506B] uppercase tracking-[0.3em]">
                {isAlignmentConfirmed ? "Concluídos" : "Planejados"}
              </span>
            </div>
          </div>
          <div className="mt-8 text-center relative z-10">
             <p className={`text-[11px] font-black uppercase tracking-[0.4em] transition-colors duration-1000 ${isAlignmentConfirmed ? 'text-[#2E7D68]' : 'text-[#A268D7]'}`}>
               {isAlignmentConfirmed ? "Dia Concluído em Luz" : "Alinhamento Vibracional"}
             </p>
          </div>
        </section>

        <section className="glass-mystic rounded-[4rem] p-10 flex flex-col justify-center items-center text-center space-y-6 border border-[#18245C]/10 bg-gradient-to-tr from-[#18245C]/5 via-[#A268D7]/10 to-[#D87CB5]/5 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <CompassIcon size={80} className="text-[#18245C]" />
          </div>
          <CompassIcon size={32} className="text-[#A268D7]" />
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A268D7]">O Oráculo Diz</h3>
            <p className="text-lg text-[#18245C] font-serif italic leading-relaxed">
              {loadingInsight ? "Sintonizando..." : insight ? `"${insight}"` : "Sua jornada de autocura é um farol para sua alma."}
            </p>
          </div>
        </section>
      </div>

      {/* Ritos de Hoje (Checklist) */}
      <section className="space-y-8">
        <div className="px-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-serif text-[#18245C] italic font-bold">Ritos de Hoje</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-[#18245C]/20 to-transparent ml-6" />
          </div>
          <p className="text-[10px] text-[#E9B44C] font-black uppercase tracking-widest">
            Práticas que eu me comprometo a fazer hoje ({completedCount}/{totalGoals}).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 px-2">
          {/* Missão da Senda */}
          <button 
            onClick={() => onToggleGoal('journeyTask')}
            className={`group relative p-8 rounded-[3rem] flex items-center gap-6 border transition-all duration-300 text-left overflow-hidden ${
              todayLog?.completedActions.journeyTask 
                ? 'bg-[#E9B44C]/15 border-[#E9B44C]/40 shadow-sm' 
                : 'glass-mystic border-[#18245C]/10 hover:border-[#18245C]/20'
            }`}
          >
            <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-300 ${
              todayLog?.completedActions.journeyTask 
                ? 'bg-[#E9B44C] text-white scale-105 shadow-md' 
                : 'bg-[#18245C]/5 text-[#18245C]/60 group-hover:text-[#18245C]'
            }`}>
              <CompassIcon size={28} />
            </div>
            <div className="relative flex-1">
              <span className={`font-black text-base uppercase tracking-widest block transition-colors duration-300 ${
                todayLog?.completedActions.journeyTask ? 'text-[#18245C]' : 'text-[#18245C]/80 group-hover:text-[#18245C]'
              }`}>
                Missão da Senda (Dia {journeyDay})
              </span>
              <span className="text-xs text-[#4A506B] leading-relaxed block mt-1.5 font-medium tracking-wide">
                {journeyTask}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              todayLog?.completedActions.journeyTask ? 'bg-[#E9B44C] border-[#E9B44C] text-white scale-105' : 'border-[#18245C]/20 group-hover:border-[#18245C]/40'
            }`}>
              {todayLog?.completedActions.journeyTask && <SparklesIcon size={14} className="text-white" />}
            </div>
          </button>

          {/* Desafio de Presença */}
          <button 
            onClick={() => onToggleGoal('dailyChallenge')}
            className={`group relative p-8 rounded-[3rem] flex items-center gap-6 border transition-all duration-300 text-left overflow-hidden ${
              todayLog?.completedActions.dailyChallenge 
                ? 'bg-[#2E7D68]/15 border-[#2E7D68]/40 shadow-sm' 
                : 'glass-mystic border-[#18245C]/10 hover:border-[#18245C]/20'
            }`}
          >
            <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-300 ${
              todayLog?.completedActions.dailyChallenge 
                ? 'bg-[#2E7D68] text-white scale-105 shadow-md' 
                : 'bg-[#18245C]/5 text-[#18245C]/60 group-hover:text-[#18245C]'
            }`}>
              <Zap size={28} />
            </div>
            <div className="relative flex-1">
              <span className={`font-black text-base uppercase tracking-widest block transition-colors duration-300 ${
                todayLog?.completedActions.dailyChallenge ? 'text-[#18245C]' : 'text-[#18245C]/80 group-hover:text-[#18245C]'
              }`}>
                Desafio de Presença
              </span>
              <span className="text-xs text-[#4A506B] leading-relaxed block mt-1.5 font-medium tracking-wide">
                {loadingContent ? "Sintonizando desafio..." : dailyContent?.dailyChallenge}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              todayLog?.completedActions.dailyChallenge ? 'bg-[#2E7D68] border-[#2E7D68] text-white scale-105' : 'border-[#18245C]/20 group-hover:border-[#18245C]/40'
            }`}>
              {todayLog?.completedActions.dailyChallenge && <SparklesIcon size={14} className="text-white" />}
            </div>
          </button>

          {todaysGoals.map((goal) => (
            <button 
              key={goal.id}
              onClick={() => onToggleGoal(goal.id as any)}
              className={`group relative p-8 rounded-[3rem] flex items-center gap-6 border transition-all duration-300 text-left overflow-hidden ${
                todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] 
                  ? 'bg-[#A268D7]/15 border-[#A268D7]/40 shadow-sm' 
                  : 'glass-mystic border-[#18245C]/10 hover:border-[#18245C]/20'
              }`}
            >
              <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-300 ${
                todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] 
                  ? `bg-[#A268D7] text-white scale-105 shadow-md` 
                  : 'bg-[#18245C]/5 text-[#18245C]/60 group-hover:text-[#18245C]'
              }`}>
                <goal.icon size={28} />
              </div>
              
              <div className="relative flex-1">
                <span className={`font-black text-base uppercase tracking-widest block transition-colors duration-300 ${
                  todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] ? 'text-[#18245C]' : 'text-[#18245C]/80 group-hover:text-[#18245C]'
                }`}>
                  {goal.label}
                </span>
                <span className="text-xs text-[#4A506B] leading-relaxed block mt-1.5 font-medium tracking-wide">
                  {goal.desc}
                </span>
              </div>

              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                todayLog?.completedActions[goal.id as keyof DailyLog['completedActions']] 
                  ? 'bg-[#2E7D68] border-[#2E7D68] text-white scale-105' 
                  : 'border-[#18245C]/20 group-hover:border-[#18245C]/40'
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
          className={`group relative p-8 rounded-[3rem] flex items-center gap-6 border transition-all duration-300 text-left overflow-hidden ${
            isAlignmentConfirmed 
              ? 'bg-[#2E7D68]/15 border-[#2E7D68]/40 shadow-sm' 
              : 'bg-[#A268D7]/10 border-[#A268D7]/30 hover:bg-[#A268D7]/20'
          }`}
        >
          <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-300 ${
            isAlignmentConfirmed 
              ? 'bg-[#2E7D68] text-white scale-105 shadow-md' 
              : 'bg-[#A268D7] text-white'
          }`}>
            <StarIcon size={28} className={isAlignmentConfirmed ? 'fill-current' : ''} />
          </div>
          <div className="relative flex-1">
            <span className={`font-black text-base uppercase tracking-widest block transition-colors duration-300 ${
              isAlignmentConfirmed ? 'text-[#18245C]' : 'text-[#18245C]/80 group-hover:text-[#18245C]'
            }`}>
              Alinhamento Vibracional Final
            </span>
            <span className="text-xs text-[#4A506B] leading-relaxed block mt-1.5 font-medium tracking-wide">
              {isAlignmentConfirmed ? "Dia Selado em Luz" : "Selar o dia em luz e consciência"}
            </span>
          </div>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isAlignmentConfirmed ? 'bg-[#2E7D68] border-[#2E7D68] text-white scale-105' : 'border-[#18245C]/20 group-hover:border-[#18245C]/40'
          }`}>
            {isAlignmentConfirmed && <SparklesIcon size={14} className="text-white" />}
          </div>
        </button>

        {isAlignmentConfirmed && (
          <div className="px-2 pt-8 animate-in zoom-in duration-500">
            <div className="w-full p-12 rounded-[4rem] glass-mystic border border-[#2E7D68]/30 bg-[#2E7D68]/5 flex flex-col items-center justify-center gap-6 text-center shadow-sm relative overflow-hidden">
              <div className="w-24 h-24 bg-[#2E7D68] rounded-full flex items-center justify-center text-white shadow-md">
                <StarIcon size={40} className="fill-current" />
              </div>
              <div className="space-y-3">
                <h4 className="text-3xl font-serif text-[#18245C] italic">Dia Selado em Luz</h4>
                <p className="text-xs text-[#4A506B] italic leading-relaxed px-8">
                  Sua alma está em harmonia com o cosmos. Descanse no silêncio da sua essência e prepare-se para o novo amanhecer.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-[#2E7D68] uppercase tracking-[0.5em] mt-4">
                <SparklesIcon size={14} />
                Gratidão Infinita
                <SparklesIcon size={14} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Guia de Próxima Etapa para o Usuário */}
      <NextStepGuide 
        currentStepName="Portal do Início"
        stepNumber={1}
        totalSteps={7}
        nextStepName="Portal da Senda (21 Dias)"
        nextStepLabel="Avançar para a Senda"
        onNavigate={() => setView(AppView.JOURNEY)}
        message="Após concluir a checagem do Início, siga para o Portal da Senda para praticar a tarefa sagrada do dia."
      />

      {/* Modal de Confirmação de Alinhamento */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[100] bg-[#18245C]/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-mystic border border-[#18245C]/10 w-full max-w-md rounded-[3rem] p-10 flex flex-col items-center text-center space-y-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-[#A268D7]/20 rounded-full flex items-center justify-center text-[#A268D7]">
              <StarIcon size={36} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-serif text-[#18245C] italic">Selo de Alinhamento</h3>
              <p className="text-sm text-[#4A506B] italic leading-relaxed">
                Você confirma que realizou o alinhamento vibracional e está pronto para selar este dia em luz e consciência?
              </p>
            </div>
            <div className="flex flex-col w-full gap-4">
              <button 
                onClick={() => {
                  onToggleGoal('alignmentConfirmed');
                  setShowConfirmation(false);
                }}
                className="w-full py-5 bg-[#2E7D68] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Sim, estou alinhado
              </button>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="w-full py-5 bg-[#18245C]/5 text-[#18245C] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#18245C]/10 transition-all"
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
