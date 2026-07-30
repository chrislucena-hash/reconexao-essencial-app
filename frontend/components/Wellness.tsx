import React, { useState, useRef } from 'react';
import { Wind, Heart, Sparkles, Zap, Flame, Moon, Eye, Activity, Stars, Volume2, Loader2, Headphones } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

export interface HealingPortal {
  id: string;
  category: 'breathing' | 'meditation' | 'hypnosis';
  hasVoice: boolean;
  title: string;
  badge: string;
  desc: string;
  icon: any;
  color: string;
  steps: {
    instruction: string;
    breathing: string;
    feeling: string;
    affirming: string;
    checking: string;
  };
  durations: {
    breathing: number;
    feeling: number;
    affirming: number;
    checking: number;
  };
}

const HEALING_PORTALS: HealingPortal[] = [
  {
    id: 'conscious-breath',
    category: 'breathing',
    hasVoice: false,
    title: 'Respiração de Autocura (4-4-8)',
    badge: 'Respiração Guiada por Sinos',
    desc: 'Pranayama rítmico acompanhado por sinos tibetanos e orbe de luz. Isento de voz falada para silenciar a mente.',
    icon: Wind,
    color: 'text-magic-gold',
    steps: {
      instruction: "Sintonize o ritmo sagrado da sua respiração. Acompanhe a expansão do orbe visual e os sinos sutis.",
      breathing: "Inale a luz divina (4 tempos)...",
      feeling: "Retenha a energia no seu centro de força (4 tempos)...",
      affirming: "Solte suavemente, liberando tensões (8 tempos)...",
      checking: "Permaneça na quietude. Seu ritmo respiratório restaurou o equilíbrio da sua energia vital."
    },
    durations: {
      breathing: 4,
      feeling: 4,
      affirming: 8,
      checking: 10
    }
  },
  {
    id: 'pranayama-balance',
    category: 'breathing',
    hasVoice: false,
    title: 'Pranayama do Equilíbrio Vital',
    badge: 'Respiração Rítmica',
    desc: 'Respiração quadrada harmônica em 5 tempos para acalmar o sistema nervoso e estabilizar batimentos.',
    icon: Activity,
    color: 'text-emerald-400',
    steps: {
      instruction: "Sente-se confortavelmente com a coluna ereta. Prepare-se para a respiração de equilíbrio prânico.",
      breathing: "Inale vitalidade e serenidade...",
      feeling: "Retenha o ar com leveza no peito...",
      affirming: "Exale e dissipe toda ansiedade...",
      checking: "Sinta a desaceleração benéfica do seu corpo. Sinta o fluxo da paz interior."
    },
    durations: {
      breathing: 5,
      feeling: 5,
      affirming: 5,
      checking: 10
    }
  },
  {
    id: 'emotional-healing',
    category: 'meditation',
    hasVoice: true,
    title: 'Meditação: Reintegração Emocional',
    badge: 'Meditação Guiada por Voz',
    desc: 'Condução meditativa por voz calma e amorosa para dissolver ansiedade, medos e mágoas no abraço da luz.',
    icon: Heart,
    color: 'text-rose-400',
    steps: {
      instruction: "Acolha este momento com profunda serenidade. Feche os olhos, solte os ombros e permita que esta voz calma conduza sua alma a um estado de amor incondicional.",
      breathing: "Inale suavemente uma luz dourada e amorosa. Permita que ela envolva seu peito e ilumine cada batimento do seu coração.",
      feeling: "Retenha essa luz com doçura. Acolha qualquer preocupação com compaixão, sentindo-se protegido no abraço do divino.",
      affirming: "Ao exalar lentamente, liberte o passado. Decrete em seu coração: 'Eu sou paz, eu sou luz, eu acolho minha cura'.",
      checking: "Sinta a harmonia profunda restabelecida em seu ser. Suas emoções agora repousam em serena quietude."
    },
    durations: {
      breathing: 5,
      feeling: 5,
      affirming: 8,
      checking: 12
    }
  },
  {
    id: 'body-scan',
    category: 'meditation',
    hasVoice: true,
    title: 'Meditação: Presença da Centelha',
    badge: 'Escaneamento do Templo',
    desc: 'Escaneamento meditativo por voz doce e serena para purificar o campo físico e revitalizar suas células.',
    icon: Sparkles,
    color: 'text-indigo-400',
    steps: {
      instruction: "Realizaremos um escaneamento meditado do seu templo físico. Permita que a voz amorosa guie a energia cristalina por todo o seu corpo.",
      breathing: "Inale uma luz violeta e purificadora. Sinta-a relaxar sua mente, pescoço e coluna, dissolvendo tensões.",
      feeling: "Mantenha a atenção amorosa em seus órgãos e células, sentindo a centelha divina regenerar seu organismo.",
      affirming: "Exale a rigidez e o cansaço. Afirme com ternura: 'Habito este corpo com saúde plena, paz e glória'.",
      checking: "Perceba seu templo físico radiante, leve e reenergizado. Sua biologia ressoa na frequência perfeita do amor."
    },
    durations: {
      breathing: 5,
      feeling: 5,
      affirming: 8,
      checking: 12
    }
  },
  {
    id: 'vibration-raise',
    category: 'meditation',
    hasVoice: true,
    title: 'Meditação: Frequência da Alma',
    badge: 'Elevação Vibracional',
    desc: 'Prática de elevação da energia espiritual acompanhada por instrução amorosa para blindar seu campo em luz.',
    icon: Zap,
    color: 'text-amber-400',
    steps: {
      instruction: "Vamos elevar sua frequência vibracional. Respire fundo e conecte-se com a voz serena da sua centelha divina.",
      breathing: "Inale o fogo sagrado da compaixão. Sinta sua energia se elevar, iluminando sua aura e expandindo sua consciência.",
      feeling: "Retenha essa alta frequência, sentindo-se um pilar inabalável de luz, sabedoria e amor incondicional.",
      affirming: "Exale radiância para o universo, declarando: 'Minha luz é minha proteção. Eu ressoo em paz e gratidão'.",
      checking: "Seu campo magnético está fortalecido e cristalino. Nada além da paz divina habita você agora."
    },
    durations: {
      breathing: 5,
      feeling: 5,
      affirming: 8,
      checking: 12
    }
  },
  {
    id: 'self-hypnosis',
    category: 'hypnosis',
    hasVoice: true,
    title: 'Autohipnose: Reprogramação da Biologia',
    badge: 'Autohipnose Guiada',
    desc: 'Indução profunda conduzida por voz serena e afetuosa para reprogramar o subconsciente com comandos de cura.',
    icon: Moon,
    color: 'text-purple-400',
    steps: {
      instruction: "Relaxe profundamente. Deixe minha voz conduzir suavemente sua mente consciente até um estado de transe sereno e acolhedor.",
      breathing: "A cada respiração, você afunda o dobro em um estado de paz absoluta... soltando o controle e permitindo que seu subconsciente atue.",
      feeling: "Em transe profundo, observe a luz da autocura reescrevendo memórias e restaurando a perfeita harmonia do seu ser.",
      affirming: "Instale o comando hipnótico: 'Minhas células se regeneram agora. Eu aceito minha saúde e vitalidade plenamente'.",
      checking: "O comando de autocura está gravado em seu subconsciente. Você desperta sentindo-se renovado, forte e profundamente em paz."
    },
    durations: {
      breathing: 6,
      feeling: 6,
      affirming: 8,
      checking: 14
    }
  },
  {
    id: 'self-hypnosis-sleep',
    category: 'hypnosis',
    hasVoice: true,
    title: 'Autohipnose: Indução ao Sono Profundo',
    badge: 'Autohipnose Guiada',
    desc: 'Sessão de hipnose tranquila por voz calma para desacelerar a mente, eliminar estresse e induzir um sono reparador.',
    icon: Flame,
    color: 'text-orange-400',
    steps: {
      instruction: "Desligue-se das preocupações do dia. Permita que esta voz amorosa descanse seus pensamentos e conduza seu ser ao sono sagrado.",
      breathing: "Inale o silêncio da noite. A cada expiração, suas pálpebras ficam mais pesadas e seu corpo relaxa profundamente.",
      feeling: "Sua mente desacelera... os pensamentos se desfazem suavemente no ar, deixando apenas a paz acolhedora do ambiente.",
      affirming: "Grave em seu subconsciente: 'Eu me entrego ao descanso. Meu sono restaura meu corpo, minha alma e minha mente'.",
      checking: "Mergulhe no sono reparador. Seu corpo se cura enquanto você descansa na segurança do universo."
    },
    durations: {
      breathing: 6,
      feeling: 6,
      affirming: 8,
      checking: 15
    }
  }
];

