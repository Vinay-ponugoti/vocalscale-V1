import { HelpCircle } from 'lucide-react';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SEO } from '@/components/SEO';
import SchemaMarkup from '@/components/SchemaMarkup';
import { faqSchema } from '@/constants/schemas';

const faqs = [
  {
    question: 'How does an AI receptionist answer phone calls?',
    answer: 'It picks up every call in seconds, understands the caller in natural language, and handles booking, FAQs, and routing the same way a trained front-desk staffer would, 24/7.'
  },
  {
    question: 'Can an AI voice agent book appointments directly into my calendar?',
    answer: 'Yes. VocalScale checks your live calendar, offers open slots, and confirms bookings during the call, syncing with tools like Google Calendar and common CRMs.'
  },
  {
    question: 'What languages does VocalScale support?',
    answer: 'VocalScale answers calls in 50+ languages, detecting the caller\'s language automatically so you don\'t miss business from non-English speakers.'
  },
  {
    question: 'Is VocalScale HIPAA compliant for medical practices?',
    answer: 'Yes. VocalScale offers HIPAA-aware call flows for medical and dental offices, including secure handling of patient information during scheduling calls.'
  },
  {
    question: 'How long does it take to set up an AI receptionist?',
    answer: 'Most businesses go live in under 15 minutes: pick a phone number, train the AI on your hours and FAQs, and start answering calls automatically.'
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      <SEO
        title="AI Receptionist FAQ | VocalScale"
        description="Answers to the most common questions about VocalScale's AI receptionist: call handling, appointment booking, languages, HIPAA compliance, and setup time."
        canonical="https://vocalscale.com/faq"
      />
      <SchemaMarkup schema={faqSchema(faqs)} type="FAQPage" />
      <Header />

      <main className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8 shadow-sm">
              <HelpCircle className="h-4 w-4 text-slate-700" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">FAQ</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-normal text-slate-900 leading-[1.1]">
              Common questions
            </h1>
          </div>

          <div className="space-y-8 md:space-y-10">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-snug">
                  {faq.question}
                </h2>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
