import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Cloud, Server, RefreshCw, ArrowLeft } from 'lucide-react';

interface ServiceStatusPageProps {
    onRetry: () => void;
    onBack: () => void;
}

const ServiceStatusPage: React.FC<ServiceStatusPageProps> = ({ onRetry, onBack }) => {
    const [retrying, setRetrying] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC');

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

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
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
