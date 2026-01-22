import React, { useState } from 'react';
import { ArrowRight, Sparkles, Send, CheckCircle2, Loader2, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export function FinalCTA() {
  const [isBooking, setIsBooking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'warning');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    showToast('Demo request sent successfully!', 'success');
  };

  return (
    <section id="book-demo" className="py-20 md:py-32 px-6 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative p-10 md:p-24 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-white/5"
        >
          {/* Background utilities */}
          <div className="absolute inset-0 bg-grid-white/[0.01] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8 md:mb-10 text-slate-300"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready to scale?</span>
            </div>

            <h2
              className="font-black text-4xl sm:text-6xl md:text-7xl text-white mb-8 md:mb-10 tracking-[-0.03em] leading-[1.05]"
            >
              {isSuccess ? (
                <span className="text-emerald-400 italic tracking-tight">You're on the list.</span>
              ) : (
                <>
                  Give your business <br className="hidden sm:block" />
                  <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">the voice it deserves.</span>
                </>
              )}
            </h2>

            <p
              className="text-slate-400 text-lg md:text-xl mb-10 md:mb-14 max-w-xl mx-auto leading-relaxed font-medium"
            >
              {isSuccess
                ? "We've received your request. Our team will reach out within 24 hours to schedule your personalized demo."
                : "Join forward-thinking businesses scaling their front desk with VocalScale's AI."
              }
            </p>

            <div className="flex justify-center min-h-[56px]">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-emerald-400 font-bold"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Talk soon!
                  </motion.div>
                ) : !isBooking ? (
                  <motion.div
                    key="buttons"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full"
                  >
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      <a href="/signup" className="flex items-center gap-2">
                        Get Started Now
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </Button>

                    <Button
                      onClick={() => setIsBooking(true)}
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md font-black text-base active:scale-95 transition-all"
                    >
                      Schedule Demo
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onSubmit={handleSubmit}
                    className="w-full max-w-lg space-y-4"
                  >
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1 group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                          autoFocus
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                        />
                      </div>
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Request"}
                      </Button>
                    </div>

                    <div className="relative group">
                      <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <textarea
                        placeholder="What would you like to achieve with VocalScale?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full min-h-[100px] pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsBooking(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
                    >
                      Nevermind, go back
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}