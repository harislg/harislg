export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = 'completed' | 'pending' | 'delivered' | 'paid' | 'cancelled';

export interface Order {
  id: string;
  clientId: string;
  orderNumber: string;
  orderDate: string; // YYYY-MM-DD
  orderTime: string; // HH:mm:ss
  createdAt: number; // Unix timestamp for exact sorting
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  note?: string;
  paymentMethod?: string;
  sentToGmailAt?: number; // timestamp when uploaded/sent to Gmail
  sentToEmailAddress?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  category?: 'VIP' | 'Regular' | 'New' | 'Wholesale';
  createdAt: number;
  lastOrderDate?: string; // YYYY-MM-DD
  lastOrderTimestamp?: number; // timestamp of their latest order
  totalOrdersCount?: number;
  totalSpent?: number;
}

export interface DayGroupedOrders {
  date: string; // YYYY-MM-DD
  displayDate: string; // "Today", "Yesterday", or "Oct 27, 2026"
  orders: Order[];
  dayTotal: number;
}
