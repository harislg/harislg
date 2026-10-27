import React from 'react';
import { Client, Order } from '../types';
import { formatCurrency } from '../services/gmailService';
import { getFormattedDate } from '../services/storage';
import {
  Sparkles,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Mail,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface StatsDashboardProps {
  clients: Client[];
  orders: Order[];
  onSelectClient: (client: Client) => void;
  onSendOrderToGmail: (order: Order) => void;
  targetEmail: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  clients,
  orders,
  onSelectClient,
  onSendOrderToGmail,
  targetEmail,
}) => {
  // Sort orders by most recent
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);
  const latestOrder = sortedOrders[0];
  const latestClient = latestOrder
    ? clients.find((c) => c.id === latestOrder.clientId)
    : null;

  const todayStr = getFormattedDate(new Date());
  const todayOrders = orders.filter((o) => o.orderDate === todayStr);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* "LAST BUYER" Hero Spotlight */}
      {latestClient && latestOrder && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={12} className="fill-slate-950" />
              <span>Last Client Who Ordered</span>
            </span>
            <span className="text-xs text-amber-300 font-medium">
              {latestOrder.orderDate} {latestOrder.orderTime ? `• ${latestOrder.orderTime}` : ''}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 mt-3">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {latestClient.name}
              </h3>
              {latestClient.company && (
                <p className="text-xs text-slate-300">{latestClient.company}</p>
              )}
              <div className="mt-2 text-xs text-slate-400">
                Latest Order: <strong className="text-white">{latestOrder.orderNumber}</strong> •{' '}
                <span className="text-emerald-400 font-bold">
                  {formatCurrency(latestOrder.totalAmount)}
                </span>{' '}
                ({latestOrder.items.length} items)
              </div>
            </div>

            <button
              onClick={() => onSelectClient(latestClient)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 mt-1"
            >
              <span>View Card</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Deliver/Send notes to: <code className="text-slate-300">{targetEmail}</code>
            </span>
            <button
              onClick={() => onSendOrderToGmail(latestOrder)}
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <Mail size={13} />
              <span>Send Order to Gmail</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Today's Orders</span>
            <Calendar size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{todayOrders.length}</div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            {formatCurrency(todayRevenue)} today
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Revenue</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 truncate">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Across {orders.length} total orders
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Clients</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{clients.length}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            {clients.filter((c) => (c.totalOrdersCount || 0) > 0).length} active buyers
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Avg. Order Value</span>
            <TrendingUp size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {orders.length > 0 ? formatCurrency(totalRevenue / orders.length) : '$0.00'}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Average per transaction
          </div>
        </div>
      </div>

      {/* Recent Orders Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Recent Activity Stream</span>
          <span className="text-xs font-normal text-slate-400">Latest 5 orders</span>
        </h4>

        <div className="space-y-2.5">
          {sortedOrders.slice(0, 5).map((order) => {
            const client = clients.find((c) => c.id === order.clientId);
            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white truncate">
                      {client?.name || 'Unknown Client'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {order.orderDate} • {order.items.length} items
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-400">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <button
                    onClick={() => onSendOrderToGmail(order)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-0.5 ml-auto"
                  >
                    <Mail size={11} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
