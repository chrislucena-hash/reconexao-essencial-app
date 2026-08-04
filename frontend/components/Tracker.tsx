
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  CalendarDays, 
  Edit3, 
  Sparkles, 
  Moon, 
  Heart, 
  Eye, 
  Ghost, 
  Zap, 
  CloudLightning, 
  Star, 
  Compass,
  Coffee,
  Activity,
  Sun,
  Apple,
  Droplets,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { DailyLog } from '../types';
import { RITUALS } from '../constants';

interface TrackerProps {
  onSaveLog: (log: DailyLog) => void;
  logs: DailyLog[];
}

const Tracker: React.FC<TrackerProps> = ({ onSaveLog, logs }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  const [reflection, setReflection] = useState('');
  const [synchronicities, setSynchronicities] = useState('');
  const [shadowObservations, setShadowObservations] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [awarenessLevel, setAwarenessLevel] = useState(3);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Food record state
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [snacks, setSnacks] = useState('');
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [fastingHours, setFastingHours] = useState(0);

  const [habits, setHabits] = useState({
    purification: false,
    nourishment: false,
    movement: false,
    nature: false,
    presence: false,
    shadowWork: false,
    study: false,
    gratitude: false
  });

  useEffect(() => {
    const existingLog = logs.find(l => l.date === date);
    if (existingLog) {
      setReflection(existingLog.reflection || '');
      setSynchronicities(existingLog.synchronicities || '');
      setShadowObservations(existingLog.shadowObservations || '');
      setEnergyLevel(existingLog.energyLevel || 3);
      setAwarenessLevel(existingLog.awarenessLevel || 3);
      setHabits(existingLog.completedActions as any);
      
      if (existingLog.foodRecord) {
        setBreakfast(existingLog.foodRecord.breakfast || '');
        setLunch(existingLog.foodRecord.lunch || '');
        setDinner(existingLog.foodRecord.dinner || '');
        setSnacks(existingLog.foodRecord.snacks || '');
        setWaterGlasses(existingLog.foodRecord.waterGlasses || 0);
        setFastingHours(existingLog.foodRecord.fastingHours || 0);
      }
    } else {
      setReflection('');
      setSynchronicities('');
      setShadowObservations('');
      setEnergyLevel(3);
      setAwarenessLevel(3);
      setBreakfast('');
      setLunch('');
      setDinner('');
      setSnacks('');
      setWaterGlasses(0);
      setFastingHours(0);
      setHabits({ 
        purification: false, 
        nourishment: false, 
        movement: false, 
        nature: false, 
        presence: false, 
        shadowWork: false, 
        study: false, 
        gratitude: false
      });
    }
  }, [date, logs]);

  const executeSave = () => {
    onSaveLog({
      date,
      spiritualPractices: { morning: '', afternoon: '', evening: '' },
      reflection,
      synchronicities,
      shadowObservations,
      energyLevel,
      awarenessLevel,
      foodRecord: {
        breakfast,
        lunch,
        dinner,
        snacks,
        waterGlasses,
        fastingHours
      },
      completedActions: { 
        ...habits, 
        journaling: true
      } as any
    });
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  const handleSave = () => {
    const isMissingFields = 
      !reflection.trim() || 
      !breakfast.trim() || 
      !lunch.trim() || 
      !dinner.trim() || 
      waterGlasses === 0;

    if (isMissingFields) {
      setShowConfirmSave(true);
    } else {
      executeSave();
    }
  };

  return (
    <div className="p-4 pt-safe pb-safe-nav max-w-2xl mx-auto space-y-12 animate-in fade-in">
      <header className="px-4 text-center">
        <h2 className="text-4xl font-serif text-white italic tracking-tighter">Livro de Espelhos</h2>
        <p className="text-magic-gold text-[10px] uppercase tracking-[0.4em] font-black mt-2">Portal do Diário</p>
      </header>

      {/* Notice Banner */}
      <div className="mx-2 p-6 rounded-[2.5rem] bg-amber-950/20 border border-amber-500/30 flex items-start gap-4 shadow-xl animate-in slide-in-from-top duration-500">
        <AlertTriangle className="text-amber-400 shrink-0 mt-0.5 animate-pulse" size={22} />
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em]">Aviso da Senda</p>
          <p className="text-xs text-amber-200/90 italic leading-relaxed font-light">
            No <strong className="text-white font-medium">Livro de Espelhos</strong>, o buscador deve preencher todos os quadros (Vibração, Presença, Recordatório Alimentar, Elixir da Água, Descanso e Emanações da Alma) para obter um reflexo íntegro, fiel e profundo de sua jornada de autocura.
          </p>
        </div>
      </div>

      {/* Date Picker Card */}
      <div className="glass-mystic p-8 rounded-[3rem] border border-white/10 mx-2 flex justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-magic-gold/5 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-5">
          <div className="p-3 bg-magic-gold/10 rounded-2xl text-magic-gold border border-magic-gold/20">
            <CalendarDays size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-ethereal-500 tracking-widest block mb-1">Ciclo de Consciência:</span>
            <span className="text-white font-serif text-xl italic">{new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
        <div className="relative">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-magic-gold shadow-lg hover:bg-white/10 transition-colors"><Edit3 size={20} /></div>
        </div>
      </div>

      <div className="space-y-10 px-2">
        {/* Levels Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="glass-mystic p-8 rounded-[3rem] border border-white/5 space-y-5 text-center shadow-xl">
              <div className="flex flex-col items-center gap-1">
                <Star size={16} className="text-magic-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ethereal-300">Vibração Vital</span>
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setEnergyLevel(v)} className={`w-10 h-10 rounded-2xl border-2 transition-all font-bold text-sm ${energyLevel === v ? 'bg-magic-gold border-magic-gold text-nature-950 shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110' : 'border-white/5 text-ethereal-500 hover:border-white/20'}`}>
                    {v}
                  </button>
                ))}
              </div>
           </div>
           <div className="glass-mystic p-8 rounded-[3rem] border border-white/5 space-y-5 text-center shadow-xl">
              <div className="flex flex-col items-center gap-1">
                <Eye size={16} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ethereal-300">Grau de Presença</span>
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setAwarenessLevel(v)} className={`w-10 h-10 rounded-2xl border-2 transition-all font-bold text-sm ${awarenessLevel === v ? 'bg-indigo-400 border-indigo-400 text-nature-950 shadow-[0_0_15px_rgba(129,140,248,0.4)] scale-110' : 'border-white/5 text-ethereal-500 hover:border-white/20'}`}>
                    {v}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Recordatório Alimentar - NOVO */}
        <section className="glass-mystic p-10 rounded-[4rem] border border-aura-teal/20 space-y-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-aura-teal/5 blur-3xl pointer-events-none" />
           <div className="text-center space-y-2">
              <h3 className="font-serif text-3xl text-white italic tracking-tight">Recordatório do Templo</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-aura-teal">Alquimia Alimentar</p>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 ml-4">
                  <Coffee size={14} className="text-aura-gold" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Primeira Alquimia (Desjejum)</label>
                </div>
                <input 
                  type="text"
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                  placeholder="O que nutriu seu despertar?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-ethereal-100 italic focus:border-aura-gold/30 outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 ml-4">
                  <Sun size={14} className="text-aura-gold" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Grande Alimento (Almoço)</label>
                </div>
                <input 
                  type="text"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  placeholder="Sustento para sua senda solar..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-ethereal-100 italic focus:border-aura-gold/30 outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 ml-4">
                  <Moon size={14} className="text-aura-indigo" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Repouso do Templo (Jantar)</label>
                </div>
                <input 
                  type="text"
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  placeholder="Leveza para a jornada noturna..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-ethereal-100 italic focus:border-aura-indigo/30 outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 ml-4">
                  <Apple size={14} className="text-aura-rose" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Interlúdios (Lanches)</label>
                </div>
                <input 
                  type="text"
                  value={snacks}
                  onChange={(e) => setSnacks(e.target.value)}
                  placeholder="Frutos e pequenas alquimias..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-ethereal-100 italic focus:border-aura-rose/30 outline-none"
                />
              </div>

              {/* Hydration Tracker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-aura-teal/10 rounded-3xl border border-aura-teal/20 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-aura-teal">
                    <Droplets size={18} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Elixir da Vida (Água)</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white"><Minus size={16} /></button>
                    <div className="text-center">
                      <span className="text-3xl font-serif text-white">{waterGlasses}</span>
                      <span className="text-[10px] text-ethereal-400 block uppercase font-bold">Copos</span>
                    </div>
                    <button onClick={() => setWaterGlasses(waterGlasses + 1)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white"><Plus size={16} /></button>
                  </div>
                </div>

                <div className="p-6 bg-aura-violet/10 rounded-3xl border border-aura-violet/20 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-aura-violet">
                    <Moon size={18} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Descanso do Templo (Jejum)</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setFastingHours(Math.max(0, fastingHours - 1))} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white"><Minus size={16} /></button>
                    <div className="text-center">
                      <span className="text-3xl font-serif text-white">{fastingHours}</span>
                      <span className="text-[10px] text-ethereal-400 block uppercase font-bold">Horas</span>
                    </div>
                    <button onClick={() => setFastingHours(Math.min(24, fastingHours + 1))} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white"><Plus size={16} /></button>
                  </div>
                </div>
              </div>
           </div>
        </section>

        {/* Reflections Section */}
        <section className="space-y-8">
           <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <CloudLightning size={14} className="text-magic-gold" />
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-magic-gold">Emanações da Alma</label>
              </div>
              <textarea 
                className="w-full bg-white/5 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm text-ethereal-100 focus:border-magic-gold/30 outline-none resize-none placeholder:text-ethereal-800 italic leading-relaxed shadow-inner transition-all focus:bg-white/[0.07]"
                placeholder="O que o silêncio te revelou hoje? Quais verdades emergiram do Templo?"
                rows={4}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <Compass size={14} className="text-indigo-400" />
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Teia de Sincronicidades</label>
              </div>
              <textarea 
                className="w-full bg-white/5 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm text-ethereal-100 focus:border-indigo-400/30 outline-none resize-none placeholder:text-ethereal-800 italic leading-relaxed shadow-inner transition-all focus:bg-white/[0.07]"
                placeholder="Sinais no caminho, números sagrados, encontros que pareciam destino..."
                rows={3}
                value={synchronicities}
                onChange={(e) => setSynchronicities(e.target.value)}
              />
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <Moon size={14} className="text-aura-rose" />
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-aura-rose">Observações de Sombra</label>
              </div>
              <textarea 
                className="w-full bg-white/5 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm text-ethereal-100 focus:border-aura-rose/30 outline-none resize-none placeholder:text-ethereal-800 italic leading-relaxed shadow-inner transition-all focus:bg-white/[0.07]"
                placeholder="Qual medo, incômodo ou padrão reativo emergiu hoje para ser acolhido e transmutado?"
                rows={3}
                value={shadowObservations}
                onChange={(e) => setShadowObservations(e.target.value)}
              />
           </div>
        </section>

        <button 
           onClick={handleSave}
           className="w-full bg-white text-nature-950 py-7 rounded-[3rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
        >
           <div className="absolute inset-0 bg-magic-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <Save size={20} className="relative z-10" /> <span className="relative z-10">Eternizar Registro no Akasha</span>
        </button>
      </div>

      {/* Custom Confirmation Modal for Missing Fields */}
      {showConfirmSave && (
        <div className="fixed inset-0 z-[100] bg-ethereal-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-mystic border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/20">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-white italic">Quadros Incompletos</h3>
              <p className="text-xs text-ethereal-300 leading-relaxed">
                Você possui quadros não preenchidos no seu <strong className="text-white">Livro de Espelhos</strong>. Para obter um reflexo completo e fiel da sua autocura, é altamente recomendável preencher todas as seções. Deseja salvar assim mesmo?
              </p>
            </div>

            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={() => {
                  setShowConfirmSave(false);
                  executeSave();
                }}
                className="w-full bg-magic-gold text-nature-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Sim, Salvar Registro
              </button>
              <button 
                onClick={() => setShowConfirmSave(false)}
                className="w-full bg-white/5 text-white/60 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-colors"
              >
                Voltar e Preencher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in slide-up duration-300">
          <div className="glass-mystic p-5 rounded-3xl border border-aura-emerald/30 bg-aura-emerald/10 backdrop-blur-xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
            <div className="p-2 bg-aura-emerald/20 rounded-xl text-aura-emerald">
              <CheckCircle2 size={20} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-aura-emerald">Registro Selado</p>
              <p className="text-xs text-ethereal-100 italic leading-snug">Jornada atualizada e Alma ouvida no Akasha! ✨</p>
            </div>
            <button 
              onClick={() => setShowSuccessToast(false)}
              className="text-ethereal-500 hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracker;
