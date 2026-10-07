import React, { useState, useRef } from 'react';
import {
  X,
  QrCode,
  CreditCard,
  ShoppingBag,
  Settings,
  Upload,
  Check,
  AlertCircle,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Image as ImageIcon
} from 'lucide-react';
import { VirtualCard, PaymentSettings, CustomerOrder, CardCredentials } from '../types';
import { DEFAULT_QR_CODE } from '../data/initialData';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cards: VirtualCard[];
  paymentSettings: PaymentSettings;
  orders: CustomerOrder[];
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
  onUpdateCards: (cards: VirtualCard[]) => void;
  onUpdateOrders: (orders: CustomerOrder[]) => void;
  adminPin: string;
  onUpdateAdminPin: (pin: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  cards,
  paymentSettings,
  orders,
  onUpdatePaymentSettings,
  onUpdateCards,
  onUpdateOrders,
  adminPin,
  onUpdateAdminPin,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'cards' | 'orders' | 'settings'>('qr');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // QR Code Form State
  const [qrCodeUrl, setQrCodeUrl] = useState(paymentSettings.qrCodeUrl);
  const [upiId, setUpiId] = useState(paymentSettings.upiId);
  const [payeeName, setPayeeName] = useState(paymentSettings.payeeName);
  const [instructions, setInstructions] = useState(paymentSettings.instructions);
  const [telegramUsername, setTelegramUsername] = useState(paymentSettings.telegramUsername);
  const [telegramUrl, setTelegramUrl] = useState(paymentSettings.telegramUrl);

  // Cards Form State
  const [editingCard, setEditingCard] = useState<VirtualCard | null>(null);
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);

  // Orders State
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);
  const [approvingOrder, setApprovingOrder] = useState<CustomerOrder | null>(null);
  const [approvalCredentials, setApprovalCredentials] = useState<CardCredentials>({
    cardNumber: '',
    cvv: '',
    expiry: '',
    cardHolder: 'DOMINIC BEAUMONT',
    balance: '₹ 5000 Balance',
    pin: '4820',
    tiktokVoucherCode: '',
    notes: 'Approved & active for payments.',
  });

  // Pin state
  const [newPin, setNewPin] = useState(adminPin);

  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const cardPhotoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Handle QR Code File Upload - Instantly syncs to live website!
  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image size must be under 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setQrCodeUrl(base64);

        // Immediately update store so any customer checkout shows this new QR code without reload!
        const updated: PaymentSettings = {
          ...paymentSettings,
          qrCodeUrl: base64,
          upiId: upiId.trim() || paymentSettings.upiId,
          payeeName: payeeName.trim() || paymentSettings.payeeName,
          instructions: instructions.trim() || paymentSettings.instructions,
          telegramUsername: telegramUsername.trim() || paymentSettings.telegramUsername,
          telegramUrl: telegramUrl.trim() || paymentSettings.telegramUrl,
        };
        onUpdatePaymentSettings(updated);
        showToast('✅ QR Code uploaded & immediately live on website checkout!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save QR and Payment Settings
  const handleSavePaymentSettings = () => {
    const updated: PaymentSettings = {
      qrCodeUrl: qrCodeUrl || DEFAULT_QR_CODE,
      upiId: upiId.trim() || 'darkcarding@ybl',
      payeeName: payeeName.trim() || 'DARK CARDING STORE',
      instructions: instructions.trim(),
      telegramUsername: telegramUsername.trim() || '@cardingfoco',
      telegramUrl: telegramUrl.trim() || 'https://t.me/cardingfoco',
    };
    onUpdatePaymentSettings(updated);
    showToast('✅ QR Code & Payment Settings updated live across the entire website!');
  };

  // 2. Handle Card Photo Upload
  const handleCardPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingCard) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setEditingCard({
          ...editingCard,
          customImageUrl: base64,
        });
        showToast('Card Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save or Update Card
  const handleSaveCard = (cardToSave: VirtualCard) => {
    const existingIndex = cards.findIndex((c) => c.id === cardToSave.id);
    let updated: VirtualCard[];
    if (existingIndex >= 0) {
      updated = [...cards];
      updated[existingIndex] = cardToSave;
    } else {
      updated = [cardToSave, ...cards];
    }
    onUpdateCards(updated);
    setEditingCard(null);
    setIsAddingNewCard(false);
    showToast('✅ Card specs & photo updated successfully!');
  };

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      const updated = cards.filter((c) => c.id !== cardId);
      onUpdateCards(updated);
      showToast('Card deleted.');
    }
  };

  const openApprovalModal = (order: CustomerOrder) => {
    setApprovingOrder(order);
    const isTikTok = order.category === 'tiktok';
    const prefix = order.category === 'visa' ? '4532' : order.category === 'mastercard' ? '5412' : order.category === 'international' ? '4111' : '8842';
    const randomCardDigits = `${prefix} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const randomCvv = Math.floor(100 + Math.random() * 900).toString();
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const tiktokVoucher = isTikTok ? `TK-COIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    setApprovalCredentials({
      cardNumber: randomCardDigits,
      cvv: randomCvv,
      expiry: '12/28',
      cardHolder: order.customerName || 'DOMINIC BEAUMONT',
      balance: isTikTok ? '10,000 TikTok Coins' : `₹ ${order.amount * 10 || 5000} Balance`,
      pin: randomPin,
      tiktokVoucherCode: tiktokVoucher,
      notes: isTikTok ? 'Coins loaded to voucher code. Redeem directly on TikTok.' : 'Active for all payments. Instant escrow released.',
    });
  };

  const handleConfirmApproval = () => {
    if (!approvingOrder) return;
    const updatedOrders = orders.map((o) => {
      if (o.id === approvingOrder.id) {
        return {
          ...o,
          status: 'approved' as const,
          approvedAt: new Date().toISOString(),
          credentials: approvalCredentials,
        };
      }
      return o;
    });
    onUpdateOrders(updatedOrders);
    setApprovingOrder(null);
    showToast(`✅ Order #${approvingOrder.id} approved! Credentials delivered to customer.`);
  };

  const handleRejectOrder = (orderId: string) => {
    const reason = prompt('Enter rejection reason (e.g. Invalid UTR, Payment not received):');
    if (reason !== null) {
      const updatedOrders = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'rejected' as const,
            rejectionReason: reason || 'Invalid payment proof / UTR not found.',
          };
        }
        return o;
      });
      onUpdateOrders(updatedOrders);
      showToast(`Order #${orderId} marked as rejected.`);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#090d1f] border border-emerald-500/40 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Admin Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#070b1a] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-black text-lg text-white tracking-wider">
                  DARK CARDING &bull; CONTROL PANEL
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  FAST &amp; LOADED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Manage QR Code, Card Photos, Specs &amp; Instant Deliveries
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

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 px-4 py-2.5 bg-[#0b1026] border-b border-slate-800 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
              activeTab === 'qr'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code &amp; UPI</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
              activeTab === 'cards'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cards &amp; Photos ({cards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders &amp; Approvals</span>
            {pendingOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-extrabold text-[10px] animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram &amp; Settings</span>
          </button>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2 text-xs text-emerald-300 font-semibold flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Tab 1: QR Code & Payment Setup (Crucial User Requirement!) */}
        {activeTab === 'qr' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-xl flex items-start space-x-3">
              <QrCode className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Live Payment QR Code System (कस्टमर चेकआउट क्यूआर कोड)
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  आप यहाँ अपना कोई भी QR कोड (PhonePe, Google Pay, Paytm, बैंक QR) अपलोड कर सकते हैं। जब भी कोई कस्टमर 'BUY NOW' पर क्लिक करेगा, उसे यही QR कोड दिखेगा!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: QR Code Image Upload & Preview */}
              <div className="rounded-xl bg-[#0c1228] border border-slate-800 p-5 space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Current Live QR Code</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Active on Store</span>
                </h5>

                {/* Live QR Image Box */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner max-w-[220px] mx-auto border-2 border-purple-500">
                  <img
                    src={qrCodeUrl}
                    alt="Active QR Code"
                    className="w-48 h-48 object-contain rounded"
                  />
                  <span className="text-[10px] font-bold text-slate-800 mt-1 uppercase">
                    {payeeName || 'DARK CARDING STORE'}
                  </span>
                </div>

                {/* Upload Buttons */}
                <div className="space-y-2 pt-2">
                  <input
                    ref={qrFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleQrFileUpload}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => qrFileInputRef.current?.click()}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New QR Code Image (गैलरी से फोटो चुनें)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQrCodeUrl(DEFAULT_QR_CODE);
                      showToast('Reset to default clean UPI QR Code.');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Reset to Default UPI QR
                  </button>
                </div>
              </div>

              {/* Right Column: UPI & Payment Details Form */}
              <div className="rounded-xl bg-[#0c1228] border border-slate-800 p-5 space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Payment Credentials &amp; Copy Text
                </h5>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    UPI ID (कस्टमर को कॉपी करने के लिए) *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@ybl or yourupi@paytm"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white font-mono-code focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Account / Payee Display Name (खाते का नाम)
                  </label>
                  <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="e.g. DARK CARDING STORE"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Payment Instructions for Customers (निर्देश)
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Instructions shown on checkout modal..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSavePaymentSettings}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save QR Settings (वेबसाइट पर तुरंत लागू करें)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cards & Photos Management ("कार्ड में फोटो वगैरह सारा कुछ लगा सकता हूं") */}
        {activeTab === 'cards' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Manage Virtual Cards &amp; Custom Photos
                </h4>
                <p className="text-xs text-slate-400">
                  Update card prices, balance, limit, validity, stock status, or upload custom card photos!
                </p>
              </div>

              <button
                onClick={() => {
                  const newCardTemplate: VirtualCard = {
                    id: `card-custom-${Date.now()}`,
                    category: 'visa',
                    categoryLabel: 'वीज़ा कार्ड',
                    title: 'Platinum Custom',
                    cardHolder: 'DOMINIC BEAUMONT',
                    cardNumberMask: '4111 8820 9010 3381',
                    validity: '12/2029',
                    cardLimit: '₹ 20000 Balance',
                    refundPolicy: '100% Refundable',
                    instantRelease: '⚡ 10 Mins SLA',
                    price: 750,
                    inPool: 'Unlimited',
                    inStock: true,
                    badges: ['IN STOCK', 'VIP ACCESS', 'FEATURED'],
                    cardTier: 'Platinum',
                  };
                  setEditingCard(newCardTemplate);
                  setIsAddingNewCard(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Card (+ नया कार्ड जोड़ें)</span>
              </button>
            </div>

            {/* Editing Card Form Modal */}
            {editingCard && (
              <div className="p-5 rounded-2xl bg-[#0c142e] border-2 border-purple-500/50 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h5 className="font-bold text-sm text-purple-300">
                    {isAddingNewCard ? 'Add New Card' : `Edit Card: ${editingCard.title}`}
                  </h5>
                  <button
                    onClick={() => {
                      setEditingCard(null);
                      setIsAddingNewCard(false);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Photo Upload Section */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Card Photo / Skin Image (कार्ड पर कस्टम फोटो)
                    </label>

                    {editingCard.customImageUrl ? (
                      <div className="relative w-full aspect-[1.58/1] rounded-xl overflow-hidden border border-purple-500/50">
                        <img
                          src={editingCard.customImageUrl}
                          alt="Card preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingCard({ ...editingCard, customImageUrl: undefined })}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/80 text-white hover:bg-red-600 text-xs cursor-pointer"
                          title="Remove custom photo and use default high-tech card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-[1.58/1] rounded-xl border border-dashed border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
                        <span className="text-xs text-slate-400">No custom photo attached</span>
                        <span className="text-[10px] text-slate-500">
                          (Default high-tech chip card mockup will be rendered)
                        </span>
                      </div>
                    )}

                    <input
                      ref={cardPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCardPhotoUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => cardPhotoInputRef.current?.click()}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Card Photo (फोटो अपलोड करें)</span>
                    </button>
                  </div>

                  {/* Specs & Pricing Form */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Category (श्रेणी)
                        </label>
                        <select
                          value={editingCard.category}
                          onChange={(e) => {
                            const cat = e.target.value as any;
                            const labelMap = {
                              visa: 'Visa Card',
                              mastercard: 'Mastercard',
                              international: 'International Card',
                              tiktok: 'TikTok Coin Card',
                            };
                            setEditingCard({
                              ...editingCard,
                              category: cat,
                              categoryLabel: (labelMap as any)[cat] || 'Visa Card',
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        >
                          <option value="visa">Visa Card</option>
                          <option value="mastercard">Mastercard</option>
                          <option value="international">International Card</option>
                          <option value="tiktok">TikTok Coin Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Card Title / Tier
                        </label>
                        <input
                          type="text"
                          value={editingCard.title}
                          onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Acquisition Price (₹ कीमत) *
                        </label>
                        <input
                          type="number"
                          value={editingCard.price}
                          onChange={(e) => setEditingCard({ ...editingCard, price: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Card Limit / Balance
                        </label>
                        <input
                          type="text"
                          value={editingCard.cardLimit}
                          onChange={(e) => setEditingCard({ ...editingCard, cardLimit: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Validity (वैधता)
                        </label>
                        <input
                          type="text"
                          value={editingCard.validity}
                          onChange={(e) => setEditingCard({ ...editingCard, validity: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          In Pool Stock (e.g. Unlimited)
                        </label>
                        <input
                          type="text"
                          value={editingCard.inPool}
                          onChange={(e) => setEditingCard({ ...editingCard, inPool: e.target.value })}
                          placeholder="Unlimited"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Card Holder Name
                        </label>
                        <input
                          type="text"
                          value={editingCard.cardHolder}
                          onChange={(e) => setEditingCard({ ...editingCard, cardHolder: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Card Number (or Last 4 Digits)
                        </label>
                        <input
                          type="text"
                          value={editingCard.cardNumberMask}
                          onChange={(e) => setEditingCard({ ...editingCard, cardNumberMask: e.target.value })}
                          placeholder="•••• •••• •••• 9010"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Instant Release SLA
                        </label>
                        <input
                          type="text"
                          value={editingCard.instantRelease}
                          onChange={(e) => setEditingCard({ ...editingCard, instantRelease: e.target.value })}
                          placeholder="⚡ 10 Mins SLA"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Refund Policy
                        </label>
                        <input
                          type="text"
                          value={editingCard.refundPolicy}
                          onChange={(e) => setEditingCard({ ...editingCard, refundPolicy: e.target.value })}
                          placeholder="100% Refundable"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={editingCard.inStock}
                          onChange={(e) => setEditingCard({ ...editingCard, inStock: e.target.checked })}
                          className="rounded text-purple-600 focus:ring-0"
                        />
                        <span className="font-bold">IN STOCK (Active / Available)</span>
                      </label>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveCard(editingCard)}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Save Card Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCard(null);
                          setIsAddingNewCard(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cards Grid List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl bg-[#0c1228] border border-slate-800 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-purple-400">
                        {card.categoryLabel}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        card.inStock ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                      }`}>
                        {card.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </div>

                    {card.customImageUrl ? (
                      <div className="w-full h-24 rounded-lg overflow-hidden mb-2 border border-slate-700">
                        <img src={card.customImageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono mb-2">
                        Realistic Chip Card Active
                      </div>
                    )}

                    <h5 className="font-bold text-sm text-white">{card.title}</h5>
                    <p className="text-xs text-slate-400 font-mono-code">
                      Limit: {card.cardLimit} • ₹{card.price}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEditingCard(card);
                        setIsAddingNewCard(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold transition cursor-pointer"
                    >
                      Edit Specs / Photo
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Orders & Deliveries Management */}
        {activeTab === 'orders' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Customer Orders &amp; Instant SLA Deliveries
                </h4>
                <p className="text-xs text-slate-400">
                  Verify customer UTR payments and deliver card credentials in 1 click.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition cursor-pointer ${
                      orderFilter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by Order ID, UTR, Customer Email/Phone..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono-code"
            />

            {/* Orders Table */}
            <div className="space-y-3">
              {orders
                .filter((o) => {
                  if (orderFilter !== 'all' && o.status !== orderFilter) return false;
                  if (!orderSearch.trim()) return true;
                  const q = orderSearch.toLowerCase();
                  return (
                    o.id.toLowerCase().includes(q) ||
                    o.utr.toLowerCase().includes(q) ||
                    o.customerEmail.toLowerCase().includes(q) ||
                    o.customerTelegram.toLowerCase().includes(q)
                  );
                })
                .map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl bg-[#0c1228] border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono-code font-bold text-sm text-purple-300">
                          #{order.id}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {order.cardTitle}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          ₹{order.amount}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {order.status === 'pending' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-bold animate-pulse">
                            Pending Verification
                          </span>
                        )}
                        {order.status === 'approved' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                            Delivered
                          </span>
                        )}
                        {order.status === 'rejected' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] font-bold">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#070b18] p-3 rounded-lg border border-slate-800/60 font-mono-code">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Customer</span>
                        <span className="text-slate-200">{order.customerEmail}</span>
                        {order.customerTelegram && (
                          <span className="text-blue-300 block text-[11px]">
                            TG: {order.customerTelegram}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">UTR Reference</span>
                        <span className="text-white font-bold tracking-wider select-all">
                          {order.utr}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-1">Proof Screenshot</span>
                        {order.paymentProofUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedProofImage(order.paymentProofUrl!)}
                            className="group inline-flex items-center space-x-2 p-1 bg-slate-900 border border-purple-500/40 hover:border-purple-400 rounded-lg transition cursor-pointer"
                          >
                            <img
                              src={order.paymentProofUrl}
                              alt="Proof"
                              className="w-9 h-9 object-cover rounded"
                            />
                            <div className="text-left pr-1">
                              <span className="text-[11px] text-purple-300 font-bold block flex items-center">
                                <Eye className="w-3 h-3 mr-1" /> View Slip
                              </span>
                              <span className="text-[9px] text-slate-400">Click to open</span>
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">No file uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-800/60">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openApprovalModal(order)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve &amp; Deliver Card</span>
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            className="px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 hover:bg-red-900 hover:text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {order.status === 'approved' && (
                        <button
                          onClick={() => openApprovalModal(order)}
                          className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
                        >
                          View / Edit Credentials
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: Telegram & Settings */}
        {activeTab === 'settings' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            <div className="rounded-xl bg-[#0c1228] border border-slate-800 p-5 space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Send className="w-4 h-4 text-blue-400" />
                <span>Telegram Support Configuration</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Telegram Support Handle (e.g. @Lottaygent)
                  </label>
                  <input
                    type="text"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Direct Telegram Link
                  </label>
                  <input
                    type="text"
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePaymentSettings}
                className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Save Telegram Link
              </button>
            </div>

            {/* Change Admin PIN */}
            <div className="rounded-xl bg-[#0c1228] border border-slate-800 p-5 space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Change Admin Passcode</span>
              </h5>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  New Admin PIN
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new PIN"
                  className="w-full max-w-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (newPin.trim()) {
                    onUpdateAdminPin(newPin.trim());
                    showToast('Admin PIN updated!');
                  }
                }}
                className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Update PIN
              </button>
            </div>
          </div>
        )}

        {/* Modal: View Screenshot Full Resolution */}
        {selectedProofImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="relative max-w-lg w-full bg-[#090d1f] rounded-2xl border border-slate-700 p-4">
              <button
                onClick={() => setSelectedProofImage(null)}
                className="absolute top-3 right-3 p-1 rounded-full bg-slate-800 text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-3">Customer Payment Slip</h4>
              <img
                src={selectedProofImage}
                alt="Payment slip"
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Modal: Approve & Release Credentials */}
        {approvingOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="relative max-w-lg w-full bg-[#090d1f] rounded-2xl border-2 border-emerald-500/50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-emerald-300">
                  Release Card Credentials for Order #{approvingOrder.id}
                </h4>
                <button
                  onClick={() => setApprovingOrder(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                These credentials will immediately unlock inside the customer's "MY ORDERS" screen.
              </p>

              <div className="space-y-3 font-mono-code text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Card Number (16-Digit)</label>
                  <input
                    type="text"
                    value={approvalCredentials.cardNumber}
                    onChange={(e) => setApprovalCredentials({ ...approvalCredentials, cardNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">CVV</label>
                    <input
                      type="text"
                      value={approvalCredentials.cvv}
                      onChange={(e) => setApprovalCredentials({ ...approvalCredentials, cvv: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={approvalCredentials.expiry}
                      onChange={(e) => setApprovalCredentials({ ...approvalCredentials, expiry: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      value={approvalCredentials.cardHolder}
                      onChange={(e) => setApprovalCredentials({ ...approvalCredentials, cardHolder: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Loaded Balance</label>
                    <input
                      type="text"
                      value={approvalCredentials.balance}
                      onChange={(e) => setApprovalCredentials({ ...approvalCredentials, balance: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                {approvingOrder.category === 'tiktok' && (
                  <div>
                    <label className="text-[10px] text-[#fe2c55] font-bold uppercase block mb-1">
                      TikTok Coin Redemption Voucher Code
                    </label>
                    <input
                      type="text"
                      value={approvalCredentials.tiktokVoucherCode || ''}
                      onChange={(e) => setApprovalCredentials({ ...approvalCredentials, tiktokVoucherCode: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-[#fe2c55]/50 text-white font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirmApproval}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-900/30"
                >
                  Deliver Credentials to Customer Now
                </button>
                <button
                  type="button"
                  onClick={() => setApprovingOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
