import { motion } from 'framer-motion';
import { HeroSection } from './components/HeroSection';
import { Highlights } from './components/Highlights';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { ROILiveTicker } from './components/ROILiveTicker';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 flex flex-col relative overflow-hidden">
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
        <Highlights />
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
