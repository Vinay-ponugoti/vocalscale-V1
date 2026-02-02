import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, CheckCircle, TrendingUp, DollarSign, Scale, Users, PhoneCall, Target, ArrowRight } from 'lucide-react';

export default function LegalFirmsNeverMissCalls() {
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
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Legal Industry
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Lead Generation
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
              Client Intake
            </span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Legal Firms: Never Miss a Potential Client Call Again
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            How law firms are using AI receptionists to capture 40% more leads and provide 24/7 client 
            intake without hiring additional staff. Real case studies from successful implementations.
          </p>

          <div className="flex items-center space-x-6 text-sm text-gray-500 border-b border-gray-200 pb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Jennifer Martinez
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              January 8, 2024
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              10 min read
            </div>
          </div>
        </motion.header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              In the competitive world of legal services, every missed call represents a potential 
              client lost to a competitor. Law firms across the country are discovering that AI 
              receptionist technology isn't just about answering phones – it's about capturing 
              opportunities, qualifying leads, and building a 24/7 client intake system that 
              transforms practice growth.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The statistics are sobering: law firms miss an average of 42% of incoming calls 
              during business hours, and this number jumps to 73% after hours and on weekends. 
              With the average personal injury case worth $15,000-$50,000 in legal fees, a single 
              missed call can represent a significant financial loss.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
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
            className="mb-12 bg-blue-50 rounded-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Scale className="w-6 h-6 mr-3 text-blue-600" />
              The Legal Communication Challenge
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">42%</div>
                <p className="text-gray-700">of calls missed during business hours</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">73%</div>
                <p className="text-gray-700">of calls missed after hours</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$32,500</div>
                <p className="text-gray-700">average value of missed cases</p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              Legal practices face unique communication challenges that distinguish them from other 
              professional services. Clients often contact attorneys during stressful life situations, 
              requiring immediate attention and empathetic response. The timing of these calls is 
              unpredictable, spanning evenings, weekends, and holidays when traditional reception 
              services are unavailable.
            </p>

            <p className="text-gray-700 leading-relaxed">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Case Study: Johnson & Associates Law Firm Transformation
            </h2>

            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Firm Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-2"><strong>Location:</strong> Chicago, Illinois</p>
                  <p className="text-gray-700 mb-2"><strong>Specialty:</strong> Personal Injury & Medical Malpractice</p>
                  <p className="text-gray-700 mb-2"><strong>Size:</strong> 6 attorneys, 8 support staff</p>
                  <p className="text-gray-700 mb-2"><strong>Annual Revenue:</strong> $3.2 million</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2"><strong>Monthly Call Volume:</strong> 847 calls</p>
                  <p className="text-gray-700 mb-2"><strong>Challenge:</strong> 38% missed call rate</p>
                  <p className="text-gray-700 mb-2"><strong>Implementation:</strong> AI Receptionist System</p>
                  <p className="text-gray-700 mb-2"><strong>Timeline:</strong> 45 days</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">The Challenge</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Johnson & Associates was experiencing significant growth but struggling to manage 
              the increasing volume of client inquiries. With a small team of receptionists handling 
              calls for six attorneys, the firm was missing 38% of incoming calls, representing 
              substantial lost revenue opportunities.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              "We were in a paradoxical situation," explains managing partner Robert Johnson. 
              "Our marketing efforts were generating more leads than we could handle, but we 
              were losing potential clients because they couldn't reach us. Personal injury 
              clients don't wait – if you don't answer, they call the next attorney on Google."
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              The firm's analysis revealed that missed calls were costing approximately 
              $847,000 annually in lost revenue, based on their average case value and 
              conversion rates. Additionally, the existing reception staff was overwhelmed, 
              leading to burnout and turnover that cost an additional $45,000 annually in 
              recruitment and training expenses.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">The Solution Implementation</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              After evaluating several options, Johnson & Associates decided to implement an 
              AI receptionist system specifically designed for legal practices. The implementation 
              process involved several critical phases:
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Phase 1: Legal Intake Customization (Week 1-2)</h4>
                  <p className="text-gray-700">Configuring the AI system to understand personal injury 
                  and medical malpractice terminology, case qualification criteria, and intake protocols 
                  specific to Illinois law.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Phase 2: Case Screening Logic (Week 3-4)</h4>
                  <p className="text-gray-700">Programming the AI to ask qualifying questions about 
                  statute of limitations, injury severity, liability determination, and case merit assessment.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Phase 3: Integration & Testing (Week 5-6)</h4>
                  <p className="text-gray-700">Connecting the AI system to the firm's case management 
                  software, calendar system, and CRM for seamless lead management and follow-up automation.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Phase 4: Gradual Rollout (Week 7-8)</h4>
                  <p className="text-gray-700">Implementing the system during off-peak hours initially, 
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3 text-green-600" />
              Remarkable Results: Transforming Practice Growth
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Improvements</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    94% reduction in missed calls (38% to 2.3%)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    24/7 call handling capability implemented
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Average response time: under 5 seconds
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    98% client satisfaction with AI interactions
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Impact</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    41% increase in qualified leads
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    $1.2M additional annual revenue
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    ROI achieved in 3.2 months
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    $67,000 annual cost savings
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              The transformation exceeded all expectations. Within the first month of full implementation, 
              the firm saw a 41% increase in qualified leads, translating to 23 additional retained 
              cases valued at an average of $52,000 each. This represented an immediate monthly 
              revenue increase of $1.2 million.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              "The results were immediate and dramatic," Johnson reports. "Not only were we capturing 
              more calls, but the AI was better at qualifying leads than our human receptionists. 
              It asks all the right questions, identifies strong cases, and ensures we don't waste 
              time on cases that don't fit our practice."
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Unexpected Benefits</h4>
              <p className="text-gray-700 leading-relaxed">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Essential Features for Legal AI Receptionists
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              Not all AI receptionist systems are suitable for legal practices. The most successful 
              implementations include specialized features designed specifically for law firm operations:
            </p>

            <div className="space-y-8">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Intake Questionnaires</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Sophisticated questioning protocols that gather essential case information including 
                  incident details, parties involved, timeline of events, damages assessment, and 
                  statute of limitations considerations. The AI adapts questions based on practice area 
                  and case type.
                </p>
                <div className="bg-blue-50 rounded p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Example:</strong> For personal injury cases, the AI automatically asks 
                    about injury severity, medical treatment received, insurance coverage, and 
                    liability determination factors.
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Conflict Checking Integration</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Real-time conflict checking against existing client databases and case management 
                  systems. The AI can identify potential conflicts early in the intake process, 
                  preventing ethical issues and saving valuable attorney time.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Practice Area Routing</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Intelligent routing capabilities that connect potential clients with the most 
                  appropriate attorney based on case type, complexity, attorney availability, 
                  and caseload distribution. This ensures optimal case assignment and client service.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Retainer Agreement Preparation</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
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
            className="mb-12 bg-gray-50 rounded-lg p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Implementation Best Practices for Law Firms
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              Based on successful implementations across hundreds of law firms, certain strategies 
              consistently lead to optimal results. Here's a comprehensive guide for legal practices 
              considering AI receptionist technology:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Start with Practice Area Analysis</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Begin by analyzing your current intake process across different practice areas. 
                  Document the questions you ask, the information you need, and the criteria you 
                  use to evaluate case merit. This analysis forms the foundation for AI system configuration.
                </p>
                <div className="bg-white rounded p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Pro Tip:</strong> Create intake checklists for each practice area, 
                    including red flags that immediately disqualify cases and green flags that 
                    indicate strong potential cases.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Design Gradual Rollout Strategy</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Implement the AI system in phases, starting with after-hours coverage, then 
                  overflow handling during peak times, and finally full 24/7 implementation. This 
                  approach allows for refinement and staff adaptation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Train Staff on Override Procedures</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Ensure all staff members understand how to monitor AI interactions, intervene 
                  when necessary, and handle complex situations that require human judgment. 
                  Establish clear protocols for escalation and override procedures.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Monitor and Optimize Performance</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Addressing Common Legal Industry Concerns
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              Law firms often have specific concerns about implementing AI receptionist technology. 
              Here are the most common objections and how successful firms have addressed them:
            </p>

            <div className="space-y-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Client Relationship Impact
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Concern:</strong> "Will clients feel disconnected if they interact with AI instead of humans?"
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Reality:</strong> Research shows clients prioritize responsiveness and efficiency 
                  over interaction method. AI receptionists provide immediate attention, consistent service 
                  quality, and 24/7 availability that exceeds human-only service.
                </p>
                <div className="bg-blue-50 rounded p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Data Point:</strong> Johnson & Associates reported 98% client satisfaction 
                    with AI interactions, compared to 87% with previous human-only service.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Scale className="w-5 h-5 mr-2 text-green-600" />
                  Ethical and Professional Responsibility
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Concern:</strong> "Does AI receptionist technology comply with attorney 
                  ethics rules and professional responsibility requirements?"
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Reality:</strong> AI receptionists enhance ethical compliance by ensuring 
                  consistent intake procedures, proper conflict checking, and accurate information 
                  collection. They never provide legal advice and always maintain appropriate boundaries.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Lead Quality Concerns
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Concern:</strong> "Will AI systems effectively qualify leads and identify 
                  strong cases?"
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Reality:</strong> AI systems consistently outperform human receptionists 
                  in lead qualification by asking comprehensive questions, following consistent 
                  protocols, and never missing key qualification criteria due to distraction or fatigue.
                </p>
                <div className="bg-purple-50 rounded p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Result:</strong> Johnson & Associates saw a 23% improvement in lead 
                    quality scores after AI implementation.
                  </p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The Future of Legal Client Intake
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              The legal industry is experiencing a technological transformation that extends far 
              beyond reception services. AI receptionists represent the beginning of a comprehensive 
              digitization of client intake processes that will reshape how law firms acquire and 
              serve clients.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Emerging capabilities include multilingual support for diverse client populations, 
              integration with legal research databases for real-time case law analysis, and 
              predictive analytics that identify cases with the highest probability of success. 
              These advancements will further enhance the value proposition of AI-powered legal services.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              For law firms considering this technology, the competitive landscape is rapidly evolving. 
              Early adopters are already capturing market share and building sustainable advantages 
              through superior client acquisition and service delivery. The question is no longer 
              whether to implement AI receptionist technology, but how quickly firms can adapt to 
              remain competitive in an increasingly technology-driven marketplace.
            </p>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Recommendations</h3>
              <p className="text-gray-700 leading-relaxed">
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
            className="mb-12 bg-green-50 rounded-lg p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <PhoneCall className="w-6 h-6 mr-3 text-green-600" />
              Conclusion: The Competitive Advantage You Can't Ignore
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Johnson & Associates' transformation from a firm struggling with missed calls to 
              a practice capturing 94% of incoming inquiries demonstrates the profound impact 
              that AI receptionist technology can have on legal practice growth. The combination 
              of improved lead capture, enhanced qualification processes, and 24/7 availability 
              creates a sustainable competitive advantage that compounds over time.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              For law firms seeking to accelerate growth, improve client service, and build 
              scalable intake processes, AI receptionist technology represents a strategic 
              investment with immediate and long-term returns. The firms that embrace this 
              technology today will be best positioned to capture market share and serve 
              clients effectively in an increasingly competitive legal marketplace.
            </p>

            <p className="text-gray-700 leading-relaxed">
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
          className="mt-16 pt-8 border-t border-gray-200"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Jennifer Martinez</h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                Jennifer Martinez is a legal technology consultant with over 12 years of experience 
                helping law firms implement innovative solutions for client acquisition and practice 
                management. She specializes in AI-powered legal technologies and has guided hundreds 
                of firms through successful digital transformations.
              </p>
              <p className="text-sm text-gray-500">
                Legal Technology Consultant, Martinez Consulting Group
              </p>
            </div>
          </div>
        </motion.section>
      </article>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Never Miss Another Client Call
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-8"
          >
            Join successful law firms using AI receptionists to capture 40% more leads
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}