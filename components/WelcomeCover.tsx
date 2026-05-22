
import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, ArrowRight, X, Info, Heart, ShieldCheck, Flame, Stars, Wind } from 'lucide-react';
import { generateAppCover } from '../services/geminiService';

interface WelcomeCoverProps {
  onStart: () => void;
}

const WelcomeCover: React.FC<WelcomeCoverProps> = ({ onStart }) => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showManifesto, setShowManifesto] = useState(false);

  useEffect(() => {
    const fetchCover = async () => {
      setLoading(true);
      const img = await generateAppCover();
      setCoverImage(img);
      setLoading(false);
    };
    fetchCover();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-aura-deep flex flex-col items-center justify-center overflow-hidden">
      {/* Background Cinematográfico e Vibrante */}
      <div className="absolute inset-0 transition-opacity duration-[3000ms]">
        {coverImage ? (
          <img 
            src={coverImage} 
            className="w-full h-full object-cover scale-110 animate-pulse-soft" 
            alt="Essência Divina"
          />
        ) : (
          <div className="w-full h-full bg-[#030712] relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] bg-gradient-to-br from-aura-violet/20 via-aura-indigo/10 to-aura-teal/20 animate-spin-slow blur-[100px]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-aura-deep/60 via-transparent to-aura-deep" />
      </div>

      {/* Geometria Sagrada Iridescente */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none opacity-40">
        <svg width="500" height="500" viewBox="0 0 100 100" className="animate-spin-slow">
          <defs>
            <linearGradient id="irid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#irid)" strokeWidth="0.1" />
          <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="url(#irid)" strokeWidth="0.05" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="url(#irid)" strokeWidth="0.1" className="animate-pulse" />
        </svg>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-10 flex flex-col items-center text-center px-10 max-w-lg w-full">
        <header className="space-y-6 animate-in fade-in slide-up duration-1000">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-aura-gold/50" />
            <span className="text-[10px] font-black text-aura-gold uppercase tracking-[0.6em] drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">O Despertar da Centelha</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-aura-gold/50" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-7xl font-serif text-white tracking-tighter italic leading-[0.8] drop-shadow-2xl animate-hypnotic-glow">
              Reconexão<br/>
              <span className="gradient-text-gold text-4xl sm:text-5xl font-black not-italic tracking-normal uppercase">Essencial</span>
            </h1>
          </div>

          <p className="text-white/80 text-sm font-light italic max-w-[300px] mx-auto leading-relaxed drop-shadow-lg">
            "Deixe sua essência divina iluminar o caminho da sua própria cura."
          </p>
        </header>

        <div className="mt-16 space-y-8 w-full animate-in fade-in duration-1000 delay-500">
          {loading ? (
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <Loader2 className="text-aura-violet animate-spin" size={40} />
                <Sparkles className="absolute -top-2 -right-2 text-aura-gold animate-pulse" size={16} />
              </div>
              <span className="text-[9px] font-black text-aura-teal uppercase tracking-[0.5em] animate-pulse">Sintonizando Frequência...</span>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center w-full">
              <button 
                onClick={onStart}
                className="group relative w-full py-7 bg-white text-aura-deep rounded-[3rem] font-black text-xs uppercase tracking-[0.5em] shadow-[0_30px_60px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-aura-violet/20 via-transparent to-aura-teal/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-4">
                  ATRAVESSAR O PORTAL <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                </span>
              </button>

              <button 
                onClick={() => setShowManifesto(true)}
                className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-3 px-6 py-2 rounded-full hover:bg-white/5"
              >
                <Wind size={16} className="text-aura-teal" /> O Convite da Alma
              </button>
            </div>
          )}
        </div>

        <footer className="mt-20 opacity-60">
           <Stars className="text-aura-gold mx-auto mb-3 animate-pulse" size={20} />
           <p className="text-[9px] font-black text-white uppercase tracking-[0.5em]">Luz • Presença • Alquimia</p>
        </footer>
      </div>

      {/* Modal Manifesto - Magnético */}
      {showManifesto && (
        <div className="fixed inset-0 z-[300] bg-aura-deep/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-700">
          <div className="relative w-full max-w-sm glass-mystic p-12 rounded-[4rem] iridescent-border shadow-[0_0_100px_rgba(139,92,246,0.2)] text-center space-y-10 animate-in zoom-in duration-500 overflow-hidden">
            <button 
              onClick={() => setShowManifesto(false)}
              className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all border border-white/10"
            >
              <X size={24} />
            </button>

            <div className="space-y-3">
              <span className="text-[10px] font-black text-aura-violet uppercase tracking-[0.5em]">Frequência Sagrada</span>
              <h2 className="text-5xl font-serif text-white italic tracking-tight">O Chamado</h2>
            </div>

            <div className="space-y-6 text-white/90 text-sm leading-relaxed italic font-light px-2">
              <p>"Você não encontrou este portal por acaso. Sua alma vibrou nesta frequência porque reconhece que seu templo — seu corpo — clama por libertação."</p>
              <p>"A Reconexão Essencial é um catalisador. Aqui, removemos os véus da inflamação e do ruído para que a luz da sua centelha divina possa, finalmente, reinar."</p>
              <p className="text-aura-gold font-bold">"O solo que você pisa é sua própria essência. Seja bem-vindo à sua verdade."</p>
            </div>

            <div className="pt-6 border-t border-white/10">
               <button 
                onClick={() => setShowManifesto(false)}
                className="w-full py-6 bg-gradient-to-r from-aura-violet to-aura-indigo text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all hover:brightness-110"
               >
                 EU ACEITO O CAMINHO
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeCover;
