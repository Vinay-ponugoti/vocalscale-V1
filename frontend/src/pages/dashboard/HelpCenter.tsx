import { useState, useRef, useEffect } from 'react';
import { Search, Rocket, Receipt, Ticket, X, CheckCircle2, Info, Phone, Loader2, Mail, MessageSquare, ChevronDown } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { PAGE_CONTAINER } from '../../constants/layout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import HelpCategoryCard from '../../components/HelpCategoryCard';
import FAQItem from '../../components/FAQItem';
import { SEO } from '../../components/SEO';
import SchemaMarkup from '../../components/SchemaMarkup';
import { useToast } from '@/hooks/useToast';
import { env } from '@/config/env';
import { getAuthHeader } from '@/lib/api';
// FloatingChat removed

const VIDEO_URL = "https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/landing.mp4";

// Single source of truth for the FAQ — rendered on-page AND emitted as
// FAQPage structured data, so the visible answers and the schema never drift.
const FAQS: { question: string; answer: string }[] = [
  {
    question: 'How much does VocalScale cost?',
    answer:
      'Plans start at $399/month for Starter (750 AI minutes, ~250 calls) and $999/month for Professional (2,500 AI minutes, ~830 calls). Annual billing saves around 20%. Extra minutes are billed at $0.079–$0.089 per minute depending on your plan, and there are no setup fees.',
  },
  {
    question: 'How fast does my agent respond to callers?',
    answer:
      'Our AI uses ultra-low-latency processing (around 500ms), so the conversation feels natural and human-like without awkward pauses.',
  },
  {
    question: 'Can I train my agent on my own business data?',
    answer:
      'Yes. Upload PDFs or Word docs, or paste your website URL, and your agent learns your pricing, services, hours, and FAQs so it answers caller questions accurately.',
  },
  {
    question: 'Which languages does my agent support?',
    answer:
      'Seven languages — English, Spanish, French, German, Italian, Dutch, and Japanese — each answered in a natural, native-sounding voice. Just pick a voice in the matching language and the AI greets and converses in it.',
  },
  {
    question: 'Can my agent transfer calls to a person?',
    answer:
      'Yes. Set escalation rules and your agent will warm-transfer the call to a live agent for complex or high-priority requests. If transfers are off, it captures a detailed message and callback number instead.',
  },
  {
    question: 'What happens if I go over my included minutes?',
    answer:
      'Additional minutes are billed at $0.079–$0.089 per minute so calls are never dropped. You can enable Auto-Refill in Billing Settings to keep service uninterrupted during busy months.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes — there are no long-term contracts. Manage or cancel your subscription anytime from the Billing page, and you keep access until the end of your current cycle.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'Most businesses are live in minutes: upload your knowledge base, choose a voice and tone, set your greeting and hours, and connect a phone number. No engineering required.',
  },
];

interface Article {
  title: string;
  content: React.ReactNode;
}

const VideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Autoplay prevented:", error);
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      muted
      playsInline
      crossOrigin="anonymous"
      preload="metadata"
      loop
      className="w-full h-full object-cover rounded-xl"
    >
      <source src={`${src}#t=0.001`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

const HelpCenter = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [query, setQuery] = useState('');
  const { showToast } = useToast();

  const q = query.trim().toLowerCase();
  const filteredFaqs = q
    ? FAQS.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(q))
    : FAQS;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  
  // Ticket form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketData, setTicketData] = useState({
    email: '',
    ticketType: '',
    subject: '',
    message: ''
  });

  const ticketTypes = [
    { value: 'refund', label: 'Refund Request' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'bug', label: 'Bug Issue' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'general', label: 'General Inquiry' }
  ];

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketData.email || !ticketData.ticketType || !ticketData.message) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${env.API_URL}/help/tickets`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          email: ticketData.email,
          category: ticketData.ticketType,
          subject: ticketData.subject,
          message: ticketData.message,
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        showToast('Ticket submitted successfully!', 'success');
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setIsFormOpen(false);
          setTicketData({
            email: '',
            ticketType: '',
            subject: '',
            message: ''
          });
        }, 2000);
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showToast('Failed to submit ticket. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  const articles: Record<string, Article> = {
    'AI Setup & Training': {
      title: 'Agent setup and training',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Building a great agent starts with providing high-quality training data. Our platform allows you to upload various sources to make your AI an expert in your business.
          </p>

          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 text-sm mb-3 flex items-center gap-2">
              <Info size={16} /> Key Training Sources
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-[13px] text-blue-800">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span><strong>PDF/Docx Uploads:</strong> Upload manuals, pricing sheets, and company policies.</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-blue-800">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span><strong>Website URL:</strong> Paste your URL and we'll crawl your site for information.</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-blue-800">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span><strong>Custom QA:</strong> Directly input common questions and specific answers.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 text-sm">How to train effectively</h4>
            <div className="text-[13px] text-slate-600 leading-relaxed space-y-3">
              <p><strong>Step 1: Gather Your Data</strong></p>
              <p>Collect all relevant business documents. This includes your latest pricing sheets, service descriptions, cancellation policies, and operational manuals.</p>

              <p><strong>Step 2: Upload to Knowledge Base</strong></p>
              <p>Navigate to the "Knowledge Base" tab in your dashboard. Use the "Upload" button to add your PDF or Docx files. Alternatively, paste your website's FAQ URL.</p>

              <p><strong>Step 3: Test and Refine</strong></p>
              <p>After uploading, use the test chat to ask questions. If your agent misses something, add a specific "Q&A" entry to cover that gap.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 text-sm">Best practices for training</h4>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              1. Keep documents concise and clear.<br />
              2. Use bullet points for structured information like pricing.<br />
              3. Regularly update your knowledge base as your business evolves.
            </p>
          </div>
        </div>
      )
    },
    'Call Management': {
      title: 'Call management',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Configure how your agent handles incoming calls, transfers, and after-hours logic to ensure a seamless experience for every caller.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="border border-slate-100 p-4 rounded-xl hover:border-blue-100 transition-colors">
              <h5 className="font-bold text-slate-900 text-sm mb-1">Smart Routing</h5>
              <p className="text-xs text-slate-500">Route calls based on intent detection (e.g., 'Billing' goes to Finance).</p>
            </div>
            <div className="border border-slate-100 p-4 rounded-xl hover:border-blue-100 transition-colors">
              <h5 className="font-bold text-slate-900 text-sm mb-1">Human Transfers</h5>
              <p className="text-xs text-slate-500">Define 'Escalation Triggers' to transfer complex calls to live agents.</p>
            </div>
            <div className="border border-slate-100 p-4 rounded-xl hover:border-blue-100 transition-colors">
              <h5 className="font-bold text-slate-900 text-sm mb-1">After-Hours Logic</h5>
              <p className="text-xs text-slate-500">Set specific behaviors for weekends, holidays, or late-night calls.</p>
            </div>
          </div>
        </div>
      )
    },
    'Billing & Usage': {
      title: 'Billing and usage',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Transparency is key. Here is how we calculate your usage and manage your subscription.
          </p>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h4 className="font-semibold text-slate-900 text-sm mb-4">Pricing model</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Included Minutes</span>
                <span className="font-bold text-slate-900">750 (Starter) · 2,500 (Pro)</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Overage Rate</span>
                <span className="font-bold text-slate-900">$0.079–$0.089 / min</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Billing Cycle</span>
                <span className="font-bold text-slate-900">Monthly / Annual</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-800 font-medium">
              <strong>Tip:</strong> Enable 'Auto-Refill' in your Billing Settings to prevent service interruptions if you exceed your monthly minutes.
            </p>
          </div>
        </div>
      )
    }
  };

  return (
    <DashboardLayout>
      <SEO
        title="Help Center & Support — VocalScale AI Receptionist"
        description="Get help with your VocalScale AI receptionist: setup, call management, pricing, billing, supported languages, and transfers. Answers to common questions plus 24/7 support."
        canonical="https://vocalscale.com/dashboard/help"
      />
      <SchemaMarkup type="FAQPage" schema={faqSchema} />
      <div className={PAGE_CONTAINER}>



        {/* ARTICLE MODAL */}
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pb-32 p-4 sm:p-6">
            <div
              className="absolute inset-0 transition-opacity"
              onClick={() => setSelectedArticle(null)}
            ></div>
            <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">{selectedArticle.title}</h3>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {selectedArticle.content}
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-[13px] tracking-tight hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        )}

        <PageHeader
          title="Help center"
          description="Search guides and common questions, or send a ticket to our support team."
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help articles and FAQs"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-20 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Search for answers, e.g. pricing, languages, transfers…"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Clear
            </button>
          )}
        </div>

        <div className="w-full space-y-6">
          {/* KNOWLEDGE BASE GRID */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Guides</h2>
              <p className="mt-0.5 text-sm text-slate-500">Everything you need to set up and run your agent.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <HelpCategoryCard
                icon={Rocket} title="Agent setup and training"
                description="Teach your agent about your business by uploading PDFs, website URLs, or custom text."
                onClick={() => setSelectedArticle(articles['AI Setup & Training'])}
              />
              <HelpCategoryCard
                icon={Phone} title="Call management"
                description="Setup routing rules, call transfers, after-hours logic, and emergency escalations."
                onClick={() => setSelectedArticle(articles['Call Management'])}
              />
              <HelpCategoryCard
                icon={Receipt} title="Billing and usage"
                description="Manage your minutes, overage protection, and subscription for scaling teams."
                onClick={() => setSelectedArticle(articles['Billing & Usage'])}
              />
            </div>
          </div>

          {/* SPLIT SECTION: FAQs & TUTORIALS */}
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">

            {/* Left: FAQs */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-950">Frequently asked questions</h2>

              <div className="space-y-1">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, i) => (
                    <FAQItem
                      key={faq.question}
                      defaultOpen={i === 0}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-700">No results for “{query}”.</p>
                    <p className="mt-1 text-[13px] font-medium text-slate-500">
                      Try another term, or submit a ticket below and we’ll help you out.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Tutorials */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">Tutorials</h2>
              <div className="mt-4 space-y-3">
                {/* Featured Video Card - Always Visible */}
                <h3 className="text-sm font-medium text-slate-600">Train your agent in 5 minutes</h3>
                <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-900 group">
                  <VideoPlayer src={VIDEO_URL} />
                </div>
              </div>
            </div>
          </div>

          {/* STILL NEED HELP SECTION */}
          <div>
            <h2 className="text-base font-semibold text-slate-950">Still need help?</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Our dedicated support team is available around the clock to assist you with any issues or custom requirements.
            </p>
          </div>

          {/* Ticket Form Section */}
          <div className="max-w-xl">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* Header - Always Visible */}
              <div 
                className={`text-center ${isFormOpen ? 'mb-8' : ''} transition-all duration-300`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {isSuccess ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Ticket size={20} />
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {isSuccess ? 'Ticket submitted' : 'Submit a ticket'}
                </h3>
                <p className="text-slate-500 text-[13px] font-medium leading-relaxed px-4">
                  {isSuccess 
                    ? "We've received your request. Our team will get back to you within 24 hours."
                    : "Describe your issue in detail. We typically respond in < 24h."
                  }
                </p>
              </div>

              {/* Form or Button */}
              {isSuccess ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold py-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Thanks for reaching out!</span>
                </div>
              ) : !isFormOpen ? (
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-semibold text-[13px] tracking-tight hover:border-blue-500 hover:text-blue-600 transition-all active:scale-[0.98]"
                >
                  Create Ticket
                </button>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Email Field */}
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      placeholder="Your email address *"
                      value={ticketData.email}
                      onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                      className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                      required
                    />
                  </div>

                  {/* Ticket Type Dropdown */}
                  <div className="relative group">
                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <select
                      value={ticketData.ticketType}
                      onChange={(e) => setTicketData({ ...ticketData, ticketType: e.target.value })}
                      className="w-full h-12 pl-11 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select ticket type *</option>
                      {ticketTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Subject Field */}
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Subject (optional)"
                      value={ticketData.subject}
                      onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <textarea
                      placeholder="Describe your issue in detail... *"
                      value={ticketData.message}
                      onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                      className="w-full min-h-[120px] pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-xl font-bold text-[13px] tracking-tight hover:bg-slate-200 transition-all active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-semibold text-[13px] tracking-tight hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Ticket'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
