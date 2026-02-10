import React, { useEffect, useState, useCallback } from 'react';
import { CreditCard, Loader2, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { billingApi } from '../../../../api/billing';

interface PaymentMethodData {
  id: string;
  type: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
}

const PaymentMethod: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [updatingCard, setUpdatingCard] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPaymentMethod = useCallback(async () => {
    try {
      const data = await billingApi.getPaymentMethod();
      setPaymentMethod(data);
    } catch (error) {
      console.error('Error fetching payment method:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPaymentMethod(); }, [fetchPaymentMethod]);

  // Auto-dismiss status after 4s
  useEffect(() => {
    if (statusMsg) {
      const t = setTimeout(() => setStatusMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [statusMsg]);

  // Opens Stripe's hosted Billing Portal for card update/add
  const handleUpdateCard = async () => {
    setUpdatingCard(true);
    try {
      const { url } = await billingApi.createPortalSession();
      window.open(url, '_blank');
    } catch (err: unknown) {
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to open billing portal' });
    } finally {
      setUpdatingCard(false);
    }
  };

  const handleDelete = async () => {
    if (!paymentMethod?.id) return;
    setDeleting(true);
    try {
      await billingApi.deletePaymentMethod(paymentMethod.id);
      setPaymentMethod(null);
      setDeleteConfirm(false);
      setStatusMsg({ type: 'success', text: 'Payment method removed' });
    } catch (err: unknown) {
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to remove card' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 ring-1 ring-blue-500/10">
            <CreditCard size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-charcoal tracking-tight uppercase">Payment Method</h2>
        </div>
        <div className="h-32 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={24} strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 ring-1 ring-blue-500/10">
          <CreditCard size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-black text-charcoal tracking-tight uppercase">Payment Method</h2>
      </div>

      {/* Status toast */}
      {statusMsg && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle size={14} strokeWidth={2.5} /> : <AlertCircle size={14} strokeWidth={2.5} />}
          {statusMsg.text}
        </div>
      )}

      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        {!paymentMethod ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-4 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 ring-1 ring-slate-100">
              <CreditCard size={32} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-charcoal uppercase tracking-tight">No payment method</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Add a card to enable auto-recharge</p>
            </div>
            <button
              onClick={handleUpdateCard}
              disabled={updatingCard}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {updatingCard ? <Loader2 size={14} strokeWidth={3} className="animate-spin" /> : <Plus size={14} strokeWidth={3} />}
              {updatingCard ? 'Opening...' : 'Add New Card'}
            </button>
          </div>
        ) : (
          /* ── Card display ── */
          <>
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-2 shadow-inner ring-1 ring-slate-200/50">
                  {paymentMethod.brand ? (
                    <span className="text-[11px] font-black text-charcoal uppercase italic tracking-tighter">{paymentMethod.brand}</span>
                  ) : (
                    <CreditCard className="text-charcoal-muted" size={24} />
                  )}
                </div>
                <div>
                  <p className="text-base font-black text-charcoal capitalize">
                    {paymentMethod.brand} <span className="text-slate-400 mx-1">••••</span> {paymentMethod.last4}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-wider">Default</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Expires {paymentMethod.exp_month}/{paymentMethod.exp_year?.toString().slice(-2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
              <button
                onClick={handleUpdateCard}
                disabled={updatingCard}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {updatingCard ? <Loader2 size={12} strokeWidth={2.5} className="animate-spin" /> : <RefreshCw size={12} strokeWidth={2.5} />}
                Update Card <ExternalLink size={10} strokeWidth={2.5} className="ml-0.5 opacity-50" />
              </button>
              <div className="w-px h-3 bg-slate-200" />

              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">Are you sure?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={12} strokeWidth={2.5} className="animate-spin" /> : <Trash2 size={12} strokeWidth={2.5} />}
                    {deleting ? 'Removing...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-widest"
                >
                  <Trash2 size={12} strokeWidth={2.5} /> Remove
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;
