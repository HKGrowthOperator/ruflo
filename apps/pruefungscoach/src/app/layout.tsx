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
            <Link href={user ? '/dashboard' : '/'} className="text-base font-bold tracking-tight text-ink-900">
              Prüfungs<span className="text-brand-600">coach</span>
            </Link>
            {user ? (
              <nav className="flex items-center gap-1 text-sm">
                <Link href="/dashboard" className="btn-ghost px-3 py-1.5">Start</Link>
                <Link href="/session" className="btn-ghost px-3 py-1.5">Lernen</Link>
                <Link href="/simulation" className="btn-ghost px-3 py-1.5">Simulation</Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="btn-ghost px-3 py-1.5">Admin</Link>
                )}
                <Link href="/konto" className="btn-ghost px-3 py-1.5">Konto</Link>
                <LogoutButton />
              </nav>
            ) : (
              <nav className="flex items-center gap-1 text-sm">
                <Link href="/preise" className="btn-ghost px-3 py-1.5">Preise</Link>
                <Link href="/login" className="btn-primary px-3 py-1.5">Anmelden</Link>
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto min-h-[70vh] max-w-4xl px-4 py-6 pb-16">{children}</main>
        <footer className="border-t border-ink-200 bg-white">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-6 text-xs text-ink-500 sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} Prüfungscoach</span>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link href="/impressum" className="hover:text-ink-800">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-ink-800">Datenschutz</Link>
              <Link href="/agb" className="hover:text-ink-800">AGB</Link>
              <Link href="/preise" className="hover:text-ink-800">Preise</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
