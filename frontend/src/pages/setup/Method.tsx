import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Mic, Upload, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Method() {
  const navigate = useNavigate();

  return (
    <DashboardLayout fullWidth>
      <div className="h-full w-full overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="w-full h-full flex flex-col">
          <ProgressBar step={1} totalSteps={4} title="Method Selection" progress={25} />

          <div className="flex-1 flex flex-col justify-center min-h-0 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 mb-3">How would you like to create your voice?</h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                Choose the method that works best for you. Both methods produce high-quality AI clones.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 h-[420px]">
              {/* Card 1: Record */}
              <div className="group bg-white border border-slate-200 rounded-xl p-8 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 relative flex flex-col h-full cursor-default">
                <span className="absolute top-6 right-6 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border border-blue-100">
                  Fastest
                </span>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Mic size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Record Now</h3>
                    <p className="text-sm text-slate-500">Use your microphone</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8 flex-1 overflow-y-auto">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Includes</p>
                  {[
                    "~5 minutes to complete",
                    "Guided script reading",
                    "Best for direct quality matching"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/dashboard/voice-model/record')}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-dark transition-all shadow-lg hover:shadow-xl transform active:scale-95 text-base flex items-center justify-center gap-2"
                >
                  <Mic size={18} /> Start Recording
                </button>
              </div>

              {/* Card 2: Upload */}
              <div className="group bg-white border border-slate-200 rounded-xl p-8 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 relative flex flex-col h-full cursor-default">
                <span className="absolute top-6 right-6 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border border-slate-200">
                  Flexible
                </span>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Upload Audio</h3>
                    <p className="text-sm text-slate-500">Use existing files</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1 overflow-y-auto">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Requirements</p>
                  {[
                    "Minimum 2 minutes of speech",
                    "No background music/noise",
                    "Supports MP3, WAV, M4A"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="bg-slate-400 rounded-full p-0.5"><CheckCircle2 size={12} className="text-white" /></div>
                      <span className="text-slate-700 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/dashboard/voice-model/upload')}
                  className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 hover:border-slate-400 transition-all transform active:scale-95 text-base flex items-center justify-center gap-2"
                >
                  <Upload size={18} /> Upload Files
                </button>
              </div>
            </div>
            
            <div className="mt-8 text-center">
               <div 
                className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => navigate('/dashboard/settings')}
              >
                <ArrowLeft size={16} /> Back to Settings
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
