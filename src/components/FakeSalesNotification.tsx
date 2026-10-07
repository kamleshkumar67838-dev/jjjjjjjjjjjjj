import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, X, Zap } from 'lucide-react';

interface SaleNotification {
  name: string;
  city: string;
  item: string;
  amount: number;
  timeAgo: string;
}

const RECENT_SALES: SaleNotification[] = [
  { name: 'Rahul K.', city: 'Mumbai', item: 'Visa Classic Card', amount: 350, timeAgo: 'Just now' },
  { name: 'Aakash M.', city: 'Delhi', item: 'Mastercard World Elite', amount: 520, timeAgo: '1 min ago' },
  { name: 'Vikram S.', city: 'Bengaluru', item: 'TikTok 10,000 Coins', amount: 499, timeAgo: 'Just now' },
  { name: 'Sameer P.', city: 'Hyderabad', item: 'Global Platinum USD', amount: 890, timeAgo: '2 mins ago' },
  { name: 'Arjun N.', city: 'Pune', item: 'Visa Classic Card', amount: 350, timeAgo: 'Just now' },
  { name: 'Karan B.', city: 'Kolkata', item: 'TikTok 10,000 Coins', amount: 499, timeAgo: '1 min ago' },
  { name: 'Pooja R.', city: 'Ahmedabad', item: 'Mastercard World Elite', amount: 520, timeAgo: '3 mins ago' },
  { name: 'Rohan J.', city: 'Dubai, UAE', item: 'International Card', amount: 890, timeAgo: 'Just now' },
  { name: 'Deepak T.', city: 'Jaipur', item: 'TikTok 10,000 Coins', amount: 499, timeAgo: 'Just now' },
  { name: 'Nikhil G.', city: 'Lucknow', item: 'Visa Classic Card', amount: 350, timeAgo: '2 mins ago' },
];

export const FakeSalesNotification: React.FC = () => {
  const [currentSale, setCurrentSale] = useState<SaleNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial notification quickly after 3 seconds
    const initialTimer = setTimeout(() => {
      triggerRandomNotification();
    }, 3000);

    // Interval to trigger repeatedly every 7 to 11 seconds
    const interval = setInterval(() => {
      triggerRandomNotification();
    }, 9000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  const triggerRandomNotification = () => {
    const randomIndex = Math.floor(Math.random() * RECENT_SALES.length);
    const sale = RECENT_SALES[randomIndex];
    setCurrentSale(sale);
    setIsVisible(true);

    // Hide after 4.5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 4500);
  };

  if (isDismissed || !currentSale) return null;

  return (
    <div
      className={`fixed bottom-5 left-4 z-40 max-w-xs sm:max-w-sm transition-all duration-500 transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative p-3 sm:p-3.5 rounded-2xl bg-[#090e23]/95 backdrop-blur-xl border border-purple-500/40 shadow-2xl shadow-purple-950/60 flex items-center space-x-3 text-left">
        {/* Glowing Badge Icon */}
        <div className="relative shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/40">
          <ShoppingBag className="w-5 h-5 text-purple-100" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090e23] animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090e23]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-300">
            <span className="font-bold text-white truncate">{currentSale.name}</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-purple-300 truncate">{currentSale.city}</span>
          </div>

          <div className="text-xs font-extrabold text-slate-100 truncate mt-0.5">
            Acquired <span className="text-emerald-400 font-mono">₹{currentSale.amount}</span> {currentSale.item}
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
            <span className="flex items-center text-emerald-400 font-semibold">
              <CheckCircle className="w-3 h-3 mr-0.5 inline" /> Verified
            </span>
            <span>&bull;</span>
            <span className="text-slate-400 flex items-center">
              <Zap className="w-2.5 h-2.5 mr-0.5 text-yellow-400" /> {currentSale.timeAgo}
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setIsDismissed(true);
          }}
          className="absolute top-2 right-2 text-slate-500 hover:text-white p-1 rounded-md transition cursor-pointer"
          title="Dismiss notifications"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
