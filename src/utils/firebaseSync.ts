import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { PaymentSettings, VirtualCard, CustomerOrder } from '../types';
import { INITIAL_PAYMENT_SETTINGS, INITIAL_CARDS, INITIAL_ORDERS } from '../data/initialData';
import { saveStoredPaymentSettings, saveStoredCards, saveStoredOrders } from './storage';

// 1. Subscribe to Live Payment Settings in Real Time
export function subscribeToPaymentSettings(
  onUpdate: (settings: PaymentSettings) => void
): () => void {
  const docRef = doc(db, 'settings', 'payment');

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PaymentSettings;
        if (data && data.qrCodeUrl) {
          saveStoredPaymentSettings(data);
          onUpdate(data);
        }
      } else {
        // Seed default if document doesn't exist yet
        setDoc(docRef, INITIAL_PAYMENT_SETTINGS).catch(console.warn);
      }
    },
    (err) => {
      console.warn('Payment settings snapshot error:', err);
    }
  );

  return unsubscribe;
}

// 2. Publish Updated Payment Settings to Firebase
export async function pushPaymentSettingsToFirebase(settings: PaymentSettings): Promise<void> {
  saveStoredPaymentSettings(settings);
  try {
    const docRef = doc(db, 'settings', 'payment');
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
    console.log('🔥 Payment settings pushed to Firebase Firestore live!');
  } catch (err) {
    console.error('Failed to push payment settings to Firebase:', err);
  }
}

// 3. Subscribe to Real-Time Virtual Cards Catalog
export function subscribeToCards(
  onUpdate: (cards: VirtualCard[]) => void
): () => void {
  const colRef = collection(db, 'cards');

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const cardsList: VirtualCard[] = [];
        snapshot.forEach((docSnap) => {
          cardsList.push(docSnap.data() as VirtualCard);
        });
        saveStoredCards(cardsList);
        onUpdate(cardsList);
      } else {
        // Seed initial cards in Firebase
        seedInitialCards().catch(console.warn);
      }
    },
    (err) => {
      console.warn('Cards snapshot error:', err);
    }
  );

  return unsubscribe;
}

// Helper: Seed initial cards to Firestore
async function seedInitialCards(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const card of INITIAL_CARDS) {
      const cardRef = doc(db, 'cards', card.id);
      batch.set(cardRef, card);
    }
    await batch.commit();
    console.log('🔥 Initial cards seeded to Firestore');
  } catch (err) {
    console.warn('Error seeding cards:', err);
  }
}

// 4. Push Cards Update to Firebase
export async function pushCardsToFirebase(cards: VirtualCard[]): Promise<void> {
  saveStoredCards(cards);
  try {
    const batch = writeBatch(db);
    for (const card of cards) {
      const cardRef = doc(db, 'cards', card.id);
      batch.set(cardRef, card, { merge: true });
    }
    await batch.commit();
    console.log('🔥 Cards updated in Firebase Firestore live!');
  } catch (err) {
    console.error('Failed to push cards to Firebase:', err);
  }
}

// 5. Subscribe to Real-Time Customer Orders
export function subscribeToOrders(
  onUpdate: (orders: CustomerOrder[]) => void
): () => void {
  const colRef = collection(db, 'orders');

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const ordersList: CustomerOrder[] = [];
        snapshot.forEach((docSnap) => {
          ordersList.push(docSnap.data() as CustomerOrder);
        });
        // Sort newest first
        ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        saveStoredOrders(ordersList);
        onUpdate(ordersList);
      }
    },
    (err) => {
      console.warn('Orders snapshot error:', err);
    }
  );

  return unsubscribe;
}

// 6. Push a New Order to Firebase
export async function pushOrderToFirebase(order: CustomerOrder): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, order);
    console.log(`🔥 Order #${order.id} pushed to Firebase Firestore!`);
  } catch (err) {
    console.error('Failed to push order to Firebase:', err);
  }
}

// 7. Update an Existing Order (e.g. Approve or Reject)
export async function updateOrderInFirebase(order: CustomerOrder): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, order, { merge: true });
    console.log(`🔥 Order #${order.id} updated in Firebase!`);
  } catch (err) {
    console.error('Failed to update order in Firebase:', err);
  }
}
