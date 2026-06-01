
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
  Wind as WindIcon
} from 'lucide-react';
import { SpiritualInventoryItem, UserProfile } from '../types';

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
  { id: 'c7', name: 'Dores articulares migratórias (inflamação sistêmica)', category: 'mental', weight: 3 },
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

const LIGHT_ACTIVITIES = [
  { id: 'walk', name: 'Caminhada na Natureza', icon: Compass },
  { id: 'yoga', name: 'Yoga Suave', icon: Sparkles },
  { id: 'stretch', name: 'Alongamento Consciente', icon: Activity },
  { id: 'dance', name: 'Dança Livre', icon: Flame },
  { id: 'taichi', name: 'Tai Chi / Qi Gong', icon: WindIcon },
  { id: 'swim', name: 'Natação Leve', icon: Droplets },
  { id: 'garden', name: 'Jardinagem', icon: Heart },
  { id: 'bike', name: 'Ciclismo Lento', icon: Zap },
];

interface DiagnosisProps {
  onComplete: (score: number, name: string, favoriteActivities: string[]) => void;
  userProfile: UserProfile;
}

const Diagnosis: React.FC<DiagnosisProps> = ({ onComplete, userProfile }) => {
  const [selectedGluten, setSelectedGluten] = useState<string[]>([]);
  const [selectedCasein, setSelectedCasein] = useState<string[]>([]);
  const [selectedLactose, setSelectedLactose] = useState<string[]>([]);
  const [selectedSpiritual, setSelectedSpiritual] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [step, setStep] = useState<'intro' | 'symptoms' | 'spiritual' | 'result' | 'movement'>('intro');
  const [userName, setUserName] = useState('');

  const handleComplete = () => {
    const score = Math.max(0, 100 - (selectedGluten.length + selectedCasein.length + selectedLactose.length + selectedSpiritual.length) * 5);
    onComplete(score, userName.trim() || 'Buscador', selectedActivities);
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
      <div className="safe-screen p-4 sm:p-8 flex flex-col justify-center items-center text-center animate-in fade-in">
        <div className="glass-mystic p-10 rounded-[3rem] space-y-8 max-w-sm border-magic-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <div className="w-20 h-20 bg-magic-gold/20 rounded-full flex items-center justify-center mx-auto border border-magic-gold/30">
            <Flame size={36} className="text-magic-gold" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif text-white italic">O Templo e a Luz</h2>
            <p className="text-ethereal-300 text-sm leading-relaxed">
              Mapear onde sua centelha divina encontra resistência no templo físico é o primeiro passo da sua autocura. Vamos ouvir o que sua essência tem a dizer através dos sinais do corpo.
            </p>
            <p className="text-[10px] text-ethereal-400 italic leading-snug pt-4 border-t border-white/5">
              As práticas aqui são espirituais e de desenvolvimento pessoal. Elas <strong className="text-white">não substituem</strong> tratamento médico, nutricional ou psicológico. Se você suspeita de Doença Celíaca, é aconselhável que faça os testes sanguíneos para a desordem antes de iniciar a dieta sem glúten.
            </p>
          </div>
          <button
            onClick={() => setStep('symptoms')}
            className="w-full bg-white text-nature-950 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
          >
            Escutar a Essência
          </button>
        </div>
      </div>
    );
  }

  if (step === 'symptoms') {
    return (
      <div className="store-page navigated-screen p-4 pt-12 pb-32 space-y-8 animate-in fade-in">
        <header className="px-4 text-center space-y-2">
          <h2 className="text-3xl font-serif text-white tracking-tight italic">Exame do Templo</h2>
          <p className="text-[10px] font-black text-magic-gold uppercase tracking-[0.3em]">Passo 1: Sensibilidades e Inflamação</p>
        </header>

        <div className="space-y-4 px-2 animate-in slide-up">
          <div className="p-8 glass-mystic border border-magic-gold/20 rounded-[3rem] bg-magic-gold/5 space-y-5 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-magic-gold/10 blur-3xl pointer-events-none" />
            <div className="flex flex-col items-center gap-2">
              <Stethoscope size={28} className="text-magic-gold animate-pulse" />
              <h3 className="text-xl font-serif text-white italic">Sinais de Inflamação Sistêmica</h3>
            </div>
            <p className="text-[12px] text-ethereal-100 leading-relaxed italic">
              Identifique como seu templo reage a gatilhos inflamatórios específicos.
            </p>
          </div>

          {/* GLUTEN SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-black text-magic-gold uppercase tracking-[0.3em]">Gatilho: Glúten</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {GLUTEN_SIGNALS.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id, selectedGluten, setSelectedGluten)}
                  className={`w-full p-5 rounded-[2rem] border transition-all text-left flex justify-between items-center ${
                    selectedGluten.includes(item.id) ? 'bg-magic-gold/20 border-magic-gold shadow-md' : 'glass-mystic border-white/5'
                  }`}
                >
                  <span className="text-xs font-medium text-white/90 leading-snug pr-4">{item.name}</span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedGluten.includes(item.id) ? 'bg-magic-gold border-magic-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'border-white/20'}`}>
                    {selectedGluten.includes(item.id) && <Zap size={12} className="text-nature-950" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CASEIN SECTION */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2 px-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Gatilho: Caseína</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {CASEIN_SIGNALS.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id, selectedCasein, setSelectedCasein)}
                  className={`w-full p-5 rounded-[2rem] border transition-all text-left flex justify-between items-center ${
                    selectedCasein.includes(item.id) ? 'bg-blue-500/20 border-blue-400 shadow-md' : 'glass-mystic border-white/5'
                  }`}
                >
                  <span className="text-xs font-medium text-white/90 leading-snug pr-4">{item.name}</span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedCasein.includes(item.id) ? 'bg-blue-400 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'border-white/20'}`}>
                    {selectedCasein.includes(item.id) && <Droplets size={12} className="text-nature-950" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* LACTOSE SECTION */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2 px-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Gatilho: Lactose</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {LACTOSE_SIGNALS.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id, selectedLactose, setSelectedLactose)}
                  className={`w-full p-5 rounded-[2rem] border transition-all text-left flex justify-between items-center ${
                    selectedLactose.includes(item.id) ? 'bg-cyan-500/20 border-cyan-400 shadow-md' : 'glass-mystic border-white/5'
                  }`}
                >
                  <span className="text-xs font-medium text-white/90 leading-snug pr-4">{item.name}</span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedLactose.includes(item.id) ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-white/20'}`}>
                    {selectedLactose.includes(item.id) && <Droplets size={12} className="text-nature-950" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="safe-action-bar fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl px-4 sm:px-6 md:px-8 py-8 bg-gradient-to-t from-ethereal-950 via-ethereal-950 to-transparent z-50">
          <button 
            onClick={() => setStep('spiritual')}
            className="w-full bg-white text-nature-950 py-6 rounded-[2.5rem] font-bold shadow-2xl transition-all active:scale-95"
          >
            Prosseguir para o Espírito
          </button>
        </div>
      </div>
    );
  }

  if (step === 'spiritual') {
    return (
      <div className="store-page navigated-screen p-4 pt-12 pb-32 space-y-8 animate-in fade-in">
        <header className="px-4 text-center space-y-2">
          <h2 className="text-3xl font-serif text-white tracking-tight italic">Exame do Espírito</h2>
          <p className="text-[10px] font-black text-aura-indigo uppercase tracking-[0.3em]">Passo 2: A Senda da Alma</p>
        </header>

        <div className="space-y-4 px-2 animate-in slide-up">
          <div className="p-6 bg-magic-gold/5 border border-magic-gold/10 rounded-3xl space-y-3 text-center">
            <div className="w-12 h-12 bg-magic-gold/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Compass size={24} className="text-magic-gold" />
            </div>
            <span className="text-[10px] font-black text-magic-gold uppercase tracking-widest">A Senda da Autocura</span>
            <p className="text-[11px] text-ethereal-100 leading-relaxed italic">
              Este exame avalia como sua centelha divina flui através da sua alma. A autocura é o ato de remover o que impede essa luz de brilhar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {SPIRITUAL_SIGNALS.map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id, selectedSpiritual, setSelectedSpiritual)}
                className={`w-full p-6 rounded-[2.5rem] border transition-all text-left flex justify-between items-center ${
                  selectedSpiritual.includes(item.id) ? 'bg-indigo-500/20 border-indigo-400 shadow-lg' : 'glass-mystic border-white/5'
                }`}
              >
                <span className="text-sm font-medium text-white/90 leading-snug pr-4">{item.name}</span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedSpiritual.includes(item.id) ? 'bg-indigo-400 border-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'border-white/20'}`}>
                  {selectedSpiritual.includes(item.id) && <Sparkles size={12} className="text-nature-950" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="safe-action-bar fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl px-4 sm:px-6 md:px-8 py-8 bg-gradient-to-t from-ethereal-950 via-ethereal-950 to-transparent z-50 flex gap-3">
          <button 
            onClick={() => setStep('symptoms')}
            className="flex-1 bg-white/5 text-white py-6 rounded-[2.5rem] font-bold border border-white/10 transition-all active:scale-95"
          >
            Voltar
          </button>
          <button 
            onClick={() => setStep('result')}
            className="flex-[2] bg-white text-nature-950 py-6 rounded-[2.5rem] font-bold shadow-2xl transition-all active:scale-95"
          >
            Consolidar Sinais
          </button>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="safe-screen p-4 sm:p-8 flex flex-col items-center justify-center animate-in zoom-in">
        <div className="text-center space-y-12 w-full max-w-sm">
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 bg-magic-gold/10 blur-[50px] rounded-full animate-pulse" />
            <div className="relative w-full h-full glass-mystic rounded-full flex items-center justify-center border border-magic-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
               <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-magic-gold mb-1">Caminho de Autocura</span>
                  <h3 className="text-7xl font-serif font-bold text-white">
                    {Math.max(0, 100 - (selectedGluten.length + selectedCasein.length + selectedLactose.length + selectedSpiritual.length) * 5)}%
                  </h3>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-serif text-white italic">Como sua Centelha se chama?</h2>
            <input
              type="text"
              placeholder="Nome místico da essência"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-5 glass-mystic rounded-2xl text-center text-white outline-none border border-white/10 focus:border-magic-gold transition-all shadow-inner"
            />
          </div>

          <button 
            onClick={() => setStep('movement')}
            disabled={!userName.trim()}
            className="w-full bg-magic-gold text-nature-950 py-6 rounded-3xl font-bold shadow-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            Confirmar Essência <Sparkles size={22} />
          </button>

          <p className="text-[9px] text-ethereal-500 text-center leading-relaxed italic px-2 opacity-60">
            As práticas aqui são espirituais e de desenvolvimento pessoal. Elas não substituem tratamento médico, nutricional ou psicológico. Se você suspeita de Doença Celíaca, é aconselhável que faça os testes sanguíneos para a desordem antes de iniciar a dieta sem glúten.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'movement') {
    return (
      <div className="store-page navigated-screen p-4 pt-12 pb-32 space-y-8 animate-in fade-in">
        <header className="px-4 text-center space-y-2">
          <h2 className="text-3xl font-serif text-white tracking-tight italic">Movimento Amado</h2>
          <p className="text-[10px] font-black text-aura-teal uppercase tracking-[0.3em]">Passo Final: O Prazer de Habitar o Corpo</p>
        </header>

        <div className="space-y-4 px-2 animate-in slide-up">
          <div className="p-6 bg-aura-teal/5 border border-aura-teal/10 rounded-3xl space-y-3 text-center">
            <div className="w-12 h-12 bg-aura-teal/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Activity size={24} className="text-aura-teal" />
            </div>
            <span className="text-[10px] font-black text-aura-teal uppercase tracking-widest">Movimento Consciente</span>
            <p className="text-[11px] text-ethereal-100 leading-relaxed italic">
              Olá, {userName}! Quais atividades físicas leves fazem seu coração vibrar? Escolha as que você genuinamente ama praticar para nutrir seu templo, sempre observando cada ato e praticando a presença.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {LIGHT_ACTIVITIES.map(activity => (
              <button
                key={activity.id}
                onClick={() => toggleItem(activity.id, selectedActivities, setSelectedActivities)}
                className={`p-6 rounded-[2.5rem] border transition-all text-center flex flex-col items-center gap-4 ${
                  selectedActivities.includes(activity.id) ? 'bg-aura-teal/20 border-aura-teal shadow-lg' : 'glass-mystic border-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedActivities.includes(activity.id) ? 'bg-aura-teal text-nature-950' : 'bg-white/5 text-white/40'}`}>
                  <activity.icon size={24} />
                </div>
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider leading-tight">{activity.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="safe-action-bar fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl px-4 sm:px-6 md:px-8 py-8 bg-gradient-to-t from-ethereal-950 via-ethereal-950 to-transparent z-50 flex gap-3">
          <button 
            onClick={() => setStep('result')}
            className="flex-1 bg-white/5 text-white py-6 rounded-[2.5rem] font-bold border border-white/10 transition-all active:scale-95"
          >
            Voltar
          </button>
          <button 
            onClick={handleComplete}
            className="flex-[2] bg-white text-nature-950 py-6 rounded-[2.5rem] font-bold shadow-2xl transition-all active:scale-95"
          >
            Entrar na Senda Sagrada
          </button>
        </div>
      </div>
    );
  }
};

export default Diagnosis;
