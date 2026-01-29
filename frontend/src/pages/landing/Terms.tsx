import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const Terms = () => {
    // Smooth scroll handler
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-blue-200 selection:text-blue-900 flex flex-col relative overflow-hidden">
            {/* Background Effects */}
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
                            Terms and Conditions
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Please read these terms carefully before using our services.
                        </p>
                        <div className="mt-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
                            Last Updated: January 30, 2026
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
                                        { id: 'agreement', label: '1. Agreement to Terms' },
                                        { id: 'services', label: '2. Our Services' },
                                        { id: 'ip', label: '3. Intellectual Property' },
                                        { id: 'userreps', label: '4. User Representations' },
                                        { id: 'purchases', label: '5. Purchases & Payment' },
                                        { id: 'prohibited', label: '6. Prohibited Activities' },
                                        { id: 'liability', label: '7. Limitations of Liability' },
                                        { id: 'contact', label: '8. Contact Us' },
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
                            {/* Section 1: Agreement */}
                            <section id="agreement" className="scroll-mt-32">
                                <SectionHeader number="1" title="Agreement to Terms" />
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>
                                        We are <strong>vocalscale</strong> ("Company," "we," "us," "our"), a company registered in South Carolina, United States at 220 elm st, clemson, SC 29631.
                                    </p>
                                    <p>
                                        We operate the website <span className="text-blue-600 font-medium">vocalscale.com</span> (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
                                    </p>
                                    <p>
                                        These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and vocalscale, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                                    </p>
                                </div>
                            </section>

                            {/* Section 2: Services */}
                            <section id="services" className="scroll-mt-32">
                                <SectionHeader number="2" title="Our Services" />
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>
                                        The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
                                    </p>
                                    <WarningBox title="Compliance Notice" icon="⚠️">
                                        The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).
                                    </WarningBox>
                                </div>
                            </section>

                            {/* Section 3: Intellectual Property */}
                            <section id="ip" className="scroll-mt-32">
                                <SectionHeader number="3" title="Intellectual Property Rights" />
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Our Intellectual Property</h3>
                                <div className="prose prose-slate max-w-none text-slate-600 mb-8">
                                    <p>
                                        We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
                                    </p>
                                    <p>
                                        Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties in the United States and around the world.
                                    </p>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-4">Your Use of Our Services</h3>
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>access the Services; and</li>
                                        <li>download or print a copy of any portion of the Content to which you have properly gained access,</li>
                                    </ul>
                                    <p className="mt-4">solely for your internal business purpose.</p>
                                </div>
                            </section>

                            {/* Section 4: User Representations */}
                            <section id="userreps" className="scroll-mt-32">
                                <SectionHeader number="4" title="User Representations" />
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>By using the Services, you represent and warrant that:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>all registration information you submit will be true, accurate, current, and complete;</li>
                                        <li>you will maintain the accuracy of such information and promptly update such registration information as necessary;</li>
                                        <li>you have the legal capacity and you agree to comply with these Legal Terms;</li>
                                        <li>you are not a minor in the jurisdiction in which you reside;</li>
                                        <li>you will not access the Services through automated or non-human means, whether through a bot, script or otherwise;</li>
                                        <li>you will not use the Services for any illegal or unauthorized purpose; and</li>
                                        <li>your use of the Services will not violate any applicable law or regulation.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 5: Purchases */}
                            <section id="purchases" className="scroll-mt-32">
                                <SectionHeader number="5" title="Purchases and Payment" />
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>We accept the following forms of payment:</p>
                                    <ul className="list-disc pl-5 space-y-2 mb-4">
                                        <li>Visa</li>
                                        <li>Mastercard</li>
                                        <li>American Express</li>
                                        <li>Discover</li>
                                    </ul>
                                    <p>
                                        You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in US dollars.
                                    </p>
                                </div>
                            </section>

                            {/* Section 6: Prohibited Activities */}
                            <section id="prohibited" className="scroll-mt-32">
                                <SectionHeader number="6" title="Prohibited Activities" />
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>
                                        You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                                    </p>
                                    <p className="mt-4">As a user of the Services, you agree not to:</p>
                                    <ul className="list-disc pl-5 space-y-2 mt-2">
                                        <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                                        <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                                        <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
                                        <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
                                        <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
                                        <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                                        <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 7: Liability */}
                            <section id="liability" className="scroll-mt-32">
                                <SectionHeader number="7" title="Limitations of Liability" />
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>
                                        IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                                    </p>
                                </div>
                            </section>

                            {/* Section 8: Contact */}
                            <section id="contact" className="scroll-mt-32">
                                <SectionHeader number="8" title="Contact Us" />
                                <div className="relative group overflow-hidden bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 transition-all duration-500 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10">
                                    {/* Decorative background pulse */}
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 transform group-hover:rotate-12 transition-transform duration-500">
                                            <span className="text-3xl">📧</span>
                                        </div>

                                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Get in Touch</h3>
                                        <p className="text-slate-600 mb-10 max-w-lg mx-auto font-medium text-lg leading-relaxed text-center">
                                            Our support team is ready to help you with any questions or concerns regarding our services.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl text-left mb-12">
                                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 group/item hover:bg-white hover:border-blue-200 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover/item:border-blue-500 transition-colors">
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-slate-900 font-bold text-sm mb-1 uppercase tracking-wider">Office</h4>
                                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                        220 elm st, clemson<br />
                                                        SC 29631, United States
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 group/item hover:bg-white hover:border-blue-200 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover/item:border-blue-500 transition-colors">
                                                    <Mail size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-slate-900 font-bold text-sm mb-1 uppercase tracking-wider">Support</h4>
                                                    <p className="text-slate-600 text-sm font-medium mb-1">Available 24/7</p>
                                                    <a href="mailto:support@vocalscale.com" className="text-blue-600 font-bold text-sm hover:underline">
                                                        support@vocalscale.com
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href="mailto:support@vocalscale.com"
                                            className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95"
                                        >
                                            <span>Send us a Message</span>
                                            <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

const WarningBox = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8 rounded-r-lg">
        <div className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <span>{icon}</span> {title}
        </div>
        <div className="text-slate-700">{children}</div>
    </div>
);

export default Terms;

