import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import Sidebar from '@/components/sidebar/Sidebar';
import './globals.scss';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Demo Platform — Assistente',
  description: 'Assistente conversazionale del Comune di Taranto',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>
        <Sidebar />
        <main className="appMain">{children}</main>
      </body>
    </html>
  );
}
