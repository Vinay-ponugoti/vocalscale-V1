import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { Mic, Sparkles, CheckCircle2, Clock, Phone } from 'lucide-react';

export const LivePreview = () => {
  const { state } = useBusinessSetup();
  const businessName = state.data.business.business_name || "Your Business";

  return (
    <div className="w-full flex flex-col gap-5 lg:h-[calc(100vh-14rem)] lg:sticky lg:top-8 animate-in slide-in-from-right-8 duration-700">

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30 overflow-hidden">

        {/* Title */}
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Mic size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">AI Voice Preview</h2>
              <p className="text-[10px] text-slate-400 font-semibold">What your callers will hear</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Active</span>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 space-y-5">

          {/* Greeting Preview */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Greeting</span>
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              "Hi, thanks for calling <span className="text-indigo-600 font-bold">{businessName}</span>. How can I assist you today?"
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Phone size={12} className="text-slate-400" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Calls Handled</span>
              </div>
              <p className="text-lg font-black text-slate-800">24/7</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={12} className="text-slate-400" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Avg Response</span>
              </div>
              <p className="text-lg font-black text-slate-800">&lt;1s</p>
            </div>
          </div>

        </div>

        {/* Footer Tip */}
        <div className="px-5 py-4 bg-indigo-50 border-t border-indigo-100">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-indigo-700 leading-relaxed">
              Your AI agent updates in real-time as you configure your business details.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
