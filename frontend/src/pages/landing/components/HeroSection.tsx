import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Phone, Clock, Users, TrendingUp, Shield, Globe, Zap, Check } from 'lucide-react'
import { type Variants } from 'framer-motion'
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
                    <div className="relative pt-20 md:pt-40 z-10">
                        <div className="mx-auto max-w-7xl px-6 md:px-8">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        to="/signup"
                                        className="hover:bg-slate-100/80 bg-white/60 group mx-auto flex w-fit items-center gap-3 md:gap-4 rounded-full border border-slate-200 p-1 pl-4 shadow-sm shadow-slate-200/50 transition-all duration-300 backdrop-blur-md">
                                        <span className="text-slate-600 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] line-clamp-1">Revolutionizing Business Communication</span>
                                        <span className="block h-4 w-0.5 border-l border-slate-200"></span>

                                        <div className="bg-blue-600 group-hover:bg-blue-500 size-6 overflow-hidden rounded-full duration-500 flex-shrink-0">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3 text-white" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3 text-white" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <h1
                                        className="mt-6 md:mt-10 max-w-4xl mx-auto text-balance text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] text-slate-900 leading-[1.1]">
                                        AI Voice Agents That <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 italic pb-2 tracking-tight">Transform Customer Experience</span>
                                    </h1>
                                    <p
                                        className="mx-auto mt-6 max-w-3xl text-balance text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                        <span className="font-bold text-slate-900">VocalScale</span> delivers enterprise-grade AI voice technology that handles customer interactions with human-like intelligence. Our advanced AI receptionists provide 24/7 support, automate scheduling, and deliver personalized experiences that scale your business operations while reducing costs by up to 70%.
                                    </p>


                                </AnimatedGroup>

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
                                    className="mt-10 md:mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                                    <div
                                        key={1}
                                        className="rounded-2xl p-0.5 bg-gradient-to-b from-blue-100 to-transparent w-full md:w-auto">
                                        <Button
                                            asChild
                                            size="lg"
                                            onClick={trackStartDemo}
                                            className="rounded-xl px-8 h-12 text-base font-black bg-blue-600 hover:bg-white hover:text-slate-900 text-white shadow-xl shadow-blue-500/20 w-full md:w-auto transition-all active:scale-95 border border-transparent hover:border-blue-200">
                                            <Link to="/signup" className="hover:no-underline">
                                                <span className="text-nowrap">Get Started</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-12 rounded-xl px-8 text-base font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all w-full md:w-auto shadow-sm bg-white">
                                        <a href="#book-demo" className="hover:no-underline">
                                            <span className="text-nowrap flex items-center justify-center gap-2">
                                                Schedule Demo
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <ChevronRight size={14} className="text-blue-600 ml-0.5" />
                                                </div>
                                            </span>
                                        </a>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

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
                            }}>
                            <div className="relative mt-10 md:mt-12 px-6 md:px-8">
                                <div className="inset-shadow-2xs ring-slate-900/10 bg-white relative mx-auto w-full max-w-[90rem] overflow-hidden rounded-2xl border border-slate-300/50 p-1.5 md:p-2 shadow-2xl shadow-slate-200/50 ring-1 opacity-100">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="auto"
                                        crossOrigin="anonymous"
                                        className="w-full h-auto rounded-xl border border-slate-200 shadow-sm"
                                    >
                                        <source src="https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/0126.mov" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>

                                {/* Video caption with expanded content */}
                                <div className="mt-16 text-center max-w-4xl mx-auto">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Explore VocalScale's powerful dashboard found at the heart of your operation. Seamlessly manage your AI workforce,
                                        analyze real-time performance metrics, and configure advanced settings—all from a single, intuitive interface.
                                    </p>
                                </div>
                            </div>
                        </AnimatedGroup>

                        {/* Key Benefits Grid */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 md:px-8">
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                                    <Phone className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">24/7 Availability</h3>
                                <p className="text-sm text-slate-600">Never miss a customer call with AI that works around the clock</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">70% Cost Reduction</h3>
                                <p className="text-sm text-slate-600">Slash operational costs while improving service quality</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                                    <Globe className="w-6 h-6 text-violet-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">50+ Languages</h3>
                                <p className="text-sm text-slate-600">Serve global customers in their native language</p>
                            </div>
                        </div>



                        {/* Additional Content Sections */}
                        <div className="mt-12 max-w-7xl mx-auto px-6 md:px-8">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
                                        Transform Your Customer Service Operations
                                    </h2>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                        Traditional customer service models are expensive, inconsistent, and limited by human constraints.
                                        VocalScale revolutionizes this paradigm by providing AI-powered voice agents that deliver
                                        consistent, professional, and intelligent customer interactions at a fraction of the cost.
                                    </p>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                        Our advanced AI technology understands context, remembers previous interactions, and adapts
                                        responses based on customer history and preferences. This creates a personalized experience
                                        that builds customer loyalty while reducing operational overhead by up to 70%.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-1">
                                                <Check className="w-3 h-3 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Scalable Customer Support</h4>
                                                <p className="text-sm text-slate-600">Handle unlimited concurrent calls without additional staffing costs</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                                                <Check className="w-3 h-3 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Consistent Quality</h4>
                                                <p className="text-sm text-slate-600">Every interaction maintains professional standards and brand voice</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center mt-1">
                                                <Check className="w-3 h-3 text-violet-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Instant Response</h4>
                                                <p className="text-sm text-slate-600">No hold times or wait periods - customers get immediate assistance</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 rounded-3xl p-8 border border-slate-200/60">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Industry Applications</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Healthcare Practices</h4>
                                            <p className="text-sm text-slate-600 mb-3">Automate appointment scheduling, prescription refills, and patient inquiries while maintaining HIPAA compliance.</p>
                                            <div className="text-xs text-blue-600 font-medium">Reduced administrative overhead by 65%</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Legal Services</h4>
                                            <p className="text-sm text-slate-600 mb-3">Handle client intake, schedule consultations, and provide case status updates with professional accuracy.</p>
                                            <div className="text-xs text-emerald-600 font-medium">Improved client response time by 85%</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Real Estate</h4>
                                            <p className="text-sm text-slate-600 mb-3">Qualify leads, schedule property viewings, and provide listing information around the clock.</p>
                                            <div className="text-xs text-violet-600 font-medium">Increased lead conversion by 40%</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">E-commerce</h4>
                                            <p className="text-sm text-slate-600 mb-3">Process orders, handle returns, and provide product support in multiple languages.</p>
                                            <div className="text-xs text-amber-600 font-medium">Enhanced customer satisfaction scores by 92%</div>
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