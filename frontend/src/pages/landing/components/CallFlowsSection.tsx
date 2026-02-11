import React from 'react';
import { motion } from 'framer-motion';

const flows = [
  {
    label: 'Inbound Calls',
    steps: [
      'Pre-call intelligence',
      'Intent recognition',
      'Knowledge base / Tools & APIs',
      'Smart actions',
      'Post-call automation',
      'Call complete',
    ],
    description: `AI-powered inbound call handling for businesses. Instantly recognize callers, understand intent, access knowledge bases, and automate CRM updates. No more missed calls or manual entry.`,
    seo: 'AI inbound call automation, virtual receptionist, CRM integration, smart call routing, 24/7 customer support',
  },
  {
    label: 'Outbound Calls',
    steps: [
      'Pre-call qualification',
      'Outbound dial',
      'Campaign conversation',
      'Interested / Not interested',
      'Campaign updates',
      'Analytics & progress',
    ],
    description: `Automate outbound campaigns with intelligent contact scoring, real-time analytics, and structured data extraction. Book more meetings and track ROI with zero manual effort.`,
    seo: 'AI outbound calling, sales automation, campaign analytics, lead qualification, appointment booking',
  },
];

export const CallFlowsSection = () => (
  <section className="bg-neutral-950 py-16 px-4 md:px-0">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          AI Call Flows for Modern Businesses
        </h2>
        <p className="text-lg text-neutral-300 mb-8">
          Supercharge your customer experience with VocalScale’s advanced AI voice workflows. Handle inbound and outbound calls with unmatched efficiency, accuracy, and personalization.
        </p>
        <ul className="space-y-6">
          {flows.map((flow) => (
            <li key={flow.label}>
              <h3 className="text-2xl font-semibold text-sky-400 mb-2">{flow.label}</h3>
              <p className="text-neutral-200 mb-2">{flow.description}</p>
              <span className="text-xs text-neutral-400">{flow.seo}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-10">
        {flows.map((flow) => (
          <motion.div
            key={flow.label}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-neutral-900 rounded-xl shadow-lg p-6 border border-neutral-800"
          >
            <h4 className="text-lg font-bold text-sky-300 mb-4">{flow.label} Workflow</h4>
            <ol className="space-y-2">
              {flow.steps.map((step, idx) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-sky-700 text-white font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-neutral-100 text-base">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
