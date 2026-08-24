import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Big_Shoulders, Public_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

// Big Shoulders — display / headings (note: "Display" variant doesn't exist in this version)
const bigShoulders = Big_Shoulders({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

// Public Sans — body / UI text
const publicSans = Public_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// IBM Plex Mono — data / labels / IDs
const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GymSynk',
  description: 'Self-hosted gym management — QR check-in, member tracking, real-time cashier tooling.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bigShoulders.variable} ${publicSans.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body style={{ fontFamily: 'var(--font-body), -apple-system, sans-serif' }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
