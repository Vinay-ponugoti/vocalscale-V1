import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, type SpringConfig, spring } from 'remotion';
import { Phone, PhoneMissed, PhoneForwarded, Mail, User, Bot, CheckCircle2, AlertCircle } from 'lucide-react';

const PhoneIcon = ({ size, color, vibration }: { size: number; color: string; vibration: number }) => (
    <div style={{ transform: `rotate(${vibration}deg)` }}>
        <Phone size={size} color={color} fill={color} opacity={0.2} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={size} color={color} strokeWidth={2.5} />
        </div>
    </div>
);

export const ComparisonComposition: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Animation Timings
    const splitEntranceFrame = 0;
    const ringingStartFrame = 10;
    const failureTransitionFrame = 90;
    const successTransitionFrame = 90;

    // Spring configs
    const sprConfig: SpringConfig = { stiffness: 100, damping: 10, mass: 1, overshootClamping: false };

    // --- LEFT SIDE (OLD WAY) ---
    const ringVibration = Math.sin(frame * 0.5) * interpolate(frame, [ringingStartFrame, failureTransitionFrame], [0, 10], { extrapolateRight: 'clamp' });
    const oldWayOpacity = interpolate(frame, [failureTransitionFrame, failureTransitionFrame + 15], [1, 0.3]);
    const mailboxOpacity = interpolate(frame, [failureTransitionFrame + 10, failureTransitionFrame + 25], [0, 1]);
    const mailboxY = spring({ frame: frame - failureTransitionFrame - 10, fps, config: sprConfig, from: 20, to: 0 });

    // --- RIGHT SIDE (VOCALSCALE) ---
    const aiWaveformAmplitude = Math.sin(frame * 0.3) * 15 + Math.random() * 5;
    const successOpacity = interpolate(frame, [successTransitionFrame + 10, successTransitionFrame + 25], [0, 1]);
    const successScale = spring({ frame: frame - successTransitionFrame - 10, fps, config: sprConfig, from: 0.8, to: 1 });

    return (
        <AbsoluteFill style={{ backgroundColor: '#020617', display: 'flex', flexDirection: 'row', fontFamily: 'Inter, sans-serif' }}>

            {/* LEFT SIDE: THE OLD WAY */}
            <div style={{ flex: 1, borderRight: '2px solid #1e293b', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(244, 63, 94, 0.05), transparent 70%)' }} />

                <h2 style={{ position: 'absolute', top: 40, color: '#94a3b8', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 4 }}>The Old Way</h2>

                <div style={{ opacity: oldWayOpacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <PhoneIcon size={120} color="#f43f5e" vibration={ringVibration} />
                    <div style={{ color: '#f43f5e', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>Ringing Endlessly...</div>
                </div>

                {frame > failureTransitionFrame && (
                    <div style={{ opacity: mailboxOpacity, transform: `translateY(${mailboxY}px)`, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: 'rgba(0,0,0,0.4)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(244, 63, 94, 0.2)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ background: '#f43f5e', padding: '16px', borderRadius: '16px' }}>
                            <AlertCircle size={48} color="white" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'white', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Mailbox Full</div>
                            <div style={{ color: '#94a3b8', fontSize: 18, fontWeight: 500 }}>Customer hangs up frustrated.</div>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: VOCALSCALE */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(79, 70, 229, 0.15), transparent 70%)' }} />

                <h2 style={{ position: 'absolute', top: 40, color: '#818cf8', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 4 }}>VocalScale</h2>

                {frame < successTransitionFrame && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        {/* Waveform Visualization */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 60 }}>
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: 6,
                                        borderRadius: 3,
                                        background: '#6366f1',
                                        height: 10 + Math.abs(Math.sin((frame + i * 5) * 0.2)) * 40,
                                        boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ color: '#6366f1', fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
                            <span style={{ opacity: Math.sin(frame * 0.1) > 0 ? 1 : 0.5 }}>AI Answering...</span>
                        </div>
                    </div>
                )}

                {frame > successTransitionFrame && (
                    <div style={{ opacity: successOpacity, transform: `scale(${successScale})`, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: 'rgba(99, 102, 241, 0.05)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(99, 102, 241, 0.3)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ background: '#6366f1', padding: '16px', borderRadius: '50%', boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }}>
                            <CheckCircle2 size={48} color="white" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'white', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Appointment Booked</div>
                            <div style={{ color: '#a5b4fc', fontSize: 18, fontWeight: 500 }}>"I've scheduled your visit for 10 AM."</div>
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                            <span style={{ color: '#10b981', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>Lead Captured</span>
                        </div>
                    </div>
                )}
            </div>

            {/* VS Badge */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#0f172a', border: '2px solid #1e293b', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                <span style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>VS</span>
            </div>

        </AbsoluteFill>
    );
};
