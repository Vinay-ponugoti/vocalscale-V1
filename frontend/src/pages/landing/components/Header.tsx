import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Features', href: '/features' },
    { name: 'Process', href: '/process' },
    { name: 'Pricing', href: '/pricing' },
]

import { PromoBanner } from './PromoBanner'

export const Header = () => {
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
            <div className="absolute top-0 left-0 right-0 z-[105]">
                <PromoBanner />
            </div>
            <nav className={cn(
                "fixed z-[100] w-full px-2 group transition-all duration-500",
                isScrolled || menuState ? "mt-2 md:mt-3" : "mt-10 md:mt-12"
            )}>
                <div className={cn(
                    'mx-auto mt-4 transition-all duration-500 relative z-[101]',
                    isScrolled || menuState
                        ? 'bg-slate-900/90 max-w-4xl rounded-full border border-white/5 backdrop-blur-xl px-4 md:px-5 py-2.5 shadow-2xl shadow-black/20'
                        : 'max-w-7xl px-6 md:px-8 py-4'
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
                                className={cn(
                                    "relative z-[102] -m-2.5 block cursor-pointer p-2.5 lg:hidden transition-all active:scale-95",
                                    isScrolled || menuState ? "text-white" : "text-slate-900"
                                )}>
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
                            <ul className="flex gap-8 items-center">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <a
                                            href={item.href}
                                            className={cn(
                                                "text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 transition-colors hover:no-underline",
                                                isScrolled ? "hover:text-white" : "hover:text-slate-900"
                                            )}>
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Desktop CRM/CTA */}
                        <div className="hidden lg:flex items-center gap-6">
                            <Link
                                to="/login"
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors px-4 hover:no-underline",
                                    isScrolled ? "hover:text-white" : "hover:text-slate-900"
                                )}>
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
                            className="fixed inset-0 bg-[#020617]/98 backdrop-blur-2xl z-[90] lg:hidden pt-32 pb-12 px-8 flex flex-col justify-between h-screen">

                            {/* Animated Grid Background for Menu */}
                            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />

                            <div className="relative z-10">
                                <nav className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-6">
                                        {menuItems.map((item, index) => (
                                            <a
                                                key={index}
                                                href={item.href}
                                                onClick={() => setMenuState(false)}
                                                className="text-2xl font-black uppercase tracking-[0.2em] text-white hover:text-blue-400 transition-all flex items-center justify-between group/item hover:no-underline">
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
                                    variant="secondary"
                                    size="lg"
                                    className="rounded-[1.5rem] bg-white text-slate-900 hover:bg-slate-200 font-black h-14 uppercase tracking-[0.2em] text-[10px] shadow-lg active:scale-95">
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
            <img src="/logo.png" alt="VocalScale" width="44" height="44" fetchPriority="high" className="h-10 md:h-11 w-auto object-contain" />
        </div>
    )
}