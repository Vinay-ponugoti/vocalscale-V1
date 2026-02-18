import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Mic, Upload, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Method() {
  const navigate = useNavigate();

  return (
    <DashboardLayout fullWidth>
      <div className="w-full p-4 md:p-8 2xl:p-12 space-y-8 2xl:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full">
        <div className="w-full h-full flex flex-col">
          <ProgressBar step={1} totalSteps={4} title="Method Selection" progress={25} />

          <div className="flex-1 flex flex-col justify-center min-h-0 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-charcoal mb-3 tracking-tight">How would you like to create your voice?</h1>
              <p className="text-charcoal-light text-lg max-w-2xl mx-auto leading-relaxed">
                Choose the method that works best for you. Both methods produce high-quality AI clones.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 h-[420px]">
              {/* Card 1: Record */}
              <div className="group bg-white border border-white-light rounded-3xl p-8 hover:border-blue-electric hover:shadow-xl hover:shadow-blue-electric/20 transition-all duration-300 relative flex flex-col h-full cursor-default">
                <span className="absolute top-6 right-6 bg-blue-electric/10 text-blue-electric px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border border-blue-electric/20">
                  Fastest
                </span>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-electric/10 rounded-2xl flex items-center justify-center text-blue-electric group-hover:scale-110 transition-transform duration-300">
                    <Mic size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-charcoal">Record Now</h3>
                    <p className="text-sm text-charcoal-light">Use your microphone</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8 flex-1 overflow-y-auto">
                  <p className="text-[11px] font-bold text-charcoal-light uppercase tracking-wider mb-2">Includes</p>
                  {[
                    "~5 minutes to complete",
                    "Guided script reading",
                    "Best for direct quality matching"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-charcoal-medium text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/dashboard/voice-model/record')}
                  className="w-full py-3.5 bg-blue-electric text-white rounded-xl font-bold hover:bg-blue-dark transition-all shadow-lg hover:shadow-xl transform active:scale-95 text-base flex items-center justify-center gap-2"
                >
                  <Mic size={18} /> Start Recording
                </button>
              </div>

              {/* Card 2: Upload */}
              <div className="group bg-white border border-white-light rounded-3xl p-8 hover:border-blue-electric hover:shadow-xl hover:shadow-blue-electric/20 transition-all duration-300 relative flex flex-col h-full cursor-default">
                <span className="absolute top-6 right-6 bg-white-light text-charcoal-medium px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white-light">
                  Flexible
                </span>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-white-light rounded-2xl flex items-center justify-center text-charcoal-medium group-hover:scale-110 transition-transform duration-300">
                    <Upload size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-charcoal">Upload Audio</h3>
                    <p className="text-sm text-charcoal-light">Use existing files</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1 overflow-y-auto">
                  <p className="text-[11px] font-bold text-charcoal-light uppercase tracking-wider mb-2">Requirements</p>
                  {[
                    "Minimum 2 minutes of speech",
                    "No background music/noise",
                    "Supports MP3, WAV, M4A"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="bg-charcoal-light rounded-full p-0.5"><CheckCircle2 size={12} className="text-white" /></div>
                      <span className="text-charcoal-medium text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/dashboard/voice-model/upload')}
                  className="w-full py-3.5 bg-white border-2 border-white-light text-charcoal-medium rounded-xl font-bold hover:bg-white-light hover:border-charcoal-light transition-all transform active:scale-95 text-base flex items-center justify-center gap-2"
                >
                  <Upload size={18} /> Upload Files
                </button>
              </div>
            </div>
            
            <div className="mt-8 text-center">
               <div 
                className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium cursor-pointer hover:text-indigo-600 transition-colors"
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
