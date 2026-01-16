import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useToast } from '../../hooks/useToast';
import { env } from '../../config/env';

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

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    // Handle OTP paste
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
    };

    // Step 1: Request OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${env.API_URL}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            if (!response.ok) {
                throw new Error('Failed to send OTP');
            }

            showToast('OTP sent! Check your email.', 'success');
            setStep('otp');
            startResendCooldown();
        } catch (error) {
            showToast('Failed to send OTP. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            showToast('Please enter all 6 digits', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${env.API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            if (!response.ok) {
                throw new Error('Invalid OTP');
            }

            const data = await response.json();
            setResetToken(data.reset_token);
            showToast('OTP verified!', 'success');
            setStep('password');
        } catch (error) {
            showToast('Invalid or expired OTP', 'error');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

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

            if (!response.ok) {
                throw new Error('Failed to reset password');
            }

            showToast('Password reset successful! Please login.', 'success');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            showToast('Failed to reset password. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        try {
            await fetch(`${env.API_URL}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            showToast('New OTP sent!', 'success');
            startResendCooldown();
        } catch (error) {
            showToast('Failed to resend OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <AuthLayout>
            <div className="bg-white/95 backdrop-blur-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white rounded-[2rem] w-full max-w-[440px] p-10 flex flex-col items-center text-center">

                {/* Icon */}
                <div className="mb-6 bg-sky-50 p-3 rounded-2xl shadow-sm border border-sky-100">
                    <KeyRound className="text-[#0ea5e9] w-8 h-8" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-800 mb-3">
                    {step === 'email' && 'Reset Password'}
                    {step === 'otp' && 'Verify Code'}
                    {step === 'password' && 'Set New Password'}
                </h1>

                {/* Subtitle */}
                <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-xs">
                    {step === 'email' && 'Enter your email to receive a verification code'}
                    {step === 'otp' && `We sent a 6-digit code to ${email}`}
                    {step === 'password' && 'Choose a strong password for your account'}
                </p>

                {/* Step 1: Email Input */}
                {step === 'email' && (
                    <form className="w-full space-y-4" onSubmit={handleRequestOtp}>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="text-slate-400 w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Business email"
                                required
                                disabled={loading}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 shadow-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-[0.98] flex justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Verification Code'}
                        </button>

                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-[#0ea5e9] mt-4"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </form>
                )}

                {/* Step 2: OTP Input */}
                {step === 'otp' && (
                    <form className="w-full space-y-6" onSubmit={handleVerifyOtp}>
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
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 focus:border-sky-400 focus:ring-0 rounded-xl"
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-[0.98] flex justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                        </button>

                        <div className="text-center space-y-2">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendCooldown > 0 || loading}
                                className="text-sm text-slate-600 hover:text-[#0ea5e9] disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-[#0ea5e9] w-full"
                            >
                                <ArrowLeft size={16} />
                                Change Email
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 'password' && (
                    <form className="w-full space-y-4" onSubmit={handleResetPassword}>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="text-slate-400 w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                required
                                minLength={8}
                                disabled={loading}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 shadow-sm"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="text-slate-400 w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                required
                                minLength={8}
                                disabled={loading}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 shadow-sm"
                            />
                        </div>

                        {newPassword && (
                            <div className="text-xs text-left text-slate-500 space-y-1">
                                <p className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                                    • At least 8 characters
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-[0.98] flex justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                        </button>
                    </form>
                )}

            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
