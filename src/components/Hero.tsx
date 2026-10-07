import React from 'react';
import { ArrowRight, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 text-center px-4">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-purple-600/15 via-blue-600/15 to-pink-600/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Top badge from screenshot */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
          <span>• INSTANT SECURE CREDENTIALS</span>
        </div>

        {/* Main Title */}
        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-wider text-white mb-3">
          DARK CARDING
        </h1>

        {/* English Subtitle badge */}
        <div className="inline-block px-4 py-1 rounded-full bg-[#131b34]/70 border border-slate-700/60 text-slate-300 text-xs sm:text-sm font-medium mb-6">
          DARK CARDING &bull; Digital Virtual Cards &amp; TikTok Coins
        </div>

        {/* Secondary Headline */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight max-w-3xl mb-4 leading-tight">
          The Most Trusted <br className="hidden sm:inline" />
          Premium Virtual Card Platform
        </h2>

        {/* Sub-description */}
        <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mb-8 leading-relaxed font-normal">
          Instant. Global. Verified. Get instant digital virtual debit &amp; credit cards for uninterrupted online payments.
        </p>

        {/* Explore Marketplace CTA Button */}
        <button
          onClick={onExplore}
          className="group relative inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 hover:from-blue-500 hover:via-indigo-500 hover:to-pink-400 text-white font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 cursor-pointer glow-pink-btn"
        >
          <span>EXPLORE MARKETPLACE</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Stats card box matching the screenshot */}
        <div className="mt-12 sm:mt-14 w-full max-w-xl mx-auto rounded-2xl bg-[#0c1226]/80 border border-slate-800/80 p-5 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

          {/* Top two stats */}
          <div className="grid grid-cols-2 gap-4 pb-5 border-b border-slate-800/80">
            <div className="text-center">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-wide">
                2000+
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 tracking-wider uppercase mt-1 font-semibold">
                CARDS SOLD
              </div>
            </div>

            <div className="text-center border-l border-slate-800/80">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-purple-400 tracking-wide">
                INSTANT
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 tracking-wider uppercase mt-1 font-semibold">
                VERIFICATION SLA
              </div>
            </div>
          </div>

          {/* Bottom center stat matching screenshot (99.99% SUCCESS RATE in cyan/teal) */}
          <div className="pt-5 text-center">
            <div className="font-display font-black text-3xl sm:text-4xl text-[#22d3ee] tracking-wide">
              99.99%
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 tracking-wider uppercase mt-1 font-semibold">
              SUCCESS RATE
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
