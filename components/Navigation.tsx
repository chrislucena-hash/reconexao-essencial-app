
import React, { useState, useEffect } from 'react';
import { Home, ClipboardList, Sparkles, Heart, Users, Compass, TrendingUp } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsKeyboardOpen(true);
      }
    };
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Short timeout to handle focus shifting between inputs
        setTimeout(() => {
          const activeEl = document.activeElement;
          if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA')) {
            setIsKeyboardOpen(false);
          }
        }, 50);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const navItems = [
    { view: AppView.DASHBOARD, icon: Home, label: 'Início', color: 'bg-aura-violet' },
    { view: AppView.JOURNEY, icon: Compass, label: 'Senda', color: 'bg-magic-gold' },
    { view: AppView.TRACKER, icon: ClipboardList, label: 'Diário', color: 'bg-aura-indigo' },
    { view: AppView.GUIDANCE, icon: Sparkles, label: 'Guia', color: 'bg-aura-teal' },
    { view: AppView.WELLNESS, icon: Heart, label: 'Cura', color: 'bg-aura-rose' },
    { view: AppView.EVOLUTION, icon: TrendingUp, label: 'Evolução', color: 'bg-aura-violet' },
    { view: AppView.COMMUNITY, icon: Users, label: 'Egrégora', color: 'bg-aura-emerald' },
  ];

  if (isKeyboardOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-[max(0.75rem,calc(0.4rem+env(safe-area-inset-bottom)))] sm:bottom-6 left-1/2 -translate-x-1/2 w-[96%] xs:w-[94%] max-w-md md:max-w-2xl lg:max-w-3xl bg-white/10 backdrop-blur-3xl border border-white/15 rounded-[2rem] sm:rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] z-50 p-1.5 sm:p-2.5 iridescent-border overflow-hidden">
      <div className="flex justify-around items-center h-12 sm:h-16 relative">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 sm:space-y-1 transition-all relative z-10 touch-manipulation active:scale-95 ${
              currentView === item.view ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 relative ${
              currentView === item.view 
                ? `${item.color} shadow-[0_0_25px_rgba(255,255,255,0.4)] scale-105 sm:scale-110` 
                : 'hover:bg-white/5'
            }`}>
               {currentView === item.view && (
                 <div className={`absolute inset-0 rounded-xl sm:rounded-2xl blur-lg opacity-60 animate-pulse ${item.color}`} />
               )}
               <item.icon size={18} strokeWidth={currentView === item.view ? 2.5 : 2} className="relative z-10 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-wider transition-opacity duration-300 text-center whitespace-nowrap ${currentView === item.view ? 'opacity-100 text-magic-gold' : 'opacity-50'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
