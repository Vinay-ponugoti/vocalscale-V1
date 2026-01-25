import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { PhoneMissed, Zap, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ROILiveTicker = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(4821);

    useEffect(() => {
        // Simulate missed calls increasing every few seconds
        const interval = setInterval(() => {
            setCount(prev => prev + Math.floor(Math.random() * 3) + 1);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    // Framer Motion spring for smooth number transitions
    const springCount = useSpring(4821, { stiffness: 50, damping: 20 });
    const displayCount = useTransform(springCount, (latest) => Math.floor(latest).toLocaleString());

    useEffect(() => {
        springCount.set(count);
    }, [count, springCount]);

    return (
        <section className="relative py-24 md:py-32 overflow-hidden bg-slate-950">
            {/* Aggressive Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />


            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="flex flex-col items-center text-center space-y-8">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        Critical Industry Insight
                    </motion.div>

                    {/* Large Counter Content */}
                    <div className="space-y-4">
                        <h2 className="text-slate-400 text-sm md:text-base font-bold uppercase tracking-[0.2em]">
                            While you were reading this page
                        </h2>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                            <motion.span
                                className="text-6xl md:text-9xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                            >
                                {displayCount}
                            </motion.span>

                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <p className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">
                                    Potential customers <br className="hidden md:block" />
                                    <span className="text-rose-500 underline decoration-rose-500/30 underline-offset-8">just hung up</span>
                                </p>
                                <div className="flex items-center gap-2 text-rose-500/60 mt-2 font-bold text-xs uppercase tracking-widest">
                                    <PhoneMissed size={14} />
                                    Calls missed globally
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subheading & Action */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl backdrop-blur-sm relative group"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                        <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed relative z-10">
                            Every missed call is a missed appointment, a lost sale, and an frustrated client.
                            <span className="text-white font-black px-1">VocalScale would have answered 100% of them.</span>
                            INSTANTLY.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/signup')}
                            className="mt-8 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 mx-auto shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all"
                        >
                            Start Saving Revenue
                            <Zap size={18} fill="currentColor" />
                        </motion.button>
                    </motion.div>

                    {/* Proof Stat */}
                    <div className="flex items-center gap-6 pt-8">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-white">100%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Answer Rate</span>
                        </div>
                        <div className="w-px h-8 bg-slate-800" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-white">0s</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Wait Time</span>
                        </div>
                        <div className="w-px h-8 bg-slate-800" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-white">24/7</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Availability</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
