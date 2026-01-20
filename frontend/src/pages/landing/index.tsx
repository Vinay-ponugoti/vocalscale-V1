import { motion } from 'framer-motion';
import { HeroSection } from './components/HeroSection';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-blue-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* 21st Dev Background Shaders & Animations */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Large Amorphous Glows */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full"
        />

        {/* Strategic Tactical Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Micro-sparks / Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut"
            }}
            className="absolute w-0.5 h-0.5 bg-blue-400 rounded-full blur-[1px]"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}

        {/* Center Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02),transparent_70%)]" />
      </div>

      {/* Persistent Noise Overlay */}
      <div className="fixed inset-0 z-[1] opacity-[0.02] pointer-events-none bg-noise mix-blend-soft-light" />

      <div className="relative z-10 flex flex-col">
        <HeroSection />
        <main className="flex flex-col">
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
