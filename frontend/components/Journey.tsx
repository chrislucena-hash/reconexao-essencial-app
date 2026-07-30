
import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Zap, 
  Droplets, 
  Wind, 
  Activity, 
  Sun, 
  Moon, 
  Flame, 
  Shield, 
  Heart,
  Eye,
  Stars,
  Flower2,
  AlertTriangle
} from 'lucide-react';
import { JourneyDay, JourneyProgress } from '../types';
import { INITIAL_JOURNEY } from '../constants';

interface JourneyProps {
  progress: JourneyProgress;
  onUpdateProgress: (progress: JourneyProgress) => void;
  onResetJourney: () => void;
}

const Journey: React.FC<JourneyProps> = ({ progress, onUpdateProgress, onResetJourney }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleDay = (dayNum: number) => {
    const today = new Date().toISOString().split('T')[0];
    const dayToToggle = progress.days.find(d => d.day === dayNum);
    if (!dayToToggle) return;

    const isCompleting = !dayToToggle.completed;
    const updatedDays = progress.days.map(d => 
      d.day === dayNum ? { ...d, completed: isCompleting } : d
    );
    
    const firstUncompleted = updatedDays.find(d => !d.completed)?.day || 21;
    
    onUpdateProgress({
      ...progress,
      days: updatedDays,
      currentDay: firstUncompleted,
      lastCompletedDate: isCompleting ? today : progress.lastCompletedDate
    });
  };

  const resetJourney = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    onResetJourney();
  };

  const currentDayData = progress.days.find(d => d.day === progress.currentDay) || progress.days[0];
  const completedCount = progress.days.filter(d => d.completed).length;
  const progressPercent = Math.round((completedCount / 21) * 100);

  return (
    <div className="p-4 pt-safe pb-safe-nav max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-magic-gold">
          <Compass size={20} className="animate-spin-slow" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Portal da Senda</p>
        </div>
        <h2 className="text-4xl font-serif text-white tracking-tighter italic leading-none">21 Dias de Reconexão</h2>
        
        <div className="flex flex-col items-center gap-2 pt-4">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-magic-gold transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[9px] text-magic-gold font-black uppercase tracking-widest">
            {completedCount} de 21 Portais Ativados ({progressPercent}%)
          </p>
        </div>
      </header>

      {/* Current Day Card */}
      <div className="glass-mystic p-8 rounded-[3.5rem] border border-magic-gold/30 space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 bg-magic-gold/5 blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-magic-gold uppercase tracking-[0.3em]">Dia {currentDayData.day}</p>
            <h3 className="text-3xl font-serif text-white italic">{currentDayData.title}</h3>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <Sparkles className="text-magic-gold" size={24} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">O Ensinamento</p>
            <p className="text-sm text-ethereal-100 italic font-light leading-relaxed">
              {currentDayData.description}
            </p>
          </div>

          <div className="p-6 bg-nature-950/50 rounded-3xl border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-aura-emerald">
              <Zap size={14} />
              <p className="text-[9px] font-black uppercase tracking-widest">Ação Sagrada</p>
            </div>
            <p className="text-xs text-white font-medium leading-relaxed">
              {currentDayData.task}
            </p>
          </div>

          <div className="p-6 bg-aura-violet/10 rounded-3xl border border-aura-violet/20 space-y-3">
            <div className="flex items-center gap-2 text-aura-violet">
              <BookOpen size={14} />
              <p className="text-[9px] font-black uppercase tracking-widest">Reflexão da Alma</p>
            </div>
            <p className="text-xs text-ethereal-200 italic leading-relaxed">
              {currentDayData.reflection}
            </p>
          </div>
        </div>

        <button 
          onClick={() => toggleDay(currentDayData.day)}
          className={`w-full py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-xl ${
            currentDayData.completed 
            ? 'bg-aura-emerald/20 text-aura-emerald border border-aura-emerald/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-400/30' 
            : 'bg-white text-nature-950 hover:bg-magic-gold hover:text-white active:scale-95'
          }`}
        >
          {currentDayData.completed ? (
            <><CheckCircle2 size={18} /> PORTAL ATIVADO (CLIQUE PARA DESMARCAR)</>
          ) : (
            <>ATIVAR PORTAL DO DIA <ChevronRight size={18} /></>
          )}
        </button>
      </div>

      {/* Journey Map */}
      <div className="space-y-6">
        <h4 className="text-center text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Mapa da Ascensão</h4>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          {progress.days.map((day) => {
            const isCurrent = day.day === progress.currentDay;
            const isLocked = day.day > progress.currentDay;
            const isCompleted = day.completed;

            return (
              <button 
                key={day.day}
                onClick={() => toggleDay(day.day)}
                disabled={isLocked}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${
                  isCurrent 
                    ? 'bg-magic-gold/20 border-magic-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                    : isCompleted 
                    ? 'bg-aura-emerald/10 border-aura-emerald/30 text-aura-emerald hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-400/30' 
                    : isLocked
                    ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-white/10 border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                <span className="text-[10px] font-bold">{day.day}</span>
                {isCompleted ? <CheckCircle2 size={10} /> : isLocked ? <Lock size={10} /> : <Circle size={10} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-8 flex justify-center">
        <button 
          onClick={resetJourney}
          className="text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-rose-400 transition-colors"
        >
          Reiniciar Jornada de 21 Dias
        </button>
      </div>

      {/* Custom Reset Journey Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] bg-ethereal-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-mystic border border-rose-500/20 w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-white italic">Reiniciar Senda de 21 Dias?</h3>
              <p className="text-xs text-ethereal-300 leading-relaxed">
                Tem certeza de que deseja reiniciar sua senda? Todo o progresso obtido até agora e as práticas marcadas nesta jornada de 21 dias serão apagados permanentemente.
              </p>
            </div>

            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={confirmReset}
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-rose-600 transition-colors"
              >
                Sim, Reiniciar Senda
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="w-full bg-white/5 text-white/60 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journey;
