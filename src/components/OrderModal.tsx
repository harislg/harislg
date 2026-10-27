import React, { useState, useEffect } from 'react';
import { Client, Order, OrderItem, OrderStatus } from '../types';
import { getFormattedDate, getFormattedTime, generateOrderNumber } from '../services/storage';
import { formatCurrency } from '../services/gmailService';
import { Plus, Trash2, Calendar, Clock, DollarSign, X, Check, Sparkles } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order, sendToGmailDirectly?: boolean) => void;
  client?: Client;
  allClients: Client[];
  initialOrder?: Order | null;
  existingOrders: Order[];
}

const COMMON_PRESET_ITEMS = [
  { name: 'Standard Product Box', price: 25.0 },
  { name: 'Artisan Bag (Large)', price: 42.0 },
  { name: 'Wholesale Pack x10', price: 150.0 },
  { name: 'Special Reserve Supply', price: 85.0 },
  { name: 'Packaging & Delivery', price: 15.0 },
];

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client,
  allClients,
  initialOrder,
  existingOrders,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(client?.id || '');
  const [orderDate, setOrderDate] = useState<string>(getFormattedDate(new Date()));
  const [orderTime, setOrderTime] = useState<string>(getFormattedTime(new Date()));
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [status, setStatus] = useState<OrderStatus>('completed');
  const [note, setNote] = useState<string>('');
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    if (initialOrder) {
      setSelectedClientId(initialOrder.clientId);
      setOrderDate(initialOrder.orderDate);
      setOrderTime(initialOrder.orderTime || getFormattedTime(new Date()));
      setOrderNumber(initialOrder.orderNumber);
      setStatus(initialOrder.status);
      setNote(initialOrder.note || '');
      setItems(
        initialOrder.items.length > 0
          ? initialOrder.items
          : [{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }]
      );
    } else {
      setSelectedClientId(client?.id || (allClients[0]?.id ?? ''));
      setOrderDate(getFormattedDate(new Date()));
      setOrderTime(getFormattedTime(new Date()));
      setOrderNumber(generateOrderNumber(existingOrders));
      setStatus('completed');
      setNote('');
      setItems([{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }
  }, [initialOrder, client, allClients, isOpen]);

  if (!isOpen) return null;

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };

      if (field === 'quantity') {
        const qty = Math.max(1, Number(value) || 1);
        current.quantity = qty;
        current.total = Number((qty * current.unitPrice).toFixed(2));
      } else if (field === 'unitPrice') {
        const price = Math.max(0, Number(value) || 0);
        current.unitPrice = price;
        current.total = Number((current.quantity * price).toFixed(2));
      } else if (field === 'name') {
        current.name = String(value);
      }

      updated[index] = current;
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        name: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const addPresetItem = (preset: { name: string; price: number }) => {
    setItems((prev) => {
      // If the only item is empty, replace it
      if (prev.length === 1 && !prev[0].name.trim() && prev[0].unitPrice === 0) {
        return [
          {
            id: '1',
            name: preset.name,
            quantity: 1,
            unitPrice: preset.price,
            total: preset.price,
          },
        ];
      }
      return [
        ...prev,
        {
          id: String(Date.now() + Math.random()),
          name: preset.name,
          quantity: 1,
          unitPrice: preset.price,
          total: preset.price,
        },
      ];
    });
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      setItems([{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const handleSubmit = (sendDirectly: boolean = false) => {
    const validItems = items.filter((i) => i.name.trim().length > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item description.');
      return;
    }
    if (!selectedClientId) {
      alert('Please select a client for this order.');
      return;
    }

    const orderToSave: Order = {
      id: initialOrder?.id || `ord-${Date.now()}`,
      clientId: selectedClientId,
      orderNumber: orderNumber || generateOrderNumber(existingOrders),
      orderDate,
      orderTime,
      createdAt: initialOrder?.createdAt || Date.now(),
      items: validItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      status,
      note: note.trim() || undefined,
      sentToGmailAt: initialOrder?.sentToGmailAt,
      sentToEmailAddress: initialOrder?.sentToEmailAddress,
    };

    onSave(orderToSave, sendDirectly);
  };

  const activeClientName =
    client?.name || allClients.find((c) => c.id === selectedClientId)?.name || 'Client';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {initialOrder ? 'Edit Order' : `New Order for ${activeClientName}`}
            </h3>
            <p className="text-xs text-slate-400">
              Order saved by day • Last buyer will automatically move to the top
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Client Selection (if not preselected) */}
          {!client && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Client <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {allClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-indigo-400" />
                <span>Order Day <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setOrderDate(getFormattedDate(new Date()))}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  Set Today
                </button>
                <span className="text-slate-600 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setOrderDate(getFormattedDate(new Date(Date.now() - 1000 * 60 * 60 * 24)))
                  }
                  className="text-[10px] text-slate-400 hover:text-slate-300 underline"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock size={13} className="text-indigo-400" />
                <span>Order Time</span>
              </label>
              <input
                type="time"
                value={orderTime}
                onChange={(e) => setOrderTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Order Number & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Order #
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-105"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Quick Preset Item Chips */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1.5">
              <Sparkles size={11} className="text-amber-400" />
              <span>Tap to quick-add preset item:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESET_ITEMS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => addPresetItem(preset)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                >
                  + {preset.name} (${preset.price})
                </button>
              ))}
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Order Items ({items.length})
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-4">{index + 1}.</span>
                    <input
                      type="text"
                      placeholder="Item name / description"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pl-6">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Quantity</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Unit Price ($)</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs text-right"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Line Total</span>
                      <div className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-bold rounded-lg px-2 py-1 text-xs text-right truncate">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
              Grand Total:
            </span>
            <span className="text-xl font-black text-emerald-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* Notes field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Order Notes / Delivery Details
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid in cash, deliver before noon, special packaging requested..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 py-3 rounded-xl font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check size={14} />
            <span>Save Order</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            title="Save order and immediately open Upload to Gmail dialog"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Save & Send to Gmail</span>
          </button>
        </div>
      </div>
    </div>
  );
};
