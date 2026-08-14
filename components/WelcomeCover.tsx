import React, { useState } from 'react';
import { Wind, X, Sparkles } from 'lucide-react';

interface WelcomeCoverProps {
  onStart: () => void;
}

export const BrandHeartLogo: React.FC<{ size?: number; className?: string }> = ({ size = 80, className = "" }) => (
  <img 
    src="/icon.svg" 
    alt="Logo Reconexão Essencial" 
    width={size} 
    height={size} 
    className={`object-contain ${className}`} 
  />
);

const WelcomeCover: React.FC<WelcomeCoverProps> = ({ onStart }) => {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <div className="w-full min-h-[100dvh] bg-[#F7F2EC] flex flex-col items-center justify-between py-6 px-4 sm:px-6 animate-in fade-in duration-700">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between flex-1 space-y-6">
        
        {/* Top Header & Branding */}
        <div className="flex flex-col items-center pt-2 text-center space-y-3 w-full shrink-0">
          
          {/* Official Logo (Emblem + RECONEXÃO ESSENCIAL) */}
          <div className="p-1 transition-transform hover:scale-105 duration-300">
            <img 
              src="/icon.svg" 
              alt="Reconexão Essencial Logo" 
              className="w-56 sm:w-64 h-auto max-h-[220px] object-contain drop-shadow-md mx-auto" 
            />
          </div>

          {/* Sub-header with Gold Lines */}
          <div className="flex items-center justify-center gap-3 w-full max-w-[260px] py-1">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E9B44C]/60 to-[#E9B44C]" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#E9B44C] tracking-[0.3em] uppercase whitespace-nowrap">
              CHRIS LUCËNA
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E9B44C]/60 to-[#E9B44C]" />
          </div>

          {/* Main Headline */}
          <div className="pt-3 pb-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#18245C] tracking-wide uppercase leading-tight">
              SUA JORNADA<br />
              DE TRANSFORMAÇÃO<br />
              COMEÇA AQUI
            </h3>
          </div>

          {/* Primary Action */}
          <div className="pt-2 w-full flex flex-col items-center gap-3">
            <button 
              onClick={onStart}
              className="w-full max-w-[240px] py-3.5 bg-gradient-to-r from-[#8B5CF6] via-[#7E3AF2] to-[#6B21A8] hover:from-[#7C3AED] hover:to-[#5B178A] text-white font-black text-sm uppercase tracking-[0.2em] rounded-full shadow-lg shadow-purple-900/20 active:scale-95 transition-all cursor-pointer"
            >
              ENTRAR
            </button>

            <button 
              onClick={() => setShowManifesto(true)}
              className="text-[#18245C]/60 hover:text-[#18245C] text-[10px] font-bold uppercase tracking-[0.25em] transition-all flex items-center gap-1.5 pt-1 cursor-pointer"
            >
              <Wind size={14} className="text-[#9333EA]" /> O Convite da Alma
            </button>
          </div>
        </div>

        {/* Scenic Mountain Meditating Image at Bottom */}
        <div className="w-full relative overflow-hidden rounded-t-[2.5rem] shadow-2xl border-t border-white/60 shrink-0 mt-auto">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000" 
            alt="Meditação na Senda" 
            className="w-full h-52 sm:h-60 object-cover object-top filter contrast-[1.05] brightness-[0.98]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F7F2EC]/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Modal Manifesto */}
      {showManifesto && (
        <div className="fixed inset-0 z-[300] bg-[#18245C]/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-white p-8 sm:p-10 rounded-[3rem] border border-[#18245C]/10 shadow-2xl text-center space-y-6 animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowManifesto(false)}
              className="absolute top-6 right-6 p-2 bg-[#18245C]/5 rounded-full text-[#18245C]/60 hover:text-[#18245C] transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-black text-[#9333EA] uppercase tracking-[0.4em]">Frequência Sagrada</span>
              <h2 className="text-3xl font-serif text-[#18245C] italic tracking-tight font-bold">O Chamado</h2>
            </div>

            <div className="space-y-4 text-[#18245C] text-xs leading-relaxed italic font-normal px-2">
              <p>"Você não encontrou este portal por acaso. Sua alma vibrou nesta frequência porque reconhece que seu templo — seu corpo — clama por libertação."</p>
              <p>"A Reconexão Essencial é um catalisador. Aqui, removemos os véus da inflamação e do ruído para que a luz da sua centelha divina possa, finalmente, reinar."</p>
              <p className="text-[#E9B44C] font-bold">"O solo que você pisa é sua própria essência. Seja bem-vindo à sua verdade."</p>
            </div>

            <div className="pt-4 border-t border-[#18245C]/10">
               <button 
                onClick={() => setShowManifesto(false)}
                className="w-full py-4 bg-[#7E3AF2] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-md active:scale-95 transition-all hover:bg-[#6B21A8] cursor-pointer"
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
