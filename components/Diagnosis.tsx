
import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Zap,
  Eye,
  Activity,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Compass,
  Info,
  Ghost,
  Layers,
  Thermometer,
  ShieldAlert,
  Scale,
  Stethoscope,
  Droplets,
  Wind as WindIcon,
  ArrowRight
} from 'lucide-react';
import { SpiritualInventoryItem, UserProfile, AppView } from '../types';
import NextStepGuide from './NextStepGuide';

const GLUTEN_SIGNALS: SpiritualInventoryItem[] = [
  // Digestivos/Intestinais
  { id: 'g1', name: 'Inchaço abdominal tipo "balão" (agudo após comer)', category: 'mental', weight: 3 },
  { id: 'g2', name: 'Dores abdominais, gases excessivos ou cólicas intestinais', category: 'mental', weight: 3 },
  { id: 'g3', name: 'Prisão de ventre (constipação), diarreia ou fezes com odor forte', category: 'mental', weight: 3 },
  { id: 'g4', name: 'Náuseas recorrentes ou queimação no estômago', category: 'mental', weight: 2 },
  { id: 'g5', name: 'Refluxo persistente, esofagite ou queimação no esôfago', category: 'mental', weight: 3 },
  
  // Neurológicos/Cefálicos/Emocionais
  { id: 'g6', name: 'Dores de cabeça persistentes ou enxaquecas frequentes', category: 'mental', weight: 3 },
  { id: 'g7', name: 'Névoa mental (Brain Fog): confusão, falta de foco e memória', category: 'mental', weight: 3 },
  { id: 'g8', name: 'Irritabilidade inexplicável, mudanças bruscas de humor ou ansiedade pós-refeição', category: 'mental', weight: 3 },
  { id: 'g9', name: 'Tonturas, desequilíbrio ou episódios de vertigem', category: 'mental', weight: 2 },
  { id: 'g10', name: 'Dormência ou formigamento nas mãos e pés (Neuropatia)', category: 'mental', weight: 2 },
  
  // Musculoesqueléticos
  { id: 'g11', name: 'Dores articulares (juntas) e rigidez matinal', category: 'mental', weight: 3 },
  { id: 'g12', name: 'Dores musculares difusas ou sensação de "corpo surrado"', category: 'mental', weight: 2 },
  
  // Imunológicos e Outros
  { id: 'g13', name: 'Infecções frequentes (gripes, candidíase ou cistites de repetição)', category: 'mental', weight: 3 },
  { id: 'g14', name: 'Aftas recorrentes na boca ou gengivas sensíveis', category: 'mental', weight: 2 },
  { id: 'g15', name: 'Problemas de pele persistentes (eczema, dermatite ou coceira)', category: 'mental', weight: 1 },
  { id: 'g16', name: 'Fadiga extrema (cansaço que não passa com o sono)', category: 'mental', weight: 3 },
  { id: 'g17', name: 'Anemia por deficiência de ferro (que não melhora com suplementos)', category: 'mental', weight: 3 },
];

const CASEIN_SIGNALS: SpiritualInventoryItem[] = [
  // Mucosidade e Respiratório
  { id: 'c1', name: 'Mucosidade excessiva (catarro constante, sinusite ou rinite)', category: 'mental', weight: 3 },
  { id: 'c2', name: 'Pigarro constante ou necessidade de limpar a garganta', category: 'mental', weight: 2 },
  { id: 'c3', name: 'Problemas respiratórios recorrentes (asma, bronquite)', category: 'mental', weight: 3 },
  
  // Pele
  { id: 'c4', name: 'Acne persistente (especialmente cística ou na região da mandíbula)', category: 'mental', weight: 3 },
  { id: 'c5', name: 'Olheiras escuras e profundas (mesmo dormindo bem)', category: 'mental', weight: 2 },
  
  // Outros
  { id: 'c6', name: 'Infecções de ouvido frequentes ou sensação de ouvido "tampado"', category: 'mental', weight: 2 },
  { id: 'c7', name: 'Dores articulares em diferentes locais do corpo', category: 'mental', weight: 3 },
];

