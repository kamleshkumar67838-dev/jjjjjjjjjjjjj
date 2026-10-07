import React, { useState } from 'react';
import { Send, X, ExternalLink, MessageSquare, ShieldCheck, Zap, HelpCircle, CheckCircle } from 'lucide-react';
import { PaymentSettings } from '../types';

interface TelegramSupportModalProps {
  paymentSettings: PaymentSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramSupportModal: React.FC<TelegramSupportModalProps> = ({
  paymentSettings,
  isOpen,
  onClose,
}) => {
  const [inquiryTopic, setInquiryTopic] = useState('Payment / UTR Verification');
  const [customMsg, setCustomMsg] = useState('');

  if (!isOpen) return null;

  const handleOpenTelegram = () => {
    const text = encodeURIComponent(
      `Hello Dark Carding Support! Topic: ${inquiryTopic}. Message: ${customMsg || 'I need assistance with my virtual card order.'}`
    );
    const cleanUsername = paymentSettings.telegramUsername.replace('@', '');
    const url = `https://t.me/${cleanUsername}?text=${text}`;
    window.open(url, '_blank');
  };

  const faqs = [
    {
      q: 'How fast will I receive my virtual card?',
      a: 'We have an instant 10-minute SLA verification. Once your UTR number is verified against the payment QR, card credentials will appear in "MY ORDERS".',
    },
    {
      q: 'Where do these cards work?',
      a: 'Visa & Mastercard work on all Indian and global platforms (Netflix, Spotify, AWS, Google Play, Chatgpt, etc.). International cards work worldwide with USD/EUR billing.',
    },
    {
      q: 'How do TikTok Coin cards work?',
      a: 'TikTok coin cards deliver instant gift vouchers preloaded with coins for TikTok Live streams and creator gifting.',
    },
    {
      q: 'Is there a refund policy?',
      a: 'Yes, 100% money back guarantee if any technical issue arises with your card within the validity window.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#090d1f] border border-slate-700/80 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0088cc]/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-md">
              <Send className="w-4 h-4 -rotate-12 translate-x-[-1px] translate-y-[-1px]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white tracking-wider">
                TELEGRAM SUPPORT 24/7
              </h3>
              <p className="text-[11px] text-blue-300 font-mono-code">
                {paymentSettings.telegramUsername} &bull; Active Now
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Direct Telegram Action Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0088cc]/20 via-[#006699]/15 to-[#0088cc]/10 border border-[#0088cc]/40 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Direct Agent Support</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Connect instantly with our executive on Telegram for live order tracking, UTR verification, or custom limits.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Select Inquiry Topic
              </label>
              <select
                value={inquiryTopic}
                onChange={(e) => setInquiryTopic(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option>Payment / UTR Verification</option>
                <option>Card Credentials Assistance</option>
                <option>TikTok Coins Recharge</option>
                <option>Custom High Balance Card Request</option>
                <option>Other Queries</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="Optional message / Order ID..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenTelegram}
              className="w-full py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center space-x-2 shadow-lg shadow-[#0088cc]/30 transition active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Open Telegram Chat ({paymentSettings.telegramUsername})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FAQs */}
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Frequently Asked Questions</span>
            </h5>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#070b18] border border-slate-800 text-xs space-y-1">
                  <p className="font-bold text-slate-200">{faq.q}</p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FloatingTelegramButton: React.FC<{
  telegramUsername: string;
  onClick: () => void;
}> = ({ telegramUsername, onClick }) => {
  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40">
      <button
        onClick={onClick}
        className="group flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#0088cc] to-[#00a2ed] hover:from-[#0077b5] hover:to-[#0088cc] text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-900/40 border border-cyan-300/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <Send className="w-3 h-3 text-white" />
        </div>
        <div className="text-left">
          <span className="block leading-none text-[11px] sm:text-xs font-extrabold tracking-wide">
            Telegram Support
          </span>
          <span className="block leading-none text-[10px] text-cyan-100 font-mono-code font-normal">
            {telegramUsername}
          </span>
        </div>
      </button>
    </div>
  );
};
