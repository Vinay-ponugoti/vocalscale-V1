import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Menu, X, Sparkles } from 'lucide-react'
import { m, AnimatePresence, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'

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

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Process', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
]

export function HeroSection() {
    return (
        <>
            <HeroHeader />
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

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            document.body.style.overflow = 'unset'
        }
    }, [])

    React.useEffect(() => {
        if (menuState) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [menuState])

    return (
        <header>
            <nav className="fixed z-[100] w-full px-2 group">
                <div className={cn(
                    'mx-auto mt-4 max-w-6xl transition-all duration-500 relative z-[101]',
                    isScrolled
                        ? 'bg-slate-900/80 max-w-4xl rounded-full border border-white/5 backdrop-blur-xl px-4 md:px-5 py-2.5 shadow-2xl shadow-black/20'
                        : 'px-6 lg:px-12 py-4'
                )}>
                    <div className="relative flex items-center justify-between gap-6 lg:gap-0">
                        <div className="flex w-full justify-between lg:w-auto items-center">
                            <Link
                                to="/"
                                aria-label="home"
                                className="flex items-center space-x-2 relative z-[102]"
                                onClick={() => setMenuState(false)}>
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-[102] -m-2.5 block cursor-pointer p-2.5 lg:hidden text-white transition-all active:scale-95">
                                <AnimatePresence mode="wait">
                                    {menuState ? (
                                        <m.div
                                            key="close"
                                            initial={{ opacity: 0, rotate: -90 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: 90 }}
                                            transition={{ duration: 0.2 }}>
                                            <X size={26} strokeWidth={2.5} />
                                        </m.div>
                                    ) : (
                                        <m.div
                                            key="menu"
                                            initial={{ opacity: 0, rotate: 90 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: -90 }}
                                            transition={{ duration: 0.2 }}>
                                            <Menu size={26} strokeWidth={2.5} />
                                        </m.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>

                        {/* Desktop Menu */}
                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-10">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <a
                                            href={item.href}
                                            className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-white transition-colors">
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Desktop CRM/CTA */}
                        <div className="hidden lg:flex items-center gap-6">
                            <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors px-4">
                                Login
                            </Link>
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-9 px-6 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                <Link to="/signup">
                                    Join Now
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {menuState && (
                        <m.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-[90] lg:hidden pt-32 pb-12 px-8 flex flex-col justify-between h-screen">

                            {/* Animated Grid Background for Menu */}
                            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />

                            <div className="relative z-10">
                                <nav className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-8">
                                        {menuItems.map((item, index) => (
                                            <a
                                                key={index}
                                                href={item.href}
                                                onClick={() => setMenuState(false)}
                                                className="text-2xl font-black uppercase tracking-[0.2em] text-white hover:text-blue-400 transition-all flex items-center justify-between group/item">
                                                {item.name}
                                                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-blue-500" />
                                            </a>
                                        ))}
                                    </div>
                                </nav>
                            </div>

                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="h-px w-full bg-white/10 mb-6" />
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="rounded-[1.5rem] border-white/10 text-white font-black h-14 uppercase tracking-[0.2em] text-[10px] bg-white/5 active:scale-95">
                                    <Link to="/login" onClick={() => setMenuState(false)}>
                                        Login to Account
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white font-black h-14 uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-500/20 active:scale-95">
                                    <Link to="/signup" onClick={() => setMenuState(false)}>
                                        Get Started Free
                                    </Link>
                                </Button>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center", className)}>
            <img src="/logo.png" alt="VocalScale" width="428" height="428" className="h-10 md:h-11 w-auto object-contain" />
        </div>
    )
}