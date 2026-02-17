import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Mic, Zap, Users, Globe } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-slate-50 selection:bg-blue-200 selection:text-blue-900 flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/50 blur-[120px] rounded-full mix-blend-multiply"
                />
                <motion.div
                    animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1.1, 1, 1.1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 blur-[120px] rounded-full mix-blend-multiply"
                />
            </div>

            <Header />

            <main className="flex-1 relative z-10 pt-40 pb-24 px-6 md:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="text-center mb-20"
                    >
                        <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
                            About VocalScale
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                            Giving Every Business a<br />
                            <span className="text-blue-600">Voice That Never Sleeps</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                            VocalScale was built with one goal in mind — making enterprise-grade AI voice technology
                            accessible to every small business, not just the Fortune 500.
                        </p>
                    </motion.div>

                    {/* Mission */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 md:p-14 mb-10"
                    >
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Our Mission</h2>
                        <p className="text-2xl md:text-3xl font-black text-slate-900 leading-snug mb-6">
                            Answering every call, booking every appointment, and delighting every customer — automatically.
                        </p>
                        <p className="text-slate-500 text-base leading-relaxed font-medium">
                            Missed calls mean lost revenue. We built VocalScale so your business never misses an opportunity,
                            whether it's 2 PM or 2 AM. Our AI receptionist handles calls with natural, human-like conversations
                            powered by the latest voice AI — so your customers always feel heard.
                        </p>
                    </motion.div>

                    {/* Values */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
                    >
                        {[
                            {
                                icon: Mic,
                                title: 'Human-Quality Voice',
                                description:
                                    'We use Deepgram Aura-2 with 40+ high-fidelity voices so your AI receptionist sounds like a real person — warm, clear, and professional.',
                            },
                            {
                                icon: Zap,
                                title: 'Built for Speed',
                                description:
                                    'Ultra-low latency call handling means no awkward pauses. Conversations flow naturally, just like talking to a real team member.',
                            },
                            {
                                icon: Users,
                                title: 'Small Business First',
                                description:
                                    'We designed VocalScale specifically for independent businesses — salons, clinics, restaurants, agencies — not enterprise call centers.',
                            },
                            {
                                icon: Globe,
                                title: 'Always On',
                                description:
                                    '24/7 availability with smart calendar integration, appointment booking, and CRM sync so nothing ever falls through the cracks.',
                            },
                        ].map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Icon size={20} className="text-blue-600" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-base font-black text-slate-900">{title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
                        className="bg-slate-900 rounded-3xl p-10 md:p-14 text-center"
                    >
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                            Ready to scale your voice?
                        </h2>
                        <p className="text-slate-400 font-medium mb-8 max-w-lg mx-auto">
                            Join businesses already using VocalScale to handle calls, book appointments, and grow — on autopilot.
                        </p>
                        <a
                            href="/signup"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] px-8 py-3.5 rounded-full transition-all active:scale-95 shadow-lg shadow-blue-500/25"
                        >
                            Get Started Free
                        </a>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
