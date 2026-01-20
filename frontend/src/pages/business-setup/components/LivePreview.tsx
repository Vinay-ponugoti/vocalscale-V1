import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { Mic, CheckCircle2, Phone, GripVertical, Wifi, Battery, Signal } from 'lucide-react';

export const LivePreview = () => {
  const { state } = useBusinessSetup();
  const businessName = state.data.business.business_name || "Your Business";

  return (
    <div className="w-full flex flex-col gap-6 lg:h-[calc(100vh-14rem)] lg:sticky lg:top-8 animate-in slide-in-from-right-8 duration-700">

      {/* Device Mockup Container */}
      <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">

        {/* Notch & Status Bar */}
        <div className="absolute top-0 w-full h-8 bg-gray-800 z-20 flex items-center justify-between px-6 pt-2">
          <span className="text-[10px] font-medium text-white">9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal size={10} className="text-white" />
            <Wifi size={10} className="text-white" />
            <Battery size={10} className="text-white" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 bg-slate-900 relative overflow-hidden flex flex-col">

          {/* Background Gradient/Mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900 z-0" />

          {/* Call Info Header */}
          <div className="mt-16 text-center z-10 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-pulse">
              <span className="text-2xl font-bold text-white">{businessName.charAt(0).toUpperCase()}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1">{businessName}</h3>
            <p className="text-indigo-200 text-xs mt-1 font-medium">AI Assistant</p>
            <p className="text-slate-400 text-[10px] mt-2">00:14</p>
          </div>

          {/* Voice Visualizer (CSS Animation) */}
          <div className="flex-1 flex items-center justify-center z-10 gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-indigo-400 rounded-full animate-voice-wave"
                style={{
                  height: '20px',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>

          {/* Transcript Bubble */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl mx-4 mb-8 p-4 z-10 relative">
            <div className="absolute -top-3 left-4 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              AI Speaking
            </div>
            <p className="text-sm font-medium text-slate-100 leading-relaxed text-center">
              "Hi, thanks for calling <span className="text-indigo-300">{businessName}</span>. How can I assist you today?"
            </p>
          </div>

          {/* Call Controls Mockup */}
          <div className="pb-12 px-8 flex items-center justify-between z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Mic size={20} className="text-white" />
            </div>
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Phone size={28} className="text-white fill-white rotate-[135deg]" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <GripVertical size={20} className="text-white" />
            </div>
          </div>

        </div>

        {/* Device Chin */}
        <div className="h-1 bg-gray-800 w-full absolute bottom-0 z-20"></div>
        <div className="h-1 w-1/3 bg-white/20 rounded-full absolute bottom-2 left-1/2 -translate-x-1/2 z-30"></div>
      </div>

      {/* Info Card below phone */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3 max-w-[300px] mx-auto">
        <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-slate-900">Real-time Preview</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Updates instantly as you modify your business identity and settings.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes voice-wave {
            0%, 100% { height: 10px; opacity: 0.5; }
            50% { height: 40px; opacity: 1; }
        }
        .animate-voice-wave {
            animation: voice-wave 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

