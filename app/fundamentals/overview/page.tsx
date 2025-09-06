'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingCard } from '@/components/ui/loading'
import { ApiCallDisplay } from '@/components/ui/api-call-display'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { Search } from 'lucide-react'

export default function CompanyOverviewPage() {
  const [symbol, setSymbol] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [lastApiCall, setLastApiCall] = useState<string>('')

  const handleSymbolSearch = async (query: string) => {
    if (query.length < 1) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      const response = await fetch(`/api/symbol-search?q=${query}`)
      const data = await response.json()
      
      if (data.bestMatches) {
        setSearchResults(data.bestMatches)
        setShowSearchResults(true)
      }
    } catch (err) {
      console.error('Symbol search error:', err)
    }
  }

  const buildAlphaVantageUrl = () => {
    const params = new URLSearchParams()
    params.append('function', 'OVERVIEW')
    params.append('symbol', symbol)
    params.append('apikey', process.env.ALPHAVANTAGE_API_KEY || 'YOUR_API_KEY')
    
    return `https://www.alphavantage.co/query?${params.toString()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setData(null)
    
    // Set the API call URL for display
    const apiUrl = buildAlphaVantageUrl()
    setLastApiCall(apiUrl)

    try {
      const response = await fetch('/api/fundamentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          function: 'OVERVIEW'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      if (Object.keys(result).length === 0) {
        throw new Error('No data found for this symbol')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company overview')
    } finally {
      setLoading(false)
    }
  }

  const formatMetric = (value: string, type: string = 'number') => {
    if (!value || value === 'None' || value === '-') return 'N/A'
    
    switch (type) {
      case 'currency':
        return formatCurrency(parseFloat(value))
      case 'number':
        return formatNumber(parseFloat(value))
      case 'percent':
        return `${(parseFloat(value) * 100).toFixed(2)}%`
      default:
        return value
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Company Overview</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Get detailed company information and key financial metrics
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Company</CardTitle>
            <CardDescription>Enter a stock symbol to fetch company overview</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="relative max-w-xs">
                <Input
                  type="text"
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value.toUpperCase())
                    handleSymbolSearch(e.target.value)
                  }}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  required
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => {
                          setSymbol(result['1. symbol'])
                          setShowSearchResults(false)
                        }}
                      >
                        <div className="font-medium">{result['1. symbol']}</div>
                        <div className="text-sm text-slate-500">{result['2. name']}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading || !symbol}>
                {loading ? 'Fetching...' : 'Get Overview'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="error" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && <LoadingCard />}

        {lastApiCall && (
          <div className="mb-6">
            <ApiCallDisplay 
              url={lastApiCall}
              title="Alpha Vantage Company Overview API Call"
            />
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{data.Name}</CardTitle>
                <CardDescription>{data.Symbol} • {data.Exchange}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Company Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Sector</dt>
                      <dd className="font-medium">{data.Sector || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Industry</dt>
                      <dd className="font-medium">{data.Industry || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Country</dt>
                      <dd className="font-medium">{data.Country || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Employees</dt>
                      <dd className="font-medium">{formatMetric(data.FullTimeEmployees)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Fiscal Year End</dt>
                      <dd className="font-medium">{data.FiscalYearEnd || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-6">
                    {data.Description || 'No description available'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Financial indicators and ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Market Cap</dt>
                    <dd className="font-medium">{formatMetric(data.MarketCapitalization, 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">P/E Ratio</dt>
                    <dd className="font-medium">{data.PERatio || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">PEG Ratio</dt>
                    <dd className="font-medium">{data.PEGRatio || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Book Value</dt>
                    <dd className="font-medium">{formatMetric(data.BookValue, 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Dividend Yield</dt>
                    <dd className="font-medium">{formatMetric(data.DividendYield, 'percent')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">EPS</dt>
                    <dd className="font-medium">{formatMetric(data.EPS, 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Revenue TTM</dt>
                    <dd className="font-medium">{formatMetric(data.RevenueTTM, 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Profit Margin</dt>
                    <dd className="font-medium">{formatMetric(data.ProfitMargin, 'percent')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Operating Margin</dt>
                    <dd className="font-medium">{formatMetric(data.OperatingMarginTTM, 'percent')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">ROE</dt>
                    <dd className="font-medium">{formatMetric(data.ReturnOnEquityTTM, 'percent')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">ROA</dt>
                    <dd className="font-medium">{formatMetric(data.ReturnOnAssetsTTM, 'percent')}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Information</CardTitle>
                <CardDescription>Stock price and trading metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">52 Week High</dt>
                    <dd className="font-medium">{formatMetric(data['52WeekHigh'], 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">52 Week Low</dt>
                    <dd className="font-medium">{formatMetric(data['52WeekLow'], 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">50 Day Moving Avg</dt>
                    <dd className="font-medium">{formatMetric(data['50DayMovingAverage'], 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">200 Day Moving Avg</dt>
                    <dd className="font-medium">{formatMetric(data['200DayMovingAverage'], 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Shares Outstanding</dt>
                    <dd className="font-medium">{formatMetric(data.SharesOutstanding)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Beta</dt>
                    <dd className="font-medium">{data.Beta || 'N/A'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyst Ratings</CardTitle>
                <CardDescription>Target price and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Target Price</dt>
                    <dd className="font-medium">{formatMetric(data.AnalystTargetPrice, 'currency')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Forward P/E</dt>
                    <dd className="font-medium">{data.ForwardPE || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Price to Book</dt>
                    <dd className="font-medium">{data.PriceToBookRatio || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Price to Sales TTM</dt>
                    <dd className="font-medium">{data.PriceToSalesRatioTTM || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">EV to Revenue</dt>
                    <dd className="font-medium">{data.EVToRevenue || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">EV to EBITDA</dt>
                    <dd className="font-medium">{data.EVToEBITDA || 'N/A'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}