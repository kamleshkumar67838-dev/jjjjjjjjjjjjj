import { VirtualCard, PaymentSettings, CustomerOrder } from '../types';
import { INITIAL_CARDS, INITIAL_PAYMENT_SETTINGS, INITIAL_ORDERS } from '../data/initialData';

const STORAGE_KEYS = {
  CARDS: 'dc_virtual_cards_v5',
  PAYMENT_SETTINGS: 'dc_payment_settings_v2',
  ORDERS: 'dc_customer_orders_v1',
  CUSTOMER_ORDER_IDS: 'dc_my_order_ids_v1',
  ADMIN_PIN: 'dc_admin_pin_v1',
};

export const getStoredCards = (): VirtualCard[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!raw) return INITIAL_CARDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const filtered = parsed.filter((c: any) =>
        ['visa', 'mastercard', 'international', 'tiktok'].includes(c.category)
      );
      return filtered.length > 0 ? filtered : INITIAL_CARDS;
    }
    return INITIAL_CARDS;
  } catch (e) {
    console.error('Failed to read cards from storage', e);
    return INITIAL_CARDS;
  }
};

export const saveStoredCards = (cards: VirtualCard[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save cards to storage', e);
  }
};

export const getStoredPaymentSettings = (): PaymentSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
    if (!raw) return INITIAL_PAYMENT_SETTINGS;
    return { ...INITIAL_PAYMENT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to read payment settings', e);
    return INITIAL_PAYMENT_SETTINGS;
  }
};

export const saveStoredPaymentSettings = (settings: PaymentSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save payment settings', e);
  }
};

export const getStoredOrders = (): CustomerOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) return INITIAL_ORDERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ORDERS;
  } catch (e) {
    console.error('Failed to read orders from storage', e);
    return INITIAL_ORDERS;
  }
};

export const saveStoredOrders = (orders: CustomerOrder[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to storage', e);
  }
};

export const getCustomerOrderIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS);
    if (!raw) return ['DC-89214', 'DC-90412'];
    return JSON.parse(raw);
  } catch {
    return ['DC-89214', 'DC-90412'];
  }
};

export const addCustomerOrderId = (orderId: string) => {
  try {
    const existing = getCustomerOrderIds();
    if (!existing.includes(orderId)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS, JSON.stringify([orderId, ...existing]));
    }
  } catch (e) {
    console.error('Failed to add customer order ID', e);
  }
};

export const getAdminPin = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || 'admin123';
  } catch {
    return 'admin123';
  }
};

export const saveAdminPin = (newPin: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
  } catch (e) {
    console.error('Failed to save admin pin', e);
  }
};
