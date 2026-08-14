import React from 'react';
import { ChevronRight, Compass, Sparkles, ArrowDown } from 'lucide-react';

interface NextStepGuideProps {
  currentStepName: string;
  stepNumber: number;
  totalSteps?: number;
  nextStepName: string;
  nextStepLabel: string;
  onNavigate: () => void;
  message?: string;
  icon?: React.ElementType;
}

export const NextStepGuide: React.FC<NextStepGuideProps> = ({
  currentStepName,
  stepNumber,
  totalSteps = 7,
  nextStepName,
  nextStepLabel,
  onNavigate,
  message,
  icon: Icon = Compass,
}) => {
  return (
    <div className="w-full mt-10 space-y-4 animate-in fade-in duration-500">
      {/* Scroll indicator banner */}
      <div className="flex items-center justify-center gap-2 text-[#4A506B] text-[10px] uppercase font-bold tracking-[0.25em] py-2">
        <ArrowDown size={12} className="animate-bounce text-[#E9B44C]" />
        <span>Fim desta seção • Deslize ou avance para o próximo portal</span>
        <ArrowDown size={12} className="animate-bounce text-[#E9B44C]" />
      </div>

      {/* Main Guidance Card */}
      <div className="glass-mystic p-6 sm:p-8 rounded-[2.5rem] border border-[#E9B44C]/30 bg-gradient-to-br from-[#E9B44C]/10 via-transparent to-transparent shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9B44C]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E9B44C]/20 text-[#E9B44C] border border-[#E9B44C]/30 text-[8px] font-black uppercase tracking-widest">
                Etapa {stepNumber} de {totalSteps} • {currentStepName}
              </span>
            </div>
            <h4 className="text-xl font-serif text-[#18245C] italic font-bold">
              Próxima Parada: {nextStepName}
            </h4>
            <p className="text-xs text-[#4A506B] italic font-light leading-relaxed">
              {message || `Sua peregrinação continua! Clique no botão abaixo para seguir para o ${nextStepName}.`}
            </p>
          </div>

          <button
            onClick={onNavigate}
            className="shrink-0 w-full sm:w-auto px-6 py-4 bg-[#18245C] text-white hover:bg-[#A268D7] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all group/btn"
          >
            <Icon size={16} className="text-[#E9B44C] group-hover/btn:text-white transition-colors" />
            <span>{nextStepLabel}</span>
            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextStepGuide;
