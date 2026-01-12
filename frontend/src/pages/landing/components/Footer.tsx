import { Twitter, Linkedin, Github, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Use Cases', href: '#' },
      { label: 'Integrations', href: '#' }
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' }
    ],
    Support: [
      { label: 'Help Center', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms', href: '#' }
    ]
  };

  return (
    <footer className="bg-white pt-24 md:pt-40 pb-12 px-6 relative overflow-hidden border-t border-brand-ink/5">
      {/* Footer Background Gradients */}
      <div className="absolute inset-0 z-0 bg-grid-warm [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-30"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-12 md:gap-16 mb-16 md:mb-32">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 md:mb-10 group">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-brand-ink rounded-xl md:rounded-2xl group-hover:bg-brand-electric transition-all duration-500 shadow-xl">
                <img src="/logo-icon1.2.png" alt="Vocal Scale Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain brightness-0 invert" />
              </div>
              <span className="text-xl md:text-2xl font-black text-brand-ink tracking-tight">Vocal Scale</span>
            </Link>
            <p className="text-brand-muted mb-8 md:mb-12 max-w-sm leading-relaxed text-sm md:text-[16px] font-medium">
              Empowering small businesses with human-like AI voice technology. The future of customer interaction starts here.
            </p>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 text-brand-muted hover:text-brand-electric transition-all duration-300 group cursor-pointer">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-warm border border-brand-ink/5 flex items-center justify-center group-hover:border-brand-electric/30">
                  <Mail className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-[12px] md:text-[14px] font-black uppercase tracking-widest">hello@vocalscale.ai</span>
              </div>
              <div className="flex items-center gap-4 text-brand-muted">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-warm border border-brand-ink/5 flex items-center justify-center">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-brand-ink">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h4 className="text-brand-ink font-black mb-6 md:mb-10 tracking-[0.2em] md:tracking-[0.3em] uppercase text-[9px] md:text-[10px]">{category}</h4>
              <ul className="space-y-4 md:space-y-6">
                {links.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-brand-muted hover:text-brand-electric transition-all duration-300 text-[12px] md:text-[14px] font-black uppercase tracking-widest inline-block hover:translate-x-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social & CTA */}
          <div className="col-span-1">
            <h4 className="text-brand-ink font-black mb-6 md:mb-10 tracking-[0.2em] md:tracking-[0.3em] uppercase text-[9px] md:text-[10px]">Follow</h4>
            <div className="flex flex-wrap gap-3 md:gap-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 md:w-12 md:h-12 bg-brand-warm border border-brand-ink/5 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-muted hover:border-brand-electric/30 hover:text-brand-electric hover:bg-white hover:shadow-xl transition-all duration-500">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 md:pt-12 border-t border-brand-ink/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="text-[9px] md:text-[11px] text-brand-muted font-black uppercase tracking-[0.2em]">
                © 2026 Vocal Scale. Built for Modern Business.
              </p>
              <div className="flex items-center gap-3 px-4 py-2 bg-brand-warm text-emerald-600 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Status: Online</span>
              </div>
            </div>
            <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-brand-muted">
              <a href="#" className="hover:text-brand-electric transition-colors">Privacy</a>
              <a href="#" className="hover:text-brand-electric transition-colors">Terms</a>
              <a href="#" className="hover:text-brand-electric transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Noise texture */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-noise mix-blend-soft-light"></div>
    </footer>
  );
}