// Helper functions for audio decoding
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function pcmToWavBuffer(pcmBytes: Uint8Array, sampleRate = 24000, numChannels = 1): ArrayBuffer {
  if (pcmBytes.length >= 44 &&
      pcmBytes[0] === 0x52 && pcmBytes[1] === 0x49 &&
      pcmBytes[2] === 0x46 && pcmBytes[3] === 0x46) {
    return pcmBytes.buffer.slice(pcmBytes.byteOffset, pcmBytes.byteOffset + pcmBytes.byteLength);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmBytes.length, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmBytes.length, true);

  const combined = new Uint8Array(44 + pcmBytes.length);
  combined.set(new Uint8Array(wavHeader), 0);
  combined.set(pcmBytes, 44);
  return combined.buffer;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate = 24000,
  numChannels = 1,
): Promise<AudioBuffer> {
  const wavBuffer = pcmToWavBuffer(data, sampleRate, numChannels);

  const nativeBuffer = await new Promise<AudioBuffer | null>((resolve) => {
    let done = false;
    try {
      const res = ctx.decodeAudioData(
        wavBuffer.slice(0),
        (buf) => { if (!done) { done = true; resolve(buf); } },
        () => { if (!done) { done = true; resolve(null); } }
      );
      if (res && typeof (res as any).then === 'function') {
        (res as any).then((buf: AudioBuffer) => {
          if (!done) { done = true; resolve(buf); }
        }).catch(() => {
          if (!done) { done = true; resolve(null); }
        });
      }
    } catch (e) {
      if (!done) resolve(null);
    }
  });

  if (nativeBuffer) return nativeBuffer;

  try {
    const rawBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const dataInt16 = new Int16Array(rawBuffer);
    const frameCount = Math.floor(dataInt16.length / numChannels);
    if (frameCount <= 0) throw new Error("Invalid length");
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  } catch (e) {
    return ctx.createBuffer(numChannels, ctx.sampleRate, ctx.sampleRate);
  }
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breathing' | 'meditation' | 'hypnosis'>('all');
  const [loading, setLoading] = useState(false);
  const [ritualStep, setRitualStep] = useState<'idle' | 'preparing' | 'instruction' | 'breathing' | 'feeling' | 'affirming' | 'checking' | 'completed'>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [activePortal, setActivePortal] = useState<HealingPortal | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [breathingPhase, setBreathingPhase] = useState<string>("");
  const ritualActiveRef = useRef(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const preloadedAudioRef = useRef<Record<string, string>>({});

  const initAudioContext = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
    } catch (e) {
      console.warn("AudioContext not supported or blocked:", e);
    }
  };

  const unlockAudioContext = () => {
    try {
      initAudioContext();
      const ctx = audioContextRef.current;
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(e => console.warn("Error resuming AudioContext:", e));
        }
        try {
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Could not unlock AudioContext:", e);
    }
  };

  const playAudio = async (base64: string) => {
    if (!base64) return;
    try {
      initAudioContext();
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (e) {}
      }

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
    } catch (err) {
      console.warn("Failed playing audio buffer:", err);
      setIsPlayingAudio(false);
    }
  };

  const speakTextFallback = (text: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const setVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
          const femaleVoice = ptVoices.find(v => 
            /google português|natural|luciana|helena|fernanda|francisca|vitoria|marcia|joana|female|feminina/i.test(v.name)
          ) || ptVoices.find(v => !/male|masculino|felipe|daniel|ricardo/i.test(v.name)) || ptVoices[0];

          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }
        };

        setVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = setVoice;
        }

        utterance.onend = () => {
          setIsPlayingAudio(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsPlayingAudio(false);
          resolve();
        };

        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsPlayingAudio(false);
        resolve();
      }
    });
  };

  const playVoicePassage = async (base64: string, textToSpeak: string) => {
    if (!ritualActiveRef.current) return;
    let audioData = base64;
    
    // If preloaded audio was missing or failed, try on-demand AI speech generation
    if (!audioData) {
      try {
        const prompt = "Você é uma pessoa real falando em português do Brasil de forma fluida, natural, expressiva e acolhedora. Fale com tom humano caloroso, pronúncia perfeita e ritmo espontâneo de conversa.";
        const freshAudio = await generateSpeech(textToSpeak, prompt);
        if (freshAudio) audioData = freshAudio;
      } catch (e) {
        console.warn("On-demand AI speech generation failed:", e);
      }
    }

    if (audioData) {
      try {
        await playAudio(audioData);
        return;
      } catch (e) {
        console.warn("Audio buffer playback failed, trying fallback", e);
      }
    }
    await speakTextFallback(textToSpeak);
  };

  const stopRitual = () => {
    ritualActiveRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        console.warn("Failed to stop current audio source:", e);
      }
      currentSourceRef.current = null;
    }
    setRitualStep('idle');
    setActivePortal(null);
    setCountdown(null);
    setBreathingPhase("");
    setIsPlayingAudio(false);
    setLoading(false);
  };

  const playBell = (isTick = false) => {
    try {
      initAudioContext();
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isTick) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        
        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1320, ctx.currentTime);
        
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
    } catch (e) {
      console.warn("Could not play bell audio:", e);
    }
  };

  const startRitual = async (portalId: string) => {
    unlockAudioContext();

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
      if (portal.hasVoice) {
        // MEDITAÇÕES & AUTOHIPNOSES:
        // Pre-generate audio passages sequentially during 'preparing' screen to prevent rate limits!
        const calmLovingPrompt = "Você é uma pessoa real falando português do Brasil de forma fluida, acolhedora, humana e expressiva. Fale com voz natural, tom caloroso e cadência espontânea de conversa, sem arrastar as palavras e sem pausas artificiais.";

        const instructionAudio = await generateSpeech(portal.steps.instruction, calmLovingPrompt);
        const breathingAudio = await generateSpeech(portal.steps.breathing, calmLovingPrompt);
        const feelingAudio = await generateSpeech(portal.steps.feeling, calmLovingPrompt);
        const affirmingAudio = await generateSpeech(portal.steps.affirming, calmLovingPrompt);
        const checkingAudio = await generateSpeech(portal.steps.checking, calmLovingPrompt);

        if (!ritualActiveRef.current) return;

        preloadedAudioRef.current = {
          instruction: instructionAudio || "",
          breathing: breathingAudio || "",
          feeling: feelingAudio || "",
          affirming: affirmingAudio || "",
          checking: checkingAudio || "",
        };

        setLoading(false);

        // Phase 1: Instruction
        setRitualStep('instruction');
        playBell();
        if (ritualActiveRef.current) {
          await playVoicePassage(preloadedAudioRef.current.instruction, portal.steps.instruction);
        }
        await new Promise(r => setTimeout(r, 1000));

        // Phase 2: Guided Meditation Cycles
        const totalCycles = portal.category === 'hypnosis' ? 1 : 2;
        for (let cycle = 1; cycle <= totalCycles; cycle++) {
          if (!ritualActiveRef.current) return;
          setCurrentCycle(cycle);

          // Sub-step: Inale / Acolhimento
          setRitualStep('breathing');
          setBreathingPhase("Acolhimento");
          playBell();
          if (ritualActiveRef.current) {
            playVoicePassage(preloadedAudioRef.current.breathing, portal.steps.breathing);
          }
          for (let i = portal.durations.breathing; i >= 1; i--) {
            if (!ritualActiveRef.current) return;
            setCountdown(i);
            await new Promise(r => setTimeout(r, 1000));
          }

          // Sub-step: Retenha / Integração
          setRitualStep('feeling');
          setBreathingPhase("Integração");
          playBell();
          if (ritualActiveRef.current) {
            playVoicePassage(preloadedAudioRef.current.feeling, portal.steps.feeling);
          }
          for (let i = portal.durations.feeling; i >= 1; i--) {
            if (!ritualActiveRef.current) return;
            setCountdown(i);
            await new Promise(r => setTimeout(r, 1000));
          }

          // Sub-step: Exale / Afirmação
          setRitualStep('affirming');
          setBreathingPhase("Afirmação & Cura");
          playBell();
          if (ritualActiveRef.current) {
            playVoicePassage(preloadedAudioRef.current.affirming, portal.steps.affirming);
          }
          for (let i = portal.durations.affirming; i >= 1; i--) {
            if (!ritualActiveRef.current) return;
            setCountdown(i);
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        // Phase 3: Closing / Retorno
        if (!ritualActiveRef.current) return;
        setRitualStep('checking');
        setBreathingPhase("Selo de Cura");
        setCountdown(null);
        playBell();
        if (ritualActiveRef.current) {
          playVoicePassage(preloadedAudioRef.current.checking, portal.steps.checking);
        }
        for (let i = portal.durations.checking; i >= 1; i--) {
          if (!ritualActiveRef.current) return;
          setCountdown(i);
          await new Promise(r => setTimeout(r, 1000));
        }

        if (ritualActiveRef.current) setRitualStep('completed');

      } else {
        // RESPIRAÇÕES:
        // No spoken voice! Pure Tibetan bells, timer and visual breathing rhythm.
        setLoading(false);

        setRitualStep('instruction');
        playBell();
        await new Promise(r => setTimeout(r, 3500));

        if (!ritualActiveRef.current) return;

        // 4 Cycles of Pure Breathing
        for (let cycle = 1; cycle <= 4; cycle++) {
          if (!ritualActiveRef.current) return;
          setCurrentCycle(cycle);

          // Inale
          setRitualStep('breathing');
          setBreathingPhase("Inale");
          playBell();
          for (let i = 1; i <= portal.durations.breathing; i++) {
            if (!ritualActiveRef.current) return;
            setCountdown(i);
            if (i > 1) playBell(true);
            await new Promise(r => setTimeout(r, 1000));
          }

          // Retenha
          setRitualStep('feeling');
          setBreathingPhase("Retenha");
          playBell();
          for (let i = 1; i <= portal.durations.feeling; i++) {
            if (!ritualActiveRef.current) return;
            setCountdown(i);
            if (i > 1) playBell(true);
            await new Promise(r => setTimeout(r, 1000));
          }

          // Exale
          setRitualStep('affirming');
          setBreathingPhase("Exale");
          playBell();
          for (let i = 1; i <= portal.durations.affirming; i++) {
            if (!ritualActiveRef.current) return;
            setCountdown(i);
            if (i > 1) playBell(true);
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        // Closing
        if (!ritualActiveRef.current) return;
        setRitualStep('checking');
        setBreathingPhase("Paz Profunda");
        setCountdown(null);
        playBell();
        for (let i = portal.durations.checking; i >= 1; i--) {
          if (!ritualActiveRef.current) return;
          setCountdown(i);
          await new Promise(r => setTimeout(r, 1000));
        }

        if (ritualActiveRef.current) setRitualStep('completed');
      }
    } catch (e) {
      console.error("Audio ritual failed:", e);
      if (ritualActiveRef.current) setRitualStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const filteredPortals = HEALING_PORTALS.filter(portal => {
    if (selectedCategory === 'all') return true;
    return portal.category === selectedCategory;
  });

  return (
    <div className="p-4 pt-safe pb-safe-nav max-w-2xl mx-auto space-y-10 animate-in fade-in">
      <header className="px-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-magic-gold">
          <Stars size={16} />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Portal de Cura & Meditação</p>
          <Stars size={16} />
        </div>
        <h2 className="text-4xl font-serif text-white tracking-tighter italic leading-none">Santuário de Autocura</h2>
      </header>

      <div className="px-4 space-y-8">
        {ritualStep === 'idle' ? (
          <div className="space-y-8 animate-in fade-in">
            {/* Mensagem Inspiradora */}
            <div className="p-8 glass-mystic border border-magic-gold/20 rounded-[2.5rem] text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-magic-gold/5 blur-[50px] pointer-events-none" />
              <p className="text-xs text-ethereal-100 italic leading-relaxed relative z-10 font-light">
                "A cura não é algo que você busca fora, mas a paz que você <span className="text-magic-gold font-bold">permite</span> despertar em sua própria alma."
              </p>
            </div>

            {/* Filtros de Categoria */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'Todas as Práticas' },
                { id: 'meditation', label: 'Meditações Guiadas' },
                { id: 'hypnosis', label: 'Autohipnoses' },
                { id: 'breathing', label: 'Respirações' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-magic-gold text-nature-950 shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105'
                      : 'bg-white/5 text-ethereal-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid de Portais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPortals.map(portal => (
                <div key={portal.id} className="glass-mystic p-7 rounded-[3rem] border border-white/10 space-y-5 hover:border-magic-gold/50 transition-all group shadow-2xl relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col justify-between">
                  <div className={`absolute -top-10 -left-10 w-40 h-40 ${portal.color.replace('text-', 'bg-')}/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-[1.8rem] bg-white/5 ${portal.color} group-hover:scale-110 transition-transform duration-700 shadow-inner border border-white/15 relative`}>
                        <portal.icon size={28} className="relative z-10" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-magic-gold/80 block">
                          {portal.badge}
                        </span>
                        <h4 className="text-xl font-serif text-white font-bold tracking-tight drop-shadow-md">{portal.title}</h4>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-ethereal-300 italic leading-relaxed px-1">{portal.desc}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[9px] text-ethereal-300 px-1 font-semibold">
                      {portal.hasVoice ? (
                        <span className="flex items-center gap-1.5 text-magic-gold">
                          <Headphones size={12} className="animate-pulse" /> Voz Calma & Amorosa (Sem Delay)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <Wind size={12} /> Somente Sinos Sagrados (Sem Voz)
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => startRitual(portal.id)} 
                      disabled={loading}
                      className="w-full py-4 bg-white text-nature-950 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.25em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group-hover:bg-magic-gold group-hover:text-white disabled:opacity-50"
                    >
                      {loading && activePortal?.id === portal.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sintonizando Voz...</span>
                        </>
                      ) : (
                        <>
                          <span>Iniciar Prática</span>
                          {portal.hasVoice ? <Volume2 size={15} /> : <Wind size={15} />}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tela da Prática em Execução */
          <div className="glass-mystic p-10 sm:p-12 rounded-[4rem] text-center space-y-10 flex flex-col items-center justify-center min-h-[580px] animate-in zoom-in border border-magic-gold/30 relative overflow-hidden shadow-[0_0_120px_rgba(212,175,55,0.15)] bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="absolute inset-0 bg-magic-gold/5 blur-3xl pointer-events-none" />
            
            {/* Oráculo Visual Animado */}
            <div className="relative">
              <div className="absolute inset-0 bg-magic-gold/20 blur-[80px] rounded-full animate-pulse" />
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-magic-gold/10 flex items-center justify-center">
                <div className="animate-breath relative">
                  {ritualStep === 'breathing' && <Wind size={80} className="text-magic-gold" />}
                  {ritualStep === 'feeling' && <Eye size={80} className="text-indigo-400" />}
                  {ritualStep === 'affirming' && <Flame size={80} className="text-orange-400" />}
                  {ritualStep === 'checking' && <Heart size={80} className="text-rose-400" />}
                  {ritualStep === 'completed' && <Sparkles size={80} className="text-magic-gold" />}
                  {ritualStep === 'preparing' && <Loader2 size={80} className="text-aura-violet animate-spin" />}
                  
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">{countdown}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute inset-[-16px] border-t border-magic-gold/30 rounded-full animate-spin-slow" />
            </div>
            
            <div className="space-y-6 relative z-10 max-w-sm">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-magic-gold uppercase tracking-[0.4em]">
                  {activePortal?.hasVoice ? "Voz Guiada de Luz" : "Ritmo Sagrado da Respiração"}
                </p>
                <h3 className="text-3xl font-serif text-white italic tracking-tight">
                  {ritualStep === 'preparing' && "Sintonizando Voz..."}
                  {ritualStep === 'instruction' && "Ouça a Condução"}
                  {ritualStep === 'breathing' && (currentCycle > 0 ? `Ciclo ${currentCycle}: ${breathingPhase}` : "Inale a Luz")}
                  {ritualStep === 'feeling' && (currentCycle > 0 ? `Ciclo ${currentCycle}: ${breathingPhase}` : "Integre a Paz")}
                  {ritualStep === 'affirming' && (currentCycle > 0 ? `Ciclo ${currentCycle}: ${breathingPhase}` : "Afirme a Cura")}
                  {ritualStep === 'checking' && "Integração Final"}
                  {ritualStep === 'completed' && "Cura Consolidada"}
                </h3>
              </div>
              
              <div className="min-h-[110px] flex flex-col items-center justify-center px-2">
                <p className="text-sm text-ethereal-100 italic leading-relaxed font-light mb-3 text-center">
                  {ritualStep === 'preparing' && "Sintonizando a voz calma e amorosa do guia espiritual. Aguarde apenas um instante..."}
                  {activePortal && ritualStep !== 'completed' && ritualStep !== 'preparing' && activePortal.steps[ritualStep as keyof typeof activePortal.steps]}
                  {ritualStep === 'completed' && "Sua alma e seu templo físico agora ressoam em perfeita sintonia e paz. Vá em luz."}
                </p>
                {isPlayingAudio && <AudioWave />}
              </div>
            </div>

            {ritualStep === 'completed' ? (
              <button 
                onClick={() => {setRitualStep('idle'); setActivePortal(null);}} 
                className="relative z-10 px-10 py-5 bg-white text-nature-950 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 shadow-2xl transition-all border border-magic-gold/20"
              >
                Concluir Prática
              </button>
            ) : (
              <button 
                onClick={stopRitual} 
                className="relative z-10 px-8 py-3.5 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 rounded-full font-black text-[9px] uppercase tracking-[0.3em] transition-all border border-white/10"
              >
                Encerrar Prática
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wellness;
