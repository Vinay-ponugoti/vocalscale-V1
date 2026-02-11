import React, { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Loader2, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
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

    try {
      const response = await fetch("https://formsubmit.co/ajax/landing@vocalscale.com", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          message: reason || "No message provided",
          _subject: "New Demo Request from VocalScale Landing Page",
          _template: "table"
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        showToast('Request sent successfully!', 'success');

        // Reset form after 2 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setIsBooking(false);
          setEmail('');
          setReason('');
        }, 2000);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showToast('Failed to send request. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book-demo" className="py-24 md:py-32 px-6 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-12 md:p-24 bg-slate-900 rounded-[3rem] overflow-hidden text-center"
        >
          {/* Background utilities */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/30 blur-[120px] rounded-full mix-blend-screen opacity-50" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen opacity-50" />

          <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/10 rounded-full mb-10 text-white shadow-lg backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Ready to scale?</span>
            </div>

            <h2
              className="font-black text-5xl sm:text-7xl md:text-8xl text-white mb-8 md:mb-12 tracking-tighter leading-[0.9]"
            >
              {isSuccess ? (
                <span className="text-emerald-400">You're all set!</span>
              ) : (
                <>
                  Give your business <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-gradient-x">the voice it deserves.</span>
                </>
              )}
            </h2>

            <p
              className="text-slate-400 text-xl md:text-2xl mb-12 max-w-xl mx-auto leading-relaxed font-medium"
            >
              {isSuccess
                ? "We've received your request. Our team will reach out within 24 hours to schedule your personalized demo."
                : "Join forward-thinking businesses scaling their front desk with VocalScale's AI."
              }
            </p>

            <div className="w-full max-w-lg">

              {isSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex justify-center"
                >
                  <div className="bg-emerald-500/20 text-emerald-400 px-6 py-3 rounded-full font-bold flex items-center gap-3 border border-emerald-500/20 backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6" />
                    Talk soon!
                  </div>
                </motion.div>
              ) : !isBooking ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full">
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto h-16 px-10 rounded-full bg-white text-slate-900 hover:bg-slate-200 font-bold text-lg shadow-xl shadow-white/5 active:scale-95 transition-all"
                  >
                    <Link to="/signup" className="flex items-center gap-2">
                      Get Started Now
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>

                  <Button
                    onClick={() => setIsBooking(true)}
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-16 px-10 rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 font-bold text-lg active:scale-95 transition-all backdrop-blur-sm"
                  >
                    Schedule Demo
                  </Button>
                </div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="w-full space-y-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative group w-full">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                      <input
                        autoFocus
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all font-medium"
                      />
                    </div>

                    <div className="relative group w-full">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                      <textarea
                        placeholder="What would you like to achieve?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full min-h-[100px] pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all font-medium resize-none"
                      />
                    </div>

                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      className="h-14 w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Request"}
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBooking(false)}
                    className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest mt-2"
                  >
                    Nevermind, go back
                  </button>
                </motion.form>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}