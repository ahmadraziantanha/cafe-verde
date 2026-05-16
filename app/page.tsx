import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/hero';
import { FeaturedItems } from '@/components/home/featured-items';
import { AboutSection } from '@/components/home/about-section';
import { LocationHours } from '@/components/home/location-hours';

export const revalidate = 60; // ISR — refresh menu data every minute

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedItems />
        <div className="max-w-7xl mx-auto px-6 lg:px-10"><div className="hairline" /></div>
        <AboutSection />
        <LocationHours />
      </main>
      <Footer />
    </>
  );
}
