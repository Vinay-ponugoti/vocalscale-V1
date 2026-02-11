import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AISummaryProps {
  summary?: string;
}

const AISummary: React.FC<AISummaryProps> = ({ summary }) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [displayedText, setDisplayedText] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const content = summary && summary.length > 10 
    ? summary 
    : "Unable to generate summary from this conversation transcript. The call may have been too short or no audio was recorded.";

  const handleGenerate = () => {
    if (hasGenerated) return;
    setStatus('generating');
    setTimeout(() => {
      setStatus('completed');
      setHasGenerated(true);
    }, 1500);
  };

  useEffect(() => {
    setStatus('idle');
    setDisplayedText('');
    setHasGenerated(false);
  }, [summary]);

  useEffect(() => {
    if (status === 'completed') {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(content.slice(0, index));
        index++;
        if (index > content.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [status, content]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!hasGenerated && status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group ring-1 ring-slate-900/5"
            onClick={handleGenerate}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-200 via-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors shadow-sm ring-2 ring-indigo-500/20">
                <Sparkles size={22} className="text-white drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Generate AI Summary</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Click to analyze conversation transcript with AI</p>
              </div>
            </div>
          </motion.div>
        )}

        {!hasGenerated && status === 'generating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5"
          >
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ 
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-200 via-indigo-400 to-indigo-600 flex items-center justify-center ring-2 ring-indigo-500/20 shadow-lg"
                >
                  <Sparkles size={28} className="text-white drop-shadow-lg" />
                </motion.div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-3 w-1/3 bg-indigo-100 rounded-full animate-pulse" />
                <div className="h-2 w-full bg-indigo-50 rounded-full animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}

        {(hasGenerated || status === 'completed') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-indigo-50/20 border border-indigo-100/40 rounded-2xl p-7 shadow-sm ring-1 ring-indigo-500/10"
          >
            <div className="flex items-start gap-5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-indigo-200 ring-1 ring-indigo-500/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1 text-slate-700 text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                {displayedText}
                {displayedText.length < content.length && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-middle"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISummary;