import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { CheckCircle2, User, Mic, ShieldAlert, Clock, Mail } from 'lucide-react';

const GlassRow = ({
    index,
    frame,
    name,
    type,
    time,
    status
}: {
    index: number,
    frame: number,
    name: string,
    type: 'lead' | 'spam' | 'support',
    time: string,
    status: 'completed' | 'blocked' | 'emailed'
}) => {
    const { fps } = useVideoConfig();
    const delay = index * 25;

    const slideIn = spring({ frame: frame - delay, fps, from: 50, to: 0, config: { stiffness: 100, damping: 14 } });
    const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp' });

    const processingStart = delay + 30;
    const processingEnd = delay + 90;
    const isProcessing = frame > processingStart && frame < processingEnd;
    const isDone = frame >= processingEnd;

    const getIcon = () => {
        if (type === 'spam') return <ShieldAlert size={16} color="#ef4444" />;
        if (type === 'support') return <Mail size={16} color="#3b82f6" />;
        return <User size={16} color="#10b981" />;
    };

    const getStatusText = () => {
        if (!isDone) return "AI Analysis...";
        if (status === 'blocked') return "Spam Blocked";
        if (status === 'emailed') return "Transcript Sent";
        return "Appt. Booked";
    };

    const getStatusColor = () => {
        if (!isDone) return "#818cf8";
        if (status === 'blocked') return "#ef4444";
        if (status === 'emailed') return "#3b82f6";
        return "#10b981";
    };

    return (
        <div style={{
            transform: `translateY(${slideIn}px)`,
            opacity,
            marginBottom: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                    {getIcon()}
                </div>
                <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{name}</div>
                    <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} strokeWidth={2.5} /> {time}
                    </div>
                </div>
            </div>
            <div>
                <div style={{
                    padding: '8px 16px', borderRadius: 99,
                    background: isProcessing ? 'rgba(99, 102, 241, 0.1)' : `rgba(${status === 'blocked' ? '239, 68, 68' : (status === 'emailed' ? '59, 130, 246' : '16, 185, 129')}, 0.1)`,
                    border: `1px solid ${isProcessing ? 'rgba(99, 102, 241, 0.4)' : getStatusColor()}`,
                    color: isProcessing ? '#a5b4fc' : getStatusColor(),
                    fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5,
                    display: 'flex', alignItems: 'center', gap: 8, minWidth: 160, justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    {isProcessing ? <><Mic size={14} className="animate-pulse" /> Processing</> : <>{status === 'blocked' ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}{getStatusText()}</>}
                </div>
            </div>
        </div>
    );
};

export const LogComposition: React.FC = () => {
    const frame = useCurrentFrame();

    // Header Animation
    const headerSlide = spring({ frame, fps: 30, from: -50, to: 0, config: { stiffness: 80 } });
    const headerOpacity = interpolate(frame, [0, 20], [0, 1]);

    const calls = [
        { name: "Sarah Miller", type: 'lead', time: "10:42 AM", status: 'completed' },
        { name: "Unknown Caller", type: 'spam', time: "10:41 AM", status: 'blocked' },
        { name: "Mike Ross", type: 'support', time: "10:38 AM", status: 'emailed' },
        { name: "Jessica Pearson", type: 'lead', time: "10:35 AM", status: 'completed' },
        { name: "Potential Risk", type: 'spam', time: "10:32 AM", status: 'blocked' },
    ] as const;

    return (
        <AbsoluteFill style={{
            backgroundColor: '#020617',
            fontFamily: '"Inter", sans-serif',
            padding: 80,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Background Ambience */}
            <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.2), transparent 70%)' }} />
            <AbsoluteFill style={{ background: 'radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.1), transparent 50%)' }} />

            {/* Header */}
            <div style={{
                marginBottom: 60, textAlign: 'center', position: 'relative', zIndex: 10,
                transform: `translateY(${headerSlide}px)`, opacity: headerOpacity
            }}>
                <h2 style={{
                    fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: -1,
                    marginBottom: 16,
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Live Call Intelligence
                </h2>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 99, background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: 13, fontWeight: 800, letterSpacing: 1
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                    SYSTEM ACTIVE
                </div>
            </div>

            {/* List Container */}
            <div style={{ maxWidth: 700, width: '100%', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                {calls.map((call, i) => (
                    <GlassRow
                        key={i}
                        index={i}
                        frame={frame}
                        name={call.name}
                        type={call.type}
                        time={call.time}
                        status={call.status}
                    />
                ))}
            </div>

            {/* Overlay Gradient at bottom to smooth exit */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
                background: 'linear-gradient(to top, #020617 0%, transparent 100%)',
                zIndex: 20, pointerEvents: 'none'
            }} />

        </AbsoluteFill>
    );
};
