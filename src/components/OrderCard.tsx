import React from 'react';
import { Order, Client } from '../types';
import { formatCurrency } from '../services/gmailService';
import { Mail, Clock, CheckCircle2, AlertCircle, Edit, Trash2, Send } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  client?: Client;
  onSendToGmail: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  client,
  onSendToGmail,
  onEditOrder,
  onDeleteOrder,
}) => {
  const getStatusBadge = () => {
    switch (order.status) {
      case 'completed':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'paid':
        return 'bg-teal-950/80 text-teal-300 border-teal-800';
      case 'pending':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'delivered':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'cancelled':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
      {/* Top Header of the Order */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-tight">
              {order.orderNumber}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge()}`}
            >
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <Clock size={12} className="text-slate-500" />
            <span>
              {order.orderDate} {order.orderTime ? `• ${order.orderTime}` : ''}
            </span>
            {client && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-400 font-medium truncate max-w-[120px]">
                  {client.name}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-extrabold text-emerald-400">
            {formatCurrency(order.totalAmount)}
          </div>
          <div className="text-[11px] text-slate-400">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="py-2.5 space-y-1.5">
        {order.items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/50"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="text-slate-400 font-medium shrink-0">{item.quantity}x</span>
              <span className="text-slate-200 truncate">{item.name}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-slate-400 text-[11px] mr-2">
                @{formatCurrency(item.unitPrice)}
              </span>
              <span className="font-semibold text-slate-200">
                {formatCurrency(item.total)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Note / instruction */}
      {order.note && (
        <div className="my-2 p-2 bg-amber-950/30 border-l-2 border-amber-500/80 rounded text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-[11px] uppercase tracking-wider text-amber-400 block">Note:</strong>
          {order.note}
        </div>
      )}

      {/* Gmail Upload Status & Actions */}
      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <div>
          {order.sentToGmailAt ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Sent to Gmail</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Not sent yet</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEditOrder(order)}
            title="Edit order"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit size={14} />
          </button>

          <button
            onClick={() => onDeleteOrder(order.id)}
            title="Delete order"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>

          {/* Primary Upload / Send to Gmail Button */}
          <button
            onClick={() => onSendToGmail(order)}
            title="Upload and send this order to your Gmail"
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
          >
            <Mail size={13} />
            <span>Upload to Gmail</span>
          </button>
        </div>
      </div>
    </div>
  );
};
