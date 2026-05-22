
import React, { useState, useRef, useEffect } from 'react';
import { Wind, Heart, Sparkles, Zap, Flame, Moon, Compass, Eye, Activity, Flower2, ShieldCheck, Stars, Volume2, Loader2 } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

const HEALING_PORTALS = [
  {
    id: 'conscious-breath',
    title: 'Respiração de Autocura',
    desc: 'Permita que a centelha divina use o prana para expandir sua consciência corporal.',
    icon: Wind,
    color: 'text-magic-gold',
    steps: {
      instruction: "Neste exercício de respiração rítmica, você irá inalar por quatro tempos, reter por quatro e soltar por oito. Prepare-se para sincronizar sua biologia com o ritmo do universo.",
      breathing: "Inale suavemente, permitindo que a luz divina preencha seu ser.",
      feeling: "Retenha o ar, sentindo a centelha vibrar em seu centro de força.",
      affirming: "Solte lentamente, liberando tudo o que não serve mais ao seu propósito.",
      checking: "Sinta a paz profunda que se instala. Sua luz interior agora brilha com clareza cristalina no seu templo físico."
    },
    durations: {
      breathing: 4,
      feeling: 4,
      affirming: 8,
      checking: 10
    }
  },
  {
    id: 'emotional-healing',
    title: 'Portal de Reintegração',
    desc: 'Meditação guiada para que sua luz interior dissolva sombras emocionais.',
    icon: Heart,
    color: 'text-rose-400',
    steps: {
      instruction: "Nesta meditação de reintegração, acolheremos suas emoções com amor incondicional. Siga o ritmo da respiração e permita a cura.",
      breathing: "Inale amor, ancorando sua mente na presença da sua centelha divina.",
      feeling: "Retenha a luz, acolhendo suas sombras com compaixão absoluta.",
      affirming: "Solte o passado, decretando: 'Eu sou livre, eu sou luz, eu sou amado'.",
      checking: "Sinta o abraço da sua própria alma. Você está em casa, seguro e em completa paz. Agradeça por este momento de cura."
    },
    durations: {
      breathing: 4,
      feeling: 4,
      affirming: 8,
      checking: 15
    }
  },
  {
    id: 'body-scan',
    title: 'Presença da Centelha',
    desc: 'Escaneamento do Templo para localizar onde sua luz divina precisa atuar agora.',
    icon: Activity,
    color: 'text-indigo-400',
    steps: {
      instruction: "Realizaremos agora um escaneamento consciente do seu templo físico. Siga o ritmo sagrado da respiração enquanto a luz percorre suas células.",
      breathing: "Inale a luz violeta, transmutando as densidades do seu templo físico.",
      feeling: "Retenha a presença, sentindo a centelha percorrer cada órgão e célula.",
      affirming: "Solte a harmonia, afirmando: 'Eu habito este corpo sagrado com glória'.",
      checking: "Perceba-se radiante e purificado. Sua biologia agora ressoa em harmonia perfeita com sua luz primordial. Você é um ser de luz."
    },
    durations: {
      breathing: 4,
      feeling: 4,
      affirming: 8,
      checking: 15
    }
  },
  {
    id: 'self-hypnosis',
    title: 'Autohipnose de Autocura',
    desc: 'Acesse o subconsciente para reprogramar sua biologia com comandos de cura profunda.',
    icon: Moon,
    color: 'text-purple-400',
    steps: {
      instruction: "Nesta sessão de autohipnose, acessaremos seu subconsciente. Relaxe no ritmo da respiração e permita a nova realidade biológica.",
      breathing: "Inale o relaxamento, descendo ao santuário profundo do seu ser.",
      feeling: "Retenha a paz, visualizando a luz dourada regenerando cada músculo.",
      affirming: "Solte a ordem: 'Minhas células se regeneram agora. Eu sou cura total'.",
      checking: "Sinta a nova programação se instalando. Você desperta agora sentindo-se renovado, forte e profundamente curado."
    },
    durations: {
      breathing: 4,
      feeling: 4,
      affirming: 8,
      checking: 15
    }
  },
  {
    id: 'vibration-raise',
    title: 'Frequência Divina',
    desc: 'Elevação vibracional para alinhar o corpo físico com a pureza da alma.',
    icon: Zap,
    color: 'text-orange-400',
    steps: {
      instruction: "Vamos elevar sua frequência vibracional agora. Sincronize seu prana com o ritmo universal para dissolver toda densidade.",
      breathing: "Inale a frequência do amor, a base sagrada de toda a sua autocura.",
      feeling: "Retenha o fogo solar, brilhando como um pilar de luz invencível.",
      affirming: "Solte a expansão: 'Minha centelha divina é meu escudo. Eu sou luz'.",
      checking: "Sinta-se blindado e profundamente iluminado. Nada além da luz pode habitar este santuário sagrado que é você. Sinta a força."
    },
    durations: {
      breathing: 4,
      feeling: 4,
      affirming: 8,
      checking: 15
    }
  }
];

