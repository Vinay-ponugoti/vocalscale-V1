import React from 'react';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const UpsellCard: React.FC = () => {
  return (
    <div className="relative flex flex-1 flex-col gap-6 overflow-hidden rounded-lg bg-slate-900 p-8 shadow-sm">
      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200">
          <TrendingUp size={12} strokeWidth={2.5} />
          <span>Scale Faster</span>
        </div>
        <h4 className="font-black text-white text-3xl leading-tight tracking-tight">Expand Your<br />Capabilities</h4>
        <p className="text-sm text-slate-400 font-bold mt-4 leading-relaxed max-w-[200px]">
          Upgrade to unlock premium features and higher minute limits for your business.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 relative z-10">
        <button className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-white py-4 text-[11px] font-black text-slate-900 transition-all hover:bg-blue-50 shadow-xl shadow-black/10 active:scale-95 group/btn uppercase tracking-widest">
          <ShoppingCart size={16} strokeWidth={2.5} className="group-hover/btn:translate-x-0.5 transition-transform" />
          Buy Extra Pack
        </button>
        <Link
          to="/dashboard/billing/plans"
          className="w-full flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-4 text-[11px] font-black text-white transition-all hover:bg-white/10 hover:border-white/20 backdrop-blur-md active:scale-95 uppercase tracking-widest"
        >
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
};

export default UpsellCard;
