import React from 'react';

export function SocialProof() {
  return (
    <section className="py-12 bg-white/50 border-y border-slate-200/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Trusted by 500+ Businesses</h2>
        <div className="flex flex-col items-center justify-center space-y-4">
          <blockquote className="text-xl md:text-2xl font-medium text-slate-700 italic max-w-3xl mx-auto">
            "VocalScale's AI agent handles 80% of our calls now. Our customers love it!"
          </blockquote>
          <cite className="text-slate-500 font-semibold not-italic">
            - Jane Smith, Owner, Fiesta Grill Clemson
          </cite>
        </div>
      </div>
    </section>
  );
}
