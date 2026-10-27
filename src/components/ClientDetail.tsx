import React, { useState } from 'react';
import { Client, Order, DayGroupedOrders } from '../types';
import { groupOrdersByDay } from '../services/storage';
import { formatCurrency } from '../services/gmailService';
import { OrderCard } from './OrderCard';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  Share2,
  FileText,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ClientDetailProps {
  client: Client;
  orders: Order[];
  onBack: () => void;
  onAddOrder: () => void;
  onEditClient: () => void;
  onDeleteClient: () => void;
  onSendOrderToGmail: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({
  client,
  orders,
  onBack,
  onAddOrder,
  onEditClient,
  onDeleteClient,
  onSendOrderToGmail,
  onEditOrder,
  onDeleteOrder,
}) => {
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  // Group client orders by day
  const dayGroups: DayGroupedOrders[] = groupOrdersByDay(orders);

  const toggleDayCollapse = (date: string) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Client Profile Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
              {client.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight truncate">
                  {client.name}
                </h2>
                {client.category && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {client.category}
                  </span>
                )}
              </div>
              {client.company && (
                <p className="text-sm font-medium text-slate-300 mt-0.5">{client.company}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEditClient}
              title="Edit client profile"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDeleteClient}
              title="Delete client"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Contact info grid */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Phone size={14} className="text-indigo-400 shrink-0" />
              <span className="truncate">{client.phone}</span>
            </a>
          )}
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Mail size={14} className="text-indigo-400 shrink-0" />
              <span className="truncate">{client.email}</span>
            </a>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-slate-300 p-1.5 col-span-full">
              <MapPin size={14} className="text-indigo-400 shrink-0" />
              <span className="truncate">{client.address}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {client.notes && (
          <div className="mt-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
              Client Notes:
            </strong>
            {client.notes}
          </div>
        )}

        {/* Quick Stats Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-around text-center">
          <div>
            <div className="text-[11px] text-slate-400">Total Spent</div>
            <div className="text-base font-black text-emerald-400">{formatCurrency(totalSpent)}</div>
          </div>
          <div className="w-px h-7 bg-slate-800"></div>
          <div>
            <div className="text-[11px] text-slate-400">Saved Orders</div>
            <div className="text-base font-black text-white">{orders.length}</div>
          </div>
          <div className="w-px h-7 bg-slate-800"></div>
          <div>
            <div className="text-[11px] text-slate-400">Last Order</div>
            <div className="text-xs font-bold text-amber-300">
              {client.lastOrderDate || 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button: Add Order for this Client */}
      <div className="flex gap-2">
        <button
          onClick={onAddOrder}
          className="flex-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <PlusCircle size={18} />
          <span>Add New Order for {client.name.split(' ')[0]}</span>
        </button>
      </div>

      {/* Orders List Header */}
      <div className="flex items-center justify-between pt-2 px-1">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Orders History</h3>
          <p className="text-xs text-slate-400">Saved and grouped by the day of the order</p>
        </div>
      </div>

      {/* Empty State if No Orders */}
      {dayGroups.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-3xl p-8 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
            <FileText size={24} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">No Orders Recorded Yet</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
            Record items, quantities, and prices for this client. You can immediately upload and send the order note to your Gmail!
          </p>
          <button
            onClick={onAddOrder}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow"
          >
            <PlusCircle size={14} />
            <span>Create First Order</span>
          </button>
        </div>
      ) : (
        /* Day Grouped Orders */
        <div className="space-y-5">
          {dayGroups.map((group) => {
            const isCollapsed = !!collapsedDays[group.date];

            return (
              <div
                key={group.date}
                className="bg-slate-950/40 border border-slate-800/90 rounded-2xl p-3 shadow-sm"
              >
                {/* Day Header */}
                <div
                  onClick={() => toggleDayCollapse(group.date)}
                  className="flex items-center justify-between cursor-pointer py-1 px-2 rounded-xl hover:bg-slate-850/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-indigo-400" />
                    <div>
                      <span className="font-extrabold text-sm text-white">
                        {group.displayDate}
                      </span>
                      {group.displayDate !== group.date && (
                        <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                          ({group.date})
                        </span>
                      )}
                    </div>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium ml-1">
                      {group.orders.length} {group.orders.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-emerald-400">
                      {formatCurrency(group.dayTotal)}
                    </span>
                    <button
                      type="button"
                      className="text-slate-400 p-1 hover:text-white"
                      aria-label={isCollapsed ? 'Expand day' : 'Collapse day'}
                    >
                      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                  </div>
                </div>

                {/* Day Orders list */}
                {!isCollapsed && (
                  <div className="mt-3 space-y-3 pt-2 border-t border-slate-800/70">
                    {group.orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        client={client}
                        onSendToGmail={onSendOrderToGmail}
                        onEditOrder={onEditOrder}
                        onDeleteOrder={onDeleteOrder}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
