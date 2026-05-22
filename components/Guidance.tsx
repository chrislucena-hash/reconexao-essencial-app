import { 
  Sparkles, 
  Eye, 
  Loader2, 
  Flame, 
  ShieldCheck,
  Utensils,
  Zap,
  Coffee,
  Sun,
  Moon,
  Leaf,
  Droplets,
  Heart,
  AlertCircle,
  ShieldAlert,
  Search,
  Stethoscope,
  Scale,
  ChevronDown,
  ChevronUp,
  Clock,
  Activity,
  Waves,
  Footprints,
  GlassWater,
  FlaskConical,
  Ghost,
  Skull,
  Compass,
  Volume2,
  Wand2,
  Timer,
  X,
  RotateCcw,
  ChevronRight,
  Share2
} from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { 
  generateDailyInsight, 
  generateSpeech, 
  generateAlchemistRecipe,
  generateDailyContent,
  generateRecipeOptions,
  generateFermentationRecipe,
  generatePurificationTips
} from '../services/geminiService';
import { DailyInsight, DailyContent, Recipe } from '../types';

const FASTING_WINDOWS = [12, 14, 16, 18, 24];

const Guidance: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'jornada' | 'autocura' | 'alquimista' | 'saude-intestinal'>('jornada');
  const [content, setContent] = useState<DailyContent | null>(null);
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [alchemistRecipe, setAlchemistRecipe] = useState<any | null>(null);
  const [loadingAlchemist, setLoadingAlchemist] = useState(false);
  
  // New States
  const [recipeOptions, setRecipeOptions] = useState<Recipe[]>([]);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedMealIdx, setSelectedMealIdx] = useState<number | null>(null);
  const [refreshingIdx, setRefreshingIdx] = useState<number | null>(null);
  const [fermentationRecipe, setFermentationRecipe] = useState<Recipe | null>(null);
  const [purificationTips, setPurificationTips] = useState<string[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [fastingWindow, setFastingWindow] = useState<number>(16);
  const [isFasting, setIsFasting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [insightData, dailyContent, ferment, tips] = await Promise.all([
          generateDailyInsight(),
          generateDailyContent(),
          generateFermentationRecipe(),
          generatePurificationTips()
        ]);
        setInsight(insightData);
        setContent(dailyContent);
        setFermentationRecipe(ferment);
        setPurificationTips(tips);
      } catch (error) {
        console.error("Error loading guidance:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const playGuidance = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    const audioBase64 = await generateSpeech(text);
    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
    } else {
      setIsPlaying(false);
    }
  };

  const handleAlchemistSearch = async () => {
    if (!ingredientsInput.trim()) return;
    setLoadingAlchemist(true);
    const recipe = await generateAlchemistRecipe(ingredientsInput);
    setAlchemistRecipe(recipe);
    setLoadingAlchemist(false);
  };

  const handleOpenRefresh = async (index: number, mealType: string) => {
    setRefreshingIdx(index);
    setSelectedMealIdx(index);
    const options = await generateRecipeOptions(mealType);
    setRecipeOptions(options);
    setShowOptionsModal(true);
    setRefreshingIdx(null);
  };

  const selectNewRecipe = (recipe: Recipe) => {
    if (selectedMealIdx === null || !content) return;
    const newMenu = [...content.menu];
    newMenu[selectedMealIdx] = recipe;
    setContent({ ...content, menu: newMenu });
    setShowOptionsModal(false);
    setRecipeOptions([]);
  };

  const handleRefreshFerment = async () => {
    setLoadingExtras(true);
    const ferment = await generateFermentationRecipe();
    setFermentationRecipe(ferment);
    setLoadingExtras(false);
  };

  const handleShare = (recipe: Recipe) => {
    const shareText = `Confira esta alquimia nutritiva do ReViva: ${recipe.title}. ✨`;
    if (navigator.share) {
      navigator.share({ title: 'ReViva Alquimia', text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link copiado para sua egrégora! ✨');
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="text-aura-violet animate-spin" size={40} />
            <p className="text-ethereal-400 font-serif italic animate-pulse">Sincronizando com o Cosmos...</p>
        </div>
    );
  }

  return (
    <div className="p-4 pb-28 max-w-2xl mx-auto space-y-8 animate-in fade-in">
       <header className="space-y-1 text-center">
          <h2 className="text-4xl font-serif text-white italic">Bússola da Alma</h2>
          <p className="text-aura-gold text-[10px] font-black uppercase tracking-widest">Portal do Guia</p>
       </header>

       <div className="flex glass-mystic p-1 rounded-2xl gap-1 mx-2 shadow-2xl overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveSubTab('jornada')} className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'jornada' ? 'bg-aura-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-ethereal-500'}`}>Jornada</button>
          <button onClick={() => setActiveSubTab('autocura')} className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'autocura' ? 'bg-aura-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-ethereal-500'}`}>Autocura</button>
          <button onClick={() => setActiveSubTab('alquimista')} className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'alquimista' ? 'bg-aura-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-ethereal-500'}`}>Alquimista</button>
          <button onClick={() => setActiveSubTab('saude-intestinal')} className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'saude-intestinal' ? 'bg-aura-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-ethereal-500'}`}>Saúde Intestinal</button>
       </div>

      {activeSubTab === 'jornada' && content && (
        <div className="space-y-8 animate-in fade-in">
          {/* Mensagem do Dia */}
          <section className="relative p-10 glass-mystic rounded-[4rem] border border-aura-violet/30 bg-aura-violet/5 text-center space-y-6 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-aura-violet/10 blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 p-3 bg-aura-deep border border-aura-violet/30 rounded-full text-aura-violet shadow-[0_0_20px_rgba(139,92,246,0.3)]">
               <Sparkles size={24} className="animate-pulse" />
            </div>
            <div className="space-y-4">
              <p className="text-xl font-serif text-white leading-relaxed italic px-2">
                "{content.motivation}"
              </p>
              <button 
                onClick={() => playGuidance(content.motivation)}
                disabled={isPlaying}
                className="mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-aura-violet hover:text-white transition-colors disabled:opacity-50"
              >
                <Volume2 size={14} /> Ouvir Oráculo
              </button>
            </div>
          </section>

          {/* Desafio de Presença */}
          <section className="p-8 glass-mystic rounded-[3rem] border border-aura-emerald/20 bg-aura-emerald/5 flex gap-6 items-center shadow-xl group">
             <div className="w-16 h-16 bg-aura-emerald/20 rounded-2xl flex items-center justify-center text-aura-emerald border border-aura-emerald/30 group-hover:rotate-12 transition-transform duration-500 shrink-0">
                <Footprints size={32} />
             </div>
             <div className="space-y-2">
                <h4 className="text-[10px] font-black text-aura-emerald uppercase tracking-[0.3em]">Desafio de Presença</h4>
                <p className="text-xs text-ethereal-200 leading-relaxed italic">
                  {content.dailyChallenge}
                </p>
             </div>
          </section>
        </div>
      )}

      {activeSubTab === 'autocura' && content && (
        <div className="space-y-8 animate-in slide-up">
           <div className="px-4 text-center space-y-2">
              <h3 className="text-2xl font-serif text-white italic">Tríade Sagrada</h3>
              <p className="text-[10px] text-aura-gold font-black uppercase tracking-widest">Nutrição Consciente</p>
           </div>

           {/* Categorias de Alquimia - NOVO */}
           <div className="grid grid-cols-3 gap-2 px-2">
              <div className="p-3 glass-mystic rounded-2xl border border-aura-teal/20 text-center space-y-1">
                 <Flame size={16} className="text-aura-teal mx-auto" />
                 <p className="text-[8px] font-black text-white uppercase tracking-tighter">Anti-inflamatório</p>
              </div>
              <div className="p-3 glass-mystic rounded-2xl border border-aura-emerald/20 text-center space-y-1">
                 <Activity size={16} className="text-aura-emerald mx-auto" />
                 <p className="text-[8px] font-black text-white uppercase tracking-tighter">Probiótico</p>
              </div>
              <div className="p-3 glass-mystic rounded-2xl border border-aura-violet/20 text-center space-y-1">
                 <Zap size={16} className="text-aura-violet mx-auto" />
                 <p className="text-[8px] font-black text-white uppercase tracking-tighter">Energético</p>
              </div>
           </div>
           
           <div className="space-y-8">
             {content.menu.map((recipe, index) => (
               <section key={index} className="relative glass-mystic rounded-[3.5rem] border border-white/5 overflow-hidden group transition-all shadow-2xl">
                  {refreshingIdx === index && (
                    <div className="absolute inset-0 bg-nature-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in">
                       <Loader2 className="text-aura-gold animate-spin mb-2" size={32} />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Abrindo Portais...</span>
                    </div>
                  )}

                  <div className="p-8 space-y-6">
                     <div className="flex justify-between items-start">
                       <div className="space-y-1">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black text-aura-gold uppercase tracking-widest">{recipe.type}</span>
                           <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                              <Clock size={10} className="text-aura-gold" />
                              <span className="text-[8px] font-bold text-white uppercase">{recipe.prepTime || '15 min'}</span>
                           </div>
                           <span className="flex items-center gap-1 bg-aura-emerald/20 px-2 py-0.5 rounded-md border border-aura-emerald/30 text-[8px] font-black text-aura-emerald uppercase tracking-widest">
                              <ShieldCheck size={10} /> Testada e Aprovada
                           </span>
                         </div>
                         <h4 className="text-2xl font-serif text-white leading-snug">{recipe.title}</h4>
                       </div>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => handleOpenRefresh(index, recipe.type)} 
                           className="p-3 bg-white/5 text-ethereal-500 hover:text-white rounded-2xl border border-white/5 transition-all active:scale-90"
                           title="Ver Alternativas"
                         >
                           <RotateCcw size={18} />
                         </button>
                         <button onClick={() => handleShare(recipe)} className="p-3 bg-white/5 text-ethereal-500 hover:text-white rounded-2xl border border-white/5 transition-all"><Share2 size={18} /></button>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                       <div className="space-y-3">
                         <h5 className="text-[10px] font-black text-aura-gold uppercase tracking-widest flex items-center gap-2">
                           <Leaf size={14} /> Elementos
                         </h5>
                         <ul className="space-y-2">
                           {recipe.ingredients.map((ing, i) => (
                             <li key={i} className="text-xs text-ethereal-300 flex items-center gap-3 italic">
                               <div className="w-1 h-1 bg-aura-gold rounded-full"></div>
                               {ing}
                             </li>
                           ))}
                         </ul>
                       </div>
                       <div className="space-y-3">
                         <h5 className="text-[10px] font-black text-aura-gold uppercase tracking-widest flex items-center gap-2">
                           <Sparkles size={14} /> Processo
                         </h5>
                         {recipe.instructions.map((inst, i) => (
                           <p key={i} className="text-xs text-ethereal-400 leading-relaxed pl-4 border-l border-white/10 italic">
                             {inst}
                           </p>
                         ))}
                       </div>
                     </div>
                  </div>
               </section>
             ))}
           </div>
        </div>
      )}

      {activeSubTab === 'alquimista' && (
        <div className="space-y-8 animate-in slide-up">
           <section className="p-8 glass-mystic rounded-[3rem] border border-magic-gold/20 bg-magic-gold/5 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-magic-gold/10 blur-3xl pointer-events-none" />
              <div className="flex flex-col items-center gap-3">
                 <div className="p-3 bg-magic-gold/20 rounded-2xl text-magic-gold">
                    <Wand2 size={28} className="animate-pulse" />
                 </div>
                 <h3 className="text-2xl font-serif text-white italic">O Alquimista de Suporte</h3>
                 <p className="text-[10px] text-magic-gold font-black uppercase tracking-widest">Transmutação de Ingredientes</p>
              </div>
              
              <div className="space-y-4">
                 <p className="text-xs text-ethereal-300 italic leading-relaxed">
                   Diga-me, buscador, quais elementos você possui em seu templo (cozinha)? Eu criarei uma alquimia sagrada para você.
                 </p>
                 <div className="relative">
                    <input 
                      type="text"
                      value={ingredientsInput}
                      onChange={(e) => setIngredientsInput(e.target.value)}
                      placeholder="Ex: abacate, sementes, limão..."
                      className="w-full p-5 glass-mystic rounded-2xl text-white outline-none border border-white/10 focus:border-magic-gold transition-all shadow-inner text-sm italic"
                    />
                    <button 
                      onClick={handleAlchemistSearch}
                      disabled={loadingAlchemist || !ingredientsInput.trim()}
                      className="absolute right-2 top-2 bottom-2 px-6 bg-magic-gold text-nature-950 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-50 transition-all active:scale-95"
                    >
                      {loadingAlchemist ? <Loader2 size={16} className="animate-spin" /> : "Transmutar"}
                    </button>
                 </div>
              </div>
           </section>

           {alchemistRecipe && (
             <div className="animate-in zoom-in">
                <div className="p-8 glass-mystic rounded-[3rem] border border-magic-gold/40 bg-magic-gold/5 space-y-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 p-6 opacity-10">
                      <Sparkles size={80} className="text-magic-gold" />
                   </div>
                   
                   <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="flex items-center gap-1 bg-aura-emerald/20 px-2 py-0.5 rounded-md border border-aura-emerald/30 text-[8px] font-black text-aura-emerald uppercase tracking-widest">
                            <ShieldCheck size={10} /> Testada e Aprovada
                         </span>
                      </div>
                      <h4 className="text-2xl font-serif text-white italic tracking-tight">{alchemistRecipe.name}</h4>
                      <p className="text-xs text-ethereal-300 italic leading-relaxed">{alchemistRecipe.desc}</p>
                   </div>

                   <div className="h-px bg-gradient-to-r from-transparent via-magic-gold/20 to-transparent" />

                   <div className="grid grid-cols-1 gap-8 relative z-10">
                      <div className="space-y-4">
                         <h6 className="text-[9px] font-black uppercase tracking-widest text-magic-gold flex items-center gap-2">
                           <Droplets size={12} /> Elementos da Alquimia
                         </h6>
                         <ul className="space-y-2">
                           {alchemistRecipe.ingredients.map((ing: string, i: number) => (
                             <li key={i} className="text-[11px] text-ethereal-200 flex items-start gap-2 italic">
                               <span className="text-magic-gold mt-1">•</span> {ing}
                             </li>
                           ))}
                         </ul>
                      </div>

                      <div className="space-y-4">
                         <h6 className="text-[9px] font-black uppercase tracking-widest text-magic-gold flex items-center gap-2">
                           <Zap size={12} /> Processo de Transmutação
                         </h6>
                         <div className="space-y-4">
                           {alchemistRecipe.instructions.map((step: string, i: number) => (
                             <div key={i} className="flex gap-3">
                               <span className="text-[10px] font-serif italic text-magic-gold shrink-0">{i + 1}.</span>
                               <p className="text-[11px] text-ethereal-300 leading-relaxed italic border-l border-white/5 pl-3">
                                 {step}
                               </p>
                             </div>
                           ))}
                         </div>
                      </div>
                   </div>

                   <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-center space-y-3">
                      <Sparkles className="text-magic-gold mx-auto" size={16} />
                      <p className="text-[10px] text-ethereal-400 italic leading-relaxed px-4">
                        {alchemistRecipe.spiritualNote}
                      </p>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {activeSubTab === 'saude-intestinal' && (
        <div className="space-y-10 animate-in slide-up">
           {/* DICA DE OURO: RITMO CIRCADIANO */}
           <section className="glass-mystic p-8 rounded-[3rem] border border-magic-gold/30 bg-magic-gold/5 flex gap-6 items-start animate-in slide-in-from-right-4 shadow-xl">
              <div className="p-3 bg-magic-gold/20 rounded-2xl text-magic-gold shrink-0">
                 <Clock size={24} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                 <h4 className="text-[10px] font-black text-magic-gold uppercase tracking-widest">Ritmo da Pausa</h4>
                 <p className="text-xs text-ethereal-200 leading-relaxed italic">
                   "Para uma regeneração profunda, o jejum deve começar **logo após o jantar**. Busque realizar sua última refeição até as **20h**, permitindo que seu corpo silencie antes do descanso."
                 </p>
              </div>
           </section>

           {/* PAUSA SAGRADA (JEJUM INTERMITENTE) */}
           <section className="glass-mystic p-8 rounded-[3rem] border border-aura-violet/20 bg-gradient-to-br from-aura-violet/5 to-aura-indigo/5 space-y-8 shadow-2xl">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-aura-violet/20 rounded-2xl text-aura-violet">
                       <Moon size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-serif text-white italic">Pausa Sagrada</h3>
                       <p className="text-[10px] font-black text-aura-violet uppercase tracking-widest">O Vazio que Cura</p>
                    </div>
                 </div>
                 <div className={`p-3 rounded-full transition-all ${isFasting ? 'bg-aura-violet text-white animate-pulse' : 'bg-white/5 text-ethereal-500'}`}>
                    <Timer size={24} />
                 </div>
              </div>

              <p className="text-xs text-ethereal-400 italic leading-relaxed">
                Honre o silêncio digestivo para permitir que sua essência se regenere. Escolha seu portal de tempo:
              </p>

              <div className="flex flex-wrap gap-3">
                 {FASTING_WINDOWS.map(hours => (
                    <button
                       key={hours}
                       onClick={() => setFastingWindow(hours)}
                       className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                          fastingWindow === hours ? 'bg-aura-violet text-white border-aura-violet shadow-lg' : 'glass-mystic text-ethereal-500 border-white/5'
                       }`}
                    >
                       {hours}h
                    </button>
                 ))}
              </div>

              <button 
                 onClick={() => setIsFasting(!isFasting)}
                 className={`w-full py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                    isFasting ? 'bg-rose-950/50 text-rose-400 border border-rose-900' : 'bg-white text-nature-950 hover:scale-105 active:scale-95'
                 }`}
              >
                 {isFasting ? <><X size={18} /> Encerrar Protocolo</> : <><Zap size={18} /> Iniciar Janela de {fastingWindow}h</>}
              </button>
           </section>

           {/* ALQUIMIA EM JEJUM */}
           <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <div className="p-2 bg-aura-teal/20 rounded-xl text-aura-teal">
                    <FlaskConical size={20} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-serif text-white italic">Alquimia em Jejum</h3>
                    <p className="text-[10px] font-black text-aura-teal uppercase tracking-widest">Purificação do Despertar</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {/* SHOT DE PURIFICAÇÃO REMOVED BY USER REQUEST */}
              </div>
           </section>

           {/* ALQUIMIA VIVA (FERMENTADOS) */}
           {fermentationRecipe && (
             <section className="space-y-6">
                <div className="flex justify-between items-end px-2">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-aura-emerald/20 rounded-xl text-aura-emerald">
                         <Activity size={20} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-serif text-white italic">Alquimia Viva</h3>
                         <p className="text-[10px] font-black text-aura-emerald uppercase tracking-widest">Saúde Intestinal</p>
                      </div>
                   </div>
                   <button 
                     onClick={handleRefreshFerment}
                     className="p-3 bg-white/5 rounded-2xl border border-white/10 text-ethereal-500 hover:text-white transition-all disabled:opacity-50"
                     disabled={loadingExtras}
                   >
                     {loadingExtras ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                   </button>
                </div>

                <div className="glass-mystic p-8 rounded-[3rem] border border-aura-emerald/10 relative overflow-hidden group shadow-2xl">
                   <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-aura-emerald/5 rounded-full blur-[60px]" />
                   <div className="space-y-6">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-aura-emerald uppercase tracking-widest">Fermentação Probiótica</span>
                         <span className="flex items-center gap-1 bg-aura-emerald/20 px-2 py-0.5 rounded-md border border-aura-emerald/30 text-[8px] font-black text-aura-emerald uppercase tracking-widest">
                            <ShieldCheck size={10} /> Testada e Aprovada
                         </span>
                      </div>
                      <h4 className="text-2xl font-serif text-white italic">{fermentationRecipe.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                         <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-ethereal-500 uppercase tracking-widest flex items-center gap-2"><Droplets size={14} /> Base</h5>
                            <ul className="space-y-2">
                               {fermentationRecipe.ingredients.map((ing, i) => (
                                  <li key={i} className="text-xs text-ethereal-300 italic flex items-center gap-2">
                                     <div className="w-1 h-1 bg-aura-emerald rounded-full" /> {ing}
                                  </li>
                               ))}
                            </ul>
                         </div>
                         <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-ethereal-500 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> Transformação</h5>
                            <p className="text-xs text-ethereal-400 italic leading-relaxed pl-4 border-l border-white/10">
                               {fermentationRecipe.instructions[0]}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
             </section>
           )}

           {/* PURIFICAÇÃO DO TEMPLO */}
           <section className="glass-mystic p-8 rounded-[3rem] border border-aura-teal/30 bg-gradient-to-br from-aura-teal/10 via-transparent to-aura-teal/5 space-y-8 shadow-2xl">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-aura-teal/20 rounded-2xl text-aura-teal">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-serif text-white italic">Purificação do Templo</h3>
                    <p className="text-[10px] font-black text-aura-teal uppercase tracking-widest">Protocolo de Limpeza</p>
                 </div>
              </div>
              
              <ul className="space-y-6">
                 {purificationTips.map((tip, idx) => {
                    const isPapaya = tip.toLowerCase().includes('mamão') || tip.toLowerCase().includes('sementes');
                    return (
                       <li key={idx} className={`flex gap-5 items-start group p-4 rounded-[2rem] transition-all ${isPapaya ? 'bg-aura-teal/10 border border-aura-teal/20' : 'hover:bg-white/5'}`}>
                          <div className="mt-1 w-6 h-6 bg-aura-deep border border-white/10 rounded-full flex items-center justify-center text-[10px] font-bold text-aura-teal shrink-0 group-hover:bg-aura-teal group-hover:text-aura-deep transition-colors shadow-inner">
                             {idx + 1}
                          </div>
                          <div className="space-y-2">
                             <p className="text-xs text-ethereal-200 leading-relaxed italic">
                               {tip}
                             </p>
                             {isPapaya && (
                                <span className="flex items-center gap-2 text-[9px] font-black text-aura-gold uppercase tracking-widest animate-pulse">
                                   <AlertCircle size={12} /> Passo Essencial: Precisa Mastigar
                                </span>
                             )}
                          </div>
                       </li>
                    );
                 })}
              </ul>
              <p className="text-[9px] text-ethereal-600 uppercase tracking-[0.3em] text-center mt-4 font-black">Safe & Natural • Sem Contraindicações</p>
           </section>

           {/* DIAGNÓSTICO DE CELÍACOS - NOVO */}
           <section className="glass-mystic p-8 rounded-[3rem] border border-aura-rose/30 bg-gradient-to-br from-aura-rose/10 via-transparent to-aura-rose/5 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-aura-rose/5 blur-[80px] pointer-events-none" />
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-aura-rose/20 rounded-2xl text-aura-rose">
                    <ShieldAlert size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-serif text-white italic">Diagnóstico de Celíacos</h3>
                    <p className="text-[10px] font-black text-aura-rose uppercase tracking-widest">Protocolo de Investigação</p>
                 </div>
              </div>

              <div className="space-y-6 relative z-10">
                 <div className="p-6 bg-rose-950/20 rounded-[2rem] border border-rose-900/30 space-y-3">
                    <p className="text-xs text-ethereal-200 leading-relaxed italic">
                      "A doença celíaca é uma condição autoimune onde a ingestão de glúten causa danos ao intestino delgado. O diagnóstico preciso é fundamental para a restauração da saúde."
                    </p>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 glass-mystic rounded-2xl border border-white/5 space-y-2">
                       <h5 className="text-[10px] font-black text-aura-rose uppercase tracking-widest flex items-center gap-2">
                          <Stethoscope size={14} /> Exames de Sangue
                       </h5>
                       <p className="text-[11px] text-ethereal-300 italic leading-relaxed">
                          Pesquisa de anticorpos específicos (Anti-transglutaminase IgA, Anti-endomísio IgA). É essencial estar consumindo glúten durante os testes.
                       </p>
                    </div>
                    <div className="p-5 glass-mystic rounded-2xl border border-white/5 space-y-2">
                       <h5 className="text-[10px] font-black text-aura-rose uppercase tracking-widest flex items-center gap-2">
                          <Search size={14} /> Biópsia Intestinal
                       </h5>
                       <p className="text-[11px] text-ethereal-300 italic leading-relaxed">
                          O padrão-ouro para o diagnóstico. Realizada via endoscopia para verificar o grau de atrofia das vilosidades intestinais.
                       </p>
                    </div>
                    <div className="p-5 glass-mystic rounded-2xl border border-white/5 space-y-2">
                       <h5 className="text-[10px] font-black text-aura-rose uppercase tracking-widest flex items-center gap-2">
                          <FlaskConical size={14} /> Teste Genético
                       </h5>
                       <p className="text-[11px] text-ethereal-300 italic leading-relaxed">
                          Identificação dos genes HLA-DQ2 e HLA-DQ8. Útil para excluir a doença em casos duvidosos.
                       </p>
                    </div>
                 </div>

                 <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-start gap-4">
                    <AlertCircle className="text-aura-gold shrink-0 mt-1" size={18} />
                    <p className="text-[10px] text-ethereal-400 italic leading-relaxed">
                       Importante: Nunca retire o glúten da dieta antes de realizar os exames, pois isso pode gerar resultados falso-negativos. Consulte sempre um gastroenterologista.
                    </p>
                 </div>
              </div>
           </section>
        </div>
      )}

      {/* MODAL DE ALTERNATIVAS DE RECEITAS */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-[100] bg-ethereal-950/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-aura-deep border border-white/10 w-full max-w-lg rounded-[3rem] overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
              <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div>
                    <h4 className="text-2xl font-serif text-white italic">Portal de Escolhas</h4>
                    <p className="text-[10px] font-black text-aura-gold uppercase tracking-widest">5 Alquimias Diferentes</p>
                 </div>
                 <button onClick={() => setShowOptionsModal(false)} className="p-3 bg-white/5 rounded-2xl text-ethereal-500 hover:text-white transition-all">
                    <X size={24} />
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                 {recipeOptions.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => selectNewRecipe(opt)}
                      className="w-full p-6 glass-mystic border border-white/5 rounded-[2rem] text-left hover:border-aura-gold/50 transition-all group flex items-center justify-between gap-4"
                    >
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-aura-gold uppercase tracking-widest">Opção {i+1}</span>
                             <span className="flex items-center gap-1 bg-aura-emerald/20 px-2 py-0.5 rounded-md border border-aura-emerald/30 text-[7px] font-black text-aura-emerald uppercase tracking-widest">
                                <ShieldCheck size={8} /> Testada
                             </span>
                          </div>
                          <h5 className="text-white font-serif text-lg group-hover:text-aura-gold transition-colors italic">{opt.title}</h5>
                          <p className="text-[10px] text-ethereal-500 line-clamp-1 italic">
                            {opt.ingredients.slice(0, 3).join(', ')}...
                          </p>
                       </div>
                       <ChevronRight className="text-ethereal-700 group-hover:text-aura-gold transition-transform group-hover:translate-x-1" size={20} />
                    </button>
                 ))}
              </div>
              <footer className="p-6 text-center border-t border-white/5 bg-white/5">
                 <p className="text-[10px] text-ethereal-600 italic">Cada opção utiliza uma base de ingredientes distinta para sua evolução.</p>
              </footer>
           </div>
        </div>
      )}
    </div>
  );
};

export default Guidance;
