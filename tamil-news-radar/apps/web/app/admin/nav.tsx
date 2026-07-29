'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTIONS: Array<{ title: string; items: Array<{ href: string; label: string }> }> = [
  {
    title: 'Übersicht',
    items: [
      { href: '/admin', label: 'Redaktion' },
      { href: '/admin/quellen', label: 'Quellen' },
    ],
  },
  {
    title: 'WordPress',
    items: [{ href: '/admin/wordpress', label: 'Verbindung & Beiträge' }],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/system', label: 'Agentenstatus' },
      { href: '/admin/audit', label: 'Audit-Log' },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-side" aria-label="Redaktionsnavigation">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="admin-side-title">{section.title}</div>
          {section.items.map((item) => {
            const active =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? 'active' : ''}>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
      <div>
        <div className="admin-side-title">Website</div>
        <Link href="/">→ Tamil.de öffnen</Link>
      </div>
    </nav>
  );
}
