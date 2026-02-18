import React from 'react';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { Mic, Sparkles, Activity, Clock, Phone, Signal, Wifi } from 'lucide-react';

export const LivePreview = () => {
  const { state } = useBusinessSetup();
  const businessName = state.data.business.business_name || "Your Business";

  const [pulseBars, setPulseBars] = React.useState<Array<{ id: number, height: string, duration: string, opacity: number }>>([]);

  React.useEffect(() => {
    setPulseBars(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      height: Math.random() > 0.5 ? '24px' : '12px',
      duration: `${0.8 + Math.random() * 0.5}s`,
      opacity: 0.6 + Math.random() * 0.4
    })));
  }, []);

  return (
    <div className="w-full lg:sticky lg:top-8 animate-in fade-in slide-in-from-right-4 duration-700">

      {/* Live Status Card */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">

        {/* Header - Dark & Technical */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Online</span>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <Signal size={12} className="text-slate-400" />
            <Wifi size={12} className="text-slate-400" />
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="p-8 relative">
          {/* Background Ambient Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

          {/* Central Identity */}
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 ring-4 ring-slate-800">
              <Mic className="text-white w-7 h-7" />
            </div>
            <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-white">{businessName}</h3>
            <p className="text-sm font-medium leading-none text-indigo-300 mt-1">AI Voice Assistant • v1.02</p>
          </div>

          {/* Audio Waveform Visualization */}
          <div className="relative z-10 h-16 flex items-center justify-center gap-1.5 mb-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
              {pulseBars.map((bar) => (
                <div
                  key={bar.id}
                  className="w-1.5 bg-indigo-400/80 rounded-full animate-pulse"
                  style={{
                    height: bar.height,
                    animationDuration: bar.duration,
                    opacity: bar.opacity
                  }}
                />
              ))}
            </div>
          </div>

          {/* Live Transcript Bubble */}
          <div className="relative z-10 bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Greeting Logic</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-light">
              "Hi, thanks for calling <span className="text-indigo-400 font-medium">{businessName}</span>. How can I assist you today?"
            </p>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="grid grid-cols-2 border-t border-slate-800 bg-slate-900/50">
          <div className="p-4 border-r border-slate-800 flex items-center gap-3">
            <Clock className="text-slate-500 w-4 h-4" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Latency</div>
              <div className="text-white font-mono text-sm">~800ms</div>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <Activity className="text-emerald-500 w-4 h-4" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</div>
              <div className="text-white font-mono text-sm">Active</div>
            </div>
          </div>
        </div>

      </div>

      {/* Helper Card */}
      <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 h-fit">
          <Phone size={16} />
        </div>
        <div>
          <h4 className="scroll-m-20 text-sm font-semibold tracking-tight text-slate-900">Test Your Setup</h4>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Dial your assigned number to hear this configuration live in production.
          </p>
        </div>
      </div>

    </div>
  );
};
