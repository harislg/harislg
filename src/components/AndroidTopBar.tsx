import React from 'react';
import { Mail, Search, User as UserIcon, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { User } from 'firebase/auth';

interface AndroidTopBarProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showSearch?: boolean;
  onToggleSearch?: () => void;
  currentUser: User | null;
  hasGmailToken: boolean;
  onConnectGoogle: () => void;
  onLogoutGoogle: () => void;
  isConnecting: boolean;
  onBack?: () => void;
  targetEmail: string;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  showSearch,
  onToggleSearch,
  currentUser,
  hasGmailToken,
  onConnectGoogle,
  onLogoutGoogle,
  isConnecting,
  onBack,
  targetEmail,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
      {/* Android Mini Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-[11px] font-mono text-slate-400 bg-slate-950/60">
        <span className="font-semibold text-slate-300">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-2">
          {currentUser && hasGmailToken ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-sans text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Gmail Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400/90 font-sans text-[10px]">
              Gmail Ready
            </span>
          )}
          <span className="tracking-widest">4G LTE • 98%</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              className="p-1.5 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-white truncate flex items-center gap-2">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleSearch && (
            <button
              onClick={onToggleSearch}
              aria-label="Search"
              className={`p-2 rounded-full transition-colors ${
                showSearch ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Search size={18} />
            </button>
          )}

          {/* Google Account Status Badge / Trigger */}
          {currentUser && hasGmailToken ? (
            <div className="flex items-center gap-1 bg-slate-800/80 border border-emerald-500/30 rounded-full pl-2 pr-1 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-slate-200 max-w-[90px] truncate" title={currentUser.email || targetEmail}>
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <button
                onClick={onLogoutGoogle}
                title="Disconnect Google account"
                className="p-1 text-slate-400 hover:text-rose-400 rounded-full transition-colors"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectGoogle}
              disabled={isConnecting}
              title={`Sign in with Google to enable direct upload to ${targetEmail}`}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium px-2.5 py-1.5 rounded-full shadow-sm active:scale-95 transition-all"
            >
              {isConnecting ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Mail size={13} />
              )}
              <span>{isConnecting ? 'Connecting...' : 'Connect Gmail'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-800/60">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search client name, phone, or company..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
