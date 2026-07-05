import { motion } from 'framer-motion';
import { ClipboardList, PhoneMissed } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ROILiveTicker = () => {
    return (
        <section className="relative py-24 md:py-32 overflow-hidden bg-transparent">
            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
                <div className="flex flex-col items-center text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest shadow-sm"
                    >
                        <PhoneMissed size={13} />
                        The everyday problem
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="text-slate-500 text-sm md:text-base font-bold uppercase tracking-[0.2em]">
                            Calls do not wait for a quiet moment
                        </h2>

                        <p className="mx-auto max-w-4xl text-4xl md:text-6xl font-black text-slate-900 tracking-normal leading-tight">
                            The caller who needs help is often calling while your team is already helping someone else.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl bg-white border border-slate-200 p-8 rounded-2xl relative group shadow-sm"
                    >
                        <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed relative z-10">
                            VocalScale helps answer, collect the right details, and leave a usable summary when your staff cannot pick up.
                        </p>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-block relative z-10"
                        >
                            <Link
                                to="/signup"
                                className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 mx-auto shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 transition-all hover:bg-slate-800 hover:no-underline"
                            >
                                Build your call flow
                                <ClipboardList size={18} />
                            </Link>
                        </motion.div>

                        <div className="flex items-center justify-center gap-6 pt-8 mt-4 border-t border-slate-100">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-slate-900">24/7</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coverage</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-slate-900">Notes</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Captured</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-slate-900">Rules</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Followed</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
