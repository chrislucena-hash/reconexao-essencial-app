
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
    { view: AppView.DASHBOARD, icon: Home, label: 'Início', color: 'bg-[#18245C] text-white', textColor: 'text-[#18245C]' },
    { view: AppView.JOURNEY, icon: Compass, label: 'Senda', color: 'bg-[#E9B44C] text-white', textColor: 'text-[#E9B44C]' },
    { view: AppView.TRACKER, icon: ClipboardList, label: 'Diário', color: 'bg-[#5B8DE6] text-white', textColor: 'text-[#5B8DE6]' },
    { view: AppView.GUIDANCE, icon: Sparkles, label: 'Bússola', color: 'bg-[#A268D7] text-white', textColor: 'text-[#A268D7]' },
    { view: AppView.WELLNESS, icon: Heart, label: 'Cura', color: 'bg-[#2E7D68] text-white', textColor: 'text-[#2E7D68]' },
    { view: AppView.EVOLUTION, icon: TrendingUp, label: 'Evolução', color: 'bg-[#18245C] text-white', textColor: 'text-[#18245C]' },
    { view: AppView.COMMUNITY, icon: Users, label: 'Egrégora', color: 'bg-[#D87CB5] text-white', textColor: 'text-[#D87CB5]' },
  ];

  if (isKeyboardOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-[max(0.75rem,calc(0.4rem+env(safe-area-inset-bottom)))] sm:bottom-6 left-1/2 -translate-x-1/2 w-[96%] xs:w-[94%] max-w-md md:max-w-2xl lg:max-w-3xl bg-white/95 backdrop-blur-xl border border-[#18245C]/10 rounded-2xl shadow-xl z-50 p-1.5 sm:p-2 overflow-hidden">
      <div className="flex justify-around items-center h-12 sm:h-14 relative">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all relative z-10 touch-manipulation active:scale-95 ${
              currentView === item.view ? 'text-[#18245C]' : 'text-[#4A506B]/60 hover:text-[#18245C]'
            }`}
          >
            <div className={`p-1.5 sm:p-2 rounded-xl transition-all duration-200 relative ${
              currentView === item.view 
                ? `${item.color} shadow-sm scale-105` 
                : 'hover:bg-[#F7F2EC]'
            }`}>
               <item.icon size={18} strokeWidth={currentView === item.view ? 2.5 : 2} className="relative z-10 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-wider transition-opacity duration-200 text-center whitespace-nowrap ${currentView === item.view ? `opacity-100 ${item.textColor}` : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
