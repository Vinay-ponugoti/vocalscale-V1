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
                <section>
                    <div className="relative pt-20 md:pt-40 z-10">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        to="/signup"
                                        className="hover:bg-slate-100/80 bg-white/60 group mx-auto flex w-fit items-center gap-3 md:gap-4 rounded-full border border-slate-200 p-1 pl-4 shadow-sm shadow-slate-200/50 transition-all duration-300 backdrop-blur-md">
                                        <span className="text-slate-600 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] line-clamp-1">Introducing HD Voice Models</span>
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
                                        className="mt-6 md:mt-12 max-w-5xl mx-auto text-balance text-4xl sm:text-5xl md:text-7xl xl:text-[5.5rem] font-black tracking-[-0.03em] text-slate-900 leading-[1.1] md:leading-[1.05]">
                                        Give your front desk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 italic pb-2 tracking-tight">superpowers.</span>
                                    </h1>
                                    <p
                                        className="mx-auto mt-6 md:mt-10 max-w-2xl text-balance text-base md:text-xl text-slate-600 leading-relaxed font-medium">
                                        <span className="font-bold text-slate-900">VocalScale</span> automates your customer calls with human-like intelligence. Answer questions, schedule bookings, and grow your business while you sleep.
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
                                        className="h-12 rounded-xl px-8 text-base font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all w-full md:w-auto shadow-sm bg-white">
                                        <a href="#book-demo">
                                            <span className="text-nowrap flex items-center justify-center gap-2">
                                                Book a Demo
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
                            <div className="relative mt-12 md:mt-20 px-4 md:px-6">
                                {/* Gradient fade to white at the bottom of the video section */}
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-slate-50 absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-slate-900/5 bg-white relative mx-auto w-full max-w-[90rem] overflow-hidden rounded-2xl border border-slate-200 p-1.5 md:p-2 shadow-2xl shadow-slate-200/50 ring-1 backdrop-blur-3xl opacity-100">
                                    <video
                                        src="https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/0126.mov"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-auto rounded-xl border border-slate-100 shadow-sm"
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