// Helper functions for audio decoding as per guidelines
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AudioWave: React.FC = () => (
  <div className="flex items-end justify-center gap-1 h-8 mt-4">
    {[...Array(5)].map((_, i) => (
      <div 
        key={i} 
        className="w-1 bg-aura-gold rounded-full animate-bounce" 
        style={{ 
          height: `${Math.random() * 100}%`,
          animationDuration: `${0.5 + Math.random() * 1}s` 
        }} 
      />
    ))}
  </div>
);

const Wellness: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ritualStep, setRitualStep] = useState<'idle' | 'preparing' | 'instruction' | 'breathing' | 'feeling' | 'affirming' | 'checking' | 'completed'>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [activePortal, setActivePortal] = useState<typeof HEALING_PORTALS[0] | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const ritualActiveRef = useRef(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const preloadedAudioRef = useRef<Record<string, string>>({});

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const playAudio = async (base64: string) => {
    initAudioContext();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') await ctx.resume();

    const bytes = decodeBase64(base64);
    const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
    
    return new Promise<void>((resolve) => {
      const source = ctx.createBufferSource();
      currentSourceRef.current = source;
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setIsPlayingAudio(false);
        currentSourceRef.current = null;
        resolve();
      };
      setIsPlayingAudio(true);
      source.start();
    });
  };

  const stopRitual = () => {
    ritualActiveRef.current = false;
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setRitualStep('idle');
    setActivePortal(null);
    setCountdown(null);
    setBreathingPhase("");
    setIsPlayingAudio(false);
  };

  const playBell = (isTick = false) => {
    initAudioContext();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isTick) {
      // High-pitched "ting" like a small meditation bell
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Richer, deeper Tibetan bell sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
      
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1320, ctx.currentTime); // Harmonic
      
      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.1, ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

      osc.connect(bellGain);
      osc2.connect(bellGain);
      osc3.connect(bellGain);
      bellGain.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc3.start();
      osc.stop(ctx.currentTime + 3.0);
      osc2.stop(ctx.currentTime + 3.0);
      osc3.stop(ctx.currentTime + 3.0);
    }
  };

  const [breathingPhase, setBreathingPhase] = useState<string>("");

  const startRitual = async (portalId: string) => {
    const portal = HEALING_PORTALS.find(p => p.id === portalId);
    if (!portal) return;

    ritualActiveRef.current = true;
    setLoading(true);
    setActivePortal(portal);
    setRitualStep('preparing');
    setCountdown(null);
    setBreathingPhase("");
    setCurrentCycle(0);
    
    try {
      // Pre-generate short commands and numbers for fluidity
      const fastInstruction = "Diga apenas a palavra, de forma curta, rápida e objetiva, sem entonação excessiva.";
      const [inhaleAudio, holdAudio, exhaleAudio, ...numberAudios] = await Promise.all([
        generateSpeech("Inale", fastInstruction),
        generateSpeech("Retenha", fastInstruction),
        generateSpeech("Exale", fastInstruction),
        ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => generateSpeech(n.toString(), fastInstruction))
      ]);

      preloadedAudioRef.current = {
        inhale: inhaleAudio || "",
        hold: holdAudio || "",
        exhale: exhaleAudio || "",
        ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => [n.toString(), numberAudios[i] || ""]))
      };

      // Phase 1: Instruction
      const instructionText = (portal.steps as any).instruction;
      if (instructionText) {
        setRitualStep('instruction');
        const instructionAudio = await generateSpeech(instructionText + " Prepare-se para começar.");
        if (instructionAudio && ritualActiveRef.current) {
          await playAudio(instructionAudio);
        }
      }

      if (!ritualActiveRef.current) return;

      // Loop for 5 cycles
      for (let cycle = 1; cycle <= 5; cycle++) {
        if (!ritualActiveRef.current) return;
        setCurrentCycle(cycle);

        // Announce new cycle if not the first one
        if (cycle > 1) {
          const cycleAudio = await generateSpeech(`Iniciando ciclo ${cycle}.`);
          if (cycleAudio && ritualActiveRef.current) {
            await playAudio(cycleAudio);
          }
        } else {
          const startAudio = await generateSpeech("Começando agora.");
          if (startAudio && ritualActiveRef.current) {
            await playAudio(startAudio);
          }
        }

        if (!ritualActiveRef.current) return;

        // Phase 2: Bell and Transition
        playBell();
        await new Promise(r => setTimeout(r, 1000));

        if (!ritualActiveRef.current) return;

        const runCycle = async (label: string, count: number, stepName: 'breathing' | 'feeling' | 'affirming', audioKey: string) => {
          if (!ritualActiveRef.current) return;
          setRitualStep(stepName);
          setBreathingPhase(label);
          
          // Play the command (Inale/Retenha/Exale)
          const commandAudio = preloadedAudioRef.current[audioKey];
          if (commandAudio) playAudio(commandAudio);
          
          playBell(); // Main bell at start of phase
          
          for (let i = 1; i <= count; i++) {
            if (!ritualActiveRef.current) return;
            setCountdown(i);
            
            // Play number audio and tick bell for seconds after the first one
            if (i > 1) {
              const numAudio = preloadedAudioRef.current[i.toString()];
              if (numAudio) playAudio(numAudio);
              playBell(true); // Tick for each second except the first one
            }
            
            await new Promise(r => setTimeout(r, 1000));
          }
        };

        // 4-4-8 Cycle for ALL portals
        await runCycle("Inale", 4, 'breathing', 'inhale');
        await runCycle("Retenha", 4, 'feeling', 'hold');
        await runCycle("Exale", 8, 'affirming', 'exhale');
      }

      // Final Check (only once after all cycles)
      if (!ritualActiveRef.current) return;
      setBreathingPhase("");
      setCountdown(null);
      setRitualStep('checking');
      const finalAudio = await generateSpeech(portal.steps.checking);
      if (finalAudio && ritualActiveRef.current) {
        const duration = (portal as any).durations?.checking || 10;
        playAudio(finalAudio);
        for (let i = duration; i >= 1; i--) {
          if (!ritualActiveRef.current) return;
          setCountdown(i);
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      if (ritualActiveRef.current) setRitualStep('completed');
    } catch (e) {
      console.error("Audio ritual failed:", e);
      if (ritualActiveRef.current) setRitualStep('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-32 max-w-2xl mx-auto space-y-12 animate-in fade-in">
      <header className="px-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-magic-gold">
          <Stars size={16} />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Portal da Autocura</p>
          <Stars size={16} />
        </div>
        <h2 className="text-4xl font-serif text-white tracking-tighter italic leading-none">Santuário de Autocura</h2>
      </header>

      <div className="px-4 space-y-8">
        {ritualStep === 'idle' ? (
           <div className="grid grid-cols-1 gap-8 animate-in fade-in">
             <div className="p-10 glass-mystic border border-magic-gold/20 rounded-[3rem] text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-magic-gold/5 blur-[50px] pointer-events-none" />
                <p className="text-xs text-ethereal-100 italic leading-relaxed relative z-10 font-light">
                  "Lembre-se, peregrino: a cura não é algo que você recebe, é algo que você <span className="text-magic-gold font-bold">permite</span>."
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {HEALING_PORTALS.map(portal => (
                 <div key={portal.id} className="glass-mystic p-8 rounded-[3.5rem] border border-white/10 space-y-5 hover:border-magic-gold/50 transition-all group shadow-2xl relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                    <div className={`absolute -top-10 -left-10 w-40 h-40 ${portal.color.replace('text-', 'bg-')}/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    
                    <div className="flex items-center gap-5">
                       <div className={`p-5 rounded-[2rem] bg-white/5 ${portal.color} group-hover:scale-110 transition-transform duration-700 shadow-inner border border-white/15 relative`}>
                          <div className={`absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${portal.color.replace('text-', 'bg-')}`} />
                          <portal.icon size={32} className="relative z-10" />
                       </div>
                       <div>
                          <h4 className="text-2xl font-serif text-white font-bold tracking-tight drop-shadow-md">{portal.title}</h4>
                          <p className="text-[9px] text-magic-gold/60 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Volume2 size={12} className="animate-pulse" /> Ativação Sonora
                          </p>
                       </div>
                    </div>
                    
                    <p className="text-[11px] text-ethereal-300 italic leading-relaxed px-1">{portal.desc}</p>
                    
                    <button 
                      onClick={() => startRitual(portal.id)} 
                      disabled={loading}
                      className="w-full py-5 bg-white text-nature-950 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 group-hover:bg-magic-gold group-hover:text-white disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <>ABRIR PORTAL <Volume2 size={16} className="animate-pulse" /></>}
                    </button>
                 </div>
               ))}
             </div>
           </div>
        ) : (
          <div className="glass-mystic p-12 rounded-[5rem] text-center space-y-12 flex flex-col items-center justify-center min-h-[600px] animate-in zoom-in border border-magic-gold/30 relative overflow-hidden shadow-[0_0_120px_rgba(212,175,55,0.15)] bg-gradient-to-b from-white/[0.02] to-transparent">
             <div className="absolute inset-0 bg-magic-gold/5 blur-3xl pointer-events-none" />
             <div className="absolute top-0 left-0 w-64 h-64 bg-aura-violet/5 blur-[100px] pointer-events-none" />
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-aura-teal/5 blur-[100px] pointer-events-none" />
             
             {/* Oráculo Visual */}
             <div className="relative">
                <div className="absolute inset-0 bg-magic-gold/20 blur-[80px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-aura-violet/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '-2s' }} />
                <div className="relative w-64 h-64 rounded-full border-2 border-magic-gold/10 flex items-center justify-center">
                   <div className="animate-breath relative">
                      {ritualStep === 'breathing' && <Wind size={90} className="text-magic-gold" />}
                      {ritualStep === 'feeling' && <Eye size={90} className="text-indigo-400" />}
                      {ritualStep === 'affirming' && <Flame size={90} className="text-orange-400" />}
                      {ritualStep === 'checking' && <Heart size={90} className="text-rose-400" />}
                      {ritualStep === 'completed' && <Sparkles size={90} className="text-magic-gold" />}
                      {ritualStep === 'preparing' && <Loader2 size={90} className="text-aura-violet animate-spin" />}
                      
                      {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">{countdown}</span>
                        </div>
                      )}
                   </div>
                </div>
                {/* Halo Rotativo */}
                <div className="absolute inset-[-20px] border-t border-magic-gold/30 rounded-full animate-spin-slow" />
             </div>
             
             <div className="space-y-6 relative z-10 max-w-xs">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-magic-gold uppercase tracking-[0.4em]">Guia pela Voz da Alma</p>
                   <h3 className="text-4xl font-serif text-white italic tracking-tight">
                    {ritualStep === 'preparing' && "Sintonizando..."}
                    {ritualStep === 'instruction' && "Ouça a Instrução"}
                    {ritualStep === 'breathing' && (currentCycle > 0 ? `Ciclo ${currentCycle}: Inale` : "Inale a Luz")}
                    {ritualStep === 'feeling' && (currentCycle > 0 ? `Ciclo ${currentCycle}: Retenha` : "Retenha a Essência")}
                    {ritualStep === 'affirming' && (currentCycle > 0 ? `Ciclo ${currentCycle}: Solte` : "Solte a Cura")}
                    {ritualStep === 'checking' && "Integre o Ser"}
                    {ritualStep === 'completed' && "Cura Consolidada"}
                  </h3>
                </div>
                
                <div className="min-h-[120px] flex flex-col items-center justify-center">
                  <p className="text-sm text-ethereal-100 italic leading-relaxed font-light mb-4 text-center">
                    {breathingPhase && <span className="text-2xl font-serif text-magic-gold block mb-2 not-italic font-bold tracking-widest uppercase">{breathingPhase}</span>}
                    {activePortal && ritualStep !== 'completed' && ritualStep !== 'preparing' && ritualStep !== 'instruction' && !breathingPhase && activePortal.steps[ritualStep as keyof typeof activePortal.steps]}
                    {activePortal && ritualStep === 'instruction' && (activePortal.steps as any).instruction}
                    {ritualStep === 'preparing' && "Respire fundo enquanto sintonizamos a frequência da sua centelha divina..."}
                    {ritualStep === 'completed' && "Seu templo físico e sua alma agora ressoam em uma oitava superior. Siga em paz e luz."}
                  </p>
                  {isPlayingAudio && <AudioWave />}
                </div>
             </div>

             {ritualStep === 'completed' ? (
               <button 
                onClick={() => {setRitualStep('idle'); setActivePortal(null);}} 
                className="relative z-10 px-12 py-6 bg-white text-nature-950 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 shadow-2xl transition-all border border-magic-gold/20"
               >
                  Selar Alquimia
               </button>
             ) : (
               <button 
                onClick={stopRitual} 
                className="relative z-10 px-8 py-4 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-full font-black text-[8px] uppercase tracking-[0.3em] transition-all border border-white/10"
               >
                  Interromper Ritual
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wellness;
