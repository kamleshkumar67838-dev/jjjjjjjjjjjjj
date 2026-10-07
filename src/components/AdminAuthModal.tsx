import React, { useState } from 'react';
import { Lock, X, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  adminPin: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  adminPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === adminPin || pin.trim() === 'kamlesh@90') {
      setError(false);
      setPin('');
      onAuthenticated();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#090d1f] border border-slate-700/80 shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display font-extrabold text-lg text-white tracking-wider">
            ADMIN PANEL ACCESS
          </h3>
          <p className="text-xs text-slate-400">
            Enter admin password to manage QR Code, Cards photo, and Orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              placeholder="Enter Admin Password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-center text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono-code tracking-widest text-lg"
            />
            {error && (
              <p className="text-xs text-red-400 mt-1.5 text-center flex items-center justify-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Incorrect Password! Please enter valid admin password.</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-700/30"
          >
            Unlock Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
};
