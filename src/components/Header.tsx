import React from 'react';
import { ShoppingBag, ShieldCheck, Send, Settings, Sparkles } from 'lucide-react';
import { PaymentSettings } from '../types';

interface HeaderProps {
  paymentSettings: PaymentSettings;
  ordersCount: number;
  onOpenMyOrders: () => void;
  onOpenSupport: () => void;
  onOpenAdmin: () => void;
  onScrollToCards: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ordersCount,
  onOpenMyOrders,
  onOpenSupport,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#050713]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo matching the screenshot: [DC] DARK CARDING */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-[1.5px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#090d1f] rounded-[7px] flex items-center justify-center">
              <span className="font-display font-black text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                DC
              </span>
            </div>
          </div>
          <div>
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-white">
              DARK CARDING
            </span>
          </div>
        </div>

        {/* Right Navigation / Badges matching screenshot */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
          {/* MY ORDERS (Purple pill from screenshot) */}
          <button
            onClick={onOpenMyOrders}
            className="relative flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#3b1d6e]/80 hover:bg-[#4c248f] border border-purple-500/40 text-purple-200 font-semibold transition-all shadow-sm hover:shadow-purple-500/20 active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <ShoppingBag className="w-3.5 h-3.5 text-purple-300" />
            <span className="tracking-wide">MY ORDERS</span>
            {ordersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-purple-500 text-white rounded-full font-bold">
                {ordersCount}
              </span>
            )}
          </button>

          {/* SUPPORT (Blue pill from screenshot) */}
          <button
            onClick={onOpenSupport}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#0e2a5c]/80 hover:bg-[#133777] border border-blue-500/40 text-blue-200 font-semibold transition-all shadow-sm hover:shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <Send className="w-3.5 h-3.5 text-blue-300" />
            <span className="tracking-wide">SUPPORT</span>
          </button>

          {/* ADMIN PANEL Quick Access */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-semibold transition-all shadow-sm hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
            title="Open Admin Panel to manage QR code, cards & orders"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline tracking-wide">ADMIN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
