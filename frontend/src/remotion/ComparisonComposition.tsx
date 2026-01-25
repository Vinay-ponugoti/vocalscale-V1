import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, random } from 'remotion';
import { Phone, PhoneMissed, CheckCircle2, User, Mic } from 'lucide-react';

// --- SUBCOMPONENTS ---

const GlassCard = ({ children, style, className }: { children: React.ReactNode, style?: React.CSSProperties, className?: string }) => (
    <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        borderRadius: '24px',
        ...style
    }} className={className}>
        {children}
    </div>
);

const Waveform = ({ frame }: { frame: number }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 60 }}>
            {[...Array(8)].map((_, i) => {
                const offset = i * 0.5;
                const height = 20 + Math.sin(frame * 0.3 + offset) * 20 + Math.cos(frame * 0.5 + offset * 2) * 10;
                return (
                    <div
                        key={i}
                        style={{
                            width: 6,
                            height: `${Math.max(10, height)}px`,
                            backgroundColor: '#6366f1',
                            borderRadius: 999,
                            boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
                            opacity: 0.9,
                        }}
                    />
                );
            })}
        </div>
    );
};

// --- MAIN COMPOSITION ---

export const ComparisonComposition: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // TIMINIG
    const startFrame = 15;
    const errorFrame = 70;
    const successFrame = 70;

    // ANIMATION: Ringing (Left)
    const shake = Math.sin(frame * 0.8) * interpolate(frame, [startFrame, errorFrame], [0, 8], { extrapolateRight: 'clamp' });

    // ANIMATION: AI Transform (Right)
    const aiScale = spring({ frame: frame - startFrame, fps, from: 0.8, to: 1, config: { stiffness: 80 } });

    // ANIMATION: Notification Entries
    const notifSlideUp = spring({ frame: frame - errorFrame, fps, from: 100, to: 0, config: { damping: 12 } });
    const notifOpacity = interpolate(frame, [errorFrame, errorFrame + 10], [0, 1]);

    const successSlideUp = spring({ frame: frame - successFrame, fps, from: 100, to: 0, config: { damping: 12 } });
    const successOpacityVal = interpolate(frame, [successFrame, successFrame + 10], [0, 1]);


    return (
        <AbsoluteFill style={{ flexDirection: 'row', fontFamily: '"Inter", sans-serif', backgroundColor: '#020617' }}>

            {/* --- LEFT: OLD WAY --- */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Background Gradients */}
                <AbsoluteFill style={{ background: 'radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.15), transparent 60%)' }} />
                <AbsoluteFill style={{ background: 'radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0), transparent 50%)' }} />

                {/* Header */}
                <div style={{ position: 'absolute', top: 60, width: '100%', textAlign: 'center' }}>
                    <h2 style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        The Old Way
                    </h2>
                </div>

                {/* Content */}
                <div style={{ transform: `rotate(${shake}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
                    <div style={{
                        width: 120, height: 120, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}>
                        <Phone size={48} color={frame > errorFrame ? "#ef4444" : "#9ca3af"} />
                    </div>
                    <p style={{ color: frame > errorFrame ? "#ef4444" : "#6b7280", fontSize: 18, fontWeight: 600, letterSpacing: '0.05em' }}>
                        {frame > errorFrame ? "Call Abandoned" : "Ringing..."}
                    </p>
                </div>

                {/* Failure Notification */}
                {frame > errorFrame && (
                    <div style={{ position: 'absolute', bottom: 100, opacity: notifOpacity, transform: `translateY(${notifSlideUp}px)` }}>
                        <GlassCard style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PhoneMissed size={24} color="#ef4444" />
                            </div>
                            <div>
                                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Missed Potential Lead</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '4px 0 0 0' }}>Voicemail full • 2m ago</p>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>

            {/* --- RIGHT: VOCALSCALE --- */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {/* Background Gradients */}
                <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.1), transparent 70%)' }} />
                <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)' }} />

                {/* Header */}
                <div style={{ position: 'absolute', top: 60, width: '100%', textAlign: 'center' }}>
                    <h2 style={{ background: 'linear-gradient(to right, #818cf8, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        VocalScale
                    </h2>
                </div>

                {/* Content */}
                {frame < successFrame ? (
                    <div style={{ transform: `scale(${aiScale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        {/* AI Orb */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute', inset: -20, background: '#6366f1', filter: 'blur(40px)', opacity: 0.3, borderRadius: '50%'
                            }} />
                            <div style={{
                                width: 120, height: 120, borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(67, 56, 202, 0.4) 100%)',
                                border: '1px solid rgba(165, 180, 252, 0.2)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 30px rgba(99, 102, 241, 0.2)'
                            }}>
                                <Mic size={48} color="#a5b4fc" />
                            </div>
                        </div>

                        {/* Waveform */}
                        <div style={{ height: 60, display: 'flex', alignItems: 'center' }}>
                            <Waveform frame={frame} />
                        </div>
                    </div>
                ) : (
                    <div style={{ opacity: successOpacityVal, transform: `translateY(${successSlideUp}px) scale(${aiScale})` }}>
                        <GlassCard style={{ padding: '40px', textAlign: 'center', minWidth: 280, border: '1px solid rgba(165, 180, 252, 0.3)' }}>
                            <div style={{
                                width: 80, height: 80, margin: '0 auto 24px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.4)'
                            }}>
                                <CheckCircle2 size={40} color="white" strokeWidth={3} />
                            </div>
                            <h3 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Booked!</h3>
                            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.5 }}>
                                Appointment added to calendar.<br />
                                <span style={{ color: '#818cf8', fontWeight: 600 }}>Confirmation Sent.</span>
                            </p>
                        </GlassCard>
                    </div>
                )}
            </div>

            {/* VS Badge */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 50, height: 50, borderRadius: '50%',
                background: '#0f172a', border: '1px solid #1e293b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 4px #020617'
            }}>
                <span style={{ color: '#475569', fontSize: 14, fontWeight: 900 }}>VS</span>
            </div>

        </AbsoluteFill>
    );
};
