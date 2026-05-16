import './globals.css';

export const metadata = {
  title: 'Amine & Lamya — 20.06.2026',
  description: 'You are warmly invited to celebrate the wedding of Amine & Lamya on 20 June 2026 at Skylodge, Feytroun, Lebanon.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Italiana&family=Outfit:wght@200;300;400&family=Dancing+Script:wght@400;700&family=Cinzel:wght@300;400&family=Quicksand:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
