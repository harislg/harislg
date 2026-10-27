import React, { useState } from 'react';
import { Client, Order } from '../types';
import {
  sendOrderToGmailApi,
  getGmailWebComposeUrl,
  getMailtoUrl,
  generatePlainTextOrder,
  formatCurrency,
} from '../services/gmailService';
import { googleSignIn, getAccessToken } from '../services/firebaseAuth';
import {
  Mail,
  Send,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
  X,
  Laptop,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SendGmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  client: Client | null;
  currentUser: User | null;
  hasGmailToken: boolean;
  defaultEmail: string;
  onOrderSent: (orderId: string, email: string) => void;
}

export const SendGmailModal: React.FC<SendGmailModalProps> = ({
  isOpen,
  onClose,
  order,
  client,
  currentUser,
  hasGmailToken,
  defaultEmail,
  onOrderSent,
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>(
    currentUser?.email || defaultEmail || 'harislgnok@gmail.com'
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'preview' | 'text'>('preview');

  if (!isOpen || !order || !client) return null;

  const handleSendViaGmailApi = async () => {
    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let token = await getAccessToken();

      // If user hasn't authenticated yet with Google, trigger Google popup
      if (!token) {
        const signinResult = await googleSignIn();
        if (!signinResult?.accessToken) {
          throw new Error('Google sign-in was not completed.');
        }
        token = signinResult.accessToken;
      }

      await sendOrderToGmailApi({
        order,
        client,
        targetEmail: recipientEmail,
        accessToken: token,
      });

      setSuccessMessage(
        `Order ${order.orderNumber} successfully sent to ${recipientEmail}! Check your Gmail on your computer.`
      );
      onOrderSent(order.id, recipientEmail);

      // Auto close after 2.5 seconds of success
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      console.error('Failed to send order via Gmail API:', err);
      setErrorMessage(
        err.message || 'Could not send email. You can also use "Open in Gmail Web" below.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenInGmailWeb = () => {
    const url = getGmailWebComposeUrl(order, client, recipientEmail);
    window.open(url, '_blank');
    onOrderSent(order.id, recipientEmail);
  };

  const handleCopyText = async () => {
    try {
      const text = generatePlainTextOrder(order, client);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Send Order to Gmail
              </h3>
              <p className="text-xs text-slate-400">
                View & print on your computer: {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Confirmation Notice (Mandatory Workspace Destructive/Sending Dialog) */}
          <div className="p-3 bg-blue-950/50 border border-blue-800/80 rounded-2xl flex items-start gap-2.5 text-blue-200">
            <Laptop size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white block">
                Send order for {client.name} to your Gmail inbox?
              </span>
              <p className="text-blue-300/90 text-[11px] leading-relaxed">
                This will dispatch a formatted order receipt containing the itemized breakdown (
                {order.items.length} items, total {formatCurrency(order.totalAmount)}) directly to your
                Gmail address so you can access it from your desktop computer.
              </p>
            </div>
          </div>

          {/* Destination Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Send To Gmail Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. harislgnok@gmail.com"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status feedback banners */}
          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/80 rounded-xl text-rose-200 flex items-start gap-2">
              <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Failed to send via Gmail API</span>
                <span className="text-[11px] opacity-90">{errorMessage}</span>
                <p className="mt-1 text-[11px] text-amber-300">
                  Tip: Use the "Open in Gmail Web" button below to compose directly!
                </p>
              </div>
            </div>
          )}

          {/* Preview Toggle Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                Email Content Preview
              </span>
              <div className="flex gap-1 bg-slate-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewTab('preview')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    viewTab === 'preview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Receipt View
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('text')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    viewTab === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Plain Text
                </button>
              </div>
            </div>

            {viewTab === 'preview' ? (
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">{order.orderNumber}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{order.orderDate}</span>
                </div>
                <div className="text-slate-300">
                  <strong>Client:</strong> {client.name}{' '}
                  {client.company ? `(${client.company})` : ''}
                </div>
                <div className="space-y-1 py-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300 text-[11px]">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-mono text-slate-200">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold">
                  <span className="text-slate-300 uppercase">Total Amount:</span>
                  <span className="text-emerald-400 text-sm">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <pre className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                {generatePlainTextOrder(order, client)}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 space-y-2">
          {/* Primary Gmail Send Button */}
          <button
            type="button"
            disabled={isSending}
            onClick={handleSendViaGmailApi}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Sending to Gmail...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Upload & Send to {recipientEmail}</span>
              </>
            )}
          </button>

          {/* Alternative options row */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOpenInGmailWeb}
              className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink size={14} className="text-indigo-400" />
              <span>Open in Gmail Web</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy size={14} />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
