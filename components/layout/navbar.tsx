'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/timeseries', label: 'Time Series' },
    { href: '/news-sentiment', label: 'News & Sentiment' },
    { href: '/fundamentals/overview', label: 'Overview' },
    { href: '/fundamentals/earnings', label: 'Earnings' },
    { href: '/fundamentals/income-statement', label: 'Income Statement' },
    { href: '/fundamentals/balance-sheet', label: 'Balance Sheet' },
    { href: '/fundamentals/cash-flow', label: 'Cash Flow' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b backdrop-blur-md" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AVE</span>
              </div>
              <span className="font-bold text-xl">Alpha Vantage Explorer</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap",
                    pathname === item.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}