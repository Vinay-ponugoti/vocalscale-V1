import React, { useEffect, useState } from 'react';
import { CalendarDays, Download, Loader2, Receipt } from 'lucide-react';
import { billingApi } from '../../../../api/billing';
import { format } from 'date-fns';

interface Invoice {
  stripe_invoice_id: string;
  created_at: string;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf: string;
  hosted_invoice_url: string;
}

const BillingHistory: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5); // Fixed page size for invoices
  const [total, setTotal] = useState(0);

  const formatCurrency = (amountInCents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100);
  };

  const safeFormatDate = (dateStr: string, formatStr: string) => {
    try {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatStr);
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return 'N/A';
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const data = await billingApi.getInvoices(page, pageSize);
        if (data.items) {
          setInvoices(data.items);
          setTotal(data.total || 0);
        } else {
          // Fallback if API hasn't been updated yet or returns array
          setInvoices(Array.isArray(data) ? data : []);
          setTotal(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 ring-1 ring-blue-500/10">
            <CalendarDays size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-charcoal tracking-tight uppercase">Billing History</h2>
        </div>
        <div className="h-[400px] rounded-3xl border border-slate-200 bg-slate-50/50 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 ring-1 ring-blue-500/10">
            <CalendarDays size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-charcoal tracking-tight uppercase">Billing History</h2>
        </div>
        {invoices.length > 0 && (
          <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100">View All</button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex-1 min-h-[400px] flex flex-col">
        {invoices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 p-12">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 ring-1 ring-slate-100">
              <Receipt size={40} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-base font-black text-charcoal uppercase tracking-tight">No invoices yet</p>
              <p className="text-xs font-bold text-slate-400 mt-2 max-w-[240px] leading-relaxed">Your billing history will appear here once you have an active subscription.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Description</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv, index) => (
                  <tr key={inv.stripe_invoice_id || index} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-charcoal">{safeFormatDate(inv.created_at, 'MMM d, yyyy')}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{safeFormatDate(inv.created_at, 'EEEE')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-charcoal-medium truncate max-w-[200px]">
                      Invoice #{inv.stripe_invoice_id ? inv.stripe_invoice_id.slice(-4) : '....'}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/10'
                        : 'bg-amber-50 text-amber-600 ring-amber-500/10'
                        }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-charcoal text-sm">
                      {formatCurrency(inv.amount_paid, inv.currency)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {inv.invoice_pdf ? (
                        <a
                          href={inv.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all w-10 h-10 rounded-xl hover:bg-blue-50 border border-transparent group-hover:border-blue-100 hover:shadow-sm"
                          title="Download Invoice"
                        >
                          <Download size={18} strokeWidth={2.5} />
                        </a>
                      ) : (
                        <span className="text-slate-300 p-2 italic font-bold">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > pageSize && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-charcoal hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-charcoal hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingHistory;
