import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#120C08',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Muzikors | Mobil Müzik Kutusu & Jukebox',
  description: 'Müziği Sen Yönet! Bulunduğun kafe ve barlarda favori şarkılarını çaldır, gecenin ritmini belirle.',
  keywords: ['muzikors', 'jukebox', 'mobile jukebox', 'gece hayatı', 'şarkı iste', 'spotify jukebox'],
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark h-full" data-theme="velvet">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('muzikors_theme');
                  if (saved) {
                    document.documentElement.dataset.theme = saved;
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full antialiased selection:bg-[#D4AF37] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
