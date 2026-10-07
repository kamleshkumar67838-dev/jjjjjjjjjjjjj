export type CardCategory = 'visa' | 'mastercard' | 'international' | 'tiktok';

export interface VirtualCard {
  id: string;
  category: CardCategory;
  categoryLabel: string;
  title: string; // e.g. "Classic", "Gold", "World Elite", "TikTok 10,000 Coins"
  cardHolder: string;
  cardNumberMask: string; // e.g. "2908 1234 5678 9010"
  validity: string; // e.g. "12/2028"
  cardLimit: string; // e.g. "₹ 5000 Balance" or "10,000 TikTok Coins"
  refundPolicy: string; // e.g. "100% Refundable"
  instantRelease: string; // e.g. "⚡ 10 Mins SLA"
  price: number; // e.g. 350
  inPool: string | number; // e.g. "Unlimited" or 6998
  inStock: boolean;
  badges: string[]; // e.g. ["IN STOCK", "TRUSTED CARD", "FEATURED"]
  cardTier: string; // e.g. "Classic", "Gold", "VIP"
  customImageUrl?: string; // Admin uploaded custom photo on the card!
  cardGradient?: string;
  description?: string;
}

export interface PaymentSettings {
  qrCodeUrl: string; // Admin uploaded QR code image or generated UPI QR
  upiId: string; // e.g. "darkcarding@ybl"
  payeeName: string; // e.g. "Dark Carding Official"
  instructions: string;
  telegramUsername: string; // e.g. "@Lottaygent"
  telegramUrl: string; // e.g. "https://t.me/Lottaygent"
}

export type OrderStatus = 'pending' | 'approved' | 'rejected';

export interface CardCredentials {
  cardNumber: string;
  cvv: string;
  expiry: string;
  cardHolder: string;
  balance: string;
  pin?: string;
  tiktokVoucherCode?: string;
  portalUrl?: string;
  notes?: string;
}

export interface CustomerOrder {
  id: string; // e.g. "DC-84920"
  cardId: string;
  cardTitle: string;
  category: CardCategory;
  categoryLabel: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerTelegram: string;
  customerPhone?: string;
  utr: string; // 12-digit transaction number
  paymentProofUrl?: string; // Base64 uploaded screenshot
  status: OrderStatus;
  createdAt: string;
  approvedAt?: string;
  credentials?: CardCredentials;
  rejectionReason?: string;
}
