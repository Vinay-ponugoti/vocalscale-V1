import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { useToast } from '../../hooks/useToast';
import { env } from '../../config/env';
import Button from '../../components/ui/Button';

type Step = 'email' | 'otp' | 'password';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [step, setStep] = useState<Step>('email');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
        setOtp(newOtp);
    };

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${env.API_URL}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            if (!response.ok) throw new Error('Failed');
            showToast('Code sent!', 'success');
            setStep('otp');
            startResendCooldown();
        } catch (error) {
            showToast('Failed to send code.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) return;
        setLoading(true);
        try {
            const response = await fetch(`${env.API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
            });
            if (!response.ok) throw new Error('Invalid');
            const data = await response.json();
            setResetToken(data.reset_token);
            setStep('password');
        } catch (error) {
            showToast('Invalid code.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${env.API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
            });
            if (!response.ok) throw new Error('Failed');
            showToast('Password reset successful!', 'success');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            showToast('Failed to reset.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            await fetch(`${env.API_URL}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            startResendCooldown();
        } catch (error) { } finally { setLoading(false); }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <AuthLayout>
            <div className="flex flex-col w-full max-w-[440px] px-6 py-12 md:bg-white md:rounded-[2.5rem] md:shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:border md:border-slate-100 items-center">

                {/* Design Match: Floating Top Icon */}
                <div className="mb-8 p-6 bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-50">
                    <KeyRound className="w-8 h-8 text-slate-900" strokeWidth={1.5} />
                </div>

                {/* Design Match: Centered Text */}
                <div className="text-center mb-10 space-y-3">
                    <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
                        {step === 'email' && 'Reset Access'}
                        {step === 'otp' && 'Security Code'}
                        {step === 'password' && 'New Password'}
                    </h1>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-[320px] mx-auto">
                        {step === 'email' && 'We will send you a one-time verification code to restore your account.'}
                        {step === 'otp' && `Enter the 6-digit code we sent to your inbox.`}
                        {step === 'password' && 'Choose a secure, strong password to continue.'}
                    </p>
                </div>

                {/* Form Sections */}
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {step === 'email' && (
                            <motion.form
                                key="email"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                                onSubmit={handleRequestOtp}
                            >
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email Address"
                                        required
                                        disabled={loading}
                                        className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                                    />
                                </div>
                                <Button type="submit" isLoading={loading} className="w-full h-14 bg-[#1e293b] hover:bg-[#020617] text-white rounded-[1rem] font-bold text-[16px] shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all">
                                    Send Code
                                </Button>
                            </motion.form>
                        )}

                        {step === 'otp' && (
                            <motion.form
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                                onSubmit={handleVerifyOtp}
                            >
                                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !digit && index > 0) {
                                                    document.getElementById(`otp-${index - 1}`)?.focus();
                                                }
                                            }}
                                            className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-none focus:ring-2 focus:ring-slate-950/5 rounded-[1rem] outline-none transition-all"
                                            disabled={loading}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <Button type="submit" isLoading={loading} className="w-full h-14 bg-[#1e293b] hover:bg-[#020617] text-white rounded-[1rem] font-bold text-[16px] shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all">
                                        Verify Access
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || loading}
                                        className="w-full text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {step === 'password' && (
                            <motion.form
                                key="password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                                onSubmit={handleResetPassword}
                            >
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New Password"
                                        required
                                        minLength={8}
                                        disabled={loading}
                                        className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm Password"
                                        required
                                        minLength={8}
                                        disabled={loading}
                                        className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                                    />
                                </div>
                                <Button type="submit" isLoading={loading} className="w-full h-14 bg-[#1e293b] hover:bg-[#020617] text-white rounded-[1rem] font-bold text-[16px] shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all mt-4">
                                    Update Access
                                </Button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Link */}
                <div className="mt-12">
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Take me back to sign in
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
