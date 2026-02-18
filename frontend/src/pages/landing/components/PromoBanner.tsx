import { useState, useEffect, useCallback, memo } from 'react';
import { Check, Copy, Sparkles, Clock } from 'lucide-react';

// Helper component for the copyable code badge - no framer-motion needed
const CopyableCode = memo(({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 mx-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors align-middle group"
            title={`Copy ${code}`}
        >
            <span className="font-mono font-bold text-yellow-300">{code}</span>
            <span className="w-3.5 h-3.5 flex items-center justify-center">
                {copied ? (
                    <Check size={10} className="text-emerald-400" />
                ) : (
                    <Copy size={10} className="text-white/70 group-hover:text-white" />
                )}
            </span>
        </button>
    );
});

// Single countdown string shared across all marquee copies
const useCountdown = () => {
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const targetDate = new Date('2026-02-23T23:59:59');

        const update = () => {
            const diff = +targetDate - +new Date();
            if (diff > 0) {
                const d = Math.floor(diff / 86400000);
                const h = String(Math.floor((diff / 3600000) % 24)).padStart(2, '0');
                const m = String(Math.floor((diff / 60000) % 60)).padStart(2, '0');
                const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
                setTimeStr(`${d}d:${h}h:${m}m:${s}s`);
            } else {
                setTimeStr('0d:00h:00m:00s');
            }
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);

    return timeStr;
};

const MarqueeItem = memo(({ timeStr }: { timeStr: string }) => (
    <span className="flex items-center gap-2">
        <Sparkles size={12} className="text-yellow-400 fill-yellow-400" />
        <span>
            Get <span className="text-yellow-300 font-bold">30% OFF</span> when you pay for 3 months with code
            <CopyableCode code="WELCOME30" />
            <span className="text-white/60 mx-1">-</span>
            Ends in <span className="inline-flex items-center gap-1 font-mono text-yellow-300 ml-1"><Clock size={12} className="mr-1" />{timeStr}</span>
        </span>
    </span>
));

export const PromoBanner = () => {
    const timeStr = useCountdown();

    return (
        <div className="w-full bg-slate-900 text-white text-[10px] md:text-xs font-medium h-9 flex items-center overflow-hidden relative z-[110] border-b border-white/5">
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-slate-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-slate-900 to-transparent z-10" />

            <div className="flex whitespace-nowrap group hover:[animation-play-state:paused] w-full">
                <div className="animate-marquee flex items-center gap-12 px-4 shadow-sm">
                    {[0, 1, 2, 3].map(i => (
                        <span key={i} className="flex items-center gap-12">
                            <MarqueeItem timeStr={timeStr} />
                            {i < 3 && <span className="text-white/20">|</span>}
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                    min-width: 200%;
                }
            `}</style>
        </div>
    );
};
