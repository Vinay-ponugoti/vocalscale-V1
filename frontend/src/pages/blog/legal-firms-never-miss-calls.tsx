import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, CheckCircle, DollarSign, Scale, Users, PhoneCall, Target, ArrowRight, TrendingUp } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';

export default function LegalFirmsNeverMissCalls() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 flex flex-col relative overflow-hidden">
      {/* Background Effects - "Luminous Enterprise" */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Soft Modern Gradients */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply"
        />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* White fade at bottom to blend content */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col">
        <Header />

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          {/* Back Link */}
          <div className="mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200">
                Legal Industry
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full border border-emerald-200">
                Lead Generation
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200">
                Client Intake
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Legal Firms: Never Miss a Potential Client Call Again
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              How law firms are using AI receptionists to capture 40% more leads and provide 24/7 client
              intake without hiring additional staff. Real case studies from successful implementations.
            </p>

            <div className="flex items-center space-x-6 text-sm text-slate-500 border-b border-slate-200 pb-8 font-medium">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                Jennifer Martinez
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                January 8, 2024
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                10 min read
              </div>
            </div>
          </motion.header>

          {/* Article Content */}
          <div className="prose prose-lg prose-slate max-w-none">

            {/* Introduction */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                In the competitive world of legal services, every missed call represents a potential
                client lost to a competitor. Law firms across the country are discovering that AI
                receptionist technology isn't just about answering phones – it's about capturing
                opportunities, qualifying leads, and building a 24/7 client intake system that
                transforms practice growth.
              </p>

              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                The statistics are sobering: law firms miss an average of 42% of incoming calls
                during business hours, and this number jumps to 73% after hours and on weekends.
                With the average personal injury case worth $15,000-$50,000 in legal fees, a single
                missed call can represent a significant financial loss.
              </p>

              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                This comprehensive analysis explores how forward-thinking law firms are leveraging
                AI receptionist technology to capture 40% more leads, improve client satisfaction,
                and build scalable intake processes that drive sustainable growth.
              </p>
            </motion.section>

            {/* The Legal Communication Challenge */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Scale className="w-6 h-6 mr-3 text-blue-600" />
                The Legal Communication Challenge
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="text-3xl font-black text-red-600 mb-2">42%</div>
                  <p className="text-slate-600 text-sm font-medium">of calls missed during business hours</p>
                </div>
                <div className="text-center bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="text-3xl font-black text-orange-600 mb-2">73%</div>
                  <p className="text-slate-600 text-sm font-medium">of calls missed after hours</p>
                </div>
                <div className="text-center bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="text-3xl font-black text-blue-600 mb-2">$32.5k</div>
                  <p className="text-slate-600 text-sm font-medium">average value of missed cases</p>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4">
                Legal practices face unique communication challenges that distinguish them from other
                professional services. Clients often contact attorneys during stressful life situations,
                requiring immediate attention and empathetic response. The timing of these calls is
                unpredictable, spanning evenings, weekends, and holidays when traditional reception
                services are unavailable.
              </p>

              <p className="text-slate-700 leading-relaxed">
                Furthermore, legal inquiries require sophisticated qualification processes to determine
                case merit, statute of limitations, and practice area alignment. This complexity
                makes missed calls particularly costly, as potential clients often contact multiple
                firms and hire the first responsive attorney.
              </p>
            </motion.section>

            {/* Case Study */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Case Study: Johnson & Associates Law Firm Transformation
              </h2>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <div className="p-6 border-b border-slate-200 bg-slate-100/50">
                  <h3 className="text-lg font-bold text-slate-900">Firm Profile</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-slate-700"><strong className="font-semibold text-slate-900">Location:</strong> Chicago, Illinois</p>
                    <p className="text-slate-700"><strong className="font-semibold text-slate-900">Specialty:</strong> Personal Injury & Medical Malpractice</p>
                    <p className="text-slate-700"><strong className="font-semibold text-slate-900">Size:</strong> 6 attorneys, 8 support staff</p>
                    <p className="text-slate-700"><strong className="font-semibold text-slate-900">Annual Revenue:</strong> $3.2 million</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-slate-700"><strong className="font-semibold text-slate-900">Monthly Call Volume:</strong> 847 calls</p>
                    <p className="text-slate-700"><strong className="font-semibold text-slate-900">Challenge:</strong> 38% missed call rate</p>
                    <p className="text-slate-700"><strong className="font-semibold text-slate-900">Implementation:</strong> AI Receptionist System</p>
                    <p className="text-slate-700"><strong className="font-semibold text-slate-900">Timeline:</strong> 45 days</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4">The Challenge</h3>
              <p className="text-slate-700 leading-relaxed mb-6">
                Johnson & Associates was experiencing significant growth but struggling to manage
                the increasing volume of client inquiries. With a small team of receptionists handling
                calls for six attorneys, the firm was missing 38% of incoming calls, representing
                substantial lost revenue opportunities.
              </p>

              <blockquote className="border-l-4 border-blue-500 pl-6 italic text-slate-700 mb-6 bg-slate-50 py-4 pr-4 rounded-r-lg">
                "We were in a paradoxical situation. Our marketing efforts were generating more leads than we could handle, but we
                were losing potential clients because they couldn't reach us. Personal injury
                clients don't wait – if you don't answer, they call the next attorney on Google."
                <footer className="text-sm font-bold text-slate-900 mt-2 not-italic">
                  — Robert Johnson, Managing Partner
                </footer>
              </blockquote>

              <p className="text-slate-700 leading-relaxed mb-6">
                The firm's analysis revealed that missed calls were costing approximately
                $847,000 annually in lost revenue, based on their average case value and
                conversion rates. Additionally, the existing reception staff was overwhelmed,
                leading to burnout and turnover that cost an additional $45,000 annually in
                recruitment and training expenses.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4">The Solution Implementation</h3>
              <p className="text-slate-700 leading-relaxed mb-6">
                After evaluating several options, Johnson & Associates decided to implement an
                AI receptionist system specifically designed for legal practices. The implementation
                process involved several critical phases:
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mr-4 mt-1">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Phase 1: Legal Intake Customization (Week 1-2)</h4>
                    <p className="text-slate-600 mt-1">Configuring the AI system to understand personal injury
                      and medical malpractice terminology, case qualification criteria, and intake protocols
                      specific to Illinois law.</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mr-4 mt-1">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Phase 2: Case Screening Logic (Week 3-4)</h4>
                    <p className="text-slate-600 mt-1">Programming the AI to ask qualifying questions about
                      statute of limitations, injury severity, liability determination, and case merit assessment.</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mr-4 mt-1">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Phase 3: Integration & Testing (Week 5-6)</h4>
                    <p className="text-slate-600 mt-1">Connecting the AI system to the firm's case management
                      software, calendar system, and CRM for seamless lead management and follow-up automation.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mr-4 mt-1">
                    <span className="text-green-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Phase 4: Gradual Rollout (Week 7-8)</h4>
                    <p className="text-slate-600 mt-1">Implementing the system during off-peak hours initially,
                      then expanding to handle overflow calls, and finally managing all incoming calls 24/7.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Results */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-emerald-600" />
                Remarkable Results: Transforming Practice Growth
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                    Communication Improvements
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 shrink-0"></span>
                      94% reduction in missed calls (38% to 2.3%)
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 shrink-0"></span>
                      24/7 call handling capability implemented
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 shrink-0"></span>
                      Average response time: under 5 seconds
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 shrink-0"></span>
                      98% client satisfaction with AI interactions
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Business Impact
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 shrink-0"></span>
                      41% increase in qualified leads
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 shrink-0"></span>
                      $1.2M additional annual revenue
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 shrink-0"></span>
                      ROI achieved in 3.2 months
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 shrink-0"></span>
                      $67,000 annual cost savings
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-6">
                The transformation exceeded all expectations. Within the first month of full implementation,
                the firm saw a 41% increase in qualified leads, translating to 23 additional retained
                cases valued at an average of $52,000 each. This represented an immediate monthly
                revenue increase of $1.2 million.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                "The results were immediate and dramatic," Johnson reports. "Not only were we capturing
                more calls, but the AI was better at qualifying leads than our human receptionists.
                It asks all the right questions, identifies strong cases, and ensures we don't waste
                time on cases that don't fit our practice."
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-6 rounded-r-lg">
                <h4 className="font-bold text-slate-900 mb-2">Unexpected Benefits</h4>
                <p className="text-slate-700 leading-relaxed">
                  Beyond the quantitative improvements, the firm discovered unexpected qualitative benefits:
                  improved work-life balance for attorneys who no longer needed to handle after-hours calls,
                  reduced stress for reception staff who could focus on in-person clients, and enhanced
                  professional image through consistent, sophisticated call handling.
                </p>
              </div>
            </motion.section>

            {/* Key Features for Legal Practices */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Essential Features for Legal AI Receptionists
              </h2>

              <p className="text-slate-700 leading-relaxed mb-6">
                Not all AI receptionist systems are suitable for legal practices. The most successful
                implementations include specialized features designed specifically for law firm operations:
              </p>

              <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-blue-600 mb-3">Legal Intake Questionnaires</h3>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Sophisticated questioning protocols that gather essential case information including
                    incident details, parties involved, timeline of events, damages assessment, and
                    statute of limitations considerations. The AI adapts questions based on practice area
                    and case type.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-sm text-slate-600 italic">
                      <strong>Example:</strong> For personal injury cases, the AI automatically asks
                      about injury severity, medical treatment received, insurance coverage, and
                      liability determination factors.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-purple-600 mb-3">Conflict Checking Integration</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Real-time conflict checking against existing client databases and case management
                    systems. The AI can identify potential conflicts early in the intake process,
                    preventing ethical issues and saving valuable attorney time.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-emerald-600 mb-3">Practice Area Routing</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Intelligent routing capabilities that connect potential clients with the most
                    appropriate attorney based on case type, complexity, attorney availability,
                    and caseload distribution. This ensures optimal case assignment and client service.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-orange-600 mb-3">Retainer Agreement Preparation</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Automated preparation of retainer agreements and engagement letters based on
                    case information gathered during intake. The system can schedule consultations
                    and send preliminary documentation to qualified leads.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Implementation Best Practices */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12 bg-slate-50 rounded-2xl p-8 border border-slate-200"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Implementation Best Practices for Law Firms
              </h2>

              <p className="text-slate-700 leading-relaxed mb-6">
                Based on successful implementations across hundreds of law firms, certain strategies
                consistently lead to optimal results. Here's a comprehensive guide for legal practices
                considering AI receptionist technology:
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">1. Start with Practice Area Analysis</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Begin by analyzing your current intake process across different practice areas.
                    Document the questions you ask, the information you need, and the criteria you
                    use to evaluate case merit. This analysis forms the foundation for AI system configuration.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">2. Design Gradual Rollout Strategy</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Implement the AI system in phases, starting with after-hours coverage, then
                    overflow handling during peak times, and finally full 24/7 implementation. This
                    approach allows for refinement and staff adaptation.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">3. Train Staff on Override Procedures</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Ensure all staff members understand how to monitor AI interactions, intervene
                    when necessary, and handle complex situations that require human judgment.
                    Establish clear protocols for escalation and override procedures.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">4. Monitor and Optimize Performance</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Regularly review AI performance metrics, lead quality, conversion rates,
                    and client feedback. Use this data to refine questioning protocols,
                    improve qualification accuracy, and enhance overall system effectiveness.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Common Concerns Addressed */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Addressing Common Legal Industry Concerns
              </h2>

              <p className="text-slate-700 leading-relaxed mb-8">
                Law firms often have specific concerns about implementing AI receptionist technology.
                Here are the most common objections and how successful firms have addressed them:
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Client Relationship Impact
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Concern</p>
                      <p className="text-slate-700 italic">"Will clients feel disconnected if they interact with AI instead of humans?"</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reality</p>
                      <p className="text-slate-700">
                        Research shows clients prioritize responsiveness and efficiency
                        over interaction method. AI receptionists provide immediate attention, consistent service
                        quality, and 24/7 availability that exceeds human-only service.
                      </p>
                    </div>
                    <div className="bg-blue-50/50 rounded-lg p-3">
                      <p className="text-sm text-slate-700">
                        <strong>Data Point:</strong> Johnson & Associates reported 98% client satisfaction
                        with AI interactions, compared to 87% with previous human-only service.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-green-600" />
                    Ethical and Professional Responsibility
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Concern</p>
                      <p className="text-slate-700 italic">"Does AI receptionist technology comply with attorney ethics rules and professional responsibility requirements?"</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reality</p>
                      <p className="text-slate-700">
                        AI receptionists enhance ethical compliance by ensuring
                        consistent intake procedures, proper conflict checking, and accurate information
                        collection. They never provide legal advice and always maintain appropriate boundaries.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Lead Quality Concerns
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Concern</p>
                      <p className="text-slate-700 italic">"Will AI systems effectively qualify leads and identify strong cases?"</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reality</p>
                      <p className="text-slate-700">
                        AI systems consistently outperform human receptionists
                        in lead qualification by asking comprehensive questions, following consistent
                        protocols, and never missing key qualification criteria due to distraction or fatigue.
                      </p>
                    </div>
                    <div className="bg-purple-50/50 rounded-lg p-3">
                      <p className="text-sm text-slate-700">
                        <strong>Result:</strong> Johnson & Associates saw a 23% improvement in lead
                        quality scores after AI implementation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Future Outlook */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                The Future of Legal Client Intake
              </h2>

              <p className="text-slate-700 leading-relaxed mb-6">
                The legal industry is experiencing a technological transformation that extends far
                beyond reception services. AI receptionists represent the beginning of a comprehensive
                digitization of client intake processes that will reshape how law firms acquire and
                serve clients.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                Emerging capabilities include multilingual support for diverse client populations,
                integration with legal research databases for real-time case law analysis, and
                predictive analytics that identify cases with the highest probability of success.
                These advancements will further enhance the value proposition of AI-powered legal services.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                For law firms considering this technology, the competitive landscape is rapidly evolving.
                Early adopters are already capturing market share and building sustainable advantages
                through superior client acquisition and service delivery. The question is no longer
                whether to implement AI receptionist technology, but how quickly firms can adapt to
                remain competitive in an increasingly technology-driven marketplace.
              </p>

              <div className="bg-blue-50/80 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Strategic Recommendations</h3>
                <p className="text-slate-700 leading-relaxed">
                  Law firms should begin by assessing their current intake performance, identifying
                  specific pain points, and developing implementation timelines that align with
                  their growth objectives. The most successful firms treat AI receptionist technology
                  as a strategic investment rather than a cost-saving measure, focusing on the
                  revenue generation and competitive advantages it provides.
                </p>
              </div>
            </motion.section>

            {/* Conclusion */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-12 bg-emerald-50 rounded-2xl p-8 border border-emerald-100"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <PhoneCall className="w-6 h-6 mr-3 text-emerald-600" />
                Conclusion: The Competitive Advantage You Can't Ignore
              </h2>

              <p className="text-lg text-slate-700 leading-relaxed mb-6 font-medium">
                Johnson & Associates' transformation from a firm struggling with missed calls to
                a practice capturing 94% of incoming inquiries demonstrates the profound impact
                that AI receptionist technology can have on legal practice growth. The combination
                of improved lead capture, enhanced qualification processes, and 24/7 availability
                creates a sustainable competitive advantage that compounds over time.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                For law firms seeking to accelerate growth, improve client service, and build
                scalable intake processes, AI receptionist technology represents a strategic
                investment with immediate and long-term returns. The firms that embrace this
                technology today will be best positioned to capture market share and serve
                clients effectively in an increasingly competitive legal marketplace.
              </p>

              <p className="text-slate-700 leading-relaxed">
                The future of legal client intake is here, and it's powered by AI. For practices
                ready to transform their growth trajectory, the opportunity to capture every
                potential client call is just an implementation away.
              </p>
            </motion.section>
          </div>

          {/* Author Bio */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-16 pt-8 border-t border-slate-200"
          >
            <div className="flex items-start space-x-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Jennifer Martinez</h3>
                <p className="text-slate-600 leading-relaxed mb-3 text-sm">
                  Jennifer Martinez is a legal technology consultant with over 12 years of experience
                  helping law firms implement innovative solutions for client acquisition and practice
                  management. She specializes in AI-powered legal technologies and has guided hundreds
                  of firms through successful digital transformations.
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Legal Technology Consultant, Martinez Consulting Group
                </p>
              </div>
            </div>
          </motion.section>
        </article>

        {/* CTA Section */}
        <section className="py-20 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-white mb-6"
            >
              Never Miss Another Client Call
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Join successful law firms using AI receptionists to capture 40% more leads
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 active:scale-95"
              >
                Start Your Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}