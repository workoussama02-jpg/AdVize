/**
 * Landing page navbar component.
 *
 * @component Navbar
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="landing-navbar">
      <div className="landing-navbar-inner">
        <Link href="/" className="landing-navbar-logo" id="landing-logo">
          AdVize
        </Link>

        <nav className="landing-navbar-links" aria-label="Landing navigation">
          <a href="#features" className="landing-navbar-link" id="nav-features-link">
            Features
          </a>
          <a href="#how-it-works" className="landing-navbar-link" id="nav-how-link">
            How It Works
          </a>
          <a href="#why-advize" className="landing-navbar-link" id="nav-why-link">
            Why AdVize
          </a>
        </nav>

        <div className="landing-navbar-actions">
          <Link href="/login" id="nav-login-btn">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link href="/login" id="nav-signup-btn">
            <Button variant="primary" size="sm">Get Started Free</Button>
          </Link>
        </div>

        <button
          className="landing-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          id="landing-hamburger"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile navigation */}
      <nav
        className={`landing-mobile-nav ${mobileOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
      >
        <a
          href="#features"
          className="landing-mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          Features
        </a>
        <a
          href="#how-it-works"
          className="landing-mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          How It Works
        </a>
        <a
          href="#why-advize"
          className="landing-mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          Why AdVize
        </a>
        <div className="landing-mobile-nav-actions">
          <Link href="/login" onClick={() => setMobileOpen(false)}>
            <Button variant="primary" className="btn-full-width">Get Started Free</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
