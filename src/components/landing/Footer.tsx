/**
 * Landing page Footer component.
 *
 * @component Footer
 */
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div>
          <span className="landing-footer-brand">AdVize</span>
          <p className="landing-footer-text">
            &copy; {currentYear} AdVize. All rights reserved.
          </p>
        </div>

        <div className="landing-footer-links">
          <Link href="/login" className="landing-footer-link" id="footer-login">
            Log In
          </Link>
          <a href="#features" className="landing-footer-link" id="footer-features">
            Features
          </a>
          <a href="#how-it-works" className="landing-footer-link" id="footer-how">
            How It Works
          </a>
        </div>
      </div>
    </footer>
  );
}
