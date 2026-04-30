
import { HeroSection } from './components/HeroSection';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { ROILiveTicker } from './components/ROILiveTicker';
import SchemaMarkup from '@/components/SchemaMarkup';
import { webPageSchema, organizationSchema, productSchema } from '@/constants/schemas';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const Landing = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/pricing') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (location.pathname === '/features') {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (location.pathname === '/process') {
      const processSection = document.getElementById('how-it-works');
      if (processSection) {
        processSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.pathname]);

  // SEO Configuration Map — keyword-aligned with high-intent search queries (2026)
  const seoConfig = {
    '/': {
      title: "AI Receptionist & 24/7 Voice Agent for Small Business | VocalScale",
      description: "VocalScale is the AI receptionist that answers every call 24/7, books appointments, and qualifies leads in 50+ languages. Replace your answering service from $79/mo. Start free.",
      canonical: "https://vocalscale.com/"
    },
    '/features': {
      title: "AI Receptionist Features: 24/7 Call Answering, AI Scheduling & CRM | VocalScale",
      description: "Explore VocalScale's AI phone agent features — 24/7 call answering, smart appointment booking, 50+ languages, CRM and calendar integrations, and HIPAA-aware healthcare workflows.",
      canonical: "https://vocalscale.com/features"
    },
    '/pricing': {
      title: "AI Receptionist Pricing: Plans from $79/mo | VocalScale",
      description: "Transparent AI receptionist pricing starting at $79/month with 300 AI minutes. Save up to 85% vs. a live answering service. No hidden fees, cancel anytime.",
      canonical: "https://vocalscale.com/pricing"
    },
    '/process': {
      title: "How VocalScale's AI Voice Agent Works | Setup in Minutes",
      description: "Launch your 24/7 AI receptionist in under 15 minutes. Pick a phone number, train the AI on your FAQs and booking rules, and start answering every call automatically.",
      canonical: "https://vocalscale.com/process"
    }
  };

  const currentSeo = seoConfig[location.pathname as keyof typeof seoConfig] || seoConfig['/'];

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 flex flex-col relative overflow-hidden">
      <SEO
        title={currentSeo.title}
        description={currentSeo.description}
        canonical={currentSeo.canonical}
      />

      {/* Schema Markup for SEO */}
      <SchemaMarkup schema={webPageSchema(
        currentSeo.title,
        currentSeo.description,
        location.pathname
      )} type="WebPage" />

      <SchemaMarkup schema={organizationSchema} type="Organization" />

      <SchemaMarkup schema={productSchema} type="Product" />
      {/* Minimal Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col">
        <HeroSection />
        <ROILiveTicker />
        <main className="flex flex-col space-y-24 pb-24">
          <Features />
          <HowItWorks />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
