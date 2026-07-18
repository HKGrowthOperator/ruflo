import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tamil.de – Nachrichten für die tamilische Community',
  description:
    'Tamil.de – deutschsprachige Nachrichten für die tamilische Community im DACH-Raum: Diaspora, Tamil Nadu, Sri Lanka.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className="site-header">
          <div className="inner">
            <Link href="/" className="site-title">
              Tamil.de
            </Link>
            <nav className="site-nav">
              <Link href="/">Nachrichten</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
