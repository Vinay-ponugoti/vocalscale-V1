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
        <div className="min-h-screen bg-slate-50 selection:bg-blue-200 selection:text-blue-900 flex flex-col relative overflow-hidden">
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
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/50 blur-[120px] rounded-full mix-blend-multiply"
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
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/50 blur-[120px] rounded-full mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 flex flex-col">
                <Header />

                <div className="container mx-auto px-6 py-24 md:py-32 max-w-7xl">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Your privacy matters to us. This policy explains how we collect, use, and protect your data.
                        </p>
                        <div className="mt-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
                            Last Updated: February 17, 2026
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Quick Navigation Sidebar */}
                        <aside className="lg:w-1/4 hidden lg:block">
                            <div className="sticky top-32 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-blue-600 font-bold mb-4 flex items-center gap-2">
                                    <span>📋</span> Quick Navigation
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'introduction', label: 'Introduction' },
                                        { id: 'information-we-collect', label: 'Information We Collect' },
                                        { id: 'how-we-use', label: 'How We Use Your Data' },
                                        { id: 'google-api', label: 'Google API & OAuth' },
                                        { id: 'data-sharing', label: 'Data Sharing' },
                                        { id: 'voice-data', label: 'Voice & Audio Data' },
                                        { id: 'data-security', label: 'Data Security' },
                                        { id: 'your-rights', label: 'Your Privacy Rights' },
                                        { id: 'data-retention', label: 'Data Retention' },
                                        { id: 'data-deletion', label: 'Data Deletion' },
                                        { id: 'cookies', label: 'Cookies & Tracking' },
                                        { id: 'international', label: 'International Transfers' },
                                        { id: 'children', label: "Children's Privacy" },
                                        { id: 'changes', label: 'Policy Changes' },
                                        { id: 'contact', label: 'Contact Us' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToSection(item.id)}
                                            className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all font-medium"
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
                                <div className="prose prose-slate max-w-none text-slate-600">
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
                                <div className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-slate-900 font-bold mb-4">Who We Are</h3>
                                    <div className="space-y-2 text-slate-600">
                                        <p><strong className="text-slate-900">Company Name:</strong> VocalScale</p>
                                        <p><strong className="text-slate-900">Service Type:</strong> AI-Powered Voice Agent Platform</p>
                                        <p><strong className="text-slate-900">Data Controller:</strong> VocalScale (for GDPR purposes)</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Information We Collect */}
                            <section id="information-we-collect" className="scroll-mt-32">
                                <SectionHeader number="2" title="Information We Collect" />
                                <p className="text-slate-600 mb-6">We collect several types of information from and about users of our Services, including:</p>

                                <h3 className="text-xl font-bold text-slate-900 mb-4">2.1 Personal Information You Provide</h3>
                                <div className="overflow-x-auto mb-8 rounded-xl border border-slate-200 shadow-sm">
                                    <table className="w-full text-left border-collapse bg-white">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="p-4 text-slate-900 font-bold">Data Category</th>
                                                <th className="p-4 text-slate-900 font-bold">Specific Information</th>
                                                <th className="p-4 text-slate-900 font-bold">Collection Method</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-600">
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Identity Data</td>
                                                <td className="p-4">Full name, email address, Google profile picture</td>
                                                <td className="p-4">Sign-up forms, OAuth authentication</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Business Data</td>
                                                <td className="p-4">Business name, category, phone number</td>
                                                <td className="p-4">Business setup flow, profile settings</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Voice/Audio Data</td>
                                                <td className="p-4">Call recordings, voice samples, voice characteristics</td>
                                                <td className="p-4">Voice setup, active calls, training data</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Payment Information</td>
                                                <td className="p-4">Billing address, payment method details (processed by Stripe)</td>
                                                <td className="p-4">Payment processing during subscription</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Communication Data</td>
                                                <td className="p-4">Support ticket contents, chat messages</td>
                                                <td className="p-4">Help Center, live chat support</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-4">2.2 Information Collected Automatically</h3>
                                <p className="text-slate-600 mb-4">When you access our Services, we automatically collect certain information, including:</p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 mb-8 ml-4">
                                    <li><strong className="text-slate-900">Device Information:</strong> Browser type, operating system, device identifiers</li>
                                    <li><strong className="text-slate-900">Usage Data:</strong> Page views, feature usage, session duration, interaction patterns</li>
                                    <li><strong className="text-slate-900">Performance Metrics:</strong> Web vitals, API latency, error logs (via our custom analytics system)</li>
                                    <li><strong className="text-slate-900">Location Data:</strong> Approximate geographic location based on IP address</li>
                                    <li><strong className="text-slate-900">Session Data:</strong> Authentication tokens, session identifiers stored in local/session storage</li>
                                </ul>

                                <WarningBox title="Sensitive Data Notice" icon="⚠️">
                                    <strong className="text-amber-800">Voice and audio recordings are considered biometric data in some jurisdictions.</strong> We treat all voice data with the highest level of security and only process it for the purposes outlined in this policy. You have specific rights regarding this sensitive data.
                                </WarningBox>
                            </section>

                            {/* Section 3: How We Use Your Data */}
                            <section id="how-we-use" className="scroll-mt-32">
                                <SectionHeader number="3" title="How We Use Your Information" />
                                <p className="text-slate-600 mb-6">We use the information we collect for the following business and commercial purposes:</p>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3">3.1 Service Provision & Operation</h3>
                                        <ul className="space-y-2 text-slate-600 text-sm">
                                            <li>• To create and manage your VocalScale account</li>
                                            <li>• To provide, operate, and maintain our AI voice agent services</li>
                                            <li>• To process voice data and generate AI-powered responses</li>
                                            <li>• To route calls to your designated business phone number via Twilio</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3">3.2 Service Improvement</h3>
                                        <ul className="space-y-2 text-slate-600 text-sm">
                                            <li>• To analyze usage patterns and improve our Services</li>
                                            <li>• To train and improve our AI models and voice recognition capabilities</li>
                                            <li>• To develop new features and functionality</li>
                                            <li>• To monitor and analyze performance metrics</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3">3.3 Communication & Support</h3>
                                        <ul className="space-y-2 text-slate-600 text-sm">
                                            <li>• To send you service-related notifications and updates</li>
                                            <li>• To respond to support tickets and live chat inquiries</li>
                                            <li>• To provide enterprise phone support for eligible customers</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3">3.4 Legal & Security</h3>
                                        <ul className="space-y-2 text-slate-600 text-sm">
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

                            {/* Section 4: Google API & OAuth */}
                            <section id="google-api" className="scroll-mt-32">
                                <SectionHeader number="4" title="Google API & OAuth Data Usage" />
                                <p className="text-slate-600 mb-6">
                                    VocalScale uses Google OAuth 2.0 for user authentication and, where you grant permission, access to certain Google services such as Google Calendar for appointment scheduling. This section explains exactly what Google data we access, how we use it, and how we protect it.
                                </p>

                                <h3 className="text-xl font-bold text-slate-900 mb-4">4.1 Google OAuth Scopes We Request</h3>
                                <div className="overflow-x-auto mb-8 rounded-xl border border-slate-200 shadow-sm">
                                    <table className="w-full text-left border-collapse bg-white">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="p-4 text-slate-900 font-bold">Scope</th>
                                                <th className="p-4 text-slate-900 font-bold">Data Accessed</th>
                                                <th className="p-4 text-slate-900 font-bold">Why We Need It</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-600">
                                            <tr>
                                                <td className="p-4 font-mono text-xs text-blue-700">openid</td>
                                                <td className="p-4">Your unique Google user ID</td>
                                                <td className="p-4">To identify and authenticate your account securely</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-mono text-xs text-blue-700">profile</td>
                                                <td className="p-4">Your name and profile picture</td>
                                                <td className="p-4">To personalise your dashboard and account display</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-mono text-xs text-blue-700">email</td>
                                                <td className="p-4">Your Google email address</td>
                                                <td className="p-4">To create your account, send service notifications, and for account recovery</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-mono text-xs text-blue-700">calendar.events</td>
                                                <td className="p-4">Read and write access to your calendar events</td>
                                                <td className="p-4">To book, modify, and cancel appointments on your behalf via your AI receptionist (only when you enable Calendar Integration)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-4">4.2 How We Use Google Data</h3>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 mb-6 ml-4">
                                    <li>Google account data (name, email, photo) is used <strong className="text-slate-900">only</strong> to create and manage your VocalScale account.</li>
                                    <li>Google Calendar data is accessed <strong className="text-slate-900">only</strong> when you explicitly enable Calendar Integration in your dashboard settings.</li>
                                    <li>We read calendar events to check availability and write events only to book confirmed appointments through your AI receptionist.</li>
                                    <li>We <strong className="text-slate-900">never</strong> use your Google data to serve advertising or for any purpose unrelated to providing the VocalScale service.</li>
                                    <li>We <strong className="text-slate-900">never</strong> share your Google account data with third parties except the sub-processors listed in Section 5, solely for the purpose of operating the service.</li>
                                </ul>

                                <InfoBox title="Google API Services User Data Policy" icon="🔐">
                                    VocalScale's use and transfer of information received from Google APIs adheres to the{' '}
                                    <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">
                                        Google API Services User Data Policy
                                    </a>
                                    , including the Limited Use requirements. We only use Google user data for the specific purposes described in this policy, and we do not transfer, use, or sell Google user data for any other purpose.
                                </InfoBox>

                                <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">4.3 Revoking Google Access</h3>
                                <p className="text-slate-600 mb-4">
                                    You can revoke VocalScale's access to your Google account at any time:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4 mb-4">
                                    <li>Visit <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">myaccount.google.com/permissions</a> and remove VocalScale.</li>
                                    <li>Or go to your VocalScale Dashboard → Settings → Integrations → Disconnect Google.</li>
                                    <li>Upon revocation, we will immediately stop accessing your Google data. Existing calendar events created by VocalScale will remain on your calendar but we will no longer be able to read or modify them.</li>
                                </ul>
                            </section>

                            {/* Section 5: Data Sharing */}
                            <section id="data-sharing" className="scroll-mt-32">
                                <SectionHeader number="5" title="Data Sharing and Disclosure" />
                                <p className="text-slate-600 mb-6">We do not sell your personal information. However, we may share your information with the following categories of third parties:</p>

                                <h3 className="text-xl font-bold text-slate-900 mb-4">4.1 Service Providers</h3>
                                <div className="overflow-x-auto mb-8 rounded-xl border border-slate-200 shadow-sm">
                                    <table className="w-full text-left border-collapse bg-white">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="p-4 text-slate-900 font-bold">Service Provider</th>
                                                <th className="p-4 text-slate-900 font-bold">Purpose</th>
                                                <th className="p-4 text-slate-900 font-bold">Data Shared</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-600">
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Supabase</td>
                                                <td className="p-4">Authentication & database hosting</td>
                                                <td className="p-4">Account data, profile information</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Stripe</td>
                                                <td className="p-4">Payment processing</td>
                                                <td className="p-4">Billing information, payment methods</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Twilio</td>
                                                <td className="p-4">Telephony & SMS services</td>
                                                <td className="p-4">Phone numbers, call metadata, SMS</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Google</td>
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

                            {/* Section 6: Voice Data */}
                            <section id="voice-data" className="scroll-mt-32">
                                <SectionHeader number="6" title="Voice and Audio Data (Biometric)" />
                                <p className="text-slate-600 mb-6">As a voice AI platform, we process voice and audio data, which may be considered biometric information under certain privacy laws. We take special care to protect this sensitive data.</p>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">5.1 Collection</h3>
                                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                                            <li>Voice samples during initial setup</li>
                                            <li>Call recordings from interactions</li>
                                            <li>Voice characteristics for training</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">5.2 Use of Voice Data</h3>
                                        <ul className="list-disc list-inside text-slate-600 space-y-2">
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

                            {/* Section 7: Security */}
                            <section id="data-security" className="scroll-mt-32">
                                <SectionHeader number="7" title="Data Security" />
                                <p className="text-slate-600 mb-6">We implement industry-standard security measures to protect your personal information.</p>
                                <ul className="grid md:grid-cols-2 gap-4 text-slate-600">
                                    <li className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"><strong className="text-blue-600 block mb-1">Encryption</strong> All data transmitted is protected using TLS/HTTPS encryption.</li>
                                    <li className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"><strong className="text-blue-600 block mb-1">Encryption at Rest</strong> Sensitive data is encrypted in our databases using AES-256.</li>
                                    <li className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"><strong className="text-blue-600 block mb-1">Access Controls</strong> JWT for API authorization and role-based access control.</li>
                                    <li className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"><strong className="text-blue-600 block mb-1">Regular Audits</strong> Periodic security assessments and vulnerability scanning.</li>
                                </ul>
                            </section>

                            {/* Section 8: Rights */}
                            <section id="your-rights" className="scroll-mt-32">
                                <SectionHeader number="8" title="Your Privacy Rights" />
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
                                        <div className="text-2xl mb-4">⚙️</div>
                                        <h4 className="text-slate-900 font-bold mb-2">Via Your Account</h4>
                                        <p className="text-slate-600 text-sm">Go to Settings → Privacy & Data to manage your preferences.</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
                                        <div className="text-2xl mb-4">💬</div>
                                        <h4 className="text-slate-900 font-bold mb-2">Via Support</h4>
                                        <p className="text-slate-600 text-sm">Contact us via in-app Live Chat or submit a support ticket.</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
                                        <div className="text-2xl mb-4">📧</div>
                                        <h4 className="text-slate-900 font-bold mb-2">Via Email</h4>
                                        <p className="text-slate-600 text-sm">Email privacy@vocalscale.com for specific data requests.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 9: Data Retention */}
                            <section id="data-retention" className="scroll-mt-32">
                                <SectionHeader number="9" title="Data Retention" />
                                <p className="text-slate-600 mb-6">
                                    We retain your personal information only for as long as necessary to provide our Services, comply with legal obligations, resolve disputes, and enforce our agreements. The following table outlines our standard retention periods:
                                </p>
                                <div className="overflow-x-auto mb-8 rounded-xl border border-slate-200 shadow-sm">
                                    <table className="w-full text-left border-collapse bg-white">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="p-4 text-slate-900 font-bold">Data Type</th>
                                                <th className="p-4 text-slate-900 font-bold">Retention Period</th>
                                                <th className="p-4 text-slate-900 font-bold">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-600">
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Account & Profile Data</td>
                                                <td className="p-4">Duration of account + 30 days after deletion request</td>
                                                <td className="p-4">Service provision; grace period for accidental deletions</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Call Recordings & Transcripts</td>
                                                <td className="p-4">90 days by default (configurable in settings)</td>
                                                <td className="p-4">Business review and quality assurance</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Voice Model / Samples</td>
                                                <td className="p-4">Until you delete your voice model or account</td>
                                                <td className="p-4">Required to operate your AI receptionist</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Google OAuth Tokens</td>
                                                <td className="p-4">Until you revoke access or delete your account</td>
                                                <td className="p-4">Required for Calendar Integration</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Billing & Payment Records</td>
                                                <td className="p-4">7 years</td>
                                                <td className="p-4">Legal and tax compliance requirements</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Usage & Analytics Logs</td>
                                                <td className="p-4">24 months</td>
                                                <td className="p-4">Service improvement and security monitoring</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-semibold text-slate-900">Support Tickets & Chat</td>
                                                <td className="p-4">3 years</td>
                                                <td className="p-4">Dispute resolution and service continuity</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <InfoBox title="Shorter Retention Available" icon="⏱️">
                                    You can reduce call recording retention to as low as 7 days in your Dashboard → Settings → Data & Privacy. You can also manually delete individual recordings at any time from your Call Logs.
                                </InfoBox>
                            </section>

                            {/* Section 10: Data Deletion */}
                            <section id="data-deletion" className="scroll-mt-32">
                                <SectionHeader number="10" title="Data Deletion" />
                                <p className="text-slate-600 mb-6">
                                    You have the right to request deletion of your personal data at any time. We offer multiple ways to delete your data:
                                </p>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-2xl mb-3">🗑️</div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Your Account</h3>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Go to Dashboard → Settings → Account → Delete Account. This permanently removes your profile, voice model, call logs, and all associated data within 30 days.
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-2xl mb-3">🎙️</div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Your Voice Model</h3>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Go to Dashboard → Voice Setup → Delete Voice Model to remove all voice samples and your cloned voice without deleting your account.
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-2xl mb-3">📞</div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Call Recordings</h3>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Delete individual or all call recordings from Dashboard → Call Logs. Deletions are processed immediately.
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-2xl mb-3">📧</div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Submit a Data Deletion Request</h3>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Email <a href="mailto:privacy@vocalscale.com" className="text-blue-600 underline">privacy@vocalscale.com</a> with subject "Data Deletion Request". We will process your request within 30 days and confirm by email.
                                        </p>
                                    </div>
                                </div>

                                <WarningBox title="What Happens When You Delete Your Account" icon="⚠️">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Your profile, voice model, call logs, and appointments are permanently deleted within 30 days.</li>
                                        <li>Your Google OAuth tokens are immediately revoked and removed.</li>
                                        <li>Billing records are retained for 7 years as required by tax law (payment details are held by Stripe, not VocalScale).</li>
                                        <li>Anonymised, aggregated analytics data that cannot be linked back to you may be retained.</li>
                                        <li>Deletion is <strong>irreversible</strong> — we cannot recover data after the 30-day grace period.</li>
                                    </ul>
                                </WarningBox>
                            </section>

                            {/* Section 11: Cookies */}
                            <section id="cookies" className="scroll-mt-32">
                                <SectionHeader number="11" title="Cookies & Tracking" />
                                <p className="text-slate-600 mb-4">We use cookies and similar technologies to enhance your experience, analyze usage, and improve our Services.</p>
                                <InfoBox title="First-Party Analytics" icon="📊">
                                    Unlike many services, we do NOT use third-party analytics platforms like Google Analytics. We operate our own privacy-focused first-party analytics system.
                                </InfoBox>
                            </section>

                            <section id="international" className="scroll-mt-32">
                                <SectionHeader number="12" title="International Transfers" />
                                <p className="text-slate-600 mb-4">VocalScale is headquartered in the United States. If you access our Services from outside the United States, your data may be transferred to, stored, and processed in the United States and other countries where our service providers operate.</p>
                                <p className="text-slate-600">We ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses (SCCs) approved by the European Commission, and we only work with sub-processors that provide adequate data protection guarantees.</p>
                            </section>

                            <section id="children" className="scroll-mt-32">
                                <SectionHeader number="13" title="Children's Privacy" />
                                <p className="text-slate-600 mb-4">
                                    VocalScale's Services are intended for use by businesses and individuals who are at least <strong className="text-slate-900">18 years of age</strong>. Our Services are not directed to, and we do not knowingly collect personal information from, children under the age of 13 (or 16 in the European Economic Area).
                                </p>
                                <WarningBox title="If You Believe a Child Has Provided Us Data" icon="⚠️">
                                    If you are a parent or guardian and believe your child under 13 has provided us with personal information without your consent, please contact us immediately at <a href="mailto:privacy@vocalscale.com" className="text-amber-800 underline font-semibold">privacy@vocalscale.com</a>. We will take steps to delete such information promptly.
                                </WarningBox>
                            </section>

                            <section id="changes" className="scroll-mt-32">
                                <SectionHeader number="14" title="Changes to This Privacy Policy" />
                                <p className="text-slate-600 mb-4">
                                    We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or for other operational reasons. When we make material changes, we will:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 mb-6 ml-4">
                                    <li>Update the "Last Updated" date at the top of this page.</li>
                                    <li>Send an email notification to your registered email address.</li>
                                    <li>Display a prominent notice in your dashboard for 30 days after the change.</li>
                                </ul>
                                <p className="text-slate-600">
                                    Your continued use of our Services after the effective date of any changes constitutes your acceptance of the revised Privacy Policy. If you do not agree to the changes, please stop using the Services and contact us to delete your account.
                                </p>
                            </section>

                            <section id="contact" className="scroll-mt-32">
                                <SectionHeader number="15" title="Contact Us" />
                                <p className="text-slate-600 mb-6">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices — including requests to access, correct, or delete your personal data — please contact us using the details below.
                                </p>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">VocalScale Privacy Team</h3>
                                    <div className="grid md:grid-cols-2 gap-6 text-slate-700 text-sm">
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">General Privacy Inquiries</p>
                                            <a href="mailto:privacy@vocalscale.com" className="text-blue-600 underline font-semibold">privacy@vocalscale.com</a>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">Data Deletion Requests</p>
                                            <a href="mailto:privacy@vocalscale.com" className="text-blue-600 underline font-semibold">privacy@vocalscale.com</a>
                                            <p className="text-slate-500 text-xs mt-1">Subject: "Data Deletion Request"</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">Google OAuth / API Issues</p>
                                            <a href="mailto:privacy@vocalscale.com" className="text-blue-600 underline font-semibold">privacy@vocalscale.com</a>
                                            <p className="text-slate-500 text-xs mt-1">Subject: "Google OAuth Data Request"</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">Response Time</p>
                                            <p className="text-slate-600">We respond to all privacy requests within <strong>30 days</strong>.</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-4 justify-center">
                                        <a href="mailto:privacy@vocalscale.com" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
                                            Email Us
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
    <h2 className="text-3xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200 flex items-center gap-4">
        <span className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg shadow-blue-500/20">
            {number}
        </span>
        {title}
    </h2>
);

const InfoBox = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
        <div className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <span>{icon}</span> {title}
        </div>
        <div className="text-slate-700">{children}</div>
    </div>
);

const WarningBox = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8 rounded-r-lg">
        <div className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <span>{icon}</span> {title}
        </div>
        <div className="text-slate-700">{children}</div>
    </div>
);

const SuccessBox = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-lg">
        <div className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <span>{icon}</span> {title}
        </div>
        <div className="text-slate-700">{children}</div>
    </div>
);

export default Privacy;
