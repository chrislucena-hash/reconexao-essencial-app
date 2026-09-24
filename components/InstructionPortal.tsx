import React from 'react';
import { Compass, Home, ClipboardList, Sparkles, Heart, Users, ArrowRight, ZapOff, Flame, Instagram } from 'lucide-react';

interface InstructionPortalProps {
  onProceed: () => void;
}

const InstructionPortal: React.FC<InstructionPortalProps> = ({ onProceed }) => {
  const shrines = [
    { icon: Home, label: 'Portal do Início', desc: 'Onde sua centelha divina mapeia o progresso da sua jornada.' },
    { icon: Compass, label: 'Portal da Senda', desc: 'O caminho de 21 dias para a ascensão e expansão da consciência.' },
    { icon: ClipboardList, label: 'Portal do Diário', desc: 'Espaço para registrar suas experiências e percepções.' },
    { icon: Sparkles, label: 'Portal do Guia', desc: 'Ideias de atenção plena e alimentação consciente.' },
    { icon: Heart, label: 'Portal do Autocuidado', desc: 'Práticas guiadas de meditação e relaxamento.' },
    { icon: Users, label: 'Portal da Egrégora', desc: 'Egrégora de luz onde centelhas divinas se reconhecem.' },
  ];

  return (
    <div className="min-h-[100dvh] px-4 sm:px-8 py-6 pt-safe pb-safe-nav flex flex-col items-center justify-center space-y-8 animate-in fade-in w-full">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-[#E9B44C]/10 rounded-full flex items-center justify-center mx-auto border border-[#E9B44C]/30 shadow-sm">
          <Flame size={36} className="text-[#E9B44C] animate-pulse" />
        </div>
        <h2 className="text-4xl font-serif text-[#18245C] italic tracking-tighter">O Chamado da Centelha</h2>
        <p className="text-[#E9B44C] text-[10px] font-black uppercase tracking-[0.4em]">Mandamentos da Peregrinação Sagrada</p>
      </header>

      <div className="glass-mystic p-8 rounded-[3rem] border border-[#18245C]/10 space-y-8 max-w-sm md:max-w-lg shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9B44C]/5 blur-3xl pointer-events-none" />
        
        <div className="space-y-4 text-center">
          <p className="text-sm text-[#18245C] font-serif italic leading-relaxed">
            "O autoconhecimento cresce quando você reserva tempo para observar sua experiência com gentileza."
          </p>
          
          <div className="p-6 bg-[#A268D7]/10 rounded-[2.5rem] border border-[#A268D7]/20 space-y-4">
             <div className="flex items-center gap-2 justify-center text-[#A268D7]">
               <ZapOff size={16} />
               <p className="text-[10px] font-black uppercase tracking-widest">A Senda da Clareza</p>
             </div>
             <p className="text-[11px] text-[#4A506B] italic leading-relaxed">
               Observe sua rotina com atenção. Beba água conforme suas necessidades e faça escolhas alimentares de acordo com suas preferências e orientações profissionais.
             </p>
             <div className="h-px bg-[#18245C]/10 w-1/2 mx-auto" />
             <p className="text-[11px] text-[#4A506B] italic leading-relaxed">
               Use o Diário para registrar percepções. O aplicativo não determina causas de sintomas nem indica retirar alimentos. Se houver desconforto persistente, procure avaliação profissional antes de alterar a dieta.
             </p>
          </div>

          <div className="p-6 bg-[#E9B44C]/10 rounded-[2.5rem] border border-[#E9B44C]/20 space-y-3 text-center">
             <div className="flex items-center gap-2 justify-center text-[#E9B44C]">
               <Compass size={16} className="animate-spin-slow" />
               <p className="text-[10px] font-black uppercase tracking-widest">Ordem de Peregrinação e Navegação</p>
             </div>
             <p className="text-[11px] text-[#4A506B] italic leading-relaxed">
               Em cada tela, <strong className="text-[#18245C]">role de cima para baixo e preencha tudo o que for solicitado</strong>. Em seguida, navegue pelos portais acessando <strong className="text-[#18245C]">cada aba localizada no rodapé do aplicativo</strong>, um a um, após o término de cada etapa, seguindo rigorosamente a ordem <strong className="text-[#18245C]">da esquerda para a direita</strong>.
             </p>
          </div>

          <div className="space-y-3">
            <a 
              href="https://www.instagram.com/reconexaoessencial.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 bg-[#D87CB5]/10 rounded-[2.5rem] border border-[#D87CB5]/30 space-y-2 text-center block hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
               <div className="flex items-center gap-2 justify-center text-[#D87CB5]">
                 <Instagram size={18} className="group-hover:rotate-12 transition-transform" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Instagram do App</p>
               </div>
               <p className="text-[11px] text-[#4A506B] italic leading-relaxed">
                 Siga o perfil oficial <strong className="text-[#18245C] underline">@reconexaoessencial.com.br</strong> para atualizações, vivências e conteúdos da egrégora.
               </p>
            </a>

            <a 
              href="https://www.instagram.com/chrislucenaescritora?igsh=MTRyMjA1a2ZjaWdidQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 bg-[#D87CB5]/10 rounded-[2.5rem] border border-[#D87CB5]/30 space-y-2 text-center block hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
               <div className="flex items-center gap-2 justify-center text-[#D87CB5]">
                 <Instagram size={18} className="group-hover:rotate-12 transition-transform" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Instagram da Autora</p>
               </div>
               <p className="text-[11px] text-[#4A506B] italic leading-relaxed">
                 Acompanhe as reflexões, orientações e novidades de <strong className="text-[#18245C] underline">Chris Lucëna (@chrislucenaescritora)</strong>.
               </p>
            </a>
          </div>
        </div>

        <div className="space-y-5">
          {shrines.map((shrine, idx) => (
            <div key={idx} className="flex items-center gap-5 group">
              <div className="p-3 bg-[#18245C]/5 rounded-2xl text-[#E9B44C] border border-[#18245C]/10 group-hover:bg-[#E9B44C]/20 transition-all shadow-inner">
                <shrine.icon size={18} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-[#18245C] uppercase tracking-widest">{shrine.label}</h4>
                <p className="text-[11px] text-[#4A506B] italic leading-tight mt-1">{shrine.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center w-full max-w-sm">
        <button 
          onClick={onProceed}
          className="w-full bg-[#18245C] text-white py-6 rounded-[3rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-lg hover:bg-[#A268D7] active:scale-95 transition-all group overflow-hidden relative"
        >
          <span className="relative flex items-center gap-2">Iniciar Peregrinação <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
        </button>
      </div>
    </div>
  );
};

export default InstructionPortal;
