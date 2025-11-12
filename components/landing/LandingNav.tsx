'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm'
          : 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link
            href="/"
            className="relative text-2xl font-semibold text-slate-900 tracking-tight group"
          >
            FinSight
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-600 to-cyan-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-12">
            <li>
              <a
                href="#features"
                className="relative text-slate-600 hover:text-slate-900 font-medium text-[15px] transition-colors group"
              >
                Features
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300" />
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="relative text-slate-600 hover:text-slate-900 font-medium text-[15px] transition-colors group"
              >
                How It Works
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300" />
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="relative text-slate-600 hover:text-slate-900 font-medium text-[15px] transition-colors group"
              >
                Pricing
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          </ul>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="hidden md:inline-block text-slate-700 hover:text-slate-900 font-medium text-[15px] transition-colors"
            >
              Sign In
            </Link>
            <a
              href="#signup"
              className="relative overflow-hidden bg-slate-900 text-white px-7 py-3 rounded-lg font-medium text-[15px] transition-all duration-300 hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-600/30"
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50">
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-slate-600 hover:text-slate-900 font-medium py-2"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-slate-600 hover:text-slate-900 font-medium py-2"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-slate-600 hover:text-slate-900 font-medium py-2"
                >
                  Pricing
                </a>
              </li>
              <li className="pt-2 border-t border-slate-200">
                <Link
                  href="/auth/login"
                  className="block text-slate-600 hover:text-slate-900 font-medium py-2"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
