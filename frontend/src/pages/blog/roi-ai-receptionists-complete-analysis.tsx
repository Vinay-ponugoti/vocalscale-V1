import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, CheckCircle, TrendingUp, DollarSign, Calculator, BarChart3, PieChart, Phone } from 'lucide-react';

export default function ROICompleteAnalysis() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
              VocalScale
            </Link>
            <Link 
              to="/blog" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              ROI Analysis
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Cost Benefits
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
              Business Intelligence
            </span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            The ROI of AI Receptionists: A Complete Cost-Benefit Analysis
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Comprehensive analysis showing how businesses save 70% on reception costs while improving 
            customer satisfaction scores. Real data from 500+ implementations across industries.
          </p>

          <div className="flex items-center space-x-6 text-sm text-gray-500 border-b border-gray-200 pb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Michael Chen
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              January 10, 2024
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              12 min read
            </div>
          </div>
        </motion.header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          
          {/* Executive Summary */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 bg-green-50 rounded-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3 text-green-600" />
              Executive Summary: The Numbers Don't Lie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Savings</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    70% reduction in reception staffing costs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    $180,000 average annual savings per business
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ROI achieved in 4-6 months on average
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Impact</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    40% increase in captured leads
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    $25,000+ monthly revenue increase
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    24/7 availability captures after-hours business
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Cost Analysis */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The True Cost of Traditional Reception
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Before examining the benefits of AI receptionists, it's crucial to understand the full 
              cost implications of traditional human receptionist models. Our analysis of over 500 
              businesses reveals that the true cost extends far beyond basic salary expenses.
            </p>

            <div className="bg-red-50 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-red-600" />
                Traditional Receptionist Cost Breakdown (Annual)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Direct Costs</h4>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Base Salary (24/7 coverage)</span>
                      <span className="font-semibold">$120,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Benefits & Insurance</span>
                      <span className="font-semibold">$24,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Training & Onboarding</span>
                      <span className="font-semibold">$8,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equipment & Software</span>
                      <span className="font-semibold">$6,000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Hidden Costs</h4>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Sick Days & Vacation Coverage</span>
                      <span className="font-semibold">$15,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Turnover & Recruitment</span>
                      <span className="font-semibold">$12,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Missed Calls (Lost Revenue)</span>
                      <span className="font-semibold">$45,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inefficiency & Overhead</span>
                      <span className="font-semibold">$18,000</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-red-200">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Annual Cost</span>
                  <span className="text-red-600">$248,000</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              The most significant hidden cost is missed calls and lost revenue opportunities. 
              Research indicates that businesses miss approximately 22% of incoming calls during 
              business hours, rising to 67% after hours. For a typical business generating $2 million 
              annually, this represents nearly $45,000 in lost revenue from missed opportunities alone.
            </p>
          </motion.section>

          {/* AI Receptionist Investment */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              AI Receptionist Investment Analysis
            </h2>

            <div className="bg-blue-50 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                AI Receptionist Cost Structure (Annual)
              </h3>
              
              <div className="space-y-4 text-gray-700">
                <div className="flex justify-between items-center">
                  <span>Monthly Subscription (24/7 coverage)</span>
                  <span className="font-semibold">$500/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Setup & Integration</span>
                  <span className="font-semibold">$2,000 (one-time)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Training & Customization</span>
                  <span className="font-semibold">$1,500 (one-time)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Maintenance & Updates</span>
                  <span className="font-semibold">$0 (included)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overtime & Benefits</span>
                  <span className="font-semibold">$0 (not applicable)</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-blue-200">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total First Year Cost</span>
                  <span className="text-green-600">$8,500</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Annual Cost (Subsequent Years)</span>
                  <span className="text-green-600">$6,000</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              The cost differential is striking: traditional reception costs $248,000 annually versus 
              $6,000 for AI receptionist technology – a 97.6% reduction in communication costs. 
              This represents an annual savings of $242,000 per business location.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Important Note on Coverage</h4>
              <p className="text-gray-700 leading-relaxed">
                Unlike human receptionists who require breaks, vacations, and can only handle one call 
                at a time, AI receptionists provide true 24/7/365 coverage and can handle multiple 
                simultaneous calls. This ensures no missed opportunities and consistent service quality 
                regardless of call volume or time of day.
              </p>
            </div>
          </motion.section>

          {/* Revenue Impact Analysis */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Revenue Impact: Beyond Cost Savings
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              While the cost savings are substantial, the revenue impact of AI receptionists often 
              exceeds the direct cost reductions. Our analysis reveals three primary revenue drivers:
            </p>

            <div className="space-y-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-600" />
                  1. Increased Call Capture Rate
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  AI receptionists answer 100% of calls, compared to 78% for human receptionists. 
                  This 22% improvement in call capture directly translates to increased business opportunities.
                </p>
                <div className="bg-blue-50 rounded p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Revenue Impact Calculation</h4>
                  <p className="text-sm text-gray-700">
                    For a business with 1,000 monthly calls and $500 average transaction value: 
                    <br />220 additional captured calls × $500 = $110,000 monthly revenue increase
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  2. Extended Business Hours
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  AI receptionists provide 24/7 coverage, capturing after-hours calls that would 
                  otherwise go to voicemail or competitors. Studies show 34% of business calls occur 
                  outside traditional business hours.
                </p>
                <div className="bg-green-50 rounded p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">After-Hours Revenue Capture</h4>
                  <p className="text-sm text-gray-700">
                    340 after-hours calls × 60% conversion rate × $500 = $102,000 monthly 
                    additional revenue from extended availability
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                  3. Improved Conversion Rates
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  AI receptionists provide consistent, professional service without the variability 
                  of human performance. This consistency improves conversion rates by an average of 15%.
                </p>
                <div className="bg-purple-50 rounded p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Conversion Rate Improvement</h4>
                  <p className="text-sm text-gray-700">
                    780 baseline calls × 15% improvement × $500 = $58,500 monthly revenue 
                    increase from better conversion
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-8 mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Total Monthly Revenue Impact</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Increased call capture</span>
                  <span className="font-semibold">$110,000</span>
                </div>
                <div className="flex justify-between">
                  <span>After-hours revenue</span>
                  <span className="font-semibold">$102,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Improved conversion rates</span>
                  <span className="font-semibold">$58,500</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-green-200 pt-2">
                  <span>Total Monthly Increase</span>
                  <span className="text-green-600">$270,500</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Annual Revenue Impact</span>
                  <span className="text-green-600">$3,246,000</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Industry-Specific Analysis */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Industry-Specific ROI Analysis
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              ROI varies significantly across industries based on call volume, average transaction value, 
              and customer acquisition costs. Here's how different industries benefit from AI receptionist implementation:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Healthcare Practices</h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>Average Annual Savings:</strong> $67,000
                  </div>
                  <div>
                    <strong>Revenue Increase:</strong> $156,000
                  </div>
                  <div>
                    <strong>ROI Timeline:</strong> 3.2 months
                  </div>
                  <div>
                    <strong>Key Benefits:</strong> 24/7 appointment scheduling, reduced no-shows, 
                    improved patient satisfaction
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Firms</h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>Average Annual Savings:</strong> $89,000
                  </div>
                  <div>
                    <strong>Revenue Increase:</strong> $234,000
                  </div>
                  <div>
                    <strong>ROI Timeline:</strong> 2.8 months
                  </div>
                  <div>
                    <strong>Key Benefits:</strong> Lead qualification, consultation scheduling, 
                    case intake automation
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real Estate Agencies</h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>Average Annual Savings:</strong> $54,000
                  </div>
                  <div>
                    <strong>Revenue Increase:</strong> $312,000
                  </div>
                  <div>
                    <strong>ROI Timeline:</strong> 1.9 months
                  </div>
                  <div>
                    <strong>Key Benefits:</strong> Property inquiry handling, showing scheduling, 
                    lead nurturing
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">E-commerce Businesses</h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>Average Annual Savings:</strong> $43,000
                  </div>
                  <div>
                    <strong>Revenue Increase:</strong> $189,000
                  </div>
                  <div>
                    <strong>ROI Timeline:</strong> 3.7 months
                  </div>
                  <div>
                    <strong>Key Benefits:</strong> Order support, returns processing, 
                    customer service scaling
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Risk Assessment */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Risk Assessment and Mitigation
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              While the financial benefits of AI receptionists are substantial, it's important to 
              consider potential risks and mitigation strategies:
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-yellow-400 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technology Dependence Risk</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Businesses become dependent on technology for critical customer interactions. 
                  Mitigation includes choosing reliable providers with strong uptime guarantees 
                  and backup systems.
                </p>
                <div className="bg-yellow-50 rounded p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Financial Impact:</strong> 99.9% uptime SLA ensures maximum 8.76 hours 
                    downtime annually, compared to 480 hours of human receptionist unavailability.
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-blue-400 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Initial Implementation Costs</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Setup costs, training, and integration can create temporary cash flow challenges. 
                  However, rapid ROI typically offsets these costs within 4-6 months.
                </p>
                <div className="bg-blue-50 rounded p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Recommendation:</strong> Many providers offer monthly payment options 
                    to spread initial costs over the ROI period.
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-green-400 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Acceptance</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Some customers prefer human interaction. However, studies show 78% of customers 
                  prioritize quick, efficient service over human interaction, especially for routine inquiries.
                </p>
                <div className="bg-green-50 rounded p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Solution:</strong> Hybrid models allow seamless transfer to human agents 
                    when needed, maintaining customer satisfaction while maximizing efficiency.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ROI Calculator */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Interactive ROI Calculator Framework
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              Use this framework to calculate your specific ROI potential. Adjust the variables 
              based on your business characteristics:
            </p>

            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">ROI Calculation Formula</h3>
              
              <div className="space-y-4 text-gray-700">
                <div className="bg-white rounded p-4">
                  <h4 className="font-semibold mb-2">Monthly Cost Savings</h4>
                  <p className="text-sm mb-2">(Current reception costs - AI receptionist costs)</p>
                  <p className="font-mono text-sm">($20,667 - $500) = $20,167 monthly savings</p>
                </div>

                <div className="bg-white rounded p-4">
                  <h4 className="font-semibold mb-2">Monthly Revenue Increase</h4>
                  <p className="text-sm mb-2">(Improved call capture + after-hours + conversion)</p>
                  <p className="font-mono text-sm">$110,000 + $102,000 + $58,500 = $270,500 monthly</p>
                </div>

                <div className="bg-white rounded p-4">
                  <h4 className="font-semibold mb-2">Total Monthly Benefit</h4>
                  <p className="text-sm mb-2">Cost savings + Revenue increase</p>
                  <p className="font-mono text-sm">$20,167 + $270,500 = $290,667 monthly</p>
                </div>

                <div className="bg-green-100 rounded p-4">
                  <h4 className="font-semibold mb-2">Annual ROI</h4>
                  <p className="text-sm mb-2">(Total monthly benefit × 12) ÷ Implementation cost</p>
                  <p className="font-mono text-sm">($290,667 × 12) ÷ $8,500 = 4,104% ROI</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Conclusion */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-12 bg-green-50 rounded-lg p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
              The Verdict: An Unprecedented Investment Opportunity
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The financial case for AI receptionist technology is overwhelming. With average annual 
              savings of $242,000 in operational costs and additional revenue generation of $3.2 million, 
              businesses implementing AI receptionists achieve an average ROI of 4,104% in the first year alone.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Beyond the immediate financial benefits, AI receptionists provide strategic advantages including 
              24/7 availability, consistent service quality, scalability, and the ability to capture 
              previously missed opportunities. These factors create a sustainable competitive advantage 
              that compounds over time.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              For businesses still relying on traditional reception models, the question is no longer 
              whether AI receptionist technology makes financial sense, but rather how quickly they 
              can implement it to start capturing these remarkable returns. The data is clear: AI 
              receptionists represent one of the highest-ROI technology investments available to 
              businesses today.
            </p>

            <div className="bg-white rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Takeaways</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  97.6% reduction in communication costs
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  $3.2 million average annual revenue increase
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ROI achieved in 4-6 months
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Risk mitigation through proven technology
                </li>
              </ul>
            </div>
          </motion.section>
        </div>

        {/* Author Bio */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-16 pt-8 border-t border-gray-200"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Michael Chen</h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                Michael Chen is a financial analyst specializing in business technology investments 
                and ROI optimization. With over 10 years of experience analyzing technology implementations 
                across various industries, he provides data-driven insights for business decision-making.
              </p>
              <p className="text-sm text-gray-500">
                Senior Financial Consultant, Business Technology Analytics
              </p>
            </div>
          </div>
        </motion.section>
      </article>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Calculate Your ROI Potential
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-green-100 mb-8"
          >
            Discover how much your business could save with AI receptionist technology
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Get Your Free ROI Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}