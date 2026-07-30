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
  VolumeX,
  Play,
  Pause,
  Wand2,
  Timer,
  X,
  RotateCcw,
  ChevronRight,
  Share2,
  CheckCircle2
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

const DEFAULT_DAILY_INSIGHT: DailyInsight = {
  oracleMessage: "Olhe para dentro. Nas profundezas do seu silêncio habita a verdade imutável do seu ser.",
  dailyExercise: "Pressione suavemente a ponta da língua no palato e respire pelo nariz de forma lenta por cinco ciclos.",
  dailyRitual: {
    type: "Meditação",
    title: "Ritual do Alvorecer Cósmico",
    elements: ["Copo de água morna", "Espaço silencioso"],
    process: [
      "Ao acordar, sente-se ereto em silêncio.",
      "Beba o copo de água morna agradecendo por mais um dia no templo.",
      "Respire fundo por 5 minutos visualizando uma luz dourada no peito."
    ],
    purpose: "Ancorar a presença e a paz no início do dia."
  },
  shadowPrompt: "Qual medo ou sombra do passado estou permitindo que controle minhas escolhas de hoje?"
};

const DEFAULT_DAILY_CONTENT: DailyContent = {
  motivation: "Sua saúde é o seu altar. Trate o seu templo físico com a reverência que ele merece hoje.",
  dailyChallenge: "Mastigue cada garfada pelo menos 30 vezes e coma em absoluto silêncio.",
  menu: [
    {
      title: "Creme de Abacate Ancestral",
      type: "Desjejum",
      ingredients: ["1/2 abacate maduro", "Suco de 1/2 limão", "1 colher de sopa de mel silvestre", "Sementes de girassol torradas"],
      instructions: [
        "Amasse o abacate com um garfo até ficar homogêneo.",
        "Misture o suco de limão e o mel incorporando levemente.",
        "Finalize com sementes de girassol por cima para dar textura e energia."
      ],
      prepTime: "5 min"
    },
    {
      title: "Escondidinho de Mandioca com Frango Desfiado",
      type: "Almoço",
      ingredients: ["300g de mandioca cozida", "150g de peito de frango cozido e desfiado", "Cebola, alho, cúrcuma e sal marinho", "Azeite de oliva extra virgem"],
      instructions: [
        "Amasse a mandioca cozida com um pouco da água do cozimento até formar um purê macio.",
        "Refogue o frango desfiado com cebola, alho, cúrcuma e sal no azeite.",
        "Em um refratário, coloque o frango refogado e cubra com o purê de mandioca.",
        "Leve ao forno por 15 minutos para dourar levemente."
      ],
      prepTime: "25 min"
    },
    {
      title: "Sopa de Abóbora com Gengibre Regeneradora",
      type: "Jantar",
      ingredients: ["400g de abóbora cabotiá picada", "1 pedaço pequeno de gengibre fresco ralado", "1 cebola picada", "Sal marinho e azeite de oliva"],
      instructions: [
        "Refogue a cebola e o gengibre ralado com azeite em uma panela média.",
        "Adicione a abóbora picada, cubra com água filtrada e cozinhe até ficar bem macia.",
        "Bata tudo no liquidificador até obter um creme sedoso.",
        "Sirva quente com um fio de azeite extra virgem."
      ],
      prepTime: "20 min"
    }
  ]
};

const FASTING_WINDOWS = [12, 14, 16, 18, 24];

