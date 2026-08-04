import React from 'react';
import { Compass, Home, ClipboardList, Sparkles, Heart, Users, ArrowRight, ZapOff, Flame } from 'lucide-react';

interface InstructionPortalProps {
  onProceed: () => void;
}

const InstructionPortal: React.FC<InstructionPortalProps> = ({ onProceed }) => {
  const shrines = [
    { icon: Home, label: 'Portal do Início', desc: 'Onde sua centelha divina mapeia o progresso da sua jornada.' },
    { icon: Compass, label: 'Portal da Senda', desc: 'O caminho de 21 dias para a ascensão e expansão da consciência.' },
    { icon: ClipboardList, label: 'Portal do Diário', desc: 'Espelho da alma para registrar a alquimia da sua autocura.' },
    { icon: Sparkles, label: 'Portal do Guia', desc: 'Bússola para a purificação e nutrição consciente do templo.' },
    { icon: Heart, label: 'Portal da Autocura', desc: 'Santuário para permitir que a centelha divina restaure seu ser.' },
    { icon: Users, label: 'Portal da Egrégora', desc: 'Egrégora de luz onde centelhas divinas se reconhecem.' },
  ];

  return (
    <div className="min-h-[100dvh] px-4 sm:px-8 py-6 pt-safe pb-safe-nav flex flex-col items-center justify-center space-y-8 animate-in fade-in w-full">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-magic-gold/10 rounded-full flex items-center justify-center mx-auto border border-magic-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
          <Flame size={36} className="text-magic-gold animate-pulse" />
        </div>
        <h2 className="text-4xl font-serif text-white italic tracking-tighter">O Chamado da Centelha</h2>
        <p className="text-magic-gold text-[10px] font-black uppercase tracking-[0.4em]">Mandamentos da Peregrinação Sagrada</p>
      </header>

      <div className="glass-mystic p-8 rounded-[3rem] border border-white/10 space-y-8 max-w-sm md:max-w-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-magic-gold/5 blur-3xl pointer-events-none" />
        
        <div className="space-y-4 text-center">
          <p className="text-sm text-white font-serif italic leading-relaxed">
            "A autocura integral floresce quando a sabedoria da alma e o cuidado com o templo físico caminham em harmonia."
          </p>
          
          <div className="p-6 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-400/20 space-y-4">
             <div className="flex items-center gap-2 justify-center text-indigo-300">
               <ZapOff size={16} />
               <p className="text-[10px] font-black uppercase tracking-widest">A Senda da Clareza</p>
             </div>
             <p className="text-[11px] text-ethereal-100 italic leading-relaxed">
               Compreenda que o corpo é o canal da sua luz. Beba <strong className="text-white">3 litros de água solarizada</strong> diariamente e evite alimentos inflamatórios como o <strong className="text-white">glúten, leite de vaca, açúcar, ultraprocessados e óleos vegetais</strong>.
             </p>
             <div className="h-px bg-white/5 w-1/2 mx-auto" />
             <p className="text-[11px] text-ethereal-100 italic leading-relaxed">
               Faça o <strong className="text-white">autoteste de 21 dias</strong>: retire todos eles completamente e, após esse ciclo, inclua-os um a um, observando atentamente os sinais do seu templo. Isso expande sua consciência corporal e integral, base do seu despertar espiritual. Após a inclusão, observe o que te faz mal e retire da sua vida. Respeite o seu templo, ele é o seu maior bem.
             </p>
          </div>

          <div className="p-6 bg-magic-gold/5 rounded-[2.5rem] border border-magic-gold/20 space-y-3 text-center">
             <div className="flex items-center gap-2 justify-center text-magic-gold">
               <Compass size={16} className="animate-spin-slow" />
               <p className="text-[10px] font-black uppercase tracking-widest">Ordem de Peregrinação</p>
             </div>
             <p className="text-[11px] text-ethereal-100 italic leading-relaxed">
               Os portais da senda devem ser acessados <strong className="text-white">um a um, após o término de cada etapa</strong>, seguindo rigorosamente a ordem <strong className="text-white">da esquerda para a direita</strong> nos ícones localizados no menu na parte inferior da tela.
             </p>
          </div>
        </div>

        <div className="space-y-5">
          {shrines.map((shrine, idx) => (
            <div key={idx} className="flex items-center gap-5 group">
              <div className="p-3 bg-white/5 rounded-2xl text-magic-gold border border-white/10 group-hover:bg-magic-gold/20 transition-all shadow-inner">
                <shrine.icon size={18} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{shrine.label}</h4>
                <p className="text-[11px] text-ethereal-400 italic leading-tight mt-1">{shrine.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center w-full max-w-sm">
        <button 
          onClick={onProceed}
          className="w-full bg-white text-nature-950 py-6 rounded-[3rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:scale-105 active:scale-95 transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-magic-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2">Iniciar Peregrinação <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
        </button>
      </div>
    </div>
  );
};

export default InstructionPortal;
