/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Client, Order } from './types';
import {
  getClients,
  saveClients,
  getOrders,
  saveOrders,
  getSettings,
  saveSettings,
  syncClientsWithOrders,
  sortClientsByLatestOrder,
  AppSettings,
  DEFAULT_SETTINGS,
} from './services/storage';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebaseAuth';
import { User } from 'firebase/auth';

import { AndroidTopBar } from './components/AndroidTopBar';
import { AndroidNavBar, ActiveTab } from './components/AndroidNavBar';
import { ClientCard } from './components/ClientCard';
import { ClientDetail } from './components/ClientDetail';
import { OrderModal } from './components/OrderModal';
import { ClientModal } from './components/ClientModal';
import { SendGmailModal } from './components/SendGmailModal';
import { StatsDashboard } from './components/StatsDashboard';
import { SettingsModal } from './components/SettingsModal';
import { OrderCard } from './components/OrderCard';

import {
  Plus,
  Users,
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowUpDown,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // Core application state
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Active view navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderClientContext, setOrderClientContext] = useState<Client | undefined>(undefined);

  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isSendGmailModalOpen, setIsSendGmailModalOpen] = useState<boolean>(false);
  const [orderToSend, setOrderToSend] = useState<Order | null>(null);
  const [clientForSend, setClientForSend] = useState<Client | null>(null);

  // Google OAuth & Firebase state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasGmailToken, setHasGmailToken] = useState<boolean>(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedOrders = getOrders();
    const loadedClients = getClients();
    const loadedSettings = getSettings();

    // Ensure clients are accurately synced with order timestamps and sorted
    const syncedClients = syncClientsWithOrders(loadedClients, loadedOrders);
    const sorted = sortClientsByLatestOrder(syncedClients);

    setClients(sorted);
    setOrders(loadedOrders);
    setSettings(loadedSettings);

    // Initialize Firebase Auth listener
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasGmailToken(!!token);
      },
      () => {
        // Not authenticated with token in memory
        setHasGmailToken(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Google Auth Actions
  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setHasGmailToken(true);
        showToast(`Connected to Google as ${result.user.email}`);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      showToast('Could not sign in with Google. You can still use Gmail Web compose.');
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleLogoutGoogle = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setHasGmailToken(false);
      showToast('Disconnected from Google account');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Orders CRUD
  const handleSaveOrder = (orderToSave: Order, sendDirectly: boolean = false) => {
    let updatedOrders: Order[];
    const existingIndex = orders.findIndex((o) => o.id === orderToSave.id);

    if (existingIndex >= 0) {
      updatedOrders = [...orders];
      updatedOrders[existingIndex] = orderToSave;
    } else {
      updatedOrders = [orderToSave, ...orders];
    }

    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    // Recalculate client order metrics & sort so the LAST BUYER immediately moves to the top!
    const syncedClients = syncClientsWithOrders(clients, updatedOrders);
    const sortedClients = sortClientsByLatestOrder(syncedClients);
    setClients(sortedClients);
    saveClients(sortedClients);

    // If client detail is open, keep selectedClient updated
    if (selectedClient && selectedClient.id === orderToSave.clientId) {
      const updatedSelected = sortedClients.find((c) => c.id === selectedClient.id) || null;
      setSelectedClient(updatedSelected);
    }

    setIsOrderModalOpen(false);
    setEditingOrder(null);

    const client = sortedClients.find((c) => c.id === orderToSave.clientId);
    showToast(`Order ${orderToSave.orderNumber} saved! ${client?.name} is now top buyer.`);

    if (sendDirectly && client) {
      triggerSendToGmail(orderToSave, client);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    const updatedOrders = orders.filter((o) => o.id !== orderId);
    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    const syncedClients = syncClientsWithOrders(clients, updatedOrders);
    const sortedClients = sortClientsByLatestOrder(syncedClients);
    setClients(sortedClients);
    saveClients(sortedClients);

    if (selectedClient) {
      const updatedSelected = sortedClients.find((c) => c.id === selectedClient.id) || null;
      setSelectedClient(updatedSelected);
    }

    showToast('Order removed.');
  };

  // Clients CRUD
  const handleSaveClient = (clientToSave: Client) => {
    let updatedClients: Client[];
    const existingIndex = clients.findIndex((c) => c.id === clientToSave.id);

    if (existingIndex >= 0) {
      updatedClients = [...clients];
      updatedClients[existingIndex] = clientToSave;
    } else {
      updatedClients = [clientToSave, ...clients];
    }

    const synced = syncClientsWithOrders(updatedClients, orders);
    const sorted = sortClientsByLatestOrder(synced);
    setClients(sorted);
    saveClients(sorted);

    if (selectedClient && selectedClient.id === clientToSave.id) {
      setSelectedClient(sorted.find((c) => c.id === clientToSave.id) || null);
    }

    setIsClientModalOpen(false);
    setEditingClient(null);
    showToast(`Client ${clientToSave.name} saved.`);
  };

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    if (
      !window.confirm(
        `Are you sure you want to delete client "${client.name}" and all their associated orders?`
      )
    ) {
      return;
    }

    const updatedClients = clients.filter((c) => c.id !== clientId);
    const updatedOrders = orders.filter((o) => o.clientId !== clientId);

    setClients(updatedClients);
    saveClients(updatedClients);
    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    setSelectedClient(null);
    showToast(`Client ${client.name} deleted.`);
  };

  // Trigger Send / Upload to Gmail Modal
  const triggerSendToGmail = (order: Order, client?: Client) => {
    const orderClient = client || clients.find((c) => c.id === order.clientId) || null;
    setOrderToSend(order);
    setClientForSend(orderClient);
    setIsSendGmailModalOpen(true);
  };

  const handleOrderMarkedSent = (orderId: string, email: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            sentToGmailAt: Date.now(),
            sentToEmailAddress: email,
          }
        : o
    );
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    showToast(`Order marked as uploaded to Gmail (${email})!`);
  };

  // Settings & Data management
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast('Preferences updated.');
  };

  const handleResetData = () => {
    if (
      !window.confirm(
        'Reset all clients and orders to initial demo state? (Your existing data will be replaced)'
      )
    ) {
      return;
    }
    localStorage.clear();
    window.location.reload();
  };

  const handleExportJson = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      clients,
      orders,
      settings,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordernote_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded!');
  };

  // Filter clients by search query & category
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.phone && c.phone.includes(searchQuery));

      const matchesCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'WITH_ORDERS' && (c.totalOrdersCount || 0) > 0) ||
        c.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [clients, searchQuery, categoryFilter]);

  // Selected client orders
  const selectedClientOrders = useMemo(() => {
    if (!selectedClient) return [];
    return orders.filter((o) => o.clientId === selectedClient.id);
  }, [orders, selectedClient]);

  // Determine latest buyer overall
  const topBuyerClientId = clients[0]?.lastOrderTimestamp ? clients[0].id : null;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start items-center ${
        settings.deviceFrame ? 'py-4 sm:py-8' : ''
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 z-50 max-w-sm px-4 py-2.5 bg-slate-900 border border-indigo-500/80 text-white text-xs font-medium rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container / Mobile Frame */}
      <div
        className={`w-full ${
          settings.deviceFrame
            ? 'max-w-md bg-slate-900 rounded-[40px] shadow-2xl border-4 border-slate-800 overflow-hidden min-h-[850px]'
            : 'max-w-md bg-slate-950 min-h-screen'
        } flex flex-col relative`}
      >
        {/* Top Android App Bar */}
        <AndroidTopBar
          title={
            selectedClient
              ? selectedClient.name
              : activeTab === 'clients'
              ? settings.businessName || 'Client Notebook'
              : activeTab === 'recent'
              ? 'Recent Orders'
              : activeTab === 'stats'
              ? 'Sales Overview'
              : 'App Settings'
          }
          subtitle={
            selectedClient
              ? 'Client Card & Daily Orders'
              : activeTab === 'clients'
              ? `${clients.length} clients • Last buyer at top`
              : undefined
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={showSearch}
          onToggleSearch={() => setShowSearch(!showSearch)}
          currentUser={currentUser}
          hasGmailToken={hasGmailToken}
          onConnectGoogle={handleConnectGoogle}
          onLogoutGoogle={handleLogoutGoogle}
          isConnecting={isConnectingGoogle}
          onBack={selectedClient ? () => setSelectedClient(null) : undefined}
          targetEmail={settings.defaultEmail}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* Detail View for Selected Client */}
          {selectedClient ? (
            <ClientDetail
              client={selectedClient}
              orders={selectedClientOrders}
              onBack={() => setSelectedClient(null)}
              onAddOrder={() => {
                setOrderClientContext(selectedClient);
                setEditingOrder(null);
                setIsOrderModalOpen(true);
              }}
              onEditClient={() => {
                setEditingClient(selectedClient);
                setIsClientModalOpen(true);
              }}
              onDeleteClient={() => handleDeleteClient(selectedClient.id)}
              onSendOrderToGmail={(order) => triggerSendToGmail(order, selectedClient)}
              onEditOrder={(order) => {
                setOrderClientContext(selectedClient);
                setEditingOrder(order);
                setIsOrderModalOpen(true);
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          ) : (
            <>
              {/* TAB 1: CLIENTS LIST */}
              {activeTab === 'clients' && (
                <div className="space-y-4 pb-20 animate-fadeIn">
                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    {['ALL', 'WITH_ORDERS', 'VIP', 'Wholesale', 'Regular', 'New'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                          categoryFilter === cat
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat === 'ALL'
                          ? 'All Clients'
                          : cat === 'WITH_ORDERS'
                          ? 'Active Buyers'
                          : cat}
                      </button>
                    ))}
                  </div>

                  {/* Header Notice explaining the automatic ordering */}
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <ArrowUpDown size={12} className="text-indigo-400" />
                      <span>Sorted: Last client who bought is #1</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {filteredClients.length} shown
                    </span>
                  </div>

                  {/* Client Cards List */}
                  {filteredClients.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 border-dashed">
                      <Users size={32} className="mx-auto text-slate-500 mb-2" />
                      <h4 className="text-sm font-bold text-white">No clients found</h4>
                      <p className="text-xs text-slate-400 mt-1 mb-3">
                        {searchQuery ? 'Try clearing your search query.' : 'Add your first client to begin tracking orders.'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingClient(null);
                          setIsClientModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                      >
                        Add New Client
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredClients.map((client, index) => {
                        const isLatest = client.id === topBuyerClientId;
                        const clientLatestOrder = orders
                          .filter((o) => o.clientId === client.id)
                          .sort((a, b) => b.createdAt - a.createdAt)[0];

                        return (
                          <ClientCard
                            key={client.id}
                            client={client}
                            isLatestBuyer={isLatest}
                            onSelect={(c) => setSelectedClient(c)}
                            onAddOrder={(c) => {
                              setOrderClientContext(c);
                              setEditingOrder(null);
                              setIsOrderModalOpen(true);
                            }}
                            onSendLatestToGmail={(c, ord) => triggerSendToGmail(ord, c)}
                            latestOrder={clientLatestOrder}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: RECENT ORDERS (ALL CLIENTS) */}
              {activeTab === 'recent' && (
                <div className="space-y-3 pb-20 animate-fadeIn">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h3 className="text-sm font-bold text-white">All Orders Stream</h3>
                      <p className="text-xs text-slate-400">
                        Most recent transactions across all clients
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setOrderClientContext(undefined);
                        setEditingOrder(null);
                        setIsOrderModalOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <Plus size={13} />
                      <span>Add Order</span>
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 border-dashed">
                      <ShoppingBag size={32} className="mx-auto text-slate-500 mb-2" />
                      <h4 className="text-sm font-bold text-white">No orders yet</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Tap "Add Order" to record an order for any client.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...orders]
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((order) => {
                          const client = clients.find((c) => c.id === order.clientId);
                          return (
                            <OrderCard
                              key={order.id}
                              order={order}
                              client={client}
                              onSendToGmail={(ord) => triggerSendToGmail(ord, client)}
                              onEditOrder={(ord) => {
                                setOrderClientContext(client);
                                setEditingOrder(ord);
                                setIsOrderModalOpen(true);
                              }}
                              onDeleteOrder={handleDeleteOrder}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STATS OVERVIEW */}
              {activeTab === 'stats' && (
                <StatsDashboard
                  clients={clients}
                  orders={orders}
                  onSelectClient={(c) => setSelectedClient(c)}
                  onSendOrderToGmail={(ord) => triggerSendToGmail(ord)}
                  targetEmail={settings.defaultEmail}
                />
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <SettingsModal
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  currentUser={currentUser}
                  hasGmailToken={hasGmailToken}
                  onConnectGoogle={handleConnectGoogle}
                  onLogoutGoogle={handleLogoutGoogle}
                  isConnecting={isConnectingGoogle}
                  onResetData={handleResetData}
                  onExportJson={handleExportJson}
                />
              )}
            </>
          )}
        </main>

        {/* Floating Action Button (FAB) for Clients View */}
        {!selectedClient && activeTab === 'clients' && (
          <div className="fixed bottom-20 right-6 z-40 max-w-md">
            <div className="flex flex-col items-end gap-2.5">
              <button
                onClick={() => {
                  setEditingClient(null);
                  setIsClientModalOpen(true);
                }}
                title="Add New Client"
                className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-900/50 flex items-center justify-center active:scale-90 transition-all border border-indigo-400/30"
              >
                <Plus size={26} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Android Bottom Navigation Bar */}
        <AndroidNavBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedClient(null);
            setActiveTab(tab);
          }}
          clientsCount={clients.length}
          ordersCount={orders.length}
        />

        {/* Modals */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setEditingOrder(null);
          }}
          onSave={handleSaveOrder}
          client={orderClientContext}
          allClients={clients}
          initialOrder={editingOrder}
          existingOrders={orders}
        />

        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => {
            setIsClientModalOpen(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClient}
          initialClient={editingClient}
        />

        <SendGmailModal
          isOpen={isSendGmailModalOpen}
          onClose={() => {
            setIsSendGmailModalOpen(false);
            setOrderToSend(null);
            setClientForSend(null);
          }}
          order={orderToSend}
          client={clientForSend}
          currentUser={currentUser}
          hasGmailToken={hasGmailToken}
          defaultEmail={settings.defaultEmail}
          onOrderSent={handleOrderMarkedSent}
        />
      </div>
    </div>
  );
}
