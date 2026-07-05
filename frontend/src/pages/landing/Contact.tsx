import React, { useState } from 'react';
import { CalendarCheck2, CheckCircle2, Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/useToast';

const faqs = [
  {
    question: 'How is VocalScale pricing decided?',
    answer: 'Pricing is based on your call volume, number of locations, integrations, support needs, and how much custom setup your AI receptionist requires.'
  },
  {
    question: 'How quickly can my AI receptionist go live?',
    answer: 'Most businesses can launch quickly after we collect your business details, preferred call flows, FAQs, booking rules, and escalation contacts.'
  },
  {
    question: 'Can VocalScale book appointments for my business?',
    answer: 'Yes. VocalScale can connect with your scheduling workflow, answer common questions, qualify callers, and book appointments based on your rules.'
  },
  {
    question: 'Does it work for multiple locations or teams?',
    answer: 'Yes. We can configure call handling for multiple locations, departments, service lines, and routing rules.'
  }
];

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;
const DEFAULT_CALENDLY_URL = 'https://calendly.com/ponugotivinay-v/free-consultation';
const CALENDLY_URL = (import.meta.env.VITE_CALENDLY_URL as string | undefined) || DEFAULT_CALENDLY_URL;

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  website: string;
  problem: string;
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<ContactFormData | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    problem: ''
  });
  const { showToast } = useToast();

  const schedulingUrl = submittedLead ? buildCalendlyUrl(CALENDLY_URL, submittedLead) : CALENDLY_URL;

  const updateField = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please add your name, email, and phone number', 'warning');
      return;
    }

    if (!WEB3FORMS_ACCESS_KEY) {
      showToast('Web3Forms access key is missing. Add it to your environment settings.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'New Pricing Call Request from VocalScale',
          from_name: 'VocalScale Contact Form',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          website: formData.website || 'Not provided',
          message: formData.problem || 'No problem statement provided',
          botcheck: ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (!data.success) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSubmittedLead(formData);
      setIsSuccess(true);
      showToast('Request sent successfully!', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        website: '',
        problem: ''
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      showToast('Failed to send request. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      <SEO
        title="Contact VocalScale for Pricing | AI Receptionist"
        description="Contact VocalScale for AI receptionist pricing tailored to your call volume, workflows, and support needs."
        canonical="https://vocalscale.com/contact"
      />
      <Header />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      <main className="pt-28 md:pt-36 relative z-10">
        <section className="px-4 sm:px-6 md:px-8 pb-12 md:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 backdrop-blur-sm text-slate-700 shadow-sm">
                <CalendarCheck2 className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Contact us for pricing</span>
              </div>
              <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-slate-950 leading-[1.08]">
                Schedule a pricing call.
              </h1>
              <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed">
                Tell us what you need your AI receptionist to handle, and our team will recommend the right setup for your business.
              </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/70 p-5 sm:p-7 md:p-9">
              {isSuccess ? (
                <div className="min-h-[340px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-950">
                    You're all set.
                  </h2>
                  <p className="mt-3 max-w-lg text-slate-600 text-base font-medium">
                    We received your request. Pick a time on Calendly and we will be ready for your VocalScale pricing call.
                  </p>
                  {schedulingUrl ? (
                    <a
                      href={schedulingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:no-underline active:scale-[0.99]"
                    >
                      <CalendarCheck2 className="h-5 w-5" />
                      Schedule on Calendly
                    </a>
                  ) : (
                    <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-900">
                      Calendly link is not configured yet.
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={updateField('name')}
                    className="w-full h-12 sm:h-14 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 text-sm sm:text-base font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={updateField('email')}
                    className="w-full h-12 sm:h-14 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 text-sm sm:text-base font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={updateField('phone')}
                    className="w-full h-12 sm:h-14 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 text-sm sm:text-base font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <input
                    type="url"
                    autoComplete="url"
                    placeholder="Company Website URL"
                    value={formData.website}
                    onChange={updateField('website')}
                    className="w-full h-12 sm:h-14 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 text-sm sm:text-base font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <textarea
                    placeholder="The problem I'm trying to solve is..."
                    value={formData.problem}
                    onChange={updateField('problem')}
                    className="w-full min-h-[112px] sm:min-h-[128px] rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm sm:text-base font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 sm:h-14 rounded-2xl bg-blue-600 text-white text-sm sm:text-base font-black hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Schedule Call'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-950 text-center mb-6">
              Common questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl bg-white border border-slate-200 p-5 shadow-sm shadow-slate-200/60 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="cursor-pointer flex items-center justify-between gap-4 text-base font-black text-slate-950">
                    {faq.question}
                    <span className="text-2xl leading-none text-blue-600 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function buildCalendlyUrl(baseUrl: string | undefined, lead: ContactFormData) {
  if (!baseUrl) {
    return undefined;
  }

  try {
    const url = new URL(baseUrl);

    url.searchParams.set('name', lead.name);
    url.searchParams.set('email', lead.email);

    if (lead.phone) {
      url.searchParams.set('a1', lead.phone);
    }

    if (lead.website) {
      url.searchParams.set('a2', lead.website);
    }

    if (lead.problem) {
      url.searchParams.set('a3', lead.problem);
    }

    return url.toString();
  } catch {
    return baseUrl;
  }
}