const LACTOSE_SIGNALS: SpiritualInventoryItem[] = [
  // Digestivo (Lactose)
  { id: 'l1', name: 'Inchaço abdominal imediato após consumo de laticínios', category: 'mental', weight: 3 },
  { id: 'l2', name: 'Diarreia ou fezes moles logo após ingerir leite/queijo', category: 'mental', weight: 3 },
  { id: 'l3', name: 'Cólicas abdominais fortes e ruídos intestinais (borborigmos)', category: 'mental', weight: 2 },
  { id: 'l4', name: 'Gases excessivos e desconforto gástrico súbito', category: 'mental', weight: 2 },
];

const SPIRITUAL_SIGNALS: SpiritualInventoryItem[] = [
  { id: 's1', name: 'Apego ao Passado: Dificuldade em desapegar de situações ou pessoas (A "cola" emocional)', category: 'sombra', weight: 3 },
  { id: 's2', name: 'Resistência ao Fluxo: Necessidade de controle excessivo sobre a vida', category: 'espiritual', weight: 3 },
  { id: 's3', name: 'Fragmentação: Sensação de estar desconectado da própria verdade', category: 'espiritual', weight: 2 },
  { id: 's4', name: 'Densidade: Sentir a vida "pesada" e sem brilho criativo', category: 'sombra', weight: 3 },
  { id: 's5', name: 'Filtro Obstruído: Dificuldade em receber mensagens da intuição', category: 'espiritual', weight: 3 },
  { id: 's6', name: 'Ego Rígido: Inflexibilidade mental diante de novas ideias', category: 'sombra', weight: 2 },
];

interface DiagnosisProps {
  onComplete: (
    score: number,
    name: string,
    favoriteActivities: string[],
    details?: {
      glutenCount: number;
      caseinCount: number;
      lactoseCount: number;
      spiritualCount: number;
    }
  ) => void;
  userProfile: UserProfile;
  onBack?: () => void;
  setView?: (view: AppView) => void;
}

