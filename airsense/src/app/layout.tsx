import type { Metadata } from 'next';
import { Space_Grotesk, Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AppProviders } from '@/components/providers/AppProviders';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AirSense | Large-Scale Urban Air Quality Data Warehouse & Intelligent Analytics',
  description:
    'AirSense transforms 196.5M historical air-quality observations into multidimensional environmental intelligence, combining Big Data ETL, PostgreSQL Fact Constellation, OLAP analytics, and ML forecasting.',
  keywords: [
    'Air Quality',
    'AQI',
    'Data Warehouse',
    'OLAP',
    'Machine Learning',
    'Environmental Intelligence',
    'CPCB',
    'XKDR',
    'India Air Quality',
  ],
  authors: [{ name: 'AirSense Engineering Team' }],
  openGraph: {
    title: 'AirSense | Urban Air Quality Data Warehouse & Analytics Platform',
    description:
      'Spatiotemporal analytics, OLAP cube exploration, and ML forecasting across 558 Indian monitoring stations.',
    url: 'https://airsense.internal',
    siteName: 'AirSense Environmental Intelligence',
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#ffffff] text-[#202020] font-sans">
        <AppProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
