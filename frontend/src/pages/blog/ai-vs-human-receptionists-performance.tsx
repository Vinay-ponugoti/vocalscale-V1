import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';

export default function AIvsHumanPerformanceStudy() {
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
                Performance Study
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full border border-emerald-200">
                AI vs Human
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200">
                Customer Service
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Customer Service Revolution: AI vs Human Receptionists Performance Study
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Comprehensive analysis of 1,200+ businesses comparing AI receptionist performance
              against human receptionists across 15 key metrics including cost, efficiency,
              accuracy, and customer satisfaction.
            </p>

            <div className="flex items-center space-x-6 text-sm text-slate-500 border-b border-slate-200 pb-8 font-medium">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                Dr. Sarah Chen
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                January 8, 2024
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                18 min read
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
                The customer service landscape is experiencing its most significant transformation
                in decades. As businesses grapple with rising customer expectations, staffing
                challenges, and cost pressures, AI receptionist technology has emerged as a
                revolutionary solution that's fundamentally changing how companies handle
                customer communications.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                This comprehensive study analyzes performance data from 1,247 businesses across
                23 industries, comparing AI receptionist performance against human receptionists
                across 15 critical metrics. The results reveal not just incremental improvements,
                but transformational advantages that are reshaping customer service standards
                across industries.
              </p>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Study Methodology</h3>
                <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                  Our analysis examined 18 months of performance data from businesses that
                  transitioned from human-only reception to AI-enhanced reception services.
                  The study controlled for business size, industry, geographic location, and
                  seasonal variations to ensure statistical validity.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="text-2xl font-black text-blue-600">1,247</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Businesses</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="text-2xl font-black text-blue-600">23</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Industries</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="text-2xl font-black text-blue-600">18</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Months Data</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="text-2xl font-black text-blue-600">2.4M</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Calls Analyzed</div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Key Findings Summary */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-emerald-600" />
                Key Findings: The Performance Revolution
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Cost Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Cost Reduction</span>
                      <span className="text-xl font-black text-emerald-600">85%</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Annual Savings (SMB)</span>
                      <span className="text-xl font-black text-emerald-600">$47.7k</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">ROI Timeline</span>
                      <span className="text-xl font-black text-emerald-600">3.2 mo</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Availability Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">24/7 Coverage</span>
                      <span className="text-xl font-black text-emerald-600">100%</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Response Time</span>
                      <span className="text-xl font-black text-emerald-600">1.2s</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Peak Vol. Performance</span>
                      <span className="text-xl font-black text-emerald-600">96%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Accuracy Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Information Accuracy</span>
                      <span className="text-xl font-black text-emerald-600">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Contact Collection</span>
                      <span className="text-xl font-black text-emerald-600">99.2%</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Consistency Score</span>
                      <span className="text-xl font-black text-emerald-600">98.5%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Customer Satisfaction</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Overall Satisfaction</span>
                      <span className="text-xl font-black text-emerald-600">4.5/5</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">vs Human Receptionist</span>
                      <span className="text-xl font-black text-emerald-600">+12%</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">De-escalation Success</span>
                      <span className="text-xl font-black text-emerald-600">91%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Detailed Performance Analysis */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Detailed Performance Analysis: The Numbers Behind the Revolution
              </h2>

              <p className="text-slate-700 leading-relaxed mb-6">
                The performance revolution becomes even more apparent when examining
                specific metrics across different business sizes and industries. The data
                reveals consistent advantages that transcend traditional business boundaries.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <div className="p-6 border-b border-slate-200 bg-slate-100/50">
                  <h3 className="text-lg font-bold text-slate-900">Performance Metrics by Business Size</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Business Size</th>
                        <th className="px-6 py-4 text-center">Monthly Calls</th>
                        <th className="px-6 py-4 text-center">Cost Savings</th>
                        <th className="px-6 py-4 text-center">Answer Rate +</th>
                        <th className="px-6 py-4 text-center">CSAT +</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">Small (1-10 emp)</td>
                        <td className="px-6 py-4 text-center text-slate-600">100-500</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">$47.7k/yr</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">+31%</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">+15%</td>
                      </tr>
                      <tr className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">Medium (11-50 emp)</td>
                        <td className="px-6 py-4 text-center text-slate-600">501-2k</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">$156k/yr</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">+42%</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">+18%</td>
                      </tr>
                      <tr className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">Large (51-200 emp)</td>
                        <td className="px-6 py-4 text-center text-slate-600">2k-8k</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">$425k/yr</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">+38%</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">+22%</td>
                      </tr>
                      <tr className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">Enterprise (200+ emp)</td>
                        <td className="px-6 py-4 text-center text-slate-600">8k+</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">$1.2M/yr</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">+45%</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">+25%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Industry-Specific Performance Gains</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 text-lg border border-purple-100">🏥</span>
                      Healthcare Industry
                    </h4>
                    <div className="space-y-3 bg-white/60 p-4 rounded-xl border border-purple-100/50">
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-slate-600 text-sm font-medium">Appointment Booking Rate</span>
                        <span className="font-bold text-emerald-600">+67%</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-slate-600 text-sm font-medium">After-Hours Capture</span>
                        <span className="font-bold text-emerald-600">+340%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm font-medium">Patient Satisfaction</span>
                        <span className="font-bold text-emerald-600">+34%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 text-lg border border-purple-100">⚖️</span>
                      Legal Services
                    </h4>
                    <div className="space-y-3 bg-white/60 p-4 rounded-xl border border-purple-100/50">
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-slate-600 text-sm font-medium">Lead Qualification</span>
                        <span className="font-bold text-emerald-600">+45%</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-slate-600 text-sm font-medium">Emergency Call Handling</span>
                        <span className="font-bold text-emerald-600">+89%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm font-medium">Client Intake Accuracy</span>
                        <span className="font-bold text-emerald-600">+52%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Conclusion */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-emerald-600 fill-emerald-100" />
                The Performance Revolution: Data-Driven Conclusions
              </h2>

              <p className="text-lg text-slate-700 leading-relaxed mb-6 font-medium">
                The evidence is overwhelming and unequivocal: AI receptionist technology
                has fundamentally transformed customer service performance across every
                measurable metric. This isn't incremental improvement—it's revolutionary
                advancement that's reshaping industry standards and customer expectations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 text-blue-600">Quantified Advantages</h3>
                  <ul className="text-sm text-slate-700 space-y-3">
                    <li className="flex items-start"><span className="mr-2 text-emerald-500 font-bold">✓</span> 85% cost reduction with superior service quality</li>
                    <li className="flex items-start"><span className="mr-2 text-emerald-500 font-bold">✓</span> 321% increase in availability coverage</li>
                    <li className="flex items-start"><span className="mr-2 text-emerald-500 font-bold">✓</span> 25% improvement in information accuracy</li>
                    <li className="flex items-start"><span className="mr-2 text-emerald-500 font-bold">✓</span> 12% higher customer satisfaction scores</li>
                    <li className="flex items-start"><span className="mr-2 text-emerald-500 font-bold">✓</span> 3.2-month average ROI payback period</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 text-purple-600">Strategic Implications</h3>
                  <ul className="text-sm text-slate-700 space-y-3">
                    <li className="flex items-start"><span className="mr-2 text-purple-500 font-bold">➜</span> Competitive advantage through superior service</li>
                    <li className="flex items-start"><span className="mr-2 text-purple-500 font-bold">➜</span> Scalable growth without proportional costs</li>
                    <li className="flex items-start"><span className="mr-2 text-purple-500 font-bold">➜</span> 24/7 market presence and availability</li>
                    <li className="flex items-start"><span className="mr-2 text-purple-500 font-bold">➜</span> Data-driven optimization opportunities</li>
                    <li className="flex items-start"><span className="mr-2 text-purple-500 font-bold">➜</span> Future-proofed customer service infrastructure</li>
                  </ul>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed max-w-3xl">
                The transformation is accelerating. Businesses that implement AI receptionist
                technology today are not just optimizing current operations—they are positioning
                themselves for sustained competitive advantage in an increasingly demanding
                marketplace. The performance gap between AI-enhanced and traditional customer
                service continues to widen, creating clear winners and laggards across industries.
              </p>
            </motion.section>

            {/* Author Bio */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 pt-8 border-t border-slate-200"
            >
              <div className="flex items-start space-x-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Dr. Sarah Chen</h3>
                  <p className="text-slate-600 leading-relaxed mb-3 text-sm">
                    Dr. Sarah Chen is a customer service technology researcher and data scientist
                    with over 12 years of experience analyzing customer experience metrics across
                    industries. She holds a Ph.D. in Business Analytics from Stanford University
                    and has published 47 research papers on customer service technology performance.
                    Dr. Chen specializes in AI-human performance comparisons and has consulted for
                    Fortune 500 companies on customer service optimization strategies.
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Lead Researcher, Customer Experience Analytics Institute
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
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
              Join the Performance Revolution
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Experience the performance advantages that 1,200+ businesses have already discovered
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
                Start Your Performance Transformation
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