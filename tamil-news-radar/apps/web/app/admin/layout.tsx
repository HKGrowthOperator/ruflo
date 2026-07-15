import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="admin-nav">
        <Link href="/admin">Redaktion</Link>
        <Link href="/admin/quellen">Quellen</Link>
        <Link href="/admin/audit">Audit-Log</Link>
        <Link href="/">→ Website</Link>
      </nav>
      {children}
    </>
  );
}
