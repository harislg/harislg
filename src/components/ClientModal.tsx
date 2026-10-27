import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { User, Phone, Mail, MapPin, Building2, FileText, X, Check } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  initialClient?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<'VIP' | 'Regular' | 'New' | 'Wholesale'>('Regular');

  useEffect(() => {
    if (initialClient) {
      setName(initialClient.name);
      setCompany(initialClient.company || '');
      setPhone(initialClient.phone || '');
      setEmail(initialClient.email || '');
      setAddress(initialClient.address || '');
      setNotes(initialClient.notes || '');
      setCategory(initialClient.category || 'Regular');
    } else {
      setName('');
      setCompany('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
      setCategory('Regular');
    }
  }, [initialClient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a client name.');
      return;
    }

    const clientToSave: Client = {
      id: initialClient?.id || `client-${Date.now()}`,
      name: name.trim(),
      company: company.trim() || undefined,
      phone: phone.trim() || '',
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      category,
      createdAt: initialClient?.createdAt || Date.now(),
      lastOrderDate: initialClient?.lastOrderDate,
      lastOrderTimestamp: initialClient?.lastOrderTimestamp,
      totalOrdersCount: initialClient?.totalOrdersCount || 0,
      totalSpent: initialClient?.totalSpent || 0,
    };

    onSave(clientToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {initialClient ? 'Edit Client Card' : 'Add New Client'}
            </h3>
            <p className="text-xs text-slate-400">
              Create client notebook card to track their orders and purchases
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User size={13} className="text-indigo-400" />
              <span>Client Name <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maria Gonzalez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 size={13} className="text-indigo-400" />
                <span>Company / Shop</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Gonzalez Gourmet"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as 'VIP' | 'Regular' | 'New' | 'Wholesale')
                }
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Wholesale">Wholesale</option>
                <option value="New">New</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-indigo-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail size={13} className="text-indigo-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-indigo-400" />
              <span>Address / Location</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 104 Main St, Suite B"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText size={13} className="text-indigo-400" />
              <span>Client Notes & Preferences</span>
            </label>
            <textarea
              rows={3}
              placeholder="Special delivery instructions, product preferences, discounts..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check size={14} />
              <span>{initialClient ? 'Update Client' : 'Save Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
