import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';
import { PwaRegister } from '@/components/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prüfungscoach Trockenbau',
  description: 'Adaptiver Prüfungscoach für die IHK-Abschlussprüfung Trockenbaumonteur',
  appleWebApp: { capable: true, title: 'Prüfungscoach', statusBarStyle: 'default' },
  icons: { apple: '/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1c60f1',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="de">
      <body>
        <PwaRegister />
        <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <Link href="/" className="text-base font-bold tracking-tight text-ink-900">
              Prüfungs<span className="text-brand-600">coach</span>
            </Link>
            {user ? (
              <nav className="flex items-center gap-1 text-sm">
                <Link href="/" className="btn-ghost px-3 py-1.5">Start</Link>
                <Link href="/session" className="btn-ghost px-3 py-1.5">Lernen</Link>
                <Link href="/simulation" className="btn-ghost px-3 py-1.5">Simulation</Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="btn-ghost px-3 py-1.5">Admin</Link>
                )}
                <LogoutButton />
              </nav>
            ) : null}
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6 pb-24">{children}</main>
      </body>
    </html>
  );
}
