import { Twitter, Linkedin, Github, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Use Cases', href: '#' }
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' }
    ],
    Support: [
      { label: 'Security', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms', href: '#' }
    ]
  };

  return (
    <footer className="relative bg-transparent py-12 md:py-16 px-6 overflow-hidden border-t border-white/5">
      {/* Footer Background Gradients */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-500/5 to-transparent opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24 mb-12">
          {/* Brand & Mini Newsletter */}
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <img src="/logo.png" alt="Vocal Scale Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
              <span className="text-xl font-black text-white tracking-tight">VocalScale</span>
            </Link>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed font-medium">
              Empowering small businesses with human-like AI voice technology. The future of customer interaction is here.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:border-blue-500/30 hover:text-white transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Compact Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-white font-black mb-5 tracking-[0.2em] uppercase text-[11px]">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-slate-500 hover:text-blue-400 transition-all text-sm font-semibold"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Simplified Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} VocalScale. All rights reserved.
          </div>
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-emerald-400 rounded-full border border-emerald-500/10 text-[11px] font-black uppercase tracking-[0.2em]">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              Systems Online
            </div>
            <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
