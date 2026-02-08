import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, DollarSign, Rocket, Settings, CalendarDays, CheckSquare, Target, Users, CheckCircle } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';

export default function SmallBusinessImplementationGuide() {
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
                Small Business
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
                Implementation
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200">
                Guide
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Small Business Guide: Implementing AI Receptionists in 30 Days
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Step-by-step guide for small businesses to deploy AI receptionist technology quickly
              and effectively. Includes timeline, best practices, and real success stories.
            </p>

            <div className="flex items-center space-x-6 text-sm text-slate-500 border-b border-slate-200 pb-8 font-medium">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                David Thompson
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                January 5, 2024
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                15 min read
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
                Small businesses face unique challenges when implementing new technology: limited budgets,
                minimal IT resources, and the need for immediate results without disrupting daily operations.
                AI receptionist technology, however, has evolved to meet these specific needs, offering
                small businesses enterprise-level communication capabilities with minimal implementation complexity.
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Why 30 Days?</h3>
                <p className="text-slate-700 leading-relaxed">
                  Our research shows that 30 days represents the optimal timeline for small business
                  AI implementation – long enough to ensure proper setup and training, but short
                  enough to maintain momentum and see quick results. Businesses following this
                  timeline achieve 94% implementation success rates compared to 67% for longer timelines.
                </p>
              </div>
            </motion.section>

            {/* Week 1: Assessment and Planning */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <CalendarDays className="w-8 h-8 mr-3 text-blue-600" />
                Week 1: Assessment and Planning (Days 1-7)
              </h2>

              <p className="text-slate-700 leading-relaxed mb-6">
                The foundation of successful AI receptionist implementation lies in thorough preparation.
                Week 1 focuses on understanding your current communication landscape, identifying
                specific needs, and creating a detailed implementation roadmap.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-r-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Day 1-2: Current State Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Call Volume Assessment</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Document your current call patterns: monthly volume, peak hours, seasonal variations,
                      and call types. Use your phone bill or call logs to gather accurate data.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Missed Call Analysis</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Calculate your missed call rate and associated costs. Small businesses typically
                      miss 25-40% of calls, with each missed call representing $50-$200 in lost revenue.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Current Staffing Costs</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Document all reception-related costs: salaries, benefits, training, overtime,
                      and opportunity costs of staff handling calls instead of revenue-generating activities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
                    Day 3-4: Requirements Definition
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    Create a detailed requirements document outlining specific needs: business hours,
                    multilingual requirements, appointment scheduling, and integrations.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Key Questions</p>
                    <ul className="text-sm text-slate-700 space-y-1 ml-4 list-disc marker:text-blue-500">
                      <li>Peak call times & patterns?</li>
                      <li>24/7 or extended hours?</li>
                      <li>Language requirements?</li>
                      <li>Information collection needs?</li>
                    </ul>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Day 5-6: Vendor Selection
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    Research and evaluate AI receptionist providers based on requirements, focusing on
                    small business experience, transparency, and support.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Evaluation Criteria</p>
                    <ul className="text-sm text-slate-700 space-y-1 ml-4 list-disc marker:text-green-500">
                      <li>Cost & contract terms</li>
                      <li>Setup & implementation support</li>
                      <li>Customization capabilities</li>
                      <li>Integration options</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                  <Rocket className="w-5 h-5 mr-2 text-purple-600" />
                  Day 7: Implementation Planning
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  Create a detailed implementation timeline with specific milestones, responsible parties,
                  and success metrics to set realistic expectations.
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Success Metrics</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                    <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>Call answer rate (95%+)</div>
                    <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>CSAT scores</div>
                    <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>Cost per call</div>
                    <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>Lead conversion</div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Week 2: Configuration and Setup */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <Settings className="w-8 h-8 mr-3 text-purple-600" />
                Week 2: Configuration and Setup (Days 8-14)
              </h2>

              <p className="text-slate-700 leading-relaxed mb-8">
                Week 2 focuses on configuring your AI receptionist system to match your business
                requirements. This involves customizing call flows, setting up integrations,
                and preparing your team for the transition.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Proper Configuration</h4>
                  <p className="text-sm text-slate-600">Accurate setup prevents issues later</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Team Training</h4>
                  <p className="text-sm text-slate-600">Prepare staff for new processes</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Testing Protocol</h4>
                  <p className="text-sm text-slate-600">Validate everything works correctly</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6 py-2">
                  <h3 className="font-bold text-slate-900 text-lg">Day 8-9: Basic Configuration</h3>
                  <p className="text-slate-600 mt-1">Set up business hours, greeting messages, routing rules, voicemail, and language preferences.</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-6 py-2">
                  <h3 className="font-bold text-slate-900 text-lg">Day 10-11: Advanced Customization</h3>
                  <p className="text-slate-600 mt-1">Configure appointment booking, order status checks, pricing info, and data collection forms.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-6 py-2">
                  <h3 className="font-bold text-slate-900 text-lg">Day 12-13: Integration Setup</h3>
                  <p className="text-slate-600 mt-1">Connect CRM, calendar, email, accounting software, and support platforms.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-6 py-2">
                  <h3 className="font-bold text-slate-900 text-lg">Day 14: Team Training</h3>
                  <p className="text-slate-600 mt-1">Train staff on monitoring, escalation procedures, troubleshooting, and optimization.</p>
                </div>
              </div>
            </motion.section>

            {/* Week 3: Testing and Optimization */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12 bg-slate-50 border border-slate-200 rounded-2xl p-8"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <Target className="w-8 h-8 mr-3 text-red-600" />
                Week 3: Testing and Optimization (Days 15-21)
              </h2>

              <p className="text-slate-700 leading-relaxed mb-6">
                Week 3 focuses on testing your AI receptionist system under real-world conditions,
                identifying areas for improvement, and optimizing performance before full deployment.
              </p>

              <div className="bg-red-50 p-6 rounded-xl border border-red-100 mb-8">
                <h3 className="font-bold text-red-800 mb-2 flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Critical Phase</h3>
                <p className="text-red-700 text-sm">
                  Businesses that skip comprehensive testing experience 3x more problems during
                  full deployment and take 2x longer to achieve optimal performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Internal Testing (Day 15-16)</h3>
                  <p className="text-sm text-slate-600 mb-2">Simulate common inquiries, complex requests, accents, background noise, and escalations.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Customer Testing (Day 17-18)</h3>
                  <p className="text-sm text-slate-600 mb-2">Route 10-20% of calls to AI. Monitor completion rates, CSAT, and error rates.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Optimization (Day 19-20)</h3>
                  <p className="text-sm text-slate-600 mb-2">Refine routing logic, response accuracy, and integration performance based on data.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Final Validation (Day 21)</h3>
                  <p className="text-sm text-slate-600 mb-2">Verify all fixes. Ensure staff readiness, contingency plans, and monitoring are successfully in place.</p>
                </div>
              </div>
            </motion.section>

            {/* Week 4: Full Deployment */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <Rocket className="w-8 h-8 mr-3 text-emerald-600" />
                Week 4: Full Deployment (Days 22-30)
              </h2>

              <p className="text-slate-700 leading-relaxed mb-6">
                The final week involves full system deployment, comprehensive monitoring,
                and establishing ongoing optimization processes to realize the full benefits.
              </p>

              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 text-blue-600">Day 22-23: Full Deployment</h3>
                  <p className="text-slate-600 text-sm mb-3">Launch for 100% of calls. Deploy during business hours with support on standby.</p>
                  <div className="flex gap-2 text-xs font-bold text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded">Monitor 48hrs</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">Communicate</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">Document</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 text-green-600">Day 24-28: Monitoring & Feedback</h3>
                  <p className="text-slate-600 text-sm mb-3">Track KPIs (98%+ answer rate) and collect customer feedback via surveys and interviews.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 text-purple-600">Day 29-30: Future Planning</h3>
                  <p className="text-slate-600 text-sm mb-3">Establish monthly reviews, quarterly updates, and continuous training protocols.</p>
                </div>
              </div>
            </motion.section>

            {/* ROI Analysis */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                ROI Analysis: 30-Day Investment Returns
              </h2>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Average ROI (30-Day Implementation)
                </h3>

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                  <div className="text-center w-full">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Total Investment</p>
                    <p className="text-3xl font-black text-slate-900">$2,500</p>
                    <p className="text-xs text-slate-400 mt-1">Setup, Service, Training</p>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-green-200"></div>
                  <div className="text-center w-full">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">30-Day Return</p>
                    <p className="text-3xl font-black text-green-600">$28,800</p>
                    <p className="text-xs text-green-600 mt-1">Revenue + Savings</p>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-green-200"></div>
                  <div className="text-center w-full">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">ROI</p>
                    <p className="text-4xl font-black text-green-600">1,152%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-slate-900 mb-1">94%</p>
                    <p className="text-xs text-slate-500">Success Rate</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-slate-900 mb-1">6.2 mo</p>
                    <p className="text-xs text-slate-500">Avg Payback</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-slate-900 mb-1">$180K</p>
                    <p className="text-xs text-slate-500">Avg Annual Savings</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Conclusion */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <Rocket className="w-8 h-8 mr-3 text-blue-600" />
                Conclusion: Start Your Transformation
              </h2>

              <p className="text-lg text-slate-700 leading-relaxed mb-6 font-medium">
                The 30-day AI receptionist implementation framework delivers exceptional ROI and transforms
                customer communication. Success requires a structured approach, focus on customer experience,
                and commitment to continuous optimization.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                Small businesses following this guide see immediate improvements in call capture, satisfaction,
                and efficiency. Financial returns typically exceed initial investment within 6 months.
              </p>

              <div className="bg-blue-50 p-6 rounded-xl text-center">
                <p className="text-slate-800 font-medium italic">
                  "The competitive advantage from superior customer communication is invaluable.
                  Acting now positions your business for sustained growth in a digital marketplace."
                </p>
              </div>
            </motion.section>
          </div>

          {/* Author Bio */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-16 pt-8 border-t border-slate-200"
          >
            <div className="flex items-start space-x-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">David Thompson</h3>
                <p className="text-slate-600 leading-relaxed mb-3 text-sm">
                  David Thompson is a small business technology strategist helping owners leverage
                  automation for growth. With a background in operations management, he specializes
                  in practical, high-impact technology implementations for service-based businesses.
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Senior Strategy Consultant, SMB Tech Solutions
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
              Ready to Transform Your Business?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Start your 30-day implementation journey today
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:scale-95"
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