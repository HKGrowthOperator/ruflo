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
            <div>
              <Link href="/" className="site-title">
                Tamil.de
              </Link>
              <div className="site-tagline">
                Nachrichten für die tamilische Community im deutschsprachigen Raum
              </div>
            </div>
            <nav className="site-nav">
              <Link href="/">Nachrichten</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="inner">
            <span>Tamil.de</span>
            <a href="/feed.xml">RSS-Feed</a>
            <span>Alle Artikel redaktionell geprüft · Quellen am Artikelende</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
