import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Cloud, Server, RefreshCw, ArrowLeft, Phone, CheckCircle2, Loader2 } from 'lucide-react';

interface ServiceStatusPageProps {
    onRetry: () => void;
    onBack: () => void;
}

const ServiceStatusPage: React.FC<ServiceStatusPageProps> = ({ onRetry, onBack }) => {
    const [retrying, setRetrying] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC');
    
    // Limited access form state
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC');
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRetry = async () => {
        setRetrying(true);
        await onRetry();
        setTimeout(() => setRetrying(false), 2000);
    };

    const handleLimitedAccessSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.trim()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("https://formsubmit.co/ajax/landing@vocalscale.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                    message: "Limited Access Request - User wants access while server is down",
                    _subject: "Limited Access Request from Login Page",
                    _template: "table"
                })
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                throw new Error('Failed to submit');
            }
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-[600px] px-6 py-10 items-center">

            {/* Error Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight leading-tight mb-2">
                    <span className="block">Connection timed out</span>
                </h1>
                <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100 mt-2">
                    Error 522
                </span>
                <p className="mt-4 text-sm text-slate-400">{currentTime}</p>
            </motion.div>

            {/* Status Indicators - 3 Column Layout */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100 p-6 mb-8"
            >
                <div className="grid grid-cols-3 gap-4">
                    {/* Browser Status */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
                                <Monitor className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-400 mb-1">You</p>
                        <p className="text-sm font-semibold text-slate-700">Browser</p>
                        <p className="text-xs font-bold text-emerald-600 mt-1">Working</p>
                    </div>

                    {/* VocalScale Status */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
                                <Cloud className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-400 mb-1">VocalScale</p>
                        <p className="text-sm font-semibold text-slate-700">Platform</p>
                        <p className="text-xs font-bold text-emerald-600 mt-1">Working</p>
                    </div>

                    {/* Auth Service Status */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-red-100 shadow-sm flex items-center justify-center">
                                <Server className="w-6 h-6 text-red-400" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-400 mb-1">Auth</p>
                        <p className="text-sm font-semibold text-slate-700">Service</p>
                        <p className="text-xs font-bold text-red-500 mt-1">Error</p>
                    </div>
                </div>

                {/* Connection Lines */}
                <div className="flex items-center justify-center mt-1 -mb-2">
                    <div className="flex items-center w-full max-w-[300px] px-8">
                        <div className="flex-1 h-[2px] bg-emerald-200 rounded-full" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-1" />
                        <div className="flex-1 h-[2px] bg-gradient-to-r from-emerald-200 via-amber-200 to-red-200 rounded-full" />
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mx-1" />
                        <div className="flex-1 h-[2px] bg-red-200 rounded-full" />
                    </div>
                </div>
            </motion.div>

            {/* Info Sections */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
            >
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">What happened?</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        The authentication service is temporarily unavailable. The connection between VocalScale and the identity provider timed out.
                    </p>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">What can I do?</h2>
                    <p className="text-sm text-slate-500 leading-relaxed mb-2">
                        This is usually a temporary issue. Please try again in a few moments.
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        If the problem persists, please contact our support team.
                    </p>
                </div>
            </motion.div>

            {/* Limited Access Section - PROMINENT */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full mb-8"
            >
                {!isSuccess ? (
                    <div className="bg-gradient-to-b from-emerald-50 to-white rounded-2xl border border-emerald-200 p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
                                <Phone className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Limited Access</h3>
                            <p className="text-base text-slate-600 mt-2">Enter your phone number and we'll call you to give you access</p>
                        </div>
                        <form onSubmit={handleLimitedAccessSubmit} className="space-y-4">
                            <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full h-16 pl-14 pr-5 bg-white border-2 border-slate-200 rounded-2xl text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !phoneNumber.trim()}
                                className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-lg font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Phone className="w-5 h-5" />
                                        Submit - We'll Call You
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center"
                    >
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-800">We'll call you soon!</h3>
                        <p className="text-base text-emerald-600 mt-2">Our team will reach out to give you access.</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3"
            >
                <button
                    onClick={onBack}
                    className="h-12 px-6 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-semibold text-slate-700 transition-all active:scale-[0.97]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back
                </button>
                <button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
                >
                    <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                    {retrying ? 'Retrying...' : 'Try again'}
                </button>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-10 pt-6 border-t border-slate-100 w-full text-center"
            >
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                    VocalScale AI Platform &bull; Service Status
                </p>
            </motion.div>
        </div>
    );
};

export default ServiceStatusPage;
