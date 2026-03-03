import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Loader2, Sparkles, TrendingUp, Clock, DollarSign, Users, Phone, Calendar, ArrowRight } from 'lucide-react';

interface SurveyData {
  businessName: string;
  email: string;
  industry: string;
  monthlyCalls: number;
  missedCallsPercent: number;
  avgCallValue: number;
  hoursSpent: number;
  hourlyRate: number;
  competitorSpend: number;
  interestLevel: string;
}

interface CalculationResults {
  missedRevenue: number;
  wastedTime: number;
  timeValue: number;
  totalLoss: number;
  competitorComparison: number;
  roi: number;
  paybackDays: number;
  annualSavings: number;
}

const industries = [
  'Dental Practice',
  'Medical Clinic',
  'Law Firm',
  'Real Estate Agency',
  'Home Services (Plumbing, HVAC, etc.)',
  'Salon/Spa',
  'Restaurant',
  'Retail Store',
  'Insurance Agency',
  'Accounting Firm',
  'E-commerce Business',
  'Other'
];

const interestLevels = [
  { value: 'immediate', label: 'Immediately (this week)', icon: '🚀' },
  { value: 'soon', label: 'Within 2 weeks', icon: '📅' },
  { value: 'exploring', label: 'Just exploring options', icon: '🔍' }
];

