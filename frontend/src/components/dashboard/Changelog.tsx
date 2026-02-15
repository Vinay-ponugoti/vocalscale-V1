import React, { useState } from 'react';
import { X, Sparkles, Gift, Zap, Bug } from 'lucide-react';

interface ChangelogEntry {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    type: 'feature' | 'improvement' | 'fix';
    isNew?: boolean;
}

// Changelog data - update this when releasing new features
const CHANGELOG_DATA: ChangelogEntry[] = [
    {
        id: '1',
        version: '1.5.0',
        date: '2026-01-15',
        title: 'PostHog Analytics Integration',
        description: 'Added comprehensive analytics tracking to understand how you use VocalScale.',
        type: 'feature',
        isNew: true,
    },
    {
        id: '2',
        version: '1.4.0',
        date: '2026-01-14',
        title: 'Reviews Dashboard',
        description: 'View and respond to customer reviews with AI-powered suggestions.',
        type: 'feature',
    },
    {
        id: '3',
        version: '1.3.5',
        date: '2026-01-10',
        title: 'Improved Billing Page',
        description: 'Redesigned billing overview with real-time usage tracking.',
        type: 'improvement',
    },
    {
        id: '4',
        version: '1.3.0',
        date: '2026-01-05',
        title: 'Voice Setup Wizard',
        description: 'New guided wizard for configuring your AI voice agent settings.',
        type: 'feature',
    },
    {
        id: '5',
        version: '1.2.8',
        date: '2025-12-28',
        title: 'Mobile Responsiveness',
        description: 'Better mobile experience across all dashboard pages.',
        type: 'improvement',
    },
];

const CURRENT_VERSION = CHANGELOG_DATA[0]?.version || '1.0.0';
const CHANGELOG_STORAGE_KEY = 'vocalscale_last_seen_version';

const typeConfig = {
    feature: { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', label: 'New Feature' },
    improvement: { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Improvement' },
    fix: { icon: Bug, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Bug Fix' },
};

interface ChangelogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangelogModal = ({ isOpen, onClose }: ChangelogModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                            <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">What's New</h2>
                            <p className="text-xs text-slate-500">Version {CURRENT_VERSION}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[60vh] p-5 space-y-4">
                    {CHANGELOG_DATA.map((entry) => {
                        const config = typeConfig[entry.type];
                        const Icon = config.icon;

                        return (
                            <div
                                key={entry.id}
                                className={`p-4 rounded-xl border transition-all ${entry.isNew ? 'border-purple-200 bg-purple-50/50' : 'border-slate-100 bg-slate-50/50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${config.bg}`}>
                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-slate-900">{entry.title}</h3>
                                            {entry.isNew && (
                                                <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">{entry.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] text-slate-400">v{entry.version}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] text-slate-400">{entry.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};

// Hook to manage changelog state
// eslint-disable-next-line react-refresh/only-export-components
export const useChangelog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewUpdates, setHasNewUpdates] = useState(() => {
        if (typeof window === 'undefined') return false;
        const lastSeenVersion = localStorage.getItem(CHANGELOG_STORAGE_KEY);
        return lastSeenVersion !== CURRENT_VERSION;
    });

    const openChangelog = () => {
        setIsOpen(true);
        // Mark as seen when opened
        localStorage.setItem(CHANGELOG_STORAGE_KEY, CURRENT_VERSION);
        setHasNewUpdates(false);
    };

    const closeChangelog = () => {
        setIsOpen(false);
    };

    return {
        isOpen,
        hasNewUpdates,
        openChangelog,
        closeChangelog,
    };
};

// Small button to trigger changelog
export const ChangelogButton = () => {
    const { isOpen, hasNewUpdates, openChangelog, closeChangelog } = useChangelog();

    return (
        <>
            <button
                onClick={openChangelog}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">What's New</span>
                {hasNewUpdates && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-600 rounded-full animate-pulse" />
                )}
            </button>
            <ChangelogModal isOpen={isOpen} onClose={closeChangelog} />
        </>
    );
};

export default ChangelogModal;
