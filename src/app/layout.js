import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import ParticleField from '@/components/three/ParticleField';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'LifePilot AI — Your AI Executive Productivity Companion',
  description: 'LifePilot AI is an intelligent executive assistant that discovers work, understands priorities, learns habits, creates plans, replans automatically, predicts failures, and motivates users.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ParticleField />
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
