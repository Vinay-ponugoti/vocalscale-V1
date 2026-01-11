import React from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const UpsellCard: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 rounded-[32px] bg-charcoal p-8 shadow-2xl shadow-blue-electric/20 flex-1 relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-blue-electric rounded-full blur-[80px] opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-indigo-600 rounded-full blur-[70px] opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-electric/10 px-3 py-1.5 text-[10px] font-black text-blue-electric/80 uppercase tracking-[0.2em] mb-4 border border-blue-electric/20 backdrop-blur-md">
          <Sparkles size={12} strokeWidth={2.5} className="animate-pulse" />
          <span>Limited Offer</span>
        </div>
        <h4 className="font-black text-white text-3xl leading-tight tracking-tight">Need more<br />minutes?</h4>
        <p className="text-sm text-slate-400 font-bold mt-4 leading-relaxed max-w-[200px]">
          Avoid overage fees and keep your AI conversations flowing without interruption.
        </p>
      </div>
      
      <div className="mt-auto flex flex-col gap-3 relative z-10">
        <button className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white py-4 text-[11px] font-black text-charcoal transition-all hover:bg-blue-electric/5 shadow-xl shadow-black/10 active:scale-95 group/btn uppercase tracking-widest">
          <ShoppingCart size={16} strokeWidth={2.5} className="group-hover/btn:translate-x-0.5 transition-transform" />
          Buy Extra Pack
        </button>
        <Link 
          to="/dashboard/billing/plans"
          className="w-full flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-4 text-[11px] font-black text-white transition-all hover:bg-white/10 hover:border-white/20 backdrop-blur-md active:scale-95 uppercase tracking-widest"
        >
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
};

export default UpsellCard;
