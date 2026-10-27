import React from 'react';
import { Client, Order } from '../types';
import { formatCurrency } from '../services/gmailService';
import { Phone, ChevronRight, PlusCircle, Sparkles, Calendar, Mail, Building2 } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  isLatestBuyer: boolean;
  onSelect: (client: Client) => void;
  onAddOrder: (client: Client) => void;
  onSendLatestToGmail?: (client: Client, latestOrder: Order) => void;
  latestOrder?: Order;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  isLatestBuyer,
  onSelect,
  onAddOrder,
  onSendLatestToGmail,
  latestOrder,
}) => {
  // Format relative time or order date
  const renderLastOrderTime = () => {
    if (!client.lastOrderTimestamp) {
      return <span className="text-slate-400 text-xs italic">No orders yet</span>;
    }

    const diffMs = Date.now() - client.lastOrderTimestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relativeStr = '';
    if (diffMins < 5) {
      relativeStr = 'Just now';
    } else if (diffMins < 60) {
      relativeStr = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      relativeStr = `${diffHours}h ago`;
    } else if (diffDays === 1) {
      relativeStr = 'Yesterday';
    } else {
      relativeStr = client.lastOrderDate || `${diffDays}d ago`;
    }

    return (
      <span className="flex items-center gap-1 text-xs">
        <Calendar size={12} className={isLatestBuyer ? 'text-amber-400' : 'text-slate-400'} />
        <span className={isLatestBuyer ? 'font-semibold text-amber-300' : 'text-slate-300'}>
          {relativeStr}
        </span>
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelect(client)}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99] border ${
        isLatestBuyer
          ? 'bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-500/60 ring-2 ring-indigo-500/30'
          : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
      }`}
    >
      {/* "LAST BUYER" Pill badge at top of the card */}
      {isLatestBuyer && (
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
          <Sparkles size={11} className="fill-slate-950" />
          <span>Last Buyer • Most Recent Order</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mt-1">
        {/* Client Avatar & Details */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-inner ${
              isLatestBuyer
                ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white ring-2 ring-indigo-400/50'
                : 'bg-slate-800 text-indigo-400 border border-slate-700'
            }`}
          >
            {client.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-white tracking-tight truncate group-hover:text-indigo-300 transition-colors">
                {client.name}
              </h3>
              {client.category && (
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                    client.category === 'VIP'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : client.category === 'Wholesale'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {client.category}
                </span>
              )}
            </div>

            {client.company && (
              <div className="flex items-center gap-1 text-xs text-slate-400 truncate mt-0.5">
                <Building2 size={12} className="shrink-0 text-slate-500" />
                <span className="truncate">{client.company}</span>
              </div>
            )}

            {client.phone && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Phone size={11} className="text-slate-500" />
                <span>{client.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right arrow indicator */}
        <div className="shrink-0 text-slate-500 group-hover:text-white transition-colors p-1">
          <ChevronRight size={18} />
        </div>
      </div>

      {/* Orders and Total Bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div>{renderLastOrderTime()}</div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            <strong className="text-slate-200">{client.totalOrdersCount || 0}</strong>{' '}
            {(client.totalOrdersCount || 0) === 1 ? 'order' : 'orders'}
          </span>
        </div>

        <div className="text-right">
          <span className="font-bold text-emerald-400">
            {formatCurrency(client.totalSpent || 0)}
          </span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onSelect(client)}
          className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-medium py-1.5 px-2.5 rounded-xl transition-colors border border-slate-700/80 flex items-center justify-center gap-1.5"
        >
          <span>Open Card</span>
        </button>

        <button
          onClick={() => onAddOrder(client)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
        >
          <PlusCircle size={13} />
          <span>Add Order</span>
        </button>

        {latestOrder && onSendLatestToGmail && (
          <button
            onClick={() => onSendLatestToGmail(client, latestOrder)}
            title="Send latest order to Gmail so you can see it on your computer"
            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs py-1.5 px-2.5 rounded-xl transition-colors flex items-center gap-1"
          >
            <Mail size={13} />
            <span className="hidden sm:inline">To Gmail</span>
          </button>
        )}
      </div>
    </div>
  );
};