const Guidance: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'jornada' | 'autocura' | 'saude-intestinal'>('jornada');
  const [content, setContent] = useState<DailyContent | null>(null);
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [ingredientsInput, setIngredientsInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("reconexao_alchemist_input") || "";
    }
    return "";
  });
  const [alchemistRecipe, setAlchemistRecipe] = useState<any | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reconexao_alchemist_recipe");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing cached alchemist recipe:", e);
        }
      }
    }
    return null;
  });
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
  const audioCacheRef = useRef<Record<string, string>>({});
  const [loadingAudioText, setLoadingAudioText] = useState<string | null>(null);

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
        setInsight(insightData || DEFAULT_DAILY_INSIGHT);
        setContent(dailyContent || DEFAULT_DAILY_CONTENT);
        
        // Robust recipe check to prevent rendering crashes if the API returns non-recipe objects
        if (ferment && typeof ferment === 'object' && ferment.title && Array.isArray(ferment.ingredients) && Array.isArray(ferment.instructions)) {
          setFermentationRecipe(ferment);
        } else {
          setFermentationRecipe({
            title: "Kefir de Água do Templo",
            type: "Fermentação Probiótica",
            ingredients: ["500ml de água filtrada", "2 colheres de sopa de açúcar mascavo integral", "2 colheres de grãos de kefir de água"],
            instructions: [
              "Dissolva o açúcar mascavo na água em um pote de vidro.",
              "Adicione os grãos de kefir e cubra com um pano limpo preso por elástico.",
              "Deixe fermentar em local escuro por 24 a 48 horas.",
              "Coe os grãos e consuma a bebida probiótica refrescante."
            ]
          });
        }

        // Robust array check to prevent rendering crashes if API returns objects or strings
        if (Array.isArray(tips) && tips.length > 0) {
          setPurificationTips(tips);
        } else {
          setPurificationTips([
            "Beba um copo de água morna com limão pela manhã para despertar o sistema digestivo.",
            "Mastigue sementes de mamão frescas pela manhã para liberação de emulsinas e enzimas purificadoras.",
            "Mantenha jejum noturno de 12 a 16 horas para permitir a regeneração celular.",
            "Evite ingerir líquidos frios durante as refeições principais para preservar as enzimas digestivas.",
            "Consuma chás amargos (como dente-de-leão ou alcachofra) antes das principais refeições."
          ]);
        }
      } catch (error) {
        console.error("Error loading guidance:", error);
        setInsight(DEFAULT_DAILY_INSIGHT);
        setContent(DEFAULT_DAILY_CONTENT);
        setFermentationRecipe({
          title: "Kefir de Água do Templo",
          type: "Fermentação Probiótica",
          ingredients: ["500ml de água filtrada", "2 colheres de sopa de açúcar mascavo integral", "2 colheres de grãos de kefir de água"],
          instructions: [
            "Dissolva o açúcar mascavo na água em um pote de vidro.",
            "Adicione os grãos de kefir e cubra com um pano limpo preso por elástico.",
            "Deixe fermentar em local escuro por 24 a 48 horas.",
            "Coe os grãos e consuma a bebida probiótica refrescante."
          ]
        });
        setPurificationTips([
          "Beba um copo de água morna com limão pela manhã para despertar o sistema digestivo.",
          "Mastigue sementes de mamão frescas pela manhã para liberação de emulsinas e enzimas purificadoras.",
          "Mantenha jejum noturno de 12 a 16 horas para permitir a regeneração celular.",
          "Evite ingerir líquidos frios durante as refeições principais para preservar as enzimas digestivas.",
          "Consuma chás amargos (como dente-de-leão ou alcachofra) antes das principais refeições."
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fallbackSpeech = (textToSpeak: string) => {
    setLoadingAudioText(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8; // Cadência serena, calma e pausada
      utterance.pitch = 1.0; // Tom feminino natural e acolhedor

      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
        const femaleVoice = ptVoices.find(v => 
          /luciana|helena|fernanda|francisca|vitoria|marcia|joana|female|feminina|google português/i.test(v.name)
        ) || ptVoices.find(v => !/male|masculino|felipe|daniel|ricardo/i.test(v.name)) || ptVoices[0];

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      };

      setVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
    }
  };

  const playBase64AudioCtx = async (base64: string): Promise<boolean> => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Wrap PCM in WAV header for native decoding across all mobile devices
      let wavBuffer: ArrayBuffer;
      if (bytes.length >= 44 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        wavBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      } else {
        const header = new ArrayBuffer(44);
        const view = new DataView(header);
        view.setUint32(0, 0x52494646, false); // "RIFF"
        view.setUint32(4, 36 + bytes.length, true);
        view.setUint32(8, 0x57415645, false); // "WAVE"
        view.setUint32(12, 0x666d7420, false); // "fmt "
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, 24000, true); // Sample rate
        view.setUint32(28, 24000 * 2, true); // Byte rate
        view.setUint16(32, 2, true); // Block align
        view.setUint16(34, 16, true); // Bits per sample
        view.setUint32(36, 0x64617461, false); // "data"
        view.setUint32(40, bytes.length, true);

        const combined = new Uint8Array(44 + bytes.length);
        combined.set(new Uint8Array(header), 0);
        combined.set(bytes, 44);
        wavBuffer = combined.buffer;
      }

      let audioBuffer: AudioBuffer | null = await new Promise((resolve) => {
        let done = false;
        try {
          ctx.decodeAudioData(
            wavBuffer.slice(0),
            (buf) => { if (!done) { done = true; resolve(buf); } },
            () => { if (!done) { done = true; resolve(null); } }
          ).catch(() => { if (!done) { done = true; resolve(null); } });
        } catch (e) {
          if (!done) { done = true; resolve(null); }
        }
      });

      if (!audioBuffer) {
        const rawBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        const dataInt16 = new Int16Array(rawBuffer);
        const frameCount = dataInt16.length;
        if (frameCount > 0) {
          audioBuffer = ctx.createBuffer(1, frameCount, 24000);
          const channelData = audioBuffer.getChannelData(0);
          for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
          }
        }
      }

      if (!audioBuffer) return false;

      return new Promise((resolve) => {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => resolve(true);
        source.start(0);
      });
    } catch (e) {
      console.warn("playBase64AudioCtx error:", e);
      return false;
    }
  };

  const playGuidance = async (text: string, customInstruction?: string) => {
    if (isPlaying || loadingAudioText) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setLoadingAudioText(null);
      return;
    }

    setIsPlaying(true);

    // Instant playback if audio is preloaded in cache
    const cached = audioCacheRef.current[text];
    if (cached) {
      const success = await playBase64AudioCtx(cached);
      if (success) {
        setIsPlaying(false);
        return;
      }
    }

    // Fetch audio on demand with loading indicator
    setLoadingAudioText(text);
    try {
      const prompt = customInstruction || "Você é uma pessoa real falando em português do Brasil de forma fluida, natural, expressiva e acolhedora. Fale com tom humano caloroso e ritmo espontâneo de conversa.";
      const audioBase64 = await generateSpeech(text, prompt);
      setLoadingAudioText(null);
      if (audioBase64) {
        audioCacheRef.current[text] = audioBase64;
        const success = await playBase64AudioCtx(audioBase64);
        if (success) {
          setIsPlaying(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Speech generation error, falling back to browser speech:", e);
      setLoadingAudioText(null);
    }

    fallbackSpeech(text);
  };

  const handleAlchemistSearch = async () => {
    if (!ingredientsInput.trim()) return;
    setLoadingAlchemist(true);
    try {
      localStorage.setItem("reconexao_alchemist_input", ingredientsInput);
      const recipe = await generateAlchemistRecipe(ingredientsInput);
      setAlchemistRecipe(recipe);
      if (recipe) {
        localStorage.setItem("reconexao_alchemist_recipe", JSON.stringify(recipe));
      } else {
        localStorage.removeItem("reconexao_alchemist_recipe");
      }
    } catch (error) {
      console.error("Error transmuting ingredients:", error);
    } finally {
      setLoadingAlchemist(false);
    }
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
    try {
      const ferment = await generateFermentationRecipe();
      if (ferment && typeof ferment === 'object' && ferment.title && Array.isArray(ferment.ingredients) && Array.isArray(ferment.instructions)) {
        setFermentationRecipe(ferment);
      }
    } catch (e) {
      console.warn("Failed to refresh fermentation recipe:", e);
    } finally {
      setLoadingExtras(false);
    }
  };

  const handleShare = (recipe: Recipe) => {
    const shareText = `Confira esta alquimia nutritiva do ReViva: ${recipe.title}. ✨`;
    if (navigator.share) {
      navigator.share({ title: 'ReViva Alquimia', text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
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
    <div className="p-4 pt-safe pb-safe-nav max-w-2xl mx-auto space-y-8 animate-in fade-in">
       <header className="space-y-1 text-center">
          <h2 className="text-4xl font-serif text-white italic">Bússola da Alma</h2>
          <p className="text-aura-gold text-[10px] font-black uppercase tracking-widest">Portal do Guia</p>
       </header>

       <div className="flex glass-mystic p-1 rounded-2xl gap-1 mx-2 shadow-2xl overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveSubTab('jornada')} className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'jornada' ? 'bg-aura-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-ethereal-500'}`}>Jornada</button>
          <button onClick={() => setActiveSubTab('autocura')} className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'autocura' ? 'bg-aura-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-ethereal-500'}`}>Autocura</button>
          <button onClick={() => setActiveSubTab('saude-intestinal')} className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'saude-intestinal' ? 'bg-aura-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-ethereal-500'}`}>Saúde Intestinal</button>
       </div>

      {activeSubTab === 'jornada' && content && (
        <div className="space-y-8 animate-in fade-in">
          {/* Mensagem do Dia */}
          <section className="relative p-8 sm:p-10 glass-mystic rounded-[4rem] border border-aura-violet/30 bg-aura-violet/5 text-center space-y-6 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-aura-violet/10 blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 p-3 bg-aura-deep border border-aura-violet/30 rounded-full text-aura-violet shadow-[0_0_20px_rgba(139,92,246,0.3)]">
               <Sparkles size={24} className="animate-pulse" />
            </div>

            <div className="space-y-4 pt-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-aura-gold">Mensagem do Oráculo</span>
              <p className="text-lg sm:text-xl font-serif text-white leading-relaxed italic px-2">
                "{insight?.oracleMessage || content.motivation}"
              </p>
            </div>
          </section>

          {/* Exercício Bioenergético Diário */}
          {insight?.dailyExercise && (
            <section className="p-8 glass-mystic rounded-[3rem] border border-aura-gold/30 bg-aura-gold/5 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-aura-gold">
                <Zap size={22} className="animate-pulse" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Exercício de Prana Diário</h4>
              </div>
              <p className="text-xs text-ethereal-100 leading-relaxed italic font-light">
                {insight.dailyExercise}
              </p>
              <button
                onClick={() => playGuidance(`Exercício bioenergético do dia: ${insight.dailyExercise}`)}
                className="mt-2 text-[9px] font-black text-aura-gold uppercase tracking-widest flex items-center gap-2 hover:underline"
              >
                <Volume2 size={14} /> Ouvir Instruções do Exercício
              </button>
            </section>
          )}

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* O RITUAL DO ALHO */}
                 <div className="glass-mystic p-6 rounded-[2.5rem] border border-aura-teal/10 bg-gradient-to-br from-aura-teal/5 to-transparent space-y-4 shadow-xl flex flex-col justify-between hover:border-aura-teal/30 transition-all duration-300">
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-aura-teal">
                          <div className="p-2 bg-aura-teal/10 rounded-xl">
                             <ShieldCheck size={18} />
                          </div>
                          <h4 className="font-serif text-lg text-white">Ritual do Alho</h4>
                       </div>
                       <p className="text-[9px] font-black text-aura-teal/80 uppercase tracking-widest">Desparasitação Natural</p>
                       <p className="text-xs text-ethereal-300 leading-relaxed italic">
                         "Corte 2 a 3 lâminas finas de alho fresco e tome-as com água pura como se fossem comprimidos. Isso evita o sabor residual e limpa o templo profundamente de parasitas e inflamações."
                       </p>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-ethereal-500 uppercase tracking-widest">
                       <span>Frequência: Diário</span>
                       <span className="text-aura-teal">Ativo</span>
                    </div>
                 </div>

                 {/* SHOT FOGO DIGESTIVO */}
                 <div className="glass-mystic p-6 rounded-[2.5rem] border border-magic-gold/15 bg-gradient-to-br from-magic-gold/5 to-transparent space-y-4 shadow-xl flex flex-col justify-between hover:border-magic-gold/30 transition-all duration-300">
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-magic-gold">
                          <div className="p-2 bg-magic-gold/10 rounded-xl">
                             <Flame size={18} />
                          </div>
                          <h4 className="font-serif text-lg text-white">Fogo Digestivo</h4>
                        </div>
                        <p className="text-[9px] font-black text-magic-gold/80 uppercase tracking-widest">Ativação & Imunidade</p>
                        <p className="text-xs text-ethereal-300 leading-relaxed italic">
                          "Suco de 1/2 limão, 1 colher de café de cúrcuma pura, uma pitada de pimenta preta e raspas de gengibre em 50ml de água morna. Acende seu fogo interno (Agni) e desinflama a mucosa."
                        </p>
                     </div>
                     <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-ethereal-500 uppercase tracking-widest">
                        <span>Frequência: Manhã</span>
                        <span className="text-magic-gold">Ativo</span>
                     </div>
                  </div>

                  {/* SHOT pH DO TEMPLO */}
                  <div className="glass-mystic p-6 rounded-[2.5rem] border border-aura-violet/15 bg-gradient-to-br from-aura-violet/5 to-transparent space-y-4 shadow-xl flex flex-col justify-between hover:border-aura-violet/30 transition-all duration-300">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-aura-violet">
                           <div className="p-2 bg-aura-violet/10 rounded-xl">
                              <Droplets size={18} />
                           </div>
                           <h4 className="font-serif text-lg text-white">Equilíbrio do Templo</h4>
                        </div>
                        <p className="text-[9px] font-black text-aura-violet/80 uppercase tracking-widest">pH & Glicemia</p>
                        <p className="text-xs text-ethereal-300 leading-relaxed italic">
                          "1 colher de sopa de vinagre de maçã orgânico diluída em 50ml de água morna antes da primeira refeição. Prepara o estômago com acidez ideal e melhora a sensibilidade insulínica."
                        </p>
                     </div>
                     <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-ethereal-500 uppercase tracking-widest">
                        <span>Frequência: Pré-refeição</span>
                        <span className="text-aura-violet">Ativo</span>
                     </div>
                  </div>
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

      {/* Beautiful Copy Link Toast */}
      {showCopyToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in slide-up duration-300">
          <div className="glass-mystic p-5 rounded-3xl border border-magic-gold/30 bg-magic-gold/10 backdrop-blur-xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
            <div className="p-2 bg-magic-gold/20 rounded-xl text-magic-gold">
              <CheckCircle2 size={20} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-magic-gold">Frequência Compartilhada</p>
              <p className="text-xs text-ethereal-100 italic leading-snug">Link copiado para sua egrégora! ✨</p>
            </div>
            <button 
              onClick={() => setShowCopyToast(false)}
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

export default Guidance;
