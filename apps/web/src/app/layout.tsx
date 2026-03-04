import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { GlobalSearch } from '@/components/features/search';
import { PWAInstaller } from '@/components/common';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NOMA',
  description: 'Advanced project and task management platform with real-time collaboration',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NOMA',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NOMA" />
      </head>
      <body className={inter.className}>
        <Providers>
          <PWAInstaller />
          <GlobalSearch />
          {children}
        </Providers>
      </body>
    </html>
  );
}
