import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cafe-verde.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Cafe Verde — Brewed with love, served with care',
    template: '%s · Cafe Verde',
  },
  description:
    'A quiet corner for considered coffee and honest food. Order ahead for pickup or delivery in Brooklyn, NY.',
  applicationName: 'Cafe Verde',
  authors: [{ name: 'Cafe Verde' }],
  keywords: [
    'cafe',
    'coffee shop',
    'Brooklyn',
    'specialty coffee',
    'pastries',
    'breakfast',
    'order online',
    'pickup',
    'delivery',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Cafe Verde',
    title: 'Cafe Verde — Considered coffee, honest food.',
    description:
      'A neighbourhood cafe in Brooklyn, NY. Order ahead for pickup or delivery.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cafe Verde — Considered coffee, honest food.',
    description:
      'A neighbourhood cafe in Brooklyn, NY. Order ahead for pickup or delivery.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF6EE',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1F4A2E',
              color: '#FAF6EE',
              border: 'none',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </body>
    </html>
  );
}
