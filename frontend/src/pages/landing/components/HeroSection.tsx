import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, PhoneIncoming, CalendarCheck, Languages, Check } from 'lucide-react'
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
    return (
        <>
            <Header />
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-32 md:pt-40 z-10">
                        <div className="mx-auto max-w-7xl px-6 md:px-8">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        to="/signup"
                                        className="hover:bg-slate-100/80 bg-white/60 group mx-auto flex w-fit items-center gap-3 md:gap-4 rounded-full border border-slate-200 p-1 pl-4 shadow-sm shadow-slate-200/50 transition-all duration-300 backdrop-blur-md">
                                        <span className="text-slate-600 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] line-clamp-1">Built for real front desks and busy service teams</span>
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
                                        className="mt-6 md:mt-10 max-w-4xl mx-auto text-balance text-5xl sm:text-6xl md:text-7xl font-black tracking-normal text-slate-900 leading-[1.08]">
                                        A phone receptionist that sounds prepared, not scripted.
                                    </h1>
                                    <p
                                        className="mx-auto mt-6 max-w-3xl text-balance text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                                        VocalScale answers the phone, follows your booking rules, takes messages, and routes urgent calls. It is built for small teams that need reliable coverage without sounding like a chatbot.
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
                                        className="rounded-2xl p-0.5 w-full md:w-auto">
                                        <Button
                                            asChild
                                            size="lg"
                                            onClick={trackStartDemo}
                                            className="rounded-xl px-8 h-12 text-lg font-black bg-blue-600 hover:bg-white hover:text-slate-900 text-white shadow-xl shadow-blue-500/20 w-full md:w-auto transition-all active:scale-95 border border-transparent hover:border-blue-200">
                                            <Link to="/signup" className="hover:no-underline">
                                                <span className="text-nowrap">Start Setup</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-12 rounded-xl px-8 text-lg font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all w-full md:w-auto shadow-sm bg-white">
                                        <Link to="/contact" className="hover:no-underline">
                                            <span className="text-nowrap flex items-center justify-center gap-2">
                                                Schedule Demo
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <ChevronRight size={14} className="text-blue-600 ml-0.5" />
                                                </div>
                                            </span>
                                        </Link>
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
                                <div className="ring-slate-900/5 relative mx-auto w-full max-w-[90rem] overflow-hidden rounded-2xl border border-white/40 bg-white/20 p-1.5 md:p-2 shadow-2xl shadow-slate-300/40 ring-1 backdrop-blur-sm">
                                    <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '1.6' }}>
                                        <iframe
                                            src="https://app.supademo.com/embed/cmrghzf970kv5qm3zw80tfx92?embed_v=2&autoplay=1&utm_source=embed"
                                            loading="lazy"
                                            title="VocalScale AI Receptionist Demo — 24/7 Call Answering, Appointment Booking & Follow-ups"
                                            allow="clipboard-write; autoplay"
                                            allowFullScreen
                                            className="absolute left-0 top-0 h-full w-full border-0"
                                        />
                                    </div>
                                </div>

                                {/* Product caption */}
                                <div className="mt-16 text-center max-w-4xl mx-auto">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        A product recording beats a perfect illustration: configure numbers, inspect calls, review transcripts, and tune the receptionist from the same dashboard your team uses every day.
                                    </p>
                                </div>
                            </div>
                        </AnimatedGroup>

                        {/* Key Benefits Grid */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 md:px-8">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                                    <PhoneIncoming className="w-6 h-6 text-slate-800" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">After-hours coverage</h3>
                                <p className="text-sm text-slate-600">Answer calls when the counter is busy, the office is closed, or the team is with a customer.</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                                    <CalendarCheck className="w-6 h-6 text-slate-800" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Booking rules that stick</h3>
                                <p className="text-sm text-slate-600">Use your hours, services, staff limits, and calendar rules instead of a generic script.</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                                    <Languages className="w-6 h-6 text-slate-800" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Plain-language calls</h3>
                                <p className="text-sm text-slate-600">Handle common caller questions in natural language, including multilingual conversations.</p>
                            </div>
                        </div>



                        {/* Additional Content Sections */}
                        <div className="mt-12 max-w-7xl mx-auto px-6 md:px-8">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
                                        Keep the phone from running the whole day
                                    </h2>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                        Most small teams already know how they want calls handled. The hard part is doing it consistently while appointments, walk-ins, jobs, and follow-ups are happening at the same time.
                                    </p>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                        VocalScale turns those everyday rules into a dependable phone workflow: answer, ask the right questions, book when possible, route when needed, and leave a useful record behind.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mt-1 border border-slate-200">
                                                <Check className="w-3 h-3 text-slate-800" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Clear intake</h4>
                                                <p className="text-sm text-slate-600">Collect names, phone numbers, services, urgency, and notes in a consistent format.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mt-1 border border-slate-200">
                                                <Check className="w-3 h-3 text-slate-800" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Human handoff</h4>
                                                <p className="text-sm text-slate-600">Send urgent calls to a real person instead of forcing every caller through automation.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mt-1 border border-slate-200">
                                                <Check className="w-3 h-3 text-slate-800" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Reviewable records</h4>
                                                <p className="text-sm text-slate-600">Transcripts and summaries make it easy to see what happened after the phone stops ringing.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Common phone workflows</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Appointment requests</h4>
                                            <p className="text-sm text-slate-600 mb-3">Gather the service, preferred time, caller details, and calendar constraints before confirming.</p>
                                            <div className="text-xs text-slate-700 font-bold">Useful for clinics, salons, home services, and studios</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Lead intake</h4>
                                            <p className="text-sm text-slate-600 mb-3">Qualify callers with practical questions and mark high-intent conversations for follow-up.</p>
                                            <div className="text-xs text-slate-700 font-bold">Useful for legal, real estate, agencies, and consultants</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Missed-call recovery</h4>
                                            <p className="text-sm text-slate-600 mb-3">Log who called, why they called, and what needs attention before the opportunity goes cold.</p>
                                            <div className="text-xs text-slate-700 font-bold">Useful for any team that works away from a desk</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Routine questions</h4>
                                            <p className="text-sm text-slate-600 mb-3">Answer hours, pricing, location, service area, preparation steps, and policy questions.</p>
                                            <div className="text-xs text-slate-700 font-bold">Useful for teams repeating the same answers all week</div>
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
