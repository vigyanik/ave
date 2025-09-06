import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiKeyCheck } from '@/components/api-key-check'
import { TrendingUp, Newspaper, Building2 } from 'lucide-react'

export default function Home() {
  const hasApiKey = !!process.env.ALPHAVANTAGE_API_KEY

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Time Series Data',
      description: 'Access intraday, daily, weekly, and monthly stock price data with interactive charts',
      href: '/timeseries',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Newspaper className="h-6 w-6" />,
      title: 'News & Sentiment',
      description: 'Get real-time news and sentiment analysis for stocks and market topics',
      href: '/news-sentiment',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: 'Fundamental Data',
      description: 'Explore company financials, earnings, balance sheets, and insider transactions',
      href: '/fundamentals/overview',
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Alpha Vantage Explorer
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Access comprehensive financial market data, news sentiment, and company fundamentals 
            through the Alpha Vantage API
          </p>
        </div>

        <ApiKeyCheck hasApiKey={hasApiKey} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">1</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Get your API key</p>
                <p>Sign up for a free API key at{' '}
                  <a href="https://www.alphavantage.co/support/#api-key" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    Alpha Vantage
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">2</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Configure environment</p>
                <p>Add your API key to the <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env.local</code> file</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">3</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Start exploring</p>
                <p>Navigate to any section above to begin fetching and visualizing financial data</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
          <p className="mt-2">
            Data provided by{' '}
            <a href="https://www.alphavantage.co" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-blue-600 hover:underline">
              Alpha Vantage
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
