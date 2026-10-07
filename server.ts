import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_CARDS, INITIAL_PAYMENT_SETTINGS, INITIAL_ORDERS } from './src/data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

// Persistent data directory & file
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseStructure {
  paymentSettings: typeof INITIAL_PAYMENT_SETTINGS;
  cards: typeof INITIAL_CARDS;
  orders: typeof INITIAL_ORDERS;
}

function readDB(): DatabaseStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        paymentSettings: parsed.paymentSettings || INITIAL_PAYMENT_SETTINGS,
        cards: parsed.cards || INITIAL_CARDS,
        orders: parsed.orders || INITIAL_ORDERS,
      };
    }
  } catch (err) {
    console.error('Error reading db.json, returning default data', err);
  }

  const initialData: DatabaseStructure = {
    paymentSettings: INITIAL_PAYMENT_SETTINGS,
    cards: INITIAL_CARDS,
    orders: INITIAL_ORDERS,
  };
  writeDB(initialData);
  return initialData;
}

function writeDB(data: DatabaseStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving to db.json', err);
  }
}

async function startServer() {
  const app = express();

  // Allow high payload size for base64 QR codes and payment slips
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // Initialize DB on boot
  readDB();

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Payment Settings (QR Code, UPI ID, Payee, Telegram)
  app.get('/api/payment-settings', (_req, res) => {
    const db = readDB();
    res.json(db.paymentSettings);
  });

  app.post('/api/payment-settings', (req, res) => {
    const db = readDB();
    db.paymentSettings = { ...db.paymentSettings, ...req.body };
    writeDB(db);
    console.log('✅ Updated payment settings saved to disk & published live');
    res.json({ success: true, paymentSettings: db.paymentSettings });
  });

  // 2. Cards
  app.get('/api/cards', (_req, res) => {
    const db = readDB();
    res.json(db.cards);
  });

  app.post('/api/cards', (req, res) => {
    const db = readDB();
    db.cards = req.body;
    writeDB(db);
    res.json({ success: true, cards: db.cards });
  });

  // 3. Orders
  app.get('/api/orders', (_req, res) => {
    const db = readDB();
    res.json(db.orders);
  });

  app.post('/api/orders', (req, res) => {
    const db = readDB();
    const newOrder = req.body;
    db.orders = [newOrder, ...(db.orders || [])];
    writeDB(db);
    console.log(`📦 New customer order received: ${newOrder.id}`);
    res.json({ success: true, order: newOrder });
  });

  app.put('/api/orders', (req, res) => {
    const db = readDB();
    db.orders = req.body;
    writeDB(db);
    res.json({ success: true, orders: db.orders });
  });

  // Vite Integration
  const distPath = path.join(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

  if (isProd) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dark Carding Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
