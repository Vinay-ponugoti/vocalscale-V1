import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone, TrendingUp, Globe, Check, Play } from 'lucide-react'
import { type Variants, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { Header } from './Header'
import { trackStartDemo } from '@/lib/analytics'

const transitionVariants: { item: Variants } = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

const glowVariants: Variants = {
    initial: { opacity: 0.5, scale: 0.95 },
    animate: {
        opacity: [0.5, 0.8, 0.5],
        scale: [0.95, 1.05, 0.95],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

export function HeroSection() {
    const videoRef = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75
        }
    }, [])

    return (
        <>
            <Header />
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-20 md:pt-32 pb-20 z-10">
                        <div className="mx-auto max-w-7xl px-6 md:px-8">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        to="/signup"
                                        className="hover:bg-blue-50/80 bg-white/80 group mx-auto flex w-fit items-center gap-3 md:gap-4 rounded-full border border-blue-200/60 p-1.5 pl-4 shadow-sm shadow-blue-200/20 transition-all duration-300 backdrop-blur-md hover:border-blue-300">
                                        <span className="text-blue-600 text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                            </span>
                                            New Release
                                        </span>
                                        <span className="block h-4 w-px bg-slate-200"></span>
                                        <span className="text-slate-600 text-[11px] md:text-xs font-medium tracking-wide">
                                            VocalScale 2.0 is live
                                        </span>

                                        <div className="bg-blue-600 group-hover:bg-blue-700 size-6 text-white rounded-full flex items-center justify-center transition-colors shadow-lg shadow-blue-500/30">
                                            <ArrowRight className="size-3" />
                                        </div>
                                    </Link>

                                    <div className="mt-8 md:mt-10 max-w-5xl mx-auto">
                                        <h1 className="text-balance text-5xl sm:text-6xl md:text-7xl font-black tracking-[-0.02em] text-slate-900 leading-[1.05]">
                                            The First AI Voice Agent That Transforms <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Customer Experience</span>
                                        </h1>
                                    </div>

                                    <p className="mx-auto mt-8 max-w-2xl text-balance text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                                        Why settle for basic automation? Equip your business with an AI receptionist that sounds human, thinks intelligently, and works 24/7 to capture every opportunity.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.5,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">

                                    <Button
                                        asChild
                                        size="lg"
                                        className="h-14 rounded-full px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                                        <Link to="/signup">
                                            Get Started Free
                                        </Link>
                                    </Button>

                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="h-14 rounded-full px-8 text-lg font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all w-full sm:w-auto bg-white/50 backdrop-blur-sm">
                                        <a href="#demo" className="flex items-center gap-2">
                                            <Play className="size-4 fill-current" />
                                            Watch Demo
                                        </a>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        {/* Enhanced Video Container */}
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}
                            className="mt-16 md:mt-24 px-6 md:px-8 relative mx-auto max-w-7xl">

                            {/* Glow Effect behind video */}
                            <motion.div
                                variants={glowVariants}
                                initial="initial"
                                animate="animate"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-500/20 blur-[100px] rounded-full -z-10"
                            />

                            <div className="relative rounded-2xl md:rounded-3xl p-2 bg-gradient-to-b from-slate-200/50 to-slate-100/50 backdrop-blur-sm border border-white/60 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
                                <div className="rounded-xl md:rounded-2xl overflow-hidden bg-slate-900 shadow-inner ring-1 ring-black/5 aspect-video relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none z-10" />
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="auto"
                                        width="100%"
                                        height="100%"
                                        crossOrigin="anonymous"
                                        className="w-full h-full object-cover"
                                        poster="https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/poster.jpg"
                                    >
                                        <source src="https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/0126.mov" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>

                            {/* Trust Badges / Social Proof below video */}
                            <div className="mt-16 md:mt-20 pt-10 border-t border-slate-200/60">
                                <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
                                    Trusted by forward-thinking companies
                                </p>
                                <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                    {/* Placeholders for logos - representing the "top company" feel */}
                                    {['TechCorp', 'GlobalScale', 'InnovateAI', 'FutureWorks', 'NextLevel'].map((company) => (
                                        <span key={company} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                                            <div className="size-6 rounded bg-slate-200/50"></div>
                                            {company}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </AnimatedGroup>

                        {/* Existing Key Benefits Grid - Preserved but styled for consistency */}
                        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 md:px-8">
                            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-100/50 transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Phone className="w-7 h-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Availability</h3>
                                <p className="text-slate-600 leading-relaxed">Never miss a customer call with AI that works around the clock, handling inquiries instantly.</p>
                            </div>
                            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-100/50 transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">70% Cost Reduction</h3>
                                <p className="text-slate-600 leading-relaxed">Slash operational costs while improving service quality and response times dramatically.</p>
                            </div>
                            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100/50 transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Globe className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">50+ Languages</h3>
                                <p className="text-slate-600 leading-relaxed">Serve global customers in their native language with near-perfect accent and cultural nuance.</p>
                            </div>
                        </div>

                        {/* Existing Content - Transform Your Customer Service */}
                        <div className="mt-32 max-w-7xl mx-auto px-6 md:px-8">
                            <div className="grid md:grid-cols-2 gap-16 items-center">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                                        Transform Your Customer Service Operations
                                    </h2>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                        Traditional customer service models are expensive, inconsistent, and limited by human constraints.
                                        VocalScale revolutionizes this paradigm by providing AI-powered voice agents that deliver
                                        consistent, professional, and intelligent customer interactions at a fraction of the cost.
                                    </p>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                        Our advanced AI technology understands context, remembers previous interactions, and adapts
                                        responses based on customer history and preferences.
                                    </p>
                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 shrink-0">
                                                <Check className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">Scalable Customer Support</h4>
                                                <p className="text-slate-600">Handle unlimited concurrent calls without additional staffing costs</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 shrink-0">
                                                <Check className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">Consistent Quality</h4>
                                                <p className="text-slate-600">Every interaction maintains professional standards and brand voice</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5 shrink-0">
                                                <Check className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">Instant Response</h4>
                                                <p className="text-slate-600">No hold times or wait periods - customers get immediate assistance</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-slate-200">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Industry Applications</h3>
                                    <div className="space-y-8">
                                        <div className="group">
                                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                Healthcare Practices
                                            </h4>
                                            <p className="text-slate-600 mb-3 pl-4 border-l-2 border-slate-200 group-hover:border-blue-500 transition-colors">Automate appointment scheduling, prescription refills, and patient inquiries while maintaining HIPAA compliance.</p>
                                            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider pl-4">Reduced administrative overhead by 65%</div>
                                        </div>
                                        <div className="group">
                                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                Legal Services
                                            </h4>
                                            <p className="text-slate-600 mb-3 pl-4 border-l-2 border-slate-200 group-hover:border-emerald-500 transition-colors">Handle client intake, schedule consultations, and provide case status updates with professional accuracy.</p>
                                            <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider pl-4">Improved client response time by 85%</div>
                                        </div>
                                        <div className="group">
                                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                Real Estate
                                            </h4>
                                            <p className="text-slate-600 mb-3 pl-4 border-l-2 border-slate-200 group-hover:border-indigo-500 transition-colors">Qualify leads, schedule property viewings, and provide listing information around the clock.</p>
                                            <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider pl-4">Increased lead conversion by 40%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </>
    )
}