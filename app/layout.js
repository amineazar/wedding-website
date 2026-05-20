import './globals.css';

export const metadata = {
  metadataBase: new URL('https://wedding-website-silk-nine.vercel.app'),
  title: 'Amine & Lamya — 20.06.2026',
  description: 'You are warmly invited to celebrate the wedding of Amine & Lamya on 20 June 2026 at Skylodge, Feytroun, Lebanon.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Amine & Lamya — 20.06.2026',
    description: 'You are warmly invited to celebrate the wedding of Amine & Lamya on 20 June 2026 at Skylodge, Feytroun, Lebanon.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts domains to eliminate extra round-trips */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load fonts non-render-blocking: preload → onload swap trick */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Italiana&family=Outfit:wght@200;300;400&family=Dancing+Script:wght@400;700&family=Cinzel:wght@300;400&family=Quicksand:wght@300;400;500&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Italiana&family=Outfit:wght@200;300;400&family=Dancing+Script:wght@400;700&family=Cinzel:wght@300;400&family=Quicksand:wght@300;400;500&display=swap"
          rel="stylesheet"
          media="print"
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Italiana&family=Outfit:wght@200;300;400&family=Dancing+Script:wght@400;700&family=Cinzel:wght@300;400&family=Quicksand:wght@300;400;500&display=swap"
            rel="stylesheet"
          />
        </noscript>
        {/* Hardcoded OG tags — ensures WhatsApp/bots see them without JS */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wedding-website-silk-nine.vercel.app/" />
        <meta property="og:title" content="Amine & Lamya — 20.06.2026" />
        <meta property="og:description" content="You are warmly invited to celebrate the wedding of Amine & Lamya on 20 June 2026 at Skylodge, Feytroun, Lebanon." />
        <meta property="og:image" content="https://wedding-website-silk-nine.vercel.app/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://wedding-website-silk-nine.vercel.app/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://wedding-website-silk-nine.vercel.app/og-image.jpg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
