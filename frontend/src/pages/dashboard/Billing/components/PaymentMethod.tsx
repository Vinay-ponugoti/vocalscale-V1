import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowUpRight, Loader2, Plus } from 'lucide-react';
import { billingApi } from '../../../../api/billing';

interface PaymentMethodData {
  type: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
}

const PaymentMethod: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const data = await billingApi.getPaymentMethod();
        setPaymentMethod(data);
      } catch (error) {
        console.error('Error fetching payment method:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentMethod();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-electric/10 flex items-center justify-center text-blue-electric ring-1 ring-blue-electric/20">
            <CreditCard size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-charcoal tracking-tight uppercase">Payment Method</h2>
        </div>
        <div className="h-32 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/30 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-electric" size={24} strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-blue-electric/10 flex items-center justify-center text-blue-electric ring-1 ring-blue-electric/20">
          <CreditCard size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-black text-charcoal tracking-tight uppercase">Payment Method</h2>
      </div>
      
      <div className="flex flex-col gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        {!paymentMethod ? (
          <div className="flex flex-col items-center justify-center py-4 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 ring-1 ring-slate-100">
              <CreditCard size={32} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-charcoal uppercase tracking-tight">No payment method</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Add a card to enable auto-recharge</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-electric text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-dark transition-all shadow-lg shadow-blue-electric/20 active:scale-95">
              <Plus size={14} strokeWidth={3} /> Add New Card
            </button>
          </div>
        ) : (
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
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-blue-electric transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
                <ArrowUpRight size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
              <button className="px-4 py-2 rounded-lg text-[10px] font-black text-blue-electric hover:bg-blue-electric/5 transition-all uppercase tracking-widest">Update Card</button>
              <div className="w-px h-3 bg-slate-200"></div>
              <button className="px-4 py-2 rounded-lg text-[10px] font-black text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-widest">Remove</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;
