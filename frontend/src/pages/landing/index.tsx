import { motion } from 'framer-motion';
import { HeroSection } from './components/HeroSection';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { CallFlowsSection } from './components/CallFlowsSection';
import { Pricing } from './components/Pricing';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { ROILiveTicker } from './components/ROILiveTicker';
import SchemaMarkup, { webPageSchema, organizationSchema, productSchema } from '@/components/SchemaMarkup';

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

  // SEO Configuration Map
  const seoConfig = {
    '/': {
      title: "AI Voice Agent for Business | VocalScale",
      description: "VocalScale's AI voice agents handle customer calls, book appointments, and answer inquiries 24/7. Automate your business phone line today.",
      canonical: "https://www.vocalscale.com/"
    },
    '/features': {
      title: "AI Receptionist Features | VocalScale",
      description: "Explore VocalScale's powerful features: 24/7 availability, multi-language support, CRM integration, and smart appointment scheduling.",
      canonical: "https://www.vocalscale.com/features"
    },
    '/pricing': {
      title: "Pricing & Plans | VocalScale AI Receptionist",
      description: "Simple, transparent pricing for every business size. Start for free and scale as you grow. No hidden fees.",
      canonical: "https://www.vocalscale.com/pricing"
    },
    '/process': {
      title: "How It Works | VocalScale AI Voice Agent",
      description: "Get your AI receptionist up and running in minutes. Pick a number, customize your agent, and start handling calls automatically.",
      canonical: "https://www.vocalscale.com/process"
    }
  };

  const currentSeo = seoConfig[location.pathname as keyof typeof seoConfig] || seoConfig['/'];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 flex flex-col relative overflow-hidden">
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
      {/* Background Effects - "Luminous Enterprise" */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Soft Modern Gradients */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply"
        />
        <motion.div
          animate={{
            x: [20, -20, 20],
            y: [20, -20, 20],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-[40%] left-[30%] w-[50%] h-[50%] bg-emerald-100/40 blur-[120px] rounded-full mix-blend-multiply"
        />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* White fade at bottom to blend content */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col">
        <HeroSection />
        <ROILiveTicker />
        <main className="flex flex-col space-y-24 pb-24">
          <Features />
          <CallFlowsSection />
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
