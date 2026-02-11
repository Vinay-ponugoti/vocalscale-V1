import { motion } from 'framer-motion';
import { Terminal, Copy, Check, Sparkles, Globe, BarChart3, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Agent logos (simulated with text/initials for now)
const AGENTS = [
    'AMP', 'Antigravity', 'Claude Code', 'ClawdBot', 'Cline',
    'Codex', 'Cursor', 'Droid', 'Gemini', 'GitHub Copilot',
    'Goose', 'Kilo', 'Kiro CLI', 'OpenCode'
];

const SKILLS_DATA = [
    { rank: 1, name: 'find-skills', publisher: 'vercel-labs/skills', installs: 'Top' },
    { rank: 2, name: 'browser-tools', publisher: 'browser-actions/core', installs: 'High' },
    { rank: 3, name: 'sql-client', publisher: 'database/postgres', installs: 'High' },
];

export function SkillsSection() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('npx skills update');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative py-24 md:py-32 overflow-hidden bg-[#0A0A0A] text-white selection:bg-purple-500/30">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-40 animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow delay-75" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header Content */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8 shadow-lg shadow-purple-500/10"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">Skills Launch Party — Feb 17 SF</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
                    >
                        The Open Agent <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">Skills Ecosystem</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
                    >
                        Skills are reusable capabilities for AI agents. Install them with a single command to enhance your agents with access to procedural knowledge.
                    </motion.p>

                    {/* Terminal Command */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="group relative inline-flex items-center gap-4 p-2 pr-2 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl hover:border-white/20 transition-all max-w-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative flex items-center gap-3 px-6 py-4 bg-white/5 rounded-xl font-mono text-sm md:text-base text-emerald-400 min-w-[200px]">
                            <Terminal className="w-5 h-5 text-emerald-500/50" />
                            <span>$ npx skills update</span>
                        </div>

                        <button
                            onClick={handleCopy}
                            className="relative p-4 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </motion.div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                    {/* Left Column: Supported Agents */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-7 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md relative overflow-hidden group hover:bg-white/[0.07] transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                                    <Globe className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight text-white mb-1">Universal Compatibility</h3>
                                    <p className="text-white/50 text-sm font-medium">Available for all major AI agents and environments</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                {AGENTS.map((agent, i) => (
                                    <div
                                        key={agent}
                                        className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-default group/item hover:border-white/10 hover:-translate-y-0.5"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 group-hover/item:scale-150 transition-transform" />
                                        <span className="text-sm font-bold text-white/80 group-hover/item:text-white transition-colors">{agent}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Leaderboard & Stats */}
                    <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">

                        {/* Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-purple-900/20 group"
                        >
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-b from-white/20 to-transparent rotate-45 blur-3xl group-hover:rotate-90 transition-transform duration-1000" />

                            <Sparkles className="absolute top-6 right-6 text-white/30 w-16 h-16 rotate-12 blur-[1px]" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <div className="text-xs font-bold text-white/80 uppercase tracking-widest">Live Installs</div>
                                </div>

                                <div className="text-6xl md:text-7xl font-black mb-6 tracking-tighter tabular-nums">
                                    54,108
                                </div>

                                <div className="inline-flex items-center gap-2 text-sm font-bold bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span>+12% this week</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Leaderboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm relative overflow-hidden group hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <h3 className="font-bold text-xl tracking-tight">Trending Skills</h3>
                                </div>
                                <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-white/50 border border-white/5">24H</span>
                            </div>

                            <div className="space-y-4">
                                {SKILLS_DATA.map((skill, i) => (
                                    <div key={skill.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group/row">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-mono font-bold text-white/30 w-4">#{skill.rank}</span>
                                            <div>
                                                <div className="text-base font-bold text-white group-hover/row:text-purple-300 transition-colors">{skill.name}</div>
                                                <div className="text-xs font-medium text-white/40">{skill.publisher}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="hidden sm:block text-xs font-medium text-white/30 mr-2">{skill.installs} Activity</div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/20 hover:text-white">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
