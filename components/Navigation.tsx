
import React from 'react';
import { Home, ClipboardList, Utensils, Heart, Users, Compass, TrendingUp } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: AppView.DASHBOARD, icon: Home, label: 'Início', color: 'bg-aura-violet' },
    { view: AppView.JOURNEY, icon: Compass, label: 'Senda', color: 'bg-magic-gold' },
    { view: AppView.TRACKER, icon: ClipboardList, label: 'Diário', color: 'bg-aura-indigo' },
    { view: AppView.GUIDANCE, icon: Utensils, label: 'Guia', color: 'bg-aura-teal' },
    { view: AppView.WELLNESS, icon: Heart, label: 'Cura', color: 'bg-aura-rose' },
    { view: AppView.EVOLUTION, icon: TrendingUp, label: 'Evolução', color: 'bg-aura-violet' },
    { view: AppView.COMMUNITY, icon: Users, label: 'Egrégora', color: 'bg-aura-emerald' },
  ];

  return (
    <div className="safe-nav fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[95%] xs:w-[92%] max-w-md md:max-w-2xl lg:max-w-3xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-50 p-2 sm:p-3 iridescent-border overflow-hidden">
      <div className="flex justify-around items-center h-14 sm:h-16 relative">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all relative z-10 ${
              currentView === item.view ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <div className={`p-2.5 rounded-2xl transition-all duration-700 relative ${
              currentView === item.view 
                ? `${item.color} shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-110` 
                : 'hover:bg-white/5'
            }`}>
               {currentView === item.view && (
                 <div className={`absolute inset-0 rounded-2xl blur-xl opacity-50 animate-pulse ${item.color}`} />
               )}
               <item.icon size={22} strokeWidth={currentView === item.view ? 2.5 : 2} className="relative z-10" />
            </div>
            <span className={`text-[7px] font-black uppercase tracking-wider transition-opacity duration-500 text-center ${currentView === item.view ? 'opacity-100' : 'opacity-40'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
