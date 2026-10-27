import React, { useState } from 'react';
import { AppSettings } from '../services/storage';
import { User } from 'firebase/auth';
import {
  Mail,
  Smartphone,
  Save,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Laptop,
} from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  currentUser: User | null;
  hasGmailToken: boolean;
  onConnectGoogle: () => void;
  onLogoutGoogle: () => void;
  isConnecting: boolean;
  onResetData: () => void;
  onExportJson: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  currentUser,
  hasGmailToken,
  onConnectGoogle,
  onLogoutGoogle,
  isConnecting,
  onResetData,
  onExportJson,
}) => {
  const [defaultEmail, setDefaultEmail] = useState(settings.defaultEmail);
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [deviceFrame, setDeviceFrame] = useState(settings.deviceFrame);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      defaultEmail: defaultEmail.trim() || 'harislgnok@gmail.com',
      businessName: businessName.trim() || 'My Sales & Orders',
      deviceFrame,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn text-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <h3 className="text-base font-bold text-white mb-1">Gmail & Computer Sync</h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Configure where orders are uploaded so you can instantly open and review them on your computer.
        </p>

        {/* Google Authentication Box (Official Google Style) */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Google Connection:</span>
            {currentUser && hasGmailToken ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 size={14} />
                <span>Connected & Ready</span>
              </span>
            ) : (
              <span className="text-xs text-amber-400 font-medium">Ready to Connect</span>
            )}
          </div>

          {currentUser && hasGmailToken ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
              <div className="min-w-0 pr-2">
                <div className="font-bold text-xs text-white truncate">
                  {currentUser.displayName || 'Google Account'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {currentUser.email || defaultEmail}
                </div>
              </div>
              <button
                type="button"
                onClick={onLogoutGoogle}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800"
              >
                <LogOut size={13} />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <div>
              {/* Official Google Sign-in Styled Button per guidelines */}
              <button
                type="button"
                onClick={onConnectGoogle}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs py-2.5 px-4 rounded-xl shadow transition-all active:scale-98 disabled:opacity-60"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-4 h-4 shrink-0"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                </svg>
                <span>
                  {isConnecting ? 'Signing in with Google...' : 'Sign in with Google for Gmail Upload'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Email and Settings Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail size={13} className="text-indigo-400" />
              <span>Default Destination Email</span>
            </label>
            <input
              type="email"
              value={defaultEmail}
              onChange={(e) => setDefaultEmail(e.target.value)}
              placeholder="harislgnok@gmail.com"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Orders uploaded via the "Upload to Gmail" button will be delivered here so you can open them on your computer.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notebook / Business Header Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="My Sales & Orders"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deviceFrame}
                onChange={(e) => setDeviceFrame(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <span className="text-xs text-slate-300">
                Display with Android Phone Bezel frame on large screens
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>

          {savedSuccess && (
            <div className="p-2 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-center text-xs text-emerald-300">
              Preferences updated!
            </div>
          )}
        </form>
      </div>

      {/* Backup & Sample Data Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <h3 className="text-base font-bold text-white">Data Management</h3>
        <p className="text-xs text-slate-400">
          Export order notes and client records or restore the original demo records.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onExportJson}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={13} className="text-indigo-400" />
            <span>Export Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={onResetData}
            className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
