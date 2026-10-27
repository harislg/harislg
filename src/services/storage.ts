import { Client, Order, DayGroupedOrders } from '../types';

const CLIENTS_STORAGE_KEY = 'ordernote_clients_v1';
const ORDERS_STORAGE_KEY = 'ordernote_orders_v1';
const SETTINGS_STORAGE_KEY = 'ordernote_settings_v1';

export interface AppSettings {
  defaultEmail: string;
  currencySymbol: string;
  businessName: string;
  deviceFrame: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultEmail: 'harislgnok@gmail.com',
  currencySymbol: '$',
  businessName: 'My Sales & Orders',
  deviceFrame: false,
};

// Seed clients and orders if empty
const SEED_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Alexander Stone',
    company: 'Stone Artisans & Goods',
    phone: '+1 (555) 234-8901',
    email: 'alex.stone@artisans.example.com',
    address: '442 Metro Blvd, Suite 10, Downtown',
    notes: 'Prefers morning delivery. Specializes in wholesale decor.',
    category: 'VIP',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'c2',
    name: 'Elena Rostova',
    company: 'Bella Vista Bistro',
    phone: '+1 (555) 872-4419',
    email: 'elena@bellabistro.example.com',
    address: '89 Waterfront Quay, Marina District',
    notes: 'Bistro owner. Orders fresh organic ingredients and bulk supplies.',
    category: 'Regular',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'c3',
    name: 'Marcus Vance',
    company: 'Apex Fitness Hub',
    phone: '+1 (555) 612-9843',
    email: 'marcus@apexfit.example.com',
    address: '120 Olympic Way, Westside',
    notes: 'Gym manager. Orders sports supplements, shaker sets, and apparel.',
    category: 'Wholesale',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
  {
    id: 'c4',
    name: 'Sophia Chen',
    company: 'Bloom Floral Studio',
    phone: '+1 (555) 439-0122',
    email: 'sophia@bloomstudio.example.com',
    address: '15 Jasmine Lane, Garden District',
    notes: 'Custom floral arrangements, packaging ribbons and vases.',
    category: 'Regular',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'c5',
    name: 'David Miller',
    company: 'Craft & Oak Bakery',
    phone: '+1 (555) 901-3321',
    email: 'david@craftoakbakery.example.com',
    address: '304 Baker Street, Old Quarter',
    notes: 'Daily artisanal bread and pastry packaging client.',
    category: 'VIP',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
];

// Helper to format date YYYY-MM-DD
export function getFormattedDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFormattedTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function createSeedOrders(): Order[] {
  const today = new Date();
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48);
  const threeDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 72);

  // Note: David Miller placed an order TODAY (most recent),
  // Elena Rostova placed yesterday, Alexander Stone 2 days ago, etc.
  return [
    {
      id: 'ord-1001',
      clientId: 'c5', // David Miller (Latest Buyer!)
      orderNumber: 'ORD-2026-105',
      orderDate: getFormattedDate(today),
      orderTime: '09:30',
      createdAt: today.getTime() - 1000 * 60 * 35, // 35 minutes ago
      items: [
        { id: 'i1', name: 'Artisan Flour (25kg Bag)', quantity: 4, unitPrice: 38.5, total: 154.0 },
        { id: 'i2', name: 'Organic Sourdough Starter', quantity: 2, unitPrice: 24.0, total: 48.0 },
        { id: 'i3', name: 'Kraft Bakery Paper Boxes (100pk)', quantity: 3, unitPrice: 22.0, total: 66.0 },
      ],
      totalAmount: 268.0,
      status: 'completed',
      note: 'Rush order delivered to back kitchen dock before 10 AM.',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'ord-1002',
      clientId: 'c2', // Elena Rostova
      orderNumber: 'ORD-2026-104',
      orderDate: getFormattedDate(yesterday),
      orderTime: '14:15',
      createdAt: yesterday.getTime(),
      items: [
        { id: 'i4', name: 'Extra Virgin Olive Oil (5L Tin)', quantity: 2, unitPrice: 65.0, total: 130.0 },
        { id: 'i5', name: 'Aged Balsamic Vinegar (250ml)', quantity: 6, unitPrice: 18.0, total: 108.0 },
      ],
      totalAmount: 238.0,
      status: 'delivered',
      note: 'Inspect seal on bottles upon arrival.',
    },
    {
      id: 'ord-1003',
      clientId: 'c2', // Elena Rostova - earlier order on same yesterday
      orderNumber: 'ORD-2026-103',
      orderDate: getFormattedDate(yesterday),
      orderTime: '10:00',
      createdAt: yesterday.getTime() - 1000 * 60 * 60 * 4,
      items: [
        { id: 'i6', name: 'San Marzano Canned Tomatoes (Case)', quantity: 5, unitPrice: 28.0, total: 140.0 },
      ],
      totalAmount: 140.0,
      status: 'delivered',
      note: 'Morning supply batch',
    },
    {
      id: 'ord-1004',
      clientId: 'c1', // Alexander Stone
      orderNumber: 'ORD-2026-102',
      orderDate: getFormattedDate(twoDaysAgo),
      orderTime: '11:45',
      createdAt: twoDaysAgo.getTime(),
      items: [
        { id: 'i7', name: 'Hand-carved Marble Coaster Set', quantity: 10, unitPrice: 32.0, total: 320.0 },
        { id: 'i8', name: 'Ceramic Glaze Matte Black (1L)', quantity: 4, unitPrice: 27.5, total: 110.0 },
      ],
      totalAmount: 430.0,
      status: 'completed',
      note: 'Bubble wrapped for showroom transit.',
    },
    {
      id: 'ord-1005',
      clientId: 'c3', // Marcus Vance
      orderNumber: 'ORD-2026-101',
      orderDate: getFormattedDate(threeDaysAgo),
      orderTime: '16:20',
      createdAt: threeDaysAgo.getTime(),
      items: [
        { id: 'i9', name: 'Whey Isolate Protein (2kg)', quantity: 12, unitPrice: 45.0, total: 540.0 },
        { id: 'i10', name: 'Metal Shaker Bottles (Matte)', quantity: 24, unitPrice: 9.5, total: 228.0 },
      ],
      totalAmount: 768.0,
      status: 'paid',
      note: 'Gym front desk stock replenishment.',
    },
  ];
}

