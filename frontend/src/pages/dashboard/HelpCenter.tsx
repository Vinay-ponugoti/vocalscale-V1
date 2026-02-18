import { useState, useRef, useEffect } from 'react';
import { Search, Rocket, Receipt, ArrowRight, Ticket, X, CheckCircle2, Info, Phone } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import HelpCategoryCard from '../../components/HelpCategoryCard';
import FAQItem from '../../components/FAQItem';
// FloatingChat removed

const VIDEO_URL = "https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/landing.mp4";

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
      className="w-full h-full object-cover rounded-2xl"
    >
      <source src={`${src}#t=0.001`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

const HelpCenter = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);


  const articles: Record<string, Article> = {
    'AI Setup & Training': {
      title: 'AI Setup & Training Guide',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Building a powerful AI assistant starts with providing high-quality training data. Our platform allows you to upload various sources to make your AI an expert in your business.
          </p>

          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
            <h4 className="font-black text-indigo-900 text-sm mb-3 flex items-center gap-2">
              <Info size={16} /> Key Training Sources
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-[13px] text-indigo-800">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span><strong>PDF/Docx Uploads:</strong> Upload manuals, pricing sheets, and company policies.</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-indigo-800">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span><strong>Website URL:</strong> Paste your URL and we'll crawl your site for information.</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-indigo-800">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span><strong>Custom QA:</strong> Directly input common questions and specific answers.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-sm">How to Train Effectively</h4>
            <div className="text-[13px] text-slate-600 leading-relaxed space-y-3">
              <p><strong>Step 1: Gather Your Data</strong></p>
              <p>Collect all relevant business documents. This includes your latest pricing sheets, service descriptions, cancellation policies, and operational manuals.</p>

              <p><strong>Step 2: Upload to Knowledge Base</strong></p>
              <p>Navigate to the "Knowledge Base" tab in your dashboard. Use the "Upload" button to add your PDF or Docx files. Alternatively, paste your website's FAQ URL.</p>

              <p><strong>Step 3: Test and Refine</strong></p>
              <p>After uploading, use the test chat to ask questions. If the AI misses something, add a specific "Q&A" entry to cover that gap.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-sm">Best Practices for Training</h4>
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
      title: 'Mastering Call Management',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Configure how your AI handles incoming calls, transfers, and after-hours logic to ensure a seamless experience for every caller.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="border border-slate-100 p-4 rounded-xl hover:border-indigo-100 transition-colors">
              <h5 className="font-bold text-slate-900 text-sm mb-1">Smart Routing</h5>
              <p className="text-xs text-slate-500">Route calls based on intent detection (e.g., 'Billing' goes to Finance).</p>
            </div>
            <div className="border border-slate-100 p-4 rounded-xl hover:border-indigo-100 transition-colors">
              <h5 className="font-bold text-slate-900 text-sm mb-1">Human Transfers</h5>
              <p className="text-xs text-slate-500">Define 'Escalation Triggers' to transfer complex calls to live agents.</p>
            </div>
            <div className="border border-slate-100 p-4 rounded-xl hover:border-indigo-100 transition-colors">
              <h5 className="font-bold text-slate-900 text-sm mb-1">After-Hours Logic</h5>
              <p className="text-xs text-slate-500">Set specific behaviors for weekends, holidays, or late-night calls.</p>
            </div>
          </div>
        </div>
      )
    },
    'Billing & Usage': {
      title: 'Understanding Billing & Usage',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Transparency is key. Here is how we calculate your usage and manage your subscription.
          </p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="font-black text-slate-900 text-sm mb-4">Pricing Model</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Base Minutes</span>
                <span className="font-bold text-slate-900">Included in Plan</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Overage Rate</span>
                <span className="font-bold text-slate-900">$0.094 / minute</span>
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
    <DashboardLayout fullWidth>
      <div className="w-full p-4 md:p-8 2xl:p-12 space-y-8 2xl:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full">



        {/* ARTICLE MODAL */}
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pb-32 p-4 sm:p-6">
            <div
              className="absolute inset-0 transition-opacity"
              onClick={() => setSelectedArticle(null)}
            ></div>
            <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedArticle.title}</h3>
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
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[13px] tracking-tight hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.15em] border border-indigo-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
              Help Center & Support
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight">How can we help you today?</h1>
            <p className="text-slate-500 text-lg mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
              Search our knowledge base, explore tutorials, or connect with our support team to get the most out of your AI.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              </div>
              <input
                type="text"
                className="w-full py-5 pl-14 pr-36 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white shadow-sm transition-all"
                placeholder="Search for answers (e.g. 'billing', 'voice setup')..."
              />
              <button className="absolute right-2.5 top-2.5 bottom-2.5 bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-black text-[13px] tracking-tight transition-all shadow-sm hover:shadow-indigo-200 active:scale-[0.98]">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="w-full">
          {/* BREADCRUMBS */}
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-10 flex items-center gap-2">
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Help Center</span>
          </div>

          {/* KNOWLEDGE BASE GRID */}
          <div className="mb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Knowledge Base</h2>
                <p className="text-slate-500 font-medium">Everything you need to build the perfect AI voice assistant.</p>
              </div>
              <div className="text-[13px] font-black text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5">
                Explore All Articles <ArrowRight size={14} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <HelpCategoryCard
                icon={Rocket} title="AI Setup & Training"
                description="Teach your AI about your business by uploading PDFs, website URLs, or custom text."
                onClick={() => setSelectedArticle(articles['AI Setup & Training'])}
              />
              <HelpCategoryCard
                icon={Phone} title="Call Management"
                description="Setup routing rules, call transfers, after-hours logic, and emergency escalations."
                onClick={() => setSelectedArticle(articles['Call Management'])}
              />
              <HelpCategoryCard
                icon={Receipt} title="Billing & Usage"
                description="Manage your minutes, overage protection, and subscription for scaling teams."
                onClick={() => setSelectedArticle(articles['Billing & Usage'])}
              />
            </div>
          </div>

          {/* SPLIT SECTION: FAQs & TUTORIALS */}
          <div className="grid lg:grid-cols-2 gap-16 mb-24">

            {/* Left: FAQs */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Frequent Questions</h2>
                <a href="#" className="text-indigo-600 text-[13px] font-black flex items-center hover:text-indigo-700 transition-colors">
                  View all <ArrowRight size={14} className="ml-1.5" />
                </a>
              </div>

              <div className="space-y-1">
                <FAQItem
                  defaultOpen={true}
                  question="How fast does the AI respond to callers?"
                  answer="Our AI features ultra-low latency processing (~500ms), ensuring the conversation feels natural and human-like without awkward pauses."
                />
                <FAQItem
                  question="Can I train the AI on my own business data?"
                  answer="Yes! You can upload PDFs, docx, or paste your website URL. The AI will learn your pricing, services, and FAQs to answer caller queries accurately."
                />
                <FAQItem
                  question="Does it support multiple languages?"
                  answer="Absolutely. We support over 30+ languages with automatic language detection, allowing your AI to switch seamlessly between English, Spanish, French, and more."
                />
                <FAQItem
                  question="Can the AI transfer calls to a human?"
                  answer="Yes. You can define specific 'Escalation Rules' where the AI will automatically transfer the call to a live agent if it encounters a complex request."
                />
              </div>
            </div>

            {/* Right: Tutorials */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Tutorials</h2>
                <a href="#" className="text-indigo-600 text-[13px] font-black flex items-center hover:text-indigo-700 transition-colors">
                  See library <ArrowRight size={14} className="ml-1.5" />
                </a>
              </div>

              <div className="space-y-6">
                {/* Featured Video Card - Always Visible */}
                <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">How to Train AI in 5min</h3>
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in duration-300 relative aspect-video group border border-slate-800">
                  <VideoPlayer src={VIDEO_URL} />
                </div>
              </div>
            </div>
          </div>

          {/* STILL NEED HELP SECTION */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Still need help?</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Our dedicated support team is available around the clock to assist you with any issues or custom requirements.
            </p>
          </div>

          {/* Still Need Help Section */}
          <div className="max-w-md mx-auto mb-20">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                <Ticket size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Submit a Ticket</h3>
              <p className="text-slate-500 text-[13px] font-medium mb-8 leading-relaxed px-4">Describe your issue in detail.<br />We typically respond in <span className="text-indigo-600 font-bold">&lt; 24h</span>.</p>
              <button className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-black text-[13px] tracking-tight hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-[0.98]">
                Create Ticket
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;