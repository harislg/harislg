import React from 'react';
import { Users, Clock, BarChart3, Settings } from 'lucide-react';

export type ActiveTab = 'clients' | 'recent' | 'stats' | 'settings';

interface AndroidNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  clientsCount: number;
  ordersCount: number;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  onTabChange,
  clientsCount,
  ordersCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onTabChange('clients')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
          activeTab === 'clients'
            ? 'text-indigo-400 bg-indigo-950/60 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Users size={20} />
          {clientsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-indigo-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
              {clientsCount}
            </span>
          )}
        </div>
        <span className="text-[11px]">Clients</span>
      </button>

      <button
        onClick={() => onTabChange('recent')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
          activeTab === 'recent'
            ? 'text-indigo-400 bg-indigo-950/60 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Clock size={20} />
          {ordersCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
              {ordersCount}
            </span>
          )}
        </div>
        <span className="text-[11px]">Orders</span>
      </button>

      <button
        onClick={() => onTabChange('stats')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
          activeTab === 'stats'
            ? 'text-indigo-400 bg-indigo-950/60 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BarChart3 size={20} />
        <span className="text-[11px]">Overview</span>
      </button>

      <button
        onClick={() => onTabChange('settings')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
          activeTab === 'settings'
            ? 'text-indigo-400 bg-indigo-950/60 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Settings size={20} />
        <span className="text-[11px]">Settings</span>
      </button>
    </nav>
  );
};