// Recalculate client statistics based on orders
export function syncClientsWithOrders(clients: Client[], orders: Order[]): Client[] {
  return clients.map((client) => {
    const clientOrders = orders.filter((o) => o.clientId === client.id);
    const sorted = [...clientOrders].sort((a, b) => b.createdAt - a.createdAt);
    const latestOrder = sorted[0];

    const totalSpent = clientOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      ...client,
      totalOrdersCount: clientOrders.length,
      totalSpent,
      lastOrderDate: latestOrder ? latestOrder.orderDate : undefined,
      lastOrderTimestamp: latestOrder ? latestOrder.createdAt : undefined,
    };
  });
}

// Storage operations
export function getClients(): Client[] {
  try {
    const data = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!data) {
      const orders = getOrders();
      const synced = syncClientsWithOrders(SEED_CLIENTS, orders);
      saveClients(synced);
      return sortClientsByLatestOrder(synced);
    }
    const parsed: Client[] = JSON.parse(data);
    return sortClientsByLatestOrder(parsed);
  } catch (err) {
    console.error('Error loading clients:', err);
    return [];
  }
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Error saving clients:', err);
  }
}

export function getOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!data) {
      const seed = createSeedOrders();
      saveOrders(seed);
      return seed;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading orders:', err);
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders:', err);
  }
}

export function getSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

/**
 * CORE REQUIREMENT:
 * "the last client order to show his name first so i knew who buy last"
 * Sort clients such that the client with the most recent order (highest lastOrderTimestamp)
 * appears at index 0. Clients with no orders appear below, sorted by creation date.
 */
export function sortClientsByLatestOrder(clients: Client[]): Client[] {
  return [...clients].sort((a, b) => {
    const timeA = a.lastOrderTimestamp || 0;
    const timeB = b.lastOrderTimestamp || 0;

    if (timeA !== timeB) {
      return timeB - timeA; // Descending: newest order first!
    }

    // Tie-breaker: creation time or name
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

/**
 * CORE REQUIREMENT:
 * "save it by the day of the order"
 * Group orders for a client by orderDate (YYYY-MM-DD), with daily totals
 */
export function groupOrdersByDay(orders: Order[]): DayGroupedOrders[] {
  const groupsMap = new Map<string, Order[]>();

  for (const order of orders) {
    const dateKey = order.orderDate || 'Unknown Date';
    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, []);
    }
    groupsMap.get(dateKey)!.push(order);
  }

  // Convert to array and sort dates descending (most recent day first)
  const sortedDates = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

  const todayStr = getFormattedDate(new Date());
  const yesterdayStr = getFormattedDate(new Date(Date.now() - 1000 * 60 * 60 * 24));

  return sortedDates.map((dateKey) => {
    const dayOrders = groupsMap.get(dateKey)!;
    // Sort orders inside the day by createdAt descending
    dayOrders.sort((a, b) => b.createdAt - a.createdAt);

    let displayDate = dateKey;
    if (dateKey === todayStr) {
      displayDate = 'Today';
    } else if (dateKey === yesterdayStr) {
      displayDate = 'Yesterday';
    } else {
      try {
        const [y, m, d] = dateKey.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        displayDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } catch {
        displayDate = dateKey;
      }
    }

    const dayTotal = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      date: dateKey,
      displayDate,
      orders: dayOrders,
      dayTotal,
    };
  });
}

// Generate unique order number (e.g. ORD-2026-106)
export function generateOrderNumber(existingOrders: Order[]): string {
  const year = new Date().getFullYear();
  const nextNum = existingOrders.length + 101;
  return `ORD-${year}-${nextNum}`;
}
