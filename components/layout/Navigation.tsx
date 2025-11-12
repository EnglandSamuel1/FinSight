'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Budget', href: '/budget' },
  { name: 'Settings', href: '/settings' },
] as const

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Only show navigation on authenticated pages (not on login/signup)
  if (!user || pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav
      className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand (optional - can be added later) */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
              FinSight
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      relative px-4 py-2 text-sm font-medium rounded-md
                      transition-colors duration-150 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                      ${
                        active
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
                      }
                    `}
                    aria-current={active ? 'page' : undefined}
                    aria-label={`Navigate to ${item.name}`}
                  >
                    {item.name}
                    {active && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-teal-400"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigationItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    block rounded-md px-3 py-2 text-base font-medium
                    transition-colors duration-150 ease-in-out
                    min-h-[44px] flex items-center
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                    ${
                      active
                        ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-teal-400'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                  aria-label={`Navigate to ${item.name}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
