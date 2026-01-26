import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const Privacy = () => {
    // Smooth scroll handler
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 selection:bg-blue-500 selection:text-white flex flex-col relative overflow-hidden">
            {/* Background Effects (reused from Landing) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                        scale: [1.1, 1, 1.1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="fixed inset-0 z-[1] opacity-[0.02] pointer-events-none bg-noise mix-blend-soft-light" />
            </div>

            <div className="relative z-10 flex flex-col">
                <Header />

                <div className="container mx-auto px-6 py-24 md:py-32 max-w-7xl">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Your privacy matters to us. This policy explains how we collect, use, and protect your data.
                        </p>
                        <div className="mt-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
                            Last Updated: January 26, 2026
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Quick Navigation Sidebar */}
                        <aside className="lg:w-1/4 hidden lg:block">
                            <div className="sticky top-32 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                                <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                                    <span>📋</span> Quick Navigation
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'introduction', label: 'Introduction' },
                                        { id: 'information-we-collect', label: 'Information We Collect' },
                                        { id: 'how-we-use', label: 'How We Use Your Data' },
                                        { id: 'data-sharing', label: 'Data Sharing' },
                                        { id: 'voice-data', label: 'Voice & Audio Data' },
                                        { id: 'data-security', label: 'Data Security' },
                                        { id: 'your-rights', label: 'Your Privacy Rights' },
                                        { id: 'cookies', label: 'Cookies & Tracking' },
                                        { id: 'international', label: 'International Transfers' },
                                        { id: 'children', label: "Children's Privacy" },
                                        { id: 'changes', label: 'Policy Changes' },
                                        { id: 'contact', label: 'Contact Us' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToSection(item.id)}
                                            className="block w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="lg:w-3/4 space-y-20">
                            {/* Section 1: Introduction */}
                            <section id="introduction" className="scroll-mt-32">
                                <SectionHeader number="1" title="Introduction" />
                                <div className="prose prose-invert prose-slate max-w-none text-slate-400">
                                    <p>
                                        Welcome to VocalScale. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how VocalScale ("we," "us," or "our") collects, uses, discloses, and safeguards your information when you use our AI-powered voice agent platform and related services (collectively, the "Services").
                                    </p>
                                    <p>
                                        By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use our Services.
                                    </p>
                                </div>
                                <InfoBox title="Global Compliance" icon="🌍">
                                    This Privacy Policy complies with the General Data Protection Regulation (GDPR), California Privacy Rights Act (CPRA), and other applicable global privacy regulations.
                                </InfoBox>
                                <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/5">
                                    <h3 className="text-white font-bold mb-4">Who We Are</h3>
                                    <div className="space-y-2 text-slate-400">
                                        <p><strong className="text-slate-200">Company Name:</strong> VocalScale</p>
                                        <p><strong className="text-slate-200">Service Type:</strong> AI-Powered Voice Agent Platform</p>
                                        <p><strong className="text-slate-200">Data Controller:</strong> VocalScale (for GDPR purposes)</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Information We Collect */}
                            <section id="information-we-collect" className="scroll-mt-32">
                                <SectionHeader number="2" title="Information We Collect" />
                                <p className="text-slate-400 mb-6">We collect several types of information from and about users of our Services, including:</p>

                                <h3 className="text-xl font-bold text-white mb-4">2.1 Personal Information You Provide</h3>
                                <div className="overflow-x-auto mb-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 bg-white/5">
                                                <th className="p-4 text-white font-bold">Data Category</th>
                                                <th className="p-4 text-white font-bold">Specific Information</th>
                                                <th className="p-4 text-white font-bold">Collection Method</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-slate-400">
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Identity Data</td>
                                                <td className="p-4">Full name, email address, Google profile picture</td>
                                                <td className="p-4">Sign-up forms, OAuth authentication</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Business Data</td>
                                                <td className="p-4">Business name, category, phone number</td>
                                                <td className="p-4">Business setup flow, profile settings</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Voice/Audio Data</td>
                                                <td className="p-4">Call recordings, voice samples, voice characteristics</td>
                                                <td className="p-4">Voice setup, active calls, training data</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Payment Information</td>
                                                <td className="p-4">Billing address, payment method details (processed by Stripe)</td>
                                                <td className="p-4">Payment processing during subscription</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Communication Data</td>
                                                <td className="p-4">Support ticket contents, chat messages</td>
                                                <td className="p-4">Help Center, live chat support</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4">2.2 Information Collected Automatically</h3>
                                <p className="text-slate-400 mb-4">When you access our Services, we automatically collect certain information, including:</p>
                                <ul className="list-disc list-inside space-y-2 text-slate-400 mb-8 ml-4">
                                    <li><strong className="text-slate-300">Device Information:</strong> Browser type, operating system, device identifiers</li>
                                    <li><strong className="text-slate-300">Usage Data:</strong> Page views, feature usage, session duration, interaction patterns</li>
                                    <li><strong className="text-slate-300">Performance Metrics:</strong> Web vitals, API latency, error logs (via our custom analytics system)</li>
                                    <li><strong className="text-slate-300">Location Data:</strong> Approximate geographic location based on IP address</li>
                                    <li><strong className="text-slate-300">Session Data:</strong> Authentication tokens, session identifiers stored in local/session storage</li>
                                </ul>

                                <WarningBox title="Sensitive Data Notice" icon="⚠️">
                                    <strong className="text-amber-200">Voice and audio recordings are considered biometric data in some jurisdictions.</strong> We treat all voice data with the highest level of security and only process it for the purposes outlined in this policy. You have specific rights regarding this sensitive data.
                                </WarningBox>
                            </section>

                            {/* Section 3: How We Use Your Data */}
                            <section id="how-we-use" className="scroll-mt-32">
                                <SectionHeader number="3" title="How We Use Your Information" />
                                <p className="text-slate-400 mb-6">We use the information we collect for the following business and commercial purposes:</p>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-3">3.1 Service Provision & Operation</h3>
                                        <ul className="space-y-2 text-slate-400 text-sm">
                                            <li>• To create and manage your VocalScale account</li>
                                            <li>• To provide, operate, and maintain our AI voice agent services</li>
                                            <li>• To process voice data and generate AI-powered responses</li>
                                            <li>• To route calls to your designated business phone number via Twilio</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-3">3.2 Service Improvement</h3>
                                        <ul className="space-y-2 text-slate-400 text-sm">
                                            <li>• To analyze usage patterns and improve our Services</li>
                                            <li>• To train and improve our AI models and voice recognition capabilities</li>
                                            <li>• To develop new features and functionality</li>
                                            <li>• To monitor and analyze performance metrics</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-3">3.3 Communication & Support</h3>
                                        <ul className="space-y-2 text-slate-400 text-sm">
                                            <li>• To send you service-related notifications and updates</li>
                                            <li>• To respond to support tickets and live chat inquiries</li>
                                            <li>• To provide enterprise phone support for eligible customers</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-3">3.4 Legal & Security</h3>
                                        <ul className="space-y-2 text-slate-400 text-sm">
                                            <li>• To comply with legal obligations and regulatory requirements</li>
                                            <li>• To protect against fraud, unauthorized access, and security threats</li>
                                            <li>• To enforce our Terms of Service</li>
                                        </ul>
                                    </div>
                                </div>

                                <InfoBox title="Legal Basis for Processing (GDPR)" icon="⚖️">
                                    <p className="mb-2">We process your personal data based on the following legal grounds:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><strong>Contract Performance:</strong> Processing necessary to provide our Services</li>
                                        <li><strong>Legitimate Interests:</strong> Service improvement, security, fraud prevention</li>
                                        <li><strong>Consent:</strong> Voice data processing for AI training (you can withdraw consent anytime)</li>
                                        <li><strong>Legal Obligation:</strong> Compliance with applicable laws and regulations</li>
                                    </ul>
                                </InfoBox>
                            </section>

                            {/* Section 4: Data Sharing */}
                            <section id="data-sharing" className="scroll-mt-32">
                                <SectionHeader number="4" title="Data Sharing and Disclosure" />
                                <p className="text-slate-400 mb-6">We do not sell your personal information. However, we may share your information with the following categories of third parties:</p>

                                <h3 className="text-xl font-bold text-white mb-4">4.1 Service Providers</h3>
                                <div className="overflow-x-auto mb-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 bg-white/5">
                                                <th className="p-4 text-white font-bold">Service Provider</th>
                                                <th className="p-4 text-white font-bold">Purpose</th>
                                                <th className="p-4 text-white font-bold">Data Shared</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-slate-400">
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Supabase</td>
                                                <td className="p-4">Authentication & database hosting</td>
                                                <td className="p-4">Account data, profile information</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Stripe</td>
                                                <td className="p-4">Payment processing</td>
                                                <td className="p-4">Billing information, payment methods</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Twilio</td>
                                                <td className="p-4">Telephony & SMS services</td>
                                                <td className="p-4">Phone numbers, call metadata, SMS</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-200">Google</td>
                                                <td className="p-4">Authentication & AI processing</td>
                                                <td className="p-4">OAuth credentials, voice data (Gemini)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <SuccessBox title="We DO NOT Sell Your Data" icon="✅">
                                    VocalScale does not sell, rent, or lease your personal information to third parties for their marketing purposes. We do not use advertising networks or data brokers.
                                </SuccessBox>
                            </section>

                            {/* Section 5: Voice Data */}
                            <section id="voice-data" className="scroll-mt-32">
                                <SectionHeader number="5" title="Voice and Audio Data (Biometric)" />
                                <p className="text-slate-400 mb-6">As a voice AI platform, we process voice and audio data, which may be considered biometric information under certain privacy laws. We take special care to protect this sensitive data.</p>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-3">5.1 Collection</h3>
                                        <ul className="list-disc list-inside text-slate-400 space-y-2">
                                            <li>Voice samples during initial setup</li>
                                            <li>Call recordings from interactions</li>
                                            <li>Voice characteristics for training</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-3">5.2 Use of Voice Data</h3>
                                        <ul className="list-disc list-inside text-slate-400 space-y-2">
                                            <li>Powering AI voice agents</li>
                                            <li>Voice cloning and personalization</li>
                                            <li>Quality improvement</li>
                                        </ul>
                                    </div>
                                </div>

                                <WarningBox title="Biometric Data Protection" icon="🔒">
                                    Voice data is encrypted both in transit and at rest. We implement additional security measures for biometric data including access controls, encryption key rotation, and regular security audits.
                                </WarningBox>
                            </section>

                            {/* Section 6: Security */}
                            <section id="data-security" className="scroll-mt-32">
                                <SectionHeader number="6" title="Data Security" />
                                <p className="text-slate-400 mb-6">We implement industry-standard security measures to protect your personal information.</p>
                                <ul className="grid md:grid-cols-2 gap-4 text-slate-400">
                                    <li className="bg-white/5 p-4 rounded-lg"><strong className="text-blue-400 block mb-1">Encryption</strong> All data transmitted is protected using TLS/HTTPS encryption.</li>
                                    <li className="bg-white/5 p-4 rounded-lg"><strong className="text-blue-400 block mb-1">Encryption at Rest</strong> Sensitive data is encrypted in our databases using AES-256.</li>
                                    <li className="bg-white/5 p-4 rounded-lg"><strong className="text-blue-400 block mb-1">Access Controls</strong> JWT for API authorization and role-based access control.</li>
                                    <li className="bg-white/5 p-4 rounded-lg"><strong className="text-blue-400 block mb-1">Regular Audits</strong> Periodic security assessments and vulnerability scanning.</li>
                                </ul>
                            </section>

                            {/* Section 7: Rights */}
                            <section id="your-rights" className="scroll-mt-32">
                                <SectionHeader number="7" title="Your Privacy Rights" />
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-blue-500/50 transition-colors">
                                        <div className="text-2xl mb-4">⚙️</div>
                                        <h4 className="text-white font-bold mb-2">Via Your Account</h4>
                                        <p className="text-slate-400 text-sm">Go to Settings → Privacy & Data to manage your preferences.</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-blue-500/50 transition-colors">
                                        <div className="text-2xl mb-4">💬</div>
                                        <h4 className="text-white font-bold mb-2">Via Support</h4>
                                        <p className="text-slate-400 text-sm">Contact us via in-app Live Chat or submit a support ticket.</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-blue-500/50 transition-colors">
                                        <div className="text-2xl mb-4">📧</div>
                                        <h4 className="text-white font-bold mb-2">Via Email</h4>
                                        <p className="text-slate-400 text-sm">Email privacy@vocalscale.com for specific data requests.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Remaining Sections Simplified for brevity but keeping structure */}
                            <section id="cookies" className="scroll-mt-32">
                                <SectionHeader number="8" title="Cookies & Tracking" />
                                <p className="text-slate-400 mb-4">We use cookies and similar technologies to enhance your experience, analyze usage, and improve our Services.</p>
                                <InfoBox title="First-Party Analytics" icon="📊">
                                    Unlike many services, we do NOT use third-party analytics platforms like Google Analytics. We operate our own privacy-focused first-party analytics system.
                                </InfoBox>
                            </section>

                            <section id="international" className="scroll-mt-32">
                                <SectionHeader number="9" title="International Transfers" />
                                <p className="text-slate-400">VocalScale operates globally. Data may be processed in the United States and other countries with appropriate safeguards like Standard Contractual Clauses (SCCs).</p>
                            </section>

                            <section id="contact" className="scroll-mt-32">
                                <SectionHeader number="13" title="Contact Us" />
                                <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-8 rounded-2xl border border-white/10 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-4">Have questions?</h3>
                                    <p className="text-slate-400 mb-8">If you have questions about this Privacy Policy, please contact us.</p>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <a href="mailto:privacy@vocalscale.com" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all">
                                            privacy@vocalscale.com
                                        </a>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
};

// Helper Components
const SectionHeader = ({ number, title }: { number: string, title: string }) => (
    <h2 className="text-3xl font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center gap-4">
        <span className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg shadow-blue-500/20">
            {number}
        </span>
        {title}
    </h2>
);

const InfoBox = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <div className="bg-blue-500/5 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
        <div className="font-bold text-blue-400 mb-2 flex items-center gap-2">
            <span>{icon}</span> {title}
        </div>
        <div className="text-slate-400">{children}</div>
    </div>
);

const WarningBox = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <div className="bg-amber-500/5 border-l-4 border-amber-500 p-6 my-8 rounded-r-lg">
        <div className="font-bold text-amber-400 mb-2 flex items-center gap-2">
            <span>{icon}</span> {title}
        </div>
        <div className="text-slate-400">{children}</div>
    </div>
);

const SuccessBox = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <div className="bg-emerald-500/5 border-l-4 border-emerald-500 p-6 my-8 rounded-r-lg">
        <div className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
            <span>{icon}</span> {title}
        </div>
        <div className="text-slate-400">{children}</div>
    </div>
);

export default Privacy;