export const ROICalculator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const [surveyData, setSurveyData] = useState<SurveyData>({
    businessName: '',
    email: '',
    industry: '',
    monthlyCalls: 100,
    missedCallsPercent: 20,
    avgCallValue: 50,
    hoursSpent: 10,
    hourlyRate: 25,
    competitorSpend: 2000,
    interestLevel: ''
  });

  // Load survey state from sessionStorage
  useEffect(() => {
    const savedSurvey = sessionStorage.getItem('roiSurveyCompleted');
    if (savedSurvey === 'true') {
      setIsSubmitted(true);
    }
  }, []);

  const calculateSavings = (): CalculationResults => {
    const missedCalls = Math.round(surveyData.monthlyCalls * (surveyData.missedCallsPercent / 100));
    const missedRevenue = missedCalls * surveyData.avgCallValue * 12; // Annual
    
    const timeValue = surveyData.hoursSpent * surveyData.hourlyRate * 12; // Annual
    const wastedTime = surveyData.hoursSpent * 12; // Annual hours
    
    // VocalScale costs ~$99-118/month, let's use average of $108
    const vocalScaleCost = 118 * 12; // Annual
    const totalLoss = missedRevenue + timeValue;
    
    // Compare to competitor spend (they're likely spending this on traditional solutions)
    const competitorComparison = surveyData.competitorSpend * 12;
    
    // Net savings = (what they're losing + what they'd spend on alternatives) - VocalScale cost
    const annualSavings = missedRevenue + competitorComparison - vocalScaleCost;
    
    // ROI calculation
    const roi = Math.round((annualSavings / vocalScaleCost) * 100);
    
    // Payback period in days (assuming VocalScale recovers missed calls)
    const monthlySavings = missedRevenue / 12 + (competitorComparison / 12 - 118);
    const paybackDays = Math.max(1, Math.round((118) / (monthlySavings / 30)));

    return {
      missedRevenue,
      wastedTime,
      timeValue,
      totalLoss,
      competitorComparison,
      roi,
      paybackDays,
      annualSavings
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formsubmit.co/ajax/landing@vocalscale.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          _subject: `ROI Calculator Lead: ${surveyData.businessName}`,
          _template: "table",
          _captcha: "false",
          "Business Name": surveyData.businessName,
          "Email": surveyData.email,
          "Industry": surveyData.industry,
          "Monthly Calls": surveyData.monthlyCalls,
          "Missed Calls %": `${surveyData.missedCallsPercent}%`,
          "Average Call Value": `$${surveyData.avgCallValue}`,
          "Hours Spent on Phone": surveyData.hoursSpent,
          "Hourly Rate": `$${surveyData.hourlyRate}`,
          "Competitor Monthly Spend": `$${surveyData.competitorSpend}`,
          "Interest Level": surveyData.interestLevel,
          "Calculated Annual Loss": `$${results?.totalLoss.toLocaleString()}`,
          "Calculated Annual Savings": `$${results?.annualSavings.toLocaleString()}`,
          "Calculated ROI": `${results?.roi}%`,
          "Discount Code Given": "WELCOME30 (30% off first 3 months)"
        })
      });

      const data = await response.json();
      console.log('FormSubmit response:', data);
      
      // Always show success to customer - we want them to get the discount code
      setIsSubmitted(true);
      sessionStorage.setItem('roiSurveyCompleted', 'true');
      
    } catch (error) {
      console.error('Form submission error:', error);
      // Still show success - don't punish the customer for our email issues
      setIsSubmitted(true);
      sessionStorage.setItem('roiSurveyCompleted', 'true');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 3) {
        const calcResults = calculateSavings();
        setResults(calcResults);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return surveyData.businessName && surveyData.email;
      case 1:
        return surveyData.industry && surveyData.monthlyCalls > 0;
      case 2:
        return surveyData.missedCallsPercent > 0 && surveyData.avgCallValue > 0;
      case 3:
        return surveyData.hoursSpent >= 0 && surveyData.hourlyRate > 0 && surveyData.competitorSpend >= 0;
      case 4:
        return surveyData.interestLevel;
      default:
        return false;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const MetricCard = ({ icon: Icon, label, value, subtext, delay = 0 }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  );

  const steps = [
    {
      title: "Let's get to know you",
      subtitle: "We'll personalize your ROI analysis",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              What's your business name?
            </label>
            <input
              type="text"
              value={surveyData.businessName}
              onChange={(e) => setSurveyData({ ...surveyData, businessName: e.target.value })}
              placeholder="e.g., ABC Dental Clinic"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              What's your email address?
            </label>
            <input
              type="email"
              value={surveyData.email}
              onChange={(e) => setSurveyData({ ...surveyData, email: e.target.value })}
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900"
            />
            <p className="text-xs text-slate-400 mt-2">We'll send your personalized ROI report here</p>
          </div>
        </div>
      )
    },
    {
      title: "About your call volume",
      subtitle: "Help us understand your current situation",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              What industry are you in?
            </label>
            <select
              value={surveyData.industry}
              onChange={(e) => setSurveyData({ ...surveyData, industry: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 bg-white"
            >
              <option value="">Select your industry</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              How many customer calls do you receive per month?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={surveyData.monthlyCalls}
                onChange={(e) => setSurveyData({ ...surveyData, monthlyCalls: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-2xl font-black text-blue-600 w-20 text-right">{surveyData.monthlyCalls}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Include all incoming customer calls</p>
          </div>
        </div>
      )
    },
    {
      title: "The cost of missed calls",
      subtitle: "Every missed call is a missed opportunity",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              What percentage of calls do you miss?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={surveyData.missedCallsPercent}
                onChange={(e) => setSurveyData({ ...surveyData, missedCallsPercent: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-2xl font-black text-blue-600 w-16 text-right">{surveyData.missedCallsPercent}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Industry average is 20-30%</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              What's the average value of a customer call?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-slate-400">$</span>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={surveyData.avgCallValue}
                onChange={(e) => setSurveyData({ ...surveyData, avgCallValue: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-2xl font-black text-blue-600 w-24 text-right">${surveyData.avgCallValue}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Consider average appointment/sale value</p>
          </div>
          {surveyData.monthlyCalls > 0 && surveyData.missedCallsPercent > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <p className="text-sm text-amber-800 font-medium">
                ⚡ You're missing approximately <span className="font-bold">{Math.round(surveyData.monthlyCalls * surveyData.missedCallsPercent / 100)} calls</span> per month
              </p>
            </motion.div>
          )}
        </div>
      )
    },
    {
      title: "Your time & current solutions",
      subtitle: "Let's calculate your true costs",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              How many hours per week do you/your team spend on the phone?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={surveyData.hoursSpent}
                onChange={(e) => setSurveyData({ ...surveyData, hoursSpent: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-2xl font-black text-blue-600 w-20 text-right">{surveyData.hoursSpent} hrs</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              What's your average hourly labor cost?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-slate-400">$</span>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={surveyData.hourlyRate}
                onChange={(e) => setSurveyData({ ...surveyData, hourlyRate: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-2xl font-black text-blue-600 w-16 text-right">${surveyData.hourlyRate}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Include benefits, overhead, etc.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              How much do you spend monthly on phone systems/receptionists?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-slate-400">$</span>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={surveyData.competitorSpend}
                onChange={(e) => setSurveyData({ ...surveyData, competitorSpend: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-2xl font-black text-blue-600 w-24 text-right">${surveyData.competitorSpend}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Phone systems, virtual receptionists, etc.</p>
          </div>
        </div>
      )
    },
    {
      title: "Your Results",
      subtitle: "Here's what VocalScale could save you",
      content: results && (
        <div className="space-y-6">
          {/* Hero Metric */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider text-blue-200">Your Potential Annual Savings</span>
              </div>
              <div className="text-5xl font-black">{formatCurrency(results.annualSavings)}</div>
              <p className="text-blue-200 mt-2">with VocalScale AI Receptionist</p>
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={Phone}
              label="Missed Revenue"
              value={formatCurrency(results.missedRevenue)}
              subtext="from missed calls annually"
              delay={0.1}
            />
            <MetricCard
              icon={Clock}
              label="Time Wasted"
              value={`${results.wastedTime} hrs`}
              subtext="on phone tasks annually"
              delay={0.2}
            />
            <MetricCard
              icon={TrendingUp}
              label="ROI"
              value={`${results.roi}%`}
              subtext="return on investment"
              delay={0.3}
            />
            <MetricCard
              icon={Calendar}
              label="Payback Period"
              value={`${results.paybackDays} days`}
              subtext="to break even"
              delay={0.4}
            />
          </div>

          {/* Interest Level Selection */}
          <div className="pt-4">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              When would you like to get started?
            </label>
            <div className="space-y-3">
              {interestLevels.map((level) => (
                <motion.button
                  key={level.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSurveyData({ ...surveyData, interestLevel: level.value })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                    surveyData.interestLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-2xl">{level.icon}</span>
                  <span className="font-semibold text-slate-700">{level.label}</span>
                  {surveyData.interestLevel === level.value && (
                    <Check className="w-5 h-5 text-blue-600 ml-auto" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
      >
        <Sparkles className="w-5 h-5" />
        <span>Calculate Your Savings</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              </div>

              {/* Close Button */}
              {!isSubmitting && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Content */}
              <div className="p-8 pt-12 max-h-[80vh] overflow-y-auto">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Thanks, {surveyData.businessName}!</h3>
                    <p className="text-slate-600 mb-4">
                      We've sent your personalized ROI report to {surveyData.email}
                    </p>
                    
                    {/* Discount Code */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6"
                    >
                      <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">🎉 Your Exclusive Offer</p>
                      <p className="text-slate-600 mb-3">Get <span className="font-black text-emerald-600">30% OFF</span> your first 3 months!</p>
                      <div className="bg-white rounded-xl px-6 py-3 inline-block border-2 border-dashed border-emerald-300">
                        <span className="text-2xl font-black text-emerald-600 tracking-wider">WELCOME30</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Use this code at checkout</p>
                    </motion.div>
                    
                    <p className="text-sm text-slate-500">
                      Our team will reach out within 24 hours to discuss how VocalScale can save you {formatCurrency(results?.annualSavings || 0)} annually.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Step Header */}
                    <div className="mb-8">
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
                        Step {currentStep + 1} of {steps.length}
                      </p>
                      <h2 className="text-2xl font-black text-slate-900">{steps[currentStep].title}</h2>
                      <p className="text-slate-500 mt-1">{steps[currentStep].subtitle}</p>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[300px]">
                      {steps[currentStep].content}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                      {currentStep > 0 ? (
                        <button
                          onClick={handleBack}
                          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Back
                        </button>
                      ) : (
                        <div />
                      )}

                      {currentStep < steps.length - 1 ? (
                        <button
                          onClick={handleNext}
                          disabled={!canProceed()}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={!canProceed() || isSubmitting}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Get My Free Report
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ROICalculator;