import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { type Variants } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { Header } from './Header'

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
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-40 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(221,83%,53%,0.15)_0,hsla(210,40%,96%,0.02)_50%,transparent_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(221,83%,53%,0.1)_0,hsla(217,33%,17%,0.05)_80%,transparent_100%)] [translate:5%_-50%]" />
                </div>
                <section>
                    <div className="relative pt-20 md:pt-40 z-10">
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,rgba(2,6,23,0)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        to="/signup"
                                        className="hover:bg-white/10 bg-white/5 group mx-auto flex w-fit items-center gap-3 md:gap-4 rounded-full border border-white/10 p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 backdrop-blur-md">
                                        <span className="text-slate-300 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] line-clamp-1">Introducing HD Voice Models</span>
                                        <span className="block h-4 w-0.5 border-l border-white/10"></span>

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
                                        className="mt-6 md:mt-12 max-w-5xl mx-auto text-balance text-4xl sm:text-5xl md:text-7xl xl:text-[5.5rem] font-black tracking-[-0.03em] text-white leading-[1.1] md:leading-[1.05]">
                                        Give your front desk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 italic pb-2 tracking-tight">superpowers.</span>
                                    </h1>
                                    <p
                                        className="mx-auto mt-6 md:mt-10 max-w-2xl text-balance text-base md:text-xl text-slate-400 leading-relaxed font-medium">
                                        <span className="font-semibold text-slate-200">VocalScale</span> automates your customer calls with human-like intelligence. Answer questions, schedule bookings, and grow your business while you sleep.
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
                                        className="rounded-2xl p-0.5 bg-gradient-to-b from-blue-500/20 to-transparent shadow-lg shadow-blue-500/10 w-full md:w-auto">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-8 h-12 text-base font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 w-full md:w-auto transition-all active:scale-95">
                                            <Link to="/signup">
                                                <span className="text-nowrap">Start Free Trial</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-12 rounded-xl px-8 text-base font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all w-full md:w-auto">
                                        <a href="#book-demo">
                                            <span className="text-nowrap flex items-center justify-center gap-2">
                                                Book a Demo
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                                    <ChevronRight size={14} className="text-blue-400 ml-0.5" />
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
                            <div className="relative mt-12 md:mt-20 px-4 md:px-6">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-slate-950 absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-white/10 bg-slate-900/50 relative mx-auto w-full max-w-[90rem] overflow-hidden rounded-2xl border border-white/5 p-1.5 md:p-2 shadow-2xl shadow-blue-900/40 ring-1 backdrop-blur-3xl">
                                    <video
                                        src="https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/0126.mov"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-auto rounded-xl border border-white/5 shadow-sm opacity-90"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>
        </>
    )
}