import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tamil News Radar',
  description: 'தமிழ் செய்திகள் – automatisch recherchiert, redaktionell geprüft.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta">
      <body>
        <header className="site-header">
          <div className="inner">
            <Link href="/" className="site-title">
              தமிழ் News Radar
            </Link>
            <nav className="site-nav">
              <Link href="/">செய்திகள்</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
