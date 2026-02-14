import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import Providers from '@/components/Providers';
import type { Metadata } from 'next';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hminfunuha.web.id'),
  title: {
    template: '%s | HMPSINF',
    default: 'HMPSINF - Himpunan Mahasiswa Program Studi Informatika',
  },
  description: 'Website resmi Himpunan Mahasiswa Program Studi Informatika (HMPSINF) Universitas Nurul Huda. Pusat informasi, kegiatan, dan aspirasi mahasiswa Informatika.',
  keywords: ['HMPSINF', 'Himpunan Mahasiswa', 'Informatika', 'UNUHA', 'Universitas Nurul Huda', 'Teknik Informatika', 'Mahasiswa IT'],
  authors: [{ name: 'HMPSINF Dev Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'HMPSINF - Himpunan Mahasiswa Program Studi Informatika',
    description: 'Pusat informasi, kegiatan, dan aspirasi mahasiswa Informatika Universitas Nurul Huda.',
    url: '/',
    siteName: 'HMPSINF',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HMPSINF - Himpunan Mahasiswa Program Studi Informatika',
    description: 'Pusat informasi, kegiatan, dan aspirasi mahasiswa Informatika Universitas Nurul Huda.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var isLanding = window.location.pathname === '/';
    var key = 'landing_preloader_seen';
    var hasSeen = sessionStorage.getItem(key) === '1';

    if (isLanding && !hasSeen) {
      sessionStorage.setItem(key, '1');
      window.__SHOW_LANDING_PRELOADER__ = true;
      document.documentElement.classList.add('landing-preloader-pending');
    } else {
      window.__SHOW_LANDING_PRELOADER__ = false;
      document.documentElement.classList.remove('landing-preloader-pending');
    }
  } catch (e) {
    window.__SHOW_LANDING_PRELOADER__ = false;
    document.documentElement.classList.remove('landing-preloader-pending');
  }
})();`,
          }}
        />
      </head>
      <body className={`${outfit.variable} ${outfit.className} dark:bg-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
