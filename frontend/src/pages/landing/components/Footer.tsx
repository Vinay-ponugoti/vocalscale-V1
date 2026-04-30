import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const footerLinks = {
    Product: [
      { label: 'AI Receptionist Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How It Works', href: '/process' },
      { label: 'ROI Calculator', href: '/roi-calculator' },
      { label: 'Integrations', href: '/integrations' }
    ],
    Industries: [
      { label: 'Medical & Dental', href: '/industries/medical' },
      { label: 'Law Firms', href: '/industries/legal' },
      { label: 'Home Services', href: '/industries/contractors' },
      { label: 'Real Estate', href: '/industries/real-estate' },
      { label: 'Chiropractic', href: '/industries/chiropractic' }
    ],
    Compare: [
      { label: 'VocalScale vs Retell AI', href: '/comparisons/vocalscale-vs-retell-ai' },
      { label: 'VocalScale vs Bland AI', href: '/comparisons/vocalscale-vs-bland-ai' },
      { label: 'AI vs Live Receptionist', href: '/comparisons/ai-receptionist-vs-live-receptionist' }
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '#book-demo' }
    ],
    Support: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' }
    ]
  };

  return (
    <footer className="relative bg-white pt-16 md:pt-24 pb-10 md:pb-12 px-6 md:px-8 overflow-hidden">
      {/* Footer Content */}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top section: brand + links */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24 mb-16">
          {/* Brand */}
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <img src="/logo.png" alt="VocalScale AI Receptionist Logo" width="32" height="32" loading="lazy" className="w-9 h-9 object-contain transition-transform group-hover:scale-110" />
              <span className="text-xl font-black text-slate-900 tracking-tight">VocalScale</span>
            </Link>
            <p className="text-slate-500 mb-4 text-sm leading-relaxed font-medium">
              The 24/7 AI receptionist for small businesses. VocalScale's AI voice agent answers every call,
              books appointments, and qualifies leads in 50+ languages — replacing your answering service from $79/month.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed font-medium mb-8">
              Trusted by medical practices, law firms, real estate teams, and home-service contractors across the US, Canada, UK, and Australia.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-slate-900 font-black mb-5 tracking-[0.2em] uppercase text-[11px]">{category}</h4>
                <ul className="space-y-3.5">
                  {links.map((link, index) => (
                    <li key={index}>
                      {link.href.startsWith('/') ? (
                        <Link
                          to={link.href}
                          className="text-slate-500 hover:text-blue-600 transition-all text-sm font-semibold inline-flex items-center gap-1 group"
                        >
                          {link.label}
                          <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-slate-500 hover:text-blue-600 transition-all text-sm font-semibold inline-flex items-center gap-1 group"
                        >
                          {link.label}
                          <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} VocalScale. All rights reserved.
          </div>
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-full border border-slate-200 text-[11px] font-black uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Systems Online
            </div>
            <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}