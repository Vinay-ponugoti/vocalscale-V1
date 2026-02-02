import React from 'react';

export function FAQ() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <details className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-lg text-slate-900">
              How much does it cost?
              <span className="shrink-0 rounded-full bg-white p-1.5 text-gray-900 sm:p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 leading-relaxed text-slate-600">
              Pricing starts at $299/month for one agent. Additional agents are $199/month each.
            </p>
          </details>

          <details className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-lg text-slate-900">
              How quickly can I get started?
              <span className="shrink-0 rounded-full bg-white p-1.5 text-gray-900 sm:p-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 leading-relaxed text-slate-600">
              Most businesses are up and running within 24 hours. We provide the Twilio number, configure your AI agent, and train it on your business.
            </p>
          </details>

          <details className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-lg text-slate-900">
              Will the AI agent sound robotic?
              <span className="shrink-0 rounded-full bg-white p-1.5 text-gray-900 sm:p-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 leading-relaxed text-slate-600">
              Our AI uses advanced voice synthesis from Deepgram and LLMs from GPT-4. It sounds natural and can handle complex questions. You can customize the tone and personality.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
