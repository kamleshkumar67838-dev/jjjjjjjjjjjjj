import { PaymentSettings, VirtualCard, CustomerOrder } from '../types';
import {
  getStoredPaymentSettings,
  saveStoredPaymentSettings,
  getStoredCards,
  saveStoredCards,
  getStoredOrders,
  saveStoredOrders,
} from './storage';

export const fetchPaymentSettings = async (): Promise<PaymentSettings> => {
  try {
    const res = await fetch('/api/payment-settings');
    if (res.ok) {
      const data = await res.json();
      if (data && data.qrCodeUrl) {
        saveStoredPaymentSettings(data);
        return data;
      }
    }
  } catch {
    // Fallback to storage
  }
  return getStoredPaymentSettings();
};

export const updatePaymentSettings = async (settings: PaymentSettings): Promise<PaymentSettings> => {
  saveStoredPaymentSettings(settings);
  try {
    const res = await fetch('/api/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.paymentSettings) {
        saveStoredPaymentSettings(data.paymentSettings);
        return data.paymentSettings;
      }
    }
  } catch (err) {
    console.warn('Backend sync failed, saved locally', err);
  }
  return settings;
};

export const fetchCards = async (): Promise<VirtualCard[]> => {
  try {
    const res = await fetch('/api/cards');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveStoredCards(data);
        return data;
      }
    }
  } catch {
    // Fallback to storage
  }
  return getStoredCards();
};

export const updateCards = async (cards: VirtualCard[]): Promise<VirtualCard[]> => {
  saveStoredCards(cards);
  try {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cards),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cards) {
        saveStoredCards(data.cards);
        return data.cards;
      }
    }
  } catch (err) {
    console.warn('Backend sync failed, saved locally', err);
  }
  return cards;
};

export const fetchOrders = async (): Promise<CustomerOrder[]> => {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveStoredOrders(data);
        return data;
      }
    }
  } catch {
    // Fallback to storage
  }
  return getStoredOrders();
};

export const createOrder = async (order: CustomerOrder): Promise<CustomerOrder> => {
  const current = getStoredOrders();
  saveStoredOrders([order, ...current]);
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      const data = await res.json();
      return data.order || order;
    }
  } catch (err) {
    console.warn('Order backend push failed, saved locally', err);
  }
  return order;
};

export const updateOrdersList = async (orders: CustomerOrder[]): Promise<CustomerOrder[]> => {
  saveStoredOrders(orders);
  try {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.orders) {
        saveStoredOrders(data.orders);
        return data.orders;
      }
    }
  } catch (err) {
    console.warn('Orders update failed, saved locally', err);
  }
  return orders;
};
