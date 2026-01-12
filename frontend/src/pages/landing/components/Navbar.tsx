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
          ? 'bg-brand-warm/90 backdrop-blur-xl border-b border-brand-ink/5 py-3 md:py-4' 
          : 'bg-transparent py-4 md:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
            <div className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-brand-ink rounded-xl md:rounded-2xl shadow-lg group-hover:bg-brand-electric transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <img src="/logo-icon1.2.png" alt="Vocal Scale Logo" className="w-5 h-5 md:w-7 md:h-7 object-contain brightness-0 invert" />
            </div>
            <span className="text-lg md:text-xl font-black text-brand-ink tracking-tight group-hover:text-brand-electric transition-colors uppercase">
              Vocal Scale
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {['Features', 'How it Works', 'Pricing'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-brand-muted hover:text-brand-ink transition-all text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] relative group whitespace-nowrap"
              >
                {item}
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-brand-electric transition-all duration-500 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 md:gap-5">
            <Link 
              to="/login" 
              className="hidden sm:block text-brand-muted hover:text-brand-ink font-black transition-colors text-[11px] md:text-[12px] uppercase tracking-[0.2em]"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="hidden sm:block px-6 md:px-8 py-2.5 md:py-3 bg-brand-ink hover:bg-brand-electric text-white rounded-full font-black transition-all duration-500 hover:shadow-2xl hover:shadow-brand-electric/30 active:scale-95 text-[10px] md:text-[12px] uppercase tracking-[0.2em] whitespace-nowrap"
            >
              Get Started
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-brand-ink hover:text-brand-electric transition-colors"
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
        className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-brand-ink/5 transition-all duration-500 overflow-hidden shadow-2xl ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col p-8 gap-8 bg-brand-warm/50 backdrop-blur-xl">
          {['Features', 'How it Works', 'Pricing'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-brand-ink hover:text-brand-electric font-black text-sm uppercase tracking-[0.2em]"
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="h-px bg-brand-ink/5 w-full" />
          <div className="flex flex-col gap-6">
            <Link 
              to="/login" 
              className="text-brand-muted hover:text-brand-ink font-black text-sm uppercase tracking-[0.2em]"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
