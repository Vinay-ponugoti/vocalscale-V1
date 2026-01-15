import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { Mic, MessageSquare, ShieldCheck, Sparkles, Eye, Phone, Zap } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export const LivePreview = () => {
  const { state } = useBusinessSetup();

  const businessName = state.data.business.business_name || "Your Business";

  const messages: Message[] = [
    { role: 'ai', text: `Hi, thanks for calling ${businessName}. How can I assist you today?` }
  ];

  return (
    <div className="w-full flex flex-col gap-6 lg:h-[calc(100vh-14rem)] lg:sticky lg:top-8 animate-in slide-in-from-right-8 duration-700">

      {/* Status Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <Eye size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">Live Preview</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time AI Simulation</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50/50 px-3 py-1.5 rounded-full border border-emerald-100/50">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Agent Live</span>
          </div>
        </div>

        {/* Device Container */}
        <div className="p-4 bg-slate-50/30">
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border-[6px] border-slate-900 w-full max-w-[320px] mx-auto overflow-hidden aspect-[9/18.5] flex flex-col group/phone">

            {/* Phone Top - Notch */}
            <div className="h-6 w-full bg-slate-900 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-3 bg-slate-800 rounded-full"></div>
            </div>

            {/* AI Identity Header */}
            <div className="flex flex-col items-center gap-2 p-6 pb-4 bg-white shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-300 ring-4 ring-indigo-50">
                  <Mic className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm ring-2 ring-emerald-50"></div>
              </div>
              <div className="text-center mt-2">
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-slate-900 text-base font-black tracking-tight truncate max-w-[180px]">{businessName}</h3>
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Voice Portal Active</span>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-slate-50/50 scrollbar-hide flex flex-col">
              <div className="mt-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white text-slate-700 text-[11px] font-bold leading-relaxed px-4 py-3 shadow-md shadow-slate-200/50 rounded-2xl rounded-tl-none border border-slate-100">
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                <div className="flex items-center gap-2 py-2">
                  <div className="flex gap-1 px-3 py-2 bg-indigo-50/50 rounded-full">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">AI Listening</span>
                </div>
              </div>
            </div>

            {/* Interaction Footer - Decorative */}
            <div className="p-6 bg-white border-t border-slate-50 shrink-0">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Customer Input...</span>
              </div>
              <div className="mt-6 flex justify-center">
                <div className="w-24 h-1 bg-slate-900/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Card */}
        <div className="p-5 bg-indigo-600 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <Mic className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-1">Configuration Tip</h4>
              <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">Changes you make to your business name or hours sync with the AI agent immediately.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