const Diagnosis: React.FC<DiagnosisProps> = ({ onComplete, userProfile, onBack, setView }) => {
  const [selectedGluten, setSelectedGluten] = useState<string[]>([]);
  const [selectedCasein, setSelectedCasein] = useState<string[]>([]);
  const [selectedLactose, setSelectedLactose] = useState<string[]>([]);
  const [selectedSpiritual, setSelectedSpiritual] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [step, setStep] = useState<'intro' | 'symptoms' | 'spiritual' | 'result'>('intro');
  const [userName, setUserName] = useState(userProfile.name && userProfile.name !== 'Buscador' ? userProfile.name : '');

  const changeStep = (newStep: 'intro' | 'symptoms' | 'spiritual' | 'result') => {
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateUnmarkedPercentage = () => {
    const totalSignals = GLUTEN_SIGNALS.length + CASEIN_SIGNALS.length + LACTOSE_SIGNALS.length + SPIRITUAL_SIGNALS.length;
    const markedCount = selectedGluten.length + selectedCasein.length + selectedLactose.length + selectedSpiritual.length;
    const unmarkedCount = totalSignals - markedCount;
    return Math.round((unmarkedCount / totalSignals) * 100);
  };

  const handleComplete = () => {
    const score = calculateUnmarkedPercentage();
    onComplete(score, userName.trim() || 'Buscador', selectedActivities, {
      glutenCount: selectedGluten.length,
      caseinCount: selectedCasein.length,
      lactoseCount: selectedLactose.length,
      spiritualCount: selectedSpiritual.length
    });
  };

  const toggleItem = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(i => i !== id));
    } else {
      setList([...list, id]);
    }
  };

  if (step === 'intro') {
    return (
      <div className="p-8 pt-safe pb-safe min-h-screen flex flex-col justify-center items-center text-center animate-in fade-in">
        <div className="glass-mystic p-10 rounded-[3rem] space-y-8 max-w-sm border-magic-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <div className="w-20 h-20 bg-magic-gold/20 rounded-full flex items-center justify-center mx-auto border border-magic-gold/30">
            <Flame size={36} className="text-magic-gold" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif text-white italic">O Templo e a Luz</h2>
            <p className="text-magic-gold text-[10px] font-black uppercase tracking-widest leading-relaxed">
              Questionário de Percepções
            </p>
            <p className="text-ethereal-300 text-sm leading-relaxed">
              Registre percepções sobre seu corpo e emoções para acompanhar seus próprios relatos. O questionário não mede vitalidade nem identifica a causa dos sintomas.
            </p>
            <p className="text-[10px] text-ethereal-400 italic leading-snug pt-4 border-t border-white/5">
              Este questionário não diagnostica alergia, intolerância ou doença celíaca. Se houver sintomas ou suspeita de alguma condição, procure avaliação profissional antes de retirar alimentos da dieta.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => changeStep('symptoms')}
              className="w-full bg-white text-nature-950 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
            >
              Escutar a Essência
            </button>
            {userProfile.isOnPath && onBack && (
              <button
                onClick={onBack}
                className="w-full bg-white/5 text-white/60 hover:text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors border border-white/10"
              >
                Voltar ao Portal
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'symptoms') {
    return (
      <div className="p-4 pt-safe pb-safe-nav space-y-8 animate-in fade-in">
        <header className="px-4 text-center space-y-2">
          <h2 className="text-3xl font-serif text-[#18245C] font-bold tracking-tight italic">Registro do Corpo</h2>
          <p className="text-[10px] font-black text-[#E9B44C] uppercase tracking-[0.3em]">Passo 1: Percepções do corpo</p>
        </header>

        <div className="space-y-4 px-2 animate-in slide-up">
          <div className="p-8 glass-mystic border border-[#E9B44C]/30 rounded-[3rem] bg-[#E9B44C]/10 space-y-5 text-center relative overflow-hidden group shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <Stethoscope size={28} className="text-[#E9B44C]" />
              <h3 className="text-xl font-serif text-[#18245C] font-bold italic">Sinais percebidos</h3>
            </div>
            <p className="text-[12px] text-[#4A506B] leading-relaxed italic">
              Marque apenas o que percebeu. A lista não identifica inflamação nem relaciona sintomas a alimentos.
            </p>
          </div>

          {/* GLUTEN SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-4">
              <div className="h-px flex-1 bg-[#18245C]/10" />
              <span className="text-[10px] font-black text-[#E9B44C] uppercase tracking-[0.3em]">Grupo de observações A</span>
              <div className="h-px flex-1 bg-[#18245C]/10" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {GLUTEN_SIGNALS.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id, selectedGluten, setSelectedGluten)}
                  className={`w-full p-5 rounded-[2rem] border transition-all text-left flex justify-between items-center ${
                    selectedGluten.includes(item.id) ? 'bg-[#E9B44C]/20 border-[#E9B44C] shadow-sm' : 'glass-mystic border-[#18245C]/10'
                  }`}
                >
                  <span className="text-xs font-semibold text-[#18245C] leading-snug pr-4">{item.name}</span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedGluten.includes(item.id) ? 'bg-[#E9B44C] border-[#E9B44C]' : 'border-[#18245C]/20'}`}>
                    {selectedGluten.includes(item.id) && <Zap size={12} className="text-[#18245C]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CASEIN SECTION */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2 px-4">
              <div className="h-px flex-1 bg-[#18245C]/10" />
              <span className="text-[10px] font-black text-[#5B8DE6] uppercase tracking-[0.3em]">Grupo de observações B</span>
              <div className="h-px flex-1 bg-[#18245C]/10" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {CASEIN_SIGNALS.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id, selectedCasein, setSelectedCasein)}
                  className={`w-full p-5 rounded-[2rem] border transition-all text-left flex justify-between items-center ${
                    selectedCasein.includes(item.id) ? 'bg-[#5B8DE6]/20 border-[#5B8DE6] shadow-sm' : 'glass-mystic border-[#18245C]/10'
                  }`}
                >
                  <span className="text-xs font-semibold text-[#18245C] leading-snug pr-4">{item.name}</span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedCasein.includes(item.id) ? 'bg-[#5B8DE6] border-[#5B8DE6]' : 'border-[#18245C]/20'}`}>
                    {selectedCasein.includes(item.id) && <Droplets size={12} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* LACTOSE SECTION */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2 px-4">
              <div className="h-px flex-1 bg-[#18245C]/10" />
              <span className="text-[10px] font-black text-[#2E7D68] uppercase tracking-[0.3em]">Grupo de observações C</span>
              <div className="h-px flex-1 bg-[#18245C]/10" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {LACTOSE_SIGNALS.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id, selectedLactose, setSelectedLactose)}
                  className={`w-full p-5 rounded-[2rem] border transition-all text-left flex justify-between items-center ${
                    selectedLactose.includes(item.id) ? 'bg-[#2E7D68]/20 border-[#2E7D68] shadow-sm' : 'glass-mystic border-[#18245C]/10'
                  }`}
                >
                  <span className="text-xs font-semibold text-[#18245C] leading-snug pr-4">{item.name}</span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedLactose.includes(item.id) ? 'bg-[#2E7D68] border-[#2E7D68]' : 'border-[#18245C]/20'}`}>
                    {selectedLactose.includes(item.id) && <Droplets size={12} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl px-4 sm:px-6 md:px-8 py-8 pb-safe-nav bg-gradient-to-t from-[#F7F2EC] via-[#F7F2EC] to-transparent z-50">
          <button 
            onClick={() => changeStep('spiritual')}
            className="w-full bg-[#18245C] text-white py-6 rounded-[2.5rem] font-bold shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Finalizar Teste do Corpo e Ir para Teste da Alma <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'spiritual') {
    return (
      <div className="p-4 pt-safe pb-safe-nav space-y-8 animate-in fade-in pb-28">
        <header className="px-4 text-center space-y-2">
          <h2 className="text-3xl font-serif text-[#18245C] font-bold tracking-tight italic">Teste da Alma</h2>
          <p className="text-[10px] font-black text-[#A268D7] uppercase tracking-[0.3em]">Passo 2: Alinhamento e Senda da Alma</p>
        </header>

        <div className="space-y-4 px-2 animate-in slide-up">
          <div className="p-6 bg-[#A268D7]/10 border border-[#A268D7]/20 rounded-3xl space-y-3 text-center">
            <div className="w-12 h-12 bg-[#A268D7]/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Compass size={24} className="text-[#A268D7]" />
            </div>
            <span className="text-[10px] font-black text-[#A268D7] uppercase tracking-widest">A Senda do Autoconhecimento</span>
            <p className="text-[11px] text-[#4A506B] leading-relaxed italic">
              Estas perguntas ajudam a refletir sobre emoções e experiências pessoais. Não são avaliação clínica.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {SPIRITUAL_SIGNALS.map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id, selectedSpiritual, setSelectedSpiritual)}
                className={`w-full p-6 rounded-[2.5rem] border transition-all text-left flex justify-between items-center ${
                  selectedSpiritual.includes(item.id) ? 'bg-[#A268D7]/20 border-[#A268D7] shadow-lg' : 'glass-mystic border-[#18245C]/10'
                }`}
              >
                <span className="text-sm font-semibold text-[#18245C] leading-snug pr-4">{item.name}</span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedSpiritual.includes(item.id) ? 'bg-[#A268D7] border-[#A268D7]' : 'border-[#18245C]/20'}`}>
                  {selectedSpiritual.includes(item.id) && <Sparkles size={12} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl px-4 sm:px-6 md:px-8 py-8 pb-safe-nav bg-gradient-to-t from-[#F7F2EC] via-[#F7F2EC] to-transparent z-50 flex gap-3">
          <button 
            onClick={() => changeStep('symptoms')}
            className="flex-1 bg-[#18245C]/5 text-[#18245C] py-6 rounded-[2.5rem] font-bold border border-[#18245C]/10 transition-all active:scale-95"
          >
            Voltar
          </button>
          <button 
            onClick={() => changeStep('result')}
            className="flex-[2] bg-[#18245C] text-white py-6 rounded-[2.5rem] font-bold shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Finalizar Teste da Alma <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="p-4 pt-safe pb-safe-nav flex flex-col items-center justify-start w-full animate-in zoom-in">
        <div className="text-center space-y-8 w-full max-w-md px-2">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-[#18245C] font-bold italic">Seu Registro</h2>
            <p className="text-[10px] font-black text-[#E9B44C] uppercase tracking-[0.3em]">Resumo das respostas do questionário</p>
          </div>

          <div className="relative w-44 h-44 mx-auto">
            <div className="relative w-full h-full glass-mystic rounded-full flex items-center justify-center border border-[#E9B44C]/30 shadow-lg">
               <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#E9B44C] mb-1">Itens não marcados</span>
                  <h3 className="text-6xl font-serif font-bold text-[#18245C]">
                    {calculateUnmarkedPercentage()}%
                  </h3>
               </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="glass-mystic p-5 rounded-3xl border border-[#E9B44C]/20 space-y-3">
              <span className="text-[9px] font-black text-[#E9B44C] uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={12} /> O Corpo (Físico)
              </span>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#4A506B]">Grupo A:</span>
                  <span className={`font-bold ${selectedGluten.length > 0 ? 'text-rose-600' : 'text-[#2E7D68]'}`}>{selectedGluten.length} sinais</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#4A506B]">Grupo B:</span>
                  <span className={`font-bold ${selectedCasein.length > 0 ? 'text-rose-600' : 'text-[#2E7D68]'}`}>{selectedCasein.length} sinais</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#4A506B]">Grupo C:</span>
                  <span className={`font-bold ${selectedLactose.length > 0 ? 'text-rose-600' : 'text-[#2E7D68]'}`}>{selectedLactose.length} sinais</span>
                </div>
              </div>
            </div>

            <div className="glass-mystic p-5 rounded-3xl border border-[#A268D7]/20 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[9px] font-black text-[#A268D7] uppercase tracking-widest flex items-center gap-1.5">
                  <Eye size={12} /> A Alma (Sutil)
                </span>
                <p className="text-xs text-[#4A506B] italic leading-relaxed pt-1">
                  {selectedSpiritual.length === 0 
                    ? 'Você não marcou itens de reflexão nesta etapa.'
                    : `Você marcou ${selectedSpiritual.length} item(ns) de reflexão nesta etapa.`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-[#18245C] font-bold italic">Como sua Centelha se chama?</h2>
            <p className="text-[10px] text-[#4A506B] leading-snug">Insira um nome místico ou use o seu próprio nome para selar este ciclo de teste.</p>
            <input
              type="text"
              placeholder="Nome místico da essência"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-5 glass-mystic rounded-2xl text-center text-[#18245C] placeholder:text-[#4A506B]/60 outline-none border border-[#18245C]/10 focus:border-[#E9B44C] transition-all shadow-inner font-bold"
            />
          </div>

          <button 
            onClick={handleComplete}
            disabled={!userName.trim()}
            className="w-full bg-[#E9B44C] text-[#18245C] py-6 rounded-3xl font-bold shadow-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            Confirmar Essência e Avançar para a Senda <Sparkles size={22} />
          </button>

          <p className="text-[9px] text-[#4A506B] text-center leading-relaxed italic px-2 opacity-80">
            Este registro não diagnostica condições de saúde. Procure avaliação profissional antes de restringir alimentos ou se houver sintomas persistentes.
          </p>

          <NextStepGuide 
            currentStepName="Teste do Templo e da Alma"
            stepNumber={1}
            totalSteps={7}
            nextStepName="Portal da Senda"
            nextStepLabel="Avançar para a Senda"
            onNavigate={handleComplete}
            message="Seu teste de vitalidade foi concluído. Avance agora para o Portal da Senda dos 21 Dias de Reconexão."
          />
        </div>
      </div>
    );
  }
};

export default Diagnosis;
