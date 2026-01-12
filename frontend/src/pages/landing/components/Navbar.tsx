import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-brand-warm/90 backdrop-blur-xl border-b border-brand-ink/5 py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-brand-ink rounded-xl sm:rounded-2xl shadow-lg group-hover:bg-brand-electric transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <img src="/logo-icon1.2.png" alt="Vocal Scale Logo" className="w-5 h-5 sm:w-7 sm:h-7 object-contain brightness-0 invert" />
            </div>
            <span className="text-lg sm:text-xl font-black text-brand-ink tracking-tight group-hover:text-brand-electric transition-colors uppercase whitespace-nowrap">
              Vocal Scale
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'How it Works', 'Pricing', 'Testimonials'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-brand-muted hover:text-brand-ink transition-all text-[12px] font-black uppercase tracking-[0.2em] relative group"
              >
                {item}
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-brand-electric transition-all duration-500 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link 
              to="/login" 
              className="hidden lg:block text-brand-muted hover:text-brand-ink font-black transition-colors text-[12px] uppercase tracking-[0.2em]"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="hidden sm:flex px-8 py-3 bg-brand-ink hover:bg-brand-electric text-white rounded-full font-black transition-all duration-500 hover:shadow-2xl hover:shadow-brand-electric/30 active:scale-95 text-[12px] uppercase tracking-[0.2em]"
            >
              Get Started
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-charcoal-medium hover:text-charcoal transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Overlay */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-brand-ink/5 transition-all duration-500 ease-in-out overflow-hidden shadow-2xl ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col p-8 gap-6">
          {['Features', 'How it Works', 'Pricing', 'Testimonials'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-brand-muted hover:text-brand-electric font-black text-[13px] uppercase tracking-[0.2em] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="h-px bg-brand-ink/5 w-full" />
          <div className="flex flex-col gap-4">
            <Link 
              to="/login" 
              className="text-brand-muted hover:text-brand-ink font-black text-[13px] uppercase tracking-[0.2em] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="w-full py-4 bg-brand-ink text-white rounded-full font-black text-[13px] uppercase tracking-[0.2em] text-center hover:bg-brand-electric transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
