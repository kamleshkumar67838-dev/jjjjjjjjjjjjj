import { VirtualCard, PaymentSettings, CustomerOrder } from '../types';

// Crisp SVG QR Code generator data URL for default UPI payments
export const DEFAULT_QR_CODE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300"><rect width="300" height="300" fill="%23ffffff" rx="16"/><rect x="25" y="25" width="70" height="70" fill="%230f172a" rx="8"/><rect x="35" y="35" width="50" height="50" fill="%23ffffff" rx="4"/><rect x="45" y="45" width="30" height="30" fill="%237c3aed" rx="2"/><rect x="205" y="25" width="70" height="70" fill="%230f172a" rx="8"/><rect x="215" y="35" width="50" height="50" fill="%23ffffff" rx="4"/><rect x="225" y="45" width="30" height="30" fill="%237c3aed" rx="2"/><rect x="25" y="205" width="70" height="70" fill="%230f172a" rx="8"/><rect x="35" y="215" width="50" height="50" fill="%23ffffff" rx="4"/><rect x="45" y="225" width="30" height="30" fill="%237c3aed" rx="2"/><g fill="%230f172a"><rect x="115" y="30" width="16" height="16"/><rect x="150" y="30" width="24" height="16"/><rect x="115" y="60" width="32" height="16"/><rect x="165" y="60" width="16" height="30"/><rect x="135" y="90" width="16" height="24"/><rect x="30" y="115" width="20" height="16"/><rect x="65" y="115" width="30" height="16"/><rect x="115" y="125" width="70" height="50" fill="%237c3aed" rx="8"/><circle cx="150" cy="150" r="16" fill="%23ffffff"/><text x="150" y="155" font-family="sans-serif" font-size="12" font-weight="bold" fill="%237c3aed" text-anchor="middle">UPI</text><rect x="205" y="115" width="35" height="16"/><rect x="255" y="115" width="16" height="30"/><rect x="205" y="150" width="16" height="35"/><rect x="240" y="160" width="30" height="16"/><rect x="30" y="150" width="30" height="16"/><rect x="75" y="150" width="20" height="35"/><rect x="30" y="180" width="20" height="16"/><rect x="115" y="190" width="20" height="30"/><rect x="150" y="200" width="35" height="16"/><rect x="115" y="240" width="40" height="20"/><rect x="175" y="235" width="16" height="35"/><rect x="210" y="210" width="30" height="20"/><rect x="255" y="210" width="16" height="16"/><rect x="210" y="245" width="20" height="25"/><rect x="245" y="245" width="26" height="25"/></g><text x="150" y="288" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2364748b" text-anchor="middle">SCAN &amp; PAY VIA ANY UPI APP</text></svg>`;

export const INITIAL_CARDS: VirtualCard[] = [
  {
    id: 'card-visa-classic',
    category: 'visa',
    categoryLabel: 'Visa Card',
    title: 'Classic',
    cardHolder: 'DOMINIC BEAUMONT',
    cardNumberMask: '•••• •••• •••• 9010',
    validity: '12/2028',
    cardLimit: '₹ 5000 Balance',
    refundPolicy: '100% Refundable',
    instantRelease: '⚡ 10 Mins SLA',
    price: 350,
    inPool: 'Unlimited',
    inStock: true,
    badges: ['IN STOCK', 'TRUSTED CARD', 'FEATURED'],
    cardTier: 'Classic',
    cardGradient: 'from-[#0d2347] via-[#103b70] to-[#0a1931]',
    description: 'Instant virtual Visa Classic card with preloaded ₹5000 balance for online payments, e-commerce, and digital subscriptions.'
  },
  {
    id: 'card-mastercard-elite',
    category: 'mastercard',
    categoryLabel: 'Mastercard',
    title: 'World Elite',
    cardHolder: 'DOMINIC BEAUMONT',
    cardNumberMask: '•••• •••• •••• 3381',
    validity: '09/2029',
    cardLimit: '₹ 10000 Balance',
    refundPolicy: '100% Refundable',
    instantRelease: '⚡ 10 Mins SLA',
    price: 520,
    inPool: 'Unlimited',
    inStock: true,
    badges: ['IN STOCK', 'BEST CARD', 'FEATURED'],
    cardTier: 'Mastercard',
    cardGradient: 'from-[#2b1055] via-[#4c1d95] to-[#1e1035]',
    description: 'Pre-activated Mastercard World Elite with ₹10,000 balance. 3D secure ready with OTP auto-delivery support.'
  },
  {
    id: 'card-international-global',
    category: 'international',
    categoryLabel: 'International Card',
    title: 'Global Platinum USD',
    cardHolder: 'DOMINIC BEAUMONT',
    cardNumberMask: '•••• •••• •••• 5488',
    validity: '11/2029',
    cardLimit: '$300 USD (₹25,000)',
    refundPolicy: '100% Refundable',
    instantRelease: '⚡ 10 Mins SLA',
    price: 890,
    inPool: 'Unlimited',
    inStock: true,
    badges: ['IN STOCK', 'GLOBAL USAGE', 'MULTI-CURRENCY'],
    cardTier: 'International',
    cardGradient: 'from-[#064e3b] via-[#047857] to-[#022c22]',
    description: 'Worldwide accepted International Virtual Card supporting USD, EUR, GBP billing on Facebook ads, Google Ads, AWS & overseas shops.'
  },
  {
    id: 'card-tiktok-coins',
    category: 'tiktok',
    categoryLabel: 'TikTok Coin Card',
    title: 'TikTok 10,000 Coins',
    cardHolder: 'TIKTOK USER / LIVE RECHARGE',
    cardNumberMask: '•••• •••• •••• 1084',
    validity: 'LIFETIME / INSTANT',
    cardLimit: '10,000 TikTok Coins',
    refundPolicy: '100% Refundable',
    instantRelease: '⚡ Instant SLA',
    price: 499,
    inPool: 'Unlimited',
    inStock: true,
    badges: ['IN STOCK', 'TIKTOK LIVE', 'HOT DEAL'],
    cardTier: 'TikTok Coin',
    cardGradient: 'from-[#000000] via-[#050505] to-[#fe2c55]/20',
    description: 'Direct TikTok Coins Card loaded with 10,000 coins. Redeemable directly on TikTok Live streaming, gifts, and creator support!'
  }
];

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  qrCodeUrl: DEFAULT_QR_CODE,
  upiId: 'darkcarding@ybl',
  payeeName: 'DARK CARDING STORE',
  instructions: 'Scan QR with PhonePe, Google Pay, Paytm, BHIM, or any UPI app and send exact amount. Enter the 12-digit UTR transaction number after payment.',
  telegramUsername: '@cardingfoco',
  telegramUrl: 'https://t.me/cardingfoco'
};

export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'DC-89214',
    cardId: 'card-visa-classic',
    cardTitle: 'Visa Classic Virtual Card',
    category: 'visa',
    categoryLabel: 'वीज़ा कार्ड',
    amount: 350,
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.verma@gmail.com',
    customerTelegram: '@rahul_v',
    customerPhone: '+91 9876543210',
    utr: '427189028193',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    credentials: {
      cardNumber: '4532 8901 7723 9012',
      cvv: '782',
      expiry: '12/28',
      cardHolder: 'DOMINIC BEAUMONT',
      balance: '₹ 5000 Balance',
      pin: '4820',
      notes: 'Active for all domestic and international payments.'
    }
  },
  {
    id: 'DC-90412',
    cardId: 'card-mastercard-elite',
    cardTitle: 'Mastercard World Elite',
    category: 'mastercard',
    categoryLabel: 'मास्टर कार्ड',
    amount: 520,
    customerName: 'Aman Khan',
    customerEmail: 'aman.k98@gmail.com',
    customerTelegram: '@amankhan_pro',
    customerPhone: '+91 9123456789',
    utr: '427198124059',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    credentials: {
      cardNumber: '5412 8820 4910 3381',
      cvv: '914',
      expiry: '09/29',
      cardHolder: 'DOMINIC BEAUMONT',
      balance: '₹ 10000 Balance',
      pin: '2190',
      notes: 'Pre-activated with OTP auto-delivery support.'
    }
  }
];
