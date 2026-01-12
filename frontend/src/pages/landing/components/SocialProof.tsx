export function SocialProof() {
  const logos = [
    { src: '/logos/aws.svg', alt: 'Amazon Web Services' },
    { src: '/logos/twilio.svg', alt: 'Twilio' },
    { src: '/logos/deepgram.svg', alt: 'Deepgram' },
    { src: '/logos/openai.svg', alt: 'OpenAI' },
  ];

  const scrollingLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="relative bg-white py-16 md:py-24 overflow-hidden border-y border-brand-ink/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10 md:mb-12 animate-fade-in">
          <p className="text-[10px] md:text-[11px] font-black text-brand-muted uppercase tracking-[0.3em] md:tracking-[0.4em]">
            Trusted by industry leaders
          </p>
        </div>

        <div className="relative">
          {/* Edge fades for smooth scrolling effect */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-20 md:w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-20 md:w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          <div className="flex w-max animate-scroll-left gap-16 md:gap-32 items-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {scrollingLogos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center min-w-[100px] md:min-w-[120px]">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-6 md:h-9 object-contain hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Subtle Noise */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-noise mix-blend-soft-light"></div>
    </section>
  );
}
