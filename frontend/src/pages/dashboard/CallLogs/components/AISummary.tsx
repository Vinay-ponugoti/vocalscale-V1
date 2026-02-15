import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AISummaryProps {
  summary?: string;
}


// Persist summary per conversation using a unique key
const getSummaryKey = (summary: string | undefined) => {
  if (!summary) return 'ai_summary_default';
  // Use a hash of the summary as key (or a substring if unique)
  return 'ai_summary_' + btoa(unescape(encodeURIComponent(summary.slice(0, 32))));
};

const AISummary: React.FC<AISummaryProps> = ({ summary }) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [displayedText, setDisplayedText] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const content = summary && summary.length > 10
    ? summary
    : "Unable to generate summary from this conversation transcript. The call may have been too short or no audio was recorded.";

  // On mount, check sessionStorage for persisted summary for this conversation
  useEffect(() => {
    const key = getSummaryKey(summary);
    const persisted = sessionStorage.getItem(key);
    if (persisted) {
      // eslint-disable-next-line
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
      const key = getSummaryKey(summary);
      sessionStorage.setItem(key, content);
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-end"
          >
            <div className="max-w-2xl w-full">
              <div className="flex flex-row justify-end">
                <div className="bg-gradient-to-br from-primary/90 to-primary text-white px-5 py-4 rounded-2xl rounded-br-none shadow-md text-[15px] leading-relaxed font-medium whitespace-pre-line animate-in fade-in duration-700">
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