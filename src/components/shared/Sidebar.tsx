/**
 * App sidebar navigation component.
 *
 * @component Sidebar
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PenTool,
  BarChart3,
  Image as ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';

/** Navigation items for the sidebar */
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/builder', label: 'Builder', icon: PenTool },
  { href: '/analyzer', label: 'Analyzer', icon: BarChart3 },
  { href: '/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const handleLogout = async () => {
    await fetch('/api/auth/session-set', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        id="sidebar-toggle"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <Zap size={24} color="var(--brand-primary)" />
          <span className="sidebar-logo-text">AdVize</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={handleClose}
                id={`nav-${item.label.toLowerCase()}`}
              >
                <Icon size={20} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" id="nav-logout" aria-label="Log out" onClick={handleLogout}>
            <LogOut size={20} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
