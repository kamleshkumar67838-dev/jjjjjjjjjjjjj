import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CardFilter } from './components/CardFilter';
import { CardItem } from './components/CardItem';
import { CheckoutModal } from './components/CheckoutModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { TelegramSupportModal, FloatingTelegramButton } from './components/TelegramSupportModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminPanel } from './components/AdminPanel';
import {
  getStoredCards,
  getStoredPaymentSettings,
  getStoredOrders,
  getCustomerOrderIds,
  addCustomerOrderId,
  getAdminPin,
  saveAdminPin,
} from './utils/storage';
import {
  fetchPaymentSettings,
  updatePaymentSettings,
  fetchCards,
  updateCards,
  fetchOrders,
  createOrder,
  updateOrdersList,
} from './utils/api';
import {
  subscribeToPaymentSettings,
  pushPaymentSettingsToFirebase,
  subscribeToCards,
  pushCardsToFirebase,
  subscribeToOrders,
  pushOrderToFirebase,
  updateOrderInFirebase,
} from './utils/firebaseSync';
import { testFirestoreConnection } from './firebase';
import { FakeSalesNotification } from './components/FakeSalesNotification';
import { VirtualCard, PaymentSettings, CustomerOrder, CardCategory } from './types';
import { ShieldCheck, Lock, Zap, RefreshCw, Send, CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  const [cards, setCards] = useState<VirtualCard[]>(getStoredCards);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(getStoredPaymentSettings);
  const [orders, setOrders] = useState<CustomerOrder[]>(getStoredOrders);
  const [customerOrderIds, setCustomerOrderIds] = useState<string[]>(getCustomerOrderIds);
  const [adminPin, setAdminPin] = useState<string>(getAdminPin);

  // Filter state
  const [activeCategory, setActiveCategory] = useState<'all' | CardCategory>('all');

  // Modal states
  const [selectedCardForBuy, setSelectedCardForBuy] = useState<VirtualCard | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [selectedOrderIdForLookup, setSelectedOrderIdForLookup] = useState<string | null>(null);

  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Real-time Firebase & Server Synchronization
  useEffect(() => {
    // 1. Test connection
    testFirestoreConnection();

    // 2. Real-time Firebase Firestore Listeners (Zero-delay updates across devices)
    const unsubPayment = subscribeToPaymentSettings((liveSettings) => {
      setPaymentSettings(liveSettings);
    });

    const unsubCards = subscribeToCards((liveCards) => {
      setCards(liveCards);
    });

    const unsubOrders = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
    });

    // 3. Server fallback initial pull
    fetchPaymentSettings().then((s) => {
      if (s && s.qrCodeUrl) setPaymentSettings(s);
    });
    fetchCards().then((c) => {
      if (c && c.length > 0) setCards(c);
    });
    fetchOrders().then((o) => {
      if (o) setOrders(o);
    });

    return () => {
      unsubPayment();
      unsubCards();
      unsubOrders();
    };
  }, []);

  // Sync state changes with Firebase & Server
  const handleUpdatePaymentSettings = (newSettings: PaymentSettings) => {
    setPaymentSettings(newSettings);
    pushPaymentSettingsToFirebase(newSettings);
    updatePaymentSettings(newSettings);
  };

  const handleUpdateCards = (newCards: VirtualCard[]) => {
    setCards(newCards);
    pushCardsToFirebase(newCards);
    updateCards(newCards);
  };

  const handleUpdateOrders = (newOrders: CustomerOrder[]) => {
    setOrders(newOrders);
    updateOrdersList(newOrders);
    // Push any changes to Firebase
    newOrders.forEach((o) => updateOrderInFirebase(o));
  };

  const handleUpdateAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    saveAdminPin(newPin);
  };

  // Buying flow
  const handleOpenBuy = (card: VirtualCard) => {
    setSelectedCardForBuy(card);
    setIsCheckoutOpen(true);
  };

  // Submit order from checkout modal
  const handleCreateOrder = (orderData: Omit<CustomerOrder, 'id' | 'status' | 'createdAt'>): string => {
    const orderId = `DC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: CustomerOrder = {
      ...orderData,
      id: orderId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    pushOrderToFirebase(newOrder);
    createOrder(newOrder);

    addCustomerOrderId(orderId);
    setCustomerOrderIds(getCustomerOrderIds());

    return orderId;
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderIdForLookup(orderId);
    setIsMyOrdersOpen(true);
  };

  // Filter cards
  const displayedCards = cards.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  const categoryCounts = {
    all: cards.length,
    visa: cards.filter((c) => c.category === 'visa').length,
    mastercard: cards.filter((c) => c.category === 'mastercard').length,
    international: cards.filter((c) => c.category === 'international').length,
    tiktok: cards.filter((c) => c.category === 'tiktok').length,
  };

  const scrollToMarketplace = () => {
    const el = document.getElementById('marketplace-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 cyber-grid relative overflow-x-hidden selection:bg-purple-600 selection:text-white flex flex-col justify-between">
      {/* Top ambient glow lights */}
      <div className="fixed top-0 left-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="fixed top-1/3 right-1/4 w-[450px] h-[350px] bg-blue-600/10 blur-[130px] pointer-events-none -z-10 rounded-full" />

      {/* Main App Content */}
      <div className="w-full">
        {/* Navigation Header matching screenshot */}
        <Header
          paymentSettings={paymentSettings}
          ordersCount={customerOrderIds.length}
          onOpenMyOrders={() => {
            setSelectedOrderIdForLookup(null);
            setIsMyOrdersOpen(true);
          }}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenAdmin={() => setIsAdminAuthOpen(true)}
          onScrollToCards={scrollToMarketplace}
        />

        {/* Hero Section matching screenshot */}
        <Hero onExplore={scrollToMarketplace} />

        {/* Marketplace Section Anchor */}
        <section id="marketplace-section" className="pt-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Card Category Filters */}
          <CardFilter
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            counts={categoryCounts}
          />

          {/* Cards Grid matching Image 2 & 3 */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
            {displayedCards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onBuy={handleOpenBuy}
              />
            ))}
          </div>

          {displayedCards.length === 0 && (
            <div className="text-center py-16 bg-[#0c1228]/60 rounded-2xl border border-slate-800 max-w-md mx-auto p-6 space-y-3">
              <p className="text-slate-400 font-medium">इस श्रेणी में कोई कार्ड उपलब्ध नहीं है।</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                सभी कार्ड देखें (Show All Cards)
              </button>
            </div>
          )}

          {/* Trust Badges Strip */}
          <div className="mt-16 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#090d20]/80 border border-slate-800/80 backdrop-blur-md text-center">
            <div className="flex flex-col items-center justify-center p-2">
              <Zap className="w-5 h-5 text-amber-400 mb-1.5" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">10 MINS SLA</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Automated UTR Verification</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border-l border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1.5" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">100% REFUNDABLE</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Escrow Buyer Protection</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border-l border-slate-800">
              <Lock className="w-5 h-5 text-purple-400 mb-1.5" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">ZERO KYC FRICTION</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Private Virtual Cards</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border-l border-slate-800">
              <Send className="w-5 h-5 text-blue-400 mb-1.5" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">24/7 TELEGRAM</span>
              <span className="text-[11px] text-slate-400 mt-0.5">{paymentSettings.telegramUsername}</span>
            </div>
          </div>
        </section>
      </div>



      {/* Live Sales Activity Fake Buying Notifications */}
      <FakeSalesNotification />

      {/* Floating Telegram Support Button matching screenshot Image 1 & 2 */}
      <FloatingTelegramButton
        telegramUsername={paymentSettings.telegramUsername}
        onClick={() => setIsSupportOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Checkout Modal with live admin-uploaded QR code */}
      <CheckoutModal
        card={selectedCardForBuy}
        paymentSettings={paymentSettings}
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setSelectedCardForBuy(null);
        }}
        onSubmitOrder={handleCreateOrder}
        onViewOrder={handleViewOrder}
      />

      {/* 2. My Orders & Credentials Reveal Modal */}
      <MyOrdersModal
        orders={orders}
        customerOrderIds={customerOrderIds}
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        selectedOrderId={selectedOrderIdForLookup}
      />

      {/* 3. Telegram Support & FAQ Modal */}
      <TelegramSupportModal
        paymentSettings={paymentSettings}
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* 4. Admin Auth Passcode Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthOpen(false);
          setIsAdminPanelOpen(true);
        }}
        adminPin={adminPin}
      />

      {/* 5. Full Loaded Admin Panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        cards={cards}
        paymentSettings={paymentSettings}
        orders={orders}
        onUpdatePaymentSettings={handleUpdatePaymentSettings}
        onUpdateCards={handleUpdateCards}
        onUpdateOrders={handleUpdateOrders}
        adminPin={adminPin}
        onUpdateAdminPin={handleUpdateAdminPin}
      />
    </div>
  );
}
