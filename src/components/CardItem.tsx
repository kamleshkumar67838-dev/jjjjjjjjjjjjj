import React from 'react';
import { Zap, ShieldCheck, Wifi, Sparkles, CheckCircle2 } from 'lucide-react';
import { VirtualCard } from '../types';

interface CardItemProps {
  card: VirtualCard;
  onBuy: (card: VirtualCard) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onBuy }) => {
  // Mask full card number, showing only the last 4 digits
  const rawNumber = card.cardNumberMask || '9010';
  const cleanDigits = rawNumber.replace(/[^0-9]/g, '');
  const last4 = cleanDigits.length >= 4 ? cleanDigits.slice(-4) : (rawNumber.split(' ').pop() || '9010');
  const maskedCardNumber = `•••• •••• •••• ${last4}`;

  return (
    <div className="relative group rounded-2xl bg-[#090e1f]/95 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-purple-950/20">
      {/* Top Badges row matching screenshot Image 2 */}
      <div className="flex items-center flex-wrap gap-1.5 mb-3.5">
        {/* IN STOCK badge */}
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] sm:text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{card.inStock ? 'IN STOCK' : 'OUT OF STOCK'}</span>
        </span>

        {/* TRUSTED CARD / BEST CARD badge */}
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-[10px] sm:text-[11px] font-bold text-purple-300 uppercase tracking-wider">
          <span>{card.badges[1] || 'TRUSTED CARD'}</span>
        </span>

        {/* FEATURED badge */}
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider">
          <span>★ {card.badges[2] || 'FEATURED'}</span>
        </span>
      </div>

      {/* Realistic Visual Card Mockup or Custom Admin Photo */}
      <div className="relative w-full aspect-[1.58/1] rounded-xl overflow-hidden mb-4 shadow-lg border border-slate-700/50 group-hover:border-purple-400/30 transition-all duration-300">
        {card.customImageUrl ? (
          // Admin uploaded custom card photo/skin!
          <div className="relative w-full h-full bg-slate-900">
            <img
              src={card.customImageUrl}
              alt={card.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-end text-white">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-300 font-mono">
                  {card.cardHolder}
                </p>
                <p className="text-xs font-mono font-bold tracking-widest text-white drop-shadow">
                  {maskedCardNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-purple-600/80 text-[10px] font-bold uppercase tracking-wider text-white">
                  {card.title}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Sleek Photorealistic Digital Card matching screenshot
          <div
            className={`relative w-full h-full bg-gradient-to-br ${
              card.cardGradient || 'from-[#0b2447] via-[#19376d] to-[#04152d]'
            } p-3.5 sm:p-4 flex flex-col justify-between text-white select-none`}
          >
            {/* Subtle card grid / gloss pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
            
            {/* Top row: Chip + Card Tier + Brand Logo */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center space-x-2.5">
                {/* Gold EMV Chip */}
                <div className="w-8 h-6 sm:w-9 sm:h-6.5 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-[1px] shadow-sm">
                  <div className="w-full h-full rounded-[4px] bg-gradient-to-br from-amber-300 to-amber-600 relative overflow-hidden flex items-center justify-center">
                    <div className="w-4 h-[1px] bg-amber-800/60 mb-1"></div>
                    <div className="w-[1px] h-4 bg-amber-800/60 absolute"></div>
                  </div>
                </div>
                <span className="text-xs font-bold tracking-wider text-slate-200 font-display uppercase">
                  {card.title}
                </span>
              </div>

              {/* Brand Logo & Tag */}
              <div className="text-right flex items-center space-x-1.5">
                {card.category === 'visa' && (
                  <span className="font-display font-black text-sm sm:text-base italic tracking-widest text-white">
                    VISA
                  </span>
                )}
                {card.category === 'mastercard' && (
                  <div className="flex -space-x-2 items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500/90"></div>
                    <div className="w-4 h-4 rounded-full bg-amber-400/90"></div>
                  </div>
                )}
                {card.category === 'international' && (
                  <span className="font-display font-bold text-xs tracking-wider text-emerald-300">
                    GLOBAL
                  </span>
                )}
                {card.category === 'tiktok' && (
                  <span className="font-bold text-xs text-[#fe2c55] tracking-wider flex items-center space-x-1">
                    <span>&#9835;</span>
                    <span>TIKTOK</span>
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Contactless waves & Card number */}
            <div className="my-auto z-10">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <span className="text-[9px] tracking-widest uppercase">••••</span>
                <Wifi className="w-3.5 h-3.5 rotate-90 text-slate-300" />
                <span className="text-[9px] tracking-widest uppercase">••••</span>
              </div>
              <p className="font-mono-code font-bold text-xs sm:text-sm tracking-[0.2em] text-slate-100 drop-shadow-md">
                {maskedCardNumber}
              </p>
            </div>

            {/* Bottom: Cardholder & Expiry */}
            <div className="flex items-end justify-between text-[9px] sm:text-[10px] z-10 pt-1 border-t border-white/10">
              <div>
                <p className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold">
                  CARD HOLDER
                </p>
                <p className="font-mono-code font-bold tracking-wider text-slate-200 uppercase truncate max-w-[140px]">
                  {card.cardHolder}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold">
                  VALID THRU
                </p>
                <p className="font-mono-code font-bold text-slate-200">
                  {card.validity}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specs table matching Image 3 EXACTLY */}
      <div className="rounded-xl bg-[#070b18] border border-slate-800/90 p-3 sm:p-3.5 mb-4 space-y-2.5 font-mono-code text-xs sm:text-[13px]">
        {/* CARD LIMIT */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <span className="text-slate-400 font-semibold tracking-wider uppercase text-[11px] sm:text-xs">
            CARD LIMIT
          </span>
          <span className="text-white font-bold tracking-wide">
            {card.cardLimit}
          </span>
        </div>

        {/* VALIDITY */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <span className="text-slate-400 font-semibold tracking-wider uppercase text-[11px] sm:text-xs">
            VALIDITY
          </span>
          <span className="text-slate-200 font-bold tracking-wide">
            {card.validity}
          </span>
        </div>

        {/* REFUND POLICY (bright green matching screenshot 3) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <span className="text-slate-400 font-semibold tracking-wider uppercase text-[11px] sm:text-xs">
            REFUND POLICY
          </span>
          <span className="text-[#10b981] font-bold tracking-wide">
            {card.refundPolicy}
          </span>
        </div>

        {/* INSTANT RELEASE (yellow lightning + lavender text matching screenshot 3) */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold tracking-wider uppercase text-[11px] sm:text-xs">
            INSTANT RELEASE
          </span>
          <span className="flex items-center space-x-1.5 text-[#c084fc] font-bold tracking-wide">
            <span className="text-yellow-400">&#9889;</span>
            <span>{card.instantRelease}</span>
          </span>
        </div>
      </div>

      {/* Bottom row: Acquisition Price, In Pool, and BUY NOW button matching screenshot 2 */}
      <div className="pt-2 border-t border-slate-800/70">
        <div className="flex items-center justify-between mb-2.5 text-xs">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              ACQUISITION PRICE
            </p>
            <p className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">
              ₹{card.price}
            </p>
          </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-mono-code">
                In Pool: <span className="text-emerald-400 font-bold tracking-wide">{card.inPool || 'Unlimited'}</span>
              </span>
            </div>
        </div>

        {/* BUY NOW button */}
        <button
          onClick={() => onBuy(card)}
          disabled={!card.inStock}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            card.inStock
              ? 'bg-[#0f172a] hover:bg-[#1e1b4b] border border-slate-700/80 hover:border-purple-500/80 text-white hover:shadow-lg hover:shadow-purple-900/30 active:scale-95'
              : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          {card.inStock ? 'BUY NOW' : 'OUT OF STOCK'}
        </button>
      </div>
    </div>
  );
};
