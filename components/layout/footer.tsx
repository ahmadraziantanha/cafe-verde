import Link from 'next/link';
import { InstagramIcon, TikTokIcon, FacebookIcon, YelpIcon } from '@/components/icons/social';

const SOCIALS = [
  { name: 'Instagram', href: 'https://instagram.com/cafeverde', Icon: InstagramIcon },
  { name: 'TikTok',    href: 'https://tiktok.com/@cafeverde',   Icon: TikTokIcon },
  { name: 'Facebook',  href: 'https://facebook.com/cafeverde',  Icon: FacebookIcon },
  { name: 'Yelp',      href: 'https://yelp.com/biz/cafeverde',  Icon: YelpIcon },
];

export function Footer() {
  return (
    <footer className="bg-forest-deep text-cream/75 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        <p className="font-serif text-cream text-lg">Cafe Verde</p>
        <p className="text-cream/55">© {new Date().getFullYear()} Cafe Verde. Brewed in Brooklyn.</p>
        <div className="flex items-center gap-5">
          {SOCIALS.map(({ name, href, Icon }) => (
            <Link
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              className="text-cream/60 hover:text-cream transition-colors"
            >
              <Icon className="h-[18px] w-[18px]" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
