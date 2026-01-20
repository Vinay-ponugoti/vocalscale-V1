import { motion } from 'framer-motion';

export function Highlights() {
    const items = [
        {
            title: 'Instant Setup',
            subtitle: 'Ready in 5 minutes'
        },
        {
            title: 'Human-Like',
            subtitle: '99% Accuracy'
        },
        {
            title: 'Always On',
            subtitle: '24/7/365 Coverage'
        }
    ];

    return (
        <div className="w-full bg-slate-950 py-12 md:py-20 relative overflow-hidden border-y border-white/5">
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="flex flex-col items-center justify-center text-center space-y-2 group"
                        >
                            <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-[0.3em] transition-colors group-hover:text-blue-400">
                                {item.title}
                            </h3>
                            <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">
                                {item.subtitle}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
