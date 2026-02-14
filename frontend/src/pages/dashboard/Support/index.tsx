import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Settings,
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    AlertTriangle,
    Loader2,
    Bot,
    Send,
    Sparkles
} from 'lucide-react';
import { supportApi } from '../../../api/support';
import { useAuth } from '../../../context/AuthContext';

interface RefundRequest {
    id: string;
    ticketId: string;
    customerName: string;
    amount: number; // in cents
    date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    metadata?: any;
}

const MOCK_REFUNDS: RefundRequest[] = [
    {
        id: 'ref_123',
        ticketId: 'TKT-90210',
        customerName: 'Alice Johnson',
        amount: 4999,
        date: '2025-05-15',
        reason: 'Product defective upon arrival',
        status: 'pending'
    },
    {
        id: 'ref_124',
        ticketId: 'TKT-90211',
        customerName: 'Bob Smith',
        amount: 1250,
        date: '2025-05-14',
        reason: 'Changed mind',
        status: 'pending'
    }
];

const SupportSuite = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'inbox' | 'refunds' | 'simulator' | 'settings'>('inbox');
    const [refunds, setRefunds] = useState<RefundRequest[]>(MOCK_REFUNDS);
    const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionStatus, setActionStatus] = useState<{ success: boolean; message: string } | null>(null);

    // Simulator State
    const [simMessages, setSimMessages] = useState<ChatMessage[]>([
        { role: 'system', content: 'Support Bot Simulator initialized. Start a conversation to test the AI draft engine.', timestamp: Date.now() }
    ]);
    const [simInput, setSimInput] = useState('');
    const [simLoading, setSimLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [simMessages]);

    const handleApproveClick = (refund: RefundRequest) => {
        setSelectedRefund(refund);
        setActionStatus(null);
    };

    const confirmRefund = async () => {
        if (!selectedRefund) return;

        setIsProcessing(true);
        setActionStatus(null);

        try {
            // Security Check: Call Backend Action Service
            const result = await supportApi.executeAction('refund', {
                order_id: selectedRefund.id,
                amount: selectedRefund.amount,
                reason: selectedRefund.reason
            });

            if (result.success) {
                setActionStatus({ success: true, message: `Refund processed successfully! Transaction ID: ${result.transaction_id}` });
                // Update local state
                setRefunds(prev => prev.filter(r => r.id !== selectedRefund.id));
                setTimeout(() => {
                    setSelectedRefund(null);
                    setActionStatus(null);
                }, 2000);
            } else {
                setActionStatus({ success: false, message: result.error || 'Refund failed' });
            }
        } catch (error: any) {
            setActionStatus({ success: false, message: error.message || 'Failed to connect to server' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSimSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!simInput.trim() || simLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: simInput, timestamp: Date.now() };
        setSimMessages(prev => [...prev, userMsg]);
        setSimInput('');
        setSimLoading(true);

        try {
            // Construct history for API
            const history = simMessages.filter(m => m.role !== 'system').map(m => ({
                role: m.role,
                content: m.content
            }));
            history.push({ role: 'user', content: userMsg.content });

            // Call Draft API
            const response = await supportApi.generateDraft(
                `sim_${Date.now()}`,
                history,
                { name: user?.full_name || 'Admin Tester', email: user?.email },
                // Optional: Add mock order data to test eligibility
                { order_id: 'ord_mock_123', amount: 5000, currency: 'usd', created_at: '2025-05-10T10:00:00Z' }
            );

            const botMsg: ChatMessage = {
                role: 'assistant',
                content: response.draft,
                timestamp: Date.now(),
                metadata: {
                    confidence: response.confidence,
                    eligibility: response.eligibility
                }
            };
            setSimMessages(prev => [...prev, botMsg]);

        } catch (error: any) {
            setSimMessages(prev => [...prev, { role: 'system', content: `Error: ${error.message}`, timestamp: Date.now() }]);
        } finally {
            setSimLoading(false);
        }
    };

    return (
        <div className="space-y-6 relative h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Support Operations</h1>
                    <p className="text-muted-foreground">Manage customer queries, refunds, and bot configuration.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit shrink-0">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'inbox'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>Unified Inbox</span>
                </button>
                <button
                    onClick={() => setActiveTab('refunds')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'refunds'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Refund Requests</span>
                </button>
                <button
                    onClick={() => setActiveTab('simulator')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'simulator'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Bot className="w-4 h-4" />
                    <span>Bot Simulator</span>
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    <span>Bot Configuration</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-card border rounded-xl flex-1 shadow-sm relative overflow-hidden flex flex-col">
                {activeTab === 'inbox' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/50" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Unified Inbox</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Connect your support channels to see all customer conversations here.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'refunds' && (
                    <div className="space-y-4 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Pending Refund Requests</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    placeholder="Search requests..."
                                    className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 p-3 grid grid-cols-12 text-xs font-medium text-muted-foreground">
                                <div className="col-span-2">TICKET ID</div>
                                <div className="col-span-3">CUSTOMER</div>
                                <div className="col-span-2">AMOUNT</div>
                                <div className="col-span-3">REASON</div>
                                <div className="col-span-2 text-right">ACTION</div>
                            </div>

                            {refunds.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No pending refund requests found.
                                </div>
                            ) : (
                                refunds.map(refund => (
                                    <div key={refund.id} className="p-3 grid grid-cols-12 text-sm border-t items-center hover:bg-muted/10 transition-colors">
                                        <div className="col-span-2 font-mono text-xs">{refund.ticketId}</div>
                                        <div className="col-span-3 font-medium">{refund.customerName}</div>
                                        <div className="col-span-2">${(refund.amount / 100).toFixed(2)}</div>
                                        <div className="col-span-3 text-muted-foreground truncate pr-2">{refund.reason}</div>
                                        <div className="col-span-2 text-right">
                                            <button
                                                onClick={() => handleApproveClick(refund)}
                                                className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'simulator' && (
                    <div className="flex flex-col h-full">
                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {simMessages.map((msg, idx) => (
                                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : msg.role === 'system'
                                                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs w-full max-w-full text-center'
                                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                        }`}>
                                        <div className="text-sm leading-relaxed">{msg.content}</div>
                                        {msg.metadata && (
                                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Sparkles size={10} />
                                                    <span>Confidence: {msg.metadata.confidence}</span>
                                                </div>
                                                {msg.metadata.eligibility && (
                                                    <div className={`flex items-center gap-1 font-medium ${msg.metadata.eligibility.eligible ? 'text-green-600' : 'text-red-500'}`}>
                                                        {msg.metadata.eligibility.eligible ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                        <span>Refund: {msg.metadata.eligibility.eligible ? 'Eligible' : 'Ineligible'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {simLoading && (
                                <div className="flex justify-start w-full">
                                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                        <span className="text-xs text-slate-400">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t">
                            <form onSubmit={handleSimSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={simInput}
                                    onChange={(e) => setSimInput(e.target.value)}
                                    placeholder="Type a message to test the bot..."
                                    className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    disabled={simLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!simInput.trim() || simLoading}
                                    className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <div className="mt-2 text-[10px] text-center text-slate-400">
                                Bot Simulator Mode • Connected to Knowledge Engine • Mock Order Context Active
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6 max-w-2xl p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Bot Personality</h3>
                                <p className="text-sm text-muted-foreground">Control how your support agent speaks to customers.</p>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Tone</label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                    <option>Professional & Empathetic</option>
                                    <option>Friendly & Casual</option>
                                    <option>Strict & Formal</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {selectedRefund && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border rounded-xl shadow-lg max-w-md w-full p-6 space-y-4"
                        >
                            <div className="flex items-center space-x-3 text-amber-500">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="text-lg font-bold text-foreground">Conflict Check</h3>
                            </div>

                            <p className="text-muted-foreground text-sm">
                                Are you sure you want to approve this refund? This action cannot be easily undone.
                            </p>

                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Customer:</span>
                                    <span className="font-medium">{selectedRefund.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Order ID:</span>
                                    <span className="font-mono">{selectedRefund.id}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 mt-2">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-bold text-lg">${(selectedRefund.amount / 100).toFixed(2)}</span>
                                </div>
                            </div>

                            {actionStatus && (
                                <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${actionStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {actionStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {actionStatus.message}
                                </div>
                            )}

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    onClick={() => setSelectedRefund(null)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRefund}
                                    disabled={isProcessing || actionStatus?.success}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Confirm Refund
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportSuite;
