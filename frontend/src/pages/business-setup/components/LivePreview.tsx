import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { Mic, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="w-full flex flex-col h-full group">
      {/* Main Preview Card */}
      <div className="relative bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 flex flex-col flex-1 overflow-hidden transition-all duration-500 group-hover:border-indigo-200/50">
        
        {/* Decorative Top Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient shrink-0"></div>

        {/* AI Identity Header */}
        <div className="flex items-center gap-4 p-4 border-b border-slate-50 bg-slate-50/30 shrink-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Mic className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-slate-900 text-[13px] font-bold truncate tracking-tight">{businessName}</h3>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">AI Voice Agent</span>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <span className="text-[10px] text-slate-400 font-medium italic">Processing...</span>
            </div>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gradient-to-b from-white to-slate-50/30 scrollbar-hide">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-700`}>
              {msg.role === 'ai' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                </div>
              )}
              <div className={`max-w-[85%] text-[12px] font-medium leading-relaxed px-4 py-3 shadow-sm ${
                msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          <div className="flex items-center gap-2 pt-2">
            <div className="flex gap-1 px-3 py-2 bg-slate-100 rounded-full">
              <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System listening</span>
          </div>
        </div>

        {/* Interaction Footer - Decorative */}
        <div className="p-3 bg-slate-50/50 border-t border-slate-50 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 text-slate-300">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Customer response preview...</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
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
