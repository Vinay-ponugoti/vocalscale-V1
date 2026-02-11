import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AISummaryProps {
  summary?: string;
}


// Persist summary state in sessionStorage to survive tab switches
const SUMMARY_KEY = 'ai_summary_persisted';
const AISummary: React.FC<AISummaryProps> = ({ summary }) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [displayedText, setDisplayedText] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const content = summary && summary.length > 10
    ? summary
    : "Unable to generate summary from this conversation transcript. The call may have been too short or no audio was recorded.";

  // On mount, check sessionStorage for persisted summary
  useEffect(() => {
    const persisted = sessionStorage.getItem(SUMMARY_KEY);
    if (persisted) {
      setDisplayedText(persisted);
      setStatus('completed');
      setHasGenerated(true);
    } else {
      setStatus('idle');
      setDisplayedText('');
      setHasGenerated(false);
    }
  }, [summary]);

  const handleGenerate = () => {
    if (hasGenerated) return;
    setStatus('generating');
    setTimeout(() => {
      setStatus('completed');
      setHasGenerated(true);
      setDisplayedText(content);
      sessionStorage.setItem(SUMMARY_KEY, content);
    }, 1200);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!hasGenerated && status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-background border border-border rounded-xl p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
            onClick={handleGenerate}
          >
            <div className="flex flex-col gap-2 items-center justify-center">
              <span className="text-[13px] font-semibold text-muted-foreground">Generate AI Summary</span>
              <span className="text-[11px] text-muted-foreground/70">Click to analyze conversation transcript with AI</span>
            </div>
          </motion.div>
        )}

        {!hasGenerated && status === 'generating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background border border-border rounded-xl p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 animate-spin flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary/40" />
              </div>
              <span className="text-[13px] font-semibold text-primary">Analyzing...</span>
            </div>
          </motion.div>
        )}

        {(hasGenerated || status === 'completed') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-border rounded-xl p-6 shadow-sm"
          >
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex flex-col gap-2">
                <div className="rounded-lg bg-muted/40 px-4 py-3 text-[15px] leading-relaxed font-medium text-foreground whitespace-pre-line shadow-sm border border-muted/30">
                  {displayedText}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISummary;