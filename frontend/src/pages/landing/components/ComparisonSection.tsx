import React from 'react';
import { Player } from '@remotion/player';
import { ComparisonComposition } from '../../../remotion/ComparisonComposition';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';

export const ComparisonSection = () => {
    return (
        <section className="relative py-24 md:py-32 bg-slate-900 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        The VocalScale Edge
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
                        Compare the <span className="text-blue-500">Difference</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl font-medium">
                        See how our AI Phone Agent transforms your business operations from chaotic missed opportunities to automated revenue generation.
                    </p>
                </div>

                {/* Video Player Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative group"
                >
                    {/* Decorative frame */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />

                    <div className="relative bg-black rounded-[28px] overflow-hidden shadow-2xl border border-white/10 aspect-video">
                        <Player
                            component={ComparisonComposition}
                            durationInFrames={180}
                            compositionWidth={1280}
                            compositionHeight={720}
                            fps={30}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            controls
                            autoPlay
                            loop
                        />
                    </div>

                    {/* Floating UI Elements */}
                    <div className="absolute -bottom-6 -right-6 hidden lg:flex bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <Play size={18} fill="currentColor" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white uppercase tracking-wider">Live Demo</div>
                                <div className="text-[10px] font-bold text-slate-400">Cinematic Visualization</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Comparison Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24">
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-rose-500 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-8 h-px bg-rose-500/30" />
                            Without VocalScale
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "60% of business calls go unanswered.",
                                "Frustrated customers hang up after 3 rings.",
                                "Lost appointments and revenue leakage.",
                                "Manpower wasted on basic triage."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-400 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-8 h-px bg-emerald-500/30" />
                            With VocalScale
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "100% answer rate, zero wait time.",
                                "Intelligent booking and lead capture.",
                                "24/7 availability for your clients.",
                                "Seamless CRM & Calendar integration."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-200 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
