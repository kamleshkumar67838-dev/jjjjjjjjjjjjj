import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, XCircle, Copy, Check, Download, ShieldCheck, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { CustomerOrder } from '../types';

interface MyOrdersModalProps {
  orders: CustomerOrder[];
  customerOrderIds: string[];
  isOpen: boolean;
  onClose: () => void;
  selectedOrderId?: string | null;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  orders,
  customerOrderIds,
  isOpen,
  onClose,
  selectedOrderId,
}) => {
  const [searchQuery, setSearchQuery] = useState(selectedOrderId || '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter orders matching recent or query
  const displayedOrders = orders.filter((order) => {
    if (!searchQuery.trim()) {
      return customerOrderIds.includes(order.id);
    }
    const q = searchQuery.toLowerCase().trim();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.utr.toLowerCase().includes(q) ||
      order.customerTelegram.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090d1f] border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d132a] shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <h3 className="font-display font-extrabold text-lg text-white tracking-wider">
              MY ORDERS &bull; ORDER STATUS &amp; CREDENTIALS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-[#070b18] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. DC-89214), Email, or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono-code"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {displayedOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm font-medium">No orders found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                If you recently acquired a card, enter your Order ID or Email in the search box above.
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const isApproved = order.status === 'approved';
              const isPending = order.status === 'pending';
              const isRejected = order.status === 'rejected';

              return (
                <div
                  key={order.id}
                  className="rounded-xl bg-[#0c1228] border border-slate-800 hover:border-slate-700 transition p-4 sm:p-5 space-y-3.5 shadow-lg"
                >
                  {/* Order Top Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-code font-bold text-sm text-purple-300">
                        #{order.id}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {order.cardTitle}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isApproved && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>APPROVED &bull; ACTIVE CARD</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>PENDING VERIFICATION</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>REJECTED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#080d1e] p-3 rounded-lg border border-slate-800/60 font-mono-code">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Amount</span>
                      <span className="text-white font-bold text-sm">₹{order.amount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">UTR Ref</span>
                      <span className="text-slate-300 truncate block">{order.utr}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Category</span>
                      <span className="text-purple-300">{order.categoryLabel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Ordered</span>
                      <span className="text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Rejected Note */}
                  {isRejected && order.rejectionReason && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                      <div>
                        <span className="font-bold">Rejection Reason: </span>
                        <span>{order.rejectionReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Pending Notice */}
                  {isPending && (
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>SLA: 10 Minutes. Admin is reviewing your UTR transaction.</span>
                      </div>
                    </div>
                  )}

                  {/* APPROVED: Reveal Card Credentials (The prize!) */}
                  {isApproved && order.credentials && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#0e1c3d] via-[#111936] to-[#140f2d] border-2 border-emerald-500/40 space-y-3.5 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <h4 className="font-bold text-xs sm:text-sm text-emerald-300 uppercase tracking-wider">
                            Card Credentials Unlocked
                          </h4>
                        </div>
                        <button
                          onClick={() => {
                            const fullData = `DARK CARDING CREDENTIALS\nOrder: ${order.id}\nCard: ${order.cardTitle}\nCard Number: ${order.credentials?.cardNumber}\nCVV: ${order.credentials?.cvv}\nExpiry: ${order.credentials?.expiry}\nCard Holder: ${order.credentials?.cardHolder}\nBalance: ${order.credentials?.balance}`;
                            handleCopy(fullData, `full-${order.id}`);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/40 text-[11px] font-bold text-emerald-200 flex items-center space-x-1 cursor-pointer"
                        >
                          {copiedKey === `full-${order.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-300" />
                              <span>Copied All!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy All</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Credentials Display Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-code text-xs">
                        {/* Card Number */}
                        <div className="p-2.5 rounded-lg bg-black/40 border border-slate-700/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Card Number</span>
                            <span className="text-sm font-bold text-white tracking-widest">
                              {order.credentials.cardNumber}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(order.credentials!.cardNumber, `num-${order.id}`)}
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedKey === `num-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* CVV & Expiry */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-lg bg-black/40 border border-slate-700/60 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">CVV</span>
                              <span className="text-sm font-bold text-amber-300 tracking-wider">
                                {order.credentials.cvv}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(order.credentials!.cvv, `cvv-${order.id}`)}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                            >
                              {copiedKey === `cvv-${order.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/40 border border-slate-700/60 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Expiry</span>
                              <span className="text-sm font-bold text-cyan-300">
                                {order.credentials.expiry}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(order.credentials!.expiry, `exp-${order.id}`)}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                            >
                              {copiedKey === `exp-${order.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Card Holder & Balance */}
                        <div className="p-2.5 rounded-lg bg-black/40 border border-slate-700/60">
                          <span className="text-[10px] text-slate-400 block uppercase">Card Holder Name</span>
                          <span className="text-xs font-bold text-slate-200">
                            {order.credentials.cardHolder}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-black/40 border border-slate-700/60">
                          <span className="text-[10px] text-slate-400 block uppercase">Active Balance</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {order.credentials.balance}
                          </span>
                        </div>
                      </div>

                      {order.credentials.tiktokVoucherCode && (
                        <div className="p-3 rounded-lg bg-[#fe2c55]/15 border border-[#fe2c55]/40 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#fe2c55] font-bold block uppercase tracking-wider">
                              TikTok Coin Voucher Code
                            </span>
                            <span className="font-mono-code font-bold text-sm text-white select-all">
                              {order.credentials.tiktokVoucherCode}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(order.credentials!.tiktokVoucherCode!, `tk-${order.id}`)}
                            className="px-3 py-1.5 rounded-md bg-[#fe2c55] hover:bg-[#e0264a] text-white text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow"
                          >
                            {copiedKey === `tk-${order.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copy Voucher</span>
                          </button>
                        </div>
                      )}

                      {order.credentials.notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          Note: {order.credentials.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
