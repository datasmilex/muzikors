import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#120C08',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://muzikors.com.tr'),
  title: 'Muzikors | İnteraktif Müzik Kutusu & Sosyal Jukebox',
  description: 'Müziği Sen Yönet! Bulunduğun kafe ve barlarda favori şarkılarını çaldır, gecenin ritmini belirle. Yunus Emre Gedik (yunovax) tarafından geliştirildi.',
  keywords: [
    'muzikors',
    'yunovax',
    'yunus emre gedik',
    'yunus emre gedik muzikors',
    'yunus emre gedik yazılımcı',
    'interaktif müzik',
    'jukebox',
    'sosyal jukebox',
    'mobile jukebox',
    'gece hayatı',
    'şarkı iste',
    'spotify jukebox',
    'kafe müzik kutusu'
  ],
  authors: [
    { name: 'Yunus Emre Gedik (yunovax)', url: 'https://muzikors.com.tr' }
  ],
  creator: 'Yunus Emre Gedik (yunovax)',
  publisher: 'yunovax',
  alternates: {
    canonical: 'https://muzikors.com.tr',
  },
  openGraph: {
    title: 'Muzikors | İnteraktif Müzik Kutusu',
    description: 'Müziği Sen Yönet! Mekanın canlı müzik kuyruğuna katıl, favori parçalarını sıraya ekle. Yunus Emre Gedik (yunovax) tarafından geliştirildi.',
    url: 'https://muzikors.com.tr',
    siteName: 'Muzikors',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Muzikors Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Muzikors | İnteraktif Müzik Kutusu',
    description: 'Müziği Sen Yönet! Mekanların interaktif sosyal müzik kutusu. Geliştirici: Yunus Emre Gedik (yunovax)',
    images: ['/logo.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://muzikors.com.tr/#author',
      name: 'Yunus Emre Gedik',
      alternateName: ['yunovax', 'Yunus Emre Gedik (yunovax)'],
      jobTitle: 'Kurucu & Yazılım Geliştirici',
      description: 'Muzikors interaktif sosyal jukebox platformunun kurucusu ve baş yazılım geliştiricisi.',
      url: 'https://muzikors.com.tr',
      sameAs: [
        'https://play.google.com/store/apps/dev?id=6973808020659896275',
        'https://github.com/yunovax'
      ]
    },
    {
      '@type': 'Organization',
      '@id': 'https://muzikors.com.tr/#organization',
      name: 'Muzikors',
      url: 'https://muzikors.com.tr',
      logo: 'https://muzikors.com.tr/logo.png',
      founder: {
        '@id': 'https://muzikors.com.tr/#author'
      },
      sameAs: [
        'https://play.google.com/store/apps/details?id=com.muzikors.app'
      ]
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://muzikors.com.tr/#app',
      name: 'Muzikors',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Android, Web',
      description: 'Kafelerde, barlarda ve mekanlarda dinlenen müziğe müşterilerin doğrudan telefonlarından ortaklaşa yön verdiği interaktif sosyal müzik kutusu.',
      url: 'https://muzikors.com.tr',
      author: {
        '@id': 'https://muzikors.com.tr/#author'
      },
      creator: {
        '@id': 'https://muzikors.com.tr/#author'
      },
      publisher: {
        '@id': 'https://muzikors.com.tr/#organization'
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY'
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark h-full" data-theme="live">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('muzikors_theme');
                  var migrated = localStorage.getItem('muzikors_theme_v2');
                  if (!migrated && (!saved || saved === 'monochrome' || saved === 'velvet')) saved = 'live';
                  if (saved === 'velvet') saved = 'monochrome';
                  if (saved === 'obsidian' || saved === 'emerald') saved = 'live';
                  if (saved) {
                    document.documentElement.dataset.theme = saved;
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full font-sans antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
