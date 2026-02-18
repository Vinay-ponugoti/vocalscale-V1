import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => (
  <div className="relative min-h-screen w-full overflow-hidden bg-white font-sans antialiased selection:bg-blue-100 selection:text-blue-900">

    {/* 21st Dev Technical Background */}
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Subtle Technical Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.05),transparent_70%)]" />

      {/* Decorative Shimmering Blobs (Very Subtle) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-400/10 blur-[100px] rounded-full"
      />
    </div>

    {/* Content Container */}
    <div className="relative z-10 flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-8 md:px-12">
        <Link to="/" className="group">
          <img
            src="/logo.png"
            alt="VocalScale"
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-500"
          />
        </Link>

      </header>

      {/* Main Form Area */}
      <main className="flex flex-1 items-center justify-center p-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px]"
        >
          {children}
        </motion.div>
      </main>

      {/* Simplified Footer */}
      <footer className="w-full py-8 px-6 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} VocalScale AI Platform. Secure & Encrypted.
        </p>
      </footer>
    </div>

    {/* Custom Styles for Noise */}
    <style>{`
      .noise-overlay {
        position: fixed;
        inset: 0;
        z-index: 1;
        opacity: 0.015;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      }
    `}</style>
    <div className="noise-overlay" />
  </div>
);

export default AuthLayout;
