import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Upload, ShieldCheck, Zap, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { VirtualCard, PaymentSettings, CustomerOrder } from '../types';

interface CheckoutModalProps {
  card: VirtualCard | null;
  paymentSettings: PaymentSettings;
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (order: Omit<CustomerOrder, 'id' | 'status' | 'createdAt'>) => string;
  onViewOrder: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  card,
  paymentSettings,
  isOpen,
  onClose,
  onSubmitOrder,
  onViewOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerTelegram, setCustomerTelegram] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !card) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Screenshot size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!screenshotPreview) {
      setErrorMessage('Please upload your payment screenshot slip before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId = onSubmitOrder({
        cardId: card.id,
        cardTitle: `${card.categoryLabel} - ${card.title}`,
        category: card.category,
        categoryLabel: card.categoryLabel,
        amount: card.price,
        customerName: customerName.trim() || 'Valued Customer',
        customerEmail: customerEmail.trim() || 'Direct Customer',
        customerTelegram: customerTelegram.trim(),
        customerPhone: customerPhone.trim(),
        utr: `SLIP-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentProofUrl: screenshotPreview || undefined,
      });

      setSubmittedOrderId(generatedId);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormAndClose = () => {
    setSubmittedOrderId(null);
    setScreenshotPreview(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#090d1f] border border-slate-700/80 shadow-2xl overflow-hidden my-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d132a]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            <h3 className="font-display font-extrabold text-lg text-white tracking-wider">
              {submittedOrderId ? 'ORDER CONFIRMATION' : 'SECURE CHECKOUT • INSTANT ACQUISITION'}
            </h3>
          </div>
          <button
            onClick={resetFormAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedOrderId ? (
          /* Order Submitted Success View */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/30">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-white">Order Submitted Successfully!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Your payment has been submitted for verification. Card credentials will be issued within 10 minutes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e1630] border border-purple-500/30 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono-code font-bold text-purple-300 text-sm">{submittedOrderId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Card Item:</span>
                <span className="text-white font-semibold">{card.categoryLabel} ({card.title})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-emerald-400 font-bold">₹{card.price}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Payment Proof:</span>
                <span className="font-semibold text-emerald-400">Screenshot Attached</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Delivery SLA:</span>
                <span className="text-yellow-400 font-bold flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1" /> 10 Mins SLA
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  onViewOrder(submittedOrderId);
                  resetFormAndClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                View in MY ORDERS
              </button>
              
              <a
                href={paymentSettings.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/40 text-[#38bdf8] font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <span>Telegram Support: {paymentSettings.telegramUsername}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Checkout Form View with Live QR Code */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Card Summary Mini Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d142c] border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  {card.categoryLabel}
                </span>
                <h4 className="text-base font-extrabold text-white">{card.title} Virtual Card</h4>
                <p className="text-xs text-slate-400 font-mono-code">
                  Limit: {card.cardLimit} • {card.validity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">TOTAL DUE</p>
                <p className="font-display font-black text-2xl text-emerald-400">₹{card.price}</p>
              </div>
            </div>

            {/* Step 1: Live QR Code & UPI Payment Area */}
            <div className="p-4 rounded-xl bg-[#090f24] border-2 border-purple-500/30 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center space-x-1.5">
                  <QrCode className="w-4 h-4 text-purple-400" />
                  <span>1. Scan QR Code &amp; Pay ₹{card.price}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  LIVE UPI
                </span>
              </div>

              {/* QR Code Graphic Box with fallback */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner max-w-[210px] mx-auto border-2 border-purple-400">
                <img
                  src={paymentSettings.qrCodeUrl}
                  alt="Official Payment QR Code"
                  className="w-44 h-44 object-contain rounded-lg"
                />
                <span className="text-[10px] font-bold text-slate-800 mt-1 uppercase tracking-wider">
                  {paymentSettings.payeeName}
                </span>
              </div>

              {/* UPI ID with 1-click copy */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-700">
                <div className="truncate mr-2">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">UPI ID:</span>
                  <span className="font-mono-code font-bold text-xs text-purple-300 select-all">
                    {paymentSettings.upiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Payment Proof Screenshot Upload */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Payment Proof Screenshot
              </label>

              {/* Payment Screenshot Upload */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border-2 border-dashed border-purple-500/40 hover:border-purple-400 transition flex flex-col items-center justify-center">
                {screenshotPreview ? (
                  <div className="relative w-full flex items-center justify-between p-1">
                    <div className="flex items-center space-x-3">
                      <img
                        src={screenshotPreview}
                        alt="Proof preview"
                        className="h-14 w-14 object-cover rounded-lg border border-purple-400/60 shadow"
                      />
                      <div>
                        <span className="text-xs text-emerald-400 font-bold block flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Screenshot Attached!</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Ready for instant SLA review</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshotPreview(null)}
                      className="px-2.5 py-1 text-xs text-red-400 hover:text-white hover:bg-red-950/60 rounded-md border border-red-500/30 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center space-y-1.5 w-full text-center py-1">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-purple-200 font-bold">
                      Upload Payment Screenshot (Payment Slip)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Click to choose PhonePe / GPay / Paytm payment slip (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-purple-600/30 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : `Confirm Payment (₹${card.price} Paid)`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
