import { Reveal } from '@/components/ui/reveal';

export function LocationHours() {
  return (
    <section id="contact" className="bg-forest text-cream py-28 lg:py-40 scroll-mt-20">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="max-w-xl">
            <p className="eyebrow text-cream/70">Visit</p>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tightest mt-5 leading-[1.02]">
              Come say <span className="italic font-light">hello.</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div>
            <p className="eyebrow text-cream/60">Location</p>
            <p className="font-serif text-2xl mt-4 leading-snug">
              247 Bedford Avenue<br />Brooklyn, NY 11211
            </p>
            <a
              href="https://maps.google.com/?q=247+Bedford+Avenue+Brooklyn+NY"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 text-sm text-cream/80 border-b border-cream/30 hover:border-cream pb-0.5"
            >
              Get directions
            </a>
          </div>
          <div>
            <p className="eyebrow text-cream/60">Hours</p>
            <ul className="mt-4 space-y-2 text-[15px] text-cream/90">
              <li className="flex justify-between gap-6"><span>Mon – Fri</span><span className="text-cream/70">7:00 – 20:00</span></li>
              <li className="flex justify-between gap-6"><span>Sat – Sun</span><span className="text-cream/70">8:00 – 21:00</span></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-cream/60">Contact</p>
            <ul className="mt-4 space-y-2 text-[15px] text-cream/90">
              <li>(917) 555-0142</li>
              <li>hello@cafeverde.com</li>
              <li>@cafeverde</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
