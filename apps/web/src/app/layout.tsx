import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import '@/styles/globals.css';
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GymSynk",
  description: "Self-hosted gym management — QR check-in, member tracking, real-time cashier tooling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Prevents flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){var s=localStorage.getItem('gymsynk-theme');
          var d=window.matchMedia('(prefers-color-scheme:dark)').matches;
          var r=s==='dark'||((!s||s==='system')&&d)?'dark':'light';
          document.documentElement.classList.add(r);})();
        `}} />
      </head>
      <body>
        <ThemeProvider>  
        {children}
        </ThemeProvider>
        </body>
    </html>
  );
}
