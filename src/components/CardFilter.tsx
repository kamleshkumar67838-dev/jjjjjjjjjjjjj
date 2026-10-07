import React from 'react';
import { CardCategory } from '../types';

interface CardFilterProps {
  activeCategory: 'all' | CardCategory;
  onSelectCategory: (cat: 'all' | CardCategory) => void;
  counts: {
    all: number;
    visa: number;
    mastercard: number;
    international: number;
    tiktok: number;
  };
}

export const CardFilter: React.FC<CardFilterProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
}) => {
  const tabs = [
    { id: 'all' as const, label: 'ALL CARDS', count: counts.all },
    { id: 'visa' as const, label: 'VISA', count: counts.visa },
    { id: 'mastercard' as const, label: 'MASTERCARD', count: counts.mastercard },
    { id: 'international' as const, label: 'INTERNATIONAL', count: counts.international },
    { id: 'tiktok' as const, label: 'TIKTOK COIN', count: counts.tiktok },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-6">
      {/* Category Pills matching screenshot */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-none justify-start sm:justify-center">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#5b21b6] text-white shadow-lg shadow-purple-600/30 border border-purple-400/60 scale-105'
                  : 'bg-[#0f172a]/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-purple-900/80 text-purple-200' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-bar matching screenshot Image 2 */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-b border-slate-800/60 py-3 mt-3 px-2 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wider text-slate-300 uppercase">
            SHOWING {activeCategory === 'all' ? 'ALL' : activeCategory.toUpperCase()} AVAILABLE VIRTUAL CARDS
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-500 font-medium">
          <span>Instant Digital Delivery</span>
          <span>&bull;</span>
          <span>Escrow Protected</span>
        </div>
      </div>
    </div>
  );
};
