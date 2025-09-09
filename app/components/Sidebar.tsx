'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { IconPipeline, IconDeals, IconAccounts, IconContacts } from '@/app/components/icons';
import ThemeSwitch from '@/app/components/ThemeSwitch';

function NavItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`sideNavItem${active ? ' is-active' : ''}`}
    >
      <span className="icon" aria-hidden="true">{icon}</span>
      <span className="label">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem('crm:sidebar:open');
      if (v != null) setOpen(v === '1');
    } catch {}
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem('crm:sidebar:open', open ? '1' : '0'); } catch {}
  }, [open]);

  // mark the shell for CSS (expanded vs collapsed)
  React.useEffect(() => {
    const shell = document.querySelector('.appShell') as HTMLElement | null;
    if (shell) shell.setAttribute('data-sidebar', open ? 'expanded' : 'collapsed');
  }, [open]);

  return (
    <aside className="sidebar" data-open={open ? '1' : '0'}>
      <div className="sidebarHeader">
        <button className="button" onClick={() => setOpen(o => !o)} aria-label="Toggle sidebar" title="Toggle sidebar">
          {open ? '⟨' : '⟩'}
        </button>
        <strong style={{ marginLeft: 8 }}>CRM&nbsp;MVP</strong>
      </div>

      <nav className="sideNav">
        <NavItem href="/"         label="Pipeline" icon={<IconPipeline />} />
        <NavItem href="/deals"    label="Deals"    icon={<IconDeals />} />
        <NavItem href="/accounts" label="Accounts" icon={<IconAccounts />} />
        <NavItem href="/contacts" label="Contacts" icon={<IconContacts />} />
      </nav>

      <div className="sidebarFooter">
        <ThemeSwitch />
      </div>
    </aside>
  );
}
